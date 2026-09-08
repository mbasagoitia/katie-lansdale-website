"use client";

import Link, { LinkProps } from "next/link";
import { MouseEvent, ReactNode } from "react";
import { usePageTransition } from "./PageTransition";

interface TransitionLinkProps extends LinkProps {
    children: ReactNode;
    className?: string;
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export default function TransitionLink({
    children,
    className,
    onClick,
    ...props
}: TransitionLinkProps) {
    const { startTransition } = usePageTransition();

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
        ) {
            return;
        }

        startTransition();
        onClick?.(event);
    };

    return (
        <Link
            {...props}
            className={className}
            onClick={handleClick}
        >
            {children}
        </Link>
    );
}