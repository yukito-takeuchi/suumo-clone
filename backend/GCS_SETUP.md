# Google Cloud Storage セットアップガイド

## 概要
本番環境（Heroku）での画像アップロードにGoogle Cloud Storageを使用します。

## 前提条件
- Google Cloud Platformアカウント
- Herokuアプリ作成済み
- バックエンドコードはGCS対応済み

---

## 1. GCPプロジェクトとバケット作成

### 1.1 GCP Consoleにアクセス
https://console.cloud.google.com/

### 1.2 プロジェクト選択
- 既存のFirebaseプロジェクトを使用
- または新しいプロジェクトを作成

### 1.3 Cloud Storageバケット作成
1. 左メニュー > **Cloud Storage** > **バケット**
2. **「バケットを作成」** をクリック
3. バケット設定:
   - **名前**: `suumo-clone-uploads`（グローバルで一意の名前が必要）
   - **ロケーションタイプ**: リージョン
   - **ロケーション**: `asia-northeast1`（東京）
   - **ストレージクラス**: Standard
   - **アクセス制御**: 均一（推奨）
   - **公開アクセスの防止**: オフにする
4. **「作成」** をクリック

---

## 2. サービスアカウント作成

### 2.1 サービスアカウントページに移動
左メニュー > **IAMと管理** > **サービスアカウント**

### 2.2 サービスアカウント作成
1. **「サービスアカウントを作成」** をクリック
2. サービスアカウントの詳細:
   - **名前**: `suumo-storage-service`
   - **説明**: `SUUMO Clone image upload service account`
3. **「作成して続行」** をクリック

### 2.3 ロール付与
以下のロールを付与:
- **Storage Object Admin** - バケットへの完全なアクセス権限
- **Storage Object Creator** - オブジェクト作成権限

**「続行」** をクリック

### 2.4 JSONキーをダウンロード
1. 作成したサービスアカウントをクリック
2. **「キー」** タブに移動
3. **「鍵を追加」** > **「新しい鍵を作成」**
4. **JSON** を選択して **「作成」**
5. ダウンロードされたファイルを保存: `suumo-storage-key.json`

⚠️ **重要**: このキーファイルは機密情報です。Gitにコミットしないでください。

---

## 3. バケット権限設定（Public Access）

### 3.1 バケットの権限ページに移動
1. **Cloud Storage** > **バケット** > `suumo-clone-uploads`
2. **「権限」** タブをクリック

### 3.2 Public Accessを許可
1. **「プリンシパルを追加」** をクリック
2. 新しいプリンシパル:
   - **新しいプリンシパル**: `allUsers`
   - **ロール**: `Storage オブジェクト閲覧者` (Storage Object Viewer)
3. **「保存」** をクリック
4. 警告が表示されたら **「一般公開を許可」** を選択

これで全ての画像がパブリックURLでアクセス可能になります。

---

## 4. Heroku環境変数設定

### 4.1 バケット名を設定
```bash
heroku config:set GCS_BUCKET_NAME=suumo-clone-uploads -a suumo-clone-api
```

### 4.2 サービスアカウントキーを設定
JSONファイルを1行に圧縮して設定:

**Mac/Linux:**
```bash
heroku config:set GCS_CREDENTIALS="$(cat suumo-storage-key.json | tr -d '\n')" -a suumo-clone-api
```

**Windows (PowerShell):**
```powershell
$json = Get-Content suumo-storage-key.json -Raw
$json = $json -replace "`n", "" -replace "`r", ""
heroku config:set GCS_CREDENTIALS="$json" -a suumo-clone-api
```

### 4.3 NODE_ENVを本番に設定
```bash
heroku config:set NODE_ENV=production -a suumo-clone-api
```

⚠️ **重要**: `NODE_ENV=production` でないとGCSが有効になりません！

### 4.4 設定確認
```bash
heroku config -a suumo-clone-api
```

以下の変数が設定されていることを確認:
- `DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_WEB_API_KEY`
- `CORS_ORIGIN`
- `GCS_BUCKET_NAME`
- `GCS_CREDENTIALS`
- `NODE_ENV=production`

---

## 5. デプロイと動作確認

### 5.1 コードをデプロイ
```bash
# Herokuにログイン
heroku login

# Container Registryにログイン
heroku container:login

# Dockerイメージをビルド＆プッシュ
cd backend
heroku container:push web -a suumo-clone-api

# リリース
heroku container:release web -a suumo-clone-api

# ログ確認
heroku logs --tail -a suumo-clone-api
```

### 5.2 動作確認
1. フロントエンドから企業ユーザーでログイン
2. 物件を新規作成し、画像をアップロード
3. ログを確認:
```bash
heroku logs --tail -a suumo-clone-api | grep GCS
```

期待されるログ:
```
✅ Google Cloud Storage initialized
✅ Uploaded to GCS: https://storage.googleapis.com/suumo-clone-uploads/xxxxx.jpeg
```

4. 画像URLがGCS形式になっていることを確認:
   - ❌ `/uploads/xxxxx.jpeg` （ローカル）
   - ✅ `https://storage.googleapis.com/suumo-clone-uploads/xxxxx.jpeg` （GCS）

### 5.3 トラブルシューティング

#### エラー: "Failed to initialize GCS"
- `GCS_CREDENTIALS` が正しくJSON形式で設定されているか確認
- サービスアカウントキーに改行が含まれていないか確認
```bash
heroku config:get GCS_CREDENTIALS -a suumo-clone-api | jq .
```

#### エラー: "Failed to upload to cloud storage"
- サービスアカウントに `Storage Object Admin` ロールがあるか確認
- バケット名が正しいか確認
```bash
heroku config:get GCS_BUCKET_NAME -a suumo-clone-api
```

#### 画像がローカルパスになる
- `NODE_ENV=production` が設定されているか確認
```bash
heroku config:get NODE_ENV -a suumo-clone-api
```

#### 画像にアクセスできない（403 Forbidden）
- バケットに `allUsers` への `Storage Object Viewer` 権限があるか確認
- GCP Console > Cloud Storage > バケット > 権限 を確認

---

## セキュリティ注意事項

### ✅ DO (推奨)
- サービスアカウントキーは `.env` に保存し、`.gitignore` に追加
- バケット名はわかりやすい名前を使用
- GCS権限は最小限に（今回は画像公開が必要なのでallUsersに閲覧権限）

### ❌ DON'T (禁止)
- サービスアカウントキーをGitにコミット
- GCS_CREDENTIALSをコード内にハードコード
- すべてのGCSバケットにPublic Accessを許可

---

## コスト見積もり

**Google Cloud Storage 料金（2024年時点）**:
- ストレージ: $0.023/GB/月（asia-northeast1）
- ネットワーク: 最初の1GBまで無料、以降 $0.12/GB

**例**:
- 画像1枚あたり平均500KB
- 1000物件 × 5画像 = 5000枚 ≈ 2.5GB
- 月間ストレージコスト: $0.06
- 月間10,000アクセス（各画像200KB転送）≈ 2GB転送 = $0.24

**合計**: 約 **$0.30/月**（初期段階）

---

## まとめ

✅ GCSバケット作成完了
✅ サービスアカウント＆キー作成完了
✅ バケット権限設定完了（Public Access）
✅ Heroku環境変数設定完了
✅ デプロイ＆動作確認完了

これでHerokuの ephemeral file system 問題が解決し、画像が永続的に保存されます！
