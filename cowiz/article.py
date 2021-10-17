#!/usr/bin/python3.6
from datetime import datetime as dt
from pynytimes import NYTAPI

def __init__(self, startDate, endDate):
    self.startDate = startDate
    self.endDate = endDate

def printArticles(self, articles):
    for x in range(len(articles)):
        print("HeadLine: "+articles[x]['headline']['main']
            +", Publication Date: "+articles[x]['pub_date'][0:10]
            +", Web URL: "+articles[x]['web_url'])
        print("\n\n")

def search(self):
    nyt = NYTAPI("wbWOIDwmGPWGQALhXbfC3BDK3EMtFBMA")
    startDate=str(self.startDate)+" 00:00:00"
    endDate=str(self.endDate)+" 23:59:59"
    articles = nyt.article_search(
        query = "Covid",
        results = 10,
        dates = {
            "begin": dt.strptime(startDate,'%Y-%m-%d %H:%M:%S'),
            "end": dt.strptime(endDate,'%Y-%m-%d %H:%M:%S')
        },
        options = {
            "sort": "relevance",
            "sources": [
                "New York Times",
                "AP",
                "Reuters",
                "International Herald Tribune"
            ],

            "type_of_material": [
                "News"
            ]
        }
    )
    sorted_articles = sorted(articles, key=lambda x: dt.strptime(x['pub_date'][0:10], '%Y-%m-%d'), reverse=True)
    for x in range(len(sorted_articles)):
      sorted_articles[x]['pub_date']=dt.strptime(sorted_articles[x]['pub_date'][0:10], '%Y-%m-%d').strftime('%d-%b-%Y')
    return sorted_articles
