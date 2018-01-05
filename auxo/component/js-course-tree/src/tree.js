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
