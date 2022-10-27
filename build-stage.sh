#!/bin/bash

if [ ! -f .env ]
then
  export $(cat ./.env | xargs)
fi

docker-compose -f docker-compose.yml --env-file .env build
docker push ${DOCKER_REGISTRY_IMAGE}
