/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const JSON5 = __webpack_require__(6);

const specialValues = {
	"null": null,
	"true": true,
	"false": false
};

function parseQuery(query) {
	if(query.substr(0, 1) !== "?") {
		throw new Error("A valid query string passed to parseQuery should begin with '?'");
	}
	query = query.substr(1);
	if(!query) {
		return {};
	}
	if(query.substr(0, 1) === "{" && query.substr(-1) === "}") {
		return JSON5.parse(query);
	}
	const queryArgs = query.split(/[,&]/g);
	const result = {};
	queryArgs.forEach(arg => {
		const idx = arg.indexOf("=");
		if(idx >= 0) {
			let name = arg.substr(0, idx);
			let value = decodeURIComponent(arg.substr(idx + 1));
			if(specialValues.hasOwnProperty(value)) {
				value = specialValues[value];
			}
			if(name.substr(-2) === "[]") {
				name = decodeURIComponent(name.substr(0, name.length - 2));
				if(!Array.isArray(result[name]))
					result[name] = [];
				result[name].push(value);
			} else {
				name = decodeURIComponent(name);
				result[name] = value;
			}
		} else {
			if(arg.substr(0, 1) === "-") {
				result[decodeURIComponent(arg.substr(1))] = false;
			} else if(arg.substr(0, 1) === "+") {
				result[decodeURIComponent(arg.substr(1))] = true;
			} else {
				result[decodeURIComponent(arg)] = true;
			}
		}
	});
	return result;
}

module.exports = parseQuery;


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = require("path");

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const baseEncodeTables = {
	26: "abcdefghijklmnopqrstuvwxyz",
	32: "123456789abcdefghjkmnpqrstuvwxyz", // no 0lio
	36: "0123456789abcdefghijklmnopqrstuvwxyz",
	49: "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", // no lIO
	52: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	58: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", // no 0lIO
	62: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	64: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"
};

function encodeBufferToBase(buffer, base) {
	const encodeTable = baseEncodeTables[base];
	if(!encodeTable) throw new Error("Unknown encoding base" + base);

	const readLength = buffer.length;

	const Big = __webpack_require__(13);
	Big.RM = Big.DP = 0;
	let b = new Big(0);
	for(let i = readLength - 1; i >= 0; i--) {
		b = b.times(256).plus(buffer[i]);
	}

	let output = "";
	while(b.gt(0)) {
		output = encodeTable[b.mod(base)] + output;
		b = b.div(base);
	}

	Big.DP = 20;
	Big.RM = 1;

	return output;
}

function getHashDigest(buffer, hashType, digestType, maxLength) {
	hashType = hashType || "md5";
	maxLength = maxLength || 9999;
	const hash = __webpack_require__(14).createHash(hashType);
	hash.update(buffer);
	if(digestType === "base26" || digestType === "base32" || digestType === "base36" ||
		digestType === "base49" || digestType === "base52" || digestType === "base58" ||
		digestType === "base62" || digestType === "base64") {
		return encodeBufferToBase(hash.digest(), digestType.substr(4)).substr(0, maxLength);
	} else {
		return hash.digest(digestType || "hex").substr(0, maxLength);
	}
}

module.exports = getHashDigest;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const loader_utils_1 = __webpack_require__(4);
const emitter_1 = __webpack_require__(17);
const lexer_1 = __webpack_require__(18);
const parser_1 = __webpack_require__(19);
function default_1(source) {
    const options = loader_utils_1.getOptions(this);
    const emitter = new emitter_1.Emitter(options);
    const templateDeclaration = lexer_1.Lexer.tokenize(source);
    const rootNamespaceNode = parser_1.Parser.generateRootNamespaceNode(templateDeclaration);
    const targetTypeDeclaration = emitter.format(rootNamespaceNode);
    const callback = this.async();
    if (callback) {
        callback(null, targetTypeDeclaration);
    }
    return targetTypeDeclaration;
}
exports.default = default_1;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const getOptions = __webpack_require__(5);
const parseQuery = __webpack_require__(0);
const stringifyRequest = __webpack_require__(7);
const getRemainingRequest = __webpack_require__(8);
const getCurrentRequest = __webpack_require__(9);
const isUrlRequest = __webpack_require__(10);
const urlToRequest = __webpack_require__(11);
const parseString = __webpack_require__(12);
const getHashDigest = __webpack_require__(2);
const interpolateName = __webpack_require__(15);

exports.getOptions = getOptions;
exports.parseQuery = parseQuery;
exports.stringifyRequest = stringifyRequest;
exports.getRemainingRequest = getRemainingRequest;
exports.getCurrentRequest = getCurrentRequest;
exports.isUrlRequest = isUrlRequest;
exports.urlToRequest = urlToRequest;
exports.parseString = parseString;
exports.getHashDigest = getHashDigest;
exports.interpolateName = interpolateName;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const parseQuery = __webpack_require__(0);

function getOptions(loaderContext) {
	const query = loaderContext.query;
	if(typeof query === "string" && query !== "") {
		return parseQuery(loaderContext.query);
	}
	if(!query || typeof query !== "object") {
		// Not object-like queries are not supported.
		return null;
	}
	return query;
}

module.exports = getOptions;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

// json5.js
// Modern JSON. See README.md for details.
//
// This file is based directly off of Douglas Crockford's json_parse.js:
// https://github.com/douglascrockford/JSON-js/blob/master/json_parse.js

var JSON5 = ( true ? exports : {});

JSON5.parse = (function () {
    "use strict";

// This is a function that can parse a JSON5 text, producing a JavaScript
// data structure. It is a simple, recursive descent parser. It does not use
// eval or regular expressions, so it can be used as a model for implementing
// a JSON5 parser in other languages.

// We are defining the function inside of another function to avoid creating
// global variables.

    var at,           // The index of the current character
        lineNumber,   // The current line number
        columnNumber, // The current column number
        ch,           // The current character
        escapee = {
            "'":  "'",
            '"':  '"',
            '\\': '\\',
            '/':  '/',
            '\n': '',       // Replace escaped newlines in strings w/ empty string
            b:    '\b',
            f:    '\f',
            n:    '\n',
            r:    '\r',
            t:    '\t'
        },
        ws = [
            ' ',
            '\t',
            '\r',
            '\n',
            '\v',
            '\f',
            '\xA0',
            '\uFEFF'
        ],
        text,

        renderChar = function (chr) {
            return chr === '' ? 'EOF' : "'" + chr + "'";
        },

        error = function (m) {

// Call error when something is wrong.

            var error = new SyntaxError();
            // beginning of message suffix to agree with that provided by Gecko - see https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
            error.message = m + " at line " + lineNumber + " column " + columnNumber + " of the JSON5 data. Still to read: " + JSON.stringify(text.substring(at - 1, at + 19));
            error.at = at;
            // These two property names have been chosen to agree with the ones in Gecko, the only popular
            // environment which seems to supply this info on JSON.parse
            error.lineNumber = lineNumber;
            error.columnNumber = columnNumber;
            throw error;
        },

        next = function (c) {

// If a c parameter is provided, verify that it matches the current character.

            if (c && c !== ch) {
                error("Expected " + renderChar(c) + " instead of " + renderChar(ch));
            }

// Get the next character. When there are no more characters,
// return the empty string.

            ch = text.charAt(at);
            at++;
            columnNumber++;
            if (ch === '\n' || ch === '\r' && peek() !== '\n') {
                lineNumber++;
                columnNumber = 0;
            }
            return ch;
        },

        peek = function () {

// Get the next character without consuming it or
// assigning it to the ch varaible.

            return text.charAt(at);
        },

        identifier = function () {

// Parse an identifier. Normally, reserved words are disallowed here, but we
// only use this for unquoted object keys, where reserved words are allowed,
// so we don't check for those here. References:
// - http://es5.github.com/#x7.6
// - https://developer.mozilla.org/en/Core_JavaScript_1.5_Guide/Core_Language_Features#Variables
// - http://docstore.mik.ua/orelly/webprog/jscript/ch02_07.htm
// TODO Identifiers can have Unicode "letters" in them; add support for those.

            var key = ch;

            // Identifiers must start with a letter, _ or $.
            if ((ch !== '_' && ch !== '$') &&
                    (ch < 'a' || ch > 'z') &&
                    (ch < 'A' || ch > 'Z')) {
                error("Bad identifier as unquoted key");
            }

            // Subsequent characters can contain digits.
            while (next() && (
                    ch === '_' || ch === '$' ||
                    (ch >= 'a' && ch <= 'z') ||
                    (ch >= 'A' && ch <= 'Z') ||
                    (ch >= '0' && ch <= '9'))) {
                key += ch;
            }

            return key;
        },

        number = function () {

// Parse a number value.

            var number,
                sign = '',
                string = '',
                base = 10;

            if (ch === '-' || ch === '+') {
                sign = ch;
                next(ch);
            }

            // support for Infinity (could tweak to allow other words):
            if (ch === 'I') {
                number = word();
                if (typeof number !== 'number' || isNaN(number)) {
                    error('Unexpected word for number');
                }
                return (sign === '-') ? -number : number;
            }

            // support for NaN
            if (ch === 'N' ) {
              number = word();
              if (!isNaN(number)) {
                error('expected word to be NaN');
              }
              // ignore sign as -NaN also is NaN
              return number;
            }

            if (ch === '0') {
                string += ch;
                next();
                if (ch === 'x' || ch === 'X') {
                    string += ch;
                    next();
                    base = 16;
                } else if (ch >= '0' && ch <= '9') {
                    error('Octal literal');
                }
            }

            switch (base) {
            case 10:
                while (ch >= '0' && ch <= '9' ) {
                    string += ch;
                    next();
                }
                if (ch === '.') {
                    string += '.';
                    while (next() && ch >= '0' && ch <= '9') {
                        string += ch;
                    }
                }
                if (ch === 'e' || ch === 'E') {
                    string += ch;
                    next();
                    if (ch === '-' || ch === '+') {
                        string += ch;
                        next();
                    }
                    while (ch >= '0' && ch <= '9') {
                        string += ch;
                        next();
                    }
                }
                break;
            case 16:
                while (ch >= '0' && ch <= '9' || ch >= 'A' && ch <= 'F' || ch >= 'a' && ch <= 'f') {
                    string += ch;
                    next();
                }
                break;
            }

            if(sign === '-') {
                number = -string;
            } else {
                number = +string;
            }

            if (!isFinite(number)) {
                error("Bad number");
            } else {
                return number;
            }
        },

        string = function () {

// Parse a string value.

            var hex,
                i,
                string = '',
                delim,      // double quote or single quote
                uffff;

// When parsing for string values, we must look for ' or " and \ characters.

            if (ch === '"' || ch === "'") {
                delim = ch;
                while (next()) {
                    if (ch === delim) {
                        next();
                        return string;
                    } else if (ch === '\\') {
                        next();
                        if (ch === 'u') {
                            uffff = 0;
                            for (i = 0; i < 4; i += 1) {
                                hex = parseInt(next(), 16);
                                if (!isFinite(hex)) {
                                    break;
                                }
                                uffff = uffff * 16 + hex;
                            }
                            string += String.fromCharCode(uffff);
                        } else if (ch === '\r') {
                            if (peek() === '\n') {
                                next();
                            }
                        } else if (typeof escapee[ch] === 'string') {
                            string += escapee[ch];
                        } else {
                            break;
                        }
                    } else if (ch === '\n') {
                        // unescaped newlines are invalid; see:
                        // https://github.com/aseemk/json5/issues/24
                        // TODO this feels special-cased; are there other
                        // invalid unescaped chars?
                        break;
                    } else {
                        string += ch;
                    }
                }
            }
            error("Bad string");
        },

        inlineComment = function () {

// Skip an inline comment, assuming this is one. The current character should
// be the second / character in the // pair that begins this inline comment.
// To finish the inline comment, we look for a newline or the end of the text.

            if (ch !== '/') {
                error("Not an inline comment");
            }

            do {
                next();
                if (ch === '\n' || ch === '\r') {
                    next();
                    return;
                }
            } while (ch);
        },

        blockComment = function () {

// Skip a block comment, assuming this is one. The current character should be
// the * character in the /* pair that begins this block comment.
// To finish the block comment, we look for an ending */ pair of characters,
// but we also watch for the end of text before the comment is terminated.

            if (ch !== '*') {
                error("Not a block comment");
            }

            do {
                next();
                while (ch === '*') {
                    next('*');
                    if (ch === '/') {
                        next('/');
                        return;
                    }
                }
            } while (ch);

            error("Unterminated block comment");
        },

        comment = function () {

// Skip a comment, whether inline or block-level, assuming this is one.
// Comments always begin with a / character.

            if (ch !== '/') {
                error("Not a comment");
            }

            next('/');

            if (ch === '/') {
                inlineComment();
            } else if (ch === '*') {
                blockComment();
            } else {
                error("Unrecognized comment");
            }
        },

        white = function () {

// Skip whitespace and comments.
// Note that we're detecting comments by only a single / character.
// This works since regular expressions are not valid JSON(5), but this will
// break if there are other valid values that begin with a / character!

            while (ch) {
                if (ch === '/') {
                    comment();
                } else if (ws.indexOf(ch) >= 0) {
                    next();
                } else {
                    return;
                }
            }
        },

        word = function () {

// true, false, or null.

            switch (ch) {
            case 't':
                next('t');
                next('r');
                next('u');
                next('e');
                return true;
            case 'f':
                next('f');
                next('a');
                next('l');
                next('s');
                next('e');
                return false;
            case 'n':
                next('n');
                next('u');
                next('l');
                next('l');
                return null;
            case 'I':
                next('I');
                next('n');
                next('f');
                next('i');
                next('n');
                next('i');
                next('t');
                next('y');
                return Infinity;
            case 'N':
              next( 'N' );
              next( 'a' );
              next( 'N' );
              return NaN;
            }
            error("Unexpected " + renderChar(ch));
        },

        value,  // Place holder for the value function.

        array = function () {

// Parse an array value.

            var array = [];

            if (ch === '[') {
                next('[');
                white();
                while (ch) {
                    if (ch === ']') {
                        next(']');
                        return array;   // Potentially empty array
                    }
                    // ES5 allows omitting elements in arrays, e.g. [,] and
                    // [,null]. We don't allow this in JSON5.
                    if (ch === ',') {
                        error("Missing array element");
                    } else {
                        array.push(value());
                    }
                    white();
                    // If there's no comma after this value, this needs to
                    // be the end of the array.
                    if (ch !== ',') {
                        next(']');
                        return array;
                    }
                    next(',');
                    white();
                }
            }
            error("Bad array");
        },

        object = function () {

// Parse an object value.

            var key,
                object = {};

            if (ch === '{') {
                next('{');
                white();
                while (ch) {
                    if (ch === '}') {
                        next('}');
                        return object;   // Potentially empty object
                    }

                    // Keys can be unquoted. If they are, they need to be
                    // valid JS identifiers.
                    if (ch === '"' || ch === "'") {
                        key = string();
                    } else {
                        key = identifier();
                    }

                    white();
                    next(':');
                    object[key] = value();
                    white();
                    // If there's no comma after this pair, this needs to be
                    // the end of the object.
                    if (ch !== ',') {
                        next('}');
                        return object;
                    }
                    next(',');
                    white();
                }
            }
            error("Bad object");
        };

    value = function () {

// Parse a JSON value. It could be an object, an array, a string, a number,
// or a word.

        white();
        switch (ch) {
        case '{':
            return object();
        case '[':
            return array();
        case '"':
        case "'":
            return string();
        case '-':
        case '+':
        case '.':
            return number();
        default:
            return ch >= '0' && ch <= '9' ? number() : word();
        }
    };

// Return the json_parse function. It will have access to all of the above
// functions and variables.

    return function (source, reviver) {
        var result;

        text = String(source);
        at = 0;
        lineNumber = 1;
        columnNumber = 1;
        ch = ' ';
        result = value();
        white();
        if (ch) {
            error("Syntax error");
        }

// If there is a reviver function, we recursively walk the new structure,
// passing each name/value pair to the reviver function for possible
// transformation, starting with a temporary root object that holds the result
// in an empty key. If there is not a reviver function, we simply return the
// result.

        return typeof reviver === 'function' ? (function walk(holder, key) {
            var k, v, value = holder[key];
            if (value && typeof value === 'object') {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = walk(value, k);
                        if (v !== undefined) {
                            value[k] = v;
                        } else {
                            delete value[k];
                        }
                    }
                }
            }
            return reviver.call(holder, key, value);
        }({'': result}, '')) : result;
    };
}());

// JSON5 stringify will not quote keys where appropriate
JSON5.stringify = function (obj, replacer, space) {
    if (replacer && (typeof(replacer) !== "function" && !isArray(replacer))) {
        throw new Error('Replacer must be a function or an array');
    }
    var getReplacedValueOrUndefined = function(holder, key, isTopLevel) {
        var value = holder[key];

        // Replace the value with its toJSON value first, if possible
        if (value && value.toJSON && typeof value.toJSON === "function") {
            value = value.toJSON();
        }

        // If the user-supplied replacer if a function, call it. If it's an array, check objects' string keys for
        // presence in the array (removing the key/value pair from the resulting JSON if the key is missing).
        if (typeof(replacer) === "function") {
            return replacer.call(holder, key, value);
        } else if(replacer) {
            if (isTopLevel || isArray(holder) || replacer.indexOf(key) >= 0) {
                return value;
            } else {
                return undefined;
            }
        } else {
            return value;
        }
    };

    function isWordChar(c) {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            (c >= '0' && c <= '9') ||
            c === '_' || c === '$';
    }

    function isWordStart(c) {
        return (c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z') ||
            c === '_' || c === '$';
    }

    function isWord(key) {
        if (typeof key !== 'string') {
            return false;
        }
        if (!isWordStart(key[0])) {
            return false;
        }
        var i = 1, length = key.length;
        while (i < length) {
            if (!isWordChar(key[i])) {
                return false;
            }
            i++;
        }
        return true;
    }

    // export for use in tests
    JSON5.isWord = isWord;

    // polyfills
    function isArray(obj) {
        if (Array.isArray) {
            return Array.isArray(obj);
        } else {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
    }

    function isDate(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    var objStack = [];
    function checkForCircular(obj) {
        for (var i = 0; i < objStack.length; i++) {
            if (objStack[i] === obj) {
                throw new TypeError("Converting circular structure to JSON");
            }
        }
    }

    function makeIndent(str, num, noNewLine) {
        if (!str) {
            return "";
        }
        // indentation no more than 10 chars
        if (str.length > 10) {
            str = str.substring(0, 10);
        }

        var indent = noNewLine ? "" : "\n";
        for (var i = 0; i < num; i++) {
            indent += str;
        }

        return indent;
    }

    var indentStr;
    if (space) {
        if (typeof space === "string") {
            indentStr = space;
        } else if (typeof space === "number" && space >= 0) {
            indentStr = makeIndent(" ", space, true);
        } else {
            // ignore space parameter
        }
    }

    // Copied from Crokford's implementation of JSON
    // See https://github.com/douglascrockford/JSON-js/blob/e39db4b7e6249f04a195e7dd0840e610cc9e941e/json2.js#L195
    // Begin
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = { // table of character substitutions
        '\b': '\\b',
        '\t': '\\t',
        '\n': '\\n',
        '\f': '\\f',
        '\r': '\\r',
        '"' : '\\"',
        '\\': '\\\\'
    };
    function escapeString(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ?
                c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }
    // End

    function internalStringify(holder, key, isTopLevel) {
        var buffer, res;

        // Replace the value, if necessary
        var obj_part = getReplacedValueOrUndefined(holder, key, isTopLevel);

        if (obj_part && !isDate(obj_part)) {
            // unbox objects
            // don't unbox dates, since will turn it into number
            obj_part = obj_part.valueOf();
        }
        switch(typeof obj_part) {
            case "boolean":
                return obj_part.toString();

            case "number":
                if (isNaN(obj_part) || !isFinite(obj_part)) {
                    return "null";
                }
                return obj_part.toString();

            case "string":
                return escapeString(obj_part.toString());

            case "object":
                if (obj_part === null) {
                    return "null";
                } else if (isArray(obj_part)) {
                    checkForCircular(obj_part);
                    buffer = "[";
                    objStack.push(obj_part);

                    for (var i = 0; i < obj_part.length; i++) {
                        res = internalStringify(obj_part, i, false);
                        buffer += makeIndent(indentStr, objStack.length);
                        if (res === null || typeof res === "undefined") {
                            buffer += "null";
                        } else {
                            buffer += res;
                        }
                        if (i < obj_part.length-1) {
                            buffer += ",";
                        } else if (indentStr) {
                            buffer += "\n";
                        }
                    }
                    objStack.pop();
                    if (obj_part.length) {
                        buffer += makeIndent(indentStr, objStack.length, true)
                    }
                    buffer += "]";
                } else {
                    checkForCircular(obj_part);
                    buffer = "{";
                    var nonEmpty = false;
                    objStack.push(obj_part);
                    for (var prop in obj_part) {
                        if (obj_part.hasOwnProperty(prop)) {
                            var value = internalStringify(obj_part, prop, false);
                            isTopLevel = false;
                            if (typeof value !== "undefined" && value !== null) {
                                buffer += makeIndent(indentStr, objStack.length);
                                nonEmpty = true;
                                key = isWord(prop) ? prop : escapeString(prop);
                                buffer += key + ":" + (indentStr ? ' ' : '') + value + ",";
                            }
                        }
                    }
                    objStack.pop();
                    if (nonEmpty) {
                        buffer = buffer.substring(0, buffer.length-1) + makeIndent(indentStr, objStack.length) + "}";
                    } else {
                        buffer = '{}';
                    }
                }
                return buffer;
            default:
                // functions and undefined should be ignored
                return undefined;
        }
    }

    // special case...when undefined is used inside of
    // a compound object/array, return null.
    // but when top-level, return undefined
    var topLevelHolder = {"":obj};
    if (obj === undefined) {
        return getReplacedValueOrUndefined(topLevelHolder, '', true);
    }
    return internalStringify(topLevelHolder, '', true);
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const path = __webpack_require__(1);

const matchRelativePath = /^\.\.?[/\\]/;

function isAbsolutePath(str) {
	return path.posix.isAbsolute(str) || path.win32.isAbsolute(str);
}

function isRelativePath(str) {
	return matchRelativePath.test(str);
}

function stringifyRequest(loaderContext, request) {
	const splitted = request.split("!");
	const context = loaderContext.context || (loaderContext.options && loaderContext.options.context);
	return JSON.stringify(splitted.map(part => {
		// First, separate singlePath from query, because the query might contain paths again
		const splittedPart = part.match(/^(.*?)(\?.*)/);
		let singlePath = splittedPart ? splittedPart[1] : part;
		const query = splittedPart ? splittedPart[2] : "";
		if(isAbsolutePath(singlePath) && context) {
			singlePath = path.relative(context, singlePath);
			if(isAbsolutePath(singlePath)) {
				// If singlePath still matches an absolute path, singlePath was on a different drive than context.
				// In this case, we leave the path platform-specific without replacing any separators.
				// @see https://github.com/webpack/loader-utils/pull/14
				return singlePath + query;
			}
			if(isRelativePath(singlePath) === false) {
				// Ensure that the relative path starts at least with ./ otherwise it would be a request into the modules directory (like node_modules).
				singlePath = "./" + singlePath;
			}
		}
		return singlePath.replace(/\\/g, "/") + query;
	}).join("!"));
}

module.exports = stringifyRequest;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function getRemainingRequest(loaderContext) {
	if(loaderContext.remainingRequest)
		return loaderContext.remainingRequest;
	const request = loaderContext.loaders
		.slice(loaderContext.loaderIndex + 1)
		.map(obj => obj.request)
		.concat([loaderContext.resource]);
	return request.join("!");
}

module.exports = getRemainingRequest;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function getCurrentRequest(loaderContext) {
	if(loaderContext.currentRequest)
		return loaderContext.currentRequest;
	const request = loaderContext.loaders
		.slice(loaderContext.loaderIndex)
		.map(obj => obj.request)
		.concat([loaderContext.resource]);
	return request.join("!");
}

module.exports = getCurrentRequest;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function isUrlRequest(url, root) {
	// An URL is not an request if
	// 1. it's a Data Url
	// 2. it's an absolute url or and protocol-relative
	// 3. it's some kind of url for a template
	if(/^data:|^chrome-extension:|^(https?:)?\/\/|^[\{\}\[\]#*;,'§\$%&\(=?`´\^°<>]/.test(url)) return false;
	// 4. It's also not an request if root isn't set and it's a root-relative url
	if((root === undefined || root === false) && /^\//.test(url)) return false;
	return true;
}

module.exports = isUrlRequest;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// we can't use path.win32.isAbsolute because it also matches paths starting with a forward slash
const matchNativeWin32Path = /^[A-Z]:[/\\]|^\\\\/i;

function urlToRequest(url, root) {
	const moduleRequestRegex = /^[^?]*~/;
	let request;

	if(matchNativeWin32Path.test(url)) {
		// absolute windows path, keep it
		request = url;
	} else if(root !== undefined && root !== false && /^\//.test(url)) {
		// if root is set and the url is root-relative
		switch(typeof root) {
			// 1. root is a string: root is prefixed to the url
			case "string":
				// special case: `~` roots convert to module request
				if(moduleRequestRegex.test(root)) {
					request = root.replace(/([^~\/])$/, "$1/") + url.slice(1);
				} else {
					request = root + url;
				}
				break;
			// 2. root is `true`: absolute paths are allowed
			//    *nix only, windows-style absolute paths are always allowed as they doesn't start with a `/`
			case "boolean":
				request = url;
				break;
			default:
				throw new Error("Unexpected parameters to loader-utils 'urlToRequest': url = " + url + ", root = " + root + ".");
		}
	} else if(/^\.\.?\//.test(url)) {
		// A relative url stays
		request = url;
	} else {
		// every other url is threaded like a relative url
		request = "./" + url;
	}

	// A `~` makes the url an module
	if(moduleRequestRegex.test(request)) {
		request = request.replace(moduleRequestRegex, "");
	}

	return request;
}

module.exports = urlToRequest;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


function parseString(str) {
	try {
		if(str[0] === "\"") return JSON.parse(str);
		if(str[0] === "'" && str.substr(str.length - 1) === "'") {
			return parseString(
				str
					.replace(/\\.|"/g, x => x === "\"" ? "\\\"" : x)
					.replace(/^'|'$/g, "\"")
			);
		}
		return JSON.parse("\"" + str + "\"");
	} catch(e) {
		return str;
	}
}

module.exports = parseString;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/* big.js v3.1.3 https://github.com/MikeMcl/big.js/LICENCE */
;(function (global) {
    'use strict';

/*
  big.js v3.1.3
  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
  https://github.com/MikeMcl/big.js/
  Copyright (c) 2014 Michael Mclaughlin <M8ch88l@gmail.com>
  MIT Expat Licence
*/

/***************************** EDITABLE DEFAULTS ******************************/

    // The default values below must be integers within the stated ranges.

    /*
     * The maximum number of decimal places of the results of operations
     * involving division: div and sqrt, and pow with negative exponents.
     */
    var DP = 20,                           // 0 to MAX_DP

        /*
         * The rounding mode used when rounding to the above decimal places.
         *
         * 0 Towards zero (i.e. truncate, no rounding).       (ROUND_DOWN)
         * 1 To nearest neighbour. If equidistant, round up.  (ROUND_HALF_UP)
         * 2 To nearest neighbour. If equidistant, to even.   (ROUND_HALF_EVEN)
         * 3 Away from zero.                                  (ROUND_UP)
         */
        RM = 1,                            // 0, 1, 2 or 3

        // The maximum value of DP and Big.DP.
        MAX_DP = 1E6,                      // 0 to 1000000

        // The maximum magnitude of the exponent argument to the pow method.
        MAX_POWER = 1E6,                   // 1 to 1000000

        /*
         * The exponent value at and beneath which toString returns exponential
         * notation.
         * JavaScript's Number type: -7
         * -1000000 is the minimum recommended exponent value of a Big.
         */
        E_NEG = -7,                   // 0 to -1000000

        /*
         * The exponent value at and above which toString returns exponential
         * notation.
         * JavaScript's Number type: 21
         * 1000000 is the maximum recommended exponent value of a Big.
         * (This limit is not enforced or checked.)
         */
        E_POS = 21,                   // 0 to 1000000

/******************************************************************************/

        // The shared prototype object.
        P = {},
        isValid = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        Big;


    /*
     * Create and return a Big constructor.
     *
     */
    function bigFactory() {

        /*
         * The Big constructor and exported function.
         * Create and return a new instance of a Big number object.
         *
         * n {number|string|Big} A numeric value.
         */
        function Big(n) {
            var x = this;

            // Enable constructor usage without new.
            if (!(x instanceof Big)) {
                return n === void 0 ? bigFactory() : new Big(n);
            }

            // Duplicate.
            if (n instanceof Big) {
                x.s = n.s;
                x.e = n.e;
                x.c = n.c.slice();
            } else {
                parse(x, n);
            }

            /*
             * Retain a reference to this Big constructor, and shadow
             * Big.prototype.constructor which points to Object.
             */
            x.constructor = Big;
        }

        Big.prototype = P;
        Big.DP = DP;
        Big.RM = RM;
        Big.E_NEG = E_NEG;
        Big.E_POS = E_POS;

        return Big;
    }


    // Private functions


    /*
     * Return a string representing the value of Big x in normal or exponential
     * notation to dp fixed decimal places or significant digits.
     *
     * x {Big} The Big to format.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * toE {number} 1 (toExponential), 2 (toPrecision) or undefined (toFixed).
     */
    function format(x, dp, toE) {
        var Big = x.constructor,

            // The index (normal notation) of the digit that may be rounded up.
            i = dp - (x = new Big(x)).e,
            c = x.c;

        // Round?
        if (c.length > ++dp) {
            rnd(x, i, Big.RM);
        }

        if (!c[0]) {
            ++i;
        } else if (toE) {
            i = dp;

        // toFixed
        } else {
            c = x.c;

            // Recalculate i as x.e may have changed if value rounded up.
            i = x.e + i + 1;
        }

        // Append zeros?
        for (; c.length < i; c.push(0)) {
        }
        i = x.e;

        /*
         * toPrecision returns exponential notation if the number of
         * significant digits specified is less than the number of digits
         * necessary to represent the integer part of the value in normal
         * notation.
         */
        return toE === 1 || toE && (dp <= i || i <= Big.E_NEG) ?

          // Exponential notation.
          (x.s < 0 && c[0] ? '-' : '') +
            (c.length > 1 ? c[0] + '.' + c.join('').slice(1) : c[0]) +
              (i < 0 ? 'e' : 'e+') + i

          // Normal notation.
          : x.toString();
    }


    /*
     * Parse the number or string value passed to a Big constructor.
     *
     * x {Big} A Big number instance.
     * n {number|string} A numeric value.
     */
    function parse(x, n) {
        var e, i, nL;

        // Minus zero?
        if (n === 0 && 1 / n < 0) {
            n = '-0';

        // Ensure n is string and check validity.
        } else if (!isValid.test(n += '')) {
            throwErr(NaN);
        }

        // Determine sign.
        x.s = n.charAt(0) == '-' ? (n = n.slice(1), -1) : 1;

        // Decimal point?
        if ((e = n.indexOf('.')) > -1) {
            n = n.replace('.', '');
        }

        // Exponential form?
        if ((i = n.search(/e/i)) > 0) {

            // Determine exponent.
            if (e < 0) {
                e = i;
            }
            e += +n.slice(i + 1);
            n = n.substring(0, i);

        } else if (e < 0) {

            // Integer.
            e = n.length;
        }

        nL = n.length;

        // Determine leading zeros.
        for (i = 0; i < nL && n.charAt(i) == '0'; i++) {
        }

        if (i == nL) {

            // Zero.
            x.c = [ x.e = 0 ];
        } else {

            // Determine trailing zeros.
            for (; nL > 0 && n.charAt(--nL) == '0';) {
            }

            x.e = e - i - 1;
            x.c = [];

            // Convert string to array of digits without leading/trailing zeros.
            //for (e = 0; i <= nL; x.c[e++] = +n.charAt(i++)) {
            for (; i <= nL; x.c.push(+n.charAt(i++))) {
            }
        }

        return x;
    }


    /*
     * Round Big x to a maximum of dp decimal places using rounding mode rm.
     * Called by div, sqrt and round.
     *
     * x {Big} The Big to round.
     * dp {number} Integer, 0 to MAX_DP inclusive.
     * rm {number} 0, 1, 2 or 3 (DOWN, HALF_UP, HALF_EVEN, UP)
     * [more] {boolean} Whether the result of division was truncated.
     */
    function rnd(x, dp, rm, more) {
        var u,
            xc = x.c,
            i = x.e + dp + 1;

        if (rm === 1) {

            // xc[i] is the digit after the digit that may be rounded up.
            more = xc[i] >= 5;
        } else if (rm === 2) {
            more = xc[i] > 5 || xc[i] == 5 &&
              (more || i < 0 || xc[i + 1] !== u || xc[i - 1] & 1);
        } else if (rm === 3) {
            more = more || xc[i] !== u || i < 0;
        } else {
            more = false;

            if (rm !== 0) {
                throwErr('!Big.RM!');
            }
        }

        if (i < 1 || !xc[0]) {

            if (more) {

                // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                x.e = -dp;
                x.c = [1];
            } else {

                // Zero.
                x.c = [x.e = 0];
            }
        } else {

            // Remove any digits after the required decimal places.
            xc.length = i--;

            // Round up?
            if (more) {

                // Rounding up may mean the previous digit has to be rounded up.
                for (; ++xc[i] > 9;) {
                    xc[i] = 0;

                    if (!i--) {
                        ++x.e;
                        xc.unshift(1);
                    }
                }
            }

            // Remove trailing zeros.
            for (i = xc.length; !xc[--i]; xc.pop()) {
            }
        }

        return x;
    }


    /*
     * Throw a BigError.
     *
     * message {string} The error message.
     */
    function throwErr(message) {
        var err = new Error(message);
        err.name = 'BigError';

        throw err;
    }


    // Prototype/instance methods


    /*
     * Return a new Big whose value is the absolute value of this Big.
     */
    P.abs = function () {
        var x = new this.constructor(this);
        x.s = 1;

        return x;
    };


    /*
     * Return
     * 1 if the value of this Big is greater than the value of Big y,
     * -1 if the value of this Big is less than the value of Big y, or
     * 0 if they have the same value.
    */
    P.cmp = function (y) {
        var xNeg,
            x = this,
            xc = x.c,
            yc = (y = new x.constructor(y)).c,
            i = x.s,
            j = y.s,
            k = x.e,
            l = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {
            return !xc[0] ? !yc[0] ? 0 : -j : i;
        }

        // Signs differ?
        if (i != j) {
            return i;
        }
        xNeg = i < 0;

        // Compare exponents.
        if (k != l) {
            return k > l ^ xNeg ? 1 : -1;
        }

        i = -1;
        j = (k = xc.length) < (l = yc.length) ? k : l;

        // Compare digit by digit.
        for (; ++i < j;) {

            if (xc[i] != yc[i]) {
                return xc[i] > yc[i] ^ xNeg ? 1 : -1;
            }
        }

        // Compare lengths.
        return k == l ? 0 : k > l ^ xNeg ? 1 : -1;
    };


    /*
     * Return a new Big whose value is the value of this Big divided by the
     * value of Big y, rounded, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     */
    P.div = function (y) {
        var x = this,
            Big = x.constructor,
            // dividend
            dvd = x.c,
            //divisor
            dvs = (y = new Big(y)).c,
            s = x.s == y.s ? 1 : -1,
            dp = Big.DP;

        if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!Big.DP!');
        }

        // Either 0?
        if (!dvd[0] || !dvs[0]) {

            // If both are 0, throw NaN
            if (dvd[0] == dvs[0]) {
                throwErr(NaN);
            }

            // If dvs is 0, throw +-Infinity.
            if (!dvs[0]) {
                throwErr(s / 0);
            }

            // dvd is 0, return +-0.
            return new Big(s * 0);
        }

        var dvsL, dvsT, next, cmp, remI, u,
            dvsZ = dvs.slice(),
            dvdI = dvsL = dvs.length,
            dvdL = dvd.length,
            // remainder
            rem = dvd.slice(0, dvsL),
            remL = rem.length,
            // quotient
            q = y,
            qc = q.c = [],
            qi = 0,
            digits = dp + (q.e = x.e - y.e) + 1;

        q.s = s;
        s = digits < 0 ? 0 : digits;

        // Create version of divisor with leading zero.
        dvsZ.unshift(0);

        // Add zeros to make remainder as long as divisor.
        for (; remL++ < dvsL; rem.push(0)) {
        }

        do {

            // 'next' is how many times the divisor goes into current remainder.
            for (next = 0; next < 10; next++) {

                // Compare divisor and remainder.
                if (dvsL != (remL = rem.length)) {
                    cmp = dvsL > remL ? 1 : -1;
                } else {

                    for (remI = -1, cmp = 0; ++remI < dvsL;) {

                        if (dvs[remI] != rem[remI]) {
                            cmp = dvs[remI] > rem[remI] ? 1 : -1;
                            break;
                        }
                    }
                }

                // If divisor < remainder, subtract divisor from remainder.
                if (cmp < 0) {

                    // Remainder can't be more than 1 digit longer than divisor.
                    // Equalise lengths using divisor with extra leading zero?
                    for (dvsT = remL == dvsL ? dvs : dvsZ; remL;) {

                        if (rem[--remL] < dvsT[remL]) {
                            remI = remL;

                            for (; remI && !rem[--remI]; rem[remI] = 9) {
                            }
                            --rem[remI];
                            rem[remL] += 10;
                        }
                        rem[remL] -= dvsT[remL];
                    }
                    for (; !rem[0]; rem.shift()) {
                    }
                } else {
                    break;
                }
            }

            // Add the 'next' digit to the result array.
            qc[qi++] = cmp ? next : ++next;

            // Update the remainder.
            if (rem[0] && cmp) {
                rem[remL] = dvd[dvdI] || 0;
            } else {
                rem = [ dvd[dvdI] ];
            }

        } while ((dvdI++ < dvdL || rem[0] !== u) && s--);

        // Leading zero? Do not remove if result is simply zero (qi == 1).
        if (!qc[0] && qi != 1) {

            // There can't be more than one zero.
            qc.shift();
            q.e--;
        }

        // Round?
        if (qi > digits) {
            rnd(q, dp, Big.RM, rem[0] !== u);
        }

        return q;
    };


    /*
     * Return true if the value of this Big is equal to the value of Big y,
     * otherwise returns false.
     */
    P.eq = function (y) {
        return !this.cmp(y);
    };


    /*
     * Return true if the value of this Big is greater than the value of Big y,
     * otherwise returns false.
     */
    P.gt = function (y) {
        return this.cmp(y) > 0;
    };


    /*
     * Return true if the value of this Big is greater than or equal to the
     * value of Big y, otherwise returns false.
     */
    P.gte = function (y) {
        return this.cmp(y) > -1;
    };


    /*
     * Return true if the value of this Big is less than the value of Big y,
     * otherwise returns false.
     */
    P.lt = function (y) {
        return this.cmp(y) < 0;
    };


    /*
     * Return true if the value of this Big is less than or equal to the value
     * of Big y, otherwise returns false.
     */
    P.lte = function (y) {
         return this.cmp(y) < 1;
    };


    /*
     * Return a new Big whose value is the value of this Big minus the value
     * of Big y.
     */
    P.sub = P.minus = function (y) {
        var i, j, t, xLTy,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.plus(y);
        }

        var xc = x.c.slice(),
            xe = x.e,
            yc = y.c,
            ye = y.e;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? (y.s = -b, y) : new Big(xc[0] ? x : 0);
        }

        // Determine which is the bigger number.
        // Prepend zeros to equalise exponents.
        if (a = xe - ye) {

            if (xLTy = a < 0) {
                a = -a;
                t = xc;
            } else {
                ye = xe;
                t = yc;
            }

            t.reverse();
            for (b = a; b--; t.push(0)) {
            }
            t.reverse();
        } else {

            // Exponents equal. Check digit by digit.
            j = ((xLTy = xc.length < yc.length) ? xc : yc).length;

            for (a = b = 0; b < j; b++) {

                if (xc[b] != yc[b]) {
                    xLTy = xc[b] < yc[b];
                    break;
                }
            }
        }

        // x < y? Point xc to the array of the bigger number.
        if (xLTy) {
            t = xc;
            xc = yc;
            yc = t;
            y.s = -y.s;
        }

        /*
         * Append zeros to xc if shorter. No need to add zeros to yc if shorter
         * as subtraction only needs to start at yc.length.
         */
        if (( b = (j = yc.length) - (i = xc.length) ) > 0) {

            for (; b--; xc[i++] = 0) {
            }
        }

        // Subtract yc from xc.
        for (b = i; j > a;){

            if (xc[--j] < yc[j]) {

                for (i = j; i && !xc[--i]; xc[i] = 9) {
                }
                --xc[i];
                xc[j] += 10;
            }
            xc[j] -= yc[j];
        }

        // Remove trailing zeros.
        for (; xc[--b] === 0; xc.pop()) {
        }

        // Remove leading zeros and adjust exponent accordingly.
        for (; xc[0] === 0;) {
            xc.shift();
            --ye;
        }

        if (!xc[0]) {

            // n - n = +0
            y.s = 1;

            // Result must be zero.
            xc = [ye = 0];
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a new Big whose value is the value of this Big modulo the
     * value of Big y.
     */
    P.mod = function (y) {
        var yGTx,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        if (!y.c[0]) {
            throwErr(NaN);
        }

        x.s = y.s = 1;
        yGTx = y.cmp(x) == 1;
        x.s = a;
        y.s = b;

        if (yGTx) {
            return new Big(x);
        }

        a = Big.DP;
        b = Big.RM;
        Big.DP = Big.RM = 0;
        x = x.div(y);
        Big.DP = a;
        Big.RM = b;

        return this.minus( x.times(y) );
    };


    /*
     * Return a new Big whose value is the value of this Big plus the value
     * of Big y.
     */
    P.add = P.plus = function (y) {
        var t,
            x = this,
            Big = x.constructor,
            a = x.s,
            b = (y = new Big(y)).s;

        // Signs differ?
        if (a != b) {
            y.s = -b;
            return x.minus(y);
        }

        var xe = x.e,
            xc = x.c,
            ye = y.e,
            yc = y.c;

        // Either zero?
        if (!xc[0] || !yc[0]) {

            // y is non-zero? x is non-zero? Or both are zero.
            return yc[0] ? y : new Big(xc[0] ? x : a * 0);
        }
        xc = xc.slice();

        // Prepend zeros to equalise exponents.
        // Note: Faster to use reverse then do unshifts.
        if (a = xe - ye) {

            if (a > 0) {
                ye = xe;
                t = yc;
            } else {
                a = -a;
                t = xc;
            }

            t.reverse();
            for (; a--; t.push(0)) {
            }
            t.reverse();
        }

        // Point xc to the longer array.
        if (xc.length - yc.length < 0) {
            t = yc;
            yc = xc;
            xc = t;
        }
        a = yc.length;

        /*
         * Only start adding at yc.length - 1 as the further digits of xc can be
         * left as they are.
         */
        for (b = 0; a;) {
            b = (xc[--a] = xc[a] + yc[a] + b) / 10 | 0;
            xc[a] %= 10;
        }

        // No need to check for zero, as +x + +y != 0 && -x + -y != 0

        if (b) {
            xc.unshift(b);
            ++ye;
        }

         // Remove trailing zeros.
        for (a = xc.length; xc[--a] === 0; xc.pop()) {
        }

        y.c = xc;
        y.e = ye;

        return y;
    };


    /*
     * Return a Big whose value is the value of this Big raised to the power n.
     * If n is negative, round, if necessary, to a maximum of Big.DP decimal
     * places using rounding mode Big.RM.
     *
     * n {number} Integer, -MAX_POWER to MAX_POWER inclusive.
     */
    P.pow = function (n) {
        var x = this,
            one = new x.constructor(1),
            y = one,
            isNeg = n < 0;

        if (n !== ~~n || n < -MAX_POWER || n > MAX_POWER) {
            throwErr('!pow!');
        }

        n = isNeg ? -n : n;

        for (;;) {

            if (n & 1) {
                y = y.times(x);
            }
            n >>= 1;

            if (!n) {
                break;
            }
            x = x.times(x);
        }

        return isNeg ? one.div(y) : y;
    };


    /*
     * Return a new Big whose value is the value of this Big rounded to a
     * maximum of dp decimal places using rounding mode rm.
     * If dp is not specified, round to 0 decimal places.
     * If rm is not specified, use Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     * [rm] 0, 1, 2 or 3 (ROUND_DOWN, ROUND_HALF_UP, ROUND_HALF_EVEN, ROUND_UP)
     */
    P.round = function (dp, rm) {
        var x = this,
            Big = x.constructor;

        if (dp == null) {
            dp = 0;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!round!');
        }
        rnd(x = new Big(x), dp, rm == null ? Big.RM : rm);

        return x;
    };


    /*
     * Return a new Big whose value is the square root of the value of this Big,
     * rounded, if necessary, to a maximum of Big.DP decimal places using
     * rounding mode Big.RM.
     */
    P.sqrt = function () {
        var estimate, r, approx,
            x = this,
            Big = x.constructor,
            xc = x.c,
            i = x.s,
            e = x.e,
            half = new Big('0.5');

        // Zero?
        if (!xc[0]) {
            return new Big(x);
        }

        // If negative, throw NaN.
        if (i < 0) {
            throwErr(NaN);
        }

        // Estimate.
        i = Math.sqrt(x.toString());

        // Math.sqrt underflow/overflow?
        // Pass x to Math.sqrt as integer, then adjust the result exponent.
        if (i === 0 || i === 1 / 0) {
            estimate = xc.join('');

            if (!(estimate.length + e & 1)) {
                estimate += '0';
            }

            r = new Big( Math.sqrt(estimate).toString() );
            r.e = ((e + 1) / 2 | 0) - (e < 0 || e & 1);
        } else {
            r = new Big(i.toString());
        }

        i = r.e + (Big.DP += 4);

        // Newton-Raphson iteration.
        do {
            approx = r;
            r = half.times( approx.plus( x.div(approx) ) );
        } while ( approx.c.slice(0, i).join('') !==
                       r.c.slice(0, i).join('') );

        rnd(r, Big.DP -= 4, Big.RM);

        return r;
    };


    /*
     * Return a new Big whose value is the value of this Big times the value of
     * Big y.
     */
    P.mul = P.times = function (y) {
        var c,
            x = this,
            Big = x.constructor,
            xc = x.c,
            yc = (y = new Big(y)).c,
            a = xc.length,
            b = yc.length,
            i = x.e,
            j = y.e;

        // Determine sign of result.
        y.s = x.s == y.s ? 1 : -1;

        // Return signed 0 if either 0.
        if (!xc[0] || !yc[0]) {
            return new Big(y.s * 0);
        }

        // Initialise exponent of result as x.e + y.e.
        y.e = i + j;

        // If array xc has fewer digits than yc, swap xc and yc, and lengths.
        if (a < b) {
            c = xc;
            xc = yc;
            yc = c;
            j = a;
            a = b;
            b = j;
        }

        // Initialise coefficient array of result with zeros.
        for (c = new Array(j = a + b); j--; c[j] = 0) {
        }

        // Multiply.

        // i is initially xc.length.
        for (i = b; i--;) {
            b = 0;

            // a is yc.length.
            for (j = a + i; j > i;) {

                // Current sum of products at this digit position, plus carry.
                b = c[j] + yc[i] * xc[j - i - 1] + b;
                c[j--] = b % 10;

                // carry
                b = b / 10 | 0;
            }
            c[j] = (c[j] + b) % 10;
        }

        // Increment result exponent if there is a final carry.
        if (b) {
            ++y.e;
        }

        // Remove any leading zero.
        if (!c[0]) {
            c.shift();
        }

        // Remove trailing zeros.
        for (i = c.length; !c[--i]; c.pop()) {
        }
        y.c = c;

        return y;
    };


    /*
     * Return a string representing the value of this Big.
     * Return exponential notation if this Big has a positive exponent equal to
     * or greater than Big.E_POS, or a negative exponent equal to or less than
     * Big.E_NEG.
     */
    P.toString = P.valueOf = P.toJSON = function () {
        var x = this,
            Big = x.constructor,
            e = x.e,
            str = x.c.join(''),
            strL = str.length;

        // Exponential notation?
        if (e <= Big.E_NEG || e >= Big.E_POS) {
            str = str.charAt(0) + (strL > 1 ? '.' + str.slice(1) : '') +
              (e < 0 ? 'e' : 'e+') + e;

        // Negative exponent?
        } else if (e < 0) {

            // Prepend zeros.
            for (; ++e; str = '0' + str) {
            }
            str = '0.' + str;

        // Positive exponent?
        } else if (e > 0) {

            if (++e > strL) {

                // Append zeros.
                for (e -= strL; e-- ; str += '0') {
                }
            } else if (e < strL) {
                str = str.slice(0, e) + '.' + str.slice(e);
            }

        // Exponent zero.
        } else if (strL > 1) {
            str = str.charAt(0) + '.' + str.slice(1);
        }

        // Avoid '-0'
        return x.s < 0 && x.c[0] ? '-' + str : str;
    };


    /*
     ***************************************************************************
     * If toExponential, toFixed, toPrecision and format are not required they
     * can safely be commented-out or deleted. No redundant code will be left.
     * format is used only by toExponential, toFixed and toPrecision.
     ***************************************************************************
     */


    /*
     * Return a string representing the value of this Big in exponential
     * notation to dp fixed decimal places and rounded, if necessary, using
     * Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toExponential = function (dp) {

        if (dp == null) {
            dp = this.c.length - 1;
        } else if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
            throwErr('!toExp!');
        }

        return format(this, dp, 1);
    };


    /*
     * Return a string representing the value of this Big in normal notation
     * to dp fixed decimal places and rounded, if necessary, using Big.RM.
     *
     * [dp] {number} Integer, 0 to MAX_DP inclusive.
     */
    P.toFixed = function (dp) {
        var str,
            x = this,
            Big = x.constructor,
            neg = Big.E_NEG,
            pos = Big.E_POS;

        // Prevent the possibility of exponential notation.
        Big.E_NEG = -(Big.E_POS = 1 / 0);

        if (dp == null) {
            str = x.toString();
        } else if (dp === ~~dp && dp >= 0 && dp <= MAX_DP) {
            str = format(x, x.e + dp);

            // (-0).toFixed() is '0', but (-0.1).toFixed() is '-0'.
            // (-0).toFixed(1) is '0.0', but (-0.01).toFixed(1) is '-0.0'.
            if (x.s < 0 && x.c[0] && str.indexOf('-') < 0) {
        //E.g. -0.5 if rounded to -0 will cause toString to omit the minus sign.
                str = '-' + str;
            }
        }
        Big.E_NEG = neg;
        Big.E_POS = pos;

        if (!str) {
            throwErr('!toFix!');
        }

        return str;
    };


    /*
     * Return a string representing the value of this Big rounded to sd
     * significant digits using Big.RM. Use exponential notation if sd is less
     * than the number of digits necessary to represent the integer part of the
     * value in normal notation.
     *
     * sd {number} Integer, 1 to MAX_DP inclusive.
     */
    P.toPrecision = function (sd) {

        if (sd == null) {
            return this.toString();
        } else if (sd !== ~~sd || sd < 1 || sd > MAX_DP) {
            throwErr('!toPre!');
        }

        return format(this, sd - 1, 2);
    };


    // Export


    Big = bigFactory();

    //AMD.
    if (true) {
        !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
            return Big;
        }.call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

    // Node and other CommonJS-like environments that support module.exports.
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = Big;
        module.exports.Big = Big;

    //Browser.
    } else {
        global.Big = Big;
    }
})(this);


/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = require("crypto");

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const path = __webpack_require__(1);
const emojisList = __webpack_require__(16);
const getHashDigest = __webpack_require__(2);

const emojiRegex = /[\uD800-\uDFFF]./;
const emojiList = emojisList.filter(emoji => emojiRegex.test(emoji));
const emojiCache = {};

function encodeStringToEmoji(content, length) {
	if(emojiCache[content]) return emojiCache[content];
	length = length || 1;
	const emojis = [];
	do {
		const index = Math.floor(Math.random() * emojiList.length);
		emojis.push(emojiList[index]);
		emojiList.splice(index, 1);
	} while(--length > 0);
	const emojiEncoding = emojis.join("");
	emojiCache[content] = emojiEncoding;
	return emojiEncoding;
}

function interpolateName(loaderContext, name, options) {
	let filename;
	if(typeof name === "function") {
		filename = name(loaderContext.resourcePath);
	} else {
		filename = name || "[hash].[ext]";
	}
	const context = options.context;
	const content = options.content;
	const regExp = options.regExp;
	let ext = "bin";
	let basename = "file";
	let directory = "";
	let folder = "";
	if(loaderContext.resourcePath) {
		const parsed = path.parse(loaderContext.resourcePath);
		let resourcePath = loaderContext.resourcePath;

		if(parsed.ext) {
			ext = parsed.ext.substr(1);
		}
		if(parsed.dir) {
			basename = parsed.name;
			resourcePath = parsed.dir + path.sep;
		}
		if(typeof context !== "undefined") {
			directory = path.relative(context, resourcePath + "_").replace(/\\/g, "/").replace(/\.\.(\/)?/g, "_$1");
			directory = directory.substr(0, directory.length - 1);
		} else {
			directory = resourcePath.replace(/\\/g, "/").replace(/\.\.(\/)?/g, "_$1");
		}
		if(directory.length === 1) {
			directory = "";
		} else if(directory.length > 1) {
			folder = path.basename(directory);
		}
	}
	let url = filename;
	if(content) {
		// Match hash template
		url = url
			.replace(
				/\[(?:(\w+):)?hash(?::([a-z]+\d*))?(?::(\d+))?\]/ig,
				(all, hashType, digestType, maxLength) => getHashDigest(content, hashType, digestType, parseInt(maxLength, 10))
			)
			.replace(
				/\[emoji(?::(\d+))?\]/ig,
				(all, length) => encodeStringToEmoji(content, length)
			);
	}
	url = url
		.replace(/\[ext\]/ig, () => ext)
		.replace(/\[name\]/ig, () => basename)
		.replace(/\[path\]/ig, () => directory)
		.replace(/\[folder\]/ig, () => folder);
	if(regExp && loaderContext.resourcePath) {
		const match = loaderContext.resourcePath.match(new RegExp(regExp));
		match && match.forEach((matched, i) => {
			url = url.replace(
				new RegExp("\\[" + i + "\\]", "ig"),
				matched
			);
		});
	}
	if(typeof loaderContext.options === "object" && typeof loaderContext.options.customInterpolateName === "function") {
		url = loaderContext.options.customInterpolateName.call(loaderContext, url, name, options);
	}
	return url;
}

module.exports = interpolateName;


/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = [
  "🀄",
  "🃏",
  "🅰",
  "🅱",
  "🅾",
  "🅿",
  "🆎",
  "🆑",
  "🆒",
  "🆓",
  "🆔",
  "🆕",
  "🆖",
  "🆗",
  "🆘",
  "🆙",
  "🆚",
  "🇦🇨",
  "🇦🇩",
  "🇦🇪",
  "🇦🇫",
  "🇦🇬",
  "🇦🇮",
  "🇦🇱",
  "🇦🇲",
  "🇦🇴",
  "🇦🇶",
  "🇦🇷",
  "🇦🇸",
  "🇦🇹",
  "🇦🇺",
  "🇦🇼",
  "🇦🇽",
  "🇦🇿",
  "🇦",
  "🇧🇦",
  "🇧🇧",
  "🇧🇩",
  "🇧🇪",
  "🇧🇫",
  "🇧🇬",
  "🇧🇭",
  "🇧🇮",
  "🇧🇯",
  "🇧🇱",
  "🇧🇲",
  "🇧🇳",
  "🇧🇴",
  "🇧🇶",
  "🇧🇷",
  "🇧🇸",
  "🇧🇹",
  "🇧🇻",
  "🇧🇼",
  "🇧🇾",
  "🇧🇿",
  "🇧",
  "🇨🇦",
  "🇨🇨",
  "🇨🇩",
  "🇨🇫",
  "🇨🇬",
  "🇨🇭",
  "🇨🇮",
  "🇨🇰",
  "🇨🇱",
  "🇨🇲",
  "🇨🇳",
  "🇨🇴",
  "🇨🇵",
  "🇨🇷",
  "🇨🇺",
  "🇨🇻",
  "🇨🇼",
  "🇨🇽",
  "🇨🇾",
  "🇨🇿",
  "🇨",
  "🇩🇪",
  "🇩🇬",
  "🇩🇯",
  "🇩🇰",
  "🇩🇲",
  "🇩🇴",
  "🇩🇿",
  "🇩",
  "🇪🇦",
  "🇪🇨",
  "🇪🇪",
  "🇪🇬",
  "🇪🇭",
  "🇪🇷",
  "🇪🇸",
  "🇪🇹",
  "🇪🇺",
  "🇪",
  "🇫🇮",
  "🇫🇯",
  "🇫🇰",
  "🇫🇲",
  "🇫🇴",
  "🇫🇷",
  "🇫",
  "🇬🇦",
  "🇬🇧",
  "🇬🇩",
  "🇬🇪",
  "🇬🇫",
  "🇬🇬",
  "🇬🇭",
  "🇬🇮",
  "🇬🇱",
  "🇬🇲",
  "🇬🇳",
  "🇬🇵",
  "🇬🇶",
  "🇬🇷",
  "🇬🇸",
  "🇬🇹",
  "🇬🇺",
  "🇬🇼",
  "🇬🇾",
  "🇬",
  "🇭🇰",
  "🇭🇲",
  "🇭🇳",
  "🇭🇷",
  "🇭🇹",
  "🇭🇺",
  "🇭",
  "🇮🇨",
  "🇮🇩",
  "🇮🇪",
  "🇮🇱",
  "🇮🇲",
  "🇮🇳",
  "🇮🇴",
  "🇮🇶",
  "🇮🇷",
  "🇮🇸",
  "🇮🇹",
  "🇮",
  "🇯🇪",
  "🇯🇲",
  "🇯🇴",
  "🇯🇵",
  "🇯",
  "🇰🇪",
  "🇰🇬",
  "🇰🇭",
  "🇰🇮",
  "🇰🇲",
  "🇰🇳",
  "🇰🇵",
  "🇰🇷",
  "🇰🇼",
  "🇰🇾",
  "🇰🇿",
  "🇰",
  "🇱🇦",
  "🇱🇧",
  "🇱🇨",
  "🇱🇮",
  "🇱🇰",
  "🇱🇷",
  "🇱🇸",
  "🇱🇹",
  "🇱🇺",
  "🇱🇻",
  "🇱🇾",
  "🇱",
  "🇲🇦",
  "🇲🇨",
  "🇲🇩",
  "🇲🇪",
  "🇲🇫",
  "🇲🇬",
  "🇲🇭",
  "🇲🇰",
  "🇲🇱",
  "🇲🇲",
  "🇲🇳",
  "🇲🇴",
  "🇲🇵",
  "🇲🇶",
  "🇲🇷",
  "🇲🇸",
  "🇲🇹",
  "🇲🇺",
  "🇲🇻",
  "🇲🇼",
  "🇲🇽",
  "🇲🇾",
  "🇲🇿",
  "🇲",
  "🇳🇦",
  "🇳🇨",
  "🇳🇪",
  "🇳🇫",
  "🇳🇬",
  "🇳🇮",
  "🇳🇱",
  "🇳🇴",
  "🇳🇵",
  "🇳🇷",
  "🇳🇺",
  "🇳🇿",
  "🇳",
  "🇴🇲",
  "🇴",
  "🇵🇦",
  "🇵🇪",
  "🇵🇫",
  "🇵🇬",
  "🇵🇭",
  "🇵🇰",
  "🇵🇱",
  "🇵🇲",
  "🇵🇳",
  "🇵🇷",
  "🇵🇸",
  "🇵🇹",
  "🇵🇼",
  "🇵🇾",
  "🇵",
  "🇶🇦",
  "🇶",
  "🇷🇪",
  "🇷🇴",
  "🇷🇸",
  "🇷🇺",
  "🇷🇼",
  "🇷",
  "🇸🇦",
  "🇸🇧",
  "🇸🇨",
  "🇸🇩",
  "🇸🇪",
  "🇸🇬",
  "🇸🇭",
  "🇸🇮",
  "🇸🇯",
  "🇸🇰",
  "🇸🇱",
  "🇸🇲",
  "🇸🇳",
  "🇸🇴",
  "🇸🇷",
  "🇸🇸",
  "🇸🇹",
  "🇸🇻",
  "🇸🇽",
  "🇸🇾",
  "🇸🇿",
  "🇸",
  "🇹🇦",
  "🇹🇨",
  "🇹🇩",
  "🇹🇫",
  "🇹🇬",
  "🇹🇭",
  "🇹🇯",
  "🇹🇰",
  "🇹🇱",
  "🇹🇲",
  "🇹🇳",
  "🇹🇴",
  "🇹🇷",
  "🇹🇹",
  "🇹🇻",
  "🇹🇼",
  "🇹🇿",
  "🇹",
  "🇺🇦",
  "🇺🇬",
  "🇺🇲",
  "🇺🇳",
  "🇺🇸",
  "🇺🇾",
  "🇺🇿",
  "🇺",
  "🇻🇦",
  "🇻🇨",
  "🇻🇪",
  "🇻🇬",
  "🇻🇮",
  "🇻🇳",
  "🇻🇺",
  "🇻",
  "🇼🇫",
  "🇼🇸",
  "🇼",
  "🇽🇰",
  "🇽",
  "🇾🇪",
  "🇾🇹",
  "🇾",
  "🇿🇦",
  "🇿🇲",
  "🇿🇼",
  "🇿",
  "🈁",
  "🈂",
  "🈚",
  "🈯",
  "🈲",
  "🈳",
  "🈴",
  "🈵",
  "🈶",
  "🈷",
  "🈸",
  "🈹",
  "🈺",
  "🉐",
  "🉑",
  "🌀",
  "🌁",
  "🌂",
  "🌃",
  "🌄",
  "🌅",
  "🌆",
  "🌇",
  "🌈",
  "🌉",
  "🌊",
  "🌋",
  "🌌",
  "🌍",
  "🌎",
  "🌏",
  "🌐",
  "🌑",
  "🌒",
  "🌓",
  "🌔",
  "🌕",
  "🌖",
  "🌗",
  "🌘",
  "🌙",
  "🌚",
  "🌛",
  "🌜",
  "🌝",
  "🌞",
  "🌟",
  "🌠",
  "🌡",
  "🌤",
  "🌥",
  "🌦",
  "🌧",
  "🌨",
  "🌩",
  "🌪",
  "🌫",
  "🌬",
  "🌭",
  "🌮",
  "🌯",
  "🌰",
  "🌱",
  "🌲",
  "🌳",
  "🌴",
  "🌵",
  "🌶",
  "🌷",
  "🌸",
  "🌹",
  "🌺",
  "🌻",
  "🌼",
  "🌽",
  "🌾",
  "🌿",
  "🍀",
  "🍁",
  "🍂",
  "🍃",
  "🍄",
  "🍅",
  "🍆",
  "🍇",
  "🍈",
  "🍉",
  "🍊",
  "🍋",
  "🍌",
  "🍍",
  "🍎",
  "🍏",
  "🍐",
  "🍑",
  "🍒",
  "🍓",
  "🍔",
  "🍕",
  "🍖",
  "🍗",
  "🍘",
  "🍙",
  "🍚",
  "🍛",
  "🍜",
  "🍝",
  "🍞",
  "🍟",
  "🍠",
  "🍡",
  "🍢",
  "🍣",
  "🍤",
  "🍥",
  "🍦",
  "🍧",
  "🍨",
  "🍩",
  "🍪",
  "🍫",
  "🍬",
  "🍭",
  "🍮",
  "🍯",
  "🍰",
  "🍱",
  "🍲",
  "🍳",
  "🍴",
  "🍵",
  "🍶",
  "🍷",
  "🍸",
  "🍹",
  "🍺",
  "🍻",
  "🍼",
  "🍽",
  "🍾",
  "🍿",
  "🎀",
  "🎁",
  "🎂",
  "🎃",
  "🎄",
  "🎅🏻",
  "🎅🏼",
  "🎅🏽",
  "🎅🏾",
  "🎅🏿",
  "🎅",
  "🎆",
  "🎇",
  "🎈",
  "🎉",
  "🎊",
  "🎋",
  "🎌",
  "🎍",
  "🎎",
  "🎏",
  "🎐",
  "🎑",
  "🎒",
  "🎓",
  "🎖",
  "🎗",
  "🎙",
  "🎚",
  "🎛",
  "🎞",
  "🎟",
  "🎠",
  "🎡",
  "🎢",
  "🎣",
  "🎤",
  "🎥",
  "🎦",
  "🎧",
  "🎨",
  "🎩",
  "🎪",
  "🎫",
  "🎬",
  "🎭",
  "🎮",
  "🎯",
  "🎰",
  "🎱",
  "🎲",
  "🎳",
  "🎴",
  "🎵",
  "🎶",
  "🎷",
  "🎸",
  "🎹",
  "🎺",
  "🎻",
  "🎼",
  "🎽",
  "🎾",
  "🎿",
  "🏀",
  "🏁",
  "🏂🏻",
  "🏂🏼",
  "🏂🏽",
  "🏂🏾",
  "🏂🏿",
  "🏂",
  "🏃🏻‍♀️",
  "🏃🏻‍♂️",
  "🏃🏻",
  "🏃🏼‍♀️",
  "🏃🏼‍♂️",
  "🏃🏼",
  "🏃🏽‍♀️",
  "🏃🏽‍♂️",
  "🏃🏽",
  "🏃🏾‍♀️",
  "🏃🏾‍♂️",
  "🏃🏾",
  "🏃🏿‍♀️",
  "🏃🏿‍♂️",
  "🏃🏿",
  "🏃‍♀️",
  "🏃‍♂️",
  "🏃",
  "🏄🏻‍♀️",
  "🏄🏻‍♂️",
  "🏄🏻",
  "🏄🏼‍♀️",
  "🏄🏼‍♂️",
  "🏄🏼",
  "🏄🏽‍♀️",
  "🏄🏽‍♂️",
  "🏄🏽",
  "🏄🏾‍♀️",
  "🏄🏾‍♂️",
  "🏄🏾",
  "🏄🏿‍♀️",
  "🏄🏿‍♂️",
  "🏄🏿",
  "🏄‍♀️",
  "🏄‍♂️",
  "🏄",
  "🏅",
  "🏆",
  "🏇🏻",
  "🏇🏼",
  "🏇🏽",
  "🏇🏾",
  "🏇🏿",
  "🏇",
  "🏈",
  "🏉",
  "🏊🏻‍♀️",
  "🏊🏻‍♂️",
  "🏊🏻",
  "🏊🏼‍♀️",
  "🏊🏼‍♂️",
  "🏊🏼",
  "🏊🏽‍♀️",
  "🏊🏽‍♂️",
  "🏊🏽",
  "🏊🏾‍♀️",
  "🏊🏾‍♂️",
  "🏊🏾",
  "🏊🏿‍♀️",
  "🏊🏿‍♂️",
  "🏊🏿",
  "🏊‍♀️",
  "🏊‍♂️",
  "🏊",
  "🏋🏻‍♀️",
  "🏋🏻‍♂️",
  "🏋🏻",
  "🏋🏼‍♀️",
  "🏋🏼‍♂️",
  "🏋🏼",
  "🏋🏽‍♀️",
  "🏋🏽‍♂️",
  "🏋🏽",
  "🏋🏾‍♀️",
  "🏋🏾‍♂️",
  "🏋🏾",
  "🏋🏿‍♀️",
  "🏋🏿‍♂️",
  "🏋🏿",
  "🏋️‍♀️",
  "🏋️‍♂️",
  "🏋",
  "🏌🏻‍♀️",
  "🏌🏻‍♂️",
  "🏌🏻",
  "🏌🏼‍♀️",
  "🏌🏼‍♂️",
  "🏌🏼",
  "🏌🏽‍♀️",
  "🏌🏽‍♂️",
  "🏌🏽",
  "🏌🏾‍♀️",
  "🏌🏾‍♂️",
  "🏌🏾",
  "🏌🏿‍♀️",
  "🏌🏿‍♂️",
  "🏌🏿",
  "🏌️‍♀️",
  "🏌️‍♂️",
  "🏌",
  "🏍",
  "🏎",
  "🏏",
  "🏐",
  "🏑",
  "🏒",
  "🏓",
  "🏔",
  "🏕",
  "🏖",
  "🏗",
  "🏘",
  "🏙",
  "🏚",
  "🏛",
  "🏜",
  "🏝",
  "🏞",
  "🏟",
  "🏠",
  "🏡",
  "🏢",
  "🏣",
  "🏤",
  "🏥",
  "🏦",
  "🏧",
  "🏨",
  "🏩",
  "🏪",
  "🏫",
  "🏬",
  "🏭",
  "🏮",
  "🏯",
  "🏰",
  "🏳️‍🌈",
  "🏳",
  "🏴‍☠️",
  "🏴",
  "🏵",
  "🏷",
  "🏸",
  "🏹",
  "🏺",
  "🏻",
  "🏼",
  "🏽",
  "🏾",
  "🏿",
  "🐀",
  "🐁",
  "🐂",
  "🐃",
  "🐄",
  "🐅",
  "🐆",
  "🐇",
  "🐈",
  "🐉",
  "🐊",
  "🐋",
  "🐌",
  "🐍",
  "🐎",
  "🐏",
  "🐐",
  "🐑",
  "🐒",
  "🐓",
  "🐔",
  "🐕",
  "🐖",
  "🐗",
  "🐘",
  "🐙",
  "🐚",
  "🐛",
  "🐜",
  "🐝",
  "🐞",
  "🐟",
  "🐠",
  "🐡",
  "🐢",
  "🐣",
  "🐤",
  "🐥",
  "🐦",
  "🐧",
  "🐨",
  "🐩",
  "🐪",
  "🐫",
  "🐬",
  "🐭",
  "🐮",
  "🐯",
  "🐰",
  "🐱",
  "🐲",
  "🐳",
  "🐴",
  "🐵",
  "🐶",
  "🐷",
  "🐸",
  "🐹",
  "🐺",
  "🐻",
  "🐼",
  "🐽",
  "🐾",
  "🐿",
  "👀",
  "👁‍🗨",
  "👁",
  "👂🏻",
  "👂🏼",
  "👂🏽",
  "👂🏾",
  "👂🏿",
  "👂",
  "👃🏻",
  "👃🏼",
  "👃🏽",
  "👃🏾",
  "👃🏿",
  "👃",
  "👄",
  "👅",
  "👆🏻",
  "👆🏼",
  "👆🏽",
  "👆🏾",
  "👆🏿",
  "👆",
  "👇🏻",
  "👇🏼",
  "👇🏽",
  "👇🏾",
  "👇🏿",
  "👇",
  "👈🏻",
  "👈🏼",
  "👈🏽",
  "👈🏾",
  "👈🏿",
  "👈",
  "👉🏻",
  "👉🏼",
  "👉🏽",
  "👉🏾",
  "👉🏿",
  "👉",
  "👊🏻",
  "👊🏼",
  "👊🏽",
  "👊🏾",
  "👊🏿",
  "👊",
  "👋🏻",
  "👋🏼",
  "👋🏽",
  "👋🏾",
  "👋🏿",
  "👋",
  "👌🏻",
  "👌🏼",
  "👌🏽",
  "👌🏾",
  "👌🏿",
  "👌",
  "👍🏻",
  "👍🏼",
  "👍🏽",
  "👍🏾",
  "👍🏿",
  "👍",
  "👎🏻",
  "👎🏼",
  "👎🏽",
  "👎🏾",
  "👎🏿",
  "👎",
  "👏🏻",
  "👏🏼",
  "👏🏽",
  "👏🏾",
  "👏🏿",
  "👏",
  "👐🏻",
  "👐🏼",
  "👐🏽",
  "👐🏾",
  "👐🏿",
  "👐",
  "👑",
  "👒",
  "👓",
  "👔",
  "👕",
  "👖",
  "👗",
  "👘",
  "👙",
  "👚",
  "👛",
  "👜",
  "👝",
  "👞",
  "👟",
  "👠",
  "👡",
  "👢",
  "👣",
  "👤",
  "👥",
  "👦🏻",
  "👦🏼",
  "👦🏽",
  "👦🏾",
  "👦🏿",
  "👦",
  "👧🏻",
  "👧🏼",
  "👧🏽",
  "👧🏾",
  "👧🏿",
  "👧",
  "👨🏻‍🌾",
  "👨🏻‍🍳",
  "👨🏻‍🎓",
  "👨🏻‍🎤",
  "👨🏻‍🎨",
  "👨🏻‍🏫",
  "👨🏻‍🏭",
  "👨🏻‍💻",
  "👨🏻‍💼",
  "👨🏻‍🔧",
  "👨🏻‍🔬",
  "👨🏻‍🚀",
  "👨🏻‍🚒",
  "👨🏻‍⚕️",
  "👨🏻‍⚖️",
  "👨🏻‍✈️",
  "👨🏻",
  "👨🏼‍🌾",
  "👨🏼‍🍳",
  "👨🏼‍🎓",
  "👨🏼‍🎤",
  "👨🏼‍🎨",
  "👨🏼‍🏫",
  "👨🏼‍🏭",
  "👨🏼‍💻",
  "👨🏼‍💼",
  "👨🏼‍🔧",
  "👨🏼‍🔬",
  "👨🏼‍🚀",
  "👨🏼‍🚒",
  "👨🏼‍⚕️",
  "👨🏼‍⚖️",
  "👨🏼‍✈️",
  "👨🏼",
  "👨🏽‍🌾",
  "👨🏽‍🍳",
  "👨🏽‍🎓",
  "👨🏽‍🎤",
  "👨🏽‍🎨",
  "👨🏽‍🏫",
  "👨🏽‍🏭",
  "👨🏽‍💻",
  "👨🏽‍💼",
  "👨🏽‍🔧",
  "👨🏽‍🔬",
  "👨🏽‍🚀",
  "👨🏽‍🚒",
  "👨🏽‍⚕️",
  "👨🏽‍⚖️",
  "👨🏽‍✈️",
  "👨🏽",
  "👨🏾‍🌾",
  "👨🏾‍🍳",
  "👨🏾‍🎓",
  "👨🏾‍🎤",
  "👨🏾‍🎨",
  "👨🏾‍🏫",
  "👨🏾‍🏭",
  "👨🏾‍💻",
  "👨🏾‍💼",
  "👨🏾‍🔧",
  "👨🏾‍🔬",
  "👨🏾‍🚀",
  "👨🏾‍🚒",
  "👨🏾‍⚕️",
  "👨🏾‍⚖️",
  "👨🏾‍✈️",
  "👨🏾",
  "👨🏿‍🌾",
  "👨🏿‍🍳",
  "👨🏿‍🎓",
  "👨🏿‍🎤",
  "👨🏿‍🎨",
  "👨🏿‍🏫",
  "👨🏿‍🏭",
  "👨🏿‍💻",
  "👨🏿‍💼",
  "👨🏿‍🔧",
  "👨🏿‍🔬",
  "👨🏿‍🚀",
  "👨🏿‍🚒",
  "👨🏿‍⚕️",
  "👨🏿‍⚖️",
  "👨🏿‍✈️",
  "👨🏿",
  "👨‍🌾",
  "👨‍🍳",
  "👨‍🎓",
  "👨‍🎤",
  "👨‍🎨",
  "👨‍🏫",
  "👨‍🏭",
  "👨‍👦‍👦",
  "👨‍👦",
  "👨‍👧‍👦",
  "👨‍👧‍👧",
  "👨‍👧",
  "👨‍👨‍👦‍👦",
  "👨‍👨‍👦",
  "👨‍👨‍👧‍👦",
  "👨‍👨‍👧‍👧",
  "👨‍👨‍👧",
  "👨‍👩‍👦‍👦",
  "👨‍👩‍👦",
  "👨‍👩‍👧‍👦",
  "👨‍👩‍👧‍👧",
  "👨‍👩‍👧",
  "👨‍💻",
  "👨‍💼",
  "👨‍🔧",
  "👨‍🔬",
  "👨‍🚀",
  "👨‍🚒",
  "👨‍⚕️",
  "👨‍⚖️",
  "👨‍✈️",
  "👨‍❤️‍👨",
  "👨‍❤️‍💋‍👨",
  "👨",
  "👩🏻‍🌾",
  "👩🏻‍🍳",
  "👩🏻‍🎓",
  "👩🏻‍🎤",
  "👩🏻‍🎨",
  "👩🏻‍🏫",
  "👩🏻‍🏭",
  "👩🏻‍💻",
  "👩🏻‍💼",
  "👩🏻‍🔧",
  "👩🏻‍🔬",
  "👩🏻‍🚀",
  "👩🏻‍🚒",
  "👩🏻‍⚕️",
  "👩🏻‍⚖️",
  "👩🏻‍✈️",
  "👩🏻",
  "👩🏼‍🌾",
  "👩🏼‍🍳",
  "👩🏼‍🎓",
  "👩🏼‍🎤",
  "👩🏼‍🎨",
  "👩🏼‍🏫",
  "👩🏼‍🏭",
  "👩🏼‍💻",
  "👩🏼‍💼",
  "👩🏼‍🔧",
  "👩🏼‍🔬",
  "👩🏼‍🚀",
  "👩🏼‍🚒",
  "👩🏼‍⚕️",
  "👩🏼‍⚖️",
  "👩🏼‍✈️",
  "👩🏼",
  "👩🏽‍🌾",
  "👩🏽‍🍳",
  "👩🏽‍🎓",
  "👩🏽‍🎤",
  "👩🏽‍🎨",
  "👩🏽‍🏫",
  "👩🏽‍🏭",
  "👩🏽‍💻",
  "👩🏽‍💼",
  "👩🏽‍🔧",
  "👩🏽‍🔬",
  "👩🏽‍🚀",
  "👩🏽‍🚒",
  "👩🏽‍⚕️",
  "👩🏽‍⚖️",
  "👩🏽‍✈️",
  "👩🏽",
  "👩🏾‍🌾",
  "👩🏾‍🍳",
  "👩🏾‍🎓",
  "👩🏾‍🎤",
  "👩🏾‍🎨",
  "👩🏾‍🏫",
  "👩🏾‍🏭",
  "👩🏾‍💻",
  "👩🏾‍💼",
  "👩🏾‍🔧",
  "👩🏾‍🔬",
  "👩🏾‍🚀",
  "👩🏾‍🚒",
  "👩🏾‍⚕️",
  "👩🏾‍⚖️",
  "👩🏾‍✈️",
  "👩🏾",
  "👩🏿‍🌾",
  "👩🏿‍🍳",
  "👩🏿‍🎓",
  "👩🏿‍🎤",
  "👩🏿‍🎨",
  "👩🏿‍🏫",
  "👩🏿‍🏭",
  "👩🏿‍💻",
  "👩🏿‍💼",
  "👩🏿‍🔧",
  "👩🏿‍🔬",
  "👩🏿‍🚀",
  "👩🏿‍🚒",
  "👩🏿‍⚕️",
  "👩🏿‍⚖️",
  "👩🏿‍✈️",
  "👩🏿",
  "👩‍🌾",
  "👩‍🍳",
  "👩‍🎓",
  "👩‍🎤",
  "👩‍🎨",
  "👩‍🏫",
  "👩‍🏭",
  "👩‍👦‍👦",
  "👩‍👦",
  "👩‍👧‍👦",
  "👩‍👧‍👧",
  "👩‍👧",
  "👩‍👩‍👦‍👦",
  "👩‍👩‍👦",
  "👩‍👩‍👧‍👦",
  "👩‍👩‍👧‍👧",
  "👩‍👩‍👧",
  "👩‍💻",
  "👩‍💼",
  "👩‍🔧",
  "👩‍🔬",
  "👩‍🚀",
  "👩‍🚒",
  "👩‍⚕️",
  "👩‍⚖️",
  "👩‍✈️",
  "👩‍❤️‍👨",
  "👩‍❤️‍👩",
  "👩‍❤️‍💋‍👨",
  "👩‍❤️‍💋‍👩",
  "👩",
  "👪🏻",
  "👪🏼",
  "👪🏽",
  "👪🏾",
  "👪🏿",
  "👪",
  "👫🏻",
  "👫🏼",
  "👫🏽",
  "👫🏾",
  "👫🏿",
  "👫",
  "👬🏻",
  "👬🏼",
  "👬🏽",
  "👬🏾",
  "👬🏿",
  "👬",
  "👭🏻",
  "👭🏼",
  "👭🏽",
  "👭🏾",
  "👭🏿",
  "👭",
  "👮🏻‍♀️",
  "👮🏻‍♂️",
  "👮🏻",
  "👮🏼‍♀️",
  "👮🏼‍♂️",
  "👮🏼",
  "👮🏽‍♀️",
  "👮🏽‍♂️",
  "👮🏽",
  "👮🏾‍♀️",
  "👮🏾‍♂️",
  "👮🏾",
  "👮🏿‍♀️",
  "👮🏿‍♂️",
  "👮🏿",
  "👮‍♀️",
  "👮‍♂️",
  "👮",
  "👯🏻‍♀️",
  "👯🏻‍♂️",
  "👯🏻",
  "👯🏼‍♀️",
  "👯🏼‍♂️",
  "👯🏼",
  "👯🏽‍♀️",
  "👯🏽‍♂️",
  "👯🏽",
  "👯🏾‍♀️",
  "👯🏾‍♂️",
  "👯🏾",
  "👯🏿‍♀️",
  "👯🏿‍♂️",
  "👯🏿",
  "👯‍♀️",
  "👯‍♂️",
  "👯",
  "👰🏻",
  "👰🏼",
  "👰🏽",
  "👰🏾",
  "👰🏿",
  "👰",
  "👱🏻‍♀️",
  "👱🏻‍♂️",
  "👱🏻",
  "👱🏼‍♀️",
  "👱🏼‍♂️",
  "👱🏼",
  "👱🏽‍♀️",
  "👱🏽‍♂️",
  "👱🏽",
  "👱🏾‍♀️",
  "👱🏾‍♂️",
  "👱🏾",
  "👱🏿‍♀️",
  "👱🏿‍♂️",
  "👱🏿",
  "👱‍♀️",
  "👱‍♂️",
  "👱",
  "👲🏻",
  "👲🏼",
  "👲🏽",
  "👲🏾",
  "👲🏿",
  "👲",
  "👳🏻‍♀️",
  "👳🏻‍♂️",
  "👳🏻",
  "👳🏼‍♀️",
  "👳🏼‍♂️",
  "👳🏼",
  "👳🏽‍♀️",
  "👳🏽‍♂️",
  "👳🏽",
  "👳🏾‍♀️",
  "👳🏾‍♂️",
  "👳🏾",
  "👳🏿‍♀️",
  "👳🏿‍♂️",
  "👳🏿",
  "👳‍♀️",
  "👳‍♂️",
  "👳",
  "👴🏻",
  "👴🏼",
  "👴🏽",
  "👴🏾",
  "👴🏿",
  "👴",
  "👵🏻",
  "👵🏼",
  "👵🏽",
  "👵🏾",
  "👵🏿",
  "👵",
  "👶🏻",
  "👶🏼",
  "👶🏽",
  "👶🏾",
  "👶🏿",
  "👶",
  "👷🏻‍♀️",
  "👷🏻‍♂️",
  "👷🏻",
  "👷🏼‍♀️",
  "👷🏼‍♂️",
  "👷🏼",
  "👷🏽‍♀️",
  "👷🏽‍♂️",
  "👷🏽",
  "👷🏾‍♀️",
  "👷🏾‍♂️",
  "👷🏾",
  "👷🏿‍♀️",
  "👷🏿‍♂️",
  "👷🏿",
  "👷‍♀️",
  "👷‍♂️",
  "👷",
  "👸🏻",
  "👸🏼",
  "👸🏽",
  "👸🏾",
  "👸🏿",
  "👸",
  "👹",
  "👺",
  "👻",
  "👼🏻",
  "👼🏼",
  "👼🏽",
  "👼🏾",
  "👼🏿",
  "👼",
  "👽",
  "👾",
  "👿",
  "💀",
  "💁🏻‍♀️",
  "💁🏻‍♂️",
  "💁🏻",
  "💁🏼‍♀️",
  "💁🏼‍♂️",
  "💁🏼",
  "💁🏽‍♀️",
  "💁🏽‍♂️",
  "💁🏽",
  "💁🏾‍♀️",
  "💁🏾‍♂️",
  "💁🏾",
  "💁🏿‍♀️",
  "💁🏿‍♂️",
  "💁🏿",
  "💁‍♀️",
  "💁‍♂️",
  "💁",
  "💂🏻‍♀️",
  "💂🏻‍♂️",
  "💂🏻",
  "💂🏼‍♀️",
  "💂🏼‍♂️",
  "💂🏼",
  "💂🏽‍♀️",
  "💂🏽‍♂️",
  "💂🏽",
  "💂🏾‍♀️",
  "💂🏾‍♂️",
  "💂🏾",
  "💂🏿‍♀️",
  "💂🏿‍♂️",
  "💂🏿",
  "💂‍♀️",
  "💂‍♂️",
  "💂",
  "💃🏻",
  "💃🏼",
  "💃🏽",
  "💃🏾",
  "💃🏿",
  "💃",
  "💄",
  "💅🏻",
  "💅🏼",
  "💅🏽",
  "💅🏾",
  "💅🏿",
  "💅",
  "💆🏻‍♀️",
  "💆🏻‍♂️",
  "💆🏻",
  "💆🏼‍♀️",
  "💆🏼‍♂️",
  "💆🏼",
  "💆🏽‍♀️",
  "💆🏽‍♂️",
  "💆🏽",
  "💆🏾‍♀️",
  "💆🏾‍♂️",
  "💆🏾",
  "💆🏿‍♀️",
  "💆🏿‍♂️",
  "💆🏿",
  "💆‍♀️",
  "💆‍♂️",
  "💆",
  "💇🏻‍♀️",
  "💇🏻‍♂️",
  "💇🏻",
  "💇🏼‍♀️",
  "💇🏼‍♂️",
  "💇🏼",
  "💇🏽‍♀️",
  "💇🏽‍♂️",
  "💇🏽",
  "💇🏾‍♀️",
  "💇🏾‍♂️",
  "💇🏾",
  "💇🏿‍♀️",
  "💇🏿‍♂️",
  "💇🏿",
  "💇‍♀️",
  "💇‍♂️",
  "💇",
  "💈",
  "💉",
  "💊",
  "💋",
  "💌",
  "💍",
  "💎",
  "💏",
  "💐",
  "💑",
  "💒",
  "💓",
  "💔",
  "💕",
  "💖",
  "💗",
  "💘",
  "💙",
  "💚",
  "💛",
  "💜",
  "💝",
  "💞",
  "💟",
  "💠",
  "💡",
  "💢",
  "💣",
  "💤",
  "💥",
  "💦",
  "💧",
  "💨",
  "💩",
  "💪🏻",
  "💪🏼",
  "💪🏽",
  "💪🏾",
  "💪🏿",
  "💪",
  "💫",
  "💬",
  "💭",
  "💮",
  "💯",
  "💰",
  "💱",
  "💲",
  "💳",
  "💴",
  "💵",
  "💶",
  "💷",
  "💸",
  "💹",
  "💺",
  "💻",
  "💼",
  "💽",
  "💾",
  "💿",
  "📀",
  "📁",
  "📂",
  "📃",
  "📄",
  "📅",
  "📆",
  "📇",
  "📈",
  "📉",
  "📊",
  "📋",
  "📌",
  "📍",
  "📎",
  "📏",
  "📐",
  "📑",
  "📒",
  "📓",
  "📔",
  "📕",
  "📖",
  "📗",
  "📘",
  "📙",
  "📚",
  "📛",
  "📜",
  "📝",
  "📞",
  "📟",
  "📠",
  "📡",
  "📢",
  "📣",
  "📤",
  "📥",
  "📦",
  "📧",
  "📨",
  "📩",
  "📪",
  "📫",
  "📬",
  "📭",
  "📮",
  "📯",
  "📰",
  "📱",
  "📲",
  "📳",
  "📴",
  "📵",
  "📶",
  "📷",
  "📸",
  "📹",
  "📺",
  "📻",
  "📼",
  "📽",
  "📿",
  "🔀",
  "🔁",
  "🔂",
  "🔃",
  "🔄",
  "🔅",
  "🔆",
  "🔇",
  "🔈",
  "🔉",
  "🔊",
  "🔋",
  "🔌",
  "🔍",
  "🔎",
  "🔏",
  "🔐",
  "🔑",
  "🔒",
  "🔓",
  "🔔",
  "🔕",
  "🔖",
  "🔗",
  "🔘",
  "🔙",
  "🔚",
  "🔛",
  "🔜",
  "🔝",
  "🔞",
  "🔟",
  "🔠",
  "🔡",
  "🔢",
  "🔣",
  "🔤",
  "🔥",
  "🔦",
  "🔧",
  "🔨",
  "🔩",
  "🔪",
  "🔫",
  "🔬",
  "🔭",
  "🔮",
  "🔯",
  "🔰",
  "🔱",
  "🔲",
  "🔳",
  "🔴",
  "🔵",
  "🔶",
  "🔷",
  "🔸",
  "🔹",
  "🔺",
  "🔻",
  "🔼",
  "🔽",
  "🕉",
  "🕊",
  "🕋",
  "🕌",
  "🕍",
  "🕎",
  "🕐",
  "🕑",
  "🕒",
  "🕓",
  "🕔",
  "🕕",
  "🕖",
  "🕗",
  "🕘",
  "🕙",
  "🕚",
  "🕛",
  "🕜",
  "🕝",
  "🕞",
  "🕟",
  "🕠",
  "🕡",
  "🕢",
  "🕣",
  "🕤",
  "🕥",
  "🕦",
  "🕧",
  "🕯",
  "🕰",
  "🕳",
  "🕴🏻",
  "🕴🏼",
  "🕴🏽",
  "🕴🏾",
  "🕴🏿",
  "🕴",
  "🕵🏻‍♀️",
  "🕵🏻‍♂️",
  "🕵🏻",
  "🕵🏼‍♀️",
  "🕵🏼‍♂️",
  "🕵🏼",
  "🕵🏽‍♀️",
  "🕵🏽‍♂️",
  "🕵🏽",
  "🕵🏾‍♀️",
  "🕵🏾‍♂️",
  "🕵🏾",
  "🕵🏿‍♀️",
  "🕵🏿‍♂️",
  "🕵🏿",
  "🕵️‍♀️",
  "🕵️‍♂️",
  "🕵",
  "🕶",
  "🕷",
  "🕸",
  "🕹",
  "🕺🏻",
  "🕺🏼",
  "🕺🏽",
  "🕺🏾",
  "🕺🏿",
  "🕺",
  "🖇",
  "🖊",
  "🖋",
  "🖌",
  "🖍",
  "🖐🏻",
  "🖐🏼",
  "🖐🏽",
  "🖐🏾",
  "🖐🏿",
  "🖐",
  "🖕🏻",
  "🖕🏼",
  "🖕🏽",
  "🖕🏾",
  "🖕🏿",
  "🖕",
  "🖖🏻",
  "🖖🏼",
  "🖖🏽",
  "🖖🏾",
  "🖖🏿",
  "🖖",
  "🖤",
  "🖥",
  "🖨",
  "🖱",
  "🖲",
  "🖼",
  "🗂",
  "🗃",
  "🗄",
  "🗑",
  "🗒",
  "🗓",
  "🗜",
  "🗝",
  "🗞",
  "🗡",
  "🗣",
  "🗨",
  "🗯",
  "🗳",
  "🗺",
  "🗻",
  "🗼",
  "🗽",
  "🗾",
  "🗿",
  "😀",
  "😁",
  "😂",
  "😃",
  "😄",
  "😅",
  "😆",
  "😇",
  "😈",
  "😉",
  "😊",
  "😋",
  "😌",
  "😍",
  "😎",
  "😏",
  "😐",
  "😑",
  "😒",
  "😓",
  "😔",
  "😕",
  "😖",
  "😗",
  "😘",
  "😙",
  "😚",
  "😛",
  "😜",
  "😝",
  "😞",
  "😟",
  "😠",
  "😡",
  "😢",
  "😣",
  "😤",
  "😥",
  "😦",
  "😧",
  "😨",
  "😩",
  "😪",
  "😫",
  "😬",
  "😭",
  "😮",
  "😯",
  "😰",
  "😱",
  "😲",
  "😳",
  "😴",
  "😵",
  "😶",
  "😷",
  "😸",
  "😹",
  "😺",
  "😻",
  "😼",
  "😽",
  "😾",
  "😿",
  "🙀",
  "🙁",
  "🙂",
  "🙃",
  "🙄",
  "🙅🏻‍♀️",
  "🙅🏻‍♂️",
  "🙅🏻",
  "🙅🏼‍♀️",
  "🙅🏼‍♂️",
  "🙅🏼",
  "🙅🏽‍♀️",
  "🙅🏽‍♂️",
  "🙅🏽",
  "🙅🏾‍♀️",
  "🙅🏾‍♂️",
  "🙅🏾",
  "🙅🏿‍♀️",
  "🙅🏿‍♂️",
  "🙅🏿",
  "🙅‍♀️",
  "🙅‍♂️",
  "🙅",
  "🙆🏻‍♀️",
  "🙆🏻‍♂️",
  "🙆🏻",
  "🙆🏼‍♀️",
  "🙆🏼‍♂️",
  "🙆🏼",
  "🙆🏽‍♀️",
  "🙆🏽‍♂️",
  "🙆🏽",
  "🙆🏾‍♀️",
  "🙆🏾‍♂️",
  "🙆🏾",
  "🙆🏿‍♀️",
  "🙆🏿‍♂️",
  "🙆🏿",
  "🙆‍♀️",
  "🙆‍♂️",
  "🙆",
  "🙇🏻‍♀️",
  "🙇🏻‍♂️",
  "🙇🏻",
  "🙇🏼‍♀️",
  "🙇🏼‍♂️",
  "🙇🏼",
  "🙇🏽‍♀️",
  "🙇🏽‍♂️",
  "🙇🏽",
  "🙇🏾‍♀️",
  "🙇🏾‍♂️",
  "🙇🏾",
  "🙇🏿‍♀️",
  "🙇🏿‍♂️",
  "🙇🏿",
  "🙇‍♀️",
  "🙇‍♂️",
  "🙇",
  "🙈",
  "🙉",
  "🙊",
  "🙋🏻‍♀️",
  "🙋🏻‍♂️",
  "🙋🏻",
  "🙋🏼‍♀️",
  "🙋🏼‍♂️",
  "🙋🏼",
  "🙋🏽‍♀️",
  "🙋🏽‍♂️",
  "🙋🏽",
  "🙋🏾‍♀️",
  "🙋🏾‍♂️",
  "🙋🏾",
  "🙋🏿‍♀️",
  "🙋🏿‍♂️",
  "🙋🏿",
  "🙋‍♀️",
  "🙋‍♂️",
  "🙋",
  "🙌🏻",
  "🙌🏼",
  "🙌🏽",
  "🙌🏾",
  "🙌🏿",
  "🙌",
  "🙍🏻‍♀️",
  "🙍🏻‍♂️",
  "🙍🏻",
  "🙍🏼‍♀️",
  "🙍🏼‍♂️",
  "🙍🏼",
  "🙍🏽‍♀️",
  "🙍🏽‍♂️",
  "🙍🏽",
  "🙍🏾‍♀️",
  "🙍🏾‍♂️",
  "🙍🏾",
  "🙍🏿‍♀️",
  "🙍🏿‍♂️",
  "🙍🏿",
  "🙍‍♀️",
  "🙍‍♂️",
  "🙍",
  "🙎🏻‍♀️",
  "🙎🏻‍♂️",
  "🙎🏻",
  "🙎🏼‍♀️",
  "🙎🏼‍♂️",
  "🙎🏼",
  "🙎🏽‍♀️",
  "🙎🏽‍♂️",
  "🙎🏽",
  "🙎🏾‍♀️",
  "🙎🏾‍♂️",
  "🙎🏾",
  "🙎🏿‍♀️",
  "🙎🏿‍♂️",
  "🙎🏿",
  "🙎‍♀️",
  "🙎‍♂️",
  "🙎",
  "🙏🏻",
  "🙏🏼",
  "🙏🏽",
  "🙏🏾",
  "🙏🏿",
  "🙏",
  "🚀",
  "🚁",
  "🚂",
  "🚃",
  "🚄",
  "🚅",
  "🚆",
  "🚇",
  "🚈",
  "🚉",
  "🚊",
  "🚋",
  "🚌",
  "🚍",
  "🚎",
  "🚏",
  "🚐",
  "🚑",
  "🚒",
  "🚓",
  "🚔",
  "🚕",
  "🚖",
  "🚗",
  "🚘",
  "🚙",
  "🚚",
  "🚛",
  "🚜",
  "🚝",
  "🚞",
  "🚟",
  "🚠",
  "🚡",
  "🚢",
  "🚣🏻‍♀️",
  "🚣🏻‍♂️",
  "🚣🏻",
  "🚣🏼‍♀️",
  "🚣🏼‍♂️",
  "🚣🏼",
  "🚣🏽‍♀️",
  "🚣🏽‍♂️",
  "🚣🏽",
  "🚣🏾‍♀️",
  "🚣🏾‍♂️",
  "🚣🏾",
  "🚣🏿‍♀️",
  "🚣🏿‍♂️",
  "🚣🏿",
  "🚣‍♀️",
  "🚣‍♂️",
  "🚣",
  "🚤",
  "🚥",
  "🚦",
  "🚧",
  "🚨",
  "🚩",
  "🚪",
  "🚫",
  "🚬",
  "🚭",
  "🚮",
  "🚯",
  "🚰",
  "🚱",
  "🚲",
  "🚳",
  "🚴🏻‍♀️",
  "🚴🏻‍♂️",
  "🚴🏻",
  "🚴🏼‍♀️",
  "🚴🏼‍♂️",
  "🚴🏼",
  "🚴🏽‍♀️",
  "🚴🏽‍♂️",
  "🚴🏽",
  "🚴🏾‍♀️",
  "🚴🏾‍♂️",
  "🚴🏾",
  "🚴🏿‍♀️",
  "🚴🏿‍♂️",
  "🚴🏿",
  "🚴‍♀️",
  "🚴‍♂️",
  "🚴",
  "🚵🏻‍♀️",
  "🚵🏻‍♂️",
  "🚵🏻",
  "🚵🏼‍♀️",
  "🚵🏼‍♂️",
  "🚵🏼",
  "🚵🏽‍♀️",
  "🚵🏽‍♂️",
  "🚵🏽",
  "🚵🏾‍♀️",
  "🚵🏾‍♂️",
  "🚵🏾",
  "🚵🏿‍♀️",
  "🚵🏿‍♂️",
  "🚵🏿",
  "🚵‍♀️",
  "🚵‍♂️",
  "🚵",
  "🚶🏻‍♀️",
  "🚶🏻‍♂️",
  "🚶🏻",
  "🚶🏼‍♀️",
  "🚶🏼‍♂️",
  "🚶🏼",
  "🚶🏽‍♀️",
  "🚶🏽‍♂️",
  "🚶🏽",
  "🚶🏾‍♀️",
  "🚶🏾‍♂️",
  "🚶🏾",
  "🚶🏿‍♀️",
  "🚶🏿‍♂️",
  "🚶🏿",
  "🚶‍♀️",
  "🚶‍♂️",
  "🚶",
  "🚷",
  "🚸",
  "🚹",
  "🚺",
  "🚻",
  "🚼",
  "🚽",
  "🚾",
  "🚿",
  "🛀🏻",
  "🛀🏼",
  "🛀🏽",
  "🛀🏾",
  "🛀🏿",
  "🛀",
  "🛁",
  "🛂",
  "🛃",
  "🛄",
  "🛅",
  "🛋",
  "🛌🏻",
  "🛌🏼",
  "🛌🏽",
  "🛌🏾",
  "🛌🏿",
  "🛌",
  "🛍",
  "🛎",
  "🛏",
  "🛐",
  "🛑",
  "🛒",
  "🛠",
  "🛡",
  "🛢",
  "🛣",
  "🛤",
  "🛥",
  "🛩",
  "🛫",
  "🛬",
  "🛰",
  "🛳",
  "🛴",
  "🛵",
  "🛶",
  "🤐",
  "🤑",
  "🤒",
  "🤓",
  "🤔",
  "🤕",
  "🤖",
  "🤗",
  "🤘🏻",
  "🤘🏼",
  "🤘🏽",
  "🤘🏾",
  "🤘🏿",
  "🤘",
  "🤙🏻",
  "🤙🏼",
  "🤙🏽",
  "🤙🏾",
  "🤙🏿",
  "🤙",
  "🤚🏻",
  "🤚🏼",
  "🤚🏽",
  "🤚🏾",
  "🤚🏿",
  "🤚",
  "🤛🏻",
  "🤛🏼",
  "🤛🏽",
  "🤛🏾",
  "🤛🏿",
  "🤛",
  "🤜🏻",
  "🤜🏼",
  "🤜🏽",
  "🤜🏾",
  "🤜🏿",
  "🤜",
  "🤝🏻",
  "🤝🏼",
  "🤝🏽",
  "🤝🏾",
  "🤝🏿",
  "🤝",
  "🤞🏻",
  "🤞🏼",
  "🤞🏽",
  "🤞🏾",
  "🤞🏿",
  "🤞",
  "🤠",
  "🤡",
  "🤢",
  "🤣",
  "🤤",
  "🤥",
  "🤦🏻‍♀️",
  "🤦🏻‍♂️",
  "🤦🏻",
  "🤦🏼‍♀️",
  "🤦🏼‍♂️",
  "🤦🏼",
  "🤦🏽‍♀️",
  "🤦🏽‍♂️",
  "🤦🏽",
  "🤦🏾‍♀️",
  "🤦🏾‍♂️",
  "🤦🏾",
  "🤦🏿‍♀️",
  "🤦🏿‍♂️",
  "🤦🏿",
  "🤦‍♀️",
  "🤦‍♂️",
  "🤦",
  "🤧",
  "🤰🏻",
  "🤰🏼",
  "🤰🏽",
  "🤰🏾",
  "🤰🏿",
  "🤰",
  "🤳🏻",
  "🤳🏼",
  "🤳🏽",
  "🤳🏾",
  "🤳🏿",
  "🤳",
  "🤴🏻",
  "🤴🏼",
  "🤴🏽",
  "🤴🏾",
  "🤴🏿",
  "🤴",
  "🤵🏻",
  "🤵🏼",
  "🤵🏽",
  "🤵🏾",
  "🤵🏿",
  "🤵",
  "🤶🏻",
  "🤶🏼",
  "🤶🏽",
  "🤶🏾",
  "🤶🏿",
  "🤶",
  "🤷🏻‍♀️",
  "🤷🏻‍♂️",
  "🤷🏻",
  "🤷🏼‍♀️",
  "🤷🏼‍♂️",
  "🤷🏼",
  "🤷🏽‍♀️",
  "🤷🏽‍♂️",
  "🤷🏽",
  "🤷🏾‍♀️",
  "🤷🏾‍♂️",
  "🤷🏾",
  "🤷🏿‍♀️",
  "🤷🏿‍♂️",
  "🤷🏿",
  "🤷‍♀️",
  "🤷‍♂️",
  "🤷",
  "🤸🏻‍♀️",
  "🤸🏻‍♂️",
  "🤸🏻",
  "🤸🏼‍♀️",
  "🤸🏼‍♂️",
  "🤸🏼",
  "🤸🏽‍♀️",
  "🤸🏽‍♂️",
  "🤸🏽",
  "🤸🏾‍♀️",
  "🤸🏾‍♂️",
  "🤸🏾",
  "🤸🏿‍♀️",
  "🤸🏿‍♂️",
  "🤸🏿",
  "🤸‍♀️",
  "🤸‍♂️",
  "🤸",
  "🤹🏻‍♀️",
  "🤹🏻‍♂️",
  "🤹🏻",
  "🤹🏼‍♀️",
  "🤹🏼‍♂️",
  "🤹🏼",
  "🤹🏽‍♀️",
  "🤹🏽‍♂️",
  "🤹🏽",
  "🤹🏾‍♀️",
  "🤹🏾‍♂️",
  "🤹🏾",
  "🤹🏿‍♀️",
  "🤹🏿‍♂️",
  "🤹🏿",
  "🤹‍♀️",
  "🤹‍♂️",
  "🤹",
  "🤺",
  "🤼🏻‍♀️",
  "🤼🏻‍♂️",
  "🤼🏻",
  "🤼🏼‍♀️",
  "🤼🏼‍♂️",
  "🤼🏼",
  "🤼🏽‍♀️",
  "🤼🏽‍♂️",
  "🤼🏽",
  "🤼🏾‍♀️",
  "🤼🏾‍♂️",
  "🤼🏾",
  "🤼🏿‍♀️",
  "🤼🏿‍♂️",
  "🤼🏿",
  "🤼‍♀️",
  "🤼‍♂️",
  "🤼",
  "🤽🏻‍♀️",
  "🤽🏻‍♂️",
  "🤽🏻",
  "🤽🏼‍♀️",
  "🤽🏼‍♂️",
  "🤽🏼",
  "🤽🏽‍♀️",
  "🤽🏽‍♂️",
  "🤽🏽",
  "🤽🏾‍♀️",
  "🤽🏾‍♂️",
  "🤽🏾",
  "🤽🏿‍♀️",
  "🤽🏿‍♂️",
  "🤽🏿",
  "🤽‍♀️",
  "🤽‍♂️",
  "🤽",
  "🤾🏻‍♀️",
  "🤾🏻‍♂️",
  "🤾🏻",
  "🤾🏼‍♀️",
  "🤾🏼‍♂️",
  "🤾🏼",
  "🤾🏽‍♀️",
  "🤾🏽‍♂️",
  "🤾🏽",
  "🤾🏾‍♀️",
  "🤾🏾‍♂️",
  "🤾🏾",
  "🤾🏿‍♀️",
  "🤾🏿‍♂️",
  "🤾🏿",
  "🤾‍♀️",
  "🤾‍♂️",
  "🤾",
  "🥀",
  "🥁",
  "🥂",
  "🥃",
  "🥄",
  "🥅",
  "🥇",
  "🥈",
  "🥉",
  "🥊",
  "🥋",
  "🥐",
  "🥑",
  "🥒",
  "🥓",
  "🥔",
  "🥕",
  "🥖",
  "🥗",
  "🥘",
  "🥙",
  "🥚",
  "🥛",
  "🥜",
  "🥝",
  "🥞",
  "🦀",
  "🦁",
  "🦂",
  "🦃",
  "🦄",
  "🦅",
  "🦆",
  "🦇",
  "🦈",
  "🦉",
  "🦊",
  "🦋",
  "🦌",
  "🦍",
  "🦎",
  "🦏",
  "🦐",
  "🦑",
  "🧀",
  "‼",
  "⁉",
  "™",
  "ℹ",
  "↔",
  "↕",
  "↖",
  "↗",
  "↘",
  "↙",
  "↩",
  "↪",
  "#⃣",
  "⌚",
  "⌛",
  "⌨",
  "⏏",
  "⏩",
  "⏪",
  "⏫",
  "⏬",
  "⏭",
  "⏮",
  "⏯",
  "⏰",
  "⏱",
  "⏲",
  "⏳",
  "⏸",
  "⏹",
  "⏺",
  "Ⓜ",
  "▪",
  "▫",
  "▶",
  "◀",
  "◻",
  "◼",
  "◽",
  "◾",
  "☀",
  "☁",
  "☂",
  "☃",
  "☄",
  "☎",
  "☑",
  "☔",
  "☕",
  "☘",
  "☝🏻",
  "☝🏼",
  "☝🏽",
  "☝🏾",
  "☝🏿",
  "☝",
  "☠",
  "☢",
  "☣",
  "☦",
  "☪",
  "☮",
  "☯",
  "☸",
  "☹",
  "☺",
  "♀",
  "♂",
  "♈",
  "♉",
  "♊",
  "♋",
  "♌",
  "♍",
  "♎",
  "♏",
  "♐",
  "♑",
  "♒",
  "♓",
  "♠",
  "♣",
  "♥",
  "♦",
  "♨",
  "♻",
  "♿",
  "⚒",
  "⚓",
  "⚔",
  "⚕",
  "⚖",
  "⚗",
  "⚙",
  "⚛",
  "⚜",
  "⚠",
  "⚡",
  "⚪",
  "⚫",
  "⚰",
  "⚱",
  "⚽",
  "⚾",
  "⛄",
  "⛅",
  "⛈",
  "⛎",
  "⛏",
  "⛑",
  "⛓",
  "⛔",
  "⛩",
  "⛪",
  "⛰",
  "⛱",
  "⛲",
  "⛳",
  "⛴",
  "⛵",
  "⛷🏻",
  "⛷🏼",
  "⛷🏽",
  "⛷🏾",
  "⛷🏿",
  "⛷",
  "⛸",
  "⛹🏻‍♀️",
  "⛹🏻‍♂️",
  "⛹🏻",
  "⛹🏼‍♀️",
  "⛹🏼‍♂️",
  "⛹🏼",
  "⛹🏽‍♀️",
  "⛹🏽‍♂️",
  "⛹🏽",
  "⛹🏾‍♀️",
  "⛹🏾‍♂️",
  "⛹🏾",
  "⛹🏿‍♀️",
  "⛹🏿‍♂️",
  "⛹🏿",
  "⛹️‍♀️",
  "⛹️‍♂️",
  "⛹",
  "⛺",
  "⛽",
  "✂",
  "✅",
  "✈",
  "✉",
  "✊🏻",
  "✊🏼",
  "✊🏽",
  "✊🏾",
  "✊🏿",
  "✊",
  "✋🏻",
  "✋🏼",
  "✋🏽",
  "✋🏾",
  "✋🏿",
  "✋",
  "✌🏻",
  "✌🏼",
  "✌🏽",
  "✌🏾",
  "✌🏿",
  "✌",
  "✍🏻",
  "✍🏼",
  "✍🏽",
  "✍🏾",
  "✍🏿",
  "✍",
  "✏",
  "✒",
  "✔",
  "✖",
  "✝",
  "✡",
  "✨",
  "✳",
  "✴",
  "❄",
  "❇",
  "❌",
  "❎",
  "❓",
  "❔",
  "❕",
  "❗",
  "❣",
  "❤",
  "➕",
  "➖",
  "➗",
  "➡",
  "➰",
  "➿",
  "⤴",
  "⤵",
  "*⃣",
  "⬅",
  "⬆",
  "⬇",
  "⬛",
  "⬜",
  "⭐",
  "⭕",
  "0⃣",
  "〰",
  "〽",
  "1⃣",
  "2⃣",
  "㊗",
  "㊙",
  "3⃣",
  "4⃣",
  "5⃣",
  "6⃣",
  "7⃣",
  "8⃣",
  "9⃣",
  "©",
  "®",
  ""
]

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
class Emitter {
    constructor(options) {
        this.isRenderCommentsEnabled = (options && options.emitComments) || false;
    }
    format(root) {
        return this.formatNode(root, 0);
    }
    formatNode(node, indentationDepth) {
        const declarationPrefix = indentationDepth === 0 ? 'interface ' : '\t'.repeat(indentationDepth);
        let partialDeclaration = `${declarationPrefix}${node.identifier} {\n`;
        node.functions.forEach((templateFunction) => partialDeclaration += this.formatFunction(templateFunction, indentationDepth + 1));
        node.children.forEach((child) => partialDeclaration += this.formatNode(child, indentationDepth + 1));
        partialDeclaration += `${'\t'.repeat(indentationDepth)}}\n`;
        return partialDeclaration;
    }
    formatFunction(templateFunction, indentationDepth) {
        let functionDeclaration = `${'\t'.repeat(indentationDepth)}${templateFunction.name}: (`;
        if (templateFunction.params.length > 0) {
            functionDeclaration += this.formatParameters(templateFunction.params, indentationDepth + 1);
        }
        functionDeclaration += `) => DocumentFragment;\n`;
        return functionDeclaration;
    }
    formatParameters(params, indentationDepth) {
        let parameterObjectDeclaration = '{';
        // parameterObjectDeclaration += this.isRenderCommentsEnabled ? `\n${'\t'.repeat(indentationDepth)}` : '';
        parameterObjectDeclaration += params
            .map((param) => this.renderParameter(param, indentationDepth))
            .join(`,${this.isRenderCommentsEnabled ? '' : ' '}`);
        parameterObjectDeclaration += this.isRenderCommentsEnabled ? `\n${'\t'.repeat(indentationDepth - 1)}` : '';
        parameterObjectDeclaration += '}';
        return parameterObjectDeclaration;
    }
    renderParameter(param, indentationDepth) {
        const commentIfAny = this.renderCommentIfAppropriate(param.comment, indentationDepth);
        const indentingPrefix = `\n${'\t'.repeat(indentationDepth)}`;
        return `${commentIfAny}${this.isRenderCommentsEnabled ? indentingPrefix : ''}${param.name}${param.optionality ? '?' : ''}: ${param.type}`;
    }
    renderCommentIfAppropriate(comment, indentationDepth) {
        return this.isRenderCommentsEnabled && comment
            ? `\n${'\t'.repeat(indentationDepth)}/* ${comment} */`
            : '';
    }
}
exports.Emitter = Emitter;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Lexer;
(function (Lexer) {
    const NAMESPACE_REGEX = /{namespace\s+(.+)\s*}/;
    const TEMPLATE_REGEX = /{template\s+\.(.+)\s*}/g;
    const PARAM_REGEX = /@param\s+(.+)/g;
    function tokenize(input) {
        return {
            namespace: findNamespace(input),
            templates: findTemplateFunctions(input)
        };
    }
    Lexer.tokenize = tokenize;
    function findNamespace(input) {
        const namespace = input.match(NAMESPACE_REGEX);
        if (namespace === null) {
            throw new Error('No namespace declaration found.');
        }
        return namespace[1];
    }
    function findTemplateFunctions(input) {
        let templates = [], match;
        while (match = TEMPLATE_REGEX.exec(input)) {
            templates.push(constructTemplate(match));
        }
        return templates;
    }
    function constructTemplate(matchData) {
        return {
            name: matchData[1],
            params: extractParamsFromJSDoc(findJSDoc(matchData.input, matchData.index))
        };
    }
    function extractParamsFromJSDoc(jsDoc) {
        let params = [], match;
        while (match = PARAM_REGEX.exec(jsDoc)) {
            params.push(match[1]);
        }
        return params;
    }
    function findJSDoc(input, matchIndex) {
        const inputBeforeMatch = input.substr(0, matchIndex);
        let jsDoc = input.slice(inputBeforeMatch.lastIndexOf('/**'), matchIndex);
        if (jsDoc.includes('{template')) {
            jsDoc = '';
        }
        return jsDoc;
    }
    Lexer.findJSDoc = findJSDoc;
})(Lexer = exports.Lexer || (exports.Lexer = {}));


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Parser;
(function (Parser) {
    const PARAM_NAME_REGEX = /(\w+)\??:?/;
    const PARAM_TYPE_REGEX = /:\s*(\S+)\s?/;
    const PARAM_COMMENT_REGEX = /:\s*\S+\s+(.*)/;
    function generateRootNamespaceNode(declaration) {
        const namespaceArray = declaration.namespace.split('.');
        const rootIdentifier = namespaceArray.shift();
        if (!rootIdentifier) {
            throw new Error('No namespace root found.');
        }
        const root = {
            identifier: rootIdentifier,
            children: [],
            functions: []
        };
        let currentNode = root;
        namespaceArray.forEach((identifier) => {
            let parentNode = currentNode;
            currentNode = {
                identifier: identifier,
                children: [],
                functions: []
            };
            parentNode.children.push(currentNode);
        });
        currentNode.functions = currentNode.functions.concat(parseTemplates(declaration.templates));
        return root;
    }
    Parser.generateRootNamespaceNode = generateRootNamespaceNode;
    function parseTemplates(templates) {
        return templates.map((template) => parseTemplate(template));
    }
    function parseTemplate(template) {
        return {
            name: template.name,
            params: parseTemplateParameterAnnotations(template.params)
        };
    }
    function parseTemplateParameterAnnotations(params) {
        return params.map((param) => parseTemplateParameterAnnotation(param));
    }
    function parseTemplateParameterAnnotation(param) {
        const nameMatch = param.match(PARAM_NAME_REGEX);
        if (!nameMatch) {
            throw new Error('Found function parameter without name.');
        }
        const typeMatch = param.match(PARAM_TYPE_REGEX);
        const commentMatch = param.match(PARAM_COMMENT_REGEX);
        return {
            name: nameMatch[1],
            optionality: nameMatch[0].includes('?'),
            type: typeMatch ? typeMatch[1] : '',
            comment: commentMatch ? commentMatch[1] : ''
        };
    }
})(Parser = exports.Parser || (exports.Parser = {}));


/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNjA2ZmJjYmFlOTlkM2FiM2I1NGEiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvcGFyc2VRdWVyeS5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJwYXRoXCIiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvZ2V0SGFzaERpZ2VzdC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvZ2V0T3B0aW9ucy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvanNvbjUvbGliL2pzb241LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9sb2FkZXItdXRpbHMvbGliL3N0cmluZ2lmeVJlcXVlc3QuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvZ2V0UmVtYWluaW5nUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbG9hZGVyLXV0aWxzL2xpYi9nZXRDdXJyZW50UmVxdWVzdC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbG9hZGVyLXV0aWxzL2xpYi9pc1VybFJlcXVlc3QuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvdXJsVG9SZXF1ZXN0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9sb2FkZXItdXRpbHMvbGliL3BhcnNlU3RyaW5nLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9iaWcuanMvYmlnLmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcImNyeXB0b1wiIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9sb2FkZXItdXRpbHMvbGliL2ludGVycG9sYXRlTmFtZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvZW1vamlzLWxpc3QvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3N5bnRoZXNpcy9lbWl0dGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9zeW50YXgvbGV4ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlbWFudGljcy9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7OztBQzdEQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsNEJBQTRCO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNyREEsaUM7Ozs7Ozs7QUNBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLFFBQVE7QUFDcEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7O0FDbERBLDhDQUF3QztBQUN4QywwQ0FBNEM7QUFDNUMsd0NBQXFDO0FBQ3JDLHlDQUEwQztBQUUxQyxtQkFBOEMsTUFBYztJQUMzRCxNQUFNLE9BQU8sR0FBRyx5QkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pDLE1BQU0sT0FBTyxHQUFHLElBQUksaUJBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUVyQyxNQUFNLG1CQUFtQixHQUFHLGFBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkQsTUFBTSxpQkFBaUIsR0FBRyxlQUFNLENBQUMseUJBQXlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztJQUNoRixNQUFNLHFCQUFxQixHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUVoRSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDOUIsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUNkLFFBQVEsQ0FBQyxJQUFJLEVBQUUscUJBQXFCLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ0QsTUFBTSxDQUFDLHFCQUFxQixDQUFDO0FBQzlCLENBQUM7QUFiRCw0QkFhQzs7Ozs7Ozs7QUNwQkQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDdEJBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpQ0FBdUQ7O0FBRXZEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxTQUFTOztBQUVUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVEQUF1RDs7QUFFdkQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxTQUFTOztBQUVUOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxPQUFPO0FBQ2xCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBOzs7QUFHQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFBQTs7QUFFVDtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7O0FDem5DRCxtQzs7Ozs7OztBQ0FBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDOUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEM7Ozs7Ozs7OztBQzM2RUE7SUFJQyxZQUFZLE9BQXNCO1FBQ2pDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksS0FBSyxDQUFDO0lBQzNFLENBQUM7SUFFTSxNQUFNLENBQUMsSUFBK0I7UUFDNUMsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFFTyxVQUFVLENBQUMsSUFBK0IsRUFBRSxnQkFBd0I7UUFDM0UsTUFBTSxpQkFBaUIsR0FBRyxnQkFBZ0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2hHLElBQUksa0JBQWtCLEdBQUcsR0FBRyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsVUFBVSxNQUFNLENBQUM7UUFDdEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLENBQUMsa0JBQWtCLElBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JHLGtCQUFrQixJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUM7UUFDNUQsTUFBTSxDQUFDLGtCQUFrQixDQUFDO0lBQzNCLENBQUM7SUFFTyxjQUFjLENBQUMsZ0JBQWtDLEVBQUUsZ0JBQXdCO1FBQ2xGLElBQUksbUJBQW1CLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxLQUFLLENBQUM7UUFDeEYsRUFBRSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLG1CQUFtQixJQUFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUNELG1CQUFtQixJQUFJLDBCQUEwQixDQUFDO1FBQ2xELE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQztJQUM1QixDQUFDO0lBRU8sZ0JBQWdCLENBQUMsTUFBMkIsRUFBRSxnQkFBd0I7UUFDN0UsSUFBSSwwQkFBMEIsR0FBRyxHQUFHLENBQUM7UUFDckMsMEdBQTBHO1FBQzFHLDBCQUEwQixJQUFJLE1BQU07YUFDbEMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO2FBQzdELElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ3RELDBCQUEwQixJQUFJLElBQUksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUMzRywwQkFBMEIsSUFBSSxHQUFHLENBQUM7UUFDbEMsTUFBTSxDQUFDLDBCQUEwQixDQUFDO0lBQ25DLENBQUM7SUFFTyxlQUFlLENBQUMsS0FBd0IsRUFBRSxnQkFBd0I7UUFDekUsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN0RixNQUFNLGVBQWUsR0FBRyxLQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDO1FBQzdELE1BQU0sQ0FBQyxHQUFHLFlBQVksR0FBRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzNJLENBQUM7SUFFTywwQkFBMEIsQ0FBQyxPQUFlLEVBQUUsZ0JBQXdCO1FBQzNFLE1BQU0sQ0FBQyxJQUFJLENBQUMsdUJBQXVCLElBQUksT0FBTztZQUM3QyxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sT0FBTyxLQUFLO1lBQ3RELENBQUMsQ0FBQyxFQUFFLENBQUM7SUFDUCxDQUFDO0NBRUQ7QUFyREQsMEJBcURDOzs7Ozs7Ozs7O0FDdERELElBQWMsS0FBSyxDQXFEbEI7QUFyREQsV0FBYyxLQUFLO0lBRWxCLE1BQU0sZUFBZSxHQUFHLHVCQUF1QixDQUFDO0lBQ2hELE1BQU0sY0FBYyxHQUFHLHlCQUF5QixDQUFDO0lBQ2pELE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDO0lBRXJDLGtCQUF5QixLQUFhO1FBQ3JDLE1BQU0sQ0FBQztZQUNOLFNBQVMsRUFBRSxhQUFhLENBQUMsS0FBSyxDQUFDO1lBQy9CLFNBQVMsRUFBRSxxQkFBcUIsQ0FBQyxLQUFLLENBQUM7U0FDdkM7SUFDRixDQUFDO0lBTGUsY0FBUSxXQUt2QjtJQUVELHVCQUF1QixLQUFhO1FBQ25DLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDL0MsRUFBRSxDQUFDLENBQUMsU0FBUyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDeEIsTUFBTSxJQUFJLEtBQUssQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLENBQUM7SUFFRCwrQkFBK0IsS0FBYTtRQUMzQyxJQUFJLFNBQVMsR0FBZSxFQUFFLEVBQUUsS0FBSyxDQUFDO1FBQ3RDLE9BQU8sS0FBSyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMzQyxTQUFTLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDMUMsQ0FBQztRQUNELE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDbEIsQ0FBQztJQUVELDJCQUEyQixTQUEwQjtRQUNwRCxNQUFNLENBQUM7WUFDTixJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNsQixNQUFNLEVBQUUsc0JBQXNCLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQzNFLENBQUM7SUFDSCxDQUFDO0lBRUQsZ0NBQWdDLEtBQWE7UUFDNUMsSUFBSSxNQUFNLEdBQWtDLEVBQUUsRUFBRSxLQUFLLENBQUM7UUFDdEQsT0FBTyxLQUFLLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDZixDQUFDO0lBRUQsbUJBQTBCLEtBQWEsRUFBRSxVQUFrQjtRQUMxRCxNQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3JELElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3pFLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2pDLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDWixDQUFDO1FBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQztJQUNkLENBQUM7SUFQZSxlQUFTLFlBT3hCO0FBRUYsQ0FBQyxFQXJEYSxLQUFLLEdBQUwsYUFBSyxLQUFMLGFBQUssUUFxRGxCOzs7Ozs7Ozs7O0FDcERELElBQWMsTUFBTSxDQTZEbkI7QUE3REQsV0FBYyxNQUFNO0lBRW5CLE1BQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDO0lBQ3RDLE1BQU0sZ0JBQWdCLEdBQUcsY0FBYyxDQUFDO0lBQ3hDLE1BQU0sbUJBQW1CLEdBQUcsZ0JBQWdCLENBQUM7SUFFN0MsbUNBQTBDLFdBQWdDO1FBQ3pFLE1BQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3hELE1BQU0sY0FBYyxHQUFHLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM5QyxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUM7WUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQzdDLENBQUM7UUFDRCxNQUFNLElBQUksR0FBOEI7WUFDdkMsVUFBVSxFQUFFLGNBQWM7WUFDMUIsUUFBUSxFQUFFLEVBQUU7WUFDWixTQUFTLEVBQUUsRUFBRTtTQUNiLENBQUM7UUFDRixJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFDdkIsY0FBYyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3JDLElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQztZQUM3QixXQUFXLEdBQUc7Z0JBQ2IsVUFBVSxFQUFFLFVBQVU7Z0JBQ3RCLFFBQVEsRUFBRSxFQUFFO2dCQUNaLFNBQVMsRUFBRSxFQUFFO2FBQ2IsQ0FBQztZQUNGLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsV0FBVyxDQUFDLFNBQVMsR0FBRyxXQUFXLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7UUFDNUYsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNiLENBQUM7SUF2QmUsZ0NBQXlCLDRCQXVCeEM7SUFFRCx3QkFBd0IsU0FBcUI7UUFDNUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzdELENBQUM7SUFFRCx1QkFBdUIsUUFBa0I7UUFDeEMsTUFBTSxDQUFDO1lBQ04sSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO1lBQ25CLE1BQU0sRUFBRSxpQ0FBaUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1NBQzFELENBQUM7SUFDSCxDQUFDO0lBRUQsMkNBQTJDLE1BQXFDO1FBQy9FLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxnQ0FBZ0MsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFRCwwQ0FBMEMsS0FBa0M7UUFDM0UsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ2hELEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztZQUNoQixNQUFNLElBQUksS0FBSyxDQUFDLHdDQUF3QyxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUNELE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUNoRCxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDdEQsTUFBTSxDQUFDO1lBQ04sSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbEIsV0FBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO1lBQ3ZDLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUNuQyxPQUFPLEVBQUUsWUFBWSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7U0FDNUMsQ0FBQztJQUNILENBQUM7QUFFRixDQUFDLEVBN0RhLE1BQU0sR0FBTixjQUFNLEtBQU4sY0FBTSxRQTZEbkIiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAzKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA2MDZmYmNiYWU5OWQzYWIzYjU0YSIsIlwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBKU09ONSA9IHJlcXVpcmUoXCJqc29uNVwiKTtcblxuY29uc3Qgc3BlY2lhbFZhbHVlcyA9IHtcblx0XCJudWxsXCI6IG51bGwsXG5cdFwidHJ1ZVwiOiB0cnVlLFxuXHRcImZhbHNlXCI6IGZhbHNlXG59O1xuXG5mdW5jdGlvbiBwYXJzZVF1ZXJ5KHF1ZXJ5KSB7XG5cdGlmKHF1ZXJ5LnN1YnN0cigwLCAxKSAhPT0gXCI/XCIpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBIHZhbGlkIHF1ZXJ5IHN0cmluZyBwYXNzZWQgdG8gcGFyc2VRdWVyeSBzaG91bGQgYmVnaW4gd2l0aCAnPydcIik7XG5cdH1cblx0cXVlcnkgPSBxdWVyeS5zdWJzdHIoMSk7XG5cdGlmKCFxdWVyeSkge1xuXHRcdHJldHVybiB7fTtcblx0fVxuXHRpZihxdWVyeS5zdWJzdHIoMCwgMSkgPT09IFwie1wiICYmIHF1ZXJ5LnN1YnN0cigtMSkgPT09IFwifVwiKSB7XG5cdFx0cmV0dXJuIEpTT041LnBhcnNlKHF1ZXJ5KTtcblx0fVxuXHRjb25zdCBxdWVyeUFyZ3MgPSBxdWVyeS5zcGxpdCgvWywmXS9nKTtcblx0Y29uc3QgcmVzdWx0ID0ge307XG5cdHF1ZXJ5QXJncy5mb3JFYWNoKGFyZyA9PiB7XG5cdFx0Y29uc3QgaWR4ID0gYXJnLmluZGV4T2YoXCI9XCIpO1xuXHRcdGlmKGlkeCA+PSAwKSB7XG5cdFx0XHRsZXQgbmFtZSA9IGFyZy5zdWJzdHIoMCwgaWR4KTtcblx0XHRcdGxldCB2YWx1ZSA9IGRlY29kZVVSSUNvbXBvbmVudChhcmcuc3Vic3RyKGlkeCArIDEpKTtcblx0XHRcdGlmKHNwZWNpYWxWYWx1ZXMuaGFzT3duUHJvcGVydHkodmFsdWUpKSB7XG5cdFx0XHRcdHZhbHVlID0gc3BlY2lhbFZhbHVlc1t2YWx1ZV07XG5cdFx0XHR9XG5cdFx0XHRpZihuYW1lLnN1YnN0cigtMikgPT09IFwiW11cIikge1xuXHRcdFx0XHRuYW1lID0gZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUuc3Vic3RyKDAsIG5hbWUubGVuZ3RoIC0gMikpO1xuXHRcdFx0XHRpZighQXJyYXkuaXNBcnJheShyZXN1bHRbbmFtZV0pKVxuXHRcdFx0XHRcdHJlc3VsdFtuYW1lXSA9IFtdO1xuXHRcdFx0XHRyZXN1bHRbbmFtZV0ucHVzaCh2YWx1ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRuYW1lID0gZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUpO1xuXHRcdFx0XHRyZXN1bHRbbmFtZV0gPSB2YWx1ZTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYoYXJnLnN1YnN0cigwLCAxKSA9PT0gXCItXCIpIHtcblx0XHRcdFx0cmVzdWx0W2RlY29kZVVSSUNvbXBvbmVudChhcmcuc3Vic3RyKDEpKV0gPSBmYWxzZTtcblx0XHRcdH0gZWxzZSBpZihhcmcuc3Vic3RyKDAsIDEpID09PSBcIitcIikge1xuXHRcdFx0XHRyZXN1bHRbZGVjb2RlVVJJQ29tcG9uZW50KGFyZy5zdWJzdHIoMSkpXSA9IHRydWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXN1bHRbZGVjb2RlVVJJQ29tcG9uZW50KGFyZyldID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBhcnNlUXVlcnk7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9sb2FkZXItdXRpbHMvbGliL3BhcnNlUXVlcnkuanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwicGF0aFwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcInBhdGhcIlxuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcblxuY29uc3QgYmFzZUVuY29kZVRhYmxlcyA9IHtcblx0MjY6IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIixcblx0MzI6IFwiMTIzNDU2Nzg5YWJjZGVmZ2hqa21ucHFyc3R1dnd4eXpcIiwgLy8gbm8gMGxpb1xuXHQzNjogXCIwMTIzNDU2Nzg5YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpcIixcblx0NDk6IFwiYWJjZGVmZ2hpamttbm9wcXJzdHV2d3h5ekFCQ0RFRkdISktMTU5QUVJTVFVWV1hZWlwiLCAvLyBubyBsSU9cblx0NTI6IFwiYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWlwiLFxuXHQ1ODogXCIxMjM0NTY3ODlhYmNkZWZnaGlqa21ub3BxcnN0dXZ3eHl6QUJDREVGR0hKS0xNTlBRUlNUVVZXWFlaXCIsIC8vIG5vIDBsSU9cblx0NjI6IFwiMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpcIixcblx0NjQ6IFwiMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVotX1wiXG59O1xuXG5mdW5jdGlvbiBlbmNvZGVCdWZmZXJUb0Jhc2UoYnVmZmVyLCBiYXNlKSB7XG5cdGNvbnN0IGVuY29kZVRhYmxlID0gYmFzZUVuY29kZVRhYmxlc1tiYXNlXTtcblx0aWYoIWVuY29kZVRhYmxlKSB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIGVuY29kaW5nIGJhc2VcIiArIGJhc2UpO1xuXG5cdGNvbnN0IHJlYWRMZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuXG5cdGNvbnN0IEJpZyA9IHJlcXVpcmUoXCJiaWcuanNcIik7XG5cdEJpZy5STSA9IEJpZy5EUCA9IDA7XG5cdGxldCBiID0gbmV3IEJpZygwKTtcblx0Zm9yKGxldCBpID0gcmVhZExlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0YiA9IGIudGltZXMoMjU2KS5wbHVzKGJ1ZmZlcltpXSk7XG5cdH1cblxuXHRsZXQgb3V0cHV0ID0gXCJcIjtcblx0d2hpbGUoYi5ndCgwKSkge1xuXHRcdG91dHB1dCA9IGVuY29kZVRhYmxlW2IubW9kKGJhc2UpXSArIG91dHB1dDtcblx0XHRiID0gYi5kaXYoYmFzZSk7XG5cdH1cblxuXHRCaWcuRFAgPSAyMDtcblx0QmlnLlJNID0gMTtcblxuXHRyZXR1cm4gb3V0cHV0O1xufVxuXG5mdW5jdGlvbiBnZXRIYXNoRGlnZXN0KGJ1ZmZlciwgaGFzaFR5cGUsIGRpZ2VzdFR5cGUsIG1heExlbmd0aCkge1xuXHRoYXNoVHlwZSA9IGhhc2hUeXBlIHx8IFwibWQ1XCI7XG5cdG1heExlbmd0aCA9IG1heExlbmd0aCB8fCA5OTk5O1xuXHRjb25zdCBoYXNoID0gcmVxdWlyZShcImNyeXB0b1wiKS5jcmVhdGVIYXNoKGhhc2hUeXBlKTtcblx0aGFzaC51cGRhdGUoYnVmZmVyKTtcblx0aWYoZGlnZXN0VHlwZSA9PT0gXCJiYXNlMjZcIiB8fCBkaWdlc3RUeXBlID09PSBcImJhc2UzMlwiIHx8IGRpZ2VzdFR5cGUgPT09IFwiYmFzZTM2XCIgfHxcblx0XHRkaWdlc3RUeXBlID09PSBcImJhc2U0OVwiIHx8IGRpZ2VzdFR5cGUgPT09IFwiYmFzZTUyXCIgfHwgZGlnZXN0VHlwZSA9PT0gXCJiYXNlNThcIiB8fFxuXHRcdGRpZ2VzdFR5cGUgPT09IFwiYmFzZTYyXCIgfHwgZGlnZXN0VHlwZSA9PT0gXCJiYXNlNjRcIikge1xuXHRcdHJldHVybiBlbmNvZGVCdWZmZXJUb0Jhc2UoaGFzaC5kaWdlc3QoKSwgZGlnZXN0VHlwZS5zdWJzdHIoNCkpLnN1YnN0cigwLCBtYXhMZW5ndGgpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBoYXNoLmRpZ2VzdChkaWdlc3RUeXBlIHx8IFwiaGV4XCIpLnN1YnN0cigwLCBtYXhMZW5ndGgpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0SGFzaERpZ2VzdDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvZ2V0SGFzaERpZ2VzdC5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgd2VicGFjayA9IHJlcXVpcmUoJ3dlYnBhY2snKTtcbmltcG9ydCBMb2FkZXJDb250ZXh0ID0gd2VicGFjay5sb2FkZXIuTG9hZGVyQ29udGV4dDtcbmltcG9ydCB7Z2V0T3B0aW9uc30gZnJvbSAnbG9hZGVyLXV0aWxzJztcbmltcG9ydCB7RW1pdHRlcn0gZnJvbSAnLi9zeW50aGVzaXMvZW1pdHRlcic7XG5pbXBvcnQge0xleGVyfSBmcm9tICcuL3N5bnRheC9sZXhlcic7XG5pbXBvcnQge1BhcnNlcn0gZnJvbSAnLi9zZW1hbnRpY3MvcGFyc2VyJztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKHRoaXM6IExvYWRlckNvbnRleHQsIHNvdXJjZTogc3RyaW5nKTogc3RyaW5nIHtcblx0Y29uc3Qgb3B0aW9ucyA9IGdldE9wdGlvbnModGhpcyk7XG5cdGNvbnN0IGVtaXR0ZXIgPSBuZXcgRW1pdHRlcihvcHRpb25zKTtcblxuXHRjb25zdCB0ZW1wbGF0ZURlY2xhcmF0aW9uID0gTGV4ZXIudG9rZW5pemUoc291cmNlKTtcblx0Y29uc3Qgcm9vdE5hbWVzcGFjZU5vZGUgPSBQYXJzZXIuZ2VuZXJhdGVSb290TmFtZXNwYWNlTm9kZSh0ZW1wbGF0ZURlY2xhcmF0aW9uKTtcblx0Y29uc3QgdGFyZ2V0VHlwZURlY2xhcmF0aW9uID0gZW1pdHRlci5mb3JtYXQocm9vdE5hbWVzcGFjZU5vZGUpO1xuXG5cdGNvbnN0IGNhbGxiYWNrID0gdGhpcy5hc3luYygpO1xuXHRpZiAoY2FsbGJhY2spIHtcblx0XHRjYWxsYmFjayhudWxsLCB0YXJnZXRUeXBlRGVjbGFyYXRpb24pO1xuXHR9XG5cdHJldHVybiB0YXJnZXRUeXBlRGVjbGFyYXRpb247XG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvaW5kZXgudHMiLCJcInVzZSBzdHJpY3RcIjtcblxuY29uc3QgZ2V0T3B0aW9ucyA9IHJlcXVpcmUoXCIuL2dldE9wdGlvbnNcIik7XG5jb25zdCBwYXJzZVF1ZXJ5ID0gcmVxdWlyZShcIi4vcGFyc2VRdWVyeVwiKTtcbmNvbnN0IHN0cmluZ2lmeVJlcXVlc3QgPSByZXF1aXJlKFwiLi9zdHJpbmdpZnlSZXF1ZXN0XCIpO1xuY29uc3QgZ2V0UmVtYWluaW5nUmVxdWVzdCA9IHJlcXVpcmUoXCIuL2dldFJlbWFpbmluZ1JlcXVlc3RcIik7XG5jb25zdCBnZXRDdXJyZW50UmVxdWVzdCA9IHJlcXVpcmUoXCIuL2dldEN1cnJlbnRSZXF1ZXN0XCIpO1xuY29uc3QgaXNVcmxSZXF1ZXN0ID0gcmVxdWlyZShcIi4vaXNVcmxSZXF1ZXN0XCIpO1xuY29uc3QgdXJsVG9SZXF1ZXN0ID0gcmVxdWlyZShcIi4vdXJsVG9SZXF1ZXN0XCIpO1xuY29uc3QgcGFyc2VTdHJpbmcgPSByZXF1aXJlKFwiLi9wYXJzZVN0cmluZ1wiKTtcbmNvbnN0IGdldEhhc2hEaWdlc3QgPSByZXF1aXJlKFwiLi9nZXRIYXNoRGlnZXN0XCIpO1xuY29uc3QgaW50ZXJwb2xhdGVOYW1lID0gcmVxdWlyZShcIi4vaW50ZXJwb2xhdGVOYW1lXCIpO1xuXG5leHBvcnRzLmdldE9wdGlvbnMgPSBnZXRPcHRpb25zO1xuZXhwb3J0cy5wYXJzZVF1ZXJ5ID0gcGFyc2VRdWVyeTtcbmV4cG9ydHMuc3RyaW5naWZ5UmVxdWVzdCA9IHN0cmluZ2lmeVJlcXVlc3Q7XG5leHBvcnRzLmdldFJlbWFpbmluZ1JlcXVlc3QgPSBnZXRSZW1haW5pbmdSZXF1ZXN0O1xuZXhwb3J0cy5nZXRDdXJyZW50UmVxdWVzdCA9IGdldEN1cnJlbnRSZXF1ZXN0O1xuZXhwb3J0cy5pc1VybFJlcXVlc3QgPSBpc1VybFJlcXVlc3Q7XG5leHBvcnRzLnVybFRvUmVxdWVzdCA9IHVybFRvUmVxdWVzdDtcbmV4cG9ydHMucGFyc2VTdHJpbmcgPSBwYXJzZVN0cmluZztcbmV4cG9ydHMuZ2V0SGFzaERpZ2VzdCA9IGdldEhhc2hEaWdlc3Q7XG5leHBvcnRzLmludGVycG9sYXRlTmFtZSA9IGludGVycG9sYXRlTmFtZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IHBhcnNlUXVlcnkgPSByZXF1aXJlKFwiLi9wYXJzZVF1ZXJ5XCIpO1xuXG5mdW5jdGlvbiBnZXRPcHRpb25zKGxvYWRlckNvbnRleHQpIHtcblx0Y29uc3QgcXVlcnkgPSBsb2FkZXJDb250ZXh0LnF1ZXJ5O1xuXHRpZih0eXBlb2YgcXVlcnkgPT09IFwic3RyaW5nXCIgJiYgcXVlcnkgIT09IFwiXCIpIHtcblx0XHRyZXR1cm4gcGFyc2VRdWVyeShsb2FkZXJDb250ZXh0LnF1ZXJ5KTtcblx0fVxuXHRpZighcXVlcnkgfHwgdHlwZW9mIHF1ZXJ5ICE9PSBcIm9iamVjdFwiKSB7XG5cdFx0Ly8gTm90IG9iamVjdC1saWtlIHF1ZXJpZXMgYXJlIG5vdCBzdXBwb3J0ZWQuXG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0cmV0dXJuIHF1ZXJ5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldE9wdGlvbnM7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9sb2FkZXItdXRpbHMvbGliL2dldE9wdGlvbnMuanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLy8ganNvbjUuanNcbi8vIE1vZGVybiBKU09OLiBTZWUgUkVBRE1FLm1kIGZvciBkZXRhaWxzLlxuLy9cbi8vIFRoaXMgZmlsZSBpcyBiYXNlZCBkaXJlY3RseSBvZmYgb2YgRG91Z2xhcyBDcm9ja2ZvcmQncyBqc29uX3BhcnNlLmpzOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2RvdWdsYXNjcm9ja2ZvcmQvSlNPTi1qcy9ibG9iL21hc3Rlci9qc29uX3BhcnNlLmpzXG5cbnZhciBKU09ONSA9ICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgPyBleHBvcnRzIDoge30pO1xuXG5KU09ONS5wYXJzZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIFRoaXMgaXMgYSBmdW5jdGlvbiB0aGF0IGNhbiBwYXJzZSBhIEpTT041IHRleHQsIHByb2R1Y2luZyBhIEphdmFTY3JpcHRcbi8vIGRhdGEgc3RydWN0dXJlLiBJdCBpcyBhIHNpbXBsZSwgcmVjdXJzaXZlIGRlc2NlbnQgcGFyc2VyLiBJdCBkb2VzIG5vdCB1c2Vcbi8vIGV2YWwgb3IgcmVndWxhciBleHByZXNzaW9ucywgc28gaXQgY2FuIGJlIHVzZWQgYXMgYSBtb2RlbCBmb3IgaW1wbGVtZW50aW5nXG4vLyBhIEpTT041IHBhcnNlciBpbiBvdGhlciBsYW5ndWFnZXMuXG5cbi8vIFdlIGFyZSBkZWZpbmluZyB0aGUgZnVuY3Rpb24gaW5zaWRlIG9mIGFub3RoZXIgZnVuY3Rpb24gdG8gYXZvaWQgY3JlYXRpbmdcbi8vIGdsb2JhbCB2YXJpYWJsZXMuXG5cbiAgICB2YXIgYXQsICAgICAgICAgICAvLyBUaGUgaW5kZXggb2YgdGhlIGN1cnJlbnQgY2hhcmFjdGVyXG4gICAgICAgIGxpbmVOdW1iZXIsICAgLy8gVGhlIGN1cnJlbnQgbGluZSBudW1iZXJcbiAgICAgICAgY29sdW1uTnVtYmVyLCAvLyBUaGUgY3VycmVudCBjb2x1bW4gbnVtYmVyXG4gICAgICAgIGNoLCAgICAgICAgICAgLy8gVGhlIGN1cnJlbnQgY2hhcmFjdGVyXG4gICAgICAgIGVzY2FwZWUgPSB7XG4gICAgICAgICAgICBcIidcIjogIFwiJ1wiLFxuICAgICAgICAgICAgJ1wiJzogICdcIicsXG4gICAgICAgICAgICAnXFxcXCc6ICdcXFxcJyxcbiAgICAgICAgICAgICcvJzogICcvJyxcbiAgICAgICAgICAgICdcXG4nOiAnJywgICAgICAgLy8gUmVwbGFjZSBlc2NhcGVkIG5ld2xpbmVzIGluIHN0cmluZ3Mgdy8gZW1wdHkgc3RyaW5nXG4gICAgICAgICAgICBiOiAgICAnXFxiJyxcbiAgICAgICAgICAgIGY6ICAgICdcXGYnLFxuICAgICAgICAgICAgbjogICAgJ1xcbicsXG4gICAgICAgICAgICByOiAgICAnXFxyJyxcbiAgICAgICAgICAgIHQ6ICAgICdcXHQnXG4gICAgICAgIH0sXG4gICAgICAgIHdzID0gW1xuICAgICAgICAgICAgJyAnLFxuICAgICAgICAgICAgJ1xcdCcsXG4gICAgICAgICAgICAnXFxyJyxcbiAgICAgICAgICAgICdcXG4nLFxuICAgICAgICAgICAgJ1xcdicsXG4gICAgICAgICAgICAnXFxmJyxcbiAgICAgICAgICAgICdcXHhBMCcsXG4gICAgICAgICAgICAnXFx1RkVGRidcbiAgICAgICAgXSxcbiAgICAgICAgdGV4dCxcblxuICAgICAgICByZW5kZXJDaGFyID0gZnVuY3Rpb24gKGNocikge1xuICAgICAgICAgICAgcmV0dXJuIGNociA9PT0gJycgPyAnRU9GJyA6IFwiJ1wiICsgY2hyICsgXCInXCI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZXJyb3IgPSBmdW5jdGlvbiAobSkge1xuXG4vLyBDYWxsIGVycm9yIHdoZW4gc29tZXRoaW5nIGlzIHdyb25nLlxuXG4gICAgICAgICAgICB2YXIgZXJyb3IgPSBuZXcgU3ludGF4RXJyb3IoKTtcbiAgICAgICAgICAgIC8vIGJlZ2lubmluZyBvZiBtZXNzYWdlIHN1ZmZpeCB0byBhZ3JlZSB3aXRoIHRoYXQgcHJvdmlkZWQgYnkgR2Vja28gLSBzZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvSlNPTi9wYXJzZVxuICAgICAgICAgICAgZXJyb3IubWVzc2FnZSA9IG0gKyBcIiBhdCBsaW5lIFwiICsgbGluZU51bWJlciArIFwiIGNvbHVtbiBcIiArIGNvbHVtbk51bWJlciArIFwiIG9mIHRoZSBKU09ONSBkYXRhLiBTdGlsbCB0byByZWFkOiBcIiArIEpTT04uc3RyaW5naWZ5KHRleHQuc3Vic3RyaW5nKGF0IC0gMSwgYXQgKyAxOSkpO1xuICAgICAgICAgICAgZXJyb3IuYXQgPSBhdDtcbiAgICAgICAgICAgIC8vIFRoZXNlIHR3byBwcm9wZXJ0eSBuYW1lcyBoYXZlIGJlZW4gY2hvc2VuIHRvIGFncmVlIHdpdGggdGhlIG9uZXMgaW4gR2Vja28sIHRoZSBvbmx5IHBvcHVsYXJcbiAgICAgICAgICAgIC8vIGVudmlyb25tZW50IHdoaWNoIHNlZW1zIHRvIHN1cHBseSB0aGlzIGluZm8gb24gSlNPTi5wYXJzZVxuICAgICAgICAgICAgZXJyb3IubGluZU51bWJlciA9IGxpbmVOdW1iZXI7XG4gICAgICAgICAgICBlcnJvci5jb2x1bW5OdW1iZXIgPSBjb2x1bW5OdW1iZXI7XG4gICAgICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgICAgfSxcblxuICAgICAgICBuZXh0ID0gZnVuY3Rpb24gKGMpIHtcblxuLy8gSWYgYSBjIHBhcmFtZXRlciBpcyBwcm92aWRlZCwgdmVyaWZ5IHRoYXQgaXQgbWF0Y2hlcyB0aGUgY3VycmVudCBjaGFyYWN0ZXIuXG5cbiAgICAgICAgICAgIGlmIChjICYmIGMgIT09IGNoKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IoXCJFeHBlY3RlZCBcIiArIHJlbmRlckNoYXIoYykgKyBcIiBpbnN0ZWFkIG9mIFwiICsgcmVuZGVyQ2hhcihjaCkpO1xuICAgICAgICAgICAgfVxuXG4vLyBHZXQgdGhlIG5leHQgY2hhcmFjdGVyLiBXaGVuIHRoZXJlIGFyZSBubyBtb3JlIGNoYXJhY3RlcnMsXG4vLyByZXR1cm4gdGhlIGVtcHR5IHN0cmluZy5cblxuICAgICAgICAgICAgY2ggPSB0ZXh0LmNoYXJBdChhdCk7XG4gICAgICAgICAgICBhdCsrO1xuICAgICAgICAgICAgY29sdW1uTnVtYmVyKys7XG4gICAgICAgICAgICBpZiAoY2ggPT09ICdcXG4nIHx8IGNoID09PSAnXFxyJyAmJiBwZWVrKCkgIT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgbGluZU51bWJlcisrO1xuICAgICAgICAgICAgICAgIGNvbHVtbk51bWJlciA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY2g7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcGVlayA9IGZ1bmN0aW9uICgpIHtcblxuLy8gR2V0IHRoZSBuZXh0IGNoYXJhY3RlciB3aXRob3V0IGNvbnN1bWluZyBpdCBvclxuLy8gYXNzaWduaW5nIGl0IHRvIHRoZSBjaCB2YXJhaWJsZS5cblxuICAgICAgICAgICAgcmV0dXJuIHRleHQuY2hhckF0KGF0KTtcbiAgICAgICAgfSxcblxuICAgICAgICBpZGVudGlmaWVyID0gZnVuY3Rpb24gKCkge1xuXG4vLyBQYXJzZSBhbiBpZGVudGlmaWVyLiBOb3JtYWxseSwgcmVzZXJ2ZWQgd29yZHMgYXJlIGRpc2FsbG93ZWQgaGVyZSwgYnV0IHdlXG4vLyBvbmx5IHVzZSB0aGlzIGZvciB1bnF1b3RlZCBvYmplY3Qga2V5cywgd2hlcmUgcmVzZXJ2ZWQgd29yZHMgYXJlIGFsbG93ZWQsXG4vLyBzbyB3ZSBkb24ndCBjaGVjayBmb3IgdGhvc2UgaGVyZS4gUmVmZXJlbmNlczpcbi8vIC0gaHR0cDovL2VzNS5naXRodWIuY29tLyN4Ny42XG4vLyAtIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0NvcmVfSmF2YVNjcmlwdF8xLjVfR3VpZGUvQ29yZV9MYW5ndWFnZV9GZWF0dXJlcyNWYXJpYWJsZXNcbi8vIC0gaHR0cDovL2RvY3N0b3JlLm1pay51YS9vcmVsbHkvd2VicHJvZy9qc2NyaXB0L2NoMDJfMDcuaHRtXG4vLyBUT0RPIElkZW50aWZpZXJzIGNhbiBoYXZlIFVuaWNvZGUgXCJsZXR0ZXJzXCIgaW4gdGhlbTsgYWRkIHN1cHBvcnQgZm9yIHRob3NlLlxuXG4gICAgICAgICAgICB2YXIga2V5ID0gY2g7XG5cbiAgICAgICAgICAgIC8vIElkZW50aWZpZXJzIG11c3Qgc3RhcnQgd2l0aCBhIGxldHRlciwgXyBvciAkLlxuICAgICAgICAgICAgaWYgKChjaCAhPT0gJ18nICYmIGNoICE9PSAnJCcpICYmXG4gICAgICAgICAgICAgICAgICAgIChjaCA8ICdhJyB8fCBjaCA+ICd6JykgJiZcbiAgICAgICAgICAgICAgICAgICAgKGNoIDwgJ0EnIHx8IGNoID4gJ1onKSkge1xuICAgICAgICAgICAgICAgIGVycm9yKFwiQmFkIGlkZW50aWZpZXIgYXMgdW5xdW90ZWQga2V5XCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBTdWJzZXF1ZW50IGNoYXJhY3RlcnMgY2FuIGNvbnRhaW4gZGlnaXRzLlxuICAgICAgICAgICAgd2hpbGUgKG5leHQoKSAmJiAoXG4gICAgICAgICAgICAgICAgICAgIGNoID09PSAnXycgfHwgY2ggPT09ICckJyB8fFxuICAgICAgICAgICAgICAgICAgICAoY2ggPj0gJ2EnICYmIGNoIDw9ICd6JykgfHxcbiAgICAgICAgICAgICAgICAgICAgKGNoID49ICdBJyAmJiBjaCA8PSAnWicpIHx8XG4gICAgICAgICAgICAgICAgICAgIChjaCA+PSAnMCcgJiYgY2ggPD0gJzknKSkpIHtcbiAgICAgICAgICAgICAgICBrZXkgKz0gY2g7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbnVtYmVyID0gZnVuY3Rpb24gKCkge1xuXG4vLyBQYXJzZSBhIG51bWJlciB2YWx1ZS5cblxuICAgICAgICAgICAgdmFyIG51bWJlcixcbiAgICAgICAgICAgICAgICBzaWduID0gJycsXG4gICAgICAgICAgICAgICAgc3RyaW5nID0gJycsXG4gICAgICAgICAgICAgICAgYmFzZSA9IDEwO1xuXG4gICAgICAgICAgICBpZiAoY2ggPT09ICctJyB8fCBjaCA9PT0gJysnKSB7XG4gICAgICAgICAgICAgICAgc2lnbiA9IGNoO1xuICAgICAgICAgICAgICAgIG5leHQoY2gpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzdXBwb3J0IGZvciBJbmZpbml0eSAoY291bGQgdHdlYWsgdG8gYWxsb3cgb3RoZXIgd29yZHMpOlxuICAgICAgICAgICAgaWYgKGNoID09PSAnSScpIHtcbiAgICAgICAgICAgICAgICBudW1iZXIgPSB3b3JkKCk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBudW1iZXIgIT09ICdudW1iZXInIHx8IGlzTmFOKG51bWJlcikpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyb3IoJ1VuZXhwZWN0ZWQgd29yZCBmb3IgbnVtYmVyJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAoc2lnbiA9PT0gJy0nKSA/IC1udW1iZXIgOiBudW1iZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHN1cHBvcnQgZm9yIE5hTlxuICAgICAgICAgICAgaWYgKGNoID09PSAnTicgKSB7XG4gICAgICAgICAgICAgIG51bWJlciA9IHdvcmQoKTtcbiAgICAgICAgICAgICAgaWYgKCFpc05hTihudW1iZXIpKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IoJ2V4cGVjdGVkIHdvcmQgdG8gYmUgTmFOJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy8gaWdub3JlIHNpZ24gYXMgLU5hTiBhbHNvIGlzIE5hTlxuICAgICAgICAgICAgICByZXR1cm4gbnVtYmVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY2ggPT09ICcwJykge1xuICAgICAgICAgICAgICAgIHN0cmluZyArPSBjaDtcbiAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAneCcgfHwgY2ggPT09ICdYJykge1xuICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gY2g7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgYmFzZSA9IDE2O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2ggPj0gJzAnICYmIGNoIDw9ICc5Jykge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcignT2N0YWwgbGl0ZXJhbCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChiYXNlKSB7XG4gICAgICAgICAgICBjYXNlIDEwOlxuICAgICAgICAgICAgICAgIHdoaWxlIChjaCA+PSAnMCcgJiYgY2ggPD0gJzknICkge1xuICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gY2g7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnLicpIHtcbiAgICAgICAgICAgICAgICAgICAgc3RyaW5nICs9ICcuJztcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKG5leHQoKSAmJiBjaCA+PSAnMCcgJiYgY2ggPD0gJzknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gY2g7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnZScgfHwgY2ggPT09ICdFJykge1xuICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gY2g7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoID09PSAnLScgfHwgY2ggPT09ICcrJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nICs9IGNoO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdoaWxlIChjaCA+PSAnMCcgJiYgY2ggPD0gJzknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gY2g7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE2OlxuICAgICAgICAgICAgICAgIHdoaWxlIChjaCA+PSAnMCcgJiYgY2ggPD0gJzknIHx8IGNoID49ICdBJyAmJiBjaCA8PSAnRicgfHwgY2ggPj0gJ2EnICYmIGNoIDw9ICdmJykge1xuICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gY2g7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHNpZ24gPT09ICctJykge1xuICAgICAgICAgICAgICAgIG51bWJlciA9IC1zdHJpbmc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG51bWJlciA9ICtzdHJpbmc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghaXNGaW5pdGUobnVtYmVyKSkge1xuICAgICAgICAgICAgICAgIGVycm9yKFwiQmFkIG51bWJlclwiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bWJlcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzdHJpbmcgPSBmdW5jdGlvbiAoKSB7XG5cbi8vIFBhcnNlIGEgc3RyaW5nIHZhbHVlLlxuXG4gICAgICAgICAgICB2YXIgaGV4LFxuICAgICAgICAgICAgICAgIGksXG4gICAgICAgICAgICAgICAgc3RyaW5nID0gJycsXG4gICAgICAgICAgICAgICAgZGVsaW0sICAgICAgLy8gZG91YmxlIHF1b3RlIG9yIHNpbmdsZSBxdW90ZVxuICAgICAgICAgICAgICAgIHVmZmZmO1xuXG4vLyBXaGVuIHBhcnNpbmcgZm9yIHN0cmluZyB2YWx1ZXMsIHdlIG11c3QgbG9vayBmb3IgJyBvciBcIiBhbmQgXFwgY2hhcmFjdGVycy5cblxuICAgICAgICAgICAgaWYgKGNoID09PSAnXCInIHx8IGNoID09PSBcIidcIikge1xuICAgICAgICAgICAgICAgIGRlbGltID0gY2g7XG4gICAgICAgICAgICAgICAgd2hpbGUgKG5leHQoKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2ggPT09IGRlbGltKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5nO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoID09PSAnXFxcXCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ3UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdWZmZmYgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCA0OyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGV4ID0gcGFyc2VJbnQobmV4dCgpLCAxNik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghaXNGaW5pdGUoaGV4KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdWZmZmYgPSB1ZmZmZiAqIDE2ICsgaGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh1ZmZmZik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoID09PSAnXFxyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwZWVrKCkgPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBlc2NhcGVlW2NoXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gZXNjYXBlZVtjaF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNoID09PSAnXFxuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdW5lc2NhcGVkIG5ld2xpbmVzIGFyZSBpbnZhbGlkOyBzZWU6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYXNlZW1rL2pzb241L2lzc3Vlcy8yNFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyB0aGlzIGZlZWxzIHNwZWNpYWwtY2FzZWQ7IGFyZSB0aGVyZSBvdGhlclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW52YWxpZCB1bmVzY2FwZWQgY2hhcnM/XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSBjaDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVycm9yKFwiQmFkIHN0cmluZ1wiKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbmxpbmVDb21tZW50ID0gZnVuY3Rpb24gKCkge1xuXG4vLyBTa2lwIGFuIGlubGluZSBjb21tZW50LCBhc3N1bWluZyB0aGlzIGlzIG9uZS4gVGhlIGN1cnJlbnQgY2hhcmFjdGVyIHNob3VsZFxuLy8gYmUgdGhlIHNlY29uZCAvIGNoYXJhY3RlciBpbiB0aGUgLy8gcGFpciB0aGF0IGJlZ2lucyB0aGlzIGlubGluZSBjb21tZW50LlxuLy8gVG8gZmluaXNoIHRoZSBpbmxpbmUgY29tbWVudCwgd2UgbG9vayBmb3IgYSBuZXdsaW5lIG9yIHRoZSBlbmQgb2YgdGhlIHRleHQuXG5cbiAgICAgICAgICAgIGlmIChjaCAhPT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IoXCJOb3QgYW4gaW5saW5lIGNvbW1lbnRcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnXFxuJyB8fCBjaCA9PT0gJ1xccicpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAoY2gpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJsb2NrQ29tbWVudCA9IGZ1bmN0aW9uICgpIHtcblxuLy8gU2tpcCBhIGJsb2NrIGNvbW1lbnQsIGFzc3VtaW5nIHRoaXMgaXMgb25lLiBUaGUgY3VycmVudCBjaGFyYWN0ZXIgc2hvdWxkIGJlXG4vLyB0aGUgKiBjaGFyYWN0ZXIgaW4gdGhlIC8qIHBhaXIgdGhhdCBiZWdpbnMgdGhpcyBibG9jayBjb21tZW50LlxuLy8gVG8gZmluaXNoIHRoZSBibG9jayBjb21tZW50LCB3ZSBsb29rIGZvciBhbiBlbmRpbmcgKi8gcGFpciBvZiBjaGFyYWN0ZXJzLFxuLy8gYnV0IHdlIGFsc28gd2F0Y2ggZm9yIHRoZSBlbmQgb2YgdGV4dCBiZWZvcmUgdGhlIGNvbW1lbnQgaXMgdGVybWluYXRlZC5cblxuICAgICAgICAgICAgaWYgKGNoICE9PSAnKicpIHtcbiAgICAgICAgICAgICAgICBlcnJvcihcIk5vdCBhIGJsb2NrIGNvbW1lbnRcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGNoID09PSAnKicpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCgnKicpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICcvJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCgnLycpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAoY2gpO1xuXG4gICAgICAgICAgICBlcnJvcihcIlVudGVybWluYXRlZCBibG9jayBjb21tZW50XCIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNvbW1lbnQgPSBmdW5jdGlvbiAoKSB7XG5cbi8vIFNraXAgYSBjb21tZW50LCB3aGV0aGVyIGlubGluZSBvciBibG9jay1sZXZlbCwgYXNzdW1pbmcgdGhpcyBpcyBvbmUuXG4vLyBDb21tZW50cyBhbHdheXMgYmVnaW4gd2l0aCBhIC8gY2hhcmFjdGVyLlxuXG4gICAgICAgICAgICBpZiAoY2ggIT09ICcvJykge1xuICAgICAgICAgICAgICAgIGVycm9yKFwiTm90IGEgY29tbWVudFwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbmV4dCgnLycpO1xuXG4gICAgICAgICAgICBpZiAoY2ggPT09ICcvJykge1xuICAgICAgICAgICAgICAgIGlubGluZUNvbW1lbnQoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2ggPT09ICcqJykge1xuICAgICAgICAgICAgICAgIGJsb2NrQ29tbWVudCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBlcnJvcihcIlVucmVjb2duaXplZCBjb21tZW50XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHdoaXRlID0gZnVuY3Rpb24gKCkge1xuXG4vLyBTa2lwIHdoaXRlc3BhY2UgYW5kIGNvbW1lbnRzLlxuLy8gTm90ZSB0aGF0IHdlJ3JlIGRldGVjdGluZyBjb21tZW50cyBieSBvbmx5IGEgc2luZ2xlIC8gY2hhcmFjdGVyLlxuLy8gVGhpcyB3b3JrcyBzaW5jZSByZWd1bGFyIGV4cHJlc3Npb25zIGFyZSBub3QgdmFsaWQgSlNPTig1KSwgYnV0IHRoaXMgd2lsbFxuLy8gYnJlYWsgaWYgdGhlcmUgYXJlIG90aGVyIHZhbGlkIHZhbHVlcyB0aGF0IGJlZ2luIHdpdGggYSAvIGNoYXJhY3RlciFcblxuICAgICAgICAgICAgd2hpbGUgKGNoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNoID09PSAnLycpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tbWVudCgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAod3MuaW5kZXhPZihjaCkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB3b3JkID0gZnVuY3Rpb24gKCkge1xuXG4vLyB0cnVlLCBmYWxzZSwgb3IgbnVsbC5cblxuICAgICAgICAgICAgc3dpdGNoIChjaCkge1xuICAgICAgICAgICAgY2FzZSAndCc6XG4gICAgICAgICAgICAgICAgbmV4dCgndCcpO1xuICAgICAgICAgICAgICAgIG5leHQoJ3InKTtcbiAgICAgICAgICAgICAgICBuZXh0KCd1Jyk7XG4gICAgICAgICAgICAgICAgbmV4dCgnZScpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgY2FzZSAnZic6XG4gICAgICAgICAgICAgICAgbmV4dCgnZicpO1xuICAgICAgICAgICAgICAgIG5leHQoJ2EnKTtcbiAgICAgICAgICAgICAgICBuZXh0KCdsJyk7XG4gICAgICAgICAgICAgICAgbmV4dCgncycpO1xuICAgICAgICAgICAgICAgIG5leHQoJ2UnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICBjYXNlICduJzpcbiAgICAgICAgICAgICAgICBuZXh0KCduJyk7XG4gICAgICAgICAgICAgICAgbmV4dCgndScpO1xuICAgICAgICAgICAgICAgIG5leHQoJ2wnKTtcbiAgICAgICAgICAgICAgICBuZXh0KCdsJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICBjYXNlICdJJzpcbiAgICAgICAgICAgICAgICBuZXh0KCdJJyk7XG4gICAgICAgICAgICAgICAgbmV4dCgnbicpO1xuICAgICAgICAgICAgICAgIG5leHQoJ2YnKTtcbiAgICAgICAgICAgICAgICBuZXh0KCdpJyk7XG4gICAgICAgICAgICAgICAgbmV4dCgnbicpO1xuICAgICAgICAgICAgICAgIG5leHQoJ2knKTtcbiAgICAgICAgICAgICAgICBuZXh0KCd0Jyk7XG4gICAgICAgICAgICAgICAgbmV4dCgneScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBJbmZpbml0eTtcbiAgICAgICAgICAgIGNhc2UgJ04nOlxuICAgICAgICAgICAgICBuZXh0KCAnTicgKTtcbiAgICAgICAgICAgICAgbmV4dCggJ2EnICk7XG4gICAgICAgICAgICAgIG5leHQoICdOJyApO1xuICAgICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXJyb3IoXCJVbmV4cGVjdGVkIFwiICsgcmVuZGVyQ2hhcihjaCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHZhbHVlLCAgLy8gUGxhY2UgaG9sZGVyIGZvciB0aGUgdmFsdWUgZnVuY3Rpb24uXG5cbiAgICAgICAgYXJyYXkgPSBmdW5jdGlvbiAoKSB7XG5cbi8vIFBhcnNlIGFuIGFycmF5IHZhbHVlLlxuXG4gICAgICAgICAgICB2YXIgYXJyYXkgPSBbXTtcblxuICAgICAgICAgICAgaWYgKGNoID09PSAnWycpIHtcbiAgICAgICAgICAgICAgICBuZXh0KCdbJyk7XG4gICAgICAgICAgICAgICAgd2hpdGUoKTtcbiAgICAgICAgICAgICAgICB3aGlsZSAoY2gpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoID09PSAnXScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQoJ10nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnJheTsgICAvLyBQb3RlbnRpYWxseSBlbXB0eSBhcnJheVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIEVTNSBhbGxvd3Mgb21pdHRpbmcgZWxlbWVudHMgaW4gYXJyYXlzLCBlLmcuIFssXSBhbmRcbiAgICAgICAgICAgICAgICAgICAgLy8gWyxudWxsXS4gV2UgZG9uJ3QgYWxsb3cgdGhpcyBpbiBKU09ONS5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoID09PSAnLCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yKFwiTWlzc2luZyBhcnJheSBlbGVtZW50XCIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJyYXkucHVzaCh2YWx1ZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB3aGl0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSdzIG5vIGNvbW1hIGFmdGVyIHRoaXMgdmFsdWUsIHRoaXMgbmVlZHMgdG9cbiAgICAgICAgICAgICAgICAgICAgLy8gYmUgdGhlIGVuZCBvZiB0aGUgYXJyYXkuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaCAhPT0gJywnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0KCddJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbmV4dCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICB3aGl0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVycm9yKFwiQmFkIGFycmF5XCIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9iamVjdCA9IGZ1bmN0aW9uICgpIHtcblxuLy8gUGFyc2UgYW4gb2JqZWN0IHZhbHVlLlxuXG4gICAgICAgICAgICB2YXIga2V5LFxuICAgICAgICAgICAgICAgIG9iamVjdCA9IHt9O1xuXG4gICAgICAgICAgICBpZiAoY2ggPT09ICd7Jykge1xuICAgICAgICAgICAgICAgIG5leHQoJ3snKTtcbiAgICAgICAgICAgICAgICB3aGl0ZSgpO1xuICAgICAgICAgICAgICAgIHdoaWxlIChjaCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICd9Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCgnfScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iamVjdDsgICAvLyBQb3RlbnRpYWxseSBlbXB0eSBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIEtleXMgY2FuIGJlIHVucXVvdGVkLiBJZiB0aGV5IGFyZSwgdGhleSBuZWVkIHRvIGJlXG4gICAgICAgICAgICAgICAgICAgIC8vIHZhbGlkIEpTIGlkZW50aWZpZXJzLlxuICAgICAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcIicgfHwgY2ggPT09IFwiJ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXkgPSBzdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleSA9IGlkZW50aWZpZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHdoaXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoJzonKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0W2tleV0gPSB2YWx1ZSgpO1xuICAgICAgICAgICAgICAgICAgICB3aGl0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGVyZSdzIG5vIGNvbW1hIGFmdGVyIHRoaXMgcGFpciwgdGhpcyBuZWVkcyB0byBiZVxuICAgICAgICAgICAgICAgICAgICAvLyB0aGUgZW5kIG9mIHRoZSBvYmplY3QuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaCAhPT0gJywnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0KCd9Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG5leHQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgd2hpdGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlcnJvcihcIkJhZCBvYmplY3RcIik7XG4gICAgICAgIH07XG5cbiAgICB2YWx1ZSA9IGZ1bmN0aW9uICgpIHtcblxuLy8gUGFyc2UgYSBKU09OIHZhbHVlLiBJdCBjb3VsZCBiZSBhbiBvYmplY3QsIGFuIGFycmF5LCBhIHN0cmluZywgYSBudW1iZXIsXG4vLyBvciBhIHdvcmQuXG5cbiAgICAgICAgd2hpdGUoKTtcbiAgICAgICAgc3dpdGNoIChjaCkge1xuICAgICAgICBjYXNlICd7JzpcbiAgICAgICAgICAgIHJldHVybiBvYmplY3QoKTtcbiAgICAgICAgY2FzZSAnWyc6XG4gICAgICAgICAgICByZXR1cm4gYXJyYXkoKTtcbiAgICAgICAgY2FzZSAnXCInOlxuICAgICAgICBjYXNlIFwiJ1wiOlxuICAgICAgICAgICAgcmV0dXJuIHN0cmluZygpO1xuICAgICAgICBjYXNlICctJzpcbiAgICAgICAgY2FzZSAnKyc6XG4gICAgICAgIGNhc2UgJy4nOlxuICAgICAgICAgICAgcmV0dXJuIG51bWJlcigpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGNoID49ICcwJyAmJiBjaCA8PSAnOScgPyBudW1iZXIoKSA6IHdvcmQoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbi8vIFJldHVybiB0aGUganNvbl9wYXJzZSBmdW5jdGlvbi4gSXQgd2lsbCBoYXZlIGFjY2VzcyB0byBhbGwgb2YgdGhlIGFib3ZlXG4vLyBmdW5jdGlvbnMgYW5kIHZhcmlhYmxlcy5cblxuICAgIHJldHVybiBmdW5jdGlvbiAoc291cmNlLCByZXZpdmVyKSB7XG4gICAgICAgIHZhciByZXN1bHQ7XG5cbiAgICAgICAgdGV4dCA9IFN0cmluZyhzb3VyY2UpO1xuICAgICAgICBhdCA9IDA7XG4gICAgICAgIGxpbmVOdW1iZXIgPSAxO1xuICAgICAgICBjb2x1bW5OdW1iZXIgPSAxO1xuICAgICAgICBjaCA9ICcgJztcbiAgICAgICAgcmVzdWx0ID0gdmFsdWUoKTtcbiAgICAgICAgd2hpdGUoKTtcbiAgICAgICAgaWYgKGNoKSB7XG4gICAgICAgICAgICBlcnJvcihcIlN5bnRheCBlcnJvclwiKTtcbiAgICAgICAgfVxuXG4vLyBJZiB0aGVyZSBpcyBhIHJldml2ZXIgZnVuY3Rpb24sIHdlIHJlY3Vyc2l2ZWx5IHdhbGsgdGhlIG5ldyBzdHJ1Y3R1cmUsXG4vLyBwYXNzaW5nIGVhY2ggbmFtZS92YWx1ZSBwYWlyIHRvIHRoZSByZXZpdmVyIGZ1bmN0aW9uIGZvciBwb3NzaWJsZVxuLy8gdHJhbnNmb3JtYXRpb24sIHN0YXJ0aW5nIHdpdGggYSB0ZW1wb3Jhcnkgcm9vdCBvYmplY3QgdGhhdCBob2xkcyB0aGUgcmVzdWx0XG4vLyBpbiBhbiBlbXB0eSBrZXkuIElmIHRoZXJlIGlzIG5vdCBhIHJldml2ZXIgZnVuY3Rpb24sIHdlIHNpbXBseSByZXR1cm4gdGhlXG4vLyByZXN1bHQuXG5cbiAgICAgICAgcmV0dXJuIHR5cGVvZiByZXZpdmVyID09PSAnZnVuY3Rpb24nID8gKGZ1bmN0aW9uIHdhbGsoaG9sZGVyLCBrZXkpIHtcbiAgICAgICAgICAgIHZhciBrLCB2LCB2YWx1ZSA9IGhvbGRlcltrZXldO1xuICAgICAgICAgICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGsgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgaykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHYgPSB3YWxrKHZhbHVlLCBrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVtrXSA9IHY7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB2YWx1ZVtrXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXZpdmVyLmNhbGwoaG9sZGVyLCBrZXksIHZhbHVlKTtcbiAgICAgICAgfSh7Jyc6IHJlc3VsdH0sICcnKSkgOiByZXN1bHQ7XG4gICAgfTtcbn0oKSk7XG5cbi8vIEpTT041IHN0cmluZ2lmeSB3aWxsIG5vdCBxdW90ZSBrZXlzIHdoZXJlIGFwcHJvcHJpYXRlXG5KU09ONS5zdHJpbmdpZnkgPSBmdW5jdGlvbiAob2JqLCByZXBsYWNlciwgc3BhY2UpIHtcbiAgICBpZiAocmVwbGFjZXIgJiYgKHR5cGVvZihyZXBsYWNlcikgIT09IFwiZnVuY3Rpb25cIiAmJiAhaXNBcnJheShyZXBsYWNlcikpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUmVwbGFjZXIgbXVzdCBiZSBhIGZ1bmN0aW9uIG9yIGFuIGFycmF5Jyk7XG4gICAgfVxuICAgIHZhciBnZXRSZXBsYWNlZFZhbHVlT3JVbmRlZmluZWQgPSBmdW5jdGlvbihob2xkZXIsIGtleSwgaXNUb3BMZXZlbCkge1xuICAgICAgICB2YXIgdmFsdWUgPSBob2xkZXJba2V5XTtcblxuICAgICAgICAvLyBSZXBsYWNlIHRoZSB2YWx1ZSB3aXRoIGl0cyB0b0pTT04gdmFsdWUgZmlyc3QsIGlmIHBvc3NpYmxlXG4gICAgICAgIGlmICh2YWx1ZSAmJiB2YWx1ZS50b0pTT04gJiYgdHlwZW9mIHZhbHVlLnRvSlNPTiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlLnRvSlNPTigpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIHVzZXItc3VwcGxpZWQgcmVwbGFjZXIgaWYgYSBmdW5jdGlvbiwgY2FsbCBpdC4gSWYgaXQncyBhbiBhcnJheSwgY2hlY2sgb2JqZWN0cycgc3RyaW5nIGtleXMgZm9yXG4gICAgICAgIC8vIHByZXNlbmNlIGluIHRoZSBhcnJheSAocmVtb3ZpbmcgdGhlIGtleS92YWx1ZSBwYWlyIGZyb20gdGhlIHJlc3VsdGluZyBKU09OIGlmIHRoZSBrZXkgaXMgbWlzc2luZykuXG4gICAgICAgIGlmICh0eXBlb2YocmVwbGFjZXIpID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHJldHVybiByZXBsYWNlci5jYWxsKGhvbGRlciwga2V5LCB2YWx1ZSk7XG4gICAgICAgIH0gZWxzZSBpZihyZXBsYWNlcikge1xuICAgICAgICAgICAgaWYgKGlzVG9wTGV2ZWwgfHwgaXNBcnJheShob2xkZXIpIHx8IHJlcGxhY2VyLmluZGV4T2Yoa2V5KSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGlzV29yZENoYXIoYykge1xuICAgICAgICByZXR1cm4gKGMgPj0gJ2EnICYmIGMgPD0gJ3onKSB8fFxuICAgICAgICAgICAgKGMgPj0gJ0EnICYmIGMgPD0gJ1onKSB8fFxuICAgICAgICAgICAgKGMgPj0gJzAnICYmIGMgPD0gJzknKSB8fFxuICAgICAgICAgICAgYyA9PT0gJ18nIHx8IGMgPT09ICckJztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc1dvcmRTdGFydChjKSB7XG4gICAgICAgIHJldHVybiAoYyA+PSAnYScgJiYgYyA8PSAneicpIHx8XG4gICAgICAgICAgICAoYyA+PSAnQScgJiYgYyA8PSAnWicpIHx8XG4gICAgICAgICAgICBjID09PSAnXycgfHwgYyA9PT0gJyQnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzV29yZChrZXkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBrZXkgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc1dvcmRTdGFydChrZXlbMF0pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGkgPSAxLCBsZW5ndGggPSBrZXkubGVuZ3RoO1xuICAgICAgICB3aGlsZSAoaSA8IGxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKCFpc1dvcmRDaGFyKGtleVtpXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gZXhwb3J0IGZvciB1c2UgaW4gdGVzdHNcbiAgICBKU09ONS5pc1dvcmQgPSBpc1dvcmQ7XG5cbiAgICAvLyBwb2x5ZmlsbHNcbiAgICBmdW5jdGlvbiBpc0FycmF5KG9iaikge1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSkge1xuICAgICAgICAgICAgcmV0dXJuIEFycmF5LmlzQXJyYXkob2JqKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRGF0ZShvYmopIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBEYXRlXSc7XG4gICAgfVxuXG4gICAgdmFyIG9ialN0YWNrID0gW107XG4gICAgZnVuY3Rpb24gY2hlY2tGb3JDaXJjdWxhcihvYmopIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmpTdGFjay5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKG9ialN0YWNrW2ldID09PSBvYmopIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ29udmVydGluZyBjaXJjdWxhciBzdHJ1Y3R1cmUgdG8gSlNPTlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ha2VJbmRlbnQoc3RyLCBudW0sIG5vTmV3TGluZSkge1xuICAgICAgICBpZiAoIXN0cikge1xuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaW5kZW50YXRpb24gbm8gbW9yZSB0aGFuIDEwIGNoYXJzXG4gICAgICAgIGlmIChzdHIubGVuZ3RoID4gMTApIHtcbiAgICAgICAgICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoMCwgMTApO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGluZGVudCA9IG5vTmV3TGluZSA/IFwiXCIgOiBcIlxcblwiO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgICAgICAgICBpbmRlbnQgKz0gc3RyO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGluZGVudDtcbiAgICB9XG5cbiAgICB2YXIgaW5kZW50U3RyO1xuICAgIGlmIChzcGFjZSkge1xuICAgICAgICBpZiAodHlwZW9mIHNwYWNlID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBpbmRlbnRTdHIgPSBzcGFjZTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygc3BhY2UgPT09IFwibnVtYmVyXCIgJiYgc3BhY2UgPj0gMCkge1xuICAgICAgICAgICAgaW5kZW50U3RyID0gbWFrZUluZGVudChcIiBcIiwgc3BhY2UsIHRydWUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaWdub3JlIHNwYWNlIHBhcmFtZXRlclxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ29waWVkIGZyb20gQ3Jva2ZvcmQncyBpbXBsZW1lbnRhdGlvbiBvZiBKU09OXG4gICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9kb3VnbGFzY3JvY2tmb3JkL0pTT04tanMvYmxvYi9lMzlkYjRiN2U2MjQ5ZjA0YTE5NWU3ZGQwODQwZTYxMGNjOWU5NDFlL2pzb24yLmpzI0wxOTVcbiAgICAvLyBCZWdpblxuICAgIHZhciBjeCA9IC9bXFx1MDAwMFxcdTAwYWRcXHUwNjAwLVxcdTA2MDRcXHUwNzBmXFx1MTdiNFxcdTE3YjVcXHUyMDBjLVxcdTIwMGZcXHUyMDI4LVxcdTIwMmZcXHUyMDYwLVxcdTIwNmZcXHVmZWZmXFx1ZmZmMC1cXHVmZmZmXS9nLFxuICAgICAgICBlc2NhcGFibGUgPSAvW1xcXFxcXFwiXFx4MDAtXFx4MWZcXHg3Zi1cXHg5ZlxcdTAwYWRcXHUwNjAwLVxcdTA2MDRcXHUwNzBmXFx1MTdiNFxcdTE3YjVcXHUyMDBjLVxcdTIwMGZcXHUyMDI4LVxcdTIwMmZcXHUyMDYwLVxcdTIwNmZcXHVmZWZmXFx1ZmZmMC1cXHVmZmZmXS9nLFxuICAgICAgICBtZXRhID0geyAvLyB0YWJsZSBvZiBjaGFyYWN0ZXIgc3Vic3RpdHV0aW9uc1xuICAgICAgICAnXFxiJzogJ1xcXFxiJyxcbiAgICAgICAgJ1xcdCc6ICdcXFxcdCcsXG4gICAgICAgICdcXG4nOiAnXFxcXG4nLFxuICAgICAgICAnXFxmJzogJ1xcXFxmJyxcbiAgICAgICAgJ1xccic6ICdcXFxccicsXG4gICAgICAgICdcIicgOiAnXFxcXFwiJyxcbiAgICAgICAgJ1xcXFwnOiAnXFxcXFxcXFwnXG4gICAgfTtcbiAgICBmdW5jdGlvbiBlc2NhcGVTdHJpbmcoc3RyaW5nKSB7XG5cbi8vIElmIHRoZSBzdHJpbmcgY29udGFpbnMgbm8gY29udHJvbCBjaGFyYWN0ZXJzLCBubyBxdW90ZSBjaGFyYWN0ZXJzLCBhbmQgbm9cbi8vIGJhY2tzbGFzaCBjaGFyYWN0ZXJzLCB0aGVuIHdlIGNhbiBzYWZlbHkgc2xhcCBzb21lIHF1b3RlcyBhcm91bmQgaXQuXG4vLyBPdGhlcndpc2Ugd2UgbXVzdCBhbHNvIHJlcGxhY2UgdGhlIG9mZmVuZGluZyBjaGFyYWN0ZXJzIHdpdGggc2FmZSBlc2NhcGVcbi8vIHNlcXVlbmNlcy5cbiAgICAgICAgZXNjYXBhYmxlLmxhc3RJbmRleCA9IDA7XG4gICAgICAgIHJldHVybiBlc2NhcGFibGUudGVzdChzdHJpbmcpID8gJ1wiJyArIHN0cmluZy5yZXBsYWNlKGVzY2FwYWJsZSwgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHZhciBjID0gbWV0YVthXTtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgYyA9PT0gJ3N0cmluZycgP1xuICAgICAgICAgICAgICAgIGMgOlxuICAgICAgICAgICAgICAgICdcXFxcdScgKyAoJzAwMDAnICsgYS5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTQpO1xuICAgICAgICB9KSArICdcIicgOiAnXCInICsgc3RyaW5nICsgJ1wiJztcbiAgICB9XG4gICAgLy8gRW5kXG5cbiAgICBmdW5jdGlvbiBpbnRlcm5hbFN0cmluZ2lmeShob2xkZXIsIGtleSwgaXNUb3BMZXZlbCkge1xuICAgICAgICB2YXIgYnVmZmVyLCByZXM7XG5cbiAgICAgICAgLy8gUmVwbGFjZSB0aGUgdmFsdWUsIGlmIG5lY2Vzc2FyeVxuICAgICAgICB2YXIgb2JqX3BhcnQgPSBnZXRSZXBsYWNlZFZhbHVlT3JVbmRlZmluZWQoaG9sZGVyLCBrZXksIGlzVG9wTGV2ZWwpO1xuXG4gICAgICAgIGlmIChvYmpfcGFydCAmJiAhaXNEYXRlKG9ial9wYXJ0KSkge1xuICAgICAgICAgICAgLy8gdW5ib3ggb2JqZWN0c1xuICAgICAgICAgICAgLy8gZG9uJ3QgdW5ib3ggZGF0ZXMsIHNpbmNlIHdpbGwgdHVybiBpdCBpbnRvIG51bWJlclxuICAgICAgICAgICAgb2JqX3BhcnQgPSBvYmpfcGFydC52YWx1ZU9mKCk7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoKHR5cGVvZiBvYmpfcGFydCkge1xuICAgICAgICAgICAgY2FzZSBcImJvb2xlYW5cIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqX3BhcnQudG9TdHJpbmcoKTtcblxuICAgICAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICAgICAgICAgIGlmIChpc05hTihvYmpfcGFydCkgfHwgIWlzRmluaXRlKG9ial9wYXJ0KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvYmpfcGFydC50b1N0cmluZygpO1xuXG4gICAgICAgICAgICBjYXNlIFwic3RyaW5nXCI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVzY2FwZVN0cmluZyhvYmpfcGFydC50b1N0cmluZygpKTtcblxuICAgICAgICAgICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgICAgICAgICAgIGlmIChvYmpfcGFydCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KG9ial9wYXJ0KSkge1xuICAgICAgICAgICAgICAgICAgICBjaGVja0ZvckNpcmN1bGFyKG9ial9wYXJ0KTtcbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyID0gXCJbXCI7XG4gICAgICAgICAgICAgICAgICAgIG9ialN0YWNrLnB1c2gob2JqX3BhcnQpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqX3BhcnQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlcyA9IGludGVybmFsU3RyaW5naWZ5KG9ial9wYXJ0LCBpLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgKz0gbWFrZUluZGVudChpbmRlbnRTdHIsIG9ialN0YWNrLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzID09PSBudWxsIHx8IHR5cGVvZiByZXMgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgKz0gXCJudWxsXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciArPSByZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IG9ial9wYXJ0Lmxlbmd0aC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyICs9IFwiLFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRlbnRTdHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgKz0gXCJcXG5cIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvYmpTdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9ial9wYXJ0Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyICs9IG1ha2VJbmRlbnQoaW5kZW50U3RyLCBvYmpTdGFjay5sZW5ndGgsIHRydWUpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnVmZmVyICs9IFwiXVwiO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRm9yQ2lyY3VsYXIob2JqX3BhcnQpO1xuICAgICAgICAgICAgICAgICAgICBidWZmZXIgPSBcIntcIjtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vbkVtcHR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIG9ialN0YWNrLnB1c2gob2JqX3BhcnQpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIG9ial9wYXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2JqX3BhcnQuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBpbnRlcm5hbFN0cmluZ2lmeShvYmpfcGFydCwgcHJvcCwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzVG9wTGV2ZWwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcInVuZGVmaW5lZFwiICYmIHZhbHVlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciArPSBtYWtlSW5kZW50KGluZGVudFN0ciwgb2JqU3RhY2subGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9uRW1wdHkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXkgPSBpc1dvcmQocHJvcCkgPyBwcm9wIDogZXNjYXBlU3RyaW5nKHByb3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgKz0ga2V5ICsgXCI6XCIgKyAoaW5kZW50U3RyID8gJyAnIDogJycpICsgdmFsdWUgKyBcIixcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb2JqU3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub25FbXB0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyID0gYnVmZmVyLnN1YnN0cmluZygwLCBidWZmZXIubGVuZ3RoLTEpICsgbWFrZUluZGVudChpbmRlbnRTdHIsIG9ialN0YWNrLmxlbmd0aCkgKyBcIn1cIjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciA9ICd7fSc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGJ1ZmZlcjtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy8gZnVuY3Rpb25zIGFuZCB1bmRlZmluZWQgc2hvdWxkIGJlIGlnbm9yZWRcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gc3BlY2lhbCBjYXNlLi4ud2hlbiB1bmRlZmluZWQgaXMgdXNlZCBpbnNpZGUgb2ZcbiAgICAvLyBhIGNvbXBvdW5kIG9iamVjdC9hcnJheSwgcmV0dXJuIG51bGwuXG4gICAgLy8gYnV0IHdoZW4gdG9wLWxldmVsLCByZXR1cm4gdW5kZWZpbmVkXG4gICAgdmFyIHRvcExldmVsSG9sZGVyID0ge1wiXCI6b2JqfTtcbiAgICBpZiAob2JqID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGdldFJlcGxhY2VkVmFsdWVPclVuZGVmaW5lZCh0b3BMZXZlbEhvbGRlciwgJycsIHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gaW50ZXJuYWxTdHJpbmdpZnkodG9wTGV2ZWxIb2xkZXIsICcnLCB0cnVlKTtcbn07XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9qc29uNS9saWIvanNvbjUuanNcbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcblxuY29uc3QgbWF0Y2hSZWxhdGl2ZVBhdGggPSAvXlxcLlxcLj9bL1xcXFxdLztcblxuZnVuY3Rpb24gaXNBYnNvbHV0ZVBhdGgoc3RyKSB7XG5cdHJldHVybiBwYXRoLnBvc2l4LmlzQWJzb2x1dGUoc3RyKSB8fCBwYXRoLndpbjMyLmlzQWJzb2x1dGUoc3RyKTtcbn1cblxuZnVuY3Rpb24gaXNSZWxhdGl2ZVBhdGgoc3RyKSB7XG5cdHJldHVybiBtYXRjaFJlbGF0aXZlUGF0aC50ZXN0KHN0cik7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeVJlcXVlc3QobG9hZGVyQ29udGV4dCwgcmVxdWVzdCkge1xuXHRjb25zdCBzcGxpdHRlZCA9IHJlcXVlc3Quc3BsaXQoXCIhXCIpO1xuXHRjb25zdCBjb250ZXh0ID0gbG9hZGVyQ29udGV4dC5jb250ZXh0IHx8IChsb2FkZXJDb250ZXh0Lm9wdGlvbnMgJiYgbG9hZGVyQ29udGV4dC5vcHRpb25zLmNvbnRleHQpO1xuXHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoc3BsaXR0ZWQubWFwKHBhcnQgPT4ge1xuXHRcdC8vIEZpcnN0LCBzZXBhcmF0ZSBzaW5nbGVQYXRoIGZyb20gcXVlcnksIGJlY2F1c2UgdGhlIHF1ZXJ5IG1pZ2h0IGNvbnRhaW4gcGF0aHMgYWdhaW5cblx0XHRjb25zdCBzcGxpdHRlZFBhcnQgPSBwYXJ0Lm1hdGNoKC9eKC4qPykoXFw/LiopLyk7XG5cdFx0bGV0IHNpbmdsZVBhdGggPSBzcGxpdHRlZFBhcnQgPyBzcGxpdHRlZFBhcnRbMV0gOiBwYXJ0O1xuXHRcdGNvbnN0IHF1ZXJ5ID0gc3BsaXR0ZWRQYXJ0ID8gc3BsaXR0ZWRQYXJ0WzJdIDogXCJcIjtcblx0XHRpZihpc0Fic29sdXRlUGF0aChzaW5nbGVQYXRoKSAmJiBjb250ZXh0KSB7XG5cdFx0XHRzaW5nbGVQYXRoID0gcGF0aC5yZWxhdGl2ZShjb250ZXh0LCBzaW5nbGVQYXRoKTtcblx0XHRcdGlmKGlzQWJzb2x1dGVQYXRoKHNpbmdsZVBhdGgpKSB7XG5cdFx0XHRcdC8vIElmIHNpbmdsZVBhdGggc3RpbGwgbWF0Y2hlcyBhbiBhYnNvbHV0ZSBwYXRoLCBzaW5nbGVQYXRoIHdhcyBvbiBhIGRpZmZlcmVudCBkcml2ZSB0aGFuIGNvbnRleHQuXG5cdFx0XHRcdC8vIEluIHRoaXMgY2FzZSwgd2UgbGVhdmUgdGhlIHBhdGggcGxhdGZvcm0tc3BlY2lmaWMgd2l0aG91dCByZXBsYWNpbmcgYW55IHNlcGFyYXRvcnMuXG5cdFx0XHRcdC8vIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2svbG9hZGVyLXV0aWxzL3B1bGwvMTRcblx0XHRcdFx0cmV0dXJuIHNpbmdsZVBhdGggKyBxdWVyeTtcblx0XHRcdH1cblx0XHRcdGlmKGlzUmVsYXRpdmVQYXRoKHNpbmdsZVBhdGgpID09PSBmYWxzZSkge1xuXHRcdFx0XHQvLyBFbnN1cmUgdGhhdCB0aGUgcmVsYXRpdmUgcGF0aCBzdGFydHMgYXQgbGVhc3Qgd2l0aCAuLyBvdGhlcndpc2UgaXQgd291bGQgYmUgYSByZXF1ZXN0IGludG8gdGhlIG1vZHVsZXMgZGlyZWN0b3J5IChsaWtlIG5vZGVfbW9kdWxlcykuXG5cdFx0XHRcdHNpbmdsZVBhdGggPSBcIi4vXCIgKyBzaW5nbGVQYXRoO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc2luZ2xlUGF0aC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKSArIHF1ZXJ5O1xuXHR9KS5qb2luKFwiIVwiKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RyaW5naWZ5UmVxdWVzdDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvc3RyaW5naWZ5UmVxdWVzdC5qc1xuLy8gbW9kdWxlIGlkID0gN1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gZ2V0UmVtYWluaW5nUmVxdWVzdChsb2FkZXJDb250ZXh0KSB7XG5cdGlmKGxvYWRlckNvbnRleHQucmVtYWluaW5nUmVxdWVzdClcblx0XHRyZXR1cm4gbG9hZGVyQ29udGV4dC5yZW1haW5pbmdSZXF1ZXN0O1xuXHRjb25zdCByZXF1ZXN0ID0gbG9hZGVyQ29udGV4dC5sb2FkZXJzXG5cdFx0LnNsaWNlKGxvYWRlckNvbnRleHQubG9hZGVySW5kZXggKyAxKVxuXHRcdC5tYXAob2JqID0+IG9iai5yZXF1ZXN0KVxuXHRcdC5jb25jYXQoW2xvYWRlckNvbnRleHQucmVzb3VyY2VdKTtcblx0cmV0dXJuIHJlcXVlc3Quam9pbihcIiFcIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UmVtYWluaW5nUmVxdWVzdDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvZ2V0UmVtYWluaW5nUmVxdWVzdC5qc1xuLy8gbW9kdWxlIGlkID0gOFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gZ2V0Q3VycmVudFJlcXVlc3QobG9hZGVyQ29udGV4dCkge1xuXHRpZihsb2FkZXJDb250ZXh0LmN1cnJlbnRSZXF1ZXN0KVxuXHRcdHJldHVybiBsb2FkZXJDb250ZXh0LmN1cnJlbnRSZXF1ZXN0O1xuXHRjb25zdCByZXF1ZXN0ID0gbG9hZGVyQ29udGV4dC5sb2FkZXJzXG5cdFx0LnNsaWNlKGxvYWRlckNvbnRleHQubG9hZGVySW5kZXgpXG5cdFx0Lm1hcChvYmogPT4gb2JqLnJlcXVlc3QpXG5cdFx0LmNvbmNhdChbbG9hZGVyQ29udGV4dC5yZXNvdXJjZV0pO1xuXHRyZXR1cm4gcmVxdWVzdC5qb2luKFwiIVwiKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRDdXJyZW50UmVxdWVzdDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvZ2V0Q3VycmVudFJlcXVlc3QuanNcbi8vIG1vZHVsZSBpZCA9IDlcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIGlzVXJsUmVxdWVzdCh1cmwsIHJvb3QpIHtcblx0Ly8gQW4gVVJMIGlzIG5vdCBhbiByZXF1ZXN0IGlmXG5cdC8vIDEuIGl0J3MgYSBEYXRhIFVybFxuXHQvLyAyLiBpdCdzIGFuIGFic29sdXRlIHVybCBvciBhbmQgcHJvdG9jb2wtcmVsYXRpdmVcblx0Ly8gMy4gaXQncyBzb21lIGtpbmQgb2YgdXJsIGZvciBhIHRlbXBsYXRlXG5cdGlmKC9eZGF0YTp8XmNocm9tZS1leHRlbnNpb246fF4oaHR0cHM/Oik/XFwvXFwvfF5bXFx7XFx9XFxbXFxdIyo7LCfCp1xcJCUmXFwoPT9gwrRcXF7CsDw+XS8udGVzdCh1cmwpKSByZXR1cm4gZmFsc2U7XG5cdC8vIDQuIEl0J3MgYWxzbyBub3QgYW4gcmVxdWVzdCBpZiByb290IGlzbid0IHNldCBhbmQgaXQncyBhIHJvb3QtcmVsYXRpdmUgdXJsXG5cdGlmKChyb290ID09PSB1bmRlZmluZWQgfHwgcm9vdCA9PT0gZmFsc2UpICYmIC9eXFwvLy50ZXN0KHVybCkpIHJldHVybiBmYWxzZTtcblx0cmV0dXJuIHRydWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNVcmxSZXF1ZXN0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbG9hZGVyLXV0aWxzL2xpYi9pc1VybFJlcXVlc3QuanNcbi8vIG1vZHVsZSBpZCA9IDEwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xuXG4vLyB3ZSBjYW4ndCB1c2UgcGF0aC53aW4zMi5pc0Fic29sdXRlIGJlY2F1c2UgaXQgYWxzbyBtYXRjaGVzIHBhdGhzIHN0YXJ0aW5nIHdpdGggYSBmb3J3YXJkIHNsYXNoXG5jb25zdCBtYXRjaE5hdGl2ZVdpbjMyUGF0aCA9IC9eW0EtWl06Wy9cXFxcXXxeXFxcXFxcXFwvaTtcblxuZnVuY3Rpb24gdXJsVG9SZXF1ZXN0KHVybCwgcm9vdCkge1xuXHRjb25zdCBtb2R1bGVSZXF1ZXN0UmVnZXggPSAvXlteP10qfi87XG5cdGxldCByZXF1ZXN0O1xuXG5cdGlmKG1hdGNoTmF0aXZlV2luMzJQYXRoLnRlc3QodXJsKSkge1xuXHRcdC8vIGFic29sdXRlIHdpbmRvd3MgcGF0aCwga2VlcCBpdFxuXHRcdHJlcXVlc3QgPSB1cmw7XG5cdH0gZWxzZSBpZihyb290ICE9PSB1bmRlZmluZWQgJiYgcm9vdCAhPT0gZmFsc2UgJiYgL15cXC8vLnRlc3QodXJsKSkge1xuXHRcdC8vIGlmIHJvb3QgaXMgc2V0IGFuZCB0aGUgdXJsIGlzIHJvb3QtcmVsYXRpdmVcblx0XHRzd2l0Y2godHlwZW9mIHJvb3QpIHtcblx0XHRcdC8vIDEuIHJvb3QgaXMgYSBzdHJpbmc6IHJvb3QgaXMgcHJlZml4ZWQgdG8gdGhlIHVybFxuXHRcdFx0Y2FzZSBcInN0cmluZ1wiOlxuXHRcdFx0XHQvLyBzcGVjaWFsIGNhc2U6IGB+YCByb290cyBjb252ZXJ0IHRvIG1vZHVsZSByZXF1ZXN0XG5cdFx0XHRcdGlmKG1vZHVsZVJlcXVlc3RSZWdleC50ZXN0KHJvb3QpKSB7XG5cdFx0XHRcdFx0cmVxdWVzdCA9IHJvb3QucmVwbGFjZSgvKFteflxcL10pJC8sIFwiJDEvXCIpICsgdXJsLnNsaWNlKDEpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJlcXVlc3QgPSByb290ICsgdXJsO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Ly8gMi4gcm9vdCBpcyBgdHJ1ZWA6IGFic29sdXRlIHBhdGhzIGFyZSBhbGxvd2VkXG5cdFx0XHQvLyAgICAqbml4IG9ubHksIHdpbmRvd3Mtc3R5bGUgYWJzb2x1dGUgcGF0aHMgYXJlIGFsd2F5cyBhbGxvd2VkIGFzIHRoZXkgZG9lc24ndCBzdGFydCB3aXRoIGEgYC9gXG5cdFx0XHRjYXNlIFwiYm9vbGVhblwiOlxuXHRcdFx0XHRyZXF1ZXN0ID0gdXJsO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlVuZXhwZWN0ZWQgcGFyYW1ldGVycyB0byBsb2FkZXItdXRpbHMgJ3VybFRvUmVxdWVzdCc6IHVybCA9IFwiICsgdXJsICsgXCIsIHJvb3QgPSBcIiArIHJvb3QgKyBcIi5cIik7XG5cdFx0fVxuXHR9IGVsc2UgaWYoL15cXC5cXC4/XFwvLy50ZXN0KHVybCkpIHtcblx0XHQvLyBBIHJlbGF0aXZlIHVybCBzdGF5c1xuXHRcdHJlcXVlc3QgPSB1cmw7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gZXZlcnkgb3RoZXIgdXJsIGlzIHRocmVhZGVkIGxpa2UgYSByZWxhdGl2ZSB1cmxcblx0XHRyZXF1ZXN0ID0gXCIuL1wiICsgdXJsO1xuXHR9XG5cblx0Ly8gQSBgfmAgbWFrZXMgdGhlIHVybCBhbiBtb2R1bGVcblx0aWYobW9kdWxlUmVxdWVzdFJlZ2V4LnRlc3QocmVxdWVzdCkpIHtcblx0XHRyZXF1ZXN0ID0gcmVxdWVzdC5yZXBsYWNlKG1vZHVsZVJlcXVlc3RSZWdleCwgXCJcIik7XG5cdH1cblxuXHRyZXR1cm4gcmVxdWVzdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB1cmxUb1JlcXVlc3Q7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9sb2FkZXItdXRpbHMvbGliL3VybFRvUmVxdWVzdC5qc1xuLy8gbW9kdWxlIGlkID0gMTFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIHBhcnNlU3RyaW5nKHN0cikge1xuXHR0cnkge1xuXHRcdGlmKHN0clswXSA9PT0gXCJcXFwiXCIpIHJldHVybiBKU09OLnBhcnNlKHN0cik7XG5cdFx0aWYoc3RyWzBdID09PSBcIidcIiAmJiBzdHIuc3Vic3RyKHN0ci5sZW5ndGggLSAxKSA9PT0gXCInXCIpIHtcblx0XHRcdHJldHVybiBwYXJzZVN0cmluZyhcblx0XHRcdFx0c3RyXG5cdFx0XHRcdFx0LnJlcGxhY2UoL1xcXFwufFwiL2csIHggPT4geCA9PT0gXCJcXFwiXCIgPyBcIlxcXFxcXFwiXCIgOiB4KVxuXHRcdFx0XHRcdC5yZXBsYWNlKC9eJ3wnJC9nLCBcIlxcXCJcIilcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiBKU09OLnBhcnNlKFwiXFxcIlwiICsgc3RyICsgXCJcXFwiXCIpO1xuXHR9IGNhdGNoKGUpIHtcblx0XHRyZXR1cm4gc3RyO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcGFyc2VTdHJpbmc7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9sb2FkZXItdXRpbHMvbGliL3BhcnNlU3RyaW5nLmpzXG4vLyBtb2R1bGUgaWQgPSAxMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvKiBiaWcuanMgdjMuMS4zIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZy5qcy9MSUNFTkNFICovXHJcbjsoZnVuY3Rpb24gKGdsb2JhbCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuLypcclxuICBiaWcuanMgdjMuMS4zXHJcbiAgQSBzbWFsbCwgZmFzdCwgZWFzeS10by11c2UgbGlicmFyeSBmb3IgYXJiaXRyYXJ5LXByZWNpc2lvbiBkZWNpbWFsIGFyaXRobWV0aWMuXHJcbiAgaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnLmpzL1xyXG4gIENvcHlyaWdodCAoYykgMjAxNCBNaWNoYWVsIE1jbGF1Z2hsaW4gPE04Y2g4OGxAZ21haWwuY29tPlxyXG4gIE1JVCBFeHBhdCBMaWNlbmNlXHJcbiovXHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogRURJVEFCTEUgREVGQVVMVFMgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlcyBiZWxvdyBtdXN0IGJlIGludGVnZXJzIHdpdGhpbiB0aGUgc3RhdGVkIHJhbmdlcy5cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhlIG1heGltdW0gbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIG9mIHRoZSByZXN1bHRzIG9mIG9wZXJhdGlvbnNcclxuICAgICAqIGludm9sdmluZyBkaXZpc2lvbjogZGl2IGFuZCBzcXJ0LCBhbmQgcG93IHdpdGggbmVnYXRpdmUgZXhwb25lbnRzLlxyXG4gICAgICovXHJcbiAgICB2YXIgRFAgPSAyMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIE1BWF9EUFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSByb3VuZGluZyBtb2RlIHVzZWQgd2hlbiByb3VuZGluZyB0byB0aGUgYWJvdmUgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAwIFRvd2FyZHMgemVybyAoaS5lLiB0cnVuY2F0ZSwgbm8gcm91bmRpbmcpLiAgICAgICAoUk9VTkRfRE9XTilcclxuICAgICAgICAgKiAxIFRvIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgcm91bmQgdXAuICAoUk9VTkRfSEFMRl9VUClcclxuICAgICAgICAgKiAyIFRvIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG8gZXZlbi4gICAoUk9VTkRfSEFMRl9FVkVOKVxyXG4gICAgICAgICAqIDMgQXdheSBmcm9tIHplcm8uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIChST1VORF9VUClcclxuICAgICAgICAgKi9cclxuICAgICAgICBSTSA9IDEsICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAsIDEsIDIgb3IgM1xyXG5cclxuICAgICAgICAvLyBUaGUgbWF4aW11bSB2YWx1ZSBvZiBEUCBhbmQgQmlnLkRQLlxyXG4gICAgICAgIE1BWF9EUCA9IDFFNiwgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byAxMDAwMDAwXHJcblxyXG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIG1hZ25pdHVkZSBvZiB0aGUgZXhwb25lbnQgYXJndW1lbnQgdG8gdGhlIHBvdyBtZXRob2QuXHJcbiAgICAgICAgTUFYX1BPV0VSID0gMUU2LCAgICAgICAgICAgICAgICAgICAvLyAxIHRvIDEwMDAwMDBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGJlbmVhdGggd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqIEphdmFTY3JpcHQncyBOdW1iZXIgdHlwZTogLTdcclxuICAgICAgICAgKiAtMTAwMDAwMCBpcyB0aGUgbWluaW11bSByZWNvbW1lbmRlZCBleHBvbmVudCB2YWx1ZSBvZiBhIEJpZy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBFX05FRyA9IC03LCAgICAgICAgICAgICAgICAgICAvLyAwIHRvIC0xMDAwMDAwXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBhYm92ZSB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICogSmF2YVNjcmlwdCdzIE51bWJlciB0eXBlOiAyMVxyXG4gICAgICAgICAqIDEwMDAwMDAgaXMgdGhlIG1heGltdW0gcmVjb21tZW5kZWQgZXhwb25lbnQgdmFsdWUgb2YgYSBCaWcuXHJcbiAgICAgICAgICogKFRoaXMgbGltaXQgaXMgbm90IGVuZm9yY2VkIG9yIGNoZWNrZWQuKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEVfUE9TID0gMjEsICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gMTAwMDAwMFxyXG5cclxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cclxuXHJcbiAgICAgICAgLy8gVGhlIHNoYXJlZCBwcm90b3R5cGUgb2JqZWN0LlxyXG4gICAgICAgIFAgPSB7fSxcclxuICAgICAgICBpc1ZhbGlkID0gL14tPyhcXGQrKFxcLlxcZCopP3xcXC5cXGQrKShlWystXT9cXGQrKT8kL2ksXHJcbiAgICAgICAgQmlnO1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBCaWcgY29uc3RydWN0b3IuXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBiaWdGYWN0b3J5KCkge1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBCaWcgY29uc3RydWN0b3IgYW5kIGV4cG9ydGVkIGZ1bmN0aW9uLlxyXG4gICAgICAgICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgbmV3IGluc3RhbmNlIG9mIGEgQmlnIG51bWJlciBvYmplY3QuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBuIHtudW1iZXJ8c3RyaW5nfEJpZ30gQSBudW1lcmljIHZhbHVlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIEJpZyhuKSB7XHJcbiAgICAgICAgICAgIHZhciB4ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIC8vIEVuYWJsZSBjb25zdHJ1Y3RvciB1c2FnZSB3aXRob3V0IG5ldy5cclxuICAgICAgICAgICAgaWYgKCEoeCBpbnN0YW5jZW9mIEJpZykpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuID09PSB2b2lkIDAgPyBiaWdGYWN0b3J5KCkgOiBuZXcgQmlnKG4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEdXBsaWNhdGUuXHJcbiAgICAgICAgICAgIGlmIChuIGluc3RhbmNlb2YgQmlnKSB7XHJcbiAgICAgICAgICAgICAgICB4LnMgPSBuLnM7XHJcbiAgICAgICAgICAgICAgICB4LmUgPSBuLmU7XHJcbiAgICAgICAgICAgICAgICB4LmMgPSBuLmMuc2xpY2UoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHBhcnNlKHgsIG4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvKlxyXG4gICAgICAgICAgICAgKiBSZXRhaW4gYSByZWZlcmVuY2UgdG8gdGhpcyBCaWcgY29uc3RydWN0b3IsIGFuZCBzaGFkb3dcclxuICAgICAgICAgICAgICogQmlnLnByb3RvdHlwZS5jb25zdHJ1Y3RvciB3aGljaCBwb2ludHMgdG8gT2JqZWN0LlxyXG4gICAgICAgICAgICAgKi9cclxuICAgICAgICAgICAgeC5jb25zdHJ1Y3RvciA9IEJpZztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIEJpZy5wcm90b3R5cGUgPSBQO1xyXG4gICAgICAgIEJpZy5EUCA9IERQO1xyXG4gICAgICAgIEJpZy5STSA9IFJNO1xyXG4gICAgICAgIEJpZy5FX05FRyA9IEVfTkVHO1xyXG4gICAgICAgIEJpZy5FX1BPUyA9IEVfUE9TO1xyXG5cclxuICAgICAgICByZXR1cm4gQmlnO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBQcml2YXRlIGZ1bmN0aW9uc1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgQmlnIHggaW4gbm9ybWFsIG9yIGV4cG9uZW50aWFsXHJcbiAgICAgKiBub3RhdGlvbiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBvciBzaWduaWZpY2FudCBkaWdpdHMuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBUaGUgQmlnIHRvIGZvcm1hdC5cclxuICAgICAqIGRwIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIHRvRSB7bnVtYmVyfSAxICh0b0V4cG9uZW50aWFsKSwgMiAodG9QcmVjaXNpb24pIG9yIHVuZGVmaW5lZCAodG9GaXhlZCkuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGZvcm1hdCh4LCBkcCwgdG9FKSB7XHJcbiAgICAgICAgdmFyIEJpZyA9IHguY29uc3RydWN0b3IsXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgaW5kZXggKG5vcm1hbCBub3RhdGlvbikgb2YgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIGkgPSBkcCAtICh4ID0gbmV3IEJpZyh4KSkuZSxcclxuICAgICAgICAgICAgYyA9IHguYztcclxuXHJcbiAgICAgICAgLy8gUm91bmQ/XHJcbiAgICAgICAgaWYgKGMubGVuZ3RoID4gKytkcCkge1xyXG4gICAgICAgICAgICBybmQoeCwgaSwgQmlnLlJNKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghY1swXSkge1xyXG4gICAgICAgICAgICArK2k7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0b0UpIHtcclxuICAgICAgICAgICAgaSA9IGRwO1xyXG5cclxuICAgICAgICAvLyB0b0ZpeGVkXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYyA9IHguYztcclxuXHJcbiAgICAgICAgICAgIC8vIFJlY2FsY3VsYXRlIGkgYXMgeC5lIG1heSBoYXZlIGNoYW5nZWQgaWYgdmFsdWUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgaSA9IHguZSArIGkgKyAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwZW5kIHplcm9zP1xyXG4gICAgICAgIGZvciAoOyBjLmxlbmd0aCA8IGk7IGMucHVzaCgwKSkge1xyXG4gICAgICAgIH1cclxuICAgICAgICBpID0geC5lO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIHRvUHJlY2lzaW9uIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhlIG51bWJlciBvZlxyXG4gICAgICAgICAqIHNpZ25pZmljYW50IGRpZ2l0cyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzXHJcbiAgICAgICAgICogbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgaW50ZWdlciBwYXJ0IG9mIHRoZSB2YWx1ZSBpbiBub3JtYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKi9cclxuICAgICAgICByZXR1cm4gdG9FID09PSAxIHx8IHRvRSAmJiAoZHAgPD0gaSB8fCBpIDw9IEJpZy5FX05FRykgP1xyXG5cclxuICAgICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgKHgucyA8IDAgJiYgY1swXSA/ICctJyA6ICcnKSArXHJcbiAgICAgICAgICAgIChjLmxlbmd0aCA+IDEgPyBjWzBdICsgJy4nICsgYy5qb2luKCcnKS5zbGljZSgxKSA6IGNbMF0pICtcclxuICAgICAgICAgICAgICAoaSA8IDAgPyAnZScgOiAnZSsnKSArIGlcclxuXHJcbiAgICAgICAgICAvLyBOb3JtYWwgbm90YXRpb24uXHJcbiAgICAgICAgICA6IHgudG9TdHJpbmcoKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFBhcnNlIHRoZSBudW1iZXIgb3Igc3RyaW5nIHZhbHVlIHBhc3NlZCB0byBhIEJpZyBjb25zdHJ1Y3Rvci5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IEEgQmlnIG51bWJlciBpbnN0YW5jZS5cclxuICAgICAqIG4ge251bWJlcnxzdHJpbmd9IEEgbnVtZXJpYyB2YWx1ZS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcGFyc2UoeCwgbikge1xyXG4gICAgICAgIHZhciBlLCBpLCBuTDtcclxuXHJcbiAgICAgICAgLy8gTWludXMgemVybz9cclxuICAgICAgICBpZiAobiA9PT0gMCAmJiAxIC8gbiA8IDApIHtcclxuICAgICAgICAgICAgbiA9ICctMCc7XHJcblxyXG4gICAgICAgIC8vIEVuc3VyZSBuIGlzIHN0cmluZyBhbmQgY2hlY2sgdmFsaWRpdHkuXHJcbiAgICAgICAgfSBlbHNlIGlmICghaXNWYWxpZC50ZXN0KG4gKz0gJycpKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgc2lnbi5cclxuICAgICAgICB4LnMgPSBuLmNoYXJBdCgwKSA9PSAnLScgPyAobiA9IG4uc2xpY2UoMSksIC0xKSA6IDE7XHJcblxyXG4gICAgICAgIC8vIERlY2ltYWwgcG9pbnQ/XHJcbiAgICAgICAgaWYgKChlID0gbi5pbmRleE9mKCcuJykpID4gLTEpIHtcclxuICAgICAgICAgICAgbiA9IG4ucmVwbGFjZSgnLicsICcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIGZvcm0/XHJcbiAgICAgICAgaWYgKChpID0gbi5zZWFyY2goL2UvaSkpID4gMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGV4cG9uZW50LlxyXG4gICAgICAgICAgICBpZiAoZSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGUgPSBpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGUgKz0gK24uc2xpY2UoaSArIDEpO1xyXG4gICAgICAgICAgICBuID0gbi5zdWJzdHJpbmcoMCwgaSk7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEludGVnZXIuXHJcbiAgICAgICAgICAgIGUgPSBuLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG5MID0gbi5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBsZWFkaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBuTCAmJiBuLmNoYXJBdChpKSA9PSAnMCc7IGkrKykge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGkgPT0gbkwpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgIHguYyA9IFsgeC5lID0gMCBdO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoOyBuTCA+IDAgJiYgbi5jaGFyQXQoLS1uTCkgPT0gJzAnOykge1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB4LmUgPSBlIC0gaSAtIDE7XHJcbiAgICAgICAgICAgIHguYyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29udmVydCBzdHJpbmcgdG8gYXJyYXkgb2YgZGlnaXRzIHdpdGhvdXQgbGVhZGluZy90cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgLy9mb3IgKGUgPSAwOyBpIDw9IG5MOyB4LmNbZSsrXSA9ICtuLmNoYXJBdChpKyspKSB7XHJcbiAgICAgICAgICAgIGZvciAoOyBpIDw9IG5MOyB4LmMucHVzaCgrbi5jaGFyQXQoaSsrKSkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSb3VuZCBCaWcgeCB0byBhIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS5cclxuICAgICAqIENhbGxlZCBieSBkaXYsIHNxcnQgYW5kIHJvdW5kLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gVGhlIEJpZyB0byByb3VuZC5cclxuICAgICAqIGRwIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIHJtIHtudW1iZXJ9IDAsIDEsIDIgb3IgMyAoRE9XTiwgSEFMRl9VUCwgSEFMRl9FVkVOLCBVUClcclxuICAgICAqIFttb3JlXSB7Ym9vbGVhbn0gV2hldGhlciB0aGUgcmVzdWx0IG9mIGRpdmlzaW9uIHdhcyB0cnVuY2F0ZWQuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJuZCh4LCBkcCwgcm0sIG1vcmUpIHtcclxuICAgICAgICB2YXIgdSxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIGkgPSB4LmUgKyBkcCArIDE7XHJcblxyXG4gICAgICAgIGlmIChybSA9PT0gMSkge1xyXG5cclxuICAgICAgICAgICAgLy8geGNbaV0gaXMgdGhlIGRpZ2l0IGFmdGVyIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBtb3JlID0geGNbaV0gPj0gNTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJtID09PSAyKSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSB4Y1tpXSA+IDUgfHwgeGNbaV0gPT0gNSAmJlxyXG4gICAgICAgICAgICAgIChtb3JlIHx8IGkgPCAwIHx8IHhjW2kgKyAxXSAhPT0gdSB8fCB4Y1tpIC0gMV0gJiAxKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJtID09PSAzKSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSBtb3JlIHx8IHhjW2ldICE9PSB1IHx8IGkgPCAwO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIG1vcmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgICAgIGlmIChybSAhPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIoJyFCaWcuUk0hJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpIDwgMSB8fCAheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChtb3JlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gMSwgMC4xLCAwLjAxLCAwLjAwMSwgMC4wMDAxIGV0Yy5cclxuICAgICAgICAgICAgICAgIHguZSA9IC1kcDtcclxuICAgICAgICAgICAgICAgIHguYyA9IFsxXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICAgICAgeC5jID0gW3guZSA9IDBdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSBhbnkgZGlnaXRzIGFmdGVyIHRoZSByZXF1aXJlZCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgICAgeGMubGVuZ3RoID0gaS0tO1xyXG5cclxuICAgICAgICAgICAgLy8gUm91bmQgdXA/XHJcbiAgICAgICAgICAgIGlmIChtb3JlKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gUm91bmRpbmcgdXAgbWF5IG1lYW4gdGhlIHByZXZpb3VzIGRpZ2l0IGhhcyB0byBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICAgICAgZm9yICg7ICsreGNbaV0gPiA5Oykge1xyXG4gICAgICAgICAgICAgICAgICAgIHhjW2ldID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpLS0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgKyt4LmU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhjLnVuc2hpZnQoMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoaSA9IHhjLmxlbmd0aDsgIXhjWy0taV07IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogVGhyb3cgYSBCaWdFcnJvci5cclxuICAgICAqXHJcbiAgICAgKiBtZXNzYWdlIHtzdHJpbmd9IFRoZSBlcnJvciBtZXNzYWdlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB0aHJvd0VycihtZXNzYWdlKSB7XHJcbiAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcihtZXNzYWdlKTtcclxuICAgICAgICBlcnIubmFtZSA9ICdCaWdFcnJvcic7XHJcblxyXG4gICAgICAgIHRocm93IGVycjtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUHJvdG90eXBlL2luc3RhbmNlIG1ldGhvZHNcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoaXMgQmlnLlxyXG4gICAgICovXHJcbiAgICBQLmFicyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgeCA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKHRoaXMpO1xyXG4gICAgICAgIHgucyA9IDE7XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVyblxyXG4gICAgICogMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIC0xIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LCBvclxyXG4gICAgICogMCBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgdmFsdWUuXHJcbiAgICAqL1xyXG4gICAgUC5jbXAgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB4TmVnLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHljID0gKHkgPSBuZXcgeC5jb25zdHJ1Y3Rvcih5KSkuYyxcclxuICAgICAgICAgICAgaSA9IHgucyxcclxuICAgICAgICAgICAgaiA9IHkucyxcclxuICAgICAgICAgICAgayA9IHguZSxcclxuICAgICAgICAgICAgbCA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuICF4Y1swXSA/ICF5Y1swXSA/IDAgOiAtaiA6IGk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgICAgaWYgKGkgIT0gaikge1xyXG4gICAgICAgICAgICByZXR1cm4gaTtcclxuICAgICAgICB9XHJcbiAgICAgICAgeE5lZyA9IGkgPCAwO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGV4cG9uZW50cy5cclxuICAgICAgICBpZiAoayAhPSBsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBrID4gbCBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpID0gLTE7XHJcbiAgICAgICAgaiA9IChrID0geGMubGVuZ3RoKSA8IChsID0geWMubGVuZ3RoKSA/IGsgOiBsO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgIGZvciAoOyArK2kgPCBqOykge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhjW2ldICE9IHljW2ldKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geGNbaV0gPiB5Y1tpXSBeIHhOZWcgPyAxIDogLTE7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgbGVuZ3Rocy5cclxuICAgICAgICByZXR1cm4gayA9PSBsID8gMCA6IGsgPiBsIF4geE5lZyA/IDEgOiAtMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBkaXZpZGVkIGJ5IHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHksIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsXHJcbiAgICAgKiBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKi9cclxuICAgIFAuZGl2ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIC8vIGRpdmlkZW5kXHJcbiAgICAgICAgICAgIGR2ZCA9IHguYyxcclxuICAgICAgICAgICAgLy9kaXZpc29yXHJcbiAgICAgICAgICAgIGR2cyA9ICh5ID0gbmV3IEJpZyh5KSkuYyxcclxuICAgICAgICAgICAgcyA9IHgucyA9PSB5LnMgPyAxIDogLTEsXHJcbiAgICAgICAgICAgIGRwID0gQmlnLkRQO1xyXG5cclxuICAgICAgICBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchQmlnLkRQIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIDA/XHJcbiAgICAgICAgaWYgKCFkdmRbMF0gfHwgIWR2c1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgYm90aCBhcmUgMCwgdGhyb3cgTmFOXHJcbiAgICAgICAgICAgIGlmIChkdmRbMF0gPT0gZHZzWzBdKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBkdnMgaXMgMCwgdGhyb3cgKy1JbmZpbml0eS5cclxuICAgICAgICAgICAgaWYgKCFkdnNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKHMgLyAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gZHZkIGlzIDAsIHJldHVybiArLTAuXHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHMgKiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBkdnNMLCBkdnNULCBuZXh0LCBjbXAsIHJlbUksIHUsXHJcbiAgICAgICAgICAgIGR2c1ogPSBkdnMuc2xpY2UoKSxcclxuICAgICAgICAgICAgZHZkSSA9IGR2c0wgPSBkdnMubGVuZ3RoLFxyXG4gICAgICAgICAgICBkdmRMID0gZHZkLmxlbmd0aCxcclxuICAgICAgICAgICAgLy8gcmVtYWluZGVyXHJcbiAgICAgICAgICAgIHJlbSA9IGR2ZC5zbGljZSgwLCBkdnNMKSxcclxuICAgICAgICAgICAgcmVtTCA9IHJlbS5sZW5ndGgsXHJcbiAgICAgICAgICAgIC8vIHF1b3RpZW50XHJcbiAgICAgICAgICAgIHEgPSB5LFxyXG4gICAgICAgICAgICBxYyA9IHEuYyA9IFtdLFxyXG4gICAgICAgICAgICBxaSA9IDAsXHJcbiAgICAgICAgICAgIGRpZ2l0cyA9IGRwICsgKHEuZSA9IHguZSAtIHkuZSkgKyAxO1xyXG5cclxuICAgICAgICBxLnMgPSBzO1xyXG4gICAgICAgIHMgPSBkaWdpdHMgPCAwID8gMCA6IGRpZ2l0cztcclxuXHJcbiAgICAgICAgLy8gQ3JlYXRlIHZlcnNpb24gb2YgZGl2aXNvciB3aXRoIGxlYWRpbmcgemVyby5cclxuICAgICAgICBkdnNaLnVuc2hpZnQoMCk7XHJcblxyXG4gICAgICAgIC8vIEFkZCB6ZXJvcyB0byBtYWtlIHJlbWFpbmRlciBhcyBsb25nIGFzIGRpdmlzb3IuXHJcbiAgICAgICAgZm9yICg7IHJlbUwrKyA8IGR2c0w7IHJlbS5wdXNoKDApKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkbyB7XHJcblxyXG4gICAgICAgICAgICAvLyAnbmV4dCcgaXMgaG93IG1hbnkgdGltZXMgdGhlIGRpdmlzb3IgZ29lcyBpbnRvIGN1cnJlbnQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBmb3IgKG5leHQgPSAwOyBuZXh0IDwgMTA7IG5leHQrKykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgZGl2aXNvciBhbmQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGR2c0wgIT0gKHJlbUwgPSByZW0ubGVuZ3RoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNtcCA9IGR2c0wgPiByZW1MID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yIChyZW1JID0gLTEsIGNtcCA9IDA7ICsrcmVtSSA8IGR2c0w7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZHZzW3JlbUldICE9IHJlbVtyZW1JXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY21wID0gZHZzW3JlbUldID4gcmVtW3JlbUldID8gMSA6IC0xO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSWYgZGl2aXNvciA8IHJlbWFpbmRlciwgc3VidHJhY3QgZGl2aXNvciBmcm9tIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIGlmIChjbXAgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbWFpbmRlciBjYW4ndCBiZSBtb3JlIHRoYW4gMSBkaWdpdCBsb25nZXIgdGhhbiBkaXZpc29yLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEVxdWFsaXNlIGxlbmd0aHMgdXNpbmcgZGl2aXNvciB3aXRoIGV4dHJhIGxlYWRpbmcgemVybz9cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKGR2c1QgPSByZW1MID09IGR2c0wgPyBkdnMgOiBkdnNaOyByZW1MOykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlbVstLXJlbUxdIDwgZHZzVFtyZW1MXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtSSA9IHJlbUw7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICg7IHJlbUkgJiYgIXJlbVstLXJlbUldOyByZW1bcmVtSV0gPSA5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAtLXJlbVtyZW1JXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbVtyZW1MXSArPSAxMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1bcmVtTF0gLT0gZHZzVFtyZW1MXTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICg7ICFyZW1bMF07IHJlbS5zaGlmdCgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRoZSAnbmV4dCcgZGlnaXQgdG8gdGhlIHJlc3VsdCBhcnJheS5cclxuICAgICAgICAgICAgcWNbcWkrK10gPSBjbXAgPyBuZXh0IDogKytuZXh0O1xyXG5cclxuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGlmIChyZW1bMF0gJiYgY21wKSB7XHJcbiAgICAgICAgICAgICAgICByZW1bcmVtTF0gPSBkdmRbZHZkSV0gfHwgMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJlbSA9IFsgZHZkW2R2ZEldIF07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSB3aGlsZSAoKGR2ZEkrKyA8IGR2ZEwgfHwgcmVtWzBdICE9PSB1KSAmJiBzLS0pO1xyXG5cclxuICAgICAgICAvLyBMZWFkaW5nIHplcm8/IERvIG5vdCByZW1vdmUgaWYgcmVzdWx0IGlzIHNpbXBseSB6ZXJvIChxaSA9PSAxKS5cclxuICAgICAgICBpZiAoIXFjWzBdICYmIHFpICE9IDEpIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZXJlIGNhbid0IGJlIG1vcmUgdGhhbiBvbmUgemVyby5cclxuICAgICAgICAgICAgcWMuc2hpZnQoKTtcclxuICAgICAgICAgICAgcS5lLS07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSb3VuZD9cclxuICAgICAgICBpZiAocWkgPiBkaWdpdHMpIHtcclxuICAgICAgICAgICAgcm5kKHEsIGRwLCBCaWcuUk0sIHJlbVswXSAhPT0gdSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gcTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZXF1YWwgdG8gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZXEgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHJldHVybiAhdGhpcy5jbXAoeSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5ndCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpID4gMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmd0ZSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpID4gLTE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5sdCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmx0ZSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgIHJldHVybiB0aGlzLmNtcCh5KSA8IDE7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgbWludXMgdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5zdWIgPSBQLm1pbnVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgaSwgaiwgdCwgeExUeSxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoYSAhPSBiKSB7XHJcbiAgICAgICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgICAgICByZXR1cm4geC5wbHVzKHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHhjID0geC5jLnNsaWNlKCksXHJcbiAgICAgICAgICAgIHhlID0geC5lLFxyXG4gICAgICAgICAgICB5YyA9IHkuYyxcclxuICAgICAgICAgICAgeWUgPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB5IGlzIG5vbi16ZXJvPyB4IGlzIG5vbi16ZXJvPyBPciBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgICByZXR1cm4geWNbMF0gPyAoeS5zID0gLWIsIHkpIDogbmV3IEJpZyh4Y1swXSA/IHggOiAwKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSB3aGljaCBpcyB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgICBpZiAoYSA9IHhlIC0geWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICh4TFR5ID0gYSA8IDApIHtcclxuICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHllID0geGU7XHJcbiAgICAgICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgICAgICBmb3IgKGIgPSBhOyBiLS07IHQucHVzaCgwKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAvLyBFeHBvbmVudHMgZXF1YWwuIENoZWNrIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgICAgICBqID0gKCh4TFR5ID0geGMubGVuZ3RoIDwgeWMubGVuZ3RoKSA/IHhjIDogeWMpLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIGZvciAoYSA9IGIgPSAwOyBiIDwgajsgYisrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHhjW2JdICE9IHljW2JdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeExUeSA9IHhjW2JdIDwgeWNbYl07XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHggPCB5PyBQb2ludCB4YyB0byB0aGUgYXJyYXkgb2YgdGhlIGJpZ2dlciBudW1iZXIuXHJcbiAgICAgICAgaWYgKHhMVHkpIHtcclxuICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IHQ7XHJcbiAgICAgICAgICAgIHkucyA9IC15LnM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIEFwcGVuZCB6ZXJvcyB0byB4YyBpZiBzaG9ydGVyLiBObyBuZWVkIHRvIGFkZCB6ZXJvcyB0byB5YyBpZiBzaG9ydGVyXHJcbiAgICAgICAgICogYXMgc3VidHJhY3Rpb24gb25seSBuZWVkcyB0byBzdGFydCBhdCB5Yy5sZW5ndGguXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaWYgKCggYiA9IChqID0geWMubGVuZ3RoKSAtIChpID0geGMubGVuZ3RoKSApID4gMCkge1xyXG5cclxuICAgICAgICAgICAgZm9yICg7IGItLTsgeGNbaSsrXSA9IDApIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gU3VidHJhY3QgeWMgZnJvbSB4Yy5cclxuICAgICAgICBmb3IgKGIgPSBpOyBqID4gYTspe1xyXG5cclxuICAgICAgICAgICAgaWYgKHhjWy0tal0gPCB5Y1tqXSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IGo7IGkgJiYgIXhjWy0taV07IHhjW2ldID0gOSkge1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLS14Y1tpXTtcclxuICAgICAgICAgICAgICAgIHhjW2pdICs9IDEwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHhjW2pdIC09IHljW2pdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoOyB4Y1stLWJdID09PSAwOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGxlYWRpbmcgemVyb3MgYW5kIGFkanVzdCBleHBvbmVudCBhY2NvcmRpbmdseS5cclxuICAgICAgICBmb3IgKDsgeGNbMF0gPT09IDA7KSB7XHJcbiAgICAgICAgICAgIHhjLnNoaWZ0KCk7XHJcbiAgICAgICAgICAgIC0teWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoIXhjWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBuIC0gbiA9ICswXHJcbiAgICAgICAgICAgIHkucyA9IDE7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXN1bHQgbXVzdCBiZSB6ZXJvLlxyXG4gICAgICAgICAgICB4YyA9IFt5ZSA9IDBdO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeS5jID0geGM7XHJcbiAgICAgICAgeS5lID0geWU7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIG1vZHVsbyB0aGVcclxuICAgICAqIHZhbHVlIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLm1vZCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHlHVHgsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBhID0geC5zLFxyXG4gICAgICAgICAgICBiID0gKHkgPSBuZXcgQmlnKHkpKS5zO1xyXG5cclxuICAgICAgICBpZiAoIXkuY1swXSkge1xyXG4gICAgICAgICAgICB0aHJvd0VycihOYU4pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeC5zID0geS5zID0gMTtcclxuICAgICAgICB5R1R4ID0geS5jbXAoeCkgPT0gMTtcclxuICAgICAgICB4LnMgPSBhO1xyXG4gICAgICAgIHkucyA9IGI7XHJcblxyXG4gICAgICAgIGlmICh5R1R4KSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYSA9IEJpZy5EUDtcclxuICAgICAgICBiID0gQmlnLlJNO1xyXG4gICAgICAgIEJpZy5EUCA9IEJpZy5STSA9IDA7XHJcbiAgICAgICAgeCA9IHguZGl2KHkpO1xyXG4gICAgICAgIEJpZy5EUCA9IGE7XHJcbiAgICAgICAgQmlnLlJNID0gYjtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXMubWludXMoIHgudGltZXMoeSkgKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBwbHVzIHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAuYWRkID0gUC5wbHVzID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgdCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoYSAhPSBiKSB7XHJcbiAgICAgICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgICAgICByZXR1cm4geC5taW51cyh5KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB4ZSA9IHguZSxcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHllID0geS5lLFxyXG4gICAgICAgICAgICB5YyA9IHkuYztcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHkgaXMgbm9uLXplcm8/IHggaXMgbm9uLXplcm8/IE9yIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgIHJldHVybiB5Y1swXSA/IHkgOiBuZXcgQmlnKHhjWzBdID8geCA6IGEgKiAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgeGMgPSB4Yy5zbGljZSgpO1xyXG5cclxuICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgICAvLyBOb3RlOiBGYXN0ZXIgdG8gdXNlIHJldmVyc2UgdGhlbiBkbyB1bnNoaWZ0cy5cclxuICAgICAgICBpZiAoYSA9IHhlIC0geWUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChhID4gMCkge1xyXG4gICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIGZvciAoOyBhLS07IHQucHVzaCgwKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUG9pbnQgeGMgdG8gdGhlIGxvbmdlciBhcnJheS5cclxuICAgICAgICBpZiAoeGMubGVuZ3RoIC0geWMubGVuZ3RoIDwgMCkge1xyXG4gICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgIHljID0geGM7XHJcbiAgICAgICAgICAgIHhjID0gdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgYSA9IHljLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBPbmx5IHN0YXJ0IGFkZGluZyBhdCB5Yy5sZW5ndGggLSAxIGFzIHRoZSBmdXJ0aGVyIGRpZ2l0cyBvZiB4YyBjYW4gYmVcclxuICAgICAgICAgKiBsZWZ0IGFzIHRoZXkgYXJlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZvciAoYiA9IDA7IGE7KSB7XHJcbiAgICAgICAgICAgIGIgPSAoeGNbLS1hXSA9IHhjW2FdICsgeWNbYV0gKyBiKSAvIDEwIHwgMDtcclxuICAgICAgICAgICAgeGNbYV0gJT0gMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBObyBuZWVkIHRvIGNoZWNrIGZvciB6ZXJvLCBhcyAreCArICt5ICE9IDAgJiYgLXggKyAteSAhPSAwXHJcblxyXG4gICAgICAgIGlmIChiKSB7XHJcbiAgICAgICAgICAgIHhjLnVuc2hpZnQoYik7XHJcbiAgICAgICAgICAgICsreWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoYSA9IHhjLmxlbmd0aDsgeGNbLS1hXSA9PT0gMDsgeGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHkuYyA9IHhjO1xyXG4gICAgICAgIHkuZSA9IHllO1xyXG5cclxuICAgICAgICByZXR1cm4geTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJhaXNlZCB0byB0aGUgcG93ZXIgbi5cclxuICAgICAqIElmIG4gaXMgbmVnYXRpdmUsIHJvdW5kLCBpZiBuZWNlc3NhcnksIHRvIGEgbWF4aW11bSBvZiBCaWcuRFAgZGVjaW1hbFxyXG4gICAgICogcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIG4ge251bWJlcn0gSW50ZWdlciwgLU1BWF9QT1dFUiB0byBNQVhfUE9XRVIgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnBvdyA9IGZ1bmN0aW9uIChuKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBvbmUgPSBuZXcgeC5jb25zdHJ1Y3RvcigxKSxcclxuICAgICAgICAgICAgeSA9IG9uZSxcclxuICAgICAgICAgICAgaXNOZWcgPSBuIDwgMDtcclxuXHJcbiAgICAgICAgaWYgKG4gIT09IH5+biB8fCBuIDwgLU1BWF9QT1dFUiB8fCBuID4gTUFYX1BPV0VSKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchcG93IScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbiA9IGlzTmVnID8gLW4gOiBuO1xyXG5cclxuICAgICAgICBmb3IgKDs7KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAobiAmIDEpIHtcclxuICAgICAgICAgICAgICAgIHkgPSB5LnRpbWVzKHgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG4gPj49IDE7XHJcblxyXG4gICAgICAgICAgICBpZiAoIW4pIHtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHggPSB4LnRpbWVzKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGlzTmVnID8gb25lLmRpdih5KSA6IHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcm91bmRlZCB0byBhXHJcbiAgICAgKiBtYXhpbXVtIG9mIGRwIGRlY2ltYWwgcGxhY2VzIHVzaW5nIHJvdW5kaW5nIG1vZGUgcm0uXHJcbiAgICAgKiBJZiBkcCBpcyBub3Qgc3BlY2lmaWVkLCByb3VuZCB0byAwIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICogSWYgcm0gaXMgbm90IHNwZWNpZmllZCwgdXNlIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqIFtybV0gMCwgMSwgMiBvciAzIChST1VORF9ET1dOLCBST1VORF9IQUxGX1VQLCBST1VORF9IQUxGX0VWRU4sIFJPVU5EX1VQKVxyXG4gICAgICovXHJcbiAgICBQLnJvdW5kID0gZnVuY3Rpb24gKGRwLCBybSkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcjtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgZHAgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgIT09IH5+ZHAgfHwgZHAgPCAwIHx8IGRwID4gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchcm91bmQhJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJuZCh4ID0gbmV3IEJpZyh4KSwgZHAsIHJtID09IG51bGwgPyBCaWcuUk0gOiBybSk7XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHNxdWFyZSByb290IG9mIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyxcclxuICAgICAqIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsIHBsYWNlcyB1c2luZ1xyXG4gICAgICogcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKi9cclxuICAgIFAuc3FydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZXN0aW1hdGUsIHIsIGFwcHJveCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICBpID0geC5zLFxyXG4gICAgICAgICAgICBlID0geC5lLFxyXG4gICAgICAgICAgICBoYWxmID0gbmV3IEJpZygnMC41Jyk7XHJcblxyXG4gICAgICAgIC8vIFplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gbmV3IEJpZyh4KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIElmIG5lZ2F0aXZlLCB0aHJvdyBOYU4uXHJcbiAgICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFc3RpbWF0ZS5cclxuICAgICAgICBpID0gTWF0aC5zcXJ0KHgudG9TdHJpbmcoKSk7XHJcblxyXG4gICAgICAgIC8vIE1hdGguc3FydCB1bmRlcmZsb3cvb3ZlcmZsb3c/XHJcbiAgICAgICAgLy8gUGFzcyB4IHRvIE1hdGguc3FydCBhcyBpbnRlZ2VyLCB0aGVuIGFkanVzdCB0aGUgcmVzdWx0IGV4cG9uZW50LlxyXG4gICAgICAgIGlmIChpID09PSAwIHx8IGkgPT09IDEgLyAwKSB7XHJcbiAgICAgICAgICAgIGVzdGltYXRlID0geGMuam9pbignJyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIShlc3RpbWF0ZS5sZW5ndGggKyBlICYgMSkpIHtcclxuICAgICAgICAgICAgICAgIGVzdGltYXRlICs9ICcwJztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgciA9IG5ldyBCaWcoIE1hdGguc3FydChlc3RpbWF0ZSkudG9TdHJpbmcoKSApO1xyXG4gICAgICAgICAgICByLmUgPSAoKGUgKyAxKSAvIDIgfCAwKSAtIChlIDwgMCB8fCBlICYgMSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgciA9IG5ldyBCaWcoaS50b1N0cmluZygpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSByLmUgKyAoQmlnLkRQICs9IDQpO1xyXG5cclxuICAgICAgICAvLyBOZXd0b24tUmFwaHNvbiBpdGVyYXRpb24uXHJcbiAgICAgICAgZG8ge1xyXG4gICAgICAgICAgICBhcHByb3ggPSByO1xyXG4gICAgICAgICAgICByID0gaGFsZi50aW1lcyggYXBwcm94LnBsdXMoIHguZGl2KGFwcHJveCkgKSApO1xyXG4gICAgICAgIH0gd2hpbGUgKCBhcHByb3guYy5zbGljZSgwLCBpKS5qb2luKCcnKSAhPT1cclxuICAgICAgICAgICAgICAgICAgICAgICByLmMuc2xpY2UoMCwgaSkuam9pbignJykgKTtcclxuXHJcbiAgICAgICAgcm5kKHIsIEJpZy5EUCAtPSA0LCBCaWcuUk0pO1xyXG5cclxuICAgICAgICByZXR1cm4gcjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyB0aW1lcyB0aGUgdmFsdWUgb2ZcclxuICAgICAqIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLm11bCA9IFAudGltZXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciBjLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIHljID0gKHkgPSBuZXcgQmlnKHkpKS5jLFxyXG4gICAgICAgICAgICBhID0geGMubGVuZ3RoLFxyXG4gICAgICAgICAgICBiID0geWMubGVuZ3RoLFxyXG4gICAgICAgICAgICBpID0geC5lLFxyXG4gICAgICAgICAgICBqID0geS5lO1xyXG5cclxuICAgICAgICAvLyBEZXRlcm1pbmUgc2lnbiBvZiByZXN1bHQuXHJcbiAgICAgICAgeS5zID0geC5zID09IHkucyA/IDEgOiAtMTtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIHNpZ25lZCAwIGlmIGVpdGhlciAwLlxyXG4gICAgICAgIGlmICgheGNbMF0gfHwgIXljWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHkucyAqIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSW5pdGlhbGlzZSBleHBvbmVudCBvZiByZXN1bHQgYXMgeC5lICsgeS5lLlxyXG4gICAgICAgIHkuZSA9IGkgKyBqO1xyXG5cclxuICAgICAgICAvLyBJZiBhcnJheSB4YyBoYXMgZmV3ZXIgZGlnaXRzIHRoYW4geWMsIHN3YXAgeGMgYW5kIHljLCBhbmQgbGVuZ3Rocy5cclxuICAgICAgICBpZiAoYSA8IGIpIHtcclxuICAgICAgICAgICAgYyA9IHhjO1xyXG4gICAgICAgICAgICB4YyA9IHljO1xyXG4gICAgICAgICAgICB5YyA9IGM7XHJcbiAgICAgICAgICAgIGogPSBhO1xyXG4gICAgICAgICAgICBhID0gYjtcclxuICAgICAgICAgICAgYiA9IGo7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXNlIGNvZWZmaWNpZW50IGFycmF5IG9mIHJlc3VsdCB3aXRoIHplcm9zLlxyXG4gICAgICAgIGZvciAoYyA9IG5ldyBBcnJheShqID0gYSArIGIpOyBqLS07IGNbal0gPSAwKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBNdWx0aXBseS5cclxuXHJcbiAgICAgICAgLy8gaSBpcyBpbml0aWFsbHkgeGMubGVuZ3RoLlxyXG4gICAgICAgIGZvciAoaSA9IGI7IGktLTspIHtcclxuICAgICAgICAgICAgYiA9IDA7XHJcblxyXG4gICAgICAgICAgICAvLyBhIGlzIHljLmxlbmd0aC5cclxuICAgICAgICAgICAgZm9yIChqID0gYSArIGk7IGogPiBpOykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEN1cnJlbnQgc3VtIG9mIHByb2R1Y3RzIGF0IHRoaXMgZGlnaXQgcG9zaXRpb24sIHBsdXMgY2FycnkuXHJcbiAgICAgICAgICAgICAgICBiID0gY1tqXSArIHljW2ldICogeGNbaiAtIGkgLSAxXSArIGI7XHJcbiAgICAgICAgICAgICAgICBjW2otLV0gPSBiICUgMTA7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gY2FycnlcclxuICAgICAgICAgICAgICAgIGIgPSBiIC8gMTAgfCAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNbal0gPSAoY1tqXSArIGIpICUgMTA7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbmNyZW1lbnQgcmVzdWx0IGV4cG9uZW50IGlmIHRoZXJlIGlzIGEgZmluYWwgY2FycnkuXHJcbiAgICAgICAgaWYgKGIpIHtcclxuICAgICAgICAgICAgKyt5LmU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgYW55IGxlYWRpbmcgemVyby5cclxuICAgICAgICBpZiAoIWNbMF0pIHtcclxuICAgICAgICAgICAgYy5zaGlmdCgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgIGZvciAoaSA9IGMubGVuZ3RoOyAhY1stLWldOyBjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHkuYyA9IGM7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnLlxyXG4gICAgICogUmV0dXJuIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoaXMgQmlnIGhhcyBhIHBvc2l0aXZlIGV4cG9uZW50IGVxdWFsIHRvXHJcbiAgICAgKiBvciBncmVhdGVyIHRoYW4gQmlnLkVfUE9TLCBvciBhIG5lZ2F0aXZlIGV4cG9uZW50IGVxdWFsIHRvIG9yIGxlc3MgdGhhblxyXG4gICAgICogQmlnLkVfTkVHLlxyXG4gICAgICovXHJcbiAgICBQLnRvU3RyaW5nID0gUC52YWx1ZU9mID0gUC50b0pTT04gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBlID0geC5lLFxyXG4gICAgICAgICAgICBzdHIgPSB4LmMuam9pbignJyksXHJcbiAgICAgICAgICAgIHN0ckwgPSBzdHIubGVuZ3RoO1xyXG5cclxuICAgICAgICAvLyBFeHBvbmVudGlhbCBub3RhdGlvbj9cclxuICAgICAgICBpZiAoZSA8PSBCaWcuRV9ORUcgfHwgZSA+PSBCaWcuRV9QT1MpIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArIChzdHJMID4gMSA/ICcuJyArIHN0ci5zbGljZSgxKSA6ICcnKSArXHJcbiAgICAgICAgICAgICAgKGUgPCAwID8gJ2UnIDogJ2UrJykgKyBlO1xyXG5cclxuICAgICAgICAvLyBOZWdhdGl2ZSBleHBvbmVudD9cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPCAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBQcmVwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKDsgKytlOyBzdHIgPSAnMCcgKyBzdHIpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzdHIgPSAnMC4nICsgc3RyO1xyXG5cclxuICAgICAgICAvLyBQb3NpdGl2ZSBleHBvbmVudD9cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoKytlID4gc3RyTCkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEFwcGVuZCB6ZXJvcy5cclxuICAgICAgICAgICAgICAgIGZvciAoZSAtPSBzdHJMOyBlLS0gOyBzdHIgKz0gJzAnKSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZSA8IHN0ckwpIHtcclxuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5zbGljZSgwLCBlKSArICcuJyArIHN0ci5zbGljZShlKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFeHBvbmVudCB6ZXJvLlxyXG4gICAgICAgIH0gZWxzZSBpZiAoc3RyTCA+IDEpIHtcclxuICAgICAgICAgICAgc3RyID0gc3RyLmNoYXJBdCgwKSArICcuJyArIHN0ci5zbGljZSgxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEF2b2lkICctMCdcclxuICAgICAgICByZXR1cm4geC5zIDwgMCAmJiB4LmNbMF0gPyAnLScgKyBzdHIgOiBzdHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICogSWYgdG9FeHBvbmVudGlhbCwgdG9GaXhlZCwgdG9QcmVjaXNpb24gYW5kIGZvcm1hdCBhcmUgbm90IHJlcXVpcmVkIHRoZXlcclxuICAgICAqIGNhbiBzYWZlbHkgYmUgY29tbWVudGVkLW91dCBvciBkZWxldGVkLiBObyByZWR1bmRhbnQgY29kZSB3aWxsIGJlIGxlZnQuXHJcbiAgICAgKiBmb3JtYXQgaXMgdXNlZCBvbmx5IGJ5IHRvRXhwb25lbnRpYWwsIHRvRml4ZWQgYW5kIHRvUHJlY2lzaW9uLlxyXG4gICAgICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgICovXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpbiBleHBvbmVudGlhbFxyXG4gICAgICogbm90YXRpb24gdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgYW5kIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdXNpbmdcclxuICAgICAqIEJpZy5STS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYX0RQIGluY2x1c2l2ZS5cclxuICAgICAqL1xyXG4gICAgUC50b0V4cG9uZW50aWFsID0gZnVuY3Rpb24gKGRwKSB7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGRwID0gdGhpcy5jLmxlbmd0aCAtIDE7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b0V4cCEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmb3JtYXQodGhpcywgZHAsIDEpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGluIG5vcm1hbCBub3RhdGlvblxyXG4gICAgICogdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgYW5kIHJvdW5kZWQsIGlmIG5lY2Vzc2FyeSwgdXNpbmcgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvRml4ZWQgPSBmdW5jdGlvbiAoZHApIHtcclxuICAgICAgICB2YXIgc3RyLFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgbmVnID0gQmlnLkVfTkVHLFxyXG4gICAgICAgICAgICBwb3MgPSBCaWcuRV9QT1M7XHJcblxyXG4gICAgICAgIC8vIFByZXZlbnQgdGhlIHBvc3NpYmlsaXR5IG9mIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgIEJpZy5FX05FRyA9IC0oQmlnLkVfUE9TID0gMSAvIDApO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBzdHIgPSB4LnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCA9PT0gfn5kcCAmJiBkcCA+PSAwICYmIGRwIDw9IE1BWF9EUCkge1xyXG4gICAgICAgICAgICBzdHIgPSBmb3JtYXQoeCwgeC5lICsgZHApO1xyXG5cclxuICAgICAgICAgICAgLy8gKC0wKS50b0ZpeGVkKCkgaXMgJzAnLCBidXQgKC0wLjEpLnRvRml4ZWQoKSBpcyAnLTAnLlxyXG4gICAgICAgICAgICAvLyAoLTApLnRvRml4ZWQoMSkgaXMgJzAuMCcsIGJ1dCAoLTAuMDEpLnRvRml4ZWQoMSkgaXMgJy0wLjAnLlxyXG4gICAgICAgICAgICBpZiAoeC5zIDwgMCAmJiB4LmNbMF0gJiYgc3RyLmluZGV4T2YoJy0nKSA8IDApIHtcclxuICAgICAgICAvL0UuZy4gLTAuNSBpZiByb3VuZGVkIHRvIC0wIHdpbGwgY2F1c2UgdG9TdHJpbmcgdG8gb21pdCB0aGUgbWludXMgc2lnbi5cclxuICAgICAgICAgICAgICAgIHN0ciA9ICctJyArIHN0cjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBCaWcuRV9ORUcgPSBuZWc7XHJcbiAgICAgICAgQmlnLkVfUE9TID0gcG9zO1xyXG5cclxuICAgICAgICBpZiAoIXN0cikge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvRml4IScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIHNkXHJcbiAgICAgKiBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgQmlnLlJNLiBVc2UgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgc2QgaXMgbGVzc1xyXG4gICAgICogdGhhbiB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlXHJcbiAgICAgKiB2YWx1ZSBpbiBub3JtYWwgbm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogc2Qge251bWJlcn0gSW50ZWdlciwgMSB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvUHJlY2lzaW9uID0gZnVuY3Rpb24gKHNkKSB7XHJcblxyXG4gICAgICAgIGlmIChzZCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChzZCAhPT0gfn5zZCB8fCBzZCA8IDEgfHwgc2QgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyF0b1ByZSEnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBmb3JtYXQodGhpcywgc2QgLSAxLCAyKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8vIEV4cG9ydFxyXG5cclxuXHJcbiAgICBCaWcgPSBiaWdGYWN0b3J5KCk7XHJcblxyXG4gICAgLy9BTUQuXHJcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XHJcbiAgICAgICAgZGVmaW5lKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIEJpZztcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAvLyBOb2RlIGFuZCBvdGhlciBDb21tb25KUy1saWtlIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMuXHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBCaWc7XHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMuQmlnID0gQmlnO1xyXG5cclxuICAgIC8vQnJvd3Nlci5cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZ2xvYmFsLkJpZyA9IEJpZztcclxuICAgIH1cclxufSkodGhpcyk7XHJcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2JpZy5qcy9iaWcuanNcbi8vIG1vZHVsZSBpZCA9IDEzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNyeXB0b1wiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImNyeXB0b1wiXG4vLyBtb2R1bGUgaWQgPSAxNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuY29uc3QgZW1vamlzTGlzdCA9IHJlcXVpcmUoXCJlbW9qaXMtbGlzdFwiKTtcbmNvbnN0IGdldEhhc2hEaWdlc3QgPSByZXF1aXJlKFwiLi9nZXRIYXNoRGlnZXN0XCIpO1xuXG5jb25zdCBlbW9qaVJlZ2V4ID0gL1tcXHVEODAwLVxcdURGRkZdLi87XG5jb25zdCBlbW9qaUxpc3QgPSBlbW9qaXNMaXN0LmZpbHRlcihlbW9qaSA9PiBlbW9qaVJlZ2V4LnRlc3QoZW1vamkpKTtcbmNvbnN0IGVtb2ppQ2FjaGUgPSB7fTtcblxuZnVuY3Rpb24gZW5jb2RlU3RyaW5nVG9FbW9qaShjb250ZW50LCBsZW5ndGgpIHtcblx0aWYoZW1vamlDYWNoZVtjb250ZW50XSkgcmV0dXJuIGVtb2ppQ2FjaGVbY29udGVudF07XG5cdGxlbmd0aCA9IGxlbmd0aCB8fCAxO1xuXHRjb25zdCBlbW9qaXMgPSBbXTtcblx0ZG8ge1xuXHRcdGNvbnN0IGluZGV4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogZW1vamlMaXN0Lmxlbmd0aCk7XG5cdFx0ZW1vamlzLnB1c2goZW1vamlMaXN0W2luZGV4XSk7XG5cdFx0ZW1vamlMaXN0LnNwbGljZShpbmRleCwgMSk7XG5cdH0gd2hpbGUoLS1sZW5ndGggPiAwKTtcblx0Y29uc3QgZW1vamlFbmNvZGluZyA9IGVtb2ppcy5qb2luKFwiXCIpO1xuXHRlbW9qaUNhY2hlW2NvbnRlbnRdID0gZW1vamlFbmNvZGluZztcblx0cmV0dXJuIGVtb2ppRW5jb2Rpbmc7XG59XG5cbmZ1bmN0aW9uIGludGVycG9sYXRlTmFtZShsb2FkZXJDb250ZXh0LCBuYW1lLCBvcHRpb25zKSB7XG5cdGxldCBmaWxlbmFtZTtcblx0aWYodHlwZW9mIG5hbWUgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdGZpbGVuYW1lID0gbmFtZShsb2FkZXJDb250ZXh0LnJlc291cmNlUGF0aCk7XG5cdH0gZWxzZSB7XG5cdFx0ZmlsZW5hbWUgPSBuYW1lIHx8IFwiW2hhc2hdLltleHRdXCI7XG5cdH1cblx0Y29uc3QgY29udGV4dCA9IG9wdGlvbnMuY29udGV4dDtcblx0Y29uc3QgY29udGVudCA9IG9wdGlvbnMuY29udGVudDtcblx0Y29uc3QgcmVnRXhwID0gb3B0aW9ucy5yZWdFeHA7XG5cdGxldCBleHQgPSBcImJpblwiO1xuXHRsZXQgYmFzZW5hbWUgPSBcImZpbGVcIjtcblx0bGV0IGRpcmVjdG9yeSA9IFwiXCI7XG5cdGxldCBmb2xkZXIgPSBcIlwiO1xuXHRpZihsb2FkZXJDb250ZXh0LnJlc291cmNlUGF0aCkge1xuXHRcdGNvbnN0IHBhcnNlZCA9IHBhdGgucGFyc2UobG9hZGVyQ29udGV4dC5yZXNvdXJjZVBhdGgpO1xuXHRcdGxldCByZXNvdXJjZVBhdGggPSBsb2FkZXJDb250ZXh0LnJlc291cmNlUGF0aDtcblxuXHRcdGlmKHBhcnNlZC5leHQpIHtcblx0XHRcdGV4dCA9IHBhcnNlZC5leHQuc3Vic3RyKDEpO1xuXHRcdH1cblx0XHRpZihwYXJzZWQuZGlyKSB7XG5cdFx0XHRiYXNlbmFtZSA9IHBhcnNlZC5uYW1lO1xuXHRcdFx0cmVzb3VyY2VQYXRoID0gcGFyc2VkLmRpciArIHBhdGguc2VwO1xuXHRcdH1cblx0XHRpZih0eXBlb2YgY29udGV4dCAhPT0gXCJ1bmRlZmluZWRcIikge1xuXHRcdFx0ZGlyZWN0b3J5ID0gcGF0aC5yZWxhdGl2ZShjb250ZXh0LCByZXNvdXJjZVBhdGggKyBcIl9cIikucmVwbGFjZSgvXFxcXC9nLCBcIi9cIikucmVwbGFjZSgvXFwuXFwuKFxcLyk/L2csIFwiXyQxXCIpO1xuXHRcdFx0ZGlyZWN0b3J5ID0gZGlyZWN0b3J5LnN1YnN0cigwLCBkaXJlY3RvcnkubGVuZ3RoIC0gMSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRpcmVjdG9yeSA9IHJlc291cmNlUGF0aC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKS5yZXBsYWNlKC9cXC5cXC4oXFwvKT8vZywgXCJfJDFcIik7XG5cdFx0fVxuXHRcdGlmKGRpcmVjdG9yeS5sZW5ndGggPT09IDEpIHtcblx0XHRcdGRpcmVjdG9yeSA9IFwiXCI7XG5cdFx0fSBlbHNlIGlmKGRpcmVjdG9yeS5sZW5ndGggPiAxKSB7XG5cdFx0XHRmb2xkZXIgPSBwYXRoLmJhc2VuYW1lKGRpcmVjdG9yeSk7XG5cdFx0fVxuXHR9XG5cdGxldCB1cmwgPSBmaWxlbmFtZTtcblx0aWYoY29udGVudCkge1xuXHRcdC8vIE1hdGNoIGhhc2ggdGVtcGxhdGVcblx0XHR1cmwgPSB1cmxcblx0XHRcdC5yZXBsYWNlKFxuXHRcdFx0XHQvXFxbKD86KFxcdyspOik/aGFzaCg/OjooW2Etel0rXFxkKikpPyg/OjooXFxkKykpP1xcXS9pZyxcblx0XHRcdFx0KGFsbCwgaGFzaFR5cGUsIGRpZ2VzdFR5cGUsIG1heExlbmd0aCkgPT4gZ2V0SGFzaERpZ2VzdChjb250ZW50LCBoYXNoVHlwZSwgZGlnZXN0VHlwZSwgcGFyc2VJbnQobWF4TGVuZ3RoLCAxMCkpXG5cdFx0XHQpXG5cdFx0XHQucmVwbGFjZShcblx0XHRcdFx0L1xcW2Vtb2ppKD86OihcXGQrKSk/XFxdL2lnLFxuXHRcdFx0XHQoYWxsLCBsZW5ndGgpID0+IGVuY29kZVN0cmluZ1RvRW1vamkoY29udGVudCwgbGVuZ3RoKVxuXHRcdFx0KTtcblx0fVxuXHR1cmwgPSB1cmxcblx0XHQucmVwbGFjZSgvXFxbZXh0XFxdL2lnLCAoKSA9PiBleHQpXG5cdFx0LnJlcGxhY2UoL1xcW25hbWVcXF0vaWcsICgpID0+IGJhc2VuYW1lKVxuXHRcdC5yZXBsYWNlKC9cXFtwYXRoXFxdL2lnLCAoKSA9PiBkaXJlY3RvcnkpXG5cdFx0LnJlcGxhY2UoL1xcW2ZvbGRlclxcXS9pZywgKCkgPT4gZm9sZGVyKTtcblx0aWYocmVnRXhwICYmIGxvYWRlckNvbnRleHQucmVzb3VyY2VQYXRoKSB7XG5cdFx0Y29uc3QgbWF0Y2ggPSBsb2FkZXJDb250ZXh0LnJlc291cmNlUGF0aC5tYXRjaChuZXcgUmVnRXhwKHJlZ0V4cCkpO1xuXHRcdG1hdGNoICYmIG1hdGNoLmZvckVhY2goKG1hdGNoZWQsIGkpID0+IHtcblx0XHRcdHVybCA9IHVybC5yZXBsYWNlKFxuXHRcdFx0XHRuZXcgUmVnRXhwKFwiXFxcXFtcIiArIGkgKyBcIlxcXFxdXCIsIFwiaWdcIiksXG5cdFx0XHRcdG1hdGNoZWRcblx0XHRcdCk7XG5cdFx0fSk7XG5cdH1cblx0aWYodHlwZW9mIGxvYWRlckNvbnRleHQub3B0aW9ucyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbG9hZGVyQ29udGV4dC5vcHRpb25zLmN1c3RvbUludGVycG9sYXRlTmFtZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0dXJsID0gbG9hZGVyQ29udGV4dC5vcHRpb25zLmN1c3RvbUludGVycG9sYXRlTmFtZS5jYWxsKGxvYWRlckNvbnRleHQsIHVybCwgbmFtZSwgb3B0aW9ucyk7XG5cdH1cblx0cmV0dXJuIHVybDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpbnRlcnBvbGF0ZU5hbWU7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9sb2FkZXItdXRpbHMvbGliL2ludGVycG9sYXRlTmFtZS5qc1xuLy8gbW9kdWxlIGlkID0gMTVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSBbXG4gIFwi8J+AhFwiLFxuICBcIvCfg49cIixcbiAgXCLwn4WwXCIsXG4gIFwi8J+FsVwiLFxuICBcIvCfhb5cIixcbiAgXCLwn4W/XCIsXG4gIFwi8J+GjlwiLFxuICBcIvCfhpFcIixcbiAgXCLwn4aSXCIsXG4gIFwi8J+Gk1wiLFxuICBcIvCfhpRcIixcbiAgXCLwn4aVXCIsXG4gIFwi8J+GllwiLFxuICBcIvCfhpdcIixcbiAgXCLwn4aYXCIsXG4gIFwi8J+GmVwiLFxuICBcIvCfhppcIixcbiAgXCLwn4em8J+HqFwiLFxuICBcIvCfh6bwn4epXCIsXG4gIFwi8J+HpvCfh6pcIixcbiAgXCLwn4em8J+Hq1wiLFxuICBcIvCfh6bwn4esXCIsXG4gIFwi8J+HpvCfh65cIixcbiAgXCLwn4em8J+HsVwiLFxuICBcIvCfh6bwn4eyXCIsXG4gIFwi8J+HpvCfh7RcIixcbiAgXCLwn4em8J+HtlwiLFxuICBcIvCfh6bwn4e3XCIsXG4gIFwi8J+HpvCfh7hcIixcbiAgXCLwn4em8J+HuVwiLFxuICBcIvCfh6bwn4e6XCIsXG4gIFwi8J+HpvCfh7xcIixcbiAgXCLwn4em8J+HvVwiLFxuICBcIvCfh6bwn4e/XCIsXG4gIFwi8J+HplwiLFxuICBcIvCfh6fwn4emXCIsXG4gIFwi8J+Hp/Cfh6dcIixcbiAgXCLwn4en8J+HqVwiLFxuICBcIvCfh6fwn4eqXCIsXG4gIFwi8J+Hp/Cfh6tcIixcbiAgXCLwn4en8J+HrFwiLFxuICBcIvCfh6fwn4etXCIsXG4gIFwi8J+Hp/Cfh65cIixcbiAgXCLwn4en8J+Hr1wiLFxuICBcIvCfh6fwn4exXCIsXG4gIFwi8J+Hp/Cfh7JcIixcbiAgXCLwn4en8J+Hs1wiLFxuICBcIvCfh6fwn4e0XCIsXG4gIFwi8J+Hp/Cfh7ZcIixcbiAgXCLwn4en8J+Ht1wiLFxuICBcIvCfh6fwn4e4XCIsXG4gIFwi8J+Hp/Cfh7lcIixcbiAgXCLwn4en8J+Hu1wiLFxuICBcIvCfh6fwn4e8XCIsXG4gIFwi8J+Hp/Cfh75cIixcbiAgXCLwn4en8J+Hv1wiLFxuICBcIvCfh6dcIixcbiAgXCLwn4eo8J+HplwiLFxuICBcIvCfh6jwn4eoXCIsXG4gIFwi8J+HqPCfh6lcIixcbiAgXCLwn4eo8J+Hq1wiLFxuICBcIvCfh6jwn4esXCIsXG4gIFwi8J+HqPCfh61cIixcbiAgXCLwn4eo8J+HrlwiLFxuICBcIvCfh6jwn4ewXCIsXG4gIFwi8J+HqPCfh7FcIixcbiAgXCLwn4eo8J+HslwiLFxuICBcIvCfh6jwn4ezXCIsXG4gIFwi8J+HqPCfh7RcIixcbiAgXCLwn4eo8J+HtVwiLFxuICBcIvCfh6jwn4e3XCIsXG4gIFwi8J+HqPCfh7pcIixcbiAgXCLwn4eo8J+Hu1wiLFxuICBcIvCfh6jwn4e8XCIsXG4gIFwi8J+HqPCfh71cIixcbiAgXCLwn4eo8J+HvlwiLFxuICBcIvCfh6jwn4e/XCIsXG4gIFwi8J+HqFwiLFxuICBcIvCfh6nwn4eqXCIsXG4gIFwi8J+HqfCfh6xcIixcbiAgXCLwn4ep8J+Hr1wiLFxuICBcIvCfh6nwn4ewXCIsXG4gIFwi8J+HqfCfh7JcIixcbiAgXCLwn4ep8J+HtFwiLFxuICBcIvCfh6nwn4e/XCIsXG4gIFwi8J+HqVwiLFxuICBcIvCfh6rwn4emXCIsXG4gIFwi8J+HqvCfh6hcIixcbiAgXCLwn4eq8J+HqlwiLFxuICBcIvCfh6rwn4esXCIsXG4gIFwi8J+HqvCfh61cIixcbiAgXCLwn4eq8J+Ht1wiLFxuICBcIvCfh6rwn4e4XCIsXG4gIFwi8J+HqvCfh7lcIixcbiAgXCLwn4eq8J+HulwiLFxuICBcIvCfh6pcIixcbiAgXCLwn4er8J+HrlwiLFxuICBcIvCfh6vwn4evXCIsXG4gIFwi8J+Hq/Cfh7BcIixcbiAgXCLwn4er8J+HslwiLFxuICBcIvCfh6vwn4e0XCIsXG4gIFwi8J+Hq/Cfh7dcIixcbiAgXCLwn4erXCIsXG4gIFwi8J+HrPCfh6ZcIixcbiAgXCLwn4es8J+Hp1wiLFxuICBcIvCfh6zwn4epXCIsXG4gIFwi8J+HrPCfh6pcIixcbiAgXCLwn4es8J+Hq1wiLFxuICBcIvCfh6zwn4esXCIsXG4gIFwi8J+HrPCfh61cIixcbiAgXCLwn4es8J+HrlwiLFxuICBcIvCfh6zwn4exXCIsXG4gIFwi8J+HrPCfh7JcIixcbiAgXCLwn4es8J+Hs1wiLFxuICBcIvCfh6zwn4e1XCIsXG4gIFwi8J+HrPCfh7ZcIixcbiAgXCLwn4es8J+Ht1wiLFxuICBcIvCfh6zwn4e4XCIsXG4gIFwi8J+HrPCfh7lcIixcbiAgXCLwn4es8J+HulwiLFxuICBcIvCfh6zwn4e8XCIsXG4gIFwi8J+HrPCfh75cIixcbiAgXCLwn4esXCIsXG4gIFwi8J+HrfCfh7BcIixcbiAgXCLwn4et8J+HslwiLFxuICBcIvCfh63wn4ezXCIsXG4gIFwi8J+HrfCfh7dcIixcbiAgXCLwn4et8J+HuVwiLFxuICBcIvCfh63wn4e6XCIsXG4gIFwi8J+HrVwiLFxuICBcIvCfh67wn4eoXCIsXG4gIFwi8J+HrvCfh6lcIixcbiAgXCLwn4eu8J+HqlwiLFxuICBcIvCfh67wn4exXCIsXG4gIFwi8J+HrvCfh7JcIixcbiAgXCLwn4eu8J+Hs1wiLFxuICBcIvCfh67wn4e0XCIsXG4gIFwi8J+HrvCfh7ZcIixcbiAgXCLwn4eu8J+Ht1wiLFxuICBcIvCfh67wn4e4XCIsXG4gIFwi8J+HrvCfh7lcIixcbiAgXCLwn4euXCIsXG4gIFwi8J+Hr/Cfh6pcIixcbiAgXCLwn4ev8J+HslwiLFxuICBcIvCfh6/wn4e0XCIsXG4gIFwi8J+Hr/Cfh7VcIixcbiAgXCLwn4evXCIsXG4gIFwi8J+HsPCfh6pcIixcbiAgXCLwn4ew8J+HrFwiLFxuICBcIvCfh7Dwn4etXCIsXG4gIFwi8J+HsPCfh65cIixcbiAgXCLwn4ew8J+HslwiLFxuICBcIvCfh7Dwn4ezXCIsXG4gIFwi8J+HsPCfh7VcIixcbiAgXCLwn4ew8J+Ht1wiLFxuICBcIvCfh7Dwn4e8XCIsXG4gIFwi8J+HsPCfh75cIixcbiAgXCLwn4ew8J+Hv1wiLFxuICBcIvCfh7BcIixcbiAgXCLwn4ex8J+HplwiLFxuICBcIvCfh7Hwn4enXCIsXG4gIFwi8J+HsfCfh6hcIixcbiAgXCLwn4ex8J+HrlwiLFxuICBcIvCfh7Hwn4ewXCIsXG4gIFwi8J+HsfCfh7dcIixcbiAgXCLwn4ex8J+HuFwiLFxuICBcIvCfh7Hwn4e5XCIsXG4gIFwi8J+HsfCfh7pcIixcbiAgXCLwn4ex8J+Hu1wiLFxuICBcIvCfh7Hwn4e+XCIsXG4gIFwi8J+HsVwiLFxuICBcIvCfh7Lwn4emXCIsXG4gIFwi8J+HsvCfh6hcIixcbiAgXCLwn4ey8J+HqVwiLFxuICBcIvCfh7Lwn4eqXCIsXG4gIFwi8J+HsvCfh6tcIixcbiAgXCLwn4ey8J+HrFwiLFxuICBcIvCfh7Lwn4etXCIsXG4gIFwi8J+HsvCfh7BcIixcbiAgXCLwn4ey8J+HsVwiLFxuICBcIvCfh7Lwn4eyXCIsXG4gIFwi8J+HsvCfh7NcIixcbiAgXCLwn4ey8J+HtFwiLFxuICBcIvCfh7Lwn4e1XCIsXG4gIFwi8J+HsvCfh7ZcIixcbiAgXCLwn4ey8J+Ht1wiLFxuICBcIvCfh7Lwn4e4XCIsXG4gIFwi8J+HsvCfh7lcIixcbiAgXCLwn4ey8J+HulwiLFxuICBcIvCfh7Lwn4e7XCIsXG4gIFwi8J+HsvCfh7xcIixcbiAgXCLwn4ey8J+HvVwiLFxuICBcIvCfh7Lwn4e+XCIsXG4gIFwi8J+HsvCfh79cIixcbiAgXCLwn4eyXCIsXG4gIFwi8J+Hs/Cfh6ZcIixcbiAgXCLwn4ez8J+HqFwiLFxuICBcIvCfh7Pwn4eqXCIsXG4gIFwi8J+Hs/Cfh6tcIixcbiAgXCLwn4ez8J+HrFwiLFxuICBcIvCfh7Pwn4euXCIsXG4gIFwi8J+Hs/Cfh7FcIixcbiAgXCLwn4ez8J+HtFwiLFxuICBcIvCfh7Pwn4e1XCIsXG4gIFwi8J+Hs/Cfh7dcIixcbiAgXCLwn4ez8J+HulwiLFxuICBcIvCfh7Pwn4e/XCIsXG4gIFwi8J+Hs1wiLFxuICBcIvCfh7Twn4eyXCIsXG4gIFwi8J+HtFwiLFxuICBcIvCfh7Xwn4emXCIsXG4gIFwi8J+HtfCfh6pcIixcbiAgXCLwn4e18J+Hq1wiLFxuICBcIvCfh7Xwn4esXCIsXG4gIFwi8J+HtfCfh61cIixcbiAgXCLwn4e18J+HsFwiLFxuICBcIvCfh7Xwn4exXCIsXG4gIFwi8J+HtfCfh7JcIixcbiAgXCLwn4e18J+Hs1wiLFxuICBcIvCfh7Xwn4e3XCIsXG4gIFwi8J+HtfCfh7hcIixcbiAgXCLwn4e18J+HuVwiLFxuICBcIvCfh7Xwn4e8XCIsXG4gIFwi8J+HtfCfh75cIixcbiAgXCLwn4e1XCIsXG4gIFwi8J+HtvCfh6ZcIixcbiAgXCLwn4e2XCIsXG4gIFwi8J+Ht/Cfh6pcIixcbiAgXCLwn4e38J+HtFwiLFxuICBcIvCfh7fwn4e4XCIsXG4gIFwi8J+Ht/Cfh7pcIixcbiAgXCLwn4e38J+HvFwiLFxuICBcIvCfh7dcIixcbiAgXCLwn4e48J+HplwiLFxuICBcIvCfh7jwn4enXCIsXG4gIFwi8J+HuPCfh6hcIixcbiAgXCLwn4e48J+HqVwiLFxuICBcIvCfh7jwn4eqXCIsXG4gIFwi8J+HuPCfh6xcIixcbiAgXCLwn4e48J+HrVwiLFxuICBcIvCfh7jwn4euXCIsXG4gIFwi8J+HuPCfh69cIixcbiAgXCLwn4e48J+HsFwiLFxuICBcIvCfh7jwn4exXCIsXG4gIFwi8J+HuPCfh7JcIixcbiAgXCLwn4e48J+Hs1wiLFxuICBcIvCfh7jwn4e0XCIsXG4gIFwi8J+HuPCfh7dcIixcbiAgXCLwn4e48J+HuFwiLFxuICBcIvCfh7jwn4e5XCIsXG4gIFwi8J+HuPCfh7tcIixcbiAgXCLwn4e48J+HvVwiLFxuICBcIvCfh7jwn4e+XCIsXG4gIFwi8J+HuPCfh79cIixcbiAgXCLwn4e4XCIsXG4gIFwi8J+HufCfh6ZcIixcbiAgXCLwn4e58J+HqFwiLFxuICBcIvCfh7nwn4epXCIsXG4gIFwi8J+HufCfh6tcIixcbiAgXCLwn4e58J+HrFwiLFxuICBcIvCfh7nwn4etXCIsXG4gIFwi8J+HufCfh69cIixcbiAgXCLwn4e58J+HsFwiLFxuICBcIvCfh7nwn4exXCIsXG4gIFwi8J+HufCfh7JcIixcbiAgXCLwn4e58J+Hs1wiLFxuICBcIvCfh7nwn4e0XCIsXG4gIFwi8J+HufCfh7dcIixcbiAgXCLwn4e58J+HuVwiLFxuICBcIvCfh7nwn4e7XCIsXG4gIFwi8J+HufCfh7xcIixcbiAgXCLwn4e58J+Hv1wiLFxuICBcIvCfh7lcIixcbiAgXCLwn4e68J+HplwiLFxuICBcIvCfh7rwn4esXCIsXG4gIFwi8J+HuvCfh7JcIixcbiAgXCLwn4e68J+Hs1wiLFxuICBcIvCfh7rwn4e4XCIsXG4gIFwi8J+HuvCfh75cIixcbiAgXCLwn4e68J+Hv1wiLFxuICBcIvCfh7pcIixcbiAgXCLwn4e78J+HplwiLFxuICBcIvCfh7vwn4eoXCIsXG4gIFwi8J+Hu/Cfh6pcIixcbiAgXCLwn4e78J+HrFwiLFxuICBcIvCfh7vwn4euXCIsXG4gIFwi8J+Hu/Cfh7NcIixcbiAgXCLwn4e78J+HulwiLFxuICBcIvCfh7tcIixcbiAgXCLwn4e88J+Hq1wiLFxuICBcIvCfh7zwn4e4XCIsXG4gIFwi8J+HvFwiLFxuICBcIvCfh73wn4ewXCIsXG4gIFwi8J+HvVwiLFxuICBcIvCfh77wn4eqXCIsXG4gIFwi8J+HvvCfh7lcIixcbiAgXCLwn4e+XCIsXG4gIFwi8J+Hv/Cfh6ZcIixcbiAgXCLwn4e/8J+HslwiLFxuICBcIvCfh7/wn4e8XCIsXG4gIFwi8J+Hv1wiLFxuICBcIvCfiIFcIixcbiAgXCLwn4iCXCIsXG4gIFwi8J+ImlwiLFxuICBcIvCfiK9cIixcbiAgXCLwn4iyXCIsXG4gIFwi8J+Is1wiLFxuICBcIvCfiLRcIixcbiAgXCLwn4i1XCIsXG4gIFwi8J+ItlwiLFxuICBcIvCfiLdcIixcbiAgXCLwn4i4XCIsXG4gIFwi8J+IuVwiLFxuICBcIvCfiLpcIixcbiAgXCLwn4mQXCIsXG4gIFwi8J+JkVwiLFxuICBcIvCfjIBcIixcbiAgXCLwn4yBXCIsXG4gIFwi8J+MglwiLFxuICBcIvCfjINcIixcbiAgXCLwn4yEXCIsXG4gIFwi8J+MhVwiLFxuICBcIvCfjIZcIixcbiAgXCLwn4yHXCIsXG4gIFwi8J+MiFwiLFxuICBcIvCfjIlcIixcbiAgXCLwn4yKXCIsXG4gIFwi8J+Mi1wiLFxuICBcIvCfjIxcIixcbiAgXCLwn4yNXCIsXG4gIFwi8J+MjlwiLFxuICBcIvCfjI9cIixcbiAgXCLwn4yQXCIsXG4gIFwi8J+MkVwiLFxuICBcIvCfjJJcIixcbiAgXCLwn4yTXCIsXG4gIFwi8J+MlFwiLFxuICBcIvCfjJVcIixcbiAgXCLwn4yWXCIsXG4gIFwi8J+Ml1wiLFxuICBcIvCfjJhcIixcbiAgXCLwn4yZXCIsXG4gIFwi8J+MmlwiLFxuICBcIvCfjJtcIixcbiAgXCLwn4ycXCIsXG4gIFwi8J+MnVwiLFxuICBcIvCfjJ5cIixcbiAgXCLwn4yfXCIsXG4gIFwi8J+MoFwiLFxuICBcIvCfjKFcIixcbiAgXCLwn4ykXCIsXG4gIFwi8J+MpVwiLFxuICBcIvCfjKZcIixcbiAgXCLwn4ynXCIsXG4gIFwi8J+MqFwiLFxuICBcIvCfjKlcIixcbiAgXCLwn4yqXCIsXG4gIFwi8J+Mq1wiLFxuICBcIvCfjKxcIixcbiAgXCLwn4ytXCIsXG4gIFwi8J+MrlwiLFxuICBcIvCfjK9cIixcbiAgXCLwn4ywXCIsXG4gIFwi8J+MsVwiLFxuICBcIvCfjLJcIixcbiAgXCLwn4yzXCIsXG4gIFwi8J+MtFwiLFxuICBcIvCfjLVcIixcbiAgXCLwn4y2XCIsXG4gIFwi8J+Mt1wiLFxuICBcIvCfjLhcIixcbiAgXCLwn4y5XCIsXG4gIFwi8J+MulwiLFxuICBcIvCfjLtcIixcbiAgXCLwn4y8XCIsXG4gIFwi8J+MvVwiLFxuICBcIvCfjL5cIixcbiAgXCLwn4y/XCIsXG4gIFwi8J+NgFwiLFxuICBcIvCfjYFcIixcbiAgXCLwn42CXCIsXG4gIFwi8J+Ng1wiLFxuICBcIvCfjYRcIixcbiAgXCLwn42FXCIsXG4gIFwi8J+NhlwiLFxuICBcIvCfjYdcIixcbiAgXCLwn42IXCIsXG4gIFwi8J+NiVwiLFxuICBcIvCfjYpcIixcbiAgXCLwn42LXCIsXG4gIFwi8J+NjFwiLFxuICBcIvCfjY1cIixcbiAgXCLwn42OXCIsXG4gIFwi8J+Nj1wiLFxuICBcIvCfjZBcIixcbiAgXCLwn42RXCIsXG4gIFwi8J+NklwiLFxuICBcIvCfjZNcIixcbiAgXCLwn42UXCIsXG4gIFwi8J+NlVwiLFxuICBcIvCfjZZcIixcbiAgXCLwn42XXCIsXG4gIFwi8J+NmFwiLFxuICBcIvCfjZlcIixcbiAgXCLwn42aXCIsXG4gIFwi8J+Nm1wiLFxuICBcIvCfjZxcIixcbiAgXCLwn42dXCIsXG4gIFwi8J+NnlwiLFxuICBcIvCfjZ9cIixcbiAgXCLwn42gXCIsXG4gIFwi8J+NoVwiLFxuICBcIvCfjaJcIixcbiAgXCLwn42jXCIsXG4gIFwi8J+NpFwiLFxuICBcIvCfjaVcIixcbiAgXCLwn42mXCIsXG4gIFwi8J+Np1wiLFxuICBcIvCfjahcIixcbiAgXCLwn42pXCIsXG4gIFwi8J+NqlwiLFxuICBcIvCfjatcIixcbiAgXCLwn42sXCIsXG4gIFwi8J+NrVwiLFxuICBcIvCfja5cIixcbiAgXCLwn42vXCIsXG4gIFwi8J+NsFwiLFxuICBcIvCfjbFcIixcbiAgXCLwn42yXCIsXG4gIFwi8J+Ns1wiLFxuICBcIvCfjbRcIixcbiAgXCLwn421XCIsXG4gIFwi8J+NtlwiLFxuICBcIvCfjbdcIixcbiAgXCLwn424XCIsXG4gIFwi8J+NuVwiLFxuICBcIvCfjbpcIixcbiAgXCLwn427XCIsXG4gIFwi8J+NvFwiLFxuICBcIvCfjb1cIixcbiAgXCLwn42+XCIsXG4gIFwi8J+Nv1wiLFxuICBcIvCfjoBcIixcbiAgXCLwn46BXCIsXG4gIFwi8J+OglwiLFxuICBcIvCfjoNcIixcbiAgXCLwn46EXCIsXG4gIFwi8J+OhfCfj7tcIixcbiAgXCLwn46F8J+PvFwiLFxuICBcIvCfjoXwn4+9XCIsXG4gIFwi8J+OhfCfj75cIixcbiAgXCLwn46F8J+Pv1wiLFxuICBcIvCfjoVcIixcbiAgXCLwn46GXCIsXG4gIFwi8J+Oh1wiLFxuICBcIvCfjohcIixcbiAgXCLwn46JXCIsXG4gIFwi8J+OilwiLFxuICBcIvCfjotcIixcbiAgXCLwn46MXCIsXG4gIFwi8J+OjVwiLFxuICBcIvCfjo5cIixcbiAgXCLwn46PXCIsXG4gIFwi8J+OkFwiLFxuICBcIvCfjpFcIixcbiAgXCLwn46SXCIsXG4gIFwi8J+Ok1wiLFxuICBcIvCfjpZcIixcbiAgXCLwn46XXCIsXG4gIFwi8J+OmVwiLFxuICBcIvCfjppcIixcbiAgXCLwn46bXCIsXG4gIFwi8J+OnlwiLFxuICBcIvCfjp9cIixcbiAgXCLwn46gXCIsXG4gIFwi8J+OoVwiLFxuICBcIvCfjqJcIixcbiAgXCLwn46jXCIsXG4gIFwi8J+OpFwiLFxuICBcIvCfjqVcIixcbiAgXCLwn46mXCIsXG4gIFwi8J+Op1wiLFxuICBcIvCfjqhcIixcbiAgXCLwn46pXCIsXG4gIFwi8J+OqlwiLFxuICBcIvCfjqtcIixcbiAgXCLwn46sXCIsXG4gIFwi8J+OrVwiLFxuICBcIvCfjq5cIixcbiAgXCLwn46vXCIsXG4gIFwi8J+OsFwiLFxuICBcIvCfjrFcIixcbiAgXCLwn46yXCIsXG4gIFwi8J+Os1wiLFxuICBcIvCfjrRcIixcbiAgXCLwn461XCIsXG4gIFwi8J+OtlwiLFxuICBcIvCfjrdcIixcbiAgXCLwn464XCIsXG4gIFwi8J+OuVwiLFxuICBcIvCfjrpcIixcbiAgXCLwn467XCIsXG4gIFwi8J+OvFwiLFxuICBcIvCfjr1cIixcbiAgXCLwn46+XCIsXG4gIFwi8J+Ov1wiLFxuICBcIvCfj4BcIixcbiAgXCLwn4+BXCIsXG4gIFwi8J+PgvCfj7tcIixcbiAgXCLwn4+C8J+PvFwiLFxuICBcIvCfj4Lwn4+9XCIsXG4gIFwi8J+PgvCfj75cIixcbiAgXCLwn4+C8J+Pv1wiLFxuICBcIvCfj4JcIixcbiAgXCLwn4+D8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfj4Pwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+Pg/Cfj7tcIixcbiAgXCLwn4+D8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfj4Pwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+Pg/Cfj7xcIixcbiAgXCLwn4+D8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfj4Pwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+Pg/Cfj71cIixcbiAgXCLwn4+D8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfj4Pwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+Pg/Cfj75cIixcbiAgXCLwn4+D8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfj4Pwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+Pg/Cfj79cIixcbiAgXCLwn4+D4oCN4pmA77iPXCIsXG4gIFwi8J+Pg+KAjeKZgu+4j1wiLFxuICBcIvCfj4NcIixcbiAgXCLwn4+E8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfj4Twn4+74oCN4pmC77iPXCIsXG4gIFwi8J+PhPCfj7tcIixcbiAgXCLwn4+E8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfj4Twn4+84oCN4pmC77iPXCIsXG4gIFwi8J+PhPCfj7xcIixcbiAgXCLwn4+E8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfj4Twn4+94oCN4pmC77iPXCIsXG4gIFwi8J+PhPCfj71cIixcbiAgXCLwn4+E8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfj4Twn4++4oCN4pmC77iPXCIsXG4gIFwi8J+PhPCfj75cIixcbiAgXCLwn4+E8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfj4Twn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+PhPCfj79cIixcbiAgXCLwn4+E4oCN4pmA77iPXCIsXG4gIFwi8J+PhOKAjeKZgu+4j1wiLFxuICBcIvCfj4RcIixcbiAgXCLwn4+FXCIsXG4gIFwi8J+PhlwiLFxuICBcIvCfj4fwn4+7XCIsXG4gIFwi8J+Ph/Cfj7xcIixcbiAgXCLwn4+H8J+PvVwiLFxuICBcIvCfj4fwn4++XCIsXG4gIFwi8J+Ph/Cfj79cIixcbiAgXCLwn4+HXCIsXG4gIFwi8J+PiFwiLFxuICBcIvCfj4lcIixcbiAgXCLwn4+K8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfj4rwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+PivCfj7tcIixcbiAgXCLwn4+K8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfj4rwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+PivCfj7xcIixcbiAgXCLwn4+K8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfj4rwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+PivCfj71cIixcbiAgXCLwn4+K8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfj4rwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+PivCfj75cIixcbiAgXCLwn4+K8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfj4rwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+PivCfj79cIixcbiAgXCLwn4+K4oCN4pmA77iPXCIsXG4gIFwi8J+PiuKAjeKZgu+4j1wiLFxuICBcIvCfj4pcIixcbiAgXCLwn4+L8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfj4vwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+Pi/Cfj7tcIixcbiAgXCLwn4+L8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfj4vwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+Pi/Cfj7xcIixcbiAgXCLwn4+L8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfj4vwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+Pi/Cfj71cIixcbiAgXCLwn4+L8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfj4vwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+Pi/Cfj75cIixcbiAgXCLwn4+L8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfj4vwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+Pi/Cfj79cIixcbiAgXCLwn4+L77iP4oCN4pmA77iPXCIsXG4gIFwi8J+Pi++4j+KAjeKZgu+4j1wiLFxuICBcIvCfj4tcIixcbiAgXCLwn4+M8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfj4zwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+PjPCfj7tcIixcbiAgXCLwn4+M8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfj4zwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+PjPCfj7xcIixcbiAgXCLwn4+M8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfj4zwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+PjPCfj71cIixcbiAgXCLwn4+M8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfj4zwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+PjPCfj75cIixcbiAgXCLwn4+M8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfj4zwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+PjPCfj79cIixcbiAgXCLwn4+M77iP4oCN4pmA77iPXCIsXG4gIFwi8J+PjO+4j+KAjeKZgu+4j1wiLFxuICBcIvCfj4xcIixcbiAgXCLwn4+NXCIsXG4gIFwi8J+PjlwiLFxuICBcIvCfj49cIixcbiAgXCLwn4+QXCIsXG4gIFwi8J+PkVwiLFxuICBcIvCfj5JcIixcbiAgXCLwn4+TXCIsXG4gIFwi8J+PlFwiLFxuICBcIvCfj5VcIixcbiAgXCLwn4+WXCIsXG4gIFwi8J+Pl1wiLFxuICBcIvCfj5hcIixcbiAgXCLwn4+ZXCIsXG4gIFwi8J+PmlwiLFxuICBcIvCfj5tcIixcbiAgXCLwn4+cXCIsXG4gIFwi8J+PnVwiLFxuICBcIvCfj55cIixcbiAgXCLwn4+fXCIsXG4gIFwi8J+PoFwiLFxuICBcIvCfj6FcIixcbiAgXCLwn4+iXCIsXG4gIFwi8J+Po1wiLFxuICBcIvCfj6RcIixcbiAgXCLwn4+lXCIsXG4gIFwi8J+PplwiLFxuICBcIvCfj6dcIixcbiAgXCLwn4+oXCIsXG4gIFwi8J+PqVwiLFxuICBcIvCfj6pcIixcbiAgXCLwn4+rXCIsXG4gIFwi8J+PrFwiLFxuICBcIvCfj61cIixcbiAgXCLwn4+uXCIsXG4gIFwi8J+Pr1wiLFxuICBcIvCfj7BcIixcbiAgXCLwn4+z77iP4oCN8J+MiFwiLFxuICBcIvCfj7NcIixcbiAgXCLwn4+04oCN4pig77iPXCIsXG4gIFwi8J+PtFwiLFxuICBcIvCfj7VcIixcbiAgXCLwn4+3XCIsXG4gIFwi8J+PuFwiLFxuICBcIvCfj7lcIixcbiAgXCLwn4+6XCIsXG4gIFwi8J+Pu1wiLFxuICBcIvCfj7xcIixcbiAgXCLwn4+9XCIsXG4gIFwi8J+PvlwiLFxuICBcIvCfj79cIixcbiAgXCLwn5CAXCIsXG4gIFwi8J+QgVwiLFxuICBcIvCfkIJcIixcbiAgXCLwn5CDXCIsXG4gIFwi8J+QhFwiLFxuICBcIvCfkIVcIixcbiAgXCLwn5CGXCIsXG4gIFwi8J+Qh1wiLFxuICBcIvCfkIhcIixcbiAgXCLwn5CJXCIsXG4gIFwi8J+QilwiLFxuICBcIvCfkItcIixcbiAgXCLwn5CMXCIsXG4gIFwi8J+QjVwiLFxuICBcIvCfkI5cIixcbiAgXCLwn5CPXCIsXG4gIFwi8J+QkFwiLFxuICBcIvCfkJFcIixcbiAgXCLwn5CSXCIsXG4gIFwi8J+Qk1wiLFxuICBcIvCfkJRcIixcbiAgXCLwn5CVXCIsXG4gIFwi8J+QllwiLFxuICBcIvCfkJdcIixcbiAgXCLwn5CYXCIsXG4gIFwi8J+QmVwiLFxuICBcIvCfkJpcIixcbiAgXCLwn5CbXCIsXG4gIFwi8J+QnFwiLFxuICBcIvCfkJ1cIixcbiAgXCLwn5CeXCIsXG4gIFwi8J+Qn1wiLFxuICBcIvCfkKBcIixcbiAgXCLwn5ChXCIsXG4gIFwi8J+QolwiLFxuICBcIvCfkKNcIixcbiAgXCLwn5CkXCIsXG4gIFwi8J+QpVwiLFxuICBcIvCfkKZcIixcbiAgXCLwn5CnXCIsXG4gIFwi8J+QqFwiLFxuICBcIvCfkKlcIixcbiAgXCLwn5CqXCIsXG4gIFwi8J+Qq1wiLFxuICBcIvCfkKxcIixcbiAgXCLwn5CtXCIsXG4gIFwi8J+QrlwiLFxuICBcIvCfkK9cIixcbiAgXCLwn5CwXCIsXG4gIFwi8J+QsVwiLFxuICBcIvCfkLJcIixcbiAgXCLwn5CzXCIsXG4gIFwi8J+QtFwiLFxuICBcIvCfkLVcIixcbiAgXCLwn5C2XCIsXG4gIFwi8J+Qt1wiLFxuICBcIvCfkLhcIixcbiAgXCLwn5C5XCIsXG4gIFwi8J+QulwiLFxuICBcIvCfkLtcIixcbiAgXCLwn5C8XCIsXG4gIFwi8J+QvVwiLFxuICBcIvCfkL5cIixcbiAgXCLwn5C/XCIsXG4gIFwi8J+RgFwiLFxuICBcIvCfkYHigI3wn5eoXCIsXG4gIFwi8J+RgVwiLFxuICBcIvCfkYLwn4+7XCIsXG4gIFwi8J+RgvCfj7xcIixcbiAgXCLwn5GC8J+PvVwiLFxuICBcIvCfkYLwn4++XCIsXG4gIFwi8J+RgvCfj79cIixcbiAgXCLwn5GCXCIsXG4gIFwi8J+Rg/Cfj7tcIixcbiAgXCLwn5GD8J+PvFwiLFxuICBcIvCfkYPwn4+9XCIsXG4gIFwi8J+Rg/Cfj75cIixcbiAgXCLwn5GD8J+Pv1wiLFxuICBcIvCfkYNcIixcbiAgXCLwn5GEXCIsXG4gIFwi8J+RhVwiLFxuICBcIvCfkYbwn4+7XCIsXG4gIFwi8J+RhvCfj7xcIixcbiAgXCLwn5GG8J+PvVwiLFxuICBcIvCfkYbwn4++XCIsXG4gIFwi8J+RhvCfj79cIixcbiAgXCLwn5GGXCIsXG4gIFwi8J+Rh/Cfj7tcIixcbiAgXCLwn5GH8J+PvFwiLFxuICBcIvCfkYfwn4+9XCIsXG4gIFwi8J+Rh/Cfj75cIixcbiAgXCLwn5GH8J+Pv1wiLFxuICBcIvCfkYdcIixcbiAgXCLwn5GI8J+Pu1wiLFxuICBcIvCfkYjwn4+8XCIsXG4gIFwi8J+RiPCfj71cIixcbiAgXCLwn5GI8J+PvlwiLFxuICBcIvCfkYjwn4+/XCIsXG4gIFwi8J+RiFwiLFxuICBcIvCfkYnwn4+7XCIsXG4gIFwi8J+RifCfj7xcIixcbiAgXCLwn5GJ8J+PvVwiLFxuICBcIvCfkYnwn4++XCIsXG4gIFwi8J+RifCfj79cIixcbiAgXCLwn5GJXCIsXG4gIFwi8J+RivCfj7tcIixcbiAgXCLwn5GK8J+PvFwiLFxuICBcIvCfkYrwn4+9XCIsXG4gIFwi8J+RivCfj75cIixcbiAgXCLwn5GK8J+Pv1wiLFxuICBcIvCfkYpcIixcbiAgXCLwn5GL8J+Pu1wiLFxuICBcIvCfkYvwn4+8XCIsXG4gIFwi8J+Ri/Cfj71cIixcbiAgXCLwn5GL8J+PvlwiLFxuICBcIvCfkYvwn4+/XCIsXG4gIFwi8J+Ri1wiLFxuICBcIvCfkYzwn4+7XCIsXG4gIFwi8J+RjPCfj7xcIixcbiAgXCLwn5GM8J+PvVwiLFxuICBcIvCfkYzwn4++XCIsXG4gIFwi8J+RjPCfj79cIixcbiAgXCLwn5GMXCIsXG4gIFwi8J+RjfCfj7tcIixcbiAgXCLwn5GN8J+PvFwiLFxuICBcIvCfkY3wn4+9XCIsXG4gIFwi8J+RjfCfj75cIixcbiAgXCLwn5GN8J+Pv1wiLFxuICBcIvCfkY1cIixcbiAgXCLwn5GO8J+Pu1wiLFxuICBcIvCfkY7wn4+8XCIsXG4gIFwi8J+RjvCfj71cIixcbiAgXCLwn5GO8J+PvlwiLFxuICBcIvCfkY7wn4+/XCIsXG4gIFwi8J+RjlwiLFxuICBcIvCfkY/wn4+7XCIsXG4gIFwi8J+Rj/Cfj7xcIixcbiAgXCLwn5GP8J+PvVwiLFxuICBcIvCfkY/wn4++XCIsXG4gIFwi8J+Rj/Cfj79cIixcbiAgXCLwn5GPXCIsXG4gIFwi8J+RkPCfj7tcIixcbiAgXCLwn5GQ8J+PvFwiLFxuICBcIvCfkZDwn4+9XCIsXG4gIFwi8J+RkPCfj75cIixcbiAgXCLwn5GQ8J+Pv1wiLFxuICBcIvCfkZBcIixcbiAgXCLwn5GRXCIsXG4gIFwi8J+RklwiLFxuICBcIvCfkZNcIixcbiAgXCLwn5GUXCIsXG4gIFwi8J+RlVwiLFxuICBcIvCfkZZcIixcbiAgXCLwn5GXXCIsXG4gIFwi8J+RmFwiLFxuICBcIvCfkZlcIixcbiAgXCLwn5GaXCIsXG4gIFwi8J+Rm1wiLFxuICBcIvCfkZxcIixcbiAgXCLwn5GdXCIsXG4gIFwi8J+RnlwiLFxuICBcIvCfkZ9cIixcbiAgXCLwn5GgXCIsXG4gIFwi8J+RoVwiLFxuICBcIvCfkaJcIixcbiAgXCLwn5GjXCIsXG4gIFwi8J+RpFwiLFxuICBcIvCfkaVcIixcbiAgXCLwn5Gm8J+Pu1wiLFxuICBcIvCfkabwn4+8XCIsXG4gIFwi8J+RpvCfj71cIixcbiAgXCLwn5Gm8J+PvlwiLFxuICBcIvCfkabwn4+/XCIsXG4gIFwi8J+RplwiLFxuICBcIvCfkafwn4+7XCIsXG4gIFwi8J+Rp/Cfj7xcIixcbiAgXCLwn5Gn8J+PvVwiLFxuICBcIvCfkafwn4++XCIsXG4gIFwi8J+Rp/Cfj79cIixcbiAgXCLwn5GnXCIsXG4gIFwi8J+RqPCfj7vigI3wn4y+XCIsXG4gIFwi8J+RqPCfj7vigI3wn42zXCIsXG4gIFwi8J+RqPCfj7vigI3wn46TXCIsXG4gIFwi8J+RqPCfj7vigI3wn46kXCIsXG4gIFwi8J+RqPCfj7vigI3wn46oXCIsXG4gIFwi8J+RqPCfj7vigI3wn4+rXCIsXG4gIFwi8J+RqPCfj7vigI3wn4+tXCIsXG4gIFwi8J+RqPCfj7vigI3wn5K7XCIsXG4gIFwi8J+RqPCfj7vigI3wn5K8XCIsXG4gIFwi8J+RqPCfj7vigI3wn5SnXCIsXG4gIFwi8J+RqPCfj7vigI3wn5SsXCIsXG4gIFwi8J+RqPCfj7vigI3wn5qAXCIsXG4gIFwi8J+RqPCfj7vigI3wn5qSXCIsXG4gIFwi8J+RqPCfj7vigI3impXvuI9cIixcbiAgXCLwn5Go8J+Pu+KAjeKalu+4j1wiLFxuICBcIvCfkajwn4+74oCN4pyI77iPXCIsXG4gIFwi8J+RqPCfj7tcIixcbiAgXCLwn5Go8J+PvOKAjfCfjL5cIixcbiAgXCLwn5Go8J+PvOKAjfCfjbNcIixcbiAgXCLwn5Go8J+PvOKAjfCfjpNcIixcbiAgXCLwn5Go8J+PvOKAjfCfjqRcIixcbiAgXCLwn5Go8J+PvOKAjfCfjqhcIixcbiAgXCLwn5Go8J+PvOKAjfCfj6tcIixcbiAgXCLwn5Go8J+PvOKAjfCfj61cIixcbiAgXCLwn5Go8J+PvOKAjfCfkrtcIixcbiAgXCLwn5Go8J+PvOKAjfCfkrxcIixcbiAgXCLwn5Go8J+PvOKAjfCflKdcIixcbiAgXCLwn5Go8J+PvOKAjfCflKxcIixcbiAgXCLwn5Go8J+PvOKAjfCfmoBcIixcbiAgXCLwn5Go8J+PvOKAjfCfmpJcIixcbiAgXCLwn5Go8J+PvOKAjeKale+4j1wiLFxuICBcIvCfkajwn4+84oCN4pqW77iPXCIsXG4gIFwi8J+RqPCfj7zigI3inIjvuI9cIixcbiAgXCLwn5Go8J+PvFwiLFxuICBcIvCfkajwn4+94oCN8J+MvlwiLFxuICBcIvCfkajwn4+94oCN8J+Ns1wiLFxuICBcIvCfkajwn4+94oCN8J+Ok1wiLFxuICBcIvCfkajwn4+94oCN8J+OpFwiLFxuICBcIvCfkajwn4+94oCN8J+OqFwiLFxuICBcIvCfkajwn4+94oCN8J+Pq1wiLFxuICBcIvCfkajwn4+94oCN8J+PrVwiLFxuICBcIvCfkajwn4+94oCN8J+Su1wiLFxuICBcIvCfkajwn4+94oCN8J+SvFwiLFxuICBcIvCfkajwn4+94oCN8J+Up1wiLFxuICBcIvCfkajwn4+94oCN8J+UrFwiLFxuICBcIvCfkajwn4+94oCN8J+agFwiLFxuICBcIvCfkajwn4+94oCN8J+aklwiLFxuICBcIvCfkajwn4+94oCN4pqV77iPXCIsXG4gIFwi8J+RqPCfj73igI3impbvuI9cIixcbiAgXCLwn5Go8J+PveKAjeKciO+4j1wiLFxuICBcIvCfkajwn4+9XCIsXG4gIFwi8J+RqPCfj77igI3wn4y+XCIsXG4gIFwi8J+RqPCfj77igI3wn42zXCIsXG4gIFwi8J+RqPCfj77igI3wn46TXCIsXG4gIFwi8J+RqPCfj77igI3wn46kXCIsXG4gIFwi8J+RqPCfj77igI3wn46oXCIsXG4gIFwi8J+RqPCfj77igI3wn4+rXCIsXG4gIFwi8J+RqPCfj77igI3wn4+tXCIsXG4gIFwi8J+RqPCfj77igI3wn5K7XCIsXG4gIFwi8J+RqPCfj77igI3wn5K8XCIsXG4gIFwi8J+RqPCfj77igI3wn5SnXCIsXG4gIFwi8J+RqPCfj77igI3wn5SsXCIsXG4gIFwi8J+RqPCfj77igI3wn5qAXCIsXG4gIFwi8J+RqPCfj77igI3wn5qSXCIsXG4gIFwi8J+RqPCfj77igI3impXvuI9cIixcbiAgXCLwn5Go8J+PvuKAjeKalu+4j1wiLFxuICBcIvCfkajwn4++4oCN4pyI77iPXCIsXG4gIFwi8J+RqPCfj75cIixcbiAgXCLwn5Go8J+Pv+KAjfCfjL5cIixcbiAgXCLwn5Go8J+Pv+KAjfCfjbNcIixcbiAgXCLwn5Go8J+Pv+KAjfCfjpNcIixcbiAgXCLwn5Go8J+Pv+KAjfCfjqRcIixcbiAgXCLwn5Go8J+Pv+KAjfCfjqhcIixcbiAgXCLwn5Go8J+Pv+KAjfCfj6tcIixcbiAgXCLwn5Go8J+Pv+KAjfCfj61cIixcbiAgXCLwn5Go8J+Pv+KAjfCfkrtcIixcbiAgXCLwn5Go8J+Pv+KAjfCfkrxcIixcbiAgXCLwn5Go8J+Pv+KAjfCflKdcIixcbiAgXCLwn5Go8J+Pv+KAjfCflKxcIixcbiAgXCLwn5Go8J+Pv+KAjfCfmoBcIixcbiAgXCLwn5Go8J+Pv+KAjfCfmpJcIixcbiAgXCLwn5Go8J+Pv+KAjeKale+4j1wiLFxuICBcIvCfkajwn4+/4oCN4pqW77iPXCIsXG4gIFwi8J+RqPCfj7/igI3inIjvuI9cIixcbiAgXCLwn5Go8J+Pv1wiLFxuICBcIvCfkajigI3wn4y+XCIsXG4gIFwi8J+RqOKAjfCfjbNcIixcbiAgXCLwn5Go4oCN8J+Ok1wiLFxuICBcIvCfkajigI3wn46kXCIsXG4gIFwi8J+RqOKAjfCfjqhcIixcbiAgXCLwn5Go4oCN8J+Pq1wiLFxuICBcIvCfkajigI3wn4+tXCIsXG4gIFwi8J+RqOKAjfCfkabigI3wn5GmXCIsXG4gIFwi8J+RqOKAjfCfkaZcIixcbiAgXCLwn5Go4oCN8J+Rp+KAjfCfkaZcIixcbiAgXCLwn5Go4oCN8J+Rp+KAjfCfkadcIixcbiAgXCLwn5Go4oCN8J+Rp1wiLFxuICBcIvCfkajigI3wn5Go4oCN8J+RpuKAjfCfkaZcIixcbiAgXCLwn5Go4oCN8J+RqOKAjfCfkaZcIixcbiAgXCLwn5Go4oCN8J+RqOKAjfCfkafigI3wn5GmXCIsXG4gIFwi8J+RqOKAjfCfkajigI3wn5Gn4oCN8J+Rp1wiLFxuICBcIvCfkajigI3wn5Go4oCN8J+Rp1wiLFxuICBcIvCfkajigI3wn5Gp4oCN8J+RpuKAjfCfkaZcIixcbiAgXCLwn5Go4oCN8J+RqeKAjfCfkaZcIixcbiAgXCLwn5Go4oCN8J+RqeKAjfCfkafigI3wn5GmXCIsXG4gIFwi8J+RqOKAjfCfkanigI3wn5Gn4oCN8J+Rp1wiLFxuICBcIvCfkajigI3wn5Gp4oCN8J+Rp1wiLFxuICBcIvCfkajigI3wn5K7XCIsXG4gIFwi8J+RqOKAjfCfkrxcIixcbiAgXCLwn5Go4oCN8J+Up1wiLFxuICBcIvCfkajigI3wn5SsXCIsXG4gIFwi8J+RqOKAjfCfmoBcIixcbiAgXCLwn5Go4oCN8J+aklwiLFxuICBcIvCfkajigI3impXvuI9cIixcbiAgXCLwn5Go4oCN4pqW77iPXCIsXG4gIFwi8J+RqOKAjeKciO+4j1wiLFxuICBcIvCfkajigI3inaTvuI/igI3wn5GoXCIsXG4gIFwi8J+RqOKAjeKdpO+4j+KAjfCfkovigI3wn5GoXCIsXG4gIFwi8J+RqFwiLFxuICBcIvCfkanwn4+74oCN8J+MvlwiLFxuICBcIvCfkanwn4+74oCN8J+Ns1wiLFxuICBcIvCfkanwn4+74oCN8J+Ok1wiLFxuICBcIvCfkanwn4+74oCN8J+OpFwiLFxuICBcIvCfkanwn4+74oCN8J+OqFwiLFxuICBcIvCfkanwn4+74oCN8J+Pq1wiLFxuICBcIvCfkanwn4+74oCN8J+PrVwiLFxuICBcIvCfkanwn4+74oCN8J+Su1wiLFxuICBcIvCfkanwn4+74oCN8J+SvFwiLFxuICBcIvCfkanwn4+74oCN8J+Up1wiLFxuICBcIvCfkanwn4+74oCN8J+UrFwiLFxuICBcIvCfkanwn4+74oCN8J+agFwiLFxuICBcIvCfkanwn4+74oCN8J+aklwiLFxuICBcIvCfkanwn4+74oCN4pqV77iPXCIsXG4gIFwi8J+RqfCfj7vigI3impbvuI9cIixcbiAgXCLwn5Gp8J+Pu+KAjeKciO+4j1wiLFxuICBcIvCfkanwn4+7XCIsXG4gIFwi8J+RqfCfj7zigI3wn4y+XCIsXG4gIFwi8J+RqfCfj7zigI3wn42zXCIsXG4gIFwi8J+RqfCfj7zigI3wn46TXCIsXG4gIFwi8J+RqfCfj7zigI3wn46kXCIsXG4gIFwi8J+RqfCfj7zigI3wn46oXCIsXG4gIFwi8J+RqfCfj7zigI3wn4+rXCIsXG4gIFwi8J+RqfCfj7zigI3wn4+tXCIsXG4gIFwi8J+RqfCfj7zigI3wn5K7XCIsXG4gIFwi8J+RqfCfj7zigI3wn5K8XCIsXG4gIFwi8J+RqfCfj7zigI3wn5SnXCIsXG4gIFwi8J+RqfCfj7zigI3wn5SsXCIsXG4gIFwi8J+RqfCfj7zigI3wn5qAXCIsXG4gIFwi8J+RqfCfj7zigI3wn5qSXCIsXG4gIFwi8J+RqfCfj7zigI3impXvuI9cIixcbiAgXCLwn5Gp8J+PvOKAjeKalu+4j1wiLFxuICBcIvCfkanwn4+84oCN4pyI77iPXCIsXG4gIFwi8J+RqfCfj7xcIixcbiAgXCLwn5Gp8J+PveKAjfCfjL5cIixcbiAgXCLwn5Gp8J+PveKAjfCfjbNcIixcbiAgXCLwn5Gp8J+PveKAjfCfjpNcIixcbiAgXCLwn5Gp8J+PveKAjfCfjqRcIixcbiAgXCLwn5Gp8J+PveKAjfCfjqhcIixcbiAgXCLwn5Gp8J+PveKAjfCfj6tcIixcbiAgXCLwn5Gp8J+PveKAjfCfj61cIixcbiAgXCLwn5Gp8J+PveKAjfCfkrtcIixcbiAgXCLwn5Gp8J+PveKAjfCfkrxcIixcbiAgXCLwn5Gp8J+PveKAjfCflKdcIixcbiAgXCLwn5Gp8J+PveKAjfCflKxcIixcbiAgXCLwn5Gp8J+PveKAjfCfmoBcIixcbiAgXCLwn5Gp8J+PveKAjfCfmpJcIixcbiAgXCLwn5Gp8J+PveKAjeKale+4j1wiLFxuICBcIvCfkanwn4+94oCN4pqW77iPXCIsXG4gIFwi8J+RqfCfj73igI3inIjvuI9cIixcbiAgXCLwn5Gp8J+PvVwiLFxuICBcIvCfkanwn4++4oCN8J+MvlwiLFxuICBcIvCfkanwn4++4oCN8J+Ns1wiLFxuICBcIvCfkanwn4++4oCN8J+Ok1wiLFxuICBcIvCfkanwn4++4oCN8J+OpFwiLFxuICBcIvCfkanwn4++4oCN8J+OqFwiLFxuICBcIvCfkanwn4++4oCN8J+Pq1wiLFxuICBcIvCfkanwn4++4oCN8J+PrVwiLFxuICBcIvCfkanwn4++4oCN8J+Su1wiLFxuICBcIvCfkanwn4++4oCN8J+SvFwiLFxuICBcIvCfkanwn4++4oCN8J+Up1wiLFxuICBcIvCfkanwn4++4oCN8J+UrFwiLFxuICBcIvCfkanwn4++4oCN8J+agFwiLFxuICBcIvCfkanwn4++4oCN8J+aklwiLFxuICBcIvCfkanwn4++4oCN4pqV77iPXCIsXG4gIFwi8J+RqfCfj77igI3impbvuI9cIixcbiAgXCLwn5Gp8J+PvuKAjeKciO+4j1wiLFxuICBcIvCfkanwn4++XCIsXG4gIFwi8J+RqfCfj7/igI3wn4y+XCIsXG4gIFwi8J+RqfCfj7/igI3wn42zXCIsXG4gIFwi8J+RqfCfj7/igI3wn46TXCIsXG4gIFwi8J+RqfCfj7/igI3wn46kXCIsXG4gIFwi8J+RqfCfj7/igI3wn46oXCIsXG4gIFwi8J+RqfCfj7/igI3wn4+rXCIsXG4gIFwi8J+RqfCfj7/igI3wn4+tXCIsXG4gIFwi8J+RqfCfj7/igI3wn5K7XCIsXG4gIFwi8J+RqfCfj7/igI3wn5K8XCIsXG4gIFwi8J+RqfCfj7/igI3wn5SnXCIsXG4gIFwi8J+RqfCfj7/igI3wn5SsXCIsXG4gIFwi8J+RqfCfj7/igI3wn5qAXCIsXG4gIFwi8J+RqfCfj7/igI3wn5qSXCIsXG4gIFwi8J+RqfCfj7/igI3impXvuI9cIixcbiAgXCLwn5Gp8J+Pv+KAjeKalu+4j1wiLFxuICBcIvCfkanwn4+/4oCN4pyI77iPXCIsXG4gIFwi8J+RqfCfj79cIixcbiAgXCLwn5Gp4oCN8J+MvlwiLFxuICBcIvCfkanigI3wn42zXCIsXG4gIFwi8J+RqeKAjfCfjpNcIixcbiAgXCLwn5Gp4oCN8J+OpFwiLFxuICBcIvCfkanigI3wn46oXCIsXG4gIFwi8J+RqeKAjfCfj6tcIixcbiAgXCLwn5Gp4oCN8J+PrVwiLFxuICBcIvCfkanigI3wn5Gm4oCN8J+RplwiLFxuICBcIvCfkanigI3wn5GmXCIsXG4gIFwi8J+RqeKAjfCfkafigI3wn5GmXCIsXG4gIFwi8J+RqeKAjfCfkafigI3wn5GnXCIsXG4gIFwi8J+RqeKAjfCfkadcIixcbiAgXCLwn5Gp4oCN8J+RqeKAjfCfkabigI3wn5GmXCIsXG4gIFwi8J+RqeKAjfCfkanigI3wn5GmXCIsXG4gIFwi8J+RqeKAjfCfkanigI3wn5Gn4oCN8J+RplwiLFxuICBcIvCfkanigI3wn5Gp4oCN8J+Rp+KAjfCfkadcIixcbiAgXCLwn5Gp4oCN8J+RqeKAjfCfkadcIixcbiAgXCLwn5Gp4oCN8J+Su1wiLFxuICBcIvCfkanigI3wn5K8XCIsXG4gIFwi8J+RqeKAjfCflKdcIixcbiAgXCLwn5Gp4oCN8J+UrFwiLFxuICBcIvCfkanigI3wn5qAXCIsXG4gIFwi8J+RqeKAjfCfmpJcIixcbiAgXCLwn5Gp4oCN4pqV77iPXCIsXG4gIFwi8J+RqeKAjeKalu+4j1wiLFxuICBcIvCfkanigI3inIjvuI9cIixcbiAgXCLwn5Gp4oCN4p2k77iP4oCN8J+RqFwiLFxuICBcIvCfkanigI3inaTvuI/igI3wn5GpXCIsXG4gIFwi8J+RqeKAjeKdpO+4j+KAjfCfkovigI3wn5GoXCIsXG4gIFwi8J+RqeKAjeKdpO+4j+KAjfCfkovigI3wn5GpXCIsXG4gIFwi8J+RqVwiLFxuICBcIvCfkarwn4+7XCIsXG4gIFwi8J+RqvCfj7xcIixcbiAgXCLwn5Gq8J+PvVwiLFxuICBcIvCfkarwn4++XCIsXG4gIFwi8J+RqvCfj79cIixcbiAgXCLwn5GqXCIsXG4gIFwi8J+Rq/Cfj7tcIixcbiAgXCLwn5Gr8J+PvFwiLFxuICBcIvCfkavwn4+9XCIsXG4gIFwi8J+Rq/Cfj75cIixcbiAgXCLwn5Gr8J+Pv1wiLFxuICBcIvCfkatcIixcbiAgXCLwn5Gs8J+Pu1wiLFxuICBcIvCfkazwn4+8XCIsXG4gIFwi8J+RrPCfj71cIixcbiAgXCLwn5Gs8J+PvlwiLFxuICBcIvCfkazwn4+/XCIsXG4gIFwi8J+RrFwiLFxuICBcIvCfka3wn4+7XCIsXG4gIFwi8J+RrfCfj7xcIixcbiAgXCLwn5Gt8J+PvVwiLFxuICBcIvCfka3wn4++XCIsXG4gIFwi8J+RrfCfj79cIixcbiAgXCLwn5GtXCIsXG4gIFwi8J+RrvCfj7vigI3imYDvuI9cIixcbiAgXCLwn5Gu8J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfka7wn4+7XCIsXG4gIFwi8J+RrvCfj7zigI3imYDvuI9cIixcbiAgXCLwn5Gu8J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfka7wn4+8XCIsXG4gIFwi8J+RrvCfj73igI3imYDvuI9cIixcbiAgXCLwn5Gu8J+PveKAjeKZgu+4j1wiLFxuICBcIvCfka7wn4+9XCIsXG4gIFwi8J+RrvCfj77igI3imYDvuI9cIixcbiAgXCLwn5Gu8J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfka7wn4++XCIsXG4gIFwi8J+RrvCfj7/igI3imYDvuI9cIixcbiAgXCLwn5Gu8J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfka7wn4+/XCIsXG4gIFwi8J+RruKAjeKZgO+4j1wiLFxuICBcIvCfka7igI3imYLvuI9cIixcbiAgXCLwn5GuXCIsXG4gIFwi8J+Rr/Cfj7vigI3imYDvuI9cIixcbiAgXCLwn5Gv8J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfka/wn4+7XCIsXG4gIFwi8J+Rr/Cfj7zigI3imYDvuI9cIixcbiAgXCLwn5Gv8J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfka/wn4+8XCIsXG4gIFwi8J+Rr/Cfj73igI3imYDvuI9cIixcbiAgXCLwn5Gv8J+PveKAjeKZgu+4j1wiLFxuICBcIvCfka/wn4+9XCIsXG4gIFwi8J+Rr/Cfj77igI3imYDvuI9cIixcbiAgXCLwn5Gv8J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfka/wn4++XCIsXG4gIFwi8J+Rr/Cfj7/igI3imYDvuI9cIixcbiAgXCLwn5Gv8J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfka/wn4+/XCIsXG4gIFwi8J+Rr+KAjeKZgO+4j1wiLFxuICBcIvCfka/igI3imYLvuI9cIixcbiAgXCLwn5GvXCIsXG4gIFwi8J+RsPCfj7tcIixcbiAgXCLwn5Gw8J+PvFwiLFxuICBcIvCfkbDwn4+9XCIsXG4gIFwi8J+RsPCfj75cIixcbiAgXCLwn5Gw8J+Pv1wiLFxuICBcIvCfkbBcIixcbiAgXCLwn5Gx8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfkbHwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+RsfCfj7tcIixcbiAgXCLwn5Gx8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfkbHwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+RsfCfj7xcIixcbiAgXCLwn5Gx8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfkbHwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+RsfCfj71cIixcbiAgXCLwn5Gx8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfkbHwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+RsfCfj75cIixcbiAgXCLwn5Gx8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfkbHwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+RsfCfj79cIixcbiAgXCLwn5Gx4oCN4pmA77iPXCIsXG4gIFwi8J+RseKAjeKZgu+4j1wiLFxuICBcIvCfkbFcIixcbiAgXCLwn5Gy8J+Pu1wiLFxuICBcIvCfkbLwn4+8XCIsXG4gIFwi8J+RsvCfj71cIixcbiAgXCLwn5Gy8J+PvlwiLFxuICBcIvCfkbLwn4+/XCIsXG4gIFwi8J+RslwiLFxuICBcIvCfkbPwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+Rs/Cfj7vigI3imYLvuI9cIixcbiAgXCLwn5Gz8J+Pu1wiLFxuICBcIvCfkbPwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+Rs/Cfj7zigI3imYLvuI9cIixcbiAgXCLwn5Gz8J+PvFwiLFxuICBcIvCfkbPwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+Rs/Cfj73igI3imYLvuI9cIixcbiAgXCLwn5Gz8J+PvVwiLFxuICBcIvCfkbPwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+Rs/Cfj77igI3imYLvuI9cIixcbiAgXCLwn5Gz8J+PvlwiLFxuICBcIvCfkbPwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+Rs/Cfj7/igI3imYLvuI9cIixcbiAgXCLwn5Gz8J+Pv1wiLFxuICBcIvCfkbPigI3imYDvuI9cIixcbiAgXCLwn5Gz4oCN4pmC77iPXCIsXG4gIFwi8J+Rs1wiLFxuICBcIvCfkbTwn4+7XCIsXG4gIFwi8J+RtPCfj7xcIixcbiAgXCLwn5G08J+PvVwiLFxuICBcIvCfkbTwn4++XCIsXG4gIFwi8J+RtPCfj79cIixcbiAgXCLwn5G0XCIsXG4gIFwi8J+RtfCfj7tcIixcbiAgXCLwn5G18J+PvFwiLFxuICBcIvCfkbXwn4+9XCIsXG4gIFwi8J+RtfCfj75cIixcbiAgXCLwn5G18J+Pv1wiLFxuICBcIvCfkbVcIixcbiAgXCLwn5G28J+Pu1wiLFxuICBcIvCfkbbwn4+8XCIsXG4gIFwi8J+RtvCfj71cIixcbiAgXCLwn5G28J+PvlwiLFxuICBcIvCfkbbwn4+/XCIsXG4gIFwi8J+RtlwiLFxuICBcIvCfkbfwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+Rt/Cfj7vigI3imYLvuI9cIixcbiAgXCLwn5G38J+Pu1wiLFxuICBcIvCfkbfwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+Rt/Cfj7zigI3imYLvuI9cIixcbiAgXCLwn5G38J+PvFwiLFxuICBcIvCfkbfwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+Rt/Cfj73igI3imYLvuI9cIixcbiAgXCLwn5G38J+PvVwiLFxuICBcIvCfkbfwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+Rt/Cfj77igI3imYLvuI9cIixcbiAgXCLwn5G38J+PvlwiLFxuICBcIvCfkbfwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+Rt/Cfj7/igI3imYLvuI9cIixcbiAgXCLwn5G38J+Pv1wiLFxuICBcIvCfkbfigI3imYDvuI9cIixcbiAgXCLwn5G34oCN4pmC77iPXCIsXG4gIFwi8J+Rt1wiLFxuICBcIvCfkbjwn4+7XCIsXG4gIFwi8J+RuPCfj7xcIixcbiAgXCLwn5G48J+PvVwiLFxuICBcIvCfkbjwn4++XCIsXG4gIFwi8J+RuPCfj79cIixcbiAgXCLwn5G4XCIsXG4gIFwi8J+RuVwiLFxuICBcIvCfkbpcIixcbiAgXCLwn5G7XCIsXG4gIFwi8J+RvPCfj7tcIixcbiAgXCLwn5G88J+PvFwiLFxuICBcIvCfkbzwn4+9XCIsXG4gIFwi8J+RvPCfj75cIixcbiAgXCLwn5G88J+Pv1wiLFxuICBcIvCfkbxcIixcbiAgXCLwn5G9XCIsXG4gIFwi8J+RvlwiLFxuICBcIvCfkb9cIixcbiAgXCLwn5KAXCIsXG4gIFwi8J+SgfCfj7vigI3imYDvuI9cIixcbiAgXCLwn5KB8J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfkoHwn4+7XCIsXG4gIFwi8J+SgfCfj7zigI3imYDvuI9cIixcbiAgXCLwn5KB8J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfkoHwn4+8XCIsXG4gIFwi8J+SgfCfj73igI3imYDvuI9cIixcbiAgXCLwn5KB8J+PveKAjeKZgu+4j1wiLFxuICBcIvCfkoHwn4+9XCIsXG4gIFwi8J+SgfCfj77igI3imYDvuI9cIixcbiAgXCLwn5KB8J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfkoHwn4++XCIsXG4gIFwi8J+SgfCfj7/igI3imYDvuI9cIixcbiAgXCLwn5KB8J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfkoHwn4+/XCIsXG4gIFwi8J+SgeKAjeKZgO+4j1wiLFxuICBcIvCfkoHigI3imYLvuI9cIixcbiAgXCLwn5KBXCIsXG4gIFwi8J+SgvCfj7vigI3imYDvuI9cIixcbiAgXCLwn5KC8J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfkoLwn4+7XCIsXG4gIFwi8J+SgvCfj7zigI3imYDvuI9cIixcbiAgXCLwn5KC8J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfkoLwn4+8XCIsXG4gIFwi8J+SgvCfj73igI3imYDvuI9cIixcbiAgXCLwn5KC8J+PveKAjeKZgu+4j1wiLFxuICBcIvCfkoLwn4+9XCIsXG4gIFwi8J+SgvCfj77igI3imYDvuI9cIixcbiAgXCLwn5KC8J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfkoLwn4++XCIsXG4gIFwi8J+SgvCfj7/igI3imYDvuI9cIixcbiAgXCLwn5KC8J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfkoLwn4+/XCIsXG4gIFwi8J+SguKAjeKZgO+4j1wiLFxuICBcIvCfkoLigI3imYLvuI9cIixcbiAgXCLwn5KCXCIsXG4gIFwi8J+Sg/Cfj7tcIixcbiAgXCLwn5KD8J+PvFwiLFxuICBcIvCfkoPwn4+9XCIsXG4gIFwi8J+Sg/Cfj75cIixcbiAgXCLwn5KD8J+Pv1wiLFxuICBcIvCfkoNcIixcbiAgXCLwn5KEXCIsXG4gIFwi8J+ShfCfj7tcIixcbiAgXCLwn5KF8J+PvFwiLFxuICBcIvCfkoXwn4+9XCIsXG4gIFwi8J+ShfCfj75cIixcbiAgXCLwn5KF8J+Pv1wiLFxuICBcIvCfkoVcIixcbiAgXCLwn5KG8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfkobwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+ShvCfj7tcIixcbiAgXCLwn5KG8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfkobwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+ShvCfj7xcIixcbiAgXCLwn5KG8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfkobwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+ShvCfj71cIixcbiAgXCLwn5KG8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfkobwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+ShvCfj75cIixcbiAgXCLwn5KG8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfkobwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+ShvCfj79cIixcbiAgXCLwn5KG4oCN4pmA77iPXCIsXG4gIFwi8J+ShuKAjeKZgu+4j1wiLFxuICBcIvCfkoZcIixcbiAgXCLwn5KH8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfkofwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+Sh/Cfj7tcIixcbiAgXCLwn5KH8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfkofwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+Sh/Cfj7xcIixcbiAgXCLwn5KH8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfkofwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+Sh/Cfj71cIixcbiAgXCLwn5KH8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfkofwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+Sh/Cfj75cIixcbiAgXCLwn5KH8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfkofwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+Sh/Cfj79cIixcbiAgXCLwn5KH4oCN4pmA77iPXCIsXG4gIFwi8J+Sh+KAjeKZgu+4j1wiLFxuICBcIvCfkodcIixcbiAgXCLwn5KIXCIsXG4gIFwi8J+SiVwiLFxuICBcIvCfkopcIixcbiAgXCLwn5KLXCIsXG4gIFwi8J+SjFwiLFxuICBcIvCfko1cIixcbiAgXCLwn5KOXCIsXG4gIFwi8J+Sj1wiLFxuICBcIvCfkpBcIixcbiAgXCLwn5KRXCIsXG4gIFwi8J+SklwiLFxuICBcIvCfkpNcIixcbiAgXCLwn5KUXCIsXG4gIFwi8J+SlVwiLFxuICBcIvCfkpZcIixcbiAgXCLwn5KXXCIsXG4gIFwi8J+SmFwiLFxuICBcIvCfkplcIixcbiAgXCLwn5KaXCIsXG4gIFwi8J+Sm1wiLFxuICBcIvCfkpxcIixcbiAgXCLwn5KdXCIsXG4gIFwi8J+SnlwiLFxuICBcIvCfkp9cIixcbiAgXCLwn5KgXCIsXG4gIFwi8J+SoVwiLFxuICBcIvCfkqJcIixcbiAgXCLwn5KjXCIsXG4gIFwi8J+SpFwiLFxuICBcIvCfkqVcIixcbiAgXCLwn5KmXCIsXG4gIFwi8J+Sp1wiLFxuICBcIvCfkqhcIixcbiAgXCLwn5KpXCIsXG4gIFwi8J+SqvCfj7tcIixcbiAgXCLwn5Kq8J+PvFwiLFxuICBcIvCfkqrwn4+9XCIsXG4gIFwi8J+SqvCfj75cIixcbiAgXCLwn5Kq8J+Pv1wiLFxuICBcIvCfkqpcIixcbiAgXCLwn5KrXCIsXG4gIFwi8J+SrFwiLFxuICBcIvCfkq1cIixcbiAgXCLwn5KuXCIsXG4gIFwi8J+Sr1wiLFxuICBcIvCfkrBcIixcbiAgXCLwn5KxXCIsXG4gIFwi8J+SslwiLFxuICBcIvCfkrNcIixcbiAgXCLwn5K0XCIsXG4gIFwi8J+StVwiLFxuICBcIvCfkrZcIixcbiAgXCLwn5K3XCIsXG4gIFwi8J+SuFwiLFxuICBcIvCfkrlcIixcbiAgXCLwn5K6XCIsXG4gIFwi8J+Su1wiLFxuICBcIvCfkrxcIixcbiAgXCLwn5K9XCIsXG4gIFwi8J+SvlwiLFxuICBcIvCfkr9cIixcbiAgXCLwn5OAXCIsXG4gIFwi8J+TgVwiLFxuICBcIvCfk4JcIixcbiAgXCLwn5ODXCIsXG4gIFwi8J+ThFwiLFxuICBcIvCfk4VcIixcbiAgXCLwn5OGXCIsXG4gIFwi8J+Th1wiLFxuICBcIvCfk4hcIixcbiAgXCLwn5OJXCIsXG4gIFwi8J+TilwiLFxuICBcIvCfk4tcIixcbiAgXCLwn5OMXCIsXG4gIFwi8J+TjVwiLFxuICBcIvCfk45cIixcbiAgXCLwn5OPXCIsXG4gIFwi8J+TkFwiLFxuICBcIvCfk5FcIixcbiAgXCLwn5OSXCIsXG4gIFwi8J+Tk1wiLFxuICBcIvCfk5RcIixcbiAgXCLwn5OVXCIsXG4gIFwi8J+TllwiLFxuICBcIvCfk5dcIixcbiAgXCLwn5OYXCIsXG4gIFwi8J+TmVwiLFxuICBcIvCfk5pcIixcbiAgXCLwn5ObXCIsXG4gIFwi8J+TnFwiLFxuICBcIvCfk51cIixcbiAgXCLwn5OeXCIsXG4gIFwi8J+Tn1wiLFxuICBcIvCfk6BcIixcbiAgXCLwn5OhXCIsXG4gIFwi8J+TolwiLFxuICBcIvCfk6NcIixcbiAgXCLwn5OkXCIsXG4gIFwi8J+TpVwiLFxuICBcIvCfk6ZcIixcbiAgXCLwn5OnXCIsXG4gIFwi8J+TqFwiLFxuICBcIvCfk6lcIixcbiAgXCLwn5OqXCIsXG4gIFwi8J+Tq1wiLFxuICBcIvCfk6xcIixcbiAgXCLwn5OtXCIsXG4gIFwi8J+TrlwiLFxuICBcIvCfk69cIixcbiAgXCLwn5OwXCIsXG4gIFwi8J+TsVwiLFxuICBcIvCfk7JcIixcbiAgXCLwn5OzXCIsXG4gIFwi8J+TtFwiLFxuICBcIvCfk7VcIixcbiAgXCLwn5O2XCIsXG4gIFwi8J+Tt1wiLFxuICBcIvCfk7hcIixcbiAgXCLwn5O5XCIsXG4gIFwi8J+TulwiLFxuICBcIvCfk7tcIixcbiAgXCLwn5O8XCIsXG4gIFwi8J+TvVwiLFxuICBcIvCfk79cIixcbiAgXCLwn5SAXCIsXG4gIFwi8J+UgVwiLFxuICBcIvCflIJcIixcbiAgXCLwn5SDXCIsXG4gIFwi8J+UhFwiLFxuICBcIvCflIVcIixcbiAgXCLwn5SGXCIsXG4gIFwi8J+Uh1wiLFxuICBcIvCflIhcIixcbiAgXCLwn5SJXCIsXG4gIFwi8J+UilwiLFxuICBcIvCflItcIixcbiAgXCLwn5SMXCIsXG4gIFwi8J+UjVwiLFxuICBcIvCflI5cIixcbiAgXCLwn5SPXCIsXG4gIFwi8J+UkFwiLFxuICBcIvCflJFcIixcbiAgXCLwn5SSXCIsXG4gIFwi8J+Uk1wiLFxuICBcIvCflJRcIixcbiAgXCLwn5SVXCIsXG4gIFwi8J+UllwiLFxuICBcIvCflJdcIixcbiAgXCLwn5SYXCIsXG4gIFwi8J+UmVwiLFxuICBcIvCflJpcIixcbiAgXCLwn5SbXCIsXG4gIFwi8J+UnFwiLFxuICBcIvCflJ1cIixcbiAgXCLwn5SeXCIsXG4gIFwi8J+Un1wiLFxuICBcIvCflKBcIixcbiAgXCLwn5ShXCIsXG4gIFwi8J+UolwiLFxuICBcIvCflKNcIixcbiAgXCLwn5SkXCIsXG4gIFwi8J+UpVwiLFxuICBcIvCflKZcIixcbiAgXCLwn5SnXCIsXG4gIFwi8J+UqFwiLFxuICBcIvCflKlcIixcbiAgXCLwn5SqXCIsXG4gIFwi8J+Uq1wiLFxuICBcIvCflKxcIixcbiAgXCLwn5StXCIsXG4gIFwi8J+UrlwiLFxuICBcIvCflK9cIixcbiAgXCLwn5SwXCIsXG4gIFwi8J+UsVwiLFxuICBcIvCflLJcIixcbiAgXCLwn5SzXCIsXG4gIFwi8J+UtFwiLFxuICBcIvCflLVcIixcbiAgXCLwn5S2XCIsXG4gIFwi8J+Ut1wiLFxuICBcIvCflLhcIixcbiAgXCLwn5S5XCIsXG4gIFwi8J+UulwiLFxuICBcIvCflLtcIixcbiAgXCLwn5S8XCIsXG4gIFwi8J+UvVwiLFxuICBcIvCflYlcIixcbiAgXCLwn5WKXCIsXG4gIFwi8J+Vi1wiLFxuICBcIvCflYxcIixcbiAgXCLwn5WNXCIsXG4gIFwi8J+VjlwiLFxuICBcIvCflZBcIixcbiAgXCLwn5WRXCIsXG4gIFwi8J+VklwiLFxuICBcIvCflZNcIixcbiAgXCLwn5WUXCIsXG4gIFwi8J+VlVwiLFxuICBcIvCflZZcIixcbiAgXCLwn5WXXCIsXG4gIFwi8J+VmFwiLFxuICBcIvCflZlcIixcbiAgXCLwn5WaXCIsXG4gIFwi8J+Vm1wiLFxuICBcIvCflZxcIixcbiAgXCLwn5WdXCIsXG4gIFwi8J+VnlwiLFxuICBcIvCflZ9cIixcbiAgXCLwn5WgXCIsXG4gIFwi8J+VoVwiLFxuICBcIvCflaJcIixcbiAgXCLwn5WjXCIsXG4gIFwi8J+VpFwiLFxuICBcIvCflaVcIixcbiAgXCLwn5WmXCIsXG4gIFwi8J+Vp1wiLFxuICBcIvCfla9cIixcbiAgXCLwn5WwXCIsXG4gIFwi8J+Vs1wiLFxuICBcIvCflbTwn4+7XCIsXG4gIFwi8J+VtPCfj7xcIixcbiAgXCLwn5W08J+PvVwiLFxuICBcIvCflbTwn4++XCIsXG4gIFwi8J+VtPCfj79cIixcbiAgXCLwn5W0XCIsXG4gIFwi8J+VtfCfj7vigI3imYDvuI9cIixcbiAgXCLwn5W18J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCflbXwn4+7XCIsXG4gIFwi8J+VtfCfj7zigI3imYDvuI9cIixcbiAgXCLwn5W18J+PvOKAjeKZgu+4j1wiLFxuICBcIvCflbXwn4+8XCIsXG4gIFwi8J+VtfCfj73igI3imYDvuI9cIixcbiAgXCLwn5W18J+PveKAjeKZgu+4j1wiLFxuICBcIvCflbXwn4+9XCIsXG4gIFwi8J+VtfCfj77igI3imYDvuI9cIixcbiAgXCLwn5W18J+PvuKAjeKZgu+4j1wiLFxuICBcIvCflbXwn4++XCIsXG4gIFwi8J+VtfCfj7/igI3imYDvuI9cIixcbiAgXCLwn5W18J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCflbXwn4+/XCIsXG4gIFwi8J+Vte+4j+KAjeKZgO+4j1wiLFxuICBcIvCflbXvuI/igI3imYLvuI9cIixcbiAgXCLwn5W1XCIsXG4gIFwi8J+VtlwiLFxuICBcIvCflbdcIixcbiAgXCLwn5W4XCIsXG4gIFwi8J+VuVwiLFxuICBcIvCflbrwn4+7XCIsXG4gIFwi8J+VuvCfj7xcIixcbiAgXCLwn5W68J+PvVwiLFxuICBcIvCflbrwn4++XCIsXG4gIFwi8J+VuvCfj79cIixcbiAgXCLwn5W6XCIsXG4gIFwi8J+Wh1wiLFxuICBcIvCflopcIixcbiAgXCLwn5aLXCIsXG4gIFwi8J+WjFwiLFxuICBcIvCflo1cIixcbiAgXCLwn5aQ8J+Pu1wiLFxuICBcIvCflpDwn4+8XCIsXG4gIFwi8J+WkPCfj71cIixcbiAgXCLwn5aQ8J+PvlwiLFxuICBcIvCflpDwn4+/XCIsXG4gIFwi8J+WkFwiLFxuICBcIvCflpXwn4+7XCIsXG4gIFwi8J+WlfCfj7xcIixcbiAgXCLwn5aV8J+PvVwiLFxuICBcIvCflpXwn4++XCIsXG4gIFwi8J+WlfCfj79cIixcbiAgXCLwn5aVXCIsXG4gIFwi8J+WlvCfj7tcIixcbiAgXCLwn5aW8J+PvFwiLFxuICBcIvCflpbwn4+9XCIsXG4gIFwi8J+WlvCfj75cIixcbiAgXCLwn5aW8J+Pv1wiLFxuICBcIvCflpZcIixcbiAgXCLwn5akXCIsXG4gIFwi8J+WpVwiLFxuICBcIvCflqhcIixcbiAgXCLwn5axXCIsXG4gIFwi8J+WslwiLFxuICBcIvCflrxcIixcbiAgXCLwn5eCXCIsXG4gIFwi8J+Xg1wiLFxuICBcIvCfl4RcIixcbiAgXCLwn5eRXCIsXG4gIFwi8J+XklwiLFxuICBcIvCfl5NcIixcbiAgXCLwn5ecXCIsXG4gIFwi8J+XnVwiLFxuICBcIvCfl55cIixcbiAgXCLwn5ehXCIsXG4gIFwi8J+Xo1wiLFxuICBcIvCfl6hcIixcbiAgXCLwn5evXCIsXG4gIFwi8J+Xs1wiLFxuICBcIvCfl7pcIixcbiAgXCLwn5e7XCIsXG4gIFwi8J+XvFwiLFxuICBcIvCfl71cIixcbiAgXCLwn5e+XCIsXG4gIFwi8J+Xv1wiLFxuICBcIvCfmIBcIixcbiAgXCLwn5iBXCIsXG4gIFwi8J+YglwiLFxuICBcIvCfmINcIixcbiAgXCLwn5iEXCIsXG4gIFwi8J+YhVwiLFxuICBcIvCfmIZcIixcbiAgXCLwn5iHXCIsXG4gIFwi8J+YiFwiLFxuICBcIvCfmIlcIixcbiAgXCLwn5iKXCIsXG4gIFwi8J+Yi1wiLFxuICBcIvCfmIxcIixcbiAgXCLwn5iNXCIsXG4gIFwi8J+YjlwiLFxuICBcIvCfmI9cIixcbiAgXCLwn5iQXCIsXG4gIFwi8J+YkVwiLFxuICBcIvCfmJJcIixcbiAgXCLwn5iTXCIsXG4gIFwi8J+YlFwiLFxuICBcIvCfmJVcIixcbiAgXCLwn5iWXCIsXG4gIFwi8J+Yl1wiLFxuICBcIvCfmJhcIixcbiAgXCLwn5iZXCIsXG4gIFwi8J+YmlwiLFxuICBcIvCfmJtcIixcbiAgXCLwn5icXCIsXG4gIFwi8J+YnVwiLFxuICBcIvCfmJ5cIixcbiAgXCLwn5ifXCIsXG4gIFwi8J+YoFwiLFxuICBcIvCfmKFcIixcbiAgXCLwn5iiXCIsXG4gIFwi8J+Yo1wiLFxuICBcIvCfmKRcIixcbiAgXCLwn5ilXCIsXG4gIFwi8J+YplwiLFxuICBcIvCfmKdcIixcbiAgXCLwn5ioXCIsXG4gIFwi8J+YqVwiLFxuICBcIvCfmKpcIixcbiAgXCLwn5irXCIsXG4gIFwi8J+YrFwiLFxuICBcIvCfmK1cIixcbiAgXCLwn5iuXCIsXG4gIFwi8J+Yr1wiLFxuICBcIvCfmLBcIixcbiAgXCLwn5ixXCIsXG4gIFwi8J+YslwiLFxuICBcIvCfmLNcIixcbiAgXCLwn5i0XCIsXG4gIFwi8J+YtVwiLFxuICBcIvCfmLZcIixcbiAgXCLwn5i3XCIsXG4gIFwi8J+YuFwiLFxuICBcIvCfmLlcIixcbiAgXCLwn5i6XCIsXG4gIFwi8J+Yu1wiLFxuICBcIvCfmLxcIixcbiAgXCLwn5i9XCIsXG4gIFwi8J+YvlwiLFxuICBcIvCfmL9cIixcbiAgXCLwn5mAXCIsXG4gIFwi8J+ZgVwiLFxuICBcIvCfmYJcIixcbiAgXCLwn5mDXCIsXG4gIFwi8J+ZhFwiLFxuICBcIvCfmYXwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+ZhfCfj7vigI3imYLvuI9cIixcbiAgXCLwn5mF8J+Pu1wiLFxuICBcIvCfmYXwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+ZhfCfj7zigI3imYLvuI9cIixcbiAgXCLwn5mF8J+PvFwiLFxuICBcIvCfmYXwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+ZhfCfj73igI3imYLvuI9cIixcbiAgXCLwn5mF8J+PvVwiLFxuICBcIvCfmYXwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+ZhfCfj77igI3imYLvuI9cIixcbiAgXCLwn5mF8J+PvlwiLFxuICBcIvCfmYXwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+ZhfCfj7/igI3imYLvuI9cIixcbiAgXCLwn5mF8J+Pv1wiLFxuICBcIvCfmYXigI3imYDvuI9cIixcbiAgXCLwn5mF4oCN4pmC77iPXCIsXG4gIFwi8J+ZhVwiLFxuICBcIvCfmYbwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+ZhvCfj7vigI3imYLvuI9cIixcbiAgXCLwn5mG8J+Pu1wiLFxuICBcIvCfmYbwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+ZhvCfj7zigI3imYLvuI9cIixcbiAgXCLwn5mG8J+PvFwiLFxuICBcIvCfmYbwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+ZhvCfj73igI3imYLvuI9cIixcbiAgXCLwn5mG8J+PvVwiLFxuICBcIvCfmYbwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+ZhvCfj77igI3imYLvuI9cIixcbiAgXCLwn5mG8J+PvlwiLFxuICBcIvCfmYbwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+ZhvCfj7/igI3imYLvuI9cIixcbiAgXCLwn5mG8J+Pv1wiLFxuICBcIvCfmYbigI3imYDvuI9cIixcbiAgXCLwn5mG4oCN4pmC77iPXCIsXG4gIFwi8J+ZhlwiLFxuICBcIvCfmYfwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+Zh/Cfj7vigI3imYLvuI9cIixcbiAgXCLwn5mH8J+Pu1wiLFxuICBcIvCfmYfwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+Zh/Cfj7zigI3imYLvuI9cIixcbiAgXCLwn5mH8J+PvFwiLFxuICBcIvCfmYfwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+Zh/Cfj73igI3imYLvuI9cIixcbiAgXCLwn5mH8J+PvVwiLFxuICBcIvCfmYfwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+Zh/Cfj77igI3imYLvuI9cIixcbiAgXCLwn5mH8J+PvlwiLFxuICBcIvCfmYfwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+Zh/Cfj7/igI3imYLvuI9cIixcbiAgXCLwn5mH8J+Pv1wiLFxuICBcIvCfmYfigI3imYDvuI9cIixcbiAgXCLwn5mH4oCN4pmC77iPXCIsXG4gIFwi8J+Zh1wiLFxuICBcIvCfmYhcIixcbiAgXCLwn5mJXCIsXG4gIFwi8J+ZilwiLFxuICBcIvCfmYvwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+Zi/Cfj7vigI3imYLvuI9cIixcbiAgXCLwn5mL8J+Pu1wiLFxuICBcIvCfmYvwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+Zi/Cfj7zigI3imYLvuI9cIixcbiAgXCLwn5mL8J+PvFwiLFxuICBcIvCfmYvwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+Zi/Cfj73igI3imYLvuI9cIixcbiAgXCLwn5mL8J+PvVwiLFxuICBcIvCfmYvwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+Zi/Cfj77igI3imYLvuI9cIixcbiAgXCLwn5mL8J+PvlwiLFxuICBcIvCfmYvwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+Zi/Cfj7/igI3imYLvuI9cIixcbiAgXCLwn5mL8J+Pv1wiLFxuICBcIvCfmYvigI3imYDvuI9cIixcbiAgXCLwn5mL4oCN4pmC77iPXCIsXG4gIFwi8J+Zi1wiLFxuICBcIvCfmYzwn4+7XCIsXG4gIFwi8J+ZjPCfj7xcIixcbiAgXCLwn5mM8J+PvVwiLFxuICBcIvCfmYzwn4++XCIsXG4gIFwi8J+ZjPCfj79cIixcbiAgXCLwn5mMXCIsXG4gIFwi8J+ZjfCfj7vigI3imYDvuI9cIixcbiAgXCLwn5mN8J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfmY3wn4+7XCIsXG4gIFwi8J+ZjfCfj7zigI3imYDvuI9cIixcbiAgXCLwn5mN8J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfmY3wn4+8XCIsXG4gIFwi8J+ZjfCfj73igI3imYDvuI9cIixcbiAgXCLwn5mN8J+PveKAjeKZgu+4j1wiLFxuICBcIvCfmY3wn4+9XCIsXG4gIFwi8J+ZjfCfj77igI3imYDvuI9cIixcbiAgXCLwn5mN8J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfmY3wn4++XCIsXG4gIFwi8J+ZjfCfj7/igI3imYDvuI9cIixcbiAgXCLwn5mN8J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfmY3wn4+/XCIsXG4gIFwi8J+ZjeKAjeKZgO+4j1wiLFxuICBcIvCfmY3igI3imYLvuI9cIixcbiAgXCLwn5mNXCIsXG4gIFwi8J+ZjvCfj7vigI3imYDvuI9cIixcbiAgXCLwn5mO8J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfmY7wn4+7XCIsXG4gIFwi8J+ZjvCfj7zigI3imYDvuI9cIixcbiAgXCLwn5mO8J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfmY7wn4+8XCIsXG4gIFwi8J+ZjvCfj73igI3imYDvuI9cIixcbiAgXCLwn5mO8J+PveKAjeKZgu+4j1wiLFxuICBcIvCfmY7wn4+9XCIsXG4gIFwi8J+ZjvCfj77igI3imYDvuI9cIixcbiAgXCLwn5mO8J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfmY7wn4++XCIsXG4gIFwi8J+ZjvCfj7/igI3imYDvuI9cIixcbiAgXCLwn5mO8J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfmY7wn4+/XCIsXG4gIFwi8J+ZjuKAjeKZgO+4j1wiLFxuICBcIvCfmY7igI3imYLvuI9cIixcbiAgXCLwn5mOXCIsXG4gIFwi8J+Zj/Cfj7tcIixcbiAgXCLwn5mP8J+PvFwiLFxuICBcIvCfmY/wn4+9XCIsXG4gIFwi8J+Zj/Cfj75cIixcbiAgXCLwn5mP8J+Pv1wiLFxuICBcIvCfmY9cIixcbiAgXCLwn5qAXCIsXG4gIFwi8J+agVwiLFxuICBcIvCfmoJcIixcbiAgXCLwn5qDXCIsXG4gIFwi8J+ahFwiLFxuICBcIvCfmoVcIixcbiAgXCLwn5qGXCIsXG4gIFwi8J+ah1wiLFxuICBcIvCfmohcIixcbiAgXCLwn5qJXCIsXG4gIFwi8J+ailwiLFxuICBcIvCfmotcIixcbiAgXCLwn5qMXCIsXG4gIFwi8J+ajVwiLFxuICBcIvCfmo5cIixcbiAgXCLwn5qPXCIsXG4gIFwi8J+akFwiLFxuICBcIvCfmpFcIixcbiAgXCLwn5qSXCIsXG4gIFwi8J+ak1wiLFxuICBcIvCfmpRcIixcbiAgXCLwn5qVXCIsXG4gIFwi8J+allwiLFxuICBcIvCfmpdcIixcbiAgXCLwn5qYXCIsXG4gIFwi8J+amVwiLFxuICBcIvCfmppcIixcbiAgXCLwn5qbXCIsXG4gIFwi8J+anFwiLFxuICBcIvCfmp1cIixcbiAgXCLwn5qeXCIsXG4gIFwi8J+an1wiLFxuICBcIvCfmqBcIixcbiAgXCLwn5qhXCIsXG4gIFwi8J+aolwiLFxuICBcIvCfmqPwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+ao/Cfj7vigI3imYLvuI9cIixcbiAgXCLwn5qj8J+Pu1wiLFxuICBcIvCfmqPwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+ao/Cfj7zigI3imYLvuI9cIixcbiAgXCLwn5qj8J+PvFwiLFxuICBcIvCfmqPwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+ao/Cfj73igI3imYLvuI9cIixcbiAgXCLwn5qj8J+PvVwiLFxuICBcIvCfmqPwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+ao/Cfj77igI3imYLvuI9cIixcbiAgXCLwn5qj8J+PvlwiLFxuICBcIvCfmqPwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+ao/Cfj7/igI3imYLvuI9cIixcbiAgXCLwn5qj8J+Pv1wiLFxuICBcIvCfmqPigI3imYDvuI9cIixcbiAgXCLwn5qj4oCN4pmC77iPXCIsXG4gIFwi8J+ao1wiLFxuICBcIvCfmqRcIixcbiAgXCLwn5qlXCIsXG4gIFwi8J+aplwiLFxuICBcIvCfmqdcIixcbiAgXCLwn5qoXCIsXG4gIFwi8J+aqVwiLFxuICBcIvCfmqpcIixcbiAgXCLwn5qrXCIsXG4gIFwi8J+arFwiLFxuICBcIvCfmq1cIixcbiAgXCLwn5quXCIsXG4gIFwi8J+ar1wiLFxuICBcIvCfmrBcIixcbiAgXCLwn5qxXCIsXG4gIFwi8J+aslwiLFxuICBcIvCfmrNcIixcbiAgXCLwn5q08J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfmrTwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+atPCfj7tcIixcbiAgXCLwn5q08J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfmrTwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+atPCfj7xcIixcbiAgXCLwn5q08J+PveKAjeKZgO+4j1wiLFxuICBcIvCfmrTwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+atPCfj71cIixcbiAgXCLwn5q08J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfmrTwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+atPCfj75cIixcbiAgXCLwn5q08J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfmrTwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+atPCfj79cIixcbiAgXCLwn5q04oCN4pmA77iPXCIsXG4gIFwi8J+atOKAjeKZgu+4j1wiLFxuICBcIvCfmrRcIixcbiAgXCLwn5q18J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfmrXwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+atfCfj7tcIixcbiAgXCLwn5q18J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfmrXwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+atfCfj7xcIixcbiAgXCLwn5q18J+PveKAjeKZgO+4j1wiLFxuICBcIvCfmrXwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+atfCfj71cIixcbiAgXCLwn5q18J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfmrXwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+atfCfj75cIixcbiAgXCLwn5q18J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfmrXwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+atfCfj79cIixcbiAgXCLwn5q14oCN4pmA77iPXCIsXG4gIFwi8J+ateKAjeKZgu+4j1wiLFxuICBcIvCfmrVcIixcbiAgXCLwn5q28J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfmrbwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+atvCfj7tcIixcbiAgXCLwn5q28J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfmrbwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+atvCfj7xcIixcbiAgXCLwn5q28J+PveKAjeKZgO+4j1wiLFxuICBcIvCfmrbwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+atvCfj71cIixcbiAgXCLwn5q28J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfmrbwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+atvCfj75cIixcbiAgXCLwn5q28J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfmrbwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+atvCfj79cIixcbiAgXCLwn5q24oCN4pmA77iPXCIsXG4gIFwi8J+atuKAjeKZgu+4j1wiLFxuICBcIvCfmrZcIixcbiAgXCLwn5q3XCIsXG4gIFwi8J+auFwiLFxuICBcIvCfmrlcIixcbiAgXCLwn5q6XCIsXG4gIFwi8J+au1wiLFxuICBcIvCfmrxcIixcbiAgXCLwn5q9XCIsXG4gIFwi8J+avlwiLFxuICBcIvCfmr9cIixcbiAgXCLwn5uA8J+Pu1wiLFxuICBcIvCfm4Dwn4+8XCIsXG4gIFwi8J+bgPCfj71cIixcbiAgXCLwn5uA8J+PvlwiLFxuICBcIvCfm4Dwn4+/XCIsXG4gIFwi8J+bgFwiLFxuICBcIvCfm4FcIixcbiAgXCLwn5uCXCIsXG4gIFwi8J+bg1wiLFxuICBcIvCfm4RcIixcbiAgXCLwn5uFXCIsXG4gIFwi8J+bi1wiLFxuICBcIvCfm4zwn4+7XCIsXG4gIFwi8J+bjPCfj7xcIixcbiAgXCLwn5uM8J+PvVwiLFxuICBcIvCfm4zwn4++XCIsXG4gIFwi8J+bjPCfj79cIixcbiAgXCLwn5uMXCIsXG4gIFwi8J+bjVwiLFxuICBcIvCfm45cIixcbiAgXCLwn5uPXCIsXG4gIFwi8J+bkFwiLFxuICBcIvCfm5FcIixcbiAgXCLwn5uSXCIsXG4gIFwi8J+boFwiLFxuICBcIvCfm6FcIixcbiAgXCLwn5uiXCIsXG4gIFwi8J+bo1wiLFxuICBcIvCfm6RcIixcbiAgXCLwn5ulXCIsXG4gIFwi8J+bqVwiLFxuICBcIvCfm6tcIixcbiAgXCLwn5usXCIsXG4gIFwi8J+bsFwiLFxuICBcIvCfm7NcIixcbiAgXCLwn5u0XCIsXG4gIFwi8J+btVwiLFxuICBcIvCfm7ZcIixcbiAgXCLwn6SQXCIsXG4gIFwi8J+kkVwiLFxuICBcIvCfpJJcIixcbiAgXCLwn6STXCIsXG4gIFwi8J+klFwiLFxuICBcIvCfpJVcIixcbiAgXCLwn6SWXCIsXG4gIFwi8J+kl1wiLFxuICBcIvCfpJjwn4+7XCIsXG4gIFwi8J+kmPCfj7xcIixcbiAgXCLwn6SY8J+PvVwiLFxuICBcIvCfpJjwn4++XCIsXG4gIFwi8J+kmPCfj79cIixcbiAgXCLwn6SYXCIsXG4gIFwi8J+kmfCfj7tcIixcbiAgXCLwn6SZ8J+PvFwiLFxuICBcIvCfpJnwn4+9XCIsXG4gIFwi8J+kmfCfj75cIixcbiAgXCLwn6SZ8J+Pv1wiLFxuICBcIvCfpJlcIixcbiAgXCLwn6Sa8J+Pu1wiLFxuICBcIvCfpJrwn4+8XCIsXG4gIFwi8J+kmvCfj71cIixcbiAgXCLwn6Sa8J+PvlwiLFxuICBcIvCfpJrwn4+/XCIsXG4gIFwi8J+kmlwiLFxuICBcIvCfpJvwn4+7XCIsXG4gIFwi8J+km/Cfj7xcIixcbiAgXCLwn6Sb8J+PvVwiLFxuICBcIvCfpJvwn4++XCIsXG4gIFwi8J+km/Cfj79cIixcbiAgXCLwn6SbXCIsXG4gIFwi8J+knPCfj7tcIixcbiAgXCLwn6Sc8J+PvFwiLFxuICBcIvCfpJzwn4+9XCIsXG4gIFwi8J+knPCfj75cIixcbiAgXCLwn6Sc8J+Pv1wiLFxuICBcIvCfpJxcIixcbiAgXCLwn6Sd8J+Pu1wiLFxuICBcIvCfpJ3wn4+8XCIsXG4gIFwi8J+knfCfj71cIixcbiAgXCLwn6Sd8J+PvlwiLFxuICBcIvCfpJ3wn4+/XCIsXG4gIFwi8J+knVwiLFxuICBcIvCfpJ7wn4+7XCIsXG4gIFwi8J+knvCfj7xcIixcbiAgXCLwn6Se8J+PvVwiLFxuICBcIvCfpJ7wn4++XCIsXG4gIFwi8J+knvCfj79cIixcbiAgXCLwn6SeXCIsXG4gIFwi8J+koFwiLFxuICBcIvCfpKFcIixcbiAgXCLwn6SiXCIsXG4gIFwi8J+ko1wiLFxuICBcIvCfpKRcIixcbiAgXCLwn6SlXCIsXG4gIFwi8J+kpvCfj7vigI3imYDvuI9cIixcbiAgXCLwn6Sm8J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfpKbwn4+7XCIsXG4gIFwi8J+kpvCfj7zigI3imYDvuI9cIixcbiAgXCLwn6Sm8J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfpKbwn4+8XCIsXG4gIFwi8J+kpvCfj73igI3imYDvuI9cIixcbiAgXCLwn6Sm8J+PveKAjeKZgu+4j1wiLFxuICBcIvCfpKbwn4+9XCIsXG4gIFwi8J+kpvCfj77igI3imYDvuI9cIixcbiAgXCLwn6Sm8J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfpKbwn4++XCIsXG4gIFwi8J+kpvCfj7/igI3imYDvuI9cIixcbiAgXCLwn6Sm8J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfpKbwn4+/XCIsXG4gIFwi8J+kpuKAjeKZgO+4j1wiLFxuICBcIvCfpKbigI3imYLvuI9cIixcbiAgXCLwn6SmXCIsXG4gIFwi8J+kp1wiLFxuICBcIvCfpLDwn4+7XCIsXG4gIFwi8J+ksPCfj7xcIixcbiAgXCLwn6Sw8J+PvVwiLFxuICBcIvCfpLDwn4++XCIsXG4gIFwi8J+ksPCfj79cIixcbiAgXCLwn6SwXCIsXG4gIFwi8J+ks/Cfj7tcIixcbiAgXCLwn6Sz8J+PvFwiLFxuICBcIvCfpLPwn4+9XCIsXG4gIFwi8J+ks/Cfj75cIixcbiAgXCLwn6Sz8J+Pv1wiLFxuICBcIvCfpLNcIixcbiAgXCLwn6S08J+Pu1wiLFxuICBcIvCfpLTwn4+8XCIsXG4gIFwi8J+ktPCfj71cIixcbiAgXCLwn6S08J+PvlwiLFxuICBcIvCfpLTwn4+/XCIsXG4gIFwi8J+ktFwiLFxuICBcIvCfpLXwn4+7XCIsXG4gIFwi8J+ktfCfj7xcIixcbiAgXCLwn6S18J+PvVwiLFxuICBcIvCfpLXwn4++XCIsXG4gIFwi8J+ktfCfj79cIixcbiAgXCLwn6S1XCIsXG4gIFwi8J+ktvCfj7tcIixcbiAgXCLwn6S28J+PvFwiLFxuICBcIvCfpLbwn4+9XCIsXG4gIFwi8J+ktvCfj75cIixcbiAgXCLwn6S28J+Pv1wiLFxuICBcIvCfpLZcIixcbiAgXCLwn6S38J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfpLfwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+kt/Cfj7tcIixcbiAgXCLwn6S38J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfpLfwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+kt/Cfj7xcIixcbiAgXCLwn6S38J+PveKAjeKZgO+4j1wiLFxuICBcIvCfpLfwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+kt/Cfj71cIixcbiAgXCLwn6S38J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfpLfwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+kt/Cfj75cIixcbiAgXCLwn6S38J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfpLfwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+kt/Cfj79cIixcbiAgXCLwn6S34oCN4pmA77iPXCIsXG4gIFwi8J+kt+KAjeKZgu+4j1wiLFxuICBcIvCfpLdcIixcbiAgXCLwn6S48J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfpLjwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+kuPCfj7tcIixcbiAgXCLwn6S48J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfpLjwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+kuPCfj7xcIixcbiAgXCLwn6S48J+PveKAjeKZgO+4j1wiLFxuICBcIvCfpLjwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+kuPCfj71cIixcbiAgXCLwn6S48J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfpLjwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+kuPCfj75cIixcbiAgXCLwn6S48J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfpLjwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+kuPCfj79cIixcbiAgXCLwn6S44oCN4pmA77iPXCIsXG4gIFwi8J+kuOKAjeKZgu+4j1wiLFxuICBcIvCfpLhcIixcbiAgXCLwn6S58J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfpLnwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+kufCfj7tcIixcbiAgXCLwn6S58J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfpLnwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+kufCfj7xcIixcbiAgXCLwn6S58J+PveKAjeKZgO+4j1wiLFxuICBcIvCfpLnwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+kufCfj71cIixcbiAgXCLwn6S58J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfpLnwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+kufCfj75cIixcbiAgXCLwn6S58J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfpLnwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+kufCfj79cIixcbiAgXCLwn6S54oCN4pmA77iPXCIsXG4gIFwi8J+kueKAjeKZgu+4j1wiLFxuICBcIvCfpLlcIixcbiAgXCLwn6S6XCIsXG4gIFwi8J+kvPCfj7vigI3imYDvuI9cIixcbiAgXCLwn6S88J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfpLzwn4+7XCIsXG4gIFwi8J+kvPCfj7zigI3imYDvuI9cIixcbiAgXCLwn6S88J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfpLzwn4+8XCIsXG4gIFwi8J+kvPCfj73igI3imYDvuI9cIixcbiAgXCLwn6S88J+PveKAjeKZgu+4j1wiLFxuICBcIvCfpLzwn4+9XCIsXG4gIFwi8J+kvPCfj77igI3imYDvuI9cIixcbiAgXCLwn6S88J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfpLzwn4++XCIsXG4gIFwi8J+kvPCfj7/igI3imYDvuI9cIixcbiAgXCLwn6S88J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfpLzwn4+/XCIsXG4gIFwi8J+kvOKAjeKZgO+4j1wiLFxuICBcIvCfpLzigI3imYLvuI9cIixcbiAgXCLwn6S8XCIsXG4gIFwi8J+kvfCfj7vigI3imYDvuI9cIixcbiAgXCLwn6S98J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfpL3wn4+7XCIsXG4gIFwi8J+kvfCfj7zigI3imYDvuI9cIixcbiAgXCLwn6S98J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfpL3wn4+8XCIsXG4gIFwi8J+kvfCfj73igI3imYDvuI9cIixcbiAgXCLwn6S98J+PveKAjeKZgu+4j1wiLFxuICBcIvCfpL3wn4+9XCIsXG4gIFwi8J+kvfCfj77igI3imYDvuI9cIixcbiAgXCLwn6S98J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfpL3wn4++XCIsXG4gIFwi8J+kvfCfj7/igI3imYDvuI9cIixcbiAgXCLwn6S98J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfpL3wn4+/XCIsXG4gIFwi8J+kveKAjeKZgO+4j1wiLFxuICBcIvCfpL3igI3imYLvuI9cIixcbiAgXCLwn6S9XCIsXG4gIFwi8J+kvvCfj7vigI3imYDvuI9cIixcbiAgXCLwn6S+8J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfpL7wn4+7XCIsXG4gIFwi8J+kvvCfj7zigI3imYDvuI9cIixcbiAgXCLwn6S+8J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfpL7wn4+8XCIsXG4gIFwi8J+kvvCfj73igI3imYDvuI9cIixcbiAgXCLwn6S+8J+PveKAjeKZgu+4j1wiLFxuICBcIvCfpL7wn4+9XCIsXG4gIFwi8J+kvvCfj77igI3imYDvuI9cIixcbiAgXCLwn6S+8J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfpL7wn4++XCIsXG4gIFwi8J+kvvCfj7/igI3imYDvuI9cIixcbiAgXCLwn6S+8J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfpL7wn4+/XCIsXG4gIFwi8J+kvuKAjeKZgO+4j1wiLFxuICBcIvCfpL7igI3imYLvuI9cIixcbiAgXCLwn6S+XCIsXG4gIFwi8J+lgFwiLFxuICBcIvCfpYFcIixcbiAgXCLwn6WCXCIsXG4gIFwi8J+lg1wiLFxuICBcIvCfpYRcIixcbiAgXCLwn6WFXCIsXG4gIFwi8J+lh1wiLFxuICBcIvCfpYhcIixcbiAgXCLwn6WJXCIsXG4gIFwi8J+lilwiLFxuICBcIvCfpYtcIixcbiAgXCLwn6WQXCIsXG4gIFwi8J+lkVwiLFxuICBcIvCfpZJcIixcbiAgXCLwn6WTXCIsXG4gIFwi8J+llFwiLFxuICBcIvCfpZVcIixcbiAgXCLwn6WWXCIsXG4gIFwi8J+ll1wiLFxuICBcIvCfpZhcIixcbiAgXCLwn6WZXCIsXG4gIFwi8J+lmlwiLFxuICBcIvCfpZtcIixcbiAgXCLwn6WcXCIsXG4gIFwi8J+lnVwiLFxuICBcIvCfpZ5cIixcbiAgXCLwn6aAXCIsXG4gIFwi8J+mgVwiLFxuICBcIvCfpoJcIixcbiAgXCLwn6aDXCIsXG4gIFwi8J+mhFwiLFxuICBcIvCfpoVcIixcbiAgXCLwn6aGXCIsXG4gIFwi8J+mh1wiLFxuICBcIvCfpohcIixcbiAgXCLwn6aJXCIsXG4gIFwi8J+milwiLFxuICBcIvCfpotcIixcbiAgXCLwn6aMXCIsXG4gIFwi8J+mjVwiLFxuICBcIvCfpo5cIixcbiAgXCLwn6aPXCIsXG4gIFwi8J+mkFwiLFxuICBcIvCfppFcIixcbiAgXCLwn6eAXCIsXG4gIFwi4oC8XCIsXG4gIFwi4oGJXCIsXG4gIFwi4oSiXCIsXG4gIFwi4oS5XCIsXG4gIFwi4oaUXCIsXG4gIFwi4oaVXCIsXG4gIFwi4oaWXCIsXG4gIFwi4oaXXCIsXG4gIFwi4oaYXCIsXG4gIFwi4oaZXCIsXG4gIFwi4oapXCIsXG4gIFwi4oaqXCIsXG4gIFwiI+KDo1wiLFxuICBcIuKMmlwiLFxuICBcIuKMm1wiLFxuICBcIuKMqFwiLFxuICBcIuKPj1wiLFxuICBcIuKPqVwiLFxuICBcIuKPqlwiLFxuICBcIuKPq1wiLFxuICBcIuKPrFwiLFxuICBcIuKPrVwiLFxuICBcIuKPrlwiLFxuICBcIuKPr1wiLFxuICBcIuKPsFwiLFxuICBcIuKPsVwiLFxuICBcIuKPslwiLFxuICBcIuKPs1wiLFxuICBcIuKPuFwiLFxuICBcIuKPuVwiLFxuICBcIuKPulwiLFxuICBcIuKTglwiLFxuICBcIuKWqlwiLFxuICBcIuKWq1wiLFxuICBcIuKWtlwiLFxuICBcIuKXgFwiLFxuICBcIuKXu1wiLFxuICBcIuKXvFwiLFxuICBcIuKXvVwiLFxuICBcIuKXvlwiLFxuICBcIuKYgFwiLFxuICBcIuKYgVwiLFxuICBcIuKYglwiLFxuICBcIuKYg1wiLFxuICBcIuKYhFwiLFxuICBcIuKYjlwiLFxuICBcIuKYkVwiLFxuICBcIuKYlFwiLFxuICBcIuKYlVwiLFxuICBcIuKYmFwiLFxuICBcIuKYnfCfj7tcIixcbiAgXCLimJ3wn4+8XCIsXG4gIFwi4pid8J+PvVwiLFxuICBcIuKYnfCfj75cIixcbiAgXCLimJ3wn4+/XCIsXG4gIFwi4pidXCIsXG4gIFwi4pigXCIsXG4gIFwi4piiXCIsXG4gIFwi4pijXCIsXG4gIFwi4pimXCIsXG4gIFwi4piqXCIsXG4gIFwi4piuXCIsXG4gIFwi4pivXCIsXG4gIFwi4pi4XCIsXG4gIFwi4pi5XCIsXG4gIFwi4pi6XCIsXG4gIFwi4pmAXCIsXG4gIFwi4pmCXCIsXG4gIFwi4pmIXCIsXG4gIFwi4pmJXCIsXG4gIFwi4pmKXCIsXG4gIFwi4pmLXCIsXG4gIFwi4pmMXCIsXG4gIFwi4pmNXCIsXG4gIFwi4pmOXCIsXG4gIFwi4pmPXCIsXG4gIFwi4pmQXCIsXG4gIFwi4pmRXCIsXG4gIFwi4pmSXCIsXG4gIFwi4pmTXCIsXG4gIFwi4pmgXCIsXG4gIFwi4pmjXCIsXG4gIFwi4pmlXCIsXG4gIFwi4pmmXCIsXG4gIFwi4pmoXCIsXG4gIFwi4pm7XCIsXG4gIFwi4pm/XCIsXG4gIFwi4pqSXCIsXG4gIFwi4pqTXCIsXG4gIFwi4pqUXCIsXG4gIFwi4pqVXCIsXG4gIFwi4pqWXCIsXG4gIFwi4pqXXCIsXG4gIFwi4pqZXCIsXG4gIFwi4pqbXCIsXG4gIFwi4pqcXCIsXG4gIFwi4pqgXCIsXG4gIFwi4pqhXCIsXG4gIFwi4pqqXCIsXG4gIFwi4pqrXCIsXG4gIFwi4pqwXCIsXG4gIFwi4pqxXCIsXG4gIFwi4pq9XCIsXG4gIFwi4pq+XCIsXG4gIFwi4puEXCIsXG4gIFwi4puFXCIsXG4gIFwi4puIXCIsXG4gIFwi4puOXCIsXG4gIFwi4puPXCIsXG4gIFwi4puRXCIsXG4gIFwi4puTXCIsXG4gIFwi4puUXCIsXG4gIFwi4pupXCIsXG4gIFwi4puqXCIsXG4gIFwi4puwXCIsXG4gIFwi4puxXCIsXG4gIFwi4puyXCIsXG4gIFwi4puzXCIsXG4gIFwi4pu0XCIsXG4gIFwi4pu1XCIsXG4gIFwi4pu38J+Pu1wiLFxuICBcIuKbt/Cfj7xcIixcbiAgXCLim7fwn4+9XCIsXG4gIFwi4pu38J+PvlwiLFxuICBcIuKbt/Cfj79cIixcbiAgXCLim7dcIixcbiAgXCLim7hcIixcbiAgXCLim7nwn4+74oCN4pmA77iPXCIsXG4gIFwi4pu58J+Pu+KAjeKZgu+4j1wiLFxuICBcIuKbufCfj7tcIixcbiAgXCLim7nwn4+84oCN4pmA77iPXCIsXG4gIFwi4pu58J+PvOKAjeKZgu+4j1wiLFxuICBcIuKbufCfj7xcIixcbiAgXCLim7nwn4+94oCN4pmA77iPXCIsXG4gIFwi4pu58J+PveKAjeKZgu+4j1wiLFxuICBcIuKbufCfj71cIixcbiAgXCLim7nwn4++4oCN4pmA77iPXCIsXG4gIFwi4pu58J+PvuKAjeKZgu+4j1wiLFxuICBcIuKbufCfj75cIixcbiAgXCLim7nwn4+/4oCN4pmA77iPXCIsXG4gIFwi4pu58J+Pv+KAjeKZgu+4j1wiLFxuICBcIuKbufCfj79cIixcbiAgXCLim7nvuI/igI3imYDvuI9cIixcbiAgXCLim7nvuI/igI3imYLvuI9cIixcbiAgXCLim7lcIixcbiAgXCLim7pcIixcbiAgXCLim71cIixcbiAgXCLinIJcIixcbiAgXCLinIVcIixcbiAgXCLinIhcIixcbiAgXCLinIlcIixcbiAgXCLinIrwn4+7XCIsXG4gIFwi4pyK8J+PvFwiLFxuICBcIuKcivCfj71cIixcbiAgXCLinIrwn4++XCIsXG4gIFwi4pyK8J+Pv1wiLFxuICBcIuKcilwiLFxuICBcIuKci/Cfj7tcIixcbiAgXCLinIvwn4+8XCIsXG4gIFwi4pyL8J+PvVwiLFxuICBcIuKci/Cfj75cIixcbiAgXCLinIvwn4+/XCIsXG4gIFwi4pyLXCIsXG4gIFwi4pyM8J+Pu1wiLFxuICBcIuKcjPCfj7xcIixcbiAgXCLinIzwn4+9XCIsXG4gIFwi4pyM8J+PvlwiLFxuICBcIuKcjPCfj79cIixcbiAgXCLinIxcIixcbiAgXCLinI3wn4+7XCIsXG4gIFwi4pyN8J+PvFwiLFxuICBcIuKcjfCfj71cIixcbiAgXCLinI3wn4++XCIsXG4gIFwi4pyN8J+Pv1wiLFxuICBcIuKcjVwiLFxuICBcIuKcj1wiLFxuICBcIuKcklwiLFxuICBcIuKclFwiLFxuICBcIuKcllwiLFxuICBcIuKcnVwiLFxuICBcIuKcoVwiLFxuICBcIuKcqFwiLFxuICBcIuKcs1wiLFxuICBcIuKctFwiLFxuICBcIuKdhFwiLFxuICBcIuKdh1wiLFxuICBcIuKdjFwiLFxuICBcIuKdjlwiLFxuICBcIuKdk1wiLFxuICBcIuKdlFwiLFxuICBcIuKdlVwiLFxuICBcIuKdl1wiLFxuICBcIuKdo1wiLFxuICBcIuKdpFwiLFxuICBcIuKelVwiLFxuICBcIuKellwiLFxuICBcIuKel1wiLFxuICBcIuKeoVwiLFxuICBcIuKesFwiLFxuICBcIuKev1wiLFxuICBcIuKktFwiLFxuICBcIuKktVwiLFxuICBcIirig6NcIixcbiAgXCLirIVcIixcbiAgXCLirIZcIixcbiAgXCLirIdcIixcbiAgXCLirJtcIixcbiAgXCLirJxcIixcbiAgXCLirZBcIixcbiAgXCLirZVcIixcbiAgXCIw4oOjXCIsXG4gIFwi44CwXCIsXG4gIFwi44C9XCIsXG4gIFwiMeKDo1wiLFxuICBcIjLig6NcIixcbiAgXCLjipdcIixcbiAgXCLjiplcIixcbiAgXCIz4oOjXCIsXG4gIFwiNOKDo1wiLFxuICBcIjXig6NcIixcbiAgXCI24oOjXCIsXG4gIFwiN+KDo1wiLFxuICBcIjjig6NcIixcbiAgXCI54oOjXCIsXG4gIFwiwqlcIixcbiAgXCLCrlwiLFxuICBcIu6UilwiXG5dXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvZW1vamlzLWxpc3QvaW5kZXguanNcbi8vIG1vZHVsZSBpZCA9IDE2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImltcG9ydCB7T3B0aW9uT2JqZWN0fSBmcm9tICdsb2FkZXItdXRpbHMnO1xuaW1wb3J0IHtTZW1hbnRpY05hbWVzcGFjZVRyZWVOb2RlLCBUZW1wbGF0ZUZ1bmN0aW9uLCBUZW1wbGF0ZVBhcmFtZXRlcn0gZnJvbSAnLi4vc2VtYW50aWNzL21vZGVsJztcblxuZXhwb3J0IGNsYXNzIEVtaXR0ZXIge1xuXG5cdHByaXZhdGUgaXNSZW5kZXJDb21tZW50c0VuYWJsZWQ6IGJvb2xlYW47XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucz86IE9wdGlvbk9iamVjdCkge1xuXHRcdHRoaXMuaXNSZW5kZXJDb21tZW50c0VuYWJsZWQgPSAob3B0aW9ucyAmJiBvcHRpb25zLmVtaXRDb21tZW50cykgfHwgZmFsc2U7XG5cdH1cblxuXHRwdWJsaWMgZm9ybWF0KHJvb3Q6IFNlbWFudGljTmFtZXNwYWNlVHJlZU5vZGUpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLmZvcm1hdE5vZGUocm9vdCwgMCk7XG5cdH1cblxuXHRwcml2YXRlIGZvcm1hdE5vZGUobm9kZTogU2VtYW50aWNOYW1lc3BhY2VUcmVlTm9kZSwgaW5kZW50YXRpb25EZXB0aDogbnVtYmVyKTogc3RyaW5nIHtcblx0XHRjb25zdCBkZWNsYXJhdGlvblByZWZpeCA9IGluZGVudGF0aW9uRGVwdGggPT09IDAgPyAnaW50ZXJmYWNlICcgOiAnXFx0Jy5yZXBlYXQoaW5kZW50YXRpb25EZXB0aCk7XG5cdFx0bGV0IHBhcnRpYWxEZWNsYXJhdGlvbiA9IGAke2RlY2xhcmF0aW9uUHJlZml4fSR7bm9kZS5pZGVudGlmaWVyfSB7XFxuYDtcblx0XHRub2RlLmZ1bmN0aW9ucy5mb3JFYWNoKCh0ZW1wbGF0ZUZ1bmN0aW9uKSA9PiBwYXJ0aWFsRGVjbGFyYXRpb24gKz0gdGhpcy5mb3JtYXRGdW5jdGlvbih0ZW1wbGF0ZUZ1bmN0aW9uLCBpbmRlbnRhdGlvbkRlcHRoICsgMSkpO1xuXHRcdG5vZGUuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpID0+IHBhcnRpYWxEZWNsYXJhdGlvbiArPSB0aGlzLmZvcm1hdE5vZGUoY2hpbGQsIGluZGVudGF0aW9uRGVwdGggKyAxKSk7XG5cdFx0cGFydGlhbERlY2xhcmF0aW9uICs9IGAkeydcXHQnLnJlcGVhdChpbmRlbnRhdGlvbkRlcHRoKX19XFxuYDtcblx0XHRyZXR1cm4gcGFydGlhbERlY2xhcmF0aW9uO1xuXHR9XG5cblx0cHJpdmF0ZSBmb3JtYXRGdW5jdGlvbih0ZW1wbGF0ZUZ1bmN0aW9uOiBUZW1wbGF0ZUZ1bmN0aW9uLCBpbmRlbnRhdGlvbkRlcHRoOiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdGxldCBmdW5jdGlvbkRlY2xhcmF0aW9uID0gYCR7J1xcdCcucmVwZWF0KGluZGVudGF0aW9uRGVwdGgpfSR7dGVtcGxhdGVGdW5jdGlvbi5uYW1lfTogKGA7XG5cdFx0aWYgKHRlbXBsYXRlRnVuY3Rpb24ucGFyYW1zLmxlbmd0aCA+IDApIHtcblx0XHRcdGZ1bmN0aW9uRGVjbGFyYXRpb24gKz0gdGhpcy5mb3JtYXRQYXJhbWV0ZXJzKHRlbXBsYXRlRnVuY3Rpb24ucGFyYW1zLCBpbmRlbnRhdGlvbkRlcHRoICsgMSk7XG5cdFx0fVxuXHRcdGZ1bmN0aW9uRGVjbGFyYXRpb24gKz0gYCkgPT4gRG9jdW1lbnRGcmFnbWVudDtcXG5gO1xuXHRcdHJldHVybiBmdW5jdGlvbkRlY2xhcmF0aW9uO1xuXHR9XG5cblx0cHJpdmF0ZSBmb3JtYXRQYXJhbWV0ZXJzKHBhcmFtczogVGVtcGxhdGVQYXJhbWV0ZXJbXSwgaW5kZW50YXRpb25EZXB0aDogbnVtYmVyKTogc3RyaW5nIHtcblx0XHRsZXQgcGFyYW1ldGVyT2JqZWN0RGVjbGFyYXRpb24gPSAneyc7XG5cdFx0Ly8gcGFyYW1ldGVyT2JqZWN0RGVjbGFyYXRpb24gKz0gdGhpcy5pc1JlbmRlckNvbW1lbnRzRW5hYmxlZCA/IGBcXG4keydcXHQnLnJlcGVhdChpbmRlbnRhdGlvbkRlcHRoKX1gIDogJyc7XG5cdFx0cGFyYW1ldGVyT2JqZWN0RGVjbGFyYXRpb24gKz0gcGFyYW1zXG5cdFx0XHQubWFwKChwYXJhbSkgPT4gdGhpcy5yZW5kZXJQYXJhbWV0ZXIocGFyYW0sIGluZGVudGF0aW9uRGVwdGgpKVxuXHRcdFx0LmpvaW4oYCwke3RoaXMuaXNSZW5kZXJDb21tZW50c0VuYWJsZWQgPyAnJyA6ICcgJ31gKTtcblx0XHRwYXJhbWV0ZXJPYmplY3REZWNsYXJhdGlvbiArPSB0aGlzLmlzUmVuZGVyQ29tbWVudHNFbmFibGVkID8gYFxcbiR7J1xcdCcucmVwZWF0KGluZGVudGF0aW9uRGVwdGggLSAxKX1gIDogJyc7XG5cdFx0cGFyYW1ldGVyT2JqZWN0RGVjbGFyYXRpb24gKz0gJ30nO1xuXHRcdHJldHVybiBwYXJhbWV0ZXJPYmplY3REZWNsYXJhdGlvbjtcblx0fVxuXG5cdHByaXZhdGUgcmVuZGVyUGFyYW1ldGVyKHBhcmFtOiBUZW1wbGF0ZVBhcmFtZXRlciwgaW5kZW50YXRpb25EZXB0aDogbnVtYmVyKTogc3RyaW5nIHtcblx0XHRjb25zdCBjb21tZW50SWZBbnkgPSB0aGlzLnJlbmRlckNvbW1lbnRJZkFwcHJvcHJpYXRlKHBhcmFtLmNvbW1lbnQsIGluZGVudGF0aW9uRGVwdGgpO1xuXHRcdGNvbnN0IGluZGVudGluZ1ByZWZpeCA9IGBcXG4keydcXHQnLnJlcGVhdChpbmRlbnRhdGlvbkRlcHRoKX1gO1xuXHRcdHJldHVybiBgJHtjb21tZW50SWZBbnl9JHt0aGlzLmlzUmVuZGVyQ29tbWVudHNFbmFibGVkID8gaW5kZW50aW5nUHJlZml4IDogJyd9JHtwYXJhbS5uYW1lfSR7cGFyYW0ub3B0aW9uYWxpdHkgPyAnPycgOiAnJ306ICR7cGFyYW0udHlwZX1gO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJDb21tZW50SWZBcHByb3ByaWF0ZShjb21tZW50OiBzdHJpbmcsIGluZGVudGF0aW9uRGVwdGg6IG51bWJlcik6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuaXNSZW5kZXJDb21tZW50c0VuYWJsZWQgJiYgY29tbWVudFxuXHRcdFx0PyBgXFxuJHsnXFx0Jy5yZXBlYXQoaW5kZW50YXRpb25EZXB0aCl9LyogJHtjb21tZW50fSAqL2Bcblx0XHRcdDogJyc7XG5cdH1cblxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3N5bnRoZXNpcy9lbWl0dGVyLnRzIiwiaW1wb3J0IHtUZW1wbGF0ZSwgVGVtcGxhdGVEZWNsYXJhdGlvbiwgVGVtcGxhdGVQYXJhbWV0ZXJBbm5vdGF0aW9ufSBmcm9tICcuL21vZGVsJztcblxuZXhwb3J0IG1vZHVsZSBMZXhlciB7XG5cblx0Y29uc3QgTkFNRVNQQUNFX1JFR0VYID0gL3tuYW1lc3BhY2VcXHMrKC4rKVxccyp9Lztcblx0Y29uc3QgVEVNUExBVEVfUkVHRVggPSAve3RlbXBsYXRlXFxzK1xcLiguKylcXHMqfS9nO1xuXHRjb25zdCBQQVJBTV9SRUdFWCA9IC9AcGFyYW1cXHMrKC4rKS9nO1xuXG5cdGV4cG9ydCBmdW5jdGlvbiB0b2tlbml6ZShpbnB1dDogc3RyaW5nKTogVGVtcGxhdGVEZWNsYXJhdGlvbiB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG5hbWVzcGFjZTogZmluZE5hbWVzcGFjZShpbnB1dCksXG5cdFx0XHR0ZW1wbGF0ZXM6IGZpbmRUZW1wbGF0ZUZ1bmN0aW9ucyhpbnB1dClcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBmaW5kTmFtZXNwYWNlKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGNvbnN0IG5hbWVzcGFjZSA9IGlucHV0Lm1hdGNoKE5BTUVTUEFDRV9SRUdFWCk7XG5cdFx0aWYgKG5hbWVzcGFjZSA9PT0gbnVsbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdObyBuYW1lc3BhY2UgZGVjbGFyYXRpb24gZm91bmQuJyk7XG5cdFx0fVxuXHRcdHJldHVybiBuYW1lc3BhY2VbMV07XG5cdH1cblxuXHRmdW5jdGlvbiBmaW5kVGVtcGxhdGVGdW5jdGlvbnMoaW5wdXQ6IHN0cmluZyk6IFRlbXBsYXRlW10ge1xuXHRcdGxldCB0ZW1wbGF0ZXM6IFRlbXBsYXRlW10gPSBbXSwgbWF0Y2g7XG5cdFx0d2hpbGUgKG1hdGNoID0gVEVNUExBVEVfUkVHRVguZXhlYyhpbnB1dCkpIHtcblx0XHRcdHRlbXBsYXRlcy5wdXNoKGNvbnN0cnVjdFRlbXBsYXRlKG1hdGNoKSk7XG5cdFx0fVxuXHRcdHJldHVybiB0ZW1wbGF0ZXM7XG5cdH1cblxuXHRmdW5jdGlvbiBjb25zdHJ1Y3RUZW1wbGF0ZShtYXRjaERhdGE6IFJlZ0V4cEV4ZWNBcnJheSk6IFRlbXBsYXRlIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bmFtZTogbWF0Y2hEYXRhWzFdLFxuXHRcdFx0cGFyYW1zOiBleHRyYWN0UGFyYW1zRnJvbUpTRG9jKGZpbmRKU0RvYyhtYXRjaERhdGEuaW5wdXQsIG1hdGNoRGF0YS5pbmRleCkpXG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIGV4dHJhY3RQYXJhbXNGcm9tSlNEb2MoanNEb2M6IHN0cmluZyk6IFRlbXBsYXRlUGFyYW1ldGVyQW5ub3RhdGlvbltdIHtcblx0XHRsZXQgcGFyYW1zOiBUZW1wbGF0ZVBhcmFtZXRlckFubm90YXRpb25bXSA9IFtdLCBtYXRjaDtcblx0XHR3aGlsZSAobWF0Y2ggPSBQQVJBTV9SRUdFWC5leGVjKGpzRG9jKSkge1xuXHRcdFx0cGFyYW1zLnB1c2gobWF0Y2hbMV0pO1xuXHRcdH1cblx0XHRyZXR1cm4gcGFyYW1zO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGZpbmRKU0RvYyhpbnB1dDogc3RyaW5nLCBtYXRjaEluZGV4OiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdGNvbnN0IGlucHV0QmVmb3JlTWF0Y2ggPSBpbnB1dC5zdWJzdHIoMCwgbWF0Y2hJbmRleCk7XG5cdFx0bGV0IGpzRG9jID0gaW5wdXQuc2xpY2UoaW5wdXRCZWZvcmVNYXRjaC5sYXN0SW5kZXhPZignLyoqJyksIG1hdGNoSW5kZXgpO1xuXHRcdGlmIChqc0RvYy5pbmNsdWRlcygne3RlbXBsYXRlJykpIHtcblx0XHRcdGpzRG9jID0gJyc7XG5cdFx0fVxuXHRcdHJldHVybiBqc0RvYztcblx0fVxuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvc3ludGF4L2xleGVyLnRzIiwiaW1wb3J0IHtUZW1wbGF0ZSwgVGVtcGxhdGVEZWNsYXJhdGlvbiwgVGVtcGxhdGVQYXJhbWV0ZXJBbm5vdGF0aW9ufSBmcm9tICcuLi9zeW50YXgvbW9kZWwnO1xuaW1wb3J0IHtTZW1hbnRpY05hbWVzcGFjZVRyZWVOb2RlLCBUZW1wbGF0ZUZ1bmN0aW9uLCBUZW1wbGF0ZVBhcmFtZXRlcn0gZnJvbSAnLi9tb2RlbCc7XG5cbmV4cG9ydCBtb2R1bGUgUGFyc2VyIHtcblxuXHRjb25zdCBQQVJBTV9OQU1FX1JFR0VYID0gLyhcXHcrKVxcPz86Py87XG5cdGNvbnN0IFBBUkFNX1RZUEVfUkVHRVggPSAvOlxccyooXFxTKylcXHM/Lztcblx0Y29uc3QgUEFSQU1fQ09NTUVOVF9SRUdFWCA9IC86XFxzKlxcUytcXHMrKC4qKS87XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlUm9vdE5hbWVzcGFjZU5vZGUoZGVjbGFyYXRpb246IFRlbXBsYXRlRGVjbGFyYXRpb24pOiBTZW1hbnRpY05hbWVzcGFjZVRyZWVOb2RlIHtcblx0XHRjb25zdCBuYW1lc3BhY2VBcnJheSA9IGRlY2xhcmF0aW9uLm5hbWVzcGFjZS5zcGxpdCgnLicpO1xuXHRcdGNvbnN0IHJvb3RJZGVudGlmaWVyID0gbmFtZXNwYWNlQXJyYXkuc2hpZnQoKTtcblx0XHRpZiAoIXJvb3RJZGVudGlmaWVyKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ05vIG5hbWVzcGFjZSByb290IGZvdW5kLicpO1xuXHRcdH1cblx0XHRjb25zdCByb290OiBTZW1hbnRpY05hbWVzcGFjZVRyZWVOb2RlID0ge1xuXHRcdFx0aWRlbnRpZmllcjogcm9vdElkZW50aWZpZXIsXG5cdFx0XHRjaGlsZHJlbjogW10sXG5cdFx0XHRmdW5jdGlvbnM6IFtdXG5cdFx0fTtcblx0XHRsZXQgY3VycmVudE5vZGUgPSByb290O1xuXHRcdG5hbWVzcGFjZUFycmF5LmZvckVhY2goKGlkZW50aWZpZXIpID0+IHtcblx0XHRcdGxldCBwYXJlbnROb2RlID0gY3VycmVudE5vZGU7XG5cdFx0XHRjdXJyZW50Tm9kZSA9IHtcblx0XHRcdFx0aWRlbnRpZmllcjogaWRlbnRpZmllcixcblx0XHRcdFx0Y2hpbGRyZW46IFtdLFxuXHRcdFx0XHRmdW5jdGlvbnM6IFtdXG5cdFx0XHR9O1xuXHRcdFx0cGFyZW50Tm9kZS5jaGlsZHJlbi5wdXNoKGN1cnJlbnROb2RlKTtcblx0XHR9KTtcblx0XHRjdXJyZW50Tm9kZS5mdW5jdGlvbnMgPSBjdXJyZW50Tm9kZS5mdW5jdGlvbnMuY29uY2F0KHBhcnNlVGVtcGxhdGVzKGRlY2xhcmF0aW9uLnRlbXBsYXRlcykpO1xuXHRcdHJldHVybiByb290O1xuXHR9XG5cblx0ZnVuY3Rpb24gcGFyc2VUZW1wbGF0ZXModGVtcGxhdGVzOiBUZW1wbGF0ZVtdKTogVGVtcGxhdGVGdW5jdGlvbltdIHtcblx0XHRyZXR1cm4gdGVtcGxhdGVzLm1hcCgodGVtcGxhdGUpID0+IHBhcnNlVGVtcGxhdGUodGVtcGxhdGUpKTtcblx0fVxuXG5cdGZ1bmN0aW9uIHBhcnNlVGVtcGxhdGUodGVtcGxhdGU6IFRlbXBsYXRlKTogVGVtcGxhdGVGdW5jdGlvbiB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG5hbWU6IHRlbXBsYXRlLm5hbWUsXG5cdFx0XHRwYXJhbXM6IHBhcnNlVGVtcGxhdGVQYXJhbWV0ZXJBbm5vdGF0aW9ucyh0ZW1wbGF0ZS5wYXJhbXMpXG5cdFx0fTtcblx0fVxuXG5cdGZ1bmN0aW9uIHBhcnNlVGVtcGxhdGVQYXJhbWV0ZXJBbm5vdGF0aW9ucyhwYXJhbXM6IFRlbXBsYXRlUGFyYW1ldGVyQW5ub3RhdGlvbltdKTogVGVtcGxhdGVQYXJhbWV0ZXJbXSB7XG5cdFx0cmV0dXJuIHBhcmFtcy5tYXAoKHBhcmFtKSA9PiBwYXJzZVRlbXBsYXRlUGFyYW1ldGVyQW5ub3RhdGlvbihwYXJhbSkpO1xuXHR9XG5cblx0ZnVuY3Rpb24gcGFyc2VUZW1wbGF0ZVBhcmFtZXRlckFubm90YXRpb24ocGFyYW06IFRlbXBsYXRlUGFyYW1ldGVyQW5ub3RhdGlvbik6IFRlbXBsYXRlUGFyYW1ldGVyIHtcblx0XHRjb25zdCBuYW1lTWF0Y2ggPSBwYXJhbS5tYXRjaChQQVJBTV9OQU1FX1JFR0VYKTtcblx0XHRpZiAoIW5hbWVNYXRjaCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdGb3VuZCBmdW5jdGlvbiBwYXJhbWV0ZXIgd2l0aG91dCBuYW1lLicpO1xuXHRcdH1cblx0XHRjb25zdCB0eXBlTWF0Y2ggPSBwYXJhbS5tYXRjaChQQVJBTV9UWVBFX1JFR0VYKTtcblx0XHRjb25zdCBjb21tZW50TWF0Y2ggPSBwYXJhbS5tYXRjaChQQVJBTV9DT01NRU5UX1JFR0VYKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bmFtZTogbmFtZU1hdGNoWzFdLFxuXHRcdFx0b3B0aW9uYWxpdHk6IG5hbWVNYXRjaFswXS5pbmNsdWRlcygnPycpLFxuXHRcdFx0dHlwZTogdHlwZU1hdGNoID8gdHlwZU1hdGNoWzFdIDogJycsXG5cdFx0XHRjb21tZW50OiBjb21tZW50TWF0Y2ggPyBjb21tZW50TWF0Y2hbMV0gOiAnJ1xuXHRcdH07XG5cdH1cblxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL3NlbWFudGljcy9wYXJzZXIudHMiXSwic291cmNlUm9vdCI6IiJ9