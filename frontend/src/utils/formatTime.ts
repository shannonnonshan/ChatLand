export const formatTime = (ts: number | string) => {
  const date = new Date(Number(ts));
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};