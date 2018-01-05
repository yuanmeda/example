var TreeHelper = {
    _convertToMap: function (ary) {
        return _.reduce(ary, function (map, node) {
            node.children = [];
            map[node.id] = node;
            return map;
        }, {});
    },
    _convertToTreeData: function (ary, map) {
        var result = [];
        _.forEach(ary, (function (node) {
            var parent = map[node.parent_id];
            if (parent) {
                (parent.children || (parent.children = [])).push(node);
            } else {
                result.push(node);
            }
        }));
        return result;
    },
    getTree: function (data) {
        var map = this._convertToMap(data);
        return this._convertToTreeData(data, map);
    },
    getMap: function (data) {
        return this._convertToMap(data);
    }
}
