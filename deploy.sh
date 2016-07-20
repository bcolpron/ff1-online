#!/bin/bash -e
git push
ssh -i ~/amazon.pem ubuntu@52.32.84.215 "cd ff1-online; git pull --rebase; sudo nginx -s reload"
