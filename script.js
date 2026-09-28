// ========================================
// なにかおかしい、ぴった！
// ゲーム本体
// ========================================

let gameConfig = null;
let supabaseClient = null;

let currentUser = null;
let currentProfile = null;

let gameRunning = false;
let startTime = 0;
let timerInterval = null;

let targetTime = 0;
let currentElapsed = 0;


// ========================================
// 初期化
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  setupEvents();
  initialize();
});


async function initialize() {
  try {
    const response =
      await fetch("game.json?v=" + Date.now());

    if (!response.ok) {
      throw new Error(
        "game.jsonを読み込めませんでした。"
      );
    }

    gameConfig = await response.json();

    console.log(
      "読み込んだgameConfig:",
      gameConfig
    );

    initializeSupabase();

    showScreen("loginScreen");

    if (!supabaseClient) {
      showLoginMessage(
        "Supabase未設定です。現在は画面確認モードです。"
      );
    }

  } catch (error) {

    console.error(error);

    showLoginMessage(
      "初期化に失敗しました。game.jsonを確認してください。"
    );
  }
}


// ========================================
// Supabase初期化
// ========================================

function initializeSupabase() {

  const url =
    gameConfig?.supabase?.url;

  const key =
    gameConfig?.supabase?.key;

  if (
    !url ||
    !key ||
    url.includes("ここにSupabase") ||
    key.includes("ここにSupabase")
  ) {
    supabaseClient = null;
    return;
  }

  try {

    supabaseClient =
      window.supabase.createClient(
        url,
        key
      );

    console.log(
      "Supabase initialized."
    );

  } catch (error) {

    console.error(
      "Supabase initialization error:",
      error
    );

    supabaseClient = null;
  }
}


// ========================================
// イベント設定
// ========================================

function setupEvents() {

  // ----------------------------------------
  // ログイン
  // ----------------------------------------

  document
    .getElementById("loginButton")
    .addEventListener(
      "click",
      login
    );


  // ----------------------------------------
  // 新規作成へ
  // ----------------------------------------

  document
    .getElementById("goSignupButton")
    .addEventListener(
      "click",
      () => {
        showScreen("signupScreen");
        clearMessages();
      }
    );

  document
    .getElementById("loginToSignupTop")
    .addEventListener(
      "click",
      () => {
        showScreen("signupScreen");
        clearMessages();
      }
    );


  // ----------------------------------------
  // ログインへ
  // ----------------------------------------

  document
    .getElementById("goLoginButton")
    .addEventListener(
      "click",
      () => {
        showScreen("loginScreen");
        clearMessages();
      }
    );

  document
    .getElementById("signupToLoginTop")
    .addEventListener(
      "click",
      () => {
        showScreen("loginScreen");
        clearMessages();
      }
    );


  // ----------------------------------------
  // 新規作成
  // ----------------------------------------

  document
    .getElementById("signupButton")
    .addEventListener(
      "click",
      signup
    );


  // ----------------------------------------
  // トップ画面のログアウト
  // ----------------------------------------

  document
    .getElementById("logoutButton")
    .addEventListener(
      "click",
      logout
    );


  // ----------------------------------------
  // ゲーム画面のログアウト
  // ----------------------------------------

  document
    .getElementById("gameLogoutButton")
    .addEventListener(
      "click",
      logout
    );


  // ----------------------------------------
  // ゲーム開始
  // ----------------------------------------

  document
    .getElementById("startGameButton")
    .addEventListener(
      "click",
      () => {

        showScreen("gameScreen");

        startNewGame();
      }
    );


  // ----------------------------------------
  // ゲームボタン
  // ----------------------------------------

  document
    .getElementById("gameButton")
    .addEventListener(
      "click",
      toggleGame
    );


  // ----------------------------------------
  // 通常ランキング
  // ----------------------------------------

  document
    .getElementById("gameRankingButton")
    .addEventListener(
      "click",
      showRanking
    );


  document
    .getElementById("rankBackButton")
    .addEventListener(
      "click",
      () => {
        showScreen("gameScreen");
      }
    );


  // ----------------------------------------
  // コレクション
  // ----------------------------------------

  document
    .getElementById("rankCollectionButton")
    .addEventListener(
      "click",
      showCollection
    );


  document
    .getElementById("collectionBackButton")
    .addEventListener(
      "click",
      () => {
        showScreen("rankScreen");
      }
    );


  // ----------------------------------------
  // ゲーム画面
  // → コレクションランキング
  // ----------------------------------------

  document
    .getElementById("collectionRankingButton")
    .addEventListener(
      "click",
      showCollectionRanking
    );


  // ----------------------------------------
  // コレクション画面
  // → コレクションランキング
  // ----------------------------------------

  document
    .getElementById(
      "collectionRankingButtonFromCollection"
    )
    .addEventListener(
      "click",
      showCollectionRanking
    );


  // ----------------------------------------
  // コレクションランキング
  // ----------------------------------------

  document
    .getElementById("collectionRankBackButton")
    .addEventListener(
      "click",
      () => {
        showScreen("collectionScreen");
      }
    );


  document
    .getElementById("collectionRankGameButton")
    .addEventListener(
      "click",
      () => {
        showScreen("gameScreen");
      }
    );


  // ----------------------------------------
  // Enterキー
  // ----------------------------------------

  document
    .getElementById("loginPassword")
    .addEventListener(
      "keydown",
      (event) => {

        if (event.key === "Enter") {
          login();
        }
      }
    );


  document
    .getElementById(
      "signupPasswordConfirm"
    )
    .addEventListener(
      "keydown",
      (event) => {

        if (event.key === "Enter") {
          signup();
        }
      }
    );
}


