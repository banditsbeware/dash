# dash
Fork of ITLab Covid visualization dashboard

## Getting Started
1. Clone this repository
```bash
$ git clone https://github.com/banditsbeware/dash.git
$ cd dash
```

2. Create python virtual environment and install required packages: <br>
```bash
$ python3 -m virtualenv venv
$ source venv/bin/activate
$ pip install -r requirements.txt
```

3. Configure

3.1 The app requires a pynytimes API key in `.env`. It should look something like<br>
`NYTAPI_KEY=_________________________________`

3.2 Compile the `csvGenerator`:
```bash
$ g++ -o cowiz/usmap/csvLayers/csvGenerator cowiz/usmap/csvLayers/csvGenerator.cpp
```

3.3 Set the development flask environment variables:
```bash
$ export FLASK_APP=cowiz
$ export FLASK_ENV=development
```

To skip from having to set environment variables every time you activate `venv`, add the following lines to `venv/bin/activate`:
```
    ...
    
    # reset old environment variables
    # INSERT BELOW
    if ! [ -z "${_OLD_FLASK_APP:+_}" ] ; then
        FLASK_APP="$_OLD_FLASK_APP"
        export FLASK_APP
        unset _OLD_FLASK_APP
    fi
    if ! [ -z "${_OLD_FLASK_ENV:+_}" ] ; then
        FLASK_ENV="$_OLD_FLASK_ENV"
        export FLASK_ENV
        unset _OLD_FLASK_ENV
    fi
    # DONE INSERTING
    
    ...
    
export VIRTUAL_ENV

# INSERT BELOW
_OLD_FLASK_APP="$FLASK_APP"
FLASK_APP=cowiz
export FLASK_APP

_OLD_FLASK_ENV="$FLASK_ENV"
FLASK_ENV=development
export FLASK_ENV
# DONE INSERTING
```

4. Run the app!
`$ flask run`
