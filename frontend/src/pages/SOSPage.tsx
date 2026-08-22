import { useEffect, useState, useCallback, useRef } from 'react';
import { client } from '../api/client';
import { SOSRequest, RiskAssessment, RiskCheckHistoryEntry } from '../types';
import SOSCard from '../components/SOSCard';
import RiskAssessmentPanel from '../components/RiskAssessmentPanel';

// ---------------------------------------------------------------------------
// Session-storage helpers for risk-check history (visible to judges)
// ---------------------------------------------------------------------------
const HISTORY_KEY = 'reliefgrid_risk_check_history';

function loadHistory(): RiskCheckHistoryEntry[] {
  try {
    const raw = sessionStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: RiskCheckHistoryEntry[]) {
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 5)));
}

// ---------------------------------------------------------------------------
// Generate mock coordinates ONCE per draft
// ---------------------------------------------------------------------------
function generateMockCoords(): { lat: number; lng: number } {
  return {
    lat: +(19.08 + Math.random() * 0.05).toFixed(6),
    lng: +(72.88 + Math.random() * 0.05).toFixed(6),
  };
}

// ---------------------------------------------------------------------------
// Snapshot of form values at assessment time
// ---------------------------------------------------------------------------
interface AssessedSnapshot {
  category: string;
  severity: number;
  description: string;
  affected_people: number;
  lat: number;
  lng: number;
}

