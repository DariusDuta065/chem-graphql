import { Block } from '../../../notion/types';

export interface UpdateNotionBlockJob {
  blockID: string;
  lastEditedAt: string;
  isUpdating: boolean;
  childrenBlocks: Block[];
}
