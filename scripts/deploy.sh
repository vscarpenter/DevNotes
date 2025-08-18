#!/bin/bash

# DevNotes Deployment Script
# Deploys the application to AWS S3 and invalidates CloudFront cache

set -e  # Exit on any error

# Configuration
S3_BUCKET="s3://notes.vinny.dev"
CLOUDFRONT_DISTRIBUTION_ID="E219UQK7YM96PZ"
BUILD_DIR="dist"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if AWS CLI is installed and configured
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi

    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS CLI is not configured. Please run 'aws configure' first."
        exit 1
    fi

    log_success "AWS CLI is configured"
}

# Check if build directory exists
check_build_dir() {
    if [ ! -d "$BUILD_DIR" ]; then
        log_error "Build directory '$BUILD_DIR' not found. Please run 'npm run build' first."
        exit 1
    fi
    log_success "Build directory found"
}

# Deploy to S3
deploy_to_s3() {
    log_info "Deploying to S3 bucket: $S3_BUCKET"
    
    # Upload static assets with long cache headers (1 year)
    log_info "Uploading static assets with cache headers..."
    aws s3 sync $BUILD_DIR/ $S3_BUCKET \
        --delete \
        --cache-control "public, max-age=31536000, immutable" \
        --exclude "*.html" \
        --exclude "*.json" \
        --exclude "*.txt"

    # Upload HTML, JSON, and other dynamic files with no cache
    log_info "Uploading HTML and JSON files with no-cache headers..."
    aws s3 sync $BUILD_DIR/ $S3_BUCKET \
        --delete \
        --cache-control "public, max-age=0, must-revalidate" \
        --include "*.html" \
        --include "*.json" \
        --include "*.txt"

    log_success "Files uploaded to S3"
}

# Invalidate CloudFront cache
invalidate_cloudfront() {
    log_info "Invalidating CloudFront distribution: $CLOUDFRONT_DISTRIBUTION_ID"
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    log_success "CloudFront invalidation created: $INVALIDATION_ID"
    log_info "Invalidation may take a few minutes to complete"
}

# Main deployment function
deploy() {
    log_info "Starting deployment process..."
    
    check_aws_cli
    check_build_dir
    deploy_to_s3
    invalidate_cloudfront
    
    log_success "Deployment completed successfully!"
    log_info "🌐 Your application is available at: https://notes.vinny.dev"
}

# Handle script arguments
case "${1:-deploy}" in
    "build")
        log_info "Building application..."
        npm run build
        log_success "Build completed"
        ;;
    "deploy")
        deploy
        ;;
    "build-and-deploy")
        log_info "Building and deploying application..."
        npm run build
        deploy
        ;;
    "help"|"-h"|"--help")
        echo "DevNotes Deployment Script"
        echo ""
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  build             Build the application only"
        echo "  deploy            Deploy existing build to AWS (default)"
        echo "  build-and-deploy  Build and deploy in one step"
        echo "  help              Show this help message"
        echo ""
        echo "Environment:"
        echo "  S3_BUCKET: $S3_BUCKET"
        echo "  CLOUDFRONT_DISTRIBUTION_ID: $CLOUDFRONT_DISTRIBUTION_ID"
        ;;
    *)
        log_error "Unknown command: $1"
        log_info "Use '$0 help' for usage information"
        exit 1
        ;;
esac