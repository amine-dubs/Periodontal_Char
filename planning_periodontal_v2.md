## MyPrescription — Periodontal Chart Module

**Stack:** Next.js (App Router), PostgreSQL (3 tables), Google Charts, odonto.js, Tailwind CSS

**Duration:** 4 weeks — **Team:** 3 developers (P1: backend, P2: frontend, P3: full stack/QA)

### Objective

Design and integrate a digital Periodontal Chart module to record, visualize and track periodontal data interactively.

### Week 1 — Backend & Data

- Database design and migration for three tables: `periodontal_charts`, `periodontal_teeth`, `periodontal_sites`.
- Key constraints and validation:
  - `PD` (Probing Depth): integer ≥ 0
  - `GM` (Gingival Margin): integer (can be negative)
  - `site_position`: integer in [1..6]
  - `tooth_number`: FDI notation (11–48)
- Relationships: 1 patient → N charts → N teeth → 6 sites
- Create SQL migration script (TODO: extract schema.sql)
- API routes (App Router):
  - `POST /api/perio-charts` — create an exam
  - `GET /api/perio-charts?patientId=` — list
  - `GET /api/perio-charts/[id]` — detail
  - `PUT /api/perio-charts/[id]` — update/finalize
- Batch save endpoint: `POST /api/tooth-sites/batch` (transactional, atomic)
- Calculate `CAL = PD - GM` dynamically (not stored)

### Week 2 — Frontend & Charts

- Integrate `odonto.js` and Google Charts (AreaChart overlay) into React components.
- Components: `Tooth.tsx`, `ToothChart.tsx`, `PerioInputGrid.tsx`.
- Real-time updates: each PD/GM input triggers redraw via `cargarXXa()` / `cargarXXb()` and updates CAL.
- Input grid: 6 sites per tooth (3 vestibular + 3 lingual). Fields: PD, GM, BOP (bool), PI (bool), Furcation (multi-state), Mobility (0–3).
- Auto-save with 2s debounce to batch endpoint; server-side validation required.
- Endpoints for statistics: Mean PD, Mean CAL, % BOP, % PI.

### Week 3 — History & Comparison

- Patient chart listing, detailed view (read-only if finalized), and comparison between two exams.
- Endpoint: `GET /api/perio-charts/compare?id1=&id2=` returning per-site deltas.

### Week 4 — Finalization, Print & Deploy

- Printable A4 view (980px) and `GET /api/perio-charts/[id]/print` including patient info, exam date/type, charts, tables, statistics.
- Tests: unit (CAL logic, validations), integration (batch transactions), E2E (practitioner workflow).
- Deploy to staging, run performance/load tests, prepare handover documentation.

### Technical Notes

- TypeScript interfaces should be defined for `PerioChart`, `Tooth`, `Site`.
- Indexes: `patient_id`, `doctor_id`, `created_at`.
- Document API with Swagger/OpenAPI.
- TODO: confirm required anatomical PNG assets; add placeholders if missing.


