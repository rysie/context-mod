#!/bin/bash

if [ ! -f .env ]
then
  export $(cat ./.env | xargs)
fi

docker-compose -f docker-compose.prod.yml --env-file .env.prod build
docker push ${DOCKER_REGISTRY_PROD}
