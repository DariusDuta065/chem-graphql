import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class NotionBlock {
  @PrimaryColumn({ type: 'uuid' })
  blockID: string;

  @Column({ type: 'boolean', default: false })
  isUpdating: boolean;

  @Column({ type: 'datetime', nullable: false })
  lastEditedAt: Date;

  @Column({ type: 'text' })
  childrenBlocks: string;
}
