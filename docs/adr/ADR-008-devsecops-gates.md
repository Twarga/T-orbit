# ADR-008: Enforce DevSecOps Pipeline Gates

## Status
Accepted

## Context
Cosmic Watch processes external data and serves public users. Supply chain security is critical. We must prevent vulnerabilities from reaching production.

## Decision
We will enforce automated security gates in CI/CD before any deployment.

## Security Domains

### 1. Application Security (SAST)
- **Tool**: CodeQL / ESLint security rules
- **Scope**: All source code
- **Block**: Critical/High severity findings

### 2. Dependency Security (SCA)
- **Tool**: npm audit / Snyk
- **Scope**: All npm dependencies
- **Block**: Critical/High vulnerabilities
- **Timeline**: Critical <48h, High <7 days

### 3. Infrastructure Security (IaC)
- **Tool**: Checkov / tfsec
- **Scope**: All Terraform files
- **Block**: High/Critical misconfigurations

### 4. Container Security
- **Tool**: Trivy / Grype
- **Scope**: Docker images before push
- **Block**: Critical vulnerabilities

### 5. Software Bill of Materials (SBOM)
- **Tool**: CycloneDX / SPDX
- **Scope**: Every build
- **Purpose**: Vulnerability tracking, compliance

### 6. Artifact Signing
- **Tool**: Cosign / GitHub Actions
- **Scope**: Container images
- **Purpose**: Supply chain integrity

## Pipeline Integration

```yaml
# Simplified CI pipeline with security gates
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout
      
      - name: SAST Scan
        uses: github/codeql-action/analyze
      
      - name: Dependency Audit
        run: npm audit --audit-level=high
      
      - name: IaC Scan
        uses: bridgecrewio/checkov-action
      
      - name: Container Scan
        uses: aquasecurity/trivy-action
      
      - name: Generate SBOM
        uses: cyclonedx/npm-create-bom
      
      - name: Sign Artifact
        uses: sigstore/cosign-action
```

## Consequences

### Positive
- Vulnerabilities caught before production
- Compliance-ready from day one
- Supply chain integrity
- Audit trail for security events

### Negative
- Pipeline takes longer to run
- False positives require tuning
- Must update dependencies regularly

## Monitoring & Response

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Critical vulnerabilities | 0 in prod | > 0 |
| High vulnerabilities | < 5 | > 5 |
| Scan coverage | 100% | < 100% |
| Mean time to fix (Critical) | < 48h | > 48h |

## Implementation Notes
- Start with relaxed thresholds, tighten over time
- Configure notifications for security findings
- Establish regular dependency update cadence (weekly)
- Document runbooks for common vulnerabilities
- Schedule quarterly penetration testing

## References
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supply-chain Security](https://slsa.dev/)
- [CycloneDX](https://cyclonedx.org/)
- [Sigstore/Cosign](https://www.sigstore.dev/)
