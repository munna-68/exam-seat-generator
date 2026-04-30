import { MAX_STUDENTS } from "../utils/idGenerator";

export default function StudentIdList({
  batch,
  studentIds,
  onAddId,
  onChangeId,
  onRemoveId,
  validationMap,
  activeIndex,
}) {
  const validCount = studentIds.length - validationMap.filter(Boolean).length;

  return (
    <section className="card animate-fade-up p-6 lg:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="field-label">Student management</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            Student IDs
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Generated from the selected batch and editable row by row. Remove
            dropped students, replace any entry, or append another ID at the
            end.
          </p>
        </div>

        <div className="rounded-full border border-line/70 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted">
          {validCount}/{MAX_STUDENTS}
        </div>
      </div>

      <div className="mt-5 max-h-[32rem] overflow-y-auto pr-1">
        <div className="grid gap-3 sm:grid-cols-2">
        {studentIds.map((studentId, index) => {
          const validationMessage = validationMap[index];

          return (
            <div
              key={index}
              className={`rounded-2xl border p-4 shadow-sm transition ${
                validationMessage
                  ? "border-danger/40 bg-danger/5"
                  : "border-line/70 bg-white/85"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-paper">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="min-w-0 flex-1">
                  <label className="block">
                    <span className="sr-only">Student ID {index + 1}</span>
                    <input
                      className={`input mt-0 font-mono text-sm tracking-[0.18em] ${
                        validationMessage
                          ? "border-danger/50 focus:border-danger focus:ring-danger/10"
                          : ""
                      }`}
                      type="text"
                      inputMode="numeric"
                      maxLength={8}
                      value={studentId}
                      autoFocus={activeIndex === index}
                      onChange={(event) =>
                        onChangeId(index, event.target.value)
                      }
                    />
                  </label>

                  {validationMessage ? (
                    <p className="mt-2 text-xs font-medium text-danger">
                      {validationMessage}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-muted">
                      Batch {batch} format is valid.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line/70 text-lg font-semibold text-muted transition hover:border-danger/40 hover:text-danger focus:outline-none focus:ring-4 focus:ring-danger/10"
                  onClick={() => onRemoveId(index)}
                  aria-label={`Remove student ID ${index + 1}`}
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-5">
        <button
          type="button"
          className="button-secondary"
          onClick={onAddId}
          disabled={studentIds.length >= MAX_STUDENTS}
        >
          + Add ID
        </button>

        <p className="text-xs leading-5 text-muted">
          Keep the list clean before randomizing. IDs can be edited directly in
          place.
        </p>
      </div>
    </section>
  );
}
