package com.tasknavi.backend.repository;

import com.tasknavi.backend.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}

// 基本CRUD（CrudRepository由来）

//   ┌──────────────────┬──────────────────────────────────────────────────────┐
//   │     メソッド     │                         内容                         │
//   ├──────────────────┼──────────────────────────────────────────────────────┤
//   │ save(entity)     │ INSERT または UPDATE（idがあれば更新、無ければ新規） │
//   ├──────────────────┼──────────────────────────────────────────────────────┤
//   │ findById(id)     │ Optional<User> で1件取得                             │
//   ├──────────────────┼──────────────────────────────────────────────────────┤
//   │ existsById(id)   │ 存在確認（true/false）                               │
//   ├──────────────────┼──────────────────────────────────────────────────────┤
//   │ findAll()        │ 全件取得                                             │
//   ├──────────────────┼──────────────────────────────────────────────────────┤
//   │ findAllById(ids) │ 複数idで一括取得                                     │
//   ├──────────────────┼──────────────────────────────────────────────────────┤
//   │ count()          │ 件数取得                                             │
//   ├──────────────────┼──────────────────────────────────────────────────────┤
//   │ deleteById(id)   │ id指定で削除                                         │
//   ├──────────────────┼──────────────────────────────────────────────────────┤
//   │ delete(entity)   │ エンティティ指定で削除                               │
//   ├──────────────────┼──────────────────────────────────────────────────────┤
//   │ deleteAll()      │ 全削除