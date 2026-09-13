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

  const page = createElement('main', 'page');

  page.append(
    createElement('h1', 'logo', 'Notify'),
    createElement('h2', 'page-title', '推しを追加'),
    createElement(
      'p',
      'section-label',
      '誰の情報をチェックしますか？'
    )
  );

  const formCard = createElement(
    'section',
    'card register-card'
  );

  function createField(
    labelText,
    placeholder,
    type = 'text',
    maxLength = 200
  ) {
    const wrapper = createElement(
      'div',
      'register-field'
    );

    const label = createElement(
      'label',
      'register-label',
      labelText
    );

    const field = createElement(
      'input',
      'register-input'
    );

    field.type = type;
    field.placeholder = placeholder;
    field.maxLength = maxLength;
    field.autocomplete = 'off';

    wrapper.append(label, field);

    return {
      wrapper,
      field,
    };
  }

  // -------------------------
  // 名前
  // -------------------------

  const nameField = createField(
    '推しの名前 *',
    '@パペットスンスン',
    'text',
    205
  );

  // -------------------------
  // 種類
  // -------------------------

  const categoryWrapper = createElement(
    'div',
    'register-field'
  );

  const categoryLabel = createElement(
    'label',
    'register-label',
    '種類 *'
  );

  const categorySelect = createElement(
    'select',
    'register-input'
  );

  const categoryOptions = [
    ['', '選んでください'],
    ['person', '人'],
    ['group', 'グループ'],
    ['character', 'キャラクター'],
    ['work', '作品（アニメ・漫画・ゲームなど）'],
  ];

  categoryOptions.forEach(
    ([value, text]) => {
      const option = createElement(
        'option',
        '',
        text
      );

      option.value = value;

      categorySelect.append(option);
    }
  );

  categoryWrapper.append(
    categoryLabel,
    categorySelect
  );

  const hintMessage = createElement(
    'p',
    'empty-message',
    '分かる範囲でOKです。2〜3個あると見つけやすくなります'
  );

  // -------------------------
  // 人
  // -------------------------

  const personSection = createElement(
    'div',
    'category-fields'
  );

  const personBirthDate = createField(
  '生年月日',
  '',
  'date'
  );

  const personOrigin = createField(
    '出身地',
    '例：東京都'
  );

  const personAffiliation = createField(
    '所属・グループ',
    '例：○○事務所 / ○○グループ'
  );

  personSection.append(
    personBirthDate.wrapper,
    personOrigin.wrapper,
    personAffiliation.wrapper
  );

  // -------------------------
  // グループ
  // -------------------------

  const groupSection = createElement(
    'div',
    'category-fields'
  );

  const groupAffiliation = createField(
    '所属事務所',
    '例：○○プロダクション'
  );

  const groupLabel = createField(
    'レーベル',
    '例：○○ Records'
  );

  const groupKnownFor = createField(
    '代表曲・代表作',
    '例：○○'
  );

  groupSection.append(
    groupAffiliation.wrapper,
    groupLabel.wrapper,
    groupKnownFor.wrapper
  );

  // -------------------------
  // キャラクター
  // -------------------------

  const characterSection = createElement(
    'div',
    'category-fields'
  );

  const characterWork = createField(
    '作品名',
    '例：○○'
  );

  const characterCreator = createField(
    '作者・原作者',
    '例：○○'
  );

  const characterDebut = createField(
    '初登場時期',
    '例：2020年ごろ'
  );

  characterSection.append(
    characterWork.wrapper,
    characterCreator.wrapper,
    characterDebut.wrapper
  );

  // -------------------------
  // 作品
  // -------------------------

  const workSection = createElement(
    'div',
    'category-fields'
  );

  const workCreator = createField(
    '作者・制作元',
    '例：○○先生 / ○○スタジオ'
  );

  const workRelease = createField(
    '発表・放送期間',
    '例：2023年〜'
  );

  const workKnownFor = createField(
    '代表的な情報',
    '例：シリーズ名・関連作品など'
  );

  workSection.append(
    workCreator.wrapper,
    workRelease.wrapper,
    workKnownFor.wrapper
  );

  const categorySections = {
    person: personSection,
    group: groupSection,
    character: characterSection,
    work: workSection,
  };

  Object.values(categorySections)
    .forEach(section => {
      section.hidden = true;
    });

  categorySelect.addEventListener(
    'change',
    () => {
      Object.entries(categorySections)
        .forEach(([category, section]) => {
          section.hidden =
            category !== categorySelect.value;
        });
    }
  );

  // -------------------------
  // 共通補足
  // -------------------------

  const commonTitle = createElement(
    'p',
    'section-label',
    'その他のヒント'
  );

  const officialUrl = createField(
  '公式URL',
  'https://...',
  'text',
  500
);

