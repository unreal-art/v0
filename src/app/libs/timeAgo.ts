import { formatDistanceToNow } from "date-fns";
import { toZonedTime } from "date-fns-tz";

export const timeAgo = (timestamp: string | null | undefined): string => {
  // console.log("Received timestamp:", timestamp);
  if (!timestamp) return "Unknown time";

  // Fix: Trim microseconds to milliseconds (keep only 3 decimal places)
  const cleanedTimestamp = timestamp.replace(/(\.\d{3})\d+/, "$1");

  let utcDate;
  try {
    utcDate = new Date(cleanedTimestamp);
    if (isNaN(utcDate.getTime())) throw new Error("Invalid Date");
    // console.log("Parsed UTC Date:", utcDate.toISOString());
  } catch (error) {
    // console.error("Error parsing date:", error, "Timestamp:", timestamp);
    return "Invalid time";
  }

  // Get user's local timezone
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log("User Time Zone:", userTimeZone);

  // Convert UTC timestamp to the user's local timezone
  const localDate = toZonedTime(utcDate, userTimeZone);
  // console.log("Converted Local Date:", localDate.toISOString());
  // console.log(
  //   "Formatted Local Date:",
  //   format(localDate, "yyyy-MM-dd HH:mm:ss XXX"),
  // );

  // Format the time difference from now
  const timeDiff = formatDistanceToNow(localDate, { addSuffix: true });

  // Custom adjustments for better UX
  if (timeDiff.includes("less than a minute")) return "just now";

  return timeDiff
    .replace(/\babout\b\s*/g, "")
    .replace(/\b1 minute\b/, "1 min")
    .replace(/\bminutes\b/, "mins")
    .replace(/\b1 hour\b/, "1 hr")
    .replace(/\bhours\b/, "hrs")
    .replace(/\b1 day\b/, "1 day")
    .replace(/\bdays\b/, "days")
    .replace(/\b1 month\b/, "1 mnth")
    .replace(/\bmonths\b/, "mnths")
    .replace(/\b1 year\b/, "1 yr")
    .replace(/\byears\b/, "yrs");
};
