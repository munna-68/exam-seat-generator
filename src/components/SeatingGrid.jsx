function SeatSlot({ side, value }) {
  return (
    <div className="rounded-xl border border-line/70 bg-paper/80 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">
        {side}
      </div>
      <div className="mt-1 font-mono text-sm leading-5 tracking-[0.12em] text-ink">
        {value || "—"}
      </div>
    </div>
  );
}

export default function SeatingGrid({ seatPlan }) {
  if (!seatPlan) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-line/80 bg-paper/55 px-6 py-8 text-sm leading-6 text-muted">
        Randomize seats to generate the live classroom preview.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-line/70 bg-white/80 shadow-panel">
      <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
        <div>
          <p className="field-label">Main classroom</p>
          <h3 className="mt-1 text-lg font-semibold text-ink">Seating grid</h3>
        </div>

        <div className="rounded-full border border-line/70 bg-paper/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
          {seatPlan.studentCount} students
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 top-0 z-20 border-b border-r border-line/70 bg-white/95 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.32em] text-muted">
                Row
              </th>
              {Array.from({ length: seatPlan.columns }, (_, index) => (
                <th
                  key={index}
                  className="sticky top-0 z-10 border-b border-line/70 bg-white/95 px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-[0.32em] text-muted"
                >
                  {String.fromCharCode(65 + index)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {seatPlan.mainGrid.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <th className="sticky left-0 z-10 border-b border-r border-line/70 bg-white/95 px-4 py-4 text-left text-sm font-semibold text-ink">
                  {String(rowIndex + 1).padStart(2, "0")}
                </th>

                {row.map((bench) => (
                  <td
                    key={bench.label}
                    className="border-b border-line/70 p-3 align-top"
                  >
                    <div className="min-w-[12rem] rounded-2xl border border-line/70 bg-paper/80 p-3 shadow-sm">
                      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
                        <span>{bench.label}</span>
                        <span>Row {rowIndex + 1}</span>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <SeatSlot side="Left" value={bench.left} />
                        <SeatSlot side="Right" value={bench.right} />
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
