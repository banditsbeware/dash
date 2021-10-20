// factory function for DataSet objects
let DataSet = (xarr, yarr, side) => {

  if (xarr.length !== yarr.length)
    throw 'DataSet error: x & y lists are different sizes';

  if (side !== 1 && side !== 2)
    throw 'DataSet error: side must be 1 or 2';

  return {
    x: xarr,              // x-values
    y: yarr,              // y-values
    n: xarr.length,       // number of points
    L: Math.min(...xarr), // left x
    R: Math.max(...xarr), // right x
    B: Math.min(...yarr), // bottom y
    T: Math.max(...yarr), // top y
    color: '',
    name: '',
    graphed: false,
    side: side
  }
}

let Dash = class {

  constructor(divID, gw, gh, p) {

    this.container = $(`#${divID}`);
    this.container.css({
      'width': `${2 * gw + p}px`,
      'height': `${gh + 2 * p}px`,
      'padding': `${p}px`,
      'position': 'relative',
      'margin': 'auto',
      'display': 'block'
    });

    // left graph, right graph, and scrollbar
    this.container.append(`<div id='${divID}lg' class='lift noscroll'></div>`);
    this.container.append(`<div id='${divID}rg' class='lift noscroll'></div>`);
    this.container.append(`<div id='${divID}b'></div>`);

    $(`#${divID} #${divID}lg`).css({
      'background': 'white',
      'width': `${gw}px`,
      'height': `${gh}px`
    });
    $(`#${divID} #${divID}rg`).css({
      'background': 'white',
      'width': `${gw}px`,
      'height': `${gh}px`,
      'left': `${gw + 2 * p}px`
    });
    $(`#${divID} #${divID}b`).css({
      'width': `${2 * gw + p}px`,
      'height': `${p + 5}px`,
      'top': `${gh + 2 * p}px`,
      'overflow': 'hidden',
      'box-sizing': 'border-box'
    });
    $(`#${divID} div`).css('position', 'absolute');
    $(`#${divID} div`).css('scrollbar-width', 'none');
    $(`#${divID} div::-webkit-scrollbar`).css('display', 'none');

    this.LG = new Graph(`${divID}lg`);
    this.RG = new Graph(`${divID}rg`);
    this.B  = new Bar(`${divID}b`);
    this.B.parent = this;

    this.data = [];
    this.normdata = [];

    this.xvis = 1;
    this.ow   = gw;
    this.cw   = gw;
    this.ch   = gh;
    this.floor = 0;
    this.sf = 1.0;
  }

  // push a dataset onto the dashboard
  push(ds) {
    this.data.push(ds);
    let dw = this.dataWidth();
    let dh = this.dataHeight();

    this.floor = Math.floor(Math.min(this.floor, ... this.data.map(d => d.B)));

    this.xvis = this.ow / dw;

    // adjust canvas width to fit wide data
    if (dw > this.cw) {
      this.LG.setw(dw);
      this.RG.setw(dw);
      this.cw = dw;
    }

    // construct normalized dataset y' = <canvas height> * (y - min) / (max - min)
    this.normdata = [];
    for (let d of this.data)
      this.normdata.push( DataSet( d.x, d.y.map( y => this.ch * (y - this.floor) / dh), d.side ) );

    console.log(Math.max(... this.normdata.map(d => d.T)))
  }

  drawData() {
    this.clear();
    this.LG.grid(); 
    this.RG.grid(); 

    for (let ds of this.normdata) {
      if (ds.side === 1) this.LG.draw(ds);
      if (ds.side === 2) this.RG.draw(ds);
    }
    this.B.setWidth();
  }

  // scroll both graphs; a expected to be in the range [0, 1]
  scroll(a) {
    this.LG.div.scrollLeft(a * (this.cw - this.ow));
    this.RG.div.scrollLeft(a * (this.cw - this.ow));
  }

  // the width of the widest dataset
  dataWidth = () => Math.ceil(Math.max(... this.data.map(d => d.R - d.L)));

  // the height of the tallest dataset (including the floor!)
  dataHeight = () => Math.ceil(Math.max(... this.data.map(d => d.T - this.floor)));

  // empty all visuals from graphs
  clear() {
    for (let ds of this.normdata) ds.graphed = false;
    this.LG.clear();
    this.RG.clear();
  }
}

