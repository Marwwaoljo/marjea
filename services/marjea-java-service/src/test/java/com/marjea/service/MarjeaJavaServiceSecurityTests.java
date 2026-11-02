package com.marjea.service;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.time.Instant;
import java.util.Date;

import com.marjea.service.access.SecurityConfiguration;
import com.marjea.service.monitoring.OfficialFeedMonitor;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.ApplicationContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "marjea.monitoring.enabled=false")
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MarjeaJavaServiceSecurityTests {
    private static final String ISSUER = "https://clerk.test";
    private static final String AUDIENCE = "marjea-api-test";
    private static final String KEY_ID = "local-test-key";
    private static final RSAKey SIGNING_KEY = createSigningKey();
    private static final HttpServer JWKS_SERVER = startJwksServer();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ApplicationContext applicationContext;

    @Value("${server.address}")
    private String serverAddress;

    @DynamicPropertySource
    static void configureLocalJwtProperties(DynamicPropertyRegistry registry) {
        registry.add("MARJEA_CLERK_ISSUER_URI", () -> ISSUER);
        registry.add("MARJEA_CLERK_JWKS_URI", MarjeaJavaServiceSecurityTests::jwksUri);
        registry.add("MARJEA_API_AUDIENCE", () -> AUDIENCE);
    }

    @AfterAll
    static void stopLocalJwksServer() {
        JWKS_SERVER.stop(0);
    }

    @Test
    void healthIsMinimalAndServiceBindsToLoopback() throws Exception {
        org.junit.jupiter.api.Assertions.assertEquals("127.0.0.1", serverAddress);
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    void scheduledFeedMonitoringIsAbsentWhenNotExplicitlyEnabled() {
        org.junit.jupiter.api.Assertions.assertTrue(
                applicationContext.getBeansOfType(OfficialFeedMonitor.class).isEmpty());
    }

    @Test
    void requestWithoutTokenIsRejected() throws Exception {
        mockMvc.perform(get("/internal/example"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void forgedTokenIsRejected() throws Exception {
        mockMvc.perform(get("/internal/example")
                        .header("Authorization", "Bearer eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJmYWtlIn0.invalid"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void expiredTokenIsRejected() throws Exception {
        mockMvc.perform(bearer(token(Instant.now().minusSeconds(60), Instant.now().minusSeconds(120),
                        ISSUER, AUDIENCE, true, true)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenWithFutureNotBeforeIsRejected() throws Exception {
        mockMvc.perform(bearer(token(Instant.now().plusSeconds(600), Instant.now().plusSeconds(300),
                        ISSUER, AUDIENCE, true, true)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenFromAnotherIssuerIsRejected() throws Exception {
        mockMvc.perform(bearer(token(Instant.now().plusSeconds(300), Instant.now().minusSeconds(5),
                        "https://other-issuer.test", AUDIENCE, true, true)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void tokenWithWrongAudienceIsRejected() throws Exception {
        mockMvc.perform(bearer(token(Instant.now().plusSeconds(300), Instant.now().minusSeconds(5),
                        ISSUER, "different-api", true, true)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void validClerkIssuerTokenPassesAuthentication() throws Exception {
        mockMvc.perform(bearer(token(Instant.now().plusSeconds(300), Instant.now().minusSeconds(5),
                        ISSUER, AUDIENCE, true, true)))
                .andExpect(status().isNotFound());
    }

    @Test
    void unverifiedEmailClaimIsRejected() throws Exception {
        mockMvc.perform(bearer(token(Instant.now().plusSeconds(300), Instant.now().minusSeconds(5),
                        ISSUER, AUDIENCE, false, true)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void authenticatedUserWithoutMarjeaPermissionIsForbidden() throws Exception {
        mockMvc.perform(bearer(token(Instant.now().plusSeconds(300), Instant.now().minusSeconds(5),
                        ISSUER, AUDIENCE, true, false)))
                .andExpect(status().isForbidden());
    }

    private static org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder bearer(String jwt) {
        return get("/internal/example").header("Authorization", "Bearer " + jwt);
    }

    private static String token(
            Instant expiresAt,
            Instant notBefore,
            String issuer,
            String audience,
            boolean emailVerified,
            boolean hasMarjeaAccess) {
        try {
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .issuer(issuer)
                    .subject("synthetic-test-subject")
                    .audience(audience)
                    .issueTime(Date.from(Instant.now().minusSeconds(10)))
                    .notBeforeTime(Date.from(notBefore))
                    .expirationTime(Date.from(expiresAt))
                    .claim("email_verified", emailVerified)
                    .claim("marjea_access", hasMarjeaAccess)
                    .build();
            SignedJWT jwt = new SignedJWT(
                    new JWSHeader.Builder(JWSAlgorithm.RS256)
                            .keyID(KEY_ID)
                            .type(JOSEObjectType.JWT)
                            .build(),
                    claims);
            jwt.sign(new RSASSASigner(SIGNING_KEY));
            return jwt.serialize();
        } catch (JOSEException exception) {
            throw new IllegalStateException("Could not sign local synthetic test JWT", exception);
        }
    }

    private static RSAKey createSigningKey() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            var pair = generator.generateKeyPair();
            return new RSAKey.Builder((java.security.interfaces.RSAPublicKey) pair.getPublic())
                    .privateKey((RSAPrivateKey) pair.getPrivate())
                    .keyID(KEY_ID)
                    .build();
        } catch (Exception exception) {
            throw new ExceptionInInitializerError(exception);
        }
    }

    private static HttpServer startJwksServer() {
        try {
            HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            String jwks = new JWKSet(SIGNING_KEY.toPublicJWK()).toString();
            server.createContext("/jwks", exchange -> {
                byte[] body = jwks.getBytes(UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, body.length);
                try (var output = exchange.getResponseBody()) {
                    output.write(body);
                }
            });
            server.start();
            return server;
        } catch (IOException exception) {
            throw new ExceptionInInitializerError(exception);
        }
    }

    private static String jwksUri() {
        return "http://127.0.0.1:" + JWKS_SERVER.getAddress().getPort() + "/jwks";
    }
}
