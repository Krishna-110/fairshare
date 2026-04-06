package com.fairshare.debt_settlement.dto;

import com.fairshare.debt_settlement.model.Debt;
import java.math.BigDecimal;
import java.util.List;

public record UserDashboardSummary(
        Long userId,
        BigDecimal totalOwes,
        BigDecimal totalReceives,
        BigDecimal netBalance,
        // We add the list of raw transactions right into the summary!
        List<Debt> allTransactions
) {}