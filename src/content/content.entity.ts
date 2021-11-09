import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Content {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: 'uuid', unique: true })
  public blockID: string;

  @Column()
  public title: string;

  @Column()
  public type: string;

  @Column({ type: 'datetime' })
  public lastEditedAt: Date;

  @Column({ type: 'text' })
  public blocks: string;
}
