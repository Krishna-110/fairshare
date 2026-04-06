package com.fairshare.debt_settlement.dto;

import java.time.LocalDateTime;

// A clean, standard format for all our API errors
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path
) {}