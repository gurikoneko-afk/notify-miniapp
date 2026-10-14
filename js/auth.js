let activeAuthAdapter = null;

async function initAuth() {
  activeAuthAdapter = null;
  if (!window.LineAuthAdapter) {
    throw new Error('AUTH_ADAPTER_NOT_FOUND');
  }

  const adapter = window.LineAuthAdapter;
  const result = await adapter.init();
  if (!result.loginRedirecting) activeAuthAdapter = adapter;
  return result;
}

async function getApiAuth() {
  if (!activeAuthAdapter) {
    throw new Error('AUTH_NOT_INITIALIZED');
  }

  return await activeAuthAdapter.getApiAuth();
}

window.NotifyAuth = {
  init: initAuth,
  getApiAuth,
};
