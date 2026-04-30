function SeatCell({ seat, onSeatSwap }) {
  if (seat.isPlaceholder) {
    return (
      <div className="flex min-h-[3.25rem] items-center justify-center px-3 py-3 text-sm text-muted">
        —
      </div>
    );
  }

  const handleDragStart = (event) => {
    event.dataTransfer.setData("text/plain", seat.key);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const sourceKey = event.dataTransfer.getData("text/plain");

    if (sourceKey && sourceKey !== seat.key) {
      onSeatSwap(sourceKey, seat.key);
    }
  };

  return (
    <div
      className="flex min-h-[3.25rem] items-center justify-center px-3 py-3 text-center"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      {seat.value ? (
        <div
          draggable
          onDragStart={handleDragStart}
          className="inline-flex max-w-full cursor-grab items-center justify-center rounded-full border border-line/70 bg-white px-3 py-1.5 font-mono text-[13px] tracking-[0.16em] text-ink shadow-sm transition active:cursor-grabbing"
          title={seat.key}
        >
          <span className="truncate">{seat.value}</span>
        </div>
      ) : (
        <span className="font-mono text-sm tracking-[0.16em] text-muted">
          —
        </span>
      )}
    </div>
  );
}

export default function SeatingGrid({ seatPlan, onSeatSwap }) {
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
          <h3 className="mt-1 text-lg font-semibold text-ink">Table blocks</h3>
        </div>

        <div className="rounded-full border border-line/70 bg-paper/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
          {seatPlan.blocks.length} block
          {seatPlan.blocks.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="overflow-x-auto px-4 pb-4">
        <div className="flex min-w-max gap-4">
          {seatPlan.blocks.map((block) => (
            <section
              key={block.key}
              className="min-w-[18rem] flex-1 rounded-[1.5rem] border border-line/70 bg-paper/50 p-3 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h4 className="text-sm font-semibold tracking-[0.18em] text-ink">
                  {block.label}
                </h4>
              </div>

              <div className="space-y-2">
                {block.rows.map((row, rowIndex) => (
                  <div
                    key={`${block.key}-${rowIndex}`}
                    className="grid grid-cols-2 overflow-hidden rounded-2xl border border-line/70 bg-white/90"
                  >
                    {row.map((seat) => (
                      <SeatCell
                        key={seat.key}
                        seat={seat}
                        onSeatSwap={onSeatSwap}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
