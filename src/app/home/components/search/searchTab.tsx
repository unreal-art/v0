import { ITabs, TabBtn } from "../../creations/components/Tabs";



export default function Tabs({
    currentIndex,
    setCurrentIndex,
  }: ITabs) {
    return (
      <div className="flex gap-x-8 border-b-[1px] border-primary-11">
        <TabBtn
          currentIndex={currentIndex}
          index={0}
          text="User"
          setCurrentIndex={setCurrentIndex}
        />
  
        <TabBtn
          currentIndex={currentIndex}
          index={1}
          text="Image"
          setCurrentIndex={setCurrentIndex}
        />
        </div>
    )
}