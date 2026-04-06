package com.fairshare.debt_settlement.repository;

import com.fairshare.debt_settlement.model.Debt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DebtRepository extends JpaRepository<Debt, Long> {

    // Spring translates this to: SELECT * FROM debts WHERE debtor_id = ?
    List<Debt> findByDebtorId(Long debtorId);

    // Spring translates this to: SELECT * FROM debts WHERE creditor_id = ?
    List<Debt> findByCreditorId(Long creditorId);

    List<Debt> findByGroupId(String groupId);

    // SQL Aggregation: Adds up everything this user owes across ALL groups
    @Query("SELECT COALESCE(SUM(d.amount), 0.0) FROM Debt d WHERE d.debtor.id = :userId")
    BigDecimal getTotalOwedByUser(@Param("userId") Long userId);

    // SQL Aggregation: Adds up everything owed TO this user across ALL groups
    @Query("SELECT COALESCE(SUM(d.amount), 0.0) FROM Debt d WHERE d.creditor.id = :userId")
    BigDecimal getTotalOwedToUser(@Param("userId") Long userId);

    // Fetch every single transaction involving this specific user across all groups
    @Query("SELECT d FROM Debt d WHERE d.debtor.id = :userId OR d.creditor.id = :userId")
    List<Debt> findAllTransactionsForUser(@Param("userId") Long userId);


}