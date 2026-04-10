package com.fairshare.debt_settlement.controller;

import com.fairshare.debt_settlement.dto.CreateDebtRequest;
import com.fairshare.debt_settlement.model.Debt;
import com.fairshare.debt_settlement.service.DebtService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/debts")
@AllArgsConstructor
public class DebtController {

    private final DebtService debtService;

    @PostMapping
    public ResponseEntity<Debt> createDebt(@RequestBody CreateDebtRequest request) {
        return ResponseEntity.ok(debtService.createDebt(request));
    }

    @GetMapping
    public ResponseEntity<List<Debt>> getAllDebts() {
        return ResponseEntity.ok(debtService.getAllDebts());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Debt> updateDebt(@PathVariable Long id, @RequestBody CreateDebtRequest request) {
        return ResponseEntity.ok(debtService.updateDebt(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDebt(@PathVariable Long id) {
        debtService.deleteDebt(id);
        return ResponseEntity.noContent().build();
    }
}