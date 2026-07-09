package com.studentinfo.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private final Key secretKey;
    private final long expirationMillis;

    public JwtTokenProvider(@Value("${jwt.secret}") String secret,
                            @Value("${jwt.expiration-ms}") long expirationMillis) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.expirationMillis = expirationMillis;
    }

    public String createToken(Long userId, String email, Role role, Long departmentId, Long studentId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMillis);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .setIssuedAt(now)
                .setExpiration(expiry)
                .addClaims(Map.of(
                        "email", email,
                        "role", role.name(),
                        "departmentId", departmentId,
                        "studentId", studentId
                ))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token);
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    public String getSubject(String token) {
        return parseToken(token).getBody().getSubject();
    }

    public Long getUserId(String token) {
        return Long.parseLong(getSubject(token));
    }

    public Role getRole(String token) {
        String role = parseToken(token).getBody().get("role", String.class);
        return Role.valueOf(role);
    }

    public Long getDepartmentId(String token) {
        Object departmentId = parseToken(token).getBody().get("departmentId");
        return departmentId instanceof Number ? ((Number) departmentId).longValue() : null;
    }

    public Long getStudentId(String token) {
        Object studentId = parseToken(token).getBody().get("studentId");
        return studentId instanceof Number ? ((Number) studentId).longValue() : null;
    }
}
