let activeAuthAdapter = null;
let authRecoveryPromise = null;
let authRecoveryStarted = false;
const AUTH_RECOVERY_ATTEMPT_KEY = 'notify_auth_recovery_attempted';

// Only a flag inherited from a previous page load may be cleared by API success.
let recoveryAttemptFromPreviousLoad = false;
try {
  recoveryAttemptFromPreviousLoad = sessionStorage.getItem(AUTH_RECOVERY_ATTEMPT_KEY) !== null;
} catch {
  // Storage availability is checked again before any automatic navigation.
}

function createAuthRecoveryError(code, started = false) {
  const error = new Error(code);
  error.code = code;
  error.authRecoveryRequired = true;
  error.authRecoveryStarted = started;
  return error;
}

function recoverAuth() {
  if (authRecoveryPromise) return authRecoveryPromise;
  // Assign the shared promise before invoking any adapter or storage operation.
  authRecoveryPromise = Promise.resolve().then(async () => {
    try {
      if (sessionStorage.getItem(AUTH_RECOVERY_ATTEMPT_KEY) !== null) {
        throw new Error('AUTH_RECOVERY_FAILED');
      }
      sessionStorage.setItem(AUTH_RECOVERY_ATTEMPT_KEY, '1');
      authRecoveryStarted = true;
      await window.LineAuthAdapter.recoverAuth();
    } catch (error) {
      authRecoveryStarted = false;
      const allowed = ['LIFF_ORIGIN_NOT_ALLOWED', 'LINE_LOGIN_REQUIRES_DEV_ORIGIN',
        'PROD_EXTERNAL_LOGIN_NOT_READY'];
      const code = allowed.includes(error?.message) ? error.message : 'AUTH_RECOVERY_FAILED';
      throw createAuthRecoveryError(code);
    }
    // login/reload return before navigation finishes. Never resume the API caller.
    throw createAuthRecoveryError('AUTH_RECOVERY_STARTED', true);
  });
  return authRecoveryPromise;
}

function clearRecoveryAttempt() {
  if (!recoveryAttemptFromPreviousLoad || authRecoveryPromise) return;
  try {
    sessionStorage.removeItem(AUTH_RECOVERY_ATTEMPT_KEY);
    recoveryAttemptFromPreviousLoad = false;
  } catch {
    // Leave the guard in place when storage cannot be accessed.
  }
}

async function initAuth() {
  activeAuthAdapter = null;
  if (!window.LineAuthAdapter) {
    throw new Error('AUTH_ADAPTER_NOT_FOUND');
  }

  const adapter = window.LineAuthAdapter;
  let result;
  try {
    result = await adapter.init({ recoveryAttempted: recoveryAttemptFromPreviousLoad });
  } catch (error) {
    if (error?.code === 'AUTH_REAUTH_REQUIRED') return await recoverAuth();
    if (error?.message === 'AUTH_RECOVERY_FAILED') throw createAuthRecoveryError('AUTH_RECOVERY_FAILED');
    throw error;
  }
  if (!result.loginRedirecting) activeAuthAdapter = adapter;
  return result;
}

async function getApiAuth() {
  if (authRecoveryPromise) return await authRecoveryPromise;
  if (!activeAuthAdapter) {
    throw new Error('AUTH_NOT_INITIALIZED');
  }

  return await activeAuthAdapter.getApiAuth();
}

window.NotifyAuth = {
  init: initAuth,
  getApiAuth,
  recoverAuth,
  isRecoveringAuth: () => authRecoveryStarted,
  clearRecoveryAttempt,
};
