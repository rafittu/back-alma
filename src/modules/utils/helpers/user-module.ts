export const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;

export const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

export const ipAddressToInteger = (ip: string): number => {
  return (
    ip.split('.').reduce((acc, cur) => (acc << 8) + parseInt(cur, 10), 0) >>> 0
  );
};

export const integerToIPAddress = (ipAddress: number): string => {
  const bytes = new Uint8Array([
    (ipAddress >> 24) & 0xff,
    (ipAddress >> 16) & 0xff,
    (ipAddress >> 8) & 0xff,
    ipAddress & 0xff,
  ]);

  if (ipv4Regex.test(bytes.join('.'))) {
    return bytes.join('.');
  } else if (ipv6Regex.test(bytes.join(':'))) {
    return bytes
      .reduce((acc, cur) => acc + cur.toString(16).padStart(2, '0'), '')
      .replace(/(.{4})/g, '$1:')
      .slice(0, -1)
      .replace(/(:0)+:/, '::');
  }
};
