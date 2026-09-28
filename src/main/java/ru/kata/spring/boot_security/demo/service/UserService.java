package ru.kata.spring.boot_security.demo.service;

import org.springframework.security.core.userdetails.UserDetailsService;
import ru.kata.spring.boot_security.demo.entity.User;

import java.util.List;

public interface UserService extends UserDetailsService {
    List<User> findAll();

    void save(User user);

    User findById(long id);

    void deleteById(long id);

    User findByEmail(String email);
}
