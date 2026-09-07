"use client";

import { useMutation } from "@tanstack/react-query";

import { contactService } from "@/services";
import type { Contact } from "@/types";

export function useContact() {
  return useMutation({
    mutationFn: (payload: Contact) => contactService.submit(payload),
  });
}
