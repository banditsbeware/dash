// factory function for DataSet objects
let DataSet = (xarr, yarr, side, name, color) => {

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
    name: name,
    color: color,
    show: true,
    side: side
  }
}

let Dash = class {

  constructor(divID, vw, title1, title2) {

    let p = 10;                              // padding
    let gw = (vw - p)/2;                     // graph width
    let gh = Math.min(0.75 * gw, 600);       // graph height

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
    this.container.append(`<div id='${divID}lg' style='grid-row: 3; grid-column: 1'></div>`);
    this.container.append(`<div id='${divID}rg' style='grid-row: 3; grid-column: 2'></div>`);
    this.container.append(`<div id='${divID}b' style='grid-row: 5; grid-column: 1 / 3'></div>`);

    $(`#${divID} span`).css({
      'font-weight': 'bold',
      'align-self': 'end', 
      'pointer-events': 'none'
    });
    $(`#${divID} #${divID}lg`).css({
      'width': `${gw}px`, 'height': `${gh}px`,
      'overflow': 'hidden',
      'cursor': 'none'
    });
    $(`#${divID} #${divID}rg`).css({
      'width': `${gw}px`, 'height': `${gh}px`,
      'overflow': 'hidden',
      'cursor': 'none'
    });
    $(`#${divID} #${divID}b`).css({
      'width': '100%', 'height': `${3 * p}px`,
      'overflow': 'hidden',
    });
    $(`#${divID} div`).css({'position': 'absolute', 'scrollbar-width': 'none'});
    $(`#${divID} div::-webkit-scrollbar`).css('display', 'none');

    this.LG = new Graph(`${divID}lg`);
    this.RG = new Graph(`${divID}rg`);
    this.B  = new Bar(`${divID}b`);

    this.LG.parent = this; this.LG.ownSide = 1;
    this.RG.parent = this; this.RG.ownSide = 2;
    this.B.parent = this;

    this.data = [];
    this.normdata = [];

    this.xoff = 0;  // pixels of canvas to the left of the visible window
    this.xvis = 1;  // the portion of the x-axis currently visible
    this.ow   = gw; // outer width always represents 'div' or 'view' width (what user sees)
    this.cw   = gw; // canvas width represents the underlying canvas, which hangs off underneath the div
    this.ch   = gh; // the actual height of the canvas

    this.cx = -1;   // mouse position relative to graph
    this.cy = -1;

    this.mouseIn = false;

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
      let f = this.floor(d.side), h = this.dataHeight(d.side);
      let normy = d.y.map( y => Math.floor(this.ch * (y - f) / h));
      this.normdata.push( DataSet( d.x, normy, d.side, d.name, d.color ) );
    }
  }

  set xlbl(x) { this._xlbl = x };
  get xlbl() { return this._xlbl; }

  update() {
    this.clear();
    let f1 = this.floor(1), h1 = this.dataHeight(1), 
        f2 = this.floor(2), h2 = this.dataHeight(2);

    this.LG.grid(this.xlbl, this.xoff, f1, f1 + h1, Math.abs(f1 * this.ch / h1)); 
    this.RG.grid(this.xlbl, this.xoff, f2, f2 + h2, Math.abs(f2 * this.ch / h2)); 

    for (let ds of this.normdata) {
      if (ds.side === 1) this.LG.draw(ds);
      if (ds.side === 2) this.RG.draw(ds);
    }

    if (this.cx >= 0 && this.cy >= 0) {
      this.LG.crosshair(this.cx, this.cy);
      this.RG.crosshair(this.cx, this.cy);

      // find the point out of all datasets that is closest to mouse position
      let m = this.ch**2, v, di, dj;
      for (let i = 0; i < this.data.length; i++) {

        if (this.data[i].side == this.mouseIn && this.normdata[i].show) {
          let nd = this.normdata[i];

          for (let j = 0; j < nd.n; j++) {
            v = Math.sqrt((this.cx - nd.x[j])**2 + (this.cy - this.ch + nd.y[j])**2);
            if (v < m) { m = v; di = i; dj = j; }
          }
        }
      }

      if (m < 50) {
        let d = this.data[di], nd = this.normdata[di];
        let lbl = { 
          name: d.name, 
          date: null, 
          value: d.y[dj].toLocaleString('en-US'), 
          color: d.color,
          p: { 
            x0: d.x[dj], y0: this.ch-nd.y[dj],
            x1: this.cx, y1: this.cy
          } 
        }

        if (this.mouseIn == 1) { this.LG.label(lbl); }
        if (this.mouseIn == 2) { this.RG.label(lbl); }
      }
    }

    this.B.setWidth();
  }

  // scroll both graphs; `a` expected to be in the range [0, 1]
  scroll(a) {
    this.xoff = a * (this.cw - this.ow);
    this.LG.div.scrollLeft(this.xoff);
    this.RG.div.scrollLeft(this.xoff);
    this.update();
  }

  // the width of the widest dataset
  dataWidth = () => Math.ceil(Math.max(... this.data.map(d => d.R - d.L)));

  // the height of the tallest dataset on `side` (1 or 2)
  dataHeight = (side) => intCeil(1.1*Math.max(... 
    this.data.filter(d => d.side === side).map(d => d.T - this.floor(side))));

  // the lowest value on graph `side` (1 or 2)
  floor = (side) => Math.floor(Math.min(0, ... 
    this.data.filter(d => d.side === side).map(d => d.B)));

  // empty all visuals from graphs
  clear() {
    this.LG.clear();
    this.RG.clear();
  }

  legend(L) {
    let lg = $(`<span style='grid-row: 1; grid-column: 1 / 3'></span>`);
    for (let i of L) { 
      let lgi = $(`<span></span>`);
      lgi.append(`<span class='legend-dot' style='background-color:${i[1]}'></span>`);
      lgi.append(`<span>${i[0]}</span>`);
      lgi.on('click', (e) => {
        this.normdata.filter(d => d.color === i[1]).map(d => d.show = !d.show);
        this.update();
      });
      lg.append(lgi);
    }
    this.container.append(lg);
  }
}

