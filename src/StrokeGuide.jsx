import React, { useState, useMemo } from 'react';
import {
  Activity, AlertTriangle, ChevronRight, Heart, Search, Siren,
  Stethoscope, Syringe, X, ArrowRight, CheckCircle2, AlertCircle, Info,
  Baby, Calculator, Brain, Clock
} from 'lucide-react';
import KB from './recommendations.json';
import NihssCalculator from './calculators/NihssCalculator.jsx';
import AspectsCalculator from './calculators/AspectsCalculator.jsx';
import LkwTimer from './calculators/LkwTimer.jsx';

const ICONS = {
  siren: Siren, scan: Search, syringe: Syringe, activity: Activity,
  heart: Heart, stethoscope: Stethoscope, baby: Baby
};

const corStyles = {
  strong:      { bg: '#0d3b66', fg: '#ffffff' },
  moderate:    { bg: '#2c7a7b', fg: '#ffffff' },
  weak:        { bg: '#b08400', fg: '#ffffff' },
  'no-benefit':{ bg: '#6b7280', fg: '#ffffff' },
  harm:        { bg: '#9b1c1c', fg: '#ffffff' }
};

const corToneByKey = {
  '1': 'strong', '2a': 'moderate', '2b': 'weak',
  '3-no-benefit': 'no-benefit', '3-harm': 'harm'
};

function CorBadge({ cor }) {
  const meta = KB.cor_definitions[cor];
  if (!meta) return null;
  const tone = corToneByKey[cor];
  const s = corStyles[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      backgroundColor: s.bg, color: s.fg,
      fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
      padding: '3px 8px', borderRadius: 3, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
      textTransform: 'uppercase', whiteSpace: 'nowrap'
    }}>
      {tone === 'harm' && <AlertTriangle size={11} strokeWidth={2.5} />}
      {meta.label}
    </span>
  );
}

function LoeBadge({ loe }) {
  if (!loe || loe === '—') return null;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      border: '1px solid #cbd5e0', color: '#4a5568',
      fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
      padding: '2px 7px', borderRadius: 3, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
      backgroundColor: '#ffffff'
    }}>
      LOE {loe}
    </span>
  );
}

