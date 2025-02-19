import Image from "next/image";


export default function Notification () {
    return (
        <div className="border-primary-8 border-[1px] bg-primary-12 h-28 my-4 rounded-[20px] p-3">

            <div className="flex gap-2">

                <div>
            
                    <p className="text-[10px] text-primary-7">12 Minutes ago</p>

                    <div className="flex gap-2 mt-1">

                        <div className="basis-10 flex-grow">
                            <Image src={"/icons/dummy-profile.png"} width={36} height={36} alt="profile" />
                        </div>

                        <div>
                            <p className="text-primary-4 text-md font-medium">Kaylynn Westervelt</p>
                            <p className="text-primary-6 text-sm">just shared your AI-generated image! Your art is reaching more people.</p>
                        </div>

                    </div>

                </div>

                <div className="basis-20 flex-grow">
                    <Image src={"/dummy/alien-girl.png"} width={70} height={70} alt="picture" />
                </div>

            </div>

        </div>
    )
}