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
    return compiler.call(this, source);
}
exports.default = default_1;
function compiler(source) {
    const options = loader_utils_1.getOptions(this) || {};
    // const instanceName = options.instance || 'soy-declaration-loader';
    const callback = this.async();
    if (!source && callback) {
        return callback(null, '');
    }
    const emitter = new emitter_1.Emitter(options);
    const templateDeclaration = lexer_1.Lexer.tokenize(source);
    const rootNamespaceNode = parser_1.Parser.generateRootNamespaceNode(templateDeclaration);
    const targetTypeDeclaration = emitter.format(rootNamespaceNode);
    this.emitFile(this.resourcePath, targetTypeDeclaration, undefined);
    if (callback) {
        return callback(null, targetTypeDeclaration, undefined);
    }
    return targetTypeDeclaration;
}


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNmJhOTVkOTdjNjg4MmQ3MzU0ZjUiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvcGFyc2VRdWVyeS5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJwYXRoXCIiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvZ2V0SGFzaERpZ2VzdC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvZ2V0T3B0aW9ucy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvanNvbjUvbGliL2pzb241LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9sb2FkZXItdXRpbHMvbGliL3N0cmluZ2lmeVJlcXVlc3QuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvZ2V0UmVtYWluaW5nUmVxdWVzdC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbG9hZGVyLXV0aWxzL2xpYi9nZXRDdXJyZW50UmVxdWVzdC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvbG9hZGVyLXV0aWxzL2xpYi9pc1VybFJlcXVlc3QuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvdXJsVG9SZXF1ZXN0LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9sb2FkZXItdXRpbHMvbGliL3BhcnNlU3RyaW5nLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9iaWcuanMvYmlnLmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcImNyeXB0b1wiIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9sb2FkZXItdXRpbHMvbGliL2ludGVycG9sYXRlTmFtZS5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvZW1vamlzLWxpc3QvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3N5bnRoZXNpcy9lbWl0dGVyLnRzIiwid2VicGFjazovLy8uL3NyYy9zeW50YXgvbGV4ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3NlbWFudGljcy9wYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBMkIsMEJBQTBCLEVBQUU7QUFDdkQseUNBQWlDLGVBQWU7QUFDaEQ7QUFDQTtBQUNBOztBQUVBO0FBQ0EsOERBQXNELCtEQUErRDs7QUFFckg7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7OztBQzdEQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsNEJBQTRCO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNyREEsaUM7Ozs7Ozs7QUNBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLFFBQVE7QUFDcEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBOztBQUVBOzs7Ozs7Ozs7O0FDbERBLDhDQUF3QztBQUN4QywwQ0FBNEM7QUFDNUMsd0NBQXFDO0FBQ3JDLHlDQUEwQztBQUUxQyxtQkFBeUIsTUFBYztJQUN0QyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDcEMsQ0FBQztBQUZELDRCQUVDO0FBRUQsa0JBQXVDLE1BQWM7SUFDcEQsTUFBTSxPQUFPLEdBQUcseUJBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDdkMscUVBQXFFO0lBQ3JFLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUM5QixFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzNCLENBQUM7SUFDRCxNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFFckMsTUFBTSxtQkFBbUIsR0FBRyxhQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ25ELE1BQU0saUJBQWlCLEdBQUcsZUFBTSxDQUFDLHlCQUF5QixDQUFDLG1CQUFtQixDQUFDLENBQUM7SUFDaEYsTUFBTSxxQkFBcUIsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFFaEUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBRW5FLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDZCxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxxQkFBcUIsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBQ0QsTUFBTSxDQUFDLHFCQUFxQixDQUFDO0FBQzlCLENBQUM7Ozs7Ozs7O0FDOUJEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ3RCQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsaUNBQXVEOztBQUV2RDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsU0FBUzs7QUFFVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1REFBdUQ7O0FBRXZEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUzs7QUFFVDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUzs7QUFFVDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQSx1Q0FBdUMsT0FBTztBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQiwwREFBMEQ7QUFDMUQ7QUFDQSx5REFBeUQ7QUFDekQ7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7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O0FDdkNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7Ozs7QUNaQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7O0FDWkE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1EQUFtRCxFQUFFLE9BQU87QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7O0FDYkE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsRUFBRTtBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTs7Ozs7Ozs7QUNoREE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBO0FBQ0E7O0FBRUE7Ozs7Ozs7QUNsQkE7QUFDQSxDQUFDO0FBQ0Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQSxjQUFjO0FBQ2Q7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsa0JBQWtC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QUFlOztBQUVmO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHNDQUFzQyxLQUFLO0FBQzNDOztBQUVBOztBQUVBO0FBQ0EsbUJBQW1CLEtBQUs7QUFDeEI7O0FBRUE7QUFDQSwyQkFBMkIsT0FBTzs7QUFFbEM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwwQkFBMEIsU0FBUztBQUNuQztBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQSxrQkFBa0IsS0FBSztBQUN2QjtBQUNBOztBQUVBO0FBQ0EsU0FBUzs7QUFFVDs7QUFFQTtBQUNBLCtCQUErQixNQUFNO0FBQ3JDO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYSxPQUFPO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVcsT0FBTztBQUNsQjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBOzs7QUFHQTs7O0FBR0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQUE7O0FBRVQ7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsQ0FBQzs7Ozs7OztBQ3puQ0QsbUM7Ozs7Ozs7QUNBQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFO0FBQ0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7Ozs7OztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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O1FBQ3RELE1BQU0sQ0FBQztZQUNOLElBQUksRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQztZQUN2QyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDbkMsT0FBTyxFQUFFLFlBQVksQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO1NBQzVDLENBQUM7SUFDSCxDQUFDO0FBRUYsQ0FBQyxFQTdEYSxNQUFNLEdBQU4sY0FBTSxLQUFOLGNBQU0sUUE2RG5CIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMyk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNmJhOTVkOTdjNjg4MmQ3MzU0ZjUiLCJcInVzZSBzdHJpY3RcIjtcblxuY29uc3QgSlNPTjUgPSByZXF1aXJlKFwianNvbjVcIik7XG5cbmNvbnN0IHNwZWNpYWxWYWx1ZXMgPSB7XG5cdFwibnVsbFwiOiBudWxsLFxuXHRcInRydWVcIjogdHJ1ZSxcblx0XCJmYWxzZVwiOiBmYWxzZVxufTtcblxuZnVuY3Rpb24gcGFyc2VRdWVyeShxdWVyeSkge1xuXHRpZihxdWVyeS5zdWJzdHIoMCwgMSkgIT09IFwiP1wiKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiQSB2YWxpZCBxdWVyeSBzdHJpbmcgcGFzc2VkIHRvIHBhcnNlUXVlcnkgc2hvdWxkIGJlZ2luIHdpdGggJz8nXCIpO1xuXHR9XG5cdHF1ZXJ5ID0gcXVlcnkuc3Vic3RyKDEpO1xuXHRpZighcXVlcnkpIHtcblx0XHRyZXR1cm4ge307XG5cdH1cblx0aWYocXVlcnkuc3Vic3RyKDAsIDEpID09PSBcIntcIiAmJiBxdWVyeS5zdWJzdHIoLTEpID09PSBcIn1cIikge1xuXHRcdHJldHVybiBKU09ONS5wYXJzZShxdWVyeSk7XG5cdH1cblx0Y29uc3QgcXVlcnlBcmdzID0gcXVlcnkuc3BsaXQoL1ssJl0vZyk7XG5cdGNvbnN0IHJlc3VsdCA9IHt9O1xuXHRxdWVyeUFyZ3MuZm9yRWFjaChhcmcgPT4ge1xuXHRcdGNvbnN0IGlkeCA9IGFyZy5pbmRleE9mKFwiPVwiKTtcblx0XHRpZihpZHggPj0gMCkge1xuXHRcdFx0bGV0IG5hbWUgPSBhcmcuc3Vic3RyKDAsIGlkeCk7XG5cdFx0XHRsZXQgdmFsdWUgPSBkZWNvZGVVUklDb21wb25lbnQoYXJnLnN1YnN0cihpZHggKyAxKSk7XG5cdFx0XHRpZihzcGVjaWFsVmFsdWVzLmhhc093blByb3BlcnR5KHZhbHVlKSkge1xuXHRcdFx0XHR2YWx1ZSA9IHNwZWNpYWxWYWx1ZXNbdmFsdWVdO1xuXHRcdFx0fVxuXHRcdFx0aWYobmFtZS5zdWJzdHIoLTIpID09PSBcIltdXCIpIHtcblx0XHRcdFx0bmFtZSA9IGRlY29kZVVSSUNvbXBvbmVudChuYW1lLnN1YnN0cigwLCBuYW1lLmxlbmd0aCAtIDIpKTtcblx0XHRcdFx0aWYoIUFycmF5LmlzQXJyYXkocmVzdWx0W25hbWVdKSlcblx0XHRcdFx0XHRyZXN1bHRbbmFtZV0gPSBbXTtcblx0XHRcdFx0cmVzdWx0W25hbWVdLnB1c2godmFsdWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0bmFtZSA9IGRlY29kZVVSSUNvbXBvbmVudChuYW1lKTtcblx0XHRcdFx0cmVzdWx0W25hbWVdID0gdmFsdWU7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmKGFyZy5zdWJzdHIoMCwgMSkgPT09IFwiLVwiKSB7XG5cdFx0XHRcdHJlc3VsdFtkZWNvZGVVUklDb21wb25lbnQoYXJnLnN1YnN0cigxKSldID0gZmFsc2U7XG5cdFx0XHR9IGVsc2UgaWYoYXJnLnN1YnN0cigwLCAxKSA9PT0gXCIrXCIpIHtcblx0XHRcdFx0cmVzdWx0W2RlY29kZVVSSUNvbXBvbmVudChhcmcuc3Vic3RyKDEpKV0gPSB0cnVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmVzdWx0W2RlY29kZVVSSUNvbXBvbmVudChhcmcpXSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZVF1ZXJ5O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbG9hZGVyLXV0aWxzL2xpYi9wYXJzZVF1ZXJ5LmpzXG4vLyBtb2R1bGUgaWQgPSAwXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcInBhdGhcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJwYXRoXCJcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmNvbnN0IGJhc2VFbmNvZGVUYWJsZXMgPSB7XG5cdDI2OiBcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCIsXG5cdDMyOiBcIjEyMzQ1Njc4OWFiY2RlZmdoamttbnBxcnN0dXZ3eHl6XCIsIC8vIG5vIDBsaW9cblx0MzY6IFwiMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XCIsXG5cdDQ5OiBcImFiY2RlZmdoaWprbW5vcHFyc3R1dnd4eXpBQkNERUZHSEpLTE1OUFFSU1RVVldYWVpcIiwgLy8gbm8gbElPXG5cdDUyOiBcImFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpcIixcblx0NTg6IFwiMTIzNDU2Nzg5YWJjZGVmZ2hpamttbm9wcXJzdHV2d3h5ekFCQ0RFRkdISktMTU5QUVJTVFVWV1hZWlwiLCAvLyBubyAwbElPXG5cdDYyOiBcIjAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXCIsXG5cdDY0OiBcIjAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaLV9cIlxufTtcblxuZnVuY3Rpb24gZW5jb2RlQnVmZmVyVG9CYXNlKGJ1ZmZlciwgYmFzZSkge1xuXHRjb25zdCBlbmNvZGVUYWJsZSA9IGJhc2VFbmNvZGVUYWJsZXNbYmFzZV07XG5cdGlmKCFlbmNvZGVUYWJsZSkgdGhyb3cgbmV3IEVycm9yKFwiVW5rbm93biBlbmNvZGluZyBiYXNlXCIgKyBiYXNlKTtcblxuXHRjb25zdCByZWFkTGVuZ3RoID0gYnVmZmVyLmxlbmd0aDtcblxuXHRjb25zdCBCaWcgPSByZXF1aXJlKFwiYmlnLmpzXCIpO1xuXHRCaWcuUk0gPSBCaWcuRFAgPSAwO1xuXHRsZXQgYiA9IG5ldyBCaWcoMCk7XG5cdGZvcihsZXQgaSA9IHJlYWRMZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdGIgPSBiLnRpbWVzKDI1NikucGx1cyhidWZmZXJbaV0pO1xuXHR9XG5cblx0bGV0IG91dHB1dCA9IFwiXCI7XG5cdHdoaWxlKGIuZ3QoMCkpIHtcblx0XHRvdXRwdXQgPSBlbmNvZGVUYWJsZVtiLm1vZChiYXNlKV0gKyBvdXRwdXQ7XG5cdFx0YiA9IGIuZGl2KGJhc2UpO1xuXHR9XG5cblx0QmlnLkRQID0gMjA7XG5cdEJpZy5STSA9IDE7XG5cblx0cmV0dXJuIG91dHB1dDtcbn1cblxuZnVuY3Rpb24gZ2V0SGFzaERpZ2VzdChidWZmZXIsIGhhc2hUeXBlLCBkaWdlc3RUeXBlLCBtYXhMZW5ndGgpIHtcblx0aGFzaFR5cGUgPSBoYXNoVHlwZSB8fCBcIm1kNVwiO1xuXHRtYXhMZW5ndGggPSBtYXhMZW5ndGggfHwgOTk5OTtcblx0Y29uc3QgaGFzaCA9IHJlcXVpcmUoXCJjcnlwdG9cIikuY3JlYXRlSGFzaChoYXNoVHlwZSk7XG5cdGhhc2gudXBkYXRlKGJ1ZmZlcik7XG5cdGlmKGRpZ2VzdFR5cGUgPT09IFwiYmFzZTI2XCIgfHwgZGlnZXN0VHlwZSA9PT0gXCJiYXNlMzJcIiB8fCBkaWdlc3RUeXBlID09PSBcImJhc2UzNlwiIHx8XG5cdFx0ZGlnZXN0VHlwZSA9PT0gXCJiYXNlNDlcIiB8fCBkaWdlc3RUeXBlID09PSBcImJhc2U1MlwiIHx8IGRpZ2VzdFR5cGUgPT09IFwiYmFzZTU4XCIgfHxcblx0XHRkaWdlc3RUeXBlID09PSBcImJhc2U2MlwiIHx8IGRpZ2VzdFR5cGUgPT09IFwiYmFzZTY0XCIpIHtcblx0XHRyZXR1cm4gZW5jb2RlQnVmZmVyVG9CYXNlKGhhc2guZGlnZXN0KCksIGRpZ2VzdFR5cGUuc3Vic3RyKDQpKS5zdWJzdHIoMCwgbWF4TGVuZ3RoKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gaGFzaC5kaWdlc3QoZGlnZXN0VHlwZSB8fCBcImhleFwiKS5zdWJzdHIoMCwgbWF4TGVuZ3RoKTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEhhc2hEaWdlc3Q7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9sb2FkZXItdXRpbHMvbGliL2dldEhhc2hEaWdlc3QuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHdlYnBhY2sgPSByZXF1aXJlKCd3ZWJwYWNrJyk7XG5pbXBvcnQgTG9hZGVyQ29udGV4dCA9IHdlYnBhY2subG9hZGVyLkxvYWRlckNvbnRleHQ7XG5pbXBvcnQge2dldE9wdGlvbnN9IGZyb20gJ2xvYWRlci11dGlscyc7XG5pbXBvcnQge0VtaXR0ZXJ9IGZyb20gJy4vc3ludGhlc2lzL2VtaXR0ZXInO1xuaW1wb3J0IHtMZXhlcn0gZnJvbSAnLi9zeW50YXgvbGV4ZXInO1xuaW1wb3J0IHtQYXJzZXJ9IGZyb20gJy4vc2VtYW50aWNzL3BhcnNlcic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChzb3VyY2U6IHN0cmluZykge1xuXHRyZXR1cm4gY29tcGlsZXIuY2FsbCh0aGlzLCBzb3VyY2UpO1xufVxuXG5mdW5jdGlvbiBjb21waWxlcih0aGlzOiBMb2FkZXJDb250ZXh0LCBzb3VyY2U6IHN0cmluZykge1xuXHRjb25zdCBvcHRpb25zID0gZ2V0T3B0aW9ucyh0aGlzKSB8fCB7fTtcblx0Ly8gY29uc3QgaW5zdGFuY2VOYW1lID0gb3B0aW9ucy5pbnN0YW5jZSB8fCAnc295LWRlY2xhcmF0aW9uLWxvYWRlcic7XG5cdGNvbnN0IGNhbGxiYWNrID0gdGhpcy5hc3luYygpO1xuXHRpZiAoIXNvdXJjZSAmJiBjYWxsYmFjaykge1xuXHRcdHJldHVybiBjYWxsYmFjayhudWxsLCAnJyk7XG5cdH1cblx0Y29uc3QgZW1pdHRlciA9IG5ldyBFbWl0dGVyKG9wdGlvbnMpO1xuXG5cdGNvbnN0IHRlbXBsYXRlRGVjbGFyYXRpb24gPSBMZXhlci50b2tlbml6ZShzb3VyY2UpO1xuXHRjb25zdCByb290TmFtZXNwYWNlTm9kZSA9IFBhcnNlci5nZW5lcmF0ZVJvb3ROYW1lc3BhY2VOb2RlKHRlbXBsYXRlRGVjbGFyYXRpb24pO1xuXHRjb25zdCB0YXJnZXRUeXBlRGVjbGFyYXRpb24gPSBlbWl0dGVyLmZvcm1hdChyb290TmFtZXNwYWNlTm9kZSk7XG5cblx0dGhpcy5lbWl0RmlsZSh0aGlzLnJlc291cmNlUGF0aCwgdGFyZ2V0VHlwZURlY2xhcmF0aW9uLCB1bmRlZmluZWQpO1xuXG5cdGlmIChjYWxsYmFjaykge1xuXHRcdHJldHVybiBjYWxsYmFjayhudWxsLCB0YXJnZXRUeXBlRGVjbGFyYXRpb24sIHVuZGVmaW5lZCk7XG5cdH1cblx0cmV0dXJuIHRhcmdldFR5cGVEZWNsYXJhdGlvbjtcbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9pbmRleC50cyIsIlwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBnZXRPcHRpb25zID0gcmVxdWlyZShcIi4vZ2V0T3B0aW9uc1wiKTtcbmNvbnN0IHBhcnNlUXVlcnkgPSByZXF1aXJlKFwiLi9wYXJzZVF1ZXJ5XCIpO1xuY29uc3Qgc3RyaW5naWZ5UmVxdWVzdCA9IHJlcXVpcmUoXCIuL3N0cmluZ2lmeVJlcXVlc3RcIik7XG5jb25zdCBnZXRSZW1haW5pbmdSZXF1ZXN0ID0gcmVxdWlyZShcIi4vZ2V0UmVtYWluaW5nUmVxdWVzdFwiKTtcbmNvbnN0IGdldEN1cnJlbnRSZXF1ZXN0ID0gcmVxdWlyZShcIi4vZ2V0Q3VycmVudFJlcXVlc3RcIik7XG5jb25zdCBpc1VybFJlcXVlc3QgPSByZXF1aXJlKFwiLi9pc1VybFJlcXVlc3RcIik7XG5jb25zdCB1cmxUb1JlcXVlc3QgPSByZXF1aXJlKFwiLi91cmxUb1JlcXVlc3RcIik7XG5jb25zdCBwYXJzZVN0cmluZyA9IHJlcXVpcmUoXCIuL3BhcnNlU3RyaW5nXCIpO1xuY29uc3QgZ2V0SGFzaERpZ2VzdCA9IHJlcXVpcmUoXCIuL2dldEhhc2hEaWdlc3RcIik7XG5jb25zdCBpbnRlcnBvbGF0ZU5hbWUgPSByZXF1aXJlKFwiLi9pbnRlcnBvbGF0ZU5hbWVcIik7XG5cbmV4cG9ydHMuZ2V0T3B0aW9ucyA9IGdldE9wdGlvbnM7XG5leHBvcnRzLnBhcnNlUXVlcnkgPSBwYXJzZVF1ZXJ5O1xuZXhwb3J0cy5zdHJpbmdpZnlSZXF1ZXN0ID0gc3RyaW5naWZ5UmVxdWVzdDtcbmV4cG9ydHMuZ2V0UmVtYWluaW5nUmVxdWVzdCA9IGdldFJlbWFpbmluZ1JlcXVlc3Q7XG5leHBvcnRzLmdldEN1cnJlbnRSZXF1ZXN0ID0gZ2V0Q3VycmVudFJlcXVlc3Q7XG5leHBvcnRzLmlzVXJsUmVxdWVzdCA9IGlzVXJsUmVxdWVzdDtcbmV4cG9ydHMudXJsVG9SZXF1ZXN0ID0gdXJsVG9SZXF1ZXN0O1xuZXhwb3J0cy5wYXJzZVN0cmluZyA9IHBhcnNlU3RyaW5nO1xuZXhwb3J0cy5nZXRIYXNoRGlnZXN0ID0gZ2V0SGFzaERpZ2VzdDtcbmV4cG9ydHMuaW50ZXJwb2xhdGVOYW1lID0gaW50ZXJwb2xhdGVOYW1lO1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbG9hZGVyLXV0aWxzL2xpYi9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcblxuY29uc3QgcGFyc2VRdWVyeSA9IHJlcXVpcmUoXCIuL3BhcnNlUXVlcnlcIik7XG5cbmZ1bmN0aW9uIGdldE9wdGlvbnMobG9hZGVyQ29udGV4dCkge1xuXHRjb25zdCBxdWVyeSA9IGxvYWRlckNvbnRleHQucXVlcnk7XG5cdGlmKHR5cGVvZiBxdWVyeSA9PT0gXCJzdHJpbmdcIiAmJiBxdWVyeSAhPT0gXCJcIikge1xuXHRcdHJldHVybiBwYXJzZVF1ZXJ5KGxvYWRlckNvbnRleHQucXVlcnkpO1xuXHR9XG5cdGlmKCFxdWVyeSB8fCB0eXBlb2YgcXVlcnkgIT09IFwib2JqZWN0XCIpIHtcblx0XHQvLyBOb3Qgb2JqZWN0LWxpa2UgcXVlcmllcyBhcmUgbm90IHN1cHBvcnRlZC5cblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRyZXR1cm4gcXVlcnk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0T3B0aW9ucztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvZ2V0T3B0aW9ucy5qc1xuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCIvLyBqc29uNS5qc1xuLy8gTW9kZXJuIEpTT04uIFNlZSBSRUFETUUubWQgZm9yIGRldGFpbHMuXG4vL1xuLy8gVGhpcyBmaWxlIGlzIGJhc2VkIGRpcmVjdGx5IG9mZiBvZiBEb3VnbGFzIENyb2NrZm9yZCdzIGpzb25fcGFyc2UuanM6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vZG91Z2xhc2Nyb2NrZm9yZC9KU09OLWpzL2Jsb2IvbWFzdGVyL2pzb25fcGFyc2UuanNcblxudmFyIEpTT041ID0gKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyA/IGV4cG9ydHMgOiB7fSk7XG5cbkpTT041LnBhcnNlID0gKGZ1bmN0aW9uICgpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuLy8gVGhpcyBpcyBhIGZ1bmN0aW9uIHRoYXQgY2FuIHBhcnNlIGEgSlNPTjUgdGV4dCwgcHJvZHVjaW5nIGEgSmF2YVNjcmlwdFxuLy8gZGF0YSBzdHJ1Y3R1cmUuIEl0IGlzIGEgc2ltcGxlLCByZWN1cnNpdmUgZGVzY2VudCBwYXJzZXIuIEl0IGRvZXMgbm90IHVzZVxuLy8gZXZhbCBvciByZWd1bGFyIGV4cHJlc3Npb25zLCBzbyBpdCBjYW4gYmUgdXNlZCBhcyBhIG1vZGVsIGZvciBpbXBsZW1lbnRpbmdcbi8vIGEgSlNPTjUgcGFyc2VyIGluIG90aGVyIGxhbmd1YWdlcy5cblxuLy8gV2UgYXJlIGRlZmluaW5nIHRoZSBmdW5jdGlvbiBpbnNpZGUgb2YgYW5vdGhlciBmdW5jdGlvbiB0byBhdm9pZCBjcmVhdGluZ1xuLy8gZ2xvYmFsIHZhcmlhYmxlcy5cblxuICAgIHZhciBhdCwgICAgICAgICAgIC8vIFRoZSBpbmRleCBvZiB0aGUgY3VycmVudCBjaGFyYWN0ZXJcbiAgICAgICAgbGluZU51bWJlciwgICAvLyBUaGUgY3VycmVudCBsaW5lIG51bWJlclxuICAgICAgICBjb2x1bW5OdW1iZXIsIC8vIFRoZSBjdXJyZW50IGNvbHVtbiBudW1iZXJcbiAgICAgICAgY2gsICAgICAgICAgICAvLyBUaGUgY3VycmVudCBjaGFyYWN0ZXJcbiAgICAgICAgZXNjYXBlZSA9IHtcbiAgICAgICAgICAgIFwiJ1wiOiAgXCInXCIsXG4gICAgICAgICAgICAnXCInOiAgJ1wiJyxcbiAgICAgICAgICAgICdcXFxcJzogJ1xcXFwnLFxuICAgICAgICAgICAgJy8nOiAgJy8nLFxuICAgICAgICAgICAgJ1xcbic6ICcnLCAgICAgICAvLyBSZXBsYWNlIGVzY2FwZWQgbmV3bGluZXMgaW4gc3RyaW5ncyB3LyBlbXB0eSBzdHJpbmdcbiAgICAgICAgICAgIGI6ICAgICdcXGInLFxuICAgICAgICAgICAgZjogICAgJ1xcZicsXG4gICAgICAgICAgICBuOiAgICAnXFxuJyxcbiAgICAgICAgICAgIHI6ICAgICdcXHInLFxuICAgICAgICAgICAgdDogICAgJ1xcdCdcbiAgICAgICAgfSxcbiAgICAgICAgd3MgPSBbXG4gICAgICAgICAgICAnICcsXG4gICAgICAgICAgICAnXFx0JyxcbiAgICAgICAgICAgICdcXHInLFxuICAgICAgICAgICAgJ1xcbicsXG4gICAgICAgICAgICAnXFx2JyxcbiAgICAgICAgICAgICdcXGYnLFxuICAgICAgICAgICAgJ1xceEEwJyxcbiAgICAgICAgICAgICdcXHVGRUZGJ1xuICAgICAgICBdLFxuICAgICAgICB0ZXh0LFxuXG4gICAgICAgIHJlbmRlckNoYXIgPSBmdW5jdGlvbiAoY2hyKSB7XG4gICAgICAgICAgICByZXR1cm4gY2hyID09PSAnJyA/ICdFT0YnIDogXCInXCIgKyBjaHIgKyBcIidcIjtcbiAgICAgICAgfSxcblxuICAgICAgICBlcnJvciA9IGZ1bmN0aW9uIChtKSB7XG5cbi8vIENhbGwgZXJyb3Igd2hlbiBzb21ldGhpbmcgaXMgd3JvbmcuXG5cbiAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBTeW50YXhFcnJvcigpO1xuICAgICAgICAgICAgLy8gYmVnaW5uaW5nIG9mIG1lc3NhZ2Ugc3VmZml4IHRvIGFncmVlIHdpdGggdGhhdCBwcm92aWRlZCBieSBHZWNrbyAtIHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9KU09OL3BhcnNlXG4gICAgICAgICAgICBlcnJvci5tZXNzYWdlID0gbSArIFwiIGF0IGxpbmUgXCIgKyBsaW5lTnVtYmVyICsgXCIgY29sdW1uIFwiICsgY29sdW1uTnVtYmVyICsgXCIgb2YgdGhlIEpTT041IGRhdGEuIFN0aWxsIHRvIHJlYWQ6IFwiICsgSlNPTi5zdHJpbmdpZnkodGV4dC5zdWJzdHJpbmcoYXQgLSAxLCBhdCArIDE5KSk7XG4gICAgICAgICAgICBlcnJvci5hdCA9IGF0O1xuICAgICAgICAgICAgLy8gVGhlc2UgdHdvIHByb3BlcnR5IG5hbWVzIGhhdmUgYmVlbiBjaG9zZW4gdG8gYWdyZWUgd2l0aCB0aGUgb25lcyBpbiBHZWNrbywgdGhlIG9ubHkgcG9wdWxhclxuICAgICAgICAgICAgLy8gZW52aXJvbm1lbnQgd2hpY2ggc2VlbXMgdG8gc3VwcGx5IHRoaXMgaW5mbyBvbiBKU09OLnBhcnNlXG4gICAgICAgICAgICBlcnJvci5saW5lTnVtYmVyID0gbGluZU51bWJlcjtcbiAgICAgICAgICAgIGVycm9yLmNvbHVtbk51bWJlciA9IGNvbHVtbk51bWJlcjtcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICB9LFxuXG4gICAgICAgIG5leHQgPSBmdW5jdGlvbiAoYykge1xuXG4vLyBJZiBhIGMgcGFyYW1ldGVyIGlzIHByb3ZpZGVkLCB2ZXJpZnkgdGhhdCBpdCBtYXRjaGVzIHRoZSBjdXJyZW50IGNoYXJhY3Rlci5cblxuICAgICAgICAgICAgaWYgKGMgJiYgYyAhPT0gY2gpIHtcbiAgICAgICAgICAgICAgICBlcnJvcihcIkV4cGVjdGVkIFwiICsgcmVuZGVyQ2hhcihjKSArIFwiIGluc3RlYWQgb2YgXCIgKyByZW5kZXJDaGFyKGNoKSk7XG4gICAgICAgICAgICB9XG5cbi8vIEdldCB0aGUgbmV4dCBjaGFyYWN0ZXIuIFdoZW4gdGhlcmUgYXJlIG5vIG1vcmUgY2hhcmFjdGVycyxcbi8vIHJldHVybiB0aGUgZW1wdHkgc3RyaW5nLlxuXG4gICAgICAgICAgICBjaCA9IHRleHQuY2hhckF0KGF0KTtcbiAgICAgICAgICAgIGF0Kys7XG4gICAgICAgICAgICBjb2x1bW5OdW1iZXIrKztcbiAgICAgICAgICAgIGlmIChjaCA9PT0gJ1xcbicgfHwgY2ggPT09ICdcXHInICYmIHBlZWsoKSAhPT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgICBsaW5lTnVtYmVyKys7XG4gICAgICAgICAgICAgICAgY29sdW1uTnVtYmVyID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjaDtcbiAgICAgICAgfSxcblxuICAgICAgICBwZWVrID0gZnVuY3Rpb24gKCkge1xuXG4vLyBHZXQgdGhlIG5leHQgY2hhcmFjdGVyIHdpdGhvdXQgY29uc3VtaW5nIGl0IG9yXG4vLyBhc3NpZ25pbmcgaXQgdG8gdGhlIGNoIHZhcmFpYmxlLlxuXG4gICAgICAgICAgICByZXR1cm4gdGV4dC5jaGFyQXQoYXQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlkZW50aWZpZXIgPSBmdW5jdGlvbiAoKSB7XG5cbi8vIFBhcnNlIGFuIGlkZW50aWZpZXIuIE5vcm1hbGx5LCByZXNlcnZlZCB3b3JkcyBhcmUgZGlzYWxsb3dlZCBoZXJlLCBidXQgd2Vcbi8vIG9ubHkgdXNlIHRoaXMgZm9yIHVucXVvdGVkIG9iamVjdCBrZXlzLCB3aGVyZSByZXNlcnZlZCB3b3JkcyBhcmUgYWxsb3dlZCxcbi8vIHNvIHdlIGRvbid0IGNoZWNrIGZvciB0aG9zZSBoZXJlLiBSZWZlcmVuY2VzOlxuLy8gLSBodHRwOi8vZXM1LmdpdGh1Yi5jb20vI3g3LjZcbi8vIC0gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vQ29yZV9KYXZhU2NyaXB0XzEuNV9HdWlkZS9Db3JlX0xhbmd1YWdlX0ZlYXR1cmVzI1ZhcmlhYmxlc1xuLy8gLSBodHRwOi8vZG9jc3RvcmUubWlrLnVhL29yZWxseS93ZWJwcm9nL2pzY3JpcHQvY2gwMl8wNy5odG1cbi8vIFRPRE8gSWRlbnRpZmllcnMgY2FuIGhhdmUgVW5pY29kZSBcImxldHRlcnNcIiBpbiB0aGVtOyBhZGQgc3VwcG9ydCBmb3IgdGhvc2UuXG5cbiAgICAgICAgICAgIHZhciBrZXkgPSBjaDtcblxuICAgICAgICAgICAgLy8gSWRlbnRpZmllcnMgbXVzdCBzdGFydCB3aXRoIGEgbGV0dGVyLCBfIG9yICQuXG4gICAgICAgICAgICBpZiAoKGNoICE9PSAnXycgJiYgY2ggIT09ICckJykgJiZcbiAgICAgICAgICAgICAgICAgICAgKGNoIDwgJ2EnIHx8IGNoID4gJ3onKSAmJlxuICAgICAgICAgICAgICAgICAgICAoY2ggPCAnQScgfHwgY2ggPiAnWicpKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IoXCJCYWQgaWRlbnRpZmllciBhcyB1bnF1b3RlZCBrZXlcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFN1YnNlcXVlbnQgY2hhcmFjdGVycyBjYW4gY29udGFpbiBkaWdpdHMuXG4gICAgICAgICAgICB3aGlsZSAobmV4dCgpICYmIChcbiAgICAgICAgICAgICAgICAgICAgY2ggPT09ICdfJyB8fCBjaCA9PT0gJyQnIHx8XG4gICAgICAgICAgICAgICAgICAgIChjaCA+PSAnYScgJiYgY2ggPD0gJ3onKSB8fFxuICAgICAgICAgICAgICAgICAgICAoY2ggPj0gJ0EnICYmIGNoIDw9ICdaJykgfHxcbiAgICAgICAgICAgICAgICAgICAgKGNoID49ICcwJyAmJiBjaCA8PSAnOScpKSkge1xuICAgICAgICAgICAgICAgIGtleSArPSBjaDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGtleTtcbiAgICAgICAgfSxcblxuICAgICAgICBudW1iZXIgPSBmdW5jdGlvbiAoKSB7XG5cbi8vIFBhcnNlIGEgbnVtYmVyIHZhbHVlLlxuXG4gICAgICAgICAgICB2YXIgbnVtYmVyLFxuICAgICAgICAgICAgICAgIHNpZ24gPSAnJyxcbiAgICAgICAgICAgICAgICBzdHJpbmcgPSAnJyxcbiAgICAgICAgICAgICAgICBiYXNlID0gMTA7XG5cbiAgICAgICAgICAgIGlmIChjaCA9PT0gJy0nIHx8IGNoID09PSAnKycpIHtcbiAgICAgICAgICAgICAgICBzaWduID0gY2g7XG4gICAgICAgICAgICAgICAgbmV4dChjaCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHN1cHBvcnQgZm9yIEluZmluaXR5IChjb3VsZCB0d2VhayB0byBhbGxvdyBvdGhlciB3b3Jkcyk6XG4gICAgICAgICAgICBpZiAoY2ggPT09ICdJJykge1xuICAgICAgICAgICAgICAgIG51bWJlciA9IHdvcmQoKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG51bWJlciAhPT0gJ251bWJlcicgfHwgaXNOYU4obnVtYmVyKSkge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcignVW5leHBlY3RlZCB3b3JkIGZvciBudW1iZXInKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIChzaWduID09PSAnLScpID8gLW51bWJlciA6IG51bWJlcjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gc3VwcG9ydCBmb3IgTmFOXG4gICAgICAgICAgICBpZiAoY2ggPT09ICdOJyApIHtcbiAgICAgICAgICAgICAgbnVtYmVyID0gd29yZCgpO1xuICAgICAgICAgICAgICBpZiAoIWlzTmFOKG51bWJlcikpIHtcbiAgICAgICAgICAgICAgICBlcnJvcignZXhwZWN0ZWQgd29yZCB0byBiZSBOYU4nKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyBpZ25vcmUgc2lnbiBhcyAtTmFOIGFsc28gaXMgTmFOXG4gICAgICAgICAgICAgIHJldHVybiBudW1iZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjaCA9PT0gJzAnKSB7XG4gICAgICAgICAgICAgICAgc3RyaW5nICs9IGNoO1xuICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICd4JyB8fCBjaCA9PT0gJ1gnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSBjaDtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBiYXNlID0gMTY7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjaCA+PSAnMCcgJiYgY2ggPD0gJzknKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yKCdPY3RhbCBsaXRlcmFsJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKGJhc2UpIHtcbiAgICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgICAgICAgd2hpbGUgKGNoID49ICcwJyAmJiBjaCA8PSAnOScgKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSBjaDtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICcuJykge1xuICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gJy4nO1xuICAgICAgICAgICAgICAgICAgICB3aGlsZSAobmV4dCgpICYmIGNoID49ICcwJyAmJiBjaCA8PSAnOScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSBjaDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdlJyB8fCBjaCA9PT0gJ0UnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSBjaDtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICctJyB8fCBjaCA9PT0gJysnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJpbmcgKz0gY2g7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGNoID49ICcwJyAmJiBjaCA8PSAnOScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSBjaDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTY6XG4gICAgICAgICAgICAgICAgd2hpbGUgKGNoID49ICcwJyAmJiBjaCA8PSAnOScgfHwgY2ggPj0gJ0EnICYmIGNoIDw9ICdGJyB8fCBjaCA+PSAnYScgJiYgY2ggPD0gJ2YnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSBjaDtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYoc2lnbiA9PT0gJy0nKSB7XG4gICAgICAgICAgICAgICAgbnVtYmVyID0gLXN0cmluZztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbnVtYmVyID0gK3N0cmluZztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFpc0Zpbml0ZShudW1iZXIpKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IoXCJCYWQgbnVtYmVyXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVtYmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHN0cmluZyA9IGZ1bmN0aW9uICgpIHtcblxuLy8gUGFyc2UgYSBzdHJpbmcgdmFsdWUuXG5cbiAgICAgICAgICAgIHZhciBoZXgsXG4gICAgICAgICAgICAgICAgaSxcbiAgICAgICAgICAgICAgICBzdHJpbmcgPSAnJyxcbiAgICAgICAgICAgICAgICBkZWxpbSwgICAgICAvLyBkb3VibGUgcXVvdGUgb3Igc2luZ2xlIHF1b3RlXG4gICAgICAgICAgICAgICAgdWZmZmY7XG5cbi8vIFdoZW4gcGFyc2luZyBmb3Igc3RyaW5nIHZhbHVlcywgd2UgbXVzdCBsb29rIGZvciAnIG9yIFwiIGFuZCBcXCBjaGFyYWN0ZXJzLlxuXG4gICAgICAgICAgICBpZiAoY2ggPT09ICdcIicgfHwgY2ggPT09IFwiJ1wiKSB7XG4gICAgICAgICAgICAgICAgZGVsaW0gPSBjaDtcbiAgICAgICAgICAgICAgICB3aGlsZSAobmV4dCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gZGVsaW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2ggPT09ICdcXFxcJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoID09PSAndScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1ZmZmZiA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IDQ7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZXggPSBwYXJzZUludChuZXh0KCksIDE2KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0Zpbml0ZShoZXgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1ZmZmZiA9IHVmZmZmICogMTYgKyBoZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHVmZmZmKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2ggPT09ICdcXHInKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBlZWsoKSA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGVzY2FwZWVbY2hdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0cmluZyArPSBlc2NhcGVlW2NoXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2ggPT09ICdcXG4nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB1bmVzY2FwZWQgbmV3bGluZXMgYXJlIGludmFsaWQ7IHNlZTpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hc2VlbWsvanNvbjUvaXNzdWVzLzI0XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIHRoaXMgZmVlbHMgc3BlY2lhbC1jYXNlZDsgYXJlIHRoZXJlIG90aGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBpbnZhbGlkIHVuZXNjYXBlZCBjaGFycz9cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RyaW5nICs9IGNoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXJyb3IoXCJCYWQgc3RyaW5nXCIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGlubGluZUNvbW1lbnQgPSBmdW5jdGlvbiAoKSB7XG5cbi8vIFNraXAgYW4gaW5saW5lIGNvbW1lbnQsIGFzc3VtaW5nIHRoaXMgaXMgb25lLiBUaGUgY3VycmVudCBjaGFyYWN0ZXIgc2hvdWxkXG4vLyBiZSB0aGUgc2Vjb25kIC8gY2hhcmFjdGVyIGluIHRoZSAvLyBwYWlyIHRoYXQgYmVnaW5zIHRoaXMgaW5saW5lIGNvbW1lbnQuXG4vLyBUbyBmaW5pc2ggdGhlIGlubGluZSBjb21tZW50LCB3ZSBsb29rIGZvciBhIG5ld2xpbmUgb3IgdGhlIGVuZCBvZiB0aGUgdGV4dC5cblxuICAgICAgICAgICAgaWYgKGNoICE9PSAnLycpIHtcbiAgICAgICAgICAgICAgICBlcnJvcihcIk5vdCBhbiBpbmxpbmUgY29tbWVudFwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICdcXG4nIHx8IGNoID09PSAnXFxyJykge1xuICAgICAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IHdoaWxlIChjaCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmxvY2tDb21tZW50ID0gZnVuY3Rpb24gKCkge1xuXG4vLyBTa2lwIGEgYmxvY2sgY29tbWVudCwgYXNzdW1pbmcgdGhpcyBpcyBvbmUuIFRoZSBjdXJyZW50IGNoYXJhY3RlciBzaG91bGQgYmVcbi8vIHRoZSAqIGNoYXJhY3RlciBpbiB0aGUgLyogcGFpciB0aGF0IGJlZ2lucyB0aGlzIGJsb2NrIGNvbW1lbnQuXG4vLyBUbyBmaW5pc2ggdGhlIGJsb2NrIGNvbW1lbnQsIHdlIGxvb2sgZm9yIGFuIGVuZGluZyAqLyBwYWlyIG9mIGNoYXJhY3RlcnMsXG4vLyBidXQgd2UgYWxzbyB3YXRjaCBmb3IgdGhlIGVuZCBvZiB0ZXh0IGJlZm9yZSB0aGUgY29tbWVudCBpcyB0ZXJtaW5hdGVkLlxuXG4gICAgICAgICAgICBpZiAoY2ggIT09ICcqJykge1xuICAgICAgICAgICAgICAgIGVycm9yKFwiTm90IGEgYmxvY2sgY29tbWVudFwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICB3aGlsZSAoY2ggPT09ICcqJykge1xuICAgICAgICAgICAgICAgICAgICBuZXh0KCcqJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0KCcvJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IHdoaWxlIChjaCk7XG5cbiAgICAgICAgICAgIGVycm9yKFwiVW50ZXJtaW5hdGVkIGJsb2NrIGNvbW1lbnRcIik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY29tbWVudCA9IGZ1bmN0aW9uICgpIHtcblxuLy8gU2tpcCBhIGNvbW1lbnQsIHdoZXRoZXIgaW5saW5lIG9yIGJsb2NrLWxldmVsLCBhc3N1bWluZyB0aGlzIGlzIG9uZS5cbi8vIENvbW1lbnRzIGFsd2F5cyBiZWdpbiB3aXRoIGEgLyBjaGFyYWN0ZXIuXG5cbiAgICAgICAgICAgIGlmIChjaCAhPT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IoXCJOb3QgYSBjb21tZW50XCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBuZXh0KCcvJyk7XG5cbiAgICAgICAgICAgIGlmIChjaCA9PT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgaW5saW5lQ29tbWVudCgpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjaCA9PT0gJyonKSB7XG4gICAgICAgICAgICAgICAgYmxvY2tDb21tZW50KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVycm9yKFwiVW5yZWNvZ25pemVkIGNvbW1lbnRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgd2hpdGUgPSBmdW5jdGlvbiAoKSB7XG5cbi8vIFNraXAgd2hpdGVzcGFjZSBhbmQgY29tbWVudHMuXG4vLyBOb3RlIHRoYXQgd2UncmUgZGV0ZWN0aW5nIGNvbW1lbnRzIGJ5IG9ubHkgYSBzaW5nbGUgLyBjaGFyYWN0ZXIuXG4vLyBUaGlzIHdvcmtzIHNpbmNlIHJlZ3VsYXIgZXhwcmVzc2lvbnMgYXJlIG5vdCB2YWxpZCBKU09OKDUpLCBidXQgdGhpcyB3aWxsXG4vLyBicmVhayBpZiB0aGVyZSBhcmUgb3RoZXIgdmFsaWQgdmFsdWVzIHRoYXQgYmVnaW4gd2l0aCBhIC8gY2hhcmFjdGVyIVxuXG4gICAgICAgICAgICB3aGlsZSAoY2gpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICcvJykge1xuICAgICAgICAgICAgICAgICAgICBjb21tZW50KCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh3cy5pbmRleE9mKGNoKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHdvcmQgPSBmdW5jdGlvbiAoKSB7XG5cbi8vIHRydWUsIGZhbHNlLCBvciBudWxsLlxuXG4gICAgICAgICAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICAgICAgICBjYXNlICd0JzpcbiAgICAgICAgICAgICAgICBuZXh0KCd0Jyk7XG4gICAgICAgICAgICAgICAgbmV4dCgncicpO1xuICAgICAgICAgICAgICAgIG5leHQoJ3UnKTtcbiAgICAgICAgICAgICAgICBuZXh0KCdlJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICBjYXNlICdmJzpcbiAgICAgICAgICAgICAgICBuZXh0KCdmJyk7XG4gICAgICAgICAgICAgICAgbmV4dCgnYScpO1xuICAgICAgICAgICAgICAgIG5leHQoJ2wnKTtcbiAgICAgICAgICAgICAgICBuZXh0KCdzJyk7XG4gICAgICAgICAgICAgICAgbmV4dCgnZScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIGNhc2UgJ24nOlxuICAgICAgICAgICAgICAgIG5leHQoJ24nKTtcbiAgICAgICAgICAgICAgICBuZXh0KCd1Jyk7XG4gICAgICAgICAgICAgICAgbmV4dCgnbCcpO1xuICAgICAgICAgICAgICAgIG5leHQoJ2wnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIGNhc2UgJ0knOlxuICAgICAgICAgICAgICAgIG5leHQoJ0knKTtcbiAgICAgICAgICAgICAgICBuZXh0KCduJyk7XG4gICAgICAgICAgICAgICAgbmV4dCgnZicpO1xuICAgICAgICAgICAgICAgIG5leHQoJ2knKTtcbiAgICAgICAgICAgICAgICBuZXh0KCduJyk7XG4gICAgICAgICAgICAgICAgbmV4dCgnaScpO1xuICAgICAgICAgICAgICAgIG5leHQoJ3QnKTtcbiAgICAgICAgICAgICAgICBuZXh0KCd5Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEluZmluaXR5O1xuICAgICAgICAgICAgY2FzZSAnTic6XG4gICAgICAgICAgICAgIG5leHQoICdOJyApO1xuICAgICAgICAgICAgICBuZXh0KCAnYScgKTtcbiAgICAgICAgICAgICAgbmV4dCggJ04nICk7XG4gICAgICAgICAgICAgIHJldHVybiBOYU47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlcnJvcihcIlVuZXhwZWN0ZWQgXCIgKyByZW5kZXJDaGFyKGNoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsdWUsICAvLyBQbGFjZSBob2xkZXIgZm9yIHRoZSB2YWx1ZSBmdW5jdGlvbi5cblxuICAgICAgICBhcnJheSA9IGZ1bmN0aW9uICgpIHtcblxuLy8gUGFyc2UgYW4gYXJyYXkgdmFsdWUuXG5cbiAgICAgICAgICAgIHZhciBhcnJheSA9IFtdO1xuXG4gICAgICAgICAgICBpZiAoY2ggPT09ICdbJykge1xuICAgICAgICAgICAgICAgIG5leHQoJ1snKTtcbiAgICAgICAgICAgICAgICB3aGl0ZSgpO1xuICAgICAgICAgICAgICAgIHdoaWxlIChjaCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICddJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV4dCgnXScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFycmF5OyAgIC8vIFBvdGVudGlhbGx5IGVtcHR5IGFycmF5XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gRVM1IGFsbG93cyBvbWl0dGluZyBlbGVtZW50cyBpbiBhcnJheXMsIGUuZy4gWyxdIGFuZFxuICAgICAgICAgICAgICAgICAgICAvLyBbLG51bGxdLiBXZSBkb24ndCBhbGxvdyB0aGlzIGluIEpTT041LlxuICAgICAgICAgICAgICAgICAgICBpZiAoY2ggPT09ICcsJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3IoXCJNaXNzaW5nIGFycmF5IGVsZW1lbnRcIik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcnJheS5wdXNoKHZhbHVlKCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdoaXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlJ3Mgbm8gY29tbWEgYWZ0ZXIgdGhpcyB2YWx1ZSwgdGhpcyBuZWVkcyB0b1xuICAgICAgICAgICAgICAgICAgICAvLyBiZSB0aGUgZW5kIG9mIHRoZSBhcnJheS5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoICE9PSAnLCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQoJ10nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhcnJheTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBuZXh0KCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIHdoaXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXJyb3IoXCJCYWQgYXJyYXlcIik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuXG4vLyBQYXJzZSBhbiBvYmplY3QgdmFsdWUuXG5cbiAgICAgICAgICAgIHZhciBrZXksXG4gICAgICAgICAgICAgICAgb2JqZWN0ID0ge307XG5cbiAgICAgICAgICAgIGlmIChjaCA9PT0gJ3snKSB7XG4gICAgICAgICAgICAgICAgbmV4dCgneycpO1xuICAgICAgICAgICAgICAgIHdoaXRlKCk7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGNoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ30nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXh0KCd9Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqZWN0OyAgIC8vIFBvdGVudGlhbGx5IGVtcHR5IG9iamVjdFxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gS2V5cyBjYW4gYmUgdW5xdW90ZWQuIElmIHRoZXkgYXJlLCB0aGV5IG5lZWQgdG8gYmVcbiAgICAgICAgICAgICAgICAgICAgLy8gdmFsaWQgSlMgaWRlbnRpZmllcnMuXG4gICAgICAgICAgICAgICAgICAgIGlmIChjaCA9PT0gJ1wiJyB8fCBjaCA9PT0gXCInXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleSA9IHN0cmluZygpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5ID0gaWRlbnRpZmllcigpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgd2hpdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dCgnOicpO1xuICAgICAgICAgICAgICAgICAgICBvYmplY3Rba2V5XSA9IHZhbHVlKCk7XG4gICAgICAgICAgICAgICAgICAgIHdoaXRlKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vIElmIHRoZXJlJ3Mgbm8gY29tbWEgYWZ0ZXIgdGhpcyBwYWlyLCB0aGlzIG5lZWRzIHRvIGJlXG4gICAgICAgICAgICAgICAgICAgIC8vIHRoZSBlbmQgb2YgdGhlIG9iamVjdC5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoICE9PSAnLCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5leHQoJ30nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbmV4dCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICB3aGl0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVycm9yKFwiQmFkIG9iamVjdFwiKTtcbiAgICAgICAgfTtcblxuICAgIHZhbHVlID0gZnVuY3Rpb24gKCkge1xuXG4vLyBQYXJzZSBhIEpTT04gdmFsdWUuIEl0IGNvdWxkIGJlIGFuIG9iamVjdCwgYW4gYXJyYXksIGEgc3RyaW5nLCBhIG51bWJlcixcbi8vIG9yIGEgd29yZC5cblxuICAgICAgICB3aGl0ZSgpO1xuICAgICAgICBzd2l0Y2ggKGNoKSB7XG4gICAgICAgIGNhc2UgJ3snOlxuICAgICAgICAgICAgcmV0dXJuIG9iamVjdCgpO1xuICAgICAgICBjYXNlICdbJzpcbiAgICAgICAgICAgIHJldHVybiBhcnJheSgpO1xuICAgICAgICBjYXNlICdcIic6XG4gICAgICAgIGNhc2UgXCInXCI6XG4gICAgICAgICAgICByZXR1cm4gc3RyaW5nKCk7XG4gICAgICAgIGNhc2UgJy0nOlxuICAgICAgICBjYXNlICcrJzpcbiAgICAgICAgY2FzZSAnLic6XG4gICAgICAgICAgICByZXR1cm4gbnVtYmVyKCk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gY2ggPj0gJzAnICYmIGNoIDw9ICc5JyA/IG51bWJlcigpIDogd29yZCgpO1xuICAgICAgICB9XG4gICAgfTtcblxuLy8gUmV0dXJuIHRoZSBqc29uX3BhcnNlIGZ1bmN0aW9uLiBJdCB3aWxsIGhhdmUgYWNjZXNzIHRvIGFsbCBvZiB0aGUgYWJvdmVcbi8vIGZ1bmN0aW9ucyBhbmQgdmFyaWFibGVzLlxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIChzb3VyY2UsIHJldml2ZXIpIHtcbiAgICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgICB0ZXh0ID0gU3RyaW5nKHNvdXJjZSk7XG4gICAgICAgIGF0ID0gMDtcbiAgICAgICAgbGluZU51bWJlciA9IDE7XG4gICAgICAgIGNvbHVtbk51bWJlciA9IDE7XG4gICAgICAgIGNoID0gJyAnO1xuICAgICAgICByZXN1bHQgPSB2YWx1ZSgpO1xuICAgICAgICB3aGl0ZSgpO1xuICAgICAgICBpZiAoY2gpIHtcbiAgICAgICAgICAgIGVycm9yKFwiU3ludGF4IGVycm9yXCIpO1xuICAgICAgICB9XG5cbi8vIElmIHRoZXJlIGlzIGEgcmV2aXZlciBmdW5jdGlvbiwgd2UgcmVjdXJzaXZlbHkgd2FsayB0aGUgbmV3IHN0cnVjdHVyZSxcbi8vIHBhc3NpbmcgZWFjaCBuYW1lL3ZhbHVlIHBhaXIgdG8gdGhlIHJldml2ZXIgZnVuY3Rpb24gZm9yIHBvc3NpYmxlXG4vLyB0cmFuc2Zvcm1hdGlvbiwgc3RhcnRpbmcgd2l0aCBhIHRlbXBvcmFyeSByb290IG9iamVjdCB0aGF0IGhvbGRzIHRoZSByZXN1bHRcbi8vIGluIGFuIGVtcHR5IGtleS4gSWYgdGhlcmUgaXMgbm90IGEgcmV2aXZlciBmdW5jdGlvbiwgd2Ugc2ltcGx5IHJldHVybiB0aGVcbi8vIHJlc3VsdC5cblxuICAgICAgICByZXR1cm4gdHlwZW9mIHJldml2ZXIgPT09ICdmdW5jdGlvbicgPyAoZnVuY3Rpb24gd2Fsayhob2xkZXIsIGtleSkge1xuICAgICAgICAgICAgdmFyIGssIHYsIHZhbHVlID0gaG9sZGVyW2tleV07XG4gICAgICAgICAgICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIGZvciAoayBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHZhbHVlLCBrKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdiA9IHdhbGsodmFsdWUsIGspO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlW2tdID0gdjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHZhbHVlW2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldml2ZXIuY2FsbChob2xkZXIsIGtleSwgdmFsdWUpO1xuICAgICAgICB9KHsnJzogcmVzdWx0fSwgJycpKSA6IHJlc3VsdDtcbiAgICB9O1xufSgpKTtcblxuLy8gSlNPTjUgc3RyaW5naWZ5IHdpbGwgbm90IHF1b3RlIGtleXMgd2hlcmUgYXBwcm9wcmlhdGVcbkpTT041LnN0cmluZ2lmeSA9IGZ1bmN0aW9uIChvYmosIHJlcGxhY2VyLCBzcGFjZSkge1xuICAgIGlmIChyZXBsYWNlciAmJiAodHlwZW9mKHJlcGxhY2VyKSAhPT0gXCJmdW5jdGlvblwiICYmICFpc0FycmF5KHJlcGxhY2VyKSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZXBsYWNlciBtdXN0IGJlIGEgZnVuY3Rpb24gb3IgYW4gYXJyYXknKTtcbiAgICB9XG4gICAgdmFyIGdldFJlcGxhY2VkVmFsdWVPclVuZGVmaW5lZCA9IGZ1bmN0aW9uKGhvbGRlciwga2V5LCBpc1RvcExldmVsKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGhvbGRlcltrZXldO1xuXG4gICAgICAgIC8vIFJlcGxhY2UgdGhlIHZhbHVlIHdpdGggaXRzIHRvSlNPTiB2YWx1ZSBmaXJzdCwgaWYgcG9zc2libGVcbiAgICAgICAgaWYgKHZhbHVlICYmIHZhbHVlLnRvSlNPTiAmJiB0eXBlb2YgdmFsdWUudG9KU09OID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUudG9KU09OKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgdXNlci1zdXBwbGllZCByZXBsYWNlciBpZiBhIGZ1bmN0aW9uLCBjYWxsIGl0LiBJZiBpdCdzIGFuIGFycmF5LCBjaGVjayBvYmplY3RzJyBzdHJpbmcga2V5cyBmb3JcbiAgICAgICAgLy8gcHJlc2VuY2UgaW4gdGhlIGFycmF5IChyZW1vdmluZyB0aGUga2V5L3ZhbHVlIHBhaXIgZnJvbSB0aGUgcmVzdWx0aW5nIEpTT04gaWYgdGhlIGtleSBpcyBtaXNzaW5nKS5cbiAgICAgICAgaWYgKHR5cGVvZihyZXBsYWNlcikgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgcmV0dXJuIHJlcGxhY2VyLmNhbGwoaG9sZGVyLCBrZXksIHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIGlmKHJlcGxhY2VyKSB7XG4gICAgICAgICAgICBpZiAoaXNUb3BMZXZlbCB8fCBpc0FycmF5KGhvbGRlcikgfHwgcmVwbGFjZXIuaW5kZXhPZihrZXkpID49IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gaXNXb3JkQ2hhcihjKSB7XG4gICAgICAgIHJldHVybiAoYyA+PSAnYScgJiYgYyA8PSAneicpIHx8XG4gICAgICAgICAgICAoYyA+PSAnQScgJiYgYyA8PSAnWicpIHx8XG4gICAgICAgICAgICAoYyA+PSAnMCcgJiYgYyA8PSAnOScpIHx8XG4gICAgICAgICAgICBjID09PSAnXycgfHwgYyA9PT0gJyQnO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzV29yZFN0YXJ0KGMpIHtcbiAgICAgICAgcmV0dXJuIChjID49ICdhJyAmJiBjIDw9ICd6JykgfHxcbiAgICAgICAgICAgIChjID49ICdBJyAmJiBjIDw9ICdaJykgfHxcbiAgICAgICAgICAgIGMgPT09ICdfJyB8fCBjID09PSAnJCc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNXb3JkKGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIGtleSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzV29yZFN0YXJ0KGtleVswXSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaSA9IDEsIGxlbmd0aCA9IGtleS5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChpIDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoIWlzV29yZENoYXIoa2V5W2ldKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBleHBvcnQgZm9yIHVzZSBpbiB0ZXN0c1xuICAgIEpTT041LmlzV29yZCA9IGlzV29yZDtcblxuICAgIC8vIHBvbHlmaWxsc1xuICAgIGZ1bmN0aW9uIGlzQXJyYXkob2JqKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KSB7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheShvYmopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaXNEYXRlKG9iaikge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IERhdGVdJztcbiAgICB9XG5cbiAgICB2YXIgb2JqU3RhY2sgPSBbXTtcbiAgICBmdW5jdGlvbiBjaGVja0ZvckNpcmN1bGFyKG9iaikge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9ialN0YWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAob2JqU3RhY2tbaV0gPT09IG9iaikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDb252ZXJ0aW5nIGNpcmN1bGFyIHN0cnVjdHVyZSB0byBKU09OXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWFrZUluZGVudChzdHIsIG51bSwgbm9OZXdMaW5lKSB7XG4gICAgICAgIGlmICghc3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICAvLyBpbmRlbnRhdGlvbiBubyBtb3JlIHRoYW4gMTAgY2hhcnNcbiAgICAgICAgaWYgKHN0ci5sZW5ndGggPiAxMCkge1xuICAgICAgICAgICAgc3RyID0gc3RyLnN1YnN0cmluZygwLCAxMCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaW5kZW50ID0gbm9OZXdMaW5lID8gXCJcIiA6IFwiXFxuXCI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgICAgICAgIGluZGVudCArPSBzdHI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaW5kZW50O1xuICAgIH1cblxuICAgIHZhciBpbmRlbnRTdHI7XG4gICAgaWYgKHNwYWNlKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc3BhY2UgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGluZGVudFN0ciA9IHNwYWNlO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzcGFjZSA9PT0gXCJudW1iZXJcIiAmJiBzcGFjZSA+PSAwKSB7XG4gICAgICAgICAgICBpbmRlbnRTdHIgPSBtYWtlSW5kZW50KFwiIFwiLCBzcGFjZSwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBpZ25vcmUgc3BhY2UgcGFyYW1ldGVyXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDb3BpZWQgZnJvbSBDcm9rZm9yZCdzIGltcGxlbWVudGF0aW9uIG9mIEpTT05cbiAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2RvdWdsYXNjcm9ja2ZvcmQvSlNPTi1qcy9ibG9iL2UzOWRiNGI3ZTYyNDlmMDRhMTk1ZTdkZDA4NDBlNjEwY2M5ZTk0MWUvanNvbjIuanMjTDE5NVxuICAgIC8vIEJlZ2luXG4gICAgdmFyIGN4ID0gL1tcXHUwMDAwXFx1MDBhZFxcdTA2MDAtXFx1MDYwNFxcdTA3MGZcXHUxN2I0XFx1MTdiNVxcdTIwMGMtXFx1MjAwZlxcdTIwMjgtXFx1MjAyZlxcdTIwNjAtXFx1MjA2ZlxcdWZlZmZcXHVmZmYwLVxcdWZmZmZdL2csXG4gICAgICAgIGVzY2FwYWJsZSA9IC9bXFxcXFxcXCJcXHgwMC1cXHgxZlxceDdmLVxceDlmXFx1MDBhZFxcdTA2MDAtXFx1MDYwNFxcdTA3MGZcXHUxN2I0XFx1MTdiNVxcdTIwMGMtXFx1MjAwZlxcdTIwMjgtXFx1MjAyZlxcdTIwNjAtXFx1MjA2ZlxcdWZlZmZcXHVmZmYwLVxcdWZmZmZdL2csXG4gICAgICAgIG1ldGEgPSB7IC8vIHRhYmxlIG9mIGNoYXJhY3RlciBzdWJzdGl0dXRpb25zXG4gICAgICAgICdcXGInOiAnXFxcXGInLFxuICAgICAgICAnXFx0JzogJ1xcXFx0JyxcbiAgICAgICAgJ1xcbic6ICdcXFxcbicsXG4gICAgICAgICdcXGYnOiAnXFxcXGYnLFxuICAgICAgICAnXFxyJzogJ1xcXFxyJyxcbiAgICAgICAgJ1wiJyA6ICdcXFxcXCInLFxuICAgICAgICAnXFxcXCc6ICdcXFxcXFxcXCdcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGVzY2FwZVN0cmluZyhzdHJpbmcpIHtcblxuLy8gSWYgdGhlIHN0cmluZyBjb250YWlucyBubyBjb250cm9sIGNoYXJhY3RlcnMsIG5vIHF1b3RlIGNoYXJhY3RlcnMsIGFuZCBub1xuLy8gYmFja3NsYXNoIGNoYXJhY3RlcnMsIHRoZW4gd2UgY2FuIHNhZmVseSBzbGFwIHNvbWUgcXVvdGVzIGFyb3VuZCBpdC5cbi8vIE90aGVyd2lzZSB3ZSBtdXN0IGFsc28gcmVwbGFjZSB0aGUgb2ZmZW5kaW5nIGNoYXJhY3RlcnMgd2l0aCBzYWZlIGVzY2FwZVxuLy8gc2VxdWVuY2VzLlxuICAgICAgICBlc2NhcGFibGUubGFzdEluZGV4ID0gMDtcbiAgICAgICAgcmV0dXJuIGVzY2FwYWJsZS50ZXN0KHN0cmluZykgPyAnXCInICsgc3RyaW5nLnJlcGxhY2UoZXNjYXBhYmxlLCBmdW5jdGlvbiAoYSkge1xuICAgICAgICAgICAgdmFyIGMgPSBtZXRhW2FdO1xuICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBjID09PSAnc3RyaW5nJyA/XG4gICAgICAgICAgICAgICAgYyA6XG4gICAgICAgICAgICAgICAgJ1xcXFx1JyArICgnMDAwMCcgKyBhLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpKS5zbGljZSgtNCk7XG4gICAgICAgIH0pICsgJ1wiJyA6ICdcIicgKyBzdHJpbmcgKyAnXCInO1xuICAgIH1cbiAgICAvLyBFbmRcblxuICAgIGZ1bmN0aW9uIGludGVybmFsU3RyaW5naWZ5KGhvbGRlciwga2V5LCBpc1RvcExldmVsKSB7XG4gICAgICAgIHZhciBidWZmZXIsIHJlcztcblxuICAgICAgICAvLyBSZXBsYWNlIHRoZSB2YWx1ZSwgaWYgbmVjZXNzYXJ5XG4gICAgICAgIHZhciBvYmpfcGFydCA9IGdldFJlcGxhY2VkVmFsdWVPclVuZGVmaW5lZChob2xkZXIsIGtleSwgaXNUb3BMZXZlbCk7XG5cbiAgICAgICAgaWYgKG9ial9wYXJ0ICYmICFpc0RhdGUob2JqX3BhcnQpKSB7XG4gICAgICAgICAgICAvLyB1bmJveCBvYmplY3RzXG4gICAgICAgICAgICAvLyBkb24ndCB1bmJveCBkYXRlcywgc2luY2Ugd2lsbCB0dXJuIGl0IGludG8gbnVtYmVyXG4gICAgICAgICAgICBvYmpfcGFydCA9IG9ial9wYXJ0LnZhbHVlT2YoKTtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2godHlwZW9mIG9ial9wYXJ0KSB7XG4gICAgICAgICAgICBjYXNlIFwiYm9vbGVhblwiOlxuICAgICAgICAgICAgICAgIHJldHVybiBvYmpfcGFydC50b1N0cmluZygpO1xuXG4gICAgICAgICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAgICAgICAgICAgaWYgKGlzTmFOKG9ial9wYXJ0KSB8fCAhaXNGaW5pdGUob2JqX3BhcnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIm51bGxcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9ial9wYXJ0LnRvU3RyaW5nKCk7XG5cbiAgICAgICAgICAgIGNhc2UgXCJzdHJpbmdcIjpcbiAgICAgICAgICAgICAgICByZXR1cm4gZXNjYXBlU3RyaW5nKG9ial9wYXJ0LnRvU3RyaW5nKCkpO1xuXG4gICAgICAgICAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICAgICAgICAgICAgaWYgKG9ial9wYXJ0ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIm51bGxcIjtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGlzQXJyYXkob2JqX3BhcnQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRm9yQ2lyY3VsYXIob2JqX3BhcnQpO1xuICAgICAgICAgICAgICAgICAgICBidWZmZXIgPSBcIltcIjtcbiAgICAgICAgICAgICAgICAgICAgb2JqU3RhY2sucHVzaChvYmpfcGFydCk7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvYmpfcGFydC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzID0gaW50ZXJuYWxTdHJpbmdpZnkob2JqX3BhcnQsIGksIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciArPSBtYWtlSW5kZW50KGluZGVudFN0ciwgb2JqU3RhY2subGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXMgPT09IG51bGwgfHwgdHlwZW9mIHJlcyA9PT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciArPSBcIm51bGxcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyICs9IHJlcztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpIDwgb2JqX3BhcnQubGVuZ3RoLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgKz0gXCIsXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGluZGVudFN0cikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciArPSBcIlxcblwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG9ialN0YWNrLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAob2JqX3BhcnQubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgKz0gbWFrZUluZGVudChpbmRlbnRTdHIsIG9ialN0YWNrLmxlbmd0aCwgdHJ1ZSlcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBidWZmZXIgKz0gXCJdXCI7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tGb3JDaXJjdWxhcihvYmpfcGFydCk7XG4gICAgICAgICAgICAgICAgICAgIGJ1ZmZlciA9IFwie1wiO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9uRW1wdHkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgb2JqU3RhY2sucHVzaChvYmpfcGFydCk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gb2JqX3BhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmpfcGFydC5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGludGVybmFsU3RyaW5naWZ5KG9ial9wYXJ0LCBwcm9wLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNUb3BMZXZlbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09IFwidW5kZWZpbmVkXCIgJiYgdmFsdWUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyICs9IG1ha2VJbmRlbnQoaW5kZW50U3RyLCBvYmpTdGFjay5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub25FbXB0eSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleSA9IGlzV29yZChwcm9wKSA/IHByb3AgOiBlc2NhcGVTdHJpbmcocHJvcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlciArPSBrZXkgKyBcIjpcIiArIChpbmRlbnRTdHIgPyAnICcgOiAnJykgKyB2YWx1ZSArIFwiLFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvYmpTdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vbkVtcHR5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWZmZXIgPSBidWZmZXIuc3Vic3RyaW5nKDAsIGJ1ZmZlci5sZW5ndGgtMSkgKyBtYWtlSW5kZW50KGluZGVudFN0ciwgb2JqU3RhY2subGVuZ3RoKSArIFwifVwiO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyID0gJ3t9JztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAvLyBmdW5jdGlvbnMgYW5kIHVuZGVmaW5lZCBzaG91bGQgYmUgaWdub3JlZFxuICAgICAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBzcGVjaWFsIGNhc2UuLi53aGVuIHVuZGVmaW5lZCBpcyB1c2VkIGluc2lkZSBvZlxuICAgIC8vIGEgY29tcG91bmQgb2JqZWN0L2FycmF5LCByZXR1cm4gbnVsbC5cbiAgICAvLyBidXQgd2hlbiB0b3AtbGV2ZWwsIHJldHVybiB1bmRlZmluZWRcbiAgICB2YXIgdG9wTGV2ZWxIb2xkZXIgPSB7XCJcIjpvYmp9O1xuICAgIGlmIChvYmogPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gZ2V0UmVwbGFjZWRWYWx1ZU9yVW5kZWZpbmVkKHRvcExldmVsSG9sZGVyLCAnJywgdHJ1ZSk7XG4gICAgfVxuICAgIHJldHVybiBpbnRlcm5hbFN0cmluZ2lmeSh0b3BMZXZlbEhvbGRlciwgJycsIHRydWUpO1xufTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2pzb241L2xpYi9qc29uNS5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcblxuY29uc3QgcGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuXG5jb25zdCBtYXRjaFJlbGF0aXZlUGF0aCA9IC9eXFwuXFwuP1svXFxcXF0vO1xuXG5mdW5jdGlvbiBpc0Fic29sdXRlUGF0aChzdHIpIHtcblx0cmV0dXJuIHBhdGgucG9zaXguaXNBYnNvbHV0ZShzdHIpIHx8IHBhdGgud2luMzIuaXNBYnNvbHV0ZShzdHIpO1xufVxuXG5mdW5jdGlvbiBpc1JlbGF0aXZlUGF0aChzdHIpIHtcblx0cmV0dXJuIG1hdGNoUmVsYXRpdmVQYXRoLnRlc3Qoc3RyKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5UmVxdWVzdChsb2FkZXJDb250ZXh0LCByZXF1ZXN0KSB7XG5cdGNvbnN0IHNwbGl0dGVkID0gcmVxdWVzdC5zcGxpdChcIiFcIik7XG5cdGNvbnN0IGNvbnRleHQgPSBsb2FkZXJDb250ZXh0LmNvbnRleHQgfHwgKGxvYWRlckNvbnRleHQub3B0aW9ucyAmJiBsb2FkZXJDb250ZXh0Lm9wdGlvbnMuY29udGV4dCk7XG5cdHJldHVybiBKU09OLnN0cmluZ2lmeShzcGxpdHRlZC5tYXAocGFydCA9PiB7XG5cdFx0Ly8gRmlyc3QsIHNlcGFyYXRlIHNpbmdsZVBhdGggZnJvbSBxdWVyeSwgYmVjYXVzZSB0aGUgcXVlcnkgbWlnaHQgY29udGFpbiBwYXRocyBhZ2FpblxuXHRcdGNvbnN0IHNwbGl0dGVkUGFydCA9IHBhcnQubWF0Y2goL14oLio/KShcXD8uKikvKTtcblx0XHRsZXQgc2luZ2xlUGF0aCA9IHNwbGl0dGVkUGFydCA/IHNwbGl0dGVkUGFydFsxXSA6IHBhcnQ7XG5cdFx0Y29uc3QgcXVlcnkgPSBzcGxpdHRlZFBhcnQgPyBzcGxpdHRlZFBhcnRbMl0gOiBcIlwiO1xuXHRcdGlmKGlzQWJzb2x1dGVQYXRoKHNpbmdsZVBhdGgpICYmIGNvbnRleHQpIHtcblx0XHRcdHNpbmdsZVBhdGggPSBwYXRoLnJlbGF0aXZlKGNvbnRleHQsIHNpbmdsZVBhdGgpO1xuXHRcdFx0aWYoaXNBYnNvbHV0ZVBhdGgoc2luZ2xlUGF0aCkpIHtcblx0XHRcdFx0Ly8gSWYgc2luZ2xlUGF0aCBzdGlsbCBtYXRjaGVzIGFuIGFic29sdXRlIHBhdGgsIHNpbmdsZVBhdGggd2FzIG9uIGEgZGlmZmVyZW50IGRyaXZlIHRoYW4gY29udGV4dC5cblx0XHRcdFx0Ly8gSW4gdGhpcyBjYXNlLCB3ZSBsZWF2ZSB0aGUgcGF0aCBwbGF0Zm9ybS1zcGVjaWZpYyB3aXRob3V0IHJlcGxhY2luZyBhbnkgc2VwYXJhdG9ycy5cblx0XHRcdFx0Ly8gQHNlZSBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay9sb2FkZXItdXRpbHMvcHVsbC8xNFxuXHRcdFx0XHRyZXR1cm4gc2luZ2xlUGF0aCArIHF1ZXJ5O1xuXHRcdFx0fVxuXHRcdFx0aWYoaXNSZWxhdGl2ZVBhdGgoc2luZ2xlUGF0aCkgPT09IGZhbHNlKSB7XG5cdFx0XHRcdC8vIEVuc3VyZSB0aGF0IHRoZSByZWxhdGl2ZSBwYXRoIHN0YXJ0cyBhdCBsZWFzdCB3aXRoIC4vIG90aGVyd2lzZSBpdCB3b3VsZCBiZSBhIHJlcXVlc3QgaW50byB0aGUgbW9kdWxlcyBkaXJlY3RvcnkgKGxpa2Ugbm9kZV9tb2R1bGVzKS5cblx0XHRcdFx0c2luZ2xlUGF0aCA9IFwiLi9cIiArIHNpbmdsZVBhdGg7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBzaW5nbGVQYXRoLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpICsgcXVlcnk7XG5cdH0pLmpvaW4oXCIhXCIpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzdHJpbmdpZnlSZXF1ZXN0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbG9hZGVyLXV0aWxzL2xpYi9zdHJpbmdpZnlSZXF1ZXN0LmpzXG4vLyBtb2R1bGUgaWQgPSA3XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBnZXRSZW1haW5pbmdSZXF1ZXN0KGxvYWRlckNvbnRleHQpIHtcblx0aWYobG9hZGVyQ29udGV4dC5yZW1haW5pbmdSZXF1ZXN0KVxuXHRcdHJldHVybiBsb2FkZXJDb250ZXh0LnJlbWFpbmluZ1JlcXVlc3Q7XG5cdGNvbnN0IHJlcXVlc3QgPSBsb2FkZXJDb250ZXh0LmxvYWRlcnNcblx0XHQuc2xpY2UobG9hZGVyQ29udGV4dC5sb2FkZXJJbmRleCArIDEpXG5cdFx0Lm1hcChvYmogPT4gb2JqLnJlcXVlc3QpXG5cdFx0LmNvbmNhdChbbG9hZGVyQ29udGV4dC5yZXNvdXJjZV0pO1xuXHRyZXR1cm4gcmVxdWVzdC5qb2luKFwiIVwiKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRSZW1haW5pbmdSZXF1ZXN0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbG9hZGVyLXV0aWxzL2xpYi9nZXRSZW1haW5pbmdSZXF1ZXN0LmpzXG4vLyBtb2R1bGUgaWQgPSA4XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBnZXRDdXJyZW50UmVxdWVzdChsb2FkZXJDb250ZXh0KSB7XG5cdGlmKGxvYWRlckNvbnRleHQuY3VycmVudFJlcXVlc3QpXG5cdFx0cmV0dXJuIGxvYWRlckNvbnRleHQuY3VycmVudFJlcXVlc3Q7XG5cdGNvbnN0IHJlcXVlc3QgPSBsb2FkZXJDb250ZXh0LmxvYWRlcnNcblx0XHQuc2xpY2UobG9hZGVyQ29udGV4dC5sb2FkZXJJbmRleClcblx0XHQubWFwKG9iaiA9PiBvYmoucmVxdWVzdClcblx0XHQuY29uY2F0KFtsb2FkZXJDb250ZXh0LnJlc291cmNlXSk7XG5cdHJldHVybiByZXF1ZXN0LmpvaW4oXCIhXCIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEN1cnJlbnRSZXF1ZXN0O1xuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvbG9hZGVyLXV0aWxzL2xpYi9nZXRDdXJyZW50UmVxdWVzdC5qc1xuLy8gbW9kdWxlIGlkID0gOVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gaXNVcmxSZXF1ZXN0KHVybCwgcm9vdCkge1xuXHQvLyBBbiBVUkwgaXMgbm90IGFuIHJlcXVlc3QgaWZcblx0Ly8gMS4gaXQncyBhIERhdGEgVXJsXG5cdC8vIDIuIGl0J3MgYW4gYWJzb2x1dGUgdXJsIG9yIGFuZCBwcm90b2NvbC1yZWxhdGl2ZVxuXHQvLyAzLiBpdCdzIHNvbWUga2luZCBvZiB1cmwgZm9yIGEgdGVtcGxhdGVcblx0aWYoL15kYXRhOnxeY2hyb21lLWV4dGVuc2lvbjp8XihodHRwcz86KT9cXC9cXC98XltcXHtcXH1cXFtcXF0jKjssJ8KnXFwkJSZcXCg9P2DCtFxcXsKwPD5dLy50ZXN0KHVybCkpIHJldHVybiBmYWxzZTtcblx0Ly8gNC4gSXQncyBhbHNvIG5vdCBhbiByZXF1ZXN0IGlmIHJvb3QgaXNuJ3Qgc2V0IGFuZCBpdCdzIGEgcm9vdC1yZWxhdGl2ZSB1cmxcblx0aWYoKHJvb3QgPT09IHVuZGVmaW5lZCB8fCByb290ID09PSBmYWxzZSkgJiYgL15cXC8vLnRlc3QodXJsKSkgcmV0dXJuIGZhbHNlO1xuXHRyZXR1cm4gdHJ1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1VybFJlcXVlc3Q7XG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9sb2FkZXItdXRpbHMvbGliL2lzVXJsUmVxdWVzdC5qc1xuLy8gbW9kdWxlIGlkID0gMTBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vIHdlIGNhbid0IHVzZSBwYXRoLndpbjMyLmlzQWJzb2x1dGUgYmVjYXVzZSBpdCBhbHNvIG1hdGNoZXMgcGF0aHMgc3RhcnRpbmcgd2l0aCBhIGZvcndhcmQgc2xhc2hcbmNvbnN0IG1hdGNoTmF0aXZlV2luMzJQYXRoID0gL15bQS1aXTpbL1xcXFxdfF5cXFxcXFxcXC9pO1xuXG5mdW5jdGlvbiB1cmxUb1JlcXVlc3QodXJsLCByb290KSB7XG5cdGNvbnN0IG1vZHVsZVJlcXVlc3RSZWdleCA9IC9eW14/XSp+Lztcblx0bGV0IHJlcXVlc3Q7XG5cblx0aWYobWF0Y2hOYXRpdmVXaW4zMlBhdGgudGVzdCh1cmwpKSB7XG5cdFx0Ly8gYWJzb2x1dGUgd2luZG93cyBwYXRoLCBrZWVwIGl0XG5cdFx0cmVxdWVzdCA9IHVybDtcblx0fSBlbHNlIGlmKHJvb3QgIT09IHVuZGVmaW5lZCAmJiByb290ICE9PSBmYWxzZSAmJiAvXlxcLy8udGVzdCh1cmwpKSB7XG5cdFx0Ly8gaWYgcm9vdCBpcyBzZXQgYW5kIHRoZSB1cmwgaXMgcm9vdC1yZWxhdGl2ZVxuXHRcdHN3aXRjaCh0eXBlb2Ygcm9vdCkge1xuXHRcdFx0Ly8gMS4gcm9vdCBpcyBhIHN0cmluZzogcm9vdCBpcyBwcmVmaXhlZCB0byB0aGUgdXJsXG5cdFx0XHRjYXNlIFwic3RyaW5nXCI6XG5cdFx0XHRcdC8vIHNwZWNpYWwgY2FzZTogYH5gIHJvb3RzIGNvbnZlcnQgdG8gbW9kdWxlIHJlcXVlc3Rcblx0XHRcdFx0aWYobW9kdWxlUmVxdWVzdFJlZ2V4LnRlc3Qocm9vdCkpIHtcblx0XHRcdFx0XHRyZXF1ZXN0ID0gcm9vdC5yZXBsYWNlKC8oW15+XFwvXSkkLywgXCIkMS9cIikgKyB1cmwuc2xpY2UoMSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmVxdWVzdCA9IHJvb3QgKyB1cmw7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHQvLyAyLiByb290IGlzIGB0cnVlYDogYWJzb2x1dGUgcGF0aHMgYXJlIGFsbG93ZWRcblx0XHRcdC8vICAgICpuaXggb25seSwgd2luZG93cy1zdHlsZSBhYnNvbHV0ZSBwYXRocyBhcmUgYWx3YXlzIGFsbG93ZWQgYXMgdGhleSBkb2Vzbid0IHN0YXJ0IHdpdGggYSBgL2Bcblx0XHRcdGNhc2UgXCJib29sZWFuXCI6XG5cdFx0XHRcdHJlcXVlc3QgPSB1cmw7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBwYXJhbWV0ZXJzIHRvIGxvYWRlci11dGlscyAndXJsVG9SZXF1ZXN0JzogdXJsID0gXCIgKyB1cmwgKyBcIiwgcm9vdCA9IFwiICsgcm9vdCArIFwiLlwiKTtcblx0XHR9XG5cdH0gZWxzZSBpZigvXlxcLlxcLj9cXC8vLnRlc3QodXJsKSkge1xuXHRcdC8vIEEgcmVsYXRpdmUgdXJsIHN0YXlzXG5cdFx0cmVxdWVzdCA9IHVybDtcblx0fSBlbHNlIHtcblx0XHQvLyBldmVyeSBvdGhlciB1cmwgaXMgdGhyZWFkZWQgbGlrZSBhIHJlbGF0aXZlIHVybFxuXHRcdHJlcXVlc3QgPSBcIi4vXCIgKyB1cmw7XG5cdH1cblxuXHQvLyBBIGB+YCBtYWtlcyB0aGUgdXJsIGFuIG1vZHVsZVxuXHRpZihtb2R1bGVSZXF1ZXN0UmVnZXgudGVzdChyZXF1ZXN0KSkge1xuXHRcdHJlcXVlc3QgPSByZXF1ZXN0LnJlcGxhY2UobW9kdWxlUmVxdWVzdFJlZ2V4LCBcIlwiKTtcblx0fVxuXG5cdHJldHVybiByZXF1ZXN0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHVybFRvUmVxdWVzdDtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvdXJsVG9SZXF1ZXN0LmpzXG4vLyBtb2R1bGUgaWQgPSAxMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gcGFyc2VTdHJpbmcoc3RyKSB7XG5cdHRyeSB7XG5cdFx0aWYoc3RyWzBdID09PSBcIlxcXCJcIikgcmV0dXJuIEpTT04ucGFyc2Uoc3RyKTtcblx0XHRpZihzdHJbMF0gPT09IFwiJ1wiICYmIHN0ci5zdWJzdHIoc3RyLmxlbmd0aCAtIDEpID09PSBcIidcIikge1xuXHRcdFx0cmV0dXJuIHBhcnNlU3RyaW5nKFxuXHRcdFx0XHRzdHJcblx0XHRcdFx0XHQucmVwbGFjZSgvXFxcXC58XCIvZywgeCA9PiB4ID09PSBcIlxcXCJcIiA/IFwiXFxcXFxcXCJcIiA6IHgpXG5cdFx0XHRcdFx0LnJlcGxhY2UoL14nfCckL2csIFwiXFxcIlwiKVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIEpTT04ucGFyc2UoXCJcXFwiXCIgKyBzdHIgKyBcIlxcXCJcIik7XG5cdH0gY2F0Y2goZSkge1xuXHRcdHJldHVybiBzdHI7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBwYXJzZVN0cmluZztcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvcGFyc2VTdHJpbmcuanNcbi8vIG1vZHVsZSBpZCA9IDEyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIi8qIGJpZy5qcyB2My4xLjMgaHR0cHM6Ly9naXRodWIuY29tL01pa2VNY2wvYmlnLmpzL0xJQ0VOQ0UgKi9cclxuOyhmdW5jdGlvbiAoZ2xvYmFsKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4vKlxyXG4gIGJpZy5qcyB2My4xLjNcclxuICBBIHNtYWxsLCBmYXN0LCBlYXN5LXRvLXVzZSBsaWJyYXJ5IGZvciBhcmJpdHJhcnktcHJlY2lzaW9uIGRlY2ltYWwgYXJpdGhtZXRpYy5cclxuICBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWcuanMvXHJcbiAgQ29weXJpZ2h0IChjKSAyMDE0IE1pY2hhZWwgTWNsYXVnaGxpbiA8TThjaDg4bEBnbWFpbC5jb20+XHJcbiAgTUlUIEV4cGF0IExpY2VuY2VcclxuKi9cclxuXHJcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBFRElUQUJMRSBERUZBVUxUUyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXHJcblxyXG4gICAgLy8gVGhlIGRlZmF1bHQgdmFsdWVzIGJlbG93IG11c3QgYmUgaW50ZWdlcnMgd2l0aGluIHRoZSBzdGF0ZWQgcmFuZ2VzLlxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaGUgbWF4aW11bSBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgb2YgdGhlIHJlc3VsdHMgb2Ygb3BlcmF0aW9uc1xyXG4gICAgICogaW52b2x2aW5nIGRpdmlzaW9uOiBkaXYgYW5kIHNxcnQsIGFuZCBwb3cgd2l0aCBuZWdhdGl2ZSBleHBvbmVudHMuXHJcbiAgICAgKi9cclxuICAgIHZhciBEUCA9IDIwLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gTUFYX0RQXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIHJvdW5kaW5nIG1vZGUgdXNlZCB3aGVuIHJvdW5kaW5nIHRvIHRoZSBhYm92ZSBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIDAgVG93YXJkcyB6ZXJvIChpLmUuIHRydW5jYXRlLCBubyByb3VuZGluZykuICAgICAgIChST1VORF9ET1dOKVxyXG4gICAgICAgICAqIDEgVG8gbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCByb3VuZCB1cC4gIChST1VORF9IQUxGX1VQKVxyXG4gICAgICAgICAqIDIgVG8gbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0byBldmVuLiAgIChST1VORF9IQUxGX0VWRU4pXHJcbiAgICAgICAgICogMyBBd2F5IGZyb20gemVyby4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKFJPVU5EX1VQKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFJNID0gMSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCwgMSwgMiBvciAzXHJcblxyXG4gICAgICAgIC8vIFRoZSBtYXhpbXVtIHZhbHVlIG9mIERQIGFuZCBCaWcuRFAuXHJcbiAgICAgICAgTUFYX0RQID0gMUU2LCAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDEwMDAwMDBcclxuXHJcbiAgICAgICAgLy8gVGhlIG1heGltdW0gbWFnbml0dWRlIG9mIHRoZSBleHBvbmVudCBhcmd1bWVudCB0byB0aGUgcG93IG1ldGhvZC5cclxuICAgICAgICBNQVhfUE9XRVIgPSAxRTYsICAgICAgICAgICAgICAgICAgIC8vIDEgdG8gMTAwMDAwMFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBleHBvbmVudCB2YWx1ZSBhdCBhbmQgYmVuZWF0aCB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsXHJcbiAgICAgICAgICogbm90YXRpb24uXHJcbiAgICAgICAgICogSmF2YVNjcmlwdCdzIE51bWJlciB0eXBlOiAtN1xyXG4gICAgICAgICAqIC0xMDAwMDAwIGlzIHRoZSBtaW5pbXVtIHJlY29tbWVuZGVkIGV4cG9uZW50IHZhbHVlIG9mIGEgQmlnLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEVfTkVHID0gLTcsICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gLTEwMDAwMDBcclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGFib3ZlIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWxcclxuICAgICAgICAgKiBub3RhdGlvbi5cclxuICAgICAgICAgKiBKYXZhU2NyaXB0J3MgTnVtYmVyIHR5cGU6IDIxXHJcbiAgICAgICAgICogMTAwMDAwMCBpcyB0aGUgbWF4aW11bSByZWNvbW1lbmRlZCBleHBvbmVudCB2YWx1ZSBvZiBhIEJpZy5cclxuICAgICAgICAgKiAoVGhpcyBsaW1pdCBpcyBub3QgZW5mb3JjZWQgb3IgY2hlY2tlZC4pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgRV9QT1MgPSAyMSwgICAgICAgICAgICAgICAgICAgLy8gMCB0byAxMDAwMDAwXHJcblxyXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuICAgICAgICAvLyBUaGUgc2hhcmVkIHByb3RvdHlwZSBvYmplY3QuXHJcbiAgICAgICAgUCA9IHt9LFxyXG4gICAgICAgIGlzVmFsaWQgPSAvXi0/KFxcZCsoXFwuXFxkKik/fFxcLlxcZCspKGVbKy1dP1xcZCspPyQvaSxcclxuICAgICAgICBCaWc7XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIEJpZyBjb25zdHJ1Y3Rvci5cclxuICAgICAqXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGJpZ0ZhY3RvcnkoKSB7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIEJpZyBjb25zdHJ1Y3RvciBhbmQgZXhwb3J0ZWQgZnVuY3Rpb24uXHJcbiAgICAgICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgYSBCaWcgbnVtYmVyIG9iamVjdC5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIG4ge251bWJlcnxzdHJpbmd8QmlnfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gQmlnKG4pIHtcclxuICAgICAgICAgICAgdmFyIHggPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgLy8gRW5hYmxlIGNvbnN0cnVjdG9yIHVzYWdlIHdpdGhvdXQgbmV3LlxyXG4gICAgICAgICAgICBpZiAoISh4IGluc3RhbmNlb2YgQmlnKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG4gPT09IHZvaWQgMCA/IGJpZ0ZhY3RvcnkoKSA6IG5ldyBCaWcobik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIER1cGxpY2F0ZS5cclxuICAgICAgICAgICAgaWYgKG4gaW5zdGFuY2VvZiBCaWcpIHtcclxuICAgICAgICAgICAgICAgIHgucyA9IG4ucztcclxuICAgICAgICAgICAgICAgIHguZSA9IG4uZTtcclxuICAgICAgICAgICAgICAgIHguYyA9IG4uYy5zbGljZSgpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcGFyc2UoeCwgbik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFJldGFpbiBhIHJlZmVyZW5jZSB0byB0aGlzIEJpZyBjb25zdHJ1Y3RvciwgYW5kIHNoYWRvd1xyXG4gICAgICAgICAgICAgKiBCaWcucHJvdG90eXBlLmNvbnN0cnVjdG9yIHdoaWNoIHBvaW50cyB0byBPYmplY3QuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICB4LmNvbnN0cnVjdG9yID0gQmlnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgQmlnLnByb3RvdHlwZSA9IFA7XHJcbiAgICAgICAgQmlnLkRQID0gRFA7XHJcbiAgICAgICAgQmlnLlJNID0gUk07XHJcbiAgICAgICAgQmlnLkVfTkVHID0gRV9ORUc7XHJcbiAgICAgICAgQmlnLkVfUE9TID0gRV9QT1M7XHJcblxyXG4gICAgICAgIHJldHVybiBCaWc7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIFByaXZhdGUgZnVuY3Rpb25zXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiBCaWcgeCBpbiBub3JtYWwgb3IgZXhwb25lbnRpYWxcclxuICAgICAqIG5vdGF0aW9uIHRvIGRwIGZpeGVkIGRlY2ltYWwgcGxhY2VzIG9yIHNpZ25pZmljYW50IGRpZ2l0cy5cclxuICAgICAqXHJcbiAgICAgKiB4IHtCaWd9IFRoZSBCaWcgdG8gZm9ybWF0LlxyXG4gICAgICogZHAge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogdG9FIHtudW1iZXJ9IDEgKHRvRXhwb25lbnRpYWwpLCAyICh0b1ByZWNpc2lvbikgb3IgdW5kZWZpbmVkICh0b0ZpeGVkKS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZm9ybWF0KHgsIGRwLCB0b0UpIHtcclxuICAgICAgICB2YXIgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBpbmRleCAobm9ybWFsIG5vdGF0aW9uKSBvZiB0aGUgZGlnaXQgdGhhdCBtYXkgYmUgcm91bmRlZCB1cC5cclxuICAgICAgICAgICAgaSA9IGRwIC0gKHggPSBuZXcgQmlnKHgpKS5lLFxyXG4gICAgICAgICAgICBjID0geC5jO1xyXG5cclxuICAgICAgICAvLyBSb3VuZD9cclxuICAgICAgICBpZiAoYy5sZW5ndGggPiArK2RwKSB7XHJcbiAgICAgICAgICAgIHJuZCh4LCBpLCBCaWcuUk0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCFjWzBdKSB7XHJcbiAgICAgICAgICAgICsraTtcclxuICAgICAgICB9IGVsc2UgaWYgKHRvRSkge1xyXG4gICAgICAgICAgICBpID0gZHA7XHJcblxyXG4gICAgICAgIC8vIHRvRml4ZWRcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBjID0geC5jO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVjYWxjdWxhdGUgaSBhcyB4LmUgbWF5IGhhdmUgY2hhbmdlZCBpZiB2YWx1ZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBpID0geC5lICsgaSArIDE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBBcHBlbmQgemVyb3M/XHJcbiAgICAgICAgZm9yICg7IGMubGVuZ3RoIDwgaTsgYy5wdXNoKDApKSB7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGkgPSB4LmU7XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogdG9QcmVjaXNpb24gcmV0dXJucyBleHBvbmVudGlhbCBub3RhdGlvbiBpZiB0aGUgbnVtYmVyIG9mXHJcbiAgICAgICAgICogc2lnbmlmaWNhbnQgZGlnaXRzIHNwZWNpZmllZCBpcyBsZXNzIHRoYW4gdGhlIG51bWJlciBvZiBkaWdpdHNcclxuICAgICAgICAgKiBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlIHZhbHVlIGluIG5vcm1hbFxyXG4gICAgICAgICAqIG5vdGF0aW9uLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHJldHVybiB0b0UgPT09IDEgfHwgdG9FICYmIChkcCA8PSBpIHx8IGkgPD0gQmlnLkVfTkVHKSA/XHJcblxyXG4gICAgICAgICAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgICAoeC5zIDwgMCAmJiBjWzBdID8gJy0nIDogJycpICtcclxuICAgICAgICAgICAgKGMubGVuZ3RoID4gMSA/IGNbMF0gKyAnLicgKyBjLmpvaW4oJycpLnNsaWNlKDEpIDogY1swXSkgK1xyXG4gICAgICAgICAgICAgIChpIDwgMCA/ICdlJyA6ICdlKycpICsgaVxyXG5cclxuICAgICAgICAgIC8vIE5vcm1hbCBub3RhdGlvbi5cclxuICAgICAgICAgIDogeC50b1N0cmluZygpO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUGFyc2UgdGhlIG51bWJlciBvciBzdHJpbmcgdmFsdWUgcGFzc2VkIHRvIGEgQmlnIGNvbnN0cnVjdG9yLlxyXG4gICAgICpcclxuICAgICAqIHgge0JpZ30gQSBCaWcgbnVtYmVyIGluc3RhbmNlLlxyXG4gICAgICogbiB7bnVtYmVyfHN0cmluZ30gQSBudW1lcmljIHZhbHVlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBwYXJzZSh4LCBuKSB7XHJcbiAgICAgICAgdmFyIGUsIGksIG5MO1xyXG5cclxuICAgICAgICAvLyBNaW51cyB6ZXJvP1xyXG4gICAgICAgIGlmIChuID09PSAwICYmIDEgLyBuIDwgMCkge1xyXG4gICAgICAgICAgICBuID0gJy0wJztcclxuXHJcbiAgICAgICAgLy8gRW5zdXJlIG4gaXMgc3RyaW5nIGFuZCBjaGVjayB2YWxpZGl0eS5cclxuICAgICAgICB9IGVsc2UgaWYgKCFpc1ZhbGlkLnRlc3QobiArPSAnJykpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBzaWduLlxyXG4gICAgICAgIHgucyA9IG4uY2hhckF0KDApID09ICctJyA/IChuID0gbi5zbGljZSgxKSwgLTEpIDogMTtcclxuXHJcbiAgICAgICAgLy8gRGVjaW1hbCBwb2ludD9cclxuICAgICAgICBpZiAoKGUgPSBuLmluZGV4T2YoJy4nKSkgPiAtMSkge1xyXG4gICAgICAgICAgICBuID0gbi5yZXBsYWNlKCcuJywgJycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnRpYWwgZm9ybT9cclxuICAgICAgICBpZiAoKGkgPSBuLnNlYXJjaCgvZS9pKSkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgZXhwb25lbnQuXHJcbiAgICAgICAgICAgIGlmIChlIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgZSA9IGk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZSArPSArbi5zbGljZShpICsgMSk7XHJcbiAgICAgICAgICAgIG4gPSBuLnN1YnN0cmluZygwLCBpKTtcclxuXHJcbiAgICAgICAgfSBlbHNlIGlmIChlIDwgMCkge1xyXG5cclxuICAgICAgICAgICAgLy8gSW50ZWdlci5cclxuICAgICAgICAgICAgZSA9IG4ubGVuZ3RoO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbkwgPSBuLmxlbmd0aDtcclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG5MICYmIG4uY2hhckF0KGkpID09ICcwJzsgaSsrKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSA9PSBuTCkge1xyXG5cclxuICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgeC5jID0gWyB4LmUgPSAwIF07XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIERldGVybWluZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICg7IG5MID4gMCAmJiBuLmNoYXJBdCgtLW5MKSA9PSAnMCc7KSB7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHguZSA9IGUgLSBpIC0gMTtcclxuICAgICAgICAgICAgeC5jID0gW107XHJcblxyXG4gICAgICAgICAgICAvLyBDb252ZXJ0IHN0cmluZyB0byBhcnJheSBvZiBkaWdpdHMgd2l0aG91dCBsZWFkaW5nL3RyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICAvL2ZvciAoZSA9IDA7IGkgPD0gbkw7IHguY1tlKytdID0gK24uY2hhckF0KGkrKykpIHtcclxuICAgICAgICAgICAgZm9yICg7IGkgPD0gbkw7IHguYy5wdXNoKCtuLmNoYXJBdChpKyspKSkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4geDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJvdW5kIEJpZyB4IHRvIGEgbWF4aW11bSBvZiBkcCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLlxyXG4gICAgICogQ2FsbGVkIGJ5IGRpdiwgc3FydCBhbmQgcm91bmQuXHJcbiAgICAgKlxyXG4gICAgICogeCB7QmlnfSBUaGUgQmlnIHRvIHJvdW5kLlxyXG4gICAgICogZHAge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogcm0ge251bWJlcn0gMCwgMSwgMiBvciAzIChET1dOLCBIQUxGX1VQLCBIQUxGX0VWRU4sIFVQKVxyXG4gICAgICogW21vcmVdIHtib29sZWFufSBXaGV0aGVyIHRoZSByZXN1bHQgb2YgZGl2aXNpb24gd2FzIHRydW5jYXRlZC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gcm5kKHgsIGRwLCBybSwgbW9yZSkge1xyXG4gICAgICAgIHZhciB1LFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgaSA9IHguZSArIGRwICsgMTtcclxuXHJcbiAgICAgICAgaWYgKHJtID09PSAxKSB7XHJcblxyXG4gICAgICAgICAgICAvLyB4Y1tpXSBpcyB0aGUgZGlnaXQgYWZ0ZXIgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgIG1vcmUgPSB4Y1tpXSA+PSA1O1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm0gPT09IDIpIHtcclxuICAgICAgICAgICAgbW9yZSA9IHhjW2ldID4gNSB8fCB4Y1tpXSA9PSA1ICYmXHJcbiAgICAgICAgICAgICAgKG1vcmUgfHwgaSA8IDAgfHwgeGNbaSArIDFdICE9PSB1IHx8IHhjW2kgLSAxXSAmIDEpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocm0gPT09IDMpIHtcclxuICAgICAgICAgICAgbW9yZSA9IG1vcmUgfHwgeGNbaV0gIT09IHUgfHwgaSA8IDA7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbW9yZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgaWYgKHJtICE9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aHJvd0VycignIUJpZy5STSEnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGkgPCAxIHx8ICF4Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKG1vcmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAxLCAwLjEsIDAuMDEsIDAuMDAxLCAwLjAwMDEgZXRjLlxyXG4gICAgICAgICAgICAgICAgeC5lID0gLWRwO1xyXG4gICAgICAgICAgICAgICAgeC5jID0gWzFdO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgICAgICB4LmMgPSBbeC5lID0gMF07XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgLy8gUmVtb3ZlIGFueSBkaWdpdHMgYWZ0ZXIgdGhlIHJlcXVpcmVkIGRlY2ltYWwgcGxhY2VzLlxyXG4gICAgICAgICAgICB4Yy5sZW5ndGggPSBpLS07XHJcblxyXG4gICAgICAgICAgICAvLyBSb3VuZCB1cD9cclxuICAgICAgICAgICAgaWYgKG1vcmUpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSb3VuZGluZyB1cCBtYXkgbWVhbiB0aGUgcHJldmlvdXMgZGlnaXQgaGFzIHRvIGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgICAgICBmb3IgKDsgKyt4Y1tpXSA+IDk7KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeGNbaV0gPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWktLSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICArK3guZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGMudW5zaGlmdCgxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yIChpID0geGMubGVuZ3RoOyAheGNbLS1pXTsgeGMucG9wKCkpIHtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBUaHJvdyBhIEJpZ0Vycm9yLlxyXG4gICAgICpcclxuICAgICAqIG1lc3NhZ2Uge3N0cmluZ30gVGhlIGVycm9yIG1lc3NhZ2UuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHRocm93RXJyKG1lc3NhZ2UpIHtcclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xyXG4gICAgICAgIGVyci5uYW1lID0gJ0JpZ0Vycm9yJztcclxuXHJcbiAgICAgICAgdGhyb3cgZXJyO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBQcm90b3R5cGUvaW5zdGFuY2UgbWV0aG9kc1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBCaWcuXHJcbiAgICAgKi9cclxuICAgIFAuYWJzID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciB4ID0gbmV3IHRoaXMuY29uc3RydWN0b3IodGhpcyk7XHJcbiAgICAgICAgeC5zID0gMTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuXHJcbiAgICAgKiAxIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZyB5LFxyXG4gICAgICogLTEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGlzIGxlc3MgdGhhbiB0aGUgdmFsdWUgb2YgQmlnIHksIG9yXHJcbiAgICAgKiAwIGlmIHRoZXkgaGF2ZSB0aGUgc2FtZSB2YWx1ZS5cclxuICAgICovXHJcbiAgICBQLmNtcCA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIHhOZWcsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSAoeSA9IG5ldyB4LmNvbnN0cnVjdG9yKHkpKS5jLFxyXG4gICAgICAgICAgICBpID0geC5zLFxyXG4gICAgICAgICAgICBqID0geS5zLFxyXG4gICAgICAgICAgICBrID0geC5lLFxyXG4gICAgICAgICAgICBsID0geS5lO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG4gICAgICAgICAgICByZXR1cm4gIXhjWzBdID8gIXljWzBdID8gMCA6IC1qIDogaTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICBpZiAoaSAhPSBqKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4TmVnID0gaSA8IDA7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmIChrICE9IGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGsgPiBsIF4geE5lZyA/IDEgOiAtMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGkgPSAtMTtcclxuICAgICAgICBqID0gKGsgPSB4Yy5sZW5ndGgpIDwgKGwgPSB5Yy5sZW5ndGgpID8gayA6IGw7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgZm9yICg7ICsraSA8IGo7KSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoeGNbaV0gIT0geWNbaV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4Y1tpXSA+IHljW2ldIF4geE5lZyA/IDEgOiAtMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBsZW5ndGhzLlxyXG4gICAgICAgIHJldHVybiBrID09IGwgPyAwIDogayA+IGwgXiB4TmVnID8gMSA6IC0xO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGRpdmlkZWQgYnkgdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeSwgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWxcclxuICAgICAqIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqL1xyXG4gICAgUC5kaXYgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgLy8gZGl2aWRlbmRcclxuICAgICAgICAgICAgZHZkID0geC5jLFxyXG4gICAgICAgICAgICAvL2Rpdmlzb3JcclxuICAgICAgICAgICAgZHZzID0gKHkgPSBuZXcgQmlnKHkpKS5jLFxyXG4gICAgICAgICAgICBzID0geC5zID09IHkucyA/IDEgOiAtMSxcclxuICAgICAgICAgICAgZHAgPSBCaWcuRFA7XHJcblxyXG4gICAgICAgIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFCaWcuRFAhJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBFaXRoZXIgMD9cclxuICAgICAgICBpZiAoIWR2ZFswXSB8fCAhZHZzWzBdKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBJZiBib3RoIGFyZSAwLCB0aHJvdyBOYU5cclxuICAgICAgICAgICAgaWYgKGR2ZFswXSA9PSBkdnNbMF0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIElmIGR2cyBpcyAwLCB0aHJvdyArLUluZmluaXR5LlxyXG4gICAgICAgICAgICBpZiAoIWR2c1swXSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3dFcnIocyAvIDApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBkdmQgaXMgMCwgcmV0dXJuICstMC5cclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcocyAqIDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIGR2c0wsIGR2c1QsIG5leHQsIGNtcCwgcmVtSSwgdSxcclxuICAgICAgICAgICAgZHZzWiA9IGR2cy5zbGljZSgpLFxyXG4gICAgICAgICAgICBkdmRJID0gZHZzTCA9IGR2cy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGR2ZEwgPSBkdmQubGVuZ3RoLFxyXG4gICAgICAgICAgICAvLyByZW1haW5kZXJcclxuICAgICAgICAgICAgcmVtID0gZHZkLnNsaWNlKDAsIGR2c0wpLFxyXG4gICAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aCxcclxuICAgICAgICAgICAgLy8gcXVvdGllbnRcclxuICAgICAgICAgICAgcSA9IHksXHJcbiAgICAgICAgICAgIHFjID0gcS5jID0gW10sXHJcbiAgICAgICAgICAgIHFpID0gMCxcclxuICAgICAgICAgICAgZGlnaXRzID0gZHAgKyAocS5lID0geC5lIC0geS5lKSArIDE7XHJcblxyXG4gICAgICAgIHEucyA9IHM7XHJcbiAgICAgICAgcyA9IGRpZ2l0cyA8IDAgPyAwIDogZGlnaXRzO1xyXG5cclxuICAgICAgICAvLyBDcmVhdGUgdmVyc2lvbiBvZiBkaXZpc29yIHdpdGggbGVhZGluZyB6ZXJvLlxyXG4gICAgICAgIGR2c1oudW5zaGlmdCgwKTtcclxuXHJcbiAgICAgICAgLy8gQWRkIHplcm9zIHRvIG1ha2UgcmVtYWluZGVyIGFzIGxvbmcgYXMgZGl2aXNvci5cclxuICAgICAgICBmb3IgKDsgcmVtTCsrIDwgZHZzTDsgcmVtLnB1c2goMCkpIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRvIHtcclxuXHJcbiAgICAgICAgICAgIC8vICduZXh0JyBpcyBob3cgbWFueSB0aW1lcyB0aGUgZGl2aXNvciBnb2VzIGludG8gY3VycmVudCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGZvciAobmV4dCA9IDA7IG5leHQgPCAxMDsgbmV4dCsrKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ29tcGFyZSBkaXZpc29yIGFuZCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICBpZiAoZHZzTCAhPSAocmVtTCA9IHJlbS5sZW5ndGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY21wID0gZHZzTCA+IHJlbUwgPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHJlbUkgPSAtMSwgY21wID0gMDsgKytyZW1JIDwgZHZzTDspIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkdnNbcmVtSV0gIT0gcmVtW3JlbUldKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbXAgPSBkdnNbcmVtSV0gPiByZW1bcmVtSV0gPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBkaXZpc29yIDwgcmVtYWluZGVyLCBzdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgaWYgKGNtcCA8IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtYWluZGVyIGNhbid0IGJlIG1vcmUgdGhhbiAxIGRpZ2l0IGxvbmdlciB0aGFuIGRpdmlzb3IuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRXF1YWxpc2UgbGVuZ3RocyB1c2luZyBkaXZpc29yIHdpdGggZXh0cmEgbGVhZGluZyB6ZXJvP1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoZHZzVCA9IHJlbUwgPT0gZHZzTCA/IGR2cyA6IGR2c1o7IHJlbUw7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVtWy0tcmVtTF0gPCBkdnNUW3JlbUxdKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1JID0gcmVtTDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKDsgcmVtSSAmJiAhcmVtWy0tcmVtSV07IHJlbVtyZW1JXSA9IDkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0tcmVtW3JlbUldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtW3JlbUxdICs9IDEwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbVtyZW1MXSAtPSBkdnNUW3JlbUxdO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKDsgIXJlbVswXTsgcmVtLnNoaWZ0KCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBBZGQgdGhlICduZXh0JyBkaWdpdCB0byB0aGUgcmVzdWx0IGFycmF5LlxyXG4gICAgICAgICAgICBxY1txaSsrXSA9IGNtcCA/IG5leHQgOiArK25leHQ7XHJcblxyXG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgaWYgKHJlbVswXSAmJiBjbXApIHtcclxuICAgICAgICAgICAgICAgIHJlbVtyZW1MXSA9IGR2ZFtkdmRJXSB8fCAwO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcmVtID0gWyBkdmRbZHZkSV0gXTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9IHdoaWxlICgoZHZkSSsrIDwgZHZkTCB8fCByZW1bMF0gIT09IHUpICYmIHMtLSk7XHJcblxyXG4gICAgICAgIC8vIExlYWRpbmcgemVybz8gRG8gbm90IHJlbW92ZSBpZiByZXN1bHQgaXMgc2ltcGx5IHplcm8gKHFpID09IDEpLlxyXG4gICAgICAgIGlmICghcWNbMF0gJiYgcWkgIT0gMSkge1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlcmUgY2FuJ3QgYmUgbW9yZSB0aGFuIG9uZSB6ZXJvLlxyXG4gICAgICAgICAgICBxYy5zaGlmdCgpO1xyXG4gICAgICAgICAgICBxLmUtLTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJvdW5kP1xyXG4gICAgICAgIGlmIChxaSA+IGRpZ2l0cykge1xyXG4gICAgICAgICAgICBybmQocSwgZHAsIEJpZy5STSwgcmVtWzBdICE9PSB1KTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBxO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBlcXVhbCB0byB0aGUgdmFsdWUgb2YgQmlnIHksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5lcSA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgcmV0dXJuICF0aGlzLmNtcCh5KTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgZ3JlYXRlciB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmd0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlXHJcbiAgICAgKiB2YWx1ZSBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuZ3RlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPiAtMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWcgeSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmx0ID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy5jbXAoeSkgPCAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeSwgb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAubHRlID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICAgcmV0dXJuIHRoaXMuY21wKHkpIDwgMTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyBtaW51cyB0aGUgdmFsdWVcclxuICAgICAqIG9mIEJpZyB5LlxyXG4gICAgICovXHJcbiAgICBQLnN1YiA9IFAubWludXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciBpLCBqLCB0LCB4TFR5LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgIHJldHVybiB4LnBsdXMoeSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgeGMgPSB4LmMuc2xpY2UoKSxcclxuICAgICAgICAgICAgeGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHljID0geS5jLFxyXG4gICAgICAgICAgICB5ZSA9IHkuZTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIHkgaXMgbm9uLXplcm8/IHggaXMgbm9uLXplcm8/IE9yIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgICAgIHJldHVybiB5Y1swXSA/ICh5LnMgPSAtYiwgeSkgOiBuZXcgQmlnKHhjWzBdID8geCA6IDApO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIGlzIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHhMVHkgPSBhIDwgMCkge1xyXG4gICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgIGZvciAoYiA9IGE7IGItLTsgdC5wdXNoKDApKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgIC8vIEV4cG9uZW50cyBlcXVhbC4gQ2hlY2sgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgICAgIGogPSAoKHhMVHkgPSB4Yy5sZW5ndGggPCB5Yy5sZW5ndGgpID8geGMgOiB5YykubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgZm9yIChhID0gYiA9IDA7IGIgPCBqOyBiKyspIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoeGNbYl0gIT0geWNbYl0pIHtcclxuICAgICAgICAgICAgICAgICAgICB4TFR5ID0geGNbYl0gPCB5Y1tiXTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8geCA8IHk/IFBvaW50IHhjIHRvIHRoZSBhcnJheSBvZiB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICBpZiAoeExUeSkge1xyXG4gICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgIHhjID0geWM7XHJcbiAgICAgICAgICAgIHljID0gdDtcclxuICAgICAgICAgICAgeS5zID0gLXkucztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogQXBwZW5kIHplcm9zIHRvIHhjIGlmIHNob3J0ZXIuIE5vIG5lZWQgdG8gYWRkIHplcm9zIHRvIHljIGlmIHNob3J0ZXJcclxuICAgICAgICAgKiBhcyBzdWJ0cmFjdGlvbiBvbmx5IG5lZWRzIHRvIHN0YXJ0IGF0IHljLmxlbmd0aC5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpZiAoKCBiID0gKGogPSB5Yy5sZW5ndGgpIC0gKGkgPSB4Yy5sZW5ndGgpICkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgICBmb3IgKDsgYi0tOyB4Y1tpKytdID0gMCkge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBTdWJ0cmFjdCB5YyBmcm9tIHhjLlxyXG4gICAgICAgIGZvciAoYiA9IGk7IGogPiBhOyl7XHJcblxyXG4gICAgICAgICAgICBpZiAoeGNbLS1qXSA8IHljW2pdKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgZm9yIChpID0gajsgaSAmJiAheGNbLS1pXTsgeGNbaV0gPSA5KSB7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAtLXhjW2ldO1xyXG4gICAgICAgICAgICAgICAgeGNbal0gKz0gMTA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeGNbal0gLT0geWNbal07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yICg7IHhjWy0tYl0gPT09IDA7IHhjLnBvcCgpKSB7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgICAgIGZvciAoOyB4Y1swXSA9PT0gMDspIHtcclxuICAgICAgICAgICAgeGMuc2hpZnQoKTtcclxuICAgICAgICAgICAgLS15ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAgIC8vIG4gLSBuID0gKzBcclxuICAgICAgICAgICAgeS5zID0gMTtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlc3VsdCBtdXN0IGJlIHplcm8uXHJcbiAgICAgICAgICAgIHhjID0gW3llID0gMF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB5LmMgPSB4YztcclxuICAgICAgICB5LmUgPSB5ZTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgbW9kdWxvIHRoZVxyXG4gICAgICogdmFsdWUgb2YgQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAubW9kID0gZnVuY3Rpb24gKHkpIHtcclxuICAgICAgICB2YXIgeUdUeCxcclxuICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGEgPSB4LnMsXHJcbiAgICAgICAgICAgIGIgPSAoeSA9IG5ldyBCaWcoeSkpLnM7XHJcblxyXG4gICAgICAgIGlmICgheS5jWzBdKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKE5hTik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB4LnMgPSB5LnMgPSAxO1xyXG4gICAgICAgIHlHVHggPSB5LmNtcCh4KSA9PSAxO1xyXG4gICAgICAgIHgucyA9IGE7XHJcbiAgICAgICAgeS5zID0gYjtcclxuXHJcbiAgICAgICAgaWYgKHlHVHgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBhID0gQmlnLkRQO1xyXG4gICAgICAgIGIgPSBCaWcuUk07XHJcbiAgICAgICAgQmlnLkRQID0gQmlnLlJNID0gMDtcclxuICAgICAgICB4ID0geC5kaXYoeSk7XHJcbiAgICAgICAgQmlnLkRQID0gYTtcclxuICAgICAgICBCaWcuUk0gPSBiO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcy5taW51cyggeC50aW1lcyh5KSApO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHBsdXMgdGhlIHZhbHVlXHJcbiAgICAgKiBvZiBCaWcgeS5cclxuICAgICAqL1xyXG4gICAgUC5hZGQgPSBQLnBsdXMgPSBmdW5jdGlvbiAoeSkge1xyXG4gICAgICAgIHZhciB0LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgYSA9IHgucyxcclxuICAgICAgICAgICAgYiA9ICh5ID0gbmV3IEJpZyh5KSkucztcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICAgICAgeS5zID0gLWI7XHJcbiAgICAgICAgICAgIHJldHVybiB4Lm1pbnVzKHkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIHhlID0geC5lLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWUgPSB5LmUsXHJcbiAgICAgICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAgICAgLy8geSBpcyBub24temVybz8geCBpcyBub24temVybz8gT3IgYm90aCBhcmUgemVyby5cclxuICAgICAgICAgICAgcmV0dXJuIHljWzBdID8geSA6IG5ldyBCaWcoeGNbMF0gPyB4IDogYSAqIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgICB4YyA9IHhjLnNsaWNlKCk7XHJcblxyXG4gICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgIC8vIE5vdGU6IEZhc3RlciB0byB1c2UgcmV2ZXJzZSB0aGVuIGRvIHVuc2hpZnRzLlxyXG4gICAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG5cclxuICAgICAgICAgICAgaWYgKGEgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICB5ZSA9IHhlO1xyXG4gICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgZm9yICg7IGEtLTsgdC5wdXNoKDApKSB7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBQb2ludCB4YyB0byB0aGUgbG9uZ2VyIGFycmF5LlxyXG4gICAgICAgIGlmICh4Yy5sZW5ndGggLSB5Yy5sZW5ndGggPCAwKSB7XHJcbiAgICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICAgICAgeWMgPSB4YztcclxuICAgICAgICAgICAgeGMgPSB0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBhID0geWMubGVuZ3RoO1xyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIE9ubHkgc3RhcnQgYWRkaW5nIGF0IHljLmxlbmd0aCAtIDEgYXMgdGhlIGZ1cnRoZXIgZGlnaXRzIG9mIHhjIGNhbiBiZVxyXG4gICAgICAgICAqIGxlZnQgYXMgdGhleSBhcmUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZm9yIChiID0gMDsgYTspIHtcclxuICAgICAgICAgICAgYiA9ICh4Y1stLWFdID0geGNbYV0gKyB5Y1thXSArIGIpIC8gMTAgfCAwO1xyXG4gICAgICAgICAgICB4Y1thXSAlPSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE5vIG5lZWQgdG8gY2hlY2sgZm9yIHplcm8sIGFzICt4ICsgK3kgIT0gMCAmJiAteCArIC15ICE9IDBcclxuXHJcbiAgICAgICAgaWYgKGIpIHtcclxuICAgICAgICAgICAgeGMudW5zaGlmdChiKTtcclxuICAgICAgICAgICAgKyt5ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChhID0geGMubGVuZ3RoOyB4Y1stLWFdID09PSAwOyB4Yy5wb3AoKSkge1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgeS5jID0geGM7XHJcbiAgICAgICAgeS5lID0geWU7XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgcmFpc2VkIHRvIHRoZSBwb3dlciBuLlxyXG4gICAgICogSWYgbiBpcyBuZWdhdGl2ZSwgcm91bmQsIGlmIG5lY2Vzc2FyeSwgdG8gYSBtYXhpbXVtIG9mIEJpZy5EUCBkZWNpbWFsXHJcbiAgICAgKiBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogbiB7bnVtYmVyfSBJbnRlZ2VyLCAtTUFYX1BPV0VSIHRvIE1BWF9QT1dFUiBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAucG93ID0gZnVuY3Rpb24gKG4pIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIG9uZSA9IG5ldyB4LmNvbnN0cnVjdG9yKDEpLFxyXG4gICAgICAgICAgICB5ID0gb25lLFxyXG4gICAgICAgICAgICBpc05lZyA9IG4gPCAwO1xyXG5cclxuICAgICAgICBpZiAobiAhPT0gfn5uIHx8IG4gPCAtTUFYX1BPV0VSIHx8IG4gPiBNQVhfUE9XRVIpIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFwb3chJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBuID0gaXNOZWcgPyAtbiA6IG47XHJcblxyXG4gICAgICAgIGZvciAoOzspIHtcclxuXHJcbiAgICAgICAgICAgIGlmIChuICYgMSkge1xyXG4gICAgICAgICAgICAgICAgeSA9IHkudGltZXMoeCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbiA+Pj0gMTtcclxuXHJcbiAgICAgICAgICAgIGlmICghbikge1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgeCA9IHgudGltZXMoeCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gaXNOZWcgPyBvbmUuZGl2KHkpIDogeTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZyByb3VuZGVkIHRvIGFcclxuICAgICAqIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS5cclxuICAgICAqIElmIGRwIGlzIG5vdCBzcGVjaWZpZWQsIHJvdW5kIHRvIDAgZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgKiBJZiBybSBpcyBub3Qgc3BlY2lmaWVkLCB1c2UgQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICogW3JtXSAwLCAxLCAyIG9yIDMgKFJPVU5EX0RPV04sIFJPVU5EX0hBTEZfVVAsIFJPVU5EX0hBTEZfRVZFTiwgUk9VTkRfVVApXHJcbiAgICAgKi9cclxuICAgIFAucm91bmQgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XHJcbiAgICAgICAgdmFyIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBkcCA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChkcCAhPT0gfn5kcCB8fCBkcCA8IDAgfHwgZHAgPiBNQVhfRFApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoJyFyb3VuZCEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcm5kKHggPSBuZXcgQmlnKHgpLCBkcCwgcm0gPT0gbnVsbCA/IEJpZy5STSA6IHJtKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZyB3aG9zZSB2YWx1ZSBpcyB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhlIHZhbHVlIG9mIHRoaXMgQmlnLFxyXG4gICAgICogcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB0byBhIG1heGltdW0gb2YgQmlnLkRQIGRlY2ltYWwgcGxhY2VzIHVzaW5nXHJcbiAgICAgKiByb3VuZGluZyBtb2RlIEJpZy5STS5cclxuICAgICAqL1xyXG4gICAgUC5zcXJ0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlc3RpbWF0ZSwgciwgYXBwcm94LFxyXG4gICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgQmlnID0geC5jb25zdHJ1Y3RvcixcclxuICAgICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICAgIGkgPSB4LnMsXHJcbiAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgIGhhbGYgPSBuZXcgQmlnKCcwLjUnKTtcclxuXHJcbiAgICAgICAgLy8gWmVybz9cclxuICAgICAgICBpZiAoIXhjWzBdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgQmlnKHgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gSWYgbmVnYXRpdmUsIHRocm93IE5hTi5cclxuICAgICAgICBpZiAoaSA8IDApIHtcclxuICAgICAgICAgICAgdGhyb3dFcnIoTmFOKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEVzdGltYXRlLlxyXG4gICAgICAgIGkgPSBNYXRoLnNxcnQoeC50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgLy8gTWF0aC5zcXJ0IHVuZGVyZmxvdy9vdmVyZmxvdz9cclxuICAgICAgICAvLyBQYXNzIHggdG8gTWF0aC5zcXJ0IGFzIGludGVnZXIsIHRoZW4gYWRqdXN0IHRoZSByZXN1bHQgZXhwb25lbnQuXHJcbiAgICAgICAgaWYgKGkgPT09IDAgfHwgaSA9PT0gMSAvIDApIHtcclxuICAgICAgICAgICAgZXN0aW1hdGUgPSB4Yy5qb2luKCcnKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghKGVzdGltYXRlLmxlbmd0aCArIGUgJiAxKSkge1xyXG4gICAgICAgICAgICAgICAgZXN0aW1hdGUgKz0gJzAnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByID0gbmV3IEJpZyggTWF0aC5zcXJ0KGVzdGltYXRlKS50b1N0cmluZygpICk7XHJcbiAgICAgICAgICAgIHIuZSA9ICgoZSArIDEpIC8gMiB8IDApIC0gKGUgPCAwIHx8IGUgJiAxKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByID0gbmV3IEJpZyhpLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaSA9IHIuZSArIChCaWcuRFAgKz0gNCk7XHJcblxyXG4gICAgICAgIC8vIE5ld3Rvbi1SYXBoc29uIGl0ZXJhdGlvbi5cclxuICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIGFwcHJveCA9IHI7XHJcbiAgICAgICAgICAgIHIgPSBoYWxmLnRpbWVzKCBhcHByb3gucGx1cyggeC5kaXYoYXBwcm94KSApICk7XHJcbiAgICAgICAgfSB3aGlsZSAoIGFwcHJveC5jLnNsaWNlKDAsIGkpLmpvaW4oJycpICE9PVxyXG4gICAgICAgICAgICAgICAgICAgICAgIHIuYy5zbGljZSgwLCBpKS5qb2luKCcnKSApO1xyXG5cclxuICAgICAgICBybmQociwgQmlnLkRQIC09IDQsIEJpZy5STSk7XHJcblxyXG4gICAgICAgIHJldHVybiByO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWcgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHRpbWVzIHRoZSB2YWx1ZSBvZlxyXG4gICAgICogQmlnIHkuXHJcbiAgICAgKi9cclxuICAgIFAubXVsID0gUC50aW1lcyA9IGZ1bmN0aW9uICh5KSB7XHJcbiAgICAgICAgdmFyIGMsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSAoeSA9IG5ldyBCaWcoeSkpLmMsXHJcbiAgICAgICAgICAgIGEgPSB4Yy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGIgPSB5Yy5sZW5ndGgsXHJcbiAgICAgICAgICAgIGkgPSB4LmUsXHJcbiAgICAgICAgICAgIGogPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSBzaWduIG9mIHJlc3VsdC5cclxuICAgICAgICB5LnMgPSB4LnMgPT0geS5zID8gMSA6IC0xO1xyXG5cclxuICAgICAgICAvLyBSZXR1cm4gc2lnbmVkIDAgaWYgZWl0aGVyIDAuXHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWcoeS5zICogMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBJbml0aWFsaXNlIGV4cG9uZW50IG9mIHJlc3VsdCBhcyB4LmUgKyB5LmUuXHJcbiAgICAgICAgeS5lID0gaSArIGo7XHJcblxyXG4gICAgICAgIC8vIElmIGFycmF5IHhjIGhhcyBmZXdlciBkaWdpdHMgdGhhbiB5Yywgc3dhcCB4YyBhbmQgeWMsIGFuZCBsZW5ndGhzLlxyXG4gICAgICAgIGlmIChhIDwgYikge1xyXG4gICAgICAgICAgICBjID0geGM7XHJcbiAgICAgICAgICAgIHhjID0geWM7XHJcbiAgICAgICAgICAgIHljID0gYztcclxuICAgICAgICAgICAgaiA9IGE7XHJcbiAgICAgICAgICAgIGEgPSBiO1xyXG4gICAgICAgICAgICBiID0gajtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluaXRpYWxpc2UgY29lZmZpY2llbnQgYXJyYXkgb2YgcmVzdWx0IHdpdGggemVyb3MuXHJcbiAgICAgICAgZm9yIChjID0gbmV3IEFycmF5KGogPSBhICsgYik7IGotLTsgY1tqXSA9IDApIHtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE11bHRpcGx5LlxyXG5cclxuICAgICAgICAvLyBpIGlzIGluaXRpYWxseSB4Yy5sZW5ndGguXHJcbiAgICAgICAgZm9yIChpID0gYjsgaS0tOykge1xyXG4gICAgICAgICAgICBiID0gMDtcclxuXHJcbiAgICAgICAgICAgIC8vIGEgaXMgeWMubGVuZ3RoLlxyXG4gICAgICAgICAgICBmb3IgKGogPSBhICsgaTsgaiA+IGk7KSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQ3VycmVudCBzdW0gb2YgcHJvZHVjdHMgYXQgdGhpcyBkaWdpdCBwb3NpdGlvbiwgcGx1cyBjYXJyeS5cclxuICAgICAgICAgICAgICAgIGIgPSBjW2pdICsgeWNbaV0gKiB4Y1tqIC0gaSAtIDFdICsgYjtcclxuICAgICAgICAgICAgICAgIGNbai0tXSA9IGIgJSAxMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBjYXJyeVxyXG4gICAgICAgICAgICAgICAgYiA9IGIgLyAxMCB8IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY1tqXSA9IChjW2pdICsgYikgJSAxMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEluY3JlbWVudCByZXN1bHQgZXhwb25lbnQgaWYgdGhlcmUgaXMgYSBmaW5hbCBjYXJyeS5cclxuICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICArK3kuZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBhbnkgbGVhZGluZyB6ZXJvLlxyXG4gICAgICAgIGlmICghY1swXSkge1xyXG4gICAgICAgICAgICBjLnNoaWZ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgZm9yIChpID0gYy5sZW5ndGg7ICFjWy0taV07IGMucG9wKCkpIHtcclxuICAgICAgICB9XHJcbiAgICAgICAgeS5jID0gYztcclxuXHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcuXHJcbiAgICAgKiBSZXR1cm4gZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhpcyBCaWcgaGFzIGEgcG9zaXRpdmUgZXhwb25lbnQgZXF1YWwgdG9cclxuICAgICAqIG9yIGdyZWF0ZXIgdGhhbiBCaWcuRV9QT1MsIG9yIGEgbmVnYXRpdmUgZXhwb25lbnQgZXF1YWwgdG8gb3IgbGVzcyB0aGFuXHJcbiAgICAgKiBCaWcuRV9ORUcuXHJcbiAgICAgKi9cclxuICAgIFAudG9TdHJpbmcgPSBQLnZhbHVlT2YgPSBQLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgIEJpZyA9IHguY29uc3RydWN0b3IsXHJcbiAgICAgICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgICAgIHN0ciA9IHguYy5qb2luKCcnKSxcclxuICAgICAgICAgICAgc3RyTCA9IHN0ci5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uP1xyXG4gICAgICAgIGlmIChlIDw9IEJpZy5FX05FRyB8fCBlID49IEJpZy5FX1BPUykge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgKHN0ckwgPiAxID8gJy4nICsgc3RyLnNsaWNlKDEpIDogJycpICtcclxuICAgICAgICAgICAgICAoZSA8IDAgPyAnZScgOiAnZSsnKSArIGU7XHJcblxyXG4gICAgICAgIC8vIE5lZ2F0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBlbmQgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoOyArK2U7IHN0ciA9ICcwJyArIHN0cikge1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHN0ciA9ICcwLicgKyBzdHI7XHJcblxyXG4gICAgICAgIC8vIFBvc2l0aXZlIGV4cG9uZW50P1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA+IDApIHtcclxuXHJcbiAgICAgICAgICAgIGlmICgrK2UgPiBzdHJMKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQXBwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgZm9yIChlIC09IHN0ckw7IGUtLSA7IHN0ciArPSAnMCcpIHtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlIDwgc3RyTCkge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnNsaWNlKDAsIGUpICsgJy4nICsgc3RyLnNsaWNlKGUpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50IHplcm8uXHJcbiAgICAgICAgfSBlbHNlIGlmIChzdHJMID4gMSkge1xyXG4gICAgICAgICAgICBzdHIgPSBzdHIuY2hhckF0KDApICsgJy4nICsgc3RyLnNsaWNlKDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXZvaWQgJy0wJ1xyXG4gICAgICAgIHJldHVybiB4LnMgPCAwICYmIHguY1swXSA/ICctJyArIHN0ciA6IHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKiBJZiB0b0V4cG9uZW50aWFsLCB0b0ZpeGVkLCB0b1ByZWNpc2lvbiBhbmQgZm9ybWF0IGFyZSBub3QgcmVxdWlyZWQgdGhleVxyXG4gICAgICogY2FuIHNhZmVseSBiZSBjb21tZW50ZWQtb3V0IG9yIGRlbGV0ZWQuIE5vIHJlZHVuZGFudCBjb2RlIHdpbGwgYmUgbGVmdC5cclxuICAgICAqIGZvcm1hdCBpcyB1c2VkIG9ubHkgYnkgdG9FeHBvbmVudGlhbCwgdG9GaXhlZCBhbmQgdG9QcmVjaXNpb24uXHJcbiAgICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXHJcbiAgICAgKi9cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIGluIGV4cG9uZW50aWFsXHJcbiAgICAgKiBub3RhdGlvbiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB1c2luZ1xyXG4gICAgICogQmlnLlJNLlxyXG4gICAgICpcclxuICAgICAqIFtkcF0ge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVhfRFAgaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvRXhwb25lbnRpYWwgPSBmdW5jdGlvbiAoZHApIHtcclxuXHJcbiAgICAgICAgaWYgKGRwID09IG51bGwpIHtcclxuICAgICAgICAgICAgZHAgPSB0aGlzLmMubGVuZ3RoIC0gMTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwICE9PSB+fmRwIHx8IGRwIDwgMCB8fCBkcCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvRXhwIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBkcCwgMSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWcgaW4gbm9ybWFsIG5vdGF0aW9uXHJcbiAgICAgKiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyBhbmQgcm91bmRlZCwgaWYgbmVjZXNzYXJ5LCB1c2luZyBCaWcuUk0uXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9GaXhlZCA9IGZ1bmN0aW9uIChkcCkge1xyXG4gICAgICAgIHZhciBzdHIsXHJcbiAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICBCaWcgPSB4LmNvbnN0cnVjdG9yLFxyXG4gICAgICAgICAgICBuZWcgPSBCaWcuRV9ORUcsXHJcbiAgICAgICAgICAgIHBvcyA9IEJpZy5FX1BPUztcclxuXHJcbiAgICAgICAgLy8gUHJldmVudCB0aGUgcG9zc2liaWxpdHkgb2YgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgQmlnLkVfTkVHID0gLShCaWcuRV9QT1MgPSAxIC8gMCk7XHJcblxyXG4gICAgICAgIGlmIChkcCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IHgudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRwID09PSB+fmRwICYmIGRwID49IDAgJiYgZHAgPD0gTUFYX0RQKSB7XHJcbiAgICAgICAgICAgIHN0ciA9IGZvcm1hdCh4LCB4LmUgKyBkcCk7XHJcblxyXG4gICAgICAgICAgICAvLyAoLTApLnRvRml4ZWQoKSBpcyAnMCcsIGJ1dCAoLTAuMSkudG9GaXhlZCgpIGlzICctMCcuXHJcbiAgICAgICAgICAgIC8vICgtMCkudG9GaXhlZCgxKSBpcyAnMC4wJywgYnV0ICgtMC4wMSkudG9GaXhlZCgxKSBpcyAnLTAuMCcuXHJcbiAgICAgICAgICAgIGlmICh4LnMgPCAwICYmIHguY1swXSAmJiBzdHIuaW5kZXhPZignLScpIDwgMCkge1xyXG4gICAgICAgIC8vRS5nLiAtMC41IGlmIHJvdW5kZWQgdG8gLTAgd2lsbCBjYXVzZSB0b1N0cmluZyB0byBvbWl0IHRoZSBtaW51cyBzaWduLlxyXG4gICAgICAgICAgICAgICAgc3RyID0gJy0nICsgc3RyO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEJpZy5FX05FRyA9IG5lZztcclxuICAgICAgICBCaWcuRV9QT1MgPSBwb3M7XHJcblxyXG4gICAgICAgIGlmICghc3RyKSB7XHJcbiAgICAgICAgICAgIHRocm93RXJyKCchdG9GaXghJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnIHJvdW5kZWQgdG8gc2RcclxuICAgICAqIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyBCaWcuUk0uIFVzZSBleHBvbmVudGlhbCBub3RhdGlvbiBpZiBzZCBpcyBsZXNzXHJcbiAgICAgKiB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGVcclxuICAgICAqIHZhbHVlIGluIG5vcm1hbCBub3RhdGlvbi5cclxuICAgICAqXHJcbiAgICAgKiBzZCB7bnVtYmVyfSBJbnRlZ2VyLCAxIHRvIE1BWF9EUCBpbmNsdXNpdmUuXHJcbiAgICAgKi9cclxuICAgIFAudG9QcmVjaXNpb24gPSBmdW5jdGlvbiAoc2QpIHtcclxuXHJcbiAgICAgICAgaWYgKHNkID09IG51bGwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudG9TdHJpbmcoKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHNkICE9PSB+fnNkIHx8IHNkIDwgMSB8fCBzZCA+IE1BWF9EUCkge1xyXG4gICAgICAgICAgICB0aHJvd0VycignIXRvUHJlIScpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBzZCAtIDEsIDIpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLy8gRXhwb3J0XHJcblxyXG5cclxuICAgIEJpZyA9IGJpZ0ZhY3RvcnkoKTtcclxuXHJcbiAgICAvL0FNRC5cclxuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcclxuICAgICAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gQmlnO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIC8vIE5vZGUgYW5kIG90aGVyIENvbW1vbkpTLWxpa2UgZW52aXJvbm1lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cy5cclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IEJpZztcclxuICAgICAgICBtb2R1bGUuZXhwb3J0cy5CaWcgPSBCaWc7XHJcblxyXG4gICAgLy9Ccm93c2VyLlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBnbG9iYWwuQmlnID0gQmlnO1xyXG4gICAgfVxyXG59KSh0aGlzKTtcclxuXG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9ub2RlX21vZHVsZXMvYmlnLmpzL2JpZy5qc1xuLy8gbW9kdWxlIGlkID0gMTNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiY3J5cHRvXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiY3J5cHRvXCJcbi8vIG1vZHVsZSBpZCA9IDE0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIlwidXNlIHN0cmljdFwiO1xuXG5jb25zdCBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG5jb25zdCBlbW9qaXNMaXN0ID0gcmVxdWlyZShcImVtb2ppcy1saXN0XCIpO1xuY29uc3QgZ2V0SGFzaERpZ2VzdCA9IHJlcXVpcmUoXCIuL2dldEhhc2hEaWdlc3RcIik7XG5cbmNvbnN0IGVtb2ppUmVnZXggPSAvW1xcdUQ4MDAtXFx1REZGRl0uLztcbmNvbnN0IGVtb2ppTGlzdCA9IGVtb2ppc0xpc3QuZmlsdGVyKGVtb2ppID0+IGVtb2ppUmVnZXgudGVzdChlbW9qaSkpO1xuY29uc3QgZW1vamlDYWNoZSA9IHt9O1xuXG5mdW5jdGlvbiBlbmNvZGVTdHJpbmdUb0Vtb2ppKGNvbnRlbnQsIGxlbmd0aCkge1xuXHRpZihlbW9qaUNhY2hlW2NvbnRlbnRdKSByZXR1cm4gZW1vamlDYWNoZVtjb250ZW50XTtcblx0bGVuZ3RoID0gbGVuZ3RoIHx8IDE7XG5cdGNvbnN0IGVtb2ppcyA9IFtdO1xuXHRkbyB7XG5cdFx0Y29uc3QgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBlbW9qaUxpc3QubGVuZ3RoKTtcblx0XHRlbW9qaXMucHVzaChlbW9qaUxpc3RbaW5kZXhdKTtcblx0XHRlbW9qaUxpc3Quc3BsaWNlKGluZGV4LCAxKTtcblx0fSB3aGlsZSgtLWxlbmd0aCA+IDApO1xuXHRjb25zdCBlbW9qaUVuY29kaW5nID0gZW1vamlzLmpvaW4oXCJcIik7XG5cdGVtb2ppQ2FjaGVbY29udGVudF0gPSBlbW9qaUVuY29kaW5nO1xuXHRyZXR1cm4gZW1vamlFbmNvZGluZztcbn1cblxuZnVuY3Rpb24gaW50ZXJwb2xhdGVOYW1lKGxvYWRlckNvbnRleHQsIG5hbWUsIG9wdGlvbnMpIHtcblx0bGV0IGZpbGVuYW1lO1xuXHRpZih0eXBlb2YgbmFtZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0ZmlsZW5hbWUgPSBuYW1lKGxvYWRlckNvbnRleHQucmVzb3VyY2VQYXRoKTtcblx0fSBlbHNlIHtcblx0XHRmaWxlbmFtZSA9IG5hbWUgfHwgXCJbaGFzaF0uW2V4dF1cIjtcblx0fVxuXHRjb25zdCBjb250ZXh0ID0gb3B0aW9ucy5jb250ZXh0O1xuXHRjb25zdCBjb250ZW50ID0gb3B0aW9ucy5jb250ZW50O1xuXHRjb25zdCByZWdFeHAgPSBvcHRpb25zLnJlZ0V4cDtcblx0bGV0IGV4dCA9IFwiYmluXCI7XG5cdGxldCBiYXNlbmFtZSA9IFwiZmlsZVwiO1xuXHRsZXQgZGlyZWN0b3J5ID0gXCJcIjtcblx0bGV0IGZvbGRlciA9IFwiXCI7XG5cdGlmKGxvYWRlckNvbnRleHQucmVzb3VyY2VQYXRoKSB7XG5cdFx0Y29uc3QgcGFyc2VkID0gcGF0aC5wYXJzZShsb2FkZXJDb250ZXh0LnJlc291cmNlUGF0aCk7XG5cdFx0bGV0IHJlc291cmNlUGF0aCA9IGxvYWRlckNvbnRleHQucmVzb3VyY2VQYXRoO1xuXG5cdFx0aWYocGFyc2VkLmV4dCkge1xuXHRcdFx0ZXh0ID0gcGFyc2VkLmV4dC5zdWJzdHIoMSk7XG5cdFx0fVxuXHRcdGlmKHBhcnNlZC5kaXIpIHtcblx0XHRcdGJhc2VuYW1lID0gcGFyc2VkLm5hbWU7XG5cdFx0XHRyZXNvdXJjZVBhdGggPSBwYXJzZWQuZGlyICsgcGF0aC5zZXA7XG5cdFx0fVxuXHRcdGlmKHR5cGVvZiBjb250ZXh0ICE9PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRkaXJlY3RvcnkgPSBwYXRoLnJlbGF0aXZlKGNvbnRleHQsIHJlc291cmNlUGF0aCArIFwiX1wiKS5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKS5yZXBsYWNlKC9cXC5cXC4oXFwvKT8vZywgXCJfJDFcIik7XG5cdFx0XHRkaXJlY3RvcnkgPSBkaXJlY3Rvcnkuc3Vic3RyKDAsIGRpcmVjdG9yeS5sZW5ndGggLSAxKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGlyZWN0b3J5ID0gcmVzb3VyY2VQYXRoLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpLnJlcGxhY2UoL1xcLlxcLihcXC8pPy9nLCBcIl8kMVwiKTtcblx0XHR9XG5cdFx0aWYoZGlyZWN0b3J5Lmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0ZGlyZWN0b3J5ID0gXCJcIjtcblx0XHR9IGVsc2UgaWYoZGlyZWN0b3J5Lmxlbmd0aCA+IDEpIHtcblx0XHRcdGZvbGRlciA9IHBhdGguYmFzZW5hbWUoZGlyZWN0b3J5KTtcblx0XHR9XG5cdH1cblx0bGV0IHVybCA9IGZpbGVuYW1lO1xuXHRpZihjb250ZW50KSB7XG5cdFx0Ly8gTWF0Y2ggaGFzaCB0ZW1wbGF0ZVxuXHRcdHVybCA9IHVybFxuXHRcdFx0LnJlcGxhY2UoXG5cdFx0XHRcdC9cXFsoPzooXFx3Kyk6KT9oYXNoKD86OihbYS16XStcXGQqKSk/KD86OihcXGQrKSk/XFxdL2lnLFxuXHRcdFx0XHQoYWxsLCBoYXNoVHlwZSwgZGlnZXN0VHlwZSwgbWF4TGVuZ3RoKSA9PiBnZXRIYXNoRGlnZXN0KGNvbnRlbnQsIGhhc2hUeXBlLCBkaWdlc3RUeXBlLCBwYXJzZUludChtYXhMZW5ndGgsIDEwKSlcblx0XHRcdClcblx0XHRcdC5yZXBsYWNlKFxuXHRcdFx0XHQvXFxbZW1vamkoPzo6KFxcZCspKT9cXF0vaWcsXG5cdFx0XHRcdChhbGwsIGxlbmd0aCkgPT4gZW5jb2RlU3RyaW5nVG9FbW9qaShjb250ZW50LCBsZW5ndGgpXG5cdFx0XHQpO1xuXHR9XG5cdHVybCA9IHVybFxuXHRcdC5yZXBsYWNlKC9cXFtleHRcXF0vaWcsICgpID0+IGV4dClcblx0XHQucmVwbGFjZSgvXFxbbmFtZVxcXS9pZywgKCkgPT4gYmFzZW5hbWUpXG5cdFx0LnJlcGxhY2UoL1xcW3BhdGhcXF0vaWcsICgpID0+IGRpcmVjdG9yeSlcblx0XHQucmVwbGFjZSgvXFxbZm9sZGVyXFxdL2lnLCAoKSA9PiBmb2xkZXIpO1xuXHRpZihyZWdFeHAgJiYgbG9hZGVyQ29udGV4dC5yZXNvdXJjZVBhdGgpIHtcblx0XHRjb25zdCBtYXRjaCA9IGxvYWRlckNvbnRleHQucmVzb3VyY2VQYXRoLm1hdGNoKG5ldyBSZWdFeHAocmVnRXhwKSk7XG5cdFx0bWF0Y2ggJiYgbWF0Y2guZm9yRWFjaCgobWF0Y2hlZCwgaSkgPT4ge1xuXHRcdFx0dXJsID0gdXJsLnJlcGxhY2UoXG5cdFx0XHRcdG5ldyBSZWdFeHAoXCJcXFxcW1wiICsgaSArIFwiXFxcXF1cIiwgXCJpZ1wiKSxcblx0XHRcdFx0bWF0Y2hlZFxuXHRcdFx0KTtcblx0XHR9KTtcblx0fVxuXHRpZih0eXBlb2YgbG9hZGVyQ29udGV4dC5vcHRpb25zID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiBsb2FkZXJDb250ZXh0Lm9wdGlvbnMuY3VzdG9tSW50ZXJwb2xhdGVOYW1lID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHR1cmwgPSBsb2FkZXJDb250ZXh0Lm9wdGlvbnMuY3VzdG9tSW50ZXJwb2xhdGVOYW1lLmNhbGwobG9hZGVyQ29udGV4dCwgdXJsLCBuYW1lLCBvcHRpb25zKTtcblx0fVxuXHRyZXR1cm4gdXJsO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGludGVycG9sYXRlTmFtZTtcblxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vbm9kZV9tb2R1bGVzL2xvYWRlci11dGlscy9saWIvaW50ZXJwb2xhdGVOYW1lLmpzXG4vLyBtb2R1bGUgaWQgPSAxNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IFtcbiAgXCLwn4CEXCIsXG4gIFwi8J+Dj1wiLFxuICBcIvCfhbBcIixcbiAgXCLwn4WxXCIsXG4gIFwi8J+FvlwiLFxuICBcIvCfhb9cIixcbiAgXCLwn4aOXCIsXG4gIFwi8J+GkVwiLFxuICBcIvCfhpJcIixcbiAgXCLwn4aTXCIsXG4gIFwi8J+GlFwiLFxuICBcIvCfhpVcIixcbiAgXCLwn4aWXCIsXG4gIFwi8J+Gl1wiLFxuICBcIvCfhphcIixcbiAgXCLwn4aZXCIsXG4gIFwi8J+GmlwiLFxuICBcIvCfh6bwn4eoXCIsXG4gIFwi8J+HpvCfh6lcIixcbiAgXCLwn4em8J+HqlwiLFxuICBcIvCfh6bwn4erXCIsXG4gIFwi8J+HpvCfh6xcIixcbiAgXCLwn4em8J+HrlwiLFxuICBcIvCfh6bwn4exXCIsXG4gIFwi8J+HpvCfh7JcIixcbiAgXCLwn4em8J+HtFwiLFxuICBcIvCfh6bwn4e2XCIsXG4gIFwi8J+HpvCfh7dcIixcbiAgXCLwn4em8J+HuFwiLFxuICBcIvCfh6bwn4e5XCIsXG4gIFwi8J+HpvCfh7pcIixcbiAgXCLwn4em8J+HvFwiLFxuICBcIvCfh6bwn4e9XCIsXG4gIFwi8J+HpvCfh79cIixcbiAgXCLwn4emXCIsXG4gIFwi8J+Hp/Cfh6ZcIixcbiAgXCLwn4en8J+Hp1wiLFxuICBcIvCfh6fwn4epXCIsXG4gIFwi8J+Hp/Cfh6pcIixcbiAgXCLwn4en8J+Hq1wiLFxuICBcIvCfh6fwn4esXCIsXG4gIFwi8J+Hp/Cfh61cIixcbiAgXCLwn4en8J+HrlwiLFxuICBcIvCfh6fwn4evXCIsXG4gIFwi8J+Hp/Cfh7FcIixcbiAgXCLwn4en8J+HslwiLFxuICBcIvCfh6fwn4ezXCIsXG4gIFwi8J+Hp/Cfh7RcIixcbiAgXCLwn4en8J+HtlwiLFxuICBcIvCfh6fwn4e3XCIsXG4gIFwi8J+Hp/Cfh7hcIixcbiAgXCLwn4en8J+HuVwiLFxuICBcIvCfh6fwn4e7XCIsXG4gIFwi8J+Hp/Cfh7xcIixcbiAgXCLwn4en8J+HvlwiLFxuICBcIvCfh6fwn4e/XCIsXG4gIFwi8J+Hp1wiLFxuICBcIvCfh6jwn4emXCIsXG4gIFwi8J+HqPCfh6hcIixcbiAgXCLwn4eo8J+HqVwiLFxuICBcIvCfh6jwn4erXCIsXG4gIFwi8J+HqPCfh6xcIixcbiAgXCLwn4eo8J+HrVwiLFxuICBcIvCfh6jwn4euXCIsXG4gIFwi8J+HqPCfh7BcIixcbiAgXCLwn4eo8J+HsVwiLFxuICBcIvCfh6jwn4eyXCIsXG4gIFwi8J+HqPCfh7NcIixcbiAgXCLwn4eo8J+HtFwiLFxuICBcIvCfh6jwn4e1XCIsXG4gIFwi8J+HqPCfh7dcIixcbiAgXCLwn4eo8J+HulwiLFxuICBcIvCfh6jwn4e7XCIsXG4gIFwi8J+HqPCfh7xcIixcbiAgXCLwn4eo8J+HvVwiLFxuICBcIvCfh6jwn4e+XCIsXG4gIFwi8J+HqPCfh79cIixcbiAgXCLwn4eoXCIsXG4gIFwi8J+HqfCfh6pcIixcbiAgXCLwn4ep8J+HrFwiLFxuICBcIvCfh6nwn4evXCIsXG4gIFwi8J+HqfCfh7BcIixcbiAgXCLwn4ep8J+HslwiLFxuICBcIvCfh6nwn4e0XCIsXG4gIFwi8J+HqfCfh79cIixcbiAgXCLwn4epXCIsXG4gIFwi8J+HqvCfh6ZcIixcbiAgXCLwn4eq8J+HqFwiLFxuICBcIvCfh6rwn4eqXCIsXG4gIFwi8J+HqvCfh6xcIixcbiAgXCLwn4eq8J+HrVwiLFxuICBcIvCfh6rwn4e3XCIsXG4gIFwi8J+HqvCfh7hcIixcbiAgXCLwn4eq8J+HuVwiLFxuICBcIvCfh6rwn4e6XCIsXG4gIFwi8J+HqlwiLFxuICBcIvCfh6vwn4euXCIsXG4gIFwi8J+Hq/Cfh69cIixcbiAgXCLwn4er8J+HsFwiLFxuICBcIvCfh6vwn4eyXCIsXG4gIFwi8J+Hq/Cfh7RcIixcbiAgXCLwn4er8J+Ht1wiLFxuICBcIvCfh6tcIixcbiAgXCLwn4es8J+HplwiLFxuICBcIvCfh6zwn4enXCIsXG4gIFwi8J+HrPCfh6lcIixcbiAgXCLwn4es8J+HqlwiLFxuICBcIvCfh6zwn4erXCIsXG4gIFwi8J+HrPCfh6xcIixcbiAgXCLwn4es8J+HrVwiLFxuICBcIvCfh6zwn4euXCIsXG4gIFwi8J+HrPCfh7FcIixcbiAgXCLwn4es8J+HslwiLFxuICBcIvCfh6zwn4ezXCIsXG4gIFwi8J+HrPCfh7VcIixcbiAgXCLwn4es8J+HtlwiLFxuICBcIvCfh6zwn4e3XCIsXG4gIFwi8J+HrPCfh7hcIixcbiAgXCLwn4es8J+HuVwiLFxuICBcIvCfh6zwn4e6XCIsXG4gIFwi8J+HrPCfh7xcIixcbiAgXCLwn4es8J+HvlwiLFxuICBcIvCfh6xcIixcbiAgXCLwn4et8J+HsFwiLFxuICBcIvCfh63wn4eyXCIsXG4gIFwi8J+HrfCfh7NcIixcbiAgXCLwn4et8J+Ht1wiLFxuICBcIvCfh63wn4e5XCIsXG4gIFwi8J+HrfCfh7pcIixcbiAgXCLwn4etXCIsXG4gIFwi8J+HrvCfh6hcIixcbiAgXCLwn4eu8J+HqVwiLFxuICBcIvCfh67wn4eqXCIsXG4gIFwi8J+HrvCfh7FcIixcbiAgXCLwn4eu8J+HslwiLFxuICBcIvCfh67wn4ezXCIsXG4gIFwi8J+HrvCfh7RcIixcbiAgXCLwn4eu8J+HtlwiLFxuICBcIvCfh67wn4e3XCIsXG4gIFwi8J+HrvCfh7hcIixcbiAgXCLwn4eu8J+HuVwiLFxuICBcIvCfh65cIixcbiAgXCLwn4ev8J+HqlwiLFxuICBcIvCfh6/wn4eyXCIsXG4gIFwi8J+Hr/Cfh7RcIixcbiAgXCLwn4ev8J+HtVwiLFxuICBcIvCfh69cIixcbiAgXCLwn4ew8J+HqlwiLFxuICBcIvCfh7Dwn4esXCIsXG4gIFwi8J+HsPCfh61cIixcbiAgXCLwn4ew8J+HrlwiLFxuICBcIvCfh7Dwn4eyXCIsXG4gIFwi8J+HsPCfh7NcIixcbiAgXCLwn4ew8J+HtVwiLFxuICBcIvCfh7Dwn4e3XCIsXG4gIFwi8J+HsPCfh7xcIixcbiAgXCLwn4ew8J+HvlwiLFxuICBcIvCfh7Dwn4e/XCIsXG4gIFwi8J+HsFwiLFxuICBcIvCfh7Hwn4emXCIsXG4gIFwi8J+HsfCfh6dcIixcbiAgXCLwn4ex8J+HqFwiLFxuICBcIvCfh7Hwn4euXCIsXG4gIFwi8J+HsfCfh7BcIixcbiAgXCLwn4ex8J+Ht1wiLFxuICBcIvCfh7Hwn4e4XCIsXG4gIFwi8J+HsfCfh7lcIixcbiAgXCLwn4ex8J+HulwiLFxuICBcIvCfh7Hwn4e7XCIsXG4gIFwi8J+HsfCfh75cIixcbiAgXCLwn4exXCIsXG4gIFwi8J+HsvCfh6ZcIixcbiAgXCLwn4ey8J+HqFwiLFxuICBcIvCfh7Lwn4epXCIsXG4gIFwi8J+HsvCfh6pcIixcbiAgXCLwn4ey8J+Hq1wiLFxuICBcIvCfh7Lwn4esXCIsXG4gIFwi8J+HsvCfh61cIixcbiAgXCLwn4ey8J+HsFwiLFxuICBcIvCfh7Lwn4exXCIsXG4gIFwi8J+HsvCfh7JcIixcbiAgXCLwn4ey8J+Hs1wiLFxuICBcIvCfh7Lwn4e0XCIsXG4gIFwi8J+HsvCfh7VcIixcbiAgXCLwn4ey8J+HtlwiLFxuICBcIvCfh7Lwn4e3XCIsXG4gIFwi8J+HsvCfh7hcIixcbiAgXCLwn4ey8J+HuVwiLFxuICBcIvCfh7Lwn4e6XCIsXG4gIFwi8J+HsvCfh7tcIixcbiAgXCLwn4ey8J+HvFwiLFxuICBcIvCfh7Lwn4e9XCIsXG4gIFwi8J+HsvCfh75cIixcbiAgXCLwn4ey8J+Hv1wiLFxuICBcIvCfh7JcIixcbiAgXCLwn4ez8J+HplwiLFxuICBcIvCfh7Pwn4eoXCIsXG4gIFwi8J+Hs/Cfh6pcIixcbiAgXCLwn4ez8J+Hq1wiLFxuICBcIvCfh7Pwn4esXCIsXG4gIFwi8J+Hs/Cfh65cIixcbiAgXCLwn4ez8J+HsVwiLFxuICBcIvCfh7Pwn4e0XCIsXG4gIFwi8J+Hs/Cfh7VcIixcbiAgXCLwn4ez8J+Ht1wiLFxuICBcIvCfh7Pwn4e6XCIsXG4gIFwi8J+Hs/Cfh79cIixcbiAgXCLwn4ezXCIsXG4gIFwi8J+HtPCfh7JcIixcbiAgXCLwn4e0XCIsXG4gIFwi8J+HtfCfh6ZcIixcbiAgXCLwn4e18J+HqlwiLFxuICBcIvCfh7Xwn4erXCIsXG4gIFwi8J+HtfCfh6xcIixcbiAgXCLwn4e18J+HrVwiLFxuICBcIvCfh7Xwn4ewXCIsXG4gIFwi8J+HtfCfh7FcIixcbiAgXCLwn4e18J+HslwiLFxuICBcIvCfh7Xwn4ezXCIsXG4gIFwi8J+HtfCfh7dcIixcbiAgXCLwn4e18J+HuFwiLFxuICBcIvCfh7Xwn4e5XCIsXG4gIFwi8J+HtfCfh7xcIixcbiAgXCLwn4e18J+HvlwiLFxuICBcIvCfh7VcIixcbiAgXCLwn4e28J+HplwiLFxuICBcIvCfh7ZcIixcbiAgXCLwn4e38J+HqlwiLFxuICBcIvCfh7fwn4e0XCIsXG4gIFwi8J+Ht/Cfh7hcIixcbiAgXCLwn4e38J+HulwiLFxuICBcIvCfh7fwn4e8XCIsXG4gIFwi8J+Ht1wiLFxuICBcIvCfh7jwn4emXCIsXG4gIFwi8J+HuPCfh6dcIixcbiAgXCLwn4e48J+HqFwiLFxuICBcIvCfh7jwn4epXCIsXG4gIFwi8J+HuPCfh6pcIixcbiAgXCLwn4e48J+HrFwiLFxuICBcIvCfh7jwn4etXCIsXG4gIFwi8J+HuPCfh65cIixcbiAgXCLwn4e48J+Hr1wiLFxuICBcIvCfh7jwn4ewXCIsXG4gIFwi8J+HuPCfh7FcIixcbiAgXCLwn4e48J+HslwiLFxuICBcIvCfh7jwn4ezXCIsXG4gIFwi8J+HuPCfh7RcIixcbiAgXCLwn4e48J+Ht1wiLFxuICBcIvCfh7jwn4e4XCIsXG4gIFwi8J+HuPCfh7lcIixcbiAgXCLwn4e48J+Hu1wiLFxuICBcIvCfh7jwn4e9XCIsXG4gIFwi8J+HuPCfh75cIixcbiAgXCLwn4e48J+Hv1wiLFxuICBcIvCfh7hcIixcbiAgXCLwn4e58J+HplwiLFxuICBcIvCfh7nwn4eoXCIsXG4gIFwi8J+HufCfh6lcIixcbiAgXCLwn4e58J+Hq1wiLFxuICBcIvCfh7nwn4esXCIsXG4gIFwi8J+HufCfh61cIixcbiAgXCLwn4e58J+Hr1wiLFxuICBcIvCfh7nwn4ewXCIsXG4gIFwi8J+HufCfh7FcIixcbiAgXCLwn4e58J+HslwiLFxuICBcIvCfh7nwn4ezXCIsXG4gIFwi8J+HufCfh7RcIixcbiAgXCLwn4e58J+Ht1wiLFxuICBcIvCfh7nwn4e5XCIsXG4gIFwi8J+HufCfh7tcIixcbiAgXCLwn4e58J+HvFwiLFxuICBcIvCfh7nwn4e/XCIsXG4gIFwi8J+HuVwiLFxuICBcIvCfh7rwn4emXCIsXG4gIFwi8J+HuvCfh6xcIixcbiAgXCLwn4e68J+HslwiLFxuICBcIvCfh7rwn4ezXCIsXG4gIFwi8J+HuvCfh7hcIixcbiAgXCLwn4e68J+HvlwiLFxuICBcIvCfh7rwn4e/XCIsXG4gIFwi8J+HulwiLFxuICBcIvCfh7vwn4emXCIsXG4gIFwi8J+Hu/Cfh6hcIixcbiAgXCLwn4e78J+HqlwiLFxuICBcIvCfh7vwn4esXCIsXG4gIFwi8J+Hu/Cfh65cIixcbiAgXCLwn4e78J+Hs1wiLFxuICBcIvCfh7vwn4e6XCIsXG4gIFwi8J+Hu1wiLFxuICBcIvCfh7zwn4erXCIsXG4gIFwi8J+HvPCfh7hcIixcbiAgXCLwn4e8XCIsXG4gIFwi8J+HvfCfh7BcIixcbiAgXCLwn4e9XCIsXG4gIFwi8J+HvvCfh6pcIixcbiAgXCLwn4e+8J+HuVwiLFxuICBcIvCfh75cIixcbiAgXCLwn4e/8J+HplwiLFxuICBcIvCfh7/wn4eyXCIsXG4gIFwi8J+Hv/Cfh7xcIixcbiAgXCLwn4e/XCIsXG4gIFwi8J+IgVwiLFxuICBcIvCfiIJcIixcbiAgXCLwn4iaXCIsXG4gIFwi8J+Ir1wiLFxuICBcIvCfiLJcIixcbiAgXCLwn4izXCIsXG4gIFwi8J+ItFwiLFxuICBcIvCfiLVcIixcbiAgXCLwn4i2XCIsXG4gIFwi8J+It1wiLFxuICBcIvCfiLhcIixcbiAgXCLwn4i5XCIsXG4gIFwi8J+IulwiLFxuICBcIvCfiZBcIixcbiAgXCLwn4mRXCIsXG4gIFwi8J+MgFwiLFxuICBcIvCfjIFcIixcbiAgXCLwn4yCXCIsXG4gIFwi8J+Mg1wiLFxuICBcIvCfjIRcIixcbiAgXCLwn4yFXCIsXG4gIFwi8J+MhlwiLFxuICBcIvCfjIdcIixcbiAgXCLwn4yIXCIsXG4gIFwi8J+MiVwiLFxuICBcIvCfjIpcIixcbiAgXCLwn4yLXCIsXG4gIFwi8J+MjFwiLFxuICBcIvCfjI1cIixcbiAgXCLwn4yOXCIsXG4gIFwi8J+Mj1wiLFxuICBcIvCfjJBcIixcbiAgXCLwn4yRXCIsXG4gIFwi8J+MklwiLFxuICBcIvCfjJNcIixcbiAgXCLwn4yUXCIsXG4gIFwi8J+MlVwiLFxuICBcIvCfjJZcIixcbiAgXCLwn4yXXCIsXG4gIFwi8J+MmFwiLFxuICBcIvCfjJlcIixcbiAgXCLwn4yaXCIsXG4gIFwi8J+Mm1wiLFxuICBcIvCfjJxcIixcbiAgXCLwn4ydXCIsXG4gIFwi8J+MnlwiLFxuICBcIvCfjJ9cIixcbiAgXCLwn4ygXCIsXG4gIFwi8J+MoVwiLFxuICBcIvCfjKRcIixcbiAgXCLwn4ylXCIsXG4gIFwi8J+MplwiLFxuICBcIvCfjKdcIixcbiAgXCLwn4yoXCIsXG4gIFwi8J+MqVwiLFxuICBcIvCfjKpcIixcbiAgXCLwn4yrXCIsXG4gIFwi8J+MrFwiLFxuICBcIvCfjK1cIixcbiAgXCLwn4yuXCIsXG4gIFwi8J+Mr1wiLFxuICBcIvCfjLBcIixcbiAgXCLwn4yxXCIsXG4gIFwi8J+MslwiLFxuICBcIvCfjLNcIixcbiAgXCLwn4y0XCIsXG4gIFwi8J+MtVwiLFxuICBcIvCfjLZcIixcbiAgXCLwn4y3XCIsXG4gIFwi8J+MuFwiLFxuICBcIvCfjLlcIixcbiAgXCLwn4y6XCIsXG4gIFwi8J+Mu1wiLFxuICBcIvCfjLxcIixcbiAgXCLwn4y9XCIsXG4gIFwi8J+MvlwiLFxuICBcIvCfjL9cIixcbiAgXCLwn42AXCIsXG4gIFwi8J+NgVwiLFxuICBcIvCfjYJcIixcbiAgXCLwn42DXCIsXG4gIFwi8J+NhFwiLFxuICBcIvCfjYVcIixcbiAgXCLwn42GXCIsXG4gIFwi8J+Nh1wiLFxuICBcIvCfjYhcIixcbiAgXCLwn42JXCIsXG4gIFwi8J+NilwiLFxuICBcIvCfjYtcIixcbiAgXCLwn42MXCIsXG4gIFwi8J+NjVwiLFxuICBcIvCfjY5cIixcbiAgXCLwn42PXCIsXG4gIFwi8J+NkFwiLFxuICBcIvCfjZFcIixcbiAgXCLwn42SXCIsXG4gIFwi8J+Nk1wiLFxuICBcIvCfjZRcIixcbiAgXCLwn42VXCIsXG4gIFwi8J+NllwiLFxuICBcIvCfjZdcIixcbiAgXCLwn42YXCIsXG4gIFwi8J+NmVwiLFxuICBcIvCfjZpcIixcbiAgXCLwn42bXCIsXG4gIFwi8J+NnFwiLFxuICBcIvCfjZ1cIixcbiAgXCLwn42eXCIsXG4gIFwi8J+Nn1wiLFxuICBcIvCfjaBcIixcbiAgXCLwn42hXCIsXG4gIFwi8J+NolwiLFxuICBcIvCfjaNcIixcbiAgXCLwn42kXCIsXG4gIFwi8J+NpVwiLFxuICBcIvCfjaZcIixcbiAgXCLwn42nXCIsXG4gIFwi8J+NqFwiLFxuICBcIvCfjalcIixcbiAgXCLwn42qXCIsXG4gIFwi8J+Nq1wiLFxuICBcIvCfjaxcIixcbiAgXCLwn42tXCIsXG4gIFwi8J+NrlwiLFxuICBcIvCfja9cIixcbiAgXCLwn42wXCIsXG4gIFwi8J+NsVwiLFxuICBcIvCfjbJcIixcbiAgXCLwn42zXCIsXG4gIFwi8J+NtFwiLFxuICBcIvCfjbVcIixcbiAgXCLwn422XCIsXG4gIFwi8J+Nt1wiLFxuICBcIvCfjbhcIixcbiAgXCLwn425XCIsXG4gIFwi8J+NulwiLFxuICBcIvCfjbtcIixcbiAgXCLwn428XCIsXG4gIFwi8J+NvVwiLFxuICBcIvCfjb5cIixcbiAgXCLwn42/XCIsXG4gIFwi8J+OgFwiLFxuICBcIvCfjoFcIixcbiAgXCLwn46CXCIsXG4gIFwi8J+Og1wiLFxuICBcIvCfjoRcIixcbiAgXCLwn46F8J+Pu1wiLFxuICBcIvCfjoXwn4+8XCIsXG4gIFwi8J+OhfCfj71cIixcbiAgXCLwn46F8J+PvlwiLFxuICBcIvCfjoXwn4+/XCIsXG4gIFwi8J+OhVwiLFxuICBcIvCfjoZcIixcbiAgXCLwn46HXCIsXG4gIFwi8J+OiFwiLFxuICBcIvCfjolcIixcbiAgXCLwn46KXCIsXG4gIFwi8J+Oi1wiLFxuICBcIvCfjoxcIixcbiAgXCLwn46NXCIsXG4gIFwi8J+OjlwiLFxuICBcIvCfjo9cIixcbiAgXCLwn46QXCIsXG4gIFwi8J+OkVwiLFxuICBcIvCfjpJcIixcbiAgXCLwn46TXCIsXG4gIFwi8J+OllwiLFxuICBcIvCfjpdcIixcbiAgXCLwn46ZXCIsXG4gIFwi8J+OmlwiLFxuICBcIvCfjptcIixcbiAgXCLwn46eXCIsXG4gIFwi8J+On1wiLFxuICBcIvCfjqBcIixcbiAgXCLwn46hXCIsXG4gIFwi8J+OolwiLFxuICBcIvCfjqNcIixcbiAgXCLwn46kXCIsXG4gIFwi8J+OpVwiLFxuICBcIvCfjqZcIixcbiAgXCLwn46nXCIsXG4gIFwi8J+OqFwiLFxuICBcIvCfjqlcIixcbiAgXCLwn46qXCIsXG4gIFwi8J+Oq1wiLFxuICBcIvCfjqxcIixcbiAgXCLwn46tXCIsXG4gIFwi8J+OrlwiLFxuICBcIvCfjq9cIixcbiAgXCLwn46wXCIsXG4gIFwi8J+OsVwiLFxuICBcIvCfjrJcIixcbiAgXCLwn46zXCIsXG4gIFwi8J+OtFwiLFxuICBcIvCfjrVcIixcbiAgXCLwn462XCIsXG4gIFwi8J+Ot1wiLFxuICBcIvCfjrhcIixcbiAgXCLwn465XCIsXG4gIFwi8J+OulwiLFxuICBcIvCfjrtcIixcbiAgXCLwn468XCIsXG4gIFwi8J+OvVwiLFxuICBcIvCfjr5cIixcbiAgXCLwn46/XCIsXG4gIFwi8J+PgFwiLFxuICBcIvCfj4FcIixcbiAgXCLwn4+C8J+Pu1wiLFxuICBcIvCfj4Lwn4+8XCIsXG4gIFwi8J+PgvCfj71cIixcbiAgXCLwn4+C8J+PvlwiLFxuICBcIvCfj4Lwn4+/XCIsXG4gIFwi8J+PglwiLFxuICBcIvCfj4Pwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+Pg/Cfj7vigI3imYLvuI9cIixcbiAgXCLwn4+D8J+Pu1wiLFxuICBcIvCfj4Pwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+Pg/Cfj7zigI3imYLvuI9cIixcbiAgXCLwn4+D8J+PvFwiLFxuICBcIvCfj4Pwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+Pg/Cfj73igI3imYLvuI9cIixcbiAgXCLwn4+D8J+PvVwiLFxuICBcIvCfj4Pwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+Pg/Cfj77igI3imYLvuI9cIixcbiAgXCLwn4+D8J+PvlwiLFxuICBcIvCfj4Pwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+Pg/Cfj7/igI3imYLvuI9cIixcbiAgXCLwn4+D8J+Pv1wiLFxuICBcIvCfj4PigI3imYDvuI9cIixcbiAgXCLwn4+D4oCN4pmC77iPXCIsXG4gIFwi8J+Pg1wiLFxuICBcIvCfj4Twn4+74oCN4pmA77iPXCIsXG4gIFwi8J+PhPCfj7vigI3imYLvuI9cIixcbiAgXCLwn4+E8J+Pu1wiLFxuICBcIvCfj4Twn4+84oCN4pmA77iPXCIsXG4gIFwi8J+PhPCfj7zigI3imYLvuI9cIixcbiAgXCLwn4+E8J+PvFwiLFxuICBcIvCfj4Twn4+94oCN4pmA77iPXCIsXG4gIFwi8J+PhPCfj73igI3imYLvuI9cIixcbiAgXCLwn4+E8J+PvVwiLFxuICBcIvCfj4Twn4++4oCN4pmA77iPXCIsXG4gIFwi8J+PhPCfj77igI3imYLvuI9cIixcbiAgXCLwn4+E8J+PvlwiLFxuICBcIvCfj4Twn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+PhPCfj7/igI3imYLvuI9cIixcbiAgXCLwn4+E8J+Pv1wiLFxuICBcIvCfj4TigI3imYDvuI9cIixcbiAgXCLwn4+E4oCN4pmC77iPXCIsXG4gIFwi8J+PhFwiLFxuICBcIvCfj4VcIixcbiAgXCLwn4+GXCIsXG4gIFwi8J+Ph/Cfj7tcIixcbiAgXCLwn4+H8J+PvFwiLFxuICBcIvCfj4fwn4+9XCIsXG4gIFwi8J+Ph/Cfj75cIixcbiAgXCLwn4+H8J+Pv1wiLFxuICBcIvCfj4dcIixcbiAgXCLwn4+IXCIsXG4gIFwi8J+PiVwiLFxuICBcIvCfj4rwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+PivCfj7vigI3imYLvuI9cIixcbiAgXCLwn4+K8J+Pu1wiLFxuICBcIvCfj4rwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+PivCfj7zigI3imYLvuI9cIixcbiAgXCLwn4+K8J+PvFwiLFxuICBcIvCfj4rwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+PivCfj73igI3imYLvuI9cIixcbiAgXCLwn4+K8J+PvVwiLFxuICBcIvCfj4rwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+PivCfj77igI3imYLvuI9cIixcbiAgXCLwn4+K8J+PvlwiLFxuICBcIvCfj4rwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+PivCfj7/igI3imYLvuI9cIixcbiAgXCLwn4+K8J+Pv1wiLFxuICBcIvCfj4rigI3imYDvuI9cIixcbiAgXCLwn4+K4oCN4pmC77iPXCIsXG4gIFwi8J+PilwiLFxuICBcIvCfj4vwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+Pi/Cfj7vigI3imYLvuI9cIixcbiAgXCLwn4+L8J+Pu1wiLFxuICBcIvCfj4vwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+Pi/Cfj7zigI3imYLvuI9cIixcbiAgXCLwn4+L8J+PvFwiLFxuICBcIvCfj4vwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+Pi/Cfj73igI3imYLvuI9cIixcbiAgXCLwn4+L8J+PvVwiLFxuICBcIvCfj4vwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+Pi/Cfj77igI3imYLvuI9cIixcbiAgXCLwn4+L8J+PvlwiLFxuICBcIvCfj4vwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+Pi/Cfj7/igI3imYLvuI9cIixcbiAgXCLwn4+L8J+Pv1wiLFxuICBcIvCfj4vvuI/igI3imYDvuI9cIixcbiAgXCLwn4+L77iP4oCN4pmC77iPXCIsXG4gIFwi8J+Pi1wiLFxuICBcIvCfj4zwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+PjPCfj7vigI3imYLvuI9cIixcbiAgXCLwn4+M8J+Pu1wiLFxuICBcIvCfj4zwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+PjPCfj7zigI3imYLvuI9cIixcbiAgXCLwn4+M8J+PvFwiLFxuICBcIvCfj4zwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+PjPCfj73igI3imYLvuI9cIixcbiAgXCLwn4+M8J+PvVwiLFxuICBcIvCfj4zwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+PjPCfj77igI3imYLvuI9cIixcbiAgXCLwn4+M8J+PvlwiLFxuICBcIvCfj4zwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+PjPCfj7/igI3imYLvuI9cIixcbiAgXCLwn4+M8J+Pv1wiLFxuICBcIvCfj4zvuI/igI3imYDvuI9cIixcbiAgXCLwn4+M77iP4oCN4pmC77iPXCIsXG4gIFwi8J+PjFwiLFxuICBcIvCfj41cIixcbiAgXCLwn4+OXCIsXG4gIFwi8J+Pj1wiLFxuICBcIvCfj5BcIixcbiAgXCLwn4+RXCIsXG4gIFwi8J+PklwiLFxuICBcIvCfj5NcIixcbiAgXCLwn4+UXCIsXG4gIFwi8J+PlVwiLFxuICBcIvCfj5ZcIixcbiAgXCLwn4+XXCIsXG4gIFwi8J+PmFwiLFxuICBcIvCfj5lcIixcbiAgXCLwn4+aXCIsXG4gIFwi8J+Pm1wiLFxuICBcIvCfj5xcIixcbiAgXCLwn4+dXCIsXG4gIFwi8J+PnlwiLFxuICBcIvCfj59cIixcbiAgXCLwn4+gXCIsXG4gIFwi8J+PoVwiLFxuICBcIvCfj6JcIixcbiAgXCLwn4+jXCIsXG4gIFwi8J+PpFwiLFxuICBcIvCfj6VcIixcbiAgXCLwn4+mXCIsXG4gIFwi8J+Pp1wiLFxuICBcIvCfj6hcIixcbiAgXCLwn4+pXCIsXG4gIFwi8J+PqlwiLFxuICBcIvCfj6tcIixcbiAgXCLwn4+sXCIsXG4gIFwi8J+PrVwiLFxuICBcIvCfj65cIixcbiAgXCLwn4+vXCIsXG4gIFwi8J+PsFwiLFxuICBcIvCfj7PvuI/igI3wn4yIXCIsXG4gIFwi8J+Ps1wiLFxuICBcIvCfj7TigI3imKDvuI9cIixcbiAgXCLwn4+0XCIsXG4gIFwi8J+PtVwiLFxuICBcIvCfj7dcIixcbiAgXCLwn4+4XCIsXG4gIFwi8J+PuVwiLFxuICBcIvCfj7pcIixcbiAgXCLwn4+7XCIsXG4gIFwi8J+PvFwiLFxuICBcIvCfj71cIixcbiAgXCLwn4++XCIsXG4gIFwi8J+Pv1wiLFxuICBcIvCfkIBcIixcbiAgXCLwn5CBXCIsXG4gIFwi8J+QglwiLFxuICBcIvCfkINcIixcbiAgXCLwn5CEXCIsXG4gIFwi8J+QhVwiLFxuICBcIvCfkIZcIixcbiAgXCLwn5CHXCIsXG4gIFwi8J+QiFwiLFxuICBcIvCfkIlcIixcbiAgXCLwn5CKXCIsXG4gIFwi8J+Qi1wiLFxuICBcIvCfkIxcIixcbiAgXCLwn5CNXCIsXG4gIFwi8J+QjlwiLFxuICBcIvCfkI9cIixcbiAgXCLwn5CQXCIsXG4gIFwi8J+QkVwiLFxuICBcIvCfkJJcIixcbiAgXCLwn5CTXCIsXG4gIFwi8J+QlFwiLFxuICBcIvCfkJVcIixcbiAgXCLwn5CWXCIsXG4gIFwi8J+Ql1wiLFxuICBcIvCfkJhcIixcbiAgXCLwn5CZXCIsXG4gIFwi8J+QmlwiLFxuICBcIvCfkJtcIixcbiAgXCLwn5CcXCIsXG4gIFwi8J+QnVwiLFxuICBcIvCfkJ5cIixcbiAgXCLwn5CfXCIsXG4gIFwi8J+QoFwiLFxuICBcIvCfkKFcIixcbiAgXCLwn5CiXCIsXG4gIFwi8J+Qo1wiLFxuICBcIvCfkKRcIixcbiAgXCLwn5ClXCIsXG4gIFwi8J+QplwiLFxuICBcIvCfkKdcIixcbiAgXCLwn5CoXCIsXG4gIFwi8J+QqVwiLFxuICBcIvCfkKpcIixcbiAgXCLwn5CrXCIsXG4gIFwi8J+QrFwiLFxuICBcIvCfkK1cIixcbiAgXCLwn5CuXCIsXG4gIFwi8J+Qr1wiLFxuICBcIvCfkLBcIixcbiAgXCLwn5CxXCIsXG4gIFwi8J+QslwiLFxuICBcIvCfkLNcIixcbiAgXCLwn5C0XCIsXG4gIFwi8J+QtVwiLFxuICBcIvCfkLZcIixcbiAgXCLwn5C3XCIsXG4gIFwi8J+QuFwiLFxuICBcIvCfkLlcIixcbiAgXCLwn5C6XCIsXG4gIFwi8J+Qu1wiLFxuICBcIvCfkLxcIixcbiAgXCLwn5C9XCIsXG4gIFwi8J+QvlwiLFxuICBcIvCfkL9cIixcbiAgXCLwn5GAXCIsXG4gIFwi8J+RgeKAjfCfl6hcIixcbiAgXCLwn5GBXCIsXG4gIFwi8J+RgvCfj7tcIixcbiAgXCLwn5GC8J+PvFwiLFxuICBcIvCfkYLwn4+9XCIsXG4gIFwi8J+RgvCfj75cIixcbiAgXCLwn5GC8J+Pv1wiLFxuICBcIvCfkYJcIixcbiAgXCLwn5GD8J+Pu1wiLFxuICBcIvCfkYPwn4+8XCIsXG4gIFwi8J+Rg/Cfj71cIixcbiAgXCLwn5GD8J+PvlwiLFxuICBcIvCfkYPwn4+/XCIsXG4gIFwi8J+Rg1wiLFxuICBcIvCfkYRcIixcbiAgXCLwn5GFXCIsXG4gIFwi8J+RhvCfj7tcIixcbiAgXCLwn5GG8J+PvFwiLFxuICBcIvCfkYbwn4+9XCIsXG4gIFwi8J+RhvCfj75cIixcbiAgXCLwn5GG8J+Pv1wiLFxuICBcIvCfkYZcIixcbiAgXCLwn5GH8J+Pu1wiLFxuICBcIvCfkYfwn4+8XCIsXG4gIFwi8J+Rh/Cfj71cIixcbiAgXCLwn5GH8J+PvlwiLFxuICBcIvCfkYfwn4+/XCIsXG4gIFwi8J+Rh1wiLFxuICBcIvCfkYjwn4+7XCIsXG4gIFwi8J+RiPCfj7xcIixcbiAgXCLwn5GI8J+PvVwiLFxuICBcIvCfkYjwn4++XCIsXG4gIFwi8J+RiPCfj79cIixcbiAgXCLwn5GIXCIsXG4gIFwi8J+RifCfj7tcIixcbiAgXCLwn5GJ8J+PvFwiLFxuICBcIvCfkYnwn4+9XCIsXG4gIFwi8J+RifCfj75cIixcbiAgXCLwn5GJ8J+Pv1wiLFxuICBcIvCfkYlcIixcbiAgXCLwn5GK8J+Pu1wiLFxuICBcIvCfkYrwn4+8XCIsXG4gIFwi8J+RivCfj71cIixcbiAgXCLwn5GK8J+PvlwiLFxuICBcIvCfkYrwn4+/XCIsXG4gIFwi8J+RilwiLFxuICBcIvCfkYvwn4+7XCIsXG4gIFwi8J+Ri/Cfj7xcIixcbiAgXCLwn5GL8J+PvVwiLFxuICBcIvCfkYvwn4++XCIsXG4gIFwi8J+Ri/Cfj79cIixcbiAgXCLwn5GLXCIsXG4gIFwi8J+RjPCfj7tcIixcbiAgXCLwn5GM8J+PvFwiLFxuICBcIvCfkYzwn4+9XCIsXG4gIFwi8J+RjPCfj75cIixcbiAgXCLwn5GM8J+Pv1wiLFxuICBcIvCfkYxcIixcbiAgXCLwn5GN8J+Pu1wiLFxuICBcIvCfkY3wn4+8XCIsXG4gIFwi8J+RjfCfj71cIixcbiAgXCLwn5GN8J+PvlwiLFxuICBcIvCfkY3wn4+/XCIsXG4gIFwi8J+RjVwiLFxuICBcIvCfkY7wn4+7XCIsXG4gIFwi8J+RjvCfj7xcIixcbiAgXCLwn5GO8J+PvVwiLFxuICBcIvCfkY7wn4++XCIsXG4gIFwi8J+RjvCfj79cIixcbiAgXCLwn5GOXCIsXG4gIFwi8J+Rj/Cfj7tcIixcbiAgXCLwn5GP8J+PvFwiLFxuICBcIvCfkY/wn4+9XCIsXG4gIFwi8J+Rj/Cfj75cIixcbiAgXCLwn5GP8J+Pv1wiLFxuICBcIvCfkY9cIixcbiAgXCLwn5GQ8J+Pu1wiLFxuICBcIvCfkZDwn4+8XCIsXG4gIFwi8J+RkPCfj71cIixcbiAgXCLwn5GQ8J+PvlwiLFxuICBcIvCfkZDwn4+/XCIsXG4gIFwi8J+RkFwiLFxuICBcIvCfkZFcIixcbiAgXCLwn5GSXCIsXG4gIFwi8J+Rk1wiLFxuICBcIvCfkZRcIixcbiAgXCLwn5GVXCIsXG4gIFwi8J+RllwiLFxuICBcIvCfkZdcIixcbiAgXCLwn5GYXCIsXG4gIFwi8J+RmVwiLFxuICBcIvCfkZpcIixcbiAgXCLwn5GbXCIsXG4gIFwi8J+RnFwiLFxuICBcIvCfkZ1cIixcbiAgXCLwn5GeXCIsXG4gIFwi8J+Rn1wiLFxuICBcIvCfkaBcIixcbiAgXCLwn5GhXCIsXG4gIFwi8J+RolwiLFxuICBcIvCfkaNcIixcbiAgXCLwn5GkXCIsXG4gIFwi8J+RpVwiLFxuICBcIvCfkabwn4+7XCIsXG4gIFwi8J+RpvCfj7xcIixcbiAgXCLwn5Gm8J+PvVwiLFxuICBcIvCfkabwn4++XCIsXG4gIFwi8J+RpvCfj79cIixcbiAgXCLwn5GmXCIsXG4gIFwi8J+Rp/Cfj7tcIixcbiAgXCLwn5Gn8J+PvFwiLFxuICBcIvCfkafwn4+9XCIsXG4gIFwi8J+Rp/Cfj75cIixcbiAgXCLwn5Gn8J+Pv1wiLFxuICBcIvCfkadcIixcbiAgXCLwn5Go8J+Pu+KAjfCfjL5cIixcbiAgXCLwn5Go8J+Pu+KAjfCfjbNcIixcbiAgXCLwn5Go8J+Pu+KAjfCfjpNcIixcbiAgXCLwn5Go8J+Pu+KAjfCfjqRcIixcbiAgXCLwn5Go8J+Pu+KAjfCfjqhcIixcbiAgXCLwn5Go8J+Pu+KAjfCfj6tcIixcbiAgXCLwn5Go8J+Pu+KAjfCfj61cIixcbiAgXCLwn5Go8J+Pu+KAjfCfkrtcIixcbiAgXCLwn5Go8J+Pu+KAjfCfkrxcIixcbiAgXCLwn5Go8J+Pu+KAjfCflKdcIixcbiAgXCLwn5Go8J+Pu+KAjfCflKxcIixcbiAgXCLwn5Go8J+Pu+KAjfCfmoBcIixcbiAgXCLwn5Go8J+Pu+KAjfCfmpJcIixcbiAgXCLwn5Go8J+Pu+KAjeKale+4j1wiLFxuICBcIvCfkajwn4+74oCN4pqW77iPXCIsXG4gIFwi8J+RqPCfj7vigI3inIjvuI9cIixcbiAgXCLwn5Go8J+Pu1wiLFxuICBcIvCfkajwn4+84oCN8J+MvlwiLFxuICBcIvCfkajwn4+84oCN8J+Ns1wiLFxuICBcIvCfkajwn4+84oCN8J+Ok1wiLFxuICBcIvCfkajwn4+84oCN8J+OpFwiLFxuICBcIvCfkajwn4+84oCN8J+OqFwiLFxuICBcIvCfkajwn4+84oCN8J+Pq1wiLFxuICBcIvCfkajwn4+84oCN8J+PrVwiLFxuICBcIvCfkajwn4+84oCN8J+Su1wiLFxuICBcIvCfkajwn4+84oCN8J+SvFwiLFxuICBcIvCfkajwn4+84oCN8J+Up1wiLFxuICBcIvCfkajwn4+84oCN8J+UrFwiLFxuICBcIvCfkajwn4+84oCN8J+agFwiLFxuICBcIvCfkajwn4+84oCN8J+aklwiLFxuICBcIvCfkajwn4+84oCN4pqV77iPXCIsXG4gIFwi8J+RqPCfj7zigI3impbvuI9cIixcbiAgXCLwn5Go8J+PvOKAjeKciO+4j1wiLFxuICBcIvCfkajwn4+8XCIsXG4gIFwi8J+RqPCfj73igI3wn4y+XCIsXG4gIFwi8J+RqPCfj73igI3wn42zXCIsXG4gIFwi8J+RqPCfj73igI3wn46TXCIsXG4gIFwi8J+RqPCfj73igI3wn46kXCIsXG4gIFwi8J+RqPCfj73igI3wn46oXCIsXG4gIFwi8J+RqPCfj73igI3wn4+rXCIsXG4gIFwi8J+RqPCfj73igI3wn4+tXCIsXG4gIFwi8J+RqPCfj73igI3wn5K7XCIsXG4gIFwi8J+RqPCfj73igI3wn5K8XCIsXG4gIFwi8J+RqPCfj73igI3wn5SnXCIsXG4gIFwi8J+RqPCfj73igI3wn5SsXCIsXG4gIFwi8J+RqPCfj73igI3wn5qAXCIsXG4gIFwi8J+RqPCfj73igI3wn5qSXCIsXG4gIFwi8J+RqPCfj73igI3impXvuI9cIixcbiAgXCLwn5Go8J+PveKAjeKalu+4j1wiLFxuICBcIvCfkajwn4+94oCN4pyI77iPXCIsXG4gIFwi8J+RqPCfj71cIixcbiAgXCLwn5Go8J+PvuKAjfCfjL5cIixcbiAgXCLwn5Go8J+PvuKAjfCfjbNcIixcbiAgXCLwn5Go8J+PvuKAjfCfjpNcIixcbiAgXCLwn5Go8J+PvuKAjfCfjqRcIixcbiAgXCLwn5Go8J+PvuKAjfCfjqhcIixcbiAgXCLwn5Go8J+PvuKAjfCfj6tcIixcbiAgXCLwn5Go8J+PvuKAjfCfj61cIixcbiAgXCLwn5Go8J+PvuKAjfCfkrtcIixcbiAgXCLwn5Go8J+PvuKAjfCfkrxcIixcbiAgXCLwn5Go8J+PvuKAjfCflKdcIixcbiAgXCLwn5Go8J+PvuKAjfCflKxcIixcbiAgXCLwn5Go8J+PvuKAjfCfmoBcIixcbiAgXCLwn5Go8J+PvuKAjfCfmpJcIixcbiAgXCLwn5Go8J+PvuKAjeKale+4j1wiLFxuICBcIvCfkajwn4++4oCN4pqW77iPXCIsXG4gIFwi8J+RqPCfj77igI3inIjvuI9cIixcbiAgXCLwn5Go8J+PvlwiLFxuICBcIvCfkajwn4+/4oCN8J+MvlwiLFxuICBcIvCfkajwn4+/4oCN8J+Ns1wiLFxuICBcIvCfkajwn4+/4oCN8J+Ok1wiLFxuICBcIvCfkajwn4+/4oCN8J+OpFwiLFxuICBcIvCfkajwn4+/4oCN8J+OqFwiLFxuICBcIvCfkajwn4+/4oCN8J+Pq1wiLFxuICBcIvCfkajwn4+/4oCN8J+PrVwiLFxuICBcIvCfkajwn4+/4oCN8J+Su1wiLFxuICBcIvCfkajwn4+/4oCN8J+SvFwiLFxuICBcIvCfkajwn4+/4oCN8J+Up1wiLFxuICBcIvCfkajwn4+/4oCN8J+UrFwiLFxuICBcIvCfkajwn4+/4oCN8J+agFwiLFxuICBcIvCfkajwn4+/4oCN8J+aklwiLFxuICBcIvCfkajwn4+/4oCN4pqV77iPXCIsXG4gIFwi8J+RqPCfj7/igI3impbvuI9cIixcbiAgXCLwn5Go8J+Pv+KAjeKciO+4j1wiLFxuICBcIvCfkajwn4+/XCIsXG4gIFwi8J+RqOKAjfCfjL5cIixcbiAgXCLwn5Go4oCN8J+Ns1wiLFxuICBcIvCfkajigI3wn46TXCIsXG4gIFwi8J+RqOKAjfCfjqRcIixcbiAgXCLwn5Go4oCN8J+OqFwiLFxuICBcIvCfkajigI3wn4+rXCIsXG4gIFwi8J+RqOKAjfCfj61cIixcbiAgXCLwn5Go4oCN8J+RpuKAjfCfkaZcIixcbiAgXCLwn5Go4oCN8J+RplwiLFxuICBcIvCfkajigI3wn5Gn4oCN8J+RplwiLFxuICBcIvCfkajigI3wn5Gn4oCN8J+Rp1wiLFxuICBcIvCfkajigI3wn5GnXCIsXG4gIFwi8J+RqOKAjfCfkajigI3wn5Gm4oCN8J+RplwiLFxuICBcIvCfkajigI3wn5Go4oCN8J+RplwiLFxuICBcIvCfkajigI3wn5Go4oCN8J+Rp+KAjfCfkaZcIixcbiAgXCLwn5Go4oCN8J+RqOKAjfCfkafigI3wn5GnXCIsXG4gIFwi8J+RqOKAjfCfkajigI3wn5GnXCIsXG4gIFwi8J+RqOKAjfCfkanigI3wn5Gm4oCN8J+RplwiLFxuICBcIvCfkajigI3wn5Gp4oCN8J+RplwiLFxuICBcIvCfkajigI3wn5Gp4oCN8J+Rp+KAjfCfkaZcIixcbiAgXCLwn5Go4oCN8J+RqeKAjfCfkafigI3wn5GnXCIsXG4gIFwi8J+RqOKAjfCfkanigI3wn5GnXCIsXG4gIFwi8J+RqOKAjfCfkrtcIixcbiAgXCLwn5Go4oCN8J+SvFwiLFxuICBcIvCfkajigI3wn5SnXCIsXG4gIFwi8J+RqOKAjfCflKxcIixcbiAgXCLwn5Go4oCN8J+agFwiLFxuICBcIvCfkajigI3wn5qSXCIsXG4gIFwi8J+RqOKAjeKale+4j1wiLFxuICBcIvCfkajigI3impbvuI9cIixcbiAgXCLwn5Go4oCN4pyI77iPXCIsXG4gIFwi8J+RqOKAjeKdpO+4j+KAjfCfkahcIixcbiAgXCLwn5Go4oCN4p2k77iP4oCN8J+Si+KAjfCfkahcIixcbiAgXCLwn5GoXCIsXG4gIFwi8J+RqfCfj7vigI3wn4y+XCIsXG4gIFwi8J+RqfCfj7vigI3wn42zXCIsXG4gIFwi8J+RqfCfj7vigI3wn46TXCIsXG4gIFwi8J+RqfCfj7vigI3wn46kXCIsXG4gIFwi8J+RqfCfj7vigI3wn46oXCIsXG4gIFwi8J+RqfCfj7vigI3wn4+rXCIsXG4gIFwi8J+RqfCfj7vigI3wn4+tXCIsXG4gIFwi8J+RqfCfj7vigI3wn5K7XCIsXG4gIFwi8J+RqfCfj7vigI3wn5K8XCIsXG4gIFwi8J+RqfCfj7vigI3wn5SnXCIsXG4gIFwi8J+RqfCfj7vigI3wn5SsXCIsXG4gIFwi8J+RqfCfj7vigI3wn5qAXCIsXG4gIFwi8J+RqfCfj7vigI3wn5qSXCIsXG4gIFwi8J+RqfCfj7vigI3impXvuI9cIixcbiAgXCLwn5Gp8J+Pu+KAjeKalu+4j1wiLFxuICBcIvCfkanwn4+74oCN4pyI77iPXCIsXG4gIFwi8J+RqfCfj7tcIixcbiAgXCLwn5Gp8J+PvOKAjfCfjL5cIixcbiAgXCLwn5Gp8J+PvOKAjfCfjbNcIixcbiAgXCLwn5Gp8J+PvOKAjfCfjpNcIixcbiAgXCLwn5Gp8J+PvOKAjfCfjqRcIixcbiAgXCLwn5Gp8J+PvOKAjfCfjqhcIixcbiAgXCLwn5Gp8J+PvOKAjfCfj6tcIixcbiAgXCLwn5Gp8J+PvOKAjfCfj61cIixcbiAgXCLwn5Gp8J+PvOKAjfCfkrtcIixcbiAgXCLwn5Gp8J+PvOKAjfCfkrxcIixcbiAgXCLwn5Gp8J+PvOKAjfCflKdcIixcbiAgXCLwn5Gp8J+PvOKAjfCflKxcIixcbiAgXCLwn5Gp8J+PvOKAjfCfmoBcIixcbiAgXCLwn5Gp8J+PvOKAjfCfmpJcIixcbiAgXCLwn5Gp8J+PvOKAjeKale+4j1wiLFxuICBcIvCfkanwn4+84oCN4pqW77iPXCIsXG4gIFwi8J+RqfCfj7zigI3inIjvuI9cIixcbiAgXCLwn5Gp8J+PvFwiLFxuICBcIvCfkanwn4+94oCN8J+MvlwiLFxuICBcIvCfkanwn4+94oCN8J+Ns1wiLFxuICBcIvCfkanwn4+94oCN8J+Ok1wiLFxuICBcIvCfkanwn4+94oCN8J+OpFwiLFxuICBcIvCfkanwn4+94oCN8J+OqFwiLFxuICBcIvCfkanwn4+94oCN8J+Pq1wiLFxuICBcIvCfkanwn4+94oCN8J+PrVwiLFxuICBcIvCfkanwn4+94oCN8J+Su1wiLFxuICBcIvCfkanwn4+94oCN8J+SvFwiLFxuICBcIvCfkanwn4+94oCN8J+Up1wiLFxuICBcIvCfkanwn4+94oCN8J+UrFwiLFxuICBcIvCfkanwn4+94oCN8J+agFwiLFxuICBcIvCfkanwn4+94oCN8J+aklwiLFxuICBcIvCfkanwn4+94oCN4pqV77iPXCIsXG4gIFwi8J+RqfCfj73igI3impbvuI9cIixcbiAgXCLwn5Gp8J+PveKAjeKciO+4j1wiLFxuICBcIvCfkanwn4+9XCIsXG4gIFwi8J+RqfCfj77igI3wn4y+XCIsXG4gIFwi8J+RqfCfj77igI3wn42zXCIsXG4gIFwi8J+RqfCfj77igI3wn46TXCIsXG4gIFwi8J+RqfCfj77igI3wn46kXCIsXG4gIFwi8J+RqfCfj77igI3wn46oXCIsXG4gIFwi8J+RqfCfj77igI3wn4+rXCIsXG4gIFwi8J+RqfCfj77igI3wn4+tXCIsXG4gIFwi8J+RqfCfj77igI3wn5K7XCIsXG4gIFwi8J+RqfCfj77igI3wn5K8XCIsXG4gIFwi8J+RqfCfj77igI3wn5SnXCIsXG4gIFwi8J+RqfCfj77igI3wn5SsXCIsXG4gIFwi8J+RqfCfj77igI3wn5qAXCIsXG4gIFwi8J+RqfCfj77igI3wn5qSXCIsXG4gIFwi8J+RqfCfj77igI3impXvuI9cIixcbiAgXCLwn5Gp8J+PvuKAjeKalu+4j1wiLFxuICBcIvCfkanwn4++4oCN4pyI77iPXCIsXG4gIFwi8J+RqfCfj75cIixcbiAgXCLwn5Gp8J+Pv+KAjfCfjL5cIixcbiAgXCLwn5Gp8J+Pv+KAjfCfjbNcIixcbiAgXCLwn5Gp8J+Pv+KAjfCfjpNcIixcbiAgXCLwn5Gp8J+Pv+KAjfCfjqRcIixcbiAgXCLwn5Gp8J+Pv+KAjfCfjqhcIixcbiAgXCLwn5Gp8J+Pv+KAjfCfj6tcIixcbiAgXCLwn5Gp8J+Pv+KAjfCfj61cIixcbiAgXCLwn5Gp8J+Pv+KAjfCfkrtcIixcbiAgXCLwn5Gp8J+Pv+KAjfCfkrxcIixcbiAgXCLwn5Gp8J+Pv+KAjfCflKdcIixcbiAgXCLwn5Gp8J+Pv+KAjfCflKxcIixcbiAgXCLwn5Gp8J+Pv+KAjfCfmoBcIixcbiAgXCLwn5Gp8J+Pv+KAjfCfmpJcIixcbiAgXCLwn5Gp8J+Pv+KAjeKale+4j1wiLFxuICBcIvCfkanwn4+/4oCN4pqW77iPXCIsXG4gIFwi8J+RqfCfj7/igI3inIjvuI9cIixcbiAgXCLwn5Gp8J+Pv1wiLFxuICBcIvCfkanigI3wn4y+XCIsXG4gIFwi8J+RqeKAjfCfjbNcIixcbiAgXCLwn5Gp4oCN8J+Ok1wiLFxuICBcIvCfkanigI3wn46kXCIsXG4gIFwi8J+RqeKAjfCfjqhcIixcbiAgXCLwn5Gp4oCN8J+Pq1wiLFxuICBcIvCfkanigI3wn4+tXCIsXG4gIFwi8J+RqeKAjfCfkabigI3wn5GmXCIsXG4gIFwi8J+RqeKAjfCfkaZcIixcbiAgXCLwn5Gp4oCN8J+Rp+KAjfCfkaZcIixcbiAgXCLwn5Gp4oCN8J+Rp+KAjfCfkadcIixcbiAgXCLwn5Gp4oCN8J+Rp1wiLFxuICBcIvCfkanigI3wn5Gp4oCN8J+RpuKAjfCfkaZcIixcbiAgXCLwn5Gp4oCN8J+RqeKAjfCfkaZcIixcbiAgXCLwn5Gp4oCN8J+RqeKAjfCfkafigI3wn5GmXCIsXG4gIFwi8J+RqeKAjfCfkanigI3wn5Gn4oCN8J+Rp1wiLFxuICBcIvCfkanigI3wn5Gp4oCN8J+Rp1wiLFxuICBcIvCfkanigI3wn5K7XCIsXG4gIFwi8J+RqeKAjfCfkrxcIixcbiAgXCLwn5Gp4oCN8J+Up1wiLFxuICBcIvCfkanigI3wn5SsXCIsXG4gIFwi8J+RqeKAjfCfmoBcIixcbiAgXCLwn5Gp4oCN8J+aklwiLFxuICBcIvCfkanigI3impXvuI9cIixcbiAgXCLwn5Gp4oCN4pqW77iPXCIsXG4gIFwi8J+RqeKAjeKciO+4j1wiLFxuICBcIvCfkanigI3inaTvuI/igI3wn5GoXCIsXG4gIFwi8J+RqeKAjeKdpO+4j+KAjfCfkalcIixcbiAgXCLwn5Gp4oCN4p2k77iP4oCN8J+Si+KAjfCfkahcIixcbiAgXCLwn5Gp4oCN4p2k77iP4oCN8J+Si+KAjfCfkalcIixcbiAgXCLwn5GpXCIsXG4gIFwi8J+RqvCfj7tcIixcbiAgXCLwn5Gq8J+PvFwiLFxuICBcIvCfkarwn4+9XCIsXG4gIFwi8J+RqvCfj75cIixcbiAgXCLwn5Gq8J+Pv1wiLFxuICBcIvCfkapcIixcbiAgXCLwn5Gr8J+Pu1wiLFxuICBcIvCfkavwn4+8XCIsXG4gIFwi8J+Rq/Cfj71cIixcbiAgXCLwn5Gr8J+PvlwiLFxuICBcIvCfkavwn4+/XCIsXG4gIFwi8J+Rq1wiLFxuICBcIvCfkazwn4+7XCIsXG4gIFwi8J+RrPCfj7xcIixcbiAgXCLwn5Gs8J+PvVwiLFxuICBcIvCfkazwn4++XCIsXG4gIFwi8J+RrPCfj79cIixcbiAgXCLwn5GsXCIsXG4gIFwi8J+RrfCfj7tcIixcbiAgXCLwn5Gt8J+PvFwiLFxuICBcIvCfka3wn4+9XCIsXG4gIFwi8J+RrfCfj75cIixcbiAgXCLwn5Gt8J+Pv1wiLFxuICBcIvCfka1cIixcbiAgXCLwn5Gu8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfka7wn4+74oCN4pmC77iPXCIsXG4gIFwi8J+RrvCfj7tcIixcbiAgXCLwn5Gu8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfka7wn4+84oCN4pmC77iPXCIsXG4gIFwi8J+RrvCfj7xcIixcbiAgXCLwn5Gu8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfka7wn4+94oCN4pmC77iPXCIsXG4gIFwi8J+RrvCfj71cIixcbiAgXCLwn5Gu8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfka7wn4++4oCN4pmC77iPXCIsXG4gIFwi8J+RrvCfj75cIixcbiAgXCLwn5Gu8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfka7wn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+RrvCfj79cIixcbiAgXCLwn5Gu4oCN4pmA77iPXCIsXG4gIFwi8J+RruKAjeKZgu+4j1wiLFxuICBcIvCfka5cIixcbiAgXCLwn5Gv8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfka/wn4+74oCN4pmC77iPXCIsXG4gIFwi8J+Rr/Cfj7tcIixcbiAgXCLwn5Gv8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfka/wn4+84oCN4pmC77iPXCIsXG4gIFwi8J+Rr/Cfj7xcIixcbiAgXCLwn5Gv8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfka/wn4+94oCN4pmC77iPXCIsXG4gIFwi8J+Rr/Cfj71cIixcbiAgXCLwn5Gv8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfka/wn4++4oCN4pmC77iPXCIsXG4gIFwi8J+Rr/Cfj75cIixcbiAgXCLwn5Gv8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfka/wn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+Rr/Cfj79cIixcbiAgXCLwn5Gv4oCN4pmA77iPXCIsXG4gIFwi8J+Rr+KAjeKZgu+4j1wiLFxuICBcIvCfka9cIixcbiAgXCLwn5Gw8J+Pu1wiLFxuICBcIvCfkbDwn4+8XCIsXG4gIFwi8J+RsPCfj71cIixcbiAgXCLwn5Gw8J+PvlwiLFxuICBcIvCfkbDwn4+/XCIsXG4gIFwi8J+RsFwiLFxuICBcIvCfkbHwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+RsfCfj7vigI3imYLvuI9cIixcbiAgXCLwn5Gx8J+Pu1wiLFxuICBcIvCfkbHwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+RsfCfj7zigI3imYLvuI9cIixcbiAgXCLwn5Gx8J+PvFwiLFxuICBcIvCfkbHwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+RsfCfj73igI3imYLvuI9cIixcbiAgXCLwn5Gx8J+PvVwiLFxuICBcIvCfkbHwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+RsfCfj77igI3imYLvuI9cIixcbiAgXCLwn5Gx8J+PvlwiLFxuICBcIvCfkbHwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+RsfCfj7/igI3imYLvuI9cIixcbiAgXCLwn5Gx8J+Pv1wiLFxuICBcIvCfkbHigI3imYDvuI9cIixcbiAgXCLwn5Gx4oCN4pmC77iPXCIsXG4gIFwi8J+RsVwiLFxuICBcIvCfkbLwn4+7XCIsXG4gIFwi8J+RsvCfj7xcIixcbiAgXCLwn5Gy8J+PvVwiLFxuICBcIvCfkbLwn4++XCIsXG4gIFwi8J+RsvCfj79cIixcbiAgXCLwn5GyXCIsXG4gIFwi8J+Rs/Cfj7vigI3imYDvuI9cIixcbiAgXCLwn5Gz8J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfkbPwn4+7XCIsXG4gIFwi8J+Rs/Cfj7zigI3imYDvuI9cIixcbiAgXCLwn5Gz8J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfkbPwn4+8XCIsXG4gIFwi8J+Rs/Cfj73igI3imYDvuI9cIixcbiAgXCLwn5Gz8J+PveKAjeKZgu+4j1wiLFxuICBcIvCfkbPwn4+9XCIsXG4gIFwi8J+Rs/Cfj77igI3imYDvuI9cIixcbiAgXCLwn5Gz8J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfkbPwn4++XCIsXG4gIFwi8J+Rs/Cfj7/igI3imYDvuI9cIixcbiAgXCLwn5Gz8J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfkbPwn4+/XCIsXG4gIFwi8J+Rs+KAjeKZgO+4j1wiLFxuICBcIvCfkbPigI3imYLvuI9cIixcbiAgXCLwn5GzXCIsXG4gIFwi8J+RtPCfj7tcIixcbiAgXCLwn5G08J+PvFwiLFxuICBcIvCfkbTwn4+9XCIsXG4gIFwi8J+RtPCfj75cIixcbiAgXCLwn5G08J+Pv1wiLFxuICBcIvCfkbRcIixcbiAgXCLwn5G18J+Pu1wiLFxuICBcIvCfkbXwn4+8XCIsXG4gIFwi8J+RtfCfj71cIixcbiAgXCLwn5G18J+PvlwiLFxuICBcIvCfkbXwn4+/XCIsXG4gIFwi8J+RtVwiLFxuICBcIvCfkbbwn4+7XCIsXG4gIFwi8J+RtvCfj7xcIixcbiAgXCLwn5G28J+PvVwiLFxuICBcIvCfkbbwn4++XCIsXG4gIFwi8J+RtvCfj79cIixcbiAgXCLwn5G2XCIsXG4gIFwi8J+Rt/Cfj7vigI3imYDvuI9cIixcbiAgXCLwn5G38J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfkbfwn4+7XCIsXG4gIFwi8J+Rt/Cfj7zigI3imYDvuI9cIixcbiAgXCLwn5G38J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfkbfwn4+8XCIsXG4gIFwi8J+Rt/Cfj73igI3imYDvuI9cIixcbiAgXCLwn5G38J+PveKAjeKZgu+4j1wiLFxuICBcIvCfkbfwn4+9XCIsXG4gIFwi8J+Rt/Cfj77igI3imYDvuI9cIixcbiAgXCLwn5G38J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfkbfwn4++XCIsXG4gIFwi8J+Rt/Cfj7/igI3imYDvuI9cIixcbiAgXCLwn5G38J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfkbfwn4+/XCIsXG4gIFwi8J+Rt+KAjeKZgO+4j1wiLFxuICBcIvCfkbfigI3imYLvuI9cIixcbiAgXCLwn5G3XCIsXG4gIFwi8J+RuPCfj7tcIixcbiAgXCLwn5G48J+PvFwiLFxuICBcIvCfkbjwn4+9XCIsXG4gIFwi8J+RuPCfj75cIixcbiAgXCLwn5G48J+Pv1wiLFxuICBcIvCfkbhcIixcbiAgXCLwn5G5XCIsXG4gIFwi8J+RulwiLFxuICBcIvCfkbtcIixcbiAgXCLwn5G88J+Pu1wiLFxuICBcIvCfkbzwn4+8XCIsXG4gIFwi8J+RvPCfj71cIixcbiAgXCLwn5G88J+PvlwiLFxuICBcIvCfkbzwn4+/XCIsXG4gIFwi8J+RvFwiLFxuICBcIvCfkb1cIixcbiAgXCLwn5G+XCIsXG4gIFwi8J+Rv1wiLFxuICBcIvCfkoBcIixcbiAgXCLwn5KB8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfkoHwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+SgfCfj7tcIixcbiAgXCLwn5KB8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfkoHwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+SgfCfj7xcIixcbiAgXCLwn5KB8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfkoHwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+SgfCfj71cIixcbiAgXCLwn5KB8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfkoHwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+SgfCfj75cIixcbiAgXCLwn5KB8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfkoHwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+SgfCfj79cIixcbiAgXCLwn5KB4oCN4pmA77iPXCIsXG4gIFwi8J+SgeKAjeKZgu+4j1wiLFxuICBcIvCfkoFcIixcbiAgXCLwn5KC8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfkoLwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+SgvCfj7tcIixcbiAgXCLwn5KC8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfkoLwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+SgvCfj7xcIixcbiAgXCLwn5KC8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfkoLwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+SgvCfj71cIixcbiAgXCLwn5KC8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfkoLwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+SgvCfj75cIixcbiAgXCLwn5KC8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfkoLwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+SgvCfj79cIixcbiAgXCLwn5KC4oCN4pmA77iPXCIsXG4gIFwi8J+SguKAjeKZgu+4j1wiLFxuICBcIvCfkoJcIixcbiAgXCLwn5KD8J+Pu1wiLFxuICBcIvCfkoPwn4+8XCIsXG4gIFwi8J+Sg/Cfj71cIixcbiAgXCLwn5KD8J+PvlwiLFxuICBcIvCfkoPwn4+/XCIsXG4gIFwi8J+Sg1wiLFxuICBcIvCfkoRcIixcbiAgXCLwn5KF8J+Pu1wiLFxuICBcIvCfkoXwn4+8XCIsXG4gIFwi8J+ShfCfj71cIixcbiAgXCLwn5KF8J+PvlwiLFxuICBcIvCfkoXwn4+/XCIsXG4gIFwi8J+ShVwiLFxuICBcIvCfkobwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+ShvCfj7vigI3imYLvuI9cIixcbiAgXCLwn5KG8J+Pu1wiLFxuICBcIvCfkobwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+ShvCfj7zigI3imYLvuI9cIixcbiAgXCLwn5KG8J+PvFwiLFxuICBcIvCfkobwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+ShvCfj73igI3imYLvuI9cIixcbiAgXCLwn5KG8J+PvVwiLFxuICBcIvCfkobwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+ShvCfj77igI3imYLvuI9cIixcbiAgXCLwn5KG8J+PvlwiLFxuICBcIvCfkobwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+ShvCfj7/igI3imYLvuI9cIixcbiAgXCLwn5KG8J+Pv1wiLFxuICBcIvCfkobigI3imYDvuI9cIixcbiAgXCLwn5KG4oCN4pmC77iPXCIsXG4gIFwi8J+ShlwiLFxuICBcIvCfkofwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+Sh/Cfj7vigI3imYLvuI9cIixcbiAgXCLwn5KH8J+Pu1wiLFxuICBcIvCfkofwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+Sh/Cfj7zigI3imYLvuI9cIixcbiAgXCLwn5KH8J+PvFwiLFxuICBcIvCfkofwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+Sh/Cfj73igI3imYLvuI9cIixcbiAgXCLwn5KH8J+PvVwiLFxuICBcIvCfkofwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+Sh/Cfj77igI3imYLvuI9cIixcbiAgXCLwn5KH8J+PvlwiLFxuICBcIvCfkofwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+Sh/Cfj7/igI3imYLvuI9cIixcbiAgXCLwn5KH8J+Pv1wiLFxuICBcIvCfkofigI3imYDvuI9cIixcbiAgXCLwn5KH4oCN4pmC77iPXCIsXG4gIFwi8J+Sh1wiLFxuICBcIvCfkohcIixcbiAgXCLwn5KJXCIsXG4gIFwi8J+SilwiLFxuICBcIvCfkotcIixcbiAgXCLwn5KMXCIsXG4gIFwi8J+SjVwiLFxuICBcIvCfko5cIixcbiAgXCLwn5KPXCIsXG4gIFwi8J+SkFwiLFxuICBcIvCfkpFcIixcbiAgXCLwn5KSXCIsXG4gIFwi8J+Sk1wiLFxuICBcIvCfkpRcIixcbiAgXCLwn5KVXCIsXG4gIFwi8J+SllwiLFxuICBcIvCfkpdcIixcbiAgXCLwn5KYXCIsXG4gIFwi8J+SmVwiLFxuICBcIvCfkppcIixcbiAgXCLwn5KbXCIsXG4gIFwi8J+SnFwiLFxuICBcIvCfkp1cIixcbiAgXCLwn5KeXCIsXG4gIFwi8J+Sn1wiLFxuICBcIvCfkqBcIixcbiAgXCLwn5KhXCIsXG4gIFwi8J+SolwiLFxuICBcIvCfkqNcIixcbiAgXCLwn5KkXCIsXG4gIFwi8J+SpVwiLFxuICBcIvCfkqZcIixcbiAgXCLwn5KnXCIsXG4gIFwi8J+SqFwiLFxuICBcIvCfkqlcIixcbiAgXCLwn5Kq8J+Pu1wiLFxuICBcIvCfkqrwn4+8XCIsXG4gIFwi8J+SqvCfj71cIixcbiAgXCLwn5Kq8J+PvlwiLFxuICBcIvCfkqrwn4+/XCIsXG4gIFwi8J+SqlwiLFxuICBcIvCfkqtcIixcbiAgXCLwn5KsXCIsXG4gIFwi8J+SrVwiLFxuICBcIvCfkq5cIixcbiAgXCLwn5KvXCIsXG4gIFwi8J+SsFwiLFxuICBcIvCfkrFcIixcbiAgXCLwn5KyXCIsXG4gIFwi8J+Ss1wiLFxuICBcIvCfkrRcIixcbiAgXCLwn5K1XCIsXG4gIFwi8J+StlwiLFxuICBcIvCfkrdcIixcbiAgXCLwn5K4XCIsXG4gIFwi8J+SuVwiLFxuICBcIvCfkrpcIixcbiAgXCLwn5K7XCIsXG4gIFwi8J+SvFwiLFxuICBcIvCfkr1cIixcbiAgXCLwn5K+XCIsXG4gIFwi8J+Sv1wiLFxuICBcIvCfk4BcIixcbiAgXCLwn5OBXCIsXG4gIFwi8J+TglwiLFxuICBcIvCfk4NcIixcbiAgXCLwn5OEXCIsXG4gIFwi8J+ThVwiLFxuICBcIvCfk4ZcIixcbiAgXCLwn5OHXCIsXG4gIFwi8J+TiFwiLFxuICBcIvCfk4lcIixcbiAgXCLwn5OKXCIsXG4gIFwi8J+Ti1wiLFxuICBcIvCfk4xcIixcbiAgXCLwn5ONXCIsXG4gIFwi8J+TjlwiLFxuICBcIvCfk49cIixcbiAgXCLwn5OQXCIsXG4gIFwi8J+TkVwiLFxuICBcIvCfk5JcIixcbiAgXCLwn5OTXCIsXG4gIFwi8J+TlFwiLFxuICBcIvCfk5VcIixcbiAgXCLwn5OWXCIsXG4gIFwi8J+Tl1wiLFxuICBcIvCfk5hcIixcbiAgXCLwn5OZXCIsXG4gIFwi8J+TmlwiLFxuICBcIvCfk5tcIixcbiAgXCLwn5OcXCIsXG4gIFwi8J+TnVwiLFxuICBcIvCfk55cIixcbiAgXCLwn5OfXCIsXG4gIFwi8J+ToFwiLFxuICBcIvCfk6FcIixcbiAgXCLwn5OiXCIsXG4gIFwi8J+To1wiLFxuICBcIvCfk6RcIixcbiAgXCLwn5OlXCIsXG4gIFwi8J+TplwiLFxuICBcIvCfk6dcIixcbiAgXCLwn5OoXCIsXG4gIFwi8J+TqVwiLFxuICBcIvCfk6pcIixcbiAgXCLwn5OrXCIsXG4gIFwi8J+TrFwiLFxuICBcIvCfk61cIixcbiAgXCLwn5OuXCIsXG4gIFwi8J+Tr1wiLFxuICBcIvCfk7BcIixcbiAgXCLwn5OxXCIsXG4gIFwi8J+TslwiLFxuICBcIvCfk7NcIixcbiAgXCLwn5O0XCIsXG4gIFwi8J+TtVwiLFxuICBcIvCfk7ZcIixcbiAgXCLwn5O3XCIsXG4gIFwi8J+TuFwiLFxuICBcIvCfk7lcIixcbiAgXCLwn5O6XCIsXG4gIFwi8J+Tu1wiLFxuICBcIvCfk7xcIixcbiAgXCLwn5O9XCIsXG4gIFwi8J+Tv1wiLFxuICBcIvCflIBcIixcbiAgXCLwn5SBXCIsXG4gIFwi8J+UglwiLFxuICBcIvCflINcIixcbiAgXCLwn5SEXCIsXG4gIFwi8J+UhVwiLFxuICBcIvCflIZcIixcbiAgXCLwn5SHXCIsXG4gIFwi8J+UiFwiLFxuICBcIvCflIlcIixcbiAgXCLwn5SKXCIsXG4gIFwi8J+Ui1wiLFxuICBcIvCflIxcIixcbiAgXCLwn5SNXCIsXG4gIFwi8J+UjlwiLFxuICBcIvCflI9cIixcbiAgXCLwn5SQXCIsXG4gIFwi8J+UkVwiLFxuICBcIvCflJJcIixcbiAgXCLwn5STXCIsXG4gIFwi8J+UlFwiLFxuICBcIvCflJVcIixcbiAgXCLwn5SWXCIsXG4gIFwi8J+Ul1wiLFxuICBcIvCflJhcIixcbiAgXCLwn5SZXCIsXG4gIFwi8J+UmlwiLFxuICBcIvCflJtcIixcbiAgXCLwn5ScXCIsXG4gIFwi8J+UnVwiLFxuICBcIvCflJ5cIixcbiAgXCLwn5SfXCIsXG4gIFwi8J+UoFwiLFxuICBcIvCflKFcIixcbiAgXCLwn5SiXCIsXG4gIFwi8J+Uo1wiLFxuICBcIvCflKRcIixcbiAgXCLwn5SlXCIsXG4gIFwi8J+UplwiLFxuICBcIvCflKdcIixcbiAgXCLwn5SoXCIsXG4gIFwi8J+UqVwiLFxuICBcIvCflKpcIixcbiAgXCLwn5SrXCIsXG4gIFwi8J+UrFwiLFxuICBcIvCflK1cIixcbiAgXCLwn5SuXCIsXG4gIFwi8J+Ur1wiLFxuICBcIvCflLBcIixcbiAgXCLwn5SxXCIsXG4gIFwi8J+UslwiLFxuICBcIvCflLNcIixcbiAgXCLwn5S0XCIsXG4gIFwi8J+UtVwiLFxuICBcIvCflLZcIixcbiAgXCLwn5S3XCIsXG4gIFwi8J+UuFwiLFxuICBcIvCflLlcIixcbiAgXCLwn5S6XCIsXG4gIFwi8J+Uu1wiLFxuICBcIvCflLxcIixcbiAgXCLwn5S9XCIsXG4gIFwi8J+ViVwiLFxuICBcIvCflYpcIixcbiAgXCLwn5WLXCIsXG4gIFwi8J+VjFwiLFxuICBcIvCflY1cIixcbiAgXCLwn5WOXCIsXG4gIFwi8J+VkFwiLFxuICBcIvCflZFcIixcbiAgXCLwn5WSXCIsXG4gIFwi8J+Vk1wiLFxuICBcIvCflZRcIixcbiAgXCLwn5WVXCIsXG4gIFwi8J+VllwiLFxuICBcIvCflZdcIixcbiAgXCLwn5WYXCIsXG4gIFwi8J+VmVwiLFxuICBcIvCflZpcIixcbiAgXCLwn5WbXCIsXG4gIFwi8J+VnFwiLFxuICBcIvCflZ1cIixcbiAgXCLwn5WeXCIsXG4gIFwi8J+Vn1wiLFxuICBcIvCflaBcIixcbiAgXCLwn5WhXCIsXG4gIFwi8J+VolwiLFxuICBcIvCflaNcIixcbiAgXCLwn5WkXCIsXG4gIFwi8J+VpVwiLFxuICBcIvCflaZcIixcbiAgXCLwn5WnXCIsXG4gIFwi8J+Vr1wiLFxuICBcIvCflbBcIixcbiAgXCLwn5WzXCIsXG4gIFwi8J+VtPCfj7tcIixcbiAgXCLwn5W08J+PvFwiLFxuICBcIvCflbTwn4+9XCIsXG4gIFwi8J+VtPCfj75cIixcbiAgXCLwn5W08J+Pv1wiLFxuICBcIvCflbRcIixcbiAgXCLwn5W18J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCflbXwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+VtfCfj7tcIixcbiAgXCLwn5W18J+PvOKAjeKZgO+4j1wiLFxuICBcIvCflbXwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+VtfCfj7xcIixcbiAgXCLwn5W18J+PveKAjeKZgO+4j1wiLFxuICBcIvCflbXwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+VtfCfj71cIixcbiAgXCLwn5W18J+PvuKAjeKZgO+4j1wiLFxuICBcIvCflbXwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+VtfCfj75cIixcbiAgXCLwn5W18J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCflbXwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+VtfCfj79cIixcbiAgXCLwn5W177iP4oCN4pmA77iPXCIsXG4gIFwi8J+Vte+4j+KAjeKZgu+4j1wiLFxuICBcIvCflbVcIixcbiAgXCLwn5W2XCIsXG4gIFwi8J+Vt1wiLFxuICBcIvCflbhcIixcbiAgXCLwn5W5XCIsXG4gIFwi8J+VuvCfj7tcIixcbiAgXCLwn5W68J+PvFwiLFxuICBcIvCflbrwn4+9XCIsXG4gIFwi8J+VuvCfj75cIixcbiAgXCLwn5W68J+Pv1wiLFxuICBcIvCflbpcIixcbiAgXCLwn5aHXCIsXG4gIFwi8J+WilwiLFxuICBcIvCflotcIixcbiAgXCLwn5aMXCIsXG4gIFwi8J+WjVwiLFxuICBcIvCflpDwn4+7XCIsXG4gIFwi8J+WkPCfj7xcIixcbiAgXCLwn5aQ8J+PvVwiLFxuICBcIvCflpDwn4++XCIsXG4gIFwi8J+WkPCfj79cIixcbiAgXCLwn5aQXCIsXG4gIFwi8J+WlfCfj7tcIixcbiAgXCLwn5aV8J+PvFwiLFxuICBcIvCflpXwn4+9XCIsXG4gIFwi8J+WlfCfj75cIixcbiAgXCLwn5aV8J+Pv1wiLFxuICBcIvCflpVcIixcbiAgXCLwn5aW8J+Pu1wiLFxuICBcIvCflpbwn4+8XCIsXG4gIFwi8J+WlvCfj71cIixcbiAgXCLwn5aW8J+PvlwiLFxuICBcIvCflpbwn4+/XCIsXG4gIFwi8J+WllwiLFxuICBcIvCflqRcIixcbiAgXCLwn5alXCIsXG4gIFwi8J+WqFwiLFxuICBcIvCflrFcIixcbiAgXCLwn5ayXCIsXG4gIFwi8J+WvFwiLFxuICBcIvCfl4JcIixcbiAgXCLwn5eDXCIsXG4gIFwi8J+XhFwiLFxuICBcIvCfl5FcIixcbiAgXCLwn5eSXCIsXG4gIFwi8J+Xk1wiLFxuICBcIvCfl5xcIixcbiAgXCLwn5edXCIsXG4gIFwi8J+XnlwiLFxuICBcIvCfl6FcIixcbiAgXCLwn5ejXCIsXG4gIFwi8J+XqFwiLFxuICBcIvCfl69cIixcbiAgXCLwn5ezXCIsXG4gIFwi8J+XulwiLFxuICBcIvCfl7tcIixcbiAgXCLwn5e8XCIsXG4gIFwi8J+XvVwiLFxuICBcIvCfl75cIixcbiAgXCLwn5e/XCIsXG4gIFwi8J+YgFwiLFxuICBcIvCfmIFcIixcbiAgXCLwn5iCXCIsXG4gIFwi8J+Yg1wiLFxuICBcIvCfmIRcIixcbiAgXCLwn5iFXCIsXG4gIFwi8J+YhlwiLFxuICBcIvCfmIdcIixcbiAgXCLwn5iIXCIsXG4gIFwi8J+YiVwiLFxuICBcIvCfmIpcIixcbiAgXCLwn5iLXCIsXG4gIFwi8J+YjFwiLFxuICBcIvCfmI1cIixcbiAgXCLwn5iOXCIsXG4gIFwi8J+Yj1wiLFxuICBcIvCfmJBcIixcbiAgXCLwn5iRXCIsXG4gIFwi8J+YklwiLFxuICBcIvCfmJNcIixcbiAgXCLwn5iUXCIsXG4gIFwi8J+YlVwiLFxuICBcIvCfmJZcIixcbiAgXCLwn5iXXCIsXG4gIFwi8J+YmFwiLFxuICBcIvCfmJlcIixcbiAgXCLwn5iaXCIsXG4gIFwi8J+Ym1wiLFxuICBcIvCfmJxcIixcbiAgXCLwn5idXCIsXG4gIFwi8J+YnlwiLFxuICBcIvCfmJ9cIixcbiAgXCLwn5igXCIsXG4gIFwi8J+YoVwiLFxuICBcIvCfmKJcIixcbiAgXCLwn5ijXCIsXG4gIFwi8J+YpFwiLFxuICBcIvCfmKVcIixcbiAgXCLwn5imXCIsXG4gIFwi8J+Yp1wiLFxuICBcIvCfmKhcIixcbiAgXCLwn5ipXCIsXG4gIFwi8J+YqlwiLFxuICBcIvCfmKtcIixcbiAgXCLwn5isXCIsXG4gIFwi8J+YrVwiLFxuICBcIvCfmK5cIixcbiAgXCLwn5ivXCIsXG4gIFwi8J+YsFwiLFxuICBcIvCfmLFcIixcbiAgXCLwn5iyXCIsXG4gIFwi8J+Ys1wiLFxuICBcIvCfmLRcIixcbiAgXCLwn5i1XCIsXG4gIFwi8J+YtlwiLFxuICBcIvCfmLdcIixcbiAgXCLwn5i4XCIsXG4gIFwi8J+YuVwiLFxuICBcIvCfmLpcIixcbiAgXCLwn5i7XCIsXG4gIFwi8J+YvFwiLFxuICBcIvCfmL1cIixcbiAgXCLwn5i+XCIsXG4gIFwi8J+Yv1wiLFxuICBcIvCfmYBcIixcbiAgXCLwn5mBXCIsXG4gIFwi8J+ZglwiLFxuICBcIvCfmYNcIixcbiAgXCLwn5mEXCIsXG4gIFwi8J+ZhfCfj7vigI3imYDvuI9cIixcbiAgXCLwn5mF8J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfmYXwn4+7XCIsXG4gIFwi8J+ZhfCfj7zigI3imYDvuI9cIixcbiAgXCLwn5mF8J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfmYXwn4+8XCIsXG4gIFwi8J+ZhfCfj73igI3imYDvuI9cIixcbiAgXCLwn5mF8J+PveKAjeKZgu+4j1wiLFxuICBcIvCfmYXwn4+9XCIsXG4gIFwi8J+ZhfCfj77igI3imYDvuI9cIixcbiAgXCLwn5mF8J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfmYXwn4++XCIsXG4gIFwi8J+ZhfCfj7/igI3imYDvuI9cIixcbiAgXCLwn5mF8J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfmYXwn4+/XCIsXG4gIFwi8J+ZheKAjeKZgO+4j1wiLFxuICBcIvCfmYXigI3imYLvuI9cIixcbiAgXCLwn5mFXCIsXG4gIFwi8J+ZhvCfj7vigI3imYDvuI9cIixcbiAgXCLwn5mG8J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfmYbwn4+7XCIsXG4gIFwi8J+ZhvCfj7zigI3imYDvuI9cIixcbiAgXCLwn5mG8J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfmYbwn4+8XCIsXG4gIFwi8J+ZhvCfj73igI3imYDvuI9cIixcbiAgXCLwn5mG8J+PveKAjeKZgu+4j1wiLFxuICBcIvCfmYbwn4+9XCIsXG4gIFwi8J+ZhvCfj77igI3imYDvuI9cIixcbiAgXCLwn5mG8J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfmYbwn4++XCIsXG4gIFwi8J+ZhvCfj7/igI3imYDvuI9cIixcbiAgXCLwn5mG8J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfmYbwn4+/XCIsXG4gIFwi8J+ZhuKAjeKZgO+4j1wiLFxuICBcIvCfmYbigI3imYLvuI9cIixcbiAgXCLwn5mGXCIsXG4gIFwi8J+Zh/Cfj7vigI3imYDvuI9cIixcbiAgXCLwn5mH8J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfmYfwn4+7XCIsXG4gIFwi8J+Zh/Cfj7zigI3imYDvuI9cIixcbiAgXCLwn5mH8J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfmYfwn4+8XCIsXG4gIFwi8J+Zh/Cfj73igI3imYDvuI9cIixcbiAgXCLwn5mH8J+PveKAjeKZgu+4j1wiLFxuICBcIvCfmYfwn4+9XCIsXG4gIFwi8J+Zh/Cfj77igI3imYDvuI9cIixcbiAgXCLwn5mH8J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfmYfwn4++XCIsXG4gIFwi8J+Zh/Cfj7/igI3imYDvuI9cIixcbiAgXCLwn5mH8J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfmYfwn4+/XCIsXG4gIFwi8J+Zh+KAjeKZgO+4j1wiLFxuICBcIvCfmYfigI3imYLvuI9cIixcbiAgXCLwn5mHXCIsXG4gIFwi8J+ZiFwiLFxuICBcIvCfmYlcIixcbiAgXCLwn5mKXCIsXG4gIFwi8J+Zi/Cfj7vigI3imYDvuI9cIixcbiAgXCLwn5mL8J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfmYvwn4+7XCIsXG4gIFwi8J+Zi/Cfj7zigI3imYDvuI9cIixcbiAgXCLwn5mL8J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfmYvwn4+8XCIsXG4gIFwi8J+Zi/Cfj73igI3imYDvuI9cIixcbiAgXCLwn5mL8J+PveKAjeKZgu+4j1wiLFxuICBcIvCfmYvwn4+9XCIsXG4gIFwi8J+Zi/Cfj77igI3imYDvuI9cIixcbiAgXCLwn5mL8J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfmYvwn4++XCIsXG4gIFwi8J+Zi/Cfj7/igI3imYDvuI9cIixcbiAgXCLwn5mL8J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfmYvwn4+/XCIsXG4gIFwi8J+Zi+KAjeKZgO+4j1wiLFxuICBcIvCfmYvigI3imYLvuI9cIixcbiAgXCLwn5mLXCIsXG4gIFwi8J+ZjPCfj7tcIixcbiAgXCLwn5mM8J+PvFwiLFxuICBcIvCfmYzwn4+9XCIsXG4gIFwi8J+ZjPCfj75cIixcbiAgXCLwn5mM8J+Pv1wiLFxuICBcIvCfmYxcIixcbiAgXCLwn5mN8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfmY3wn4+74oCN4pmC77iPXCIsXG4gIFwi8J+ZjfCfj7tcIixcbiAgXCLwn5mN8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfmY3wn4+84oCN4pmC77iPXCIsXG4gIFwi8J+ZjfCfj7xcIixcbiAgXCLwn5mN8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfmY3wn4+94oCN4pmC77iPXCIsXG4gIFwi8J+ZjfCfj71cIixcbiAgXCLwn5mN8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfmY3wn4++4oCN4pmC77iPXCIsXG4gIFwi8J+ZjfCfj75cIixcbiAgXCLwn5mN8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfmY3wn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+ZjfCfj79cIixcbiAgXCLwn5mN4oCN4pmA77iPXCIsXG4gIFwi8J+ZjeKAjeKZgu+4j1wiLFxuICBcIvCfmY1cIixcbiAgXCLwn5mO8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfmY7wn4+74oCN4pmC77iPXCIsXG4gIFwi8J+ZjvCfj7tcIixcbiAgXCLwn5mO8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfmY7wn4+84oCN4pmC77iPXCIsXG4gIFwi8J+ZjvCfj7xcIixcbiAgXCLwn5mO8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfmY7wn4+94oCN4pmC77iPXCIsXG4gIFwi8J+ZjvCfj71cIixcbiAgXCLwn5mO8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfmY7wn4++4oCN4pmC77iPXCIsXG4gIFwi8J+ZjvCfj75cIixcbiAgXCLwn5mO8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfmY7wn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+ZjvCfj79cIixcbiAgXCLwn5mO4oCN4pmA77iPXCIsXG4gIFwi8J+ZjuKAjeKZgu+4j1wiLFxuICBcIvCfmY5cIixcbiAgXCLwn5mP8J+Pu1wiLFxuICBcIvCfmY/wn4+8XCIsXG4gIFwi8J+Zj/Cfj71cIixcbiAgXCLwn5mP8J+PvlwiLFxuICBcIvCfmY/wn4+/XCIsXG4gIFwi8J+Zj1wiLFxuICBcIvCfmoBcIixcbiAgXCLwn5qBXCIsXG4gIFwi8J+aglwiLFxuICBcIvCfmoNcIixcbiAgXCLwn5qEXCIsXG4gIFwi8J+ahVwiLFxuICBcIvCfmoZcIixcbiAgXCLwn5qHXCIsXG4gIFwi8J+aiFwiLFxuICBcIvCfmolcIixcbiAgXCLwn5qKXCIsXG4gIFwi8J+ai1wiLFxuICBcIvCfmoxcIixcbiAgXCLwn5qNXCIsXG4gIFwi8J+ajlwiLFxuICBcIvCfmo9cIixcbiAgXCLwn5qQXCIsXG4gIFwi8J+akVwiLFxuICBcIvCfmpJcIixcbiAgXCLwn5qTXCIsXG4gIFwi8J+alFwiLFxuICBcIvCfmpVcIixcbiAgXCLwn5qWXCIsXG4gIFwi8J+al1wiLFxuICBcIvCfmphcIixcbiAgXCLwn5qZXCIsXG4gIFwi8J+amlwiLFxuICBcIvCfmptcIixcbiAgXCLwn5qcXCIsXG4gIFwi8J+anVwiLFxuICBcIvCfmp5cIixcbiAgXCLwn5qfXCIsXG4gIFwi8J+aoFwiLFxuICBcIvCfmqFcIixcbiAgXCLwn5qiXCIsXG4gIFwi8J+ao/Cfj7vigI3imYDvuI9cIixcbiAgXCLwn5qj8J+Pu+KAjeKZgu+4j1wiLFxuICBcIvCfmqPwn4+7XCIsXG4gIFwi8J+ao/Cfj7zigI3imYDvuI9cIixcbiAgXCLwn5qj8J+PvOKAjeKZgu+4j1wiLFxuICBcIvCfmqPwn4+8XCIsXG4gIFwi8J+ao/Cfj73igI3imYDvuI9cIixcbiAgXCLwn5qj8J+PveKAjeKZgu+4j1wiLFxuICBcIvCfmqPwn4+9XCIsXG4gIFwi8J+ao/Cfj77igI3imYDvuI9cIixcbiAgXCLwn5qj8J+PvuKAjeKZgu+4j1wiLFxuICBcIvCfmqPwn4++XCIsXG4gIFwi8J+ao/Cfj7/igI3imYDvuI9cIixcbiAgXCLwn5qj8J+Pv+KAjeKZgu+4j1wiLFxuICBcIvCfmqPwn4+/XCIsXG4gIFwi8J+ao+KAjeKZgO+4j1wiLFxuICBcIvCfmqPigI3imYLvuI9cIixcbiAgXCLwn5qjXCIsXG4gIFwi8J+apFwiLFxuICBcIvCfmqVcIixcbiAgXCLwn5qmXCIsXG4gIFwi8J+ap1wiLFxuICBcIvCfmqhcIixcbiAgXCLwn5qpXCIsXG4gIFwi8J+aqlwiLFxuICBcIvCfmqtcIixcbiAgXCLwn5qsXCIsXG4gIFwi8J+arVwiLFxuICBcIvCfmq5cIixcbiAgXCLwn5qvXCIsXG4gIFwi8J+asFwiLFxuICBcIvCfmrFcIixcbiAgXCLwn5qyXCIsXG4gIFwi8J+as1wiLFxuICBcIvCfmrTwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+atPCfj7vigI3imYLvuI9cIixcbiAgXCLwn5q08J+Pu1wiLFxuICBcIvCfmrTwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+atPCfj7zigI3imYLvuI9cIixcbiAgXCLwn5q08J+PvFwiLFxuICBcIvCfmrTwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+atPCfj73igI3imYLvuI9cIixcbiAgXCLwn5q08J+PvVwiLFxuICBcIvCfmrTwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+atPCfj77igI3imYLvuI9cIixcbiAgXCLwn5q08J+PvlwiLFxuICBcIvCfmrTwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+atPCfj7/igI3imYLvuI9cIixcbiAgXCLwn5q08J+Pv1wiLFxuICBcIvCfmrTigI3imYDvuI9cIixcbiAgXCLwn5q04oCN4pmC77iPXCIsXG4gIFwi8J+atFwiLFxuICBcIvCfmrXwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+atfCfj7vigI3imYLvuI9cIixcbiAgXCLwn5q18J+Pu1wiLFxuICBcIvCfmrXwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+atfCfj7zigI3imYLvuI9cIixcbiAgXCLwn5q18J+PvFwiLFxuICBcIvCfmrXwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+atfCfj73igI3imYLvuI9cIixcbiAgXCLwn5q18J+PvVwiLFxuICBcIvCfmrXwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+atfCfj77igI3imYLvuI9cIixcbiAgXCLwn5q18J+PvlwiLFxuICBcIvCfmrXwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+atfCfj7/igI3imYLvuI9cIixcbiAgXCLwn5q18J+Pv1wiLFxuICBcIvCfmrXigI3imYDvuI9cIixcbiAgXCLwn5q14oCN4pmC77iPXCIsXG4gIFwi8J+atVwiLFxuICBcIvCfmrbwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+atvCfj7vigI3imYLvuI9cIixcbiAgXCLwn5q28J+Pu1wiLFxuICBcIvCfmrbwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+atvCfj7zigI3imYLvuI9cIixcbiAgXCLwn5q28J+PvFwiLFxuICBcIvCfmrbwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+atvCfj73igI3imYLvuI9cIixcbiAgXCLwn5q28J+PvVwiLFxuICBcIvCfmrbwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+atvCfj77igI3imYLvuI9cIixcbiAgXCLwn5q28J+PvlwiLFxuICBcIvCfmrbwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+atvCfj7/igI3imYLvuI9cIixcbiAgXCLwn5q28J+Pv1wiLFxuICBcIvCfmrbigI3imYDvuI9cIixcbiAgXCLwn5q24oCN4pmC77iPXCIsXG4gIFwi8J+atlwiLFxuICBcIvCfmrdcIixcbiAgXCLwn5q4XCIsXG4gIFwi8J+auVwiLFxuICBcIvCfmrpcIixcbiAgXCLwn5q7XCIsXG4gIFwi8J+avFwiLFxuICBcIvCfmr1cIixcbiAgXCLwn5q+XCIsXG4gIFwi8J+av1wiLFxuICBcIvCfm4Dwn4+7XCIsXG4gIFwi8J+bgPCfj7xcIixcbiAgXCLwn5uA8J+PvVwiLFxuICBcIvCfm4Dwn4++XCIsXG4gIFwi8J+bgPCfj79cIixcbiAgXCLwn5uAXCIsXG4gIFwi8J+bgVwiLFxuICBcIvCfm4JcIixcbiAgXCLwn5uDXCIsXG4gIFwi8J+bhFwiLFxuICBcIvCfm4VcIixcbiAgXCLwn5uLXCIsXG4gIFwi8J+bjPCfj7tcIixcbiAgXCLwn5uM8J+PvFwiLFxuICBcIvCfm4zwn4+9XCIsXG4gIFwi8J+bjPCfj75cIixcbiAgXCLwn5uM8J+Pv1wiLFxuICBcIvCfm4xcIixcbiAgXCLwn5uNXCIsXG4gIFwi8J+bjlwiLFxuICBcIvCfm49cIixcbiAgXCLwn5uQXCIsXG4gIFwi8J+bkVwiLFxuICBcIvCfm5JcIixcbiAgXCLwn5ugXCIsXG4gIFwi8J+boVwiLFxuICBcIvCfm6JcIixcbiAgXCLwn5ujXCIsXG4gIFwi8J+bpFwiLFxuICBcIvCfm6VcIixcbiAgXCLwn5upXCIsXG4gIFwi8J+bq1wiLFxuICBcIvCfm6xcIixcbiAgXCLwn5uwXCIsXG4gIFwi8J+bs1wiLFxuICBcIvCfm7RcIixcbiAgXCLwn5u1XCIsXG4gIFwi8J+btlwiLFxuICBcIvCfpJBcIixcbiAgXCLwn6SRXCIsXG4gIFwi8J+kklwiLFxuICBcIvCfpJNcIixcbiAgXCLwn6SUXCIsXG4gIFwi8J+klVwiLFxuICBcIvCfpJZcIixcbiAgXCLwn6SXXCIsXG4gIFwi8J+kmPCfj7tcIixcbiAgXCLwn6SY8J+PvFwiLFxuICBcIvCfpJjwn4+9XCIsXG4gIFwi8J+kmPCfj75cIixcbiAgXCLwn6SY8J+Pv1wiLFxuICBcIvCfpJhcIixcbiAgXCLwn6SZ8J+Pu1wiLFxuICBcIvCfpJnwn4+8XCIsXG4gIFwi8J+kmfCfj71cIixcbiAgXCLwn6SZ8J+PvlwiLFxuICBcIvCfpJnwn4+/XCIsXG4gIFwi8J+kmVwiLFxuICBcIvCfpJrwn4+7XCIsXG4gIFwi8J+kmvCfj7xcIixcbiAgXCLwn6Sa8J+PvVwiLFxuICBcIvCfpJrwn4++XCIsXG4gIFwi8J+kmvCfj79cIixcbiAgXCLwn6SaXCIsXG4gIFwi8J+km/Cfj7tcIixcbiAgXCLwn6Sb8J+PvFwiLFxuICBcIvCfpJvwn4+9XCIsXG4gIFwi8J+km/Cfj75cIixcbiAgXCLwn6Sb8J+Pv1wiLFxuICBcIvCfpJtcIixcbiAgXCLwn6Sc8J+Pu1wiLFxuICBcIvCfpJzwn4+8XCIsXG4gIFwi8J+knPCfj71cIixcbiAgXCLwn6Sc8J+PvlwiLFxuICBcIvCfpJzwn4+/XCIsXG4gIFwi8J+knFwiLFxuICBcIvCfpJ3wn4+7XCIsXG4gIFwi8J+knfCfj7xcIixcbiAgXCLwn6Sd8J+PvVwiLFxuICBcIvCfpJ3wn4++XCIsXG4gIFwi8J+knfCfj79cIixcbiAgXCLwn6SdXCIsXG4gIFwi8J+knvCfj7tcIixcbiAgXCLwn6Se8J+PvFwiLFxuICBcIvCfpJ7wn4+9XCIsXG4gIFwi8J+knvCfj75cIixcbiAgXCLwn6Se8J+Pv1wiLFxuICBcIvCfpJ5cIixcbiAgXCLwn6SgXCIsXG4gIFwi8J+koVwiLFxuICBcIvCfpKJcIixcbiAgXCLwn6SjXCIsXG4gIFwi8J+kpFwiLFxuICBcIvCfpKVcIixcbiAgXCLwn6Sm8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfpKbwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+kpvCfj7tcIixcbiAgXCLwn6Sm8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfpKbwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+kpvCfj7xcIixcbiAgXCLwn6Sm8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfpKbwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+kpvCfj71cIixcbiAgXCLwn6Sm8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfpKbwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+kpvCfj75cIixcbiAgXCLwn6Sm8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfpKbwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+kpvCfj79cIixcbiAgXCLwn6Sm4oCN4pmA77iPXCIsXG4gIFwi8J+kpuKAjeKZgu+4j1wiLFxuICBcIvCfpKZcIixcbiAgXCLwn6SnXCIsXG4gIFwi8J+ksPCfj7tcIixcbiAgXCLwn6Sw8J+PvFwiLFxuICBcIvCfpLDwn4+9XCIsXG4gIFwi8J+ksPCfj75cIixcbiAgXCLwn6Sw8J+Pv1wiLFxuICBcIvCfpLBcIixcbiAgXCLwn6Sz8J+Pu1wiLFxuICBcIvCfpLPwn4+8XCIsXG4gIFwi8J+ks/Cfj71cIixcbiAgXCLwn6Sz8J+PvlwiLFxuICBcIvCfpLPwn4+/XCIsXG4gIFwi8J+ks1wiLFxuICBcIvCfpLTwn4+7XCIsXG4gIFwi8J+ktPCfj7xcIixcbiAgXCLwn6S08J+PvVwiLFxuICBcIvCfpLTwn4++XCIsXG4gIFwi8J+ktPCfj79cIixcbiAgXCLwn6S0XCIsXG4gIFwi8J+ktfCfj7tcIixcbiAgXCLwn6S18J+PvFwiLFxuICBcIvCfpLXwn4+9XCIsXG4gIFwi8J+ktfCfj75cIixcbiAgXCLwn6S18J+Pv1wiLFxuICBcIvCfpLVcIixcbiAgXCLwn6S28J+Pu1wiLFxuICBcIvCfpLbwn4+8XCIsXG4gIFwi8J+ktvCfj71cIixcbiAgXCLwn6S28J+PvlwiLFxuICBcIvCfpLbwn4+/XCIsXG4gIFwi8J+ktlwiLFxuICBcIvCfpLfwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+kt/Cfj7vigI3imYLvuI9cIixcbiAgXCLwn6S38J+Pu1wiLFxuICBcIvCfpLfwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+kt/Cfj7zigI3imYLvuI9cIixcbiAgXCLwn6S38J+PvFwiLFxuICBcIvCfpLfwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+kt/Cfj73igI3imYLvuI9cIixcbiAgXCLwn6S38J+PvVwiLFxuICBcIvCfpLfwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+kt/Cfj77igI3imYLvuI9cIixcbiAgXCLwn6S38J+PvlwiLFxuICBcIvCfpLfwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+kt/Cfj7/igI3imYLvuI9cIixcbiAgXCLwn6S38J+Pv1wiLFxuICBcIvCfpLfigI3imYDvuI9cIixcbiAgXCLwn6S34oCN4pmC77iPXCIsXG4gIFwi8J+kt1wiLFxuICBcIvCfpLjwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+kuPCfj7vigI3imYLvuI9cIixcbiAgXCLwn6S48J+Pu1wiLFxuICBcIvCfpLjwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+kuPCfj7zigI3imYLvuI9cIixcbiAgXCLwn6S48J+PvFwiLFxuICBcIvCfpLjwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+kuPCfj73igI3imYLvuI9cIixcbiAgXCLwn6S48J+PvVwiLFxuICBcIvCfpLjwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+kuPCfj77igI3imYLvuI9cIixcbiAgXCLwn6S48J+PvlwiLFxuICBcIvCfpLjwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+kuPCfj7/igI3imYLvuI9cIixcbiAgXCLwn6S48J+Pv1wiLFxuICBcIvCfpLjigI3imYDvuI9cIixcbiAgXCLwn6S44oCN4pmC77iPXCIsXG4gIFwi8J+kuFwiLFxuICBcIvCfpLnwn4+74oCN4pmA77iPXCIsXG4gIFwi8J+kufCfj7vigI3imYLvuI9cIixcbiAgXCLwn6S58J+Pu1wiLFxuICBcIvCfpLnwn4+84oCN4pmA77iPXCIsXG4gIFwi8J+kufCfj7zigI3imYLvuI9cIixcbiAgXCLwn6S58J+PvFwiLFxuICBcIvCfpLnwn4+94oCN4pmA77iPXCIsXG4gIFwi8J+kufCfj73igI3imYLvuI9cIixcbiAgXCLwn6S58J+PvVwiLFxuICBcIvCfpLnwn4++4oCN4pmA77iPXCIsXG4gIFwi8J+kufCfj77igI3imYLvuI9cIixcbiAgXCLwn6S58J+PvlwiLFxuICBcIvCfpLnwn4+/4oCN4pmA77iPXCIsXG4gIFwi8J+kufCfj7/igI3imYLvuI9cIixcbiAgXCLwn6S58J+Pv1wiLFxuICBcIvCfpLnigI3imYDvuI9cIixcbiAgXCLwn6S54oCN4pmC77iPXCIsXG4gIFwi8J+kuVwiLFxuICBcIvCfpLpcIixcbiAgXCLwn6S88J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfpLzwn4+74oCN4pmC77iPXCIsXG4gIFwi8J+kvPCfj7tcIixcbiAgXCLwn6S88J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfpLzwn4+84oCN4pmC77iPXCIsXG4gIFwi8J+kvPCfj7xcIixcbiAgXCLwn6S88J+PveKAjeKZgO+4j1wiLFxuICBcIvCfpLzwn4+94oCN4pmC77iPXCIsXG4gIFwi8J+kvPCfj71cIixcbiAgXCLwn6S88J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfpLzwn4++4oCN4pmC77iPXCIsXG4gIFwi8J+kvPCfj75cIixcbiAgXCLwn6S88J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfpLzwn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+kvPCfj79cIixcbiAgXCLwn6S84oCN4pmA77iPXCIsXG4gIFwi8J+kvOKAjeKZgu+4j1wiLFxuICBcIvCfpLxcIixcbiAgXCLwn6S98J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfpL3wn4+74oCN4pmC77iPXCIsXG4gIFwi8J+kvfCfj7tcIixcbiAgXCLwn6S98J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfpL3wn4+84oCN4pmC77iPXCIsXG4gIFwi8J+kvfCfj7xcIixcbiAgXCLwn6S98J+PveKAjeKZgO+4j1wiLFxuICBcIvCfpL3wn4+94oCN4pmC77iPXCIsXG4gIFwi8J+kvfCfj71cIixcbiAgXCLwn6S98J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfpL3wn4++4oCN4pmC77iPXCIsXG4gIFwi8J+kvfCfj75cIixcbiAgXCLwn6S98J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfpL3wn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+kvfCfj79cIixcbiAgXCLwn6S94oCN4pmA77iPXCIsXG4gIFwi8J+kveKAjeKZgu+4j1wiLFxuICBcIvCfpL1cIixcbiAgXCLwn6S+8J+Pu+KAjeKZgO+4j1wiLFxuICBcIvCfpL7wn4+74oCN4pmC77iPXCIsXG4gIFwi8J+kvvCfj7tcIixcbiAgXCLwn6S+8J+PvOKAjeKZgO+4j1wiLFxuICBcIvCfpL7wn4+84oCN4pmC77iPXCIsXG4gIFwi8J+kvvCfj7xcIixcbiAgXCLwn6S+8J+PveKAjeKZgO+4j1wiLFxuICBcIvCfpL7wn4+94oCN4pmC77iPXCIsXG4gIFwi8J+kvvCfj71cIixcbiAgXCLwn6S+8J+PvuKAjeKZgO+4j1wiLFxuICBcIvCfpL7wn4++4oCN4pmC77iPXCIsXG4gIFwi8J+kvvCfj75cIixcbiAgXCLwn6S+8J+Pv+KAjeKZgO+4j1wiLFxuICBcIvCfpL7wn4+/4oCN4pmC77iPXCIsXG4gIFwi8J+kvvCfj79cIixcbiAgXCLwn6S+4oCN4pmA77iPXCIsXG4gIFwi8J+kvuKAjeKZgu+4j1wiLFxuICBcIvCfpL5cIixcbiAgXCLwn6WAXCIsXG4gIFwi8J+lgVwiLFxuICBcIvCfpYJcIixcbiAgXCLwn6WDXCIsXG4gIFwi8J+lhFwiLFxuICBcIvCfpYVcIixcbiAgXCLwn6WHXCIsXG4gIFwi8J+liFwiLFxuICBcIvCfpYlcIixcbiAgXCLwn6WKXCIsXG4gIFwi8J+li1wiLFxuICBcIvCfpZBcIixcbiAgXCLwn6WRXCIsXG4gIFwi8J+lklwiLFxuICBcIvCfpZNcIixcbiAgXCLwn6WUXCIsXG4gIFwi8J+llVwiLFxuICBcIvCfpZZcIixcbiAgXCLwn6WXXCIsXG4gIFwi8J+lmFwiLFxuICBcIvCfpZlcIixcbiAgXCLwn6WaXCIsXG4gIFwi8J+lm1wiLFxuICBcIvCfpZxcIixcbiAgXCLwn6WdXCIsXG4gIFwi8J+lnlwiLFxuICBcIvCfpoBcIixcbiAgXCLwn6aBXCIsXG4gIFwi8J+mglwiLFxuICBcIvCfpoNcIixcbiAgXCLwn6aEXCIsXG4gIFwi8J+mhVwiLFxuICBcIvCfpoZcIixcbiAgXCLwn6aHXCIsXG4gIFwi8J+miFwiLFxuICBcIvCfpolcIixcbiAgXCLwn6aKXCIsXG4gIFwi8J+mi1wiLFxuICBcIvCfpoxcIixcbiAgXCLwn6aNXCIsXG4gIFwi8J+mjlwiLFxuICBcIvCfpo9cIixcbiAgXCLwn6aQXCIsXG4gIFwi8J+mkVwiLFxuICBcIvCfp4BcIixcbiAgXCLigLxcIixcbiAgXCLigYlcIixcbiAgXCLihKJcIixcbiAgXCLihLlcIixcbiAgXCLihpRcIixcbiAgXCLihpVcIixcbiAgXCLihpZcIixcbiAgXCLihpdcIixcbiAgXCLihphcIixcbiAgXCLihplcIixcbiAgXCLihqlcIixcbiAgXCLihqpcIixcbiAgXCIj4oOjXCIsXG4gIFwi4oyaXCIsXG4gIFwi4oybXCIsXG4gIFwi4oyoXCIsXG4gIFwi4o+PXCIsXG4gIFwi4o+pXCIsXG4gIFwi4o+qXCIsXG4gIFwi4o+rXCIsXG4gIFwi4o+sXCIsXG4gIFwi4o+tXCIsXG4gIFwi4o+uXCIsXG4gIFwi4o+vXCIsXG4gIFwi4o+wXCIsXG4gIFwi4o+xXCIsXG4gIFwi4o+yXCIsXG4gIFwi4o+zXCIsXG4gIFwi4o+4XCIsXG4gIFwi4o+5XCIsXG4gIFwi4o+6XCIsXG4gIFwi4pOCXCIsXG4gIFwi4paqXCIsXG4gIFwi4parXCIsXG4gIFwi4pa2XCIsXG4gIFwi4peAXCIsXG4gIFwi4pe7XCIsXG4gIFwi4pe8XCIsXG4gIFwi4pe9XCIsXG4gIFwi4pe+XCIsXG4gIFwi4piAXCIsXG4gIFwi4piBXCIsXG4gIFwi4piCXCIsXG4gIFwi4piDXCIsXG4gIFwi4piEXCIsXG4gIFwi4piOXCIsXG4gIFwi4piRXCIsXG4gIFwi4piUXCIsXG4gIFwi4piVXCIsXG4gIFwi4piYXCIsXG4gIFwi4pid8J+Pu1wiLFxuICBcIuKYnfCfj7xcIixcbiAgXCLimJ3wn4+9XCIsXG4gIFwi4pid8J+PvlwiLFxuICBcIuKYnfCfj79cIixcbiAgXCLimJ1cIixcbiAgXCLimKBcIixcbiAgXCLimKJcIixcbiAgXCLimKNcIixcbiAgXCLimKZcIixcbiAgXCLimKpcIixcbiAgXCLimK5cIixcbiAgXCLimK9cIixcbiAgXCLimLhcIixcbiAgXCLimLlcIixcbiAgXCLimLpcIixcbiAgXCLimYBcIixcbiAgXCLimYJcIixcbiAgXCLimYhcIixcbiAgXCLimYlcIixcbiAgXCLimYpcIixcbiAgXCLimYtcIixcbiAgXCLimYxcIixcbiAgXCLimY1cIixcbiAgXCLimY5cIixcbiAgXCLimY9cIixcbiAgXCLimZBcIixcbiAgXCLimZFcIixcbiAgXCLimZJcIixcbiAgXCLimZNcIixcbiAgXCLimaBcIixcbiAgXCLimaNcIixcbiAgXCLimaVcIixcbiAgXCLimaZcIixcbiAgXCLimahcIixcbiAgXCLimbtcIixcbiAgXCLimb9cIixcbiAgXCLimpJcIixcbiAgXCLimpNcIixcbiAgXCLimpRcIixcbiAgXCLimpVcIixcbiAgXCLimpZcIixcbiAgXCLimpdcIixcbiAgXCLimplcIixcbiAgXCLimptcIixcbiAgXCLimpxcIixcbiAgXCLimqBcIixcbiAgXCLimqFcIixcbiAgXCLimqpcIixcbiAgXCLimqtcIixcbiAgXCLimrBcIixcbiAgXCLimrFcIixcbiAgXCLimr1cIixcbiAgXCLimr5cIixcbiAgXCLim4RcIixcbiAgXCLim4VcIixcbiAgXCLim4hcIixcbiAgXCLim45cIixcbiAgXCLim49cIixcbiAgXCLim5FcIixcbiAgXCLim5NcIixcbiAgXCLim5RcIixcbiAgXCLim6lcIixcbiAgXCLim6pcIixcbiAgXCLim7BcIixcbiAgXCLim7FcIixcbiAgXCLim7JcIixcbiAgXCLim7NcIixcbiAgXCLim7RcIixcbiAgXCLim7VcIixcbiAgXCLim7fwn4+7XCIsXG4gIFwi4pu38J+PvFwiLFxuICBcIuKbt/Cfj71cIixcbiAgXCLim7fwn4++XCIsXG4gIFwi4pu38J+Pv1wiLFxuICBcIuKbt1wiLFxuICBcIuKbuFwiLFxuICBcIuKbufCfj7vigI3imYDvuI9cIixcbiAgXCLim7nwn4+74oCN4pmC77iPXCIsXG4gIFwi4pu58J+Pu1wiLFxuICBcIuKbufCfj7zigI3imYDvuI9cIixcbiAgXCLim7nwn4+84oCN4pmC77iPXCIsXG4gIFwi4pu58J+PvFwiLFxuICBcIuKbufCfj73igI3imYDvuI9cIixcbiAgXCLim7nwn4+94oCN4pmC77iPXCIsXG4gIFwi4pu58J+PvVwiLFxuICBcIuKbufCfj77igI3imYDvuI9cIixcbiAgXCLim7nwn4++4oCN4pmC77iPXCIsXG4gIFwi4pu58J+PvlwiLFxuICBcIuKbufCfj7/igI3imYDvuI9cIixcbiAgXCLim7nwn4+/4oCN4pmC77iPXCIsXG4gIFwi4pu58J+Pv1wiLFxuICBcIuKbue+4j+KAjeKZgO+4j1wiLFxuICBcIuKbue+4j+KAjeKZgu+4j1wiLFxuICBcIuKbuVwiLFxuICBcIuKbulwiLFxuICBcIuKbvVwiLFxuICBcIuKcglwiLFxuICBcIuKchVwiLFxuICBcIuKciFwiLFxuICBcIuKciVwiLFxuICBcIuKcivCfj7tcIixcbiAgXCLinIrwn4+8XCIsXG4gIFwi4pyK8J+PvVwiLFxuICBcIuKcivCfj75cIixcbiAgXCLinIrwn4+/XCIsXG4gIFwi4pyKXCIsXG4gIFwi4pyL8J+Pu1wiLFxuICBcIuKci/Cfj7xcIixcbiAgXCLinIvwn4+9XCIsXG4gIFwi4pyL8J+PvlwiLFxuICBcIuKci/Cfj79cIixcbiAgXCLinItcIixcbiAgXCLinIzwn4+7XCIsXG4gIFwi4pyM8J+PvFwiLFxuICBcIuKcjPCfj71cIixcbiAgXCLinIzwn4++XCIsXG4gIFwi4pyM8J+Pv1wiLFxuICBcIuKcjFwiLFxuICBcIuKcjfCfj7tcIixcbiAgXCLinI3wn4+8XCIsXG4gIFwi4pyN8J+PvVwiLFxuICBcIuKcjfCfj75cIixcbiAgXCLinI3wn4+/XCIsXG4gIFwi4pyNXCIsXG4gIFwi4pyPXCIsXG4gIFwi4pySXCIsXG4gIFwi4pyUXCIsXG4gIFwi4pyWXCIsXG4gIFwi4pydXCIsXG4gIFwi4pyhXCIsXG4gIFwi4pyoXCIsXG4gIFwi4pyzXCIsXG4gIFwi4py0XCIsXG4gIFwi4p2EXCIsXG4gIFwi4p2HXCIsXG4gIFwi4p2MXCIsXG4gIFwi4p2OXCIsXG4gIFwi4p2TXCIsXG4gIFwi4p2UXCIsXG4gIFwi4p2VXCIsXG4gIFwi4p2XXCIsXG4gIFwi4p2jXCIsXG4gIFwi4p2kXCIsXG4gIFwi4p6VXCIsXG4gIFwi4p6WXCIsXG4gIFwi4p6XXCIsXG4gIFwi4p6hXCIsXG4gIFwi4p6wXCIsXG4gIFwi4p6/XCIsXG4gIFwi4qS0XCIsXG4gIFwi4qS1XCIsXG4gIFwiKuKDo1wiLFxuICBcIuKshVwiLFxuICBcIuKshlwiLFxuICBcIuKsh1wiLFxuICBcIuKsm1wiLFxuICBcIuKsnFwiLFxuICBcIuKtkFwiLFxuICBcIuKtlVwiLFxuICBcIjDig6NcIixcbiAgXCLjgLBcIixcbiAgXCLjgL1cIixcbiAgXCIx4oOjXCIsXG4gIFwiMuKDo1wiLFxuICBcIuOKl1wiLFxuICBcIuOKmVwiLFxuICBcIjPig6NcIixcbiAgXCI04oOjXCIsXG4gIFwiNeKDo1wiLFxuICBcIjbig6NcIixcbiAgXCI34oOjXCIsXG4gIFwiOOKDo1wiLFxuICBcIjnig6NcIixcbiAgXCLCqVwiLFxuICBcIsKuXCIsXG4gIFwi7pSKXCJcbl1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL25vZGVfbW9kdWxlcy9lbW9qaXMtbGlzdC9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMTZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiaW1wb3J0IHtPcHRpb25PYmplY3R9IGZyb20gJ2xvYWRlci11dGlscyc7XG5pbXBvcnQge1NlbWFudGljTmFtZXNwYWNlVHJlZU5vZGUsIFRlbXBsYXRlRnVuY3Rpb24sIFRlbXBsYXRlUGFyYW1ldGVyfSBmcm9tICcuLi9zZW1hbnRpY3MvbW9kZWwnO1xuXG5leHBvcnQgY2xhc3MgRW1pdHRlciB7XG5cblx0cHJpdmF0ZSBpc1JlbmRlckNvbW1lbnRzRW5hYmxlZDogYm9vbGVhbjtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zPzogT3B0aW9uT2JqZWN0KSB7XG5cdFx0dGhpcy5pc1JlbmRlckNvbW1lbnRzRW5hYmxlZCA9IChvcHRpb25zICYmIG9wdGlvbnMuZW1pdENvbW1lbnRzKSB8fCBmYWxzZTtcblx0fVxuXG5cdHB1YmxpYyBmb3JtYXQocm9vdDogU2VtYW50aWNOYW1lc3BhY2VUcmVlTm9kZSk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIHRoaXMuZm9ybWF0Tm9kZShyb290LCAwKTtcblx0fVxuXG5cdHByaXZhdGUgZm9ybWF0Tm9kZShub2RlOiBTZW1hbnRpY05hbWVzcGFjZVRyZWVOb2RlLCBpbmRlbnRhdGlvbkRlcHRoOiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdGNvbnN0IGRlY2xhcmF0aW9uUHJlZml4ID0gaW5kZW50YXRpb25EZXB0aCA9PT0gMCA/ICdpbnRlcmZhY2UgJyA6ICdcXHQnLnJlcGVhdChpbmRlbnRhdGlvbkRlcHRoKTtcblx0XHRsZXQgcGFydGlhbERlY2xhcmF0aW9uID0gYCR7ZGVjbGFyYXRpb25QcmVmaXh9JHtub2RlLmlkZW50aWZpZXJ9IHtcXG5gO1xuXHRcdG5vZGUuZnVuY3Rpb25zLmZvckVhY2goKHRlbXBsYXRlRnVuY3Rpb24pID0+IHBhcnRpYWxEZWNsYXJhdGlvbiArPSB0aGlzLmZvcm1hdEZ1bmN0aW9uKHRlbXBsYXRlRnVuY3Rpb24sIGluZGVudGF0aW9uRGVwdGggKyAxKSk7XG5cdFx0bm9kZS5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4gcGFydGlhbERlY2xhcmF0aW9uICs9IHRoaXMuZm9ybWF0Tm9kZShjaGlsZCwgaW5kZW50YXRpb25EZXB0aCArIDEpKTtcblx0XHRwYXJ0aWFsRGVjbGFyYXRpb24gKz0gYCR7J1xcdCcucmVwZWF0KGluZGVudGF0aW9uRGVwdGgpfX1cXG5gO1xuXHRcdHJldHVybiBwYXJ0aWFsRGVjbGFyYXRpb247XG5cdH1cblxuXHRwcml2YXRlIGZvcm1hdEZ1bmN0aW9uKHRlbXBsYXRlRnVuY3Rpb246IFRlbXBsYXRlRnVuY3Rpb24sIGluZGVudGF0aW9uRGVwdGg6IG51bWJlcik6IHN0cmluZyB7XG5cdFx0bGV0IGZ1bmN0aW9uRGVjbGFyYXRpb24gPSBgJHsnXFx0Jy5yZXBlYXQoaW5kZW50YXRpb25EZXB0aCl9JHt0ZW1wbGF0ZUZ1bmN0aW9uLm5hbWV9OiAoYDtcblx0XHRpZiAodGVtcGxhdGVGdW5jdGlvbi5wYXJhbXMubGVuZ3RoID4gMCkge1xuXHRcdFx0ZnVuY3Rpb25EZWNsYXJhdGlvbiArPSB0aGlzLmZvcm1hdFBhcmFtZXRlcnModGVtcGxhdGVGdW5jdGlvbi5wYXJhbXMsIGluZGVudGF0aW9uRGVwdGggKyAxKTtcblx0XHR9XG5cdFx0ZnVuY3Rpb25EZWNsYXJhdGlvbiArPSBgKSA9PiBEb2N1bWVudEZyYWdtZW50O1xcbmA7XG5cdFx0cmV0dXJuIGZ1bmN0aW9uRGVjbGFyYXRpb247XG5cdH1cblxuXHRwcml2YXRlIGZvcm1hdFBhcmFtZXRlcnMocGFyYW1zOiBUZW1wbGF0ZVBhcmFtZXRlcltdLCBpbmRlbnRhdGlvbkRlcHRoOiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdGxldCBwYXJhbWV0ZXJPYmplY3REZWNsYXJhdGlvbiA9ICd7Jztcblx0XHQvLyBwYXJhbWV0ZXJPYmplY3REZWNsYXJhdGlvbiArPSB0aGlzLmlzUmVuZGVyQ29tbWVudHNFbmFibGVkID8gYFxcbiR7J1xcdCcucmVwZWF0KGluZGVudGF0aW9uRGVwdGgpfWAgOiAnJztcblx0XHRwYXJhbWV0ZXJPYmplY3REZWNsYXJhdGlvbiArPSBwYXJhbXNcblx0XHRcdC5tYXAoKHBhcmFtKSA9PiB0aGlzLnJlbmRlclBhcmFtZXRlcihwYXJhbSwgaW5kZW50YXRpb25EZXB0aCkpXG5cdFx0XHQuam9pbihgLCR7dGhpcy5pc1JlbmRlckNvbW1lbnRzRW5hYmxlZCA/ICcnIDogJyAnfWApO1xuXHRcdHBhcmFtZXRlck9iamVjdERlY2xhcmF0aW9uICs9IHRoaXMuaXNSZW5kZXJDb21tZW50c0VuYWJsZWQgPyBgXFxuJHsnXFx0Jy5yZXBlYXQoaW5kZW50YXRpb25EZXB0aCAtIDEpfWAgOiAnJztcblx0XHRwYXJhbWV0ZXJPYmplY3REZWNsYXJhdGlvbiArPSAnfSc7XG5cdFx0cmV0dXJuIHBhcmFtZXRlck9iamVjdERlY2xhcmF0aW9uO1xuXHR9XG5cblx0cHJpdmF0ZSByZW5kZXJQYXJhbWV0ZXIocGFyYW06IFRlbXBsYXRlUGFyYW1ldGVyLCBpbmRlbnRhdGlvbkRlcHRoOiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdGNvbnN0IGNvbW1lbnRJZkFueSA9IHRoaXMucmVuZGVyQ29tbWVudElmQXBwcm9wcmlhdGUocGFyYW0uY29tbWVudCwgaW5kZW50YXRpb25EZXB0aCk7XG5cdFx0Y29uc3QgaW5kZW50aW5nUHJlZml4ID0gYFxcbiR7J1xcdCcucmVwZWF0KGluZGVudGF0aW9uRGVwdGgpfWA7XG5cdFx0cmV0dXJuIGAke2NvbW1lbnRJZkFueX0ke3RoaXMuaXNSZW5kZXJDb21tZW50c0VuYWJsZWQgPyBpbmRlbnRpbmdQcmVmaXggOiAnJ30ke3BhcmFtLm5hbWV9JHtwYXJhbS5vcHRpb25hbGl0eSA/ICc/JyA6ICcnfTogJHtwYXJhbS50eXBlfWA7XG5cdH1cblxuXHRwcml2YXRlIHJlbmRlckNvbW1lbnRJZkFwcHJvcHJpYXRlKGNvbW1lbnQ6IHN0cmluZywgaW5kZW50YXRpb25EZXB0aDogbnVtYmVyKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5pc1JlbmRlckNvbW1lbnRzRW5hYmxlZCAmJiBjb21tZW50XG5cdFx0XHQ/IGBcXG4keydcXHQnLnJlcGVhdChpbmRlbnRhdGlvbkRlcHRoKX0vKiAke2NvbW1lbnR9ICovYFxuXHRcdFx0OiAnJztcblx0fVxuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvc3ludGhlc2lzL2VtaXR0ZXIudHMiLCJpbXBvcnQge1RlbXBsYXRlLCBUZW1wbGF0ZURlY2xhcmF0aW9uLCBUZW1wbGF0ZVBhcmFtZXRlckFubm90YXRpb259IGZyb20gJy4vbW9kZWwnO1xuXG5leHBvcnQgbW9kdWxlIExleGVyIHtcblxuXHRjb25zdCBOQU1FU1BBQ0VfUkVHRVggPSAve25hbWVzcGFjZVxccysoLispXFxzKn0vO1xuXHRjb25zdCBURU1QTEFURV9SRUdFWCA9IC97dGVtcGxhdGVcXHMrXFwuKC4rKVxccyp9L2c7XG5cdGNvbnN0IFBBUkFNX1JFR0VYID0gL0BwYXJhbVxccysoLispL2c7XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIHRva2VuaXplKGlucHV0OiBzdHJpbmcpOiBUZW1wbGF0ZURlY2xhcmF0aW9uIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bmFtZXNwYWNlOiBmaW5kTmFtZXNwYWNlKGlucHV0KSxcblx0XHRcdHRlbXBsYXRlczogZmluZFRlbXBsYXRlRnVuY3Rpb25zKGlucHV0KVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGZpbmROYW1lc3BhY2UoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0Y29uc3QgbmFtZXNwYWNlID0gaW5wdXQubWF0Y2goTkFNRVNQQUNFX1JFR0VYKTtcblx0XHRpZiAobmFtZXNwYWNlID09PSBudWxsKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ05vIG5hbWVzcGFjZSBkZWNsYXJhdGlvbiBmb3VuZC4nKTtcblx0XHR9XG5cdFx0cmV0dXJuIG5hbWVzcGFjZVsxXTtcblx0fVxuXG5cdGZ1bmN0aW9uIGZpbmRUZW1wbGF0ZUZ1bmN0aW9ucyhpbnB1dDogc3RyaW5nKTogVGVtcGxhdGVbXSB7XG5cdFx0bGV0IHRlbXBsYXRlczogVGVtcGxhdGVbXSA9IFtdLCBtYXRjaDtcblx0XHR3aGlsZSAobWF0Y2ggPSBURU1QTEFURV9SRUdFWC5leGVjKGlucHV0KSkge1xuXHRcdFx0dGVtcGxhdGVzLnB1c2goY29uc3RydWN0VGVtcGxhdGUobWF0Y2gpKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRlbXBsYXRlcztcblx0fVxuXG5cdGZ1bmN0aW9uIGNvbnN0cnVjdFRlbXBsYXRlKG1hdGNoRGF0YTogUmVnRXhwRXhlY0FycmF5KTogVGVtcGxhdGUge1xuXHRcdHJldHVybiB7XG5cdFx0XHRuYW1lOiBtYXRjaERhdGFbMV0sXG5cdFx0XHRwYXJhbXM6IGV4dHJhY3RQYXJhbXNGcm9tSlNEb2MoZmluZEpTRG9jKG1hdGNoRGF0YS5pbnB1dCwgbWF0Y2hEYXRhLmluZGV4KSlcblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gZXh0cmFjdFBhcmFtc0Zyb21KU0RvYyhqc0RvYzogc3RyaW5nKTogVGVtcGxhdGVQYXJhbWV0ZXJBbm5vdGF0aW9uW10ge1xuXHRcdGxldCBwYXJhbXM6IFRlbXBsYXRlUGFyYW1ldGVyQW5ub3RhdGlvbltdID0gW10sIG1hdGNoO1xuXHRcdHdoaWxlIChtYXRjaCA9IFBBUkFNX1JFR0VYLmV4ZWMoanNEb2MpKSB7XG5cdFx0XHRwYXJhbXMucHVzaChtYXRjaFsxXSk7XG5cdFx0fVxuXHRcdHJldHVybiBwYXJhbXM7XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZmluZEpTRG9jKGlucHV0OiBzdHJpbmcsIG1hdGNoSW5kZXg6IG51bWJlcik6IHN0cmluZyB7XG5cdFx0Y29uc3QgaW5wdXRCZWZvcmVNYXRjaCA9IGlucHV0LnN1YnN0cigwLCBtYXRjaEluZGV4KTtcblx0XHRsZXQganNEb2MgPSBpbnB1dC5zbGljZShpbnB1dEJlZm9yZU1hdGNoLmxhc3RJbmRleE9mKCcvKionKSwgbWF0Y2hJbmRleCk7XG5cdFx0aWYgKGpzRG9jLmluY2x1ZGVzKCd7dGVtcGxhdGUnKSkge1xuXHRcdFx0anNEb2MgPSAnJztcblx0XHR9XG5cdFx0cmV0dXJuIGpzRG9jO1xuXHR9XG5cbn1cblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9zeW50YXgvbGV4ZXIudHMiLCJpbXBvcnQge1RlbXBsYXRlLCBUZW1wbGF0ZURlY2xhcmF0aW9uLCBUZW1wbGF0ZVBhcmFtZXRlckFubm90YXRpb259IGZyb20gJy4uL3N5bnRheC9tb2RlbCc7XG5pbXBvcnQge1NlbWFudGljTmFtZXNwYWNlVHJlZU5vZGUsIFRlbXBsYXRlRnVuY3Rpb24sIFRlbXBsYXRlUGFyYW1ldGVyfSBmcm9tICcuL21vZGVsJztcblxuZXhwb3J0IG1vZHVsZSBQYXJzZXIge1xuXG5cdGNvbnN0IFBBUkFNX05BTUVfUkVHRVggPSAvKFxcdyspXFw/Pzo/Lztcblx0Y29uc3QgUEFSQU1fVFlQRV9SRUdFWCA9IC86XFxzKihcXFMrKVxccz8vO1xuXHRjb25zdCBQQVJBTV9DT01NRU5UX1JFR0VYID0gLzpcXHMqXFxTK1xccysoLiopLztcblxuXHRleHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVSb290TmFtZXNwYWNlTm9kZShkZWNsYXJhdGlvbjogVGVtcGxhdGVEZWNsYXJhdGlvbik6IFNlbWFudGljTmFtZXNwYWNlVHJlZU5vZGUge1xuXHRcdGNvbnN0IG5hbWVzcGFjZUFycmF5ID0gZGVjbGFyYXRpb24ubmFtZXNwYWNlLnNwbGl0KCcuJyk7XG5cdFx0Y29uc3Qgcm9vdElkZW50aWZpZXIgPSBuYW1lc3BhY2VBcnJheS5zaGlmdCgpO1xuXHRcdGlmICghcm9vdElkZW50aWZpZXIpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignTm8gbmFtZXNwYWNlIHJvb3QgZm91bmQuJyk7XG5cdFx0fVxuXHRcdGNvbnN0IHJvb3Q6IFNlbWFudGljTmFtZXNwYWNlVHJlZU5vZGUgPSB7XG5cdFx0XHRpZGVudGlmaWVyOiByb290SWRlbnRpZmllcixcblx0XHRcdGNoaWxkcmVuOiBbXSxcblx0XHRcdGZ1bmN0aW9uczogW11cblx0XHR9O1xuXHRcdGxldCBjdXJyZW50Tm9kZSA9IHJvb3Q7XG5cdFx0bmFtZXNwYWNlQXJyYXkuZm9yRWFjaCgoaWRlbnRpZmllcikgPT4ge1xuXHRcdFx0bGV0IHBhcmVudE5vZGUgPSBjdXJyZW50Tm9kZTtcblx0XHRcdGN1cnJlbnROb2RlID0ge1xuXHRcdFx0XHRpZGVudGlmaWVyOiBpZGVudGlmaWVyLFxuXHRcdFx0XHRjaGlsZHJlbjogW10sXG5cdFx0XHRcdGZ1bmN0aW9uczogW11cblx0XHRcdH07XG5cdFx0XHRwYXJlbnROb2RlLmNoaWxkcmVuLnB1c2goY3VycmVudE5vZGUpO1xuXHRcdH0pO1xuXHRcdGN1cnJlbnROb2RlLmZ1bmN0aW9ucyA9IGN1cnJlbnROb2RlLmZ1bmN0aW9ucy5jb25jYXQocGFyc2VUZW1wbGF0ZXMoZGVjbGFyYXRpb24udGVtcGxhdGVzKSk7XG5cdFx0cmV0dXJuIHJvb3Q7XG5cdH1cblxuXHRmdW5jdGlvbiBwYXJzZVRlbXBsYXRlcyh0ZW1wbGF0ZXM6IFRlbXBsYXRlW10pOiBUZW1wbGF0ZUZ1bmN0aW9uW10ge1xuXHRcdHJldHVybiB0ZW1wbGF0ZXMubWFwKCh0ZW1wbGF0ZSkgPT4gcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZSkpO1xuXHR9XG5cblx0ZnVuY3Rpb24gcGFyc2VUZW1wbGF0ZSh0ZW1wbGF0ZTogVGVtcGxhdGUpOiBUZW1wbGF0ZUZ1bmN0aW9uIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bmFtZTogdGVtcGxhdGUubmFtZSxcblx0XHRcdHBhcmFtczogcGFyc2VUZW1wbGF0ZVBhcmFtZXRlckFubm90YXRpb25zKHRlbXBsYXRlLnBhcmFtcylcblx0XHR9O1xuXHR9XG5cblx0ZnVuY3Rpb24gcGFyc2VUZW1wbGF0ZVBhcmFtZXRlckFubm90YXRpb25zKHBhcmFtczogVGVtcGxhdGVQYXJhbWV0ZXJBbm5vdGF0aW9uW10pOiBUZW1wbGF0ZVBhcmFtZXRlcltdIHtcblx0XHRyZXR1cm4gcGFyYW1zLm1hcCgocGFyYW0pID0+IHBhcnNlVGVtcGxhdGVQYXJhbWV0ZXJBbm5vdGF0aW9uKHBhcmFtKSk7XG5cdH1cblxuXHRmdW5jdGlvbiBwYXJzZVRlbXBsYXRlUGFyYW1ldGVyQW5ub3RhdGlvbihwYXJhbTogVGVtcGxhdGVQYXJhbWV0ZXJBbm5vdGF0aW9uKTogVGVtcGxhdGVQYXJhbWV0ZXIge1xuXHRcdGNvbnN0IG5hbWVNYXRjaCA9IHBhcmFtLm1hdGNoKFBBUkFNX05BTUVfUkVHRVgpO1xuXHRcdGlmICghbmFtZU1hdGNoKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ZvdW5kIGZ1bmN0aW9uIHBhcmFtZXRlciB3aXRob3V0IG5hbWUuJyk7XG5cdFx0fVxuXHRcdGNvbnN0IHR5cGVNYXRjaCA9IHBhcmFtLm1hdGNoKFBBUkFNX1RZUEVfUkVHRVgpO1xuXHRcdGNvbnN0IGNvbW1lbnRNYXRjaCA9IHBhcmFtLm1hdGNoKFBBUkFNX0NPTU1FTlRfUkVHRVgpO1xuXHRcdHJldHVybiB7XG5cdFx0XHRuYW1lOiBuYW1lTWF0Y2hbMV0sXG5cdFx0XHRvcHRpb25hbGl0eTogbmFtZU1hdGNoWzBdLmluY2x1ZGVzKCc/JyksXG5cdFx0XHR0eXBlOiB0eXBlTWF0Y2ggPyB0eXBlTWF0Y2hbMV0gOiAnJyxcblx0XHRcdGNvbW1lbnQ6IGNvbW1lbnRNYXRjaCA/IGNvbW1lbnRNYXRjaFsxXSA6ICcnXG5cdFx0fTtcblx0fVxuXG59XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvc2VtYW50aWNzL3BhcnNlci50cyJdLCJzb3VyY2VSb290IjoiIn0=