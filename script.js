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
        "プロフィールの読み込みに失敗しました。"
      );
      return;
    }


    showScreen("topScreen");

    updateUserName();


  } catch (error) {

    console.error(error);

    showLoginMessage(
      "ログイン中にエラーが発生しました。"
    );

  }

}


async function signup() {

  const nameInput =
    document.getElementById("signupName");

  const passwordInput =
    document.getElementById("signupPassword");

  const passwordConfirmInput =
    document.getElementById("signupPasswordConfirm");

  const name =
    nameInput?.value.trim() || "";

  const password =
    passwordInput?.value || "";

  const passwordConfirm =
    passwordConfirmInput?.value || "";


  if (!name) {

    showSignupMessage(
      "ログイン名を入力してください。"
    );

    return;
  }


  if (name.length > 20) {

    showSignupMessage(
      "ログイン名は20文字以内にしてください。"
    );

    return;
  }


  if (password.length < 8) {

    showSignupMessage(
      "パスワードは8文字以上にしてください。"
    );

    return;
  }


  if (password !== passwordConfirm) {

    showSignupMessage(
      "パスワードが一致しません。"
    );

    return;
  }


  if (!supabaseClient) {

    showSignupMessage(
      "Supabaseの設定を確認してください。"
    );

    return;
  }


  const email =
    `${normalizeUsername(name)}@pitta.local`;


  showSignupMessage(
    "アカウントを作成しています..."
  );


  try {

    const {
      data,
      error
    } =
      await supabaseClient.auth.signUp({
        email,
        password
      });


    if (error) {

      console.error(error);

      showSignupMessage(
        "アカウント作成に失敗しました。"
      );

      return;
    }


    if (!data.user) {

      showSignupMessage(
        "アカウント作成に失敗しました。"
      );

      return;
    }


    const {
      error: profileError
    } =
      await supabaseClient
        .from("players")
        .insert({
          user_id: data.user.id,
          name,
          best_diff: null,
          collections: [],
          updated_at:
            new Date().toISOString()
        });


    if (profileError) {

      console.error(profileError);

      showSignupMessage(
        "プロフィール作成に失敗しました。"
      );

      return;
    }


    showSignupMessage(
      "アカウントを作成しました。ログインしてください。"
    );


    if (nameInput) {
      nameInput.value = "";
    }

    if (passwordInput) {
      passwordInput.value = "";
    }

    if (passwordConfirmInput) {
      passwordConfirmInput.value = "";
    }


  } catch (error) {

    console.error(error);

    showSignupMessage(
      "アカウント作成中にエラーが発生しました。"
    );

  }

}


async function logout() {

  if (supabaseClient) {

    const {
      error
    } =
      await supabaseClient.auth.signOut();

    if (error) {
      console.error(error);
    }

  }


  currentUser = null;
  currentProfile = null;

  stopTimer();

  gameRunning = false;

  closeGameMenu();

  showScreen("loginScreen");

}


async function loadProfile() {

  if (
    !supabaseClient ||
    !currentUser
  ) {
    return null;
  }


  const {
    data,
    error
  } =
    await supabaseClient
      .from("players")
      .select("*")
      .eq("user_id", currentUser.id)
      .maybeSingle();


  if (error) {

    console.error(
      "Profile load error:",
      error
    );

    return null;
  }


  currentProfile = data;

  return data;

}


async function saveScore(difference) {

  if (
    !supabaseClient ||
    !currentUser ||
    !currentProfile
  ) {
    return;
  }


  const newDifference =
    Number(difference.toFixed(2));


  const oldDifference =
    currentProfile.best_diff === null ||
    currentProfile.best_diff === undefined
      ? null
      : Number(
          Number(currentProfile.best_diff)
            .toFixed(2)
        );


  if (
    oldDifference !== null &&
    newDifference >= oldDifference
  ) {
    return;
  }


  const {
    error
  } =
    await supabaseClient
      .from("players")
      .update({
        best_diff: newDifference,
        updated_at:
          new Date().toISOString()
      })
      .eq("user_id", currentUser.id);


  if (error) {

    console.error(
      "Score save error:",
      error
    );

    return;
  }


  currentProfile.best_diff =
    newDifference;

}


