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
    var message;

    if (x.readyState != 4) {
      return;
    }

    if (x.status != 200) {
      message = 'Error fetching data: ' + x.responseText;
      util.error(message);
      failure({ message: message });
      return;
    }

    var result;
    try {
      result = JSON.parse(x.responseText);
    } catch (e) {
      message = 'Unable to parse data: ' + x.responseText + '; ' + e;
      util.error(message);
      failure({ message: message });
      return;
    }

    callback(result);
  };

  x.open('GET', url, true);
  x.send();
}

// ----------
// You must provide a success callback, but the failure callback is optional.
// For each call to getJSONP, you'll get at most 1 callback (either success or failure) call. If you
// don't provide a failure callback, you might not receive a call at all (if the function doesn't
// succeed). If you do provide the failure callback, you'll get exactly 1 call, whichever one is
// appropriate to the result.
function getJSONP(url, success, failure) {
  var script = document.createElement('script');
  script.async = true;
  var id = '_jsonp' + sequence++;
  var failureSent = false;

  var timeout = setTimeout(function() {
    var message = 'Timeout trying to retrieve ' + url;
    util.error(message);
    if (failure) {
      failure({ message: message });

      // Here we set a flag so we won't end up sending a success callback later if the result comes
      // through after the timeout.
      failureSent = true;
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

    if (!failureSent) {
      success(data);
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
