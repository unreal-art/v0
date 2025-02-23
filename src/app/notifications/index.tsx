"use client";
import { ReactNode, useRef, useState } from "react";
import Notification from "./notification";
import { ScrollTopIcon } from "../components/icons";
import { useUser } from "@/hooks/useUser";
import { useNotifications } from "@/hooks/useNotifications";

interface INotificationProps {
  children: ReactNode;
}

const dummy = [1, 2, 3, 4, 5, 6, 8, 1, 2, 3, 4, 5, 6, 8];

export default function Notifications({ children }: INotificationProps) {
  const { userId } = useUser();
  const { data: notifications } = useNotifications(userId || "");

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function scrollTop() {
    if (ref.current) {
      ref.current.scrollTop = 0;
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)}>{children}</button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed z-50  top-0 left-0 h-screen w-full bg-gray-950/50"
          ></div>
          <div className="absolute w-full max-w-[528px] h-[90vh] z-50 top-2 md:top-[5vh] left-0 md:left-60 border-primary-8 border-[1px] bg-primary-12 rounded-xl p-4">
            <div className="flex justify-between text-primary-3 px-4">
              <p className="nasalization text-2xl">Notification</p>
              <button className="flex justify-center items-center w-[120px] h-9 border-[1px] border-primary-11 rounded-[20px] gap-2">
                <button onClick={scrollTop}>
                  <ScrollTopIcon width={16} height={16} color="#8F8F8F" />{" "}
                </button>
                <p>To the top</p>
              </button>
            </div>

            <div ref={ref} className="overflow-y-auto h-[82vh] !scroll-smooth">
              {notifications?.map((notification, index) => {
                return <Notification key={index} notification={notification} />;
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
