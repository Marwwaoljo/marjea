# MARJEA Java Service — Phase 2 Foundation

This is an isolated Spring Boot foundation. It does not replace Express or
connect to PostgreSQL and does not expose any business API. It validates Clerk
JWTs locally against configured public JWKS and is not production-ready.

## Toolchain

- Java 21
- Spring Boot 4.1.2
- Maven 3.9+

Spring Boot 4.1.2's official system requirements state Java 17 through 27; Java
21 is within that supported range.

## Run in Replit

From the repository root:

```sh
cd services/marjea-java-service
mvn spring-boot:run
```

The development profile binds only to `127.0.0.1:8099`. It is intentionally not
registered as a Replit web artifact or workflow and is not routed publicly.

In another shell in the same development container:

```sh
curl --fail http://127.0.0.1:8099/actuator/health
```

Stop the process with `Ctrl+C`.

## Test

```sh
cd services/marjea-java-service
mvn test
```

The tests start a loopback-only JWKS endpoint with a locally generated RSA key.
They verify signature, issuer, audience, expiration, not-before, signed email
verification and signed MARJEA access claims. They do not contact Clerk or use
real accounts or keys.

## Dependency vulnerability scan

```sh
cd services/marjea-java-service
mvn -Psecurity-scan verify
```

This uses OWASP Dependency-Check and downloads vulnerability intelligence when
needed. The first run can be slow or rate-limited by upstream feeds. It fails on
CVSS 7.0 or higher. Review the generated report; a successful build alone is not
a security certification.

## Profiles

- `dev` (default): loopback listener on port 8099.
- `test`: loopback listener on an ephemeral port.
- `prod`: loopback-only listener; no public gateway or credentials are configured.

All profiles expose only `/actuator/health`, with component details hidden.
JWT authentication is mandatory. Configure these non-secret values before
starting the service:

- `MARJEA_CLERK_ISSUER_URI`: exact issuer for the intended Clerk environment.
- `MARJEA_CLERK_JWKS_URI`: that issuer's public JWKS endpoint.
- `MARJEA_API_AUDIENCE`: the exact API audience expected in `aud`.

Startup fails when a required value is missing. JWT validation pins RS256 and
checks the public-key signature, exact issuer, configured audience, required
`exp` and `nbf` claims, and timestamp validity. A signed `email_verified: true`
claim is required; only the signed `marjea_access: true` claim grants the
service-level `MARJEA_ACCESS` authority. No role or access is inferred from an
email address or domain.

Clerk must issue these claims in the signed token for access to succeed. No
Clerk configuration was changed here, so real Clerk tokens are not yet proven
to contain them. Do not guess issuer/JWKS values or use a production issuer in
development. The health endpoint remains loopback-only because the server binds
to `127.0.0.1`.

No database, Flyway, Clerk secret key, provider key, or customer data is
configured here. The signed access claim is only a service-level gate; it does
not implement institution membership, per-tenant roles, or MFA. Do not expose
business APIs until those authorization checks are designed and implemented.

## Modular package boundaries

`identity`, `institutions`, `access`, `references`, `claims`, `analysis`, `cases`,
`governance`, and `subscriptions` are the initial domain boundaries. They are
package boundaries only; business behavior remains in the existing Express
service until a separately approved migration phase.
