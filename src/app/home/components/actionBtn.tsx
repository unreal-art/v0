import { ReactNode } from "react"

interface ActionBtnProps {
    disabled?: boolean;
    children: ReactNode;
    onClick: () => void;
}

export default function ActionBtn ({ disabled, children, onClick } : ActionBtnProps) {

    return (
        <button disabled={disabled} onClick={onClick} className="basis-1/6 text-primary-11 bg-primary-5 font-semibold rounded-full px-8 h-10 disabled:bg-primary-9">{children}</button>
    )
}