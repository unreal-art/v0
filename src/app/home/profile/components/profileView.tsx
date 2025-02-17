"use client"
import { useState } from "react";
import Tabs from "../../creations/components/Tabs";
import PhotoGridTwo from "../../creations/components/PhotoGridTwo";

export default function ProfileView() {

    const [currentIndex, setCurrentIndex] = useState(0)

    return (
        <div className="w-full">
            
            <div className="w-full mb-4"> <Tabs currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} hideDraft={true} /> </div>

            <div className="w-full">

                { currentIndex === 0 && <PhotoGridTwo title={"Public"} content="You haven’t liked anything yet." subContent="Find something you love and tap that 🤍!"  />  }    
                
                { currentIndex === 1 && <PhotoGridTwo title={"Private"} content="You haven’t liked anything yet." subContent="Find something you love and tap that 🤍!"  />  }

                { currentIndex === 2 && <PhotoGridTwo title={"Liked"} content="You haven’t liked anything yet." subContent="Find something you love and tap that 🤍!" />  }        

                { currentIndex === 3 && <PhotoGridTwo title={"Public"} content="You haven’t liked anything yet." subContent="Find something you love and tap that 🤍!" />  }

            </div> 

        </div>
    )
}