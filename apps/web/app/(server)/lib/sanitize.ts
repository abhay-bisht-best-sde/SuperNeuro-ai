export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== "string") {
    return "unnamed";
  }
  const baseName = fileName.split(/[/\\]/).pop() ?? "unnamed";
  const sanitized = baseName.replace(/[\0\x00-\x1f\x7f]/g, "");
  const trimmed = sanitized.trim().slice(0, 255) || "unnamed";
  return trimmed;
}
