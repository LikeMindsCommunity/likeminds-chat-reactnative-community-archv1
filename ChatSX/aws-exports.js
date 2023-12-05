const chars =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
export const Base64 = {
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
  btoa: (input = '') => {
    let str = input;
    let output = '';
    let remainder = str.length % 3;

    for (
      let block, charCode, idx = 0, map = chars;
      (block = str.charCodeAt(idx++));

    ) {
      charCode = (charCode << 8) | block;
      if (idx % 3 == 0 || remainder) {
        output += map.charAt((charCode >> ((6 - (idx % 3) * 2) & 6)) & 63);
        charCode = 0;
      }
    }

    // Add padding if needed
    return output + (remainder ? '=='.slice(remainder) : '');
  },
};

export const REGION = Base64.atob('YXAtc291dGgtMQ==');
export const POOL_ID = Base64.atob(
  'YXAtc291dGgtMTpkNzNiYzJlZC1iZWRlLTQyYzgtYmFiNy0wYWJlMGEwMDEzMjU=',
);
export const BUCKET = Base64.atob('cHJvZC1saWtlbWluZHMtbWVkaWE=');

export const GIPHY_SDK_API_KEY = Base64.atob(
  'dUZXZ2g1Rmw5SDN0Qm1vZ1VxY2JEajFFZm5RUGNNVVg=',
);
