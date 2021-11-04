import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Client as NotionClient } from '@notionhq/client';
import {
  GetDatabaseResponse,
  ListBlockChildrenResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';

import { NotionConfig } from '../config/interfaces/NotionConfig';
import { Block, NotionBlock, PageDetails, isBlock } from './types';

@Injectable()
export class NotionService {
  private config: NotionConfig;
  private client: NotionClient;

  constructor(private configService: ConfigService) {
    this.config = this.getConfig();
    this.client = this.getClient();
  }

  public getConfig(): NotionConfig {
    return this.configService.get<NotionConfig>(NotionConfig.CONFIG_KEY, {
      infer: true,
    });
  }

  public getClient(): NotionClient {
    if (this.client) {
      return this.client;
    }
    return new NotionClient({ auth: this.config.integrationToken });
  }

  public async getDatabase(): Promise<GetDatabaseResponse> {
    return this.client.databases.retrieve({
      database_id: this.config.databaseID,
    });
  }

  public async getLessons(): Promise<PageDetails[]> {
    const lessons = await this.getPagesByType('lesson');
    return this.parsePageResults(lessons);
  }

  public async getExercises(): Promise<PageDetails[]> {
    const exercises = await this.getPagesByType('exercise');
    return this.parsePageResults(exercises);
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

      if (!has_more) {
        break;
      }
      start_cursor = next_cursor;
    }

    return blocks;
  }

  private async getPages(filter?): Promise<QueryDatabaseResponse> {
    return this.client.databases.query({
      database_id: this.config.databaseID,
      filter,
    });
  }

  private async getPagesByType(
    type: 'lesson' | 'exercise',
  ): Promise<QueryDatabaseResponse> {
    return this.getPages({
      property: 'Type',
      select: {
        equals: type,
      },
    });
  }

  private parsePageResults(pages: QueryDatabaseResponse): PageDetails[] {
    const parsedPages = pages.results.map((page) => {
      const pg = {
        id: page.id,
      } as PageDetails;

      for (const [k, v] of Object.entries(page.properties)) {
        if (v.type === 'title') {
          pg.title = v.title[0].plain_text;
        }
        if (k.toLowerCase().includes('type')) {
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
    return this.client.blocks.children.list({
      block_id: blockID,
      start_cursor,
    });
  }
}
