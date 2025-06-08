"use client";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import Image from "next/image";

// Import landing images directly
import landing1 from "@/assets/images/landing-1.webp";
import landing2 from "@/assets/images/landing-2.webp";
import landing3 from "@/assets/images/landing-3.webp";
import landing4 from "@/assets/images/landing-4.webp";

gsap.registerPlugin(useGSAP);

export default function LandingCarouselTwo() {
  // Predefine image dimensions for better CLS optimization
  const images = [
    { src: landing1, width: 1200, height: 800 },
    { src: landing2, width: 1200, height: 800 },
    { src: landing3, width: 1200, height: 800 },
    { src: landing4, width: 1200, height: 800 },
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
          quality={80}
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
          {[...images, ...images].map((img, index) => {
            // Only load the first 4 images eagerly, the rest lazily
            const isInitialImage = index < 4;
            return (
              <div
                key={index}
                className="w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px] relative shrink-0"
              >
                <Image
                  src={img.src}
                  alt={`Carousel image ${(index % 4) + 1}`}
                  fill
                  sizes="(max-width: 640px) 250px, (max-width: 768px) 350px, (max-width: 1024px) 400px, 450px"
                  quality={75}
                  loading={isInitialImage ? "eager" : "lazy"}
                  className="rounded-md object-cover"
                  placeholder="blur"
                  priority={isInitialImage}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
