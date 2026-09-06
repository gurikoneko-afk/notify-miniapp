const API_URL = 'https://appreciation-solving-readings-hat.trycloudflare.com/webhook/notify-miniapp-api';

async function callNotifyApi(action, payload = {}) {
  const idToken = liff.getIDToken();

  if (!idToken) {
    throw new Error('LINE ID tokenを取得できませんでした');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      payload,
      idToken,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
