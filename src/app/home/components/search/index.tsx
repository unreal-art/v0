"use client";
import { useState } from "react";
import { CloseIcon, SearchIcon } from "@/app/components/icons";
import Tabs from "./searchTab";
import SearchPhotoGallary from "./searchPhotoGallary";
import UserSearch from "./userSearch";
import { useDebounce } from "use-debounce";

export default function Search() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

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
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed z-50  top-0 left-0 h-screen w-full bg-gray-950/50"
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
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              {currentIndex === 0 && (
                <UserSearch searchTerm={debouncedSearch} />
              )}

              {currentIndex === 1 && (
                <SearchPhotoGallary searchTerm={debouncedSearch} />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
