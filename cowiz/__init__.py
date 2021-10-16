from flask import Flask

app = Flask(__name__)
app.config.from_mapping(
  DEBUG = True,
  SECRET_KEY = "b'\xe5\xd1\x81\x9e\x95\xfd\x8a\xf8h\xed\x95\xe9>-\\\x87",
  DATAPATH = 'cowiz/static/world.csv'
)

import cowiz.routes