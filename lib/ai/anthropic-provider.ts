/**
 * DEPRECATED — replaced by lib/ai/nvidia-provider.ts (NVIDIA NIM free API).
 *
 * This file is intentionally kept as a tombstone so any future engineer
 * who sees it understands the migration path rather than thinking the
 * Anthropic SDK was never used. The @anthropic-ai/sdk package can be
 * removed from package.json once the seed script no longer references it
 * (already migrated) and this file is deleted.
 *
 * To re-add Anthropic support: implement the AIProvider interface from
 * lib/ai/provider.ts using the SDK, then swap the import in actions/ai.ts.
 */
export {};
