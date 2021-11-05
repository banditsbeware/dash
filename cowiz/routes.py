import os
from flask import render_template, request
from cowiz import app
from cowiz.usmap import functions as U
from cowiz.graph import functions as G
from .article import covid_news
from .who import who

@app.route('/')
def index(): 
  # the names of the files in `cowiz/static/graphdata` are directly used to create
  # the buttons that the user sees on the homepage.
  locales = [ L[:-4] for L in os.listdir('./cowiz/static/graphdata') if L[0] != 'F' ]

  return render_template("index.html", who = who(), news = covid_news(), locales = locales)

@app.route("/usmap", methods=['GET', 'POST'])
def usmap():

    if request.method == "POST":
        data = U.map()
        return render_template("usmap.html",
          who = who(),
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
          who = who(),
                message    = '',
                intervals  = intervals,
                rates      = rates,
                filepath   = '',
                highlights = '',
                ipt        = '',
                start      = '',
                end        = '')

@app.route("/graph/<locale>")
def graph(locale):
  return render_template("graph.html",
          who      = who(),
          locale   = locale,
          regions  = G.load_regions(locale),
          features = G.load_features(locale))

from json import dumps
@app.route("/graph/results/<locale>", methods=['POST'])
def animate(locale):

  features = G.load_features(locale)

  return render_template("graph.html", 
    who      = who(),
    locale   = locale,
    regions  = G.load_regions(locale),
    features = G.load_features(locale),
    data     = dumps(G.graph_data(locale)),
    feature1 = features[ int(request.form['feature1']) ],
    feature2 = features[ int(request.form['feature2']) ]
  )
