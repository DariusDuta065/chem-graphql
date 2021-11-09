import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class NotionBlock {
  @PrimaryColumn({ type: 'uuid' })
  public blockID: string;

  @Column({ type: 'boolean', default: false })
  public isUpdating: boolean;

  @Column({ type: 'datetime', nullable: false })
  public lastEditedAt: Date;

  @Column({ type: 'text' })
  public childrenBlocks: string;
}
