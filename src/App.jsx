import { useEffect, useMemo, useState } from "react";
import ConfigForm from "./components/ConfigForm";
import StudentIdList from "./components/StudentIdList";
import SeatingGrid from "./components/SeatingGrid";
import OverflowTable from "./components/OverflowTable";
import PdfExport from "./components/PdfExport";
import { assignSeats, swapSeatAssignments } from "./utils/seatAssigner";
import {
  generateStudentIds,
  getBatchDigit,
  getNextAvailableStudentId,
  isValidStudentId,
  MAX_STUDENTS,
} from "./utils/idGenerator";
import { fisherYatesShuffle } from "./utils/shuffle";

const today = new Date();
const defaultDate = today.toISOString().slice(0, 10);

const defaultConfig = {
  examTitle: "BBA Honours 1st Year 1st Semester Final Examination 2026",
  date: defaultDate,
  roomNumber: "505",
  batch: "13th",
  studentCount: 65,
  columns: 6,
  rows: 8,
};

function clampNumber(value, min, max) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return min;
  }

  return Math.max(min, Math.min(max, numericValue));
}

function validateIds(studentIds, batch) {
  const errors = [];
  const seen = new Set();
  const batchDigit = getBatchDigit(batch);
  const expectedPrefix = `12${batchDigit}220`;

  studentIds.forEach((studentId) => {
    const value = studentId.trim();
    let message = "";

    if (!value) {
      message = "Missing student ID";
    } else if (!/^\d{8}$/.test(value)) {
      message = "Use exactly 8 digits";
    } else if (!value.startsWith(expectedPrefix)) {
      message = `Must start with ${expectedPrefix}`;
    } else if (seen.has(value)) {
      message = "Duplicate student ID";
    }

    if (!message && isValidStudentId(value, batch)) {
      seen.add(value);
    }

    errors.push(message);
  });

  return errors;
}

function formatSummaryDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function MetricCard({ label, value, detail, compact = false }) {
  return (
    <div
      className={`rounded-3xl border border-line/70 bg-white/85 shadow-sm ${
        compact ? "px-3 py-3" : "px-4 py-4"
      }`}
    >
      <p
        className={`font-semibold uppercase text-muted ${
          compact
            ? "text-[9px] tracking-[0.24em]"
            : "text-[10px] tracking-[0.3em]"
        }`}
      >
        {label}
      </p>
      <div
        className={`tracking-tight text-ink ${
          compact ? "mt-2 text-lg font-semibold" : "mt-3 text-2xl font-semibold"
        }`}
      >
        {value}
      </div>
      <p
        className={`text-muted ${
          compact ? "mt-1 text-[11px] leading-4" : "mt-2 text-xs leading-5"
        }`}
      >
        {detail}
      </p>
    </div>
  );
}

