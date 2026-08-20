package com.tasknavi.backend.repository;

import com.tasknavi.backend.entity.Task;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByUserIdOrderBySortOrderAsc(Long userId);

    Optional<Task> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT COALESCE(MAX(t.sortOrder), -1) FROM Task t WHERE t.user.id = :userId")
    int findMaxSortOrderByUserId(Long userId);
}