// ========================================
// 画面切り替え
// ========================================

function showScreen(screenId) {

  const screens = [
    "loginScreen",
    "signupScreen",
    "topScreen",
    "gameScreen",
    "rankScreen",
    "collectionScreen",
    "collectionRankScreen"
  ];

  screens.forEach((id) => {

    const element =
      document.getElementById(id);

    if (!element) {
      return;
    }

    if (id === screenId) {
      element.classList.remove(
        "hidden"
      );
    } else {
      element.classList.add(
        "hidden"
      );
    }
  });
}


// ========================================
// メッセージ
// ========================================

function clearMessages() {

  const loginMessage =
    document.getElementById(
      "loginMessage"
    );

  const signupMessage =
    document.getElementById(
      "signupMessage"
    );

  if (loginMessage) {
    loginMessage.textContent = "";
  }

  if (signupMessage) {
    signupMessage.textContent = "";
  }
}


function showLoginMessage(message) {

  document.getElementById(
    "loginMessage"
  ).textContent = message;
}


function showSignupMessage(message) {

  document.getElementById(
    "signupMessage"
  ).textContent = message;
}


// ========================================
// ログイン名処理
// ========================================

function normalizeUsername(name) {

  return name
    .trim()
    .normalize("NFKC")
    .toLowerCase();
}


// ========================================
// ログイン名チェック
// 日本語・英数字・_・-に対応
// ========================================

function isValidUsername(name) {

  return /^[\p{L}\p{N}_-]{2,20}$/u.test(
    name
  );
}


// ========================================
// ログイン名 → Supabase用メールアドレス
// 日本語でも安全に変換
// ========================================

function usernameToEmail(name) {

  const normalized =
    normalizeUsername(name);

  const bytes =
    new TextEncoder().encode(
      normalized
    );

  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(
      byte
    );
  });

  const encoded =
    btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  return `u-${encoded}@pitta.local`;
}


// ========================================
// 新規作成
// ========================================

