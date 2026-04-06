package com.fairshare.debt_settlement.dto;

import java.math.BigDecimal;

public record DebtRequest(
        String groupId,
        Long debtorId,
        Long creditorId,
        BigDecimal amount
) {}