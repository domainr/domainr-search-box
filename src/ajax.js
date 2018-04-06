'use strict';

var util = require('./util');

var sequence = 0;

// Detect CORS support
var cors = false;
if ('withCredentials' in xhr()) {
  cors = true;
}

// ----------
function getJSON(url, callback, failure) {
  if (!callback) {
    throw new Error('[domainr] Missing callback');
  }

  if (cors) {
    getCORS(url, callback, failure);
    return;
  }

  getJSONP(url, callback, failure);
}

// ----------
// Minimal fallback for IE
// http://toddmotto.com/writing-a-standalone-ajax-xhr-javascript-micro-library/
function xhr() {
  try {
    var XHR = window.XMLHttpRequest || window.ActiveXObject;
    return new XHR('MSXML2.XMLHTTP.3.0');
  } catch (e) {
    return {};
  }
}

// ----------
function getCORS(url, callback, failure) {
  failure = failure || function() {};
  var x = xhr();

  x.onreadystatechange = function() {
    if (x.readyState != 4) {
      return;
    }

    if (x.status != 200) {
      util.error('Error fetching data: ' + x.responseText);
      failure();
      return;
    }

    var result;
    try {
      result = JSON.parse(x.responseText);
    } catch (e) {
      util.error('Unable to parse data: ' + x.responseText + '; ' + e);
      failure();
      return;
    }

    callback(result);
  };

  x.open('GET', url, true);
  x.send();
}

// ----------
function getJSONP(url, callback, failure) {
  var script = document.createElement('script');
  script.async = true;
  var id = '_jsonp' + sequence++;
  var aborted = false;

  var timeout = setTimeout(function() {
    util.error('Timeout trying to retrieve ' + url);
    if (failure) {
      failure();
      aborted = true;
    }
  }, 5000);

  window[id] = function(data) {
    clearTimeout(timeout);

    setTimeout(function() {
      var scr = document.getElementById(id);
      scr.parentNode.removeChild(scr);
      window[id] = undefined;
      try {
        delete window[id];
      } catch (e) {}
    }, 0);

    if (!aborted) {
      callback(data);
    }
  };

  var c = url.indexOf('?') >= 0 ? '&' : '?';
  script.setAttribute('src', url + c + 'callback=' + id);
  script.id = id;
  var head = document.head || document.getElementsByTagName('head')[0] || document.documentElement;
  head.insertBefore(script, head.firstChild);
}

// ----------
module.exports = {
  getJSON: getJSON
};
