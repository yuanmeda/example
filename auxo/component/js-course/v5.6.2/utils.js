import _ from 'lodash';
import $ from 'jquery'

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
var getNodesByParent = function (nodes, parentId) {
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
                let map = createKnowledgeTree(result);
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
    return _.reduce(ary, function (map, node) {
        node.children = [];
        map[node.identifier] = node;
        return map;
    }, {});
}

function convertToTreeData(ary, map) {
    var result = [];
    _.forEach(ary, (function (node) {
        var parent = map[node.parent];
        if (parent) {
            (parent.children || (parent.children = [])).push(node);
        } else {
            result.push(node);
        }
    }));
    return result;
}

module.exports.getChapterTree = function (chapters) {
    let map = convertToMap(chapters);
    return convertToTreeData(chapters, map);
};
var getOpenNodes = function (openNode, chapters, result) {
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
        for (let i = 0; i < chapters.length; i++) {
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
    for (let i = 0; i < chapters.length; i++) {
        if (chapter_id === chapters[i].identifier) {
            return chapters[i];
        }
    }
};
module.exports.findChapterIdByKnowledgeId = function (knowledgeId, knowledge) {
    for (let i = 0; i < knowledge.length; i++) {
        var knowledgeList = knowledge[i].knowledges;
        if (findKnowledgeId(knowledgeId, knowledgeList)) {
            return knowledge[i].identifier;
        }
    }

    function findKnowledgeId(knowledgeId, knowledge) {
        for (let i = 0; i < knowledge.length; i++) {
            if (knowledgeId === knowledge[i].identifier) {
                return true;
            } else if (knowledge[i].knowledges) {
                if (findKnowledgeId(knowledgeId, knowledge[i].knowledges)) return true;
            }
        }
    }
};


var findKnowledgeChapter = function (kid, chapters) {
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

var getOpenKnowledges = function (openNode, chapters, result) {
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
var getDescendants = function (identifier, chapters, descendants) {
    var children = getNodesByParent(chapters, identifier);
    if (children.length > 0) {
        _.each(children, child => {
            descendants.push(child);
            getDescendants(child.identifier, chapters, descendants);
        });
    }
};
var getDescendantsByKnowledge = function (identifier, knowledges, descendants) {
    var children = getNodesByParent(knowledges, identifier);
    if (children.length > 0) {
        _.each(children, child => {
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

var getAncestors = function (descendant, chapters, ancestors) {
    var parent = null;
    _.each(chapters, chapter => {
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







var getAllKnowledge = function (knowledges) {
    let list = [];
    knowledges.map((k) => {
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


var getDescendantKnowledgesByChapter = function (chapters, chapter) {
    var list = getAllKnowledge(chapter.knowledges);

    var descendants = [];
    getDescendants(chapter.identifier, chapters, descendants);
    descendants.map(d => {
        var sss = getChapterById(chapters, d.identifier);
        var temp = getAllKnowledge(d.knowledges);
        for (var i = 0; i < temp.length; i++) {
            list.push(temp[i]);
        }
    });

    return list;
};
var getChapterById = function (chapter_id, chapters) {
    for (let i = 0; i < chapters.length; i++) {
        if (chapter_id === chapters[i].identifier) {
            return chapters[i];
        }
    }
};
module.exports.getDescendantKnowledgesByChapter = function (chapters, chapter) {
    var list = getDescendantKnowledgesByChapter(chapters, chapter);
    return list;
};


var getKnowledgeByChapter = function (knowledge, identifier) {
    var result = [];
    for (var i = 0; i < knowledge.length; i++) {

        if (knowledge[i].identifier == identifier) {
            result = knowledge[i].knowledges;
            if (result.length > 0) {
                let map = createKnowledgeTree(result);
                result = convertToTreeData(result, map);
            }
            break;
        }
    }
    return result;
};

var getSelectedTree = function (chapters) {
    let clChapters = $.extend(true, [], chapters);

    let knowledges = [],
        selected = [];
    _.each(clChapters, chapter => {
        let descendantChildrenKnowledgeList = getAllKnowledge(getKnowledgeByChapter(clChapters, chapter.identifier));
        _.each(descendantChildrenKnowledgeList, child => {
            knowledges.push(child);
        });
    });

    knowledges.map((k) => {
        if (k.choose)
            selected.push(k);
    });

    let maps = [];
    selected.map(s => {
        var t = s;
        maps.push(t.identifier);

        while (t && t.parent) {
            let parent = getKnowledgeById(knowledges, t.parent);
            let isParentKnowledge = parent ? true : false;
            if (!parent)
                parent = getChapterById(t.parent, clChapters);

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
    let tree = convertToTreeData(clChapters, convertToMap(clChapters));
    removeUseless(tree, maps);

    return {
        chapters: tree,
        selectedKnowledges: selected
    };
};

module.exports.getSelectedTree = function (chapters) {
    return getSelectedTree(chapters);
};

var removeUseless = function (tree, maps) {
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
var removeUselessKnowledge = function (knowledges, maps) {
    for (var i = knowledges.length - 1; i >= 0; i--) {
        if (knowledges[i].knowledges && knowledges[i].knowledges.length > 0) {
            removeUselessKnowledge(knowledges[i].knowledges, maps);
        }

        var index = maps.indexOf(knowledges[i].identifier);
        if (index < 0)
            knowledges.splice(i, 1);
    }
};

module.exports.getSelectedTree = function (chapters) {
    return getSelectedTree(chapters);
};

var getKnowledgeById = function (knowledges, identifier) {
    var knowledge = null;
    knowledges.map(k => {
        if (k.identifier == identifier)
            knowledge = k;
    });
    
    return knowledge;
};

var unique = function (arr) {
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
