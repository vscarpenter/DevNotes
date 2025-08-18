# Deployment Guide

This guide covers deploying DevNotes to AWS S3 and CloudFront.

## Overview

DevNotes is deployed using:
- **AWS S3** for hosting static files
- **AWS CloudFront** for global content delivery
- **GitHub Actions** for automated CI/CD

## Infrastructure

- **S3 Bucket**: `notes.vinny.dev`
- **CloudFront Distribution**: `E219UQK7YM96PZ`
- **Domain**: `https://notes.vinny.dev`

## Deployment Methods

### 1. Automated Deployment (GitHub Actions)

The application automatically deploys when code is pushed to the `main` branch.

**Workflow**: `.github/workflows/deploy.yml`

**Process**:
1. Run tests, linting, and type checking
2. Build the application
3. Deploy to S3 with optimized cache headers
4. Invalidate CloudFront cache

**Required Secrets** (configure in GitHub repository settings):
```
AWS_ACCESS_KEY_ID     # Your AWS access key
AWS_SECRET_ACCESS_KEY # Your AWS secret key
```

### 2. Manual Deployment (npm scripts)

Deploy from your local machine using npm scripts:

```bash
# Build and deploy in one command
npm run deploy

# Or step by step
npm run build
npm run deploy:s3
npm run deploy:invalidate
```

### 3. Shell Script Deployment

Use the deployment script for more control:

```bash
# Build and deploy
./scripts/deploy.sh build-and-deploy

# Deploy existing build
./scripts/deploy.sh deploy

# Build only
./scripts/deploy.sh build

# Show help
./scripts/deploy.sh help
```

## Cache Strategy

The deployment uses an optimized caching strategy:

### Static Assets (JS, CSS, Images)
- **Cache Control**: `public, max-age=31536000, immutable`
- **Duration**: 1 year
- **Files**: All files except HTML and JSON

### Dynamic Files (HTML, JSON)
- **Cache Control**: `public, max-age=0, must-revalidate`
- **Duration**: No cache (always fresh)
- **Files**: `*.html`, `*.json`, `*.txt`

## Prerequisites

### Local Development
- AWS CLI installed and configured
- Node.js 18+
- Access to S3 bucket and CloudFront distribution

### GitHub Actions
- Repository secrets configured with AWS credentials
- AWS IAM user with appropriate permissions

## AWS IAM Permissions

The deployment requires the following AWS permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::notes.vinny.dev",
        "arn:aws:s3:::notes.vinny.dev/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

## Troubleshooting

### Common Issues

**Build Fails**
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint

# Run tests
npm run test
```

**AWS CLI Not Configured**
```bash
# Configure AWS CLI
aws configure

# Verify configuration
aws sts get-caller-identity
```

**S3 Sync Fails**
```bash
# Check bucket permissions
aws s3 ls s3://notes.vinny.dev

# Test upload manually
aws s3 cp dist/index.html s3://notes.vinny.dev/index.html
```

**CloudFront Invalidation Fails**
```bash
# Check distribution exists
aws cloudfront get-distribution --id E219UQK7YM96PZ

# Create invalidation manually
aws cloudfront create-invalidation --distribution-id E219UQK7YM96PZ --paths "/*"
```

### Deployment Verification

After deployment, verify:

1. **Website loads**: Visit `https://notes.vinny.dev`
2. **Assets load correctly**: Check browser developer tools
3. **Cache headers**: Verify cache-control headers are set correctly
4. **CloudFront**: Check that invalidation completed

### Performance Monitoring

Monitor deployment performance:

```bash
# Check CloudFront invalidation status
aws cloudfront get-invalidation --distribution-id E219UQK7YM96PZ --id <invalidation-id>

# List recent deployments
aws s3api list-objects-v2 --bucket notes.vinny.dev --query 'Contents[?LastModified>=`2024-01-01`]'
```

## Security Considerations

- AWS credentials are stored as GitHub secrets
- S3 bucket is configured for static website hosting
- CloudFront provides HTTPS termination
- No sensitive data is included in the client-side build

## Environment Variables

No environment variables are required for this static application. All configuration is build-time.

## Rollback Process

To rollback a deployment:

1. **Revert the commit** in git
2. **Re-run deployment** pipeline
3. **Or manually restore** from S3 version history (if enabled)

```bash
# Quick rollback using git
git revert <commit-hash>
git push origin main
```

## Monitoring

Monitor your deployment:

- **CloudWatch**: AWS CloudFront and S3 metrics
- **GitHub Actions**: Build and deployment logs
- **Browser**: Network tab for cache validation
- **Lighthouse**: Performance audits