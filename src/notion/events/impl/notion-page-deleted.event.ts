import { Content } from 'src/content/content.entity';

export class NotionPageDeletedEvent {
  constructor(public readonly content: Content) {}
}
