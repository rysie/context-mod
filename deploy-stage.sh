#!/bin/bash

if [ ! -f .env ]
then
  export $(cat ./.env | xargs)
fi

docker pull docker push ${DOCKER_REGISTRY_STAGE}
docker-compose -f docker-compose.stage.yml --env-file .env.stage up -d
