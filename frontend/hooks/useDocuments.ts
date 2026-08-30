"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/constants/query-keys";
import { documentService } from "@/services";
import type { UploadDocumentPayload } from "@/types";

export function useMyDocuments() {
  return useQuery({
    queryKey: queryKeys.documents.me,
    queryFn: documentService.mine,
  });
}

/** Every document in the vault — admin/manager scope. */
export function useAllDocuments() {
  return useQuery({
    queryKey: queryKeys.documents.all,
    queryFn: documentService.all,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UploadDocumentPayload) => documentService.upload(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.me });
      queryClient.invalidateQueries({ queryKey: queryKeys.documents.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.employee });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.admin });
    },
  });
}
