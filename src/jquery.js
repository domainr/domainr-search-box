'use strict';

var SearchBox = require('./search-box');
var util = require('./util');

if (window.jQuery) {
  var $ = window.jQuery;

  $.fn.domainrSearchBox = function(config) {
    this.each(function(i, el) {
      var searchBoxConfig = util.extract(config, ['clientId', 'mashapeKey',
        'renderWith', 'limit', 'registrar', 'defaults', 'onSelect']);

      searchBoxConfig.observe = el;

      if (config.renderTo) {
        var $el = $(config.renderTo);
        if ($el.length > 0) {
          searchBoxConfig.renderTo = $el[0];
        }
      }

      var searchBox = new domainr.SearchBox(searchBoxConfig);
    });

    return this;
  };
}
