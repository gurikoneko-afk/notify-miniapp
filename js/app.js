function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

async function renderHome() {
  const app = document.getElementById('app');

  app.replaceChildren(
    createElement('p', 'loading', '読み込み中...')
  );

  try {
    const response = await NotifyApi.home.get();

    if (!response.ok) {
      throw new Error(response.code || 'API_ERROR');
    }

    const data = response.data;

    const container = createElement('main', 'page');

    container.append(
      createElement('h1', 'logo', 'Notify')
    );

    const planCard = createElement('section', 'card');
    planCard.append(
      createElement('p', 'label', '現在のプラン'),
      createElement('h2', null, data.plan?.name ?? '未契約')
    );

    const favoriteCard = createElement('section', 'card');
    favoriteCard.append(
      createElement('p', 'label', '推し登録'),
      createElement(
        'h2',
        null,
        `${data.favorites.used} / ${data.favorites.limit}`
      )
    );

    const highSpeedCard = createElement('section', 'card');
    highSpeedCard.append(
      createElement('p', 'label', '高速監視オプション'),
      createElement(
        'h2',
        null,
        `${data.highSpeed.used} / ${data.highSpeed.limit}枠`
      )
    );

    container.append(
      planCard,
      favoriteCard,
      highSpeedCard
    );

    app.replaceChildren(container);

  } catch (error) {
    const container = createElement('main', 'page');

    container.append(
      createElement('h1', 'logo', 'Notify'),
      createElement(
        'p',
        'error',
        'ホームを読み込めませんでした'
      )
    );

    const retry = createElement(
      'button',
      'primary-button',
      '再試行'
    );

    retry.addEventListener('click', renderHome);
    container.append(retry);

    app.replaceChildren(container);
  }
}

function renderComingSoon(title) {
  const app = document.getElementById('app');
  const container = createElement('main', 'page');

  container.append(
    createElement('h1', 'logo', 'Notify'),
    createElement('h2', null, title),
    createElement('p', 'muted', '準備中です')
  );

  app.replaceChildren(container);
}

function renderRoute() {
  const route = location.hash || '#/home';

  switch (route) {
    case '#/home':
      renderHome();
      break;

    case '#/register':
      renderComingSoon('推しを追加');
      break;

    case '#/favorites':
      renderComingSoon('推し管理');
      break;

    case '#/plan':
      renderComingSoon('プラン');
      break;

    default:
      location.hash = '#/home';
  }
}

async function startApp() {
  const app = document.getElementById('app');

  try {
    await NotifyAuth.init();

    window.addEventListener('hashchange', renderRoute);
    renderRoute();

  } catch (error) {
    app.replaceChildren(
      createElement(
        'p',
        'error',
        'Notifyを開始できませんでした'
      )
    );
  }
}

startApp();
