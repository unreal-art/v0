"use client"
import { CloseIcon, CollaspeIcon, ExpandIcon } from "@/app/components/icons";
import { MD_BREAKPOINT } from "@/app/libs/constants";
import { useEffect, useState } from "react";

export default function GenerationProgress() {

    const [open, setOpen] = useState(true)
    const [expand, setExpand] = useState(false)
    const [size, setSize] = useState(window?.innerWidth < MD_BREAKPOINT ? 16 : 24)

    useEffect(() => {
        window.addEventListener("resize", () => {
        if (window.innerWidth < MD_BREAKPOINT) {
            setSize(16)
        } else {
            setSize(24)
        }
        })
        return () => window.removeEventListener("resize", () => console.log("removed"))
    }, [])
    

    if (!open) return

    return (
        <div className="fixed bottom-20 md:bottom-4 right-4 md:right-16 rounded-xl max-w-[496px] w-4/5 bg-primary-13">

            <div className="flex items-center justify-between h-12 md:h-[84px] px-5 text-sm md:text-2xl text-primary-6">

                <p>Generating image(s) <strong>4s</strong> left...</p>

                <div className="flex gap-x-2">
                    <button onClick={() => setExpand(!expand)}>
                        { expand ? <CollaspeIcon color="#C1C1C1" width={size} height={size} /> : <ExpandIcon color="#C1C1C1" width={size} height={size}  /> }
                    </button>
                    <button onClick={() => setOpen(false)}>
                        <CloseIcon color="#C1C1C1" width={size} height={size}  />
                    </button>
                </div>

            </div>

            {
                expand &&
                    <>
                        <hr className="border-primary-9 mx-3" />
                        <div className="p-3">
                            <div className="h-60 md:h-80 generate-gradient rounded-[4px]"></div>
                        </div>
                    </>
            }


        </div>
    )

}