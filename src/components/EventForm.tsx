import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarEvent, BilingualText } from "@/types/event";
import { CLUBS } from "@/data/clubs";
import { EVENT_TYPES, VENUES, FORMATS, DURATIONS, OPEN_TO_OPTIONS, LANGUAGES, GE_POINTS } from "@/data/options";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, ChevronsUpDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TIME_OPTIONS = Array.from({ length: 24 * 4 }).map((_, i) => {
  const hour = Math.floor(i / 4).toString().padStart(2, "0");
  const minute = ((i % 4) * 15).toString().padStart(2, "0");
  return `${hour}:${minute}`;
});

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: CalendarEvent) => void;
  initialDate?: Date | null;
  initialData?: CalendarEvent | null;
}

export default function EventForm({ open, onClose, onSubmit, initialDate, initialData }: EventFormProps) {
  const [clubIndex, setClubIndex] = useState("");
  const [titleTr, setTitleTr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [eventTypeIndex, setEventTypeIndex] = useState("");
  const [customEventTypeTr, setCustomEventTypeTr] = useState("");
  const [customEventTypeEn, setCustomEventTypeEn] = useState("");
  const [guestSpeakers, setGuestSpeakers] = useState("");
  const [details, setDetails] = useState("");
  const [date, setDate] = useState(initialDate ? format(initialDate, "yyyy-MM-dd") : "");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [venueIndex, setVenueIndex] = useState("");
  const [customVenueTr, setCustomVenueTr] = useState("");
  const [customVenueEn, setCustomVenueEn] = useState("");
  const [openTo, setOpenTo] = useState("");
  const [language, setLanguage] = useState("");
  const [gePoints, setGePoints] = useState("");
  const [formatIndex, setFormatIndex] = useState("");

  const [clubOpen, setClubOpen] = useState(false);
  const [eventTypeOpen, setEventTypeOpen] = useState(false);
  const [venueOpen, setVenueOpen] = useState(false);
  const [openToOpen, setOpenToOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const [startTimeOpen, setStartTimeOpen] = useState(false);
  const [endTimeOpen, setEndTimeOpen] = useState(false);
  const [startTimeSearch, setStartTimeSearch] = useState("");
  const [endTimeSearch, setEndTimeSearch] = useState("");

  const selectedEventType = eventTypeIndex ? EVENT_TYPES[parseInt(eventTypeIndex)] : null;
  const selectedVenue = venueIndex ? VENUES[parseInt(venueIndex)] : null;
  const isOtherEventType = selectedEventType?.tr === "Diğer";
  const isOtherVenue = selectedVenue?.tr === "Diğer";

  const resetForm = () => {
    setClubIndex(""); setTitleTr(""); setTitleEn(""); setEventTypeIndex("");
    setCustomEventTypeTr(""); setCustomEventTypeEn(""); setGuestSpeakers("");
    setDetails(""); setDate(initialDate ? format(initialDate, "yyyy-MM-dd") : "");
    setStartTime(""); setEndTime(""); setVenueIndex(""); setCustomVenueTr("");
    setCustomVenueEn(""); setOpenTo(""); setLanguage(""); setGePoints(""); setFormatIndex("");
  };

  useEffect(() => {
    if (open && initialData) {
      const cIdx = CLUBS.findIndex(c => c.tr === initialData.club.tr && c.en === initialData.club.en);
      setClubIndex(cIdx >= 0 ? String(cIdx) : "");

      setTitleTr(initialData.title.tr);
      setTitleEn(initialData.title.en);

      const tIdx = EVENT_TYPES.findIndex(t => t.tr === initialData.eventType.tr && t.en === initialData.eventType.en);
      if (tIdx >= 0) {
        setEventTypeIndex(String(tIdx));
        setCustomEventTypeTr("");
        setCustomEventTypeEn("");
      } else if (initialData.customEventType) {
        setEventTypeIndex(String(EVENT_TYPES.findIndex(t => t.tr === "Diğer")));
        setCustomEventTypeTr(initialData.customEventType.tr);
        setCustomEventTypeEn(initialData.customEventType.en);
      }

      setGuestSpeakers(initialData.guestSpeakers || "");
      setDetails(initialData.details || "");
      setDate(initialData.date);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);

      const vIdx = VENUES.findIndex(v => v.tr === initialData.venue.tr && v.en === initialData.venue.en);
      if (vIdx >= 0) {
        setVenueIndex(String(vIdx));
        setCustomVenueTr("");
        setCustomVenueEn("");
      } else if (initialData.customVenue) {
        setVenueIndex(String(VENUES.findIndex(v => v.tr === "Diğer")));
        setCustomVenueTr(initialData.customVenue.tr);
        setCustomVenueEn(initialData.customVenue.en);
      }

      setOpenTo(initialData.openTo);
      setLanguage(initialData.language);
      setGePoints(initialData.gePoints || "");

      const fIdx = FORMATS.findIndex(f => f.tr === initialData.format.tr && f.en === initialData.format.en);
      setFormatIndex(fIdx >= 0 ? String(fIdx) : "");
    } else if (open && !initialData) {
      resetForm();
    }
  }, [open, initialData, initialDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubIndex || !titleTr || !titleEn || !eventTypeIndex || !date || !startTime || !endTime || !venueIndex || !formatIndex) return;

    const club = CLUBS[parseInt(clubIndex)];
    const eventType = isOtherEventType
      ? { tr: customEventTypeTr, en: customEventTypeEn }
      : selectedEventType!;
    const venue = isOtherVenue
      ? { tr: customVenueTr, en: customVenueEn }
      : selectedVenue!;
    const fmt = FORMATS[parseInt(formatIndex)];

    const event: CalendarEvent = {
      id: initialData ? initialData.id : crypto.randomUUID(),
      club,
      title: { tr: titleTr, en: titleEn },
      eventType,
      customEventType: isOtherEventType ? { tr: customEventTypeTr, en: customEventTypeEn } : undefined,
      guestSpeakers,
      details,
      date,
      startTime,
      endTime,
      venue,
      customVenue: isOtherVenue ? { tr: customVenueTr, en: customVenueEn } : undefined,
      openTo,
      language,
      gePoints,
      format: fmt,
      isCancelled: initialData ? initialData.isCancelled : false
    };

    onSubmit(event);
    if (!initialData) resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold">
            {initialData ? "Etkinliği Düzenle / Edit Event" : "Yeni Etkinlik Oluştur / Create New Event"}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(95vh-80px)]">
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
            {/* Club */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold">
                Düzenleyen Kulüp veya Topluluk / Club or Society
              </Label>
              <Popover open={clubOpen} onOpenChange={setClubOpen} modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={clubOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate text-left flex-1 min-w-0">
                      {clubIndex
                        ? `${CLUBS[parseInt(clubIndex)].tr} / ${CLUBS[parseInt(clubIndex)].en}`
                        : "Seçiniz / Select..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 flex-none" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Kulüp ara / Search club..." />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                      <CommandEmpty>Kulüp bulunamadı. / No club found.</CommandEmpty>
                      <CommandGroup>
                        {CLUBS.map((c, i) => (
                          <CommandItem
                            key={i}
                            value={`${c.tr} ${c.en}`}
                            onSelect={() => {
                              setClubIndex(String(i));
                              setClubOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                clubIndex === String(i) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {c.tr} / {c.en}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Title */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label className="text-sm font-semibold">Etkinlik Adı (TR) / Activity Title (TR)</Label>
                <Input className="mt-1.5" value={titleTr} onChange={(e) => setTitleTr(e.target.value)} placeholder="Türkçe başlık" />
              </div>
              <div>
                <Label className="text-sm font-semibold">Etkinlik Adı (EN) / Activity Title (EN)</Label>
                <Input className="mt-1.5" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="English title" />
              </div>
            </div>

            {/* Event Type */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold">Etkinlik Türü / Type of Activity</Label>
              <Popover open={eventTypeOpen} onOpenChange={setEventTypeOpen} modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={eventTypeOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate text-left flex-1 min-w-0">
                      {eventTypeIndex
                        ? `${EVENT_TYPES[parseInt(eventTypeIndex)].tr} / ${EVENT_TYPES[parseInt(eventTypeIndex)].en}`
                        : "Seçiniz / Select..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 flex-none" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tür ara / Search type..." />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                      <CommandEmpty>Tür bulunamadı. / No type found.</CommandEmpty>
                      <CommandGroup>
                        {EVENT_TYPES.map((t, i) => (
                          <CommandItem
                            key={i}
                            value={`${t.tr} ${t.en}`}
                            onSelect={() => {
                              setEventTypeIndex(String(i));
                              setEventTypeOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                eventTypeIndex === String(i) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {t.tr} / {t.en}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {isOtherEventType && (
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label className="text-sm font-semibold">Etkinlik Türü (TR)</Label>
                  <Input className="mt-1.5" value={customEventTypeTr} onChange={(e) => setCustomEventTypeTr(e.target.value)} placeholder="Türkçe tür" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Event Type (EN)</Label>
                  <Input className="mt-1.5" value={customEventTypeEn} onChange={(e) => setCustomEventTypeEn(e.target.value)} placeholder="English type" />
                </div>
              </div>
            )}

            {/* Guest Speakers */}
            <div>
              <Label className="text-sm font-semibold">Konuk Konuşmacı(lar) / Guest Speaker(s)</Label>
              <Input className="mt-1.5" value={guestSpeakers} onChange={(e) => setGuestSpeakers(e.target.value)} placeholder="Opsiyonel / Optional" />
            </div>

            {/* Details */}
            <div>
              <Label className="text-sm font-semibold">Açıklayıcı Bilgi / Details about the Activity</Label>
              <Textarea className="mt-1.5" value={details} onChange={(e) => setDetails(e.target.value)} rows={2} placeholder="Etkinlik detayları / Event details" />
            </div>

            {/* Date, Start Time, End Time */}
            <div className="grid grid-cols-3 gap-5">
              <div>
                <Label className="text-sm font-semibold">Tarih / Date</Label>
                <Input className="mt-1.5 w-full" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="flex flex-col">
                <Label className="text-sm font-semibold flex-shrink-0">Başlangıç / Start Time</Label>
                <Popover open={startTimeOpen} onOpenChange={setStartTimeOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={startTimeOpen}
                      className={cn("mt-1.5 w-full flex-1 justify-between font-normal", !startTime && "text-muted-foreground")}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 shrink-0" />
                        {startTime || "Seçiniz..."}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Yazın veya seçin... (Örn: 14:30)"
                        value={startTimeSearch}
                        onValueChange={setStartTimeSearch}
                      />
                      <CommandList className="max-h-[200px] overflow-y-auto">
                        <CommandEmpty className="p-1">
                          {startTimeSearch ? (
                            <div
                              className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setStartTime(startTimeSearch);
                                setStartTimeOpen(false);
                                setEndTimeOpen(true);
                              }}
                            >
                              <Check className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center opacity-0" />
                              "{startTimeSearch}" özel olarak ayarla
                            </div>
                          ) : (
                            <div className="py-2 text-center text-sm text-muted-foreground">Bulunamadı.</div>
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {TIME_OPTIONS.map((t) => (
                            <CommandItem
                              key={t}
                              value={t}
                              onSelect={() => {
                                setStartTime(t);
                                setStartTimeOpen(false);
                                setEndTimeOpen(true);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", startTime === t ? "opacity-100" : "opacity-0")} />
                              {t}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col">
                <Label className="text-sm font-semibold flex-shrink-0">Bitiş / End Time</Label>
                <Popover open={endTimeOpen} onOpenChange={setEndTimeOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={endTimeOpen}
                      className={cn("mt-1.5 w-full flex-1 justify-between font-normal", !endTime && "text-muted-foreground")}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 shrink-0" />
                        {endTime || "Seçiniz..."}
                      </div>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Yazın veya seçin... (Örn: 16:45)"
                        value={endTimeSearch}
                        onValueChange={setEndTimeSearch}
                      />
                      <CommandList className="max-h-[200px] overflow-y-auto">
                        <CommandEmpty className="p-1">
                          {endTimeSearch ? (
                            <div
                              className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setEndTime(endTimeSearch);
                                setEndTimeOpen(false);
                              }}
                            >
                              <Check className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center opacity-0" />
                              "{endTimeSearch}" özel olarak ayarla
                            </div>
                          ) : (
                            <div className="py-2 text-center text-sm text-muted-foreground">Bulunamadı.</div>
                          )}
                        </CommandEmpty>
                        <CommandGroup>
                          {TIME_OPTIONS.map((t) => (
                            <CommandItem
                              key={t}
                              value={t}
                              onSelect={() => {
                                setEndTime(t);
                                setEndTimeOpen(false);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", endTime === t ? "opacity-100" : "opacity-0")} />
                              {t}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Venue */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-semibold">Yer / Venue</Label>
              <Popover open={venueOpen} onOpenChange={setVenueOpen} modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={venueOpen}
                    className="w-full justify-between font-normal"
                  >
                    <span className="truncate text-left flex-1 min-w-0">
                      {venueIndex
                        ? VENUES[parseInt(venueIndex)].tr === VENUES[parseInt(venueIndex)].en
                          ? VENUES[parseInt(venueIndex)].tr
                          : `${VENUES[parseInt(venueIndex)].tr} / ${VENUES[parseInt(venueIndex)].en}`
                        : "Seçiniz / Select..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 flex-none" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Yer ara / Search venue..." />
                    <CommandList className="max-h-[200px] overflow-y-auto">
                      <CommandEmpty>Yer bulunamadı. / No venue found.</CommandEmpty>
                      <CommandGroup>
                        {VENUES.map((v, i) => (
                          <CommandItem
                            key={i}
                            value={`${v.tr} ${v.en}`}
                            onSelect={() => {
                              setVenueIndex(String(i));
                              setVenueOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                venueIndex === String(i) ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {v.tr === v.en ? v.tr : `${v.tr} / ${v.en}`}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            {isOtherVenue && (
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label className="text-sm font-semibold">Yer (TR) / Venue (TR)</Label>
                  <Input className="mt-1.5" value={customVenueTr} onChange={(e) => setCustomVenueTr(e.target.value)} placeholder="Türkçe yer" />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Yer (EN) / Venue (EN)</Label>
                  <Input className="mt-1.5" value={customVenueEn} onChange={(e) => setCustomVenueEn(e.target.value)} placeholder="English venue" />
                </div>
              </div>
            )}

            {/* Open To, Language, Format */}
            <div className="grid grid-cols-3 gap-5">
              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">Kimlere Açık / Open to</Label>
                <Popover open={openToOpen} onOpenChange={setOpenToOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openToOpen}
                      className="w-full justify-between font-normal px-2"
                    >
                      <span className="truncate text-left flex-1 min-w-0">
                        {openTo || "Seçiniz..."}
                      </span>
                      <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50 flex-none" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Ara..." />
                      <CommandList className="max-h-[200px] overflow-y-auto">
                        <CommandEmpty>Bulunamadı.</CommandEmpty>
                        <CommandGroup>
                          {OPEN_TO_OPTIONS.map((o, i) => (
                            <CommandItem
                              key={i}
                              value={`${o.tr} ${o.en}`}
                              onSelect={() => {
                                setOpenTo(`${o.tr} / ${o.en}`);
                                setOpenToOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  openTo === `${o.tr} / ${o.en}` ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {o.tr} / {o.en}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">Etkinlik Dili / Language</Label>
                <Popover open={languageOpen} onOpenChange={setLanguageOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={languageOpen}
                      className="w-full justify-between font-normal px-2"
                    >
                      <span className="truncate text-left flex-1 min-w-0">
                        {language || "Seçiniz..."}
                      </span>
                      <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50 flex-none" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Ara..." />
                      <CommandList className="max-h-[200px] overflow-y-auto">
                        <CommandEmpty>Bulunamadı.</CommandEmpty>
                        <CommandGroup>
                          {LANGUAGES.map((l, i) => (
                            <CommandItem
                              key={i}
                              value={`${l.tr} ${l.en}`}
                              onSelect={() => {
                                setLanguage(`${l.tr} / ${l.en}`);
                                setLanguageOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  language === `${l.tr} / ${l.en}` ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {l.tr} / {l.en}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-sm font-semibold">Yüz Yüze/Çevrimiçi</Label>
                <Popover open={formatOpen} onOpenChange={setFormatOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={formatOpen}
                      className="w-full justify-between font-normal px-2"
                    >
                      <span className="truncate text-left flex-1 min-w-0">
                        {formatIndex
                          ? `${FORMATS[parseInt(formatIndex)].tr} / ${FORMATS[parseInt(formatIndex)].en}`
                          : "Seçiniz..."}
                      </span>
                      <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50 flex-none" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Ara..." />
                      <CommandList className="max-h-[200px] overflow-y-auto">
                        <CommandEmpty>Bulunamadı.</CommandEmpty>
                        <CommandGroup>
                          {FORMATS.map((f, i) => (
                            <CommandItem
                              key={i}
                              value={`${f.tr} ${f.en}`}
                              onSelect={() => {
                                setFormatIndex(String(i));
                                setFormatOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formatIndex === String(i) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {f.tr} / {f.en}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* GE Points */}
            <div>
              <Label className="text-sm font-semibold">GE250-251 Puanı / GE250-251 Points</Label>
              <Input
                className="mt-1.5 w-32"
                type="number"
                min="0"
                max="100"
                value={gePoints}
                onChange={(e) => setGePoints(e.target.value)}
                placeholder="Örn: 2"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-5 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                İptal / Cancel
              </Button>
              <Button type="submit">
                {initialData ? "Değişiklikleri Kaydet / Save Changes" : "Etkinlik Oluştur / Create Event"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
