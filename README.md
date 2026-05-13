# Exam Seat Plan Generator

A single-page React application for my department to use its a problem that I saw needed solving
department offices can generate, manage, and export classroom seating plans.

**Live:** https://munna-68.github.io/exam-seat-generator

---

## Features

- **Exam Configuration** — Set exam title, date, room number, and batch.
- **Auto ID Generation** — Generates valid student IDs following institutional format (`12{batchDigit}220{NN}`) for batches 13th–17th.
- **ID Management** — Manual editing, removal, bulk-add with real-time validation (format, prefix, duplicates).
- **Fisher-Yates Shuffle** — Unbiased random permutation of student IDs before seat assignment.
- **Table Block Seating** — Columns grouped into pairs (physical desk pairing). Seat fills top-to-bottom, left-to-right within each block.
- **Drag & Drop** — Swap any two students by dragging and dropping, using the native HTML5 Drag and Drop API.
- **Overflow Handling** — Students exceeding grid capacity are placed in a separate extra seats table.
- **PDF Export** — Print-ready landscape A4 PDF via jsPDF with paired table blocks.

---

## Algorithms

### Fisher-Yates (Knuth) Shuffle

Located in `src/utils/shuffle.js`. Iterates the array from last to first, swapping each element with a random earlier element. Produces an unbiased uniform permutation in O(n) time.

### Seat Assignment

Located in `src/utils/seatAssigner.js`. Column pairs form "table blocks" (A+B, C+D, ...). Students fill the left column of every block top-to-bottom, then the right column, so adjacent seats A1/B1 are at the same physical table. Overflow spills into a separate 2-column layout.

### Student ID Generation

Located in `src/utils/idGenerator.js`. Batch digit mapping: 13th→0, 14th→1, …, 17th→4. IDs follow the pattern `12{batchDigit}220{NN}` with zero-padded sequence numbers (01–65).

---

## Tech Stack

| Layer        | Technology                                             |
| ------------ | ------------------------------------------------------ |
| Language     | JavaScript (JSX)                                       |
| UI Framework | React 18 (hooks: useState, useEffect, useMemo, useRef) |
| Build Tool   | Vite 8                                                 |
| Styling      | Tailwind CSS 3.4                                       |
| PDF          | jsPDF + jspdf-autotable                                |
| Deployment   | GitHub Pages via gh-pages                              |

---

## Project Structure

```
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   ├── ConfigForm.jsx        # Exam setup form
    │   ├── StudentIdList.jsx     # ID list editor + bulk-add
    │   ├── Preloader.jsx        # Animated splash screen
    │   ├── SeatingGrid.jsx      # Visual seating grid
    │   ├── OverflowTable.jsx    # Extra seats table
    │   └── PdfExport.jsx        # PDF generation trigger
    └── utils/
        ├── idGenerator.js       # ID generation & validation
        ├── shuffle.js           # Fisher-Yates shuffle
        └── seatAssigner.js      # Seat assignment & swapping
```

---

## Getting Started

```bash
npm install
npm run dev       # http://localhost:5173/exam-seat-generator/
npm run build     # production build → dist/
npm run preview   # preview production build
npm run deploy    # deploy to GitHub Pages
```

---

## Notes

- **No backend** — fully client-side, no API calls.
- **No TypeScript** — plain JavaScript with JSX.
- **No testing framework** — manual browser testing.
- **Max 65 students** (limited by 26 columns × 20 rows grid).
- **ID format:** 8-digit numeric, must start with `12{batchDigit}220`.

---

## Copyright

Copyright (c) 2026 Munna. All rights reserved.
