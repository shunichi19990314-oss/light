"use strict";

// ============================================================
// 改造版JWP index.js — 継承バグ修正版
// 修正内容:
//  1) 存在しない要素(uv-search-engine / uv-error / uv-error-code)
//     への未使用参照と未使用変数(input)を削除。
//  2) submitハンドラをService Worker登録完了「前」に登録。
//     旧版は登録完了後にしかlistenerを付けなかったため、
//     登録前にEnterを押すとネイティブGET送信でページが
//     リロードされるレースがあった。
// ============================================================

/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("uv-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("uv-address");

// crypts class definition
class crypts {
  static encode(str) {
    return encodeURIComponent(
      str
        .toString()
        .split("")
        .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char))
        .join("")
    );
  }

  static decode(str) {
    if (str.charAt(str.length - 1) === "/") {
      str = str.slice(0, -1);
    }
    return decodeURIComponent(
      str
        .split("")
        .map((char, ind) => (ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char))
        .join("")
    );
  }
}

// Search function definition
function search(input) {
  input = input.trim();  // Trim the input to remove any whitespace
  // Retrieve the search engine URL template from localStorage or use default
  const searchTemplate = 'https://google.com/search?q=%s';

  try {
    // Try to treat the input as a URL
    return new URL(input).toString();
  } catch (err) {
    // The input was not a valid URL; attempt to prepend 'http://'
    try {
      const url = new URL(`http://${input}`);
      if (url.hostname.includes(".")) {
        return url.toString();
      }
      throw new Error('Invalid hostname');  // Force jump to the next catch block
    } catch (err) {
      // The input was not a valid URL - treat as a search query
      return searchTemplate.replace("%s", encodeURIComponent(input));
    }
  }
}

// Service Worker 登録 Promise (登録完了をsubmit時に待つために保持)
let swReady = null;

if ('serviceWorker' in navigator) {
  var proxySetting = 'uv';
  let swConfig = {
    'uv': { file: '/uv/sw.js', config: __uv$config }
  };

  let { file: swFile, config: swConfigSettings } = swConfig[proxySetting];

  swReady = navigator.serviceWorker
    .register(swFile, { scope: swConfigSettings.prefix })
    .then((registration) => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      return swConfigSettings;
    })
    .catch((error) => {
      console.error('ServiceWorker registration failed:', error);
      throw error;
    });
}

// 修正: listenerは即座に登録し、送信時にSW登録完了をawaitする
if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!swReady) {
      // Service Worker非対応環境: リロードは起こさず何もしない(旧版同等)
      return;
    }

    try {
      const swConfigSettings = await swReady;
      const encodedUrl = swConfigSettings.prefix + crypts.encode(search(address ? address.value : ''));
      location.href = encodedUrl;
    } catch (error) {
      // 登録失敗時もネイティブ送信(リロード)は発生させない
      console.error('Proxy unavailable:', error);
    }
  });
}
