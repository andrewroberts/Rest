// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - 16 March 2015 11:45 GMT
// JSCS - 16 March 2015 11:54 GMT

// Rest.gs
// =======
//
// Library for interacting with a RESTful API.

// Public Properties
// -----------------

var PROPERTY_RESTFUL_URL = 'Rest library API url';
var PROPERTY_RESTFUL_KEY = 'Rest library API key';

/**
 * Initialise the Rest library. Store the URL and API key persistenly
 * so this only needs to be called once.
 *
 * @param {string} api url
 * @param {string} api key
 * @param {boolean} overwrite whether or not to overwrite existing, defaults to false
 */

function init(url, key, overwrite) {

  if (typeof url === 'undefined' || typeof key === 'undefined') {

    throw new Error('init() parameter not defined');
  }

  if (typeof url !== 'string' || typeof key !== 'string') {

    throw new Error('init() parameter wrong type');
  }

  if (typeof overwrite === 'undefined') {
  
    overwrite = false;
  }
  
  // A library doesn't have it's own instance of the user properties
  // but uses those of the script that includes the library:
  // https://developers.google.com/apps-script/guide_libraries#scoping
  var properties = PropertiesService.getUserProperties();

  if (overwrite) {

    properties.setProperty(PROPERTY_RESTFUL_KEY, key);
    properties.setProperty(PROPERTY_RESTFUL_URL, url);

  } else {

    if (properties.getProperty(PROPERTY_RESTFUL_KEY) === null) {

      properties.setProperty(PROPERTY_RESTFUL_KEY, key);
    }

    if (properties.getProperty(PROPERTY_RESTFUL_URL) === null) {

      properties.setProperty(PROPERTY_RESTFUL_URL, url);
    }
  }

} // init()

/**
 * Do a HTTP GET
 *
 * @param {string} command
 * @param {string} query parameters
 */

function get(command, parameters) {

  var apiUrl = getConfig_().url;
  var apiKey = getConfig_().key;

  var and = parameters ? '&' : '';

  var url = apiUrl + command + '?api_key=' + apiKey + and + (parameters || '');

  var json = UrlFetchApp.fetch(url);
  var response = JSON.parse(json);
  return response;

} // Rest.get()

/**
 * Do a HTTP POST
 *
 * @param {string} command
 * @param {string} payload
 */

function post(command, payload) {

  var apiUrl = getConfig_().url;
  var apiKey = getConfig_().key;

  var options = {

    method: 'post',
    payload: payload,
  };

  var url = apiUrl + command  + '?api_key=' + apiKey;

  var json = UrlFetchApp.fetch(url, options);
  var response = JSON.parse(json);
  return response;

} // Rest.post()

/**
 * Do a HTTP PUT
 *
 * @param {string} command
 * @param {string} payload
 */

function put(command, payload) {

  var apiUrl = getConfig_().url;
  var apiKey = getConfig_().key;

  var options = {

    method: 'put',
    payload: payload,
  };

  var url = apiUrl + command  + '?api_key=' + apiKey;

  var json = UrlFetchApp.fetch(url, options);
  var response = JSON.parse(json);
  return response;

} // Rest.put()

/**
 * Do a HTTP DELETE
 *
 * @param {string} command
 * @param {string} payload
 */

function deleteAction(command, payload) {

  var apiUrl = getConfig_().url;
  var apiKey = getConfig_().key;

  var options = {

	method: 'delete',
    payload: payload,
  };

  var url = apiUrl + command  + '?api_key=' + apiKey;

  var json = UrlFetchApp.fetch(url, options);
  var response = JSON.parse(json);
  return response;

} // Rest.deleteAction()

/**
 * Generate a new signature
 *
 * @param {string} uri
 * @param {string} payload body
 * @param {string} private key guid string
 *
 * @return {number} binary signature
 */

function generateSignature(uri, body, privateKeyGuidString) {

  var shaObj = new jsSHA(uri + body, "TEXT");
  var privateKeyNoDashes = privateKeyGuidString.replace(/-/g,'');
  var signature = shaObj.getHMAC(privateKeyNoDashes, "HEX", "SHA-256", "HEX");

  return signature;
    
} // Rest.generateSignature()

/**
 * Convert object into a query string. From:
 * https://gist.github.com/dgs700/4677933
 *
 * @param {object} object
 *
 * @return {string} query string
 */

function serialize(a) {

  var prefix, s, add, name, r20, output;
  s = [];
  r20 = /%20/g;
  add = function (key, value) {
    // If value is a function, invoke it and return its value
    value = ( typeof value == 'function' ) ? value() : ( value == null ? "" : value );
    s[ s.length ] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
  };
  if (a instanceof Array) {
    for (name in a) {
      add(name, a[name]);
    }
  } else {
    for (prefix in a) {
      buildParams(prefix, a[ prefix ], add);
    }
  }
  output = s.join("&").replace(r20, "+");
  return output;
  
  // Private Functions
  // -----------------
  
  function buildParams(prefix, obj, add) {
    var name, i, l, rbracket;
    rbracket = /\[\]$/;
    if (obj instanceof Array) {
      for (i = 0, l = obj.length; i < l; i++) {
        if (rbracket.test(prefix)) {
          add(prefix, obj[i]);
        } else {
          buildParams(prefix + "[" + ( typeof obj[i] === "object" ? i : "" ) + "]", obj[i], add);
        }
      }
    } else if (typeof obj == "object") {
      // Serialize object item.
      for (name in obj) {
        buildParams(prefix + "[" + name + "]", obj[ name ], add);
      }
    } else {
      // Serialize scalar item.
      add(prefix, obj);
    }
    
  } // buildParams()
  
} // serialize()

// Private methods
// ---------------

/**
 * Return the config settings:
 *
 * @return {object} {url: <url>, api: <api>}
 */

function getConfig_() {

  var properties = PropertiesService.getUserProperties();

  var url = properties.getProperty(PROPERTY_RESTFUL_URL);
  var key = properties.getProperty(PROPERTY_RESTFUL_KEY);

  if (typeof url === null || typeof key === null) {

    throw new Error('init() has not been called yet');
  }

  return {url: url, key: key};

} // getConfig_()
