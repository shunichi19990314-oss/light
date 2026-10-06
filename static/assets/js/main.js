        // ============================================================
        // 改造版JWP main.js — 継承バグ修正版
        // 修正内容:
        //  1) 存在しない要素ID(colorPicker×3 / keyInput / time /
        //     upload-img / reset-img)への参照をすべてnull安全化。
        //     旧版は1行目のTypeErrorでスクリプト全体が停止し、
        //     ダークモード切替・パニックキー等が未登録になっていた。
        //  2) 初回訪問時(保存値なし)は元サイトと同じライト
        //     (白背景/#4c4c4c)を既定にする。
        // ============================================================

        const $ = (id) => document.getElementById(id);

        // --- テーマカラーピッカー(設定パネル要素があれば動作) ---
        function initColorPicker(inputId, cssVar, storageKey) {
            const picker = $(inputId);
            if (!picker) return; // 要素が無ければスキップ(旧版: ここでTypeError)
            picker.addEventListener("input", function () {
                document.documentElement.style.setProperty(
                    cssVar,
                    picker.value
                );
                localStorage.setItem(storageKey, picker.value);
            });
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                document.documentElement.style.setProperty(cssVar, saved);
                picker.value = saved;
            }
        }

        initColorPicker("colorPicker", "--theme-color", "themeColor");
        initColorPicker("colorPicker2", "--shadow-color", "shadowColor");
        initColorPicker("colorPicker3", "--shadow-color2", "shadowColor2");

        // --- ダーク/ライト切替 ---
        function toggleBackground() {
            const checkbox = $("backgroundToggle");
            if (!checkbox) return;

            // チェック状態に応じて背景色を設定
            var isChecked = checkbox.checked;
            document.body.style.backgroundColor = isChecked ? "black" : "white";
            document.body.style.color = isChecked ? "#fff" : "#4c4c4c";

            // 状態を保存
            localStorage.setItem("backgroundToggle", isChecked);
        }

        function loadBackground() {
            const checkbox = $("backgroundToggle");
            if (!checkbox) return;

            // 初回訪問(保存値なし)はライト = 元サイトと同じ白背景/#4c4c4c
            // (元テンプレートの loadBackground と同一ロジック)
            var isChecked = localStorage.getItem("backgroundToggle") === "true";

            checkbox.checked = isChecked;
            toggleBackground();
        }

        document.addEventListener("DOMContentLoaded", function () {
            var checkbox = $("backgroundToggle");
            if (checkbox) {
                checkbox.addEventListener("change", toggleBackground);
            }
            loadBackground();
        });

        // --- カスタム背景画像 ---
        if (localStorage.getItem("backgroundImage")) {
            const bg = $("background");
            if (bg) {
                bg.style.backgroundImage = localStorage.getItem("backgroundImage");
            }
        }

        const uploadImg = $("upload-img");
        const fileInput = $("file-input");
        if (uploadImg && fileInput) {
            uploadImg.addEventListener("click", function () {
                fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener("change", function (event) {
                var file = event.target.files[0];
                if (!file) return;
                var reader = new FileReader();
                reader.onload = function (e) {
                    var backgroundImage = "url(" + e.target.result + ")";
                    const bg = $("background");
                    if (bg) bg.style.backgroundImage = backgroundImage;
                    localStorage.setItem("backgroundImage", backgroundImage);
                };
                reader.readAsDataURL(file);
            });
        }

        const resetImg = $("reset-img");
        if (resetImg) {
            resetImg.addEventListener("click", function () {
                const bg = $("background");
                if (bg) bg.style.backgroundImage = "";
                localStorage.removeItem("backgroundImage");
            });
        }

        // --- 時計(#time 要素がある場合のみ動作) ---
        function myClock() {
            setTimeout(function () {
                const timeEl = $("time");
                if (!timeEl) return; // 要素が無ければ停止(旧版: TypeErrorで例外)
                const d = new Date();
                timeEl.innerHTML = d.toLocaleTimeString();
                myClock();
            }, 1000);
        }
        myClock();

        // --- 全画面 ---
        var elem = document.documentElement;

        function openFullscreen() {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                /* IE11 */
                elem.msRequestFullscreen();
            }
        }

        function closeFullscreen() {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                /* IE11 */
                document.msExitFullscreen();
            }
        }

        // --- パニックキー(既定: ` キーで desmos.com へ) ---
        document.addEventListener("DOMContentLoaded", () => {
            const currentUrl = "https://desmos.com";
            const defaultKey = "`";
            let triggerKey = defaultKey;

            function updateTriggerKey(value) {
                triggerKey = value.slice(0, 1); // 先頭1文字に制限
            }

            const keyInput = $("keyInput");
            if (keyInput) {
                keyInput.addEventListener("input", (e) => {
                    updateTriggerKey(e.target.value);
                });
                keyInput.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") {
                        updateTriggerKey(e.target.value);
                        e.preventDefault();
                    }
                });
            }

            // keyInput要素が無くても既定キー(`)でパニックキーは機能する
            document.addEventListener("keydown", (e) => {
                if (e.key === triggerKey) {
                    window.location.href = currentUrl;
                }
            });
        });

        // --- クローク(Google風の新規ウィンドウ) ---
        function openGame() {
            var win = window.open();
            var url = window.location.href;
            var iframe = win.document.createElement("iframe");
            iframe.style.frameborder = "0";
            iframe.style.marginwidth = "0";
            iframe.style.width = "100%";
            iframe.style.height = "100%";
            iframe.style.border = "none";
            iframe.style.position = "fixed";
            iframe.style.inset = "0px";
            iframe.style.outline = "none";
            iframe.style.scrolling = "auto";
            iframe.src = url;
            win.document.title = "Google";
            var link = win.document.createElement("link");
            link.rel = "icon";
            link.type = "image/x-icon";
            link.href = "https://www.google.com/favicon.ico";
            win.document.head.appendChild(link);
            win.document.body.appendChild(iframe);
        }
