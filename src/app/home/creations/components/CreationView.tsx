"use client"
import { useState } from "react";
import Tabs from "./Tabs";
import PhotoGridTwo from "./PhotoGridTwo";

export default function CreationView() {

    const [currentIndex, setCurrentIndex] = useState(0)

    return (
        <div className="w-full">
            
            <div className="w-full mb-4"> <Tabs currentIndex={currentIndex} setCurrentIndex={setCurrentIndex} /> </div>

            <div className="w-full">

                { currentIndex === 0 && <PhotoGridTwo title={"Public"} content="You haven’t liked anything yet." subContent="Find something you love and tap that 🤍!"  />  }    
                
                { currentIndex === 1 && <PhotoGridTwo title={"Private"} content="You haven’t liked anything yet." subContent="Find something you love and tap that 🤍!"  />  }

                { currentIndex === 2 && <PhotoGridTwo title={"Liked"} content="You haven’t liked anything yet." subContent="Find something you love and tap that 🤍!" />  }        

                { currentIndex === 3 && <PhotoGridTwo title={"Public"} content="You haven’t liked anything yet." subContent="Find something you love and tap that 🤍!" />  }

                { currentIndex === 4 && <PhotoGridTwo title={"Draft"} content="You haven’t saved anything yet." subContent="Create something you love to post later"  />  }

            </div> 

        </div>
    )
}