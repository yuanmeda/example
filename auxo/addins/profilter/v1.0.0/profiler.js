/// <reference path="jquery-1.6.2-vsdoc.js" />
var q = null; window.PR_SHOULD_USE_CONTINUATION = !0;
(function () {
    function L(a) {
        function m(a) { var f = a.charCodeAt(0); if (f !== 92) return f; var b = a.charAt(1); return (f = r[b]) ? f : "0" <= b && b <= "7" ? parseInt(a.substring(1), 8) : b === "u" || b === "x" ? parseInt(a.substring(2), 16) : a.charCodeAt(1) } function e(a) { if (a < 32) return (a < 16 ? "\\x0" : "\\x") + a.toString(16); a = String.fromCharCode(a); if (a === "\\" || a === "-" || a === "[" || a === "]") a = "\\" + a; return a } function h(a) {
            for (var f = a.substring(1, a.length - 1).match(/\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\[0-3][0-7]{0,2}|\\[0-7]{1,2}|\\[\S\s]|[^\\]/g), a =
            [], b = [], o = f[0] === "^", c = o ? 1 : 0, i = f.length; c < i; ++c) { var j = f[c]; if (/\\[bdsw]/i.test(j)) a.push(j); else { var j = m(j), d; c + 2 < i && "-" === f[c + 1] ? (d = m(f[c + 2]), c += 2) : d = j; b.push([j, d]); d < 65 || j > 122 || (d < 65 || j > 90 || b.push([Math.max(65, j) | 32, Math.min(d, 90) | 32]), d < 97 || j > 122 || b.push([Math.max(97, j) & -33, Math.min(d, 122) & -33])) } } b.sort(function (a, f) { return a[0] - f[0] || f[1] - a[1] }); f = []; j = [NaN, NaN]; for (c = 0; c < b.length; ++c) i = b[c], i[0] <= j[1] + 1 ? j[1] = Math.max(j[1], i[1]) : f.push(j = i); b = ["["]; o && b.push("^"); b.push.apply(b, a); for (c = 0; c <
            f.length; ++c) i = f[c], b.push(e(i[0])), i[1] > i[0] && (i[1] + 1 > i[0] && b.push("-"), b.push(e(i[1]))); b.push("]"); return b.join("")
        } function y(a) {
            for (var f = a.source.match(/\[(?:[^\\\]]|\\[\S\s])*]|\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\\d+|\\[^\dux]|\(\?[!:=]|[()^]|[^()[\\^]+/g), b = f.length, d = [], c = 0, i = 0; c < b; ++c) { var j = f[c]; j === "(" ? ++i : "\\" === j.charAt(0) && (j = +j.substring(1)) && j <= i && (d[j] = -1) } for (c = 1; c < d.length; ++c) -1 === d[c] && (d[c] = ++t); for (i = c = 0; c < b; ++c) j = f[c], j === "(" ? (++i, d[i] === void 0 && (f[c] = "(?:")) : "\\" === j.charAt(0) &&
            (j = +j.substring(1)) && j <= i && (f[c] = "\\" + d[i]); for (i = c = 0; c < b; ++c) "^" === f[c] && "^" !== f[c + 1] && (f[c] = ""); if (a.ignoreCase && s) for (c = 0; c < b; ++c) j = f[c], a = j.charAt(0), j.length >= 2 && a === "[" ? f[c] = h(j) : a !== "\\" && (f[c] = j.replace(/[A-Za-z]/g, function (a) { a = a.charCodeAt(0); return "[" + String.fromCharCode(a & -33, a | 32) + "]" })); return f.join("")
        } for (var t = 0, s = !1, l = !1, p = 0, d = a.length; p < d; ++p) { var g = a[p]; if (g.ignoreCase) l = !0; else if (/[a-z]/i.test(g.source.replace(/\\u[\da-f]{4}|\\x[\da-f]{2}|\\[^UXux]/gi, ""))) { s = !0; l = !1; break } } for (var r =
        { b: 8, t: 9, n: 10, v: 11, f: 12, r: 13 }, n = [], p = 0, d = a.length; p < d; ++p) { g = a[p]; if (g.global || g.multiline) throw Error("" + g); n.push("(?:" + y(g) + ")") } return RegExp(n.join("|"), l ? "gi" : "g")
    } function M(a) {
        function m(a) {
            switch (a.nodeType) {
                case 1: if (e.test(a.className)) break; for (var g = a.firstChild; g; g = g.nextSibling) m(g); g = a.nodeName; if ("BR" === g || "LI" === g) h[s] = "\n", t[s << 1] = y++, t[s++ << 1 | 1] = a; break; case 3: case 4: g = a.nodeValue, g.length && (g = p ? g.replace(/\r\n?/g, "\n") : g.replace(/[\t\n\r ]+/g, " "), h[s] = g, t[s << 1] = y, y += g.length,
                t[s++ << 1 | 1] = a)
            }
        } var e = /(?:^|\s)nocode(?:\s|$)/, h = [], y = 0, t = [], s = 0, l; a.currentStyle ? l = a.currentStyle.whiteSpace : window.getComputedStyle && (l = document.defaultView.getComputedStyle(a, q).getPropertyValue("white-space")); var p = l && "pre" === l.substring(0, 3); m(a); return { a: h.join("").replace(/\n$/, ""), c: t }
    } function B(a, m, e, h) { m && (a = { a: m, d: a }, e(a), h.push.apply(h, a.e)) } function x(a, m) {
        function e(a) {
            for (var l = a.d, p = [l, "pln"], d = 0, g = a.a.match(y) || [], r = {}, n = 0, z = g.length; n < z; ++n) {
                var f = g[n], b = r[f], o = void 0, c; if (typeof b ===
                "string") c = !1; else { var i = h[f.charAt(0)]; if (i) o = f.match(i[1]), b = i[0]; else { for (c = 0; c < t; ++c) if (i = m[c], o = f.match(i[1])) { b = i[0]; break } o || (b = "pln") } if ((c = b.length >= 5 && "lang-" === b.substring(0, 5)) && !(o && typeof o[1] === "string")) c = !1, b = "src"; c || (r[f] = b) } i = d; d += f.length; if (c) { c = o[1]; var j = f.indexOf(c), k = j + c.length; o[2] && (k = f.length - o[2].length, j = k - c.length); b = b.substring(5); B(l + i, f.substring(0, j), e, p); B(l + i + j, c, C(b, c), p); B(l + i + k, f.substring(k), e, p) } else p.push(l + i, b)
            } a.e = p
        } var h = {}, y; (function () {
            for (var e = a.concat(m),
            l = [], p = {}, d = 0, g = e.length; d < g; ++d) { var r = e[d], n = r[3]; if (n) for (var k = n.length; --k >= 0;) h[n.charAt(k)] = r; r = r[1]; n = "" + r; p.hasOwnProperty(n) || (l.push(r), p[n] = q) } l.push(/[\S\s]/); y = L(l)
        })(); var t = m.length; return e
    } function u(a) {
        var m = [], e = []; a.tripleQuotedStrings ? m.push(["str", /^(?:'''(?:[^'\\]|\\[\S\s]|''?(?=[^']))*(?:'''|$)|"""(?:[^"\\]|\\[\S\s]|""?(?=[^"]))*(?:"""|$)|'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$))/, q, "'\""]) : a.multiLineStrings ? m.push(["str", /^(?:'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$)|`(?:[^\\`]|\\[\S\s])*(?:`|$))/,
        q, "'\"`"]) : m.push(["str", /^(?:'(?:[^\n\r'\\]|\\.)*(?:'|$)|"(?:[^\n\r"\\]|\\.)*(?:"|$))/, q, "\"'"]); a.verbatimStrings && e.push(["str", /^@"(?:[^"]|"")*(?:"|$)/, q]); var h = a.hashComments; h && (a.cStyleComments ? (h > 1 ? m.push(["com", /^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/, q, "#"]) : m.push(["com", /^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\n\r]*)/, q, "#"]), e.push(["str", /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/, q])) : m.push(["com", /^#[^\n\r]*/,
        q, "#"])); a.cStyleComments && (e.push(["com", /^\/\/[^\n\r]*/, q]), e.push(["com", /^\/\*[\S\s]*?(?:\*\/|$)/, q])); a.regexLiterals && e.push(["lang-regex", /^(?:^^\.?|[!+-]|!=|!==|#|%|%=|&|&&|&&=|&=|\(|\*|\*=|\+=|,|-=|->|\/|\/=|:|::|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|[?@[^]|\^=|\^\^|\^\^=|{|\||\|=|\|\||\|\|=|~|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\s*(\/(?=[^*/])(?:[^/[\\]|\\[\S\s]|\[(?:[^\\\]]|\\[\S\s])*(?:]|$))+\/)/]); (h = a.types) && e.push(["typ", h]); a = ("" + a.keywords).replace(/^ | $/g,
        ""); a.length && e.push(["kwd", RegExp("^(?:" + a.replace(/[\s,]+/g, "|") + ")\\b"), q]); m.push(["pln", /^\s+/, q, " \r\n\t\xa0"]); e.push(["lit", /^@[$_a-z][\w$@]*/i, q], ["typ", /^(?:[@_]?[A-Z]+[a-z][\w$@]*|\w+_t\b)/, q], ["pln", /^[$_a-z][\w$@]*/i, q], ["lit", /^(?:0x[\da-f]+|(?:\d(?:_\d+)*\d*(?:\.\d*)?|\.\d\+)(?:e[+-]?\d+)?)[a-z]*/i, q, "0123456789"], ["pln", /^\\[\S\s]?/, q], ["pun", /^.[^\s\w"-$'./@\\`]*/, q]); return x(m, e)
    } function D(a, m) {
        function e(a) {
            switch (a.nodeType) {
                case 1: if (k.test(a.className)) break; if ("BR" === a.nodeName) h(a),
                a.parentNode && a.parentNode.removeChild(a); else for (a = a.firstChild; a; a = a.nextSibling) e(a); break; case 3: case 4: if (p) { var b = a.nodeValue, d = b.match(t); if (d) { var c = b.substring(0, d.index); a.nodeValue = c; (b = b.substring(d.index + d[0].length)) && a.parentNode.insertBefore(s.createTextNode(b), a.nextSibling); h(a); c || a.parentNode.removeChild(a) } }
            }
        } function h(a) {
            function b(a, d) { var e = d ? a.cloneNode(!1) : a, f = a.parentNode; if (f) { var f = b(f, 1), g = a.nextSibling; f.appendChild(e); for (var h = g; h; h = g) g = h.nextSibling, f.appendChild(h) } return e }
            for (; !a.nextSibling;) if (a = a.parentNode, !a) return; for (var a = b(a.nextSibling, 0), e; (e = a.parentNode) && e.nodeType === 1;) a = e; d.push(a)
        } var k = /(?:^|\s)nocode(?:\s|$)/, t = /\r\n?|\n/, s = a.ownerDocument, l; a.currentStyle ? l = a.currentStyle.whiteSpace : window.getComputedStyle && (l = s.defaultView.getComputedStyle(a, q).getPropertyValue("white-space")); var p = l && "pre" === l.substring(0, 3); for (l = s.createElement("LI") ; a.firstChild;) l.appendChild(a.firstChild); for (var d = [l], g = 0; g < d.length; ++g) e(d[g]); m === (m | 0) && d[0].setAttribute("value",
        m); var r = s.createElement("OL"); r.className = "linenums"; for (var n = Math.max(0, m - 1 | 0) || 0, g = 0, z = d.length; g < z; ++g) l = d[g], l.className = "L" + (g + n) % 10, l.firstChild || l.appendChild(s.createTextNode("\xa0")), r.appendChild(l); a.appendChild(r)
    } function k(a, m) { for (var e = m.length; --e >= 0;) { var h = m[e]; A.hasOwnProperty(h) ? window.console && console.warn("cannot override language handler %s", h) : A[h] = a } } function C(a, m) { if (!a || !A.hasOwnProperty(a)) a = /^\s*</.test(m) ? "default-markup" : "default-code"; return A[a] } function E(a) {
        var m =
        a.g; try {
            var e = M(a.h), h = e.a; a.a = h; a.c = e.c; a.d = 0; C(m, h)(a); var k = /\bMSIE\b/.test(navigator.userAgent), m = /\n/g, t = a.a, s = t.length, e = 0, l = a.c, p = l.length, h = 0, d = a.e, g = d.length, a = 0; d[g] = s; var r, n; for (n = r = 0; n < g;) d[n] !== d[n + 2] ? (d[r++] = d[n++], d[r++] = d[n++]) : n += 2; g = r; for (n = r = 0; n < g;) { for (var z = d[n], f = d[n + 1], b = n + 2; b + 2 <= g && d[b + 1] === f;) b += 2; d[r++] = z; d[r++] = f; n = b } for (d.length = r; h < p;) {
                var o = l[h + 2] || s, c = d[a + 2] || s, b = Math.min(o, c), i = l[h + 1], j; if (i.nodeType !== 1 && (j = t.substring(e, b))) {
                    k && (j = j.replace(m, "\r")); i.nodeValue =
                    j; var u = i.ownerDocument, v = u.createElement("SPAN"); v.className = d[a + 1]; var x = i.parentNode; x.replaceChild(v, i); v.appendChild(i); e < o && (l[h + 1] = i = u.createTextNode(t.substring(b, o)), x.insertBefore(i, v.nextSibling))
                } e = b; e >= o && (h += 2); e >= c && (a += 2)
            }
        } catch (w) { "console" in window && console.log(w && w.stack ? w.stack : w) }
    } var v = ["break,continue,do,else,for,if,return,while"], w = [[v, "auto,case,char,const,default,double,enum,extern,float,goto,int,long,register,short,signed,sizeof,static,struct,switch,typedef,union,unsigned,void,volatile"],
    "catch,class,delete,false,import,new,operator,private,protected,public,this,throw,true,try,typeof"], F = [w, "alignof,align_union,asm,axiom,bool,concept,concept_map,const_cast,constexpr,decltype,dynamic_cast,explicit,export,friend,inline,late_check,mutable,namespace,nullptr,reinterpret_cast,static_assert,static_cast,template,typeid,typename,using,virtual,where"], G = [w, "abstract,boolean,byte,extends,final,finally,implements,import,instanceof,null,native,package,strictfp,super,synchronized,throws,transient"],
    H = [G, "as,base,by,checked,decimal,delegate,descending,dynamic,event,fixed,foreach,from,group,implicit,in,interface,internal,into,is,lock,object,out,override,orderby,params,partial,readonly,ref,sbyte,sealed,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,var"], w = [w, "debugger,eval,export,function,get,null,set,undefined,var,with,Infinity,NaN"], I = [v, "and,as,assert,class,def,del,elif,except,exec,finally,from,global,import,in,is,lambda,nonlocal,not,or,pass,print,raise,try,with,yield,False,True,None"],
    J = [v, "alias,and,begin,case,class,def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo,rescue,retry,self,super,then,true,undef,unless,until,when,yield,BEGIN,END"], v = [v, "case,done,elif,esac,eval,fi,function,in,local,set,then,until"], K = /^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)/, N = /\S/, O = u({
        keywords: [F, H, w, "caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END" +
        I, J, v], hashComments: !0, cStyleComments: !0, multiLineStrings: !0, regexLiterals: !0
    }), A = {}; k(O, ["default-code"]); k(x([], [["pln", /^[^<?]+/], ["dec", /^<!\w[^>]*(?:>|$)/], ["com", /^<\!--[\S\s]*?(?:--\>|$)/], ["lang-", /^<\?([\S\s]+?)(?:\?>|$)/], ["lang-", /^<%([\S\s]+?)(?:%>|$)/], ["pun", /^(?:<[%?]|[%?]>)/], ["lang-", /^<xmp\b[^>]*>([\S\s]+?)<\/xmp\b[^>]*>/i], ["lang-js", /^<script\b[^>]*>([\S\s]*?)(<\/script\b[^>]*>)/i], ["lang-css", /^<style\b[^>]*>([\S\s]*?)(<\/style\b[^>]*>)/i], ["lang-in.tag", /^(<\/?[a-z][^<>]*>)/i]]),
    ["default-markup", "htm", "html", "mxml", "xhtml", "xml", "xsl"]); k(x([["pln", /^\s+/, q, " \t\r\n"], ["atv", /^(?:"[^"]*"?|'[^']*'?)/, q, "\"'"]], [["tag", /^^<\/?[a-z](?:[\w-.:]*\w)?|\/?>$/i], ["atn", /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i], ["lang-uq.val", /^=\s*([^\s"'>]*(?:[^\s"'/>]|\/(?=\s)))/], ["pun", /^[/<->]+/], ["lang-js", /^on\w+\s*=\s*"([^"]+)"/i], ["lang-js", /^on\w+\s*=\s*'([^']+)'/i], ["lang-js", /^on\w+\s*=\s*([^\s"'>]+)/i], ["lang-css", /^style\s*=\s*"([^"]+)"/i], ["lang-css", /^style\s*=\s*'([^']+)'/i], ["lang-css",
    /^style\s*=\s*([^\s"'>]+)/i]]), ["in.tag"]); k(x([], [["atv", /^[\S\s]+/]]), ["uq.val"]); k(u({ keywords: F, hashComments: !0, cStyleComments: !0, types: K }), ["c", "cc", "cpp", "cxx", "cyc", "m"]); k(u({ keywords: "null,true,false" }), ["json"]); k(u({ keywords: H, hashComments: !0, cStyleComments: !0, verbatimStrings: !0, types: K }), ["cs"]); k(u({ keywords: G, cStyleComments: !0 }), ["java"]); k(u({ keywords: v, hashComments: !0, multiLineStrings: !0 }), ["bsh", "csh", "sh"]); k(u({ keywords: I, hashComments: !0, multiLineStrings: !0, tripleQuotedStrings: !0 }),
    ["cv", "py"]); k(u({ keywords: "caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END", hashComments: !0, multiLineStrings: !0, regexLiterals: !0 }), ["perl", "pl", "pm"]); k(u({ keywords: J, hashComments: !0, multiLineStrings: !0, regexLiterals: !0 }), ["rb"]); k(u({ keywords: w, cStyleComments: !0, regexLiterals: !0 }), ["js"]); k(u({
        keywords: "all,and,by,catch,class,else,extends,false,finally,for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then,true,try,unless,until,when,while,yes",
        hashComments: 3, cStyleComments: !0, multilineStrings: !0, tripleQuotedStrings: !0, regexLiterals: !0
    }), ["coffee"]); k(x([], [["str", /^[\S\s]+/]]), ["regex"]); window.prettyPrintOne = function (a, m, e) { var h = document.createElement("PRE"); h.innerHTML = a; e && D(h, e); E({ g: m, i: e, h: h }); return h.innerHTML }; window.prettyPrint = function (a) {
        function m() {
            for (var e = window.PR_SHOULD_USE_CONTINUATION ? l.now() + 250 : Infinity; p < h.length && l.now() < e; p++) {
                var n = h[p], k = n.className; if (k.indexOf("prettyprint") >= 0) {
                    var k = k.match(g), f, b; if (b =
                    !k) { b = n; for (var o = void 0, c = b.firstChild; c; c = c.nextSibling) var i = c.nodeType, o = i === 1 ? o ? b : c : i === 3 ? N.test(c.nodeValue) ? b : o : o; b = (f = o === b ? void 0 : o) && "CODE" === f.tagName } b && (k = f.className.match(g)); k && (k = k[1]); b = !1; for (o = n.parentNode; o; o = o.parentNode) if ((o.tagName === "pre" || o.tagName === "code" || o.tagName === "xmp") && o.className && o.className.indexOf("prettyprint") >= 0) { b = !0; break } b || ((b = (b = n.className.match(/\blinenums\b(?::(\d+))?/)) ? b[1] && b[1].length ? +b[1] : !0 : !1) && D(n, b), d = { g: k, h: n, i: b }, E(d))
                }
            } p < h.length ? setTimeout(m,
            250) : a && a()
        } for (var e = [document.getElementsByTagName("pre"), document.getElementsByTagName("code"), document.getElementsByTagName("xmp")], h = [], k = 0; k < e.length; ++k) for (var t = 0, s = e[k].length; t < s; ++t) h.push(e[k][t]); var e = q, l = Date; l.now || (l = { now: function () { return +new Date } }); var p = 0, d, g = /\blang(?:uage)?-([\w.]+)(?!\S)/; m()
    }; window.PR = {
        createSimpleLexer: x, registerLangHandler: k, sourceDecorator: u, PR_ATTRIB_NAME: "atn", PR_ATTRIB_VALUE: "atv", PR_COMMENT: "com", PR_DECLARATION: "dec", PR_KEYWORD: "kwd", PR_LITERAL: "lit",
        PR_NOCODE: "nocode", PR_PLAIN: "pln", PR_PUNCTUATION: "pun", PR_SOURCE: "src", PR_STRING: "str", PR_TAG: "tag", PR_TYPE: "typ"
    }
})();

///通用的JS扩展方法
//克隆对象
Date.prototype.Clone = function () {
    var objClone;
    if (this.constructor == Object) {
        objClone = new this.constructor();
    } else {
        objClone = new this.constructor(this.valueOf());
    }
    for (var key in this) {
        if (objClone[key] != this[key]) {
            if (typeof (this[key]) == 'object') {
                objClone[key] = this[key].Clone();
            } else {
                objClone[key] = this[key];
            }
        }
    }
    objClone.toString = this.toString;
    objClone.valueOf = this.valueOf;
    return objClone;
}
//转换json格式的日期
String.prototype.ConvertToDate = function () {
    var date = new Date(parseInt(this.replace("/Date(", "").replace(")/", ""), 10));
    return date;
};
/*
*将目标字符串转换成日期对象
*@param {string} source 目标字符串
*
*对于目标字符串，下面这些规则决定了 parse 方法能够成功地解析： 
*短日期可以使用“/”或“-”作为日期分隔符，但是必须用月/日/年的格式来表示，例如"7/20/96"。
*以 "July 10 1995" 形式表示的长日期中的年、月、日可以按任何顺序排列，年份值可以用 2 位数字表示也可以用 4 位数字表示。如果使用 2 位数字来表示年份，那么该年份必须大于或等于 70。 
*括号中的任何文本都被视为注释。这些括号可以嵌套使用。 
*逗号和空格被视为分隔符。允许使用多个分隔符。
*月和日的名称必须具有两个或两个以上的字符。如果两个字符所组成的名称不是独一无二的，那么该名称就被解析成最后一个符合条件的月或日。例如，"Ju" 被解释为七月而不是六月。 
*在所提供的日期中，如果所指定的星期几的值与按照该日期中剩余部分所确定的星期几的值不符合，那么该指定值就会被忽略。例如，尽管 1996 年 11 月 9 日实际上是星期五，"Tuesday November 9 1996" 也还是可以被接受并进行解析的。但是结果 date 对象中包含的是 "Friday November 9 1996"。 
*JScript 处理所有的标准时区，以及全球标准时间 (UTC) 和格林威治标准时间 (GMT)。
*小时、分钟、和秒钟之间用冒号分隔，尽管不是这三项都需要指明。"10:"、"10:11"、和 "10:11:12" 都是有效的。 
*如果使用 24 小时计时的时钟，那么为中午 12 点之后的时间指定 "PM" 是错误的。例如 "23:15 PM" 就是错误的。
*包含无效日期的字符串是错误的。例如，一个包含有两个年份或两个月份的字符串就是错误的。
*/
String.prototype.ToDate = function () {
    //    var source = this;
    //    var reg = new RegExp("^\\d+(\\-|\\/)\\d+(\\-|\\/)\\d+\x24");
    //    if ('string' == typeof source) {
    //        if (reg.test(source) || isNaN(Date.parse(source))) {
    //            var d = source.split(/ |T/);
    //            var d1 = d.length > 1
    //                    ? d[1].split(/[^\d]/)
    //                    : [0, 0, 0];
    //            var d0 = d[0].split(/[^\d]/);
    //            return new Date(d0[0] - 0, d0[1] - 1, d0[2] - 0, d1[0] - 0, d1[1] - 0, d1[2] - 0);
    //        } else {
    //            return new Date(source);
    //        }
    //    }
    //    return new Date();
    var date = new Date(parseInt(this.replace("/Date(", "").replace(")/", ""), 10));
    return date;
};
//将指定的毫秒数加到此实例的值上
Date.prototype.AddMilliseconds = function (value) {
    var _this = this.Clone();
    var millisecond = _this.getMilliseconds();
    _this.setMilliseconds(millisecond + value);
    return _this;
};
//将指定的秒数加到此实例的值上
Date.prototype.AddSeconds = function (value) {
    var _this = this.Clone();
    var second = _this.getSeconds();
    _this.setSeconds(second + value);
    return _this;
};
//将指定的分钟数加到此实例的值上
Date.prototype.AddMinutes = function (value) {
    var _this = this.Clone();
    var minute = _this.getMinutes();
    _this.setMinutes(minute + value);
    return _this;
};
//将指定的小时数加到此实例的值上
Date.prototype.AddHours = function (value) {
    var _this = this.Clone();
    var hour = _this.getHours();
    _this.setHours(hour + value);
    return _this;
};
//将指定的天数加到此实例的值上
Date.prototype.AddDays = function (value) {
    var _this = this.Clone();
    var date = _this.getDate();
    _this.setDate(date + value);
    return _this;
};
//将指定的星期数加到此实例的值上
Date.prototype.AddWeeks = function (value) {
    return this.AddDays(value * 7);
};
//将指定的月份数加到此实例的值上
Date.prototype.AddMonths = function (value) {
    var _this = this.Clone();
    var month = _this.getMonth();
    _this.setMonth(month + value);
    return _this;
};
//将指定的年份数加到此实例的值上
Date.prototype.AddYears = function (value) {
    var _this = this.Clone();
    var year = _this.getFullYear();
    _this.setFullYear(year + value);
    return _this;
};
/**对目标日期对象进行格式化
*@param {string} pattern 日期格式化规则
* hh: 带 0 补齐的两位 12 进制时表示
* h: 不带 0 补齐的 12 进制时表示
* HH: 带 0 补齐的两位 24 进制时表示
* H: 不带 0 补齐的 24 进制时表示
* mm: 带 0 补齐两位分表示
* m: 不带 0 补齐分表示
* ss: 带 0 补齐两位秒表示
* s: 不带 0 补齐秒表示
* yyyy: 带 0 补齐的四位年表示
* yy: 带 0 补齐的两位年表示
* MM: 带 0 补齐的两位月表示
* M: 不带 0 补齐的月表示
* dd: 带 0 补齐的两位日表示
* d: 不带 0 补齐的日表示
*/
Date.prototype.Format = function (pattern) {
    var source = this;
    if ('string' != typeof pattern) {
        return source.toString();
    }
    function replacer(patternPart, result) {
        pattern = pattern.replace(patternPart, result);
    }
    var year = source.getFullYear(),
        month = source.getMonth() + 1,
        date2 = source.getDate(),
        hours = source.getHours(),
        minutes = source.getMinutes(),
        seconds = source.getSeconds();
    replacer(/yyyy/g, year.Pad(4));
    replacer(/yy/g, parseInt(year.toString().slice(2)).Pad(2));
    replacer(/MM/g, month.Pad(2));
    replacer(/M/g, month);
    replacer(/dd/g, date2.Pad(2));
    replacer(/d/g, date2);
    replacer(/HH/g, hours.Pad(2));
    replacer(/H/g, hours);
    replacer(/hh/g, (hours % 12).Pad(2));
    replacer(/h/g, hours % 12);
    replacer(/mm/g, minutes.Pad(2));
    replacer(/m/g, minutes);
    replacer(/ss/g, seconds.Pad(2));
    replacer(/s/g, seconds);
    return pattern;
}

//获取时间差，返回单位是毫秒数
Date.prototype.GetDiffTime = function (value) {
    var paramA = parseInt(this.getTime());
    var paramB = parseInt(value.getTime());
    return Math.abs(paramA - paramB);
}
//获取时间差，返回单位是毫秒数,带符号
Date.prototype.GetDiffTimeSign = function (value) {
    var paramA = parseInt(this.getTime());
    var paramB = parseInt(value.getTime());
    return paramA - paramB;
}

//获取时间差，返回单位是秒数
Date.prototype.GetDiffSecond = function (value) {
    var diffMilliseconds = this.GetDiffTime(value);
    return parseInt(diffMilliseconds / 1000);
}
//在数组中查找单个元素
//示例：knowledgePointList.find(function(en) { return en.KnowledgeCatelogInfoEN.Id == item; });
Array.prototype.Find = function (predicate) {
    var array = this;
    var result = null;
    for (var index = 0, length = array.length; index < length; index++) {
        if (predicate(array[index])) {
            result = array[index];
            break;
        }
    }
    return result;
};
//在数组中查找某个元素的属性值
//示例：knowledgePointList.select(function(en){ return en.KnowledgeCatelogInfoEN.Id.toString(); });
//示例：knowledgePointList.select(function(en, index){ if(index % 2 == 0) return "0"; else return "1"; });
Array.prototype.Select = function (func) {
    var array = this;
    var retsultArray = [];
    for (var index = 0, length = array.length; index < length; index++) {
        retsultArray[retsultArray.length] = func(array[index], index);
    }
    return retsultArray;
}
//在数组中查找多个元素
//示例：knowledgePointList.where(function(en) { return en.KnowledgeCatelogInfoEN.Id == 778; });
//示例：knowledgePointList.where(function(en, index) { return index % 2 == 0; });
Array.prototype.Where = function (func) {
    var array = this;
    var retsultArray = [];
    for (var index = 0, length = array.length; index < length; index++) {
        if (func(array[index], index)) {
            retsultArray[retsultArray.length] = array[index];
        }
    }
    return retsultArray;
}
//在数组中查找符合条件的元素个数
//示例：knowledgePointList.count(function(en, index){ return index % 2 == 0; })
Array.prototype.Count = function (func) {
    if (func == null)
        return this.length;
    else
        return this.Where(func).length;
}
//将数字以时间格式显示
Number.prototype.ToTimeFormat = function () {
    var number = this;
    var result = '';
    var hours = parseInt(number / 3600);
    var minutes = parseInt((number % 3600) / 60);
    var seconds = number % 60;
    if (hours > 0) {
        return hours + '小时' + minutes + '分' + seconds + '秒';
    } else if (minutes > 0) {
        return minutes + '分' + seconds + '秒';
    } else {
        return seconds + '秒';
    }
};

//对目标数字进行0补齐处理
//@param {number} [length] 需要输出的长度
Number.prototype.Pad = function (length) {
    var source = this, pre = "", negative = (source < 0), string = String(Math.abs(this));
    if (string.length < length) {
        pre = (new Array(length - string.length + 1)).join('0');
    }
    return (negative ? "-" : "") + pre + string;
};
//为目标数字添加逗号分隔
//@param {number} [length] 两次逗号之间的数字位数，默认为3位
Number.prototype.Comma = function (length) {
    var source = this;
    if (!length || length < 1) {
        length = 3;
    }
    source = String(source).split(".");
    source[0] = source[0].replace(new RegExp('(\\d)(?=(\\d{' + length + '})+$)', 'ig'), "$1,");
    return source.join(".");
};
//生成随机整数
//@param 	{number} min 	随机整数的最小值
//@param 	{number} max 	随机整数的最大值
//@return 	{number} 		生成的随机整数
Number.RandomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
//简单加密
function SimpleEncrypt(value) {
    var array = [], length = value.length;
    for (var i = 0; i < length; i++) {
        array.push(String.fromCharCode(value.charCodeAt(i) + 1));
    }
    return array.join('');
}
//简单解密
function SimpleDecrypt(value) {
    var array = [], length = value.length;
    for (var i = 0; i < length; i++) {
        array.push(String.fromCharCode(value.charCodeAt(i) - 1));
    }
    return array.join('');
}
//StringBuilder扩展
(function () {
    StringBuilder = function (initialText) {
        this._parts = (typeof (initialText) !== 'undefined' && initialText !== null && initialText !== '') ?
            [initialText.toString()] : [];
        this._value = {};
        this._len = 0;
    }
    StringBuilder.prototype = {
        append: function (text) {
            this._parts[this._parts.length] = text;
        },
        appendLine: function (text) {
            this._parts[this._parts.length] =
                ((typeof (text) === 'undefined') || (text === null) || (text === '')) ?
                '\r\n' : text + '\r\n';
        },
        clear: function () {
            this._parts = [];
            this._value = {};
            this._len = 0;
        },
        isEmpty: function isEmpty() {
            if (this._parts.length === 0) return true;
            return this.toString() === '';
        },
        toString: function (separator) {
            separator = separator || '';
            var parts = this._parts;
            if (this._len !== parts.length) {
                this._value = {};
                this._len = parts.length;
            }
            var val = this._value;
            if (typeof (val[separator]) === 'undefined') {
                if (separator !== '') {
                    for (var i = 0; i < parts.length;) {
                        if ((typeof (parts[i]) === 'undefined') || (parts[i] === '') || (parts[i] === null)) {
                            parts.splice(i, 1);
                        }
                        else {
                            i++;
                        }
                    }
                }
                val[separator] = this._parts.join(separator);
            }
            return val[separator];
        }
    }

    //移交对象给window
    if (typeof window.StringBuilder === 'undefined' || window.StringBuilder === null) {
        window.StringBuilder = new StringBuilder();
    }
})();
String.format = function (format, args) {
    var result = '', useLocale = false;
    format = arguments[0];
    for (var i = 0; ;) {
        var open = format.indexOf('{', i);
        var close = format.indexOf('}', i);
        if ((open < 0) && (close < 0)) {
            result += format.slice(i);
            break;
        }
        if ((close > 0) && ((close < open) || (open < 0))) {
            if (format.charAt(close + 1) !== '}') {
                alert('The format string contains an unmatched opening or closing brace.');
            }
            result += format.slice(i, close + 1);
            i = close + 2;
            continue;
        }
        result += format.slice(i, open);
        i = open + 1;
        if (format.charAt(i) === '{') {
            result += '{';
            i++;
            continue;
        }
        if (close < 0)
            continue; //alert('The format string contains an unmatched opening or closing brace.');
        var brace = format.substring(i, close);
        var colonIndex = brace.indexOf(':');
        var argNumber = parseInt((colonIndex < 0) ? brace : brace.substring(0, colonIndex), 10) + 1;
        if (isNaN(argNumber)) {
            argNumber = -1;
            //alert('The format string is invalid.');
        }
        var argFormat = (colonIndex < 0) ? '' : brace.substring(colonIndex + 1);
        var arg = arguments[argNumber];
        if (typeof (arg) === "undefined" || arg === null) {
            arg = '';
        }
        if (arg.toFormattedString) {
            result += arg.toFormattedString(argFormat);
        }
        else if (useLocale && arg.localeFormat) {
            result += arg.localeFormat(argFormat);
        }
        else if (arg.format) {
            result += arg.format(argFormat);
        }
        else
            result += arg.toString();
        i = close + 1;
    }
    return result;
}
String.prototype.format = function (args) {
    return String.format(this, args);
};

Array.prototype.pushFormat = function () {
    this.push(String.format.apply(this, arguments));
}


PR['registerLangHandler'](
    PR['createSimpleLexer'](
        [
         // Whitespace
         [PR['PR_PLAIN'], /^[\t\n\r \xA0]+/, null, '\t\n\r \xA0'],
         // A double or single quoted, possibly multi-line, string.
         [PR['PR_STRING'], /^(?:"(?:[^\"\\]|\\.)*"|'(?:[^\'\\]|\\.)*')/, null,
          '"\'']
        ],
        [
         // A comment is either a line comment that starts with two dashes, or
         // two dashes preceding a long bracketed block.
         [PR['PR_COMMENT'], /^(?:--[^\r\n]*|\/\*[\s\S]*?(?:\*\/|$))/],
         [PR['PR_KEYWORD'], /^(?:ADD|ALL|ALTER|AND|ANY|AS|ASC|AUTHORIZATION|BACKUP|BEGIN|BETWEEN|BREAK|BROWSE|BULK|BY|CASCADE|CASE|CHECK|CHECKPOINT|CLOSE|CLUSTERED|COALESCE|COLLATE|COLUMN|COMMIT|COMPUTE|CONSTRAINT|CONTAINS|CONTAINSTABLE|CONTINUE|CONVERT|CREATE|CROSS|CURRENT|CURRENT_DATE|CURRENT_TIME|CURRENT_TIMESTAMP|CURRENT_USER|CURSOR|DATABASE|DBCC|DEALLOCATE|DECLARE|DEFAULT|DELETE|DENY|DESC|DISK|DISTINCT|DISTRIBUTED|DOUBLE|DROP|DUMMY|DUMP|ELSE|END|ERRLVL|ESCAPE|EXCEPT|EXEC|EXECUTE|EXISTS|EXIT|FETCH|FILE|FILLFACTOR|FOR|FOREIGN|FREETEXT|FREETEXTTABLE|FROM|FULL|FUNCTION|GOTO|GRANT|GROUP|HAVING|HOLDLOCK|IDENTITY|IDENTITYCOL|IDENTITY_INSERT|IF|IN|INDEX|INNER|INSERT|INTERSECT|INTO|IS|JOIN|KEY|KILL|LEFT|LIKE|LINENO|LOAD|MATCH|MERGE|NATIONAL|NOCHECK|NONCLUSTERED|NOT|NULL|NULLIF|OF|OFF|OFFSETS|ON|OPEN|OPENDATASOURCE|OPENQUERY|OPENROWSET|OPENXML|OPTION|OR|ORDER|OUTER|OVER|PERCENT|PLAN|PRECISION|PRIMARY|PRINT|PROC|PROCEDURE|PUBLIC|RAISERROR|READ|READTEXT|RECONFIGURE|REFERENCES|REPLICATION|RESTORE|RESTRICT|RETURN|REVOKE|RIGHT|ROLLBACK|ROWCOUNT|ROWGUIDCOL|RULE|SAVE|SCHEMA|SELECT|SESSION_USER|SET|SETUSER|SHUTDOWN|SOME|STATISTICS|SYSTEM_USER|TABLE|TEXTSIZE|THEN|TO|TOP|TRAN|TRANSACTION|TRIGGER|TRUNCATE|TSEQUAL|UNION|UNIQUE|UPDATE|UPDATETEXT|USE|USER|USING|VALUES|VARYING|VIEW|WAITFOR|WHEN|WHERE|WHILE|WITH|WRITETEXT)(?=[^\w-]|$)/i, null],
         // A number is a hex integer literal, a decimal real literal, or in
         // scientific notation.
         [PR['PR_LITERAL'],
          /^[+-]?(?:0x[\da-f]+|(?:(?:\.\d+|\d+(?:\.\d*)?)(?:e[+\-]?\d+)?))/i],
         // An identifier
         [PR['PR_PLAIN'], /^[a-z_][\w-]*/i],
         // A run of punctuation
         [PR['PR_PUNCTUATION'], /^[^\w\t\n\r \xA0\"\'][^\w\t\n\r \xA0+\-\"\']*/]
        ]),
    ['sql']);

$profiler =
{
    _items: [],
    init: function () {
        this._inited = true;
        var e = $('<div class="profiler-results"></div>').appendTo(document.body);
        this._element = e;

        for (var i = 0; i < this._items.length; i++)
            this._createItem(this._items[i]);
        $(document).click($.proxy(this._onBodyClick, this));
    },
    add: function (item) {
        this._items.push(item);
        item.index = this._items.length - 1;
        if (this._inited)
            this._createItem(item);
    },
    ajaxDataFilter: function (data, type) {
        var content = data;
        if (typeof content != 'undefined' && content != null && typeof content.indexOf != 'undefined') {
            var start = content.indexOf("/* --tracebeging--");
            var end = content.indexOf("--traceend-- */");
            if (start > -1 && end > -1) {
                var json = content.substring(start + 18, end);
                var item = $.parseJSON(json);
                $profiler.add(item);

                return content.substr(0, start);
            }
        }

        return content;
    },
    enabled: function () {
        return window.__trace || location.href.indexOf("__trace") > -1;
    },
    _onBodyClick: function (evt) {
        var e = $(evt.target).closest(".profiler-results");
        if (e.length == 0)
            $(".profiler-popup").hide();
    },
    _onProfilerButtonClick: function (evt) {
        var e = $(evt.target).closest(".profiler-result");
        var index = e.data("index");
        this._element.find(".profiler-button:eq(" + this._currentIndex + ")").removeClass("profiler-button-active");
        this._element.find(".profiler-popup:eq(" + this._currentIndex + ")").hide();

        if (this._currentIndex != index) {
            this._currentIndex = index;
            e.find(".profiler-button").addClass("profiler-button-active");
            e.find(".profiler-popup").show();
        }
        else {
            this._currentIndex = -1;
        }
    },
    _onProfilerTabButtonClick: function (evt) {
        var e = $(evt.target), type = e.data("type");
        var p = e.closest(".profiler-result");
        p.find(".profiler-tabbutton").removeClass("profiler-tabbutton-active");
        e.addClass("profiler-tabbutton-active");

        p.find(".profiler-tabbody").hide();
        p.find(".profiler-tabbody-" + type).show();
    },
    _onProfilerDTClick: function (evt) {
        $(evt.target).closest("dt").next().toggle();
    },
    _onProfilerTraceTypeClick: function (evt) {
        var e = $(evt.target), type = e.data("type"), p = e.closest(".profiler-tabbody-trace");
        var active = e.hasClass("profiler-trace-type-active");
        e.toggleClass("profiler-trace-type-active");

        var m = p.find('dt:[data-type="' + type + '"]');
        m.toggle(!active);
        if (active)
            m.next().hide();
    },
    _onProfilerItemClick: function (evt) {
        var e = $(evt.target), p = e.closest("div");
        p.next().toggle();
    },
    _getLang: function (type) {
        switch (type) {
            case "sql":
                return "prettyprint lang-sql";
            case "mongo":
            case "platform":
                return "prettyprint lang-js";
            default:
                return "";
        }
    },
    _createItem: function (item) {
        var types = {};
        for (var i = 0; i < item.Traces.length; i++) {
            var trace = item.Traces[i];
            if (typeof (types[trace.Type]) == "undefined")
                types[trace.Type] = 1;
            else
                types[trace.Type] += 1;
        }
        var html = [];
        html.push('<span class="profiler-button">' + item.Duration + ' ms</span>');
        html.push('<div class="profiler-popup">');
        html.push('<div class="profiler-info">' + item.RequestTime.ConvertToDate().Format("yyyy-MM-dd HH:mm:ss") + '</div>');
        html.push('<div class="profiler-info">' + item.Url + '</div>');

        html.push('<div class="profiler-tabs">');
        html.push('<span class="profiler-tabbutton profiler-tabbutton-active" data-type="trace">Trace (' + item.Traces.length + ')</span>');
        html.push('<span class="profiler-tabbutton" data-type="watch">Watch (' + item.Watches.length + ')</span>');
        html.push('<span class="profiler-tabbutton" data-type="request">Request</span>');
        html.push('</div>');

        html.push('<div class="profiler-tabbody profiler-tabbody-trace">');

        html.push('<div class="profiler-trace-types">')
        for (var t in types)
            html.push('<span data-type="' + t + '" class="">' + t + '(' + types[t] + ')</span>');
        html.push('</div>');

        html.push('<dl>');
        for (var i = 0; i < item.Traces.length; i++) {
            var ti = item.Traces[i];
            html.push('<dt style="display:none;" data-type="' + ti.Type + '"><strong>' + ti.Type + '</strong><pre class="' + this._getLang(ti.Type) + '">' + ti.Title + '</pre></dt>');
            html.push('<dd><pre>' + ti.Content + '</pre></dd>');
        }
        html.push('</dl>');
        html.push('</div>');

        html.push('<div class="profiler-tabbody profiler-tabbody-watch">');
        html.push('<div class="profiler-header"><strong>时间线</strong><span style="padding-left:12px;">' + item.Duration + (item.CpuDuration?'/' + item.CpuDuration:'') + '</span></div>');
        for (var i = 0; i < item.Watches.length; i++) {
            this._createWatchItem(html, item.Watches[i], 0);
        }
        html.push('</div>');

        html.push('<div class="profiler-tabbody profiler-tabbody-request">');
        html.push(item.Request.Url + '<br/>');
        html.push(item.Request.Method + '<br/><br/>');
        html.push(item.Request.Header.replace(new RegExp('\r\n', "gm"), '<br/>'));
        html.push('<br/>');
        html.push(item.Request.Body);
        html.push('</div>');

        html.push('</div>');
        html.push('</div>');

        var e = $('<div class="profiler-result" data-index="' + item.index + '"></div>');
        e.html(html.join(''));
        this._element.append(e);

        e.find(".profiler-button").bind("click", $.proxy(this._onProfilerButtonClick, this));
        e.find(".profiler-tabbutton").bind("click", $.proxy(this._onProfilerTabButtonClick, this));
        e.find("dt").bind("click", $.proxy(this._onProfilerDTClick, this));
        e.find(".profiler-trace-types span").click($.proxy(this._onProfilerTraceTypeClick, this));
        e.find(".profiler-watch-item span").click($.proxy(this._onProfilerItemClick, this));
    },
    _createWatchItem: function (html, wi, depth) {
        html.push('<div class="profiler-watch-item"><strong>' + wi.Start + '</strong><span style="padding-left:' + (12 + depth * 24) + 'px;">[' + wi.Duration + (wi.CpuDuration?'/' + wi.CpuDuration:'') + '] ' + this._createMessage(wi.Message) + '</span></div>');
        html.push('<div style="display: none;"><pre>' + wi.StackTrace + '</pre></div>');
        if (wi.Items.length > 0)
            for (var i = 0; i < wi.Items.length; i++)
                this._createWatchItem(html, wi.Items[i], depth + 1);
    },
    _createMessage: function (message) {
        var n = message.indexOf("@");
        if (n == -1)
            return message;
        return message.substr(0, n) + " <b>" + message.substr(n + 1, message.length - n - 1) + "</b>";
    }
};
$.ajaxSetup({
    dataFilter: $profiler.ajaxDataFilter
});

$(function () {
    $profiler.init();
    prettyPrint();
});