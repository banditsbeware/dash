#!/usr/bin/python
import sys
import logging
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0,"/home/jacob/Code/MLN-viz-dashboard_copy/Covid19")

from v2 import app
application = app
