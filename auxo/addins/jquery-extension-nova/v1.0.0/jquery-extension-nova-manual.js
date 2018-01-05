(function (exports) {
'use strict';

var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function encode(e) {
        var t = "";
        var n, r, i, s, o, u, a;
        var f = 0;
        e = Base64._utf8_encode(e);
        while (f < e.length) {
            n = e.charCodeAt(f++);
            r = e.charCodeAt(f++);
            i = e.charCodeAt(f++);
            s = n >> 2;
            o = (n & 3) << 4 | r >> 4;
            u = (r & 15) << 2 | i >> 6;
            a = i & 63;
            if (isNaN(r)) {
                u = a = 64;
            } else if (isNaN(i)) {
                a = 64;
            }
            t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a);
        }
        return t;
    },
    decode: function decode(e) {
        var t = "";
        var n, r, i;
        var s, o, u, a;
        var f = 0;
        e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (f < e.length) {
            s = this._keyStr.indexOf(e.charAt(f++));
            o = this._keyStr.indexOf(e.charAt(f++));
            u = this._keyStr.indexOf(e.charAt(f++));
            a = this._keyStr.indexOf(e.charAt(f++));
            n = s << 2 | o >> 4;
            r = (o & 15) << 4 | u >> 2;
            i = (u & 3) << 6 | a;
            t = t + String.fromCharCode(n);
            if (u != 64) {
                t = t + String.fromCharCode(r);
            }
            if (a != 64) {
                t = t + String.fromCharCode(i);
            }
        }
        t = Base64._utf8_decode(t);
        return t;
    },
    _utf8_encode: function _utf8_encode(e) {
        e = e.replace(/\r\n/g, "\n");
        var t = "";
        for (var n = 0; n < e.length; n++) {
            var r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
            } else if (r > 127 && r < 2048) {
                t += String.fromCharCode(r >> 6 | 192);
                t += String.fromCharCode(r & 63 | 128);
            } else {
                t += String.fromCharCode(r >> 12 | 224);
                t += String.fromCharCode(r >> 6 & 63 | 128);
                t += String.fromCharCode(r & 63 | 128);
            }
        }
        return t;
    },
    _utf8_decode: function _utf8_decode(e) {
        var t = "",
            c1,
            c2;
        var n = 0;
        var r = c1 = c2 = 0;
        while (n < e.length) {
            r = e.charCodeAt(n);
            if (r < 128) {
                t += String.fromCharCode(r);
                n++;
            } else if (r > 191 && r < 224) {
                c2 = e.charCodeAt(n + 1);
                t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                n += 2;
            } else {
                c2 = e.charCodeAt(n + 1);
                c3 = e.charCodeAt(n + 2);
                t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                n += 3;
            }
        }
        return t.replace(/\0+$/, '');
    }
};

var Base64_1 = Base64;

var base64EncodeDecode$1 = {
    Base64: Base64_1
};

var base64EncodeDecode = base64EncodeDecode$1;

function base64Encode(str) {
	return base64EncodeDecode.Base64.encode(str);
}

function base64Decode(str) {
	return base64EncodeDecode.Base64.decode(str);
}

