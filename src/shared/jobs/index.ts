const JOBS = {
  SYNC_NOTION: 'sync_notion',

  FETCH_NOTION_BLOCK: 'fetch_notion_block',
  CHECK_BLOCK_FETCH_STATUS: 'check_fetch_status',

  UPDATE_NOTION_BLOCK: 'update_notion_block',

  CREATE_CONTENT: 'create_content',
  UPDATE_CONTENT: 'update_content',
  DELETE_CONTENT: 'delete_content',
  AGGREGATE_CONTENT_BLOCKS: 'aggregate_content_blocks',

  SEND_DISCORD_MESSAGE: 'send_discord_message',

  OPTIONS: {
    RETRIED: {
      attempts: 10,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
    DELAYED: {
      delay: 1000,
    },
  },
};

export { JOBS };

export * from './content/create-content.job';
export * from './content/update-content.job';
export * from './content/delete-content.job';
export * from './content/aggregate-content-blocks.job';

export * from './block/fetch-notion-block.job';
export * from './block/update-notion-block.job';
export * from './block/check-block-fetch-status.job';

export * from './discord/send-discord-message.job';
