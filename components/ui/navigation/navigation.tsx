"use client";

import { FocusEvent, useState } from "react";
import Link from "@/components/ui/page-transition/TransitionLink";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import type {SitePageId} from "@/sanity/sitePages";
import styles from "./navigation.module.css";

export default function Navigation({siteTitle = "Katie Lansdale", tagline = "Violinist", labels = {}}: {siteTitle?: string; tagline?: string; labels?: Partial<Record<SitePageId, string>>}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [mediaOpen, setMediaOpen] = useState(false);
    const displayTitle = siteTitle || "Katie Lansdale";
    const displayTagline = tagline || "Violinist";
    const label = (id: SitePageId, fallback: string) => labels[id] || fallback;

    const closeMenu = () => {
        setMenuOpen(false);
        setMediaOpen(false);
    };

    const closeMediaOnBlur = (event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setMediaOpen(false);
    };

    return (
        <nav className={styles.nav}>
            <div className={styles.navInner}>
                <div className={styles.logo}>
                    <h1>{displayTitle}</h1>
                    <span>{displayTagline.toUpperCase()}</span>
                </div>
                <button
                    className={styles.menuButton}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle navigation"
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? <HiOutlineX /> : <HiOutlineMenuAlt3 />}
                </button>
                <div
                    className={`${styles.navLinks} ${
                        menuOpen ? styles.open : ""
                    }`}
                >
                    <div className={styles.navGroup}>
                        <Link
                            href="/"
                            className={styles.topLink}
                            onClick={closeMenu}
                        >
                            {label("page-home", "Home")}
                        </Link>
                    </div>
                    <div className={styles.navGroup}>
                        <Link
                            href="/about"
                            className={styles.topLink}
                            onClick={closeMenu}
                        >
                            {label("page-about", "About")}
                        </Link>
                    </div>
                    <div className={styles.navGroup}>
                        <Link
                            href="/lions-gate-trio"
                            className={styles.topLink}
                            onClick={closeMenu}
                        >
                            {label("page-lions-gate-trio", "Lions Gate Trio")}
                        </Link>
                    </div>
                    <div
                        className={`${styles.navGroup} ${styles.hasSubmenu} ${mediaOpen ? styles.submenuOpen : ""}`}
                        onMouseEnter={() => setMediaOpen(true)}
                        onMouseLeave={() => setMediaOpen(false)}
                        onFocusCapture={() => setMediaOpen(true)}
                        onBlurCapture={closeMediaOnBlur}
                    >
                        <button
                            className={`${styles.topLink} ${styles.mediaLabel}`}
                            type="button"
                            aria-haspopup="true"
                            aria-expanded={mediaOpen}
                            onClick={() => setMediaOpen((open) => !open)}
                        >
                            Media
                        </button>
                        <div className={styles.submenu}>
                            <div className={styles.submenuInner}>
                                <Link href="/watch-listen" onClick={closeMenu}>
                                    {label("page-watch-listen", "Watch / Listen")}
                                </Link>
                                <Link href="/photos-press-kit" onClick={closeMenu}>
                                    {label("page-photos-press-kit", "Photos & Press Kit")}
                                </Link>
                                <Link href="/reviews" onClick={closeMenu}>
                                    {label("page-reviews", "Reviews")}
                                </Link>
                                <Link href="/publications" onClick={closeMenu}>
                                    {label("page-publications", "Publications & Presentations")}
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className={styles.navGroup}>
                        <Link
                            href="/news-and-events"
                            className={styles.topLink}
                            onClick={closeMenu}
                        >
                            {label("page-news-and-events", "News & Events")}
                        </Link>
                    </div>
                    <div className={styles.navGroup}>
                        <Link
                            href="/projects-and-affiliations"
                            className={styles.topLink}
                            onClick={closeMenu}
                        >
                            {label("page-projects-and-affiliations", "Projects & Affiliations")}
                        </Link>
                    </div>
                    <div className={styles.navGroup}>
                        <Link
                            href="/donations"
                            className={styles.topLink}
                            onClick={closeMenu}
                        >
                            {label("page-donations", "Donations")}
                        </Link>
                    </div>
                    <div className={styles.navGroup}>
                        <Link
                            href="/contact"
                            className={styles.topLink}
                            onClick={closeMenu}
                        >
                            {label("page-contact", "Contact")}
                        </Link>
                    </div>

                </div>
            </div>
        </nav>
    );
}
