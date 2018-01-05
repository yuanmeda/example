/**
* This jQuery plugin displays pagination links inside the selected elements.
* 
* This plugin needs at least jQuery 1.4.2
*
* @author Gabriel Birke (birke *at* d-scribe *dot* de)
* @version 2.2
* @param {int} maxentries Number of entries to paginate
* @param {Object} opts Several options (see README for documentation)
* @return {Object} jQuery Object
*/
(function ($) {
    /**
    * @class Class for calculating pagination values
    */
    $.PaginationCalculator = function (maxentries, opts) {
        this.maxentries = maxentries;
        this.opts = opts;
    }

    $.extend($.PaginationCalculator.prototype, {
        /**
        * Calculate the maximum number of pages
        * @method
        * @returns {Number}
        */
        numPages: function () {
            return Math.ceil((this.maxentries == 0 ? 1 : this.maxentries) / this.opts.items_per_page);
        },
        /**
        * Calculate start and end point of pagination links depending on 
        * current_page and num_display_entries.
        * @returns {Array}
        */
        getInterval: function (current_page) {
            var ne_half = Math.floor(this.opts.num_display_entries / 2);
            var np = this.numPages();
            var upper_limit = np - this.opts.num_display_entries;
            var start = current_page > ne_half ? Math.max(Math.min(current_page - ne_half, upper_limit), 0) : 0;
            var end = current_page > ne_half ? Math.min(current_page + ne_half + (this.opts.num_display_entries % 2), np) : Math.min(this.opts.num_display_entries, np);
            return { start: start, end: end };
        }
    });

    // Initialize jQuery object container for pagination renderers
    $.PaginationRenderers = {}

    /**
    * @class Default renderer for rendering pagination links
    */
    $.PaginationRenderers.defaultRenderer = function (maxentries, opts) {
        this.maxentries = maxentries;
        this.opts = opts;
        this.pc = new $.PaginationCalculator(maxentries, opts);
    }
    $.extend($.PaginationRenderers.defaultRenderer.prototype, {
        /**
        * Helper function for generating a single link (or a span tag if it's the current page)
        * @param {Number} page_id The page id for the new item
        * @param {Number} current_page 
        * @param {Object} appendopts Options for the new item: text and classes
        * @returns {jQuery} jQuery object containing the link
        */
        createLink: function (page_id, current_page, appendopts) {
            var lnk, np = this.pc.numPages();
            page_id = page_id < 0 ? 0 : (page_id < np ? page_id : np - 1); // Normalize page id to sane value
            appendopts = $.extend({ text: page_id + 1, classes: "" }, appendopts || {});
            if (page_id == current_page) {
                lnk = $("<span class='current'>" + appendopts.text + "</span>");
            }
            else {
                lnk = $("<a>" + appendopts.text + "</a>")
					.attr('href', this.opts.link_to.replace(/__id__/, page_id));
            }
            if (appendopts.classes) { lnk.addClass(appendopts.classes); }
            lnk.data('page_id', page_id);
            return lnk;
        },
        // Generate a range of numeric links 
        appendRange: function (container, current_page, start, end, opts) {
            var i;
            for (i = start; i < end; i++) {
                this.createLink(i, current_page, opts).appendTo(container);
            }
        },
        getInfo: function (current_page) {
            var currentPage = current_page + 1;
            var totalPage = this.pc.numPages();
            var totalCount = this.maxentries;
            return $("<div class='pagination-info pull-left'><span>" + toolUtils.stringExtend.stringFormat(this.opts.i18n.full_info, { currentPage: currentPage, totalPage: totalPage, totalCount: totalCount }) + "</span></div>");
            //return $("<div class='pagination-info pull-left'><span>当前第 " + currentPage + " 页/共 " + totalPage + " 页，共有 " + totalCount + " 条记录</span></div>");
        },
        getMiniInfo: function (current_page) {
            var currentPage = current_page + 1;
            var totalPage = this.pc.numPages();
            var totalCount = this.maxentries;
            return $("<div class='pagination-info pull-left'><span>" + toolUtils.stringExtend.stringFormat(this.opts.i18n.mini_info, { currentPage: currentPage, totalPage: totalPage, totalCount: totalCount }) + "</span></div>");
            //return $("<div class='pagination-info pull-left'><span>第 " + currentPage + " / " + totalPage + " 页，共 " + totalCount + " 条</span></div>");
        },
        getLinks: function (current_page, eventHandler, turnHandler, changeHandle) {
            var begin, end,
				interval = this.pc.getInterval(current_page),
				np = this.pc.numPages(),
                opt=this.opts,
				fragment = $("<div class='pagination'></div>");
            if (opt.is_show_total || opt.is_show_mini_total) {
                fragment.addClass("pull-right");
            }
            if (this.opts.is_show_first_last && current_page>0) {
                $("<a class='first'>" + opt.i18n.first_page + "</a>").attr('href', this.opts.link_to.replace(/__id__/, 0)).data('page_id', 0).appendTo(fragment);
            }
            // Generate "Previous"-Link
            if (this.opts.i18n.prev_text && (current_page > 0 || this.opts.prev_show_always)) {
                fragment.append(this.createLink(current_page - 1, current_page, { text: this.opts.i18n.prev_text, classes: "prev" }));
            }
            // Generate starting points
            if (interval.start > 0 && this.opts.num_edge_entries > 0) {
                end = Math.min(this.opts.num_edge_entries, interval.start);
                this.appendRange(fragment, current_page, 0, end, { classes: 'sp' });
                if (this.opts.num_edge_entries < interval.start && this.opts.i18n.ellipse_text) {
                    $("<span class='pre-page-break'>" + this.opts.i18n.ellipse_text + "</span>").appendTo(fragment);
                }
            }
            // Generate interval links
            this.appendRange(fragment, current_page, interval.start, interval.end);
            // Generate ending points
            if (interval.end < np && this.opts.num_edge_entries > 0) {
                if (np - this.opts.num_edge_entries > interval.end && this.opts.i18n.ellipse_text) {
                    $("<span class='pre-page-break'>" + this.opts.i18n.ellipse_text + "</span>").appendTo(fragment);
                }
                begin = Math.max(np - this.opts.num_edge_entries, interval.end);
                //this.appendRange(fragment, current_page, begin, np, { classes: 'ep' });

            }
            // Generate "Next"-Link
            if (this.opts.i18n.next_text && (current_page < np - 1 || this.opts.next_show_always)) {
                fragment.append(this.createLink(current_page + 1, current_page, { text: this.opts.i18n.next_text, classes: "next" }));
            }
            if (this.opts.is_show_first_last && (current_page != np-1))
            {
                $("<a class='last'>" + this.opts.i18n.last_page + "</a>").attr('href', this.opts.link_to.replace(/__id__/, np - 1)).data('page_id', np - 1).appendTo(fragment);
            }
            if (this.opts.items_per.length > 0) {
                var items = [], div = $("<div class='page-selector'>" + this.opts.i18n.each_page_text + "<select></select>" + this.opts.i18n.item_text + "</div>"), select = div.find("select");
                $.each(this.opts.items_per, function (index, value) {
                    items.push("<option value=" + value + ">" + value + "</option>");
                });
                select.html(items.join(",")).val(this.opts.items_per_page).change(changeHandle);
                fragment.append(div);

            }
            if (this.opts.is_show_input)
            {
                var input = $("<div class='page-input'>" + this.opts.i18n.navigate_text + "<input type='text' maxlength='10' class='page-text' /> " + this.opts.i18n.page_text + "&nbsp;<input class='btn select-page-btn' type='button' value='" + this.opts.i18n.go_text + "' ></div>");
                fragment.append(input);
                $('.page-input .page-text', fragment).data("count", np).keydown(function(e) {
                    if (e.keyCode == 13)
                        turnHandler(e);
                });
                $('.page-input .select-page-btn', fragment).click(turnHandler);
            }
            $('a', fragment).click(eventHandler);
            return fragment;
        }
    });

    // Extend jQuery
    $.fn.pagination = function (maxentries, opts) {
        // Initialize options with default values
        opts = $.extend({
            items_per_page: 10,
            num_display_entries: 11,
            current_page: 0,
            num_edge_entries: 0,
            link_to: "javascript:void(0)",
            prev_show_always: true,
            next_show_always: true,
            renderer: "defaultRenderer",
            pageClass: "",
            show_if_single_page: false,
            load_first_page: true,
            is_show_first_last:false,
            is_show_input: false,
            is_show_total: true,
            is_show_mini_total: false, //迷你介绍 与is_show_total参数互斥
            items_per:[],
            i18n: {
                prev_text: "上一页",
                next_text: "下一页",
                ellipse_text: "...",
                full_info: '当前第 {{currentPage}} 页/共 {{totalPage}} 页，共有 {{totalCount}} 条记录',
                mini_info: '第 {{currentPage}} / {{totalPage}} 页，共 {{totalCount}} 条',
                first_page: '首页',
                last_page: '尾页',
                item_text: '条',
                each_page_text: '每页',
                navigate_text: '到第',
                go_text: '跳转',
                page_text: '页'
            },
            perCallback:function(){ return false; },
            callback: function () { return false; }
        }, opts || {});

        var containers = this,
			renderer, links, current_page, info,
            pc = new $.PaginationCalculator(maxentries, opts);
        /**
        * This is the event handling function for the pagination links. 
        * @param {int} page_id The new page number
        */
        function paginationClickHandler(evt) {
            var links, info,
				new_current_page = $(evt.target).data('page_id'),
				continuePropagation = selectPage(new_current_page);
            if (!continuePropagation) {
                evt.stopPropagation();
            }
            return continuePropagation;
        }
        function paginationTurn(evt) {
            var links,
                info,
                totalCount = $('.page-text', containers).data("count"),
                new_current_page = parseInt($(".page-text", containers).val()) - 1,
                continuePropagation;
            if (new_current_page >= totalCount)
                new_current_page = totalCount - 1;
            if (new_current_page <= 0 || isNaN(new_current_page))
                new_current_page = 0;
            continuePropagation = selectPage(new_current_page);
            if (!continuePropagation) {
                evt.stopPropagation();
            }
            return continuePropagation;
        }
        function paginationSelect(evt) {
            var select = $(this), selectValue = select.val() - 0;
            if (!isNaN(selectValue)) {
                opts.items_per_page = selectValue;
                if ($.isFunction(opts.perCallback)) {
                    opts.perCallback(selectValue);
                }
            }
        }

        /**
        * This is a utility function for the internal event handlers. 
        * It sets the new current page on the pagination container objects, 
        * generates a new HTMl fragment for the pagination links and calls
        * the callback function.
        */
        function selectPage(new_current_page) {
            // update the link display of a all containers
            containers.data('current_page', new_current_page);
            links = renderer.getLinks(new_current_page, paginationClickHandler, paginationTurn, paginationSelect);
            info = renderer.getInfo(new_current_page);
            containers.empty();
            if (opts.is_show_total) {
                info.appendTo(containers);
            }
            if (opts.is_show_mini_total) {
                var miniInfo = renderer.getMiniInfo(new_current_page);
                miniInfo.appendTo(containers);
            }
            links.appendTo(containers);
            // call the callback and propagate the event if it does not return false
            var continuePropagation = opts.callback(new_current_page, containers);
            return continuePropagation;
        }

        // -----------------------------------
        // Initialize containers
        // -----------------------------------
        if (opts.pageClass) {
            containers.addClass(opts.pageClass);
        }
        current_page = parseInt(opts.current_page);
        containers.data('current_page', current_page);
        // Create a sane value for maxentries and items_per_page
        maxentries = (!maxentries || maxentries < 0) ? 0 : maxentries;
        opts.items_per_page = (!opts.items_per_page || opts.items_per_page < 0) ? 1 : opts.items_per_page;

        if (!$.PaginationRenderers[opts.renderer]) {
            throw new ReferenceError("Pagination renderer '" + opts.renderer + "' was not found in jQuery.PaginationRenderers object.");
        }
        renderer = new $.PaginationRenderers[opts.renderer](maxentries, opts);

        // Attach control events to the DOM elements
        var np = pc.numPages();
        containers.bind('setPage', { numPages: np }, function (evt, page_id) {
            if (page_id >= 0 && page_id < evt.data.numPages) {
                selectPage(page_id); return false;
            }
        });
        containers.bind('prevPage', function (evt) {
            var current_page = $(this).data('current_page');
            if (current_page > 0) {
                selectPage(current_page - 1);
            }
            return false;
        });
        containers.bind('nextPage', { numPages: np }, function (evt) {
            var current_page = $(this).data('current_page');
            if (current_page < evt.data.numPages - 1) {
                selectPage(current_page + 1);
            }
            return false;
        });

        // When all initialisation is done, draw the links
        links = renderer.getLinks(current_page, paginationClickHandler, paginationTurn, paginationSelect);
        info = renderer.getInfo(current_page);
        containers.empty();
        if (np > 1 || opts.show_if_single_page) {
            if (opts.is_show_total) {
                info.appendTo(containers);
            }
            if (opts.is_show_mini_total) {
                var miniInfo = renderer.getMiniInfo(current_page);
                miniInfo.appendTo(containers);
            }
            links.appendTo(containers);
        }
        // call callback function
        if (opts.load_first_page) {
            opts.callback(current_page, containers);
        }
    } // End of $.fn.pagination block

})(jQuery);
