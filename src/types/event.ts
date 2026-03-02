export interface BilingualText {
  tr: string;
  en: string;
}

export interface CalendarEvent {
  id: string;
  club: BilingualText;
  title: BilingualText;
  eventType: BilingualText;
  customEventType?: BilingualText;
  guestSpeakers: string;
  details: string;
  date: string; // ISO date string
  time: string; // HH:mm
  duration: string;
  venue: BilingualText;
  customVenue?: BilingualText;
  openTo: string;
  language: string;
  gePoints: string;
  format: BilingualText; // Face to Face / Online
}
