function resolveLineLiffId() {
  switch (location.origin) {
    case 'http://127.0.0.1:8080':
    case 'https://dev.refine-agent.com':
      return '2011459717-DgyR41pJ';
    case 'https://gurikoneko-afk.github.io':
      return '2011459720-gZS9Usy7';
    default:
      throw new Error('LIFF_ORIGIN_NOT_ALLOWED');
  }
}

window.LineAuthAdapter = {
  async init({ recoveryAttempted = false } = {}) {
    const liffId = resolveLineLiffId();
    try {
      await liff.init({ liffId });
    } catch (error) {
      throw new Error('LIFF_INIT_FAILED');
    }

    const isInClient = liff.isInClient();
    if (!liff.isLoggedIn()) {
      if (isInClient) throw new Error('LINE_LOGIN_REQUIRED');
      if (location.origin === 'http://127.0.0.1:8080') {
        throw new Error('LINE_LOGIN_REQUIRES_DEV_ORIGIN');
      }
      if (location.origin === 'https://gurikoneko-afk.github.io') {
        throw new Error('PROD_EXTERNAL_LOGIN_NOT_READY');
      }

      if (recoveryAttempted) throw new Error('AUTH_RECOVERY_FAILED');

      try {
        liff.login({ redirectUri: window.location.href });
      } catch (error) {
        throw new Error('LINE_LOGIN_REQUIRED');
      }
      return {
        authenticated: false,
        isInClient,
        provider: 'line',
        loginRedirecting: true,
        status: 'LINE_LOGIN_REQUIRED',
      };
    }

    // Confirm token availability without storing it in initialization state.
    await this.getApiAuth();
    return {
      authenticated: true,
      isInClient,
      provider: 'line',
      status: 'AUTH_READY',
    };
  },

  async getApiAuth() {
    if (!liff.isLoggedIn()) {
      throw new Error('LINE_LOGIN_REQUIRED');
    }

    // Decoded expiry is only a UX hint; the backend still verifies every token.
    let exp;
    try {
      if (typeof liff.getDecodedIDToken === 'function') {
        exp = liff.getDecodedIDToken()?.exp;
      }
    } catch {
      // If expiry cannot be determined, retain the normal backend verification.
    }
    if (typeof exp === 'number' && Number.isFinite(exp) && Date.now() / 1000 >= exp) {
      const error = new Error('AUTH_REAUTH_REQUIRED');
      error.code = 'AUTH_REAUTH_REQUIRED';
      throw error;
    }

    const idToken = liff.getIDToken();

    if (!idToken) {
      throw new Error('ID_TOKEN_MISSING');
    }

    return {
      idToken,
    };
  },

  async recoverAuth() {
    resolveLineLiffId();
    const isInClient = liff.isInClient();
    if (isInClient) {
      window.location.reload();
      return;
    }
    if (location.origin === 'https://dev.refine-agent.com') {
      liff.logout();
      liff.login({ redirectUri: window.location.href });
      return;
    }
    if (location.origin === 'http://127.0.0.1:8080') {
      throw new Error('LINE_LOGIN_REQUIRES_DEV_ORIGIN');
    }
    throw new Error('PROD_EXTERNAL_LOGIN_NOT_READY');
  },
};
