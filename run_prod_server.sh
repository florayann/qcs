#!/usr/bin/env bash

export QCS_SETTINGS="/var/www/qcs/prod_settings.py"
gunicorn -k eventlet -w 2 qcs:app
