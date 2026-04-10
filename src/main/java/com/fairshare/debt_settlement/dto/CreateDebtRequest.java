package com.fairshare.debt_settlement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDebtRequest {
    private String debtorEmail;
    private String creditorEmail;
    private Double amount;
}
