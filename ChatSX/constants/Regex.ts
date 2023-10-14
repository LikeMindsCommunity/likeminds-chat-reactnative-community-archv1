export const PATH_REGEX = /^https?:\/\/[^\/]+(\/[^?]+)/i; // this regex helps us to extract path from url
export const QUERY_REGEX = /[?&]([^=#]+)=([^&#]*)/g; //this regex helps us to extract query params from the url
export const VALID_URI_REGEX = /^(https):\/\/[^ "]+$/; // this regex helps us to check whether the given URL is valid or not.
export const REGEX_TO_EXTRACT_PATH = /route:\/\/(.*?)\?/;
export const REGEX_TO_EXTRACT_PARAMS = /[?&]([^=#]+)=([^&#]*)/g;
