const LIFF_ID = '2011459717-DgyR41pJ';

window.LineAuthAdapter = {
  async init() {
    await liff.init({
      liffId: LIFF_ID,
    });

    return {
      authenticated: liff.isLoggedIn(),
      isInClient: liff.isInClient(),
      provider: 'line',
    };
  },

  async getApiAuth() {
    if (!liff.isLoggedIn()) {
      throw new Error('AUTH_REQUIRED');
    }

    const idToken = liff.getIDToken();

    if (!idToken) {
      throw new Error('LINE_ID_TOKEN_UNAVAILABLE');
    }

    return {
      idToken,
    };
  },
};
