(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(["utils"], factory);
    } else if (typeof exports !== "undefined") {
        factory(require("utils"));
    } else {
        var mod = {
            exports: {}
        };
        factory(global.utils);
        global.tree = mod.exports;
    }
})(this, function (_utils) {
    "use strict";

    var _utils2 = _interopRequireDefault(_utils);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();

    var Tree = function () {
        function Tree(data) {
            _classCallCheck(this, Tree);

            this.data = this.convertToTreeData(data);
        }

        _createClass(Tree, [{
            key: "convertToTreeData",
            value: function convertToTreeData(data) {
                return _utils2.default.getChapterTree(data);
            }
        }]);

        return Tree;
    }();
});