type Props = {
    title: string;
    right?: React.ReactNode;
};

export default function Header({ title, right }: Props) {
    return (
        <div className="flex justify-between items-center w-full">
            <h1 className="card-title">{title}</h1>
            {right && <div>{right}</div>}
        </div>
    );
}