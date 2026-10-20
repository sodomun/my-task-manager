# my-task-manager
AIナビキャラ付きのシンプルな個人向けタスク管理アプリ

## ローカルでの起動

### Backend

Java 17 と MySQL を用意し、MySQL に `tasknavi` データベースを作成してください。初回は `backend/.env.example` を `backend/.env` にコピーし、データベースのユーザー名・パスワードと `JWT_SECRET` を設定します。

```powershell
cd backend
Copy-Item .env.example .env
# .env を編集して接続情報と JWT_SECRET を設定
.\mvnw.cmd spring-boot:run
```

### Frontend

Backend とは別のターミナルで実行します。初回のみ依存パッケージをインストールしてください。

```powershell
cd frontend
npm install
npm run dev
```
