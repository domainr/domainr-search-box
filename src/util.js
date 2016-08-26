'use strict'

var euc = encodeURIComponent;

function extract(p, keys) {
  var x = {};
  if (p) {
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (p[k] !== undefined) {
        x[k] = p[k];
      }
    }
  }
  return x;
}

function qs() {
  var q = [];
  for (var i = 0; i < arguments.length; i++) {
    var p = arguments[i];
    for (var k in p) {
      q.push(euc(k) + '=' + euc(p[k]));
    }
  }
  return q.join('&');
}

function error(message) {
  if (window.console && window.console.error) {
    window.console.error('[domainr] ' + message);
  }
}

function uniq(a) {
  if (!a) {
    return;
  }

  var i, j;
  for (i = 0; i < a.length; i++) {
    for (j = i + 1; j < a.length; j++) {
      if (a[i] === a[j]) {
        a.splice(j, 1);
        j--;
      }
    }
  }
}

function indexOf(a, v) {
  if (!a) {
    return -1;
  }

  var i;
  for (i = 0; i < a.length; i++) {
    if (a[i] === v) {
      return i;
    }
  }

  return -1;
}

module.exports = {
  euc: euc,
  extract: extract,
  qs: qs,
  error: error,
  uniq: uniq,
  indexOf: indexOf
};