// ---------------------------------------------------------------------------
// SOSPage — Admin Emergency Operations Center
// ---------------------------------------------------------------------------
const SOSPage = () => {
  const [requests, setRequests] = useState<SOSRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [cat, setCat] = useState('medical');
  const [desc, setDesc] = useState('');
  const [severity, setSeverity] = useState(3);
  const [affectedPeople, setAffectedPeople] = useState(0);

  // Draft coordinates — generated once, reused for assess & dispatch
  const draftCoords = useRef(generateMockCoords());

  // Risk assessment workflow state
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [assessedSnapshot, setAssessedSnapshot] = useState<AssessedSnapshot | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [assessing, setAssessing] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [history, setHistory] = useState<RiskCheckHistoryEntry[]>(loadHistory());

  // Feedback messages for screen-reader status region
  const [statusMsg, setStatusMsg] = useState('');

  // -----------------------------------------------------------------------
  // Fetch existing queue
  // -----------------------------------------------------------------------
  const fetchSOS = async () => {
    try {
      const res = await client.getSOSRequests();
      setRequests(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSOS();
  }, []);

  // -----------------------------------------------------------------------
  // Stale-detection: mark assessment stale when form diverges from snapshot
  // -----------------------------------------------------------------------
  const checkStaleness = useCallback(() => {
    if (!assessedSnapshot || !assessment) return;
    const coords = draftCoords.current;
    const changed =
      cat !== assessedSnapshot.category ||
      severity !== assessedSnapshot.severity ||
      desc !== assessedSnapshot.description ||
      affectedPeople !== assessedSnapshot.affected_people ||
      coords.lat !== assessedSnapshot.lat ||
      coords.lng !== assessedSnapshot.lng;
    if (changed && !isStale) {
      setIsStale(true);
      setConfirmed(false);

      // Mark the most recent history entry as Superseded
      setHistory((prev) => {
        const updated = [...prev];
        if (updated.length > 0 && updated[0].result === 'Current') {
          updated[0] = { ...updated[0], result: 'Superseded' };
        }
        saveHistory(updated);
        return updated;
      });

      setStatusMsg('Assessment is now stale. Please run the risk check again.');
    }
  }, [cat, severity, desc, affectedPeople, assessedSnapshot, assessment, isStale]);

  useEffect(() => {
    checkStaleness();
  }, [checkStaleness]);

  // -----------------------------------------------------------------------
  // Step 1 — Run Pre-Dispatch Risk Check
  // -----------------------------------------------------------------------
  const handleAssess = async () => {
    setAssessing(true);
    setStatusMsg('Running risk assessment…');
    const coords = draftCoords.current;
    try {
      const res = await client.assessSOSRisk({
        category: cat,
        severity,
        description: desc,
        affected_people: affectedPeople,
        lat: coords.lat,
        lng: coords.lng,
      });
      const data: RiskAssessment = res.data;
      setAssessment(data);
      setAssessedSnapshot({
        category: cat,
        severity,
        description: desc,
        affected_people: affectedPeople,
        lat: coords.lat,
        lng: coords.lng,
      });
      setIsStale(false);
      setConfirmed(false);

      // Record in session history
      const entry: RiskCheckHistoryEntry = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        risk_category: data.risk_category,
        score: data.priority_score,
        affected_people: affectedPeople,
        result: 'Current',
      };
      setHistory((prev) => {
        // Mark previous "Current" as "Superseded"
        const updated = prev.map((h) =>
          h.result === 'Current' ? { ...h, result: 'Superseded' as const } : h
        );
        const next = [entry, ...updated].slice(0, 5);
        saveHistory(next);
        return next;
      });

      setStatusMsg(
        `Risk assessment complete: ${data.risk_category}, score ${data.priority_score.toFixed(0)}.`
      );
    } catch (e) {
      console.error(e);
      setStatusMsg('Risk assessment failed. Please try again.');
    } finally {
      setAssessing(false);
    }
  };

  // -----------------------------------------------------------------------
  // Step 2 — Confirm & Dispatch SOS
  // -----------------------------------------------------------------------
  const handleDispatch = async () => {
    setDispatching(true);
    setStatusMsg('Dispatching SOS…');
    const coords = draftCoords.current;
    try {
      await client.createSOSRequest({
        name,
        category: cat,
        description: desc,
        severity,
        affected_people: affectedPeople,
        lat: coords.lat,
        lng: coords.lng,
      });

      // Mark the current history entry as Dispatched
      setHistory((prev) => {
        const updated = [...prev];
        if (updated.length > 0 && updated[0].result === 'Current') {
          updated[0] = { ...updated[0], result: 'Dispatched' };
        }
        saveHistory(updated);
        return updated;
      });

      // Reset form & generate fresh coords for next draft
      setName('');
      setDesc('');
      setSeverity(3);
      setCat('medical');
      setAffectedPeople(0);
      setAssessment(null);
      setAssessedSnapshot(null);
      setIsStale(false);
      setConfirmed(false);
      draftCoords.current = generateMockCoords();

      fetchSOS();
      setStatusMsg('SOS dispatched successfully and added to Active Emergency Queue.');
    } catch (e) {
      console.error(e);
      setStatusMsg('Dispatch failed. Please try again.');
    } finally {
      setDispatching(false);
    }
  };

  // -----------------------------------------------------------------------
  // Derived: can dispatch?
  // -----------------------------------------------------------------------
  const isHighOrCritical =
    assessment?.risk_category === 'HIGH' || assessment?.risk_category === 'CRITICAL';
  const formValid = name.trim() !== '' && desc.trim() !== '';
  const canDispatch =
    assessment !== null &&
    !isStale &&
    formValid &&
    (!isHighOrCritical || confirmed);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Submit Form */}
      <div className="glass-card p-6 h-fit">
        <h3 className="text-xl font-bold text-slate-200 mb-6">Dispatch SOS Request</h3>

        {/* Screen-reader status region — small, separate from form */}
        <div role="status" aria-live="polite" className="sr-only">
          {statusMsg}
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          {/* Reporter Name */}
          <div>
            <label htmlFor="sos-reporter-name" className="block text-sm text-slate-400 mb-1">
              Reporter Name
            </label>
            <input
              required
              id="sos-reporter-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="sos-category" className="block text-sm text-slate-400 mb-1">
              Category
            </label>
            <select
              id="sos-category"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="medical">Medical / Ambulance</option>
              <option value="food">Food &amp; Water</option>
              <option value="rescue">Search &amp; Rescue</option>
              <option value="fire">Fire Emergency</option>
            </select>
          </div>

          {/* Number of affected people (new) */}
          <div>
            <label htmlFor="sos-affected-people" className="block text-sm text-slate-400 mb-1">
              Number of affected people
            </label>
            <input
              id="sos-affected-people"
              type="number"
              min="0"
              step="1"
              value={affectedPeople}
              onChange={(e) => setAffectedPeople(Math.max(0, parseInt(e.target.value) || 0))}
              aria-describedby="sos-affected-people-hint"
              className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
            <p id="sos-affected-people-hint" className="text-xs text-slate-500 mt-1">
              Admin estimate. Enter 0 if unknown.
            </p>
          </div>

          {/* Severity */}
          <div>
            <label htmlFor="sos-severity" className="block text-sm text-slate-400 mb-1">
              Severity (1-5)
            </label>
            <input
              id="sos-severity"
              type="range"
              min="1"
              max="5"
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="text-right text-xs text-slate-400 mt-1">Level: {severity}</div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="sos-description" className="block text-sm text-slate-400 mb-1">
              Description
            </label>
            <textarea
              required
              id="sos-description"
              rows={4}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-navy-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          {/* Step 1 — Run Pre-Dispatch Risk Check */}
          <button
            type="button"
            onClick={handleAssess}
            disabled={assessing || !formValid}
            aria-busy={assessing}
            className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
          >
            {assessing ? 'Analyzing…' : 'Run Pre-Dispatch Risk Check'}
          </button>

          {/* Risk Assessment Panel */}
          {assessment && (
            <RiskAssessmentPanel
              assessment={assessment}
              isStale={isStale}
              isHighOrCritical={isHighOrCritical}
              confirmed={confirmed}
              onConfirmChange={setConfirmed}
            />
          )}

          {/* Step 2 — Confirm & Dispatch SOS */}
          {assessment && (
            <button
              type="button"
              onClick={handleDispatch}
              disabled={!canDispatch || dispatching}
              aria-busy={dispatching}
              className="w-full bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-primary focus:outline-none"
            >
              {dispatching ? 'Dispatching…' : 'Confirm & Dispatch SOS'}
            </button>
          )}
        </form>

        {/* Recent Pre-Dispatch Risk Checks (visible for judges) */}
        {history.length > 0 && (
          <section className="mt-6 pt-4 border-t border-slate-700/50" aria-label="Recent Pre-Dispatch Risk Checks">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-semibold">
              Recent Pre-Dispatch Risk Checks
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {history.map((h, i) => (
                <li key={i} className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-500">{h.time}</span>
                  <span className="font-semibold">{h.risk_category}</span>
                  <span>— {h.score.toFixed(0)}</span>
                  {h.affected_people > 0 && (
                    <span className="text-slate-400">· {h.affected_people} affected</span>
                  )}
                  <span className="text-slate-500">—</span>
                  <span
                    className={
                      h.result === 'Dispatched'
                        ? 'text-emerald-400'
                        : h.result === 'Superseded'
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    }
                  >
                    {h.result}
                    {h.result === 'Superseded' && ' after admin edited details'}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Active Emergency Queue */}
      <div className="lg:col-span-2 glass-card p-6 flex flex-col h-[80vh]">
        <h3 className="text-xl font-bold text-slate-200 mb-6">Active Emergency Queue</h3>
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {loading ? (
            <p>Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-slate-500">No active requests.</p>
          ) : (
            requests.map((req) => <SOSCard key={req.id} request={req} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default SOSPage;
