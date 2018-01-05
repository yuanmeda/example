(function ($, ko) {

    function ViewModel(params, element) {
        this.element = element;
        this.wrapper = element.find('.po-nav-list');
        this.total = 0;
        this.offset = 0;
        this.init = false;
        $(window).resize($.proxy(this.resize, this))
        this.resize();
    }

    ViewModel.prototype.resize = function () {
        var w = this.element.find('.po-nav-body').width(),
            current = this.element.find('.active');

        if (!current.length) {
            setTimeout($.proxy(this.resize, this), 100);
            return;
        }

        this.wrapper = this.element.find('.po-nav-list');
        var index = current.index() + 1;

        var num = this.wrapper.find('li').length,
            _num = Math.floor(w / 188);

        this.wrapper.width(188 * num);
        this.total = _num - num;
        if (index <= _num) return;
        var offset = _num - index;
        this.wrapper.css({
            marginLeft: offset * 188
        })
        this.offset = offset;

    }

    ViewModel.prototype.prev = function () {
        var offset = this.offset
        offset = offset + 1
        if (offset > 0 || !this.total) return;
        this.wrapper.css({
            marginLeft: offset * 188
        })
        this.offset = offset;
    }

    ViewModel.prototype.next = function () {
        var offset = this.offset,
            total = this.total;
        offset = offset - 1;
        if (offset < total || !this.total) return;
        this.wrapper.css({
            marginLeft: offset * 188
        })
        this.offset = offset;
    }

    ko.components.register('x-po-nav', {
        synchronous: true,
        viewModel: {
            createViewModel: function (params, elementInfo) {
                return new ViewModel(params, $(elementInfo.element));
            }
        },
        template: '<div class="x-po-nav" data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    })


})(jQuery, ko)