import { TabText } from "./Tabs";
import TabIcon from "./TabIcon";


interface TabProps {
  title: TabText;
  content: string;
  subContent: string;
}

export default function NoItemFound({title, content, subContent} : TabProps) {

  return (
    <div className="w-full h-full">

      <div className="flex justify-center items-center w-full h-[60vh]">

        <div className="flex flex-col justify-center items-center"> 
          
          <TabIcon text={title} color="#5D5D5D" width="200px" height="200px" />

          <p>{content}</p>

          <p>{subContent}</p>

        </div>

      </div>

    </div>
  )
}