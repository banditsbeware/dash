from flask import request
from os.path import exists

def path(locale): return f'./cowiz/static/graphdata/{locale}.csv'

# Read the set of unique regions from data file
# Expects regions to be listed in the leftmost column
# Returns a list of strings
def load_regions(locale):
  with open(path(locale), 'r') as f: L = f.readlines()
  return sorted( list( set( [l[:l.find(',')] for l in L[1:]] ) ) )


# Read first line of data file and return a dictionary of available features
# Returns a dict { ID: name }
def load_features(locale):
  with open(path(locale), 'r') as f: header = f.readline()[:-1].split(',')

  # if a feature name mapping exists, convert to preferred names
  if exists(path(f'F_{locale}')):
    with open(path(f'F_{locale}'), 'r') as f: 
      mapping = dict( [ ( ln.split(',')[0], ln.split(',')[1] ) for ln in f.readlines()] )
    return dict( enumerate( [ mapping[h] for h in header if h in mapping ] ) ) 
  else: 
    return dict( enumerate ( header ) )


# e.g. get_curves('WORLD', ['Afghanistan', 'United States'], 0, 1)
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
