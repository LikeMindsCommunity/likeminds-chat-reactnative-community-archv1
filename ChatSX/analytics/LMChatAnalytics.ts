export class LMChatAnalytics {
  static track(eventName: string, eventProperties?: Map<string, string>) {
    //TODO - Add your analytics function here
    console.log('eventName', eventName);
    console.log('eventProperties', eventProperties);
  }
}
