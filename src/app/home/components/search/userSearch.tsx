import Image from "next/image"
//import PhotoOverlay from "../photoOverlay"
import { OptionMenuIcon } from "@/app/components/icons"
import { timeAgo } from "@/app/libs/timeAgo"
import { truncateText } from "$/utils"
import ProfileInfo from "../../profile/components/profileInfo"

const data = [1,2,3,4,5,6,7,8,9,10]

export default function UserSearch() {
    return (
        <div>
            {
                data.map((_, index) => (
                    <User key={index} />
                ))
            }
        </div>
    )
}


export function User () {
    return (
        <div className="bg-primary-11 rounded-t-3xl my-3">

            <div className="flex justify-between items-center h-16 py-4 px-4">

                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-9 rounded-full">
                        <Image src={"/icons/dummy-profile.png"} width={40} height={40} alt="profile" /> 
                    </div>

                    <p className="text-primary-1 text-lg w-36 font-normal">User Name</p>  

                    <button className="flex items-center justify-center gap-1 rounded-full h-8 w-24 px-2 py-1 border-[1px] border-primary-8">
                        <p className="text-primary-5 text-sm">Following</p>
                    </button>

                </div>

                <div className="flex gap-x-4 my-4">
                    <ProfileInfo
                        value={"0"}
                        title={"Followers"} // Adjusts title dynamically
                        />
                    <ProfileInfo
                        value={"0"}
                        title={"Following"} // Stays the same
                        leftBorder={true}
                        />
                    <ProfileInfo
                        value={"0"}
                        title={"Likes"} // Adjusts title dynamically
                        leftBorder={true}
                        />
                </div>

            </div>

            <div className="overflow-x-auto whitespace-nowrap">
                {data.map((_, index) => (
                    <UserImage key={index} />
                ))}
            </div>

        </div>
    )
}


export function UserImage() {
    return (
        // <PhotoOverlay
        //     //setImageIndex={() => handleImageIndex(context)}
        //     //context={context as ExtendedRenderPhotoContext}
        //     >
            <div className="relative inline-block w-[306px]">
                <div className="absolute top-0 flex justify-between text-primary-1 text-sm picture-gradient w-full h-12 items-center px-3">
                    <p>{timeAgo("context.photo.createdAt")}</p>
                    <button>
                        <OptionMenuIcon color="#FFFFFF" />
                    </button>
                </div>

                <Image src={"/dummy/alien-girl.png"} width={306} height={408} alt="generated" />

                <p className="absolute bottom-0 left-0 w-full text-left text-primary-1 text-sm picture-gradient h-14 p-3">
                    {truncateText("context.photo.prompt")}
                </p>
            </div>
        // </PhotoOverlay>
    )
}