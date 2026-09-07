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

function createLink(href, className, text) {
  const link = createElement('a', className, text);
  link.href = href;
  return link;
}

function updateActiveNav() {
  const route = location.hash || '#/home';

  document
    .querySelectorAll('.bottom-nav a')
    .forEach(link => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === route
      );
    });
}

function createFavoriteRow(favorite) {
  const row = createElement('div', 'favorite-row');

  const info = createElement('div', 'favorite-info');

  info.append(
    createElement(
      'div',
      'favorite-name',
      favorite.name ?? '名称未取得'
    )
  );

  if (favorite.highSpeed === true) {
    info.append(
      createElement(
        'div',
        'high-speed-label',
        '高速監視オプション'
      )
    );
  }

  const status = createElement(
    'span',
    favorite.enabled
      ? 'status-badge active'
      : 'status-badge stopped',
    favorite.enabled
      ? '稼働中'
      : '停止中'
  );

  row.append(info, status);

  return row;
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

    const page = createElement('main', 'page');

    const header = createElement('header', 'home-header');

    header.append(
      createElement('h1', 'logo', 'Notify'),
      createElement(
        'p',
        'header-subtitle',
        '必要な情報をチェックしています'
      )
    );

    page.append(header);

    // プラン・利用枠
    const usageCard = createElement('section', 'card usage-card');

    usageCard.append(
      createElement('p', 'section-label', '現在のプラン'),
      createElement(
        'h2',
        'plan-name',
        data.plan?.name ?? '未契約'
      )
    );

    const usageGrid = createElement('div', 'usage-grid');

    const favoriteUsage = createElement('div', 'usage-item');
    favoriteUsage.append(
      createElement('span', 'usage-label', '推し'),
      createElement(
        'strong',
        'usage-value',
        `${data.favorites.used} / ${data.favorites.limit}`
      )
    );

    const highSpeedUsage = createElement('div', 'usage-item');
    highSpeedUsage.append(
      createElement(
        'span',
        'usage-label',
        '高速監視オプション'
      ),
      createElement(
        'strong',
        'usage-value',
        `${data.highSpeed.used} / ${data.highSpeed.limit}枠`
      )
    );

    usageGrid.append(
      favoriteUsage,
      highSpeedUsage
    );

    usageCard.append(usageGrid);

    page.append(usageCard);

    // 推し追加
    page.append(
      createLink(
        '#/register',
        'primary-action',
        '＋ 推しを追加する'
      )
    );

    // 最近の推し
    const recentSection = createElement(
      'section',
      'recent-section'
    );

    const recentHeader = createElement(
      'div',
      'section-header'
    );

    recentHeader.append(
      createElement('h2', 'section-title', '最近の推し'),
      createLink(
        '#/favorites',
        'text-link',
        'すべて見る →'
      )
    );

    recentSection.append(recentHeader);

    const recentCard = createElement(
      'div',
      'card recent-card'
    );

    const recent = data.favorites.recent ?? [];

    if (recent.length === 0) {
      recentCard.append(
        createElement(
          'p',
          'empty-message',
          'まだ推しが登録されていません'
        )
      );
    } else {
      recent.forEach(favorite => {
        recentCard.append(
          createFavoriteRow(favorite)
        );
      });
    }

    recentSection.append(recentCard);

    page.append(recentSection);

    // プラン導線
    page.append(
      createLink(
        '#/plan',
        'secondary-action',
        'プラン・利用状況を見る →'
      )
    );

    app.replaceChildren(page);

  } catch (error) {
    const page = createElement('main', 'page');

    page.append(
      createElement('h1', 'logo', 'Notify'),
      createElement(
        'p',
        'error-message',
        'ホームを読み込めませんでした'
      )
    );

    const retry = createElement(
      'button',
      'retry-button',
      '再試行'
    );

    retry.addEventListener('click', renderHome);

    page.append(retry);

    app.replaceChildren(page);
  }
}

function renderComingSoon(title) {
  const app = document.getElementById('app');

  const page = createElement('main', 'page');

  page.append(
    createElement('h1', 'logo', 'Notify'),
    createElement('h2', 'page-title', title),
    createElement('p', 'empty-message', '準備中です')
  );

  app.replaceChildren(page);
}

function renderRoute() {
  const route = location.hash || '#/home';

  updateActiveNav();

  switch (route) {
    case '#/home':
      renderHome();
      break;

      function renderRegisterTest() {
  const app = document.getElementById('app');

  const page = createElement('main', 'page');

  page.append(
    createElement('h1', 'logo', 'Notify'),
    createElement('h2', 'page-title', '推しを追加'),
    createElement(
      'p',
      'empty-message',
      'favorite.resolve の接続テスト'
    )
  );

  const button = createElement(
    'button',
    'retry-button',
    '池田エライザでテスト'
  );

  const result = createElement(
    'pre',
    'test-result',
    ''
  );

  button.addEventListener('click', async () => {
    button.disabled = true;
    result.textContent = '送信中...';

    try {
      const response = await NotifyApi.call(
        'favorite.resolve',
        {
          input: '池田エライザ'
        }
      );

      result.textContent =
        JSON.stringify(response, null, 2);

    } catch (error) {
      result.textContent =
        '送信失敗: ' +
        (error.message || String(error));

    } finally {
      button.disabled = false;
    }
  });

  page.append(button, result);

  app.replaceChildren(page);
}

    case '#/register':
 　　　 renderRegisterTest();
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

    window.addEventListener(
      'hashchange',
      renderRoute
    );

    renderRoute();

  } catch (error) {
    app.replaceChildren(
      createElement(
        'p',
        'error-message',
        'Notifyを開始できませんでした'
      )
    );
  }
}

startApp();
