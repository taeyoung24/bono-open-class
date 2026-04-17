import React from 'react';
import styles from './ActionList.module.css';
import { HiChevronRight } from 'react-icons/hi';

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
          <HiChevronRight className={styles.itemIcon} />
        </button>
      ))}
    </nav>
  );
}
