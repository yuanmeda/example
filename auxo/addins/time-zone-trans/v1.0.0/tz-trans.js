!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.timeZoneTrans=t()}(this,function(){"use strict";function e(e){var r=void 0,d=void 0,u=void 0,s=void 0,a=void 0;return r=/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\./.test(e),d=n(e,r),u=d.date,s=d.timezone,a=i(),o(u,s,a),t(u,!r,a)}function t(e,t,n){var i=void 0,o=e.getFullYear(),r=u(e.getMonth()+1,2),s=u(e.getDate(),2),a=u(e.getHours(),2),f=u(e.getMinutes(),2),v=u(e.getSeconds(),2),c=u(e.getMilliseconds(),3);return i=t?o+"-"+r+"-"+s+"T"+a+":"+f+":"+v+"."+c+d(n):o+"/"+r+"/"+s+" "+a+":"+f+":"+v}function n(e,t){var n=void 0,o=void 0,d=void 0,u=void 0,s=void 0;return s=t?/T|\./:/\s/,n=e.split(s),o=n[0].replace(/-/g,"/"),d=n[1],u=n[2]?r(n[2].substr(-5,n[2].length)):i(),{date:new Date(o+" "+d),timezone:u}}function i(){return(new Date).getTimezoneOffset()/60}function o(e,t,n){var i=3600*(t-n)*1e3;e.setTime(e.getTime()+i)}function r(e){var t=e.substr(0,3),n=e.substr(3,5);return-(parseInt(t,10)+parseInt(n,10)/60)}function d(e){var t=void 0,n=void 0,i=void 0;return t=e<0?"+":"-",i=e.toFixed(2).substr(-2,e.length)/100*60,n=Math.abs(parseInt(e,10)).toString(),t+u(n,2)+u(i,2)}function u(e,t){var n=function(){for(var e="",n=0;n<t;n++)e+="0";return e}();return(n+(e||0)).slice(-t)}return e});
