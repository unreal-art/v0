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
  trackPerformance = true,
  imageName,
  priority,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Create a descriptive name for the image
  const imageIdentifier =
    imageName ||
    (typeof src === "string"
      ? src.split("/").pop()?.split("?")[0] || "unknown-image"
      : "dynamic-image");

  // Use effect for tracking the complete load time from mount to render
  useEffect(() => {
    if (!trackPerformance) return;

    // Start tracking image load on mount
    const finishMountToLoadSpan = startSpan(
      `image-mount-to-load-${imageIdentifier}`,
      "image-lifecycle",
      { src, width, height, priority }
    );

    // Clean up when component unmounts or image loads
    return () => {
      if (!loaded) {
        finishMountToLoadSpan();
      }
    };
  }, [trackPerformance, imageIdentifier, src, width, height, priority, loaded]);

  const handleLoadingComplete = useCallback(() => {
    if (trackPerformance) {
      // Record successful load time
      const finishLoadSpan = startSpan(
        `image-loaded-${imageIdentifier}`,
        "image-loaded",
        { src, width, height, priority, success: true }
      );
      finishLoadSpan();
    }
    setLoaded(true);
  }, [trackPerformance, imageIdentifier, src, width, height, priority]);

  const handleError = useCallback(() => {
    if (trackPerformance) {
      // Record error
      const finishErrorSpan = startSpan(
        `image-error-${imageIdentifier}`,
        "image-error",
        { src, width, height, priority, success: false }
      );
      finishErrorSpan();
    }
    setError(true);
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
      {...props}
      onLoad={handleLoadingComplete}
      onError={handleError}
    />
  );
}

export default memo(OptimizedImage);
