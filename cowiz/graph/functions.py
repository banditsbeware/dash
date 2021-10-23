from flask import request

def path(locale): return f'./cowiz/static/graphdata/{locale}.csv'

# Read the set of unique regions from data file
# Expects regions to be listed in the leftmost column
# Returns a list of strings
def load_regions(locale):
  regions = set() 

  with open(path(locale), 'r') as f:
    l = f.readline().split(',')[0]
    while l:
      regions.add(l)
      l = f.readline().split(',')[0]

  return sorted(list(regions))


# Read first line of data file and return a dictionary of available features
# Returns a dict { ID: name }
def load_features(locale):
  with open(path(locale), 'r') as f: header = f.readline()[:-1]
  L = [W.replace('_', ' ').title() for W in header.split(',')]
  return dict(enumerate(L[2:]))


# returns a strange data structure! 
# { region : { t : [ . . . ],         <-- dates, "YYYY-MM-DD" 
#             f1 : [ . . . ],         <-- floats
#             f2 : [ . . . ] },       <-- floats
#   region : { t : [ . . . ], 
#             f1 : [ . . . ], 
#             f2 : [ . . . ] } }
# e.g. get_curves(['Afghanistan', 'United States'], 'Total Cases', 'Total Deaths')
def get_curves(locale, regions, f1, f2):

  # initialize data structure
  C = dict()
  for r in regions:
    C[r] = dict()
    C[r]['t']  = list()
    C[r]['f1'] = list()
    C[r]['f2'] = list() 

  # read all at once
  with open(path(locale), 'r') as f: body = f.read().split('\n')

  # iterate through data and filter desired points into C
  for line in body:
    if line: 
      r = line[:line.find(',')] # line's region name
      if r in regions:
        l = line.split(',')
        C[r]['t' ].append(l[1]) # date
        C[r]['f1'].append(float(l[f1+2]) if l[f1+2] else 0) # feature 1 data point
        C[r]['f2'].append(float(l[f2+2]) if l[f2+2] else 0) # feature 2 data point

  return C

# read input form and return data to be graphed
def graph_data(locale):

  selected_regions = list()

  if request.method == "POST":
    ipt = request.form

    for field in ipt:
      if field not in ['feature1', 'feature2']: selected_regions.append(ipt[field])

    feature1 = int(ipt['feature1'])
    feature2 = int(ipt['feature2'])

  return get_curves(locale, selected_regions, feature1, feature2)    