var index = {
	base64Encode: base64Encode,
	base64Decode: base64Decode
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var sha = createCommonjsModule(function (module, exports) {
  /*
   A JavaScript implementation of the SHA family of hashes, as
   defined in FIPS PUB 180-4 and FIPS PUB 202, as well as the corresponding
   HMAC implementation as defined in FIPS PUB 198a
  
   Copyright Brian Turek 2008-2016
   Distributed under the BSD License
   See http://caligatio.github.com/jsSHA/ for more information
  
   Several functions taken from Paul Johnston
  */
  'use strict';
  (function (X) {
    function C(f, b, c) {
      var d = 0,
          a = [],
          k = 0,
          g,
          e,
          n,
          h,
          m,
          r,
          t,
          q,
          v = !1,
          u = [],
          w = [],
          x,
          y = !1,
          z = !1;c = c || {};g = c.encoding || "UTF8";x = c.numRounds || 1;n = J(b, g);if (x !== parseInt(x, 10) || 1 > x) throw Error("numRounds must a integer >= 1");if ("SHA-1" === f) m = 512, r = K, t = Y, h = 160, q = function q(b) {
        return b.slice();
      };else if (0 === f.lastIndexOf("SHA-", 0)) {
        if (r = function r(b, d) {
          return L(b, d, f);
        }, t = function t(b, d, c, a) {
          var l, k;if ("SHA-224" === f || "SHA-256" === f) l = (d + 65 >>> 9 << 4) + 15, k = 16;else if ("SHA-384" === f || "SHA-512" === f) l = (d + 129 >>> 10 << 5) + 31, k = 32;else throw Error("Unexpected error in SHA-2 implementation");for (; b.length <= l;) {
            b.push(0);
          }b[d >>> 5] |= 128 << 24 - d % 32;d = d + c;b[l] = d & 4294967295;b[l - 1] = d / 4294967296 | 0;c = b.length;for (d = 0; d < c; d += k) {
            a = L(b.slice(d, d + k), a, f);
          }if ("SHA-224" === f) b = [a[0], a[1], a[2], a[3], a[4], a[5], a[6]];else if ("SHA-256" === f) b = a;else if ("SHA-384" === f) b = [a[0].a, a[0].b, a[1].a, a[1].b, a[2].a, a[2].b, a[3].a, a[3].b, a[4].a, a[4].b, a[5].a, a[5].b];else if ("SHA-512" === f) b = [a[0].a, a[0].b, a[1].a, a[1].b, a[2].a, a[2].b, a[3].a, a[3].b, a[4].a, a[4].b, a[5].a, a[5].b, a[6].a, a[6].b, a[7].a, a[7].b];else throw Error("Unexpected error in SHA-2 implementation");return b;
        }, q = function q(b) {
          return b.slice();
        }, "SHA-224" === f) m = 512, h = 224;else if ("SHA-256" === f) m = 512, h = 256;else if ("SHA-384" === f) m = 1024, h = 384;else if ("SHA-512" === f) m = 1024, h = 512;else throw Error("Chosen SHA variant is not supported");
      } else if (0 === f.lastIndexOf("SHA3-", 0) || 0 === f.lastIndexOf("SHAKE", 0)) {
        var F = 6;r = D;q = function q(b) {
          var f = [],
              a;for (a = 0; 5 > a; a += 1) {
            f[a] = b[a].slice();
          }return f;
        };if ("SHA3-224" === f) m = 1152, h = 224;else if ("SHA3-256" === f) m = 1088, h = 256;else if ("SHA3-384" === f) m = 832, h = 384;else if ("SHA3-512" === f) m = 576, h = 512;else if ("SHAKE128" === f) m = 1344, h = -1, F = 31, z = !0;else if ("SHAKE256" === f) m = 1088, h = -1, F = 31, z = !0;else throw Error("Chosen SHA variant is not supported");t = function t(b, f, a, d, c) {
          a = m;var l = F,
              k,
              g = [],
              e = a >>> 5,
              h = 0,
              p = f >>> 5;for (k = 0; k < p && f >= a; k += e) {
            d = D(b.slice(k, k + e), d), f -= a;
          }b = b.slice(k);for (f %= a; b.length < e;) {
            b.push(0);
          }k = f >>> 3;b[k >> 2] ^= l << 24 - k % 4 * 8;b[e - 1] ^= 128;for (d = D(b, d); 32 * g.length < c;) {
            b = d[h % 5][h / 5 | 0];g.push((b.b & 255) << 24 | (b.b & 65280) << 8 | (b.b & 16711680) >> 8 | b.b >>> 24);if (32 * g.length >= c) break;g.push((b.a & 255) << 24 | (b.a & 65280) << 8 | (b.a & 16711680) >> 8 | b.a >>> 24);h += 1;0 === 64 * h % a && D(null, d);
          }return g;
        };
      } else throw Error("Chosen SHA variant is not supported");e = B(f);this.setHMACKey = function (b, a, c) {
        var l;if (!0 === v) throw Error("HMAC key already set");if (!0 === y) throw Error("Cannot set HMAC key after calling update");if (!0 === z) throw Error("SHAKE is not supported for HMAC");g = (c || {}).encoding || "UTF8";a = J(a, g)(b);
        b = a.binLen;a = a.value;l = m >>> 3;c = l / 4 - 1;if (l < b / 8) {
          for (a = t(a, b, 0, B(f), h); a.length <= c;) {
            a.push(0);
          }a[c] &= 4294967040;
        } else if (l > b / 8) {
          for (; a.length <= c;) {
            a.push(0);
          }a[c] &= 4294967040;
        }for (b = 0; b <= c; b += 1) {
          u[b] = a[b] ^ 909522486, w[b] = a[b] ^ 1549556828;
        }e = r(u, e);d = m;v = !0;
      };this.update = function (b) {
        var f,
            c,
            g,
            h = 0,
            q = m >>> 5;f = n(b, a, k);b = f.binLen;c = f.value;f = b >>> 5;for (g = 0; g < f; g += q) {
          h + m <= b && (e = r(c.slice(g, g + q), e), h += m);
        }d += h;a = c.slice(h >>> 5);k = b % m;y = !0;
      };this.getHash = function (b, c) {
        var g, m, n, r;if (!0 === v) throw Error("Cannot call getHash after setting HMAC key");
        n = M(c);if (!0 === z) {
          if (-1 === n.shakeLen) throw Error("shakeLen must be specified in options");h = n.shakeLen;
        }switch (b) {case "HEX":
            g = function g(b) {
              return N(b, h, n);
            };break;case "B64":
            g = function g(b) {
              return O(b, h, n);
            };break;case "BYTES":
            g = function g(b) {
              return P(b, h);
            };break;case "ARRAYBUFFER":
            try {
              m = new ArrayBuffer(0);
            } catch (sa) {
              throw Error("ARRAYBUFFER not supported by this environment");
            }g = function g(b) {
              return Q(b, h);
            };break;default:
            throw Error("format must be HEX, B64, BYTES, or ARRAYBUFFER");}r = t(a.slice(), k, d, q(e), h);for (m = 1; m < x; m += 1) {
          !0 === z && 0 !== h % 32 && (r[r.length - 1] &= 4294967040 << 24 - h % 32), r = t(r, h, 0, B(f), h);
        }return g(r);
      };this.getHMAC = function (b, c) {
        var g, n, u, x;if (!1 === v) throw Error("Cannot call getHMAC without first setting HMAC key");u = M(c);switch (b) {case "HEX":
            g = function g(b) {
              return N(b, h, u);
            };break;case "B64":
            g = function g(b) {
              return O(b, h, u);
            };break;case "BYTES":
            g = function g(b) {
              return P(b, h);
            };break;case "ARRAYBUFFER":
            try {
              g = new ArrayBuffer(0);
            } catch (z) {
              throw Error("ARRAYBUFFER not supported by this environment");
            }g = function g(b) {
              return Q(b, h);
            };break;default:
            throw Error("outputFormat must be HEX, B64, BYTES, or ARRAYBUFFER");}n = t(a.slice(), k, d, q(e), h);x = r(w, B(f));x = t(n, h, m, x, h);return g(x);
      };
    }function a(f, b) {
      this.a = f;this.b = b;
    }function Z(f, b, a) {
      var d = f.length,
          l,
          k,
          g,
          e,
          n;b = b || [0];a = a || 0;n = a >>> 3;if (0 !== d % 2) throw Error("String of HEX type must be in byte increments");for (l = 0; l < d; l += 2) {
        k = parseInt(f.substr(l, 2), 16);if (isNaN(k)) throw Error("String of HEX type contains invalid characters");e = (l >>> 1) + n;for (g = e >>> 2; b.length <= g;) {
          b.push(0);
        }b[g] |= k << 8 * (3 - e % 4);
      }return { value: b, binLen: 4 * d + a };
    }function aa(f, b, a) {
      var d = [],
          l,
          k,
          g,
          e,
          d = b || [0];a = a || 0;k = a >>> 3;for (l = 0; l < f.length; l += 1) {
        b = f.charCodeAt(l), e = l + k, g = e >>> 2, d.length <= g && d.push(0), d[g] |= b << 8 * (3 - e % 4);
      }return { value: d, binLen: 8 * f.length + a };
    }function ba(f, b, a) {
      var d = [],
          l = 0,
          k,
          g,
          e,
          n,
          h,
          m,
          d = b || [0];a = a || 0;b = a >>> 3;if (-1 === f.search(/^[a-zA-Z0-9=+\/]+$/)) throw Error("Invalid character in base-64 string");g = f.indexOf("=");f = f.replace(/\=/g, "");if (-1 !== g && g < f.length) throw Error("Invalid '=' found in base-64 string");
      for (g = 0; g < f.length; g += 4) {
        h = f.substr(g, 4);for (e = n = 0; e < h.length; e += 1) {
          k = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(h[e]), n |= k << 18 - 6 * e;
        }for (e = 0; e < h.length - 1; e += 1) {
          m = l + b;for (k = m >>> 2; d.length <= k;) {
            d.push(0);
          }d[k] |= (n >>> 16 - 8 * e & 255) << 8 * (3 - m % 4);l += 1;
        }
      }return { value: d, binLen: 8 * l + a };
    }function ca(a, b, c) {
      var d = [],
          l,
          k,
          g,
          d = b || [0];c = c || 0;l = c >>> 3;for (b = 0; b < a.byteLength; b += 1) {
        g = b + l, k = g >>> 2, d.length <= k && d.push(0), d[k] |= a[b] << 8 * (3 - g % 4);
      }return { value: d, binLen: 8 * a.byteLength + c };
    }function N(a, b, c) {
      var d = "";b /= 8;var l, k;for (l = 0; l < b; l += 1) {
        k = a[l >>> 2] >>> 8 * (3 - l % 4), d += "0123456789abcdef".charAt(k >>> 4 & 15) + "0123456789abcdef".charAt(k & 15);
      }return c.outputUpper ? d.toUpperCase() : d;
    }function O(a, b, c) {
      var d = "",
          l = b / 8,
          k,
          g,
          e;for (k = 0; k < l; k += 3) {
        for (g = k + 1 < l ? a[k + 1 >>> 2] : 0, e = k + 2 < l ? a[k + 2 >>> 2] : 0, e = (a[k >>> 2] >>> 8 * (3 - k % 4) & 255) << 16 | (g >>> 8 * (3 - (k + 1) % 4) & 255) << 8 | e >>> 8 * (3 - (k + 2) % 4) & 255, g = 0; 4 > g; g += 1) {
          8 * k + 6 * g <= b ? d += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(e >>> 6 * (3 - g) & 63) : d += c.b64Pad;
        }
      }return d;
    }function P(a, b) {
      var c = "",
          d = b / 8,
          l,
          k;for (l = 0; l < d; l += 1) {
        k = a[l >>> 2] >>> 8 * (3 - l % 4) & 255, c += String.fromCharCode(k);
      }return c;
    }function Q(a, b) {
      var c = b / 8,
          d,
          l = new ArrayBuffer(c);for (d = 0; d < c; d += 1) {
        l[d] = a[d >>> 2] >>> 8 * (3 - d % 4) & 255;
      }return l;
    }function M(a) {
      var b = { outputUpper: !1, b64Pad: "=", shakeLen: -1 };a = a || {};b.outputUpper = a.outputUpper || !1;!0 === a.hasOwnProperty("b64Pad") && (b.b64Pad = a.b64Pad);if (!0 === a.hasOwnProperty("shakeLen")) {
        if (0 !== a.shakeLen % 8) throw Error("shakeLen must be a multiple of 8");b.shakeLen = a.shakeLen;
      }if ("boolean" !== typeof b.outputUpper) throw Error("Invalid outputUpper formatting option");if ("string" !== typeof b.b64Pad) throw Error("Invalid b64Pad formatting option");return b;
    }function J(a, b) {
      var c;switch (b) {case "UTF8":case "UTF16BE":case "UTF16LE":
          break;default:
          throw Error("encoding must be UTF8, UTF16BE, or UTF16LE");}switch (a) {case "HEX":
          c = Z;break;case "TEXT":
          c = function c(a, f, _c) {
            var e = [],
                p = [],
                n = 0,
                h,
                m,
                r,
                t,
                q,
                e = f || [0];f = _c || 0;r = f >>> 3;if ("UTF8" === b) for (h = 0; h < a.length; h += 1) {
              for (_c = a.charCodeAt(h), p = [], 128 > _c ? p.push(_c) : 2048 > _c ? (p.push(192 | _c >>> 6), p.push(128 | _c & 63)) : 55296 > _c || 57344 <= _c ? p.push(224 | _c >>> 12, 128 | _c >>> 6 & 63, 128 | _c & 63) : (h += 1, _c = 65536 + ((_c & 1023) << 10 | a.charCodeAt(h) & 1023), p.push(240 | _c >>> 18, 128 | _c >>> 12 & 63, 128 | _c >>> 6 & 63, 128 | _c & 63)), m = 0; m < p.length; m += 1) {
                q = n + r;for (t = q >>> 2; e.length <= t;) {
                  e.push(0);
                }e[t] |= p[m] << 8 * (3 - q % 4);n += 1;
              }
            } else if ("UTF16BE" === b || "UTF16LE" === b) for (h = 0; h < a.length; h += 1) {
              _c = a.charCodeAt(h);"UTF16LE" === b && (m = _c & 255, _c = m << 8 | _c >>> 8);q = n + r;for (t = q >>> 2; e.length <= t;) {
                e.push(0);
              }e[t] |= _c << 8 * (2 - q % 4);n += 2;
            }return { value: e, binLen: 8 * n + f };
          };break;case "B64":
          c = ba;break;case "BYTES":
          c = aa;break;case "ARRAYBUFFER":
          try {
            c = new ArrayBuffer(0);
          } catch (d) {
            throw Error("ARRAYBUFFER not supported by this environment");
          }c = ca;break;default:
          throw Error("format must be HEX, TEXT, B64, BYTES, or ARRAYBUFFER");}return c;
    }function y(a, b) {
      return a << b | a >>> 32 - b;
    }function R(f, b) {
      return 32 < b ? (b = b - 32, new a(f.b << b | f.a >>> 32 - b, f.a << b | f.b >>> 32 - b)) : 0 !== b ? new a(f.a << b | f.b >>> 32 - b, f.b << b | f.a >>> 32 - b) : f;
    }function v(a, b) {
      return a >>> b | a << 32 - b;
    }function w(f, b) {
      var c = null,
          c = new a(f.a, f.b);return c = 32 >= b ? new a(c.a >>> b | c.b << 32 - b & 4294967295, c.b >>> b | c.a << 32 - b & 4294967295) : new a(c.b >>> b - 32 | c.a << 64 - b & 4294967295, c.a >>> b - 32 | c.b << 64 - b & 4294967295);
    }function S(f, b) {
      var c = null;return c = 32 >= b ? new a(f.a >>> b, f.b >>> b | f.a << 32 - b & 4294967295) : new a(0, f.a >>> b - 32);
    }function da(a, b, c) {
      return a & b ^ ~a & c;
    }function ea(f, b, c) {
      return new a(f.a & b.a ^ ~f.a & c.a, f.b & b.b ^ ~f.b & c.b);
    }function T(a, b, c) {
      return a & b ^ a & c ^ b & c;
    }function fa(f, b, c) {
      return new a(f.a & b.a ^ f.a & c.a ^ b.a & c.a, f.b & b.b ^ f.b & c.b ^ b.b & c.b);
    }function ga(a) {
      return v(a, 2) ^ v(a, 13) ^ v(a, 22);
    }function ha(f) {
      var b = w(f, 28),
          c = w(f, 34);f = w(f, 39);return new a(b.a ^ c.a ^ f.a, b.b ^ c.b ^ f.b);
    }function ia(a) {
      return v(a, 6) ^ v(a, 11) ^ v(a, 25);
    }function ja(f) {
      var b = w(f, 14),
          c = w(f, 18);f = w(f, 41);return new a(b.a ^ c.a ^ f.a, b.b ^ c.b ^ f.b);
    }function ka(a) {
      return v(a, 7) ^ v(a, 18) ^ a >>> 3;
    }function la(f) {
      var b = w(f, 1),
          c = w(f, 8);f = S(f, 7);return new a(b.a ^ c.a ^ f.a, b.b ^ c.b ^ f.b);
    }function ma(a) {
      return v(a, 17) ^ v(a, 19) ^ a >>> 10;
    }function na(f) {
      var b = w(f, 19),
          c = w(f, 61);f = S(f, 6);return new a(b.a ^ c.a ^ f.a, b.b ^ c.b ^ f.b);
    }function G(a, b) {
      var c = (a & 65535) + (b & 65535);return ((a >>> 16) + (b >>> 16) + (c >>> 16) & 65535) << 16 | c & 65535;
    }function oa(a, b, c, d) {
      var l = (a & 65535) + (b & 65535) + (c & 65535) + (d & 65535);return ((a >>> 16) + (b >>> 16) + (c >>> 16) + (d >>> 16) + (l >>> 16) & 65535) << 16 | l & 65535;
    }function H(a, b, c, d, l) {
      var e = (a & 65535) + (b & 65535) + (c & 65535) + (d & 65535) + (l & 65535);return ((a >>> 16) + (b >>> 16) + (c >>> 16) + (d >>> 16) + (l >>> 16) + (e >>> 16) & 65535) << 16 | e & 65535;
    }function pa(f, b) {
      var c, d, l;c = (f.b & 65535) + (b.b & 65535);d = (f.b >>> 16) + (b.b >>> 16) + (c >>> 16);l = (d & 65535) << 16 | c & 65535;c = (f.a & 65535) + (b.a & 65535) + (d >>> 16);d = (f.a >>> 16) + (b.a >>> 16) + (c >>> 16);return new a((d & 65535) << 16 | c & 65535, l);
    }function qa(f, b, c, d) {
      var l, e, g;l = (f.b & 65535) + (b.b & 65535) + (c.b & 65535) + (d.b & 65535);e = (f.b >>> 16) + (b.b >>> 16) + (c.b >>> 16) + (d.b >>> 16) + (l >>> 16);g = (e & 65535) << 16 | l & 65535;l = (f.a & 65535) + (b.a & 65535) + (c.a & 65535) + (d.a & 65535) + (e >>> 16);e = (f.a >>> 16) + (b.a >>> 16) + (c.a >>> 16) + (d.a >>> 16) + (l >>> 16);return new a((e & 65535) << 16 | l & 65535, g);
    }function ra(f, b, c, d, l) {
      var e, g, p;e = (f.b & 65535) + (b.b & 65535) + (c.b & 65535) + (d.b & 65535) + (l.b & 65535);g = (f.b >>> 16) + (b.b >>> 16) + (c.b >>> 16) + (d.b >>> 16) + (l.b >>> 16) + (e >>> 16);p = (g & 65535) << 16 | e & 65535;e = (f.a & 65535) + (b.a & 65535) + (c.a & 65535) + (d.a & 65535) + (l.a & 65535) + (g >>> 16);g = (f.a >>> 16) + (b.a >>> 16) + (c.a >>> 16) + (d.a >>> 16) + (l.a >>> 16) + (e >>> 16);return new a((g & 65535) << 16 | e & 65535, p);
    }function A(f) {
      var b = 0,
          c = 0,
          d;for (d = 0; d < arguments.length; d += 1) {
        b ^= arguments[d].b, c ^= arguments[d].a;
      }return new a(c, b);
    }function B(f) {
      var b = [],
          c;if ("SHA-1" === f) b = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];else if (0 === f.lastIndexOf("SHA-", 0)) switch (b = [3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839, 3204075428], c = [1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924, 528734635, 1541459225], f) {case "SHA-224":
          break;case "SHA-256":
          b = c;break;case "SHA-384":
          b = [new a(3418070365, b[0]), new a(1654270250, b[1]), new a(2438529370, b[2]), new a(355462360, b[3]), new a(1731405415, b[4]), new a(41048885895, b[5]), new a(3675008525, b[6]), new a(1203062813, b[7])];break;case "SHA-512":
          b = [new a(c[0], 4089235720), new a(c[1], 2227873595), new a(c[2], 4271175723), new a(c[3], 1595750129), new a(c[4], 2917565137), new a(c[5], 725511199), new a(c[6], 4215389547), new a(c[7], 327033209)];break;default:
          throw Error("Unknown SHA variant");} else if (0 === f.lastIndexOf("SHA3-", 0) || 0 === f.lastIndexOf("SHAKE", 0)) for (f = 0; 5 > f; f += 1) {
        b[f] = [new a(0, 0), new a(0, 0), new a(0, 0), new a(0, 0), new a(0, 0)];
      } else throw Error("No SHA variants supported");return b;
    }function K(a, b) {
      var c = [],
          d,
          e,
          k,
          g,
          p,
          n,
          h;d = b[0];e = b[1];k = b[2];g = b[3];p = b[4];for (h = 0; 80 > h; h += 1) {
        c[h] = 16 > h ? a[h] : y(c[h - 3] ^ c[h - 8] ^ c[h - 14] ^ c[h - 16], 1), n = 20 > h ? H(y(d, 5), e & k ^ ~e & g, p, 1518500249, c[h]) : 40 > h ? H(y(d, 5), e ^ k ^ g, p, 1859775393, c[h]) : 60 > h ? H(y(d, 5), T(e, k, g), p, 2400959708, c[h]) : H(y(d, 5), e ^ k ^ g, p, 3395469782, c[h]), p = g, g = k, k = y(e, 30), e = d, d = n;
      }b[0] = G(d, b[0]);b[1] = G(e, b[1]);b[2] = G(k, b[2]);b[3] = G(g, b[3]);b[4] = G(p, b[4]);return b;
    }function Y(a, b, c, d) {
      var e;for (e = (b + 65 >>> 9 << 4) + 15; a.length <= e;) {
        a.push(0);
      }a[b >>> 5] |= 128 << 24 - b % 32;b += c;a[e] = b & 4294967295;a[e - 1] = b / 4294967296 | 0;b = a.length;for (e = 0; e < b; e += 16) {
        d = K(a.slice(e, e + 16), d);
      }return d;
    }function L(f, b, c) {
      var d,
          l,
          k,
          g,
          p,
          n,
          h,
          m,
          r,
          t,
          q,
          v,
          u,
          w,
          x,
          y,
          z,
          F,
          A,
          B,
          C,
          D,
          E = [],
          I;if ("SHA-224" === c || "SHA-256" === c) t = 64, v = 1, D = Number, u = G, w = oa, x = H, y = ka, z = ma, F = ga, A = ia, C = T, B = da, I = e;else if ("SHA-384" === c || "SHA-512" === c) t = 80, v = 2, D = a, u = pa, w = qa, x = ra, y = la, z = na, F = ha, A = ja, C = fa, B = ea, I = U;else throw Error("Unexpected error in SHA-2 implementation");c = b[0];d = b[1];l = b[2];k = b[3];g = b[4];p = b[5];n = b[6];h = b[7];for (q = 0; q < t; q += 1) {
        16 > q ? (r = q * v, m = f.length <= r ? 0 : f[r], r = f.length <= r + 1 ? 0 : f[r + 1], E[q] = new D(m, r)) : E[q] = w(z(E[q - 2]), E[q - 7], y(E[q - 15]), E[q - 16]), m = x(h, A(g), B(g, p, n), I[q], E[q]), r = u(F(c), C(c, d, l)), h = n, n = p, p = g, g = u(k, m), k = l, l = d, d = c, c = u(m, r);
      }b[0] = u(c, b[0]);b[1] = u(d, b[1]);b[2] = u(l, b[2]);b[3] = u(k, b[3]);b[4] = u(g, b[4]);b[5] = u(p, b[5]);b[6] = u(n, b[6]);b[7] = u(h, b[7]);return b;
    }function D(f, b) {
      var c,
          d,
          e,
          k,
          g = [],
          p = [];if (null !== f) for (d = 0; d < f.length; d += 2) {
        b[(d >>> 1) % 5][(d >>> 1) / 5 | 0] = A(b[(d >>> 1) % 5][(d >>> 1) / 5 | 0], new a((f[d + 1] & 255) << 24 | (f[d + 1] & 65280) << 8 | (f[d + 1] & 16711680) >>> 8 | f[d + 1] >>> 24, (f[d] & 255) << 24 | (f[d] & 65280) << 8 | (f[d] & 16711680) >>> 8 | f[d] >>> 24));
      }for (c = 0; 24 > c; c += 1) {
        k = B("SHA3-");for (d = 0; 5 > d; d += 1) {
          g[d] = A(b[d][0], b[d][1], b[d][2], b[d][3], b[d][4]);
        }for (d = 0; 5 > d; d += 1) {
          p[d] = A(g[(d + 4) % 5], R(g[(d + 1) % 5], 1));
        }for (d = 0; 5 > d; d += 1) {
          for (e = 0; 5 > e; e += 1) {
            b[d][e] = A(b[d][e], p[d]);
          }
        }for (d = 0; 5 > d; d += 1) {
          for (e = 0; 5 > e; e += 1) {
            k[e][(2 * d + 3 * e) % 5] = R(b[d][e], V[d][e]);
          }
        }for (d = 0; 5 > d; d += 1) {
          for (e = 0; 5 > e; e += 1) {
            b[d][e] = A(k[d][e], new a(~k[(d + 1) % 5][e].a & k[(d + 2) % 5][e].a, ~k[(d + 1) % 5][e].b & k[(d + 2) % 5][e].b));
          }
        }b[0][0] = A(b[0][0], W[c]);
      }return b;
    }var e, U, V, W;e = [1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993, 2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987, 1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774, 264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986, 2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711, 113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291, 1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411, 3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344, 430227734, 506948616, 659060556, 883997877, 958139571, 1322822218, 1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424, 2428436474, 2756734187, 3204031479, 3329325298];U = [new a(e[0], 3609767458), new a(e[1], 602891725), new a(e[2], 3964484399), new a(e[3], 2173295548), new a(e[4], 4081628472), new a(e[5], 3053834265), new a(e[6], 2937671579), new a(e[7], 3664609560), new a(e[8], 2734883394), new a(e[9], 1164996542), new a(e[10], 1323610764), new a(e[11], 3590304994), new a(e[12], 4068182383), new a(e[13], 991336113), new a(e[14], 633803317), new a(e[15], 3479774868), new a(e[16], 2666613458), new a(e[17], 944711139), new a(e[18], 2341262773), new a(e[19], 2007800933), new a(e[20], 1495990901), new a(e[21], 1856431235), new a(e[22], 3175218132), new a(e[23], 2198950837), new a(e[24], 3999719339), new a(e[25], 766784016), new a(e[26], 2566594879), new a(e[27], 3203337956), new a(e[28], 1034457026), new a(e[29], 2466948901), new a(e[30], 3758326383), new a(e[31], 168717936), new a(e[32], 1188179964), new a(e[33], 1546045734), new a(e[34], 1522805485), new a(e[35], 2643833823), new a(e[36], 2343527390), new a(e[37], 1014477480), new a(e[38], 1206759142), new a(e[39], 344077627), new a(e[40], 1290863460), new a(e[41], 3158454273), new a(e[42], 3505952657), new a(e[43], 106217008), new a(e[44], 3606008344), new a(e[45], 1432725776), new a(e[46], 1467031594), new a(e[47], 851169720), new a(e[48], 3100823752), new a(e[49], 1363258195), new a(e[50], 3750685593), new a(e[51], 3785050280), new a(e[52], 3318307427), new a(e[53], 3812723403), new a(e[54], 2003034995), new a(e[55], 3602036899), new a(e[56], 1575990012), new a(e[57], 1125592928), new a(e[58], 2716904306), new a(e[59], 442776044), new a(e[60], 593698344), new a(e[61], 3733110249), new a(e[62], 2999351573), new a(e[63], 3815920427), new a(3391569614, 3928383900), new a(3515267271, 566280711), new a(3940187606, 3454069534), new a(4118630271, 4000239992), new a(116418474, 1914138554), new a(174292421, 2731055270), new a(289380356, 3203993006), new a(460393269, 320620315), new a(685471733, 587496836), new a(852142971, 1086792851), new a(1017036298, 365543100), new a(1126000580, 2618297676), new a(1288033470, 3409855158), new a(1501505948, 4234509866), new a(1607167915, 987167468), new a(1816402316, 1246189591)];W = [new a(0, 1), new a(0, 32898), new a(2147483648, 32906), new a(2147483648, 2147516416), new a(0, 32907), new a(0, 2147483649), new a(2147483648, 2147516545), new a(2147483648, 32777), new a(0, 138), new a(0, 136), new a(0, 2147516425), new a(0, 2147483658), new a(0, 2147516555), new a(2147483648, 139), new a(2147483648, 32905), new a(2147483648, 32771), new a(2147483648, 32770), new a(2147483648, 128), new a(0, 32778), new a(2147483648, 2147483658), new a(2147483648, 2147516545), new a(2147483648, 32896), new a(0, 2147483649), new a(2147483648, 2147516424)];V = [[0, 36, 3, 41, 18], [1, 44, 10, 45, 2], [62, 6, 43, 15, 61], [28, 55, 25, 21, 56], [27, 20, 39, 8, 14]];"undefined" !== typeof exports ? ("undefined" !== typeof module && module.exports && (module.exports = C), exports = C) : X.jsSHA = C;
  })(commonjsGlobal);
});

