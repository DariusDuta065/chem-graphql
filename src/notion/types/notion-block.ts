import { BlockTypeEnum } from './block-types';
import Text from './text';

export interface Title {
  id: 'title';
  type: 'title';
  title: Text[];
}

export interface BlockTypeContent {
  text: Text[];
  checked?: boolean;
  children?: Block[];
}

export interface Block {
  id: string;
  type: BlockTypeEnum | string;
  object: 'block' | 'database' | 'page' | string;
  created_time: Date | string;
  last_edited_time: Date | string;
  has_children: boolean;

  [BlockTypeEnum.HEADING1]?: BlockTypeContent;
  [BlockTypeEnum.HEADING2]?: BlockTypeContent;
  [BlockTypeEnum.HEADING3]?: BlockTypeContent;
  [BlockTypeEnum.PARAGRAPH]?: BlockTypeContent;
  [BlockTypeEnum.DOTS_LIST]?: BlockTypeContent;
  [BlockTypeEnum.ENUM_LIST]?: BlockTypeContent;
  [BlockTypeEnum.CHECK_LIST]?: BlockTypeContent;
  [BlockTypeEnum.TOGGLE_LIST]?: BlockTypeContent;
}

export type NotionBlock = Block | Title;
