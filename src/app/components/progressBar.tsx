"use client";

import { useEffect, memo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

// Configure NProgress for smoother experience
NProgress.configure({
  showSpinner: false,
  speed: 400,
  minimum: 0.1,
  trickleSpeed: 150,
  easing: "ease",
  parent: "body",
});

const ProgressBar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let startFrame: number;
    let finishFrame: number;

    NProgress.start();

    startFrame = window.requestAnimationFrame(() => {
      NProgress.set(0.3);

      finishFrame = window.requestAnimationFrame(() => {
        setTimeout(() => {
          NProgress.done();
        }, 100);
      });
    });

    return () => {
      window.cancelAnimationFrame(startFrame);
      window.cancelAnimationFrame(finishFrame);
    };
  }, [pathname, searchParams]); // Only depend on route changes

  return (
    <>
      <style jsx global>{`
        #nprogress {
          pointer-events: none;
        }

        #nprogress .bar {
          background: #fff;
          position: fixed;
          z-index: 9999;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
        }

        #nprogress .peg {
          display: block;
          position: absolute;
          right: 0px;
          width: 100px;
          height: 100%;
          box-shadow: 0 0 10px #fff, 0 0 5px #fff;
          opacity: 1;
          transform: rotate(3deg) translate(0px, -4px);
        }
      `}</style>
    </>
  );
};

// Memoize to prevent unnecessary re-renders
export default memo(ProgressBar);
