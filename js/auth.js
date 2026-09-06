let activeAuthAdapter = null;

async function initAuth() {
  if (window.LineAuthAdapter) {
    activeAuthAdapter = window.LineAuthAdapter;
  } else {
    throw new Error('AUTH_ADAPTER_NOT_FOUND');
  }

  return await activeAuthAdapter.init();
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
