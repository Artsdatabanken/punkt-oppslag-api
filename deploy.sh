#!/bin/bash
docker build -t artsdatabanken/punkt-oppslag-api .
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker push artsdatabanken/punkt-oppslag-api
curl -X POST -H 'Content-type: application/json' --data '{"text":"deploy punkt-oppslag-api"}' $slackaddy