const chars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const Base64 = {
  atob: (input = '') => {
    let str = input.replace(/=+$/, '');
    let output = '';

    if (str.length % 4 == 1) {
      throw new Error(
        "'atob' failed: The string to be decoded is not correctly encoded.",
      );
    }
    for (
      let bc = 0, bs = 0, buffer, i = 0;
      (buffer = str.charAt(i++));
      ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
        ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
        : 0
    ) {
      buffer = chars.indexOf(buffer);
    }

    return output;
  },
};

export const REGION = Base64.atob('YXAtc291dGgtMQ==');
export const POOL_ID = Base64.atob(
  'YXAtc291dGgtMTpkNzNiYzJlZC1iZWRlLTQyYzgtYmFiNy0wYWJlMGEwMDEzMjU=',
);
export const BUCKET = Base64.atob('cHJvZC1saWtlbWluZHMtbWVkaWE=');
