export function track(
  eventName: string,
  eventProperties?: Map<string, string>,
) {
  console.log('eventName', eventName);
  console.log('eventProperties', eventProperties);
}
