/**
 * dsh-hub model-select override — replaces the built-in composer model seat
 * (`conversation.input.model`) with a nested provider -> model menu.
 *
 * The built-in ui-model-selection registers the seat at priority 0; this
 * entry registers at priority -1 so it shadows the built-in (lowest priority
 * wins per the slot registry). It reuses the built-in `modelDirectories`
 * service for the shared per-session model directory, so selection state and
 * the /model command stay consistent.
 *
 * Layout: two adjacent trigger buttons — left opens the supplier list, right
 * opens the thinking-effort list (only "default" when the model has none).
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
declare module '@deepseek-ai/cordis' {
    interface Context {
        modelDirectories: {
            directoryFor(sessionId: string): {
                store: {
                    subscribe(fn: () => void): () => void;
                    getSnapshot(): unknown;
                };
                load(): Promise<void>;
                select(selection: {
                    provider: string;
                    model: string;
                    reasoningEffort?: string;
                }): Promise<void>;
            };
        };
    }
}
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface SlotMap {
        'conversation.input.model': {
            kind: 'single';
            scope: 'session';
            owner: {
                locked?: boolean;
            };
        };
    }
}
/** Register the model-select override into the composer model seat. */
export declare function installModelSelect(ctx: ClientContext): void;
