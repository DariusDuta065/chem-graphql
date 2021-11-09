import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { QUEUES, EVENTS, JOBS } from '../constants';
import { PageUpdatedEvent } from '../events';

@Injectable()
export class PageUpdatedListener {
  constructor(
    @InjectQueue(QUEUES.NOTION_JOBS)
    private jobsQueue: Queue,
  ) {}

  @OnEvent(EVENTS.PAGE_UPDATED)
  handlePageUpdatedEvent(event: PageUpdatedEvent) {
    console.log(event);

    // this.jobsQueue.add(JOBS.UPDATE_CONTENT, {});
  }
}
