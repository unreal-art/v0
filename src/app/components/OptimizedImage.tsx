import { getInitials, log } from "@/utils";
import Image, { ImageProps } from "next/image";
import { useState, useCallback, memo } from "react";
import style from "styled-jsx/style";

interface OptimizedImageProps extends Omit<ImageProps, "onLoadingComplete"> {
  trackPerformance?: boolean;
  imageName?: string;
  isProfile?: boolean;
  isAvatar?: boolean;
  username?: string;
  isProfilePage?: boolean;
}

function OptimizedImage({
  src,
  alt,
  width,
  height,
  trackPerformance = false,
  imageName,
  priority,
  isProfile,
  sizes = "100vw",
  loading = "lazy",
  quality = 80,
  isAvatar,
  username,
  isProfilePage,
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
    if (isAvatar) {
      if (!isProfile)
        return (
          <div
            className={`rounded-full text-xs flex justify-center items-center bg-gray-700 text-gray-200 font-semibold`}
            style={{ width: `${width}px`, height: `${width}px` }}
          >
            {username && getInitials(username)}
          </div>
        );
      return (
        <>
          <div
            className={`hidden md:flex ${
              isProfilePage ? "text-xl" : "text-xs"
            } rounded-full text-4xl justify-center items-center bg-gray-700 text-gray-200 font-semibold`}
            style={{ width: `${width}px`, height: `${width}px` }}
          >
            {username && getInitials(username)}
          </div>

          <div
            className={`rounded-full ${
              isProfilePage ? "text-xl" : "text-xs"
            } flex md:hidden justify-center items-center bg-gray-700 text-gray-200 font-semibold`}
            {...(isProfilePage
              ? { style: { width: `${100}px`, height: `${100}px` } }
              : { style: { width: `${25}px`, height: `${25}px` } })}
          >
            {username && getInitials(username)}
          </div>
        </>
      );
    }
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
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: loaded ? 0 : 1,
          transition: "opacity 0.2s ease-out",
          pointerEvents: "none", // Ensures it doesn't interfere with clicks
          zIndex: 10,
        }}
      >
        {!isProfile && (
          <div className="flex items-center justify-center h-full w-full">
            {/* Gradient background shimmer effect */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite",
              }}
            />

            {/* Very subtle loading indicator */}
            <div
              className="h-full w-full opacity-30"
              style={{
                background: "rgba(20,20,20,0.1)",
                backdropFilter: "blur(1px)",
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}

export default memo(OptimizedImage);
