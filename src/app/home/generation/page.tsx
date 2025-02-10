"use client"
import { useRouter } from "next/navigation";
import GenerateInput from "../components/generateInput";
import dynamic from 'next/dynamic'
import Image from "next/image";
import Prompt from "./components/prompt";
import Feature from "./components/feature";
import CaptionInput from "./components/captionInput";
import Interactions from "./components/interactions";
import PostingActions from "./components/postingActions";
import { BackIcon, OptionMenuIcon } from "@/app/components/icons";
 
const PhotoGallary = dynamic(
  () => import("../components/photoGallary"),
  { ssr: false }
)

export default function Generation() {

    const router = useRouter()

    return (
        <div className="relative flex flex-col items-center background-color-primary-1 px-1 md:px-10 w-full">

            <div className="hidden md:flex flex-col justify-center items-center pt-5 w-full">
                <GenerateInput />
            </div>

            <div className="flex gap-x-2 items-center w-full h-10 mt-8 md:mt-0 mb-2">
                <button className="flex gap-x-1 items-center text-sm" onClick={() => router.back()}>
                    <BackIcon width={16} height={16} color="#5D5D5D" />
                    <p>Back</p>
                </button>
            </div>

            <div className="overflow-y-auto">

                <div className="grid grid-cols-1 md:grid-cols-12 w-full md:h-[calc(100vh_-_220px)]">

                    <div className="flex flex-col justify-between items-center col-span-9">

                        <div className="flex justify-between h-24 p-6 gap-5 w-full">
                            <div className="flex gap-1">
                                <div>   
                                    <Image src={"/icons/dummy-profile.png"} alt="profile" width={48} height={48} /> 
                                </div>
                                <div>
                                    <p className="font-semibold text-lg leading-6 text-primary-2">David Johnson</p>
                                    <p className="text-primary-7 nasalization">Creator</p>
                                </div>
                            </div>
                            <button><OptionMenuIcon color="#C1C1C1" /></button>
                        </div>
                        
                        <div className="flex justify-center  w-full">
                            <Image src={"/dummy/white-boy.png"} width={306} height={408} alt="generated" />
                        </div>

                        <div className="flex flex-col w-full px-1 mt-8 md:mt-0 md:px-6 gap-y-4">
                            <CaptionInput />
                            <Interactions />
                            <PostingActions />
                        </div>

                    </div>

                    <div className="col-span-3 border-[1px] border-primary-11 bg-primary-12 rounded-r-[20px] p-6 overflow-y-auto">

                        <div className="h-48">

                            <p className="text-primary-5 text-lg">Output quantity</p>

                            <div className="px-3 py-2">
                                <Image src={"/dummy/white-boy.png"} width={98} height={128} alt="generated" />
                            </div>

                        </div>

                        <hr className="border-[1px] border-primary-10 my-2" />

                        <Prompt title="Prompt">
                            ChatGPT (Chat Generative Pre-trained Transformer) is a chatbot developed by OpenAI and launched on November 30, 2022. Based on a large language model, it enables users to refine and steer a conversation towards a desired length, format, style, level of detail, and language. Successive prompts and replies, known as prompt engineering, are considered at each conversation stage as a context.[2]
                        </Prompt>

                        <Prompt title="Magic Prompt">
                            ChatGPT (Chat Generative Pre-trained Transformer) is a chatbot developed by OpenAI and launched on November 30, 2022. Based on a large language model, it enables users to refine and steer a conversation towards a desired length, format, style, level of detail, and language. Successive prompts and replies, known as prompt engineering, are considered at each conversation stage as a context.[2]
                        </Prompt>

                        <div className="grid grid-cols-2 gap-6">

                            <Feature title="Model" content="Unreal 2.0" />

                            <Feature title="Style" content="Anime" />

                            <Feature title="Resolution" content="Anime" />

                            <Feature title="Rendering" content="Default" />

                            <Feature title="Seed" content="Unreal 2.0" />

                            <Feature title="Date" content="Unreal 2.0" />

                        </div>

                    </div>

                </div>

                <p className="h-14 py-2 border-y-[1px] border-primary-10 text-center leading-10 my-10"> Drafts by <strong className="text-primary-5"> David Johnson </strong> </p>

                <div>
                    <PhotoGallary />
                </div>

            </div>

        </div>
    );
}