#!/bin/sh

npm config set timeout 6000000
npm install --legacy-peer-deps
ng serve --host 0.0.0.0 --proxy-config proxy.conf.json --live-reload