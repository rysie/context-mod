@echo off

FOR /F "eol=# tokens=*" %%i IN (%~dp0.env) DO SET %%i

docker-compose -f docker-compose.yml --env-file .env build
docker push %DOCKER_REGISTRY_IMAGE%
