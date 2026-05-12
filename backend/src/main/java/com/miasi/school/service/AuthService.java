package com.miasi.school.service;

import com.miasi.school.dto.LoginRequest;
import com.miasi.school.dto.LoginResponse;
import com.miasi.school.entity.SchoolEntities.UserEntity;
import com.miasi.school.exception.AuthenticationFailedException;
import com.miasi.school.exception.AuthorizationFailedException;
import com.miasi.school.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse authenticate(LoginRequest request) {
        UserEntity user = userRepo.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new AuthenticationFailedException("Nieprawidłowy email lub hasło"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new AuthenticationFailedException("Nieprawidłowy email lub hasło");
        }

        String fullName = user.getFirstName() + " " + user.getLastName();
        return new LoginResponse(user.getId(), fullName, user.getEmail(), user.getRoles(), "demo-token-" + user.getId());
    }

    public UserEntity requireAuthorizedUser(String authorizationHeader) {
        String token = extractToken(authorizationHeader);
        String tokenPrefix = "demo-token-";
        
        if (token == null || !token.startsWith(tokenPrefix)) {
            throw new AuthenticationFailedException("Nieprawidłowy lub brakujący token");
        }

        UUID userId;
        try {
            userId = UUID.fromString(token.substring(tokenPrefix.length()));
        } catch (IllegalArgumentException exception) {
            throw new AuthenticationFailedException("Nieprawidłowy format tokenu");
        }

        return userRepo.findById(userId)
                .orElseThrow(() -> new AuthenticationFailedException("Token wygasł lub użytkownik nie istnieje"));
    }

    public void requireRole(UserEntity actor, String... allowedRoles) {
        if (actor.getRoles() == null) {
            throw new AuthorizationFailedException("Użytkownik nie posiada żadnych ról");
        }
        for (String allowed : allowedRoles) {
            if (actor.getRoles().contains(allowed)) return;
        }
        throw new AuthorizationFailedException("Brak uprawnień do wykonania tej operacji");
    }

    private String extractToken(String header) {
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return header;
    }
}
