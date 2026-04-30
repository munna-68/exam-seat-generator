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

function chunkRows(rows, size) {
  const chunks = [];

  for (let index = 0; index < rows.length; index += size) {
    chunks.push(rows.slice(index, index + size));
  }

  return chunks;
}

function drawCenteredHeader(doc, config, pageWidth, margin) {
  const titleLines = doc.splitTextToSize(
    config.examTitle || "Exam Seat Plan",
    pageWidth - margin * 2,
  );
  const titleY = margin + 11;
  const titleLineHeight = 22;
  const titleBottom = titleY + titleLines.length * titleLineHeight;
  const dateY = titleBottom + 12;
  const roomY = dateY + 14;
  const ruleY = roomY + 11;

  doc.setTextColor(17, 24, 39);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text(titleLines, pageWidth / 2, titleY, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
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

  return ruleY + 18;
}

function drawPairTable(
  doc,
  { x, y, width, headers, rows, showHeaderLabels = true },
) {
  const headerHeight = 26;
  const rowHeight = 26;
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
        doc.text(String(header), cellX + columnWidth / 2, y + 17, {
          align: "center",
        });
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
      doc.setFontSize(10);
      doc.setTextColor(
        seat?.value ? bodyColor[0] : emptyColor[0],
        seat?.value ? bodyColor[1] : emptyColor[1],
        seat?.value ? bodyColor[2] : emptyColor[2],
      );
      doc.text(seat?.value || "—", cellX + columnWidth / 2, rowY + 16.5, {
        align: "center",
      });
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
      let currentY = drawCenteredHeader(doc, config, pageWidth, margin);

      const blocksPerRow = 3;
      const blockGap = 10;
      const rowGap = 10;
      const blockRows = chunkRows(seatPlan.blocks, blocksPerRow);

      for (const blockRow of blockRows) {
        const rowBlockCount = blockRow.length;
        const blockWidth =
          (pageWidth - margin * 2 - blockGap * (rowBlockCount - 1)) /
          rowBlockCount;
        const blockHeight = 26 + seatPlan.rows * 26;

        if (currentY + blockHeight > pageHeight - margin) {
          doc.addPage();
          currentY = drawCenteredHeader(doc, config, pageWidth, margin);
        }

        blockRow.forEach((block, blockIndex) => {
          const x = margin + blockIndex * (blockWidth + blockGap);
          drawPairTable(doc, {
            x,
            y: currentY,
            width: blockWidth,
            headers: block.columns,
            rows: block.rows,
            showHeaderLabels: true,
          });
        });

        currentY += blockHeight + rowGap;
      }

      if (seatPlan.extraRows.length > 0) {
        const extraLabelGap = 14;
        const extraLabelHeight = 14;
        const extraTableHeight = 26 + seatPlan.extraRows.length * 26;
        const extraTotalHeight =
          extraLabelHeight + extraLabelGap + extraTableHeight;

        if (currentY + extraTotalHeight > pageHeight - margin) {
          doc.addPage();
          currentY = drawCenteredHeader(doc, config, pageWidth, margin);
        }

        drawSectionLabel(
          doc,
          "Extra Seats",
          margin,
          currentY + 11,
          pageWidth - margin * 2,
        );

        drawPairTable(doc, {
          x: margin,
          y: currentY + extraLabelHeight + extraLabelGap,
          width: pageWidth - margin * 2,
          headers: ["1", "2"],
          rows: seatPlan.extraRows,
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
