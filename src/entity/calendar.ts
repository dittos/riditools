import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import { Category } from "../crawler/utils";
import { CalendarRevision } from "./calendar_revision";

export type CalendarEntry = {
  title: string;
  badges: string[];
  alert: string | null;
  authors: string;
  date: string; // yyyy-MM-dd
};

@Entity()
export class Calendar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  category: Category;

  @Column()
  yearMonth: string;

  @Column({ type: 'integer', nullable: true })
  lastRevision: number | null;

  @Column({ type: 'jsonb' })
  entries: CalendarEntry[];

  @Column()
  fetchedAt: Date;

  @OneToMany(type => CalendarRevision, revision => revision.calendar)
  revisions: CalendarRevision[];
}
