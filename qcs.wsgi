import sys
import os
sys.path.insert(0, "/var/www/qcs")
os.environ["QCS_SETTINGS"] = "/var/www/qcs/prod_settings.py"
from qcs import app as application
