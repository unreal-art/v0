import { IUser } from "@/app/libs/interfaces";
import Image from "next/image";

export default function EditProfileModal ({ user, close} : {user: any, close: () => void}) {
    return (
        <div className="flex flex-col gap-3">

            <form className="grid grid-cols-2 gap-5 text-primary-8 text-sm">

                <div className="col-span-2 py-3 border-b-[1px] border-primary-9">
                    <label className="mb-2 block text-primary-2">Profile photo</label>
                    <div>
                        <Image className="rounded-full" src={user?.avatar_url || "/profile.jpg"} width={80} height={80} alt="" /> 
                    </div>
                </div>

                <div>

                    <label className="mb-1 block">First Name</label>

                    <input 
                        className="block border-[1px] border-primary-10 h-14 w-full rounded-2xl bg-inherit outline-none placeholder:text-primary-7 indent-4" 
                        type="text" placeholder="Jon" />
                
                </div>

                <div>

                    <label className="mb-1 block">Last Name</label>

                    <input 
                        className="block border-[1px] border-primary-10 h-14 w-full rounded-2xl bg-inherit outline-none placeholder:text-primary-7 indent-4" 
                        type="text" placeholder="Doe" />

                </div>

                <div className="col-span-2">

                    <label className="text-primary-4 mb-1 block">Display name</label>

                    <input 
                        className="block border-[1px] border-primary-10 h-14 w-full rounded-2xl bg-inherit outline-none placeholder:text-primary-7 indent-4" 
                        type="text" placeholder="Jon Doe" />

                </div>

                <div className="col-span-2">

                    <label className="mb-1 block">Email Address</label>

                    <input 
                        className="block border-[1px] border-primary-10 h-14 w-full rounded-2xl bg-inherit outline-none placeholder:text-primary-7 indent-4" 
                        type="text" placeholder="Jondoe@gmail.com" />

                </div>

                <div className="col-span-2">

                    <label className="text-primary-4 mb-1 block">Bio</label>

                    <input 
                        className="block border-[1px] border-primary-10 h-14 w-full rounded-2xl bg-inherit outline-none placeholder:text-primary-7 indent-4" 
                        type="text" placeholder="Write about yourself" />

                </div>

                <div className="flex justify-end h-12 mb-4 mt-8 text-primary-6 gap-4 col-span-2">

                    <button
                        onClick={close}
                        className="border-primary-10 w-40 border-[1px] rounded-full">
                        Cancel
                    </button>

                    <button
                        className="bg-primary-10 w-40 rounded-full text-primary-3 disabled:bg-primary-11 disabled:text-primary-9"
                        disabled={true}>
                        Save changes
                    </button>

                </div>
                
            </form>

        </div>
    )
}


