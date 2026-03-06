# ADR-007: Use GitHub Actions with OIDC for CI/CD

## Status
Accepted

## Context
The team uses GitHub for source control. CI/CD must deploy to AWS without storing long-lived credentials. Security is critical - no secrets in repo or CI variables.

## Decision
We will use **GitHub Actions** with **OpenID Connect (OIDC)** for AWS authentication.

## Rationale

### Why GitHub Actions?
- **Native to GitHub**: No external service needed
- **Workflow flexibility**: YAML-based, extensive marketplace
- **Matrix builds**: Test multiple configurations
- **Cost**: Generous free tier for private repos

### Why OIDC?
- **No credentials**: Temporary tokens, no long-lived secrets
- **Auditable**: Token generation logged in CloudTrail
- **Secure by default**: Principle of least privilege
- **Best practice**: Recommended by AWS and GitHub

### Pipeline Overview

```
PR → Lint → Typecheck → Test → Build → Scan → Deploy (dev)
                                     ↓
Main → Build → Scan → Artifact → Deploy (staging) → Deploy (prod)
```

### Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| GitLab CI | Good features | Different platform |
| CircleCI | Fast, flexible | Additional service |
| Jenkins | Fully customizable | High maintenance |
| AWS CodePipeline | Native AWS | Limited GitHub integration |

## Consequences

### Positive
- No credential rotation burden
- Fine-grained permissions per workflow
- Audit trail for all deployments
- Easy to extend

### Negative
- Requires OIDC setup in both GitHub and AWS
- Additional configuration step

## Implementation Notes
1. Create GitHub OIDC provider in AWS IAM
2. Create role with minimal permissions for CI
3. Configure GitHub Actions workflow with `permissions: id-token: write`
4. Use aws-actions/configure-aws-credentials action
5. Store only non-sensitive config in repo

## Security Gates

| Gate | Tool | Action on Failure |
|------|------|-------------------|
| Lint | ESLint | Block |
| TypeScript | tsc | Block |
| Unit Tests | Vitest/Jest | Block |
| SAST | CodeQL | Block on Critical |
| SCA | npm audit | Block on Critical |
| IaC | Checkov | Block on High |
| Container | Trivy | Block on Critical |

## References
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-aws)
- [AWS IAM OIDC](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_providers_create_oidc.html)
- [aws-actions/configure-aws-credentials](https://github.com/aws-actions/configure-aws-credentials)
