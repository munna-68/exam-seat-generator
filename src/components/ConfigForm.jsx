const batchOptions = ["13th", "14th", "15th", "16th", "17th"];

function clampNumber(value, min, max) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return min;
  }

  return Math.max(min, Math.min(max, numericValue));
}

export default function ConfigForm({ config, onFieldChange }) {
  return (
    <section className="card animate-fade-up p-6 lg:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="field-label">Exam setup</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Configuration
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Define the exam, room, and seating geometry before generating
            student IDs and the final seat plan.
          </p>
        </div>

        <div className="rounded-full border border-line/70 bg-accentSoft px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          12[B]220NN
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="field-label">Exam title</span>
          <input
            className="input"
            type="text"
            value={config.examTitle}
            onChange={(event) => onFieldChange("examTitle", event.target.value)}
            spellCheck="false"
          />
        </label>

        <label>
          <span className="field-label">Exam date</span>
          <input
            className="input"
            type="date"
            value={config.date}
            onChange={(event) => onFieldChange("date", event.target.value)}
          />
        </label>

        <label>
          <span className="field-label">Room number</span>
          <input
            className="input"
            type="text"
            value={config.roomNumber}
            onChange={(event) =>
              onFieldChange("roomNumber", event.target.value)
            }
            placeholder="505"
          />
        </label>

        <label>
          <span className="field-label">Batch</span>
          <select
            className="input"
            value={config.batch}
            onChange={(event) => onFieldChange("batch", event.target.value)}
          >
            {batchOptions.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-muted">
            Student IDs regenerate when batch changes.
          </p>
        </label>

        <label>
          <span className="field-label">Number of students</span>
          <input
            className="input"
            type="number"
            min="1"
            max="65"
            step="1"
            value={config.studentCount}
            onChange={(event) =>
              onFieldChange(
                "studentCount",
                clampNumber(event.target.value, 1, 65),
              )
            }
          />
        </label>

        <label>
          <span className="field-label">Number of columns</span>
          <input
            className="input"
            type="number"
            min="1"
            max="26"
            step="1"
            value={config.columns}
            onChange={(event) =>
              onFieldChange("columns", clampNumber(event.target.value, 1, 26))
            }
          />
          <p className="mt-2 text-xs text-muted">
            Columns are labeled A-Z from left to right.
          </p>
        </label>

        <label>
          <span className="field-label">Rows per column</span>
          <input
            className="input"
            type="number"
            min="1"
            max="20"
            step="1"
            value={config.rows}
            onChange={(event) =>
              onFieldChange("rows", clampNumber(event.target.value, 1, 20))
            }
          />
        </label>
      </div>
    </section>
  );
}
