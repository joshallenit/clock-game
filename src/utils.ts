export function formatTime(h: number, m: number): string {
  return h + ":" + String(m).padStart(2, "0");
}

export function formatElapsed(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return mins + ":" + String(secs).padStart(2, "0") + "." + tenths;
}

export function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
