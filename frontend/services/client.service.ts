import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ClientThread, ClientThreadMessage } from "@/types/client";

/**
 * Staff side of the client portal's "Direct line".
 *
 * The client portal has always let a client post a note, but nothing could
 * write a message they did not author and no staff surface read the table — so
 * the thread was write-only and their unread counter could never leave zero.
 * These two manager-gated routes are the other half of that conversation.
 *
 * Both return bare payloads, not `ApiResponse<T>` — `apiRequest` unwraps the
 * envelope.
 */
export const clientMessageService = {
  /** Every client conversation, clients awaiting a reply first. */
  threads: (clientId?: string) =>
    apiRequest<ClientThread[]>({
      url: API_ENDPOINTS.clients.threads,
      method: "GET",
      params: clientId ? { clientId } : undefined,
    }),
  /** Answer a client as the signed-in staff member. */
  reply: (clientId: string, body: string) =>
    apiRequest<ClientThreadMessage>({
      url: API_ENDPOINTS.clients.reply(clientId),
      method: "POST",
      data: { body },
    }),
};
