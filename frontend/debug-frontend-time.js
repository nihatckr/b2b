// Frontend debug script - copy to browser console
console.log("🔍 Frontend timezone debug:");

// Current time
const now = new Date();
console.log("Frontend current time:", {
  utc: now.toISOString(),
  turkish: now.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }),
  browser: now.toLocaleString(),
  timestamp: now.getTime(),
});

// Test with known timestamp from backend
const testTimestamp = "2025-10-23T09:42:47.146Z"; // owner@fashionretail.com creation time
const testDate = new Date(testTimestamp);
const diffMs = now.getTime() - testDate.getTime();
const diffSeconds = Math.floor(diffMs / 1000);
const diffMinutes = Math.floor(diffSeconds / 60);
const diffHours = Math.floor(diffMinutes / 60);

console.log("Test timestamp debug:", {
  original: testTimestamp,
  parsed: testDate.toISOString(),
  turkish: testDate.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }),
  browser: testDate.toLocaleString(),
  timestamp: testDate.getTime(),
  diffMs,
  diffSeconds,
  diffMinutes,
  diffHours,
});

// Test toRelativeTime function
function toRelativeTime(date) {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  console.log("toRelativeTime debug:", {
    input: date,
    parsed: d.toISOString(),
    now: now.toISOString(),
    diffMs: now.getTime() - d.getTime(),
    diffInSeconds,
  });

  if (diffInSeconds < 60) return "Az önce";
  if (diffInSeconds < 3600)
    return `${Math.floor(diffInSeconds / 60)} dakika önce`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)} saat önce`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)} gün önce`;

  return d.toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" });
}

console.log("toRelativeTime result:", toRelativeTime(testTimestamp));
