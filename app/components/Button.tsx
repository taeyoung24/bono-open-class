import { AnimatePresence, motion } from 'framer-motion';
import styles from './Button.module.css';
import ButterflyLoader from './loaders/butterfily';
import EllipsisLoader from './loaders/ellipsis';

interface ButtonProps {
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  isLoading?: boolean;
}

interface DefaultButtonProps extends ButtonProps {
  width?: 'fill' | 'hug' | string;
  variant?: 'primary' | 'danger' | 'none' | 'correct';
}

interface FieldButtonProps extends ButtonProps {
  width?: 'fill' | 'hug' | string;
  variant?: 'default' | 'correct' | 'danger' | 'primary' | 'none';
}

export function DefaultButton({
  text,
  onClick,
  type = 'button',
  disabled = false,
  isLoading = false,
  width = 'fill',
  variant = 'primary'
}: DefaultButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles.wide} ${styles[variant]} ${isLoading ? styles.loading : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      <div className={styles.contentWrapper}>
        {/* sizer: 버튼의 폭을 고정하기 위해 보이지 않게 자리만 차지함 */}
        <span className={styles.sizer}>{text}</span>

        {/* animator: 실제 보이는 요소들 (애니메이션 적용) */}
        <div className={styles.animator}>
          <AnimatePresence mode="wait" initial={false}>
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={styles.animator}
              >
                <ButterflyLoader variant="mini" />
              </motion.div>
            ) : (
              <motion.span
                key="text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {text}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </button>
  );
}

export function TextButton({
  text,
  onClick,
  type = 'button',
  disabled = false,
  isLoading = false
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles.text} ${isLoading ? styles.loadingText : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      <div className={styles.contentWrapper}>
        <span className={styles.sizer}>{text}</span>
        <div className={styles.animator}>
          <AnimatePresence mode="wait" initial={false}>
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={styles.animator}
              >
                <EllipsisLoader variant="mini" />
              </motion.div>
            ) : (
              <motion.span
                key="text"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {text}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </button>
  );
}

export function FieldButton({
  text,
  onClick,
  type = 'button',
  disabled = false,
  isLoading = false,
  width = 'hug',
  variant = 'default'
}: FieldButtonProps) {
  const getWidthStyle = () => {
    switch (width) {
      case 'fill': return '100%';
      case 'hug': return 'fit-content';
      default: return width;
    }
  };

  return (
    <button
      type={type}
      className={`${styles.button} ${styles.field} ${styles[variant]} ${isLoading ? styles.loadingField : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      style={{ width: getWidthStyle() }}
    >
      <div className={styles.contentWrapper}>
        {/* sizer: 텍스트 길이에 맞춰 버튼 폭을 고정함 */}
        <span className={styles.sizer}>{text}</span>

        <div className={styles.animator}>
          <AnimatePresence mode="wait" initial={false}>
            {isLoading ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={styles.animator}
              >
                <EllipsisLoader variant="mini" />
              </motion.div>
            ) : (
              <motion.span
                key="text"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                {text}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </button>
  );
}

