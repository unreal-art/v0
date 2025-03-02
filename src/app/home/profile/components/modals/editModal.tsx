import { DeleteIcon, UserProfileIcon } from "@/app/components/icons";

interface EditModalProps {
    openProfile: () => void;
    deleteProfile: () => void;
}

export default function EditModal ({ openProfile, deleteProfile } : EditModalProps) {
    return (
        <div className="flex flex-col gap-3">

            <button onClick={openProfile} className="flex h-12 items-center gap-2">
                <UserProfileIcon color="#C1C1C1" />
                <p className="text-primary-6">Edit Profile</p>
            </button>

            <button onClick={deleteProfile} className="flex h-11 items-center gap-2">
                <DeleteIcon color="#FF5252" />
                <p className="text-[#FF5252]">Delete Account Permanently</p>
            </button>

        </div>
    )
}