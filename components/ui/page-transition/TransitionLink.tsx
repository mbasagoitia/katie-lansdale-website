"use client";

import Link, { LinkProps } from "next/link";
import { MouseEvent, ReactNode } from "react";
import {usePathname} from "next/navigation";
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
    const pathname = usePathname();

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

        onClick?.(event);
        if (event.defaultPrevented || isCurrentPath(props.href, pathname)) {
            return;
        }

        startTransition();
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

function isCurrentPath(href: LinkProps["href"], pathname: string): boolean {
    const targetPath = typeof href === "string" ? href.split(/[?#]/)[0] : href.pathname;
    if (typeof targetPath !== "string") return false;

    const normalizePath = (path: string) => path === "/" ? path : path.replace(/\/$/, "");
    return normalizePath(targetPath) === normalizePath(pathname);
}
