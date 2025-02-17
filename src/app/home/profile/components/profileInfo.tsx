interface ProfileInfoProps {
    value: string;
    title: string;
    leftBorder?: boolean;
}

export default function ProfileInfo ({ value, title, leftBorder } : ProfileInfoProps) {

    return (
        <div className={`flex flex-col md:flex-row md:items-center gap-2 border-primary-6 px-5 ${leftBorder && "border-l-[1px]"}`}>
            <p className="text-xl text-primary-5">{value}</p>
            <p className="text-primary-6">{title}</p>
        </div>
    )
}