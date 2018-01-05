/*
home文件夹下js公用函数
*/

;(function ($, window) {
    window.commonJS = {
        //init初始化
        init: function () {
            //ajax失败回调
            var self = this;
            $(document).ajaxError(function(e, response, request, errType) {
                var error = response.responseJSON || JSON.parse(response.responseText);
                if (error.cause) {
                    self.alertTip(error.cause.message, {
                        title: i18n.common.addins.jquery.ajaxError.title,
                        btn: i18n.common.addins.jquery.ajaxError.close,
                        icon: 2
                    });
                } else {
                    self.alertTip(error.message, {
                        title: i18n.common.addins.jquery.ajaxError.title,
                        btn: i18n.common.addins.jquery.ajaxError.close,
                        icon: 2
                    });
                }
            });
            //加载layer插件扩展模块
            layer.config({
                extend: 'extend/layer.ext.js'
            });
        },
        alertTip: function(msg, options) {
            var _defer = $.Deferred();
            layer.alert(msg, options || {}, function(index) {
                layer.close(index);
                _defer.resolve();
            });
            return _defer.promise();
        },
        //通用事件处理
        //分页
        _page: function (totalCount, currentPage,cb) {
            var _this = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: _this.model.filter.pageSize(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: 'common.addins.pagination.prev',
                next_text: 'common.addins.pagination.next',
                callback: function (page_id) {
                    if (page_id != currentPage) {
                        _this.model.filter.pageIndex(page_id);
                        if(cb){
                            cb(true);
                        }else{
                            _this.list();
                        }
                         window.scrollTo(0, 0);
                    }
                }
            });
        },
        //分类索引事件
        catalogClick: function (binds, e) {
            var $this = $(e.currentTarget),
                $ul = $this.closest('ul'),
                type = $this.data('type'),
                id = $this.data('id') || '',
                temp = [];
            if ($this.hasClass('active')) {
                return;
            }
            $ul.find('li').removeClass('active');
            $this.addClass('active');
            //FilterIds数组索引处理(定义filterObj存放临时的索引数据)
            if (/^FilterIds/.test(type)) {
                if (!this.model.filterObj) {
                    this.model.filterObj = {};
                }
                var filterObj = this.model.filterObj;
                filterObj[type] = id;
                for (var val in filterObj) {
                    if (!filterObj[val]) {
                        continue;
                    }
                    temp.push(filterObj[val]);
                }
                this.model.filter['FilterIds'](temp);
                delete temp;
            } else {
                this.model.filter[type](id);
            }
            this.list();
        },
        //获取url参数对象
        _getUrlParams: function (url) {
            var obj = {};
            if (!url) {
                url = location.search.substring(1);
            } else {
                url = url.substring(url.indexOf('?') + 1);
            }
            var query = decodeURIComponent(url),
                pairs = query.split('&');
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i],
                    pos = pair.indexOf('=');
                if (pos >= 0) {
                    obj[pair.substring(0, pos)] = pair.substring(pos + 1);
                }
            }
            //pairs.forEach(function (pair, index) {
            //    var pos = pair.indexOf('=');
            //    if (pos >= 0) {
            //        obj[pair.substring(0, pos)] = pair.substring(pos + 1);
            //    }
            //});
            return obj;
        },
        //ajaxHandler(ajax打包)
        _ajaxHandler: function (url, data, type) {
            return $.ajax({
                url: url,
                cache: false,
                data: data&&JSON.stringify(data) || null,
                type: type || 'get',
                contentType: "application/json; charset=utf-8",
                error: function (err) {

                }
            });
        },
        formatSeconds: function (value) {
            var theTime = parseInt(value);// 秒
            var theTime1 = 0;// 分
            var theTime2 = 0;// 小时
            if (theTime > 60) {
                theTime1 = parseInt(theTime / 60);
                theTime = parseInt(theTime % 60);
                if (theTime1 > 60) {
                    theTime2 = parseInt(theTime1 / 60);
                    theTime1 = parseInt(theTime1 % 60);
                }
            }
            var result = '';
            if(theTime > 0)
                result = "" + parseInt(theTime) + i18n.common.frontPage.pickerSecond;
            if (theTime1 > 0)
                result = "" + parseInt(theTime1) + i18n.common.frontPage.pickerMinute + result;
            if (theTime2 > 0)
                result = "" + parseInt(theTime2) + i18n.common.frontPage.pickerHour + result;

            return result;
        },
        // 0：相等， 1：值一大于值二， -1：值一小于值二
        dateCompare: function (date1, date2) {
            date1 = Date.parse(date1);
            date2 = Date.parse(date2);

            var result = -1;

            if (date1 > date2)
                result = 1;
            if (date1 < date2)
                result = -1;
            if (date1 == date2)
                result = 0;

            return result;
        },
        _tab1: function (o1, o2, c, e, f) {
            $(o1).each(function (i) {
                $(this).on(e, function () {
                    $(o2).hide().eq(i).show();
                    $(o1).removeClass(c);
                    $(this).addClass(c);
                    //$(this).parents(f).find("img").lazyload();
                });
                if ($(this).hasClass(c)) {
                    $(this).addClass(c);
                    $(o2).hide().eq(i).show();
                    //$(this).parents(f).find("img").lazyload();
                }
            })
        }
    };

    $(function () {
        commonJS.init();
    });

})(jQuery, window);
