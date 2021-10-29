def who():

  regions = ['Global', 'United States of America', 'India', 'Brazil', 'France']

  with open('./cowiz/static/WHO.csv', 'r') as f: lines = f.read().split('\n')

  data = list()

  for l in lines:
    t = l.split(',')

    # format numbers with commas
    if t[0] in regions: 
      data.append( { 'region': t[0], 'cases': f'{int(t[2]):,}', 'deaths': f'{int(t[7]):,}' } )
      regions.pop(regions.index(t[0]))

    # don't read all the way through data if unnecessary
    if len(regions) == 0: break

  return data