const REGEX_USER_SPLITTING = /(<<[\w\s🤖@]+\|route:\/\/\S+>>)/g;
const REGEX_USER_TAGGING =
  /<<(?<name>[^<>|]+)\|route:\/\/(?<route>[^?]+(\?.+)?)>>/g;

export function getRoute(route: any) {

  let regex = /route:\/\//g;
  let parts = route?.split(regex);
  const searchParams = new URLSearchParams(parts[1]);
  console.log('searchParams ==', searchParams);

}
