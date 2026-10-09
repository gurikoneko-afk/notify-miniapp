const API_URL =
  'https://hooks.refine-agent.com/webhook/notify-miniapp-api';

async function callNotifyApi(
  action,
  payload = {},
  { timeoutMs = 20000 } = {}
) {
  const auth = await window.NotifyAuth.getApiAuth();

  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(API_URL, {
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
    });

    let result;

    try {
      result = await response.json();
    } catch (error) {
      if (timedOut) throw error;
      throw new Error('INVALID_API_RESPONSE');
    }

    if (timedOut) throw new Error('API_TIMEOUT');
    if (!response.ok) {
      throw new Error(
        result?.code || `API_ERROR_${response.status}`
      );
    }

    return result;
  } catch (error) {
    if (timedOut) throw new Error('API_TIMEOUT');
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

window.NotifyApi = {
  call: callNotifyApi,

  home: {
    get() {
      return callNotifyApi('home.get');
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
