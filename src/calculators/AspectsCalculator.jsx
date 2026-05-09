import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

const REGIONS = [
  { id: 'C',  label: 'C',  name: 'Caudate', group: 'Subcortical (basal ganglia level)' },
  { id: 'L',  label: 'L',  name: 'Lentiform nucleus', group: 'Subcortical (basal ganglia level)' },
  { id: 'IC', label: 'IC', name: 'Internal capsule', group: 'Subcortical (basal ganglia level)' },
  { id: 'I',  label: 'I',  name: 'Insular ribbon', group: 'Subcortical (basal ganglia level)' },
  { id: 'M1', label: 'M1', name: 'Anterior MCA cortex', group: 'Cortical (basal ganglia level)' },
  { id: 'M2', label: 'M2', name: 'MCA cortex lateral to insular ribbon', group: 'Cortical (basal ganglia level)' },
  { id: 'M3', label: 'M3', name: 'Posterior MCA cortex', group: 'Cortical (basal ganglia level)' },
  { id: 'M4', label: 'M4', name: 'Anterior MCA cortex (supraganglionic)', group: 'Cortical (supraganglionic)' },
  { id: 'M5', label: 'M5', name: 'Lateral MCA cortex (supraganglionic)', group: 'Cortical (supraganglionic)' },
  { id: 'M6', label: 'M6', name: 'Posterior MCA cortex (supraganglionic)', group: 'Cortical (supraganglionic)' }
];

const grouped = REGIONS.reduce((acc, r) => {
  if (!acc[r.group]) acc[r.group] = [];
  acc[r.group].push(r);
  return acc;
}, {});

function classify(score) {
  if (score >= 8) return { label: 'Favorable for EVT', tone: 'good', detail: 'ASPECTS 8–10 represents minimal early ischemic change. Within the primary EVT recommendation for both 0–6h and 6–24h windows.' };
  if (score >= 6) return { label: 'EVT recommended', tone: 'good', detail: 'ASPECTS 6–7 is within the primary AHA recommendation framework for EVT in both early and extended windows.' };
  if (score >= 3) return { label: 'EVT may be reasonable in selected patients', tone: 'caveat', detail: 'ASPECTS 3–5 — EVT is recommended for patients <80 in the 6–24h window (Class 1) and reasonable for selected patients in 0–6h. Larger core; individualize.' };
  return { label: 'Very large core', tone: 'caveat', detail: 'ASPECTS 0–2 — EVT is reasonable in selected patients <80 within 6h without significant mass effect (Class 2a). Carefully individualize.' };
}

const toneStyles = {
  good:   { bg: '#f0f9f4', border: '#86efac', fg: '#15803d' },
  caveat: { bg: '#fffbeb', border: '#fcd34d', fg: '#78350f' }
};

export default function AspectsCalculator() {
  const [affected, setAffected] = useState({});

  const toggle = (id) => setAffected(a => ({ ...a, [id]: !a[id] }));
  const reset = () => setAffected({});

  const affectedCount = Object.values(affected).filter(Boolean).length;
  const score = 10 - affectedCount;
  const c = classify(score);
  const tone = toneStyles[c.tone];

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1a202c', letterSpacing: -0.3 }}>ASPECTS Calculator</div>
          <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>Alberta Stroke Program Early CT Score · 10 regions · Start at 10, subtract 1 for each affected region</div>
        </div>
        {affectedCount > 0 && (
          <button onClick={reset} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, padding: '6px 12px', backgroundColor: 'transparent',
            border: '1px solid #e2e8f0', borderRadius: 3, color: '#4a5568',
            cursor: 'pointer', fontFamily: 'inherit'
          }}>
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      <div style={{
        position: 'sticky', top: 102, zIndex: 5,
        padding: '14px 16px', marginBottom: 20,
        backgroundColor: tone.bg, border: `1px solid ${tone.border}`, borderRadius: 4
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: tone.fg }}>ASPECTS</div>
          <div style={{ fontSize: 11, color: '#718096', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>
            {affectedCount} affected · 10 total
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: tone.fg, letterSpacing: -1, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>
            {score}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: tone.fg }}>{c.label}</div>
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: tone.fg, lineHeight: 1.5 }}>
          {c.detail}
        </div>
      </div>

      <div style={{ fontSize: 12, color: '#4a5568', marginBottom: 12, lineHeight: 1.5 }}>
        Tap each region with early ischemic changes (hypoattenuation, loss of grey-white differentiation) on non-contrast CT.
      </div>

      {Object.entries(grouped).map(([group, regions]) => (
        <div key={group} style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>
            {group}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 6 }}>
            {regions.map(r => {
              const isAffected = !!affected[r.id];
              return (
                <button
                  key={r.id}
                  onClick={() => toggle(r.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 3,
                    border: isAffected ? '1px solid #9b1c1c' : '1px solid #e2e8f0',
                    backgroundColor: isAffected ? '#fef2f2' : '#ffffff',
                    color: '#1a202c', textAlign: 'left',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.1s ease'
                  }}
                >
                  <span style={{
                    width: 28, height: 28, borderRadius: 3,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                    fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                    backgroundColor: isAffected ? '#9b1c1c' : '#edf2f7',
                    color: isAffected ? '#ffffff' : '#4a5568'
                  }}>
                    {r.label}
                  </span>
                  <span style={{ fontSize: 12, lineHeight: 1.3, flex: 1 }}>
                    {r.name}
                  </span>
                  {isAffected && (
                    <span style={{
                      fontSize: 10, color: '#9b1c1c', fontWeight: 600,
                      letterSpacing: 0.5, textTransform: 'uppercase'
                    }}>−1</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 20, padding: 12, backgroundColor: '#f7fafc', borderRadius: 3, border: '1px solid #e2e8f0', fontSize: 11, color: '#4a5568', lineHeight: 1.5 }}>
        ASPECTS is read on the contralateral side as a control. Apply only to the MCA territory; not validated for posterior circulation or distal occlusions. Inter-rater reliability is moderate — ensure consistent reader training.
      </div>
    </div>
  );
}
