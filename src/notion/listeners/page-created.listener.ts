import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { QUEUES, EVENTS, JOBS } from '../constants';
import { PageCreatedEvent } from '../events';

@Injectable()
export class PageCreatedListener {
  constructor(
    @InjectQueue(QUEUES.NOTION_JOBS)
    private jobsQueue: Queue,
  ) {}

  @OnEvent(EVENTS.PAGE_CREATED)
  handlePageCreatedEvent(event: PageCreatedEvent) {
    console.log(event);

    this.jobsQueue.add(JOBS.CREATE_CONTENT, {});
  }
}
