# 02. 依存関係の追加（JWT）

## 目的

JWT方式の認証を実装するためのライブラリを `pom.xml` に追加する。

## 作業内容

既存の `pom.xml` には `spring-boot-starter-security` / `spring-boot-starter-data-jpa` / `spring-boot-starter-validation` / `mysql-connector-j` / `lombok` は既に入っている。JWT生成・検証用に [jjwt](https://github.com/jwtk/jjwt) を追加する。

```xml
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
```

> バージョンは追加時点の最新安定版を確認して置き換えること。

## 受け入れ条件

- [ ] `./mvnw dependency:tree` で `io.jsonwebtoken` 3ライブラリが解決できる
- [ ] `./mvnw compile` が通る

## 依存関係

なし（`01`と並行して着手可能）
