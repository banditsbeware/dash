# dash
The Covid data visualization dashboard is one of [UTA ITLab](https://itlab.uta.edu)'s research projects, focusing on multilayer network analysis. This web application showcases graph visualization techniques in two ways; a choropleth map shows changes in statistics across time, and a side-by-side line graph is used to compare statistics from various regions over a similar time period. 

## Local development
Clone this repository
```bash
$ git clone https://github.com/banditsbeware/dash.git
$ cd dash
```

Create python virtual environment and install required packages: <br>
```bash
$ python3 -m virtualenv venv
$ source venv/bin/activate
$ pip install -r requirements.txt
```

If you prefer to use anaconda, you can install the required packages with:
```bash
$ conda create --prefix ./env python=3.8 pip
$ conda activate ./env
$ pip install -r requirements.txt
```

The app requires a [New York Times API](https://developer.nytimes.com) key in `.env`; e.g. `NYTAPI_KEY=<api key>`

Compile the `csvGenerator`:
```bash
$ g++ -o cowiz/usmap/csvLayers/csvGenerator cowiz/usmap/csvLayers/csvGenerator.cpp
```

Set the development flask environment variables:
```bash
$ export FLASK_APP=cowiz
$ export FLASK_ENV=development
```

To skip from having to set environment variables every time you activate `venv`, add the following lines to `venv/bin/activate`:
```bash
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

Run the app:<br>
```bash
$ flask run
```
