"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Image from "next/image";

gsap.registerPlugin(useGSAP);

export default function LandingCarouselTwo() {
  const images = [
    "/images/landing-1.png",
    "/images/landing-2.png",
    "/images/landing-3.png",
    "/images/landing-4.png",
  ];

  const carouselRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(() => {
    if (carouselRef.current) {
      const width = carouselRef.current.scrollWidth / 2; // Half because we duplicate images

      animationRef.current = gsap.to(carouselRef.current, {
        x: `-${width}px`, // Move by half the total width
        duration: 30, // Adjust speed
        repeat: -1, // Infinite loop
        ease: "linear",
      });
    }

    return () => animationRef.current?.kill();
  }, []);

  // Pause/Resume on hover
  const handleMouseEnter = () => animationRef.current?.pause();
  const handleMouseLeave = () => animationRef.current?.resume();

  return (
    <div className="w-full h-full flex flex-col justify-end overflow-hidden">
      {/* Logo */}
      <div className="top-0 z-10 flex justify-center w-full scale-100">
        <Image
          src="/logo.png"
          alt="logo"
          width={200}
          height={12}
          priority
          quality={90}
          className="w-auto h-auto"
        />
      </div>

      {/* Image Carousel */}
      <div
        className="relative w-full overflow-hidden p-4
        [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={carouselRef}
          className="flex whitespace-nowrap gap-3 will-change-transform"
          style={{ display: "flex", width: "max-content" }} // Ensures smooth scrolling
        >
          {/* Duplicate images to make the scrolling seamless */}
          {[...images, ...images].map((src, index) => (
            <div
              key={index}
              className="w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px] relative shrink-0"
            >
              <Image
                src={src}
                alt={`Carousel image ${index + 1}`}
                fill
                sizes="(max-width: 640px) 250px, (max-width: 768px) 350px, (max-width: 1024px) 400px, 450px"
                quality={85}
                loading={index < 4 ? "eager" : "lazy"}
                className="rounded-md object-cover"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSAyVC08MTY3LjIyOUVFRTlBNj9BNj9BNj9BNj9BNj9BNj9BNj9BNj9BNj//2wBDARUXFx4aHjshITtBNkE2QTZBNkE2QTZBNkE2QTZBNkE2QTZBNkE2QTZBNkE2QTZBNkE2QTZBNkE2QTZBNkE2QTZBNkE//wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
