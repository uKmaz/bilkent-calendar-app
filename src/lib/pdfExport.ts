import jsPDF from "jspdf";
import { CalendarEvent } from "@/types/event";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth } from "date-fns";
import { timesNormal, timesBold } from "./fonts/times";

export function exportCalendarPdf(events: CalendarEvent[], currentMonth: Date) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = 297;
  const pageH = 210;
  const margin = 10;
  let yPos = margin;

  // Add Custom Fonts
  doc.addFileToVFS("times-normal.ttf", timesNormal);
  doc.addFont("times-normal.ttf", "times", "normal");

  doc.addFileToVFS("times-bold.ttf", timesBold);
  doc.addFont("times-bold.ttf", "times", "bold");

  // Default to times instead of helvetica
  doc.setFont("times");

  // Filter events for current month only and sort them
  const monthEvents = events
    .filter((e) => {
      const ed = new Date(e.date);
      return ed.getFullYear() === currentMonth.getFullYear() && ed.getMonth() === currentMonth.getMonth();
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));

  // --- Title & Header ---
  const drawHeader = () => {
    // Background fill for header row
    doc.setFillColor(180, 180, 180);
    doc.rect(margin, yPos, pageW - margin * 2, 10, "F");

    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    doc.rect(margin, yPos, pageW - margin * 2, 10, "S");

    doc.setFont("times", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);

    const headers = [
      { text: "Tarih ve Saat\nDate and Time", x: margin + 2, w: 25 },
      { text: "Kulüp / Topluluk\nClub / Society", x: margin + 28, w: 60 },
      { text: "Etkinlik\nActivity", x: margin + 89, w: 40 },
      { text: "Dil\nLng", x: margin + 130, w: 10 },
      { text: "GE\n250/251", x: margin + 141, w: 14 },
      { text: "F2F\n/\nOnL", x: margin + 156, w: 10 },
      { text: "Etkinlikle İlgili Bilgiler\nDetails about the Activity", x: margin + 167, w: 110 }
    ];

    headers.forEach(h => {
      doc.text(h.text, h.x, yPos + 4);
    });

    // Draw column separators for header
    doc.line(margin + 26, yPos, margin + 26, yPos + 10);
    doc.line(margin + 88, yPos, margin + 88, yPos + 10);
    doc.line(margin + 129, yPos, margin + 129, yPos + 10);
    doc.line(margin + 139, yPos, margin + 139, yPos + 10);
    doc.line(margin + 155, yPos, margin + 155, yPos + 10);
    doc.line(margin + 165, yPos, margin + 165, yPos + 10);

    yPos += 10;
  };

  const drawMonthTitle = () => {
    doc.setFontSize(22);
    doc.setFont("times", "bold");
    doc.setTextColor(0, 0, 0);
    const monthEn = format(currentMonth, "MMMM").toUpperCase();
    const monthTrMapping: Record<string, string> = {
      JANUARY: "OCAK", FEBRUARY: "ŞUBAT", MARCH: "MART", APRIL: "NİSAN",
      MAY: "MAYIS", JUNE: "HAZİRAN", JULY: "TEMMUZ", AUGUST: "AĞUSTOS",
      SEPTEMBER: "EYLÜL", OCTOBER: "EKİM", NOVEMBER: "KASIM", DECEMBER: "ARALIK"
    };
    const monthTr = monthTrMapping[monthEn] || monthEn;
    const year = format(currentMonth, "yyyy");

    doc.text(`${monthEn}/${monthTr} ${year}`, margin, yPos + 6);
    yPos += 10;
  };

  // Initial Setup
  drawMonthTitle();
  drawHeader();

  // --- Draw Events ---
  doc.setFontSize(8);

  const getFormatShort = (f: string) => {
    if (f.includes("Face to Face") || f.includes("Yüz Yüze")) return "F2F";
    if (f.includes("Online") || f.includes("Çevrimiçi")) return "OnL";
    if (f.includes("Hybrid") || f.includes("Hibrit")) return "Hyb";
    return "";
  };

  const getLanguageShort = (l: string) => {
    if (l.includes("Turkish and English")) return "TR/EN";
    if (l.includes("English") && !l.includes("Turkish")) return "EN";
    if (l.includes("Turkish") && !l.includes("English")) return "TR";
    return "";
  };

  monthEvents.forEach((ev, idx) => {
    const isEven = idx % 2 === 0;

    // Prepare data
    const dateObj = new Date(ev.date);
    const dateStr = format(dateObj, "dd.MM.yyyy");
    const dayEn = format(dateObj, "E");
    const dayTrMapping: Record<string, string> = {
      "Mon": "Pt", "Tue": "Sa", "Wed": "Ça", "Thu": "Pe", "Fri": "Cu", "Sat": "Ct", "Sun": "Pz"
    };
    const dayTr = dayTrMapping[dayEn] || dayEn;

    const col1 = `${dateStr} ${dayEn.slice(0, 2)}\n${ev.startTime} - ${ev.endTime}`;
    const col2 = `${ev.club.en} /\n${ev.club.tr}`;
    const col3 = `${ev.eventType.en} /\n${ev.eventType.tr}`;
    const col4 = getLanguageShort(ev.language);
    const col5 = ev.gePoints && ev.gePoints !== "0" ? ev.gePoints : "";
    const col6 = getFormatShort(ev.format.en);

    const venueTr = ev.venue.tr === "Diğer" && ev.customVenue ? ev.customVenue.tr : ev.venue.tr;
    // Combine title, venue, and openTo for Details column
    const col7 = `${ev.title.tr} [${ev.title.en}]\n${venueTr}\nOpen to: ${ev.openTo}`;

    // Calculate row height
    doc.setFont("times", "normal");
    const lines1 = doc.splitTextToSize(col1, 24);
    const lines2 = doc.splitTextToSize(col2, 60);
    const lines3 = doc.splitTextToSize(col3, 39);
    const lines7 = doc.splitTextToSize(col7, 108);

    const maxLines = Math.max(lines1.length, lines2.length, lines3.length, lines7.length);
    const rowH = Math.max(8, maxLines * 4 + 2);

    // Check pagination
    if (yPos + rowH > pageH - margin) {
      doc.addPage("a4", "landscape");
      yPos = margin;
      drawMonthTitle();
      drawHeader();
    }

    // Row Background
    if (isEven) {
      doc.setFillColor(245, 245, 245);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(margin, yPos, pageW - margin * 2, rowH, "F");

    // Row borders
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.1);
    doc.rect(margin, yPos, pageW - margin * 2, rowH, "S");

    // Draw inner vertical lines
    doc.line(margin + 26, yPos, margin + 26, yPos + rowH);
    doc.line(margin + 88, yPos, margin + 88, yPos + rowH);
    doc.line(margin + 129, yPos, margin + 129, yPos + rowH);
    doc.line(margin + 139, yPos, margin + 139, yPos + rowH);
    doc.line(margin + 155, yPos, margin + 155, yPos + rowH);
    doc.line(margin + 165, yPos, margin + 165, yPos + rowH);

    // Write text
    doc.setTextColor(30, 30, 30);

    // Col 1: Date/Time (Bold)
    doc.setFont("helvetica", "bold");
    doc.text(lines1, margin + 2, yPos + 4);

    // Col 2: Club
    doc.setFont("times", "normal");
    doc.text(lines2, margin + 28, yPos + 4);

    // Col 3: Activity
    doc.text(lines3, margin + 89, yPos + 4);

    // Col 4: Lng (Bold, Centered)
    doc.setFont("helvetica", "bold");
    doc.text(col4, margin + 134, yPos + 4 + (rowH - 8) / 2, { align: "center" });

    // Col 5: GE
    doc.setFont("times", "normal");
    doc.text(col5, margin + 147, yPos + 4 + (rowH - 8) / 2, { align: "center" });

    // Col 6: Format
    doc.text(col6, margin + 160, yPos + 4 + (rowH - 8) / 2, { align: "center" });

    // Col 7: Details (Title bold, rest normal)
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(`${ev.title.tr} [${ev.title.en}]`, 108);
    doc.text(titleLines, margin + 167, yPos + 4);

    doc.setFont("times", "normal");
    const venueOpenLines = doc.splitTextToSize(`${venueTr}\nOpen to: ${ev.openTo}`, 108);
    doc.text(venueOpenLines, margin + 167, yPos + 4 + (titleLines.length * 4));

    yPos += rowH;
  });

  if (monthEvents.length === 0) {
    doc.setFont("times", "italic");
    doc.text("Bu ay için etkinlik bulunamadı. / No events found for this month.", margin + 5, yPos + 10);
  }

  doc.save(`Bilkent_Etkinlik_Takvimi_${format(currentMonth, "yyyy_MM")}.pdf`);
}
