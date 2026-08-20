package com.tasknavi.backend.controller;

import com.tasknavi.backend.dto.request.CreateTaskRequest;
import com.tasknavi.backend.dto.request.UpdateTaskRequest;
import com.tasknavi.backend.dto.response.TaskResponse;
import com.tasknavi.backend.security.UserPrincipal;
import com.tasknavi.backend.service.TaskService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @PostMapping
    public ResponseEntity<TaskResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateTaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.create(principal.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(taskService.list(principal.getId()));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request) {
        return ResponseEntity.ok(taskService.update(principal.getId(), taskId, request));
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long taskId) {
        taskService.delete(principal.getId(), taskId);
        return ResponseEntity.noContent().build();
    }
}
