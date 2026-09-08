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

    const usageCard = createElement(
      'section',
      'card usage-card'
    );

    usageCard.append(
      createElement(
        'p',
        'section-label',
        '現在のプラン'
      ),
      createElement(
        'h2',
        'plan-name',
        data.plan?.name ?? '未契約'
      )
    );

    const usageGrid = createElement(
      'div',
      'usage-grid'
    );

    const favoriteUsage = createElement(
      'div',
      'usage-item'
    );

    favoriteUsage.append(
      createElement(
        'span',
        'usage-label',
        '推し'
      ),
      createElement(
        'strong',
        'usage-value',
        `${data.favorites.used} / ${data.favorites.limit}`
      )
    );

    const highSpeedUsage = createElement(
      'div',
      'usage-item'
    );

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

    page.append(
      createLink(
        '#/register',
        'primary-action',
        '＋ 推しを追加する'
      )
    );

    const recentSection = createElement(
      'section',
      'recent-section'
    );

    const recentHeader = createElement(
      'div',
      'section-header'
    );

    recentHeader.append(
      createElement(
        'h2',
        'section-title',
        '最近の推し'
      ),
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

    const recent =
      data.favorites.recent ?? [];

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

    page.append(
      createLink(
        '#/plan',
        'secondary-action',
        'プラン・利用状況を見る →'
      )
    );

    app.replaceChildren(page);

  } catch (error) {
    const page = createElement(
      'main',
      'page'
    );

    page.append(
      createElement(
        'h1',
        'logo',
        'Notify'
      ),
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

    retry.addEventListener(
      'click',
      renderHome
    );

    page.append(retry);

    app.replaceChildren(page);
  }
}

function renderRegister() {
  const app = document.getElementById('app');

  const page = createElement(
    'main',
    'page'
  );

  page.append(
    createElement(
      'h1',
      'logo',
      'Notify'
    ),
    createElement(
      'h2',
      'page-title',
      '推しを追加'
    ),
    createElement(
      'p',
      'section-label',
      '誰の情報をチェックしますか？'
    )
  );

  const formCard = createElement(
    'section',
    'card'
  );

  const input = createElement(
    'input',
    'register-input'
  );

  input.type = 'text';
  input.placeholder = '@パペットスンスン';
  input.autocomplete = 'off';
  input.maxLength = 205;

  const help = createElement(
    'p',
    'empty-message',
    '名前の先頭に @ を付けて入力してください'
  );

  const message = createElement(
    'p',
    'error-message',
    ''
  );

  message.hidden = true;

  const resultArea = createElement(
    'div',
    'register-result'
  );

  const button = createElement(
    'button',
    'primary-action',
    '次へ'
  );

  button.type = 'button';

  async function resolveFavorite() {
    const rawInput = input.value.trim();

    message.hidden = true;
    message.textContent = '';

    resultArea.replaceChildren();

    if (!/^[@＠]/.test(rawInput)) {
      message.textContent =
        '名前の先頭に @ を付けてください';
      message.hidden = false;
      input.focus();
      return;
    }

    const name = rawInput
      .replace(/^[@＠]+/, '')
      .trim();

    if (!name) {
      message.textContent =
        '推しの名前を入力してください';
      message.hidden = false;
      input.focus();
      return;
    }

    if (name.length > 200) {
      message.textContent =
        '推しの名前が長すぎます';
      message.hidden = false;
      input.focus();
      return;
    }

    button.disabled = true;
    button.textContent = '確認中...';

    try {
      const response = await NotifyApi.call(
        'favorite.resolve',
        {
          input: rawInput
        }
      );

      if (response.ok === true) {
        const targetName =
          response.data?.target?.name ??
          '名称未取得';

        const successCard = createElement(
          'div',
          'card'
        );

        successCard.append(
          createElement(
            'p',
            'section-label',
            '確認できました'
          ),
          createElement(
            'h2',
            'favorite-name',
            targetName
          )
        );

        const highSpeed =
          response.data?.highSpeed;

        if (highSpeed) {
          successCard.append(
            createElement(
              'p',
              'empty-message',
              `高速監視オプション：残り ${highSpeed.remaining ?? 0}枠`
            )
          );
        }

        resultArea.append(successCard);
        return;
      }

      if (response.code === 'DUPLICATE') {
        const duplicateCard = createElement(
          'div',
          'card'
        );

        duplicateCard.append(
          createElement(
            'p',
            'error-message',
            response.message ??
              'この推しはすでに登録されています'
          ),
          createLink(
            '#/favorites',
            'secondary-action',
            '推し管理を見る'
          )
        );

        resultArea.append(duplicateCard);
        return;
      }

      if (
        response.code ===
        'NEED_MORE_INFO'
      ) {
        const infoCard = createElement(
          'div',
          'card'
        );

        infoCard.append(
          createElement(
            'p',
            'error-message',
            response.message ??
              'もう少し情報を入力してください'
          )
        );

        const candidate =
          response.data?.candidate;

        if (candidate?.name) {
          infoCard.append(
            createElement(
              'p',
              'favorite-name',
              `候補：${candidate.name}`
            )
          );
        }

        if (
          candidate?.verificationMessage
        ) {
          infoCard.append(
            createElement(
              'p',
              'empty-message',
              candidate.verificationMessage
            )
          );
        }

        infoCard.append(
          createElement(
            'p',
            'empty-message',
            'グループ名・作品名などを加えて、もう一度入力してください'
          )
        );

        resultArea.append(infoCard);
        input.focus();
        return;
      }

      message.textContent =
        response.message ??
        '推しを確認できませんでした';

      message.hidden = false;

    } catch (error) {
      message.textContent =
        '通信に失敗しました。もう一度お試しください';

      message.hidden = false;

    } finally {
      button.disabled = false;
      button.textContent = '次へ';
    }
  }

  button.addEventListener(
    'click',
    resolveFavorite
  );

  input.addEventListener(
    'keydown',
    event => {
      if (
        event.key === 'Enter' &&
        !button.disabled
      ) {
        event.preventDefault();
        resolveFavorite();
      }
    }
  );

  formCard.append(
    input,
    help,
    message,
    button,
    resultArea
  );

  page.append(formCard);

  app.replaceChildren(page);

  input.focus();
}

function renderComingSoon(title) {
  const app = document.getElementById('app');

  const page = createElement(
    'main',
    'page'
  );

  page.append(
    createElement(
      'h1',
      'logo',
      'Notify'
    ),
    createElement(
      'h2',
      'page-title',
      title
    ),
    createElement(
      'p',
      'empty-message',
      '準備中です'
    )
  );

  app.replaceChildren(page);
}

function renderRoute() {
  const route =
    location.hash || '#/home';

  updateActiveNav();

  switch (route) {
    case '#/home':
      renderHome();
      break;

    case '#/register':
      renderRegister();
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
  const app =
    document.getElementById('app');

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
