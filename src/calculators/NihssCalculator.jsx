import React, { useState, useMemo } from 'react';
import { RotateCcw } from 'lucide-react';

const NIHSS_ITEMS = [
  {
    id: '1a', label: '1a. Level of consciousness',
    options: [
      { value: 0, label: 'Alert; keenly responsive' },
      { value: 1, label: 'Not alert but rousable to minor stimulation' },
      { value: 2, label: 'Not alert; requires repeated stimulation' },
      { value: 3, label: 'Responds only with reflex motor or unresponsive' }
    ]
  },
  {
    id: '1b', label: '1b. LOC questions (month and age)',
    options: [
      { value: 0, label: 'Both correct' },
      { value: 1, label: 'One correct' },
      { value: 2, label: 'Neither correct' }
    ]
  },
  {
    id: '1c', label: '1c. LOC commands (open/close eyes; grip/release)',
    options: [
      { value: 0, label: 'Performs both correctly' },
      { value: 1, label: 'Performs one correctly' },
      { value: 2, label: 'Performs neither correctly' }
    ]
  },
  {
    id: '2', label: '2. Best gaze',
    options: [
      { value: 0, label: 'Normal' },
      { value: 1, label: 'Partial gaze palsy' },
      { value: 2, label: 'Forced deviation / total gaze paresis' }
    ]
  },
  {
    id: '3', label: '3. Visual fields',
    options: [
      { value: 0, label: 'No visual loss' },
      { value: 1, label: 'Partial hemianopia' },
      { value: 2, label: 'Complete hemianopia' },
      { value: 3, label: 'Bilateral hemianopia (cortical blindness)' }
    ]
  },
  {
    id: '4', label: '4. Facial palsy',
    options: [
      { value: 0, label: 'Normal symmetrical movement' },
      { value: 1, label: 'Minor paralysis (flattened nasolabial fold)' },
      { value: 2, label: 'Partial paralysis (lower face)' },
      { value: 3, label: 'Complete unilateral or bilateral paralysis' }
    ]
  },
  {
    id: '5a', label: '5a. Motor — left arm',
    options: [
      { value: 0, label: 'No drift; holds 90° (or 45°) for 10s' },
      { value: 1, label: 'Drift; falls before 10s but does not hit bed' },
      { value: 2, label: 'Some effort against gravity; cannot hold up' },
      { value: 3, label: 'No effort against gravity; falls' },
      { value: 4, label: 'No movement' },
      { value: 'UN', label: 'Untestable (amputation/joint fusion)' }
    ]
  },
  {
    id: '5b', label: '5b. Motor — right arm',
    options: [
      { value: 0, label: 'No drift' },
      { value: 1, label: 'Drift' },
      { value: 2, label: 'Some effort against gravity' },
      { value: 3, label: 'No effort against gravity' },
      { value: 4, label: 'No movement' },
      { value: 'UN', label: 'Untestable' }
    ]
  },
  {
    id: '6a', label: '6a. Motor — left leg',
    options: [
      { value: 0, label: 'No drift; holds 30° for 5s' },
      { value: 1, label: 'Drift; falls by 5s but does not hit bed' },
      { value: 2, label: 'Some effort against gravity' },
      { value: 3, label: 'No effort against gravity' },
      { value: 4, label: 'No movement' },
      { value: 'UN', label: 'Untestable' }
    ]
  },
  {
    id: '6b', label: '6b. Motor — right leg',
    options: [
      { value: 0, label: 'No drift' },
      { value: 1, label: 'Drift' },
      { value: 2, label: 'Some effort against gravity' },
      { value: 3, label: 'No effort against gravity' },
      { value: 4, label: 'No movement' },
      { value: 'UN', label: 'Untestable' }
    ]
  },
  {
    id: '7', label: '7. Limb ataxia',
    options: [
      { value: 0, label: 'Absent' },
      { value: 1, label: 'Present in one limb' },
      { value: 2, label: 'Present in two limbs' },
      { value: 'UN', label: 'Untestable' }
    ]
  },
  {
    id: '8', label: '8. Sensory',
    options: [
      { value: 0, label: 'Normal; no sensory loss' },
      { value: 1, label: 'Mild-to-moderate sensory loss' },
      { value: 2, label: 'Severe-to-total sensory loss' }
    ]
  },
  {
    id: '9', label: '9. Best language',
    options: [
      { value: 0, label: 'No aphasia; normal' },
      { value: 1, label: 'Mild-to-moderate aphasia' },
      { value: 2, label: 'Severe aphasia' },
      { value: 3, label: 'Mute, global aphasia, or coma' }
    ]
  },
  {
    id: '10', label: '10. Dysarthria',
    options: [
      { value: 0, label: 'Normal articulation' },
      { value: 1, label: 'Mild-to-moderate dysarthria' },
      { value: 2, label: 'Severe; nearly unintelligible or worse' },
      { value: 'UN', label: 'Intubated / physical barrier' }
    ]
  },
  {
    id: '11', label: '11. Extinction and inattention (neglect)',
    options: [
      { value: 0, label: 'No abnormality' },
      { value: 1, label: 'Inattention/extinction in one modality' },
      { value: 2, label: 'Profound inattention or extinction in >1 modality' }
    ]
  }
];

