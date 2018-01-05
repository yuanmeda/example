(function ($, window) {
    //数据仓库
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
        //获取考试信息
        get: function () {
            var url = '/' + projectCode + '/v1/exams/' + examId + '/actions/get_exam_with_strategy';
            return $.ajax({
                url: url,
                type: 'get',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
            });
        },
        //创建考试
        create: function (data) {
            var url = '/' + projectCode + '/v1/exams/actions/create_exam_with_strategy';
            return $.ajax({
                url: url,
                type: 'post',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                data: JSON.stringify(data) || null,
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
            });
        },
        //更新考试信息
        update: function (data) {
            var url = '/' + projectCode + '/v1/exams/' + examId + '/actions/update_exam_with_strategy';
            return $.ajax({
                url: url,
                type: 'put',
                dataType: "json",
                enableToggleCase: true,
                cache: false,
                data: JSON.stringify(data) || null,
                contentType: 'application/json;charset=utf8',
                error: this.errorCallback
            });
        }
    };
    var viewModel = {
        model: {
            level_rate: [
                60, 70, 80, 90, 100
            ],
            exam: {
                title: '',
                begin_time: '',
                end_time: '',
                duration: '3',
                exam_chance: 0,
                passing_score: 0,
                analysis_cond_status: 0,
                analysis_cond_data: '',
                description: '',
                custom_id: '',
                custom_type: '',
                enroll_type: 0,
                upload_allowed: true,
                sub_type: 0,
                number_limit_type: 0,
                limit_number: 0,
                ranking_able: true,
                rating_setting_list: [],
                exam_strategy: '2',
                random_strategy: 0,
                paper_list: [{
                    paper_id: '12345678-1234-1234-1234-1234567890ab',
                    version: 0,
                    disabled: true,
                    location: 0
                }],
                question_setting_list: [{
                    title: '',
                    question_type: 0,
                    score: 0.0,
                    count: 0
                }],
                removed_paper_ids: [
                    '12345678-1234-1234-1234-1234567890ab'
                ],
                question_bank_ids: [
                    '12345678-1234-1234-1234-1234567890ab'
                ],
                question_count: '10',
                ndr_question_bank_ids: [
                    '12345678-1234-1234-1234-1234567890ab'
                ],
                enabled: false,
                original_level: [{
                    rating_title: '一级',
                    correct_rate: '70'
                }, {
                    rating_title: '二级',
                    correct_rate: '80'
                }, {
                    rating_title: '三级',
                    correct_rate: '90'
                }]
            },
            level_btn: false,
            bankId: 'a3eaaa51-b21d-49cf-ad83-38a49e3d55b0',
            category: 'QB000001000000',
            //modalModule: 'itemPool'
            modalModule: '',

            showModalFoot: false
        },
        init: function () {
            var _self = this;
            if (!examId) {
                $.each(_self.model.exam.original_level, function (i, v) {
                    _self.model.exam.rating_setting_list.push(v);
                })
            }
            this.model = ko.mapping.fromJS(this.model);
            this.model.showModalFoot = ko.computed(function () {
                return this.model.modalModule() == 'itemPool';
            }, this);
            ko.setTemplateEngine(new ko.nativeTemplateEngine());
            ko.applyBindings(this);
        },
        toggleModalModule: function (type, func) {
            if ($.isFunction(func))func();
            this.model.modalModule(type);
        },
        openBankEdit: function () {
            this.toggleModalModule('');
            this.toggleModalModule('bankEdit');
            $('#bankModal').modal('show');
        },
        addQuestion: function (data) {
            console.log(data);
        },
        deleteQuestion: function (data) {
            console.log(data);
        },
        //获取信息
        getBarrierInfo: function () {
            var _self = this;
            // if(examId){
            //     store.get()
            //         .done(function{

            //     })
            // }
        },
        createBarrier: function () {

        },
        addRandomAnswer: function () {

        },
        //添加级别
        addLevel: function () {
            var _self = this,
                index = _self.model.exam.rating_setting_list().length;
            _self.model.exam.rating_setting_list.push({
                rating_title: ko.observable(_self.getChineseNumber(index) + '级'),
                correct_rate: ko.observable('')
            })
            if (_self.model.exam.rating_setting_list().length > 9) {
                _self.model.level_btn(true);
            }
            // _self.model.exam.rating_setting_list=ko.observableArray(_self.model.exam.rating_setting_list());
        },
        //删除级别
        delLevel: function (index) {
            var _self = this;
            _self.model.exam.rating_setting_list.splice(index, 1);
        },
        //数字转中文
        getChineseNumber: function (num) {
            num = parseInt(num, 10);
            if (isNaN(num)) {
                return 0;
            }
            var cnNum = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
            if (num > 10) {
                return;
            }
            return cnNum[num];
        }

    }
    $(function () {
        viewModel.init();
    });
})(jQuery, window);
