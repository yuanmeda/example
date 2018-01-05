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
