import { NotionBlockType, Block } from '.';

const isBlock = (value: NotionBlockType): value is Block => {
  return 'object' in value;
};

// const isTitle = (value: NotionBlock): value is Title => {
//   return value.id === 'title' && value.type === 'title';
// };

// const isBlockEnum = (value: BlockTypeEnum | string): value is BlockTypeEnum => {
//   return (<any>Object).values(BlockTypeEnum).includes(value);
// };

export { isBlock };
