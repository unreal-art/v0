"use client";
import { useState, useEffect, useCallback } from "react";
import { CloseIcon, SearchIcon } from "@/app/components/icons";
import Tabs from "./searchTab";
import SearchPhotoGallary from "./searchPhotoGallary";
import UserSearch from "./userSearch";
import { useDebouncedCallback } from "use-debounce";
import { useRouter, useSearchParams } from "next/navigation";

export default function Search() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize search from URL on mount
  useEffect(() => {
    const s = searchParams?.get("s") || "";
    if (s.toLowerCase() === "search") {
      // Extract 'q' parameter which contains the actual search term
      const q = searchParams?.get("q") || "";
      setSearch(q);
    } else {
      setSearch("");
    }
  }, [searchParams]);

  // Implement debounced search to prevent excessive URL updates
  const debouncedSearch = useDebouncedCallback((value) => {
    if (value.trim().length > 0) {
      router.push(`/home?s=search&q=${encodeURIComponent(value.trim())}`);
    } else if (searchParams?.get("s") === "search") {
      // If search is cleared, revert to default tab
      router.push("/home?s=explore");
    }
  }, 400); // 400ms debounce

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  function getIconColor() {
    if (hover) {
      return "#8F8F8F";
    } else {
      return "#5D5D5D";
    }
  }

  return (
    <>
      <button
        className={`flex gap-x-1 h-9 w-10 items-center justify-center rounded-full ${
          hover ? "bg-primary-10" : ""
        }`}
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <SearchIcon width={16} height={16} color={getIconColor()} />
      </button>

      {open && (
        <div className="fixed z-50  top-0  h-full w-screen bg-gray-950/50">
          <div
            onClick={() => setOpen(false)}
            className="m-auto z-50  top-0 left-0 h-screen w-screen bg-gray-950/50"
          ></div>

          <div className="absolute w-full max-w-[1034px] h-[90vh] z-50 top-2 md:top-[5vh] left-0 md:left-60 border-primary-8 border-[1px] bg-primary-12 rounded-xl p-4">
            <div className="flex justify-between text-primary-3">
              <p className="nasalization text-2xl">
                Search for Anything Imaginable
              </p>
              <div className="cursor-pointer" onClick={() => setOpen(false)}>
                <CloseIcon width={24} height={24} color="#C1C1C1" />
              </div>
            </div>

            <div>
              <div className="relative h-14 w-full my-3 rounded-xl bg-primary-10">
                <button className="absolute top-[18px] left-3 z-10">
                  <SearchIcon width={20} height={20} color="#8F8F8F" />
                </button>

                <input
                  type="text"
                  placeholder="Search for anything imaginable"
                  value={search}
                  onChange={handleSearch}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="absolute text-primary-2 placeholder:text-primary-2 bg-inherit left-0 top-0 w-full h-14 px-10 rounded-lg border-[1px] border-primary-11 border-none focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            <div className="my-2">
              <Tabs
                currentIndex={currentIndex}
                setCurrentIndex={setCurrentIndex}
              />
            </div>

            <div className="overflow-y-auto h-[70vh]">
              {currentIndex === 0 && <UserSearch searchTerm={search} />}

              {currentIndex === 1 && <SearchPhotoGallary searchTerm={search} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
