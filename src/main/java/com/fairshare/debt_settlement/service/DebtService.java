package com.fairshare.debt_settlement.service;

import com.fairshare.debt_settlement.dto.SettlementTransaction;
import com.fairshare.debt_settlement.dto.UserDashboardSummary;
import com.fairshare.debt_settlement.model.Debt;
import com.fairshare.debt_settlement.model.Person;
import com.fairshare.debt_settlement.repository.DebtRepository;
import com.fairshare.debt_settlement.repository.PersonRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@AllArgsConstructor
public class DebtService {
    private final PersonRepository personRepository;
    private final DebtRepository debtRepository;

    public Debt addDebt(String groupId, Long debtorId, Long creditorId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) throw new IllegalArgumentException("Amount must be > 0");
        if (debtorId.equals(creditorId)) throw new IllegalArgumentException("Cannot owe yourself");

        Person debtor = personRepository.findById(debtorId).orElseThrow();
        Person creditor = personRepository.findById(creditorId).orElseThrow();

        Debt newDebt = new Debt();
        newDebt.setGroupId(groupId); // Save the group!
        newDebt.setDebtor(debtor);
        newDebt.setCreditor(creditor);
        newDebt.setAmount(amount.setScale(2, RoundingMode.HALF_UP));

        return debtRepository.save(newDebt);
    }


    public List<SettlementTransaction> settleDebts(String groupId) {

        // THE MAGIC FIX: We only pull the 20-50 debts for this group,
        // completely ignoring the other 999,950 rows in the database!
        List<Debt> groupDebts = debtRepository.findByGroupId(groupId);

        if (groupDebts.isEmpty()) {
            return new ArrayList<>(); // Return empty list if no debts in group
        }

        Map<Person, BigDecimal> netBalances = new HashMap<>();

        // The rest of the algorithm stays exactly the same!
        for (Debt debt : groupDebts) {
            Person debtor = debt.getDebtor();
            Person creditor = debt.getCreditor();
            BigDecimal amount = debt.getAmount();

            netBalances.put(debtor, netBalances.getOrDefault(debtor, BigDecimal.ZERO).subtract(amount));
            netBalances.put(creditor, netBalances.getOrDefault(creditor, BigDecimal.ZERO).add(amount));
        }

        List<PersonBalance> debtors = new ArrayList<>();
        List<PersonBalance> creditors = new ArrayList<>();

        BigDecimal threshold = new BigDecimal("0.01");

        for (Map.Entry<Person, BigDecimal> entry : netBalances.entrySet()) {
            if (entry.getValue().compareTo(threshold.negate()) < 0) {
                debtors.add(new PersonBalance(entry.getKey(), entry.getValue()));
            } else if (entry.getValue().compareTo(threshold) > 0) {
                creditors.add(new PersonBalance(entry.getKey(), entry.getValue()));
            }
        }

        List<SettlementTransaction> optimizedTransactions = new ArrayList<>();
        int i = 0, j = 0;

        while (i < debtors.size() && j < creditors.size()) {
            PersonBalance debtor = debtors.get(i);
            PersonBalance creditor = creditors.get(j);

            BigDecimal amountToSettle = debtor.balance.abs().min(creditor.balance);
            BigDecimal roundedAmount = amountToSettle.setScale(2, RoundingMode.HALF_UP);

            optimizedTransactions.add(new SettlementTransaction(
                    debtor.person.getName(), creditor.person.getName(), roundedAmount
            ));

            debtor.balance = debtor.balance.add(amountToSettle);
            creditor.balance = creditor.balance.subtract(amountToSettle);

            if (debtor.balance.abs().compareTo(threshold) < 0) i++;
            if (creditor.balance.abs().compareTo(threshold) < 0) j++;
        }

        return optimizedTransactions;
    }

    private static class PersonBalance {
        Person person;
        BigDecimal balance;

        PersonBalance(Person person, BigDecimal balance) {
            this.person = person;
            this.balance = balance;
        }
    }

    public UserDashboardSummary getUserSummary(Long userId) {
        // 1. Calculate the math for your Pie Chart
        BigDecimal totalOwes = debtRepository.getTotalOwedByUser(userId);
        BigDecimal totalReceives = debtRepository.getTotalOwedToUser(userId);
        BigDecimal netBalance = totalReceives.subtract(totalOwes);

        // 2. Fetch the list for the bottom of your screen
        List<Debt> allTransactions = debtRepository.findAllTransactionsForUser(userId);

        // 3. Package it all up!
        return new UserDashboardSummary(
                userId,
                totalOwes,
                totalReceives,
                netBalance,
                allTransactions
        );
    }


}
