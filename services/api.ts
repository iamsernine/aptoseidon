/**
 * Aptoseidon backend API client.
 * Uses VITE_API_URL or falls back to http://localhost:8000.
 */

import type { PreCheckData, RiskReport } from '../types';
import type { ProjectType } from '../types';

// In dev with Vite, use relative URLs so the proxy forwards to the backend (no CORS).
// Use '/api' as base to match Netlify proxy, or VITE_API_URL if provided.
const getApiBase = (): string => {
  const env = (import.meta as any).env;
  if (env?.VITE_API_URL) return env.VITE_API_URL;
  if (env?.DEV) return ''; // Vite dev: use local proxy
  return '/api'; // Production: use Netlify proxy
};
const API_BASE = getApiBase();

export type AuditResponseHighRisk = {
  status: 'high_risk';
  message: string;
  preCheck: PreCheckData;
};

export type AuditResponsePreCheckOk = {
  status: 'pre_check_ok';
  message: string;
  preCheck: PreCheckData;
};

export type AuditResponseOk = {
  status: 'ok';
  preCheck: PreCheckData;
  report: RiskReport;
  jobId: string;
};

export type AuditResponse = AuditResponseHighRisk | AuditResponsePreCheckOk | AuditResponseOk;

export type AuditRequestBody = {
  project_url: string;
  project_type: ProjectType;
  wallet_address: string;
  payment_tx_hash: string | null;
  request_mode?: 'pre_check' | 'full';
  evidence_only?: boolean;
};

export class PaymentRequiredError extends Error {
  recipient: string;
  amount: number;
  message: string;

  constructor(recipient: string, amount: number, message: string) {
    super(message);
    this.name = 'PaymentRequiredError';
    this.recipient = recipient;
    this.amount = amount;
    this.message = message;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let errDetail = res.statusText;
    try {
      const err = JSON.parse(text);
      errDetail = err.detail || err.message || res.statusText;

      if (res.status === 402 && err.detail && typeof err.detail === 'object') {
        throw new PaymentRequiredError(
          err.detail.recipient,
          err.detail.amount,
          err.detail.message || "Payment Required"
        );
      }
    } catch {
      // Not JSON, use the status text or first 100 chars of body
      errDetail = `HTTP ${res.status}: ${text.slice(0, 100)}`;
    }

    throw new Error(errDetail);
  }

  try {
    return await res.json() as Promise<T>;
  } catch (e) {
    const text = await res.clone().text();
    console.error("Failed to parse JSON response:", text.slice(0, 200));
    throw new Error(`Invalid JSON response from server: ${text.slice(0, 50)}...`);
  }
}

/** POST /analyze – Agentic analysis endpoint */
export async function postAudit(body: AuditRequestBody): Promise<AuditResponse> {
  // Map frontend body to backend expected body if needed, currently matches keys
  return request<AuditResponse>('/analyze', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/** POST /reputation/rate – submit thumbs up/down for a job. */
export async function postReputationRate(jobId: string, rating: 'up' | 'down'): Promise<{ status: string; job_id: string; rating: string }> {
  return request('/reputation/rate', {
    method: 'POST',
    body: JSON.stringify({ job_id: jobId, rating }),
  });
}

/** GET /reputation/rate/{job_id} – get up/down counts. */
export async function getReputationRatings(jobId: string): Promise<{ job_id: string; up: number; down: number }> {
  return request(`/reputation/rate/${encodeURIComponent(jobId)}`);
}
