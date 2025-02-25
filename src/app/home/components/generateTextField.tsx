import { useCreateJob } from "@/hooks/useCreateJob";
//import { useRouter } from "next/navigation";
import { supabase } from "$/supabase/client";
import { useState } from "react";

interface GenerateTextFieldProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function GenerateTextField({
  open,
  // setOpen,
}: GenerateTextFieldProps) {
  const { mutate } = useCreateJob();
  const [prompt, setPrompt] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt) return;
    mutate({ prompt, client: supabase });
  };
  if (!open) return;
  return (
    <>
      <div className="fixed z-30 top-0 left-0 h-screen w-full"></div>
      <div className="absolute flex justify-center z-30 top-0 left-0 h-screen w-full">
        <div className="absolute z-50 md:mt-20 w-full md:w-8/12 max-w-[924px] h-5/6 md:h-[432px] rounded-md border-primary-8 border-[1px] p-3 bg-primary-12">
          <div className="flex flex-col bg-primary-13 h-full w-full rounded-md">
            <div className="flex-grow">
              <textarea
                onChange={(e) => setPrompt(e.target.value)}
                className="bg-inherit w-full h-full resize-none outline-none p-4 text-primary-8"
              ></textarea>
            </div>

            <div className="h-14 p-2 w-full flex justify-end border-t-[1px] border-primary-11">
              <button
                onClick={generate}
                className="basis-1/6 text-primary-11 bg-primary-5 font-semibold rounded-full px-6"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
