from flask import request

# Abhishek's data file
# TODO: update regularly from journalistic source
datapath = 'static/example_data.csv'


# Read the set of unique regions from data file
# Expects regions to be listed in the leftmost column
# Returns a list of strings
def load_regions():
  states = set() 

  with open(datapath, 'r') as f:
    l = f.readline().split(',')[0]
    while l:
      states.add(l)
      l = f.readline().split(',')[0]

  return sorted(list(states))


# Read first line of data file and return a disctionary of available features
# Returns a dict { ID: name }
def load_features():
  with open(datapath, 'r') as f: header = f.readline()[:-1]
  L = [W.replace('_', ' ').title() for W in header.split(',')]
  return dict(enumerate(L))


# returns a strange data structure! 
# { region : { t : [ . . . ], 
#             f1 : [ . . . ], 
#             f2 : [ . . . ] },
#   region : { t : [ . . . ], 
#             f1 : [ . . . ], 
#             f2 : [ . . . ] } }
# e.g. get_curves(['Afghanistan', 'United States'], 'Total Cases', 'Total Deaths')
def get_curves(regions, f1, f2):

  # initialize data structure
  C = dict()
  for r in regions:
    C[r] = dict()
    C[r]['t']  = list()
    C[r]['f1'] = list()
    C[r]['f2'] = list()

  # read all at once
  with open(datapath, 'r') as f: body = f.read().split('\n')

  # iterate through data and filter desired points into C
  for line in body:
    l = line.split(','); region = l[0]
    if region in regions:
      C[region]['t' ].append(l[1]) # date
      C[region]['f1'].append(float(l[f1])) # feature 1 data point
      C[region]['f2'].append(float(l[f2])) # feature 2 data point

  return C

# read input form and return data to be graphed
def graph_data():

  # load the states.csv file into this dict variable | format: {state: abbreviation}
  regions = load_regions()

  # loads the feature in to this dict variable | format: {feature id: feature name}
  features = load_features()

  # initialize stateList as an empty list; will contain the states (full name)
  # which the user(s) selected to view
  selected_regions = list()

  # called if function called with POST API
  if request.method == "POST":

    ipt = request.form

    for field in ipt:
      if field not in ['feature1', 'feature2']: selected_regions.append(ipt[field])

    feature1 = int(ipt['feature1']) # feature1 contains feature1 info | format: {feature id: feature name}
    feature2 = int(ipt['feature2']) # feature2 contains feature2 info | format: {feature id: feature name}

  return get_curves(selected_regions, feature1, feature2)    
