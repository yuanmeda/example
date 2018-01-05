/**
 * Created by Administrator on 2016-11-4.
 */
/**
 * 用户中心组件
 */
(function ($, window) {

    var STATIC_URL = window['staticUrl'];


    'use strict';
    /**
     * 我的证书数据模型
     * @param {Object} params 模块参数(projectCode:项目标识)
     */
    function CertificateModel(params) {
        this.model = {
            // TAB索引
            tabIndex: 3,
            isLoading: false,
            applicationList: [],
            filter: {
                status: 3,
                page: 0,
                size: 20
            },
            init: {
                gotten: false,
                applying: false
            },
            more: {
                gotten: false,
                applying: false
            }

        };
        this.params = params || {};
        // 数据仓库
        this.store = {
            // 获取我的证书列表
            getCertificates: function (filter) {
                var url = (typeof certificateFrontUrl == 'undefined' ? '' : certificateFrontUrl) + '/' + projectCode + '/certificates/mine';
                return $.ajax({
                    url: url,
                    type: 'GET',
                    data: filter
                });
            },
        };
        this.initModel();
    }

    /**
     * ko组件共享事件定义
     * @type {Object}
     */
    CertificateModel.prototype = {
        initModel: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.initData();
        },
        /**
         * 初始化数据
         */
        initData: function () {
            var that = this;
            this.switchTab(3);

        },
        /**
         * 证书列表
         */
        getCertificates: function () {
            var that = this,
                data = ko.mapping.toJS(this.model.filter);
            this.model.isLoading(true);
            return this.store.getCertificates(data).done(function (data) {
                $.each(data.items, function (i, v) {
                    if (!v.photo_url) {
                        v.photo_url = STATIC_URL + "auxo/front/certificate/images/course.png";
                    } else {
                        v.photo_url += '!m270x180.jpg';
                    }
                });
            }).always(function () {
                that.model.isLoading(false);
            });
        },
        /**
         *状态
         * @param tabIndex
         */
        showStatus: function (status) {
            var str = null;
            if (status == 3) {
                str = i18nHelper.getKeyValue('certificate.all.alreadyObtain');
            } else if (status == 1) {
                str = i18nHelper.getKeyValue('certificate.all.application');
            }

            return str;
        },
        /**
         *
         * @param tabIndex
         */
        switchTab: (function () {
            var gottenList = [],
                applyingList = [];
            return function (tabIndex) {
                var that = this;
                this.model.filter.status(tabIndex);
                // 已获取
                if (tabIndex === 3) {
                    if (!that.model.init.gotten()) {
                        this.getCertificates().then(function (data) {
                            that.model.applicationList(data.items || []);
                            that.model.init.gotten(true);
                            if (data.items.length > 6) {
                                that.model.more.gotten(true);
                            }
                            gottenList = data.items;
                        });
                    } else {
                        this.model.applicationList(gottenList);
                    }
                }
                // 申请中
                if (tabIndex === 2) {
                    if (!that.model.init.applying()) {
                        this.getCertificates().then(function (data) {
                            that.model.applicationList(data.items || []);
                            that.model.init.applying(true);
                            if (data.items.length > 6) {
                                that.model.more.applying(true);
                            }
                            applyingList = data.items;
                        });
                    } else {
                        this.model.applicationList(applyingList);
                    }
                }
                this.model.tabIndex(tabIndex);
            };
        }()),
        certificateDetail: function (item) {
            location.assign((typeof certificateFrontUrl == 'undefined' ? '' : certificateFrontUrl) + '/' + projectCode + '/certificate/detail/' + item.id);
        },
        showMoreThenHideBtn: function () {
            var tabIndex = this.model.tabIndex();
            if (tabIndex === 3) {
                this.model.more.gotten(false);
            } else if (tabIndex === 2) {
                this.model.more.applying(false);
            }
        }
    };

    /**
     * 注册ko组件my-certificate
     */
    ko.components.register('x-my-certificate', {
        synchronous: true,
        viewModel: CertificateModel,
        template: '<div class="wrapper wrapper-index" id="boostrap">\
        <div class="certificate-list">\
            <div class="statues-sorts">\
                <ul class="statues-switch">\
                    <li data-bind="click:switchTab.bind($component,3,$element), css: {\'active\': model.tabIndex() === 3}">\
                        <a href="javascript:">\
                         <!--ko translate:{key: "certificate.mine.got"}-->\
                         <!--/ko -->\
                        </a>\
                    </li>\
                    <li data-bind="click:switchTab.bind($component,2,$element), css: {\'active\': model.tabIndex() === 2}">\
                        <a href="javascript:">\
                                                 <!--ko translate:{key: "certificate.mine.applying"}-->\
                         <!--/ko -->\
                        </a>\
                    </li>\
                </ul>\
                <div class="clear"></div>\
            </div>\
            <div>\
                <ul data-bind="foreach:model.applicationList, visible:model.applicationList().length, \
                    css: {\'h-576\': (model.tabIndex() === 3 && model.more.gotten()) ||\
                                     (model.tabIndex() === 2 && model.more.applying()) }" class="certificate-show clearfix" >\
                    <li class="certificate-box">\
                        <a href="javascript::;" data-bind="click:$component.certificateDetail.bind(id)" target="_blank">\
                            <div class="certificate-status" data-bind="text:$component.showStatus(status),css: {\'gotten\':status === 3}"></div>\
                            <div class="img-box">\
                                <img class="lazy" data-bind="attr: {src: photo_url}" style="display: block;width: 270px;height: 180px;">\
                            </div>\
                            <h2 class="certificate-name" data-bind="text:name"></h2>\
                        </a>\
                    </li>\
                </ul>\
                <div class="nocertificate" data-bind="visible:!model.applicationList().length">\
                     <span class="icon-common-empty"></span>\
                     <p class="words">\
                        <!--ko translate:{key: "certificate.mine.noCertificate"}-->\
                         <!--/ko -->\
                     </p>\
                </div>\
            </div>\
            <a href="javascript:" class="show-more" style="display: none" data-bind="visible: model.tabIndex() === 3 && model.more.gotten(), click: showMoreThenHideBtn">\
                <!--ko translate:{key: "certificate.mine.showMore"}-->\
                <!--/ko -->\
            </a>\
            <a href="javascript:" class="show-more" style="display: none" data-bind="visible: model.tabIndex() === 2 && model.more.applying(), click: showMoreThenHideBtn">\
                <!--ko translate:{key: "certificate.mine.showMore"}-->\
                <!--/ko -->\
            </a>\
        </div>\
    </div>'
    });
})(jQuery, window);