import { DownloadIcon, HeartIcon, MessageIcon, PinIcon, ShareIcon } from "@/app/components/icons";

export default function Interactions () {
    return (
        <div className="flex justify-between">

            <div className="flex py-2 gap-x-14">

                <button className="flex items-center gap-[2px] justify-center">
                    <HeartIcon color="#F0F0F0" />
                    <p className="text-xs text-primary-3">0</p>
                </button>

                <button className="flex items-center gap-[2px] justify-center">
                    <MessageIcon color="#F0F0F0" />
                    <p className="text-xs text-primary-3">0</p>
                </button>

                <button className="flex items-center gap-[2px] justify-center">
                    <ShareIcon color="#F0F0F0" />
                    <p className="text-xs text-primary-3">0</p>
                </button>

            </div>

            <div className="flex py-2 gap-x-6">

                <button>
                    <PinIcon color="#F0F0F0" />
                </button>

                <button>
                    <DownloadIcon color="#F0F0F0" />
                </button>

            </div>

        </div>
    )
}