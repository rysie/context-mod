#!/bin/bash

if [ ! -f .env ]
then
  export $(cat ./.env | xargs)
fi

docker pull docker push ${DOCKER_REGISTRY_PROD}
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d
