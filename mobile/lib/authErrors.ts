import { strings } from './i18n';

/**
 * Turns a Supabase Auth error into a friendly message in the app's current language.
 *
 * Supabase sends a machine-readable `code` (e.g. `email_not_confirmed`,
 * `over_email_send_rate_limit`) plus an English `message`; the code is checked first, the
 * message is the fallback for older servers. Anything unknown gets a neutral text instead of
 * Supabase's English wording.
 */
export type AuthErrorLike = { message?: string; code?: string; status?: number; name?: string };

export function friendlyAuthError(err: AuthErrorLike | string): string {
  const e = strings().auth.errors;
  const { message = '', code = '', status, name = '' } = typeof err === 'string' ? { message: err } : err;
  const m = message.toLowerCase();

  switch (code) {
    case 'invalid_credentials':
      return e.invalidLogin;
    case 'email_not_confirmed':
      return e.emailNotConfirmed;
    case 'user_already_exists':
    case 'email_exists':
      return e.alreadyRegistered;
    case 'weak_password':
      return m.includes('at least') ? e.passwordTooShort : e.weakPassword;
    case 'same_password':
      return e.samePassword;
    case 'email_address_invalid':
    case 'email_address_not_authorized':
      return e.invalidEmail;
    case 'signup_disabled':
    case 'email_provider_disabled':
      return e.signupDisabled;
    case 'over_email_send_rate_limit':
      return e.rateLimitEmail;
    case 'over_request_rate_limit':
    case 'over_sms_send_rate_limit':
      return e.rateLimit;
    case 'otp_expired':
    case 'flow_state_expired':
    case 'flow_state_not_found':
    case 'bad_code_verifier':
    case 'bad_oauth_state':
      return e.linkInvalid;
  }

  if (m.includes('invalid login credentials')) return e.invalidLogin;
  if (m.includes('email not confirmed')) return e.emailNotConfirmed;
  if (m.includes('already registered')) return e.alreadyRegistered;
  if (m.includes('password should be at least')) return e.passwordTooShort;
  if (m.includes('email rate limit') || m.includes('you can only request this after')) return e.rateLimitEmail;
  if (m.includes('rate limit') || status === 429) return e.rateLimit;
  if (m.includes('code verifier') || m.includes('expired') || m.includes('flow state')) return e.linkInvalid;
  if (m.includes('network') || m.includes('failed to fetch') || name === 'AuthRetryableFetchError') return e.network;
  return e.generic;
}

/** True if the error means "account exists but the email address isn't confirmed yet". */
export function isUnconfirmed(err: AuthErrorLike): boolean {
  return err.code === 'email_not_confirmed' || (err.message ?? '').toLowerCase().includes('email not confirmed');
}
