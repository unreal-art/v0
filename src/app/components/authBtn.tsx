import { ReactNode } from "react"

interface AuthBtnProps {
    icon: ReactNode;
    children: string;
}

export default function AuthBtn({ icon, children } : AuthBtnProps) {

    return (
        <button className="border-primary-9 text-primary-6 rounded-full flex justify-center items-center h-10 w-[276px] border-[1px]">
            <div className="mx-3">{icon}</div>
            <p>{children}</p>
        </button>
    )
}