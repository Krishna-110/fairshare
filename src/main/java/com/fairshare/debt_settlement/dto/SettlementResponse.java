package com.fairshare.debt_settlement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SettlementResponse {
    private String from;
    private String fromEmail;
    private String to;
    private String toEmail;
    private Double amount;
}
