import { getInitials, log } from "@/utils";
import Image, { ImageProps } from "next/image";
import { useState, useCallback, memo } from "react";

interface OptimizedImageProps extends Omit<ImageProps, "onLoadingComplete"> {
  trackPerformance?: boolean;
  imageName?: string;
  isProfile?: boolean;
  isAvatar?: boolean;
  username?: string;
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
      if (!isProfile) return (
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
             className={`hidden md:flex rounded-full text-4xl justify-center items-center bg-gray-700 text-gray-200 font-semibold`}
             style={{ width: `${width}px`, height: `${width}px` }}
           >
             {username && getInitials(username)}
           </div>

           <div
             className={`rounded-full text-xl flex md:hidden justify-center items-center bg-gray-700 text-gray-200 font-semibold`}
             style={{ width: `${100}px`, height: `${100}px` }}
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
      {!loaded && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            // backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 10,
          }}
        >
          {!isProfile && (
            <div className="flex items-center justify-center h-full w-full bg-transparent ">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 w-full h-full bg-[#5d5d5d] rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-full h-full bg-[#8f8f8f] rounded-full animate-ping"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default memo(OptimizedImage);
