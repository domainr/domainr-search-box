# Domainr Search Box

Drop-in Domainr search for your site.

## Usage

Include `domainr-search-box.min.js` and `domainr-search-box.css` on your page.

Add an empty `div` underneath your `input`; the Domainr Search Box will fill it with results.

### Plain JavaScript

```javascript
var box = new domainr.SearchBox({
    clientId: yourClientId,
    observe: yourInputElement,
    renderTo: yourResultsElement,
    onSelect: function(result) { ... }
  });
```

### jQuery

```javascript
$('input#search')
  .domainrSearchBox({
    clientId: yourClientId,
    renderTo: yourResultsElementOrSelector,
    onSelect: function(result) { ... }
  });
```

## Reference

### Plain JavaScript

#### SearchBox

Create a `domainr.SearchBox` with `new domainr.SearchBox(options)`. The `options` argument is an object with the following possible properties:

* clientId: Either this or mashapeKey are required.
* mashapeKey: Either this or clientId are required.
* observe: The DOM element to observe.
* renderTo: The DOM element to contain the rendered autocomplete.
* renderWith: A function that will render the autocomplete. It will receive a state object.
* limit: A number for the max number of results to display.
* registrar: Limit the search to results applicable to just this registrar.
* defaults: Include the given default zones (an array of strings) in your search.
* onSelect: A function to be called when the user selects a domain. Receives a single object with these properties:
  * domain
  * host
  * path
  * registerURL
  * status
  * subdomain
  * zone

#### Client

Create a `domainr.Client` with `new domainr.Client(options)`. The `options` argument is an object with the following possible properties:

* clientId: Either this or mashapeKey are required.
* mashapeKey: Either this or clientId are required.
* baseURL: Optional.

The domainr.Client has the following methods:

* search(params, callback): Search with the given params and call the callback with the results upon completion. The `params` argument is an object with the following possible properties:
  * defaults: Comma-delimited string.
  * location: String.
  * query: String.
  * registrar: String.
* status(domains, callback): Call the `status` API with the given domains (an array) and call the callback with the results upon completion.
* options(domain, callback): Call the `options` API with the given domain (a string) and call the callback with the results upon completion.
* whois(domain, callback): Call the `whois` API with the given domain (a string) and call the callback with the results upon completion.
* zones(callback): Call the `zones` API and call the callback with the results upon completion.
* registerURL(domain): Returns a URL for registering the given domain (a string).

### jQuery

Select the element you want to observe and call `.domainrSearchBox(options)` on it. Possible options include:

* clientId: Either this or mashapeKey are required.
* mashapeKey: Either this or clientId are required.
* renderTo: Specification for which element to contain the rendered autocomplete. Can be anything jQuery will accept (selector, element, jQuery object).
* renderWith: A function that will render the autocomplete. It will receive a state object.
* limit: A number for the max number of results to display.
* registrar: Limit the search to results applicable to just this registrar.
* defaults: Include the given default zones (an array of strings) in your search.
* onSelect: A function to be called when the user selects a domain. Receives a single object with these properties:
  * domain
  * host
  * path
  * registerURL
  * status
  * subdomain
  * zone

## About

© 2015 nb.io, LLC
