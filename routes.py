# Packages required for all versions of the project
from flask import render_template, redirect, request, url_for, session, flash
import requests
from datetime import datetime, timedelta
from flask import Flask
from . import app
from .v2.functions import FunctionsV2
from .v3.functions import FunctionsV3

@app.route("/")
def index():
    return render_template("home_page.html")

@app.route("/v2")
def v2():
    # data structure will be used further on for input
    intervals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9 , 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]

    # data structure will be used further on for input
    rates = {
        0: 'Severity Rate',
        1: 'Big Dip',
        2: 'Downtick',
        3: 'Decrease',
        4: 'Flat',
        5: 'Increase',
        6: 'Uptick',
        7: 'Spike',
        8: 'All',
    }
    return render_template("v2_index.html", message = '', intervals=intervals, rates=rates, 
                        filepath='', highlights='', ipt='', start = '', end = '')

@app.route("/v2/map",  methods=['GET','POST'])
def map():
    functions = FunctionsV2()
    data = functions.map()
    return render_template("v2_index.html", intervals=data['intervals'], rates=data['rate'], filepath=data['filepath'], 
                            highlights=data['highlights'], ipt=data['ipt'], start = data['start'], end = data['end'])

@app.route("/v3")
def v3():
    functions = FunctionsV3()
    states = functions.load_states()
    features = functions.load_features()
    return render_template("v3_index.html", states=states, features=features)

@app.route("/v3/animate", methods=['GET','POST'])
def animate():
    functions = FunctionsV3()
    data = functions.animate()
    return render_template("v3_index.html", states = data['states'], features = data['features'], 
                            stateData = data['stateData'], link = data['link'], statePreview = data['statePreview'], 
                            f1 = data['f1'], f2 = data['f2'], stateList = data['stateList'])