async function unlockCollection(time) {

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
      ? [...currentProfile.collections]
      : [];


  const normalizedCollections =
    collections.map(
      (value) =>
        Number(value).toFixed(2)
    );


  const normalizedTime =
    Number(time).toFixed(2);


  if (
    normalizedCollections.includes(
      normalizedTime
    )
  ) {
    return;
  }


  collections.push(
    normalizedTime
  );


  const {
    error
  } =
    await supabaseClient
      .from("players")
      .update({
        collections,
        updated_at:
          new Date().toISOString()
      })
      .eq("user_id", currentUser.id);


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


function renderRanking() {

  const list =
    document.getElementById(
      "rankingList"
    );


  if (!list) {
    return;
  }


  list.innerHTML =
    "<p>読み込み中...</p>";


  if (!supabaseClient) {

    list.innerHTML =
      "<p>Supabaseの設定を確認してください。</p>";

    return;
  }


  loadRanking(list);

}


async function loadRanking(list) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("players")
      .select(
        "name,best_diff"
      )
      .not(
        "best_diff",
        "is",
        null
      )
      .order(
        "best_diff",
        {
          ascending: true
        }
      )
      .limit(100);


  if (error) {

    console.error(error);

    list.innerHTML =
      "<p>ランキングを読み込めませんでした。</p>";

    return;
  }


  if (!data || data.length === 0) {

    list.innerHTML =
      "<p>まだランキングがありません。</p>";

    return;
  }


  list.innerHTML = "";


  data.forEach(
    (player, index) => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "ranking-item";


      const rank =
        document.createElement(
          "span"
        );

      rank.className =
        "ranking-rank";

      rank.textContent =
        `${index + 1}位`;


      const name =
        document.createElement(
          "span"
        );

      name.className =
        "ranking-name";

      name.textContent =
        player.name;


      const score =
        document.createElement(
          "span"
        );

      score.className =
        "ranking-score";

      score.textContent =
        `${Number(player.best_diff).toFixed(2)}秒`;


      item.appendChild(rank);
      item.appendChild(name);
      item.appendChild(score);

      list.appendChild(item);

    }
  );

}


