import { Link } from "react-router-dom";

interface TagProps {
    tagName: string;
    to?: string;
    className?: string;
}

const Tag = ({ tagName, to, className = "" }: TagProps) => {
    const baseClasses = "px-3 py-1 text-sm text-secondary border border-secondary/35 hover:border-secondary/70 hover:text-primary rounded-full transition-colors";
    const combinedClasses = `${baseClasses} ${className}`;

    if (to) {
        return (
            <Link to={to} className={combinedClasses}>
                #{tagName}
            </Link>
        );
    }

    return (
        <span className={combinedClasses}>
            #{tagName}
        </span>
    );
};

export default Tag;
