from datetime import datetime as dt
from datetime import timedelta
from pynytimes import NYTAPI
from os import getenv
from dotenv import load_dotenv; load_dotenv()

date_print_format = '%b %d, %Y'

# takes a date string like `2021-10-13T22:37:13+0000`
# and converts to `Oct 13, 2021`
def nice_date(d):
  return dt.strptime(d[0:10], '%Y-%m-%d').strftime(date_print_format)

search_options = { 
  "sort": "relevance",
  "sources": ["New York Times", "AP", "Reuters", "International Herald Tribune"],
  "type_of_material": ["News"]
}

# return a list of NYT articles about Covid from the last six weeks
def covid_news():

  nyt = NYTAPI(getenv('NYTAPI_KEY'))

  endDate   = dt.now()
  beginDate = endDate - timedelta(weeks = 6)

  articles = nyt.article_search(
    query = "Covid",
    results = 10,
    dates = { "begin": beginDate, "end": endDate },
    options = search_options
  )

  # extract date, headline, and link from search results
  articles = [
  {
    'date':     nice_date(page['pub_date']), 
    'headline': page['headline']['main'],
    'link':     page['web_url']
  } 
  for page in articles ]

  # sort articles by date
  articles = sorted(articles, key = lambda x: dt.strptime(x['date'], date_print_format), reverse=True)

  return articles
