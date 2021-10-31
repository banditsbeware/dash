// factory function for DataSet objects
let DataSet = (xarr, yarr, side, color) => {

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
    color: color,
    graphed: false,
    side: side
  }
}

let Dash = class {

  constructor(divID, vw, title1, title2, legend) {

    let p = 10;               // padding
    let gw = (vw - p)/2;      // graph width
    let gh = 0.75 * gw;       // graph height

    this.container = $(`#${divID}`);
    this.container.css({
      'font-size': '16px',
      'width': '100%',
      'margin-top': '20px',
      'position': 'relative',
      'display': 'grid',
      'grid-template-rows': `${3*p}px ${3*p}px ${gh}px ${3*p}px ${3*p}px ${3*p}px`,
      'grid-template-columns': `${gw}px ${gw}px`,
      'grid-gap': `${p}px`,
      'user-select': 'none'
    });

    this.container.append(`<span id='${divID}-title1' style='grid-row: 2; grid-column: 1'>${title1}</span>`);
    this.container.append(`<span id='${divID}-title2' style='grid-row: 2; grid-column: 2'>${title2}</span>`);
    this.container.append(`<div id='${divID}lg' class='lift noscroll' style='grid-row: 3; grid-column: 1'></div>`);
    this.container.append(`<div id='${divID}rg' class='lift noscroll' style='grid-row: 3; grid-column: 2'></div>`);
    this.container.append(`<div id='${divID}b' style='grid-row: 5; grid-column: 1 / 3'></div>`);

    $(`#${divID} span`).css({
      'font-weight': 'bold',
      'align-self': 'end', 
      'pointer-events': 'none'
    });
    $(`#${divID} #${divID}lg`).css({
      'width': `${gw}px`, 'height': `${gh}px`,
      'overflow': 'hidden',
      'max-width': '100%',
      'box-shadow': '3px 3px 3px 3px gray'
    });
    $(`#${divID} #${divID}rg`).css({
      'width': `${gw}px`, 'height': `${gh}px`,
      'overflow': 'hidden',
      'box-shadow': '3px 3px 3px 3px gray'
    });
    $(`#${divID} #${divID}b`).css({
      'width': '100%', 'height': `${1.5 * p}px`,
      'overflow': 'hidden',
    });
    $(`#${divID} div`).css({'position': 'absolute', 'scrollbar-width': 'none'});
    $(`#${divID} div::-webkit-scrollbar`).css('display', 'none');

    this.LG = new Graph(`${divID}lg`);
    this.RG = new Graph(`${divID}rg`);
    this.B  = new Bar(`${divID}b`);
    this.B.parent = this;

    this.data = [];
    this.normdata = [];

    this.xvis = 1;  // the portion of the x-axis currently visible
    this.ow   = gw; // outer width always represents 'div' or 'view' width (what user sees)
    this.cw   = gw; // canvas width represents the underlying canvas, which hangs off underneath the div
    this.ch   = gh; // the actual height of the canvas
  }

  // push a dataset onto the dashboard
  push(ds) {

    this.data.push(ds);
    let dw = this.dataWidth();

    this.xvis = this.ow / dw;

    // adjust canvas width to fit wide data
    if (dw > this.cw) {
      this.LG.setw(dw);
      this.RG.setw(dw);
      this.cw = dw;
    }

    // construct normalized dataset y' = <canvas height> * (y - min) / (max - min)
    this.normdata = [];
    for (let d of this.data) {
      let normy = d.y.map( y => this.ch * (y - this.floor(d.side)) / this.dataHeight(d.side));
      this.normdata.push( DataSet( d.x, normy, d.side, d.color ) );
    }
  }

  set xlbl(x) { this._xlbl = x };
  get xlbl() { return this._xlbl; }

  drawData(xoff=0) {
    this.clear();
    let f1 = this.floor(1), h1 = this.dataHeight(1), 
        f2 = this.floor(2), h2 = this.dataHeight(2);
    this.LG.grid(this.xlbl, xoff, f1, f1 + h1, Math.abs(f1 * this.ch / h1)); 
    this.RG.grid(this.xlbl, xoff, f2, f2 + h2, Math.abs(f2 * this.ch / h2)); 

    for (let ds of this.normdata) {
      if (ds.side === 1) this.LG.draw(ds);
      if (ds.side === 2) this.RG.draw(ds);
    }
    this.B.setWidth();
  }

  // scroll both graphs; `a` expected to be in the range [0, 1]
  scroll(a) {
    let sp = a * (this.cw - this.ow);
    this.LG.div.scrollLeft(sp);
    this.RG.div.scrollLeft(sp);
    this.drawData(sp);
  }

  // the width of the widest dataset
  dataWidth = () => Math.ceil(Math.max(... this.data.map(d => d.R - d.L)));

  // the height of the tallest dataset on `side` (1 or 2)
  dataHeight = (side) => Math.ceil(Math.max(... 
    this.data.filter(d => d.side === side).map(d => d.T - this.floor(side))));

  // the lowest value on graph `side` (1 or 2)
  floor = (side) => Math.floor(Math.min(0, ... 
    this.data.filter(d => d.side === side).map(d => d.B)));

  // empty all visuals from graphs
  clear() {
    for (let ds of this.normdata) ds.graphed = false;
    this.LG.clear();
    this.RG.clear();
  }

  legend(L) {
    let str = '';
    for (let i of L) { str += `<span class='legend-dot' style='background-color:${i[1]}'></span><span>${i[0]}</span>` }
    this.container.append(`<span style='grid-row: 1; grid-column: 1 / 3'>${str}</span>`);
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
    this.obar.css('background-color', '#bbb')
    this.ibar = $(`#${barID}-ibar`);
    this.ibar.css({
      'height': `${this.obar.css('height')}`,
      'position': 'absolute',
      'background': '#ddd',
      'border-radius': '30%'
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

    this.cw = parseInt(this.div.css('width'));    // canvas width
    this.ch = parseInt(this.div.css('height'));   // canvas height

    // add <canvas> to the main <div>
    this.div.append(`<canvas id="${graphID}-cvs" height="${this.ch}" width="${this.cw}"></canvas>`);

    // create internal <canvas> object
    this.cvs = $(`#${graphID} #${graphID}-cvs`);

    // obtain the new canvas's context
    this.ctx = this.cvs[0].getContext('2d');
  }

  // plot a dataset
  draw(ds) {
    if (!ds.graphed) {
      this.ctx.strokeStyle = ds.color;
      this.ctx.beginPath();
      this.ctx.strokeWidth = 10;
      this.ctx.moveTo(ds.x[0], this.ch - ds.y[0]);

      for (let p = 1; p < ds.n; p++) this.ctx.lineTo(ds.x[p], this.ch - ds.y[p]);

      this.ctx.stroke();
      ds.graphed = true;
    }
  }

  setw(w) { this.cw = w; this.cvs.attr('width', w); }

  clear() { this.ctx.clearRect(0, 0, this.cw, this.ch); }

  // draw the grid
  grid(xlbl, xoff, ymin, ymax, zero) {

    // number of horizontal gridlines
    let yGrain = 8;

    this.ctx.strokeStyle = '#D0D0D0';
    this.ctx.strokeWidth = 1;
    this.ctx.font = 'bold 16px monospace';
    this.ctx.fillStyle = 'grey';

    let dx = Math.floor(this.cw / xlbl.length);

    let ylbl = [], lat;
    for (let i = ymin; i < ymax; i += (ymax - ymin) / yGrain) ylbl.push(Math.floor(i));
    for (let i = 1; i < yGrain; i++) {
      lat = this.ch * (1 - i / yGrain);
      this.ctx.beginPath();
      this.ctx.moveTo(0, lat);
      this.ctx.lineTo(this.cw, lat)
      this.ctx.stroke();
      this.ctx.fillStyle = 'black';
      this.ctx.fillText(ylbl[i], xoff, lat);
    }

    for (let i in xlbl) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * dx, 0);
      this.ctx.lineTo(i * dx, this.ch);
      this.ctx.stroke();
      this.ctx.fillText(xlbl[i], i * dx, this.ch - 10);
    }

    // draw a dark line at zero
    this.ctx.strokeStyle = '#303030';
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.ch - zero);
    this.ctx.lineTo(this.cw, this.ch - zero);
    this.ctx.stroke();
  }
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// random integer in the range [min, max)
const randInt = (min, max) => min + Math.floor((Math.random() * (max - min)));

// a list of n random integers, each picked from [min, max)
let randList = (n, min, max) => {
  let r = [];
  for (let i=0; i<n; i++) r.push(randInt(min, max));
  return r;
}

const randColor = () => {
  let s = '#';
  for (let i=0; i<6; i++) s += ((Math.random() * 16 | 0)).toString(16);
  return s
}