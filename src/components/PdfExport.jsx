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
  const titleY = 16;
  const titleLineHeight = 7.2;
  const titleBottom = titleY + titleLines.length * titleLineHeight;
  const dateY = titleBottom + 6;
  const roomY = dateY + 6;

  doc.setTextColor(19, 25, 39);
  doc.setFont("times", "bold");
  doc.setFontSize(19);
  doc.text(titleLines, pageWidth / 2, titleY, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text(`Date: ${formatDate(config.date)}`, pageWidth / 2, dateY, {
    align: "center",
  });
  doc.text(`Room: ${config.roomNumber || "—"}`, pageWidth / 2, roomY, {
    align: "center",
  });

  doc.setDrawColor(214, 219, 226);
  doc.setLineWidth(0.2);
  doc.line(margin, roomY + 4, pageWidth - margin, roomY + 4);

  return roomY + 10;
}

function drawSeatBlock(doc, { x, y, width, label, rows }) {
  const headerHeight = 9;
  const rowHeight = 8.8;
  const halfWidth = width / 2;
  const height = headerHeight + rows.length * rowHeight;

  doc.setDrawColor(200, 205, 212);
  doc.setLineWidth(0.22);
  doc.setFillColor(248, 249, 251);
  doc.rect(x, y, width, height, "S");
  doc.setFillColor(244, 246, 249);
  doc.rect(x, y, width, headerHeight, "F");
  doc.line(x, y + headerHeight, x + width, y + headerHeight);
  doc.line(x + halfWidth, y, x + halfWidth, y + height);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.4);
  doc.setTextColor(24, 31, 45);
  doc.text(label, x + width / 2, y + 5.9, { align: "center" });

  rows.forEach((row, rowIndex) => {
    const rowTop = y + headerHeight + rowIndex * rowHeight;

    if (rowIndex > 0) {
      doc.line(x, rowTop, x + width, rowTop);
    }

    row.forEach((seat, seatIndex) => {
      const seatX = x + seatIndex * halfWidth;

      if (seatIndex === 1) {
        doc.line(seatX, rowTop, seatX, rowTop + rowHeight);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.4);
      doc.setTextColor(seat?.isPlaceholder ? 150 : 24, seat?.isPlaceholder ? 156 : 31, seat?.isPlaceholder ? 167 : 45);
      doc.text(seat?.value || "—", seatX + halfWidth / 2, rowTop + rowHeight / 2 + 2.6, {
        align: "center",
      });
    });
  });

  return height;
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
        unit: "mm",
        format: "a4",
      });

      const margin = 12;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = drawCenteredHeader(doc, config, pageWidth, margin);

      const blocksPerRow = 3;
      const blockGap = 5;
      const rowGap = 7;
      const blockRows = chunkRows(seatPlan.blocks, blocksPerRow);

      for (const blockRow of blockRows) {
        const rowBlockCount = blockRow.length;
        const blockWidth = (pageWidth - margin * 2 - blockGap * (rowBlockCount - 1)) / rowBlockCount;
        const blockHeight = 9 + seatPlan.rows * 8.8;

        if (currentY + blockHeight > pageHeight - margin) {
          doc.addPage();
          currentY = drawCenteredHeader(doc, config, pageWidth, margin);
        }

        blockRow.forEach((block, blockIndex) => {
          const x = margin + blockIndex * (blockWidth + blockGap);
          drawSeatBlock(doc, {
            x,
            y: currentY,
            width: blockWidth,
            label: block.label,
            rows: block.rows,
          });
        });

        currentY += blockHeight + rowGap;
      }

      if (seatPlan.extraRows.length > 0) {
        const extraHeight = 9 + seatPlan.extraRows.length * 8.8;

        if (currentY + extraHeight > pageHeight - margin) {
          doc.addPage();
          currentY = drawCenteredHeader(doc, config, pageWidth, margin);
        }

        drawSeatBlock(doc, {
          x: margin,
          y: currentY,
          width: pageWidth - margin * 2,
          label: "Extra Seats",
          rows: seatPlan.extraRows,
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
