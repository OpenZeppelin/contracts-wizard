import type { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol';
import type { Implementation, ServerRequest, ServerNotification } from '@modelcontextprotocol/sdk/types';

export const testMcpInfo: Implementation = {
    name: 'test',
    version: '0.0.0',
};

export const testMcpContext: RequestHandlerExtra<ServerRequest, ServerNotification> = {
    signal: { aborted: false } as AbortSignal,
    requestId: 'test-request-id',
    sendNotification: async () => { },
    sendRequest: async () => ({} as any),
};