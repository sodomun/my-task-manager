package com.tasknavi.backend.service;

import com.tasknavi.backend.dto.request.CreateTaskRequest;
import com.tasknavi.backend.dto.request.UpdateTaskRequest;
import com.tasknavi.backend.dto.response.TaskResponse;
import com.tasknavi.backend.entity.Task;
import com.tasknavi.backend.entity.User;
import com.tasknavi.backend.exception.TaskNotFoundException;
import com.tasknavi.backend.repository.TaskRepository;
import com.tasknavi.backend.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Transactional
    public TaskResponse create(Long userId, CreateTaskRequest request) {
        User user = userRepository.getReferenceById(userId);
        int nextSortOrder = taskRepository.findMaxSortOrderByUserId(userId) + 1;

        Task task = new Task();
        task.setUser(user);
        task.setType(request.type());
        task.setTitle(request.title());
        task.setTimeSlot(request.timeSlot());
        task.setDueDate(request.dueDate());
        task.setDueTimeSlot(request.dueTimeSlot());
        task.setPriority(request.priority());
        task.setSortOrder(nextSortOrder);

        return toResponse(taskRepository.save(task));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> list(Long userId) {
        return taskRepository.findByUserIdOrderBySortOrderAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TaskResponse update(Long userId, Long taskId, UpdateTaskRequest request) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));

        task.setType(request.type());
        task.setTitle(request.title());
        task.setTimeSlot(request.timeSlot());
        task.setDueDate(request.dueDate());
        task.setDueTimeSlot(request.dueTimeSlot());
        task.setPriority(request.priority());

        return toResponse(task);
    }

    @Transactional
    public void delete(Long userId, Long taskId) {
        Task task = taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new TaskNotFoundException(taskId));
        taskRepository.delete(task);
    }

    private TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getType(),
                task.getTitle(),
                task.getTimeSlot(),
                task.getDueDate(),
                task.getDueTimeSlot(),
                task.getPriority(),
                task.getSortOrder(),
                task.getCreatedAt(),
                task.getUpdatedAt());
    }
}
