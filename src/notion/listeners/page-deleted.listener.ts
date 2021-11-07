import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { QUEUES, EVENTS, JOBS } from '../constants';
import { PageDeletedEvent } from '../events';

@Injectable()
export class PageDeletedListener {
  constructor(
    @InjectQueue(QUEUES.NOTION_JOBS)
    private jobsQueue: Queue,
  ) {}

  @OnEvent(EVENTS.PAGE_DELETED)
  handlePageDeletedEvent(event: PageDeletedEvent) {
    console.log(event);

    this.jobsQueue.add(JOBS.DELETE_CONTENT, {});
  }
}
