import { Database } from "$/types/database.types";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

interface PerformanceData {
  week: string;
  signUps: number;
  credits: number;
  images: number;
  songs: number;
  videos: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "12w";
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  try {
    // Initialize configuration
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const privateServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !privateServiceRoleKey) {
      console.error("Missing server configuration");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Create Supabase client with proper typing
    const supabase = createClient<Database>(supabaseUrl, privateServiceRoleKey);

    // Calculate date range
    let startDate: Date;
    let endDate: Date;

    if (startDateParam && endDateParam) {
      startDate = new Date(startDateParam);
      endDate = new Date(endDateParam);
    } else {
      // Parse the range parameter
      let weeks = 12;
      if (range.endsWith("w")) {
        weeks = parseInt(range.slice(0, -1)) || 12;
      } else if (range.endsWith("m")) {
        weeks = (parseInt(range.slice(0, -1)) || 1) * 4;
      } else if (range === "all") {
        weeks = 52; // ~1 years
      }

      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - weeks * 7);
    }

    const startDateStr = startDate.toISOString();
    const endDateStr = endDate.toISOString();

    console.log(`Querying data from ${startDateStr} to ${endDateStr}`);

    // Fetch data with proper error handling and correct column names
    const [signUpsResult, creditsResult, mediaResult, imagesCount, songsCount, videosCount] =
      await Promise.allSettled([
        // Query profiles for sign-ups - using createdAt (camelCase as per schema)
        supabase
          .from("profiles")
          .select("createdAt", { count: 'exact' })
          .gte("createdAt", startDateStr)
          .lte("createdAt", endDateStr),

        // Query credit purchases - using created_at (snake_case as per schema)
        supabase
          .from("credit_purchases")
          .select("created_at, amount", { count: 'exact' })
          .gte("created_at", startDateStr)
          .lte("created_at", endDateStr),

        // Query all media for processing
        supabase
          .from("posts")
          .select("createdAt, media_type")
          .not("media_type", "is", null)
          .gte("createdAt", startDateStr)
          .lte("createdAt", endDateStr)
          .limit(1000), // Still fetch some sample data for weekly breakdown
          
        // Get accurate counts for each media type
        supabase
          .from("posts")
          .select('*', { count: 'exact', head: true })
          .eq('media_type', 'IMAGE')
          .gte("createdAt", startDateStr)
          .lte("createdAt", endDateStr),
          
        supabase
          .from("posts")
          .select('*', { count: 'exact', head: true })
          .eq('media_type', 'SONG')
          .gte("createdAt", startDateStr)
          .lte("createdAt", endDateStr),
          
        supabase
          .from("posts")
          .select('*', { count: 'exact', head: true })
          .eq('media_type', 'VIDEO')
          .gte("createdAt", startDateStr)
          .lte("createdAt", endDateStr)
      ]);

    // Extract data and log results
    const signUps =
      signUpsResult.status === "fulfilled" && !signUpsResult.value.error
        ? signUpsResult.value.data || []
        : [];

    const credits =
      creditsResult.status === "fulfilled" && !creditsResult.value.error
        ? creditsResult.value.data || []
        : [];

    const media =
      mediaResult.status === "fulfilled" && !mediaResult.value.error
        ? mediaResult.value.data || []
        : [];

    // Extract accurate counts for each media type
    const getCount = (result: any) => {
      return result.status === 'fulfilled' && !result.value.error
        ? result.value.count || 0
        : 0;
    };
    
    const totalImages = getCount(imagesCount);
    const totalSongs = getCount(songsCount);
    const totalVideos = getCount(videosCount);
    
    // Log the accurate counts for debugging
    console.log(`Total media counts - Images: ${totalImages}, Songs: ${totalSongs}, Videos: ${totalVideos}`);

    // Log results for debugging
    console.log(
      `Found ${signUps.length} sign-ups, ${credits.length} credit purchases, ${media.length} media items`
    );

    // Log any errors
    if (signUpsResult.status === "fulfilled" && signUpsResult.value.error) {
      console.error("Sign-ups query error:", signUpsResult.value.error);
    }
    if (creditsResult.status === "fulfilled" && creditsResult.value.error) {
      console.error("Credits query error:", creditsResult.value.error);
    }
    if (mediaResult.status === "fulfilled" && mediaResult.value.error) {
      console.error("Media query error:", mediaResult.value.error);
    }

