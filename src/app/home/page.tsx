import Image from "next/image";
import GenerateInput from "./components/generateInput";

export default function Home() {
  return (
    <div className="flex flex-col items-center background-color-primary-1 px-10 w-full">

      <div className="hidden md:flex flex-col justify-center items-center py-5 w-full">

        <h1 className="text-center text-4xl">Create Anything Imaginable</h1>

        <div className="w-4/5 max-w-4xl mt-7">
          <GenerateInput />
        </div>

      </div>

    </div>
  );
}
