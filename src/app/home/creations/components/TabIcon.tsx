import {
  CrossedEyeIcon,
  DraftIcon,
  GlobeIcon,
  HeartIcon,
  MintIcon,
  PhotoGridIcon,
  PinIcon,
  UserIcon,
} from "@/app/components/icons";
import { TabText } from "@/stores/creationAndProfileStore";

interface TabIconProps {
  text: TabText;
  color: `#${string}`;
  height: string;
  width: string;
}

export default function TabIcon({ text, color, height, width }: TabIconProps) {
  switch (text) {
    case "Public":
      return <GlobeIcon height={height} width={width} color={color} />;
    case "Private":
      return <CrossedEyeIcon height={height} width={width} color={color} />;
    case "Liked":
      return <HeartIcon height={height} width={width} color={color} />;
    case "Pinned":
      return <PinIcon height={height} width={width} color={color} />;
    case "Minted":
      return <MintIcon height={height} width={width} color={color} />;
    case "Draft":
      return <DraftIcon height={height} width={width} color={color} />;
    case "User":
      return <UserIcon height={height} width={width} color={color} />;
    case "Image":
      return <PhotoGridIcon height={height} width={width} color={color} />;
    default:
    // throw Error("Invalid Table")
  }
}
