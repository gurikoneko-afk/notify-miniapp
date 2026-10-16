function getNotifyApiUrl() {
  switch (location.origin) {
    case 'http://127.0.0.1:8080':
      return 'http://127.0.0.1:5678/webhook/notify-miniapp-api';
    case 'https://dev.refine-agent.com':
      return 'https://dev-api.refine-agent.com/webhook/notify-miniapp-api';
    case 'https://gurikoneko-afk.github.io':
      return 'https://hooks.refine-agent.com/webhook/notify-miniapp-api';
    default:
      throw new Error('API_ORIGIN_NOT_ALLOWED');
  }
}

// Temporary diagnostics: exact DEV origin only; fixed codes, never raw error data.
const DEV_API_DIAGNOSTIC_CODES = new Set([
  'API_ORIGIN_NOT_ALLOWED', 'AUTH_NOT_INITIALIZED', 'AUTH_ADAPTER_NOT_FOUND',
  'AUTH_REQUIRED', 'LINE_ID_TOKEN_UNAVAILABLE', 'API_AUTH_FAILED',
  'API_REQUEST_BUILD_FAILED', 'API_FETCH_FAILED', 'API_HTTP_ERROR',
  'API_JSON_PARSE_FAILED', 'API_RESPONSE_ERROR', 'API_TIMEOUT', 'API_UI_ERROR'
]);

function withDevApiDiagnostic(error, code) {
  if (location.origin !== 'https://dev.refine-agent.com') return error;
  const tagged = error instanceof Error ? error : new Error('API_ERROR');
  tagged.devDiagnosticCode = code;
  return tagged;
}

function getDevApiErrorCode(error) {
  if (location.origin !== 'https://dev.refine-agent.com') return null;
  return DEV_API_DIAGNOSTIC_CODES.has(error?.devDiagnosticCode)
    ? error.devDiagnosticCode
    : 'API_UI_ERROR';
}

function createNotifyApiResponseError(response) {
  return withDevApiDiagnostic(
    new Error(response?.code || 'API_ERROR'),
    'API_RESPONSE_ERROR'
  );
}

async function callNotifyApi(
  action,
  payload = {},
  { timeoutMs = 20000 } = {}
) {
  let apiUrl;
  try {
    apiUrl = getNotifyApiUrl();
  } catch (error) {
    throw withDevApiDiagnostic(error, 'API_ORIGIN_NOT_ALLOWED');
  }

  let auth;
  try {
    auth = await window.NotifyAuth.getApiAuth();
  } catch (error) {
    const authCodes = ['AUTH_NOT_INITIALIZED', 'AUTH_ADAPTER_NOT_FOUND',
      'AUTH_REQUIRED', 'LINE_ID_TOKEN_UNAVAILABLE'];
    const code = authCodes.includes(error?.message) ? error.message : 'API_AUTH_FAILED';
    throw withDevApiDiagnostic(error, code);
  }

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  let boundary = 'API_REQUEST_BUILD_FAILED';
  try {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        payload,
        ...auth,
      }),
      signal: controller.signal,
    };
    boundary = 'API_FETCH_FAILED';
    const response = await fetch(apiUrl, requestOptions);

    boundary = 'API_JSON_PARSE_FAILED';
    let result;

    try {
      result = await response.json();
    } catch (error) {
      if (timedOut) throw error;
      throw new Error('INVALID_API_RESPONSE');
    }

    if (timedOut) throw new Error('API_TIMEOUT');
    boundary = 'API_HTTP_ERROR';
    if (!response.ok) {
      throw new Error(
        result?.code || `API_ERROR_${response.status}`
      );
    }

    return result;
  } catch (error) {
    if (timedOut) throw withDevApiDiagnostic(new Error('API_TIMEOUT'), 'API_TIMEOUT');
    throw withDevApiDiagnostic(error, boundary);
  } finally {
    clearTimeout(timeoutId);
  }
}

window.NotifyApi = {
  call: callNotifyApi,
  getDevErrorCode: getDevApiErrorCode,
  responseError: createNotifyApiResponseError,

  home: {
    get() {
      return callNotifyApi('home.get');
    },
  },
  notification: {
    list({ limit = 50 } = {}) {
      return callNotifyApi('notification.list', { limit });
    },
  },
  
favorite: {
  list() {
    return callNotifyApi(
      'favorite.list'
    );
  },

  setEnabled(favoriteId, enabled) {
    return callNotifyApi(
      'favorite.enabled.set',
      {
        favoriteId,
        enabled
      }
    );
  },

  updateSettings(
  favoriteId,
  notificationSettings
) {
  return callNotifyApi(
    'favorite.settings.update',
    {
      favoriteId,
      notificationSettings
    }
  );
},

deleteFavorite(favoriteId) {
  return callNotifyApi(
    'favorite.delete',
    {
      favoriteId
    }
  );
},

cancelDraft(draftId) {
  return callNotifyApi(
    'favorite.draft.cancel',
    {
      draftId
    }
  );
},

},
  
  plan: {
    get() {
      return callNotifyApi('plan.get');
    },

    select(planId) {
      return callNotifyApi(
        'plan.select',
        { planId }
      );
    },
  },

  purchase: {
    start(planId) {
      return callNotifyApi(
        'purchase.start',
        { planId },
        { timeoutMs: 60000 }
      );
    },
  },
};
