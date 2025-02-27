import { TickIcon } from "@/app/components/icons";

export default function CaptionInput () {

    return (
        <div className="relative border-dashed border-[1px] border-primary-5 rounded">
            <input 
                className="h-14 w-full outline-none bg-primary-13 indent-5" 
                placeholder="Add caption"
                />
            <button className="absolute top-4 right-4">
                <TickIcon width={20} height={20} color="#5D5D5D" />
            </button>
        </div>
    )
}