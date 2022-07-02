#!/bin/sh
export $(grep -v '^#' .env | xargs)
docker pull $DOCKER_REGISTRY_IMAGE
docker-compose -f docker-compose.dev.yml --env-file .env up -d