function renderCollection() {

  const grid =
    document.getElementById(
      "collectionGrid"
    );

  const count =
    document.getElementById(
      "collectionCount"
    );


  if (!grid) {
    return;
  }


  const collections =
    Array.isArray(
      currentProfile?.collections
    )
      ? currentProfile.collections
      : [];


  const unlocked =
    new Set(
      collections.map(
        (value) =>
          Number(value).toFixed(2)
      )
    );


  const allCollections =
    Array.isArray(
      gameConfig?.collections
    )
      ? gameConfig.collections
      : [];


  const unlockedCount =
    allCollections.filter(
      (item) =>
        unlocked.has(
          Number(item.time).toFixed(2)
        )
    ).length;


  if (count) {

    count.textContent =
      `${unlockedCount} / ${allCollections.length}`;

  }


  grid.innerHTML = "";


  allCollections.forEach(
    (item) => {

      const time =
        Number(item.time).toFixed(2);


      const isUnlocked =
        unlocked.has(time);


      const element =
        document.createElement(
          "div"
        );


      element.className =
        "collection-item";


      if (
        item.category === "成人向け"
      ) {
        element.classList.add(
          "adult"
        );
      }


      if (!isUnlocked) {

        element.classList.add(
          "locked"
        );

      }


      const timeElement =
        document.createElement(
          "div"
        );

      timeElement.className =
        "collection-time";

      timeElement.textContent =
        `${time}秒`;


      const nameElement =
        document.createElement(
          "div"
        );

      nameElement.className =
        "collection-name";


      if (isUnlocked) {

        nameElement.textContent =
          item.name;

      } else {

        nameElement.textContent =
          "？？？";

      }


      element.appendChild(
        timeElement
      );

      element.appendChild(
        nameElement
      );


      /*
       * 健全なコレクションだけ、
       * URLクリックを有効にする。
       */
      if (
        isUnlocked &&
        item.category !== "成人向け" &&
        item.url &&
        /^https?:\/\//i.test(
          String(item.url).trim()
        )
      ) {

        element.style.cursor =
          "pointer";


        element.addEventListener(
          "click",
          () => {

            window.open(
              String(item.url).trim(),
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


function renderCollectionRanking() {

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
      "<p>Supabaseの設定を確認してください。</p>";

    return;
  }


  loadCollectionRanking(list);

}


async function loadCollectionRanking(list) {

  const {
    data,
    error
  } =
    await supabaseClient
      .from("players")
      .select(
        "name,collections"
      );


  if (error) {

    console.error(error);

    list.innerHTML =
      "<p>コレクションランキングを読み込めませんでした。</p>";

    return;
  }


  const allCollections =
    Array.isArray(
      gameConfig?.collections
    )
      ? gameConfig.collections
      : [];


  const collectionTimes =
    allCollections.map(
      (item) =>
        Number(item.time).toFixed(2)
    );


  const ranking =
    (data || [])
      .map(
        (player) => {

          const collections =
            Array.isArray(
              player.collections
            )
              ? player.collections
              : [];


          const uniqueCollections =
            new Set(
              collections.map(
                (value) =>
                  Number(value).toFixed(2)
              )
            );


          const count =
            collectionTimes.filter(
              (time) =>
                uniqueCollections.has(time)
            ).length;


          return {
            name: player.name,
            count
          };

        }
      )
      .sort(
        (a, b) =>
          b.count - a.count
      );


  if (ranking.length === 0) {

    list.innerHTML =
      "<p>まだランキングがありません。</p>";

    return;
  }


  list.innerHTML = "";


  ranking.forEach(
    (player, index) => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "ranking-item";


      const rank =
        document.createElement(
          "span"
        );

      rank.className =
        "ranking-rank";

      rank.textContent =
        `${index + 1}位`;


      const name =
        document.createElement(
          "span"
        );

      name.className =
        "ranking-name";

      name.textContent =
        player.name;


      const score =
        document.createElement(
          "span"
        );

      score.className =
        "ranking-score";

      score.textContent =
        `${player.count}個`;


      item.appendChild(rank);
      item.appendChild(name);
      item.appendChild(score);

      list.appendChild(item);

    }
  );

}


function showScreen(screenId) {

  const screens =
    document.querySelectorAll(
      ".screen"
    );


  screens.forEach(
    (screen) => {

      screen.classList.add(
        "hidden"
      );

    }
  );


  const target =
    document.getElementById(
      screenId
    );


  if (target) {

    target.classList.remove(
      "hidden"
    );

  }

}


function updateUserName() {

  const name =
    currentProfile?.name ||
    currentUser?.email ||
    "";


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
      name;
  }


  if (gameName) {
    gameName.textContent =
      name;
  }

}


function showLoginMessage(message) {

  const element =
    document.getElementById(
      "loginMessage"
    );


  if (element) {

    element.textContent =
      message;

  }

}


function showSignupMessage(message) {

  const element =
    document.getElementById(
      "signupMessage"
    );


  if (element) {

    element.textContent =
      message;

  }

}


function showResetMessage(message) {

  const element =
    document.getElementById(
      "resetPasswordMessage"
    );


  if (element) {

    element.textContent =
      message;

  }

}


function showGameMessage(message) {

  const element =
    document.getElementById(
      "gameMessage"
    );


  if (element) {

    element.textContent =
      message;

  }

}


function closeGameMenu() {

  const dropdown =
    document.getElementById(
      "gameMenuDropdown"
    );


  if (dropdown) {

    dropdown.classList.add(
      "hidden"
    );

  }

}


function toggleGameMenu() {

  const dropdown =
    document.getElementById(
      "gameMenuDropdown"
    );


  if (!dropdown) {
    return;
  }


  dropdown.classList.toggle(
    "hidden"
  );

}


function updateTimer() {

  if (!gameRunning) {
    return;
  }


  currentElapsed =
    (performance.now() - startTimestamp)
    / 1000;


  const timer =
    document.getElementById(
      "timer"
    );


  if (timer) {

    timer.textContent =
      currentElapsed.toFixed(2);

  }

}


function startTimer() {

  stopTimer();


  gameRunning = true;

  startTimestamp =
    performance.now();


  timerInterval =
    setInterval(
      updateTimer,
      10
    );

}


function stopTimer() {

  if (timerInterval !== null) {

    clearInterval(
      timerInterval
    );

    timerInterval = null;

  }


  gameRunning = false;

}


function getCollectionByTime(time) {

  const collections =
    Array.isArray(
      gameConfig?.collections
    )
      ? gameConfig.collections
      : [];


  const normalizedTime =
    Number(time).toFixed(2);


  return collections.find(
    (item) =>
      Number(item.time).toFixed(2) ===
      normalizedTime
  );

}


function startNewGame() {

  stopTimer();

  closeGameMenu();


  const minTime =
    Number(
      gameConfig?.settings?.minTime ??
      5
    );


  const maxTime =
    Number(
      gameConfig?.settings?.maxTime ??
      10
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


function formatTime(value) {

  return Number(
    value
  ).toFixed(2);

}


function normalizeUsername(name) {

  return String(name)
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9_-]/g,
      ""
    );

}


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

  
