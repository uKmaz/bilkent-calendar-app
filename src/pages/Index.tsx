import { useState } from "react";
import { format } from "date-fns";
import { Plus, FileDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import CalendarGrid from "@/components/CalendarGrid";
import EventForm from "@/components/EventForm";
import EventList from "@/components/EventList";
import { useEvents } from "@/hooks/useEvents";
import { exportCalendarPdf } from "@/lib/pdfExport";

import { CalendarEvent } from "@/types/event";

const Index = () => {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event);
    setFormOpen(true);
  };

  const handleToggleCancel = (event: CalendarEvent) => {
    updateEvent({ ...event, isCancelled: !event.isCancelled });
  };

  const handleFormSubmit = (event: CalendarEvent) => {
    if (editingEvent) {
      updateEvent(event);
    } else {
      addEvent(event);
    }
    setEditingEvent(null);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground leading-tight">
                Bilkent Etkinlik Takvimi
              </h1>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Activity Calendar — 2025-2026
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCalendarPdf(events, currentMonth)}
              className="gap-1.5 text-xs"
            >
              <FileDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">PDF İndir / Download</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <Button
              size="sm"
              onClick={() => { setEditingEvent(null); setFormOpen(true); }}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Etkinlik Ekle / Add Event</span>
              <span className="sm:hidden">Ekle</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar */}
          <div className="flex-1 min-w-0">
            <CalendarGrid
              events={events}
              onDateClick={setSelectedDate}
              selectedDate={selectedDate}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          </div>

          {/* Sidebar - Events for selected day */}
          <div className="lg:w-[340px] shrink-0">
            <div className="sticky top-[72px] bg-card rounded-xl border border-border p-4 max-h-[calc(100vh-96px)] overflow-y-auto custom-scrollbar">
              <EventList
                events={events}
                selectedDate={selectedDate}
                onDelete={deleteEvent}
                onEdit={handleEdit}
                onToggleCancel={handleToggleCancel}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Event Form */}
      <EventForm
        open={formOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        initialDate={selectedDate}
        initialData={editingEvent}
      />
    </div>
  );
};

export default Index;
