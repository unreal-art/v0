"use client";

import React, { Suspense, lazy } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Dynamically import the component that uses useSearchParams
// Fix the import path to be relative to the current file
const NotFoundContentWithParams = lazy(() => import('./components/NotFoundContent'));



// Simple component for the fallback that doesn't use any client hooks
function NotFoundFallback() {
  return (
    <div className="flex flex-col items-center bg-primary-13 text-white justify-center min-h-screen p-4 text-center">
      <h1 className="text-5xl font-bold mb-6">404</h1>
      <h2 className="text-2xl mb-8">Page Not Found</h2>
      <Link
        href="/home"
        className="px-6 py-3 bg-primary-6 text-primary-11 rounded-md hover:bg-primary-8 transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<NotFoundFallback />}>
      <NotFoundContentWithParams />
    </Suspense>
  );
}
