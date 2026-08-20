package com.tasknavi.backend.dto.request;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ReorderTasksRequest(
        @NotEmpty List<Long> orderedTaskIds) {}