export default function App() {
  const [config, setConfig] = useState(defaultConfig);
  const [studentIds, setStudentIds] = useState(() =>
    generateStudentIds(defaultConfig.batch, defaultConfig.studentCount),
  );
  const [seatPlan, setSeatPlan] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    setStudentIds(generateStudentIds(config.batch, config.studentCount));
    setSeatPlan(null);
    setActiveIndex(null);
  }, [config.batch, config.studentCount]);

  useEffect(() => {
    setSeatPlan(null);
  }, [config.columns, config.rows]);

  const validationMap = useMemo(
    () => validateIds(studentIds, config.batch),
    [studentIds, config.batch],
  );
  const invalidCount = validationMap.filter(Boolean).length;
  const isReady = invalidCount === 0 && studentIds.length > 0;
  const capacity = config.columns * config.rows;
  const overflowSeats = Math.max(0, studentIds.length - capacity);

  const handleFieldChange = (field, value) => {
    setConfig((current) => ({
      ...current,
      [field]:
        field === "studentCount"
          ? clampNumber(value, 1, MAX_STUDENTS)
          : field === "columns"
            ? clampNumber(value, 1, 26)
            : field === "rows"
              ? clampNumber(value, 1, 20)
              : value,
    }));
  };

  const handleStudentIdChange = (index, value) => {
    setSeatPlan(null);
    setActiveIndex(null);
    setStudentIds((current) => {
      const next = [...current];
      next[index] = value.replace(/\D/g, "").slice(0, 8);
      return next;
    });
  };

  const handleStudentIdRemove = (index) => {
    setSeatPlan(null);
    setActiveIndex(null);
    setStudentIds((current) =>
      current.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const handleStudentIdAdd = () => {
    if (studentIds.length >= MAX_STUDENTS) {
      return;
    }

    const nextStudentId = getNextAvailableStudentId(config.batch, studentIds);

    if (!nextStudentId) {
      return;
    }

    setSeatPlan(null);
    setActiveIndex(studentIds.length);
    setStudentIds((current) => [...current, nextStudentId]);
  };

  const handleRandomize = () => {
    if (!isReady) {
      return;
    }

    const shuffledIds = fisherYatesShuffle(
      studentIds.map((studentId) => studentId.trim()),
    );
    const nextPlan = assignSeats(shuffledIds, {
      columns: config.columns,
      rows: config.rows,
    });

    setSeatPlan(nextPlan);
    setPreviewKey((current) => current + 1);
  };

  const handleSeatSwap = (sourceKey, targetKey) => {
    setSeatPlan((current) =>
      swapSeatAssignments(current, sourceKey, targetKey),
    );
  };

  const previewMessage = seatPlan
    ? `${seatPlan.studentCount} students placed across ${seatPlan.blocks.length} table blocks.`
    : "Randomize the list to generate a new seating arrangement.";

  return (
    <div className="w-full">
      <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <header className="animate-fade-up rounded-[2rem] border border-line/70 bg-panel/75 p-6 shadow-soft backdrop-blur-sm lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="rounded-full border border-line/70 bg-white/80 px-4 py-2 text-sm font-semibold tracking-[0.08em] text-ink">
              Management Information System, BRUR
            </div>
            <div className="rounded-full border border-line/70 bg-white/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
              Print-ready layout
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="font-serif text-4xl leading-tight tracking-tight text-ink sm:text-5xl">
                Exam Seat Plan Generator
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
                Configure the exam, generate batch-based student IDs, randomize
                a classroom layout, and export a clean A4 PDF that staff can
                print without further editing.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <MetricCard
                label="Exam date"
                value={formatSummaryDate(config.date)}
                detail={
                  config.roomNumber
                    ? `Room ${config.roomNumber}`
                    : "Room not set"
                }
              />
              <MetricCard
                label="Capacity"
                value={capacity}
                detail={`${config.columns} columns × ${config.rows} rows`}
                compact
              />
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
          <div className="space-y-6">
            <ConfigForm config={config} onFieldChange={handleFieldChange} />

            <StudentIdList
              batch={config.batch}
              studentIds={studentIds}
              onAddId={handleStudentIdAdd}
              onChangeId={handleStudentIdChange}
              onRemoveId={handleStudentIdRemove}
              validationMap={validationMap}
              activeIndex={activeIndex}
            />
          </div>

          <section className="card animate-fade-up p-6 lg:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="field-label">Preview and export</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                  Seating output
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  {previewMessage}
                </p>
              </div>

              <div
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] ${
                  isReady
                    ? "border-accent/20 bg-accentSoft text-accent"
                    : "border-danger/20 bg-danger/5 text-danger"
                }`}
              >
                {isReady
                  ? "Ready"
                  : `${invalidCount} issue${invalidCount === 1 ? "" : "s"}`}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="button-primary"
                onClick={handleRandomize}
                disabled={!isReady}
              >
                Randomize Seats
              </button>

              <PdfExport
                config={config}
                seatPlan={seatPlan}
                isDisabled={!seatPlan || !isReady}
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="Prepared IDs"
                value={studentIds.length}
                detail={`${invalidCount} need attention`}
              />
              <MetricCard
                label="Main seats"
                value={capacity}
                detail="Column pairs form the tables"
              />
              <MetricCard
                label="Overflow"
                value={overflowSeats}
                detail={
                  overflowSeats > 0
                    ? "Moves to the front table"
                    : "No overflow needed"
                }
              />
            </div>

            <div key={previewKey} className="mt-6 space-y-6 animate-fade-up">
              <SeatingGrid seatPlan={seatPlan} onSeatSwap={handleSeatSwap} />
              <OverflowTable
                extraRows={seatPlan?.extraRows ?? []}
                onSeatSwap={handleSeatSwap}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
