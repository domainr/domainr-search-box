'use strict';

var ajax = require('./ajax');
var util = require('./util');

function Client(options) {
  options = options || {};
  this.clientId = options.clientId;
  this.mashapeKey = options.mashapeKey;
  if (!this.clientId && !this.mashapeKey) {
    throw new Error('[domainr] Missing mashapeKey or clientId');
  }
  this.baseURL = options.baseURL || (this.clientId ? 'https://api.domainr.com/v2' : 'https://domainr.p.rapidapi.com/v2');
}

Client.prototype = {
  search: function(params, callback) {
    this._get('/search', this.searchParams(params), callback);
  },

  searchParams: function(p) {
    return util.extract(p, ['query', 'registrar', 'location', 'defaults']);
  },

  status: function(domains, callback) {
    var self = this;
    
    if (!domains) {
      throw new Error('[domainr] domains array is required');
    }

    util.uniq(domains);
    
    var output = {
      status: []
    };
    
    var completed = 0;
    
    var incrementCompleted = function() {
      completed++;
      if (completed === domains.length) {
        callback(output);
      }
    };
    
    var doOne = function(domain) {
      var params = {
        domain: domain
      };
      
      self._get('/status', params, function(result) {
        if (result && result.status && result.status[0]) {
          output.status.push(result.status[0]);
        } else {
          util.error('Empty status result', result);
        }

        incrementCompleted();
      }, incrementCompleted);
    };
    
    for (var i = 0; i < domains.length; i++) {
      doOne(domains[i]);
    }
  },

  options: function(domain, callback) {
    this._get('/options', {
      domain: domain,
    }, callback);
  },

  zones: function(callback) {
    this._get('/zones', {}, callback);
  },

  registerURL: function(domain, options) {
    var params = util.extract(options, ['registrar']);
    params.domain = domain;
    return this._url('/register', params);
  },

  _get: function(path, params, callback, failure) {
    var url = this.baseURL + path + '?' + util.qs(params || {}, this._key());
    ajax.getJSON(url, callback, failure);
  },

  _url: function (path, params) {
    return this.baseURL + path + '?' + util.qs(params || {}, this._key());
  },

  _key: function() {
    if (this.clientId) {
      return {
        client_id: this.clientId
      };
    }

    return {
      'mashape-key': this.mashapeKey
    };
  }
};

module.exports = Client;
