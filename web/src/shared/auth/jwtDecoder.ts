export const decodeJwt = (jwtToken: string): Record<string, unknown> | null => {
  try {
    const tokenParts = jwtToken.split('.');
    if (tokenParts.length !== 3) {
      return null;
    }
    const rawPayload = tokenParts[1];
    const base64Url = rawPayload.replace(/-/g, '+').replace(/_/g, '/');
    const base64 = atob(base64Url);
    const utf8Decoder = new TextDecoder('utf-8');
    const bytes = new Uint8Array(base64.split('').map((char) => char.charCodeAt(0)));
    return JSON.parse(utf8Decoder.decode(bytes));
  } catch {
    return null;
  }
};
