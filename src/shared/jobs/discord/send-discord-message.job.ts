export enum ChannelName {
  general = 'general',
  logging = 'logging',
  events = 'events',
}

export interface SendDiscordMessageJob {
  channel: ChannelName;
  message: string;
}
