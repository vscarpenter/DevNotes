# 🚀 Quick Deployment Setup

This file contains the setup instructions for configuring AWS S3 and CloudFront deployment for DevNotes.

## GitHub Secrets Configuration

To enable automated deployment, add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add the following repository secrets:

```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

## Local Development Setup

For local deployment, copy the environment template:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your AWS credentials:

```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
```

## Quick Deployment Commands

```bash
# Deploy manually from local machine
npm run deploy

# Or use the deployment script
./scripts/deploy.sh build-and-deploy

# Build only (no deployment)
npm run build
```

## Automatic Deployment

Deployment happens automatically when you push to the `main` branch:

1. **Push to main** → GitHub Actions triggers
2. **Tests run** → Build creates optimized bundle
3. **Deploy to S3** → Files uploaded with cache headers
4. **CloudFront invalidation** → Cache refreshed globally

## Verification

After deployment, verify at: **https://notes.vinny.dev**

## Troubleshooting

**If deployment fails:**

1. Check GitHub Actions logs
2. Verify AWS credentials are correct
3. Ensure you have proper S3/CloudFront permissions
4. Run tests locally: `npm test`

**Quick fixes:**

```bash
# Test AWS connection
aws sts get-caller-identity

# Test S3 access
aws s3 ls s3://notes.vinny.dev

# Test CloudFront access
aws cloudfront get-distribution --id E219UQK7YM96PZ
```

## Security Notes

- AWS credentials are stored as GitHub secrets (encrypted)
- Environment files (`.env.local`) are gitignored
- No sensitive data is included in the client build
- S3 bucket is configured for static website hosting only

---

**Next Steps:**
1. Configure GitHub secrets
2. Push to main branch
3. Monitor deployment in GitHub Actions
4. Verify site loads at https://notes.vinny.dev

For detailed documentation, see `docs/DEPLOYMENT.md`.