var global_config = window.G_CONFIG && JSON.parse(index.base64Decode(window.G_CONFIG));

var _ref = global_config || {};
var cookie_mac_key = _ref.cookie_mac_key;
var cookie_mac_path = _ref.cookie_mac_path;
var authorization_cookie_domain = _ref.authorization_cookie_domain;
var encode_gaea_id = _ref.encode_gaea_id;
var uc_uri = _ref.uc_uri;
var uc_http_uri = _ref.uc_http_uri;
var sys_time = _ref.sys_time;
var project_language = _ref.project_language;

var expires_hrreshold = 86400;

var uc_time = 604800;

var isCredentials = function () {
    return 'withCredentials' in new XMLHttpRequest();
}();

function cookie(key, value, options) {
    //write
    if (arguments.length > 1) {
        options = options || {};
        if (typeof options.expires === 'number') {
            var days = options.expires,
                t = options.expires = new Date();
            t.setMilliseconds(t.getMilliseconds() + days * 864e+5);
        }
        return document.cookie = [key, '=', encodeURIComponent(value), options.expires ? '; expires=' + options.expires.toUTCString() : '', options.path ? '; path=' + options.path : '', options.domain ? '; domain=' + options.domain : '', options.secure ? '; secure' : ''].join('');
    }
    //read
    var cookies = document.cookie ? document.cookie.split(';') : [],
        result = void 0,
        len = cookies.length;
    for (var i = 0; i < len; i++) {
        var parts = cookies[i].split('='),
            name = decodeURIComponent(parts.shift()).replace(/^\s*|\s*$/g, '');
        if (key == name) {
            result = decodeURIComponent(String(parts.join('')));
            break;
        }
    }
    return result;
}

