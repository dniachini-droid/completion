/* ==========================================================================
   lamp.js — the clay lamp for direction D. One hand for every screen that shows it.

   A hand-made clay oil lamp: a low, round, slightly uneven body, a sunken top
   with its filling hole, a pinched nozzle where the flame sits, a pierced lug
   at the back. Fired terracotta, matte and grainy, soot at the nozzle, worn
   edges. Lit by its own flame from above and by the hall's violet from the side;
   it sits in a soft contact shadow on a pool of its own warm light.

   ClayLamp.draw(parent, { x, y, size, dir, pool })
     parent : an SVG element (svg or g); drawn in its user units
     x, y   : where the flame sits (the wick, at the nozzle's tip)
     size   : the lamp's length, back of the body to the wick (≈ 100 local units)
     dir    : 1 nozzle to the right (default), -1 mirrored
     pool   : 0..1, the warm light pooled on the ledge (default 1)
   It draws the body only: the flame stays each screen's own. Returns the <g>.
   ========================================================================== */
(function (global) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', count = 0;
  function el(tag, a, p) {
    var e = document.createElementNS(NS, tag);
    for (var k in a) e.setAttribute(k, a[k]);
    if (p) p.appendChild(e);
    return e;
  }

  /* local units: y down, the wick at 0,0, the body reaching back to x ≈ −104, the foot at y ≈ 21 */
  var SIL = 'M-91 -1 C-92 8 -86 17 -70 19.5 C-63 20.6 -55 21.3 -46 20.4 C-35 19.4 -27.5 15.6 -23 9.2 C-15 8.1 -7 6.6 -1 5.1 ' +
            'C3 4.1 5.6 1.6 4.6 -1 C3.6 -3 -1 -3.9 -6 -4.1 C-12 -4.5 -18 -6 -23 -8.7 C-33 -12.2 -50 -12.9 -63 -11.5 C-79 -10.4 -89.6 -6.8 -91 -1 Z';
  var TOP = 'M-88.6 -1.6 C-88.4 -7.4 -76 -11 -58 -11.2 C-40 -11.4 -25 -8.1 -24 -2.3 C-23.4 3.6 -38 8.4 -57 8.7 C-75.5 8.9 -88.8 4.8 -88.6 -1.6 Z';
  var SPOUT = 'M-27 -5.6 C-19 -4.6 -10 -3.6 -3.4 -2.9 C0.8 -2.5 2.8 0.2 1.4 1.9 C-1.6 3.4 -10 3.3 -18 2.8 C-22.6 2.5 -25.6 1.4 -27 -0.2 Z';
  var LUG = 'M-87.5 -6.2 C-94.5 -10.4 -103.2 -8.6 -103.8 -2.6 C-104.2 1.8 -99.6 4.6 -90.2 3.2 Z';
  var FRONT = 'M-88 0.6 C-83 6.6 -71 8.9 -57 8.9 C-42 8.9 -29 5.8 -24.4 0.4';

  function draw(parent, o) {
    o = o || {};
    var id = 'clay' + (++count) + '-', k = (o.size || 60) / 100, dir = o.dir === -1 ? -1 : 1, pool = o.pool == null ? 1 : o.pool;
    var g = el('g', { 'class': 'clay-lamp', transform: 'translate(' + o.x + ' ' + o.y + ') scale(' + (dir * k) + ' ' + k + ')' }, parent);
    var d = el('defs', {}, g), U = ' gradientUnits="userSpaceOnUse"';
    d.innerHTML =
      /* the side wall: the flame above the nozzle lights it from the upper right */
      '<radialGradient id="' + id + 'side"' + U + ' cx="-6" cy="-24" r="104"><stop offset="0" stop-color="#e59a60"/><stop offset=".28" stop-color="#b4602f"/><stop offset=".6" stop-color="#692e17"/><stop offset="1" stop-color="#26100a"/></radialGradient>' +
      '<linearGradient id="' + id + 'foot"' + U + ' x1="0" y1="2" x2="0" y2="21"><stop offset="0" stop-color="#1a0a06" stop-opacity=".1"/><stop offset=".5" stop-color="#1a0a06" stop-opacity=".45"/><stop offset="1" stop-color="#12070a" stop-opacity=".9"/></linearGradient>' +
      /* the top: nearest the flame, brightest */
      '<radialGradient id="' + id + 'top"' + U + ' cx="-14" cy="-9" r="80"><stop offset="0" stop-color="#f0a86c"/><stop offset=".3" stop-color="#bf6c38"/><stop offset=".66" stop-color="#76361a"/><stop offset="1" stop-color="#42200f"/></radialGradient>' +
      /* the sunken centre: its far wall faces the light, its near wall falls away */
      '<linearGradient id="' + id + 'dish"' + U + ' x1="0" y1="-7.6" x2="0" y2="5.2"><stop offset="0" stop-color="#cd8550"/><stop offset=".45" stop-color="#8a4726"/><stop offset="1" stop-color="#3b1b0f"/></linearGradient>' +
      '<radialGradient id="' + id + 'spout"' + U + ' cx="-3" cy="-7" r="24"><stop offset="0" stop-color="#ffc98e"/><stop offset=".5" stop-color="#d0804a"/><stop offset="1" stop-color="#9a4f28"/></radialGradient>' +
      /* soot at the nozzle */
      '<radialGradient id="' + id + 'soot"' + U + ' cx="-3" cy="-1" r="17"><stop offset="0" stop-color="#1a0a06" stop-opacity=".7"/><stop offset=".45" stop-color="#1c0b07" stop-opacity=".38"/><stop offset="1" stop-color="#140806" stop-opacity="0"/></radialGradient>' +
      /* the hall's violet, from the side away from the flame */
      '<linearGradient id="' + id + 'amb"' + U + ' x1="-104" y1="0" x2="-46" y2="0"><stop offset="0" stop-color="#9d92ff" stop-opacity=".2"/><stop offset=".4" stop-color="#8f86ff" stop-opacity=".08"/><stop offset="1" stop-color="#8f86ff" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="' + id + 'rim"' + U + ' x1="-88" y1="0" x2="-24" y2="0"><stop offset="0" stop-color="#ffd9aa" stop-opacity=".12"/><stop offset=".6" stop-color="#ffd9aa" stop-opacity=".5"/><stop offset="1" stop-color="#ffe6c2" stop-opacity=".85"/></linearGradient>' +
      '<radialGradient id="' + id + 'pool"><stop offset="0" stop-color="#ffc47e" stop-opacity=".6"/><stop offset=".4" stop-color="#e88c3e" stop-opacity=".22"/><stop offset="1" stop-color="#d0782e" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="' + id + 'clip"><path d="' + SIL + '"/><path d="' + LUG + '"/></clipPath>' +
      /* matte fired clay: fine grit, and the uneven colour of a hand-fired pot */
      '<filter id="' + id + 'grit" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7"/>' +
        '<feColorMatrix values="0 0 0 0 .08  0 0 0 0 .04  0 0 0 0 .03  0 0 0 -2.6 1.45"/></filter>' +
      '<filter id="' + id + 'fleck" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".6" numOctaves="2" seed="21"/>' +
        '<feColorMatrix values="0 0 0 0 1  0 0 0 0 .82  0 0 0 0 .62  0 0 0 3.2 -2.05"/></filter>' +
      '<filter id="' + id + 'mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".07 .11" numOctaves="3" seed="4"/>' +
        '<feColorMatrix values="0 0 0 0 .22  0 0 0 0 .08  0 0 0 0 .04  0 0 0 2.4 -1.05"/></filter>' +
      '<filter id="' + id + 'b1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".6"/></filter>' +
      '<filter id="' + id + 'b2" x="-50%" y="-300%" width="200%" height="700%"><feGaussianBlur stdDeviation="2.2"/></filter>';

    var u = function (s) { return 'url(#' + id + s + ')'; };
    /* the ledge: warm light pooled under the flame, then the contact shadow */
    if (pool > 0) el('ellipse', { cx: -22, cy: 20.5, rx: 70 + 50 * pool, ry: 8 + 7 * pool, fill: u('pool'), opacity: Math.min(1, .55 + .45 * pool), style: 'mix-blend-mode:screen' }, g);
    el('ellipse', { cx: -50, cy: 20.6, rx: 52, ry: 3.8, fill: '#050308', opacity: .7, filter: u('b2') }, g);
    el('ellipse', { cx: -54, cy: 20.4, rx: 34, ry: 1.5, fill: '#030205', opacity: .85, filter: u('b1') }, g);

    /* the masses */
    el('path', { d: LUG, fill: u('side') }, g);
    el('path', { d: LUG, fill: '#1c0b07', opacity: .35 }, g);
    el('path', { d: SIL, fill: u('side') }, g);
    el('path', { d: SIL, fill: u('foot') }, g);
    el('path', { d: TOP, fill: u('top') }, g);
    el('path', { d: SPOUT, fill: u('spout'), filter: u('b1') }, g);
    el('ellipse', { cx: -57, cy: -1.3, rx: 22, ry: 6.3, fill: u('dish') }, g);
    /* the lug's hole */
    el('ellipse', { cx: -98.6, cy: -2.4, rx: 2.1, ry: 1.9, fill: '#100705' }, g);

    /* texture over everything, clipped to the clay */
    var tex = el('g', { 'clip-path': u('clip') }, g);
    el('rect', { x: -106, y: -14, width: 114, height: 37, filter: u('mottle'), opacity: .55, style: 'mix-blend-mode:multiply' }, tex);
    el('rect', { x: -106, y: -14, width: 114, height: 37, filter: u('grit'), opacity: .3 }, tex);
    el('rect', { x: -106, y: -14, width: 114, height: 37, filter: u('fleck'), opacity: .1 }, tex);
    /* soot at the nozzle, and a breath of it on the shoulder beside it */
    el('ellipse', { cx: -3, cy: -1, rx: 17, ry: 8, fill: u('soot') }, tex);
    el('ellipse', { cx: -20, cy: -6, rx: 9, ry: 3.2, fill: '#120806', opacity: .28, filter: u('b1') }, tex);
    /* violet from the side */
    el('rect', { x: -106, y: -14, width: 70, height: 37, fill: u('amb'), style: 'mix-blend-mode:screen' }, tex);
    /* the foot's edge worn pale where it has been set down a thousand times */
    el('path', { d: 'M-80 17 C-70 20 -50 21.2 -36 19', stroke: '#c98a5c', 'stroke-width': .7, fill: 'none', opacity: .35, filter: u('b1') }, tex);

    /* the filling hole, with the oil catching the flame */
    el('ellipse', { cx: -57.5, cy: -0.4, rx: 5.6, ry: 2.1, fill: '#0c0504' }, g);
    el('ellipse', { cx: -56, cy: 0.5, rx: 2.4, ry: .55, fill: '#ffba6c', opacity: .55 }, g);
    /* the wick hole */
    el('ellipse', { cx: 0, cy: 0, rx: 2.5, ry: 1.25, fill: '#120805' }, g);

    /* worn edges: the raised ring round the centre, the front rim, the nozzle's lip, a few chips */
    el('path', { d: 'M-78.5 0.4 C-74 4.6 -66 6.1 -57 6.1 C-47 6.1 -39 4.4 -35.4 0.6', stroke: '#e8a878', 'stroke-width': .9, fill: 'none', opacity: .45, filter: u('b1') }, g);
    el('path', { d: FRONT, stroke: u('rim'), 'stroke-width': 1.3, fill: 'none', filter: u('b1') }, g);
    el('path', { d: 'M-22 5.6 C-14 5 -6 3.6 1.6 1.8', stroke: '#ffdcb0', 'stroke-width': .9, fill: 'none', opacity: .55, filter: u('b1') }, g);
    el('path', { d: 'M-6 -4 C-1 -3.9 3.4 -2.8 4.4 -0.8', stroke: '#ffe2bc', 'stroke-width': .7, fill: 'none', opacity: .5 }, g);
    [[-81, -6.6, .9], [-45, -10.8, .8], [-34, 5.9, .9], [-70, 8.4, .7]].forEach(function (c) {
      el('ellipse', { cx: c[0], cy: c[1], rx: c[2] * 1.4, ry: c[2] * .5, fill: '#f6c89a', opacity: .3, filter: u('b1') }, g);
    });
    /* the soft specular: the flame's own reflection on the shoulder nearest it */
    el('ellipse', { cx: -28, cy: 7.6, rx: 7, ry: 2.4, fill: '#ffd09a', opacity: .32, filter: u('b1'), style: 'mix-blend-mode:screen' }, g);
    /* violet rim on the far side */
    el('path', { d: 'M-90 -4 C-92 6 -86 15 -74 18.6', stroke: '#b4acff', 'stroke-width': .8, fill: 'none', opacity: .45, filter: u('b1') }, g);
    return g;
  }

  global.ClayLamp = { draw: draw };
})(window);
