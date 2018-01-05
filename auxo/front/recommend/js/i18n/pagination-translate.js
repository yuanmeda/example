(function ($) {
    $.PaginationCalculator = function (maxentries, opts) {
        this.maxentries = maxentries;
        this.opts = opts;
    }
    $.extend($.PaginationCalculator.prototype, {
        numPages: function () {
            return Math.ceil((this.maxentries == 0 ? 1 : this.maxentries) / this.opts.items_per_page);
        },
        getInterval: function (current_page) {
            var ne_half = Math.floor(this.opts.num_display_entries / 2);
            var np = this.numPages();
            var upper_limit = np - this.opts.num_display_entries;
            var start = current_page > ne_half ? Math.max(Math.min(current_page - ne_half, upper_limit), 0) : 0;
            var end = current_page > ne_half ? Math.min(current_page + ne_half + (this.opts.num_display_entries % 2), np) : Math.min(this.opts.num_display_entries, np);
            return {
                start: start,
                end: end
            };
        }
    });
    $.PaginationRenderers = {}
    $.PaginationRenderers.defaultRenderer = function (maxentries, opts) {
        this.maxentries = maxentries;
        this.opts = opts;
        this.pc = new $.PaginationCalculator(maxentries, opts);
    }
    $.extend($.PaginationRenderers.defaultRenderer.prototype, {
        createLink: function (page_id, current_page, appendopts) {
            var lnk, np = this.pc.numPages();
            page_id = page_id < 0 ? 0 : (page_id < np ? page_id : np - 1);
            appendopts = $.extend({
                text: page_id + 1,
                classes: ""
            }, appendopts || {});
            if (page_id == current_page) {
                lnk = isNaN(parseInt(appendopts.text, 10)) ? $("<span class='current'>" + i18nHelper.getKeyValue(appendopts.text) + "</span>") : $("<span class='current'>" + appendopts.text + "</span>");
            } else {
                lnk = isNaN(parseInt(appendopts.text, 10)) ? $("<a>" + i18nHelper.getKeyValue(appendopts.text) + "</a>").attr('href', this.opts.link_to.replace(/__id__/, page_id)) : $("<a>" + appendopts.text + "</a>").attr('href', this.opts.link_to.replace(/__id__/, page_id));
            }
            if (appendopts.classes) {
                lnk.addClass(appendopts.classes);
            }
            lnk.data('page_id', page_id);
            return lnk;
        },
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
            return $("<div class='pagination-info pull-left'><span>" + i18nHelper.getKeyValue('common.addins.pagination.overview', {
                'currentPage': currentPage,
                'totalPage': totalPage,
                'totalCount': totalCount
            }) + "</span></div>");
        },
        getMiniInfo: function (current_page) {
            var currentPage = current_page + 1;
            var totalPage = this.pc.numPages();
            var totalCount = this.maxentries;
            return $("<div class='pagination-info pull-left'><span>" + i18nHelper.getKeyValue('common.addins.pagination.minOverview', {
                'currentPage': currentPage,
                'totalPage': totalPage,
                'totalCount': totalCount
            }) + "</span></div>");
        },
        getLinks: function (current_page, eventHandler, turnHandler, changeHandle) {
            var begin, end, interval = this.pc.getInterval(current_page), np = this.pc.numPages(), opt = this.opts, fragment = $("<div class='pagination'></div>");
            if (opt.is_show_total || opt.is_show_mini_total) {
                fragment.addClass("pull-right");
            }
            if (this.opts.is_show_first_last && current_page > 0) {
                $("<a class='first'>" + i18nHelper.getKeyValue('common.addins.pagination.first') + "</a>").attr('href', this.opts.link_to.replace(/__id__/, 0)).data('page_id', 0).appendTo(fragment);
            }
            if (this.opts.prev_text && (current_page > 0 || this.opts.prev_show_always)) {
                fragment.append(this.createLink(current_page - 1, current_page, {
                    text: this.opts.prev_text,
                    classes: "prev"
                }));
            }
            if (interval.start > 0 && this.opts.num_edge_entries > 0) {
                end = Math.min(this.opts.num_edge_entries, interval.start);
                this.appendRange(fragment, current_page, 0, end, {
                    classes: 'sp'
                });
                if (this.opts.num_edge_entries < interval.start && this.opts.ellipse_text) {
                    $("<span class='pre-page-break'>" + this.opts.ellipse_text + "</span>").appendTo(fragment);
                }
            }
            this.appendRange(fragment, current_page, interval.start, interval.end);
            if (interval.end < np && this.opts.num_edge_entries > 0) {
                if (np - this.opts.num_edge_entries > interval.end && this.opts.ellipse_text) {
                    $("<span class='pre-page-break'>" + this.opts.ellipse_text + "</span>").appendTo(fragment);
                }
                begin = Math.max(np - this.opts.num_edge_entries, interval.end);
            }
            if (this.opts.next_text && (current_page < np - 1 || this.opts.next_show_always)) {
                fragment.append(this.createLink(current_page + 1, current_page, {
                    text: this.opts.next_text,
                    classes: "next"
                }));
            }
            if (this.opts.is_show_first_last && (current_page != np - 1)) {
                $("<a class='last'>" + i18nHelper.getKeyValue('common.addins.pagination.last') + "</a>").attr('href', this.opts.link_to.replace(/__id__/, np - 1)).data('page_id', np - 1).appendTo(fragment);
            }
            if (this.opts.items_per.length > 0) {
                var items = []
                    , div = $("<div class='page-selector'><span>" + i18nHelper.getKeyValue('common.addins.pagination.eachPage') + "</span><select></select>" + i18nHelper.getKeyValue('common.addins.pagination.record') + "</div>")
                    , select = div.find("select");
                $.each(this.opts.items_per, function (index, value) {
                    items.push("<option value=" + value + ">" + value + "</option>");
                });
                select.html(items.join(",")).val(this.opts.items_per_page).change(changeHandle);
                fragment.append(div);
            }
            if (this.opts.is_show_input) {
                var input = $("<div class='page-input'>" + i18nHelper.getKeyValue("common.addins.pagination.jumpTo") + "<input type='text' maxlength='10' class='page-text' />" + i18nHelper.getKeyValue('common.addins.pagination.page') + "&nbsp;<input class='btn select-page-btn' type='button' value=\'" + i18nHelper.getKeyValue('common.addins.pagination.jump') + "\'></div>");
                fragment.append(input);
                $('.page-input .page-text', fragment).data("count", np).keydown(function (e) {
                    if (e.keyCode == 13)
                        turnHandler(e);
                });
                $('.page-input .select-page-btn', fragment).click(turnHandler);
            }
            $('a', fragment).click(eventHandler);
            return fragment;
        }
    });
    $.fn.pagination = function (maxentries, opts) {
        opts = $.extend({
            items_per_page: 10,
            num_display_entries: 11,
            current_page: 0,
            num_edge_entries: 0,
            link_to: "javascript:void(0)",
            prev_text: "common.addins.pagination.prev",
            next_text: "common.addins.pagination.next",
            ellipse_text: "...",
            prev_show_always: true,
            next_show_always: true,
            renderer: "defaultRenderer",
            pageClass: "",
            show_if_single_page: false,
            load_first_page: true,
            is_show_first_last: false,
            is_show_input: false,
            is_show_total: true,
            is_show_mini_total: false,
            items_per: [],
            perCallback: function () {
                return false;
            },
            callback: function () {
                return false;
            }
        }, opts || {});
        var containers = this, renderer, links, current_page, info, pc = new $.PaginationCalculator(maxentries, opts);

        function paginationClickHandler(evt) {
            var links, info, new_current_page = $(evt.target).data('page_id'), continuePropagation = selectPage(new_current_page);
            if (!continuePropagation) {
                evt.stopPropagation();
            }
            return continuePropagation;
        }

        function paginationTurn(evt) {
            var links, info, totalCount = $('.page-text', containers).data("count"), new_current_page = parseInt($(".page-text", containers).val()) - 1, continuePropagation;
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
            var select = $(this)
                , selectValue = select.val() - 0;
            if (!isNaN(selectValue)) {
                opts.items_per_page = selectValue;
                if ($.isFunction(opts.perCallback)) {
                    opts.perCallback(selectValue);
                }
            }
        }

        function selectPage(new_current_page) {
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
            var continuePropagation = opts.callback(new_current_page, containers);
            return continuePropagation;
        }

        if (opts.pageClass) {
            containers.addClass(opts.pageClass);
        }
        current_page = parseInt(opts.current_page);
        containers.data('current_page', current_page);
        maxentries = (!maxentries || maxentries < 0) ? 0 : maxentries;
        opts.items_per_page = (!opts.items_per_page || opts.items_per_page < 0) ? 1 : opts.items_per_page;
        if (!$.PaginationRenderers[opts.renderer]) {
            throw new ReferenceError("Pagination renderer '" + opts.renderer + "' was not found in jQuery.PaginationRenderers object.");
        }
        renderer = new $.PaginationRenderers[opts.renderer](maxentries, opts);
        var np = pc.numPages();
        containers.bind('setPage', {
            numPages: np
        }, function (evt, page_id) {
            if (page_id >= 0 && page_id < evt.data.numPages) {
                selectPage(page_id);
                return false;
            }
        });
        containers.bind('prevPage', function (evt) {
            var current_page = $(this).data('current_page');
            if (current_page > 0) {
                selectPage(current_page - 1);
            }
            return false;
        });
        containers.bind('nextPage', {
            numPages: np
        }, function (evt) {
            var current_page = $(this).data('current_page');
            if (current_page < evt.data.numPages - 1) {
                selectPage(current_page + 1);
            }
            return false;
        });
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
        if (opts.load_first_page) {
            opts.callback(current_page, containers);
        }
    }
})(jQuery);