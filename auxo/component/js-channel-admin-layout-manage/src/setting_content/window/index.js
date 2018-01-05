import ko from 'knockout'
import tpl from './template.html'

const _ = ko.utils;
const EVENT_TYPE = 'GET_CHANGE_STATE';
const groupNames = (function () {
    return $.map(window.allGroupNames, function (v) {
        return v.name;
    })
})();
const CARD_SIZE_MAP = {4: {h: 314, w: 270, mb: 40}, 5: {h: 256, w: 218, mb: 28}, 6: {h: 206, w: 180, mb: 24}};

class ViewModel {
    constructor(params) {
        let s = params.section.setting;
        this.model = {
            type: params.section.type || 2, // 2 橱窗推荐  6 推荐课程
            id: params.section.id || 0,
            modal: {
                tag_name: ko.observable('window_tag' + params.section.id),
                tag: ko.observable(false),
                tab: ko.observable(false),
                tab_name: ko.observable('window_tab' + params.section.id),
                rule_name: ko.observable('window_rule' + params.section.id)
            },
            items: ko.observableArray([]),
            rules: ko.observableArray([]),
            setting: {
                data: {
                    title: ko.observable(s.data.title || ""), //橱窗标题 ,
                    data_type: ko.observable(s.data.data_type || 1), //数据来源类型 1标签 2资源
                    order_type: ko.observable(s.data.order_type || 1), //排序方式 1最新 2最热 3推荐 data_type为1时有效
                    group_names: ko.observableArray(s.data.group_names || []), //学习单元分组列表 data_type为1时有效
                    tag_id: ko.observable(s.data.tag_id || ""), //标签id（为空，表示显示频道或者资源池下的所有资源）
                    tag_name: ko.observable(s.data.tag_name || ''),
                    channel_id: ko.observable(s.data.channel_id || ''), //标签所属的频道id（为空，表示资源池下的标签）
                    resources: ko.observableArray(s.data.resources || []), //"resource_id": "", //资源标识"channel_id": "" //资源来源频道标识
                    rules: ko.observableArray(s.data.rules || [])
                },
                display: {
                    is_title_show: ko.observable(s.display.is_title_show),
                    web: { //web端展示方式
                        row_num: ko.observable(s.display.web.row_num || 2), //行数 display_type为2时有效
                        column_num: ko.observable(s.display.web.column_num || 4), //列数 display_type为2时有效
                        show_num: ko.observable(s.display.web.show_num || 3), //翻页 type为6时有效
                        ad_enable: ko.observable(s.display.web.ad_enable || false),
                        ad_logo: ko.observable(s.display.web.ad_logo || ""),
                        ad_url: ko.observable(s.display.web.ad_url || "")
                    },
                    mobile: { //移动端展示方式
                        display_type: ko.observable(s.display.mobile.display_type || 1), //展示方式 1左右滑动 2田字格
                        display_num: ko.observable(s.display.mobile.display_num || 5), //显示资源数 display_type为1时有效
                        row_num: ko.observable(s.display.mobile.row_num || 2), //行数 display_type为2时有效
                        column_num: ko.observable(s.display.mobile.column_num || 2), //列数 display_type为2时有效
                        show_num: ko.observable(s.display.mobile.show_num || 2), //翻页 type为6时有效
                        ad_enable: ko.observable(s.display.mobile.ad_enable || false),
                        ad_logo: ko.observable(s.display.mobile.ad_logo || ""),
                        ad_url: ko.observable(s.display.mobile.ad_url || "")
                    }
                }
            },
            tag_name: ko.observable('请选择标签'),
            web_row_num: [{value: 1, text: '1行'}, {value: 2, text: '2行'}, {value: 3, text: '3行'}, {
                value: 4,
                text: '4行'
            }], //和手机端展示方式共用
            web_col_num: [{value: 4, text: '4'}, {value: 5, text: '5'}, {value: 6, text: '6'}],
            web_show_num: [{value: 1, text: '1'}, {value: 2, text: '2'}, {value: 3, text: '3'}, {value: 4, text: '4'}], //和手机端展示方式共用
            m_display_num: [{value: 5, text: '5'}, {value: 6, text: '6'}, {value: 7, text: '7'}, {value: 8, text: '8'}],
            m_col_num: [{value: 1, text: '1'}, {value: 2, text: '2'}],
            selected_tag: {
                tag_id: ko.observable(''),
                title: ko.observable(''),
                channel_id: ko.observable(''),
                group_names: ko.observable(''),
                order_type: ko.observable('')
            },
            selected_course: ko.observableArray([]),
            update_course: ko.observableArray([]),
            enableCount: ko.observable(1),
            rule: {
                id: ko.observable(0),
                index: ko.observable(-1),
                status: ko.observable(0)
            },
            window_data_list: params.section.window_data_list,
            rule_data_list: ko.observableArray(params.section.rule_data_list || []),
            parent: params.parent,
            isShow: ko.observable(false),
            advertisement: {
                web: {
                    ad_enable: ko.observable(s.display.web.ad_enable || false),
                    ad_logo: ko.observable(s.display.web.ad_logo || ""),
                    ad_url: ko.observable(s.display.web.ad_url || "")
                },
                mobile: {
                    ad_enable: ko.observable(s.display.mobile.ad_enable || false),
                    ad_logo: ko.observable(s.display.mobile.ad_logo || ""),
                    ad_url: ko.observable(s.display.mobile.ad_url || "")
                }
            },
            adUploadDialog: ko.observable(false),
        };
        this.model.sizeHint = ko.computed(function () {
            var display = this.model.setting.display;
            var size = CARD_SIZE_MAP[display.web.column_num()];
            return size.w + '*' + (size.h * display.web.row_num() + size.mb * (display.web.row_num() - 1));
        }, this);
        ViewModel.prototype.store = {
            create: function (data, section_id) {
                return $.ajax({
                    url: channelUrl + '/v1/sections/' + section_id,
                    type: 'put',
                    dataType: 'json',
                    contentType: 'application/json;charset=utf-8',
                    data: JSON.stringify(data)
                })
            },
            get: function (section_id) {
                return $.ajax({
                    url: '/' + projectCode + '/sections/' + section_id + '/windows',
                    cache: false,
                    data: {query_type: 1},
                    dataType: 'json'
                })
            },
            move: function (section_data_id, next_section_data_id) {
                return $.ajax({
                    url: channelUrl + '/v1/section_data/' + section_data_id + '/actions/move?next_section_data_id=' + next_section_data_id,
                    type: 'put'
                })
            },
            getUploadUrl: function () {
                return $.ajax({
                    url: channelUrl + '/v1/users/photo_session',
                    cache: false
                });
            }
        };
        this.init();
    }

