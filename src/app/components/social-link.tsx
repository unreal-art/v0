import Link from "next/link";
import Image from "next/image";

interface SocialLinkProps {
  icon: string;
  url: string;
}

function SocialLink({ icon, url }: SocialLinkProps) {
  return (
    <div>
      <Link href={url} target="_blanck">
        <Image src={icon} alt="icon" width={24} height={24} />
      </Link>
    </div>
  );
}

export default SocialLink;
