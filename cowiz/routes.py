import os
from flask import render_template, request
from cowiz import app
from cowiz.usmap import functions as U
from cowiz.timeline import functions as T
from .article import covid_news
from .who import who

@app.route('/')
def index(): 
  # the names of the files in `cowiz/static/timelinedata` are directly used to create
  # the buttons that the user sees on the homepage.
  locales = [ L[:-4] for L in os.listdir('./cowiz/static/timelinedata') if L[0] != 'F' ]

  return render_template("index.html", who = who(), news = covid_news(), locales = locales)

@app.route("/usmap", methods=['GET', 'POST'])
def usmap():
  if request.method == "POST":
    data = U.map()
    return render_template("usmap.html",
      who         = who(),
      intervals   = data['intervals'],
      rates       = data['rates'],
      filepath    = data['filepath'],
      highlights  = data['highlights'],
      ipt         = data['ipt'],
      start       = data['start'],
      end         = data['end'],
      check       = data['check'])

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
      end        = ''
    )

@app.route("/timeline/<locale>")
def timeline(locale):
  return render_template("timeline.html",
    who      = who(),
    locale   = locale,
    death    = T.death(locale),
    regions  = T.load_regions(locale),
    features = T.load_features(locale)
  )

from json import dumps
@app.route("/timeline/results/<locale>", methods=['POST'])
def animate(locale):

  ipt = request.form

  user_regions = [ field for field in ipt if field not in ['feature1', 'feature2'] ]

  features = T.load_features(locale)
  user_f1 = int(ipt['feature1'])
  user_f2 = int(ipt['feature2'])

  return render_template("timeline.html", 
    who      = who(),
    locale   = locale,
    death    = T.death(locale),
    regions  = T.load_regions(locale),
    features = features,
    feature1 = features[user_f1],
    feature2 = features[user_f2],
    data     = dumps(T.get_curves(locale, user_regions, user_f1, user_f2)),
  )
