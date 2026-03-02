import jsPDF from "jspdf";
import { CalendarEvent } from "@/types/event";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth } from "date-fns";

export function exportCalendarPdf(events: CalendarEvent[], currentMonth: Date) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = 297;
  const pageH = 210;
  const margin = 10;
  const cellW = (pageW - margin * 2) / 7;

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const monthTr = format(currentMonth, "MMMM yyyy");
  const monthEn = format(currentMonth, "MMMM yyyy");
  doc.text(`Etkinlik Takvimi / Activity Calendar - ${monthTr}`, margin, margin + 6);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Bilkent Universitesi Ogrenci Kulupleri ve Topluluklari / Bilkent University Student Clubs and Societies", margin, margin + 12);

  // Weekday headers
  const headerY = margin + 18;
  const weekdaysTr = ["Pzt", "Sal", "Car", "Per", "Cum", "Cmt", "Paz"];
  const weekdaysEn = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  doc.setFillColor(0, 82, 155); // Bilkent blue
  doc.rect(margin, headerY, pageW - margin * 2, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");

  weekdaysTr.forEach((day, i) => {
    const x = margin + i * cellW + cellW / 2;
    doc.text(`${day} / ${weekdaysEn[i]}`, x, headerY + 5, { align: "center" });
  });

  // Calendar cells
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days: Date[] = [];
  let d = calStart;
  while (d <= calEnd) {
    days.push(d);
    d = addDays(d, 1);
  }

  const rows = Math.ceil(days.length / 7);
  const gridStartY = headerY + 8;
  const availableH = pageH - gridStartY - margin;
  const cellH = availableH / rows;

  const eventsByDate: Record<string, CalendarEvent[]> = {};
  events.forEach((ev) => {
    if (!eventsByDate[ev.date]) eventsByDate[ev.date] = [];
    eventsByDate[ev.date].push(ev);
  });

  days.forEach((day, idx) => {
    const col = idx % 7;
    const row = Math.floor(idx / 7);
    const x = margin + col * cellW;
    const y = gridStartY + row * cellH;
    const inMonth = isSameMonth(day, currentMonth);
    const dateStr = format(day, "yyyy-MM-dd");
    const dayEvents = eventsByDate[dateStr] || [];

    // Cell background
    if (!inMonth) {
      doc.setFillColor(245, 245, 245);
      doc.rect(x, y, cellW, cellH, "F");
    }

    // Cell border
    doc.setDrawColor(200, 200, 200);
    doc.rect(x, y, cellW, cellH, "S");

    // Day number
    doc.setTextColor(inMonth ? 30 : 170, inMonth ? 30 : 170, inMonth ? 30 : 170);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(format(day, "d"), x + 2, y + 4);

    // Events
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5);
    let eventY = y + 7;
    const maxEvents = Math.floor((cellH - 8) / 5);

    dayEvents.slice(0, maxEvents).forEach((ev) => {
      if (eventY + 4 > y + cellH - 1) return;
      // Event bg
      doc.setFillColor(0, 82, 155, 0.1);
      doc.roundedRect(x + 1, eventY - 1.5, cellW - 2, 4.5, 0.5, 0.5, "F");

      doc.setTextColor(0, 82, 155);
      const label = `${ev.time} ${ev.title.tr}`;
      const labelEn = `${ev.title.en}`;
      doc.text(doc.splitTextToSize(label, cellW - 4), x + 2, eventY + 0.5);
      eventY += 2.5;
      doc.setTextColor(100, 100, 100);
      doc.text(doc.splitTextToSize(labelEn, cellW - 4), x + 2, eventY + 0.5);
      eventY += 2.5;
    });

    if (dayEvents.length > maxEvents) {
      doc.setTextColor(100, 100, 100);
      doc.text(`+${dayEvents.length - maxEvents} ...`, x + 2, eventY + 0.5);
    }
  });

  // Event details on next pages
  const monthEvents = events
    .filter((e) => {
      const ed = new Date(e.date);
      return ed.getFullYear() === currentMonth.getFullYear() && ed.getMonth() === currentMonth.getMonth();
    })
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  if (monthEvents.length > 0) {
    doc.addPage("a4", "portrait");
    const pw = 210;
    let yPos = 15;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 82, 155);
    doc.text("Etkinlik Detaylari / Event Details", 10, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`${monthTr}`, 10, yPos);
    yPos += 8;

    monthEvents.forEach((ev) => {
      if (yPos > 265) {
        doc.addPage("a4", "portrait");
        yPos = 15;
      }

      // Event card
      doc.setDrawColor(0, 82, 155);
      doc.setLineWidth(0.5);
      doc.line(10, yPos, 10, yPos + 2);
      doc.setLineWidth(0.2);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(`${ev.title.tr} / ${ev.title.en}`, 14, yPos + 2);
      yPos += 5;

      const venueTr = ev.venue.tr === "Diger" ? ev.customVenue?.tr || "" : ev.venue.tr;
      const venueEn = ev.venue.en === "Other" ? ev.customVenue?.en || "" : ev.venue.en;

      const fields = [
        [`Duzenleyen / Organizer: ${ev.club.tr} / ${ev.club.en}`],
        [`Tur / Type: ${ev.eventType.tr} / ${ev.eventType.en}`],
        [`Tarih / Date: ${ev.date}  |  Zaman / Time: ${ev.time}  |  Sure / Duration: ${ev.duration}`],
        [`Yer / Venue: ${venueTr} / ${venueEn}`],
        [`Format: ${ev.format.tr} / ${ev.format.en}  |  Dil / Language: ${ev.language}`],
        [`Kimlere Acik / Open to: ${ev.openTo}`],
        [`GE250-251 Puani / Points: ${ev.gePoints}`],
      ];

      if (ev.guestSpeakers) {
        fields.push([`Konuk Konusmaci(lar) / Guest Speaker(s): ${ev.guestSpeakers}`]);
      }
      if (ev.details) {
        fields.push([`Detaylar / Details: ${ev.details}`]);
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(60, 60, 60);

      fields.forEach((f) => {
        if (yPos > 280) {
          doc.addPage("a4", "portrait");
          yPos = 15;
        }
        const lines = doc.splitTextToSize(f[0], pw - 24);
        doc.text(lines, 14, yPos);
        yPos += lines.length * 3;
      });

      yPos += 4;

      // Separator
      doc.setDrawColor(220, 220, 220);
      doc.line(10, yPos, pw - 10, yPos);
      yPos += 4;
    });
  }

  doc.save(`Bilkent_Etkinlik_Takvimi_${format(currentMonth, "yyyy_MM")}.pdf`);
}