async function signup() {

  if (!supabaseClient) {

    showSignupMessage(
      "Supabaseを設定するとアカウントを作成できます。"
    );

    return;
  }

  const nameInput =
    document.getElementById(
      "signupName"
    );

  const passwordInput =
    document.getElementById(
      "signupPassword"
    );

  const confirmInput =
    document.getElementById(
      "signupPasswordConfirm"
    );

  const name =
    nameInput.value.trim();

  const password =
    passwordInput.value;

  const confirmPassword =
    confirmInput.value;

  showSignupMessage("");


  // ----------------------------------------
  // ログイン名チェック
  // ----------------------------------------

  if (!isValidUsername(name)) {

    showSignupMessage(
      "ログイン名は2～20文字の日本語・英数字・_・-で入力してください。"
    );

    return;
  }


  // ----------------------------------------
  // パスワードチェック
  // ----------------------------------------

  if (password.length < 8) {

    showSignupMessage(
      "パスワードは8文字以上にしてください。"
    );

    return;
  }


  // ----------------------------------------
  // パスワード確認
  // ----------------------------------------

  if (
    password !== confirmPassword
  ) {

    showSignupMessage(
      "パスワードが一致していません。"
    );

    return;
  }


  // ----------------------------------------
  // アカウント作成
  // ----------------------------------------

  try {

    const email =
      usernameToEmail(name);

    const { data, error } =
      await supabaseClient.auth.signUp({
        email: email,
        password: password
      });


    if (error) {

      console.error(error);

      showSignupMessage(
        "アカウント作成に失敗しました。ログイン名がすでに使われている可能性があります。"
      );

      return;
    }


    // ----------------------------------------
    // メール確認が有効な場合
    // ----------------------------------------

    if (!data.session) {

      showSignupMessage(
        "アカウントを作成しました。Supabaseのメール確認設定が有効になっています。確認設定をOFFにしてください。"
      );

      return;
    }


    // ----------------------------------------
    // ユーザー情報保存
    // ----------------------------------------

    currentUser =
      data.user;

    await createProfile(name);

    await loadProfile();

    updateUserName();


    // ----------------------------------------
    // 入力欄クリア
    // ----------------------------------------

    nameInput.value = "";
    passwordInput.value = "";
    confirmInput.value = "";


    // ----------------------------------------
    // トップ画面
    // ----------------------------------------

    showScreen("topScreen");

  } catch (error) {

    console.error(error);

    showSignupMessage(
      "アカウント作成中にエラーが発生しました。"
    );
  }
}


// ========================================
// プロフィール作成
// ========================================

async function createProfile(name) {

  if (
    !supabaseClient ||
    !currentUser
  ) {
    return;
  }

  const { error } =
    await supabaseClient
      .from("players")
      .insert({
        user_id: currentUser.id,
        name: name.trim(),
        best_diff: 99.99,
        collections: []
      });


  if (error) {

    console.error(
      "Profile creation error:",
      error
    );
  }
}


// ========================================
// ログイン
// ========================================

async function login() {

  if (!supabaseClient) {

    showLoginMessage(
      "Supabaseを設定するとログインできます。"
    );

    return;
  }


  const name =
    document
      .getElementById(
        "loginName"
      )
      .value
      .trim();


  const password =
    document
      .getElementById(
        "loginPassword"
      )
      .value;


  showLoginMessage("");


  if (
    !name ||
    !password
  ) {

    showLoginMessage(
      "ログイン名とパスワードを入力してください。"
    );

    return;
  }


  if (!isValidUsername(name)) {

    showLoginMessage(
      "ログイン名は2～20文字の日本語・英数字・_・-で入力してください。"
    );

    return;
  }


  try {

    const email =
      usernameToEmail(name);

    const { data, error } =
      await supabaseClient.auth
        .signInWithPassword({
          email: email,
          password: password
        });


    if (error) {

      console.error(error);

      showLoginMessage(
        "ログイン名またはパスワードが違います。"
      );

      return;
    }


    currentUser =
      data.user;


    await loadProfile();


    if (!currentProfile) {

      showLoginMessage(
        "ユーザー情報を取得できませんでした。"
      );

      return;
    }


    updateUserName();


    document.getElementById(
      "loginName"
    ).value = "";

    document.getElementById(
      "loginPassword"
    ).value = "";


    showScreen("topScreen");

  } catch (error) {

    console.error(error);

    showLoginMessage(
      "ログイン中にエラーが発生しました。"
    );
  }
}


// ========================================
// プロフィール取得
// ========================================

async function loadProfile() {

  if (
    !supabaseClient ||
    !currentUser
  ) {
    return null;
  }

  const { data, error } =
    await supabaseClient
      .from("players")
      .select("*")
      .eq(
        "user_id",
        currentUser.id
      )
      .single();


  if (error) {

    console.error(
      "Profile loading error:",
      error
    );

    currentProfile = null;

    return null;
  }


  currentProfile = data;


  if (
    !Array.isArray(
      currentProfile.collections
    )
  ) {

    currentProfile.collections =
      [];
  }


  return currentProfile;
}


// ========================================
// ユーザー名表示
// ========================================

function updateUserName() {

  const name =
    currentProfile?.name || "";


  const topName =
    document.getElementById(
      "currentUserName"
    );

  const gameName =
    document.getElementById(
      "gameUserName"
    );


  if (topName) {

    topName.textContent =
      `ログイン中：${name}`;
  }


  if (gameName) {

    gameName.textContent =
      name;
  }
}


