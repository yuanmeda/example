/*!
 * 测评中心前台列表
 */
(function ($, window) {
    'use strict';
    var store = {
        // 考试列表(GET)
        getExamList: function (data) {
            var url = selfUrl + '/' + projectCode + '/exam_center/exams?' + data;

            return $.ajax({
                url: url,
                type: "GET",
                cache: false
            });
        }
    };
    var skinMap = {
        blue: '#38adff'
    };

    var viewModel = {
        keyword: ko.observable(''),
        model: {
            totalCount: '',
            init: false,
            items: [],
            filter: {
                pageSize: 20,
                pageIndex: 0,
                catalogs: [tag_id],
                flag: -1,
                order_by: sortType || '0',
                exam_status: 2
            },
            projectCode: projectCode
        },
        items: [],
        clist: ko.observable({}),
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('container'));
            $(document).trigger('showContent');
            // if (sortType == '2')
            //     $('.tool-r.fr').children('a[data-id=2]').click();
            // else if (sortType == '1')
            //     $('.tool-r.fr').children('a[data-id=1]').click();
            // else if (sortType == '0')
            //     $('.tool-r.fr').children('a[data-id=0]').click();

            this.list(0);
            //监听标签变化
            this.clist.sub("clist", $.proxy(function (val) {
                if (val.catalogs().toString() != this.model.filter.catalogs().toString()) {
                    this.model.filter.flag(val.flag());
                    this.model.filter.catalogs(val.catalogs());
                    this.list(0);
                }
            }, this));
        },
        statusSearch: function (mode) {
            var _self = this;
            if (_self.model.filter.exam_status() == mode) return;
            _self.model.filter.exam_status(mode);
            this.list(0);
        },
        goToDetail: function (data) {
            if (data.sub_type != 2 && data.sub_type != 3) {
                var w = window.open();
                w.location.href = selfUrl + '/' + projectCode + '/' + (data.offline_exam ? 'exam/offline_exam' : 'exam') + '/prepare' + (data.offline_exam ? '?tmpl_id=' : '/') + data.id + (data.offline_exam ? '&location_source=' : '?location_source=') + (data.paper_location ? data.paper_location : 1)
            } else if (data.sub_type == 2) {
                var w = window.open();
                if (!source || source != 'barrier') {
                    w.location.href = selfUrl + '/' + projectCode + '/exam/barrier?exam_id=' + data.id + '&barrier_name=' + data.title;
                } else {
                    if (!proceed_url) {
                        w.location.href = selfUrl + '/' + projectCode + '/exam/ebarrier?exam_id=' + data.id + '&barrier_name=' + data.title;
                    } else {
                        w.location.href = proceed_url.replace('{exam_id}', data.id).replace('{barrier_name}', data.title);
                    }
                }
            } else if (data.sub_type == 3) {
                var w = window.open();
                w.location.href = selfUrl + '/' + projectCode + '/exam/tounament/prepare/' + data.id
            } else {
                $.fn.udialog.alert(i18n.examList.message, {
                    width: '460px',
                    title: i18n.examList.title,
                    buttons: [{
                        text: i18n.examList.sure,
                        click: function () {
                            $(this).udialog("hide");
                        },
                        'class': 'ui-btn-primary'
                    }]
                });
            }
        },
        //获取公开课列表数据
        list: function (pageIndex) {
            if (pageIndex === 0)
                this.model.filter.pageIndex(0);

            var filter = this.model.filter,
                searchData = "page=" + filter.pageIndex() +
                    "&size=" + filter.pageSize() +
                    "&order_by=" + filter.order_by() +
                    (filter.exam_status() ? "&exam_status=" + filter.exam_status() : '') +
                    "&title=" + encodeURIComponent(this.keyword()) +
                    "&enabled=" + true;
            if (!filter.catalogs().length)
                searchData += "&tag_exists=false";

            $.each(filter.catalogs(), function (i, catalog) {
                searchData += "&tag_ids=" + catalog;
            });
            store.getExamList(searchData).done($.proxy(function (data) {
                this.items = data.items || [];
                this.model.items(this.items);
                this.model.totalCount(data.count);
                this.model.init(true);
                this.page(data.count, filter.pageIndex());

                $(".item-title").each(function (i) {
                    var divH = $(this).height();
                    var $p = $("span", $(this)).eq(0);
                    while ($p.height() > divH) {
                        $p.text($p.text().substring(0, $p.text().length - 4));
                        $p.text($p.text() + "...");
                    }
                });
                $('.js-lazy:not(.loaded)').lazyload({
                    load: function () {
                        $(this).addClass('loaded');
                    }
                }).trigger('scroll');
            }, this));
        },
        page: function (totalCount, currentPage) {
            $('#pagination').pagination(totalCount, {
                items_per_page: this.model.filter.pageSize(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                callback: $.proxy(function (page_id) {
                    if (page_id != currentPage) {
                        this.model.filter.pageIndex(page_id);
                        this.list();
                    }
                }, this)
            });
        },
        orderSearch: function (mode) {
            var _self = this;
            if (_self.model.filter.order_by() == mode) return;
            _self.model.filter.order_by(mode);
            _self.list(0);
        },
        gotoExam: function (url) {
            window.open(url);
        },
        formatDate: function (time) {
            if (time)
                return $.format.toBrowserTimeZone(Date.ajustTimeString(time), 'yyyy-MM-dd HH:mm');
            return ""
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);
