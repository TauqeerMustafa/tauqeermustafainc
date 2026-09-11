"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  initializePaddle,
  type Paddle,
  type Environments,
  type CheckoutEventsData,
  type CheckoutOpenOptions,
} from "@paddle/paddle-js";
import { paddleConfig } from "@/config/paddle";

let paddleGlobalPromise: Promise<Paddle | undefined> | null = null;
let paddleGlobalInstance: Paddle | null = null;

export interface UsePaddleOptions {
  onCheckoutCompleted?: (data: CheckoutEventsData) => void;
  onCheckoutClosed?: () => void;
  onCheckoutLoaded?: (data: CheckoutEventsData) => void;
}

export function usePaddle(options?: UsePaddleOptions) {
  const [paddle, setPaddle] = useState<Paddle | null>(paddleGlobalInstance);
  const [isLoading, setIsLoading] = useState(!paddleGlobalInstance);
  const [error, setError] = useState<string | null>(null);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!paddleConfig.isConfigured) {
      setIsLoading(false);
      return;
    }

    if (paddleGlobalInstance) {
      setPaddle(paddleGlobalInstance);
      setIsLoading(false);
      return;
    }

    if (!paddleGlobalPromise) {
      paddleGlobalPromise = initializePaddle({
        token: paddleConfig.clientToken,
        environment: paddleConfig.environment as Environments,
        eventCallback: (event) => {
          if (!event || !event.name) return;

          switch (event.name) {
            case "checkout.completed":
              if (event.data) {
                optionsRef.current?.onCheckoutCompleted?.(event.data);
              }
              break;
            case "checkout.closed":
              optionsRef.current?.onCheckoutClosed?.();
              break;
            case "checkout.loaded":
              if (event.data) {
                optionsRef.current?.onCheckoutLoaded?.(event.data);
              }
              break;
            default:
              break;
          }
        },
      });
    }

    paddleGlobalPromise
      .then((instance) => {
        if (instance) {
          paddleGlobalInstance = instance;
          setPaddle(instance);
        }
      })
      .catch((err) => {
        console.error("Failed to initialize Paddle.js:", err);
        setError(err instanceof Error ? err.message : "Failed to load Paddle checkout library");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const openCheckout = useCallback(
    (checkoutOptions: CheckoutOpenOptions) => {
      if (!paddle) {
        throw new Error(
          "Paddle is not initialized yet. Ensure NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is configured."
        );
      }

      // Default to one-page modal overlay with dark/light theme alignment
      const mergedOptions: CheckoutOpenOptions = {
        ...checkoutOptions,
        settings: {
          variant: "one-page",
          displayMode: "overlay",
          theme: "dark",
          ...checkoutOptions.settings,
        },
      };

      paddle.Checkout.open(mergedOptions);
    },
    [paddle]
  );

  return {
    paddle,
    isLoading,
    error,
    isConfigured: paddleConfig.isConfigured,
    isSandbox: paddleConfig.isSandbox,
    environment: paddleConfig.environment,
    openCheckout,
  };
}