    init() {
        var setting = this.model.setting, model = this.model, that = this;
        model.items(model.window_data_list || []);
        model.selected_course(model.window_data_list || []);
        setting.data.tag_name() && model.tag_name(setting.data.tag_name());
        model.rules(ko.mapping.toJS(model.rule_data_list) || []);
        ko.tasks.schedule(function () {
            that.drag();
        });

        if (!setting.display.is_title_show()) {
            setting.data.title(model.type == 2 ? '橱窗推荐' : '为你推荐');
            setting.display.is_title_show(false);
        }

        model.update_course.subscribe(() => {
            this.model.type == 2 && this.create();
        });
        model.rule_data_list.subscribe((nv) => {
            model.rules([]);
            model.rules(nv);
            model.rules.valueHasMutated();
            this.create();
        });
        model.enableCount = ko.pureComputed(function () {
            return setting.display.web.column_num() * setting.display.web.row_num()
        }, this);
    }

    save() {

    }

    // flag:1 返回文字; flag：0 返回bool
    formatStatus($data, flag) {
        if ($data.resource_id) {
            var status = $data.enabled;
            if (flag) {
                return status ? '发布' : '禁用';
            } else {
                return status ? 1 : 0;
            }
        }
    }

    autoSave(value, isInput) {
        var oldValue = '';
        if (isInput) {
            value.extend({rateLimit: {method: "notifyWhenChangesStop", timeout: 1000}});
            value.subscribe(function (ov) {
                oldValue = $.trim(ov);
            }, null, 'beforeChange');
        } else {
            value.extend({deferred: true});
        }
        value.subscribe(function (nv) {
            var setting = this.model.setting;
            if (nv !== '') {
                if (isInput && $.trim(nv) === oldValue) {
                    setting.data.title(oldValue);
                    return;
                }
                this.create();
            }
        }, this);
    }

