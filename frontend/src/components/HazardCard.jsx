import React from 'react';
import styles from './HazardCard.module.css';

const HazardCard = ({
  hazard,
  expanded,
  fixed,
  onToggleExpanded,
  onToggleFixed,
}) => {
  const severityLabel = hazard.severity === 'high'
    ? 'High'
    : hazard.severity === 'medium'
      ? 'Moderate'
      : 'Low';

  return (
    <div className={styles.card}>
      <button
        type="button"
        className={styles.header}
        onClick={onToggleExpanded}
        aria-expanded={expanded}
      >
        <div>
          <p className={styles.title}>{hazard.title}</p>
          <p className={styles.subtitle}>Tap to view guidance</p>
        </div>
        <div className={styles.headerMeta}>
          <span className={`${styles.badge} ${styles[`badge-${hazard.severity}`]}`}>
            {severityLabel}
          </span>
          <span className={styles.chevron}>{expanded ? '-' : '+'}</span>
        </div>
      </button>
      <div className={`${styles.body} ${expanded ? styles.expanded : ''}`}>
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Risk</span>
          <p className={styles.sectionText}>{hazard.risk}</p>
        </div>
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Fix</span>
          <p className={styles.sectionText}>{hazard.fix}</p>
        </div>
        <label className={styles.checkboxRow}>
          <input
            type="checkbox"
            checked={fixed}
            onChange={onToggleFixed}
          />
          <span>Mark as fixed in real life</span>
        </label>
      </div>
    </div>
  );
};

export default HazardCard;
