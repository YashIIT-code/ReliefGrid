import React from 'react';
import { RiskAssessment } from '../types';

interface RiskAssessmentPanelProps {
  assessment: RiskAssessment;
  isStale: boolean;
  isHighOrCritical: boolean;
  confirmed: boolean;
  onConfirmChange: (checked: boolean) => void;
}

const riskBadgeClass: Record<string, string> = {
  CRITICAL: 'priority-critical',
  HIGH: 'priority-high',
  MEDIUM: 'priority-medium',
  LOW: 'priority-low',
};

const RiskAssessmentPanel: React.FC<RiskAssessmentPanelProps> = ({
  assessment,
  isStale,
  isHighOrCritical,
  confirmed,
  onConfirmChange,
}) => {
  const badgeClass = riskBadgeClass[assessment.risk_category] || 'priority-low';

  return (
    <section
      className="glass-card p-5 my-4 border border-slate-700/50"
      aria-label="Pre-Dispatch Risk Check Results"
    >
      <h4 className="text-sm uppercase tracking-wider text-slate-400 mb-4 font-semibold">
        Pre-Dispatch Risk Check
      </h4>

      {/* Risk category + score */}
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeClass}`}
        >
          <span className="mr-1.5">•</span>
          Risk: {assessment.risk_category}
        </span>
        <span className="text-slate-200 font-semibold text-sm">
          Priority Score: {assessment.priority_score.toFixed(0)} / 100
        </span>
      </div>

      {/* Factors */}
      <div className="mb-3">
        <p className="text-xs uppercase tracking-wider text-slate-400 mb-1 font-medium">
          Why this risk was assigned:
        </p>
        <ul className="list-disc list-inside space-y-0.5">
          {assessment.factors.map((f, i) => (
            <li key={i} className="text-sm text-slate-300">{f}</li>
          ))}
        </ul>
      </div>

      {/* Explanation */}
      <div className="mb-3">
        <p className="text-xs uppercase tracking-wider text-slate-400 mb-1 font-medium">
          Recommended response:
        </p>
        <p className="text-sm text-slate-200">{assessment.recommended_action}</p>
      </div>

      {/* Stale / current status — small aria-live region */}
      <div role="status" aria-live="polite" className="mb-3">
        {isStale ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400">
            ⚠ Status: Needs Re-check
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
            ✓ Status: Assessment Current
          </span>
        )}
      </div>

      {/* HIGH / CRITICAL confirmation checkbox */}
      {isHighOrCritical && !isStale && (
        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-slate-700/50">
          <input
            type="checkbox"
            id="risk-confirm-checkbox"
            checked={confirmed}
            onChange={(e) => onConfirmChange(e.target.checked)}
            className="mt-0.5 accent-primary w-4 h-4 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <label htmlFor="risk-confirm-checkbox" className="text-sm text-slate-300 select-none">
            I reviewed the dispatch risk summary.
          </label>
        </div>
      )}
    </section>
  );
};

export default RiskAssessmentPanel;
