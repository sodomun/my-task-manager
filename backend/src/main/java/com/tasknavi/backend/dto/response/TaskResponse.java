package com.tasknavi.backend.dto.response;

import com.tasknavi.backend.entity.Priority;
import com.tasknavi.backend.entity.TimeSlot;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String type,
        String title,
        TimeSlot timeSlot,
        LocalDate dueDate,
        TimeSlot dueTimeSlot,
        Priority priority,
        Integer sortOrder,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {}
