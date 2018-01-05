(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'lodash', 'jquery'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('lodash'), require('jquery'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.lodash, global.jquery);
        global.utils = mod.exports;
    }
})(this, function (module, _lodash, _jquery) {
    'use strict';

    var _lodash2 = _interopRequireDefault(_lodash);

    var _jquery2 = _interopRequireDefault(_jquery);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    var apiHost = "http://component.dev.web.nd/";
    var env;

    if (window.config) {
        env = window.config.CURRENT_ENV;
    } else {
        env = "development";
    }

    if (env == "debug") {
        apiHost = "http://component.beta.web.sdp.101.com/"; //"http://component.debug.web.nd/";
    } else if (env == "preproduction") {
        apiHost = "http://component.beta.web.sdp.101.com/";
    } else {
        apiHost = "http://component.dev.web.nd/";
    }

    module.exports = {
        apiHost: apiHost
    };

    /**
     * 根据parentid获取章节列表
     * @param nodes
     * @param parentId
     * @returns {Array}
     */
    var getNodesByParent = function getNodesByParent(nodes, parentId) {
        var result = [];
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].parent == parentId) {
                result.push(nodes[i]);
            }
        }
        return result;
    };
    module.exports.getNodesByParent = getNodesByParent;

    module.exports.getKnowledgeByChapter = function (knowledge, identifier) {
        var result = [];
        for (var i = 0; i < knowledge.length; i++) {

            if (knowledge[i].identifier == identifier) {
                result = knowledge[i].knowledges;
                if (result.length > 0) {
                    var map = createKnowledgeTree(result);
                    result = convertToTreeData(result, map);
                }
                break;
            }
        }
        return result;
    };

    function createKnowledgeTree(knowledges) {
        return convertToMap(knowledges);
    }

    function convertToMap(ary) {
        return _lodash2.default.reduce(ary, function (map, node) {
            node.children = [];
            map[node.identifier] = node;
            return map;
        }, {});
    }

    function convertToTreeData(ary, map) {
        var result = [];
        _lodash2.default.forEach(ary, function (node) {
            var parent = map[node.parent];
            if (parent) {
                (parent.children || (parent.children = [])).push(node);
            } else {
                result.push(node);
            }
        });
        return result;
    }

    module.exports.getChapterTree = function (chapters) {
        var map = convertToMap(chapters);
        return convertToTreeData(chapters, map);
    };
    var getOpenNodes = function getOpenNodes(openNode, chapters, result) {
        var c = null;
        for (var i = 0; i < chapters.length; i++) {
            if (chapters[i].identifier == openNode) {
                c = chapters[i];
                break;
            }
        }
        if (c != null) {
            result.push(c);
            getOpenNodes(c.parent, chapters, result);
        }
    };

    module.exports.findOpenNodeByChosenChapter = function (chosenChapter, chapters, showKnowledge) {
        var openChapterIdList = [];
        if (!chosenChapter || !chapters) return openChapterIdList;

        function findParent(chosenChapter, chapters) {
            for (var i = 0; i < chapters.length; i++) {
                if (chosenChapter.parent === chapters[i].identifier) {
                    openChapterIdList.push(chapters[i].identifier);
                    findParent(chapters[i], chapters);
                }
            }
        }

        findParent(chosenChapter, chapters);
        if (showKnowledge) {
            openChapterIdList.push(chosenChapter.identifier);
        }
        return openChapterIdList;
    };
    module.exports.findChapterById = function (chapter_id, chapters) {
        for (var i = 0; i < chapters.length; i++) {
            if (chapter_id === chapters[i].identifier) {
                return chapters[i];
            }
        }
    };
    module.exports.findChapterIdByKnowledgeId = function (knowledgeId, knowledge) {
        for (var i = 0; i < knowledge.length; i++) {
            var knowledgeList = knowledge[i].knowledges;
            if (findKnowledgeId(knowledgeId, knowledgeList)) {
                return knowledge[i].identifier;
            }
        }

        function findKnowledgeId(knowledgeId, knowledge) {
            for (var _i = 0; _i < knowledge.length; _i++) {
                if (knowledgeId === knowledge[_i].identifier) {
                    return true;
                } else if (knowledge[_i].knowledges) {
                    if (findKnowledgeId(knowledgeId, knowledge[_i].knowledges)) return true;
                }
            }
        }
    };

    var findKnowledgeChapter = function findKnowledgeChapter(kid, chapters) {
        for (var i = 0; i < chapters.length; i++) {
            var c = chapters[i];
            if (c.knowledges) {
                for (var j = 0; j < c.knowledges.length; j++) {
                    if (c.knowledges[j].identifier == kid) {
                        return c;
                    }
                }
            }
        }
        return null;
    };

    module.exports.findKnowledgeChapter = function (kid, chapters) {
        return findKnowledgeChapter(kid, chapters);
    };

    var getOpenKnowledges = function getOpenKnowledges(openNode, chapters, result) {
        var knowledges = [];
        for (var i = 0; i < chapters.length; i++) {
            var c = chapters[i];
            if (c.knowledges) {
                for (var j = 0; j < c.knowledges.length; j++) {
                    knowledges.push(c.knowledges[j]);
                }
            }
        }

        var k = null;
        for (var i = 0; i < knowledges.length; i++) {
            if (knowledges[i].identifier == openNode) {
                k = knowledges[i];
                break;
            }
        }
        if (k != null) {
            result.push(k);
            getOpenKnowledges(k.ext_properties.parent, chapters, result);
        }
    };

    module.exports.isOpen = function (openNode, chapter, chapters) {
        var kc = findKnowledgeChapter(openNode, chapters);
        var openChapterId = openNode;
        if (kc) {
            openChapterId = kc.identifier;
        }
        var nodes = [];
        getOpenNodes(openChapterId, chapters, nodes);
        //getOpenKnowledges(openNode, chapters, nodes);
        var open = false;
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].identifier == chapter.identifier) {
                open = true;
                break;
            }
        }
        return open;
    };

    module.exports.getKnowledgesByParent = function (knowledges, parentId) {
        if (!knowledges) return [];

        knowledges.sort(function (a, b) {
            if (a.ext_properties && b.ext_properties) {
                return a.ext_properties.order_num - b.ext_properties.order_num;
            }
        });
        var result = [];
        for (var i = 0; i < knowledges.length; i++) {
            if (knowledges[i].ext_properties && knowledges[i].ext_properties.parent == parentId) {
                result.push(knowledges[i]);
            }
        }
        return result;
    };
    var getDescendants = function getDescendants(identifier, chapters, descendants) {
        var children = getNodesByParent(chapters, identifier);
        if (children.length > 0) {
            _lodash2.default.each(children, function (child) {
                descendants.push(child);
                getDescendants(child.identifier, chapters, descendants);
            });
        }
    };
    var getDescendantsByKnowledge = function getDescendantsByKnowledge(identifier, knowledges, descendants) {
        var children = getNodesByParent(knowledges, identifier);
        if (children.length > 0) {
            _lodash2.default.each(children, function (child) {
                descendants.push(child);
                getDescendantsByKnowledge(child.identifier, knowledges, descendants);
            });
        }
    };
    module.exports.findDescendantById = function (chapters, identifier) {
        var descendants = [];
        getDescendants(identifier, chapters, descendants);
        return descendants;
    };

    var getAncestors = function getAncestors(descendant, chapters, ancestors) {
        var parent = null;
        _lodash2.default.each(chapters, function (chapter) {
            if (chapter.identifier == descendant.parent) {
                parent = chapter;
                return false;
            }
        });
        if (parent) {
            ancestors.push(parent);
            getAncestors(parent, chapters, ancestors);
        }
    };
    module.exports.findAncestorByChapter = function (chapters, descendant) {
        var ancestors = [];
        getAncestors(descendant, chapters, ancestors);
        return ancestors;
    };

    var getAllKnowledge = function getAllKnowledge(knowledges) {
        var list = [];
        knowledges.map(function (k) {
            if (k.children && k.children.length > 0) {
                var tempList = getAllKnowledge(k.children);
                for (var i = 0; i < tempList.length; i++) {
                    list.push(tempList[i]);
                }
                list.push(k);
            } else {
                list.push(k);
            }
        });

        return list;
    };
    module.exports.getAllKnowledge = function (knowledges) {
        var list = getAllKnowledge(knowledges);
        return list;
    };

    var getDescendantKnowledgesByChapter = function getDescendantKnowledgesByChapter(chapters, chapter) {
        var list = getAllKnowledge(chapter.knowledges);

        var descendants = [];
        getDescendants(chapter.identifier, chapters, descendants);
        descendants.map(function (d) {
            var sss = getChapterById(chapters, d.identifier);
            var temp = getAllKnowledge(d.knowledges);
            for (var i = 0; i < temp.length; i++) {
                list.push(temp[i]);
            }
        });

        return list;
    };
    var getChapterById = function getChapterById(chapter_id, chapters) {
        for (var i = 0; i < chapters.length; i++) {
            if (chapter_id === chapters[i].identifier) {
                return chapters[i];
            }
        }
    };
    module.exports.getDescendantKnowledgesByChapter = function (chapters, chapter) {
        var list = getDescendantKnowledgesByChapter(chapters, chapter);
        return list;
    };

    var getKnowledgeByChapter = function getKnowledgeByChapter(knowledge, identifier) {
        var result = [];
        for (var i = 0; i < knowledge.length; i++) {

            if (knowledge[i].identifier == identifier) {
                result = knowledge[i].knowledges;
                if (result.length > 0) {
                    var map = createKnowledgeTree(result);
                    result = convertToTreeData(result, map);
                }
                break;
            }
        }
        return result;
    };

    var getSelectedTree = function getSelectedTree(chapters) {
        var clChapters = _jquery2.default.extend(true, [], chapters);

        var knowledges = [],
            selected = [];
        _lodash2.default.each(clChapters, function (chapter) {
            var descendantChildrenKnowledgeList = getAllKnowledge(getKnowledgeByChapter(clChapters, chapter.identifier));
            _lodash2.default.each(descendantChildrenKnowledgeList, function (child) {
                knowledges.push(child);
            });
        });

        knowledges.map(function (k) {
            if (k.choose) selected.push(k);
        });

        var maps = [];
        selected.map(function (s) {
            var t = s;
            maps.push(t.identifier);

            while (t && t.parent) {
                var parent = getKnowledgeById(knowledges, t.parent);
                var isParentKnowledge = parent ? true : false;
                if (!parent) parent = getChapterById(t.parent, clChapters);

                if (parent) {
                    t = parent;
                    maps.push(t.identifier);
                    maps.push(t.parent);
                } else {
                    t = null;
                }
            }
        });

        maps = unique(maps);
        var tree = convertToTreeData(clChapters, convertToMap(clChapters));
        removeUseless(tree, maps);

        return {
            chapters: tree,
            selectedKnowledges: selected
        };
    };

    module.exports.getSelectedTree = function (chapters) {
        return getSelectedTree(chapters);
    };

    var removeUseless = function removeUseless(tree, maps) {
        for (var i = tree.length - 1; i >= 0; i--) {
            if (tree[i].children && tree[i].children.length > 0) {
                removeUseless(tree[i].children, maps);
            }
            if (tree[i].knowledges && tree[i].knowledges.length > 0) {
                removeUselessKnowledge(tree[i].knowledges, maps);
            }
            var index = maps.indexOf(tree[i].identifier);
            if (index < 0) {
                tree.splice(i, 1);
            }
        }
    };
    var removeUselessKnowledge = function removeUselessKnowledge(knowledges, maps) {
        for (var i = knowledges.length - 1; i >= 0; i--) {
            if (knowledges[i].knowledges && knowledges[i].knowledges.length > 0) {
                removeUselessKnowledge(knowledges[i].knowledges, maps);
            }

            var index = maps.indexOf(knowledges[i].identifier);
            if (index < 0) knowledges.splice(i, 1);
        }
    };

    module.exports.getSelectedTree = function (chapters) {
        return getSelectedTree(chapters);
    };

    var getKnowledgeById = function getKnowledgeById(knowledges, identifier) {
        var knowledge = null;
        knowledges.map(function (k) {
            if (k.identifier == identifier) knowledge = k;
        });

        return knowledge;
    };

    var unique = function unique(arr) {
        var res = [];
        var json = {};
        for (var i = 0; i < arr.length; i++) {
            if (!json[arr[i]]) {
                res.push(arr[i]);
                json[arr[i]] = 1;
            }
        }
        return res;
    };
});