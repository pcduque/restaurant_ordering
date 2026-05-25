export const MAX_TIMELINE_PAYLOAD_BYTES = 16 * 1024;

export function getJsonPayloadSizeBytes(payload: unknown): number {
  return Buffer.byteLength(JSON.stringify(payload ?? {}), 'utf8');
}

export function isPayloadWithinLimit(payload: unknown): boolean {
  return getJsonPayloadSizeBytes(payload) <= MAX_TIMELINE_PAYLOAD_BYTES;
}
