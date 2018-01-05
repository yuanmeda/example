/*!
 * 前台头部nav
 */
(function ($, window) {
    //课程详细数据模型
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
    var viewModel = {
        model: {
            keyword: '',
            remind: false
        },
        _init: function () {
            //ko监听数据
            this.model = ko.mapping.fromJS(this.model);
            //ko绑定作用域
            if (document.getElementById('header')) ko.applyBindings(this, document.getElementById('header'));
            if (document.getElementById('header-list')) ko.applyBindings(this, document.getElementById('header-list'));
            //加载事件
            if (typeof channelUrlV2 != "undefined") {
                this.getRemind();
            }
            this._eventHandler();
        },
        /**
         * dom操作事件定义
         * @return {null} null
         */
        _eventHandler: function () {
            //用户头像hover事件
            $(".logined").hover(function () {
                $(this).find(".user-nav").stop(true, true).fadeIn();
            }, function () {
                $(this).find(".user-nav").stop(true, true).fadeOut();
            });
            //移动端hover事件
            $(".link-mobile").hover(function () {
                $(this).find(".link-down").stop(true, true).fadeIn();
            }, function () {
                $(this).find(".link-down").stop(true, true).fadeOut();
            });
            $("body").on("click", ".user-funs-message .btn-close", function () {
                $(".user-funs-message").fadeOut()
            })
        },
        toMySubscribe: function () {
            location.href = myStudyUrl + '/' + projectCode + '/mystudy/user_center#my-subscribe';
        },
        distributeUpload: function ($data, $event) {
            if($.isEmptyObject(userInfo) || !userInfo.user_id){
                location.href = portal_web_url + '/' + projectCode + '/account/login';
                return;
            }
            var href = $($event.target).data('href') + '?__return_url=' + encodeURIComponent(location.href),
                mac = Nova.getMacToB64(href);
            location.href = href + (mac ? '&__mac=' + mac : '');
        },
        getRemind: function () {
            var self = this;

            function fetchRemind() {
                return $.ajax({
                    url: channelUrlV2 + '/tag_subscribes/actions/remind',
                    type: 'GET',
                    cache: false
                });
            }

            function processRemind(result) {
                self.model.remind(result.existed);
            }

            if (userInfo.user_id) {
                fetchRemind()
                    .then(processRemind);
            }
        },
        search: function () {
            var wrap = $('#js_search_frm'),
                btn = $('.search-frm-btn', wrap),
                input = $('input', wrap),
                key = 'ELSEARCH',
                itemWrap = $('.search-history-list ul', wrap),
                frm = $('form', wrap),
                that = this;
            var obj = cache.get(key),
                timeId = 0;
            try {
                obj = JSON.parse(obj || '[]');
            } catch (e) {
                obj = [];
            }

            function some(items, title) {
                var result = false;
                $.each(items, function (index, item) {
                    if (item.p == title) {
                        result = true;
                        return false;
                    }
                });
                return result;

            }

            function clickEvent() {
                var txt = input.val();
                if (!txt) return;
                var item = {
                    p: txt,
                    q: txt,
                    t: +new Date()
                };
                var res = some(obj, txt);
                if (!res) obj.unshift(item);
                if (obj.length > 5) obj.length = 5;
                cache.set(key, JSON.stringify(obj));
                location.href = (window.migrationStatus == 3 ? window.portal_web_url : "") + '/' + projectCode + '/search?keyword=' + encodeURIComponent(txt);
                return false;
            }

            function inputEvent(evt) {
                itemWrap.hide();
                clearTimeout(timeId);
                timeId = setTimeout(function () {
                    var str = [],
                        uri = (window.migrationStatus == 3 ? window.portal_web_url : "") + '/' + projectCode + '/search?keyword=';
                    var newobj = that.unique(obj);
                    $.each(newobj, function (index, item) {
                        if (str.length <= 5) {
                            str.push('<li><a href="' + (uri + encodeURIComponent(item)) + '">' + that.htmlEscape(item) + '</a></li>');
                        }
                    });
                    cache.set(key, JSON.stringify(obj));
                    if (str.length) {
                        itemWrap.html(str.join('')).show();
                    }
                }, 100);

            }

            btn.click(clickEvent);
            frm.submit(clickEvent);
            var keyTimeId = 0;
            input.on('focus', inputEvent)
                .blur(function () {
                    clearTimeout(keyTimeId);
                    keyTimeId = setTimeout(function () {
                        itemWrap.hide();
                    }, 200);
                });
        },
        unique: function (array) {
            var data = {}, ret = [];
            for (var i = 0, len = array.length; i < len; i++) {
                if (!data[array[i].p]) {
                    data[array[i].p] = true;
                    ret.push(array[i].p);
                }
            }
            return ret;
        },
        //登陆
        login: function () {
            location.href = window.portal_web_url + '/' + projectCode + '/account/login?returnurl=' + encodeURIComponent(window.location.href);
            // location.href = '/' + projectCode + '/account/login?returnurl=' + encodeURIComponent(window.location.href);
            //兼容IE
            if (window.event)
                window.event.returnValue = false;
        },
        logout: function () {
            window.CloudAtlas && CloudAtlas.onProfileSignOff();
            if (go_through_uc) {
                var need_uc_logout = false;
                var myDate = new Date();
                myDate.setTime(myDate.getTime() - 1000);//设置时间
                var data = document.cookie;
                var dataArray = data.split(";");
                for (var i = 0; i < dataArray.length; i++) {
                    var varName = dataArray[i].split("=");
                    var name = $.trim(varName[0]);
                    if (name.indexOf("sso_version") >= 0) {
                        need_uc_logout = true;
                    }
                }
                if (need_uc_logout) {
                    ucManager.logOut().then(function (res) {
                        if (res == "success") {
                            document.cookie = "sso_version=; expires=" + myDate.toGMTString();
                            location.href = window.portal_web_url + "/" + projectCode + "/account/logout";
                            // location.href = "/" + projectCode + "/account/logout";
                        }
                    });
                } else {
                    location.href = window.portal_web_url + "/" + projectCode + "/account/logout";
                    // location.href = "/" + projectCode + "/account/logout";
                }
            } else {
                location.href = window.portal_web_url + "/" + projectCode + "/account/logout";
                // location.href = "/" + projectCode + "/account/logout";
            }

        },
        getUrl: function (type, url, headerName) {
            switch (type) {
                /*case 0:
                 return '/e/recommends';
                 case 1:
                 return '/e/courses';
                 case 2:
                 return '/e/trains';
                 case 3:
                 return '/e/jobs';
                 case 4:
                 return '/e/cloudcourses';
                 case 5:
                 return '/' + projectCode + '/open_course';
                 case 6:
                 return '/' + projectCode + '/exam_center';
                 case 7:
                 return '/' + projectCode + '/recommend';
                 case 8:
                 return '/' + projectCode + '/train';
                 case 9:
                 return '/' + projectCode + '/specialty';*/
                case 12:
                    var formatURL = url.substring(url.length - 1) === '/' ? url.substring(0, url.length - 1) : url;
                    return formatURL ? window.open(isLogin ? formatURL + '/101/?project_code=' + projectCode + '&__mac=' + Nova.getMacToB64(formatURL + '/101/?project_code=' + projectCode) : formatURL + '/101/?project_code=' + projectCode) : false;
                case 13:
                    return location.href = (isLogin ? (window.selfUrl || '') + '/' + projectCode + '/ImChart?headerName=' + headerName : window.portal_web_url + "/" + projectCode + '/account/login?returnurl=' + encodeURIComponent(url + '?headerName=' + headerName));
                default:
                    return location.href = url;
            }
        },
        toTargetCssDesc: function (type) {
            switch (type) {
                case 5:
                    return 'auxo-open-course';
                case 6:
                    return 'auxo-exam-center';
                case 7:
                    return 'auxo-recommend';
                case 8:
                    return 'auxo-train';
                case 9:
                    return 'auxo-specialty';
                case 11:
                    return 'auxo-certificate';
                case 13:
                    return 'ImChart';
            }
        },
        getCurrentChannel: function () {
            var searchStr = window.location.search;
            var result = null;
            if (searchStr) {
                searchStr = searchStr.substring(1);
                var searchArray = searchStr.split('&');
                var key;
                for (var i = 0; i < searchArray.length; i++) {
                    key = searchArray[i];
                    if (key.indexOf('channel_id') >= 0) {
                        result = key.substr(key.indexOf('=') + 1);
                        break;
                    }
                }
            }
            return result;
        },
        focus: function ($data, event) {
            $(event.delegateTarget).prev().prev().focus();
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
    };
    $(function () {
        viewModel._init();
        viewModel.search();
    });

})(jQuery, window);