let Bar = class {

  constructor(barID) {

    // set to the Graph object to which this Bar belongs
    this.parent;

    this.obar = $(`#${barID}`);
    this.ow = parseInt(this.obar.css('width'));
    this.iw;

    // create and append inner (draggable) bar
    this.obar.append(`<div id='${barID}-ibar'></div>`);
    this.obar.css('background-color', '#CCC')
    this.ibar = $(`#${barID}-ibar`);
    this.ibar.css({
      'height': `${this.obar.css('height')}`,
      'position': 'absolute',
      'background': '#EEEEEE'
    });

    this.dib = document.getElementById(`${barID}-ibar`);
    this.dib.onmousedown = this.startDrag;
    this.x0, this.x;

  }

  setWidth = () => {
    this.iw = this.parent.xvis * this.ow;
    this.ibar.css('width', `${this.iw}px`);
  }

  startDrag = (e) => {
    this.x0 = e.clientX;
    document.onmouseup = this.stopDrag;
    document.onmousemove = this.doDrag;
  }

  doDrag = (e) => {
    this.x = this.x0 - e.clientX;
    this.x0 = e.clientX;
    let d = this.dib.offsetLeft - this.x;
    if (d >= 0 && d + this.iw <= this.ow) {
      this.dib.style.left = this.dib.offsetLeft - this.x + "px"
      // parameter has range 0 to 1; mapped to appropriate scroll value in parent.scroll
      this.parent.scroll(this.dib.offsetLeft / (this.ow - this.iw));
    }
  }

  stopDrag = (e) => {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

let Graph = class {

  constructor(graphID) {
    this.id = graphID;

    // select the <div>
    this.div = $(`#${graphID}`);
    this.div.css('overflow', 'hidden');

    let divw = parseInt(this.div.css('width'));
    let divh = parseInt(this.div.css('height'));

    // add <canvas> to the main <div>
    this.div.append(`<canvas id="${graphID}-cvs" height="${divh}" width="${divw}"></canvas>`);

    // create internal <canvas> object
    this.cvs = $(`#${graphID} #${graphID}-cvs`);

    // obtain the new canvas's context
    this.ctx = this.cvs[0].getContext('2d');

    this.w = divw;     // view width
    this.cw = divw;    // canvas width
    this.ch = divh;    // canvas height
    this.xvis = 1;     // fraction of x which is visible
  }

  // plot a dataset
  draw(ds) {
    if (!ds.graphed) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = randColor();
      this.ctx.moveTo(ds.x[0], this.ch - ds.y[0]);

      for (let p = 1; p < ds.n; p++) 
        this.ctx.lineTo(ds.x[p], this.ch - ds.y[p]);

      this.ctx.stroke();
      ds.graphed = true;
    }
  }

  setw(w) { this.cw = w; this.cvs.attr('width', w); }

  clear() { this.ctx.clearRect(0, 0, this.cw, this.ch); }

  // draw the grid
  grid() {

    this.ctx.strokeStyle = '#e5e3e6';
    this.ctx.strokeWidth = 5;

    let d = 10;
    let dx = Math.floor(this.cw / d);
    let dy = Math.floor(this.ch / d);

    for (let i = 0; i < d; i++) {
      this.ctx.beginPath();

      this.ctx.moveTo(i * dx, this.ch);
      this.ctx.lineTo(i * dx, 0);

      this.ctx.moveTo(0, i * dy);
      this.ctx.lineTo(this.cw, i * dy);

      this.ctx.stroke();
    }

    if (this.floor < 0) {
      this.ctx.strokeStyle = '#303030';
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.ch + this.floor);
      this.ctx.lineTo(this.cw, this.ch + this.floor);
      this.ctx.stroke();
    }
  }
}

// n evenly spaced numbers over the interval [start, stop)
const linspace = (start, stop, n) => {
  let step = (stop - start) / n;
  let arr = [];
  for (let i = start; i < stop; i += step) arr.push(i);

  // for large n, rounding may cause an extra item; slice() trims arr to length n
  return arr.slice(0, n);
}

// some colors to choose from
const colorList = ['#a288e3', '#006e90', '#c08497', '#363537','#ef2d56','#8cd867','#2fbf71','#053225','#4adbc8'];

// random integer in the range [min, max)
const randInt = (min, max) => min + Math.floor((Math.random() * (max - min)));

// a list of n random integers, each picked from [min, max)
let randList = (n, min, max) => {
  let r = [];
  for (let i=0; i<n; i++) r.push(randInt(min, max));
  return r;
}

const randColor = () => colorList[randInt(0, colorList.length)];
