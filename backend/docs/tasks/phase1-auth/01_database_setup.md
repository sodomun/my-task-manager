# 01. MySQLデータベース作成・接続設定

## 目的

Spring BootアプリケーションからMySQLへ接続できる状態を作る。テーブル自体はここでは作らない（`03_entity_user`でEntityから自動生成させる）。

## 作業内容

### 1. MySQL Workbenchでデータベースのみ作成

```sql
CREATE DATABASE tasknavi
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

- テーブルは作成しない（ここが元の案からの変更点）。
- 日本語（課題名・種類など）を扱うため `utf8mb4` を必ず指定する。

### 2. 接続用ユーザーの作成（rootを直接使わない場合）

```sql
CREATE USER 'tasknavi_app'@'localhost' IDENTIFIED BY '<パスワード>';
GRANT ALL PRIVILEGES ON tasknavi.* TO 'tasknavi_app'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Spring Boot側の接続設定

`application.properties` に接続情報を書くが、**パスワードなどの秘密情報はGit管理しない**。

- `application.properties`（コミット対象）には接続先ホスト・DB名など非機密情報のみ、または環境変数プレースホルダーを書く。
- 実際の認証情報は `application-local.properties`（`.gitignore`対象に追加）または環境変数（`SPRING_DATASOURCE_PASSWORD`等）で渡す。

```properties
spring.application.name=backend

spring.datasource.url=jdbc:mysql://localhost:3306/tasknavi?serverTimezone=Asia/Tokyo&characterEncoding=UTF-8
spring.datasource.username=${DB_USERNAME:tasknavi_app}
spring.datasource.password=${DB_PASSWORD}

spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

- `ddl-auto=update`: `@Entity`定義から自動でテーブルを作成・更新する（今フェーズの方針）。
- `show-sql=true`: 開発中は発行SQLを確認できるようにしておく。

### 4. `.gitignore` の確認

`application-local.properties` や `.env` をコミットしないよう `.gitignore` に追記する。

## 受け入れ条件

- [ ] `tasknavi` データベースが作成されている（テーブルは0個）
- [ ] `./mvnw spring-boot:run` でアプリが起動し、コンソールにMySQL接続エラーが出ない
- [ ] DBのパスワードがGit管理対象のファイルに直書きされていない

## 依存関係

なし（最初に着手する）
