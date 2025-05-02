import { CalendarEvents } from "@shared/components/datepicker/enums";

export type TCalendarEventParams = {
    type: CalendarEvents;
    value?: Date;
  };