let Bar = class {

  constructor(barID) {

    // set to the Dash object to which this Bar belongs
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
    this.parent;
    this.ownSide;
    this.id = graphID;

    this.div = $(`#${graphID}`);
    this.div.css('overflow', 'hidden');

    this.cw = parseInt(this.div.css('width'));    // canvas width
    this.ch = parseInt(this.div.css('height'));   // canvas height

    // add <canvas> to the main <div>
    this.div.append(`<canvas id="${graphID}-cvs" height="${this.ch}" width="${this.cw}"></canvas>`);

    // create internal <canvas> object
    this.cvs = $(`#${graphID} #${graphID}-cvs`);
    this.cvs.on('mousemove', (e) => {
      this.parent.mouseIn = this.ownSide;
      this.parent.cx = e.offsetX;
      this.parent.cy = e.offsetY;
      this.parent.update();
    });
    this.cvs.on('mouseleave', () => {
      this.parent.mouseIn = false;
      this.parent.cx = -1;
      this.parent.cy = -1;
      this.parent.update();
    });

    // obtain the new canvas's context
    this.ctx = this.cvs[0].getContext('2d');
  }

  // plot a dataset
  draw(ds) {
    if (ds.show) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = ds.color;
      this.ctx.lineWidth = 3;
      this.ctx.moveTo(ds.x[0], this.ch - ds.y[0]);

      for (let p = 1; p < ds.n; p++) this.ctx.lineTo(ds.x[p], this.ch - ds.y[p]);

      this.ctx.stroke();
    }
  }

  setw(w) { this.cw = w; this.cvs.attr('width', w); }

  clear() { this.ctx.clearRect(0, 0, this.cw, this.ch); }

  crosshair(x, y) {
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#A0A0A0';
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(0, y); this.ctx.lineTo(this.cw, y);
    this.ctx.moveTo(x, 0); this.ctx.lineTo(x, this.ch);
    this.ctx.stroke();
  }

  label(lbl) {
    let lh = 20, width;
    this.ctx.save();
    this.ctx.font = 'normal 18px Serif';

    // line from crosshair to point on dataset
    this.ctx.beginPath();
    this.ctx.moveTo(lbl.p.x0, lbl.p.y0);
    this.ctx.lineTo(lbl.p.x1, lbl.p.y1);
    this.ctx.stroke();

    // dot on point on dataset
    this.ctx.beginPath();
    this.ctx.fillStyle = lbl.color;
    this.ctx.arc(lbl.p.x0, lbl.p.y0, 6, 0, 2*Math.PI, true);
    this.ctx.fill();

    // 'name' label
    width = this.ctx.measureText(lbl.name).width;
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(lbl.p.x1, lbl.p.y1 - 2*lh, width, lh);
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(lbl.name, lbl.p.x1, lbl.p.y1-lh-5);

    // 'value' label
    width = this.ctx.measureText(lbl.value).width;
    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(lbl.p.x1, lbl.p.y1 - lh, width, lh);
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(lbl.value, lbl.p.x1, lbl.p.y1-5);
    this.ctx.restore();
  }

  // draw the grid
  grid(xlbl, xoff, ymin, ymax, zero) {

    // number of horizontal gridlines
    let yGrain = 8;

    this.ctx.strokeStyle = '#D0D0D0';
    this.ctx.lineWidth = 1;
    this.ctx.font = 'bold 16px monospace';

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

const intCeil = (x) => {
  let p = Math.floor(Math.log10(x)) - 1;
  return Math.ceil( x / (10**p) ) * 10**p;
}

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
