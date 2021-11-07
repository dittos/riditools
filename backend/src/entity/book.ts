import {Entity, Column, PrimaryColumn} from "typeorm";

@Entity()
export class Book {
  @PrimaryColumn({ length: 16 })
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ length: 16 })
  category: string;

  @Column()
  firstSeenAt: Date;
}
