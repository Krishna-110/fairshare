package com.fairshare.debt_settlement.dto;

import java.math.BigDecimal;

// A Java Record acts as an immutable DTO. It automatically creates constructors and getters for us!
public record SettlementTransaction(
        String fromPerson,
        String toPerson,
        BigDecimal amount
) {}