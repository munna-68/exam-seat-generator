function getColumnLabel(index) {
  return String.fromCharCode(65 + index);
}

function clampNumber(value, min, max) {
  const numericValue = Number(value);

  if (Number.isNaN(numericValue)) {
    return min;
  }

  return Math.max(min, Math.min(max, numericValue));
}

function locateSeat(plan, seatKey) {
  for (const block of plan.blocks) {
    for (const row of block.rows) {
      for (const seat of row) {
        if (seat.key === seatKey) {
          return seat;
        }
      }
    }
  }

  for (const row of plan.extraRows) {
    for (const seat of row) {
      if (seat.key === seatKey) {
        return seat;
      }
    }
  }

  return null;
}

function createSeat({ key, column, row, value, isPlaceholder = false }) {
  return {
    key,
    column,
    row,
    value,
    isPlaceholder,
  };
}

function createBlockLabel(leftColumn, rightColumn) {
  if (rightColumn === null) {
    return leftColumn;
  }

  return `${leftColumn} – ${rightColumn}`;
}

export function assignSeats(studentIds, { columns, rows }) {
  const safeColumns = clampNumber(columns, 1, 26);
  const safeRows = clampNumber(rows, 1, 20);
  const totalCapacity = safeColumns * safeRows;
  const mainIds = studentIds.slice(0, totalCapacity);
  const overflowIds = studentIds.slice(totalCapacity);

  const blocks = Array.from({ length: Math.ceil(safeColumns / 2) }, (_, blockIndex) => {
    const leftColumnIndex = blockIndex * 2;
    const rightColumnIndex = leftColumnIndex + 1;
    const leftColumn = getColumnLabel(leftColumnIndex);
    const rightColumn = rightColumnIndex < safeColumns ? getColumnLabel(rightColumnIndex) : null;

    return {
      key: `block-${blockIndex}`,
      label: createBlockLabel(leftColumn, rightColumn),
      columns: [leftColumn, rightColumn].filter(Boolean),
      rows: Array.from({ length: safeRows }, (_, rowIndex) => {
        const leftSeatIndex = leftColumnIndex * safeRows + rowIndex;
        const rightSeatIndex = rightColumnIndex * safeRows + rowIndex;

        return [
          createSeat({
            key: `${leftColumn}${rowIndex + 1}`,
            column: leftColumn,
            row: rowIndex + 1,
            value: mainIds[leftSeatIndex] ?? "",
          }),
          rightColumn
            ? createSeat({
                key: `${rightColumn}${rowIndex + 1}`,
                column: rightColumn,
                row: rowIndex + 1,
                value: mainIds[rightSeatIndex] ?? "",
              })
            : createSeat({
                key: `${leftColumn}${rowIndex + 1}-empty`,
                column: null,
                row: rowIndex + 1,
                value: "",
                isPlaceholder: true,
              }),
        ];
      }),
    };
  });

  const extraRows = [];

  for (let index = 0; index < overflowIds.length; index += 2) {
    const rowNumber = extraRows.length + 1;

    extraRows.push([
      createSeat({
        key: `extra-${rowNumber}-left`,
        column: null,
        row: rowNumber,
        value: overflowIds[index] ?? "",
      }),
      createSeat({
        key: `extra-${rowNumber}-right`,
        column: null,
        row: rowNumber,
        value: overflowIds[index + 1] ?? "",
      }),
    ]);
  }

  return {
    blocks,
    extraRows,
    totalCapacity,
    studentCount: studentIds.length,
    columns: safeColumns,
    rows: safeRows,
  };
}

export function swapSeatAssignments(plan, sourceKey, targetKey) {
  if (!plan || !sourceKey || !targetKey || sourceKey === targetKey) {
    return plan;
  }

  const sourceSeat = locateSeat(plan, sourceKey);
  const targetSeat = locateSeat(plan, targetKey);

  if (!sourceSeat || !targetSeat) {
    return plan;
  }

  return {
    ...plan,
    blocks: plan.blocks.map((block) => ({
      ...block,
      rows: block.rows.map((row) =>
        row.map((seat) => {
          if (seat.key === sourceKey) {
            return { ...seat, value: targetSeat.value };
          }

          if (seat.key === targetKey) {
            return { ...seat, value: sourceSeat.value };
          }

          return seat;
        }),
      ),
    })),
    extraRows: plan.extraRows.map((row) =>
      row.map((seat) => {
        if (seat.key === sourceKey) {
          return { ...seat, value: targetSeat.value };
        }

        if (seat.key === targetKey) {
          return { ...seat, value: sourceSeat.value };
        }

        return seat;
      }),
    ),
  };
}
