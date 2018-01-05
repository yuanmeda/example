void function () {
    var store = {
        search: function () {
            var url = '/' + projectCode + '/exam_center/exam_reward_templates/' + awardTemplateId;
            return $.ajax({
                url: url,
                cache: false
            });
        },
        save: function (data) {
            var url = '/' + projectCode + '/exam_center/exam_reward_templates';
            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                type: 'post',
                cache: false
            });
        }
    };

    function CreditsObject(range, reward_value) {
        this.range = ko.observable(range).extend({
            required: {
                params: true,
                message: '不能为空'
            },
            pattern: {
                params: "^(?:0|[1-9][0-9]?|100)$",
                message: '必须为0-100的数字'
            }
        });
        this.reward_value = ko.observable(reward_value).extend({
            required: {
                params: true,
                message: '不能为空'
            },
            maxLength: {
                params: 6,
                message: '最多{0}位数'
            },
            pattern: {
                params: "^([1-9][0-9]*)$",
                message: '必须为大于0的整数'
            }
        });

        this.range.valueHasMutated();
        this.reward_value.valueHasMutated();
    }

    var viewModel = {
        model: {
            template: {
                id: awardTemplateId,
                name: '',
                reward_field_type: 0,
                status: 0,
                reward_goods_rules: []
            },
            used_count: 0,
            requestStatus: false
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.validationsInfo = ko.validatedObservable(this.model, {deep: true});
            ko.applyBindings(this);
            this.currentRewardFieldType = ko.computed(function () {
                switch (this.model.template.reward_field_type()) {
                    case '1':
                        return '分数';
                        break;
                    case '2':
                        return '正确率(%)';
                        break;
                    case '3':
                        return '连续答对题数';
                        break;
                }
            }, this);
            this._validateInit();
            this._bindingsExtend();
            var self = this;
            store.search()
                .done(function (templateDetail) {
                    self.model.template.name(templateDetail.name);
                    self.model.template.reward_field_type(templateDetail.reward_field_type);
                    self.model.template.status(templateDetail.status);
                    self.model.used_count(templateDetail.used_count);
                    if ($.isArray(templateDetail.reward_goods_rules)) {
                        $.each(templateDetail.reward_goods_rules, function (index, goodRule) {
                            var tempRule = {
                                reward_goods: goodRule.reward_goods,
                                reward_rules: ko.observable([])
                            };
                            if ($.isArray(goodRule.reward_rules)) {
                                $.each(goodRule.reward_rules, function (i, rule) {
                                    tempRule.reward_rules().push(new CreditsObject(rule.range, rule.reward_value));
                                })
                            }
                            self.model.template.reward_goods_rules.push(tempRule);
                        });
                    }
                });
        },
        _validateInit: function () {
            ko.validation.init({
                insertMessages: false,
                errorElementClass: 'input-error',
                errorMessageClass: 'error',
                decorateInputElement: true,
                grouping: {
                    deep: true,
                    live: true,
                    observable: true
                }
            }, true);
            ko.validation.rules['noRepeatedParams'] = {
                validator: function (val) {
                    if ($.isArray(val)) {
                        var temArray = [];
                        $.each(val, function (index, rule) {
                            temArray.push(rule.reward_goods);
                        })
                        var first = temArray.length;
                        var last = $.unique(temArray).length;
                        if (last < first) {
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                },
                message: '奖励物品不能重复'
            };
            //注册
            ko.validation.registerExtenders();
        },
        _bindingsExtend: function () {
            this.model.template.reward_goods_rules.extend({
                minLength: {
                    params: true,
                    message: '奖励物品不能为空'
                },
                noRepeatedParams: {}
            });
        },
        addOneGoodRule: function () {
            var self = this;
            self.model.template.reward_goods_rules.push({
                reward_goods: 'gold ',
                reward_rules: ko.observable([new CreditsObject(0, 0)])
            });
        },
        addOneRule: function (data, ele) {
            data.reward_rules().push(new CreditsObject(0, 0));
            data.reward_rules(data.reward_rules());
        },
        removeOneRule: function (parent, data, ele) {
            parent.remove(data);
        },
        cancel: function () {
            window.location.href = 'http://' + window.location.host + '/' + projectCode + '/exam_center/award2';
        },
        save: function () {
            this._doSave(null);
        },
        saveThenBack: function () {
            this._doSave(function () {
                window.location.href = 'http://' + window.location.host + '/' + projectCode + '/exam_center/award2';
            });
        },
        removeRewardRules: function (reward_rules, index) {
            reward_rules().splice(index, 1);
            reward_rules(reward_rules());
        },

        _hasRangeRepeated: function (rewardRules) {
            var validate = false;
            $.each(rewardRules, function (index, list) {
                $.each(rewardRules, function (index2, list2) {
                    if (index != index2 && list.range == list2.range) {
                        validate = true;
                    }
                });
            });
            return validate;
        },
        _doSave: function (callback) {
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }

            var data = ko.mapping.toJS(this.model.template);

            if ($.isArray(data.reward_goods_rules)) {
                var temArray = [];
                var hasRangeRepeatedFlag = false;
                $.each(data.reward_goods_rules, $.proxy(function (index, rule) {
                    if (this._hasRangeRepeated(rule.reward_rules)) {
                        hasRangeRepeatedFlag = true;
                    }
                    temArray.push(rule.reward_goods);
                }, this));
                if (hasRangeRepeatedFlag) {
                    $.fn.dialog2.helpers.alert('同一奖励物品下的配置规则中,考试成绩/正确率/连续答对题数不能相等');
                    return;
                }
                var first = temArray.length;
                var last = $.unique(temArray).length;
                if (last < first) {
                    $.fn.dialog2.helpers.alert('奖励物品不能重复');
                    return;
                }
            }


            store.save(data)
                .done(function (res) {
                    Utils.msgTip('保存成功').done(function () {
                        callback && callback();
                    }.bind(this));
                })
        }

    };
    $(function () {
        viewModel.init();
    });

}(jQuery);