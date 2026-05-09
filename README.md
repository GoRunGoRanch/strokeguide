# StrokeGuide — AHA/ASA 2026 Acute Ischemic Stroke Reference

A clinical reference tool for neurologists, ED physicians, and stroke teams. Surfaces the 2026 AHA/ASA acute ischemic stroke guideline recommendations in a structured, navigable format with explicit Class of Recommendation (COR) and Level of Evidence (LOE) markers, plus integrated bedside calculators.

> **Decision support, not decision making.** This tool is a guideline reference and education aid. It does not provide individualized medical advice and should not be relied upon as the sole basis for clinical decisions. The treating clinician retains full responsibility.

---

## What's in v0.3

### Reference content (source-verified)
- **64 indexed recommendations**, all extracted directly from the published 2026 AHA/ASA guideline
- **7 clinical pathways**: ED Arrival, Imaging, IVT Eligibility, Thrombectomy, Blood Pressure, Supportive Care, **Pediatric Stroke**
- **Search** across all recommendations
- **COR / LOE legend** so users understand the strength of each recommendation
- **Persistent disclaimer banner** on every screen

Highlighted additions in this version:
- General IVT decision-making principles (§4.6.1) — disabling-deficit framework, glucose check, antiplatelet considerations
- Posterior circulation EVT (§4.7.3) — basilar artery occlusion within 24h
- M2 EVT recommendations (§4.7.2 #7–8) — dominant M2 reasonable; nondominant/distal/ACA/PCA NOT recommended (Class 3 No Benefit)
- EVT concomitant with IVT (§4.7.1) — don't skip IVT, don't observe before EVT
- Glucose targets (§4.5) — treat hypoglycemia <60, target 140–180 for hyperglycemia
- Antiplatelet corrections — DAPT for NIHSS ≤3 (corrected from earlier ≤5), aspirin within 48h
- BP comorbid-condition triggers (§4.3 #2)
- Telemedicine triad — prehospital, teleradiology, telestroke

### Pediatric stroke pathway (verified against §3.2, §4.6.1, §4.7.5)
- Emergent MRI/MRA (or CT/CTA backup) in suspected pediatric AIS
- IV alteplase 0.9 mg/kg may be considered in pediatric 28d–18y within 4.5h with disabling deficits (COR 2b, C-LD)
- EVT for pediatric ≥6y with anterior circulation LVO within 6h (COR 2a, B-NR)
- EVT for pediatric ≥6y with LVO 6–24h with salvageable tissue (COR 2a, B-NR)
- EVT for pediatric 28d–6y with LVO within 24h may be reasonable (COR 2b, B-NR)

### Decision tools
- **IVT Eligibility Checklist** — structured criteria with disabling-deficit framework
- **EVT Decision Tree** — walks through anterior circulation LVO criteria for thrombectomy

### Clinical calculators
- **NIHSS Calculator** — full 15-item National Institutes of Health Stroke Scale with severity classification and EVT-threshold flagging
- **ASPECTS Calculator** — 10-region MCA territory scoring with EVT-window classification
- **Time-since-LKW Timer** — local-timezone elapsed time calculator with auto-routing into IVT/EVT time windows; supports wake-up/unknown-onset stroke

---

## Project structure

```
strokeguide/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── main.jsx                          # React entry point
    ├── App.jsx                           # Mounts <StrokeGuide />
    ├── StrokeGuide.jsx                   # Main app component
    ├── recommendations.json              # Knowledge base (data layer, source-verified)
    └── calculators/
        ├── NihssCalculator.jsx
        ├── AspectsCalculator.jsx
        └── LkwTimer.jsx
```

The knowledge base is loaded from `recommendations.json` — edit that file to add or modify recommendations without touching component code.

---

## Run it

```bash
# In the strokeguide/ directory:
npm install
npm run dev
```

Then open the local URL Vite prints (typically http://localhost:5173).

Build for production:
```bash
npm run build
npm run preview
```

---

## What's NOT in here yet

The 2026 guideline is 119 pages. The current knowledge base focuses on hyperacute decision-making (imaging, IVT, EVT, BP, glucose, antiplatelet/anticoag, telemedicine, MSU, pediatric). Sections still to be added:
- **§4.7.4 Endovascular techniques** — stent retriever vs aspiration, anesthesia, balloon-guided catheters, tirofiban
- **§4.6.4 Other IV fibrinolytics & sonothrombolysis** — reteplase, prourokinase
- **§5.x Brain swelling & dysphagia & DVT prophylaxis** — sections 5.1–5.6 supportive care
- **§6.x Brain swelling, surgical decompression, seizures** — sections 6.1–6.5
- **§2.x EMS, hospital capabilities, organization** — most of section 2 system-level recommendations

---

## Roadmap

### Calculators / tools to add
- **PedNIHSS** for pediatric severity assessment
- **mRS calculator** with pre-stroke and post-stroke modes
- **PC-ASPECTS** for posterior circulation (separate from MCA ASPECTS)
- **Door-to-needle / door-to-puncture stopwatch** for quality reporting

### Productization (planned for later)
- Backend with user auth
- Print/PDF export for chart documentation
- Hospital-specific configuration (local protocols, CSC vs PSC capabilities)
- Versioned guideline tracking

---

## Regulatory framing

A pure **reference / education tool** that surfaces existing published guidelines with proper citation and a clear "decision support not decision making" framing is generally treated as low-risk software. Lines this tool does not cross:

- Does not generate novel recommendations the AHA didn't write
- Does not tell the clinician what to do — surfaces what the guideline says and lets them decide
- Does not process patient data on a server (client-side only)
- Does not claim diagnostic accuracy or efficacy

The four FDA "non-device CDS" criteria (21st Century Cures Act): not for image/signal/pattern processing; intended to display/analyze/print medical info; intended to support — not replace — clinician judgment; the clinician can independently review the basis for the recommendations.

---

## License & attribution

Recommendation text excerpted from:
**Prabhakaran S, Gonzalez NR, Zachrison KS, et al. 2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke: A Guideline From the American Heart Association/American Stroke Association. Stroke. 2026;57:e000–e000. doi:10.1161/STR.0000000000000513**

Application code (`StrokeGuide.jsx`, `recommendations.json` structure, calculators) — yours to use however you'd like.
