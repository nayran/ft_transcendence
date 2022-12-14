#!/bin/sh

npm config set timeout 6000000 
npm install --legacy-peer-deps
npm run start:dev
