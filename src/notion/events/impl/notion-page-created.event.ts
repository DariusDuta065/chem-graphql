import { NotionPage } from 'src/notion/types';

export class NotionPageCreatedEvent {
  constructor(public readonly notionBlock: NotionPage) {}
}
