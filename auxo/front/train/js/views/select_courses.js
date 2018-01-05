(function ($, window) {
    'use strict';
    var store = {
        //获取培训下课程
        getTrainCourses: function (filter) {
            var url = selfUrl + '/' + projectCode + "/trains/" + train_id + "/courses?course_type=" + filter;
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        //获取培训已选课程
        getTrainSelectCourses: function () {
            var url = selfUrl + '/' + projectCode + "/v1/users/trains/" + train_id + "/selected_courses";
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        },
        //更新用户选修课程
        updateTrainSelectCourses: function (data) {
            var url = selfUrl + '/' + projectCode + "/v1/users/trains/" + train_id + "/selected_courses";
            return $.ajax({
                url: url,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(data),
                cache: false
            });
        },
        getTrainDetail: function () {
            var url = selfUrl + '/' + projectCode + "/trains/" + train_id;
            return $.ajax({
                url: url,
                type: 'GET',
                cache: false
            });
        }
    };
    var viewModel = {
        model: {
            toolDisplay: false,
            train: {
                id: '',
                cover_url: '',
                title: '',
                attention: '',
                description: '',
                option_hour: 0,
                require_hour: 0,
                demand_require_hour: 0,
                demand_option_hour: 0,
                user_count: 0,
                regist_start_time: '',
                regist_end_time: '',
                regist_attention: '',
                regist_num_limit: 0,
                unlock_criteria: 0,
                study_start_time: '',
                study_end_time: '',
                demand_course_hour: 0,
                study_time_limit_type: 0,
                select_course_caption:'',
                study_days: 0
            },
            requireCourse: [],
            selectCourse: [],
            selectedArray: [],
            selectedDetail: [],
            submitShowArray: [],
            totalSelectedTime: 0.00,
            showSelectModal: false
        },
        //页面初始化
        init: function () {
            var _self = this;
            document.title = i18nHelper.getKeyValue('trainComponent.selectCourse.title');
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById("train-container"));
            // this.getSelectedCourses();
            this._getTrainDetail();
            _self.model.selectedArray.subscribe(function (val) {
                var requeireTime = _self.getArrayTime(ko.mapping.toJS(_self.model.requireCourse)),
                    selectedTime = _self.getOptionTime(ko.mapping.toJS(val), ko.mapping.toJS(_self.model.selectCourse));
                _self.model.totalSelectedTime((requeireTime + selectedTime).toFixed(2));

            }, this);
            this.eventHandle();
        },
        //dom操作
        eventHandle: function () {
            var _self = this;
            $(window).on('scroll', function () {
                var target = $('#statistics'),
                    targetTop = target.offset().top + target.height();
                // $(window).scrollTop()
                if ($(window).scrollTop() >= targetTop) {
                    _self.model.toolDisplay(true);
                } else {
                    _self.model.toolDisplay(false);
                }
            })
        },

        //获取培训下用户已选课程
        getSelectedCourses: function () {
            var _self = this,requeireTime,selectedTime=0;
            store.getTrainSelectCourses().done(function (data) {
                $.each(data, function (i, v) {
                    _self.model.selectedArray.push(v.course_id);

                })
                if (_self.model.selectedArray().length > 0) {  
                    selectedTime = _self.getOptionTime(ko.mapping.toJS(_self.model.selectedArray), ko.mapping.toJS(_self.model.selectCourse));                                    
                    _self.selectAgainTip();
                }
                requeireTime = _self.getArrayTime(ko.mapping.toJS(_self.model.requireCourse));
                _self.model.totalSelectedTime((requeireTime + selectedTime).toFixed(2));
            })
        },
        //获取培训详情;
        _getTrainDetail: function () {
            var _self = this;
            store.getTrainDetail().done(function (data) {
                data.study_start_time = _self.ajustTimeString(data.study_start_time);
                data.study_end_time = _self.ajustTimeString(data.study_end_time);
                ko.mapping.fromJS(data, {}, viewModel.model.train);
                _self._getTrainCourses();
            })
            $("#train-container").removeClass('hide');
        },
        //获取培训下课程
        _getTrainCourses: function () {
            var _self = this;
            //获取必修课程
            $.when(
                store.getTrainCourses(0).done(function (data) {
                    ko.mapping.fromJS(data, {}, _self.model.requireCourse);
                    _self.model.totalSelectedTime((_self.getArrayTime(ko.mapping.toJS(_self.model.requireCourse))).toFixed(2));
                }),
                store.getTrainCourses(1).done(function (data) {
                    ko.mapping.fromJS(data, {}, _self.model.selectCourse);
                })
            ).done(function(){                
                _self.getSelectedCourses();
            })
            
            //获取选修课程
            
        },
        //获取数据
        // getPageData:function(){
        //     var _self = this;
        //     $.when(_self.getSelectedCourses(),_self._getTrainDetail(),_self._getTrainCourses()).done(function(){
        //         _self.selectAgainTip();
        //     })
        // },
        //重新进入选课页面提示
        selectAgainTip: function () {
            var _self = this;
            if (_self.model.selectedArray().length > 0) {
                $.fn.udialog.confirm(i18nHelper.getKeyValue('trainComponent.selectCourse.initTip'), [{
                    text: i18nHelper.getKeyValue('trainComponent.common.button.isee'),
                    'class': 'ui-btn-confirm',
                    click: function () {
                        // _self.getPageData();
                        $(this).udialog("hide");
                    }
                }, {
                    text: i18nHelper.getKeyValue('trainComponent.common.button.back'),
                    'class': 'ui-btn-primary',
                    click: function () {
                        _self.backToDetail();
                        $(this).udialog("hide");
                    }
                }], {
                    width: 368,
                    // title: i18nHelper.getKeyValue('trainComponent.coin.systemInfo'),
                    title: ''
                });
            }
        },
        //时间截取 2016-12-12 10:21
        ajustTimeString: function (date) {
            if (!date)
                return null;
            date = date.replace('T', ' ');
            date = date.substr(0, 16);
            return date;
        },
        //获取必修总学时学时
        getArrayTime: function (arr) {
            var _self = this,
                tempTime = 0;
            $.each(arr, function (i, v) {
                tempTime += arr[i].hour;
            })
            return !tempTime ? 0 : tempTime;
        },
        getOptionTime: function (arr, arr2) {
            var _self = this,
                tempTime = 0;
            $.each(arr, function (i, v) {
                $.each(arr2, function (j, ele) {
                    if (v == ele.course_id) {
                        tempTime += ele.hour;
                    }
                })
            })
            return !tempTime ? 0 : tempTime;
        },
        //保存用户选课
        saveSelectCourse: function () {
            var _self = this,
                select = _self.model;
            _self.model.selectedDetail([]);
            if (_self.model.selectedArray().length > 0) {
                $.each(_self.model.selectedArray(), function (index, ele) {
                    $.each(_self.model.selectCourse(), function (i, e) {
                        if (ele == e.course_id()) {
                            _self.model.selectedDetail.push(e);
                        }
                    })
                })
            }
            if (select.totalSelectedTime() < select.train.demand_course_hour() && _self.model.train.study_time_limit_type != 2) {
                $.fn.udialog.alert(i18nHelper.getKeyValue('trainComponent.selectCourse.hourNotEnough'), {
                    width: 368,
                    icon: '',
                    title: '',
                    buttons: [{
                        text: i18nHelper.getKeyValue('trainComponent.common.button.confirm'),
                        click: function () {
                            $(this).udialog("hide");
                        },
                        'class': 'ui-btn-primary'
                    }]
                });
            } else {
                select.showSelectModal(true);
            }
        },
        //提交用户选课
        _updateTrainSelectCourses: function () {
            var _self = this;
            // if (_self.model.selectedArray().length > 0) {
            store.updateTrainSelectCourses(_self.model.selectedArray()).done(function (data) {
                _self.colseSelectModal();
                $.fn.udialog.alert(i18nHelper.getKeyValue('trainComponent.selectCourse.saveSuccess'), {
                    width: 368,
                    icon: '',
                    title: '',
                    buttons: [{
                        text: i18nHelper.getKeyValue('trainComponent.common.button.confirm'),
                        click: function () {
                            $(this).udialog("hide");
                        },
                        'class': 'ui-btn-primary'
                    }]
                });
            })
            // } else {
            //     _self.colseSelectModal();
            // }
        },
        //关闭提交弹窗
        colseSelectModal: function () {
            var _self = this;
            _self.model.showSelectModal(false);
            _self.model.selectedDetail([]);
        },
        //返回培训详情页
        backToDetail: function () {
            window.location.href = selfUrl + '/' + projectCode + '/train/' + train_id;
        }

    }
    $(function () {
        viewModel.init();
    });

})(jQuery, window);