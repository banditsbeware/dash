from flask import render_template, redirect, request, url_for, session, flash
import requests
from v2.forms import InputForm
from datetime import datetime, timedelta
from v2.article_search import ArticleSearch
from flask import Flask
from v2 import app
from v2.map_test import map_test

intervals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9 , 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]

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

check = {
    'period': 1,
    'startDate': 1,
    'endDate': 1,
    'interval': 1,
}

@app.route("/")
def index():
    inputForm = InputForm()
    check_return_to_default()
    print(1)
    return render_template("index.html", form = inputForm, message = '', intervals=intervals, rates=rates, check=check, filepath='', highlights='', ipt='', start = '', end = '')

@app.route("/map", methods=['GET','POST'])
# @app.route("/map/<index>", methods=['GET', 'POST'])
def map():
    correctInput = True
    inputForm = InputForm()
    message = ''
    highlights=''

    if request.method == "POST":
        ipt = request.form
        periodLength = ipt['periodLength']
        start_of_startDate = ipt['start_of_startDate']
        
        start_of_endDate = ipt['start_of_endDate']

        interval = ipt['interval']
        
        # if (int(periodLength) == 1):
        #     correctInput = False
        #     check['period'] = 0
        # if (start_of_startDate == ''):
        #     correctInput = False
        #     check['startDate'] = 0
        # if (start_of_endDate == ''):
        #     correctInput = False 
        #     check['endDate'] = 0
        # if (int(interval) == -1):
        #     correctInput = False
        #     check['interval'] = 0
        
        # if not correctInput:
        #     message = "Empty Fields"
        #     print(ipt)
        #     return render_template("index.html", form = inputForm, message = message, intervals=intervals, rates=rates, check=check, filepath='', highlights=highlights, ipt=ipt)

        start_of_startDate = datetime.strptime(start_of_startDate, '%Y-%m-%d')
        end_of_startDate = start_of_startDate.date() + timedelta(days=int(periodLength)-1)
        # print(end_of_startDate)
        
        

        start_of_endDate = datetime.strptime(start_of_endDate, '%Y-%m-%d')
        end_of_endDate = start_of_endDate.date() + timedelta(days=int(periodLength)-1)
        
        

        # if end_of_startDate > start_of_endDate.date():
        #     message = 'Periods cannot overlap!'
        #     check['endDate'] = 0
        #     check['startDate'] = 0
        #     print(ipt)
        #     return render_template("index.html", form = inputForm, message = message, intervals=intervals, rates=rates, check=check, filepath='', highlights=highlights, ipt=ipt)    
	
    articles = ArticleSearch(start_of_endDate.date(), end_of_endDate)
    highlights = articles.search()	

    end_of_startDate_strip = str(end_of_startDate).split('-')
    # print(end_of_startDate_strip)
    x = datetime(int(end_of_startDate_strip[0]), int(end_of_startDate_strip[1]), int(end_of_startDate_strip[2]))
    end_of_startDate = x.strftime("%d-%b-%Y")

    end_of_endDate_strip = str(end_of_endDate).split('-')
    x = datetime(int(end_of_endDate_strip[0]), int(end_of_endDate_strip[1]), int(end_of_endDate_strip[2]))
    end_of_endDate = x.strftime("%d-%b-%Y")


    start_of_startDate_strip = str(start_of_startDate.date()).split('-')
    x = datetime(int(start_of_startDate_strip[0]), int(start_of_startDate_strip[1]), int(start_of_startDate_strip[2]))
    start_of_startDate = x.strftime("%d-%b-%y").upper()

    start_of_endDate_strip = str(start_of_endDate.date()).split('-')
    x = datetime(int(start_of_endDate_strip[0]), int(start_of_endDate_strip[1]), int(start_of_endDate_strip[2]))
    start_of_endDate = x.strftime("%d-%b-%y").upper()

    endDates = {
        'start': end_of_startDate,
        'end': end_of_endDate
    }
    # print(endDates)
    
    gen_map = map_test(periodLength, start_of_startDate, start_of_endDate, interval)
    key = gen_map.main()
    maphash = gen_map.get_maphash()
    returned_map = maphash[key]
    filepath = "maps/Cases-" + start_of_startDate + "vs" + start_of_endDate + "-intDays" + periodLength + "/" + returned_map
    #filepath=''    
    check_return_to_default()
    if endDates['start']:
        return render_template("index.html", form = inputForm, message = message, intervals=intervals, rates=rates, check=check, filepath=filepath, highlights=highlights, ipt=ipt, start = endDates['start'], end=endDates['end'])




# helper function beyond this point
def check_return_to_default():
    check['period'] = 1
    check['startDate'] = 1
    check['endDate'] = 1
    check['interval'] = 1



# api functions beyond this point

if __name__ == "__main__":
    app.run( debug=True)
