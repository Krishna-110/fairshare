package com.fairshare.debt_settlement.model;

import java.math.BigDecimal;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Check;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name =  "debts", indexes = {
        @Index(name = "idx_group_id", columnList = "groupId")
})
@Data
@NoArgsConstructor
@Check(constraints = "amount > 0 AND debtor_id != creditor_id")
public class Debt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String groupId;

    @ManyToOne
    @JoinColumn(name = "debtor_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE) // If this person is deleted, delete this debt
    private Person debtor;

    // "To Person" - The one who gets paid
    @ManyToOne
    @JoinColumn(name = "creditor_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE) // Same here, cascade the delete
    private Person creditor;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;




}
