import Link from 'next/link';
import styles from './header.module.scss'

export default function Header() {
  return(
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <nav>
          <Link href="/">
            <img src="/images/logo.svg" alt="logo" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
