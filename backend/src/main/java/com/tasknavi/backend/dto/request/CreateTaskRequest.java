package com.tasknavi.backend.dto.request;

import com.tasknavi.backend.entity.Priority;
import com.tasknavi.backend.entity.TimeSlot;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record CreateTaskRequest(
        @NotBlank String type,
        @NotBlank String title,
        TimeSlot timeSlot,
        @NotNull LocalDate dueDate,
        TimeSlot dueTimeSlot,
        @NotNull Priority priority) {}
