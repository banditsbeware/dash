# dash
fork of ITLab Covid visualization dashboard

create python virtual environment: <br>
`$ python3 -m virtualenv venv` <br>
`$ source venv/bin/activate`

install required packages: <br>
`$ pip install -r requirements.txt`

the app requires a pynytimes API key in `.env`. something like<br>
`NYTAPI_KEY=_________________________________`

development: <br>
`$ export FLASK_APP=cowiz` <br>
`$ export FLASK_ENV=development`

run: <br>
`$ flask run`
