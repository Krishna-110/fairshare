# FairShare Backend Logic Documentation

This document provides a consolidated view of the core backend logic for the FairShare Debt Settlement application. Security-related configurations and services have been excluded as per requirements.

## Table of Contents
- [Application Entry Point](#application-entry-point)
- [Controllers (API Layer)](#controllers-api-layer)
- [Services (Business Logic Layer)](#services-business-logic-layer)
- [Models (Data Layer)](#models-data-layer)
- [Repositories (Persistence Layer)](#repositories-persistence-layer)
- [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
- [Exception Handling](#exception-handling)

---

## Application Entry Point

### DebtSettlementApplication.java
```java
package com.fairshare.debt_settlement;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class DebtSettlementApplication {

	public static void main(String[] args) {
		// Load .env file and set system properties
		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();
		
		dotenv.entries().forEach(entry -> 
			System.setProperty(entry.getKey(), entry.getValue())
		);

		SpringApplication.run(DebtSettlementApplication.class, args);
	}
}
```

---

## Controllers (API Layer)

### DebtController.java
```java
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
```

### PersonController.java
```java
package com.fairshare.debt_settlement.controller;

import com.fairshare.debt_settlement.model.Person;
import com.fairshare.debt_settlement.service.PersonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Tells Spring this class handles web requests and returns JSON
@RequestMapping("/api/persons") // The base URL for all methods in this class
@CrossOrigin(origins = "*") // Allows your Flutter app to call this API without CORS errors
public class PersonController {

    private final PersonService personService;

    public PersonController(PersonService personService) {
        this.personService = personService;
    }

    // POST /api/persons - Add a new person
    @PostMapping
    public ResponseEntity<Person> addPerson(@RequestBody Person person) {
        Person savedPerson = personService.addPerson(person);
        return ResponseEntity.ok(savedPerson);
    }

    // GET /api/persons - Get all people
    @GetMapping
    public ResponseEntity<List<Person>> getAllPersons() {
        return ResponseEntity.ok(personService.getAllPersons());
    }

    // DELETE /api/persons/{id} - Delete a person (and their debts via cascade)
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePerson(@PathVariable Long id) {
        personService.deletePerson(id);
        return ResponseEntity.ok("Person deleted successfully");
    }
}
```

### ProfileController.java
```java
package com.fairshare.debt_settlement.controller;

import com.fairshare.debt_settlement.model.Person;
import com.fairshare.debt_settlement.repository.PersonRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@AllArgsConstructor
public class ProfileController {

    private final PersonRepository personRepository;

    @GetMapping
    public Person getCurrentProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String email;
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }

        return personRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User profile not found in database"));
    }
}
```

### SettlementController.java
```java
package com.fairshare.debt_settlement.controller;

import com.fairshare.debt_settlement.dto.SettlementResponse;
import com.fairshare.debt_settlement.service.SettlementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/settle")
@CrossOrigin(origins = "*")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    @GetMapping
    public ResponseEntity<List<SettlementResponse>> settle() {
        return ResponseEntity.ok(settlementService.settleDebts());
    }
}
```

---

## Services (Business Logic Layer)

### DebtService.java
```java
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
```

### PersonService.java
```java
package com.fairshare.debt_settlement.service;

import com.fairshare.debt_settlement.model.Person;
import com.fairshare.debt_settlement.repository.PersonRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class PersonService {

    public final PersonRepository personRepository;

    public Person addPerson(Person person){
      return   personRepository.save(person);
    }

    public List<Person> getAllPersons(){
        return personRepository.findAll();
    }

    public void deletePerson(Long id){
        personRepository.deleteById(id);
    }
}
```

### SettlementService.java
```java
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
```

---

## Models (Data Layer)

### Debt.java
```java
package com.fairshare.debt_settlement.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(name = "debts")
@Data
@NoArgsConstructor
public class Debt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "debtor_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE) // If this person is deleted, delete this debt
    private Person debtor;

    // "To Person" - The one who gets paid
    @ManyToOne
    @JoinColumn(name = "creditor_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE) // Same here, cascade the delete
    private Person creditor;

    @Column(nullable = false)
    private Double amount;
}
```

### Person.java
```java
package com.fairshare.debt_settlement.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "persons")
@Data
@NoArgsConstructor
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;
}
```

---

## Repositories (Persistence Layer)

### DebtRepository.java
```java
package com.fairshare.debt_settlement.repository;

import com.fairshare.debt_settlement.model.Debt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DebtRepository extends JpaRepository<Debt, Long> {

    List<Debt> findByDebtorId(Long debtorId);

    List<Debt> findByCreditorId(Long creditorId);

    @Query("SELECT COALESCE(SUM(d.amount), 0.0) FROM Debt d WHERE d.debtor.id = :userId")
    Double getTotalOwedByUser(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(d.amount), 0.0) FROM Debt d WHERE d.creditor.id = :userId")
    Double getTotalOwedToUser(@Param("userId") Long userId);

    @Query("SELECT d FROM Debt d WHERE d.debtor.id = :userId OR d.creditor.id = :userId")
    List<Debt> findAllTransactionsForUser(@Param("userId") Long userId);
}
```

### PersonRepository.java
```java
package com.fairshare.debt_settlement.repository;

import com.fairshare.debt_settlement.model.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {

    Optional<Person> findByEmail(String email);
}
```

---

## DTOs (Data Transfer Objects)

### CreateDebtRequest.java
```java
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
```

### DebtRequest.java
```java
package com.fairshare.debt_settlement.dto;

import java.math.BigDecimal;

public record DebtRequest(
        String groupId,
        Long debtorId,
        Long creditorId,
        BigDecimal amount
) {}
```

### ErrorResponse.java
```java
package com.fairshare.debt_settlement.dto;

import java.time.LocalDateTime;

// A clean, standard format for all our API errors
public record ErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path
) {}
```

### SettlementResponse.java
```java
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
```

### SettlementTransaction.java
```java
package com.fairshare.debt_settlement.dto;

import java.math.BigDecimal;

// A Java Record acts as an immutable DTO. It automatically creates constructors and getters for us!
public record SettlementTransaction(
        String fromPerson,
        String toPerson,
        BigDecimal amount
) {}
```

### UserDashboardSummary.java
```java
package com.fairshare.debt_settlement.dto;

import com.fairshare.debt_settlement.model.Debt;
import java.math.BigDecimal;
import java.util.List;

public record UserDashboardSummary(
        Long userId,
        BigDecimal totalOwes,
        BigDecimal totalReceives,
        BigDecimal netBalance,
        // We add the list of raw transactions right into the summary!
        List<Debt> allTransactions
) {}
```

---

## Exception Handling

### BadRequestException.java
```java
package com.fairshare.debt_settlement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
```

### GlobalExceptionHandler.java
```java
package com.fairshare.debt_settlement.exception;

import com.fairshare.debt_settlement.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;

@RestControllerAdvice // Tells Spring: "Hey, use this class to intercept all errors globally!"
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex,
            HttpServletRequest request) {

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.BAD_REQUEST.value(), // Returns a 400 Bad Request
                "Bad Request",
                ex.getMessage(),
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(
            Exception ex,
            HttpServletRequest request) {

        ex.printStackTrace();

        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.INTERNAL_SERVER_ERROR.value(), // Returns a 500 Internal Server Error
                "Internal Server Error",
                "An unexpected error occurred. Please try again later.",
                request.getRequestURI()
        );

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(NoResourceFoundException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                LocalDateTime.now(),
                HttpStatus.NOT_FOUND.value(), // 404
                "Not Found",
                "The requested route does not exist.",
                request.getRequestURI()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }
}
```

### ResourceNotFoundException.java
```java
package com.fairshare.debt_settlement.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```
