const EMAIL_PATTERN = /([a-zA-Z0-9._%+-]{2})[a-zA-Z0-9._%+-]*@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
const PHONE_PATTERN = /(\+\d{2})(\d{4,})(\d{3})\b/g;

export function maskPii(value: unknown): unknown {
  if (typeof value === 'string') {
    return value
      .replace(EMAIL_PATTERN, '$1***@$2')
      .replace(PHONE_PATTERN, (_, prefix: string, middle: string, suffix: string) => `${prefix}${'*'.repeat(middle.length)}${suffix}`);
  }

  if (Array.isArray(value)) {
    return value.map((item) => maskPii(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, maskPii(item)]));
  }

  return value;
}