function classify(total) {
  if (total === 0) return { label: 'No stroke symptoms', tone: 'neutral' };
  if (total <= 4) return { label: 'Minor stroke', tone: 'minor' };
  if (total <= 15) return { label: 'Moderate stroke', tone: 'moderate' };
  if (total <= 20) return { label: 'Moderate-to-severe stroke', tone: 'severe' };
  return { label: 'Severe stroke', tone: 'severe' };
}

const toneStyles = {
  neutral:  { bg: '#f7fafc', border: '#cbd5e0', fg: '#2d3748' },
  minor:    { bg: '#f0fdfa', border: '#5eead4', fg: '#0f766e' },
  moderate: { bg: '#fffbeb', border: '#fcd34d', fg: '#78350f' },
  severe:   { bg: '#fef2f2', border: '#fca5a5', fg: '#9b1c1c' }
};

export default function NihssCalculator() {
  const [scores, setScores] = useState({});

  const total = useMemo(() => {
    return Object.values(scores).reduce((sum, v) => sum + (typeof v === 'number' ? v : 0), 0);
  }, [scores]);

  const completeness = Object.keys(scores).length / NIHSS_ITEMS.length;
  const c = classify(total);
  const tone = toneStyles[c.tone];
  const reset = () => setScores({});

  const evtThreshold = total >= 6;

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1a202c', letterSpacing: -0.3 }}>NIHSS Calculator</div>
          <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>National Institutes of Health Stroke Scale · 15 items · 0–42 range</div>
        </div>
        {Object.keys(scores).length > 0 && (
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
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', color: tone.fg }}>
            Total NIHSS
          </div>
          <div style={{ fontSize: 11, color: '#718096', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>
            {Object.keys(scores).length} / {NIHSS_ITEMS.length} items
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <div style={{ fontSize: 36, fontWeight: 700, color: tone.fg, letterSpacing: -1, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>
            {total}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: tone.fg }}>
            {c.label}
          </div>
        </div>
        {completeness === 1 && (
          <div style={{ marginTop: 10, fontSize: 12, color: tone.fg, lineHeight: 1.5 }}>
            {evtThreshold
              ? 'NIHSS ≥6 — within the primary EVT trial population for anterior circulation LVO.'
              : 'NIHSS <6 — outside the primary trial population for the strongest EVT recommendations. Individualized assessment.'}
          </div>
        )}
      </div>

      {NIHSS_ITEMS.map(item => (
        <div key={item.id} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 6, letterSpacing: 0.2 }}>
            {item.label}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {item.options.map(opt => {
              const active = scores[item.id] === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  onClick={() => setScores(s => ({ ...s, [item.id]: opt.value }))}
                  style={{
                    padding: '7px 11px', borderRadius: 3, fontSize: 12,
                    border: active ? '1px solid #0d3b66' : '1px solid #e2e8f0',
                    backgroundColor: active ? '#0d3b66' : '#ffffff',
                    color: active ? '#ffffff' : '#2d3748',
                    cursor: 'pointer', fontWeight: active ? 600 : 400,
                    fontFamily: 'inherit', transition: 'all 0.1s ease',
                    textAlign: 'left', lineHeight: 1.3
                  }}
                >
                  <span style={{
                    fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
                    fontWeight: 600, marginRight: 6,
                    opacity: active ? 1 : 0.7
                  }}>
                    {opt.value}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{ marginTop: 20, padding: 12, backgroundColor: '#f7fafc', borderRadius: 3, border: '1px solid #e2e8f0', fontSize: 11, color: '#4a5568', lineHeight: 1.5 }}>
        Untestable items (UN) do not contribute to the total score per NIHSS scoring conventions. Final clinical interpretation rests with the examining clinician.
      </div>
    </div>
  );
}