    create(items) {
        var that = this, s = this.model.setting;
        s.data.title($.trim(s.data.title()));
        if (s.display.is_title_show() && $.trim(s.data.title()) === '') {
            $.alert('保存失败，请先输入板块标题。');
            return;
        }
        if (s.data.data_type() === 2) {
            s.data.order_type(3);//排序类型 3：综合 1：最新 2：最热
            s.data.group_names(groupNames);
            s.data.tag_id('');
            s.data.channel_id('');
            this.model.rules([]);
            this.model.tag_name('请选择标签');
        } else if (s.data.data_type() === 1) {
            s.data.resources([]);
            this.model.items([]);
            this.model.rules([]);
            if (s.data.group_names().length === groupNames.length) s.data.group_names([]);
            that.model.selected_course([]);
        } else if (s.data.data_type() === 3) {
            s.data.order_type(3);//排序类型 3：综合 1：最新 2：最热
            s.data.group_names(groupNames);
            s.data.tag_id('');
            s.data.channel_id('');
            this.model.tag_name('请选择标签');
            s.data.resources([]);
            this.model.items([]);
            if (s.data.group_names().length === groupNames.length) s.data.group_names([]);
        }
        var setting = ko.mapping.toJS(this.model.setting),
            selected_course = items || ko.mapping.toJS(this.model.selected_course),
            rules = items || ko.mapping.toJS(this.model.rule_data_list);
        if (setting.data.data_type == 2) {
            setting.data.resources = _.arrayMap(selected_course, function (item) {
                if (item.resource_id) {
                    return {
                        resource_id: item.resource_id,
                        channel_id: item.channel_id
                    }
                }
            });
            setting.data.rules = [];
        }
        if (setting.data.data_type == 3) {
            setting.data.rules = _.arrayMap(rules, function (item) {
                return {
                    rule_id: item.id,
                    status: item.status || 0
                }
            });
            setting.data.resources = [];
        }

        this.store.create({setting: JSON.stringify(setting)}, this.model.id)
            .done(function () {
                if (setting.data.data_type === 2) that.get();
                ko.observable().publishOn(EVENT_TYPE)(0);
                that.drag();
            });
    }

    get() {
        var that = this;
        this.store.get(this.model.id).done(function (res) {
            if (that.model.setting.data.data_type() === 2) {
                that.model.items(res || []);
                that.model.selected_course(res || []);
                that.drag();
            }
        });
    }

    remove($data) {
        var that = this;
        $.confirm({
            content: "确定删除吗？",
            title: '系统提示',
            buttons: {
                confirm: {
                    text: '确定',
                    btnClass: 'btn-primary',
                    action: () => {
                        let items = this.model.setting.data.data_type() == 3 ? this.model.rules : this.model.items
                        items.remove($data);
                        if (this.model.setting.data.data_type() == 2) {
                            this.model.rule_data_list.remove(function (item) {
                                return item.id == $data.id;
                            });
                        }
                        this.create(ko.mapping.toJS(items));
                    }
                },
                cancel: {
                    text: '取消',
                    action: function () {
                    }
                }
            }
        });
    }

    drag() {
        var that = this, dragDOM = $("#drag-" + this.model.id);
        dragDOM.dragsort("destroy");
        dragDOM.dragsort({
            dragSelector: "tr",
            dragBetween: true,
            dragSelectorExclude: "a",
            scrollContainer: "#drag-" + that.model.id,
            dragEnd: function () {
                dragDOM.dragsort("destroy");
                var section_data_id = this.attr('data-id');
                if (section_data_id) {
                    var items = [];
                    $.each(dragDOM.children('tr'), function (i, v) {
                        if ($(v).attr('data-id')) {
                            items.push({
                                channel_id: $(v).attr('data-channel'),
                                resource_id: $(v).attr('data-id')
                            });
                        }
                    });
                    that.create(items);
                }
            }
        });
    }

    _openDialog(selectCourses) {
        var data_type = this.model.setting.data.data_type();
        this.model.modal.tag(false);
        this.model.modal.tab(false);
        if (data_type == 1) {
            this.model.modal.tag(true);
            ko.tasks.schedule(() => {
                $('#' + this.model.modal.tag_name()).modal('show');
            })
        }
        else if (data_type == 2 || data_type == 3) {
            this.model.modal.tab(true);
            this.model.selected_course(selectCourses);
            ko.tasks.schedule(() => {
                $('#' + this.model.modal.tab_name()).modal('show');
            })
        }
    }

