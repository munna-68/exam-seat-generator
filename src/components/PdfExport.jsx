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
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const margin = 12;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const titleLines = doc.splitTextToSize(
        config.examTitle || "Exam Seat Plan",
        pageWidth - margin * 2,
      );
      const titleY = 18;
      const titleLineHeight = 8;
      const subtitleY = titleY + titleLines.length * titleLineHeight + 2;
      const detailY = subtitleY + 6;

      doc.setTextColor(18, 24, 38);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text(titleLines, margin, titleY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(
        `${formatDate(config.date)} | Room: ${config.roomNumber || "—"}`,
        margin,
        subtitleY,
      );

      doc.setFontSize(9);
      doc.setTextColor(91, 103, 118);
      doc.text(
        `Batch: ${config.batch} | Students: ${seatPlan.studentCount} | Capacity: ${seatPlan.totalCapacity}`,
        margin,
        detailY,
      );

      const header = [
        "Row",
        ...Array.from({ length: seatPlan.columns }, (_, index) =>
          String.fromCharCode(65 + index),
        ),
      ];
      const availableWidth = pageWidth - margin * 2 - 16;
      const columnWidth = availableWidth / seatPlan.columns;

      const body = seatPlan.mainGrid.map((row, rowIndex) => [
        String(rowIndex + 1),
        ...row.map(
          (bench) =>
            `${bench.label}\nLeft: ${bench.left || "—"}\nRight: ${bench.right || "—"}`,
        ),
      ]);

      const columnStyles = {
        0: { cellWidth: 14, halign: "center", fontStyle: "bold" },
      };

      for (let index = 0; index < seatPlan.columns; index += 1) {
        columnStyles[index + 1] = { cellWidth: columnWidth };
      }

      autoTable(doc, {
        startY: detailY + 6,
        head: [header],
        body,
        theme: "grid",
        margin: { left: margin, right: margin },
        styles: {
          font: "helvetica",
          fontSize: seatPlan.columns > 8 ? 5.5 : 6.5,
          cellPadding: 1.8,
          valign: "middle",
          overflow: "linebreak",
          textColor: [18, 24, 38],
          lineColor: [214, 219, 226],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [18, 24, 38],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
        },
        columnStyles,
      });

      let nextY = doc.lastAutoTable.finalY + 8;

      if (seatPlan.overflow.length > 0) {
        if (nextY > pageHeight - 40) {
          doc.addPage();
          nextY = 16;
        }

        doc.setTextColor(18, 24, 38);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text("Front Table", margin, nextY);
        nextY += 4;

        autoTable(doc, {
          startY: nextY,
          head: [["Bench", "Left", "Right"]],
          body: seatPlan.overflow.map((bench) => [
            bench.label,
            bench.left || "—",
            bench.right || "—",
          ]),
          theme: "grid",
          margin: { left: margin, right: margin },
          styles: {
            font: "helvetica",
            fontSize: 7,
            cellPadding: 1.8,
            valign: "middle",
            textColor: [18, 24, 38],
            lineColor: [214, 219, 226],
            lineWidth: 0.2,
          },
          headStyles: {
            fillColor: [15, 118, 110],
            textColor: 255,
            fontStyle: "bold",
          },
          columnStyles: {
            0: { cellWidth: 28, fontStyle: "bold" },
            1: { cellWidth: (pageWidth - margin * 2 - 28) / 2 },
            2: { cellWidth: (pageWidth - margin * 2 - 28) / 2 },
          },
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
