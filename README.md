# dash
fork of ITLab Covid visualization dashboard

create python virtual environment: <br>
`$ python3 -m virtualenv venv` <br>
`$ source venv/bin/activate`

install required packages: <br>
`$ pip install -r requirements.txt`

(in case packages are updated: `$ pip freeze > requirements.txt`)

development: <br>
`$ export FLASK_APP=cowiz` <br>
`$ export FLASK_ENV=development`

To skip from having to do that every time you activate `venv`, 
add the following lines to `venv/bin/activate`:
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

You will likely need to recompile `csvGenerator.cpp` on each new platform:
```bash
$ g++ -o cowiz/usmap/csvLayers/csvGenerator cowiz/usmap/csvLayers/csvGenerator.cpp
```

run: <br>
`$ flask run`