import React from 'react';
import styles from './ActionList.module.css';
import { FaArrowRight, FaLock } from 'react-icons/fa6';

export interface ActionListItem {
  label: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface ActionListProps {
  items: ActionListItem[];
}

export default function ActionList({ items }: ActionListProps) {
  return (
    <nav className={styles.listContainer}>
      {items.map((item, index) => (
        <button
          key={index}
          className={`${styles.listItem} ${item.disabled ? styles.disabled : ''}`}
          onClick={!item.disabled ? item.onClick : undefined}
          disabled={item.disabled}
        >
          <span className={styles.itemLabel}>{item.label}</span>
          {item.disabled ? (
            <FaLock className={styles.itemIcon} />
          ) : (
            <FaArrowRight className={styles.itemIcon} />
          )}
        </button>
      ))}
    </nav>
  );
}