officialUrl.field.inputMode = 'url';
officialUrl.field.autocapitalize = 'none';
officialUrl.field.spellcheck = false;

  const noteWrapper = createElement(
    'div',
    'register-field'
  );

  const noteLabel = createElement(
    'label',
    'register-label',
    'その他の補足'
  );

  const note = createElement(
    'textarea',
    'register-input'
  );

  note.placeholder =
    'ほかに分かることがあれば入力してください';

  note.maxLength = 300;
  note.rows = 3;

  noteWrapper.append(
    noteLabel,
    note
  );

  // -------------------------
  // メッセージ・結果
  // -------------------------

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

  function valueOf(field) {
    return field.value.trim();
  }

  function buildHints(category) {
    const hints = {};

    function add(key, value) {
      const cleaned = String(value ?? '').trim();

      if (cleaned) {
        hints[key] = cleaned;
      }
    }

    if (category === 'person') {
      add(
        'birthDate',
        valueOf(personBirthDate.field)
      );

      add(
        'origin',
        valueOf(personOrigin.field)
      );

      add(
        'affiliation',
        valueOf(personAffiliation.field)
      );
    }

    if (category === 'group') {
      add(
        'affiliation',
        valueOf(groupAffiliation.field)
      );

      add(
        'label',
        valueOf(groupLabel.field)
      );

      add(
        'knownFor',
        valueOf(groupKnownFor.field)
      );
    }

    if (category === 'character') {
      add(
        'work',
        valueOf(characterWork.field)
      );

      add(
        'creator',
        valueOf(characterCreator.field)
      );

      add(
        'debutPeriod',
        valueOf(characterDebut.field)
      );
    }

    if (category === 'work') {
      add(
        'creatorOrStudio',
        valueOf(workCreator.field)
      );

      add(
        'releasePeriod',
        valueOf(workRelease.field)
      );

      add(
        'knownFor',
        valueOf(workKnownFor.field)
      );
    }

    add(
      'officialUrl',
      valueOf(officialUrl.field)
    );

    add(
      'note',
      valueOf(note)
    );

    return hints;
  }
