import styles from './header.module.scss'

export function Header() {
  return(
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <nav>
          <img src="/images/logo.svg" alt="Blog from zero logo" />
        </nav>
      </div>
    </header>
  );
}
