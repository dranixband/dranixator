export function isYoutubeUrl(src: string): boolean {
  return /youtube\.com|youtu\.be/.test(src);
}

export function getYoutubeThumbnail(src: string): string | null {
  const match = src.match(/(?:embed\/|v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
}
