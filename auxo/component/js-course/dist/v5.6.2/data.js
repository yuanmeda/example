// {
//     "id": "",
//     "parent_id": "",
//     "title": "",
//     "ref_id": "",
//     "order_number": "",
//     "children": [],
//     "extend_data": {

//     }
// }

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports !== "undefined") {
    factory();
  } else {
    var mod = {
      exports: {}
    };
    factory();
    global.data = mod.exports;
  }
})(this, function () {
  "use strict";
});