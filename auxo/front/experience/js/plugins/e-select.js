/**
 * Author: Administrator
 * Date: 2016/10/18
 * Description:
 *      1. created
 */
;
(function ($) {

    var sequence = 1;

    /**
     * The constructor of Select component
     *
     * @param $select
     * @param options
     * @constructor
     */
    var Select = function ($select, options) {
        options = options || {};
        this.$select = $select;
        this.options = $.extend(true, {}, Select.defaultOptions, options);
        this.$container = null;
        this.valueMap = null;
        this.sequence = sequence++;

        this.init();
    };

    Select.prototype = {
        constructor: Select,

        init: function () {
            var that = this;

            function update() {
                that.renderContainer();
                that.renderOptions();
                that.initEvents();

                // options.initValue will be set as selected value if not null,
                if (that.options.initValue != null) {
                    that.setValue(that.options.initValue, true);
                }
                // otherwise, the most possible value will be set as selected value.
                else {
                    that.setAvailableAsValue(true);
                }

                // call options.afterInitialized once initialization is completed
                if ($.isFunction(that.options.afterInitialized)) {
                    that.options.afterInitialized.call(null);
                }
            }

            // component will be loaded delay if options.delay is not null
            // it is effective to deal with ko options bindHandler,
            // we try to load component in the right way as far as possible.
            if (typeof this.options.delay === "number") {
                setTimeout(function () {
                    update();
                }, this.options.delay);
            } else {
                update();
            }
            return this;
        },
        /**
         * initialize events
         * @returns {Select}
         */
        initEvents: function () {
            var that = this,
                $list = that.$container.find('.e-select-list');

            this.$container.find('.e-select-holder')
                .off(this.getEventNamespace('click'))
                .on(this.getEventNamespace('click'), function () {
                    if ($list.is(':hidden')) {
                        that.show();
                    } else {
                        that.hide();
                    }
                });
            $list.delegate('li', 'click', function (e) {
                var $li = $(e.target),
                    item = $li.data('item.select');
                that.setValue(item.value, true);
                that.hide();
            });

            // update options synchronize
            this.$select.on('update', function () {
                that.refresh();
            });

            return this;
        },
        /**
         * namespace of events
         * @param name
         * @returns {string}
         */
        getEventNamespace: function (name) {
            return name + '.select.' + this.sequence;
        },
        /**
         * render container of component
         * @returns {Select}
         */
        renderContainer: function () {
            this.$select.hide();
            this.$container = $(this.options.html);
            this.$select.after(this.$container);
            if (this.options.width != null) {
                this.$container.width(this.options.width);
            }
            return this;
        },
        /**
         * render options of component
         * @returns {Select}
         */
        renderOptions: function () {
            var that = this,
                $list = this.$container.find('.e-select-list');
            $list.empty();
            this.valueMap = {};
            this.$select.find('option').each(function (i) {
                var $this = $(this),
                    value = $this.val(),
                    text = $this.text(),
                    $li = $('<li></li>'),
                    item = {
                        value: value,
                        text: text,
                        index: i
                    };
                $li.text(text)
                    .data('item.select', item)
                    .appendTo($list);
                that.valueMap[value] = item;
            });
            return this;
        },
        /**
         * refresh component
         * 1. rerender the options
         * 2. reset selected value
         * @returns {Select}
         */
        refresh: function () {
            this.renderOptions();
            //this.setAvailableAsValue(true);
            return this;
        },
        /**
         * show the dropdown list
         * @returns {Select}
         */
        show: function () {
            var $list = this.$container.find('.e-select-list');
            this.$container.find('.e-select-holder-arrow')
                .removeClass('icon-arrow-down')
                .addClass('icon-arrow-up');
            $(document).off(this.getEventNamespace('click'))
                .on(this.getEventNamespace('click'), $.proxy(this.clickOut, this));
            $list.show();
            return this;
        },
        /**
         * hide the dropdown list
         * @returns {Select}
         */
        hide: function () {
            this.$container.find('.e-select-holder-arrow')
                .removeClass('icon-arrow-up')
                .addClass('icon-arrow-down');
            $(document).off(this.getEventNamespace('click'));
            this.$container.find('.e-select-list')
                .hide();
            return this;
        },
        /**
         * the event whether or not to hide the dropdown list
         * @param e
         * @returns {Select}
         */
        clickOut: function (e) {
            if (this.$container[0] !== e.target && !this.$container.find(e.target).length) {
                this.hide();
            }
            return this;
        },
        /**
         * set selected value,
         * trigger change on select, and call options.onSelect if set
         *
         * @param value
         * @param callFn
         * @returns {Select}
         */
        setValue: function (value, callFn) {
            if (this.valueMap[value]) {
                var item = this.valueMap[value],
                    $li = this.$container.find('.e-select-list li')
                        .eq(item.index);
                this.$container.find('.e-select-holder-text')
                    .text(item.text);
                $li.addClass('active')
                    .siblings('.active')
                    .removeClass('active');
                this.$select.find('option')
                    .eq(item.index)
                    .attr('selected', 'selected');
                this.$select.trigger('change');
                if ($.isFunction(this.options.onSelect)) {
                    this.options.onSelect.call(null, item);
                }
            }
            return this;
        },
        /**
         * set selected value which is most possible
         * @param callFn
         * @returns {Select}
         */
        setAvailableAsValue: function (callFn) {
            var value = this.$select.val();

            // selected value on original select
            if (value) {
                this.setValue(value, true);
            }
            // or first option
            else {
                var item = this.$container.find('.e-select-list li:first').data('item.select');
                if (item) {
                    this.setValue(item.value, callFn);
                }
            }
            return this;
        },
        /**
         * execute available method on component
         * @returns {Select}
         */
        execute: function () {
            var args = Array.prototype.concat.apply([], arguments),
                method,
                allowedMethods = ['refresh', 'show', 'hide', 'setValue', 'setAvailableAsValue'];
            if (typeof (method = args[0]) === "string" && $.inArray(method, allowedMethods)) {
                this[args.shift()].apply(this, args);
            }
            return this;
        }
    };

    Select.defaultOptions = {
        // html of component
        html: [
            '<div class="e-select">',
            '<div class="e-select-holder">',
            '<i class="e-select-holder-arrow icon-arrow-down"></i>',
            '<span class="e-select-holder-text"></span>',
            '</div>',
            '<ul class="e-select-list"></ul>',
            '</div>'
        ].join(''),
        // default value on initialization
        initValue: null,
        // load delay {number}
        delay: null,
        // fn called once initialization is completed
        afterInitialized: $.noop,
        // fn called after selected option
        onSelect: $.noop
    };

    /**
     *
     * ex.
     *  $('.e-select').eSelect({});
     *  $('.e-select').eSelect('refresh');
     *
     * @returns {*}
     */
    $.fn.eSelect = function () {
        var args = Array.prototype.concat.apply([], arguments);
        return $(this).each(function () {
            var $this = $(this),
                select = $this.data('e-select');
            if (select) {
                select.execute.apply(select, args);
            } else {
                $this.data('e-select', new Select($this, args[0]));
            }
        });
    };

    // Select.defaultOptions can be rewrite
    $.fn.eSelect.defaultOptions = Select.defaultOptions;


}(jQuery));