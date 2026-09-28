package ru.kata.spring.boot_security.demo.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.ui.ModelMap;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.entity.User;
import ru.kata.spring.boot_security.demo.service.RoleService;
import ru.kata.spring.boot_security.demo.service.UserService;

import javax.validation.Valid;

@Controller
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final RoleService roleService;

    @GetMapping()
    public String adminPage(@ModelAttribute("user") User user,
                            ModelMap model) {
        model.addAttribute("allRoles", roleService.findAll());
        model.addAttribute("userList", userService.findAll());
        return "private/admin";
    }

    @PostMapping("/delete")
    public String delete(@RequestParam(value = "id") Long id) {
        userService.deleteById(id);
        return "redirect:/admin";
    }


    @PostMapping("/edit")
    public String update(@ModelAttribute("user") @Valid User user, Model model, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("allRoles", roleService.findAll());
            model.addAttribute("userList", userService.findAll());
            return "private/admin";
        }
        userService.save(user);
        return "redirect:/admin";
    }


    @PostMapping()
    public String create(@ModelAttribute("user") @Valid User user,
                         BindingResult bindingResult, Model model) {
        model.addAttribute("userList", userService.findAll());
        model.addAttribute("allRoles", roleService.findAll());
        if (bindingResult.hasErrors()) {
            model.addAttribute("tabError", true);
            return "private/admin";
        }
        if (userService.findByEmail(user.getEmail()) != null) {
            model.addAttribute("emailError", "Пользователь с таким именем уже существует");
            return "private/admin";
        }
        userService.save(user);
        return "redirect:/admin";
    }
}
