import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { tr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarEvent } from "@/types/event";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  events: CalendarEvent[];
  onDateClick: (date: Date) => void;
  selectedDate: Date | null;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

const WEEKDAYS_TR = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const WEEKDAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarGrid({
  events,
  onDateClick,
  selectedDate,
  currentMonth,
  onMonthChange,
}: CalendarGridProps) {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const result: Date[] = [];
    let day = calStart;
    while (day <= calEnd) {
      result.push(day);
      day = addDays(day, 1);
    }
    return result;
  }, [currentMonth]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [events]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {format(currentMonth, "MMMM yyyy", { locale: tr })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {format(currentMonth, "MMMM yyyy")}
          </p>
        </div>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMonthChange(new Date())}
            className="px-3 h-9 text-xs font-medium"
          >
            Bugün / Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS_TR.map((day, i) => (
          <div key={day} className="text-center py-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {day}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {WEEKDAYS_EN[i]}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-t border-l border-border rounded-lg overflow-hidden">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[dateStr] || [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <button
              key={dateStr}
              onClick={() => onDateClick(day)}
              className={cn(
                "relative min-h-[90px] p-1.5 border-r border-b border-border text-left transition-colors hover:bg-accent/50",
                !isCurrentMonth && "bg-muted/30",
                isSelected && "bg-accent ring-1 ring-primary/30",
                isTodayDate && "bg-today"
              )}
            >
              <span
                className={cn(
                  "inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full",
                  !isCurrentMonth && "text-muted-foreground/50",
                  isTodayDate && "bg-primary text-primary-foreground font-bold",
                  isSelected && !isTodayDate && "bg-accent-foreground/10"
                )}
              >
                {format(day, "d")}
              </span>
              {/* Event dots */}
              <div className="mt-0.5 space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className="text-[10px] leading-tight px-1 py-0.5 rounded bg-primary/10 text-primary truncate font-medium"
                  >
                    {ev.time} {ev.title.tr}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-muted-foreground pl-1">
                    +{dayEvents.length - 3} daha
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
