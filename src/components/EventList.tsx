import { CalendarEvent } from "@/types/event";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Clock, MapPin, Users, Globe, Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EventListProps {
  events: CalendarEvent[];
  selectedDate: Date | null;
  onDelete: (id: string) => void;
}

export default function EventList({ events, selectedDate, onDelete }: EventListProps) {
  if (!selectedDate) {
    return (
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
    );
  }

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const dayEvents = events.filter((e) => e.date === dateStr);

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground">
          {format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })}
        </h3>
        <p className="text-xs text-muted-foreground">
          {format(selectedDate, "EEEE, MMMM d, yyyy")}
        </p>
      </div>

      {dayEvents.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground text-sm">Bu tarihte etkinlik yok</p>
          <p className="text-muted-foreground/60 text-xs mt-1">No events on this date</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dayEvents.map((ev) => (
            <div
              key={ev.id}
              className="group rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-primary mb-1">
                    {ev.club.tr} / {ev.club.en}
                  </p>
                  <h4 className="font-bold text-foreground text-sm leading-tight">
                    {ev.title.tr}
                  </h4>
                  <p className="text-xs text-muted-foreground">{ev.title.en}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={() => onDelete(ev.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{ev.time} • {ev.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="truncate">
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
