export class LMChatAnalytics {
  static track(eventName: string, eventProperties?: Map<string, string>) {
    console.log('eventName', eventName);
    console.log('eventProperties', eventProperties);
  }
}
