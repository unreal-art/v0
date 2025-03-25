import Image, { ImageProps } from "next/image";
import { useState, useEffect, useCallback, memo } from "react";
import { startSpan } from "@/utils/sentryUtils";

interface OptimizedImageProps extends Omit<ImageProps, "onLoadingComplete"> {
  trackPerformance?: boolean;
  imageName?: string;
}

/**
 * A wrapper around Next.js Image component that provides performance tracking
 * and improved error handling.
 */
function OptimizedImage({
  src,
  alt,
  width,
  height,
  trackPerformance = process.env.NODE_ENV === "development", // Only track in development by default
  imageName,
  priority,
  sizes = "100vw", // Default size hint for better resource allocation
  loading = "lazy", // Default loading strategy
  quality = 80, // Default quality setting for optimal balance
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [loadStartTime] = useState<number>(performance.now()); // Track load start time

  // Create a descriptive name for the image
  const imageIdentifier =
    imageName ||
    (typeof src === "string"
      ? src.split("/").pop()?.split("?")[0] || "unknown-image"
      : "dynamic-image");

  // Use effect for tracking the complete load time from mount to render
  useEffect(() => {
    if (!trackPerformance) return;

    try {
      // Start tracking image load on mount
      const finishMountToLoadSpan = startSpan(
        `image-mount-to-load-${imageIdentifier}`,
        "image-lifecycle",
        { src, width, height, priority },
      );

      // Clean up when component unmounts or image loads
      return () => {
        if (!loaded) {
          finishMountToLoadSpan();
        }
      };
    } catch (e) {
      // Silently fail to not affect rendering
      console.warn("Performance tracking failed:", e);
    }
  }, [trackPerformance, imageIdentifier, src, width, height, priority, loaded]);

  const handleLoadingComplete = useCallback(() => {
    try {
      if (trackPerformance) {
        // Calculate load time
        const loadTime = Math.round(performance.now() - loadStartTime);

        // Record successful load time
        const finishLoadSpan = startSpan(
          `image-loaded-${imageIdentifier}`,
          "image-loaded",
          { src, width, height, priority, success: true, loadTime },
        );
        finishLoadSpan();

        // Log slow image loads in dev
        if (process.env.NODE_ENV === "development" && loadTime > 1000) {
          console.warn(
            `Slow image load: ${imageIdentifier} took ${loadTime}ms`,
          );
        }
      }
    } catch (e) {
      // Silently fail performance tracking
      console.warn("Performance tracking failed:", e);
    } finally {
      // Always mark as loaded, even if performance tracking fails
      setLoaded(true);
    }
  }, [
    trackPerformance,
    imageIdentifier,
    src,
    width,
    height,
    priority,
    loadStartTime,
  ]);

  const handleError = useCallback(() => {
    try {
      if (trackPerformance) {
        // Record error
        const finishErrorSpan = startSpan(
          `image-error-${imageIdentifier}`,
          "image-error",
          { src, width, height, priority, success: false },
        );
        finishErrorSpan();
      }
    } catch (e) {
      // Silently fail performance tracking
      console.warn("Performance tracking failed:", e);
    } finally {
      // Always mark as error, even if performance tracking fails
      setError(true);
    }
  }, [trackPerformance, imageIdentifier, src, width, height, priority]);

  // Show a fallback for failed images
  if (error) {
    return (
      <div
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
          background: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: "14px",
          ...props.style,
        }}
        className={props.className}
      >
        {alt || "Image failed to load"}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      loading={loading}
      quality={quality}
      {...props}
      onLoad={handleLoadingComplete}
      onError={handleError}
    />
  );
}

// Use memo to prevent unnecessary re-renders of images
export default memo(OptimizedImage);
