import React from 'react';
import styles from './ActionList.module.css';
import { FaArrowRight } from 'react-icons/fa6';

export interface ActionListItem {
  label: React.ReactNode;
  onClick: () => void;
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
          className={styles.listItem}
          onClick={item.onClick}
        >
          <span className={styles.itemLabel}>{item.label}</span>
          <FaArrowRight className={styles.itemIcon} />
        </button>
      ))}
    </nav>
  );
}
