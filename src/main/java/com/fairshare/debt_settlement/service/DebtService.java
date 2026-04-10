package com.fairshare.debt_settlement.service;

import com.fairshare.debt_settlement.dto.CreateDebtRequest;
import com.fairshare.debt_settlement.model.Debt;
import com.fairshare.debt_settlement.model.Person;
import com.fairshare.debt_settlement.repository.DebtRepository;
import com.fairshare.debt_settlement.repository.PersonRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class DebtService {
    private final PersonRepository personRepository;
    private final DebtRepository debtRepository;

    public Debt createDebt(CreateDebtRequest request) {
        Person debtor = personRepository.findByEmail(request.getDebtorEmail())
                .orElseThrow(() -> new RuntimeException("Debtor not found with email: " + request.getDebtorEmail()));
        Person creditor = personRepository.findByEmail(request.getCreditorEmail())
                .orElseThrow(() -> new RuntimeException("Creditor not found with email: " + request.getCreditorEmail()));

        Debt debt = new Debt();
        debt.setDebtor(debtor);
        debt.setCreditor(creditor);
        debt.setAmount(request.getAmount());

        return debtRepository.save(debt);
    }

    public List<Debt> getAllDebts() {
        return debtRepository.findAll();
    }

    public Debt updateDebt(Long id, CreateDebtRequest request) {
        Debt debt = debtRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Debt record not found"));

        Person debtor = personRepository.findByEmail(request.getDebtorEmail())
                .orElseThrow(() -> new RuntimeException("Debtor not found with email: " + request.getDebtorEmail()));
        Person creditor = personRepository.findByEmail(request.getCreditorEmail())
                .orElseThrow(() -> new RuntimeException("Creditor not found with email: " + request.getCreditorEmail()));

        debt.setDebtor(debtor);
        debt.setCreditor(creditor);
        debt.setAmount(request.getAmount());

        return debtRepository.save(debt);
    }

    public void deleteDebt(Long id) {
        debtRepository.deleteById(id);
    }

    public Double getTotalOwed(Long userId) {
        return debtRepository.getTotalOwedByUser(userId);
    }

    public Double getTotalReceivable(Long userId) {
        return debtRepository.getTotalOwedToUser(userId);
    }
}
