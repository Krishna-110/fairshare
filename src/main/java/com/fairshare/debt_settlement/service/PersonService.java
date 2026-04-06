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
