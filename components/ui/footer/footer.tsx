import styles from "./footer.module.css";

export default function Footer({copyright = "© 2026 Katie Lansdale. All rights reserved."}: {copyright?: string}) {
  return (
    <footer className={styles.footer}>
      <span>{copyright}</span>
    </footer>
  );
}
