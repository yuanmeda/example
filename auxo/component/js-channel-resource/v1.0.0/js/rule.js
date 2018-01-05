;(function () {
    function ViewModel(params) {
        this.model = {
            modal_id: params.id,
            rule: {
                id: ko.observable(params.rule.id() || 0),
                recommend_way: ko.observable(0),
                condition_relation: ko.observable(1),
                rule_items: ko.observableArray([]),
                rule_course_for_creates: ko.observableArray([]),
                disable_config: {
                    "type": ko.observable(1),
                    "nodes": ko.observableArray([])
                },
                recommend_time: ko.observable('0000000'),
                week_group: ko.observableArray(['0', '1', '2', '3', '4', '5', '6']),
                begin_time: ko.observable(''),
                end_time: ko.observable(''),
                name: ko.observable(''),
                description: ko.observable(''),
                status: ko.observable(params.rule.status() || 0)
            },
            rule_index: params.rule.index(),
            rule_list: params.rule_list || ko.observableArray([]),
            step: ko.observable(1),
            course: ko.observableArray([]),
            week: [{value: '0', name: '每周一'}, {value: '1', name: '每周二'}, {value: '2', name: '每周三'}, {
                value: '3',
                name: '每周四'
            }, {value: '4', name: '每周五'}, {value: '5', name: '每周六'}, {value: '6', name: '每周日'}],
            tree: {
                init: ko.observable(false),
                manager: null,
                org: null,
                text: ko.observable('')
            },
            error: {
                message: ko.observable(''),
                isValid: ko.observable(true)
            },
            openDialog: params.openDialog,
            selected_course: params.selected_course || ko.observableArray([])
        };
        this.init();
    }

    ViewModel.prototype.store = {
        get: function (rule_id) {
            return $.ajax({
                url: window.ruleRecommendUrl + '/v1/recommend_rules/' + rule_id,
                cache: false,
                dataType: 'json'
            });
        },
        create: function (data) {
            return $.ajax({
                url: window.ruleRecommendUrl + '/v1/recommend_rules',
                type: 'post',
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(data)
            });
        },
        update: function (rule_id, data) {
            return $.ajax({
                url: window.ruleRecommendUrl + '/v1/recommend_rules/' + rule_id,
                type: 'put',
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(data)
            });
        },
        getMixOrgTree: function () {
            return $.ajax({
                url: "/" + projectCode + "/manage_orgs",
                data: {org_id: window.projectOrgId},
                dataType: "json",
                cache: false
            });
        }
    };
    ViewModel.prototype.init = function () {
        this.getRuleInfo(this.model.rule.id());
        this.subscribe();
    };
    ViewModel.prototype.subscribe = function () {
        this.model.selected_course.subscribe(function (nv) {
            this.model.course(nv);
            this.drag();
        }, this);
        this.model.rule.recommend_way.subscribe(function (nv) {
            this.model.error.message('');
            this.model.error.isValid(true);
            if (nv) {
                var t = this;
                ko.tasks.schedule(function () {
                    t.drag();
                });
            }
        }, this);
        this.model.step.subscribe(function (nv) {
            if (nv == 3) {
                $('.datepicker_js').datetimepicker({
                    autoclose: true,
                    clearBtn: true,
                    format: 'yyyy-mm-dd',
                    minView: 2,
                    todayHighlight: 1,
                    language: 'zh-CN'
                });
            }
        }, this);
    };
    ViewModel.prototype.getRuleInfo = function (rule_id) {
        if (!rule_id) return;
        var t = this;
        this.store.get(rule_id).done(function (res) {
            var week_group = res.recommend_time.split(''), rule = t.model.rule;
            res.week_group = [];
            $.each(week_group, function (i, v) {
                if (v !== '1') {
                    res.week_group.push((i).toString());
                }
            });
            if (res.rule_items && res.rule_items.length) {
                res.rule_items = t.formatRuleItem(res.rule_items);
            }
            if (res.begin_time) res.begin_time = $.format.date(res.begin_time, 'yyyy-MM-dd');
            if (res.end_time) res.end_time = $.format.date(res.end_time, 'yyyy-MM-dd');
            t.model.selected_course(res.rule_relation_object_vos || []);
            t.model.course(res.rule_relation_object_vos || []);
            res.status = rule.status();
            ko.mapping.fromJS(res, {}, rule);
            ko.tasks.schedule(function () {
                $('.datepicker_js').datetimepicker({
                    autoclose: true,
                    clearBtn: true,
                    format: 'yyyy-mm-dd',
                    minView: 2,
                    todayHighlight: 1,
                    language: 'zh-CN'
                });
            })
        })
    };
    ViewModel.prototype.formatRuleItem = function (ruleItems) {
        $.each(ruleItems, function (i, v) {
            v.enable = false;
            v.item_value = JSON.parse(v.item_value || '{}');
            if (v.item_key == 'online_time') {
                v.item_value.start_time = '';
                v.item_value.end_time = '';
                if (v.item_value.condintion == 1) {
                    v.item_value.start_time = v.item_value.value.split(' ')[0];
                    v.item_value.end_time = v.item_value.value.split(' ')[1];
                }
            } else if (v.item_key == 'course_relation') {
                v.item_value.group = [];
                if (v.item_value.value == 0) {
                    v.item_value.group = [1, 2]
                } else {
                    v.item_value.group = [v.item_value.value];
                }
            }
        });
        return ruleItems
    };
    ViewModel.prototype.addRule = function () {
        var item = ko.mapping.fromJS({
            item_key: '',
            item_value: {"condintion": "", "value": "", start_time: '', end_time: '', group: []},
            enable: true
        });
        this.model.rule.rule_items.push(item);
    };
    ViewModel.prototype.delRule = function ($data) {
        var t = this;
        $.confirm({
            content: "确定删除吗？",
            title: '系统提示',
            buttons: {
                confirm: {
                    text: '确定',
                    btnClass: 'btn-primary',
                    action: function () {
                        t.model.rule.rule_items.remove($data);
                    }
                },
                cancel: {
                    text: '取消',
                    action: function () {
                    }
                }
            }
        });
    };
    ViewModel.prototype.createRule = function () {
        var valid = true;
        for (var i = 1; i < 5; i++) {
            this.validateStep(i);
            if (!this.model.error.isValid()) {
                valid = false;
                this.model.step(i);
                break;
            }
        }
        if (!valid) return;
        var rule = ko.mapping.toJS(this.model.rule);
        if (!rule.recommend_way) {
            rule.rule_course_for_creates = [];
            $.each(rule.rule_items, function (i, v) {
                v.enable = undefined;
                if (v.item_key == 'online_time') {
                    if (v.item_value.condintion == '1') {
                        v.item_value.value = v.item_value.start_time + ' ' + v.item_value.end_time;
                    }
                } else if (v.item_key == 'course_relation') {
                    v.item_value.value = v.item_value.group.length == 2 ? 0 : v.item_value.group[0];
                    v.item_value.condintion = undefined;
                }
                v.item_value.end_time = v.item_value.start_time = undefined;
                v.item_value.group = undefined;
                v.item_value = JSON.stringify(v.item_value)
            });
        } else {
            rule.rule_items = [];
            rule.rule_course_for_creates = ko.utils.arrayMap(this.model.course(), function (v) {
                return {
                    resource_id: v.resource_id,
                    channel_id: v.channel_id
                }
            });
        }

        if (!rule.disable_config.type) rule.disable_config.nodes = [];
        var week = [1, 1, 1, 1, 1, 1, 1];
        $.each(rule.week_group, function (i, v) {
            week[+v] = 0;
        });
        rule.recommend_time = week.join('');
        rule.week_group = undefined;
        var t = this, count = 0;

        function postAjax() {
            if (rule.id) {
                t.store.update(rule.id, rule).done(function (res) {
                    t.model.rule_list.splice(t.model.rule_index, 1, res);
                    $.simplyToast('保存成功！');
                    $('#' + t.model.modal_id).modal('hide');
                    $(".modal-backdrop").remove();
                    $('body').removeClass('modal-open');
                });
            } else {
                t.store.create(rule).done(function (res) {
                    t.model.rule_list.push(res);
                    $.simplyToast('保存成功！');
                    $('#' + t.model.modal_id).modal('hide');
                    $(".modal-backdrop").remove();
                    $('body').removeClass('modal-open');
                });
            }
        }

        if (rule.status) {
            $.each(t.model.rule_list(), function (i, v) {
                if (v.status && v.id !== rule.id) {
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
            if (!count) postAjax()
        } else {
            postAjax();
        }
    };
    ViewModel.prototype.delCourse = function ($data) {
        this.model.course.remove($data);
    };
    ViewModel.prototype.switchStep = function (num, type) {
        var step = this.model.step;
        if (num > step() || type === 'next') {
            this.validateStep(step());
        } else {
            this.model.error.message('');
            this.model.error.isValid(true);
        }
        if (!this.model.error.isValid()) return;
        if (type == 'next') {
            if (step() < 4) step(step() + 1);
        } else if (type == 'prev') {
            if (step() > 1) step(step() - 1);
        } else {
            step(num);
        }
    };
    ViewModel.prototype._initMixOrgs = function () {
        this.store.getMixOrgTree().done($.proxy(function (data) {
            this.model.tree.manager = data.manager;
            this.model.tree.org = data.org_tree;
            this.model.tree.init(true);
            ko.tasks.schedule(function () {
                $("#zT-orgTreeModal").modal('show');
            });
        }, this));
    };
    ViewModel.prototype.openDialog = function () {
        this.model.openDialog();
    };
    ViewModel.prototype.showOrgTree = function () {
        if (!this.model.tree.init()) {
            this._initMixOrgs();
        } else {
            $("#zT-orgTreeModal").modal('show');
        }
    };
    ViewModel.prototype.validateStep = function (step) {
        var model = this.model, message = model.error.message;
        message('');
        if (step == 1) {
            if (model.rule.recommend_way() == 1) {
                if (!model.course().length) {
                    message('请添加推荐课程。')
                }
            } else {
                $.each(model.rule.rule_items(), function (i, v) {
                    var value = v.item_value.value ? $.trim(v.item_value.value()) : '',
                        condition = v.item_value.condintion ? v.item_value.condintion() : '',
                        index = i + 1;
                    switch (v.item_key()) {
                        case 'tags_content':
                            if (value === '') {
                                message(message() + '第' + index + '条规则不能为空;<br/>')
                            }
                            break;
                        case 'study_count':
                            if (value === '' || !/^\d+$/.test(value)) {
                                message(message() + '第' + index + '条规则不能为空，且应为非负整数;<br/>')
                            }
                            break;
                        case 'online_time':
                            if (condition == '0') {
                                if (value === '' || !/^\d+$/.test(value)) {
                                    message(message() + '第' + index + '条规则不能为空，且应为非负整数;<br/>')
                                }
                            } else {
                                var start = v.item_value.start_time() ? new Date(v.item_value.start_time().replace(/-/g, "/")).getTime() : 0,
                                    end = v.item_value.end_time() ? new Date(v.item_value.end_time().replace(/-/g, "/")).getTime() : 0;
                                if (!end || !start || end < start) {
                                    message(message() + '第' + index + '条规则时间为必填，且结束时间不应小于开始时间;<br/>')
                                }
                            }
                            break;
                        case 'course_relation':
                            if (!v.item_value.group().length) {
                                message(message() + '第' + index + '条规则应至少勾选一个选项;<br/>')
                            }
                            break;
                    }
                });
            }
        } else if (step == 2) {
            if (model.rule.disable_config.type() && !model.rule.disable_config.nodes().length) {
                message('请选择组织')
            }
        } else if (step == 3) {
            if (!model.rule.week_group().length) {
                message('推荐时间请至少勾选一项;<br/>')
            }
            var begin_time = this.model.rule.begin_time(),
                end_time = this.model.rule.end_time();
            if (begin_time && end_time) {
                message(message() + (new Date(begin_time.replace(/-/g, "/")).getTime() > new Date(end_time.replace(/-/g, "/")).getTime() ? '结束时间不应小于开始时间' : ''));
            }
        } else if (step == 4) {
            var name = $.trim(model.rule.name()),
                description = $.trim(model.rule.description());
            if (name == '' || name.length > 50) {
                message('规则名称不能为空，且字数不应超过50<br/>')
            }
            if (description == '' || description.length > 100) {
                message(message() + '备注说明不能为空，且字数不应超过100')
            }
        }
        model.error.isValid(!message());
    };
    ViewModel.prototype.drag = function () {
        var that = this, dragDom = $("#drag-" + this.model.modal_id);
        dragDom.dragsort("destroy");
        dragDom.dragsort({
            dragSelector: "tr",
            dragBetween: true,
            dragSelectorExclude: "a",
            scrollContainer: "#dragwrap-" + that.model.modal_id,
            dragEnd: function () {
                var items = [];
                $.each(dragDom.children('tr'), function (i, v) {
                    items.push(JSON.parse($(v).attr('data-info')));
                });
                that.drag();
                that.model.course(items);
            }
        });
    };
    ViewModel.prototype.initDateTimePicker = function ($data) {
        if (!$data.item_value.condintion()) return;
        $('.datepicker_js').datetimepicker({
            autoclose: true,
            clearBtn: true,
            format: 'yyyy-mm-dd',
            minView: 2,
            todayHighlight: 1,
            language: 'zh-CN'
        });
    };
    ViewModel.prototype.htmlEscape = function (text) {
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
    };
    ko.components.register('x-channel-rule', {
        synchronous: true,
        viewModel: ViewModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})();
