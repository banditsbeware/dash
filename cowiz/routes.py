from flask import render_template, request
from cowiz import app
from cowiz.usmap import functions as U
from cowiz.graph import functions as G
from .article import covid_news

@app.route('/')
def index(): return render_template("index.html", news = covid_news())

@app.route("/usmap", methods=['GET', 'POST'])
def usmap():

    if request.method == "POST":
        data = U.map()
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
  # set DATAPATH here depending on whether the user clicked 'US', 'India', etc
  # ... then graph/functions.py will load the corresponding CSV file
  return render_template("graph.html",
          news     = covid_news(),
          regions  = G.load_regions(),
          features = G.load_features())

from json import dumps
@app.route("/graph/animate", methods=['POST'])
def animate():
  features = G.load_features()
  return render_template("graph.html", 
    data     = dumps(G.graph_data()),
    feature1 = features[ int(request.form['feature1']) ],
    feature2 = features[ int(request.form['feature2']) ]
  )
