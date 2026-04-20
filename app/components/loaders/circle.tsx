import styles from './circle.module.css';

const Loader = () => {
  return (
    <div className={styles.loadWrapper}>
      <svg viewBox="0 0 16 16" className={styles['windows-loading-spinner']}>
        <filter id="glow">
          <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <circle 
          r="7px" 
          cy="8px" 
          cx="8px" 
          style={{ filter: 'url(#glow)' }}
        ></circle>
      </svg>
    </div>
  );
};

export default Loader;
