#!/bin/sh

# needs the following from the env:
# - ENV=dev/prod (dep on branch)
# - ECR_REGISTRY=<aws_account_id>.dkr.ecr.eu-west-2.amazonaws.com
# - ECR_REPOSITORY=chem-graphql
# - IMAGE_TAG=<git_branch>-<git_sha>

docker buildx build \
  --platform linux/arm64/v8 \
  --tag "$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" \
  --tag "$ECR_REGISTRY/$ECR_REPOSITORY:$ENV" \
  --push .
