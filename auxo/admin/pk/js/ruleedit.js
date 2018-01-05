(function ($) {
    var store = {
        errorCallback: function (jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
            } else {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {
                    $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                } else {
                    $.fn.dialog2.helpers.alert(txt.message);
                }
                $('body').loading('hide');
            }
        },
        get: function (rule_id) {
            var url = service_domain + '/v1/pk_rules/' + rule_id;
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                error: this.errorCallback,
                contentType: 'application/json;charset=utf8'
            });
        },
        create: function (data) {
            var url = service_domain + '/v1/pk_rules';
            return $.ajax({
                url: url,
                cache: false,
                type: 'post',
                data: JSON.stringify(data) || null,
                error: this.errorCallback,
                contentType: 'application/json;charset=utf8'
            });
        },
        update: function (data) {
            var url = service_domain + '/v1/pk_rules/' + rule_id;
            return $.ajax({
                url: url,
                cache: false,
                type: 'put',
                data: JSON.stringify(data) || null,
                error: this.errorCallback,
                contentType: 'application/json;charset=utf8'
            });
        }
    };

    var viewModel = {
        model: {
            pkRule: {
                id: rule_id || "",
                name: "",
                description: "",
                rule: {
                    "init_score": {
                        "type": "0",    //0:固定，1：分数比例
                        "score": 0,   //PK分值
                        "rate": 0.00  //比例
                    },
                    "win": {
                        "type": "1",    //0:固定，1：胜者积分比例  2：败者积分比例
                        "score": 0,   //PK分值
                        "rate": 0.00  //比例
                    },
                    "drawn": {
                        "type": "0",    //0:固定，1：积分高者积分比例
                        "score": 0,     //PK分值
                        "rate": 0.00  //比例

                    },
                    "lose": {
                        "type": "0",    //0:固定，1：胜者积分比例  2：败者积分比例
                        "score": 0,   //PK分值
                        "rate": 0.00  //比例
                    }
                }
            },
            winFlag: "0",
            subWinFlag: "1",
            loseFlag: "0",
            subLoseFlag: "1"
        },
        init: function () {
            var _self = this;
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
            this.model = ko.mapping.fromJS(this.model);
            this.validationsInfo = ko.validatedObservable(this.model, {
                deep: true
            });
            ko.applyBindings(this, document.getElementById('pk_ruleedit'));
            this.model.pkRule.rule.win.type = ko.computed(function () {
                if (this.model.winFlag() == '0')
                    return this.model.winFlag();
                else
                    return this.model.subWinFlag();
            }, this);
            this.model.pkRule.rule.lose.type = ko.computed(function () {
                if (this.model.loseFlag() == '0')
                    return this.model.loseFlag();
                else
                    return this.model.subLoseFlag();
            }, this);
            this._bindingsExtend();
            if (rule_id) {
                store.get(rule_id)
                    .done(function (ruleVo) {
                        if (ruleVo) {
                            this.model.pkRule.name(ruleVo.name);
                            this.model.pkRule.description(ruleVo.description);
                            this.model.pkRule.rule.init_score.type(ruleVo.rule.init_score.type + "");
                            this.model.pkRule.rule.init_score.score(ruleVo.rule.init_score.score + "");
                            this.model.pkRule.rule.init_score.rate(ruleVo.rule.init_score.rate * 100 + "");
                            if (ruleVo.rule.win.type == 0) {
                                this.model.winFlag('0');
                            } else {
                                this.model.winFlag('9');
                                this.model.subWinFlag(ruleVo.rule.win.type + "");
                            }
                            this.model.pkRule.rule.win.score(ruleVo.rule.win.score + "");
                            this.model.pkRule.rule.win.rate(ruleVo.rule.win.rate * 100 + "");

                            if (ruleVo.rule.lose.type == 0) {
                                this.model.loseFlag('0');
                            } else {
                                this.model.loseFlag('9');
                                this.model.subLoseFlag(ruleVo.rule.lose.type + "");
                            }
                            this.model.pkRule.rule.lose.score(ruleVo.rule.lose.score + "");
                            this.model.pkRule.rule.lose.rate(ruleVo.rule.lose.rate * 100 + "");

                            this.model.pkRule.rule.drawn.type(ruleVo.rule.drawn.type + "");
                            this.model.pkRule.rule.drawn.score(ruleVo.rule.drawn.score + "");
                            this.model.pkRule.rule.drawn.rate(ruleVo.rule.drawn.rate * 100 + "");
                        }
                    }.bind(this));
            }
        },
        _bindingsExtend: function () {
            var pkRule = this.model.pkRule;
            pkRule.name.extend({
                required: {
                    params: true,
                    message: '名称不可为空'
                },
                maxLength: {
                    params: 50,
                    message: '名称最多{0}字符'
                },
                pattern: {
                    params: "^[a-zA-Z0-9 _\u4e00-\u9fa5()（）.-]*$",
                    message: '不可含有非法字符'
                }
            });
            pkRule.description.extend({
                maxLength: {
                    params: 200,
                    message: '名称最多{0}字符'
                },
            });
            pkRule.rule.init_score.score.extend({
                required: {
                    params: true,
                    message: '不能为空',
                    onlyIf: $.proxy(function () {
                        return pkRule.rule.init_score.type() == '0'
                    }, this)
                },
                pattern: {
                    params:  "^(0|[1-9][0-9]*)$",
                    message: '必须为数字'
                }
            });
            pkRule.rule.init_score.rate.extend({
                required: {
                    params: true,
                    message: '不能为空',
                    onlyIf: $.proxy(function () {
                        return pkRule.rule.init_score.type() != '0'
                    }, this)
                },
                pattern: {
                    params:  "^(0|[1-9][0-9]*)$",
                    message: '必须为数字'
                }
            });
            pkRule.rule.win.score.extend({
                required: {
                    params: true,
                    message: '不能为空',
                    onlyIf: $.proxy(function () {
                        return pkRule.rule.win.type() == '0'
                    }, this)
                },
                pattern: {
                    params: "^(0|[1-9][0-9]*)$",
                    message: '必须为数字'
                }
            });
            pkRule.rule.win.rate.extend({
                required: {
                    params: true,
                    message: '不能为空',
                    onlyIf: $.proxy(function () {
                        return pkRule.rule.win.type() != '0'
                    }, this)
                },
                pattern: {
                    params: "^(0|[1-9][0-9]*)$",
                    message: '必须为数字'
                }
            });
            pkRule.rule.drawn.score.extend({
                required: {
                    params: true,
                    message: '不能为空',
                    onlyIf: $.proxy(function () {
                        return pkRule.rule.drawn.type() == '0'
                    }, this)
                },
                pattern: {
                    params: "^(0|[1-9][0-9]*)$",
                    message: '必须为数字'
                }
            });
            pkRule.rule.drawn.rate.extend({
                required: {
                    params: true,
                    message: '不能为空',
                    onlyIf: $.proxy(function () {
                        return pkRule.rule.drawn.type() != '0'
                    }, this)
                },
                pattern: {
                    params: "^(0|[1-9][0-9]*)$",
                    message: '必须为数字'
                }
            });
            pkRule.rule.lose.score.extend({
                required: {
                    params: true,
                    message: '不能为空',
                    onlyIf: $.proxy(function () {
                        return pkRule.rule.lose.type() == '0'
                    }, this)
                },
                pattern: {
                    params: "^(0|[1-9][0-9]*)$",
                    message: '必须为数字'
                }
            });
            pkRule.rule.lose.rate.extend({
                required: {
                    params: true,
                    message: '不能为空',
                    onlyIf: $.proxy(function () {
                        return pkRule.rule.lose.type() != '0'
                    }, this)
                },
                pattern: {
                    params:  "^(0|[1-9][0-9]*)$",
                    message: '必须为数字'
                }
            });
        },
        cancel: function () {
            if (return_url)
                location.href = return_url;
        },
        savePKRule: function () {
            this.saveRule(null);
        },
        saveRule: function (callBack) {
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                return;
            }
            var pkRule = ko.mapping.toJS(this.model.pkRule);
            pkRule.rule.init_score.type = +pkRule.rule.init_score.type;
            pkRule.rule.init_score.score = +pkRule.rule.init_score.score;
            pkRule.rule.init_score.rate = (+pkRule.rule.init_score.rate) / 100;

            pkRule.rule.win.type = +pkRule.rule.win.type;
            pkRule.rule.win.score = +pkRule.rule.win.score;
            pkRule.rule.win.rate = (+pkRule.rule.win.rate) / 100;

            pkRule.rule.drawn.type = +pkRule.rule.drawn.type;
            pkRule.rule.drawn.score = +pkRule.rule.drawn.score;
            pkRule.rule.drawn.rate = (+pkRule.rule.drawn.rate) / 100;

            pkRule.rule.lose.type = +pkRule.rule.lose.type;
            pkRule.rule.lose.score = +pkRule.rule.lose.score;
            pkRule.rule.lose.rate = (+pkRule.rule.lose.rate) / 100;

            if (rule_id) {
                store.update(pkRule)
                    .done(function (data) {
                        $.fn.dialog2.helpers.alert("更新成功");
                        callBack && callBack();
                    });
            } else {
                delete pkRule.id;
                store.create(pkRule)
                    .done($.proxy(function (data) {
                        this.model.pkRule.id(data.id);
                        rule_id = data.id;
                        $.fn.dialog2.helpers.alert("保存成功");
                        callBack && callBack();
                    }, this));
            }
        },
        saveThenBack: function () {
            this.saveRule(function () {
                if (return_url)
                    location.href = return_url;
            });
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery));