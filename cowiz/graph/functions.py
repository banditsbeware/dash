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
      mapping = dict( [ ( ln.split(',')[0], ln.split(',')[1][:-1] ) for ln in f.readlines()] )
    return dict([(i, mapping[header[i]]) for i in range(len(header)) if header[i] in mapping]) 
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
        C[r]['f1'].append(float(l[f1]) if l[f1] else 0) # feature 1 data point
        C[r]['f2'].append(float(l[f2]) if l[f2] else 0) # feature 2 data point

  return C


# return cumulative cases and deaths for all regions in locale:
# this was accomplished in the old version by reading a file called
# "CDC-all-states.csv", which i can't for the life of me locate or
# figure out how to obtain.
def death(locale):
  return {}
