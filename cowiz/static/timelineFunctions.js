// factory function for DataSet objects
let DataSet = (xarr, yarr, dates, side, name, color) => {

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
    dates: dates,
    name: name,
    color: color,
    show: true,
    side: side
  }
}

let Dash = class {

  constructor(divID, vw, vh, title1, title2) {

    let p = 10;                              // padding
    let leg = 60;                            // legend width
    let gw = ((vw - p)/2 - (2 * leg));       // graph width
    let gh = vh - (5 * (3 * p));             // graph height

    // graph size (gw x gh) is calculated assuming that vw and vh
    // are the size of the total space available for the dashboard;
    // space for scrollbar & legends is subtracted off

    this.id = divID;
    this.f1 = title1;
    this.f2 = title2;

    this.container = $(`#${divID}`);
    this.container.css({
      'font-size': '16px',
      'width': `${vw}px`,
      'position': 'relative',
      'display': 'grid',    
      'grid-template-rows': `${3*p}px ${3*p}px ${gh}px ${3*p}px ${3*p}px ${3*p}px`,
      'grid-template-columns': `1fr ${leg}px ${gw}px ${leg}px ${gw}px 1fr`,
      'user-select': 'none'
    });

    this.container.append(`<span id='${divID}-title1' style='grid-row: 2; grid-column: 3'>${this.f1}</span>`);
    this.container.append(`<span id='${divID}-title2' style='grid-row: 2; grid-column: 5'>${this.f2}</span>`);
    this.container.append(`<div id='${divID}lg' style='grid-row: 3; grid-column: 3'></div>`);
    this.container.append(`<div id='${divID}ly' style='grid-row: 3; grid-column: 2'></div>`);
    this.container.append(`<div id='${divID}lx' style='grid-row: 4; grid-column: 3'></div>`);
    this.container.append(`<div id='${divID}rg' style='grid-row: 3; grid-column: 5'></div>`);
    this.container.append(`<div id='${divID}ry' style='grid-row: 3; grid-column: 4'></div>`);
    this.container.append(`<div id='${divID}rx' style='grid-row: 4; grid-column: 5'></div>`);
    this.container.append(`<div id='${divID}b' style='grid-row: 6; grid-column: 3 / 6'></div>`);

    $(`#${divID} span`).css({ 'font-weight': 'bold', 'align-self': 'end', 'pointer-events': 'none' });
    $(`#${divID} #${divID}lg`).css({ 'width': `${gw}px`, 'height': `${gh}px`, 'cursor': 'none' });
    $(`#${divID} #${divID}ly`).css({ 'width': `${leg}px`, 'height': `${gh}px`, });
    $(`#${divID} #${divID}lx`).css({ 'width': `${gw}px`, 'height': `${3*p}px`, });
    $(`#${divID} #${divID}rg`).css({ 'width': `${gw}px`, 'height': `${gh}px`, 'cursor': 'none' });
    $(`#${divID} #${divID}ry`).css({ 'width': `${leg}px`, 'height': `${gh}px`, });
    $(`#${divID} #${divID}rx`).css({ 'width': `${gw}px`, 'height': `${3*p}px`, });
    $(`#${divID} #${divID}b`).css({ 
      'width': '100%', 'height': `${3 * p}px`, 
      'border': '1px solid gray',
      'border-radius': `${1.5*p}px`
    });
    $(`#${divID} div`).css({'position': 'absolute', 'scrollbar-width': 'none'});
    $(`#${divID} div::-webkit-scrollbar`).css('display', 'none');

    this.LG = new Graph(`${divID}lg`);
    this.LG.parent = this; this.LG.ownSide = 1;
    this.RG = new Graph(`${divID}rg`);
    this.RG.parent = this; this.RG.ownSide = 2;

    // the axis labels are Graphs, but they are... special
    this.LG.Y = new Graph(`${divID}ly`);
    this.LG.X = new Graph(`${divID}lx`);
    this.LG.Y.parent = this; this.LG.Y.ownSide = false;
    this.LG.X.parent = this; this.LG.X.ownSide = false;

    this.RG.Y = new Graph(`${divID}ry`);
    this.RG.X = new Graph(`${divID}rx`);
    this.RG.Y.parent = this; this.RG.Y.ownSide = false;
    this.RG.X.parent = this; this.RG.X.ownSide = false;

    this.B = new Bar(`${divID}b`);
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
      this.normdata.push( DataSet( d.x, normy, d.dates, d.side, d.name, d.color ) );
    }

    this.writeDataRangeInTheTitleOfEachGraph();
  }

  // the numbers along the y-axis aren't clear enough
  writeDataRangeInTheTitleOfEachGraph() {
    $(`#${this.id}-title1`).text(`${this.f1} (${this.floor(1)} - ${science(this.dataHeight(1))})`);
    $(`#${this.id}-title2`).text(`${this.f2} (${this.floor(2)} - ${science(this.dataHeight(2))})`);
  }

  set xlbl(x) { this._xlbl = x };
  get xlbl() { return this._xlbl; }

  update() {
    this.clear();
    this.LG.grid(); 
    this.RG.grid(); 

    for (let ds of this.normdata) {
      if (ds.side === 1) this.LG.draw(ds);
      if (ds.side === 2) this.RG.draw(ds);
    }

    if (this.mouseIn && this.cx >= 0 && this.cy >= 0) {
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
          date: d.dates[dj], 
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
    this.LG.scroll(this.xoff); 
    this.RG.scroll(this.xoff); 
    this.update();
  }

  // the width of the widest dataset
  dataWidth = () => Math.ceil(Math.max(... this.data.map(d => d.R - d.L)));

  // the height of the tallest dataset on `side` (1 or 2)
  dataHeight = (side) => intCeil(Math.max(... 
    this.data.filter(d => d.side === side).map(d => d.T - this.floor(side))));

  // the lowest value on graph `side` (1 or 2)
  floor = (side) => Math.floor(Math.min(0, ... 
    this.data.filter(d => d.side === side).map(d => 1.1*d.B)));

  // empty all visuals from graphs
  clear() {
    this.LG.clear();
    this.RG.clear();
  }

  legend(L) {
    let lg = $(`<span style='grid-row: 1; grid-column: 3 / 6'></span>`);
    for (let i of L) { 
      let lgi = $(`<span style='padding: 0 5px'></span>`);
      lgi.append(`<span class='legend-dot' style='background-color:${i[1]}'></span>`);
      lgi.append(`<span>${i[0]}</span>`);
      lgi.on('click', (e) => {
        // TODO: make legend items change appearance when clicked
        this.normdata.filter(d => d.color === i[1]).map(d => d.show = !d.show);
        this.update();
      });
      lg.append(lgi);
    }
    this.container.append(lg);
    
  }
}

