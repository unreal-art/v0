import { CopyIcon, PlusIcon } from "@/app/components/icons";
import CopyToClipboard from "../../components/copyToclipboard";

interface PromptProps {
  title: string;
  fullText: string;
  children: string;
}

export default function Prompt({ title, fullText, children }: PromptProps) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <p className="text-lg text-primary-5"> {title} </p>
        <div className="flex gap-x-4">
          <button>
            <PlusIcon color="#5D5D5D" />
          </button>
          <CopyToClipboard text={fullText} />
        </div>
      </div>
      <p className="line-clamp-3">{children}</p>
      <hr className="border-[1px] border-primary-10 my-4" />
    </div>
  );
}
