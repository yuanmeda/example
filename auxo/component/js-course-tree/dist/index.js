(function ($) {
    var contentTmpl = '\
        <div class="item-content">\
            <span class="item-txt">\
                <em title="{title}">{title}</em>\
            </span>\
        </div>\
    '

    var knowledgeTree = {
        html: function (data) {
            var html = '\
                    <div class="n-ui-menu course-menu-default">\
                        <ul class="dlist">\
                ';

            for (var i = 0; i < data.length; i++) {
                html += this._getItemHtml(data[i]);
            }

            html += '</ul></div>';

            return html;
        },
        _getItemHtml: function (item) {
            var html = '<li class="sub-item" data-id="' + item.id + '">';

            var temp = $(contentTmpl.concat()).tmpl(item);
            if (!item.parent_id) {
                temp.prepend('<i class="iconfont-e-course icon-e-course-add"></i>');
            } else if (item.children && item.children.length > 0) {
                temp.prepend('<i class="iconfont-e-course icon-e-course-right"></i>');
            }

            html += temp[0].outerHTML;
            // html += $(contentTmpl.concat()).tmpl(item)[0].outerHTML;

            if (item.children && item.children.length > 0) {
                for (var i = 0; i < item.children.length; i++) {
                    html += '<ul class="list">';
                    html += this._getItemHtml(item.children[i]);
                    html += '</ul>'
                }
            }

            html += '</li>';

            return html;
        }
    };

    $.fn.knowledgeTree = function (options) {
        this.data = _.orderBy(options.data, ["order_num"], ["asc"]);

        this.treeData = TreeHelper.getTree($.extend(true, {}, this.data));
        this.mapData = TreeHelper.getMap($.extend(true, {}, this.data));
        var html = knowledgeTree.html(this.treeData);
        var self = this;

        $.extend(this, {
            _expand: function (target) {
                var data = this.mapData[$el.data("id")];
                target.addClass("open");
                if ($el.children(".item-content").children(".iconfont-e-course.icon-e-course-add").length > 0) {
                    $el.children(".item-content").children(".iconfont-e-course.icon-e-course-add").removeClass("icon-e-course-add").addClass("icon-e-course-minus");
                }
                if ($el.children(".item-content").children(".iconfont-e-course.icon-e-course-right").length > 0) {
                    $el.children(".item-content").children(".iconfont-e-course.icon-e-course-right").removeClass("icon-e-course-right").addClass("icon-e-course-down");
                }
            },
            _pullup: function (target) {
                var data = this.mapData[$el.data("id")];
                target.removeClass("open");
                if ($el.children(".item-content").children(".iconfont-e-course.icon-e-course-minus").length > 0) {
                    $el.children(".item-content").children(".iconfont-e-course.icon-e-course-minus").removeClass("icon-e-course-minus").addClass("icon-e-course-add");
                }
                if ($el.children(".item-content").children(".iconfont-e-course.icon-e-course-down").length > 0) {
                    $el.children(".item-content").children(".iconfont-e-course.icon-e-course-down").removeClass("icon-e-course-down").addClass("icon-e-course-right");
                }
            },
            appendTo: function (nodeId, element) {
                $('li[data-id=' + nodeId + ']').find(".item-txt").prepend(element);
            },
            appendDone: function (nodeId) {
                $('li[data-id=' + nodeId + ']').find(".item-txt").prepend('<i class="iconfont-e-course icon-e-course-done"></i>');
            },
            appendHalf: function (nodeId) {
                $('li[data-id=' + nodeId + ']').find(".item-txt").prepend('<i class="iconfont-e-course icon-e-course-half"></i>');
            },
            appendEmpty: function (nodeId) {
                $('li[data-id=' + nodeId + ']').find(".item-txt").prepend('<i class="iconfont-e-course icon-e-course-empty"></i>');
            },
            find: function (nodeName) {
                var node = _.find(this.data, ['title', nodeName]);
                if (node) {
                    var ele = $('li[data-id=' + node.id + ']');
                    ele.click();
                    $(window).scrollTop(ele.offset().top);


                    $(".item-txt").removeClass("state-on");
                    ele.children(".item-content").children(".item-txt").addClass("state-on");
                }
            }
        });

        $(this).append($(html));
        $(this).off("click").on("click", "li", function (event) {
            $el = $(event.currentTarget);
            if ($el.children("ul").length > 0) {
                $el.hasClass("open") ? self._pullup($el) : self._expand($el);
            }

            options.onNodeClick && options.onNodeClick.call(this, event, this.mapData[$el.data("id")]);
            event.stopPropagation();
        });

        return this;
    };
})(jQuery);

