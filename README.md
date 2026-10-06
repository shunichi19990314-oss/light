# 改造版JWP — Railway 完全再現版

`https://light-url-nana-129.onrender.com/` (改造版Japanese Proxy Web) を
Railway で動かすための完全再現プロジェクトです。

## 構成(本家と同一)

| 要素 | 内容 |
|---|---|
| フロントエンド | `static/` 配下(本家と SHA-256 が完全一致する12ファイル) |
| プロキシエンジン | Ultraviolet(`/uv/*`, Service Worker ベース、prefix: `/uv/service/`) |
| バックエンド | `@tomphttp/bare-server-node` **v2.0.3**(本家と同一バージョン)を `/bare/` にマウント |
| Webサーバー | Express(本家と同じく 404 は Express 標準の `Cannot GET ...`) |

本家で確認された bare-server-node v2.0.3 の挙動(v1/v2/v3 エンドポイント、
エラーレスポンスの JSON 形式)もそのまま再現しています。

## ローカルで動かす

```bash
npm install
npm start          # http://localhost:3000
# ポート変更: PORT=8080 npm start
```

## Railway にデプロイ

### 方法A: GitHub 経由(推奨)

1. このフォルダを GitHub リポジトリに push
   (すでに git 初期化・コミット済みなので `git remote add origin <URL> && git push -u origin main` だけ)
2. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
3. リポジトリを選択 → 自動検出(Node + Nixpacks)でそのままビルドされる
4. デプロイ完了後、サービス設定 → **Networking** → **Generate Domain** で
   `https://<サービス名>.up.railway.app` の公開 URL を発行

### 方法B: Railway CLI

```bash
npm i -g @railway/cli
railway login
railway init      # プロジェクト作成
railway up        # このフォルダをアップロードしてデプロイ
railway domain    # 公開ドメインを発行
```

- `railway.json` 済み: ビルダーは Nixpacks、起動コマンドは `npm start`
- `PORT` 環境変数は Railway が自動で注入します(コード側で参照済み)
- 環境変数の追加設定は不要です

## 動作確認済み項目

- [x] 全12静的ファイルが本家と SHA-256 完全一致
- [x] `/bare/` メタデータ(v1/v2/v3, bare-server-node 2.0.3)が本家と同一応答
- [x] `/bare/v3/` 経由の実プロキシ取得(HTTPS サイトの 200 + HTML 取得成功)
- [x] 404 の挙動(`Cannot GET ...`)まで本家と同一
- [x] Service Worker(`/uv/sw.js`)の配信と `Cache-Control: no-store`

## 補足(本家由来の仕様/クセも再現)

- 本家の `main.js` は HTML に存在しない要素(`colorPicker` 等)を参照しており、
  読み込み時に TypeError が出ます(本家と同じ挙動)。検索バー・ヘルプ(?)・
  クローク(目のアイコン、about:blank 風の別窓表示)は正常動作します。
- パニックキー(デフォルト `` ` `` キーで desmos.com へ遷移)は上記エラーの影響で
  本家では未登録のままです。こちらも本家と同じ状態にしてあります。
- タイトル/ファビコンは Google 偽装(本家同様)。

## 注意事項

デプロイ先の利用規約(Railway の Acceptable Use Policy)および
所属組織のネットワーク利用ルールを必ず確認・遵守してください。
