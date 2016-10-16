#!/usr/bin/env bash

gunicorn -k eventlet qcs:app