    openRuleModal(id, index, status) {
        this.model.rule.id(id);
        this.model.rule.index(index);
        this.model.rule.status(status);
        this.model.isShow(false);
        this.model.isShow(true);
        $('#' + this.model.modal.rule_name()).modal('show');
    }

    updateRule($data) {
        var t = this, count = 0;

        function postAjax() {
            $.each(t.model.rule_data_list(), function (i, v) {
                if (v.id === $data.id) {
                    v.status = $data.status ? 0 : 1;
                    return false;
                }
            });
            t.create();
            t.model.rules([]);
            t.model.rules(ko.mapping.toJS(t.model.rule_data_list));
            $.simplyToast($data.status ? '停用成功！' : '应用成功！');
        }

        if (!$data.status) {
            $.each(this.model.rule_data_list(), function (i, v) {
                if (v.status) {
                    count = 1;
                    $.confirm({
                        content: t.htmlEscape("规则 “" + v.name + "” 正在应用中，是否替换？"),
                        title: '操作提示',
                        buttons: {
                            confirm: {
                                text: '替换',
                                btnClass: 'btn-primary',
                                action: function () {
                                    v.status = 0;
                                    postAjax();
                                }
                            },
                            cancel: {
                                text: '取消'
                            }
                        }
                    });
                    return false;
                }
            });
            if (!count) postAjax();
        } else {
            postAjax();
        }
    }

    htmlEscape(text) {
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
    }

    showAdDialog() {
        var self = this, display = this.model.setting.display;
        this.store.getUploadUrl().done($.proxy(function (res) {
                var size = CARD_SIZE_MAP[display.web.column_num()], ratio = 2;
                this.model.uploadParams = {
                    web: {
                        image_width: size.w / ratio,
                        image_height: (size.h + size.mb * display.web.row_num() - 1) / ratio,
                        default_image: display.web.ad_logo() ? csUrl + '/v0.1/download?dentryId=' + display.web.ad_logo() : '',
                        id: this.model.advertisement.web.ad_logo,
                        url: ko.observable(csUrl + '/v0.1/download?dentryId=' + display.web.ad_logo()),
                        api_url: channelUrl,
                        upload_info: res
                    },
                    mobile: {
                        image_width: size.w / ratio,
                        image_height: (size.h + size.mb * display.web.row_num() - 1) / ratio,
                        default_image: display.mobile.ad_logo() ? csUrl + '/v0.1/download?dentryId=' + display.mobile.ad_logo() : '',
                        id: this.model.advertisement.mobile.ad_logo,
                        url: ko.observable(csUrl + '/v0.1/download?dentryId=' + display.mobile.ad_logo()),
                        api_url: channelUrl,
                        upload_info: res
                    }
                };
                this.model.adUploadDialog(true);
                $('#window-modal-' + this.model.id).modal('show');
                $('#window-modal-' + this.model.id).one('hidden.bs.modal', function () {
                    self.model.adUploadDialog(false);
                });
            }, this)
        );
    }

    saveAd() {
        var web = this.model.setting.display.web, mobile = this.model.setting.display.mobile,
            webAd = this.model.advertisement.web, mobileAd = this.model.advertisement.mobile;
        web.ad_enable(webAd.ad_enable());
        webAd.ad_logo(webAd.ad_enable() ? webAd.ad_logo() : '');
        webAd.ad_url(webAd.ad_enable() ? webAd.ad_url() : '');
        web.ad_logo(webAd.ad_logo());
        web.ad_url(webAd.ad_url());
        mobile.ad_enable(mobileAd.ad_enable());
        mobileAd.ad_logo(mobileAd.ad_enable() ? mobileAd.ad_logo() : '');
        mobileAd.ad_url(mobileAd.ad_enable() ? mobileAd.ad_url() : '');
        mobile.ad_logo(mobileAd.ad_logo());
        mobile.ad_url(mobileAd.ad_url());
        this.create();
        $('#window-modal-' + this.model.id).modal('hide');
    }
}

ko.components.register('x-channel-admin-layout-content-window', {
    viewModel: ViewModel,
    template: tpl
});