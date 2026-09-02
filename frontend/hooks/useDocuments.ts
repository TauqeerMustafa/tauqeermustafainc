"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { documentService } from "@/services";
import type { UploadDocumentFilePayload, UploadDocumentPayload } from "@/types";

/** Every list and dashboard that shows a document count or card. */
function invalidateDocuments(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: queryKeys.documents.me });
  queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.employee });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin });
}

export function useMyDocuments(enabled = true) {
  return useQuery({
    queryKey: queryKeys.documents.me,
    queryFn: documentService.mine,
    enabled,
  });
}

/** Every document in the vault — admin/manager scope. */
export function useAllDocuments(enabled = true) {
  return useQuery({
    queryKey: queryKeys.documents.all,
    queryFn: documentService.all,
    enabled,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadDocumentPayload) => documentService.upload(payload),
    onSuccess: () => invalidateDocuments(queryClient),
  });
}

/** Upload real bytes rather than a link — see `documentService.uploadFile`. */
export function useUploadDocumentFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadDocumentFilePayload) => documentService.uploadFile(payload),
    onSuccess: () => invalidateDocuments(queryClient),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => documentService.remove(id),
    onSuccess: () => invalidateDocuments(queryClient),
  });
}
