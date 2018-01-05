(function () {
    'use strict';
    var $mq = null;
    var cache = (function () {
        if ('localStorage' in window) {
            return {
                get: function (key) {
                    return localStorage.getItem(key);
                },
                set: function (key, value) {
                    return localStorage.setItem(key, value);
                }
            };
        } else {
            return {
                get: function () {
                },
                set: function () {
                }
            }
        }

    })();
    var store = {
        getList: function (data) {
            return $.ajax({
                url: '/v1/live/courses/m/search',
                dataType: 'json',
                data: data,
                cache: false
            });
        },
        delete_course: function (id) {
            return $.ajax({
                url: '/v1/live/courses/m/' + id,
                type: 'delete'
            });
        },
        toggle_online_course: function (data) {
            return $.ajax({
                url: '/v1/live/courses/status/' + data.status,
                type: 'PUT',
                data: JSON.stringify(data.id)
            });
        }
    };
    var ViewModel = {
        model: {
            search: {
                name: '',
                live_type: 0, //直播状态:0直播，1录播
                page: 0,
                size: 20
            },
            live_course: {
                items: [],
                total: 0
            },
            list_style: 'picture',//列表形式：picture图片，list列表
            isLoaded: false,
            failed: false, //列表加载失败
            search_history: [],
            delete_course: {
                id: 0,
                msg: ''
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.getList();
            this._eventHandler();
            this.model.search_history(this._getCache());
            ko.applyBindings(this, document.getElementById('js-livecourse-list'));
        },
        getList: function (name) {
            if (name && typeof name === 'string') {
                this.model.search.page(0);
                this.model.search.name($.trim(name));
            }
            var search = ko.mapping.toJS(this.model.search), t = this;
            this.model.isLoaded(false);
            this.model.failed(false);
            store.getList(search)
                .done(function (res) {
                    $.each(res.items, function (i, v) {
                        if(v)
                            $.extend(v, t._formatDateTime(v))
                    });
                    t.model.isLoaded(true);
                    t.model.live_course.items(res.items);
                    t.model.live_course.total(res.total);
                    t._pagination(res.total, t.model.search.page(), t.model.search.size());
                    $('.lazy-image:not(.loaded)').lazyload({
                        placeholder: defaultImage,
                        container: $("#js-lazyload-container"),
                        load: function () {
                            $(this).addClass('loaded');
                        }
                    }).trigger('scroll');
                    t._marquee();
                })
                .fail(function () {
                    t.model.live_course.items([]);
                    t.model.live_course.total(0);
                    t._pagination(0, t.model.search.page(), t.model.search.size());
                    t.model.failed(true);
                    t.model.isLoaded(true);
                });
            if (search.name) this._setCache(search.name);
        },
        change_list_style: function (style) {
            this.model.list_style(style);
            this._marquee();
        },
        change_live_type: function (type) {
            if (!this.model.isLoaded()) return;
            this.model.search.live_type(type);
            this.model.search.page(0);
            this.getList();
        },
        show_delete_modal: function (id, $data) {
            this.model.delete_course.id(id);
            var txt = '';
            if ($data.status) {
                txt = '该课程已上线，暂时无法删除';
            } else if (!$data.status && $data.enroll_count) {
                txt = '该课程已有学生报名，暂时无法删除';
            }
            this.model.delete_course.msg(txt);
            $('#js-course-delete-modal').show();
        },
        /*课程上下线*/
        toggle_online: function ($data) {
            var _self = this;
            var txt = $data.status === 0 ? '上线' : '下线';
            var params = {
                status: $data.status == 0 ? 1 : 0,
                id: [$data.id]
            };
            store.toggle_online_course(params).done(function (resData) {
                $.errorDialog((txt + '成功'), _self.getList.bind(_self)).show();
            });
        },
        hide_delete_modal: function () {
            this.model.delete_course.id(0);
            $('#js-course-delete-modal').hide();
        },
        delete_course: function () {
            var id = this.model.delete_course.id(), t = this;
            if (id) {
                this.hide_delete_modal();
                store.delete_course(id).done(function () {
                    t.model.search.page(0);
                    t.getList();
                });
            }
        },
        toggle_marquee: function (show, $data) {
            if ($data.jscss === 1) $data.toggle_marquee(show);
        },
        _marquee: function () {
            $mq && $mq.marquee('destroy');
            if (!$('.marquee').length) return;
            $mq = $('.marquee').marquee({
                duration: 10000,
                gap: 300,
                delayBeforeStart: 0,
                direction: 'left',
                duplicated: true
            });
        },
        _formatDateTime: function ($data) {
            var ct = this._datetimeToLong(window.currentTime),
                start = $data.unfinished_start_time ? $data.unfinished_start_time : "", //直播时间
                end = $data.unfinished_end_time ? $data.unfinished_end_time : "", //直播时间
                mstart = $data.max_live_start_time ? $data.max_live_start_time : "", //录播时间
                day = '',
                minute = '',
                css = 0; //0默认未开始直播 1today marquee今日直播跑马灯 2tomorrow明日 3today的样式，昨天及之前的直播
            if (!this.model.search.live_type()) {
                if (start && end) {
                    var st = this._datetimeToLong(timeZoneTrans(start)),
                        sa = this._datetimeToarray(timeZoneTrans(start)),
                        ea = this._datetimeToarray(timeZoneTrans(end)),
                        diff = st - ct;
                    if (!diff) {
                        day = '今天';
                        css = 1;
                    } else if (diff === 86400000) {
                        day = '明天';
                        css = 2;
                    } else if (diff <= -86400000) {
                        day = sa.slice(0, 3).join('.');
                        css = 3;
                    } else {
                        day = sa.slice(0, 3).join('.');
                    }
                    minute = sa[3] + '-' + ea[3];
                }
            } else {
                if (mstart) {
                    var msa = this._datetimeToarray((mstart));
                    day = msa.slice(0, 3).join('.');
                }
            }
            return {
                jsday: day,
                jsminute: minute,
                jscss: css,
                toggle_marquee: ko.observable(true)
            };
        },

        _datetimeToarray: function (time) {
            return time && time.substr(0, 16).replace(/[\s-]/g, '/').split('/');
        },
        _datetimeToLong: function (time) {
            return time && new Date(time.substr(0, 10).replace('T', ' ').replace(/-/g, '/')).getTime();
        },
        _eventHandler: function () {
            var t = this;
            $("#js-livecourse-search").on("focus", function () {
                if (t.model.search_history().length) $("#js-livecourse-searchhistory").slideDown(300);
            });
            $("#js-livecourse-search").on("keyup", function (event) {
                if (event.keyCode == 13) {
                    t.model.search.page(0);
                    t.getList();
                    $(this).blur();
                    $("#js-livecourse-searchhistory").slideUp(300);
                }
            });
            $("#js-livecourse-search").on("blur", function () {
                var _this = this, timeId = null;
                clearTimeout(timeId);
                timeId = setTimeout(function () {
                    $("#js-livecourse-searchhistory").hide();
                }, 400);
            });
        },
        _setCache: function (title) {
            if (!title) return;
            var item = {
                p: title,
                q: title,
                t: +new Date()
            };
            var obj = this._getCache();
            obj.unshift(item);
            obj = this._unique(obj);
            if (obj.length > 5) obj.length = 5;
            this.model.search_history(obj);
            cache.set('101PPTLIVECOURSE', JSON.stringify(obj));
        },
        _getCache: function () {
            return this._unique(JSON.parse(cache.get('101PPTLIVECOURSE') || "[]"));
        },
        _unique: function (array) {
            var data = {}, ret = [];
            for (var i = 0, len = array.length; i < len; i++) {
                if (!data[array[i].p]) {
                    data[array[i].p] = true;
                    ret.push(array[i]);
                }
            }
            return ret;
        },
        _pagination: function (count, offset, limit) {
            var t = this;
            $('#js-livecourse-pagination').pagination(count, {
                num_edge_entries: 1,
                num_display_entries: 5,
                items_per_page: limit,
                is_show_total: false,
                current_page: offset,
                prev_text: " ",
                next_text: " ",
                callback: function (index) {
                    if (index != offset) {
                        t.model.search.page(index);
                        t.getList();
                    }
                }
            })
        }
    };
    $(function () {
        ViewModel.init();
    });
})();
