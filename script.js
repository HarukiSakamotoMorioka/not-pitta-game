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

    gameConfig =
      await response.json();

    console.log(
      "読み込んだgameConfig:",
      gameConfig
    );

    initializeSupabase();

    showScreen("loginScreen");

    if (!supabaseClient) {
      showLoginMessage(
        "Supabase未設定です。"
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

    if (
      !window.supabase ||
      !window.supabase.createClient
    ) {
      throw new Error(
        "Supabase CDNを読み込めませんでした。"
      );
    }

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
// ログイン名処理
// ========================================

function normalizeUsername(name) {

  return name
    .trim()
    .normalize("NFKC")
    .toLowerCase();
}

function isValidUsername(name) {

  return /^[\p{L}\p{N}_-]{2,20}$/u.test(
    name
  );
}

function usernameToEmail(name) {

  return `${normalizeUsername(name)}@pitta.local`;
}
// ========================================
// イベント設定
// ========================================

function setupEvents() {

  // ----------------------------------------
  // ログイン
  // ----------------------------------------

  addClick(
    "loginButton",
    login
  );


  // ----------------------------------------
  // パスワードを忘れた
  // ----------------------------------------

  addClick(
    "forgotPasswordButton",
    () => {
      showScreen("resetPasswordScreen");
      clearResetPasswordForm();
    }
  );


  // ----------------------------------------
  // 新規作成へ
  // ----------------------------------------

  addClick(
    "goSignupButton",
    () => {
      showScreen("signupScreen");
      clearMessages();
    }
  );

  addClick(
    "loginToSignupTop",
    () => {
      showScreen("signupScreen");
      clearMessages();
    }
  );


  // ----------------------------------------
  // ログインへ
  // ----------------------------------------

  addClick(
    "goLoginButton",
    () => {
      showScreen("loginScreen");
      clearMessages();
    }
  );

  addClick(
    "signupToLoginTop",
    () => {
      showScreen("loginScreen");
      clearMessages();
    }
  );


  // ----------------------------------------
  // パスワード変更
  // ----------------------------------------

  addClick(
    "resetPasswordButton",
    resetPassword
  );

  addClick(
    "resetToLoginButton",
    () => {
      showScreen("loginScreen");
      clearResetPasswordForm();
    }
  );


  // ----------------------------------------
  // 新規作成
  // ----------------------------------------

  addClick(
    "signupButton",
    signup
  );


  // ----------------------------------------
  // ログアウト
  // ----------------------------------------

  addClick(
    "logoutButton",
    logout
  );

  addClick(
    "gameLogoutButton",
    logout
  );


  // ----------------------------------------
  // ゲーム開始
  // ----------------------------------------

  addClick(
    "startGameButton",
    () => {

      showScreen("gameScreen");

      startNewGame();
    }
  );


  // ----------------------------------------
  // ゲームボタン
  // ----------------------------------------

  addClick(
    "gameButton",
    toggleGame
  );


  // ========================================
  // ゲーム画面メニュー
  // ========================================

  addClick(
    "gameMenuButton",
    toggleGameMenu
  );


  // ----------------------------------------
  // メニュー → 通常ランキング
  // ----------------------------------------

  addClick(
    "gameRankingButton",
    () => {

      closeGameMenu();

      showRanking();
    }
  );


  // ----------------------------------------
  // メニュー → コレクションランキング
  // ----------------------------------------

  addClick(
    "gameCollectionRankingButton",
    () => {

      closeGameMenu();

      showCollectionRanking();
    }
  );


  // ----------------------------------------
  // メニュー → コレクション
  // ----------------------------------------

  addClick(
    "gameCollectionButton",
    () => {

      closeGameMenu();

      showCollection();
    }
  );


  // ----------------------------------------
  // 通常ランキング
  // ----------------------------------------

  addClick(
    "rankBackButton",
    () => {
      showScreen("gameScreen");
    }
  );


  // ----------------------------------------
  // ランキング → コレクション
  // ----------------------------------------

  addClick(
    "rankCollectionButton",
    showCollection
  );


  // ----------------------------------------
  // コレクション
  // ----------------------------------------

  addClick(
    "collectionBackButton",
    () => {
      showScreen("rankScreen");
    }
  );


  // ----------------------------------------
  // コレクション
  // → コレクションランキング
  // ----------------------------------------

  addClick(
    "collectionRankingButtonFromCollection",
    showCollectionRanking
  );


  // ----------------------------------------
  // コレクションランキング
  // ----------------------------------------

  addClick(
    "collectionRankBackButton",
    () => {
      showScreen("collectionScreen");
    }
  );

  addClick(
    "collectionRankGameButton",
    () => {
      showScreen("gameScreen");
    }
  );


  // ----------------------------------------
  // Enterキー
  // ----------------------------------------

  addKeydown(
    "loginPassword",
    (event) => {

      if (event.key === "Enter") {
        login();
      }
    }
  );


  addKeydown(
    "signupPasswordConfirm",
    (event) => {

      if (event.key === "Enter") {
        signup();
      }
    }
  );


  addKeydown(
    "resetPasswordConfirm",
    (event) => {

      if (event.key === "Enter") {
        resetPassword();
      }
    }
  );
}


// ========================================
// ゲームメニュー
// ========================================

function toggleGameMenu() {

  const menu =
    document.getElementById(
      "gameMenuDropdown"
    );

  if (!menu) {
    return;
  }

  menu.classList.toggle(
    "hidden"
  );
}


function closeGameMenu() {

  const menu =
    document.getElementById(
      "gameMenuDropdown"
    );

  if (!menu) {
    return;
  }

  menu.classList.add(
    "hidden"
  );
}


// ========================================
// イベント安全設定
// ========================================

function addClick(id, handler) {

  const element =
    document.getElementById(id);

  if (!element) {

    console.warn(
      `イベント対象が見つかりません: #${id}`
    );

    return;
  }

  element.addEventListener(
    "click",
    handler
  );
}


function addKeydown(id, handler) {

  const element =
    document.getElementById(id);

  if (!element) {

    console.warn(
      `イベント対象が見つかりません: #${id}`
    );

    return;
  }

  element.addEventListener(
    "keydown",
    handler
  );
}


// ========================================
// 画面切り替え
// ========================================

function showScreen(screenId) {

  const screens = [
    "loginScreen",
    "signupScreen",
    "resetPasswordScreen",
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

  // ゲーム画面以外へ移動したら
  // プルダウンも閉じる
  if (screenId !== "gameScreen") {
    closeGameMenu();
  }
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

  const resetPasswordMessage =
    document.getElementById(
      "resetPasswordMessage"
    );

  if (loginMessage) {
    loginMessage.textContent = "";
  }

  if (signupMessage) {
    signupMessage.textContent = "";
  }

  if (resetPasswordMessage) {
    resetPasswordMessage.textContent = "";
  }
}


function showLoginMessage(message) {

  const element =
    document.getElementById(
      "loginMessage"
    );

  if (element) {
    element.textContent = message;
  }
}


function showSignupMessage(message) {

  const element =
    document.getElementById(
      "signupMessage"
    );

  if (element) {
    element.textContent = message;
  }
}


function showResetPasswordMessage(message) {

  const element =
    document.getElementById(
      "resetPasswordMessage"
    );

  if (element) {
    element.textContent = message;
  }
}


// ========================================
// パスワード変更画面クリア
// ========================================

function clearResetPasswordForm() {

  const nameInput =
    document.getElementById(
      "resetName"
    );

  const passwordInput =
    document.getElementById(
      "resetPassword"
    );

  const confirmInput =
    document.getElementById(
      "resetPasswordConfirm"
    );

  const message =
    document.getElementById(
      "resetPasswordMessage"
    );

  if (nameInput) {
    nameInput.value = "";
  }

  if (passwordInput) {
    passwordInput.value = "";
  }

  if (confirmInput) {
    confirmInput.value = "";
  }

  if (message) {
    message.textContent = "";
  }
}


// ========================================
// パスワード変更
// ========================================

async function resetPassword() {

  if (!supabaseClient) {

    showResetPasswordMessage(
      "Supabaseを設定するとパスワードを変更できます。"
    );

    return;
  }


  const nameInput =
    document.getElementById(
      "resetName"
    );

  const passwordInput =
    document.getElementById(
      "resetPassword"
    );

  const confirmInput =
    document.getElementById(
      "resetPasswordConfirm"
    );


  if (
    !nameInput ||
    !passwordInput ||
    !confirmInput
  ) {
    return;
  }


  const name =
    nameInput.value.trim();

  const password =
    passwordInput.value;

  const confirmPassword =
    confirmInput.value;


  showResetPasswordMessage("");


  if (!isValidUsername(name)) {

    showResetPasswordMessage(
      "ログイン名は2～20文字の日本語・英数字・_・-で入力してください。"
    );

    return;
  }


  if (password.length < 8) {

    showResetPasswordMessage(
      "パスワードは8文字以上にしてください。"
    );

    return;
  }


  if (
    password !== confirmPassword
  ) {

    showResetPasswordMessage(
      "パスワードが一致していません。"
    );

    return;
  }


  try {

    showResetPasswordMessage(
      "更新しています..."
    );


    const { data, error } =
      await supabaseClient.functions.invoke(
        "reset-password",
        {
          body: {
            name,
            password
          }
        }
      );


    if (error) {

      console.error(
        "Password reset function error:",
        error
      );

      showResetPasswordMessage(
        "パスワードの更新に失敗しました。"
      );

      return;
    }


    if (
      !data ||
      !data.success
    ) {

      showResetPasswordMessage(
        data?.message ||
        "パスワードの更新に失敗しました。"
      );

      return;
    }


    nameInput.value = "";
    passwordInput.value = "";
    confirmInput.value = "";


    showResetPasswordMessage(
      "パスワードを更新しました。ログイン画面に戻ります。"
    );


    setTimeout(() => {

      showScreen(
        "loginScreen"
      );

      clearResetPasswordForm();

    }, 1200);


  } catch (error) {

    console.error(
      "Password reset error:",
      error
    );

    showResetPasswordMessage(
      "パスワード更新中にエラーが発生しました。"
    );
  }
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


function isValidUsername(name) {

  return /^[\p{L}\p{N}_-]{2,20}$/u.test(
    name
  );
}


function usernameToEmail(name) {

  return `${normalizeUsername(name)}@pitta.local`;
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


  if (
    !nameInput ||
    !passwordInput ||
    !confirmInput
  ) {
    return;
  }


  const name =
    nameInput.value.trim();

  const password =
    passwordInput.value;

  const confirmPassword =
    confirmInput.value;


  showSignupMessage("");


  if (!isValidUsername(name)) {

    showSignupMessage(
      "ログイン名は2～20文字の日本語・英数字・_・-で入力してください。"
    );

    return;
  }


  if (password.length < 8) {

    showSignupMessage(
      "パスワードは8文字以上にしてください。"
    );

    return;
  }


  if (
    password !== confirmPassword
  ) {

    showSignupMessage(
      "パスワードが一致していません。"
    );

    return;
  }


  try {

    const email =
      usernameToEmail(name);


    const { data, error } =
      await supabaseClient.auth.signUp({
        email,
        password
      });


    if (error) {

      console.error(error);

      showSignupMessage(
        "アカウント作成に失敗しました。ログイン名がすでに使われている可能性があります。"
      );

      return;
    }


    if (!data.session) {

      showSignupMessage(
        "アカウントは作成されましたが、メール確認が必要な設定になっています。Supabaseの「Confirm email」をOFFにしてください。"
      );

      return;
    }


    currentUser =
      data.user;


    const profileCreated =
      await createProfile(name);


    if (!profileCreated) {

      showSignupMessage(
        "アカウントは作成されましたが、ユーザー情報の保存に失敗しました。"
      );

      return;
    }


    await loadProfile();


    updateUserName();


    nameInput.value = "";
    passwordInput.value = "";
    confirmInput.value = "";


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
    return false;
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

    return false;
  }


  return true;
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


  const nameElement =
    document.getElementById(
      "loginName"
    );

  const passwordElement =
    document.getElementById(
      "loginPassword"
    );


  if (
    !nameElement ||
    !passwordElement
  ) {
    return;
  }


  const name =
    nameElement.value.trim();

  const password =
    passwordElement.value;


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
          email,
          password
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


    nameElement.value = "";
    passwordElement.value = "";


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


  currentProfile =
    data;


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

  closeGameMenu();


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

  closeGameMenu();


  const minTime =
    Number(
      gameConfig?.settings?.minTime ?? 5
    );

  const maxTime =
    Number(
      gameConfig?.settings?.maxTime ?? 10
    );


  targetTime =
    Math.random() *
      (maxTime - minTime) +
    minTime;


  targetTime =
    Number(
      targetTime.toFixed(2)
    );


  currentElapsed = 0;


  const targetElement =
    document.getElementById(
      "targetTime"
    );

  const timerElement =
    document.getElementById(
      "timer"
    );

  const messageElement =
    document.getElementById(
      "gameMessage"
    );

  const gameButton =
    document.getElementById(
      "gameButton"
    );


  if (targetElement) {

    targetElement.textContent =
      targetTime.toFixed(2);
  }


  if (timerElement) {

    timerElement.textContent =
      "0.00";
  }


  if (messageElement) {

    messageElement.textContent =
      "";
  }


  if (gameButton) {

    gameButton.textContent =
      "スタート";

    gameButton.dataset.mode =
      "start";
  }


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


  if (!gameButton) {
    return;
  }


  const mode =
    gameButton.dataset.mode ||
    "start";


  if (mode === "retry") {

    startNewGame();

    return;
  }


  if (gameRunning) {

    stopGame();

    return;
  }


  startTimer();
}


// ========================================
// タイマー開始
// ========================================

function startTimer() {

  stopTimer();


  gameRunning = true;

  startTime =
    performance.now();


  const gameButton =
    document.getElementById(
      "gameButton"
    );


  if (gameButton) {

    gameButton.textContent =
      "ストップ";

    gameButton.dataset.mode =
      "running";
  }


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


  const timerElement =
    document.getElementById(
      "timer"
    );


  if (timerElement) {

    timerElement.textContent =
      currentElapsed.toFixed(2);
  }
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
// ========================================
// ゲーム終了
// ========================================

async function stopGame() {
  if (!gameRunning) {
    return;
  }

  updateTimer();
  stopTimer();

  const finalTime = Number(currentElapsed.toFixed(2));
  const difference = Number(Math.abs(finalTime - targetTime).toFixed(2));

  const timerElement = document.getElementById("timer");
  const gameButton = document.getElementById("gameButton");
  const message = document.getElementById("gameMessage");

  if (timerElement) {
    timerElement.textContent = finalTime.toFixed(2);
  }

  if (gameButton) {
    gameButton.textContent = "もう一度";
    gameButton.dataset.mode = "retry";
  }

  // ----- 通常ゲーム(お題との勝負)-----
  if (message) {
    message.textContent =
      difference === 0
        ? "ぴった！🎉"
        : `誤差：${difference.toFixed(2)}秒`;
  }

  // スコアは遷移で途切れないよう先に保存
  await saveScore(difference);

  // ----- 隠し要素(お題とは無関係)-----
  const hiddenCollection = gameConfig?.collections?.find(
    (item) => Number(item.time).toFixed(2) === finalTime.toFixed(2)
  );

  if (!hiddenCollection) {
    return;
  }

  const collectionTime = Number(hiddenCollection.time).toFixed(2);

  const unlocked = Array.isArray(currentProfile?.collections)
    ? currentProfile.collections.map((t) => Number(t).toFixed(2))
    : [];

  // 未解除なら保存(保存が終わってから遷移する)
  if (!unlocked.includes(collectionTime)) {
    await unlockCollection(collectionTime);
  }

  // 一致したら、解除済みでも毎回飛ぶ
  const url = String(hiddenCollection.url || "").trim();
  if (/^https?:\/\//i.test(url)) {
    setTimeout(() => {
      window.location.href = url;
    }, 300);
  }
}
  }

  await saveScore(difference);
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
        best_diff:
          newBest,

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
      ? [
          ...currentProfile.collections
        ]
      : [];


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
// 通常ランキング
// ========================================

async function showRanking() {

  showScreen(
    "rankScreen"
  );


  const rankingList =
    document.getElementById(
      "rankingList"
    );


  if (!rankingList) {
    return;
  }


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
          ±${score.toFixed(2)}秒
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
    !grid ||
    !countElement ||
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


      element.classList.add(
        isUnlocked
          ? "unlocked"
          : "locked"
      );


      if (
        item.category ===
        "成人向け"
      ) {

        element.classList.add(
          "adult"
        );
      }


      const name =
        isUnlocked
          ? item.name
          : "???";


      element.innerHTML = `
        <div class="collection-trophy">
          🏆
        </div>

        <div class="collection-time">
          ${escapeHtml(item.time)}秒
        </div>

        <div class="collection-name">
          ${escapeHtml(name)}
        </div>
      `;


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
// 健全 → その他
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


  if (!list) {
    return;
  }


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
    gameConfig?.collections?.length || 0;


  const ranking =
    (data || []).map(
      (player) => {

        const collections =
          Array.isArray(
            player.collections
          )
            ? player.collections
            : [];


        return {
          name:
            player.name,

          count:
            Math.min(
              collections.length,
              total
            )
        };
      }
    );


  ranking.sort(
    (a, b) => {

      if (
        b.count !== a.count
      ) {

        return (
          b.count - a.count
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


  if (
    ranking.length === 0
  ) {

    list.innerHTML =
      "<p>まだランキングがありません。</p>";

    return;
  }


  let previousCount =
    null;

  let currentRank =
    0;


  ranking.forEach(
    (player, index) => {

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
