/* ==========================================================================
   ambient.js: every screen of D keeps a little life once it has settled (Dan, D-041).

   <script src="ambient.js" data-drift></script>  (load last)
   - data-drift: the painted scene drifts very slowly, like a camera breathing.
     The scene's layers (everything behind the scrims) move together, so light
     stays on the stone; the interface never moves. Scene screens only:
     reading screens keep still (UX 17).
   - light motes rise through the scene, violet by day, gold once the day has
     turned; added only where the screen has none of its own.
   - the map: a spark travels along each walked route, and "you are here" pulses.
   prefers-reduced-motion: nothing here runs.
   ========================================================================== */
(function () {
  'use strict';
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var me = document.currentScript, phone = document.querySelector('.phone');
  if (!phone) return;
  var gold = /\bs-(done|evening)\b/.test(document.body.className);

  /* 1. the scene drifts */
  if (me && me.hasAttribute('data-drift')) {
    var stop = { 'ui': 1, 'grain': 1, 'vignette': 1, 'scrim-top': 1, 'scrim-bottom': 1 };
    var world = document.createElement('div');
    world.className = 'world-drift'; world.setAttribute('aria-hidden', 'true');
    var kids = Array.prototype.slice.call(phone.children);
    phone.insertBefore(world, kids[0]);
    kids.forEach(function (el) {
      if (el.tagName === 'SCRIPT') return;
      var c = (el.getAttribute('class') || '').split(/\s+/);
      for (var i = 0; i < c.length; i++) if (stop[c[i]]) return;
      world.appendChild(el);
    });
  }

  /* 2. light motes */
  if (!phone.querySelector('canvas.motes, canvas.sc-motes')) {
    var cv = document.createElement('canvas');
    cv.className = 'motes amb-motes'; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none';
    var ui = phone.querySelector('.ui, .ui-layer');
    (ui && ui.parentNode === phone) ? phone.insertBefore(cv, ui) : phone.appendChild(cv);
    var x = cv.getContext('2d'), W, H, dpr = Math.min(2, window.devicePixelRatio || 1), P = [];
    var rgb = gold ? '255,214,150' : '214,210,255';
    function size() { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    for (var i = 0; i < 34; i++) P.push({ x: Math.random() * W, y: H * (.15 + Math.random() * .75), r: .5 + Math.random() * 1.2, a: .12 + Math.random() * .4, vx: (Math.random() - .5) * .08, vy: -.03 - Math.random() * .07, p: Math.random() * 6.28 });
    var last = 0;
    (function tick(t) {
      requestAnimationFrame(tick);
      if (t - last < 33) return; last = t;
      x.clearRect(0, 0, W, H);
      for (var i = 0; i < P.length; i++) {
        var q = P[i]; q.x += q.vx + Math.sin(t / 3000 + q.p) * .05; q.y += q.vy;
        if (q.y < H * .12) { q.y = H * .9; q.x = Math.random() * W; }
        var al = q.a * (.6 + .4 * Math.sin(t / 1400 + q.p * 3));
        x.beginPath(); x.arc(q.x, q.y, q.r, 0, 6.283); x.fillStyle = 'rgba(' + rgb + ',' + al.toFixed(3) + ')'; x.fill();
      }
    })(0);
  }

  /* 3. the map: light moves along the routes you've walked */
  var live = document.querySelector('svg.live');
  if (live) {
    var NS = 'http://www.w3.org/2000/svg', host = live.querySelector('.dots') && live.querySelector('.dots').parentNode;
    if (host) {
      var sg = document.createElementNS(NS, 'g'); sg.setAttribute('class', 'amb-sparks'); sg.setAttribute('filter', 'url(#lineGlow2)');
      var walked = Array.prototype.filter.call(live.querySelectorAll('.dots path'), function (p) { return +p.getAttribute('stroke-opacity') >= .35; });
      walked.forEach(function (p, i) {
        var c = document.createElementNS(NS, 'circle'); c.setAttribute('r', '1.8'); c.setAttribute('fill', '#f1efff');
        c.innerHTML = '<animateMotion dur="5.5s" begin="' + (3 + i * 1.7).toFixed(1) + 's" repeatCount="indefinite" path="' + p.getAttribute('d') + '" keyPoints="0;1;1" keyTimes="0;.45;1" calcMode="linear"/>' +
          '<animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;.06;.38;.45;1" dur="5.5s" begin="' + (3 + i * 1.7).toFixed(1) + 's" repeatCount="indefinite"/>';
        c.setAttribute('opacity', '0');
        sg.appendChild(c);
      });
      host.appendChild(sg);
      var hn = live.querySelector('.node[data-n="hall"]');
      if (hn) {
        var ring = document.createElementNS(NS, 'circle');
        ring.setAttribute('cx', hn.getAttribute('cx')); ring.setAttribute('cy', hn.getAttribute('cy'));
        ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', '#ffd79a'); ring.setAttribute('stroke-width', '1');
        ring.innerHTML = '<animate attributeName="r" values="6;26" dur="3.6s" begin="2.6s" repeatCount="indefinite"/><animate attributeName="stroke-opacity" values=".7;0" dur="3.6s" begin="2.6s" repeatCount="indefinite"/>';
        ring.setAttribute('stroke-opacity', '0');
        host.insertBefore(ring, host.firstChild);
      }
    }
  }
})();
