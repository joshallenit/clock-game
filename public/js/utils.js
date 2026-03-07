export function formatTime(h, m) {
  return h + ":" + String(m).padStart(2, "0");
}

export function formatElapsed(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  const tenths = Math.floor((ms % 1000) / 100);
  return mins + ":" + String(secs).padStart(2, "0") + "." + tenths;
}

export function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
