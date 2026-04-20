import styles from './ellipsis.module.css';

interface EllipsisLoaderProps {
  variant?: 'full' | 'mini';
}

const EllipsisLoader = ({ variant = 'full' }: EllipsisLoaderProps) => {
  return (
    <div className={`${styles.loaderContainer} ${variant === 'mini' ? styles.mini : ''}`}>
      <div className={styles.wrapper}>
        <div className={styles.circle} />
        <div className={styles.circle} />
        <div className={styles.circle} />
        <div className={styles.shadow} />
        <div className={styles.shadow} />
        <div className={styles.shadow} />
      </div>
    </div>
  );
}

export default EllipsisLoader;
