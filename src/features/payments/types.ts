export interface PaymentMethod {
  id: string;
  type: "credit_card" | "debit_card" | "pix";
  brand?: string;
  last4?: string;
  expiry?: string;
  pixKey?: string;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "failed";
  pdfUrl?: string;
}

export interface Subscription {
  planName: string;
  price: number;
  billingCycle: "mensal" | "anual";
  nextBillingDate: string;
  status: "active" | "canceled";
}
