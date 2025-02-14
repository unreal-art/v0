"use client"
import GenerateInput from "../components/generateInput";
import { useState } from "react";
import Tabs from "./components/Tabs";
import TabPage from "./components/TabPage";
import { dummyPhotos2 } from "../dummyPhotos";



export default function Creation() {

  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <div className="flex flex-col items-center background-color-primary-1 px-10 w-full">

      <div className="hidden md:flex flex-col justify-center items-center py-5 w-full">

        <GenerateInput />

      </div>

      <div className="w-full mb-4"> <Tabs currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} /> </div>

      <div className="w-full">

        { currentIndex === 0 && <TabPage title={"Public"} data={dummyPhotos2} content="You haven’t liked anything yet." subContent="Find something you love and tap that 🤍!"  />  }    
        
        { currentIndex === 1 && <TabPage title={"Private"} data={dummyPhotos2} content="You haven’t liked anything yet." subContent="Find something you love and tap that 🤍!"  />  }

        { currentIndex === 2 && <TabPage title={"Liked"} data={[]} content="You haven’t liked anything yet." subContent="Find something you love and tap that 🤍!" />  }        

        { currentIndex === 3 && <TabPage title={"Public"} data={dummyPhotos2} content="You haven’t liked anything yet." subContent="Find something you love and tap that 🤍!" />  }

        { currentIndex === 4 && <TabPage title={"Draft"} data={[]} content="You haven’t saved anything yet." subContent="Create something you love to post later"  />  }

      </div>

    </div>
  );
}
