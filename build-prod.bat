@echo off

FOR /F "eol=# tokens=*" %%i IN (%~dp0.env) DO SET %%i

docker-compose -f docker-compose.prod.yml --env-file .env.prod build
docker push %DOCKER_REGISTRY_PROD%
