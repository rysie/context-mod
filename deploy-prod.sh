#!/bin/bash

if [ ! -f .env ]
then
  export $(cat ./.env | xargs)
fi

docker pull ${DOCKER_REGISTRY_IMAGE}
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
