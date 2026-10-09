// Branded QR: rounded dark-green modules on cream, medallion logo in the centre (level-H keeps it scannable).
window.gawBrandedQR = function (text, size, logoSrc, cb) {
  if (!window.qrcode) { cb(''); return; }
  var q; try { q = window.qrcode(0, 'H'); q.addData(text); q.make(); } catch (e) { cb(''); return; }
  var n = q.getModuleCount(), quiet = 3, cell = size / (n + quiet * 2), r = cell * 0.5;
  var c = document.createElement('canvas'); c.width = c.height = size;
  var g = c.getContext('2d');
  g.fillStyle = '#FFFDF8'; g.fillRect(0, 0, size, size);
  var logoCells = Math.floor(n * 0.26), lo = Math.floor((n - logoCells) / 2), hi = lo + logoCells;
  var inLogo = function (x, y) { return x >= lo && x < hi && y >= lo && y < hi; };
  var isEye = function (x, y) { return (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7); };
  g.fillStyle = '#14241C';
  for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
    if (!q.isDark(y, x) || inLogo(x, y) || isEye(x, y)) continue;
    var px = (x + quiet) * cell, py = (y + quiet) * cell;
    g.beginPath(); g.arc(px + cell / 2, py + cell / 2, r * 0.86, 0, Math.PI * 2); g.fill();
  }
  // finder eyes: rounded squares, gold inner dot
  var eye = function (ex, ey) {
    var p = (ex + quiet) * cell, s = cell * 7, rr = cell * 1.6;
    var rs = function (x0, y0, w, rad, fill) { g.fillStyle = fill; g.beginPath(); g.roundRect(x0, y0, w, w, rad); g.fill(); };
    rs(p, (ey + quiet) * cell, s, rr, '#14241C');
    rs(p + cell, (ey + quiet) * cell + cell, s - 2 * cell, rr * 0.7, '#FFFDF8');
    rs(p + 2 * cell, (ey + quiet) * cell + 2 * cell, s - 4 * cell, rr * 0.5, '#B8923E');
  };
  eye(0, 0); eye(n - 7, 0); eye(0, n - 7);
  var ls = logoCells * cell, lx = (lo + quiet) * cell, cx = lx + ls / 2;
  var finish = function () { cb(c.toDataURL('image/png')); };
  if (!logoSrc) { finish(); return; }
  var img = new Image(); img.crossOrigin = 'anonymous';
  img.onload = function () {
    g.save();
    g.fillStyle = '#FFFDF8'; g.beginPath(); g.arc(cx, cx, ls / 2 + cell * 0.6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#B8923E'; g.lineWidth = Math.max(2, cell * 0.35); g.beginPath(); g.arc(cx, cx, ls / 2 - cell * 0.1, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(cx, cx, ls / 2 - cell * 0.4, 0, Math.PI * 2); g.clip();
    g.drawImage(img, lx + cell * 0.4, lx + cell * 0.4, ls - cell * 0.8, ls - cell * 0.8);
    g.restore(); finish();
  };
  img.onerror = finish;
  img.src = logoSrc;
};
