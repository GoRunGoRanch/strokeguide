import React, { useState, useEffect, useMemo } from 'react';
import { Clock, RotateCcw } from 'lucide-react';

function toLocalDatetimeValue(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatElapsed(ms) {
  if (ms < 0) return { text: '—', negative: true };
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return { text: `${h}h ${String(m).padStart(2, '0')}m`, negative: false, totalMin };
}

const WINDOWS = [
  { id: 'ivt-standard', label: 'Standard IVT window', range: 'within 4.5h of LKW', upperMin: 4.5 * 60, refs: ['§4.6.2 — Tenecteplase 0.25 mg/kg or alteplase 0.9 mg/kg'] },
  { id: 'ivt-extended', label: 'Extended IVT window', range: '4.5–9h with salvageable penumbra', upperMin: 9 * 60, refs: ['§4.6.3 — Perfusion-selected IVT (CTP/MR-PWI)'] },
  { id: 'evt-early', label: 'Early EVT window', range: 'within 6h of onset', upperMin: 6 * 60, refs: ['§4.7.2 — EVT 0–6h, ASPECTS 3–10 (Class 1)'] },
  { id: 'evt-late', label: 'Late EVT window', range: '6–24h of onset', upperMin: 24 * 60, refs: ['§4.7.2 — EVT 6–24h, ASPECTS 6–10 (Class 1); ASPECTS 3–5 in selected <80'] }
];

function windowStatus(totalMin, win) {
  if (totalMin <= win.upperMin) return 'in';
  return 'out';
}

export default function LkwTimer() {
  const [now, setNow] = useState(new Date());
  const [lkw, setLkw] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - 60);
    return toLocalDatetimeValue(d);
  });
  const [presentation, setPresentation] = useState(() => toLocalDatetimeValue(new Date()));
  const [useNowAsPresentation, setUseNowAsPresentation] = useState(true);
  const [lkwUnknown, setLkwUnknown] = useState(false);

  useEffect(() => {
    if (!useNowAsPresentation) return;
    const t = setInterval(() => {
      setNow(new Date());
      setPresentation(toLocalDatetimeValue(new Date()));
    }, 30000);
    return () => clearInterval(t);
  }, [useNowAsPresentation]);

  const lkwDate = useMemo(() => lkw ? new Date(lkw) : null, [lkw]);
  const presDate = useMemo(() => useNowAsPresentation ? now : (presentation ? new Date(presentation) : null), [presentation, now, useNowAsPresentation]);

  const elapsedMs = useMemo(() => {
    if (!lkwDate || !presDate) return null;
    return presDate.getTime() - lkwDate.getTime();
  }, [lkwDate, presDate]);

  const elapsed = elapsedMs !== null ? formatElapsed(elapsedMs) : null;

  const tz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      return 'local';
    }
  }, []);

  const reset = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - 60);
    setLkw(toLocalDatetimeValue(d));
    setPresentation(toLocalDatetimeValue(new Date()));
    setUseNowAsPresentation(true);
    setLkwUnknown(false);
  };

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1a202c', letterSpacing: -0.3 }}>Time Since Last Known Well</div>
          <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>
            All times in your local timezone:
            <span style={{ marginLeft: 6, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', color: '#4a5568' }}>{tz}</span>
          </div>
        </div>
        <button onClick={reset} style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, padding: '6px 12px', backgroundColor: 'transparent',
          border: '1px solid #e2e8f0', borderRadius: 3, color: '#4a5568',
          cursor: 'pointer', fontFamily: 'inherit'
        }}>
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', letterSpacing: 0.3, textTransform: 'uppercase' }}>
            Last known well (LKW)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4a5568', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={lkwUnknown}
              onChange={e => setLkwUnknown(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Unknown / wake-up onset
          </label>
        </div>
        <input
          type="datetime-local"
          value={lkw}
          onChange={e => setLkw(e.target.value)}
          disabled={lkwUnknown}
          style={{
            width: '100%', padding: '10px 12px', fontSize: 14,
            border: '1px solid #e2e8f0', borderRadius: 4,
            backgroundColor: lkwUnknown ? '#f7fafc' : '#ffffff',
            color: lkwUnknown ? '#a0aec0' : '#1a202c',
            fontFamily: 'inherit', boxSizing: 'border-box',
            outline: 'none'
          }}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', letterSpacing: 0.3, textTransform: 'uppercase' }}>
            Presentation / current time
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4a5568', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useNowAsPresentation}
              onChange={e => setUseNowAsPresentation(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Use current time
          </label>
        </div>
        <input
          type="datetime-local"
          value={presentation}
          onChange={e => setPresentation(e.target.value)}
          disabled={useNowAsPresentation}
          style={{
            width: '100%', padding: '10px 12px', fontSize: 14,
            border: '1px solid #e2e8f0', borderRadius: 4,
            backgroundColor: useNowAsPresentation ? '#f7fafc' : '#ffffff',
            color: useNowAsPresentation ? '#a0aec0' : '#1a202c',
            fontFamily: 'inherit', boxSizing: 'border-box',
            outline: 'none'
          }}
        />
      </div>

      {lkwUnknown ? (
        <div style={{
          padding: 16, marginBottom: 20,
          backgroundColor: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 4
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#78350f', marginBottom: 4 }}>Wake-up / unknown-onset stroke</div>
          <div style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>
            With unknown LKW, time-window classification does not apply. Consider DWI-FLAIR mismatch (§4.6.3, Class 2a) or perfusion imaging within 4.5–24h from symptom recognition (§3.2, Class 2a) for extended-window IVT eligibility.
          </div>
        </div>
      ) : elapsed && elapsed.negative ? (
        <div style={{
          padding: 16, marginBottom: 20,
          backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 4,
          fontSize: 13, color: '#9b1c1c'
        }}>
          Presentation time is before LKW — please review your inputs.
        </div>
      ) : elapsed && (
        <>
          <div style={{
            padding: '14px 16px', marginBottom: 16,
            backgroundColor: '#f0f9f4', border: '1px solid #86efac', borderRadius: 4
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#15803d', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 6 }}>
              Elapsed since LKW
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <Clock size={20} color="#15803d" style={{ alignSelf: 'center' }} />
              <div style={{ fontSize: 30, fontWeight: 700, color: '#15803d', letterSpacing: -0.6, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>
                {elapsed.text}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 600, color: '#4a5568', letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Time-window classification
          </div>
          {WINDOWS.map(win => {
            const status = windowStatus(elapsed.totalMin, win);
            const inWindow = status === 'in';
            return (
              <div key={win.id} style={{
                padding: '12px 14px', marginBottom: 6,
                backgroundColor: inWindow ? '#f0f9f4' : '#f7fafc',
                border: inWindow ? '1px solid #86efac' : '1px solid #e2e8f0',
                borderRadius: 4
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: inWindow ? '#15803d' : '#4a5568' }}>
                    {win.label}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 3,
                    letterSpacing: 0.5, textTransform: 'uppercase',
                    backgroundColor: inWindow ? '#15803d' : '#cbd5e0',
                    color: '#ffffff'
                  }}>
                    {inWindow ? 'In window' : 'Outside'}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#4a5568', marginBottom: 4 }}>{win.range}</div>
                {inWindow && win.refs.map((r, i) => (
                  <div key={i} style={{ fontSize: 11, color: '#4a5568', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>
                    {r}
                  </div>
                ))}
              </div>
            );
          })}
        </>
      )}

      <div style={{ marginTop: 20, padding: 12, backgroundColor: '#f7fafc', borderRadius: 3, border: '1px solid #e2e8f0', fontSize: 11, color: '#4a5568', lineHeight: 1.5 }}>
        Times are entered and displayed in your device's local timezone. The "current time" auto-updates every 30 seconds when "Use current time" is checked. For wake-up strokes, time-of-symptom-recognition replaces LKW for extended-window IVT decisions.
      </div>
    </div>
  );
}
