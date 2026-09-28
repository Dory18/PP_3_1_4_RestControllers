package ru.kata.spring.boot_security.demo.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.util.Collection;
import java.util.Objects;
import java.util.Set;


@Entity
@Table(name = "users")
@Getter
@Setter
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotEmpty(message = "Фамилия должна быть заполнена")
    @Size(min = 2, max = 50, message = "Фамилия не может превышать 50 символов и быть меньше 2")
    @Column(name = "last_name")
    private String lastName;
    @NotEmpty(message = "Имя должно быть заполнено")
    @Size(min = 2, max = 30, message = "Имя не может превышать 30 символов и быть меньше 2")
    @Column(name = "first_name")
    private String firstName;
    @NotNull(message = "Укажите возраст")
    @Min(value = 14, message = "Пользователь должен быть старше 14 лет")
    @Column(name = "age")
    private int age;
    @NotEmpty(message = "Email должен быть заполнен")
    @Email(message = "Введите корректный email")
    @Column(unique = true)
    private String email;
    @Column(name = "password")
    private String password;

    @ManyToMany(fetch = FetchType.LAZY)
    private Set<Role> roles;

    public User() {

    }

    public User(String lastName, String firstName, String email, int age, String password) {
        this.lastName = lastName;
        this.firstName = firstName;
        this.age = age;
        this.email = email;
        this.password = password;
    }

    public User(String lastName, String firstName, String email, int age) {
        this.lastName = lastName;
        this.firstName = firstName;
        this.email = email;
        this.age = age;
    }

    @Override
    public String toString() {
        return "User{" +
               "id=" + id +
               ", lastName='" + lastName + '\'' +
               ", firstName='" + firstName + '\'' +
               ", email='" + email + '\'' +
               ", age=" + age +
               '}';
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) return true;
        if (object == null || getClass() != object.getClass()) return false;
        User user = (User) object;
        return age == user.age && Objects.equals(id, user.id) && Objects.equals(lastName, user.lastName) && Objects.equals(firstName, user.firstName) && Objects.equals(email, user.email) && Objects.equals(password, user.password) && Objects.equals(roles, user.roles);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, lastName, firstName, age, email, password, roles);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return getRoles();
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
