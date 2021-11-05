export default interface Text {
  type: 'text' | 'mention' | string;
  text?: {
    content: string;
    link: {
      url: string;
    } | null;
  };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
  href?: string;
}

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

export enum BlockTypeEnum {
  HEADING1 = 'heading_1',
  HEADING2 = 'heading_2',
  HEADING3 = 'heading_3',
  PARAGRAPH = 'paragraph',
  TOGGLE_LIST = 'toggle',
  DOTS_LIST = 'bulleted_list_item',
  ENUM_LIST = 'numbered_list_item',
  CHECK_LIST = 'to_do',
  TITLE = 'title',
  VIDEO = 'video',
  IMAGE = 'image',
  EMBED = 'embed',
  FILE = 'file',
  PDF = 'pdf',
  BOOKMARK = 'bookmark',
  CALLOUT = 'callout',
  QUOTE = 'quote',
}

export const UNSUPPORTED_TYPE = 'unsupported';
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
