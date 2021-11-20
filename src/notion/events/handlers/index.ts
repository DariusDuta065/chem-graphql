import { NotionPageCreatedHandler } from './notion-page-created.handler';
import { NotionPageDeletedHandler } from './notion-page-deleted.handler';
import { NotionPageUpdatedHandler } from './notion-page-updated.handler';

export const EventHandlers = [
  NotionPageCreatedHandler,
  NotionPageUpdatedHandler,
  NotionPageDeletedHandler,
];
