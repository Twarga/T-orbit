# ADR-006: Use AWS as Primary Cloud Runtime

## Status
Accepted

## Context
Cosmic Watch requires reliable, scalable infrastructure. The team has AWS experience, and the architecture maps well to AWS services (ECS, RDS, ElastiCache, S3).

## Decision
We will use **AWS** as the primary cloud provider.

## Rationale

### Why AWS?
- **Team expertise**: Existing knowledge of AWS services
- **Service fit**: ECS Fargate, RDS, ElastiCache, S3 map well to architecture
- **Security**: Robust IAM, KMS, VPC isolation
- **Monitoring**: CloudWatch, X-Ray integration
- **Terraform support**: Excellent provider documentation

### Service Mapping

| Component | AWS Service | Purpose |
|-----------|-------------|---------|
| Compute | ECS Fargate | Serverless containers |
| Database | RDS PostgreSQL | Primary data store |
| Cache | ElastiCache Redis | Hot cache |
| Storage | S3 | Object storage, APOD media |
| CDN | CloudFront | Static assets |
| DNS | Route 53 | Domain management |
| Security | IAM, KMS | Access & encryption |
| Monitoring | CloudWatch, X-Ray | Observability |

### Alternatives Considered

| Alternative | Pros | Cons |
|-------------|------|------|
| GCP | Good data services | Less team experience |
| Azure | Enterprise integration | Overkill for MVP |
| DigitalOcean | Simpler, cheaper | Limited services |
| Self-hosted | Full control | High ops burden |

### Trade-offs
- **Cost**: More expensive than some alternatives (mitigated by right-sizing)
- **Complexity**: Many services to learn (acceptable for team with experience)

## Consequences

### Positive
- Familiar ecosystem
- Scalable and reliable
- Strong security defaults
- Good Terraform support

### Negative
- Vendor lock-in (acceptable for MVP)
- Can become expensive at scale
- Some services have regional limitations

## Environment Strategy

| Environment | Configuration |
|-------------|---------------|
| dev | Single AZ, minimal redundancy, spot for workers |
| staging | Production-like, reduced capacity |
| prod | Multi-AZ, full HA, autoscaling |

## Implementation Notes
- Use Terraform for all infrastructure
- Enable VPC flow logs for security
- Configure appropriate security groups
- Use IAM roles (no access keys)
- Enable CloudTrail audit logging

## References
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws)
- [ECS Fargate](https://aws.amazon.com/ecs/)
