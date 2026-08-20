package com.tasknavi.backend.exception;

public class TaskNotFoundException extends RuntimeException {
    public TaskNotFoundException(Long taskId) {
        super("タスクが見つかりません (id: " + taskId + ")");
    }
}
