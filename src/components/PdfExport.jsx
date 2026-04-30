import { useState } from "react";

function formatDate(dateValue) {
  if (!dateValue) {
    return "Select a date";
  }

  const date = new Date(`${dateValue}T00:00:00`);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function slugify(value) {
  return (
    String(value || "exam-seat-plan")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 60) || "exam-seat-plan"
  );
}

function drawCenteredHeader(doc, config, pageWidth, margin) {
  const titleLines = doc.splitTextToSize(
    config.examTitle || "Exam Seat Plan",
    pageWidth - margin * 2,
  );
  const titleY = margin + 8;
  const titleLineHeight = 18;
  const titleBottom = titleY + titleLines.length * titleLineHeight;
  const dateY = titleBottom + 10;
  const roomY = dateY + 12;
  const ruleY = roomY + 10;

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(titleLines, pageWidth / 2, titleY, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Date: ${formatDate(config.date)}`, pageWidth / 2, dateY, {
    align: "center",
  });
  doc.text(`Room: ${config.roomNumber || "—"}`, pageWidth / 2, roomY, {
    align: "center",
  });

  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.6);
  doc.line(margin, ruleY, pageWidth - margin, ruleY);

  return ruleY + 14;
}

function drawPairTable(
  doc,
  {
    x,
    y,
    width,
    headers,
    rows,
    headerHeight = 18,
    rowHeight = 20,
    bodyFontSize = 8,
    showHeaderLabels = true,
  },
) {
  const normalizedHeaders = [headers?.[0] ?? "", headers?.[1] ?? ""];
  const columnWidth = width / 2;
  const blockHeight = headerHeight + rows.length * rowHeight;
  const borderColor = [226, 232, 240];
  const headerFill = [30, 41, 59];
  const oddFill = [255, 255, 255];
  const evenFill = [248, 250, 252];
  const bodyColor = [17, 24, 39];
  const emptyColor = [156, 163, 175];

  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);

  normalizedHeaders.forEach((header, headerIndex) => {
    const cellX = x + headerIndex * columnWidth;

    doc.setFillColor(...headerFill);
    doc.rect(cellX, y, columnWidth, headerHeight, "FD");

    if (showHeaderLabels) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      if (header) {
        doc.text(
          String(header),
          cellX + columnWidth / 2,
          y + headerHeight / 2 + 3.5,
          {
            align: "center",
          },
        );
      }
    }
  });

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const rowY = y + headerHeight + rowIndex * rowHeight;
    const fillColor = rowIndex % 2 === 0 ? oddFill : evenFill;

    row.forEach((seat, seatIndex) => {
      const cellX = x + seatIndex * columnWidth;

      doc.setFillColor(...fillColor);
      doc.rect(cellX, rowY, columnWidth, rowHeight, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(bodyFontSize);
      doc.setTextColor(
        seat?.value ? bodyColor[0] : emptyColor[0],
        seat?.value ? bodyColor[1] : emptyColor[1],
        seat?.value ? bodyColor[2] : emptyColor[2],
      );
      doc.text(
        seat?.value || "—",
        cellX + columnWidth / 2,
        rowY + rowHeight / 2 + 2.5,
        {
          align: "center",
        },
      );
    });
  }

  return blockHeight;
}

function drawSectionLabel(doc, text, x, y, width) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(17, 24, 39);
  doc.text(text, x + width / 2, y, { align: "center" });
}

export default function PdfExport({ config, seatPlan, isDisabled }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleDownload = async () => {
    if (!seatPlan) {
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");

    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });

      const margin = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const tableTop = drawCenteredHeader(doc, config, pageWidth, margin);
      const blockCount = Math.max(1, seatPlan.blocks.length);
      const blockGap = 4;
      const totalBlockGaps = blockGap * (blockCount - 1);
      const usableWidth = pageWidth - margin * 2 - totalBlockGaps;
      const blockWidth = usableWidth / blockCount;
      const hasExtraSeats = seatPlan.extraRows.length > 0;
      const mainHeaderHeight = 18;
      const mainToExtraGap = hasExtraSeats ? 10 : 0;
      const extraLabelHeight = hasExtraSeats ? 12 : 0;
      const extraLabelGap = hasExtraSeats ? 8 : 0;
      const extraHeaderHeight = hasExtraSeats ? 18 : 0;
      const extraRowsCount = seatPlan.extraRows.length;
      const rowCount = seatPlan.rows + extraRowsCount;
      const availableHeight =
        pageHeight -
        margin -
        tableTop -
        mainHeaderHeight -
        mainToExtraGap -
        extraLabelHeight -
        extraLabelGap -
        extraHeaderHeight;
      const preferredRowHeight = 20;
      const rowHeight = Math.min(
        preferredRowHeight,
        availableHeight / rowCount,
      );
      const bodyFontSize = rowHeight < 18 ? 7 : 8;
      const mainTableHeight = mainHeaderHeight + seatPlan.rows * rowHeight;

      seatPlan.blocks.forEach((block, blockIndex) => {
        const x = margin + blockIndex * (blockWidth + blockGap);

        drawPairTable(doc, {
          x,
          y: tableTop,
          width: blockWidth,
          headers: block.columns,
          rows: block.rows,
          headerHeight: mainHeaderHeight,
          rowHeight,
          bodyFontSize,
          showHeaderLabels: true,
        });
      });

      if (hasExtraSeats) {
        const extraTableTop =
          tableTop +
          mainTableHeight +
          mainToExtraGap +
          extraLabelHeight +
          extraLabelGap;

        drawSectionLabel(
          doc,
          "Extra Seats",
          margin,
          tableTop + mainTableHeight + mainToExtraGap + 12,
          pageWidth - margin * 2,
        );

        drawPairTable(doc, {
          x: margin,
          y: extraTableTop,
          width: pageWidth - margin * 2,
          headers: ["1", "2"],
          rows: seatPlan.extraRows,
          headerHeight: extraHeaderHeight,
          rowHeight,
          bodyFontSize,
          showHeaderLabels: true,
        });
      }

      doc.save(`${slugify(config.examTitle)}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF.", error);
      setErrorMessage("Unable to generate the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="button-secondary"
        onClick={handleDownload}
        disabled={isDisabled || isGenerating}
      >
        {isGenerating ? "Preparing PDF..." : "Download PDF"}
      </button>

      {errorMessage ? (
        <p className="mt-2 text-xs font-medium text-danger">{errorMessage}</p>
      ) : null}
    </div>
  );
}
