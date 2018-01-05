(function () {
    "use strict";
    var groupNames = (function () {
        return $.map(window.allGroupNames, function (v) {
            return v.name;
        })
    })();
    var store = {
        getChannelSection: function () {
            return $.ajax({
                url: '/' + projectCode + '/channels/' + channel_id + '/sections',
                data: {query_type: 1},
                cache: false,
                dataType: 'json'
            });
        },
        createSection: function (data) {
            return $.ajax({
                url: channelUrl + '/v1/channels/' + channel_id + '/sections',
                type: 'post',
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(data)
            });
        },
        remove: function (id) {
            return $.ajax({
                url: channelUrl + '/v1/sections/' + id + '/',
                type: 'delete'
            });
        },
        move: function (id, next_section_id) {
            return $.ajax({
                url: channelUrl + '/v1/sections/' + id + '/actions/move?next_section_id=' + next_section_id,
                type: 'put'
            })
        },
        getChangeState: function () {
            return $.ajax({
                url: channelUrl + '/v1/channels/' + channel_id + '/properties/sectionUpgrade',
                cache: false,
                dataType: 'json'
            });
        },
        saveLayout: function () {
            return $.ajax({
                url: channelUrl + '/v1/channels/' + channel_id + '/sections/actions/submit',
                type: 'post'
            });
        },
        revertLayout: function () {
            return $.ajax({
                url: channelUrl + '/v1/channels/' + channel_id + '/sections/actions/recover',
                type: 'post'
            });
        }
    };
    var viewModel = {
        model: {
            plateList: [{
                section_name: 'Banner推荐 ',
                description: '图片轮播',
                type: 1
            }, {
                section_name: '橱窗推荐',
                description: '资源标签下的几个资源，或者选定的某些资源',
                type: 2
            }, {
                section_name: '图标导航区',
                description: '以小图标/图文的方式进行排版，点击小图标可以跳转到推荐内容，图标导航区只在手机端展示，WEB端不显示图标导航区',
                type: 3
            }, {
                section_name: '频道资源',
                description: '该板块展示本频道下资源，或本频道中选定标签下的资源（频道资源板块的排版只能置底，不能往上或者往下移动）。',
                type: 4
            }, {
                section_name: '全部资源',
                description: '该板块展示资源池中的所有资源，或资源池中选定标签下的资源（全部资源板块的排版只能置底，不能往上或者往下移动），全部资源和频道资源只能二选一。',
                type: 5
            }, {
                section_name: '推荐版块',
                description: '该版块通过设置可为用户推荐合适的学习内容',
                type: 6
            }],
            disable: false,
            disable_move: false,
            isScroll: false,
            isBottom: false,
            tab_fixed: false,
            isChange: 'false',
            sectionList: [],
            init: false
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.getChannelSection();
            this.getChangeState();
            this.model.tab_fixed.extend({rateLimit: 50});
            var oft = $('#js_cl_layout_tab').offset().top;
            $(document).scroll($.proxy(this.fixTab, this, oft));
            ko.applyBindings(this);

            $('#plateModal [data-toggle="tooltip"]').tooltip();
        },
        fixTab: function (offsetTop, event) {
            var target = $(event.target),
                result = target.scrollTop() > offsetTop;
            this.model.tab_fixed(result);
        },
        scroll: function () {
            var html = $('html,body'),
                list = $('.component-wrap'),
                index = (this.model.isBottom() || !this.model.disable()) ? list.length - 1 : list.length - 2,
                oft = list.eq(index).offset().top - 120;
            html.stop().animate({
                scrollTop: oft + 'px'
            });
        },
        getChangeState: function () {
            var that = this;
            store.getChangeState().done(function (res) {
                if (res) that.model.isChange(res.property_value || 'false');
            })
        },
        getChannelSection: function () {
            var that = this;
            this.model.init(false);
            store.getChannelSection().done(function (res) {
                that.model.disable(false);
                that.model.disable_move(false);
                that.model.sectionList(res);
                for (var i = 0; i < res.length; i++) {
                    if (res[i].type === 4 || res[i].type === 5) {
                        that.model.disable(true);
                        break;
                    }
                }
                if (res.length >= 2 && that.model.disable()) that.model.disable_move(true);
                if (that.model.isScroll() && res.length > 1) {
                    ko.tasks.schedule(function () {
                        that.scroll();
                    });
                    that.model.isScroll(false);
                }
            }).always(function () {
                that.model.init(true);
            });
        },
        selectSection: function ($data) {
            var that = this,
                type = $data.type(),
                data = {};
            switch (type) {
                case 1:
                    data = {
                        setting: JSON.stringify({
                            "display": {
                                "show_tags": false, //是否显示标签
                                "banner_width": "center" //center居中，full全屏
                            }
                        })
                    };
                    break;
                case 2:
                    data = {
                        setting: JSON.stringify({
                            "data": {
                                "title": "橱窗推荐",
                                "data_type": 1,
                                "order_type": 3,
                                "group_names": groupNames,
                                "tag_id": "",
                                "channel_id": "",
                                "resources": []
                            },
                            "display": {
                                "is_title_show": true,
                                "web": {
                                    "row_num": 2,
                                    "column_num": 4,
                                    "ad_enable": false,
                                    "ad_logo": "",
                                    "ad_url": ""
                                },
                                "mobile": {
                                    "display_type": 1,
                                    "display_num": 5,
                                    "row_num": 2,
                                    "column_num": 2,
                                    "ad_enable": false,
                                    "ad_logo": "",
                                    "ad_url": ""
                                }
                            }
                        })
                    };
                    break;
                case 3:
                    data = {
                        setting: JSON.stringify({"display": {"display_type": 1, "row_num": 2, "column_num": 4}})
                    };
                    break;
                case 4:
                    data = {
                        setting: JSON.stringify({
                            "data": {"title": "频道资源", "group_names": groupNames, "tag_id": ""},
                            "display": {
                                "is_title_show": false,
                                "is_tag_show": true,
                                "is_sort_enabled": true,
                                "order_type": 1,
                                "is_filter_enabled": true,
                                "filter_type": 2,
                                "is_show_price_filter": false
                            }
                        })
                    };
                    break;
                case 5:
                    data = {
                        setting: JSON.stringify({
                            "data": {"title": "全部资源", "group_names": groupNames, "tag_id": ""},
                            "display": {
                                "is_title_show": false,
                                "is_tag_show": true,
                                "is_sort_enabled": true,
                                "order_type": 1,
                                "is_filter_enabled": true,
                                "filter_type": 2,
                                "is_show_price_filter": false
                            }
                        })
                    };
                    break;
                case 6:
                    data = {
                        setting: JSON.stringify({
                            "data": {
                                "title": "为你推荐",
                                "rules": []
                            },
                            "display": {
                                "is_title_show": true,
                                "web": {"row_num": 3, "column_num": 4, "show_num": 3},
                                "mobile": {
                                    "display_type": 1,
                                    "display_num": 5,
                                    "row_num": 4,
                                    "column_num": 2,
                                    "show_num": 2
                                }
                            }
                        })
                    };
                    break;
            }
            $('.tooltip').remove();
            store.createSection($.extend({type: type}, data)).done(function (res) {
                $('#plateModal').modal('hide');
                that.model.isScroll(true);
                that.model.isBottom(type === 4 || type === 5);
                that.model.isChange('true');
                that.getChannelSection();
            });
        },
        remove: function (id) {
            var that = this;
            $.confirm({
                title: '系统提示',
                content: "确定删除吗？",
                buttons: {
                    confirm: {
                        text: '确定',
                        btnClass: 'btn-primary',
                        action: function () {
                            store.remove(id).done(function () {
                                that.model.isChange('true');
                                that.getChannelSection();
                            });
                        }
                    },
                    cancel: {
                        text: '取消',
                        action: function () {
                        }
                    }
                }
            });
        },
        move: function (id, index, dir) {
            var list = this.model.sectionList(),
                len = list.length;
            if ((index === 0 && dir === -1) || (index === len - 1 && dir === 2)) return;
            var that = this,
                next_id = (list[index + dir] || "") && list[index + dir].id;
            store.move(id, next_id).done(function () {
                that.model.isChange('true');
                that.getChannelSection();
            });
        },
        saveLayout: function () {
            var that = this;
            store.saveLayout().done(function () {
                that.model.isChange('false');
                $.simplyToast("保存成功！");
                that.getChannelSection();
            });
        },
        revertLayout: function () {
            var that = this;
            $.confirm({
                title: '系统提示',
                content: "确定还原吗？",
                buttons: {
                    confirm: {
                        text: '确定',
                        btnClass: 'btn-primary',
                        action: function () {
                            store.revertLayout().done(function () {
                                that.model.isChange('false');
                                that.getChannelSection();
                            });
                        }
                    },
                    cancel: {
                        text: '取消',
                        action: function () {
                        }
                    }
                }
            });
        },
        getTitle: function (type) {
            switch (type) {
                case 1:
                    return 'Banner推荐';
                case 2:
                    return '橱窗推荐';
                case 3:
                    return '图标导航区';
                case 4:
                    return '频道资源';
                case 5:
                    return '全部资源';
                case 6:
                    return '推荐版块';
            }
        }
    };
    $(function () {
        viewModel.init();
    });
})();
var default_img_base64 = 'data:image/png;base64,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';