function showRegisterStep2(resolveData) {
  resultArea.replaceChildren();

  const draftId = resolveData?.draftId;
  const targetName =
    resolveData?.target?.name ?? '名称未取得';

  const highSpeed =
    resolveData?.highSpeed ?? {};

  if (!draftId) {
    message.textContent =
      '登録情報を確認できませんでした';

    message.hidden = false;
    return;
  }

  const remaining =
    Number(highSpeed.remaining ?? 0);

  const highSpeedAvailable =
    highSpeed.available === true &&
    remaining > 0;

  const card = createElement(
    'section',
    'card register-step2'
  );

  card.append(
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

  // -------------------------
  // 通知設定
  // -------------------------

  card.append(
    createElement(
      'h3',
      'section-title',
      '通知設定'
    )
  );

  const priorityRow = createElement(
    'div',
    'notification-setting-row'
  );

  priorityRow.append(
    createElement(
      'div',
      'notification-setting-info'
    )
  );

  priorityRow.firstChild.append(
    createElement(
      'strong',
      '',
      '✓ 重要な速報'
    ),
    createElement(
      'p',
      'empty-message',
      '大きな発表・販売開始・重要な変更などを通知します'
    )
  );

  const digestRow = createElement(
  'div',
  'notification-setting-row'
);

const digestInfo = createElement(
  'div',
  'notification-setting-info'
);

digestInfo.append(
  createElement(
    'strong',
    '',
    'その他の情報'
  ),
  createElement(
    'p',
    'empty-message',
    '通知方法を選べます'
  )
);

const digestOptions = createElement(
  'div',
  'digest-options'
);

// 21時まとめ
const digestDailyLabel =
  document.createElement('label');

const digestDailyRadio =
  document.createElement('input');

digestDailyRadio.type = 'radio';
digestDailyRadio.name = 'digest-delivery';
digestDailyRadio.value = 'daily';
digestDailyRadio.checked = true;

digestDailyLabel.append(
  digestDailyRadio,
  document.createTextNode(
    ' 21時にまとめて通知'
  )
);

// 通知しない
const digestOffLabel =
  document.createElement('label');

const digestOffRadio =
  document.createElement('input');

digestOffRadio.type = 'radio';
digestOffRadio.name = 'digest-delivery';
digestOffRadio.value = 'off';

digestOffLabel.append(
  digestOffRadio,
  document.createTextNode(
    ' 通知しない'
  )
);

digestOptions.append(
  digestDailyLabel,
  digestOffLabel,
  createElement(
    'p',
    'empty-message',
    'どちらを選んでも更新情報はいつでも確認できます'
  )
);

digestRow.append(
  digestInfo,
  digestOptions
);

  // -------------------------
  // 高速監視
  // -------------------------

  const highSpeedRow = createElement(
    'div',
    'notification-setting-row'
  );

  const highSpeedInfo = createElement(
    'div',
    'notification-setting-info'
  );

  highSpeedInfo.append(
    createElement(
      'strong',
      '',
      '高速監視オプション'
    ),
    createElement(
      'p',
      'empty-message',
      '約5分間隔でチェックします'
    )
  );

  const highSpeedStatus = createElement(
    'p',
    'empty-message',
    highSpeedAvailable
      ? `残り ${remaining}枠`
      : '利用できる枠がありません'
  );

  highSpeedInfo.append(highSpeedStatus);

  const highSpeedToggle =
    createElement(
      'input',
      'high-speed-toggle'
    );

  highSpeedToggle.type = 'checkbox';
  highSpeedToggle.checked = false;
  highSpeedToggle.disabled =
    !highSpeedAvailable;

  highSpeedRow.append(
    highSpeedInfo,
    highSpeedToggle
  );

  card.append(
    priorityRow,
    digestRow,
    highSpeedRow
  );

  // -------------------------
  // 登録メッセージ
  // -------------------------

  const registerMessage =
    createElement(
      'p',
      'error-message',
      ''
    );

  registerMessage.hidden = true;

  const registerButton =
    createElement(
      'button',
      'primary-action',
      '登録する'
    );

  registerButton.type = 'button';

  // -------------------------
  // 登録実行
  // -------------------------

  registerButton.addEventListener(
    'click',
    async () => {
      registerMessage.hidden = true;
      registerMessage.textContent = '';

      registerButton.disabled = true;
      registerButton.textContent =
        '登録中...';

      highSpeedToggle.disabled = true;

      try {
        const response =
          await NotifyApi.call(
            'favorite.register',
            {
              draftId,

              notificationSettings: {
  schemaVersion: 2,
  priorityDelivery:
    'immediate',

  digestDelivery:
    digestDailyRadio.checked
      ? 'daily'
      : 'off',

  digestTime:
    digestDailyRadio.checked
      ? '21:00'
      : null,

  highSpeedMonitoring:
    highSpeedToggle.checked,
},
            }
          );

        if (response.ok === true) {
          const completed =
            createElement(
              'section',
              'card'
            );

          completed.append(
            createElement(
              'h2',
              'page-title',
              '登録しました'
            ),
            createElement(
              'p',
              'favorite-name',
              targetName
            ),
            createElement(
              'p',
              'empty-message',
              highSpeedToggle.checked
                ? '高速監視オプションを使用します'
                : '通常のチェックで登録しました'
            ),
            createLink(
              '#/home',
              'primary-action',
              'ホームへ戻る'
            ),
            createLink(
              '#/favorites',
              'secondary-action',
              '推し管理を見る'
            )
          );

          resultArea.replaceChildren(
            completed
          );

          return;
        }

        // -------------------------
        // 高速枠不足
        // -------------------------

        if (
          response.code ===
          'HIGH_SPEED_LIMIT'
        ) {
          highSpeedToggle.checked = false;
          highSpeedToggle.disabled = true;

          registerMessage.textContent =
            '高速監視オプションの枠がいっぱいです。通常のチェックなら登録できます。';

          registerMessage.hidden = false;

          registerButton.disabled = false;
          registerButton.textContent =
            '通常のチェックで登録する';

          return;
        }

        // -------------------------
        // 重複
        // -------------------------

        if (
          response.code ===
          'DUPLICATE'
        ) {
          resultArea.replaceChildren(
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

          return;
        }

        // -------------------------
        // 推し枠不足
        // -------------------------

        if (
          response.code ===
          'TARGET_LIMIT'
        ) {
          resultArea.replaceChildren(
            createElement(
              'p',
              'error-message',
              response.message ??
                '推しの登録枠がいっぱいです'
            ),
            createLink(
              '#/plan',
              'primary-action',
              'プランを見る'
            )
          );

          return;
        }

        // -------------------------
        // Draftが無効
        // -------------------------

        if (
          response.code ===
          'DRAFT_NOT_FOUND'
        ) {
          resultArea.replaceChildren(
            createElement(
              'p',
              'error-message',
              '登録情報の有効期限が切れたか、すでに処理されています'
            )
          );

          const restart =
            createElement(
              'button',
              'secondary-action',
              '最初からやり直す'
            );

          restart.type = 'button';

          restart.addEventListener(
            'click',
            renderRegister
          );

          resultArea.append(restart);

          return;
        }

        // -------------------------
        // 契約なし
        // -------------------------

        if (
          response.code ===
          'SUBSCRIPTION_REQUIRED'
        ) {
          resultArea.replaceChildren(
            createElement(
              'p',
              'error-message',
              response.message ??
                '利用できるプランがありません'
            ),
            createLink(
              '#/plan',
              'primary-action',
              'プランを見る'
            )
          );

          return;
        }

        registerMessage.textContent =
          response.message ??
          '登録できませんでした';

        registerMessage.hidden = false;

      } catch (error) {
        registerMessage.textContent =
          '通信に失敗しました。もう一度お試しください';

        registerMessage.hidden = false;

      } finally {
        if (
          resultArea.contains(card)
        ) {
          registerButton.disabled = false;

          if (
            registerButton.textContent ===
            '登録中...'
          ) {
            registerButton.textContent =
              '登録する';
          }

          if (
            highSpeedAvailable &&
            registerButton.textContent !==
              '通常のチェックで登録する'
          ) {
            highSpeedToggle.disabled =
              false;
          }
        }
      }
    }
  );

  card.append(
    registerMessage,
    registerButton
  );

  resultArea.append(card);

  // STEP1を再送しないようにする
  button.disabled = true;
  button.hidden = true;
}

  async function resolveFavorite() {
    const rawInput =
      valueOf(nameField.field);

    const selectedCategory =
      categorySelect.value;

    message.hidden = true;
    message.textContent = '';

    resultArea.replaceChildren();

    // @チェック
    if (!/^[@＠]/.test(rawInput)) {
      message.textContent =
        '名前の先頭に @ を付けてください';

      message.hidden = false;
      nameField.field.focus();
      return;
    }

    const name = rawInput
      .replace(/^[@＠]+/, '')
      .trim();

    if (!name) {
      message.textContent =
        '推しの名前を入力してください';

      message.hidden = false;
      nameField.field.focus();
      return;
    }

    if (name.length > 200) {
      message.textContent =
        '推しの名前が長すぎます';

      message.hidden = false;
      nameField.field.focus();
      return;
    }

    // 種類チェック
    if (!selectedCategory) {
      message.textContent =
        '推しの種類を選んでください';

      message.hidden = false;
      categorySelect.focus();
      return;
    }

    // URL形式チェック
    const urlValue =
      valueOf(officialUrl.field);

    if (urlValue) {
      try {
        const url = new URL(urlValue);

        if (
          url.protocol !== 'https:' &&
          url.protocol !== 'http:'
        ) {
          throw new Error();
        }
      } catch {
        message.textContent =
          '公式URLを正しく入力してください';

        message.hidden = false;
        officialUrl.field.focus();
        return;
      }
    }

    const hints =
      buildHints(selectedCategory);

    button.disabled = true;
    button.textContent = '確認中...';

    try {
      const response = await NotifyApi.call(
        'favorite.resolve',
        {
          input: rawInput,
          selectedCategory,
          hints,
        }
      );

      if (response.ok === true) {
  showRegisterStep2(response.data);
  return;
}

      if (
        response.code ===
        'DUPLICATE'
      ) {
        const duplicateCard =
          createElement(
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

        resultArea.append(
          duplicateCard
        );

        return;
      }

      if (
        response.code ===
        'NEED_MORE_INFO'
      ) {
        const infoCard =
          createElement(
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
            '入力した情報を確認し、分かる補足を追加してもう一度お試しください'
          )
        );

        resultArea.append(
          infoCard
        );

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

  nameField.field.addEventListener(
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
    nameField.wrapper,
    categoryWrapper,
    hintMessage,

    personSection,
    groupSection,
    characterSection,
    workSection,

    commonTitle,
    officialUrl.wrapper,
    noteWrapper,

    message,
    button,
    resultArea
  );

  page.append(formCard);

  app.replaceChildren(page);

  nameField.field.focus();
}

async function renderStart() {
  const app = document.getElementById('app');

  app.replaceChildren(
    createElement(
      'p',
      'loading',
      'Notifyを準備しています...'
    )
  );

  try {
    const response =
      await NotifyApi.home.get();

    if (response?.ok !== true) {
      throw new Error(
        response?.code || 'API_ERROR'
      );
    }

    const data = response.data ?? {};

    // -------------------------
    // 契約なし
    // -------------------------

    if (!data.plan) {
      location.hash = '#/plan';
      return;
    }

    // -------------------------
    // 契約あり・推し0件
    // -------------------------

    const favoriteUsed =
      Number(
        data.favorites?.used ?? 0
      );

    if (favoriteUsed === 0) {
      location.hash = '#/register';
      return;
    }

    // -------------------------
    // 既に利用中
    // -------------------------

    location.hash = '#/home';

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
        'Notifyを開始できませんでした'
      )
    );

    const retry = createElement(
      'button',
      'retry-button',
      '再試行'
    );

    retry.type = 'button';

    retry.addEventListener(
      'click',
      renderStart
    );

    page.append(retry);

    app.replaceChildren(page);
  }
}

async function renderPlan() {
  const app = document.getElementById('app');

  app.replaceChildren(
    createElement(
      'p',
      'loading',
      'プラン情報を読み込み中...'
    )
  );

  try {
    const response =
      await NotifyApi.plan.get();

    if (response?.ok !== true) {
      throw new Error(
        response?.code || 'API_ERROR'
      );
    }

    const data = response.data ?? {};
    const current = data.current ?? null;
    const plans = Array.isArray(data.plans)
      ? data.plans
      : [];

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
        current
          ? 'プラン・利用状況'
          : 'プランを選ぶ'
      )
    );

    // -------------------------
    // 現在の契約
    // -------------------------

    if (current) {
      const currentCard = createElement(
        'section',
        'card usage-card'
      );

      currentCard.append(
        createElement(
          'p',
          'section-label',
          '現在のプラン'
        ),
        createElement(
          'h2',
          'plan-name',
          current.name ?? '名称未取得'
        ),
        createElement(
          'p',
          'empty-message',
          `推し ${current.targetLimit ?? 0}枠`
        ),
        createElement(
          'p',
          'empty-message',
          `高速監視オプション ${current.includedHighSpeedSlots ?? 0}枠`
        )
      );

      if (
        Number.isFinite(
          Number(current.monthlyPrice)
        )
      ) {
        currentCard.append(
          createElement(
            'strong',
            'usage-value',
            `¥${Number(
              current.monthlyPrice
            ).toLocaleString('ja-JP')} / 月`
          )
        );
      }

      if (current.currentPeriodEnd) {
        const date =
          new Date(current.currentPeriodEnd);

        if (!Number.isNaN(date.getTime())) {
          currentCard.append(
            createElement(
              'p',
              'empty-message',
              `現在の契約期間：${date.toLocaleDateString(
                'ja-JP'
              )}まで`
            )
          );
        }
      }

      page.append(currentCard);
    } else {
      page.append(
        createElement(
          'p',
          'empty-message',
          '利用するプランを選んでください'
        )
      );
    }

    // -------------------------
    // プラン一覧
    // -------------------------

    const plansSection = createElement(
      'section',
      'recent-section'
    );

    plansSection.append(
      createElement(
        'h2',
        'section-title',
        '料金プラン'
      )
    );

    const planMessage = createElement(
      'p',
      'error-message',
      ''
    );

    planMessage.hidden = true;

    plans.forEach(plan => {
      const card = createElement(
        'div',
        'card'
      );

      card.append(
        createElement(
          'h3',
          'plan-name',
          plan.name ?? 'プラン'
        )
      );

      card.append(
        createElement(
          'strong',
          'usage-value',
          `¥${Number(
            plan.monthlyPrice ?? 0
          ).toLocaleString('ja-JP')} / 月`
        ),
        createElement(
          'p',
          'empty-message',
          `推し ${plan.targetLimit ?? 0}枠`
        ),
        createElement(
          'p',
          'empty-message',
          `高速監視オプション ${plan.includedHighSpeedSlots ?? 0}枠付き`
        )
      );

      const isCurrent =
        current?.planId === plan.id;

      const selectButton =
        createElement(
          'button',
          isCurrent
            ? 'secondary-action'
            : 'primary-action',
          isCurrent
            ? '利用中'
            : 'このプランを選ぶ'
        );

      selectButton.type = 'button';
      selectButton.disabled = isCurrent;

      if (!isCurrent) {
  selectButton.addEventListener(
    'click',
    async () => {
      planMessage.hidden = true;
      planMessage.textContent = '';

      selectButton.disabled = true;
      const originalText =
        selectButton.textContent;

      selectButton.textContent =
        '確認中...';

      try {
        // ① 選択プランをサーバー側で確認
        const selectResponse =
          await NotifyApi.plan.select(
            plan.id
          );

        if (selectResponse?.ok !== true) {
          planMessage.textContent =
            selectResponse?.message ??
            'プランを選択できませんでした';

          planMessage.hidden = false;
          return;
        }

        const selectedPlanId =
          selectResponse.data
            ?.selection
            ?.planId;

        if (!selectedPlanId) {
          planMessage.textContent =
            'プラン情報を確認できませんでした';

          planMessage.hidden = false;
          return;
        }

        // ② 決済開始
        selectButton.textContent =
          '決済を準備中...';

        const purchaseResponse =
          await NotifyApi.purchase.start(
            selectedPlanId
          );

        // 現在はPayment Adapter未接続なので正常
        if (
          purchaseResponse?.code ===
          'PAYMENT_NOT_CONFIGURED'
        ) {
          planMessage.textContent =
            'プラン選択まで確認できました。決済機能は現在準備中です';

          planMessage.hidden = false;
          return;
        }

        // 既に契約あり
        if (
          purchaseResponse?.code ===
          'SUBSCRIPTION_EXISTS'
        ) {
          planMessage.textContent =
            purchaseResponse.message ??
            'すでに利用中のプランがあります';

          planMessage.hidden = false;
          return;
        }

        if (purchaseResponse?.ok !== true) {
          planMessage.textContent =
            purchaseResponse?.message ??
            '決済を開始できませんでした';

          planMessage.hidden = false;
          return;
        }

        // 将来Payment Adapter実装時にここへ続ける
        planMessage.textContent =
          '決済準備が完了しました';

        planMessage.hidden = false;

      } catch (error) {
        planMessage.textContent =
          '通信に失敗しました。もう一度お試しください';

        planMessage.hidden = false;

      } finally {
        selectButton.disabled = false;
        selectButton.textContent =
          originalText;
      }
    }
  );
}

      card.append(selectButton);

      plansSection.append(card);
    });

    // -------------------------
    // 高速監視追加枠
    // -------------------------

    const addonCard = createElement(
      'div',
      'card'
    );

    addonCard.append(
      createElement(
        'h3',
        'plan-name',
        '高速監視オプション追加'
      ),
      createElement(
        'strong',
        'usage-value',
        '＋¥200 / 月 / 1枠'
      ),
      createElement(
        'p',
        'empty-message',
        '高速監視オプションの利用枠を追加できます'
      )
    );

    plansSection.append(
      addonCard,
      planMessage
    );

    page.append(plansSection);

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
        'プラン情報を読み込めませんでした'
      )
    );

    const retry = createElement(
      'button',
      'retry-button',
      '再試行'
    );

    retry.type = 'button';

    retry.addEventListener(
      'click',
      renderPlan
    );

    page.append(retry);

    app.replaceChildren(page);
  }
}