// ========================================
// ログアウト
// ========================================

async function logout() {

  stopTimer();

  if (supabaseClient) {

    await supabaseClient.auth.signOut();
  }

  currentUser = null;
  currentProfile = null;

  showScreen("loginScreen");

  clearMessages();
}


// ========================================
// 新しいゲーム開始
// ========================================

function startNewGame() {

  stopTimer();


  const minTime =
    Number(
      gameConfig.settings.minTime
    );

  const maxTime =
    Number(
      gameConfig.settings.maxTime
    );


  // ----------------------------------------
  // 目標時間をランダム決定
  // ----------------------------------------

  targetTime =
    Math.random() *
      (maxTime - minTime) +
    minTime;


  targetTime =
    Number(
      targetTime.toFixed(2)
    );


  currentElapsed = 0;


  // ----------------------------------------
  // 表示リセット
  // ----------------------------------------

  document.getElementById(
    "targetTime"
  ).textContent =
    targetTime.toFixed(2);


  document.getElementById(
    "timer"
  ).textContent =
    "0.00";


  document.getElementById(
    "gameMessage"
  ).textContent =
    "";


  // ----------------------------------------
  // ゲームボタン
  // ----------------------------------------

  const gameButton =
    document.getElementById(
      "gameButton"
    );


  gameButton.textContent =
    "スタート";

  gameButton.dataset.mode =
    "start";


  gameRunning = false;
}


// ========================================
// ゲームボタン
// ========================================

function toggleGame() {

  const gameButton =
    document.getElementById(
      "gameButton"
    );


  const mode =
    gameButton.dataset.mode ||
    "start";


  // ----------------------------------------
  // もう一度
  // ----------------------------------------

  if (mode === "retry") {

    startNewGame();

    return;
  }


  // ----------------------------------------
  // 停止
  // ----------------------------------------

  if (gameRunning) {

    stopGame();

    return;
  }


  // ----------------------------------------
  // 開始
  // ----------------------------------------

  startTimer();
}


// ========================================
// タイマー開始
// ========================================

function startTimer() {

  gameRunning = true;

  startTime =
    performance.now();


  const gameButton =
    document.getElementById(
      "gameButton"
    );


  gameButton.textContent =
    "ストップ";

  gameButton.dataset.mode =
    "running";


  timerInterval =
    setInterval(
      updateTimer,
      10
    );
}


// ========================================
// タイマー更新
// ========================================

function updateTimer() {

  if (!gameRunning) {
    return;
  }


  const now =
    performance.now();


  currentElapsed =
    (now - startTime) /
    1000;


  document.getElementById(
    "timer"
  ).textContent =
    currentElapsed.toFixed(2);
}


// ========================================
// タイマー停止
// ========================================

function stopTimer() {

  if (
    timerInterval !== null
  ) {

    clearInterval(
      timerInterval
    );

    timerInterval = null;
  }


  gameRunning = false;
}


// ========================================
// ゲーム終了
// ========================================

async function stopGame() {

  if (!gameRunning) {
    return;
  }


  // 最後の時間を更新
  updateTimer();


  // タイマー停止
  stopTimer();


  const finalTime =
    Number(
      currentElapsed.toFixed(2)
    );


  const difference =
    Math.abs(
      finalTime -
      targetTime
    );


  // ----------------------------------------
  // 最終タイム表示
  // ----------------------------------------

  document.getElementById(
    "timer"
  ).textContent =
    finalTime.toFixed(2);


  // ----------------------------------------
  // もう一度ボタンに変更
  // ----------------------------------------

  const gameButton =
    document.getElementById(
      "gameButton"
    );


  gameButton.textContent =
    "もう一度";

  gameButton.dataset.mode =
    "retry";


  // ----------------------------------------
  // 誤差表示
  // ----------------------------------------

  const message =
    document.getElementById(
      "gameMessage"
    );


  message.textContent =
    `誤差：${difference.toFixed(2)}秒`;


  // ----------------------------------------
  // 完全一致
  // ----------------------------------------

  if (
    difference === 0
  ) {

    message.textContent =
      "ぴった！🎉";


    await unlockCollection(
      targetTime.toFixed(2)
    );
  }


  // ----------------------------------------
  // スコア保存
  // ----------------------------------------

  await saveScore(
    difference
  );
}


