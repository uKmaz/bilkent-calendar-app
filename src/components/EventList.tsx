import { useState } from "react";
import { CalendarEvent } from "@/types/event";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { Clock, MapPin, Users, Globe, Trash2, Star, Edit2, Ban, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EventListProps {
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDelete: (id: string) => void;
  onEdit: (event: CalendarEvent) => void;
  onToggleCancel: (event: CalendarEvent) => void;
}

export default function EventList({ events, selectedDate, onDelete, onEdit, onToggleCancel }: EventListProps) {
  const [viewMode, setViewMode] = useState<'day' | 'all'>('day');

  const sortedEvents = [...events].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  const displayEvents = viewMode === 'all'
    ? sortedEvents
    : (selectedDate ? events.filter((e) => e.date === format(selectedDate, "yyyy-MM-dd")) : []);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex bg-muted rounded-lg p-1 w-full relative">
            <button
              onClick={() => setViewMode('day')}
              className={cn("flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 z-10", viewMode === 'day' ? "text-foreground shadow-sm bg-background" : "text-muted-foreground hover:text-foreground")}
            >
              Seçili Gün / Day
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={cn("flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 z-10", viewMode === 'all' ? "text-foreground shadow-sm bg-background" : "text-muted-foreground hover:text-foreground")}
            >
              Tümü / All Events
            </button>
          </div>
        </div>

        {viewMode === 'day' && selectedDate && (
          <div>
            <h3 className="text-lg font-bold text-foreground">
              {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
            </h3>
            <p className="text-xs text-muted-foreground">
              {format(selectedDate, "EEEE, MMMM d, yyyy")}
            </p>
          </div>
        )}

        {viewMode === 'all' && (
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Tüm Etkinlikler
            </h3>
            <p className="text-xs text-muted-foreground">
              All Events ({events.length})
            </p>
          </div>
        )}
      </div>

      {viewMode === 'day' && !selectedDate ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Clock className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-sm">
            Etkinlikleri görmek için bir gün seçin
          </p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Select a day to view events
          </p>
        </div>
      ) : displayEvents.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground text-sm">Etkinlik bulunamadı</p>
          <p className="text-muted-foreground/60 text-xs mt-1">No events found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayEvents.map((ev) => (
            <div
              key={ev.id}
              className={cn(
                "group relative rounded-lg border p-4 transition-all hover:shadow-md",
                ev.isCancelled ? "bg-red-50/50 border-red-200" : "bg-card border-border"
              )}
            >
              {ev.isCancelled && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 rotate-[-12deg] z-10 pointer-events-none opacity-80">
                  <div className="border-4 border-red-500 text-red-500 font-bold uppercase py-1 px-4 rounded text-xl shadow-sm bg-white/50 backdrop-blur-sm">
                    İPTAL EDİLDİ
                  </div>
                </div>
              )}

              <div className={cn("flex justify-between items-start", ev.isCancelled && "opacity-60 grayscale-[50%]")}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-primary mb-1">
                    {ev.club.tr} / {ev.club.en}
                  </p>
                  <h4 className="font-bold text-foreground text-sm leading-tight">
                    {ev.title.tr}
                  </h4>
                  <p className="text-xs text-muted-foreground">{ev.title.en}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Düzenle / Edit"
                    onClick={() => onEdit(ev)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-orange-500 hover:text-orange-600"
                    title={ev.isCancelled ? "İptali Geri Al / Uncancel" : "İptal Et / Cancel"}
                    onClick={() => onToggleCancel(ev)}
                  >
                    <Ban className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    title="Sil / Delete"
                    onClick={() => onDelete(ev.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className={cn("mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground", ev.isCancelled && "opacity-60 grayscale-[50%]")}>
                {viewMode === 'all' && (
                  <div className="flex items-center gap-1.5 col-span-2 font-medium text-foreground mb-1">
                    <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{format(parseISO(ev.date), "dd.MM.yyyy")}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className={ev.isCancelled ? "line-through" : ""}>{ev.startTime} - {ev.endTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className={cn("truncate", ev.isCancelled && "line-through")}>
                    {ev.venue.tr === "Diğer" ? ev.customVenue?.tr : ev.venue.tr}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3 w-3 shrink-0" />
                  <span>{ev.openTo}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3 w-3 shrink-0" />
                  <span>{ev.format.tr} / {ev.format.en}</span>
                </div>
                {ev.gePoints && ev.gePoints !== "0" && (
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Star className="h-3 w-3 shrink-0" />
                    <span>GE250-251: {ev.gePoints} puan / points</span>
                  </div>
                )}
              </div>

              <div className="mt-2">
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-medium">
                  {ev.eventType.tr} / {ev.eventType.en}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
