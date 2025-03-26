import { log } from "@/utils";
import Image, { ImageProps } from "next/image";
import { useState, useCallback, memo } from "react";

interface OptimizedImageProps extends Omit<ImageProps, "onLoadingComplete"> {
  trackPerformance?: boolean;
  imageName?: string;
}

function OptimizedImage({
  src,
  alt,
  width,
  height,
  trackPerformance = false,
  imageName,
  priority,
  sizes = "100vw",
  loading = "lazy",
  quality = 80,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const imageIdentifier =
    imageName ||
    (typeof src === "string"
      ? src.split("/").pop()?.split("?")[0] || "unknown-image"
      : "dynamic-image");

  const handleLoadingComplete = () => {
    setLoaded(true);

    // Optional performance logging - simplified
    if (trackPerformance) {
      log(`Image ${imageIdentifier} loaded successfully`);
    }
  };

  const handleError = useCallback(() => {
    setError(true);

    if (trackPerformance) {
      log(`Image ${imageIdentifier} failed to load`);
    }
  }, [trackPerformance, imageIdentifier]);

  if (error) {
    return (
      <Image
        src={"/fallback.png"}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        sizes={sizes}
        {...props}
      />
    );
  }

  return (
    <>
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
        //placeholder="blur"
        // blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFeAJcIiLKlAAAAABJRU5ErkJggg=="
        onLoadingComplete={handleLoadingComplete}
        onError={handleError}
      />
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 10,
          }}
        >
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
        </div>
      )}
    </>
  );
}

export default memo(OptimizedImage);