    // Process data
    const weeksData: Record<string, PerformanceData> = {};

    // Initialize all weeks in the range
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const weekKey = getWeekKey(currentDate);
      if (!weeksData[weekKey]) {
        weeksData[weekKey] = {
          week: formatWeekLabel(currentDate),
          signUps: 0,
          credits: 0,
          images: 0,
          songs: 0,
          videos: 0,
        };
      }
      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Process sign-ups (using createdAt)
    signUps.forEach((signUp) => {
      const date = new Date(signUp.createdAt);
      const weekKey = getWeekKey(date);
      if (weeksData[weekKey]) {
        weeksData[weekKey].signUps += 1;
      }
    });

    // Process credit purchases (using created_at)
    credits.forEach((purchase) => {
      const date = new Date(purchase.created_at);
      const weekKey = getWeekKey(date);
      if (weeksData[weekKey]) {
        weeksData[weekKey].credits += Number(purchase.amount) || 0;
      }
    });

    // Process media generation (using createdAt) - only for weekly distribution
    // We'll scale the sample data to match the accurate total counts
    const mediaTypeCounts: Record<string, number> = {
      image: 0,
      song: 0,
      video: 0,
      other: 0
    };

    // First pass: count the sample data
    media.forEach((item) => {
      const mediaType = item.media_type?.toUpperCase() || 'OTHER';
      mediaTypeCounts[mediaType] = (mediaTypeCounts[mediaType] || 0) + 1;
    });

    // Calculate scaling factors for each media type (case-insensitive)
    const scalingFactors = {
      IMAGE: mediaTypeCounts.IMAGE > 0 ? totalImages / mediaTypeCounts.IMAGE : 0,
      SONG: mediaTypeCounts.SONG > 0 ? totalSongs / mediaTypeCounts.SONG : 0,
      VIDEO: mediaTypeCounts.VIDEO > 0 ? totalVideos / mediaTypeCounts.VIDEO : 0,
      OTHER: 0
    };

    // Second pass: apply scaling to the sample data
    media.forEach((item) => {
      const date = new Date(item.createdAt);
      const weekKey = getWeekKey(date);
      if (weeksData[weekKey]) {
        const mediaType = item.media_type?.toUpperCase() || 'OTHER';
        switch (mediaType) {
          case "IMAGE":
            weeksData[weekKey].images += scalingFactors.IMAGE || 0;
            break;
          case "SONG":
            weeksData[weekKey].songs += scalingFactors.SONG || 0;
            break;
          case "VIDEO":
            weeksData[weekKey].videos += scalingFactors.VIDEO || 0;
            break;
          default:
            // Handle any other media types as images for now
            if (mediaType) {
              weeksData[weekKey].images += scalingFactors.IMAGE || 0;
            }
        }
      }
    });
    
    // Round the values to whole numbers for display
    Object.values(weeksData).forEach(week => {
      week.images = Math.round(week.images);
      week.songs = Math.round(week.songs);
      week.videos = Math.round(week.videos);
    });

    // Convert to array and sort by week
    const result = Object.values(weeksData).sort((a, b) => {
      const parseWeekDate = (weekLabel: string) => {
        const datePart = weekLabel.replace("Week of ", "");
        return new Date(datePart).getTime();
      };
      return parseWeekDate(a.week) - parseWeekDate(b.week);
    });

    // Always return all weeks to show the full timeline
    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        startDate: startDateStr,
        endDate: endDateStr,
        range,
        totalWeeks: result.length,
        rawCounts: {
          signUps: signUps.length,
          credits: credits.length,
          media: media.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching performance data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch performance data" },
      { status: 500 }
    );
  }
}

// Helper function to get a consistent key for each week
function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // Get the Monday of the week (ISO week)
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));

  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(monday.getDate()).padStart(2, "0")}`;
}

// Helper function to format week label
function formatWeekLabel(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  // Get the Monday of the week (ISO week)
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));

  return `Week of ${monday.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}
