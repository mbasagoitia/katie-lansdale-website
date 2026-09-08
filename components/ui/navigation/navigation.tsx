"use client";

import { useState } from "react";
import Link from "@/components/ui/page-transition/TransitionLink";
import { HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import styles from "./navigation.module.css";

export default function Navigation() {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => {
        setMenuOpen(false);
    };

    return (
        <nav className={styles.nav}>
            <div className={styles.navInner}>
                <div className={styles.logo}>
                    <h1>Katie Lansdale</h1>
                    <span>VIOLINIST</span>
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
                            Home
                        </Link>
                    </div>
                    <div className={styles.navGroup}>
                        <Link
                            href="/about"
                            className={styles.topLink}
                            onClick={closeMenu}
                        >
                            About
                        </Link>
                    </div>
                    <div className={styles.navGroup}>
                        <Link
                            href="/lions-gate-trio"
                            className={styles.topLink}
                            onClick={closeMenu}
                        >
                            Lions Gate Trio
                        </Link>
                    </div>
                    <div className={`${styles.navGroup} ${styles.hasSubmenu}`}>
                        <Link
                            href="/media"
                            className={styles.topLink}
                            onClick={closeMenu}
                        >
                            Media
                        </Link>
                        <div className={styles.submenu}>
                            <div className={styles.submenuInner}>
                                <Link href="/watch-listen" onClick={closeMenu}>
                                    Watch / Listen
                                </Link>
                                <Link href="/photos-press-kit" onClick={closeMenu}>
                                    Photos & Press Kit
                                </Link>
                                <Link href="/reviews" onClick={closeMenu}>
                                    Reviews
                                </Link>
                                <Link href="/publications" onClick={closeMenu}>
                                    Publications
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
                            News & Events
                        </Link>
                    </div>
                    <div className={styles.navGroup}>
                        <Link
                            href="/projects-and-affiliations"
                            className={styles.topLink}
                            onClick={closeMenu}
                        >
                            Projects & Affiliations
                        </Link>
                    </div>
                    <div className={styles.navGroup}>
                        <Link
                            href="/donations"
                            className={styles.topLink}
                            onClick={closeMenu}
                        >
                            Donations
                        </Link>
                    </div>
                    <div className={styles.navGroup}>
                        <Link
                            href="/contact"
                            className={styles.topLink}
                            onClick={closeMenu}
                        >
                            Contact
                        </Link>
                    </div>

                </div>
            </div>
        </nav>
    );
}