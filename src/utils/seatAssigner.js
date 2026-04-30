function getColumnLabel(index) {
  return String.fromCharCode(65 + index);
}

export function assignSeats(studentIds, { columns, rows }) {
  const safeColumns = Math.max(1, Math.min(26, Number(columns) || 1));
  const safeRows = Math.max(1, Math.min(20, Number(rows) || 1));
  const totalCapacity = safeColumns * safeRows * 2;
  const mainIds = studentIds.slice(0, totalCapacity);
  const overflowIds = studentIds.slice(totalCapacity);

  const mainGrid = Array.from({ length: safeRows }, (_, rowIndex) =>
    Array.from({ length: safeColumns }, (_, columnIndex) => {
      const seatBaseIndex = (columnIndex * safeRows + rowIndex) * 2;

      return {
        label: `${getColumnLabel(columnIndex)}${rowIndex + 1}`,
        left: mainIds[seatBaseIndex] ?? "",
        right: mainIds[seatBaseIndex + 1] ?? "",
      };
    }),
  );

  const overflow = [];

  for (let index = 0; index < overflowIds.length; index += 2) {
    overflow.push({
      label: `Front ${overflow.length + 1}`,
      left: overflowIds[index] ?? "",
      right: overflowIds[index + 1] ?? "",
    });
  }

  return {
    mainGrid,
    overflow,
    totalCapacity,
    studentCount: studentIds.length,
    columns: safeColumns,
    rows: safeRows,
  };
}
