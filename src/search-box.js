'use strict'

var Client = require('./client');
var util = require('./util');

var SearchBox = function(options) {
  var self = this;

  options = options || {};

  if (!options.observe) {
    throw new Error('[domainr] "observe" is required');
  }

  this._client = new Client(util.extract(options, ['clientId', 'mashapeKey']));
  this._state = {
    query: '',
    results: [],
    limit: 20,
    selection: -1
  };

  this._seq = 0;
  this._last = 0;
  this._cache = {};
  this._listeners = {};
  this._renderer = defaultRenderer;

  this._in = options.observe;
  on(this._in, 'keyup', this._input, this);
  on(this._in, 'input', this._input, this);
  on(this._in, 'change', this._input, this);
  on(this._in, 'keydown', this._keydown, this);

  if (options.renderTo !== undefined) {
    this._out = options.renderTo;
    addClass(this._out, 'domainr-results-container');
    on(this._out, 'click', this._click, this);
  }

  if (options.renderWith !== undefined) {
    this._renderer = options.renderWith;
  }

  if (options.limit !== undefined) {
    this._state.limit = options.limit;
  }

  if (options.registrar !== undefined) {
    this._state.registrar = options.registrar;
  }

  if (options.defaults !== undefined) {
    this._state.defaults = options.defaults.join(',');
  }

  if (options.onSelect !== undefined) {
    this._onSelect = options.onSelect;
  } else {
    this._onSelect = function(result) {
      self._in.value = result.domain;
      window.open(self._client.registerURL(result.domain));
    };
  }
};

var searchTrigger = null;

SearchBox.prototype = {
  _input: function() {
    if (this._state.query != this._in.value) {
      this._state.query = this._in.value;
      window.clearTimeout(searchTrigger);
      searchTrigger = window.setTimeout(this._search.bind(this), 500);
    }
  },

  _keydown: function(event) {
    event = event || window.event;
    var handled = false;

    if (event.keyCode === 38) { // Up arrow
      handled = true;
      this._state.selection--;
      if (this._state.selection < 0) {
        this._state.selection = this._state.results.length - 1;
      }

      this._update();
    } else if (event.keyCode === 40) { // Down arrow
      handled = true;
      this._state.selection++;
      if (this._state.selection >= this._state.results.length) {
        this._state.selection = 0;
      }

      this._update();
    } else if (event.keyCode === 13) { // Enter key
      if (this._state.selection !== -1) {
        handled = true;
        this._choose(this._state.results[this._state.selection]);
      }
    }

    if (handled && event.preventDefault) {
      event.preventDefault();
    }
  },

  _click: function(event) {
    event = event || window.event;
    var rs = this._state.results;
    for (var e = event.target || event.srcElement; e && e != document; e = e.parentNode) {
      var d = e.getAttribute('data-domain');
      if (d) {
        for (var i = 0; i < rs.length; i++) {
          var r = rs[i];
          if (r.domain == d) {
            this._choose(r);
            return;
          }
        }
      }
    }
  },

  _render: function() {
    if (!this._out) {
      return;
    }
    this._out.innerHTML = this._renderer(this._state);
    return this;
  },

  _search: function() {
    var self = this;
    this._state.selection = -1;

    // Try cache first
    var key = util.qs(this._client.searchParams(this._state));
    var res = this._cache[key];
    if (res !== undefined) {
      this._state.results = res.results;
      this._update();
      return;
    }

    // Make network request
    var seq = this._seq++;
    this._client.search(this._state, function(res) {
      self._cache[key] = res;
      if (self._last > seq) {
        return;
      }
      self._last = seq;
      self._state.results = res.results;
      self._update();
    });
  },

  _update: function() {
    this._sort();
    this._limit();
    this._status();
    this._render();
  },

  _sort: function() {
    if (!this._state.defaults || !this._state.results) {
      return;
    }

    var defaults = this._state.defaults.split(',');
    this._state.results.sort(function(a, b) {
      var aIndex = util.indexOf(defaults, a.zone);
      if (aIndex === -1) {
        aIndex = defaults.length;
      }

      var bIndex = util.indexOf(defaults, b.zone);
      if (bIndex === -1) {
        bIndex = defaults.length;
      }

      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }

      return a.domain - b.domain;
    });
  },

  _limit: function() {
    if (this._state.limit >= 0 && this._state.results.length > this._state.limit) {
      this._state.results.length = this._state.limit;
    }
  },

  _status: function() {
    var self = this;

    // Extract domains without status
    var d = [];
    var MAX_STATUS_DOMAINS = 10;
    var rs = this._state.results;
    for (var i = 0; i < rs.length && d.length < MAX_STATUS_DOMAINS; i++) {
      var r = rs[i];
      r.status = this._cache[r.domain + ':status'] || r.status;
      if (!r.status) {
        r.status = 'unknown';
        d.push(r.domain);
      }
    }
    if (d.length === 0) {
      return;
    }

    // Make network request
    this._client.status(d, function(res) {
      var ss = res.status;
      for (var i = 0; i < ss.length; i++) {
        var s = ss[i];
        self._cache[s.domain + ':status'] = s.status;
      }
      self._update();
    });
  },

  _choose: function(result) {
    if (this._onSelect) {
      this._onSelect(result);
    }
  }
};

function defaultRenderer(state) {
  var rs = state.results;
  var l = rs.length;
  if (l === 0) {
    return '';
  }
  var h = ['<div class="domainr-results">'];
  for (var i = 0; i < l; i++) {
    var r = rs[i];

    var classNames = [
      'domainr-result',
      r.status
    ];

    if (state.selection === i) {
      classNames.push('selected');
    }

    h.push(
      '<div class="' + classNames.join(' ') + '" data-domain="' + r.domain + '">' +
        '<span class="domainr-result-domain">' +
          '<span class="domainr-result-host">' + r.host + '</span>' +
          '<span class="domainr-result-subdomain">' + r.subdomain + '</span>' +
          '<span class="domainr-result-zone">' + r.zone + '</span>' +
        '</span>' +
        '<span class="domainr-result-path">' + r.path + '</span>' +
      '</div>'
    );
  }
  h.push('</div>');
  return h.join('');
}

function on(e, ev, cb, obj) {
  if (obj) {
    var original = cb;
    cb = function() {
      return original.apply(obj, arguments);
    };
  }
  if (e.addEventListener) {
    e.addEventListener(ev, cb, false);
  } else if (e.attachEvent) {
    e.attachEvent('on' + ev, cb);
  } else {
    e['on' + ev] = cb;
  }
}

function addClass(e, className) {
  if (e.classList) {
    e.classList.add(className);
  } else {
    e.className += ' ' + className;
  }
}

module.exports = SearchBox;
