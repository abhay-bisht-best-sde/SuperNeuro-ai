import sharp from "sharp";
import { isMeaningfulImage } from "./image-quality.js";

export interface ExtractedVisual {
  label: string;
  imageBuffer: Buffer;
}

async function extractRenderedRegions(
  pageBuffer: Buffer,
  pageIdx: number,
  minRegionHeight = 120
): Promise<ExtractedVisual[]> {
  const { data, info } = await sharp(pageBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels ?? 3;

  const rowHasContent: boolean[] = [];
  for (let y = 0; y < height; y++) {
    let hasContent = false;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (r < 230 || g < 230 || b < 230) {
        hasContent = true;
        break;
      }
    }
    rowHasContent.push(hasContent);
  }

  const regions: ExtractedVisual[] = [];
  let inBlock = false;
  let start = 0;

  for (let i = 0; i < rowHasContent.length; i++) {
    const active = rowHasContent[i];
    if (active && !inBlock) {
      inBlock = true;
      start = i;
    } else if (!active && inBlock) {
      inBlock = false;
      if (i - start > minRegionHeight) {
        const y1 = Math.max(0, start - 15);
        const y2 = Math.min(height, i + 15);
        const regionBuffer = await sharp(pageBuffer)
          .extract({ left: 0, top: y1, width, height: y2 - y1 })
          .png()
          .toBuffer();
        regions.push({
          label: `page${pageIdx}_region_${start}`,
          imageBuffer: regionBuffer,
        });
      }
    }
  }

  if (inBlock && rowHasContent.length - start > minRegionHeight) {
    const y1 = Math.max(0, start - 15);
    const regionBuffer = await sharp(pageBuffer)
      .extract({ left: 0, top: y1, width, height: height - y1 })
      .png()
      .toBuffer();
    regions.push({
      label: `page${pageIdx}_region_${start}`,
      imageBuffer: regionBuffer,
    });
  }

  return regions;
}

export async function extractVisualElements(
  pageBuffer: Buffer,
  pageIdx: number
): Promise<ExtractedVisual[]> {
  if (!pageBuffer || pageBuffer.length === 0) return [];

  const candidates = await extractRenderedRegions(pageBuffer, pageIdx);
  const result: ExtractedVisual[] = [];

  for (const { label, imageBuffer } of candidates) {
    const meaningful = await isMeaningfulImage(imageBuffer);
    if (meaningful) {
      result.push({ label, imageBuffer });
    }
  }

  return result;
}
