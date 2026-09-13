const API_URL =
  'https://appreciation-solving-readings-hat.trycloudflare.com/webhook/notify-miniapp-api';

async function callNotifyApi(action, payload = {}) {
  const auth = await window.NotifyAuth.getApiAuth();

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
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error('INVALID_API_RESPONSE');
  }

  if (!response.ok) {
    throw new Error(
      result?.code || `API_ERROR_${response.status}`
    );
  }

  return result;
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
        { planId }
      );
    },
  },
};
