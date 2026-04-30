export default function OverflowTable({ overflow }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-line/70 bg-white/80 shadow-panel">
      <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
        <div>
          <p className="field-label">Overflow</p>
          <h3 className="mt-1 text-lg font-semibold text-ink">Front table</h3>
        </div>

        <div className="rounded-full border border-line/70 bg-paper/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-muted">
          {overflow.length} bench{overflow.length === 1 ? "" : "es"}
        </div>
      </div>

      {overflow.length === 0 ? (
        <div className="px-5 py-6 text-sm leading-6 text-muted">
          No overflow table is needed. The main grid holds every student.
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="border-b border-r border-line/70 bg-white/95 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.32em] text-muted">
                  Bench
                </th>
                <th className="border-b border-r border-line/70 bg-white/95 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.32em] text-muted">
                  Left
                </th>
                <th className="border-b border-line/70 bg-white/95 px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.32em] text-muted">
                  Right
                </th>
              </tr>
            </thead>

            <tbody>
              {overflow.map((bench) => (
                <tr key={bench.label}>
                  <td className="border-b border-r border-line/70 px-4 py-4 text-sm font-semibold text-ink">
                    {bench.label}
                  </td>
                  <td className="border-b border-r border-line/70 px-4 py-4 font-mono text-sm tracking-[0.12em] text-ink">
                    {bench.left || "—"}
                  </td>
                  <td className="border-b border-line/70 px-4 py-4 font-mono text-sm tracking-[0.12em] text-ink">
                    {bench.right || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
