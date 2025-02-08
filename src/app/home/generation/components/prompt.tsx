import { CopyIcon, PlusIcon } from "@/app/components/icons";

interface PromptProps {
    title: string;
    children: string;
}

export default function Prompt({ title, children }: PromptProps) {
    return (
        <div>
            <div className="flex justify-between mb-1">
                <p className="text-lg text-primary-5"> {title} </p>
                <div className="flex gap-x-4">
                    <button><PlusIcon color="#5D5D5D" /></button>
                    <button><CopyIcon color="#5D5D5D" /></button>
                </div>
            </div>
            <p className="line-clamp-3">{children}</p>
            <hr className="border-[1px] border-primary-10 my-4" />
        </div>
    )
}