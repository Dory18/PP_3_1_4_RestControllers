package ru.kata.spring.boot_security.demo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.entity.Role;
import ru.kata.spring.boot_security.demo.entity.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminRestController {

    private final UserService userService;
    private final RoleService roleService;

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleService.findAll());
    }

    @GetMapping()
    public ResponseEntity<List<User>> getAdminPage() {
        return ResponseEntity.status(HttpStatus.OK).body(userService.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        userService.deleteById(id);
        return ResponseEntity.ok().body(Map.of("message", "Пользователь успешно удален"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @PatchMapping()
    public ResponseEntity<?> update(@RequestBody User user) {
        userService.save(user);
        return ResponseEntity.ok().body(Map.of("message", "Пользователь успешно обновлен"));
    }


    @PostMapping()
    public ResponseEntity<?> create(@RequestBody User user) {
        if (userService.findByEmail(user.getEmail()) != null) {
            return ResponseEntity.badRequest().body("Пользователь с таким email уже существует");
        }
        userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
}
