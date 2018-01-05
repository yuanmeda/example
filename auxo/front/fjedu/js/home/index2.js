(function ($, window) {
    var store = {
        getCourseListByFilter: function (sort_type, page_size) {
            var data = {
                sort_type: sort_type,
                status: 1,
                online_status: 1,
                page_no: 0,
                page_size: page_size
            };
            return $.ajax({
                url: '/fjedu/resource_course',
                type: 'POST',
                data: JSON.stringify(data)
            })
        },
        getResourceList: function () {
            return $.ajax({
                url: '/fjedu/resource/resource_top'
            });
        },
        getRecommendList: function () {
            return $.ajax({
                url: '/fjedu/recommands?role_type=' + roleName
            });
        },
        getAppList: function () {
            return $.ajax({
                url: '/fjedu/resources/store_app',
                type: 'POST',
                data: JSON.stringify({
                    "topic": "commodity",
                    "size": 9,
                    "extras": {
                        "category": "total_download_count",
                        "types": ["system_android", "system_ios", "system_pc", "system_web"],
                        "coverages": ["Org/nd/OWNER", "App/fj/OWNER"]
                    }
                })
            })
        },
        getNews: function () {
            return $.ajax({
                url: '/fjedu/news'
            })
        },
        getActs: function () {
            return $.ajax({
                url: '/fjedu/acts'
            })
        },
        getNewsRecommend: function () {
            return $.ajax({
                url: '/fjedu/news_recommands?role_type=' + roleName
            })
        }
    };
    var timerId = 0;
    var viewModel = {
        model: {
            courseList: [],
            xCourseList: [],
            resourceList1: [],
            resourceList2: [],
            resourceList3: [],
            resourceList4: [],
            recommendList: [],
            actList: [],
            newsList: [],
            newsrecommendList: [],
            appList: [],
            isLogin: false
        },
        init: function () {
            var t = this;
            this.delayBanner();
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            this.course();
            this.recommend();
            this.news();
            this.act();
            this.newsrecommend();
            this.app();
            this.loadImg();
            $(window).scroll(this.loadImg).resize(this.loadImg);

            ucManager.isLogin().then(function (res) {
                if (res == 'true') {
                    ucManager.getUserInfo().then(function (res) {
                        if (typeof res == "object" && undefined != res.user_id) {
                            t.model.isLogin(true);
                        }
                    });
                }
            })
        },
        delayBanner: function () {
            var t = this,
                img = document.createElement('img'),
                imgs = $('.edupf-swiper-container .swiper-wrapper img');
            img.onload = function () {
                edupf.banner();
            };

            if (imgs.length)
                img.src = imgs[0].src;
        },
        app: function () {
            var t = this;
            store.getAppList().done(function (d) {
                t.model.appList(d);
                t.loadImg();
            });
        },
        newsrecommend: function () {
            var t = this;
            store.getNewsRecommend().done(function (d) {
                t.model.newsrecommendList(d);
                edupf.jyxw();
            });
        },
        news: function () {
            var t = this;

            store.getNews().done(function (news) {
                if (news.items.length > 6)
                    news.items.splice(6);

                t.model.newsList(news.items);
            });
        },
        act: function () {
            var t = this;

            store.getActs().done(function (acts) {
                if (acts.items.length > 2)
                    acts.items.splice(2);

                t.model.actList(acts.items);
                t.loadImg();
            });
        },
        recommend: function () {
            var t = this;

            store.getRecommendList().done(function (d) {
                t.model.recommendList(d);
                t.loadImg();
                edupf.setPostWidth();
            });
        },
        course: function () {//排序类型 1最新 2最热 3推荐
            var t = this;
            var sort_type = 0;

            if (roleName == 'student') {
                sort_type = 2;
                store.getCourseListByFilter(1, 10).done(function (d) {
                    t.model.xCourseList(d.items);
                    t.loadImg();
                    edupf.zxkc();
                });
            }
            else if (roleName == 'teacher') {
                sort_type = 1;
                store.getResourceList().done(function (d) {
                    for (var i = 0; i < d.length; i++) {
                        switch (d[i].type) {
                            case '$ON020000':
                                t.model.resourceList1(d[i].resource_vos.items);
                                break;
                            case '$ON030000':
                                t.model.resourceList2(d[i].resource_vos.items);
                                break;
                            case '$ON040000':
                                t.model.resourceList3(d[i].resource_vos.items);
                                break;
                            case 'shelve_time':
                                var groups = [], items = d[i].resource_vos.items, numCols = 7;
                                for (var i = 0; i < items.length; i += numCols) {
                                    var result = items.slice(i, i + numCols);
                                    groups.push(result);
                                }
                                t.model.resourceList4(groups);
                                break;
                        }
                    }
                    edupf.zxzy();
                });
            }
            else {
                sort_type = 3;
            }

            store.getCourseListByFilter(sort_type, 10).done(function (d) {
                if (d.items.length < 10)
                    d.items.splice(5);

                t.model.courseList(d.items);
                t.loadImg();
            });
        },
        sidebarClick: function (type) {
            switch (type) {
                case 1:
                    //作业
                    location.href = '/ls?nav=8';
                    break;
                case 2:
                    //通知公告
                    location.href = '/ls?nav=12';
                    break;
                case 3:
                    //我的备课
                    location.href = '/ls?nav=16';
                    break;
                case 4:
                    //教育百科
                    var url = baikeUrl;
                    var autoLogin = baikeUrl + "/#!/autologin?fromway=" + encodeURIComponent(url) + "&mode=session&auth=";
                    var mac = JsMAF.getAuthHeader(baikeUrl + '/', 'GET');
                    mac = encodeURI(base64_encode(mac));
                    window.open(autoLogin + mac);
                    break;
                case 5:
                    //笔记
                    location.href = '/ls?nav=11';
                    break;
                case 6:
                    //我的课程
                    location.href = elearningUrl + '/' + projectCode + '/mystudy/user_center';
                    break;
                case 7:
                    //问答社区
                    window.open('http://forum-web.social.web.sdp.101.com/fjedu');
                    break;
                case 8:
                    //老师学习报告
                    location.href = '/ls?nav=18';
                    break;

            }
        },
        formatTime: function (time) {
            if (!time)
                return '';

            return time.split('T')[0];
        },
        csUrl: function (url) {
            return url.replace('${ref-path}', cscdn + '/v0.1/static') + '?size=80';
        },
        loadImg: function () {
            window.clearTimeout(timerId);
            timerId = window.setTimeout(function () {
                $('img').each(function () {//遍历所有图片
                    var _this = $(this),
                        top = _this.offset().top - $(window).scrollTop();//计算图片top - 滚动条top
                    if (top > $(window).height()) {
                        return;
                    } else {
                        if (_this.attr('src') != _this.attr('data-original') && _this.attr('data-original'))
                            _this.attr('src', _this.attr('data-original'));
                    }
                });
            }, 500);
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery, window);