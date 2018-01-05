;
(function ($) {
    var store = {
        getLists: function (url) {
            return $.ajax({
                url: url,
                cache: false
            });
        }
    };
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
    var searchArr = location.href.replace(/&/g, '=').split('='), keywords = '';
    $.each(searchArr, function (i, v) {
        if (~v.toLowerCase().indexOf('keyword')) {
            try {
                keywords = decodeURIComponent(searchArr[i + 1]);
            } catch (e) {
                keywords = searchArr[i + 1];
            }
            return false;
        }
    });

    var channelObj = {'5': 'auxo-open-course', '6': 'auxo-exam-center', '8': 'auxo-train'};
    var viewModel = {
        model: {
            'auxo-open-course': {
                items: [],
                count: 0,
                title: opencourse
            },
            'auxo-exam-center': {
                items: [],
                count: 0,
                title: examcenter
            },
            'auxo-train': {
                items: [],
                count: 0,
                title: train
            },
            total: {
                items: [],
                count: 0,
                init: false
            },
            search: {
                keywords: keywords,
                size: 20,
                page: 0,
                custom_types: []
            },
            cookies: [],
            showTab: 0,
            channelType: '',
            oldKeyword: ''
        },
        init: function () {
            var timeId = 0, that = this;

            this.model = ko.mapping.fromJS(this.model);
            this.model.oldKeyword(this.htmlEscape(keywords));
            if (keywords) {
                this.getChannelList();
            } else {
                this.model.total.init(true);
            }

            this.model.total.count = ko.computed(function () {
                return this.model['auxo-open-course'].count() + this.model['auxo-exam-center'].count() + this.model['auxo-train'].count();
            }, this);

            if (keywords) this.setCache(keywords);
            this.model.cookies(this.unique(this.getCache()));

            $("#scinput").on("focus", function () {
                if (that.model.cookies().length) $(this).siblings("ul").slideDown(300);
            });
            $("#scinput").on("keyup", function (event) {
                if (event.keyCode == 13) {
                    $(this).blur().siblings("ul").slideUp(300);
                }
            });
            $("#scinput").on("blur", function () {
                var _this = this;
                clearTimeout(timeId);
                timeId = setTimeout(function () {
                    $(_this).siblings("ul").hide();
                }, 400);
            });

            ko.applyBindings(this, document.getElementById('searchPage'));
        },
        htmlEscape: function (text) {
            return text.replace(/[<>"'&]/g, function (match, pos, originalText) {
                switch (match) {
                    case "<":
                        return "&lt;";
                    case ">":
                        return "&gt;";
                    case "&":
                        return "&amp;";
                    case "\"":
                    case "\'":
                        return "&quot;";
                }
            });
        },
        highlightKey: function (text) {
            if (!text) return '';
            var reg = /^[\u4e00-\u9fa5A-Za-z\d]{1,}$/g;
            var key = keywords;
            if (reg.test(key)) {
                var exp = new RegExp(key, 'g');
                for (var i = 0, len = text.length; i < len; i++) {
                    return this.htmlEscape(text).replace(exp, '<i>' + key + '</i>');
                }
            } else {
                return this.htmlEscape(text);
            }

        },
        getChannelList: function (channelType, isSubmit) {
            this.model.showTab(channelType);
            if (!$.trim(this.model.search.keywords()) && (isSubmit || !keywords)) return;
            var customTypes = '';

            if (channelType) {
                this.model.search.size(20);
                if (this.model.channelType() !== channelType) {
                    this.model.channelType(channelType);
                    this.model.search.page(0);
                }
                customTypes = '&custom_types=' + channelType;
            } else {
                this.model.search.size(5);
                this.model.search.page(0);
                $.each(channels.split(''), function (i, v) {
                    customTypes = customTypes + '&custom_types=' + channelObj[v];
                });
            }
            var search = ko.mapping.toJS(this.model.search), that = this;
            if (isSubmit) {
                search.keywords = $.trim(search.keywords);
            } else {
                search.keywords = keywords;
            }
            var url = '/' + projectCode + '/resources?page=' + search.page + '&size=' + search.size + '&key=' + encodeURIComponent(search.keywords) + customTypes;
            store.getLists(url).done(function (data) {
                $.each(data, function (i, v) {
                    switch (v.custom_type) {
                        case 'auxo-exam-center':
                            that.model['auxo-exam-center'].count(v.page.count);
                            break;
                        case 'auxo-open-course':
                            that.model['auxo-open-course'].count(v.page.count);
                            break;
                        case 'auxo-train':
                            that.model['auxo-train'].count(v.page.count);
                            break;
                    }
                });
                that.model.total.items(data);
                that.model.oldKeyword(that.htmlEscape(search.keywords));
            }).always(function () {
                that.model.total.init(true);
                $('img.lazy').lazyload({
                    default_img: defaultImg
                });
                $('img.lazy').trigger('scroll');
            });
            if (keywords != search.keywords) this.setCache(search.keywords);
            keywords = search.keywords;
            if (channelType) this._page(this.model[channelType].count(), this.model.search.page(), channelType);
            window.scrollTo(0, 0);
        },
        goDetail: function (id, type, sub_type) {
            var _href = '';
            switch (type) {
                case 'auxo-train':
                    _href = '/' + projectCode + '/train/' + id;
                    break;
                case 'auxo-exam-center':
                    if (sub_type == 2) {
                        $.fn.udialog.alert(i18n.searchList.frontPage.mobileOnly, {
                            title: i18n.dialogWidget.frontPage.systemTip, buttons: [{
                                text: i18n.dialogWidget.frontPage.confirm, click: function () {
                                    $(this).udialog("hide");
                                }, 'class': 'ui-btn-primary'
                            }]
                        });
                    }
                    else if (sub_type == 3) {
                        _href = '/' + projectCode + '/exam/tounament/prepare/' + id;
                    }
                    else { 
                        _href = '/' + projectCode + '/exam/prepare/' + id;
                    }
                    break;
                case 'auxo-open-course':
                    _href = '/' + projectCode + '/course/' + id;
                    break;
            }
            if (_href) {
                location.href = _href;
            }
        },
        getCurrentCount: function () {
            var type = this.model.showTab();
            return type ? !this.model[type].count() : !this.model.total.count();
        },
        formatTitle: function (customType) {
            return this.model[customType].title();
        },
        setCache: function (title) {
            if (!title) return;
            var item = {
                p: title,
                q: title,
                t: +new Date()
            };
            var obj = this.getCache();
            obj.unshift(item);
            obj = this.unique(obj);
            if (obj.length > 5) obj.length = 5;
            this.model.cookies(obj);
            cache.set('ELSEARCH', JSON.stringify(obj));
        },
        getCache: function () {
            return JSON.parse(cache.get('ELSEARCH') || "[]");
        },
        unique: function (array) {
            var data = {}, ret = [];
            for (var i = 0, len = array.length; i < len; i++) {
                if (!data[array[i].p]) {
                    data[array[i].p] = true;
                    ret.push(array[i]);
                }
            }
            return ret;
        },
        focus: function ($data, event) {
            $(event.delegateTarget).prev().focus();
        },
        _page: function (totalCount, currentPage, type) {
            var _this = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: _this.model.search.size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                callback: function (page_id) {
                    if (page_id != currentPage) {
                        _this.model.search.page(page_id);
                        _this.getChannelList(type);
                    }
                }
            });
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery);