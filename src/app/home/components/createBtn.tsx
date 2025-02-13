"use client"
import { useState } from "react";
import GenerateTextField from "./generateTextField";
import { HandBrushIcon } from "@/app/components/icons";

export default function CreateBtn () {

    const [open, setOpen] = useState(false)

    return (
        <>
            <button onClick={() => setOpen(true)} className="generate-gradient flex justify-center items-center w-12 h-12 rounded-full border-primary-7 border-[1px] bg-linear-to-r from-[#AFAFAF] to-[#494949]">
                <HandBrushIcon color="#FFFFFF" />
            </button>
            <GenerateTextField open={open} setOpen={setOpen} />
        </>
    )
}