let Graph = class {

  constructor(graphID) {
    this.parent;
    this.Y; this.X;
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

  setw(w) { 
    this.cw = w; 
    this.X.cw = w;
    this.cvs.attr('width', w); 
    this.X.cvs.attr('width', w);
  }

  clear() { 
    this.ctx.clearRect(0, 0, this.cw, this.ch); 
    this.Y.ctx.clearRect(0, 0, this.Y.cw, this.Y.ch);
    this.X.ctx.clearRect(0, 0, this.X.cw, this.X.ch);
  }

  scroll(x) {
    this.div.scrollLeft(x);
    this.X.div.scrollLeft(x);
  }

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

    let h = this.ctx.measureText(lbl.name).actualBoundingBoxAscent + 5;
    let H = 3 * h + 5, pushx = 0, pushy = H,
      h1 = this.ctx.measureText(lbl.name).width,
      h2 = this.ctx.measureText(lbl.date).width,
      h3 = this.ctx.measureText(lbl.value).width;
    let W = Math.max(h1, h2, h3) + 10;

    if (lbl.p.x1 - this.parent.xoff + W > this.parent.ow) pushx = -W;
    if (lbl.p.y1 - H <= 0) pushy = 0;

    this.ctx.fillStyle = '#f0f0f0';
    this.ctx.fillRect(lbl.p.x1 + pushx, lbl.p.y1 - pushy, W, H);

    this.ctx.fillStyle = 'black';
    this.ctx.fillText(lbl.name,  lbl.p.x1 + pushx + 5, lbl.p.y1-pushy+(1 * h));
    this.ctx.fillText(lbl.date,  lbl.p.x1 + pushx + 5, lbl.p.y1-pushy+(2 * h));
    this.ctx.fillText(lbl.value, lbl.p.x1 + pushx + 5, lbl.p.y1-pushy+(3 * h));

    this.ctx.restore();
  }

  grid() {

    let yGrain = 8;

    let ymin = this.parent.floor(this.ownSide);
    let ymax = ymin + this.parent.dataHeight(this.ownSide);
    let zero = Math.abs( ymin * this.parent.ch / (ymax-ymin));

    this.ctx.strokeStyle = '#D0D0D0';
    this.ctx.lineWidth = 1;
    this.Y.ctx.font = 'bold 16px monospace';
    this.X.ctx.font = 'bold 16px monospace';
    this.X.ctx.strokeStyle = '#D0D0D0';
    this.X.ctx.lineWidth = 1;

    let dx = Math.floor(this.cw / this.parent.xlbl.length);

    let ylbl = [], lat;
    for (let i = ymin; i < ymax; i += (ymax - ymin) / yGrain) ylbl.push(science(i));
    for (let i = 0; i < yGrain; i++) {
      lat = this.ch * (1 - i / yGrain);
      this.ctx.beginPath();
      this.ctx.moveTo(0, lat);
      this.ctx.lineTo(this.cw, lat)
      this.ctx.stroke();
      this.Y.ctx.fillStyle = 'black';
      this.Y.ctx.fillText(ylbl[i], this.Y.cw - 5 - this.Y.ctx.measureText(ylbl[i]).width, lat);
    }

    for (let i in this.parent.xlbl) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * dx, 0);
      this.ctx.lineTo(i * dx, this.ch);
      this.ctx.stroke();
      this.X.ctx.beginPath();
      this.X.ctx.moveTo(i * dx, 0);
      this.X.ctx.lineTo(i * dx, this.X.ch);
      this.X.ctx.stroke();
      this.X.ctx.fillText(this.parent.xlbl[i], i * dx + 5, this.X.ch-10);
    }

    // draw a dark line at zero
    this.ctx.strokeStyle = '#303030';
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.ch - zero);
    this.ctx.lineTo(this.cw, this.ch - zero);
    this.ctx.stroke();
  }
}

let Bar = class {

  constructor(barID) {

    this.parent;

    this.obar = $(`#${barID}`);
    this.obar.css('overflow', 'hidden');
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
      'transition': 'background 0.25s'
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
    this.ibar.css('background', '#d0d0d0');
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
    this.ibar.css('background', '#ddd');
  }
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const intCeil = (x) => {
  let p = Math.floor(Math.log10(x)) - 1;
  return Math.ceil( x / (10**p) ) * 10**p;
}

// large number formatting
let unit = ['', 'K', 'M', 'B', 'T'];
const science = (x) => {
  if (x > 999) {
    let p = Math.floor(Math.log10(x));
    return `${ Math.floor( x / (10**(p - 1 - p % 3)) ) / 10 }${ unit[Math.floor(p / 3)] }`;
  } else return Math.floor(x);
}

// debug for number formatting
// for (let x of [1, 12, 123, 1234, 12345, 123456, 1234567, 12345678, 123456789]) console.log(science(x));

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
