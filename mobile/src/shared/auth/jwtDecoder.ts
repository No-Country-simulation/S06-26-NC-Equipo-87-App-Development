const decodeBase64 = (base64UrlString: string): string => {
  const base64Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const lookupTable = new Uint8Array(256);
  
  for (let index = 0; index < base64Alphabet.length; index++) {
    lookupTable[base64Alphabet.charCodeAt(index)] = index;
  }
  
  let paddedBase64String = base64UrlString;
  while (paddedBase64String.length % 4 !== 0) {
    paddedBase64String += '=';
  }

  let finalBufferLength = paddedBase64String.length * 0.75;
  if (paddedBase64String[paddedBase64String.length - 1] === '=') {
    finalBufferLength--;
    if (paddedBase64String[paddedBase64String.length - 2] === '=') {
      finalBufferLength--;
    }
  }

  const decodedBytes = new Uint8Array(finalBufferLength);
  let bytePointer = 0;
  
  for (let index = 0; index < paddedBase64String.length; index += 4) {
    const codePoint1 = lookupTable[paddedBase64String.charCodeAt(index)];
    const codePoint2 = lookupTable[paddedBase64String.charCodeAt(index + 1)];
    const codePoint3 = lookupTable[paddedBase64String.charCodeAt(index + 2)];
    const codePoint4 = lookupTable[paddedBase64String.charCodeAt(index + 3)];

    decodedBytes[bytePointer++] = (codePoint1 << 2) | (codePoint2 >> 4);
    if (bytePointer < finalBufferLength) {
      decodedBytes[bytePointer++] = ((codePoint2 & 15) << 4) | (codePoint3 >> 2);
    }
    if (bytePointer < finalBufferLength) {
      decodedBytes[bytePointer++] = ((codePoint3 & 3) << 6) | (codePoint4 & 63);
    }
  }

  const percentEncodedString = decodedBytes.reduce(
    (accumulator, byte) => accumulator + '%' + byte.toString(16).padStart(2, '0'),
    ''
  );

  return decodeURIComponent(percentEncodedString);
};

export const decodeJwt = (jwtToken: string): Record<string, unknown> | null => {
  try {
    const tokenParts = jwtToken.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }
    const rawPayload = tokenParts[1];
    const normalizedPayload = rawPayload.replace(/-/g, '+').replace(/_/g, '/');
    const parsedJsonString = decodeBase64(normalizedPayload);
    return JSON.parse(parsedJsonString);
  } catch {
    return null;
  }
};
