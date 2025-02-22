import Image from "next/image";

interface CommentProps {
    comment: string;
    user: string;
    date: string;
}

export default function Comment({ comment, user, date }: CommentProps) {
    return (
        <div className="flex gap-2 py-2">   
            <div className="h-12 w-12">
                <Image src={"/icons/dummy-profile.png"} width={48} height={48} alt="profile" />
            </div>
            <div className="flex gap-2">
                <div className="flex flex-col">
                    <p className="text-primary-4 text-md font-medium">{user}</p>
                    <p className="text-xs">{date}</p>
                </div>
                <p className="text-primary-6 text-sm">{comment}</p>
            </div>
        </div>
    )
}