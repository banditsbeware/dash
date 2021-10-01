# dash
fork of ITLab Covid visualization dashboard

create python virtual environment: <br>
`$ python3 -m virtualenv venv` <br>
`$ source venv/bin/activate`

install required packages: <br>
`$ pip install -r requirements.txt`

(in case packages are updated: `$ pip freeze > requirements.txt`)

development: <br>
`$ export FLASK_APP=__init__.py` (this should change soon) <br>
`$ export FLASK_ENV=development`

run: <br>
`$ flask run` 
