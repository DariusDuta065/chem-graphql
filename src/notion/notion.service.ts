import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Client as NotionClient } from '@notionhq/client';
import {
  ListBlockChildrenResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { NotionConfig } from '../config/interfaces/NotionConfig';
import { Block, NotionBlock, NotionPage, isBlock } from './types';

@Injectable()
export class NotionService {
  private client: NotionClient;

  constructor(private configService: ConfigService) {}

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

  /**
   * Returns a list of all pages within the database.
   * To get content of a particular page, use getPageBlocks().
   * https://developers.notion.com/reference/post-database-query#post-database-query-filter
   *
   * @param filter - Notion DB query filter
   * @returns {Promise<NotionPage[]>}
   */
  public async getPages(filter?): Promise<NotionPage[]> {
    const pages = await this.getClient().databases.query({
      database_id: this.getConfig().databaseID,
      filter,
    });

    return this.parsePageResults(pages);
  }

  /**
   * Recursively iterates and resolves all the blocks
   * and their children via Notion's API.
   *
   * @param pageID - block ID (i.e. pageID, a page is a block)
   * @returns {Promise<Block[]>}
   */
  public async getPageBlocks(pageID: string): Promise<Block[]> {
    const blocks: Block[] = [];

    let start_cursor: string | undefined = undefined;

    while (true) {
      const { results, has_more, next_cursor } = await this.getBlocksChildren(
        pageID,
        start_cursor,
      );

      const parentBlocks: Block[] = results.filter(
        (block) => block.has_children && isBlock(block as NotionBlock),
      ) as Block[];

      for (const parent of parentBlocks) {
        parent[parent.type].children = await this.getPageBlocks(parent.id);
      }

      blocks.push(...(results as Block[]));

      start_cursor = next_cursor ?? undefined;
      if (!has_more) {
        break;
      }
    }

    return blocks;
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

  private async getBlocksChildren(
    blockID: string,
    start_cursor?: string,
  ): Promise<ListBlockChildrenResponse> {
    return this.getClient().blocks.children.list({
      block_id: blockID,
      start_cursor,
    });
  }
}