(function ($) {
    function Template(tpl) {
        this.tpl = tpl;
    }

    Template.prototype.render = function (model) {
        var html = "";
        var re = /(\{\s*foreach\s*\$[a-zA-Z\_0-9]+\})([\s\S]*?)(\{\s*\/foreach\s*\})/m;
        var match = re.exec(this.tpl);
        if (match && match[2]) {
            var result = /\$[a-zA-Z\_0-9]+/m.exec(match[1]);
            if (result) {
                var foreachItems = null;
                if (result[0] == "$data") {
                    foreachItems = model;
                    $.each(foreachItems, $.proxy(function (index, item) {
                        html += this.parse(match[2], item);
                    }, this));
                } else {

                }
            }
        } else {
            html += this.parse(this.tpl, model);
        }

        return html;
    };

    Template.prototype.parse = function (tpl, model) {
        var
            fn,
            match,
            code = ['var r=[];\nvar _html = function (str) { return str.replace(/&nbsp;/g, \' \').replace(/&/g, \'&amp;\').replace(/"/g, \'&quot;\').replace(/\'/g, \'&#39;\').replace(/</g, \'&lt;\').replace(/>/g, \'&gt;\'); };'],
            re = /\{\s*([a-zA-Z\.//]+)(\s*\|\s*safe)?\s*\}/m,
            addLine = function (text) {
                code.push('r.push(\'' + text.replace(/\'/g, '\\\'').replace(/\n/g, '\\n').replace(/\r/g, '\\r') + '\');');
            };
        while (match = re.exec(tpl)) {
            if (match.index > 0) {
                addLine(tpl.slice(0, match.index));
            }
            if (match[2]) {
                code.push('r.push(String(this.' + match[1] + '));');
            } else {
                code.push('r.push(_html(String(this.' + match[1] + ')));');
            }
            tpl = tpl.substring(match.index + match[0].length);
        }
        addLine(tpl);
        code.push('return r.join(\'\');');
        fn = new Function(code.join('\n'));
        return fn.apply(model);
    }

    $.fn.tmpl = function (model) {
        var template = new Template($(this)[0].outerHTML);
        this.compliedHtml = template.render(model);

        return $(this.compliedHtml);
    }
})(jQuery);

(function ($) {
    var tree = function (options) {
        this.options = $.extend({
            data: null
        }, options);
    };

    tree.prototype.html = function (data) {
        for (var i = 0; i < data.length; i++) {
            var html = this._getItem(i, data[i]);

            if(this._hasChildren(item)) {
                this.html(item.children);
            }
        }
    };

    tree.prototype._getItem = function (index, item) {
        var html = "";

        if (this._hasChildren(item) && this._isTopChapter(item)) {
            html = chapterTmpl.concat();
        }
        else if(this._hasChildren(item)) {
            html = chapterTmpl2.concat();
        }
        else {
            html = resourceTmpl.concat();
        }

        return $(html).tmpl(item)[0].outerHTML;
    };

    tree.prototype._hasChildren = function (item) {
        if (item.children && item.children.length > 0) {
            return true;
        }
        return false;
    };

    tree.prototype._isTopChapter = function (item) {
        if (item.parent_id) {
            return true;
        }

        return false;
    };

    $.fn.tree = function (options) {
        var o = new tree(null);

        TreeHelper.getTree(options.data)
        o.html(options.data);
    };
})(jQuery);

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
