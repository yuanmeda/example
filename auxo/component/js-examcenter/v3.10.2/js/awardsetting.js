(function ($, w) {
    'use strict';
    function CreditsObject(range, reward_value) {
        this.range = ko.observable(range).extend({
            required: {
                params: true,
                message: '准确率不能为空'
            },
            pattern: {
                params: "^(?:0|[1-9][0-9]?|100)$",
                message: '准确率为0-100的数字'
            }
        });
        this.reward_value = ko.observable(reward_value).extend({
            required: {
                params: true,
                message: '积分奖励不能为空'
            },
            maxLength: {
                params: 6,
                message: '积分最多{0}位数'
            },
            pattern: {
                params: "^([1-9][0-9]*)$",
                message: '积分需为大于0的整数'
            }
        });
    }

    function Model(params) {
        this.model = params.model;
        this.init();
    };

    Model.prototype = {
        init: function () {
            this.validateInit();
            this.bindingsExtend();
        },
        validateInit: function () {
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
            ko.validation.rules['correctNumber'] = {
                validator: function (obj) {
                    var dateList = ko.mapping.toJS(this.model.awardList);
                    var validate = true;
                    $.each(dateList, function (index, list) {
                        $.each(dateList, function (index2, list2) {
                            if (index != index2 && list.range == list2.range) {
                                validate = false;
                            }
                        });
                    });
                    return validate;
                }.bind(this),
                message: '准确率不能相同'
            };
            ko.validation.registerExtenders();
        },
        bindingsExtend: function () {
            var awardList = this.model.awardList;
            awardList.extend({
                correctNumber: {
                    onlyIf: $.proxy(function () {
                        var dateList = ko.mapping.toJS(this.model.awardList);
                        return dateList.length > 0 ? true : false;
                    }, this)
                }
            });
        },
        addOneCredits: function () {
            var awardList = ko.mapping.toJS(this.model.awardList);
            if (awardList.length > 0) {
                var highestRange = 0;
                $.each(awardList, function (index, list) {
                    if (list.range > highestRange) {
                        highestRange = list.range;
                    }
                });
                var tempRange = highestRange + 10 > 100 ? 100 : highestRange + 10;
                this.model.awardList.push(new CreditsObject(tempRange, 100));
            } else {
                this.model.awardList.push(new CreditsObject(50, 100));
            }
        }
    };

    ko.components.register('x-awardsetting', {
        viewModel: {
            createViewModel: function (params, tplInfo) {
                $(tplInfo.element).html(tplInfo.templateNodes);
                return new Model(params);
            }
        },
        template: '<div></div>'
    })
})(jQuery, window);



