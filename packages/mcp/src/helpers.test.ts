import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol';
import type { ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types';

export const mcpServerTestContext: RequestHandlerExtra<ServerRequest, ServerNotification> = {
    signal: { aborted: false } as AbortSignal,
    requestId: 'test-request-id',
    sendNotification: async () => { },
    sendRequest: async () => ({} as any),
};