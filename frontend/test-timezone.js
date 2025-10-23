// Test timezone issues
console.log("🕐 Testing timezone handling...");

// Debug time function
function debugTime(date) {
  if (!date) return "";
  const d = new Date(date);
  return `
UTC: ${d.toISOString()}
Turkish: ${d.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}
Browser: ${d.toLocaleString()}
Timestamp: ${d.getTime()}
  `.trim();
}

// Test current time
console.log("Current time debug:");
console.log(debugTime(new Date()));

// Test database time (approximately when you created users)
const testDate = "2025-10-23T09:34:23.797Z"; // UTC time from database
console.log("\nDatabase time debug:");
console.log(debugTime(testDate));

// Test browser timezone
console.log("\nSystem timezone info:");
console.log(
  "Browser timezone:",
  Intl.DateTimeFormat().resolvedOptions().timeZone
);
console.log("Browser locale:", Intl.DateTimeFormat().resolvedOptions().locale);

// Test with different date formats
const testFormats = [
  new Date().toISOString(),
  new Date().toString(),
  Date.now(),
  "2025-10-23T09:34:23.797Z",
];

console.log("\nTesting different formats:");
testFormats.forEach((format, i) => {
  console.log(`Format ${i + 1} (${typeof format}):`, format);
  console.log("Result:", debugTime(format));
  console.log("---");
});
