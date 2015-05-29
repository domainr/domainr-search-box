'use strict'

var Client = require('./client')
var util = require('./util')

var SearchBox = function(options) {
  options = options || {}
  this._client = new Client(util.extract(options, ['clientId', 'mashapeKey']))
  this._state = {
    query: '',
    results: [],
    limit: 20
  }

  this._seq = 0
  this._last = 0
  this._cache = {}
  this._listeners = {}
  this._renderer = defaultRenderer

  var _this = this
  this._input = function() {
    if (_this._state.query != _this._in.value) {
      _this._state.query = _this._in.value
      _this._search()
    }
  }

  this._click = function(evt) {
    evt = evt || window.event
    _this._choose(evt)
  }

  if (options.observe !== undefined) {
    this._in = options.observe
    on(this._in, 'keyup', this._input)
    on(this._in, 'input', this._input)
    on(this._in, 'change', this._input)
  }

  if (options.renderTo !== undefined) {
    this._out = options.renderTo
    addClass(this._out, 'domainr-results-container')
    on(this._out, 'click', this._click)
  }

  if (options.renderWith !== undefined) {
    this._renderer = options.renderWith
  }

  if (options.limit !== undefined) {
    this._state.limit = options.limit
  }

  if (options.registrar !== undefined) {
    this._state.registrar = options.registrar
  }

  if (options.defaults !== undefined) {
    this._state.defaults = options.defaults.join(',')
  }

  if (options.onSelect !== undefined) {
    this._onSelect = options.onSelect
  } else {
    this._onSelect = function(result) {
      _this._in.value = result.domain
      window.open(_this._client.registerURL(result.domain))
    }
  }
}

SearchBox.prototype = {
  _render: function() {
    if (!this._out) {
      return
    }
    this._out.innerHTML = this._renderer(this._state)
    return this
  },

  _search: function() {
    // Try cache first
    var key = util.qs(this._client.searchParams(this._state))
    var res = this._cache[key]
    if (res !== undefined) {
      this._state.results = res.results
      this._update()
      return
    }

    // Make network request
    var _this = this
    var seq = this._seq++
    this._client.search(this._state, function(res) {
      _this._cache[key] = res
      if (_this._last > seq) {
        return
      }
      _this._last = seq
      _this._state.results = res.results
      _this._update()
    })
  },

  _update: function() {
    this._limit()
    this._status()
    this._render()
  },

  _limit: function() {
    if (this._state.limit >= 0 && this._state.results.length > this._state.limit) {
      this._state.results.length = this._state.limit
    }
  },

  _status: function() {
    // Extract domains without status
    var d = []
    var rs = this._state.results
    for (var i = 0; i < rs.length; i++) {
      var r = rs[i]
      r.status = this._cache[r.domain + ':status'] || r.status
      if (!r.status) {
        r.status = 'unknown'
        d.push(r.domain)
      }
    }
    if (d.length === 0) {
      return
    }

    // Make network request
    var _this = this
    this._client.status(d, function(res) {
      var ss = res.status
      for (var i = 0; i < ss.length; i++) {
        var s = ss[i]
        _this._cache[s.domain + ':status'] = s.status
      }
      _this._update()
    })
  },

  _choose: function(evt) {
    var rs = this._state.results
    for (var e = evt.target || evt.srcElement; e && e != document; e = e.parentNode) {
      var d = e.getAttribute('data-domain')
      if (d) {
        for (var i = 0; i < rs.length; i++) {
          var r = rs[i]
          if (r.domain == d) {
            if (this._onSelect) {
              this._onSelect(r);
            }
            return
          }
        }
      }
    }
  }
}

function defaultRenderer(state) {
  var rs = state.results
  var l = rs.length
  if (l === 0) {
    return ''
  }
  var h = ['<div class="domainr-results">']
  for (var i = 0; i < l; i++) {
    var r = rs[i]
    h.push(
      '<div class="domainr-result ' + r.status + '" data-domain="' + r.domain + '">' +
      '<span class="domainr-result-domain">' +
      '<span class="domainr-result-host">' + r.host + '</span>' +
      '<span class="domainr-result-subdomain">' + r.subdomain + '</span>' +
      '<span class="domainr-result-zone">' + r.zone + '</span>' +
      '</span>' + // domainr-domain
      '<span class="domainr-result-path">' + r.path + '</span>' +
      '</div>'
    )
  }
  h.push('</div>')
  return h.join('')
}

function on(e, ev, cb) {
  if (e.addEventListener) {
    e.addEventListener(ev, cb, false)
  } else if (e.attachEvent) {
    e.attachEvent('on' + ev, cb)
  } else {
    e['on' + ev] = cb
  }
}

function off(e, ev, cb) {
  if (e.removeEventListener) {
    e.removeEventListener(ev, cb, false)
  } else if (e.detatchEvent) {
    e.detachEvent('on' + ev, cb)
  } else {
    e['on' + ev] = null
    delete e['on' + ev]
  }
}

function addClass(e, className) {
  if (e.classList) {
    e.classList.add(className)
  } else {
    e.className += ' ' + className
  }
}

module.exports = SearchBox
