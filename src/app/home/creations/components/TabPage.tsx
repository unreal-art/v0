import { Photo } from "react-photo-album"
import PhotoGridTwo from "./PhotoGridTwo"
import { TabText } from "./Tabs";
import TabIcon from "./TabIcon";

interface TabProps {
    title: TabText;
    content: string;
    subContent: string;
    data: Photo[]
}

export default function TabPage({title, content, subContent, data} : TabProps) {

    return (
        <div className="w-full h-full">
            { 
                data.length > 1 ? 
                    <PhotoGridTwo data={data} /> : 
                    <div className="flex justify-center items-center w-full h-[70vh]">

                        <div className="flex flex-col justify-center items-center"> 
                            
                            <TabIcon text={title} color="#5D5D5D" width="200px" height="200px" />

                            <p>{content}</p>

                            <p>{subContent}</p>

                        </div>

                    </div>
            }
        </div>
    )
}