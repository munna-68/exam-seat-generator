import { useEffect, useRef, useState } from "react";
import { MAX_STUDENTS } from "../utils/idGenerator";

export default function StudentIdList({
  batch,
  studentIds,
  onAddMultipleIds,
  onAddId,
  onChangeId,
  onRemoveId,
  validationMap,
  activeIndex,
}) {
  const validCount = studentIds.length - validationMap.filter(Boolean).length;
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkStatus, setBulkStatus] = useState("idle");
  const textareaRef = useRef(null);
  const closeTimerRef = useRef(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const closeBulkPanel = () => {
    clearCloseTimer();
    setIsBulkOpen(false);
    setBulkInput("");
    setBulkMessage("");
    setBulkStatus("idle");
  };

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    if (isBulkOpen) {
      textareaRef.current?.focus();
    }
  }, [isBulkOpen]);

  useEffect(() => {
    if (isBulkOpen && studentIds.length >= MAX_STUDENTS) {
      closeBulkPanel();
    }
  }, [isBulkOpen, studentIds.length]);

  const handleBulkToggle = () => {
    if (isBulkOpen) {
      closeBulkPanel();
      return;
    }

    clearCloseTimer();
    setIsBulkOpen(true);
    setBulkMessage("");
    setBulkStatus("idle");
  };

  const handleBulkCancel = () => {
    closeBulkPanel();
  };

  const handleBulkAdd = () => {
    const tokens = bulkInput
      .split(/[\s,]+/)
      .map((token) => token.trim())
      .filter(Boolean);
    const seen = new Set(studentIds.map((studentId) => studentId.trim()));
    const validIds = [];
    let duplicateCount = 0;

    tokens.forEach((token) => {
      if (!/^\d{8}$/.test(token)) {
        return;
      }

      if (seen.has(token)) {
        duplicateCount += 1;
        return;
      }

      seen.add(token);
      validIds.push(token);
    });

    if (validIds.length === 0) {
      clearCloseTimer();
      setBulkStatus("error");
      setBulkMessage("No valid IDs found. Check the format and try again.");
      return;
    }

    onAddMultipleIds(validIds);
    setBulkStatus("success");
    setBulkMessage(
      `${validIds.length} IDs added. ${duplicateCount} duplicates skipped.`,
    );
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      closeBulkPanel();
    }, 1500);
  };

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

      <div className="relative mt-5 h-[32rem]">
        <div className="absolute inset-0 overflow-y-auto overscroll-contain pr-1">
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
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="button-secondary"
            onClick={onAddId}
            disabled={studentIds.length >= MAX_STUDENTS}
          >
            + Add ID
          </button>

          <button
            type="button"
            className="button-secondary"
            onClick={handleBulkToggle}
            disabled={studentIds.length >= MAX_STUDENTS}
          >
            + Add Multiple IDs
          </button>
        </div>

        <p className="text-xs leading-5 text-muted">
          Keep the list clean before randomizing. IDs can be edited directly in
          place.
        </p>
      </div>

      <div
        className={`overflow-hidden transition-[max-height,opacity,transform,margin-top] duration-300 ease-out ${
          isBulkOpen
            ? "mt-4 max-h-[20rem] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="rounded-2xl border border-line/70 bg-white/90 p-4 shadow-sm">
          <textarea
            ref={textareaRef}
            className="input mt-0 min-h-[7rem] resize-y font-mono text-sm tracking-[0.08em]"
            placeholder={`Paste or type multiple IDs — separate by comma, space, or new line.
Example: 12022001, 12022002 12022003
         12022004`}
            value={bulkInput}
            onChange={(event) => setBulkInput(event.target.value)}
          />

          {bulkMessage ? (
            <p
              className={`mt-3 text-sm font-medium ${
                bulkStatus === "success" ? "text-[#16A34A]" : "text-[#D97706]"
              }`}
            >
              {bulkMessage}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="button-primary"
              onClick={handleBulkAdd}
            >
              Add IDs
            </button>

            <button
              type="button"
              className="text-sm font-medium text-muted transition hover:text-ink focus:outline-none focus:ring-4 focus:ring-accent/10"
              onClick={handleBulkCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
