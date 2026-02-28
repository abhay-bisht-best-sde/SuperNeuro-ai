import sharp from "sharp";
import { getSettings } from "../core/config.js";

function laplacianVariance(grayBuffer: Buffer, width: number, height: number): number {
  const kernel = [
    [0, 1, 0],
    [1, -4, 1],
    [0, 1, 0],
  ];
  const pad = 1;
  let sumSq = 0;
  let count = 0;

  for (let y = pad; y < height - pad; y++) {
    for (let x = pad; x < width - pad; x++) {
      let conv = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 3;
          const gray = grayBuffer[idx];
          conv += gray * kernel[ky + 1][kx + 1];
        }
      }
      sumSq += conv * conv;
      count++;
    }
  }
  return count > 0 ? sumSq / count : 0;
}

function uniqueColorsSample(
  data: Buffer,
  pixelCount: number,
  channels: number,
  sampleSize: number
): number {
  const seen = new Set<string>();
  const step = Math.max(1, Math.floor(pixelCount / sampleSize));

  for (let i = 0; i < pixelCount && seen.size < sampleSize * 2; i += step) {
    const idx = i * channels;
    const key =
      channels >= 3
        ? `${data[idx]},${data[idx + 1]},${data[idx + 2]}`
        : `${data[idx]}`;
    seen.add(key);
  }
  return seen.size;
}

export async function isMeaningfulImage(imageBuffer: Buffer): Promise<boolean> {
  const s = getSettings();

  const metadata = await sharp(imageBuffer).metadata();
  const w = metadata.width ?? 0;
  const h = metadata.height ?? 0;

  if (w < s.MIN_IMAGE_WIDTH || h < s.MIN_IMAGE_HEIGHT) {
    return false;
  }

  const { data, info } = await sharp(imageBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;
  const pixelCount = width * height;

  let sum = 0;
  let sumSq = 0;
  for (let i = 0; i < pixelCount * channels; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    sum += gray;
    sumSq += gray * gray;
  }
  const mean = sum / pixelCount;
  const variance = sumSq / pixelCount - mean * mean;
  const std = Math.sqrt(Math.max(0, variance));

  if (mean < 8) return false;
  if (mean > s.MAX_MEAN_BLANK && std < 10) return false;
  if (std < s.MIN_STD_UNIFORM) return false;

  const grayBuffer = Buffer.alloc(pixelCount * 3);
  for (let i = 0; i < pixelCount; i++) {
    const g =
      0.299 * data[i * channels] +
      0.587 * data[i * channels + 1] +
      0.114 * data[i * channels + 2];
    const v = Math.round(g);
    grayBuffer[i * 3] = v;
    grayBuffer[i * 3 + 1] = v;
    grayBuffer[i * 3 + 2] = v;
  }

  const lapVar = laplacianVariance(grayBuffer, width, height);
  if (lapVar > s.MAX_LAPLACIAN_VAR) return false;

  const uniqueCount = uniqueColorsSample(
    data,
    pixelCount,
    channels,
    Math.min(10000, pixelCount)
  );
  if (uniqueCount < s.MIN_UNIQUE_COLORS) return false;

  return true;
}
