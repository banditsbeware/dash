# Packages required for all versions of the project
from os import path
from flask import render_template, redirect, request, url_for, session, flash
import requests
from datetime import datetime, timedelta
from flask import Flask
from . import app
from .usmap.functions import FunctionsV2
# from .v2 import functions as M
from .graph import functions as G

import json

@app.route('/')
def index(): return render_template("index.html")

@app.route("/usmap", methods=['GET', 'POST'])
def usmap():

    if request.method == "POST":
        functions = FunctionsV2()
        data = functions.map()
        return render_template("usmap.html",
                               intervals=data['intervals'],
                               rates=data['rates'],
                               filepath=data['filepath'],
                               highlights=data['highlights'],
                               ipt=data['ipt'],
                               start=data['start'],
                               end=data['end'],
                               check=data['check'])

    else:
        # data structure will be used further on for input
        intervals = list(range(1, 31))

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
        return render_template("usmap.html",
                message    = '',
                intervals  = intervals,
                rates      = rates,
                filepath   = '',
                highlights = '',
                ipt        = '',
                start      = '',
                end        = '')

@app.route("/graph")
def graph():
    return render_template("graph.html",
            regions  = G.load_regions(),
            features = G.load_features())

@app.route("/graph/animate", methods=['POST'])
def animate():
    return render_template("graph.html",
            regions   = G.load_regions(),
            features  = G.load_features(),
            data      = json.dumps(G.graph_data()))
