import { useState } from "react";
import { format } from "date-fns";
import { CalendarEvent, BilingualText } from "@/types/event";
import { CLUBS } from "@/data/clubs";
import { EVENT_TYPES, VENUES, FORMATS, DURATIONS, OPEN_TO_OPTIONS, LANGUAGES, GE_POINTS } from "@/data/options";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EventFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: CalendarEvent) => void;
  initialDate?: Date | null;
}

export default function EventForm({ open, onClose, onSubmit, initialDate }: EventFormProps) {
  const [clubIndex, setClubIndex] = useState("");
  const [titleTr, setTitleTr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [eventTypeIndex, setEventTypeIndex] = useState("");
  const [customEventTypeTr, setCustomEventTypeTr] = useState("");
  const [customEventTypeEn, setCustomEventTypeEn] = useState("");
  const [guestSpeakers, setGuestSpeakers] = useState("");
  const [details, setDetails] = useState("");
  const [date, setDate] = useState(initialDate ? format(initialDate, "yyyy-MM-dd") : "");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("");
  const [venueIndex, setVenueIndex] = useState("");
  const [customVenueTr, setCustomVenueTr] = useState("");
  const [customVenueEn, setCustomVenueEn] = useState("");
  const [openTo, setOpenTo] = useState("");
  const [language, setLanguage] = useState("");
  const [gePoints, setGePoints] = useState("0");
  const [formatIndex, setFormatIndex] = useState("");

  const selectedEventType = eventTypeIndex ? EVENT_TYPES[parseInt(eventTypeIndex)] : null;
  const selectedVenue = venueIndex ? VENUES[parseInt(venueIndex)] : null;
  const isOtherEventType = selectedEventType?.tr === "Diğer";
  const isOtherVenue = selectedVenue?.tr === "Diğer";

  const resetForm = () => {
    setClubIndex(""); setTitleTr(""); setTitleEn(""); setEventTypeIndex("");
    setCustomEventTypeTr(""); setCustomEventTypeEn(""); setGuestSpeakers("");
    setDetails(""); setDate(initialDate ? format(initialDate, "yyyy-MM-dd") : "");
    setTime(""); setDuration(""); setVenueIndex(""); setCustomVenueTr("");
    setCustomVenueEn(""); setOpenTo(""); setLanguage(""); setGePoints("0"); setFormatIndex("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clubIndex || !titleTr || !titleEn || !eventTypeIndex || !date || !time || !duration || !venueIndex || !formatIndex) return;

    const club = CLUBS[parseInt(clubIndex)];
    const eventType = isOtherEventType
      ? { tr: customEventTypeTr, en: customEventTypeEn }
      : selectedEventType!;
    const venue = isOtherVenue
      ? { tr: customVenueTr, en: customVenueEn }
      : selectedVenue!;
    const fmt = FORMATS[parseInt(formatIndex)];

    const event: CalendarEvent = {
      id: crypto.randomUUID(),
      club,
      title: { tr: titleTr, en: titleEn },
      eventType,
      customEventType: isOtherEventType ? { tr: customEventTypeTr, en: customEventTypeEn } : undefined,
      guestSpeakers,
      details,
      date,
      time,
      duration,
      venue,
      customVenue: isOtherVenue ? { tr: customVenueTr, en: customVenueEn } : undefined,
      openTo,
      language,
      gePoints,
      format: fmt,
    };

    onSubmit(event);
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-bold">
            Yeni Etkinlik Oluştur / Create New Event
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-100px)]">
          <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
            {/* Club */}
            <div>
              <Label className="text-xs font-semibold">
                Düzenleyen Kulüp veya Topluluk / Club or Society
              </Label>
              <Select value={clubIndex} onValueChange={setClubIndex}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seçiniz / Select..." /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {CLUBS.map((c, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {c.tr} / {c.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Etkinlik Adı (TR) / Activity Title (TR)</Label>
                <Input className="mt-1" value={titleTr} onChange={(e) => setTitleTr(e.target.value)} placeholder="Türkçe başlık" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Etkinlik Adı (EN) / Activity Title (EN)</Label>
                <Input className="mt-1" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="English title" />
              </div>
            </div>

            {/* Event Type */}
            <div>
              <Label className="text-xs font-semibold">Etkinlik Türü / Type of Activity</Label>
              <Select value={eventTypeIndex} onValueChange={setEventTypeIndex}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seçiniz / Select..." /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {t.tr} / {t.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isOtherEventType && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Etkinlik Türü (TR)</Label>
                  <Input className="mt-1" value={customEventTypeTr} onChange={(e) => setCustomEventTypeTr(e.target.value)} placeholder="Türkçe tür" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Event Type (EN)</Label>
                  <Input className="mt-1" value={customEventTypeEn} onChange={(e) => setCustomEventTypeEn(e.target.value)} placeholder="English type" />
                </div>
              </div>
            )}

            {/* Guest Speakers */}
            <div>
              <Label className="text-xs font-semibold">Konuk Konuşmacı(lar) / Guest Speaker(s)</Label>
              <Input className="mt-1" value={guestSpeakers} onChange={(e) => setGuestSpeakers(e.target.value)} placeholder="Opsiyonel / Optional" />
            </div>

            {/* Details */}
            <div>
              <Label className="text-xs font-semibold">Açıklayıcı Bilgi / Details about the Activity</Label>
              <Textarea className="mt-1" value={details} onChange={(e) => setDetails(e.target.value)} rows={2} placeholder="Etkinlik detayları / Event details" />
            </div>

            {/* Date, Time, Duration */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Tarih / Date</Label>
                <Input className="mt-1" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Zaman / Time</Label>
                <Input className="mt-1" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs font-semibold">Süre / Duration</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Venue */}
            <div>
              <Label className="text-xs font-semibold">Yer / Venue</Label>
              <Select value={venueIndex} onValueChange={setVenueIndex}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Seçiniz / Select..." /></SelectTrigger>
                <SelectContent>
                  {VENUES.map((v, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {v.tr === v.en ? v.tr : `${v.tr} / ${v.en}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isOtherVenue && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Yer (TR) / Venue (TR)</Label>
                  <Input className="mt-1" value={customVenueTr} onChange={(e) => setCustomVenueTr(e.target.value)} placeholder="Türkçe yer" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Yer (EN) / Venue (EN)</Label>
                  <Input className="mt-1" value={customVenueEn} onChange={(e) => setCustomVenueEn(e.target.value)} placeholder="English venue" />
                </div>
              </div>
            )}

            {/* Open To, Language, Format */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs font-semibold">Kimlere Açık / Open to</Label>
                <Select value={openTo} onValueChange={setOpenTo}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                  <SelectContent>
                    {OPEN_TO_OPTIONS.map((o, i) => (
                      <SelectItem key={i} value={`${o.tr} / ${o.en}`}>
                        {o.tr} / {o.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Etkinlik Dili / Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l, i) => (
                      <SelectItem key={i} value={`${l.tr} / ${l.en}`}>
                        {l.tr} / {l.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Yüz Yüze/Çevrimiçi</Label>
                <Select value={formatIndex} onValueChange={setFormatIndex}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                  <SelectContent>
                    {FORMATS.map((f, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {f.tr} / {f.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* GE Points */}
            <div>
              <Label className="text-xs font-semibold">GE250-251 Puanı / GE250-251 Points</Label>
              <Select value={gePoints} onValueChange={setGePoints}>
                <SelectTrigger className="mt-1 w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GE_POINTS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                İptal / Cancel
              </Button>
              <Button type="submit">
                Etkinlik Oluştur / Create Event
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
