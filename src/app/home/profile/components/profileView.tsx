"use client";
import { useEffect, useState } from "react";
import Tabs from "../../creations/components/Tabs";
import PhotoGridTwo from "../../creations/components/PhotoGridTwo";
import { useSearchParams } from "next/navigation";
import { indexOf } from "lodash";
import { POST_GROUPS } from "@/app/libs/constants";

export default function ProfileView() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const searchParams = useSearchParams();
  const s = searchParams.get("s");

  useEffect(() => {
    if (!s) setCurrentIndex(0);
    else setCurrentIndex(indexOf(POST_GROUPS, s?.toUpperCase()));
  }, [s]);

  return (
    <div className="w-full">
      <div className="w-full mb-4">
        <Tabs
          currentIndex={currentIndex}
          setCurrentIndex={setCurrentIndex}
          hideDraft={true}
        />
      </div>

      <div className="w-full">
        {currentIndex === 0 && (
          <PhotoGridTwo
            title={"Public"}
            content="You haven’t liked anything yet."
            subContent="Find something you love and tap that 🤍!"
          />
        )}

        {currentIndex === 1 && (
          <PhotoGridTwo
            title={"Private"}
            content="You don't have any private post."
            subContent="You can go ahead and create one."
          />
        )}

        {currentIndex === 2 && (
          <PhotoGridTwo
            title={"Liked"}
            content="You haven’t liked anything yet."
            subContent="Find something you love and tap that 🤍!"
          />
        )}

        {currentIndex === 3 && (
          <PhotoGridTwo
            title={"Pinned"}
            content="You haven’t pinned anything yet."
            subContent="Find something you love and pin it!"
          />
        )}
      </div>
    </div>
  );
}
