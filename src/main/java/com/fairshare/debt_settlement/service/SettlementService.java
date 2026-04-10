package com.fairshare.debt_settlement.service;

import com.fairshare.debt_settlement.dto.SettlementResponse;
import com.fairshare.debt_settlement.model.Debt;
import com.fairshare.debt_settlement.model.Person;
import com.fairshare.debt_settlement.repository.DebtRepository;
import com.fairshare.debt_settlement.repository.PersonRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SettlementService {

    private final DebtRepository debtRepository;
    private final PersonRepository personRepository;

    public SettlementService(DebtRepository debtRepository, PersonRepository personRepository) {
        this.debtRepository = debtRepository;
        this.personRepository = personRepository;
    }

    public List<SettlementResponse> settleDebts() {
        List<Debt> allDebts = debtRepository.findAll();
        Map<Long, Double> balances = new HashMap<>();

        // 1. Calculate net balances
        for (Debt debt : allDebts) {
            balances.put(debt.getDebtor().getId(), balances.getOrDefault(debt.getDebtor().getId(), 0.0) - debt.getAmount());
            balances.put(debt.getCreditor().getId(), balances.getOrDefault(debt.getCreditor().getId(), 0.0) + debt.getAmount());
        }

        // 2. Separate into debtors and creditors
        PriorityQueue<PersonBalance> debtors = new PriorityQueue<>(Comparator.comparingDouble(pb -> pb.balance)); // Smallest balance (most negative) first
        PriorityQueue<PersonBalance> creditors = new PriorityQueue<>((pb1, pb2) -> Double.compare(pb2.balance, pb1.balance)); // Largest balance (most positive) first

        for (Map.Entry<Long, Double> entry : balances.entrySet()) {
            if (entry.getValue() < -0.01) {
                Person person = personRepository.findById(entry.getKey()).orElse(null);
                if (person != null) debtors.add(new PersonBalance(person.getName(), person.getEmail(), entry.getValue()));
            } else if (entry.getValue() > 0.01) {
                Person person = personRepository.findById(entry.getKey()).orElse(null);
                if (person != null) creditors.add(new PersonBalance(person.getName(), person.getEmail(), entry.getValue()));
            }
        }

        // 3. Greedy algorithm
        List<SettlementResponse> results = new ArrayList<>();
        while (!debtors.isEmpty() && !creditors.isEmpty()) {
            PersonBalance debtor = debtors.poll();
            PersonBalance creditor = creditors.poll();

            double amount = Math.min(-debtor.balance, creditor.balance);
            results.add(new SettlementResponse(debtor.name, debtor.email, creditor.name, creditor.email, amount));

            debtor.balance += amount;
            creditor.balance -= amount;

            if (debtor.balance < -0.01) debtors.add(debtor);
            if (creditor.balance > 0.01) creditors.add(creditor);
        }

        return results;
    }

    private static class PersonBalance {
        String name;
        String email;
        Double balance;

        PersonBalance(String name, String email, Double balance) {
            this.name = name;
            this.email = email;
            this.balance = balance;
        }
    }
}
