import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from "typeorm";
import { CalendarEntry, Calendar } from './calendar';

export type CalendarEntryDelta = {
  type: 'added';
  prev: null;
  current: CalendarEntry;
} | {
  type: 'changed';
  prev: CalendarEntry;
  current: CalendarEntry;
} | {
  type: 'removed';
  prev: CalendarEntry;
  current: null;
};

@Entity()
export class CalendarRevision {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Calendar, calendar => calendar.revisions)
  calendar: Calendar;

  @Column()
  revision: number;

  @Column({ type: 'jsonb' })
  entryDeltas: CalendarEntryDelta[];

  @Column()
  fetchedAt: Date;
}
