"use client";
import { useState } from "react";
import GenerateTextField from "./generateTextField";
import { HandBrushIcon } from "@/app/components/icons";

export default function GenerateInput() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <h1 className="text-center text-4xl text-primary-1 nasalization">
        Create Anything Imaginable
      </h1>

      <div className="w-4/5 max-w-4xl mt-7">
        <div className="relative h-12 flex w-full rounded-l-full mb-10">
          <div className="absolute left-4 top-2.5">
                <HandBrushIcon color="#FFFFFF" />
          </div>
          <input
            onClick={() => setOpen(true)}
            className="basis-5/6 outline-none indent-12 rounded-l-full bg-primary-12 border-[1px] border-primary-9"
            placeholder="Generate stunning AI images in seconds"
          />
          <button className="basis-1/6 text-primary-11 bg-primary-5 font-semibold rounded-r-full px-6">
            Generate
          </button>
        </div>
      </div>
      <GenerateTextField open={open} setOpen={setOpen} />
    </>
  );
}
