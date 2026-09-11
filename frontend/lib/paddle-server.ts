import {
  Paddle,
  Environment,
  LogLevel,
  CurrencyCode,
  TaxCategory,
} from "@paddle/paddle-node-sdk";
import { PADDLE_ENV } from "@/config/paddle";

let _paddleInstance: Paddle | null = null;

/**
 * Returns a cached singleton instance of the Paddle Node SDK.
 * Returns null if PADDLE_API_KEY is missing or in placeholder state.
 */
export function getPaddleServerInstance(): Paddle | null {
  const apiKey = process.env.PADDLE_API_KEY;

  if (!apiKey || apiKey.includes("YOUR_") || apiKey.includes("pdl_sdbx_apikey_here")) {
    return null;
  }

  if (!_paddleInstance) {
    _paddleInstance = new Paddle(apiKey, {
      environment:
        PADDLE_ENV === "production" ? Environment.production : Environment.sandbox,
      logLevel: process.env.NODE_ENV === "production" ? LogLevel.error : LogLevel.verbose,
    });
  }

  return _paddleInstance;
}

export function isPaddleServerConfigured(): boolean {
  return getPaddleServerInstance() !== null;
}

export interface CreateTransactionParams {
  clientName: string;
  clientEmail: string;
  amount: number;
  currency?: string;
  service?: string;
  invoiceNumber?: string;
  projectRef?: string;
}

/**
 * Creates a Paddle Transaction for a custom milestone or invoice settlement.
 */
export async function createPaddleTransaction(params: CreateTransactionParams) {
  const paddle = getPaddleServerInstance();
  if (!paddle) {
    throw new Error(
      "Paddle server SDK is not configured. Please provide PADDLE_API_KEY in environment variables."
    );
  }

  const {
    clientName,
    clientEmail,
    amount,
    currency = "USD",
    service = "Technical Services Deposit",
    invoiceNumber,
    projectRef,
  } = params;

  // Ensure minimum valid amount in minor units (cents)
  const minorUnits = Math.round(amount * 100);
  const currencyCode = (currency.toUpperCase() as CurrencyCode) || ("USD" as CurrencyCode);
  const reference = invoiceNumber || projectRef || `DEP-${Date.now().toString().slice(-6)}`;

  // Find or create customer
  let customerId: string | undefined;
  try {
    const existing = await paddle.customers.list({ email: [clientEmail] }).next();
    if (existing && existing.length > 0) {
      customerId = existing[0].id;
    } else {
      const newCustomer = await paddle.customers.create({
        email: clientEmail,
        name: clientName,
      });
      customerId = newCustomer.id;
    }
  } catch (err) {
    console.warn("Could not retrieve or create Paddle customer, proceeding with ad-hoc checkout:", err);
  }

  // Create transaction with non-catalog item
  const transaction = await paddle.transactions.create({
    customerId: customerId || null,
    currencyCode,
    items: [
      {
        price: {
          name: `${service} (${reference})`,
          description: `Settlement for reference ${reference}. Client: ${clientName}`,
          unitPrice: {
            amount: String(minorUnits),
            currencyCode,
          },
          product: {
            name: "Tauqeer Mustafa Inc. - Engineering & Technical Services",
            taxCategory: "standard" as TaxCategory,
            description: "Institutional engineering, digital platforms & architecture services.",
          },
        },
        quantity: 1,
      },
    ],
    customData: {
      clientName,
      clientEmail,
      invoiceNumber: reference,
      service,
    },
  });

  return transaction;
}

/**
 * Mints a secure, time-limited Customer Portal session URL.
 */
export async function createPaddleCustomerPortalSession(
  customerIdentifier: string,
  subscriptionIds: string[] = []
) {
  const paddle = getPaddleServerInstance();
  if (!paddle) {
    throw new Error("Paddle server SDK is not configured.");
  }

  let customerId = customerIdentifier;

  // If passed an email address, look up the customer ID
  if (customerIdentifier.includes("@")) {
    const list = await paddle.customers.list({ email: [customerIdentifier] }).next();
    if (!list || list.length === 0) {
      throw new Error(`No Paddle customer found with email: ${customerIdentifier}`);
    }
    customerId = list[0].id;
  }

  const session = await paddle.customerPortalSessions.create(customerId, subscriptionIds);
  return session;
}
