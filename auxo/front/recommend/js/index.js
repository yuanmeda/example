;
(function ($) {
    //数据仓库
    var store = {
        //获取轮播图
        getBanners: function () {
            var url = (window.selfUrl || '') + '/' + projectCode + '/recommends/banners';
            return commonJS._ajaxHandler(url, null, 'get');
        },

        //获取被推荐列表
        getRecommends: function () {
            var url = (window.selfUrl || '') + '/' + projectCode + '/recommends/courses?page_size=8';
            return commonJS._ajaxHandler(url, null, 'get');
        }
    };

    //数据模型
    var viewModel = {
        model: {
            banners: [],
            recommends: [],
            init: false
        },
        init: function () {
            $.extend(this, commonJS);

            this.model = ko.mapping.fromJS(this.model);

            this.list();

            ko.applyBindings(this, document.getElementById('recommendList'));
        },
        list: function () {
            var self = this;
            //获取轮播、推荐
            store.getBanners().done(function (data) {
                self.model.banners(data.items);
                $('#j_item').uswipe({
                    itemNum: 1,
                    slideItemNum: data.items.length
                });
            });
            store.getRecommends().done(function (data) {
                if (data) {
                    self.model.recommends(data);
                    self.model.init(true);
                    $('img.lazy').lazyload({
                        default_img: defaultImg
                    });
                    $('img.lazy').trigger('scroll');
                    $(".item-title").each(function (i) {
                        var divH = $(this).height();
                        var $p = $("span", $(this)).eq(0);
                        while ($p.height() > divH) {
                            $p.text($p.text().substring(0, $p.text().length - 4));
                            $p.text($p.text() + "...");
                        }
                    });
                }
            });
        },
        getBannerClick: function (banner) {
            switch (banner.custom_type) {
                case 'auxo-exam-center':
                    if (banner.sub_type != 2 && banner.sub_type != 3) {
                        return location.href = elearningWebfrontUrl + '/' + projectCode + '/' + (banner.offline_exam ? 'exam/offline_exam' : 'exam') + '/prepare' + (banner.offline_exam ? '?tmpl_id=' : '/') + banner.custom_id + (banner.offline_exam ? '&location_source=' : '?location_source=') + (banner.paper_location ? banner.paper_location : 1)
                    } else {
                        $.fn.udialog.alert(i18n.recommend.mobileOnly, {
                            title: i18n.dialogWidget.frontPage.systemTip,
                            buttons: [{
                                text: i18n.dialogWidget.frontPage.confirm,
                                click: function () {
                                    $(this).udialog("hide");
                                },
                                'class': 'ui-btn-primary'
                            }]
                        });
                    }
                    break;
                case 'auxo-open-course':
                    return location.href = courseWebfront + '/' + projectCode + '/course/' + banner.custom_id;
                case 'url-address':
                    return banner.web_url ? location.href = banner.web_url : false;
                case 'auxo-train':
                    return location.href = trainWebfront + '/' + projectCode + '/train/' + banner.custom_id;
                default:
                    return false;
            }
        },
        recommendClick: function ($data) {
            var url = '';
            if ($data.recommend_course_vo.custom_order_by || $data.recommend_course_vo.custom_order_by === 0) {
                url = $data.recommend_course_vo.custom_id_type == 'root_tag' ? '?sort_type=' + $data.recommend_course_vo.custom_order_by : '?tag_id=' + $data.recommend_course_vo.custom_id + '&sort_type=' + $data.recommend_course_vo.custom_order_by;
            }
            switch ($data.recommend_course_vo.custom_type) {
                case 'auxo-exam-center':
                    location.href = elearningWebfrontUrl + '/' + projectCode + '/exam_center' + url;
                    return;
                case 'auxo-open-course':
                    location.href = opencourseWebfront + '/' + projectCode + '/open_course' + url;
                    return;
                case 'auxo-train':
                    location.href = trainWebfront + '/' + projectCode + '/train' + url;
                    return;
            }
        },
        goToDetail: function (data) {
            if (data.sub_type == 3) {
                location.href = elearningWebfrontUrl + '/' + projectCode + '/exam/tounament/prepare/' + data.id
            } else if (data.sub_type != 2 && data.sub_type != 3) {
                location.href = elearningWebfrontUrl + '/' + projectCode + '/' + (data.offline_exam ? 'exam/offline_exam' : 'exam') + '/prepare' + (data.offline_exam ? '?tmpl_id=' : '/') + data.id + (data.offline_exam ? '&location_source=' : '?location_source=') + (data.paper_location ? data.paper_location : 1)
            } else {
                $.fn.udialog.alert(i18n.recommend.mobileOnly, {
                    title: i18n.dialogWidget.frontPage.systemTip,
                    buttons: [{
                        text: i18n.dialogWidget.frontPage.confirm,
                        click: function () {
                            $(this).udialog("hide");
                        },
                        'class': 'ui-btn-primary'
                    }]
                });
            }
        },
        goToOpenCourse: function ($data, event) {
            location.href = opencourseWebfront + '/' + projectCode + '/open_course?tag_id=' + $data.id;
        },
        gotoExam: function (url) {
            window.open(url);
        },
        //将时间转换为'yyyy-MM-dd hh:mm'
        formatDate: function (time) {
            if (time)
                return $.format.toBrowserTimeZone(Date.ajustTimeString(time), 'yyyy-MM-dd HH:mm');
            return ""
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery);
