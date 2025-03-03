import Image from "next/image";
import ModalWrapper from "./modalWrapper";

interface ShareModalProps {
    link: string;
    open: boolean;
    setOpen: (open: boolean) => void;
}


export default function ShareModal ({ link, open, setOpen } : ShareModalProps) {

    const copyToClipboard = () => {
        navigator.clipboard.writeText(link).then(() => {
            console.log("Link copied to clipboard!");
        }).catch(err => {
            console.error("Failed to copy: ", err);
        });
    };

    const shareOnX = () => {
        const url = `https://x.com/share?url=${encodeURIComponent(link)}`;
        window.open(url, '_blank');
    };

    const shareOnDiscord = () => {
        const url = `https://discord.com/channels/@me?url=${encodeURIComponent(link)}`;
        window.open(url, '_blank');
    };

    const shareOnFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
        window.open(url, '_blank');
    };

    const shareOnLinkedIn = () => {
        const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(link)}`;
        window.open(url, '_blank');
    };

    return (
        <ModalWrapper title={"Share"} open={open} setOpen={setOpen}>

            <div>

                <input className="w-full bg-primary-13 rounded-full text-primary-6 py-2 px-4 outline-none" type="text" value={link} />


                <div className="flex justify-evenly items-center  bg-primary-10 h-[104px] rounded-[20] mt-6">

                    <div className="border-r-[1px]">
                        <ShareItem image="copy.png" text="Copy link" onClick={copyToClipboard} />
                    </div>

                    <ShareItem image="x.png" text="X" onClick={shareOnX} />
                    <ShareItem image="discord.png" text="Discord" onClick={shareOnDiscord} />
                    <ShareItem image="facebook.png" text="Facebook" onClick={shareOnFacebook} />
                    <ShareItem image="linkedin.png" text="LinkedIn" onClick={shareOnLinkedIn} />

                </div>

            </div>
            
        </ModalWrapper> 
    )
}


function ShareItem ({image, text, onClick} : {image: string, text: string, onClick: () => void}) {
    return (
        <button onClick={onClick} className="flex items-center justify-center flex-col px-2">

            <Image src={"/icons/" + image}  width={36} height={36} alt="" />

            <p className="text-primary-6 mt-1 text-sm">{text}</p>

        </button>
    )
}