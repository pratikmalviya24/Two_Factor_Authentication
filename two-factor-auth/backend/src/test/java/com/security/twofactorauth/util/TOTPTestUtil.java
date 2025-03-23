package com.security.twofactorauth.util;

import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;

/**
 * Utility class for TOTP-related testing functionality
 */
public class TOTPTestUtil {
    private static final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private static final CodeGenerator codeGenerator = new DefaultCodeGenerator();
    private static final TimeProvider timeProvider = new SystemTimeProvider();
    private static final CodeVerifier verifier = new DefaultCodeVerifier(codeGenerator, timeProvider);

    /**
     * Generates a random secret key for TOTP
     * @return base32 encoded secret key
     */
    public static String generateSecretKey() {
        return secretGenerator.generate();
    }

    /**
     * Generates a TOTP code for a given secret key
     * @param secretKey base32 encoded secret key
     * @return generated TOTP code
     */
    public static String generateTOTPCode(String secretKey) {
        try {
            long currentTime = timeProvider.getTime();
            return codeGenerator.generate(secretKey, currentTime);
        } catch (Exception e) {
            throw new RuntimeException("Error generating TOTP code", e);
        }
    }

    /**
     * Verifies if a TOTP code is valid for a given secret key
     * @param secretKey base32 encoded secret key
     * @param code TOTP code to verify
     * @return true if code is valid, false otherwise
     */
    public static boolean verifyTOTPCode(String secretKey, String code) {
        try {
            return verifier.isValidCode(secretKey, code);
        } catch (Exception e) {
            throw new RuntimeException("Error verifying TOTP code", e);
        }
    }
}
