#!/usr/bin/env bash

gunicorn -k eventlet -w 2 qcs:app
