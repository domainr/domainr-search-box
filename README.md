# Domainr Search Box

Drop-in [instant domain search](https://domainr.com/) for your site.

## Installation

Make sure you have [Node.js](https://nodejs.org/) and [NPM](https://www.npmjs.com/) installed.

Run `npm install domainr-search-box` to create a local copy of the module.

## Usage

From the `dist/` directory, include `domainr-search-box.min.js` and `domainr-search-box.css` on your page.

Add an empty `div` underneath your `input`; the Domainr Search Box will fill it with results.

To authenticate, use the API [for free via Mashape](https://www.mashape.com/nbio/domainr/) with your Mashape API key, or [contact us](mailto:partners@domainr.com) regarding high-volume usage.

### Plain JavaScript

```javascript
var box = new domainr.SearchBox({
    mashapeKey: yourMashapeKey, // your Mashape API key
    clientId: yourClientId, // your high-volume clientId; not needed if using Mashape
    observe: yourInputElement,
    renderTo: yourResultsElement,
    onSelect: function(result) { ... }
  });
```

### jQuery

```javascript
$('input#search')
  .domainrSearchBox({
    mashapeKey: yourMashapeKey, // your Mashape API key
    clientId: yourClientId, // or alternatively your Client ID; not needed if using Mashape
    renderTo: yourResultsElementOrSelector,
    onSelect: function(result) { ... }
  });
```

## Reference

### Plain JavaScript

#### SearchBox

Create a `domainr.SearchBox` with `new domainr.SearchBox(options)`. The `options` argument is an object with the following possible properties:

* `clientId`: Either this or `mashapeKey` are required.
* `mashapeKey`: Either this or `clientId` are required.
* `observe`: The DOM element to observe.
* `renderTo`: The DOM element to contain the rendered autocomplete.
* `renderWith`: A function that will render the autocomplete. It will receive a state object.
* `limit`: A number for the max number of results to display. Optional; default = 20.
* `registrar`: Registrar or Registry domain name, to limit search results to domains supported by a registrar or registry. e.g. `namecheap.com` or `donuts.co`
* `defaults`: Include the given default zones (an array of strings) in your search, e.g. `["coffee", "cafe", "organic"]`. Results will be sorted according to the order of this array.
* `onSelect`: An optional function to be called when the user selects a domain (if omitted, a new window will open with a recommended registrar for that result). Receives a single object with these properties:
  * `domain`
  * `host`
  * `path`
  * `registerURL`
  * `status`
  * `subdomain`
  * `zone`

#### Client

Create a `domainr.Client` with `new domainr.Client(options)`. The `options` argument is an object with the following possible properties:

* `clientId`: Either this or `mashapeKey` are required.
* `mashapeKey`: Either this or clientId are required.
* `baseURL`: Optional.

The `domainr.Client` has the following methods:

* `search(params, callback)`: Search with the given params and call the callback with the results upon completion. The `params` argument is an object with the following possible properties:
  * `defaults`: Comma-delimited string, e.g. `coffee,cafe,organic`
  * `location`: String, e.g. `de`
  * `query`: String.
  * `registrar`: String, e.g. `namecheap.com` or `donuts.co`
* `status(domains, callback)`: Call the `status` API with the given domains (an array) and call the callback with the results upon completion.
* `options(domain, callback)`: Call the `options` API with the given domain (a string) and call the callback with the results upon completion.
* `zones(callback)`: Call the `zones` API and call the callback with the results upon completion.
* `registerURL(domain, options)`: Returns a URL for registering the given domain (a string). The options parameter is an object; currently one property is accepted, `registrar`, to specify a specific registrar.

### jQuery

Select the element you want to observe and call `.domainrSearchBox(options)` on it. Possible options include:

* `clientId`: Either this or `mashapeKey` are required.
* `mashapeKey`: Either this or `clientId` are required.
* `renderTo`: Specification for which element to contain the rendered autocomplete. Can be anything jQuery will accept (selector, element, jQuery object).
* `renderWith`: A function that will render the autocomplete. It will receive a state object.
* `limit`: A number for the max number of results to display. Optional; default = 20.
* `registrar`: Registrar or Registry domain name, to limit search results to domains supported by a registrar or registry. e.g. `namecheap.com` or `donuts.co`
* `defaults`: Include the given default zones (an array of strings) in your search, e.g. `["coffee", "cafe", "organic"]`. Results will be sorted according to the order of this array.
* `onSelect`: An optional function to be called when the user selects a domain (if omitted, a new window will open with a recommended registrar for that result). Receives a single object with these properties:
  * `domain`
  * `host`
  * `path`
  * `registerURL`
  * `status`
  * `subdomain`
  * `zone`

## Development

You'll need to have [Node](https://nodejs.org/) and [Gulp](http://gulpjs.com/) installed.

* `npm install` to install dependencies
* `gulp build` to build the code.
* `gulp watch` to watch the code, building on changes.
* `gulp` builds + watch, and runs the demo in a webpage.

### Publishing new versions

- always increment the version
- `npm whoami` to see your current npm user
- `npm publish` to publish it

Note that the demo requires the code to be built. Also, you'll need to get a `mashapeKey` or `clientId` and set up a `config.js`; instructions are in `index.html`.

© 2015 Domain Research, LLC
