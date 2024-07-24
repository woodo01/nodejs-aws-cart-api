#!/bin/bash

curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"name":"ALEXANDERSUS","password":"TEST_PASSWORD"}' \
  http://localhost:4000/api/auth/register