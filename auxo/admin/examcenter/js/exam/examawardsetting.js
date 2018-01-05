void function () {
    var store = {
        get: function () {
            return $.ajax({
                url: '/' + projectCode + '/exam_center/exams/' + examId,
                cache: false,
                dataType: 'json'
            });
        },
        getTemplateInfo: function (tmpId) {
            return $.ajax({
                url: '/' + projectCode + '/exam_center/exam_reward_templates/' + tmpId,
                type: 'GET',
                cache: false,
                dataType: 'json'
            });
        },
        search: function (filter) {
            var url = '/' + projectCode + '/exam_center/exam_reward_templates';
            return $.ajax({
                url: url,
                data: filter,
                type: 'GET',
                cache: false
            });
        },
        updateTemplate: function (data) {
            var url = '/' + projectCode + '/exam_center/exams/' + examId + '/exam_reward_template?reward_template_id=' + (data && data.reward_template_id != '暂无' ? data.reward_template_id : ' ');
            return $.ajax({
                url: url,
                type: 'PUT',
                cache: false
            });
        }
    };

    var viewModel = {
        model: {
            filter: {
                name: '',//奖励模板名称
                status: 1,//奖励模板状态 0 下线；1上线,
                reward_field_type: '',//奖励依据字段
                page: 0,
                size: 20
            },
            examRewardTemplatesList: [],
            total: '',
            chosenTemplateId: '',
            templateId: '',
            templateName: '',
            templateReward: '',
            templateField: '',
            previewInfo: {
                name: '',
                used_count: 0,
                reward_field_type: 0,
                reward_goods_rules: [],
                reward_field_name: ''
            },
            disabled: true,
            cancelDisabled: true
        },
        return_url:return_url || '',
        init: function () {
            var _this = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            _this.model.templateId.subscribe(function (val) {
                if (val == _this.model.chosenTemplateId()) {
                    _this.model.disabled(true);
                } else {
                    _this.model.disabled(false);
                }
                if (val && (val != '暂无')) {
                    _this.model.cancelDisabled(false);
                } else {
                    _this.model.cancelDisabled(true);
                }
            });
            store.get().done(function (returnData) {
                var tempId = returnData && returnData.reward_template_id ? returnData.reward_template_id : '';
                _this.model.chosenTemplateId(tempId);
                _this.model.templateId(tempId);
                store.getTemplateInfo(_this.model.templateId()).done(function (data) {
                    var reward_goods_names = [];
                    if (data) {
                        _this.model.templateName(data.name ? data.name : '');
                        _this.model.templateField(data.reward_field_type == 1 ? '考试成绩' : (data.reward_field_type == 2 ? '正确率' : (data.reward_field_type == 3 ? '连续答对题数' : '')));
                        var reward_goods = data.reward_goods ? data.reward_goods.split(',') : [''];
                        $.each(reward_goods, function (index, item) {
                            switch (item) {
                                case 'gold':
                                    reward_goods_names.push('积分');
                                    break;
                                case 'exp':
                                    reward_goods_names.push('经验');
                                    break;
                                case 'flower':
                                    reward_goods_names.push('鲜花');
                                    break;
                                case 'lottery':
                                    reward_goods_names.push('抽奖券');
                                    break;
                                case '':
                                    reward_goods_names.push('');
                                    break;
                            }
                        });
                        _this.model.templateReward(reward_goods_names.join(','));
                    }
                });
                _this._list();
            });
            this.model.templateId.subscribe($.proxy(function (val) {
                this.model.templateId(val);
            }, this));
            $("#search").on('keyup', function (e) {
                if (e.keyCode === 13) {
                    _this.doSearch();
                }
            });
        },
        _pagination: function (count, offset, limit) {
            $("#pagination").pagination(count, {
                is_show_first_last: true,
                is_show_input: true,
                items_per: [20, 50, 100, 200, 500, 1000],
                items_per_page: limit,
                num_display_entries: 5,
                current_page: offset,
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: $.proxy(function (index) {
                    if (index != offset) {
                        this.model.filter.page(index);
                        this._list(ko.mapping.toJS(this.model.filter));
                    }
                }, this),
                perCallback: $.proxy(function (size) {
                    this.model.filter.page(0);
                    this.model.filter.size(size);
                    this._list(ko.mapping.toJS(this.model.filter));
                }, this)
            });
        },
        _list: function () {
            var filter = ko.mapping.toJS(this.model.filter);
            store.search(filter).done($.proxy(function (returnData) {
                this.model.examRewardTemplatesList(returnData && returnData.items && returnData.items.length > 0 ? returnData.items : []);
                if (this.model.templateId() && this.model.examRewardTemplatesList().length > 0) {
                    this.displayFirst(this.model.templateId());
                }
                this.model.total(returnData && returnData.items ? returnData.count : 0);
                this._pagination(this.model.total(), filter.page, filter.size);
            }, this));
        },
        doSearch: function () {
            this.model.filter.page(0);
            this._list();
        },
        cancelTemplate: function () {
            if (!this.model.templateName()) {
                this.model.chosenTemplateId('暂无');
            }
            this.model.templateName('');
            this.model.templateReward('');
            this.model.templateField('');
            this.model.templateId('暂无');
        },
        /*选中显示到第一个*/
        displayFirst: function (id) {
            var arrTemp = this.model.examRewardTemplatesList();
            var choseTemp = null, temIndex = 0;
            $.each(arrTemp, function (index, item) {
                if (item.id == id) {
                    choseTemp = item;
                    temIndex = index;
                }
            });
            if (!choseTemp) {
                return;
            }
            arrTemp.splice(temIndex, 1)
            arrTemp.unshift(choseTemp);
            this.model.examRewardTemplatesList(arrTemp);
        },
        prepareData: function (callBack) {
            var _this = this;
            var data = {
                reward_template_id: this.model.templateId() ? this.model.templateId() : ''
            };
            /*获取被选择模板的名称*/
            $.each(this.model.examRewardTemplatesList(), function (index, item) {
                if (item.id == _this.model.templateId()) {
                    _this.model.templateName(item.name);
                    _this.model.templateReward(item.reward_goods_names);
                    _this.model.templateField(item.reward_field_type == 1 ? '考试成绩' : (item.reward_field_type == 2 ? '正确率' : (item.reward_field_type == 3 ? '连续答对题数' : '')))
                }
            });
            store.updateTemplate(data).done($.proxy(function (returnData) {
                this.displayFirst(data.reward_template_id);
                this.model.chosenTemplateId(data.reward_template_id);
                this.model.disabled(true);
                callBack && callBack();
                if (!callBack) {
                    $.fn.dialog2.helpers.alert('保存成功!');
                }
            }, this))
        },
        cancel: function () {
            if (this.return_url) {
                window.location = this.return_url;
            } else {
                window.location = '/' + projectCode + "/exam_center/index";
            }
        },
        save: function () {
            this.prepareData();
        },
        saveThenBack: function () {
            this.prepareData.call(this, this.cancel);
        },
        templatePreview: function (data, ele) {
            var templateId = data.id;
            var self = this;
            store.getTemplateInfo(templateId)
                .done(function (resData) {
                    if (resData) {
                        self.model.previewInfo.name(resData.name);
                        self.model.previewInfo.used_count(resData.used_count);
                        self.model.previewInfo.reward_field_type(resData.reward_field_type);
                        self.model.previewInfo.reward_goods_rules(resData.reward_goods_rules);
                        switch (resData.reward_field_type) {
                            case 1:
                                self.model.previewInfo.reward_field_name('分数');
                                break;
                            case 2:
                                self.model.previewInfo.reward_field_name('正确率(%)');
                                break;
                            case 3:
                                self.model.previewInfo.reward_field_name('连续答对题数');
                                break;
                        }
                        $('#templateWin').modal('show');
                    } else {
                        Utils.msgTip('获取数据失败');
                    }
                });

        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery);