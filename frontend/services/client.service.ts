import { API_ENDPOINTS } from "@/constants/api";
import { apiRequest } from "@/lib/api-client";
import type { ApiResponse } from "@/types/api";
import type { ClientThread, ClientThreadMessage } from "@/types/client";

/**
 * Staff side of the client portal's "Direct line".
 *
 * The client portal has always let a client post a note, but nothing could
 * write a message they did not author and no staff surface read the table — so
 * the thread was write-only and their unread counter could never leave zero.
 * These two manager-gated routes are the other half of that conversation.
 *
 * `apiRequest` returns the raw HTTP body (the `ApiResponse` envelope), so each
 * method must unwrap `.data` to give consumers the payload they expect.
 */
export const clientMessageService = {
  /** Every client conversation, clients awaiting a reply first. */
  threads: async (clientId?: string) => {
    const response = await apiRequest<ApiResponse<ClientThread[]>>({
      url: API_ENDPOINTS.clients.threads,
      method: "GET",
      params: clientId ? { clientId } : undefined,
    });
    return response.data;
  },
  /** Answer a client as the signed-in staff member. */
  reply: async (clientId: string, body: string) => {
    const response = await apiRequest<ApiResponse<ClientThreadMessage>>({
      url: API_ENDPOINTS.clients.reply(clientId),
      method: "POST",
      data: { body },
    });
    return response.data;
  },
};
