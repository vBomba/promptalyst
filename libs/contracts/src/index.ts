/** Shared API contracts between Angular and Nest (no runtime imports required). */

export type AiChatRole = 'system' | 'user' | 'assistant';

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

/** Client → Nest: structured UI / product events (no prompt text). */
export interface TelemetryClientEventDto {
  event: string;
  properties?: Record<string, unknown>;
  path?: string;
}