function RecommendationCard({ rec, expanded, onToggle }) {
  const tone = corToneByKey[rec.cor];
  const isHarm = tone === 'harm';
  return (
    <div
      onClick={onToggle}
      style={{
        backgroundColor: '#ffffff',
        border: isHarm ? '1px solid #fca5a5' : '1px solid #e2e8f0',
        borderLeft: `3px solid ${corStyles[tone]?.bg || '#e2e8f0'}`,
        borderRadius: 4, padding: '14px 16px', marginBottom: 8,
        cursor: 'pointer', transition: 'all 0.15s ease',
        boxShadow: expanded ? '0 2px 8px rgba(13, 59, 102, 0.08)' : 'none'
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6, flexWrap: 'wrap' }}>
        <CorBadge cor={rec.cor} />
        <LoeBadge loe={rec.loe} />
        <span style={{ fontSize: 11, color: '#718096', fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', marginLeft: 'auto' }}>
          §{rec.section}
        </span>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1a202c', lineHeight: 1.4, marginBottom: expanded ? 10 : 0 }}>
        {rec.title}
      </div>
      {expanded && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #edf2f7' }}>
          <div style={{ fontSize: 13, color: '#2d3748', lineHeight: 1.6, fontFamily: 'Georgia, "Times New Roman", serif' }}>
            "{rec.text}"
          </div>
          {rec.key_point && (
            <div style={{
              marginTop: 12, padding: '10px 12px',
              backgroundColor: isHarm ? '#fef2f2' : '#f7fafc',
              borderRadius: 3, borderLeft: `2px solid ${isHarm ? '#dc2626' : '#0d3b66'}`,
              fontSize: 12, color: '#2d3748', lineHeight: 1.5
            }}>
              <strong style={{ fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', color: isHarm ? '#9b1c1c' : '#0d3b66' }}>
                {isHarm ? '⚠ Critical' : 'Key point'}
              </strong>
              <div style={{ marginTop: 4 }}>{rec.key_point}</div>
            </div>
          )}
          <div style={{ marginTop: 10, fontSize: 11, color: '#718096' }}>
            {rec.section_label} · AHA/ASA 2026 Guideline
          </div>
        </div>
      )}
    </div>
  );
}

function EvtDecisionTree() {
  const [answers, setAnswers] = useState({});
  const set = (k, v) => setAnswers(a => ({ ...a, [k]: v }));
  const reset = () => setAnswers({});

  const evaluation = useMemo(() => {
    const { lvo, time, nihss, mrs, aspects, age } = answers;
    if (!lvo) return null;
    if (lvo === 'no') return { class: 'info', title: 'Outside the primary EVT framework', detail: 'EVT for posterior circulation, M2, or distal occlusions follows separate recommendations (Section 4.7.3 and EVT Adult Patients Recommendations 7+). Consult the relevant section.', recIds: [] };
    if (!time || !nihss || !mrs || !aspects) return null;
    if (nihss === '<6') return { class: 'caveat', title: 'NIHSS <6 — outside the primary trial population', detail: 'The Class 1 EVT recommendations apply to NIHSS ≥6. EVT in lower NIHSS populations is an area of ongoing study; individualize.', recIds: [] };
    if (mrs === '≥5') return { class: 'caveat', title: 'Prestroke mRS ≥5 — outside the primary trial population', detail: 'Patients with prestroke mRS ≥5 were not enrolled. Decision should be individualized with shared decision-making.', recIds: [] };
    if (time === '>24 hours') return { class: 'info', title: 'Outside 0–24h window', detail: 'Beyond 24h is outside the primary AHA 2026 EVT recommendation framework. Individualized decision based on imaging and clinical factors.', recIds: [] };

    const recs = [];
    if (time === '≤6 hours') {
      if (mrs === '0–1' && aspects === '≥6') recs.push('evt-1');
      if (mrs === '0–1' && aspects === '3–5') recs.push('evt-1');
      if (mrs === '0–1' && aspects === '0–2' && age === '<80') recs.push('evt-4');
      if (mrs === '2' && aspects === '≥6') recs.push('evt-5');
      if (mrs === '3–4' && aspects === '≥6') recs.push('evt-6');
    }
    if (time === '6–24 hours') {
      if (mrs === '0–1' && aspects === '≥6') recs.push('evt-2');
      if (mrs === '0–1' && aspects === '3–5' && age === '<80') recs.push('evt-3');
    }

    if (recs.length === 0) return { class: 'caveat', title: 'No primary EVT recommendation matches this profile', detail: 'This combination falls outside the strongest AHA 2026 EVT recommendations. Individualized clinical decision-making is required, with shared decision-making with patient/family.', recIds: [] };
    const topClass = recs.some(id => KB.recommendations.find(r => r.id === id)?.cor === '1') ? 'class1' : 'class2';
    return { class: topClass, title: topClass === 'class1' ? 'EVT is recommended' : 'EVT may be reasonable', detail: 'Based on AHA 2026 framework. Final decision rests with the treating clinician.', recIds: recs };
  }, [answers]);

  const Question = ({ k, label, options }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', marginBottom: 8, letterSpacing: 0.3, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map(opt => {
          const active = answers[k] === opt;
          return (
            <button
              key={opt}
              onClick={() => set(k, opt)}
              style={{
                padding: '7px 14px', borderRadius: 3, fontSize: 13,
                border: active ? '1px solid #0d3b66' : '1px solid #e2e8f0',
                backgroundColor: active ? '#0d3b66' : '#ffffff',
                color: active ? '#ffffff' : '#2d3748',
                cursor: 'pointer', fontWeight: active ? 600 : 400,
                fontFamily: 'inherit', transition: 'all 0.1s ease'
              }}
            >{opt}</button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1a202c', letterSpacing: -0.3 }}>Endovascular Thrombectomy Eligibility</div>
          <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>AHA/ASA 2026 framework — Section 4.7.2</div>
        </div>
        {Object.keys(answers).length > 0 && (
          <button onClick={reset} style={{
            fontSize: 12, padding: '6px 12px', backgroundColor: 'transparent',
            border: '1px solid #e2e8f0', borderRadius: 3, color: '#4a5568',
            cursor: 'pointer', fontFamily: 'inherit'
          }}>Reset</button>
        )}
      </div>

      <Question k="lvo" label="1. Anterior circulation proximal LVO (ICA or M1) confirmed?" options={['yes', 'no']} />
      {answers.lvo === 'yes' && <>
        <Question k="time" label="2. Time from symptom onset" options={['≤6 hours', '6–24 hours', '>24 hours']} />
        <Question k="nihss" label="3. NIHSS score" options={['<6', '≥6']} />
        <Question k="mrs" label="4. Prestroke mRS" options={['0–1', '2', '3–4', '≥5']} />
        <Question k="aspects" label="5. ASPECTS on non-contrast CT" options={['≥6', '3–5', '0–2']} />
        <Question k="age" label="6. Age" options={['<80', '≥80']} />
      </>}

      {evaluation && (
        <div style={{
          marginTop: 24, padding: 16, borderRadius: 4,
          backgroundColor: evaluation.class === 'class1' ? '#f0f9f4' :
                          evaluation.class === 'class2' ? '#f0fdfa' :
                          evaluation.class === 'caveat' ? '#fffbeb' : '#f7fafc',
          border: `1px solid ${evaluation.class === 'class1' ? '#86efac' :
                              evaluation.class === 'class2' ? '#5eead4' :
                              evaluation.class === 'caveat' ? '#fcd34d' : '#cbd5e0'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            {evaluation.class === 'class1' && <CheckCircle2 size={18} color="#15803d" />}
            {evaluation.class === 'class2' && <CheckCircle2 size={18} color="#0f766e" />}
            {evaluation.class === 'caveat' && <AlertCircle size={18} color="#b45309" />}
            {evaluation.class === 'info' && <Info size={18} color="#4a5568" />}
            <div style={{ fontSize: 15, fontWeight: 600, color: '#1a202c' }}>{evaluation.title}</div>
          </div>
          <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.5 }}>{evaluation.detail}</div>
          {evaluation.recIds.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Applicable recommendations</div>
              {evaluation.recIds.map(id => {
                const r = KB.recommendations.find(x => x.id === id);
                return r && <RecommendationCard key={id} rec={r} expanded={true} onToggle={() => {}} />;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function IvtChecklist() {
  const [checked, setChecked] = useState({});
  const checklist = KB.ivt_eligibility_checklist;
  const toggle = (k) => setChecked(c => ({ ...c, [k]: !c[k] }));

  const allItems = checklist.categories.flatMap(c => c.items);
  const primaryItems = allItems.filter(i => i.weight === 'primary');
  const checkedPrimary = primaryItems.filter(i => checked[i.id]).length;
  const allPrimary = checkedPrimary === primaryItems.length;

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1a202c', letterSpacing: -0.3 }}>{checklist.title}</div>
        <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{checklist.preamble}</div>
      </div>

      <div style={{
        padding: 12, backgroundColor: allPrimary ? '#f0f9f4' : '#f7fafc',
        border: `1px solid ${allPrimary ? '#86efac' : '#e2e8f0'}`,
        borderRadius: 4, marginBottom: 20, fontSize: 13
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#2d3748' }}>Core criteria checked</span>
          <span style={{ fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', fontWeight: 600, color: allPrimary ? '#15803d' : '#4a5568' }}>
            {checkedPrimary} / {primaryItems.length}
          </span>
        </div>
      </div>

      {checklist.categories.map(cat => (
        <div key={cat.name} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>
            {cat.name}
          </div>
          {cat.items.map(it => (
            <label key={it.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 12px', marginBottom: 6,
              backgroundColor: checked[it.id] ? '#f0f9f4' : '#ffffff',
              border: `1px solid ${checked[it.id] ? '#86efac' : '#e2e8f0'}`,
              borderRadius: 3, cursor: 'pointer',
              transition: 'all 0.1s ease'
            }}>
              <input
                type="checkbox"
                checked={!!checked[it.id]}
                onChange={() => toggle(it.id)}
                style={{ marginTop: 2, cursor: 'pointer' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: '#2d3748', lineHeight: 1.4 }}>{it.question}</div>
                {it.guideline_ref && <div style={{ fontSize: 11, color: '#718096', marginTop: 2, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace' }}>§{it.guideline_ref}</div>}
              </div>
              {it.weight === 'primary' && <span style={{ fontSize: 10, color: '#718096', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 }}>core</span>}
              {it.weight === 'extended-window' && <span style={{ fontSize: 10, color: '#0d3b66', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 }}>extended</span>}
              {it.weight === 'informational' && <span style={{ fontSize: 10, color: '#b45309', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 3 }}>info</span>}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}

function PathwayView({ pathwayId }) {
  const [expanded, setExpanded] = useState(null);
  const recs = KB.recommendations.filter(r => r.pathway === pathwayId);
  const pathway = KB.pathways.find(p => p.id === pathwayId);
  const isPediatric = pathwayId === 'pediatric';

  const grouped = recs.reduce((acc, r) => {
    if (!acc[r.section_label]) acc[r.section_label] = [];
    acc[r.section_label].push(r);
    return acc;
  }, {});

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1a202c', letterSpacing: -0.3 }}>{pathway?.label}</div>
        <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>{recs.length} recommendation{recs.length !== 1 ? 's' : ''} from AHA/ASA 2026</div>
      </div>

      {isPediatric && (
        <div style={{
          padding: 14, marginBottom: 20,
          backgroundColor: '#f0fdfa', border: '1px solid #5eead4', borderRadius: 4,
          fontSize: 12, color: '#0f766e', lineHeight: 1.5
        }}>
          <strong style={{ display: 'block', marginBottom: 4, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Pediatric pathway — §3.2, §4.6.1, §4.7.5
          </strong>
          Pediatric AIS recommendations are limited; pediatric stroke management is rare, time-sensitive, and benefits from involvement of a pediatric stroke specialist. The 2026 guideline added a dedicated pediatric EVT section (§4.7.5) with three recommendations. Pediatric BP targets and pediatric SCD risk-benefit for IVT have not been studied in the AIS literature.
        </div>
      )}

      {Object.entries(grouped).map(([section, items]) => (
        <div key={section} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' }}>
            {section}
          </div>
          {items.map(r => (
            <RecommendationCard key={r.id} rec={r} expanded={expanded === r.id} onToggle={() => setExpanded(expanded === r.id ? null : r.id)} />
          ))}
        </div>
      ))}
    </div>
  );
}

function SearchView() {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(null);
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return KB.recommendations.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.text.toLowerCase().includes(q) ||
      r.section_label.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1a202c', letterSpacing: -0.3 }}>Search recommendations</div>
        <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>Across all {KB.recommendations.length} indexed recommendations</div>
      </div>
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#a0aec0' }} />
        <input
          type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder='Try: "tenecteplase", "BP after EVT", "wake-up", "ASPECTS", "pediatric"...'
          style={{
            width: '100%', padding: '11px 14px 11px 36px', fontSize: 14,
            border: '1px solid #e2e8f0', borderRadius: 4,
            backgroundColor: '#ffffff', fontFamily: 'inherit', boxSizing: 'border-box',
            outline: 'none'
          }}
        />
      </div>
      {query.trim() === '' && (
        <div style={{ padding: 32, textAlign: 'center', color: '#a0aec0', fontSize: 13 }}>
          Type to search across all recommendations.
        </div>
      )}
      {query.trim() !== '' && results.length === 0 && (
        <div style={{ padding: 32, textAlign: 'center', color: '#718096', fontSize: 13 }}>
          No matches. Try a broader term.
        </div>
      )}
      {results.length > 0 && (
        <>
          <div style={{ fontSize: 11, color: '#718096', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {results.length} result{results.length !== 1 ? 's' : ''}
          </div>
          {results.map(r => (
            <RecommendationCard key={r.id} rec={r} expanded={expanded === r.id} onToggle={() => setExpanded(expanded === r.id ? null : r.id)} />
          ))}
        </>
      )}
    </div>
  );
}

function HomeView({ onNavigate }) {
  const tools = [
    { id: 'tool-ivt', icon: Syringe, title: 'IVT eligibility checklist', desc: 'Structured criteria for IV thrombolytic — tenecteplase or alteplase', target: 'ivt-checklist' },
    { id: 'tool-evt', icon: Activity, title: 'EVT eligibility decision tree', desc: 'Step through anterior circulation LVO criteria for thrombectomy', target: 'evt-tree' }
  ];
  const calculators = [
    { id: 'calc-nihss', icon: Brain, title: 'NIHSS calculator', desc: 'National Institutes of Health Stroke Scale — 15 items', target: 'nihss' },
    { id: 'calc-aspects', icon: Calculator, title: 'ASPECTS calculator', desc: '10-region MCA territory CT scoring', target: 'aspects' },
    { id: 'calc-lkw', icon: Clock, title: 'Time-since-LKW timer', desc: 'Local-time elapsed since last known well, with window classification', target: 'lkw-timer' }
  ];

  return (
    <div style={{ padding: '24px 24px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: '#0d3b66', letterSpacing: 1.5, fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
          AHA / ASA 2026
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a202c', letterSpacing: -0.6, lineHeight: 1.15, margin: 0 }}>
          Acute Ischemic Stroke<br/>
          <span style={{ color: '#0d3b66' }}>Clinical Reference</span>
        </h1>
        <div style={{ fontSize: 13, color: '#4a5568', marginTop: 10, lineHeight: 1.6, maxWidth: 540 }}>
          The 2026 AHA/ASA acute ischemic stroke guideline, structured for fast bedside reference. Every recommendation cites Class of Recommendation, Level of Evidence, and source section.
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Decision tools</div>
        {tools.map(t => {
          const Icon = t.icon;
          return (
            <div key={t.id} onClick={() => onNavigate(t.target)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: 16, marginBottom: 8, cursor: 'pointer',
                border: '1px solid #0d3b66', borderRadius: 4,
                backgroundColor: '#ffffff', transition: 'all 0.15s ease'
              }}
            >
              <Icon size={22} style={{ color: '#0d3b66', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1a202c' }}>{t.title}</div>
                <div style={{ fontSize: 12, color: '#4a5568', marginTop: 2 }}>{t.desc}</div>
              </div>
              <ArrowRight size={16} style={{ color: '#0d3b66' }} />
            </div>
          );
        })}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Clinical calculators</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
          {calculators.map(c => {
            const Icon = c.icon;
            return (
              <div key={c.id} onClick={() => onNavigate(c.target)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 14px', cursor: 'pointer',
                  border: '1px solid #2c7a7b', borderRadius: 4,
                  backgroundColor: '#ffffff', transition: 'all 0.15s ease'
                }}
              >
                <Icon size={18} style={{ color: '#2c7a7b', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a202c' }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: '#718096', marginTop: 1 }}>{c.desc}</div>
                </div>
                <ChevronRight size={14} style={{ color: '#a0aec0' }} />
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Browse by clinical pathway</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
          {KB.pathways.map(p => {
            const Icon = ICONS[p.icon] || Info;
            const count = KB.recommendations.filter(r => r.pathway === p.id).length;
            return (
              <div key={p.id} onClick={() => onNavigate('path-' + p.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 14px', cursor: 'pointer',
                  border: '1px solid #e2e8f0', borderRadius: 4,
                  backgroundColor: '#ffffff', transition: 'all 0.15s ease'
                }}
              >
                <Icon size={18} style={{ color: '#0d3b66', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1a202c' }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: '#718096', marginTop: 1 }}>{count} recommendation{count !== 1 ? 's' : ''}</div>
                </div>
                <ChevronRight size={14} style={{ color: '#a0aec0' }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1a202c', letterSpacing: -0.3 }}>Class of Recommendation & Level of Evidence</div>
        <div style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>How to interpret COR and LOE in AHA/ASA guidelines</div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Class of Recommendation</div>
        {Object.entries(KB.cor_definitions).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #edf2f7' }}>
            <CorBadge cor={k} />
            <span style={{ fontSize: 13, color: '#2d3748' }}>{v.meaning}</span>
          </div>
        ))}
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#4a5568', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 }}>Level of Evidence</div>
        {Object.entries(KB.loe_definitions).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid #edf2f7' }}>
            <LoeBadge loe={k} />
            <span style={{ fontSize: 13, color: '#2d3748', flex: 1 }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StrokeGuide() {
  const [view, setView] = useState('home');
  const [showAbout, setShowAbout] = useState(false);

  const renderView = () => {
    if (view === 'home') return <HomeView onNavigate={setView} />;
    if (view === 'ivt-checklist') return <IvtChecklist />;
    if (view === 'evt-tree') return <EvtDecisionTree />;
    if (view === 'nihss') return <NihssCalculator />;
    if (view === 'aspects') return <AspectsCalculator />;
    if (view === 'lkw-timer') return <LkwTimer />;
    if (view === 'search') return <SearchView />;
    if (view === 'legend') return <Legend />;
    if (view.startsWith('path-')) return <PathwayView pathwayId={view.slice(5)} />;
    return <HomeView onNavigate={setView} />;
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'ivt-checklist', label: 'IVT' },
    { id: 'evt-tree', label: 'EVT' },
    { id: 'nihss', label: 'NIHSS' },
    { id: 'aspects', label: 'ASPECTS' },
    { id: 'lkw-timer', label: 'LKW' },
    { id: 'search', label: 'Search' },
    { id: 'legend', label: 'COR / LOE' }
  ];

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      color: '#1a202c'
    }}>
      <style>{`* { box-sizing: border-box; }`}</style>

      <header style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div onClick={() => setView('home')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{
              width: 28, height: 28, borderRadius: 4,
              backgroundColor: '#0d3b66', color: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, letterSpacing: -0.3,
              fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace'
            }}>SG</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2 }}>StrokeGuide</div>
              <div style={{ fontSize: 10, color: '#718096', letterSpacing: 0.3, textTransform: 'uppercase' }}>AHA/ASA 2026</div>
            </div>
          </div>
          <button onClick={() => setShowAbout(true)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#4a5568', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12,
            fontFamily: 'inherit'
          }}>
            <Info size={14} /> About
          </button>
        </div>
        <nav style={{ maxWidth: 880, margin: '0 auto', padding: '0 16px', display: 'flex', gap: 2, borderTop: '1px solid #f1f5f9', overflowX: 'auto' }}>
          {navItems.map(it => {
            const active = view === it.id || (it.id === 'home' && view.startsWith('path-'));
            return (
              <button key={it.id} onClick={() => setView(it.id)} style={{
                padding: '10px 14px', fontSize: 12, fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer',
                color: active ? '#0d3b66' : '#718096',
                borderBottom: active ? '2px solid #0d3b66' : '2px solid transparent',
                marginBottom: -1, fontFamily: 'inherit', letterSpacing: 0.3,
                textTransform: 'uppercase', whiteSpace: 'nowrap'
              }}>{it.label}</button>
            );
          })}
        </nav>
      </header>

      <div style={{ backgroundColor: '#fffbeb', borderBottom: '1px solid #fcd34d' }}>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: '8px 24px', fontSize: 11, color: '#78350f', display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.4 }}>
          <AlertTriangle size={12} style={{ flexShrink: 0 }} />
          Decision support, not decision making. Treating clinician retains full responsibility.
        </div>
      </div>

      <main style={{ maxWidth: 880, margin: '0 auto', backgroundColor: '#ffffff', minHeight: 'calc(100vh - 110px)', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
        {renderView()}
      </main>

      {showAbout && (
        <div onClick={() => setShowAbout(false)} style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, zIndex: 100
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            backgroundColor: '#ffffff', borderRadius: 6, padding: 24, maxWidth: 480, width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>About StrokeGuide</div>
              <button onClick={() => setShowAbout(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096' }}><X size={18} /></button>
            </div>
            <div style={{ fontSize: 13, color: '#2d3748', lineHeight: 1.6, marginBottom: 12 }}>
              Source: <strong>{KB.metadata.source}</strong>, {KB.metadata.publisher} ({KB.metadata.year}).
            </div>
            <div style={{ fontSize: 12, color: '#4a5568', lineHeight: 1.6, fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace', marginBottom: 12 }}>
              DOI: {KB.metadata.doi}
            </div>
            <a
              href={KB.metadata.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 600, color: '#0d3b66',
                textDecoration: 'none', padding: '8px 12px',
                border: '1px solid #0d3b66', borderRadius: 3,
                marginBottom: 16
              }}
            >
              Read the full guideline on AHA Journals →
            </a>
            <div style={{ padding: 12, backgroundColor: '#fffbeb', borderLeft: '3px solid #fcd34d', borderRadius: 3, fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>
              {KB.metadata.disclaimer}
            </div>
            <div style={{ fontSize: 11, color: '#718096', lineHeight: 1.5, marginTop: 16 }}>
              This is a guideline reference and education tool. It does not provide individualized medical advice and should not be relied upon as the sole basis for clinical decisions.
            </div>
          </div>
        </div>
      )}

      <footer style={{ maxWidth: 880, margin: '0 auto', padding: '20px 24px 32px', fontSize: 11, color: '#a0aec0', textAlign: 'center' }}>
        <div>StrokeGuide · {KB.recommendations.length} indexed recommendations · v0.3</div>
        <div style={{ marginTop: 6 }}>
          Source:{' '}
          <a
            href={KB.metadata.source_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0d3b66', textDecoration: 'none', fontWeight: 600 }}
          >
            Prabhakaran et al., 2026 AHA/ASA AIS Guideline
          </a>
        </div>
      </footer>
    </div>
  );
}
