"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "./PageTransition.module.css";

type TransitionState = "idle" | "covering" | "revealing";

type TransitionContextType = {
    startTransition: () => void;
    transitionState: TransitionState;
};

const TransitionContext = createContext<TransitionContextType | null>(null);

export function usePageTransition() {
    const context = useContext(TransitionContext);
    if (!context) {
        throw new Error(
            "usePageTransition must be used inside PageTransition"
        );
    }
    return context;
}

export default function PageTransition({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [transitionState, setTransitionState] =
        useState<TransitionState>("idle");

    const startTransition = () => {
        setTransitionState("covering");
    };

    useEffect(() => {
        if (transitionState !== "covering") return;

        requestAnimationFrame(() => {
            setTransitionState("revealing");
        });
    }, [pathname, transitionState]);

    return (
        <TransitionContext.Provider value={{ startTransition, transitionState }}>
            {children}
        </TransitionContext.Provider>
    );
}

export function TransitionOverlay({
    children,
}: {
    children: React.ReactNode;
}) {
    const context = useContext(TransitionContext);
    const transitionState = context?.transitionState || "idle";

    return (
        <div className={styles.transitionContainer}>
            {children}
            <div
                className={`${styles.pageTransition} ${
                    styles[transitionState]
                }`}
            />
        </div>
    );
}