function parseDate(date) {
    if (!date) return void 0;
    var time = new Date(date);
    if (!isNaN(time)) return time;
    return fromISO(date);
}

function fromISO(date) {
    var day = void 0,
        tz = void 0,
        rx = /^(\d{4}\-\d\d\-\d\d([tT][\d:\.]*)?)([zZ]|([+\-])(\d\d):?(\d\d))?$/,
        p = rx.exec(date) || [];
    if (p[1]) {
        day = p[1].split(/\D/);
        for (var i = 0, L = day.length; i < L; i++) {
            day[i] = parseInt(day[i], 10) || 0;
        }
        day[1] -= 1;
        day = new Date(Date.UTC.apply(Date, day));
        if (!day.getDate()) return NaN;
        if (p[5]) {
            tz = parseInt(p[5], 10) * 60;
            if (p[6]) tz += parseInt(p[6], 10);
            if (p[4] == '+') tz *= -1;
            if (tz) day.setUTCMinutes(day.getUTCMinutes() + tz);
        }
        return day;
    }
    return NaN;
}

function encodeRFC5987(str) {
    if ('string' != typeof str) return str;
    return str.replace(/['()]/g, escape).replace(/\*/g, '%2A').replace(/%(?:7C|60|5E)/g, unescape).replace(/\s+/g, '%20');
}

function path(uri) {
    if (typeof uri !== "string") return;
    var r = /^(?:(\w+:)\/\/)?(?:(\w+):?(\w+)?@)?([^:\/\?#]+)(?::(\d+))?([^\?#]+)?(?:\?([^#]+))?(?:#(\w+))?/,
        match = uri.match(r);
    if (!match) {
        return {
            protocol: location.protocol,
            host: location.host,
            port: location.port,
            path: uri,
            pathname: uri
        };
    }
    match[6] = match[6] || "";
    match[7] = encodeRFC5987(match[7]);
    return {
        protocol: match[1],
        host: match[5] ? match[4] + ':' + match[5] : match[4],
        port: match[5],
        path: match[7] ? match[6] + '?' + match[7] : match[6],
        pathname: match[6],
        qs: match[7]
    };
}
var _ = void 0;
var _$1 = _ = {
    cookie: cookie,
    parseDate: parseDate,
    path: path
};

var _typeof$1 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var utils$1 = createCommonjsModule(function (module, exports) {
    'use strict';

    var has = Object.prototype.hasOwnProperty;

    var hexTable = function () {
        var array = [];
        for (var i = 0; i < 256; ++i) {
            array.push('%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase());
        }

        return array;
    }();

    exports.arrayToObject = function (source, options) {
        var obj = options && options.plainObjects ? Object.create(null) : {};
        for (var i = 0; i < source.length; ++i) {
            if (typeof source[i] !== 'undefined') {
                obj[i] = source[i];
            }
        }

        return obj;
    };

    exports.merge = function (target, source, options) {
        if (!source) {
            return target;
        }

        if ((typeof source === 'undefined' ? 'undefined' : _typeof$1(source)) !== 'object') {
            if (Array.isArray(target)) {
                target.push(source);
            } else if ((typeof target === 'undefined' ? 'undefined' : _typeof$1(target)) === 'object') {
                if (options.plainObjects || options.allowPrototypes || !has.call(Object.prototype, source)) {
                    target[source] = true;
                }
            } else {
                return [target, source];
            }

            return target;
        }

        if ((typeof target === 'undefined' ? 'undefined' : _typeof$1(target)) !== 'object') {
            return [target].concat(source);
        }

        var mergeTarget = target;
        if (Array.isArray(target) && !Array.isArray(source)) {
            mergeTarget = exports.arrayToObject(target, options);
        }

        if (Array.isArray(target) && Array.isArray(source)) {
            source.forEach(function (item, i) {
                if (has.call(target, i)) {
                    if (target[i] && _typeof$1(target[i]) === 'object') {
                        target[i] = exports.merge(target[i], item, options);
                    } else {
                        target.push(item);
                    }
                } else {
                    target[i] = item;
                }
            });
            return target;
        }

        return Object.keys(source).reduce(function (acc, key) {
            var value = source[key];

            if (Object.prototype.hasOwnProperty.call(acc, key)) {
                acc[key] = exports.merge(acc[key], value, options);
            } else {
                acc[key] = value;
            }
            return acc;
        }, mergeTarget);
    };

    exports.decode = function (str) {
        try {
            return decodeURIComponent(str.replace(/\+/g, ' '));
        } catch (e) {
            return str;
        }
    };

    exports.encode = function (str) {
        // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
        // It has been adapted here for stricter adherence to RFC 3986
        if (str.length === 0) {
            return str;
        }

        var string = typeof str === 'string' ? str : String(str);

        var out = '';
        for (var i = 0; i < string.length; ++i) {
            var c = string.charCodeAt(i);

            if (c === 0x2D || // -
            c === 0x2E || // .
            c === 0x5F || // _
            c === 0x7E || // ~
            c >= 0x30 && c <= 0x39 || // 0-9
            c >= 0x41 && c <= 0x5A || // a-z
            c >= 0x61 && c <= 0x7A // A-Z
            ) {
                    out += string.charAt(i);
                    continue;
                }

            if (c < 0x80) {
                out = out + hexTable[c];
                continue;
            }

            if (c < 0x800) {
                out = out + (hexTable[0xC0 | c >> 6] + hexTable[0x80 | c & 0x3F]);
                continue;
            }

            if (c < 0xD800 || c >= 0xE000) {
                out = out + (hexTable[0xE0 | c >> 12] + hexTable[0x80 | c >> 6 & 0x3F] + hexTable[0x80 | c & 0x3F]);
                continue;
            }

            i += 1;
            c = 0x10000 + ((c & 0x3FF) << 10 | string.charCodeAt(i) & 0x3FF);
            out += hexTable[0xF0 | c >> 18] + hexTable[0x80 | c >> 12 & 0x3F] + hexTable[0x80 | c >> 6 & 0x3F] + hexTable[0x80 | c & 0x3F]; // eslint-disable-line max-len
        }

        return out;
    };

    exports.compact = function (obj, references) {
        if ((typeof obj === 'undefined' ? 'undefined' : _typeof$1(obj)) !== 'object' || obj === null) {
            return obj;
        }

        var refs = references || [];
        var lookup = refs.indexOf(obj);
        if (lookup !== -1) {
            return refs[lookup];
        }

        refs.push(obj);

        if (Array.isArray(obj)) {
            var compacted = [];

            for (var i = 0; i < obj.length; ++i) {
                if (obj[i] && _typeof$1(obj[i]) === 'object') {
                    compacted.push(exports.compact(obj[i], refs));
                } else if (typeof obj[i] !== 'undefined') {
                    compacted.push(obj[i]);
                }
            }

            return compacted;
        }

        var keys = Object.keys(obj);
        keys.forEach(function (key) {
            obj[key] = exports.compact(obj[key], refs);
        });

        return obj;
    };

    exports.isRegExp = function (obj) {
        return Object.prototype.toString.call(obj) === '[object RegExp]';
    };

    exports.isBuffer = function (obj) {
        if (obj === null || typeof obj === 'undefined') {
            return false;
        }

        return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
    };
});

var replace = String.prototype.replace;
var percentTwenties = /%20/g;

var formats$2 = {
    'default': 'RFC3986',
    formatters: {
        RFC1738: function RFC1738(value) {
            return replace.call(value, percentTwenties, '+');
        },
        RFC3986: function RFC3986(value) {
            return value;
        }
    },
    RFC1738: 'RFC1738',
    RFC3986: 'RFC3986'
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var utils = utils$1;
var formats$1 = formats$2;

var arrayPrefixGenerators = {
    brackets: function brackets(prefix) {
        // eslint-disable-line func-name-matching
        return prefix + '[]';
    },
    indices: function indices(prefix, key) {
        // eslint-disable-line func-name-matching
        return prefix + '[' + key + ']';
    },
    repeat: function repeat(prefix) {
        // eslint-disable-line func-name-matching
        return prefix;
    }
};

var toISO = Date.prototype.toISOString;

var defaults = {
    delimiter: '&',
    encode: true,
    encoder: utils.encode,
    encodeValuesOnly: false,
    serializeDate: function serializeDate(date) {
        // eslint-disable-line func-name-matching
        return toISO.call(date);
    },
    skipNulls: false,
    strictNullHandling: false
};

var stringify$1 = function stringify$1( // eslint-disable-line func-name-matching
object, prefix, generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, formatter, encodeValuesOnly) {
    var obj = object;
    if (typeof filter === 'function') {
        obj = filter(prefix, obj);
    } else if (obj instanceof Date) {
        obj = serializeDate(obj);
    } else if (obj === null) {
        if (strictNullHandling) {
            return encoder && !encodeValuesOnly ? encoder(prefix) : prefix;
        }

        obj = '';
    }

    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean' || utils.isBuffer(obj)) {
        if (encoder) {
            var keyValue = encodeValuesOnly ? prefix : encoder(prefix);
            return [formatter(keyValue) + '=' + formatter(encoder(obj))];
        }
        return [formatter(prefix) + '=' + formatter(String(obj))];
    }

    var values = [];

    if (typeof obj === 'undefined') {
        return values;
    }

    var objKeys;
    if (Array.isArray(filter)) {
        objKeys = filter;
    } else {
        var keys = Object.keys(obj);
        objKeys = sort ? keys.sort(sort) : keys;
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        if (Array.isArray(obj)) {
            values = values.concat(stringify$1(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, formatter, encodeValuesOnly));
        } else {
            values = values.concat(stringify$1(obj[key], prefix + (allowDots ? '.' + key : '[' + key + ']'), generateArrayPrefix, strictNullHandling, skipNulls, encoder, filter, sort, allowDots, serializeDate, formatter, encodeValuesOnly));
        }
    }

    return values;
};

var stringify_1 = function stringify_1(object, opts) {
    var obj = object;
    var options = opts || {};

    if (options.encoder !== null && options.encoder !== undefined && typeof options.encoder !== 'function') {
        throw new TypeError('Encoder has to be a function.');
    }

    var delimiter = typeof options.delimiter === 'undefined' ? defaults.delimiter : options.delimiter;
    var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults.strictNullHandling;
    var skipNulls = typeof options.skipNulls === 'boolean' ? options.skipNulls : defaults.skipNulls;
    var encode = typeof options.encode === 'boolean' ? options.encode : defaults.encode;
    var encoder = typeof options.encoder === 'function' ? options.encoder : defaults.encoder;
    var sort = typeof options.sort === 'function' ? options.sort : null;
    var allowDots = typeof options.allowDots === 'undefined' ? false : options.allowDots;
    var serializeDate = typeof options.serializeDate === 'function' ? options.serializeDate : defaults.serializeDate;
    var encodeValuesOnly = typeof options.encodeValuesOnly === 'boolean' ? options.encodeValuesOnly : defaults.encodeValuesOnly;
    if (typeof options.format === 'undefined') {
        options.format = formats$1['default'];
    } else if (!Object.prototype.hasOwnProperty.call(formats$1.formatters, options.format)) {
        throw new TypeError('Unknown format option provided.');
    }
    var formatter = formats$1.formatters[options.format];
    var objKeys;
    var filter;

    if (typeof options.filter === 'function') {
        filter = options.filter;
        obj = filter('', obj);
    } else if (Array.isArray(options.filter)) {
        filter = options.filter;
        objKeys = filter;
    }

    var keys = [];

    if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || obj === null) {
        return '';
    }

    var arrayFormat;
    if (options.arrayFormat in arrayPrefixGenerators) {
        arrayFormat = options.arrayFormat;
    } else if ('indices' in options) {
        arrayFormat = options.indices ? 'indices' : 'repeat';
    } else {
        arrayFormat = 'indices';
    }

    var generateArrayPrefix = arrayPrefixGenerators[arrayFormat];

    if (!objKeys) {
        objKeys = Object.keys(obj);
    }

    if (sort) {
        objKeys.sort(sort);
    }

    for (var i = 0; i < objKeys.length; ++i) {
        var key = objKeys[i];

        if (skipNulls && obj[key] === null) {
            continue;
        }

        keys = keys.concat(stringify$1(obj[key], key, generateArrayPrefix, strictNullHandling, skipNulls, encode ? encoder : null, filter, sort, allowDots, serializeDate, formatter, encodeValuesOnly));
    }

    return keys.join(delimiter);
};

var utils$3 = utils$1;

var has = Object.prototype.hasOwnProperty;

var defaults$1 = {
    allowDots: false,
    allowPrototypes: false,
    arrayLimit: 20,
    decoder: utils$3.decode,
    delimiter: '&',
    depth: 5,
    parameterLimit: 1000,
    plainObjects: false,
    strictNullHandling: false
};

var parseValues = function parseQueryStringValues(str, options) {
    var obj = {};
    var parts = str.split(options.delimiter, options.parameterLimit === Infinity ? undefined : options.parameterLimit);

    for (var i = 0; i < parts.length; ++i) {
        var part = parts[i];
        var pos = part.indexOf(']=') === -1 ? part.indexOf('=') : part.indexOf(']=') + 1;

        var key, val;
        if (pos === -1) {
            key = options.decoder(part);
            val = options.strictNullHandling ? null : '';
        } else {
            key = options.decoder(part.slice(0, pos));
            val = options.decoder(part.slice(pos + 1));
        }
        if (has.call(obj, key)) {
            obj[key] = [].concat(obj[key]).concat(val);
        } else {
            obj[key] = val;
        }
    }

    return obj;
};

var parseObject = function parseObjectRecursive(chain, val, options) {
    if (!chain.length) {
        return val;
    }

    var root = chain.shift();

    var obj;
    if (root === '[]') {
        obj = [];
        obj = obj.concat(parseObject(chain, val, options));
    } else {
        obj = options.plainObjects ? Object.create(null) : {};
        var cleanRoot = root.charAt(0) === '[' && root.charAt(root.length - 1) === ']' ? root.slice(1, -1) : root;
        var index = parseInt(cleanRoot, 10);
        if (!isNaN(index) && root !== cleanRoot && String(index) === cleanRoot && index >= 0 && options.parseArrays && index <= options.arrayLimit) {
            obj = [];
            obj[index] = parseObject(chain, val, options);
        } else {
            obj[cleanRoot] = parseObject(chain, val, options);
        }
    }

    return obj;
};

var parseKeys = function parseQueryStringKeys(givenKey, val, options) {
    if (!givenKey) {
        return;
    }

    // Transform dot notation to bracket notation
    var key = options.allowDots ? givenKey.replace(/\.([^.[]+)/g, '[$1]') : givenKey;

    // The regex chunks

    var brackets = /(\[[^[\]]*])/;
    var child = /(\[[^[\]]*])/g;

    // Get the parent

    var segment = brackets.exec(key);
    var parent = segment ? key.slice(0, segment.index) : key;

    // Stash the parent if it exists

    var keys = [];
    if (parent) {
        // If we aren't using plain objects, optionally prefix keys
        // that would overwrite object prototype properties
        if (!options.plainObjects && has.call(Object.prototype, parent)) {
            if (!options.allowPrototypes) {
                return;
            }
        }

        keys.push(parent);
    }

    // Loop through children appending to the array until we hit depth

    var i = 0;
    while ((segment = child.exec(key)) !== null && i < options.depth) {
        i += 1;
        if (!options.plainObjects && has.call(Object.prototype, segment[1].slice(1, -1))) {
            if (!options.allowPrototypes) {
                return;
            }
        }
        keys.push(segment[1]);
    }

    // If there's a remainder, just add whatever is left

    if (segment) {
        keys.push('[' + key.slice(segment.index) + ']');
    }

    return parseObject(keys, val, options);
};

var parse$1 = function parse$1(str, opts) {
    var options = opts || {};

    if (options.decoder !== null && options.decoder !== undefined && typeof options.decoder !== 'function') {
        throw new TypeError('Decoder has to be a function.');
    }

    options.delimiter = typeof options.delimiter === 'string' || utils$3.isRegExp(options.delimiter) ? options.delimiter : defaults$1.delimiter;
    options.depth = typeof options.depth === 'number' ? options.depth : defaults$1.depth;
    options.arrayLimit = typeof options.arrayLimit === 'number' ? options.arrayLimit : defaults$1.arrayLimit;
    options.parseArrays = options.parseArrays !== false;
    options.decoder = typeof options.decoder === 'function' ? options.decoder : defaults$1.decoder;
    options.allowDots = typeof options.allowDots === 'boolean' ? options.allowDots : defaults$1.allowDots;
    options.plainObjects = typeof options.plainObjects === 'boolean' ? options.plainObjects : defaults$1.plainObjects;
    options.allowPrototypes = typeof options.allowPrototypes === 'boolean' ? options.allowPrototypes : defaults$1.allowPrototypes;
    options.parameterLimit = typeof options.parameterLimit === 'number' ? options.parameterLimit : defaults$1.parameterLimit;
    options.strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : defaults$1.strictNullHandling;

    if (str === '' || str === null || typeof str === 'undefined') {
        return options.plainObjects ? Object.create(null) : {};
    }

    var tempObj = typeof str === 'string' ? parseValues(str, options) : str;
    var obj = options.plainObjects ? Object.create(null) : {};

    // Iterate over the keys and setup the new object

    var keys = Object.keys(tempObj);
    for (var i = 0; i < keys.length; ++i) {
        var key = keys[i];
        var newObj = parseKeys(key, tempObj[key], options);
        obj = utils$3.merge(obj, newObj, options);
    }

    return utils$3.compact(obj);
};

var stringify = stringify_1;
var parse = parse$1;
var formats = formats$2;

var index$1 = {
    formats: formats,
    parse: parse,
    stringify: stringify
};

function gmac() {
    if (!cookie_mac_key) return "";
    return _$1.cookie(cookie_mac_key);
}

var service_time = sys_time;

var DIFF_KEY = "diff_" + cookie_mac_key;

function umac() {
    var _mac = gmac();
    if (!_mac) return void 0;
    var json = void 0;
    try {
        json = JSON.parse(index.base64Decode(_mac));
    } catch (e) {}
    if (json) {
        var st = +_$1.parseDate(service_time),
            diff = _$1.cookie(DIFF_KEY);
        if (!diff || json.diff === void 0) {
            json.diff = timeDiff(st);
            _$1.cookie(DIFF_KEY, 1, {
                path: cookie_mac_path
            });
            json.server_time = st;
            _$1.cookie(cookie_mac_key, index.base64Encode(JSON.stringify(json)), {
                expires: _$1.parseDate(json.cookie_expires_at),
                path: cookie_mac_path,
                domain: authorization_cookie_domain
            });
        }
    }
    return json;
}

var arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

function rnd(min, max) {
    var range = max ? max - min : min,
        str = '',
        i = void 0,
        length = arr.length - 1;

    for (i = 0; i < range; i++) {
        str += arr[Math.round(Math.random() * length)];
    }
    return str;
}

function getNonce() {
    var diff = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    return +new Date() + diff + ':' + rnd(8);
}

function timeDiff(expires) {
    var now = new Date();
    expires = _$1.parseDate(expires);
    return expires - now;
}

function isExpiring(expires) {
    var diff = timeDiff(expires);
    return !!(diff > 0 && diff <= expires_hrreshold);
}

function getMacContent(method, url, host, nonce) {
    return [nonce, method, url, host, ''].join('\n');
}

function getMac(method, url, host, nonce, mac) {
    var content = getMacContent(method, url, host, nonce),
        shaObj = new sha('SHA-256', 'TEXT');
    shaObj.setHMACKey(mac.mac_key, "TEXT");
    shaObj.update(content);
    return shaObj.getHMAC('B64');
}

function getMacToken(method, url, host) {
    var result = void 0,
        mac = umac();
    if (mac) {
        if (isExpiring(mac.expires_at)) {
            renew(mac);
        }
        var nonce = getNonce(mac.diff);
        result = ['MAC id="' + mac.access_token + '"', 'nonce="' + nonce + '"', 'mac="' + getMac(method, url, host, nonce, mac) + '"'].join(',');
    }
    return result;
}

function removeQuery(query, rep) {
    for (var i = 0, length = rep.length; i < length; i++) {
        var name = rep[i],
            val = query[name];
        if (!val) continue;
        delete query[name];
    }
    return query;
}

function getMacTokenBySlash(uri) {
    var rep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['auth'];
    var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';
    var left = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '{';
    var right = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '}';

    var urlObj = _$1.path(uri);
    if (!urlObj.qs) return uri;
    urlObj.pathname = urlObj.pathname || '/';
    var query = removeQuery(index$1.parse(urlObj.qs), rep),
        search = index$1.stringify(query),
        $path = search ? urlObj.pathname + '?' + search : urlObj.pathname,
        $mac = getMacToken(method, '/', urlObj.host);
    if (!$mac) return uri;
    $mac = encodeURIComponent($mac);
    for (var i = 0, len = rep.length; i < len; i++) {
        var key = rep[i],
            reg = new RegExp(left + 's*' + key + 's*' + right, 'gi');
        urlObj.qs = urlObj.qs.replace(reg, $mac);
    }
    return urlObj.protocol + '//' + urlObj.host + urlObj.pathname + '?' + urlObj.qs;
}

function getMacTokenByHref(uri) {
    var rep = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['auth'];
    var method = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'GET';

    var urlObj = _$1.path(uri);
    var $mac = getMacToken(method, uri, urlObj.host);
    return $mac;
}

function renew(mac) {
    mac.expires_at = +_$1.parseDate(mac.expires_at) + uc_time - timeDiff(mac.expires_at);
    _$1.cookie(cookie_mac_key, index.base64Encode(JSON.stringify(mac)), {
        expires: _$1.parseDate(mac.cookie_expires_at),
        path: cookie_mac_path,
        domain: authorization_cookie_domain
    });
    var url = uc_uri + '/tokens/' + mac.refresh_token + '/actions/refresh?persist=1';
    if ("http:" == location.protocol && !isCredentials) url = uc_http_uri + '/ucsdk/proxy/refresh';
    var promise = $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        bodyProxy: false,
        contentType: 'application/json',
        data: JSON.stringify({
            refresh_token: mac.refresh_token
        })
    });
    promise.then(function (res) {
        res.cookie_expires_at = mac.cookie_expires_at;
        res.diff = timeDiff(res.server_time);
        mac = res;
    }, function () {
        var expires = +new Date() + timeDiff(mac.expires_at) - uc_time;
        mac.expires_at = expires;
    }).always(function () {
        _$1.cookie(cookie_mac_key, index.base64Encode(JSON.stringify(mac)), {
            expires: _$1.parseDate(mac.cookie_expires_at),
            path: cookie_mac_path,
            domain: authorization_cookie_domain
        });
    });
}

function getMacToB64(url) {
    var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "GET";

    var $path = _$1.path(url);
    method = method.toUpperCase();
    var token = getMacToken(method, $path.path, $path.host);
    if (!token) return token;
    return index.base64Encode(token);
}

var base64 = {
    encode: index.base64Encode,
    decode: index.base64Decode
};

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

(function (window) {
    var jqueryInstance = window.jQuery;
    if (!jqueryInstance) return;
    var $ = jqueryInstance;

    function contain(full, part) {
        return !!~full.indexOf(part);
    }

    function errorWrapper(code, param) {
        var _messages = {
            0: 'Unknown Error',
            1: 'No Transport',
            2: param + 'Method Not Allowed',
            3: param + 'Protocol Not Supported',
            4: 'URI source and target Protocol must be the same',
            5: 'No Data',
            6: 'Bad Data:' + param,
            7: 'Network Error',
            8: 'Timeout'
        };
        var text = _messages[code];
        return JSON.stringify({
            code: 'CORS/' + text.toUpperCase(),
            message: text,
            detail: null
        });
    }

    var _protocol = location.protocol,
        allowProtocol = ['http:', 'https:'],
        xdrReqs = [];
    umac();
    $.ajaxTransport('+*', function (opts, originalOpts, xhr) {
        var path = _$1.path(opts.url),
            pid = encode_gaea_id,
            method = opts.type.toUpperCase(),
            body = originalOpts.data;
        if (originalOpts.bodyProxy === void 0 && originalOpts.url.indexOf(window.ref_path) == -1) {
            originalOpts.bodyProxy = true;
            originalOpts.headers = _extends({
                Authorization: opts.crossDomain ? getMacToken(method, path.path, path.host) : void 0,
                'X-Gaea-Authorization': pid && 'GAEA id="' + pid + '"',
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Accept-Language": project_language
            }, originalOpts.headers || {});
        } else {
            originalOpts.bodyProxy = true;
            originalOpts.headers = _extends({
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Accept-Language": project_language
            }, originalOpts.headers || {});
        }
        if (opts.crossDomain && !isCredentials && window.XDomainRequest) {
            var xdr = new window.XDomainRequest(),
                reqProtocol = path.protocol,
                _computed = false,
                _error = function _error(code, param) {
                return {
                    send: function send(hdr, cb) {
                        cb(-1, errorWrapper(code, param));
                    },
                    abort: $.noop
                };
            },
                _null = function _null() {
                _computed = true;
                if (xdr) {
                    var index = $.inArray(xdrReqs, xdr);
                    if (!~index) return;
                    xdrReqs.splice(index, 1);
                    xdr.onload = null;
                    xdr.onerror = null;
                    xdr.ontimeout = null;
                    xdr.onprogress = null;
                }
            };
            if (!xdr) return _error(1);
            if (!~$.inArray(reqProtocol, allowProtocol)) return _error(4);
            if (_protocol != reqProtocol) return _error(3, reqProtocol);
            if (originalOpts.bodyProxy) {
                var zwj = contain(opts.url, '?') ? '&' : '?';
                originalOpts.url = opts.url + zwj + '$proxy=body';
                body = {
                    $method: method,
                    $headers: {
                        Host: path.host
                    }
                };
                $.each(originalOpts.headers || {}, function (key, value) {
                    if (value) body.$headers[key] = value;
                });
                if (method != "GET" && method != "header") {
                    if (typeof originalOpts.data == "string") {
                        body.$body = JSON.parse(originalOpts.data);
                    } else {
                        body.$body = originalOpts.data;
                    }
                }
                body = JSON.stringify(body);
            }
            xdr.timeout = opts.timeout || 60000;

            xdr.onprogress = $.noop;

            return {
                send: function send(hdr, cb) {
                    xdr.onload = function () {
                        if (_computed) return;
                        var data = {},
                            error = null,
                            accept = originalOpts.headers.Accept,
                            text = xdr.responseText,
                            headers = [],
                            $status = 200,
                            $statusText = 'OK';
                        if (contain(accept, 'json')) {
                            try {
                                var res = JSON.parse(text);
                                if (originalOpts.bodyProxy) {
                                    data.json = "";
                                    try {
                                        data.json = JSON.parse(res.$body);
                                    } catch (e) {}
                                    $.each(res.$headers, function (key, value) {
                                        headers[headers.length] = key + ': ' + value;
                                    });
                                    $status = res.$status;
                                    $statusText = res.$status_text;
                                } else {
                                    data.json = res;
                                }
                            } catch (e) {
                                error = e.message;
                            }
                            ///todo 处理xml
                        } else if (contain(accept, 'text')) {
                            data.text = text;
                        } else if (contain(accept, 'html')) {
                            data.html = text;
                        }
                        if (error) {
                            return _error(500, errorWrapper(6, error));
                        }
                        headers = $.extend(headers, ['Content-Type: ' + xdr.contentType, 'Content-Length: ' + text.length]);
                        _null();
                        cb($status, $statusText, data, headers.join('\r\n'));
                    };

                    xdr.onerror = function () {
                        if (_computed) return;
                        _null();
                        cb(500, errorWrapper(7));
                    };

                    xdr.ontimeout = function () {
                        if (_computed) return;
                        _null();
                        cb(500, errorWrapper(8));
                    };

                    xdr.open(originalOpts.bodyProxy ? 'POST' : method, originalOpts.url);

                    xdr.send(body);
                    xdrReqs.push(xdr);
                },
                abort: function abort() {
                    if (xdr && !_computed) {
                        _null();
                        xdr.abort();
                    }
                }
            };
        } else {
            $.each(originalOpts.headers, function (key, value) {
                if (value) {
                    xhr.setRequestHeader(key, value);
                }
            });
        }
    });
})(window);

exports.getMacToken = getMacToken;
exports.getMacToB64 = getMacToB64;
exports.getMacTokenByHref = getMacTokenByHref;
exports.getMacTokenBySlash = getMacTokenBySlash;
exports.base64 = base64;

}((this.Nova = this.Nova || {})));
