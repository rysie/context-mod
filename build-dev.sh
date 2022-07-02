#!/bin/sh

export $(grep -v '^#' .env | xargs)
docker-compose -f docker-compose.yml --env-file .env build bot
docker push $DOCKER_REGISTRY_IMAGE
