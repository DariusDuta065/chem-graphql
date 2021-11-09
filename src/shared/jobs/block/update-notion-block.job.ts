import { Block } from '../../../notion/types';

export interface UpdateNotionBlockJob {
  blockID: string;
  isUpdating?: boolean;
  lastEditedAt?: string;
  childrenBlocks?: Block[];
}
