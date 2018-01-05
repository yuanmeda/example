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
