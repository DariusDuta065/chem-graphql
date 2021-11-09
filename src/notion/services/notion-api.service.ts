import { Queue } from 'bull';
import { Client as NotionClient } from '@notionhq/client';

import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';

import { InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { JOBS } from '../../shared/jobs';
import { QUEUES } from '../../shared/queues';
import { Block, NotionPage, isBlock } from '../types';
import { NotionConfig } from '../../config/interfaces/NotionConfig';

@Injectable()
export class NotionAPIService {
  private client: NotionClient;
  private readonly logger = new Logger(NotionAPIService.name);

  constructor(
    private configService: ConfigService,

    @InjectQueue(QUEUES.NOTION_API)
    private apiQueue: Queue,
  ) {}

  /**
   * Runs reguraly in order to keep DB in sync with
   * the content on Notion.
   *
   * Fires up {SyncNotionJob} asynchronously.
   */
  @Cron(CronExpression.EVERY_10_SECONDS, {
    name: JOBS.SYNC_NOTION,
  })
  public syncNotionTask(): void {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    this.apiQueue.add(JOBS.SYNC_NOTION);
  }

  /**
   * Returns a list of all blocks representing pages in the Notion database block.
   * To get content of a particular page, use getPageBlocks().
   * https://developers.notion.com/reference/post-database-query#post-database-query-filter
   *
   * @param filter - Notion DB query filter
   * @returns {Promise<NotionPage[]>}
   */
  public async getPagesMetadata(filter?): Promise<NotionPage[]> {
    const pages = await this.getClient().databases.query({
      database_id: this.getConfig().databaseID,
      filter,
    });

    return this.parsePageResults(pages);
  }

  /**
   * Paginates over all the parent blocks, and returns them
   * along with all blocks that have further children.
   *
   * @param blockID - pageID, since a page is a block)
   * @returns {Promise} - all children blocks for blockID,
   * and all the ones that have further children in 'parentBlocks'
   */
  public async getBlocksFromNotion(blockID: string): Promise<{
    lastEditedAt: string;
    childrenBlocks: Block[];
    parentBlocks: string[];
  }> {
    const { last_edited_time: lastEditedAt } =
      await this.getClient().blocks.retrieve({
        block_id: blockID,
      });

    const childrenBlocks: Block[] = [];
    let start_cursor: string | undefined = undefined;

    while (true) {
      const { results, has_more, next_cursor } =
        await this.getClient().blocks.children.list({
          block_id: blockID,
          start_cursor,
        });

      childrenBlocks.push(...(results as Block[]));

      start_cursor = next_cursor ?? undefined;
      if (!has_more) {
        break;
      }
    }

    const parentBlocks: string[] = childrenBlocks
      .filter((block) => block.has_children && isBlock(block))
      .map((block) => block.id);

    return { lastEditedAt, childrenBlocks, parentBlocks };
  }

  public getConfig(): NotionConfig {
    return this.configService.get<NotionConfig>(NotionConfig.CONFIG_KEY, {
      infer: true,
    });
  }

  public getClient(): NotionClient {
    if (!this.client) {
      this.client = new NotionClient({
        auth: this.getConfig().integrationToken,
      });
    }
    return this.client;
  }

  private parsePageResults(pages: QueryDatabaseResponse): NotionPage[] {
    const parsedPages = pages.results.map((page) => {
      const pg = {
        id: page.id,
        lastEditedAt: page.last_edited_time,
      } as NotionPage;

      for (const [k, v] of Object.entries(page.properties)) {
        if (k.toLowerCase().includes('content_title')) {
          if (v.type === 'title' && v.title) {
            pg.title = v.title[0].plain_text;
          }
        }
        if (k.toLowerCase().includes('content_type')) {
          if (v.type === 'select' && v.select) {
            pg.type = v.select.name;
          }
        }
      }

      return pg;
    });

    return parsedPages;
  }
}
