// dto/event-filter.dto.ts
/* eslint-disable prettier/prettier */
export class EventFilterDto {
    search?: string;
    isThisWeek?: string;
    isWeekend?: string;
    eventType?: string;
    tags?: string | string[];
  }