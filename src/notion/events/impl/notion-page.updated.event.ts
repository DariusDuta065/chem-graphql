import { Content } from 'src/content/content.entity';
import { NotionPage } from 'src/notion/types';

export class NotionPageUpdatedEvent {
  constructor(
    public readonly content: Content,
    public readonly notionBlock: NotionPage,
  ) {}
}
