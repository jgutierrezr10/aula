package com.example.avance.security;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {

    private final int MAX_ATTEMPT = 5;
    private final ConcurrentHashMap<String, Attempt> attemptsCache = new ConcurrentHashMap<>();

    public void loginSucceeded(String key) {
        attemptsCache.remove(key);
    }

    public void loginFailed(String key) {
        Attempt attempt = attemptsCache.getOrDefault(key, new Attempt(0, Instant.now()));
        attempt.setAttempts(attempt.getAttempts() + 1);
        attempt.setLastModified(Instant.now());
        attemptsCache.put(key, attempt);
    }

    public boolean isBlocked(String key) {
        Attempt attempt = attemptsCache.get(key);
        if (attempt != null) {
            // Block for 15 minutes
            if (attempt.getAttempts() >= MAX_ATTEMPT) {
                if (Instant.now().isBefore(attempt.getLastModified().plusSeconds(900))) {
                    return true;
                } else {
                    // Unblock after 15 minutes
                    attemptsCache.remove(key);
                    return false;
                }
            }
        }
        return false;
    }

    private static class Attempt {
        private int attempts;
        private Instant lastModified;

        public Attempt(int attempts, Instant lastModified) {
            this.attempts = attempts;
            this.lastModified = lastModified;
        }

        public int getAttempts() { return attempts; }
        public void setAttempts(int attempts) { this.attempts = attempts; }
        public Instant getLastModified() { return lastModified; }
        public void setLastModified(Instant lastModified) { this.lastModified = lastModified; }
    }
}
