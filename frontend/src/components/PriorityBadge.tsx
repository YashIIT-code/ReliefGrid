import React from 'react';

interface PriorityBadgeProps {
  score: number;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ score }) => {
  let badgeClass = '';
  let label = '';

  if (score >= 80) {
    badgeClass = 'priority-critical';
    label = 'CRITICAL';
  } else if (score >= 60) {
    badgeClass = 'priority-high';
    label = 'HIGH';
  } else if (score >= 30) {
    badgeClass = 'priority-medium';
    label = 'MEDIUM';
  } else {
    badgeClass = 'priority-low';
    label = 'LOW';
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}`}>
      <span className="mr-1.5">•</span>
      {label} ({score.toFixed(0)})
    </div>
  );
};

export default PriorityBadge;
