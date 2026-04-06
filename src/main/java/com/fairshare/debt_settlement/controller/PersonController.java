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