// ========================================
// スコア保存
// ========================================

async function saveScore(
  difference
) {

  if (
    !supabaseClient ||
    !currentUser ||
    !currentProfile
  ) {
    return;
  }


  const currentBest =
    Number(
      currentProfile.best_diff
    );


  // 自己ベスト更新なし
  if (
    difference >= currentBest
  ) {
    return;
  }


  const newBest =
    Number(
      difference.toFixed(2)
    );


  const { error } =
    await supabaseClient
      .from("players")
      .update({
        best_diff: newBest,
        updated_at:
          new Date().toISOString()
      })
      .eq(
        "user_id",
        currentUser.id
      );


  if (error) {

    console.error(
      "Score save error:",
      error
    );

    return;
  }


  currentProfile.best_diff =
    newBest;
}


// ========================================
// コレクション解除
// ========================================

async function unlockCollection(
  time
) {

  if (
    !supabaseClient ||
    !currentUser ||
    !currentProfile
  ) {
    return;
  }


  const collections =
    Array.isArray(
      currentProfile.collections
    )
      ? currentProfile.collections
      : [];


  // すでに解除済み
  if (
    collections.includes(time)
  ) {
    return;
  }


  collections.push(time);


  const { error } =
    await supabaseClient
      .from("players")
      .update({
        collections:
          collections,
        updated_at:
          new Date().toISOString()
      })
      .eq(
        "user_id",
        currentUser.id
      );


  if (error) {

    console.error(
      "Collection save error:",
      error
    );

    return;
  }


  currentProfile.collections =
    collections;
}


// ========================================
// 通常ランキング表示
// ========================================

async function showRanking() {

  showScreen(
    "rankScreen"
  );


  const rankingList =
    document.getElementById(
      "rankingList"
    );


  rankingList.innerHTML =
    "<p>読み込み中...</p>";


  if (!supabaseClient) {

    rankingList.innerHTML =
      "<p>Supabaseを設定するとランキングが表示されます。</p>";

    return;
  }


  const { data, error } =
    await supabaseClient
      .from("players")
      .select(
        "name, best_diff"
      )
      .order(
        "best_diff",
        {
          ascending: true
        }
      );


  if (error) {

    console.error(error);

    rankingList.innerHTML =
      "<p>ランキングを取得できませんでした。</p>";

    return;
  }


  if (
    !data ||
    data.length === 0
  ) {

    rankingList.innerHTML =
      "<p>まだランキングがありません。</p>";

    return;
  }


  rankingList.innerHTML =
    "";


  let previousScore =
    null;

  let currentRank =
    0;


  data.forEach(
    (player, index) => {

      const score =
        Number(
          player.best_diff
        );


      // 同じタイムなら同じ順位
      if (
        previousScore === null ||
        score !== previousScore
      ) {

        currentRank =
          index + 1;
      }


      previousScore =
        score;


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "ranking-item";


      if (
        currentProfile &&
        player.name ===
          currentProfile.name
      ) {

        item.classList.add(
          "current-user"
        );
      }


      item.innerHTML = `
        <div class="ranking-position">
          ${currentRank}位
        </div>

        <div class="ranking-name">
          ${escapeHtml(player.name)}
        </div>

        <div class="ranking-score">
          ${score.toFixed(2)}秒
        </div>
      `;


      rankingList.appendChild(
        item
      );
    }
  );
}


// ========================================
// コレクション表示
// ========================================

async function showCollection() {

  showScreen(
    "collectionScreen"
  );


  await loadProfile();


  renderCollection();
}


// ========================================
// コレクション描画
// ========================================

