import React from 'react';
import { IoRadioButtonOff, IoRadioButtonOn } from 'react-icons/io5';
import styles from './SelectionList.module.css';

export interface SelectionListItem {
  label: React.ReactNode;
  onClick: () => void;
  selected?: boolean;
}

interface SelectionListProps {
  items: SelectionListItem[];
}

export default function SelectionList({ items }: SelectionListProps) {
  return (
    <div className={styles.listContainer}>
      {items.map((item, index) => (
        <button
          key={index}
          className={`${styles.listItem} ${item.selected ? styles.selected : ''}`}
          onClick={item.onClick}
          type="button"
        >
          <span className={styles.itemLabel}>{item.label}</span>
          <div className={styles.iconWrapper}>
            {item.selected ? (
              <IoRadioButtonOn className={styles.selectedIcon} />
            ) : (
              <IoRadioButtonOff className={styles.unselectedIcon} />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
