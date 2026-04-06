package com.fairshare.debt_settlement.controller;

import com.fairshare.debt_settlement.dto.DebtRequest;
import com.fairshare.debt_settlement.dto.SettlementTransaction;
import com.fairshare.debt_settlement.dto.UserDashboardSummary;
import com.fairshare.debt_settlement.model.Debt;
import com.fairshare.debt_settlement.service.DebtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/debts")
@CrossOrigin(origins = "*")
public class DebtController {

    private final DebtService debtService;

    public DebtController(DebtService debtService) {
        this.debtService = debtService;
    }

    // POST /api/debts - Add a new debt
    @PostMapping
    public ResponseEntity<Debt> addDebt(@RequestBody DebtRequest request) {
        Debt newDebt = debtService.addDebt(
                request.groupId(), // Pass the group ID
                request.debtorId(),
                request.creditorId(),
                request.amount()
        );
        return ResponseEntity.ok(newDebt);
    }

    // GET /api/debts - View all raw debts
    @GetMapping("/settle/{groupId}")
    public ResponseEntity<List<SettlementTransaction>> settleDebts(@PathVariable String groupId) {
        // Only run the algorithm for the requested group!
        List<SettlementTransaction> optimizedTransactions = debtService.settleDebts(groupId);
        return ResponseEntity.ok(optimizedTransactions);
    }

    // GET /api/debts/summary/{userId}
    @GetMapping("/summary/{userId}")
    public ResponseEntity<UserDashboardSummary> getUserSummary(@PathVariable Long userId) {
        UserDashboardSummary summary = debtService.getUserSummary(userId);
        return ResponseEntity.ok(summary);
    }



}