async function renderFavorites() {
  const app = document.getElementById('app');

  app.replaceChildren(
    createElement(
      'p',
      'loading',
      '推し情報を読み込み中...'
    )
  );

  try {
    const response =
      await NotifyApi.favorite.list();

    if (response?.ok !== true) {
      throw new Error(
        response?.code || 'API_ERROR'
      );
    }

    const favorites =
      Array.isArray(response?.data?.favorites)
        ? response.data.favorites
        : [];

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
        '推し管理'
      )
    );

    if (favorites.length === 0) {
      page.append(
        createElement(
          'p',
          'empty-message',
          '登録中の推しはいません'
        )
      );

      app.replaceChildren(page);
      return;
    }

    for (const favorite of favorites) {
      const card = createElement(
        'section',
        'card'
      );

      const settings =
        favorite?.notificationSettings ?? {};

      let currentEnabled =
        favorite.enabled === true;

      let currentDigestDelivery =
        settings.digestDelivery === 'off'
          ? 'off'
          : 'daily';

      let currentHighSpeed =
        settings.highSpeedMonitoring === true;

      const statusElement =
        createElement(
          'p',
          '',
          currentEnabled
            ? 'Monitoring中'
            : '停止中'
        );

      const digestElement =
        createElement(
          'p',
          '',
          currentDigestDelivery === 'daily'
            ? '通常情報：21時まとめ'
            : '通常情報：通知しない'
        );

      const highSpeedElement =
        createElement(
          'p',
          '',
          `高速監視オプション：${
            currentHighSpeed
              ? 'ON'
              : 'OFF'
          }`
        );

      card.append(
        createElement(
          'h2',
          '',
          favorite.canonicalName ??
            '名称未取得'
        ),
        statusElement,
        digestElement,
        highSpeedElement
      );


      // =====================================
      // 停止 / 再開
      // =====================================

      const toggleButton =
        createElement(
          'button',
          '',
          currentEnabled
            ? '停止'
            : '再開'
        );

      toggleButton.type = 'button';

      toggleButton.addEventListener(
        'click',
        async () => {
          toggleButton.disabled = true;

          try {
            const result =
              await NotifyApi.favorite.setEnabled(
                favorite.favoriteId,
                !currentEnabled
              );

            if (result?.ok !== true) {
              throw new Error(
                result?.code ||
                'API_ERROR'
              );
            }

            currentEnabled =
              result?.data?.enabled === true;

            statusElement.textContent =
              currentEnabled
                ? 'Monitoring中'
                : '停止中';

            toggleButton.textContent =
              currentEnabled
                ? '停止'
                : '再開';

          } catch (error) {
            settingsMessage.className =
  'error-message';

settingsMessage.textContent =
  '通知設定を変更できませんでした。もう一度お試しください。';

settingsMessage.hidden = false;
          } finally {
            toggleButton.disabled = false;
          }
        }
      );


      // =====================================
      // 設定変更
      // =====================================

      const settingsButton =
        createElement(
          'button',
          '',
          '設定変更'
        );

      settingsButton.type = 'button';

      const settingsPanel =
        document.createElement('div');

      settingsPanel.hidden = true;
      
　　　　const settingsMessage =
  createElement(
    'p',
    'empty-message',
    ''
  );

settingsMessage.hidden = true;
      
      // 通常情報：21時まとめ
      const dailyRadio =
        document.createElement('input');

      dailyRadio.type = 'radio';
      dailyRadio.name =
        `digest-${favorite.favoriteId}`;
      dailyRadio.value = 'daily';


      const dailyLabel =
        document.createElement('label');

      dailyLabel.append(
        dailyRadio,
        document.createTextNode(
          ' 21時にまとめて通知'
        )
      );


      // 通常情報：OFF
      const offRadio =
        document.createElement('input');

      offRadio.type = 'radio';
      offRadio.name =
        `digest-${favorite.favoriteId}`;
      offRadio.value = 'off';


      const offLabel =
        document.createElement('label');

      offLabel.append(
        offRadio,
        document.createTextNode(
          ' 通知しない'
        )
      );


      // 高速監視オプション
      const highSpeedCheckbox =
        document.createElement('input');

      highSpeedCheckbox.type = 'checkbox';


      const highSpeedLabel =
        document.createElement('label');

      highSpeedLabel.append(
        highSpeedCheckbox,
        document.createTextNode(
          ' 高速監視オプションを利用する'
        )
      );


      const saveButton =
        createElement(
          'button',
          '',
          '保存'
        );

      saveButton.type = 'button';


      const cancelButton =
        createElement(
          'button',
          '',
          'キャンセル'
        );

      cancelButton.type = 'button';


      function resetSettingsForm() {
        dailyRadio.checked =
          currentDigestDelivery === 'daily';

        offRadio.checked =
          currentDigestDelivery === 'off';

        highSpeedCheckbox.checked =
          currentHighSpeed;
      }


      settingsButton.addEventListener(
        'click',
        () => {
          resetSettingsForm();
          settingsPanel.hidden = false;
        }
      );


      cancelButton.addEventListener(
        'click',
        () => {
          resetSettingsForm();
          settingsPanel.hidden = true;
        }
      );


      saveButton.addEventListener(
  'click',
  async () => {
    saveButton.disabled = true;
    cancelButton.disabled = true;

    try {
      const nextDigestDelivery =
        dailyRadio.checked
          ? 'daily'
          : 'off';

      const nextSettings = {
        schemaVersion: 2,
        priorityDelivery: 'immediate',

        digestDelivery:
          nextDigestDelivery,

        digestTime:
          nextDigestDelivery === 'daily'
            ? '21:00'
            : null,

        highSpeedMonitoring:
          highSpeedCheckbox.checked
      };

      const result =
        await NotifyApi.favorite.updateSettings(
          favorite.favoriteId,
          nextSettings
        );

      if (result?.ok !== true) {
        throw new Error(
          result?.code || 'API_ERROR'
        );
      }

      const saved =
        result?.data?.notificationSettings ??
        nextSettings;

      currentDigestDelivery =
        saved.digestDelivery === 'off'
          ? 'off'
          : 'daily';

      currentHighSpeed =
        saved.highSpeedMonitoring === true;

      digestElement.textContent =
        currentDigestDelivery === 'daily'
          ? '通常情報：21時まとめ'
          : '通常情報：通知しない';

      highSpeedElement.textContent =
        `高速監視オプション：${
          currentHighSpeed
            ? 'ON'
            : 'OFF'
        }`;

      settingsPanel.hidden = true;

      settingsMessage.className =
  'empty-message';

settingsMessage.textContent =
  result?.message ||
  '通知設定を変更しました';

settingsMessage.hidden = false;

    } catch (error) {
      settingsMessage.className =
  'error-message';

settingsMessage.textContent =
  '通知設定を変更できませんでした。もう一度お試しください。';

settingsMessage.hidden = false;

    } finally {
      saveButton.disabled = false;
      cancelButton.disabled = false;
    }
  }
);


      settingsPanel.append(
        createElement(
          'p',
          '',
          '通常情報'
        ),
        dailyLabel,
        document.createElement('br'),
        offLabel,
        document.createElement('br'),
        createElement(
          'p',
          '',
          '高速監視オプション'
        ),
        highSpeedLabel,
        document.createElement('br'),
        saveButton,
        cancelButton
      );


      card.append(
  settingsButton,
  toggleButton,
  settingsPanel,
  settingsMessage
);

      page.append(card);
    }

    app.replaceChildren(page);

  } catch (error) {
    app.replaceChildren(
      createElement(
        'p',
        'error-message',
        '推し情報を読み込めませんでした'
      )
    );
  }
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
    case '#/start':
      renderStart();
      break;

    case '#/home':
      renderHome();
      break;

    case '#/register':
      renderRegister();
      break;

    case '#/favorites':
      renderFavorites();
      break;

    case '#/plan':
      renderPlan();
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
