"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation"; // Remove useSearchParams
import NProgress from "nprogress";

NProgress.configure({ showSpinner: false, speed: 500 });

const ProgressBar = () => {
  const pathname = usePathname();
  // Removed useSearchParams()

  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => NProgress.done(), 500);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname]); // Only depend on pathname

  return null;
};

export default ProgressBar;
