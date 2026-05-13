package com.miasi.school.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.miasi.school.entity.SchoolEntities.UserEntity;
import com.miasi.school.exception.AuthenticationFailedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class JwtService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();
    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};

    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final byte[] secret;
    private final long expirationSeconds;

    public JwtService(ObjectMapper objectMapper,
                      @Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-seconds:3600}") long expirationSeconds) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException("app.jwt.secret must be at least 32 bytes long");
        }
        this.objectMapper = objectMapper;
        this.clock = Clock.systemUTC();
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.expirationSeconds = expirationSeconds;
    }

    public String createToken(UserEntity user) {
        Instant now = clock.instant();

        Map<String, Object> header = new LinkedHashMap<>();
        header.put("alg", "HS256");
        header.put("typ", "JWT");

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("sub", user.getId().toString());
        payload.put("email", user.getEmail());
        payload.put("roles", user.getRoles());
        payload.put("iat", now.getEpochSecond());
        payload.put("exp", now.plusSeconds(expirationSeconds).getEpochSecond());

        String unsignedToken = encodeJson(header) + "." + encodeJson(payload);
        return unsignedToken + "." + sign(unsignedToken);
    }

    public UUID validateAndExtractUserId(String token) {
        if (token == null || token.isBlank()) {
            throw new AuthenticationFailedException("Missing token");
        }

        String[] parts = token.split("\\.", -1);
        if (parts.length != 3) {
            throw new AuthenticationFailedException("Invalid token format");
        }

        String unsignedToken = parts[0] + "." + parts[1];
        String expectedSignature = sign(unsignedToken);
        if (!MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.US_ASCII), parts[2].getBytes(StandardCharsets.US_ASCII))) {
            throw new AuthenticationFailedException("Invalid token signature");
        }

        Map<String, Object> header = decodeJson(parts[0]);
        if (!"HS256".equals(header.get("alg"))) {
            throw new AuthenticationFailedException("Unsupported token algorithm");
        }

        Map<String, Object> payload = decodeJson(parts[1]);
        Object expiration = payload.get("exp");
        if (!(expiration instanceof Number) || ((Number) expiration).longValue() <= clock.instant().getEpochSecond()) {
            throw new AuthenticationFailedException("Token expired");
        }

        Object subject = payload.get("sub");
        if (!(subject instanceof String)) {
            throw new AuthenticationFailedException("Missing token subject");
        }

        try {
            return UUID.fromString((String) subject);
        } catch (IllegalArgumentException exception) {
            throw new AuthenticationFailedException("Invalid token subject");
        }
    }

    private String encodeJson(Map<String, Object> value) {
        try {
            return BASE64_URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(value));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not encode token", exception);
        }
    }

    private Map<String, Object> decodeJson(String value) {
        try {
            return objectMapper.readValue(BASE64_URL_DECODER.decode(value), MAP_TYPE);
        } catch (IllegalArgumentException | IOException exception) {
            throw new AuthenticationFailedException("Invalid token payload");
        }
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(secret, HMAC_ALGORITHM));
            return BASE64_URL_ENCODER.encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Could not sign token", exception);
        }
    }
}