function renderCollection() {

  const grid =
    document.getElementById(
      "collectionGrid"
    );


  const countElement =
    document.getElementById(
      "collectionCount"
    );


  if (
    !gameConfig
  ) {
    return;
  }


  const items =
    getSortedCollections();


  const unlocked =
    Array.isArray(
      currentProfile?.collections
    )
      ? currentProfile.collections
      : [];


  // ----------------------------------------
  // コレクション数
  // ----------------------------------------

  countElement.textContent =
    `${unlocked.length} / ${items.length}`;


  if (
    unlocked.length ===
    items.length
  ) {

    countElement.textContent +=
      "　コンプリート！👑";
  }


  grid.innerHTML =
    "";


  // ----------------------------------------
  // 各コレクション
  // ----------------------------------------

  items.forEach(
    (item) => {

      const isUnlocked =
        unlocked.includes(
          item.time
        );


      const element =
        document.createElement(
          "div"
        );


      element.className =
        "collection-item";


      if (isUnlocked) {

        element.classList.add(
          "unlocked"
        );

      } else {

        element.classList.add(
          "locked"
        );
      }


      // 成人向けカテゴリ
      if (
        item.category ===
        "成人向け"
      ) {

        element.classList.add(
          "adult"
        );
      }


      const trophy =
        "🏆";


      const name =
        isUnlocked
          ? item.name
          : "???";


      element.innerHTML = `
        <div class="collection-trophy">
          ${trophy}
        </div>

        <div class="collection-time">
          ${escapeHtml(item.time)}秒
        </div>

        <div class="collection-name">
          ${escapeHtml(name)}
        </div>
      `;


      // ----------------------------------------
      // URLが設定されている場合
      // ----------------------------------------

      if (
        isUnlocked &&
        item.url &&
        item.url.startsWith("http")
      ) {

        element.style.cursor =
          "pointer";


        element.addEventListener(
          "click",
          () => {

            window.open(
              item.url,
              "_blank",
              "noopener,noreferrer"
            );
          }
        );
      }


      grid.appendChild(
        element
      );
    }
  );
}


// ========================================
// コレクション並び順
// 健全 → 成人向け
// それぞれ時間順
// ========================================

function getSortedCollections() {

  if (
    !gameConfig?.collections
  ) {
    return [];
  }


  return [
    ...gameConfig.collections
  ].sort(
    (a, b) => {

      const categoryA =
        a.category === "健全"
          ? 0
          : 1;


      const categoryB =
        b.category === "健全"
          ? 0
          : 1;


      if (
        categoryA !== categoryB
      ) {

        return (
          categoryA -
          categoryB
        );
      }


      return (
        Number(a.time) -
        Number(b.time)
      );
    }
  );
}


// ========================================
// コレクションランキング
// ========================================

async function showCollectionRanking() {

  showScreen(
    "collectionRankScreen"
  );


  const list =
    document.getElementById(
      "collectionRankingList"
    );


  list.innerHTML =
    "<p>読み込み中...</p>";


  if (!supabaseClient) {

    list.innerHTML =
      "<p>Supabaseを設定するとランキングが表示されます。</p>";

    return;
  }


  const { data, error } =
    await supabaseClient
      .from("players")
      .select(
        "name, collections"
      );


  if (error) {

    console.error(error);

    list.innerHTML =
      "<p>ランキングを取得できませんでした。</p>";

    return;
  }


  const total =
    gameConfig.collections.length;


  const ranking =
    data.map(
      (player) => {

        const collections =
          Array.isArray(
            player.collections
          )
            ? player.collections
            : [];


        return {
          name: player.name,
          count: Math.min(
            collections.length,
            total
          )
        };
      }
    );


  // ----------------------------------------
  // 多い順
  // 同数なら名前順
  // ----------------------------------------

  ranking.sort(
    (a, b) => {

      if (
        b.count !== a.count
      ) {

        return (
          b.count -
          a.count
        );
      }


      return a.name.localeCompare(
        b.name,
        "ja"
      );
    }
  );


  list.innerHTML =
    "";


  let previousCount =
    null;

  let currentRank =
    0;


  ranking.forEach(
    (player, index) => {

      // 同じ数なら同じ順位
      if (
        previousCount === null ||
        player.count !==
          previousCount
      ) {

        currentRank =
          index + 1;
      }


      previousCount =
        player.count;


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "collection-ranking-item";


      if (
        currentProfile &&
        player.name ===
          currentProfile.name
      ) {

        item.classList.add(
          "current-user"
        );
      }


      const crown =
        player.count === total
          ? " 👑"
          : "";


      item.innerHTML = `
        <div class="collection-ranking-position">
          ${currentRank}位
        </div>

        <div class="collection-ranking-name">
          ${escapeHtml(player.name)}
        </div>

        <div class="collection-ranking-count">
          ${player.count} / ${total}${crown}
        </div>
      `;


      list.appendChild(
        item
      );
    }
  );
}


// ========================================
// HTMLエスケープ
// ========================================

function escapeHtml(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}
