;(function ($, window) {
    'use strict';
    var store = {
        getCourseConfig: function () {
            return $.ajax({
                url: '/' + projectCode + '/trains/courses/' + courseId + '/config',
                type: 'GET',
                dataType: 'JSON',
                cache: false
            });
        },
        updateTrainUnlockCriteria: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/trains/courses/' + courseId + '/config',
                type: 'PUT',
                data: JSON.stringify(data),
                dataType: 'JSON',
                contentType: 'application/json;charset=utf8'
            });
        },
        getSelectedCourse: function () {
            return $.ajax({
                url: '/' + projectCode + '/trains/courses/' + courseId + '/pre_courses',
                type: 'GET',
                dataType: 'JSON',
                cache: false
            });
        },
        getUnselectedCourse: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/trains/' + trainId + '/courses/' + courseId + '/pre_courses/optional_courses',
                type: 'POST',
                dataType: 'JSON',
                data: JSON.stringify(data),
                contentType: 'application/json;charset=utf8'
            });
        },
        updatePreCourse: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/trains/courses/' + courseId + '/pre_courses',
                type: 'PUT',
                data: JSON.stringify(data),
                dataType: 'JSON',
                contentType: 'application/json;charset=utf8'
            });
        }
    };
    var viewModel = {
        model: {
            filter: {
                keyword: ''
            },
            unselectedCourse: [],
            selectedTrain: [],
            selectedTrainNow: [],
            unlock_type: "0",
            flags: {
                isPretrain: "0",
                isAllChecked: false
            }
        },
        init: function () {
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('content'));
            this.model.flags.isPretrain.subscribe(function (data) {
                if (data == "1" && this.model.unlock_type() == "0") this.model.unlock_type("2");
            }, this);
            this.model.selectedTrain.subscribe(function (data) {
                this.drag();
            }, this);
            this.model.selectedTrainNow.subscribe(function (data) {
                console.log(data);
            }, this);
            this.model.flags.isAllChecked = ko.computed({
                write: function (val) {
                    var unselectedTrain = ko.mapping.toJS(this.model.unselectedCourse), selectedTrainNow = ko.mapping.toJS(this.model.selectedTrainNow);
                    if (val) {
                        $.each(unselectedTrain, function (i1, v1) {
                            var found = true;
                            $.each(selectedTrainNow, function (i2, v2) {
                                if (v1.id == v2.id) {
                                    if (found)selectedTrainNow[i2] = v1;
                                    found = false;
                                    return false;
                                }
                            });
                            if (found)selectedTrainNow.push(v1);
                        });
                        this.model.unselectedCourse(unselectedTrain);
                        this.model.selectedTrainNow(selectedTrainNow);
                    } else {
                        this.model.selectedTrainNow.removeAll(this.model.unselectedCourse());
                    }
                },
                read: function () {
                    var unselectedTrain = ko.mapping.toJS(this.model.unselectedCourse), selectedTrainNow = ko.mapping.toJS(this.model.selectedTrainNow), equalCount = 0;
                    $.each(selectedTrainNow, function (i1, v1) {
                        $.each(unselectedTrain, function (i2, v2) {
                            if (v1.id == v2.id) ++equalCount;
                        });
                    });
                    return selectedTrainNow.length > 0 && equalCount === unselectedTrain.length;
                },
                owner: this
            });
            this.getCourseConfig();
        },
        getPreCourseList: function () {
            var _self = this;
            this.model.selectedTrainNow([]);
            store.getSelectedCourse().done(function (data) {
                $.each(data, function (i, v) {
                    v.business_course_vo.pre_sort_number = i + 1;
                });
                ko.mapping.fromJS(data, {}, _self.model.selectedTrain);
            });
        },
        deleteTrain: function ($data) {
            var selectedTrain = ko.mapping.toJS(this.model.selectedTrain), data = ko.mapping.toJS($data);
            var dragResult = [];
            $.each(selectedTrain, function (index, value) {
                if (value.business_course_vo.id != data.business_course_vo.id)dragResult.push(value);
            });
            $.each(dragResult, function (index, value) {
                value.business_course_vo.pre_sort_number = index + 1;
            });
            ko.mapping.fromJS(dragResult, {}, this.model.selectedTrain);
        },
        drag: function () {
            var _self = this;
            $("#selected_trains").dragsort("destroy");
            $("#selected_trains").dragsort({
                dragSelector: "li",
                dragBetween: true,
                scrollContainer: '#content',
                dragEnd: function () {
                    var id = this.attr("id");
                    var sort_number = this.attr("sort_number");
                    var dragResult = [];
                    $("#selected_trains").find("li").each(function (index, element) {
                        var sort_number = $(element).attr("sort_number"), selectedTrain = ko.mapping.toJS(_self.model.selectedTrain), train = selectedTrain[parseInt(sort_number) - 1];
                        train.business_course_vo.pre_sort_number = index + 1;
                        dragResult.push(train);
                    });
                    ko.mapping.fromJS(dragResult, {}, _self.model.selectedTrain);
                }
            });
        },
        getCourseConfig: function () {
            var _self = this;
            store.getCourseConfig().done(function (data) {
                if (data.unlock_type == 1 || data.unlock_type == 2)_self.getPreCourseList();
                _self.model.unlock_type(data.unlock_type.toString());
                if (_self.model.unlock_type() !== "0") {
                    _self.model.flags.isPretrain("1");
                } else {
                    _self.model.flags.isPretrain("0");
                }
            });
        },
        saveSelectedTrain: function () {
            var selectedTrainNow = ko.mapping.toJS(this.model.selectedTrainNow), selectedTrain = ko.mapping.toJS(this.model.selectedTrain), newSelected = [];
            $.each(selectedTrainNow, function (i1, v1) {
                var found = false;
                $.each(selectedTrain, function (i2, v2) {
                    if (v1.id == v2.business_course_vo.id) {
                        found = true;
                        return false;
                    }
                });
                if (!found) newSelected.push(v1);
            });
            newSelected = $.map(newSelected, function (obj, index) {
                obj.pre_sort_number = index + selectedTrain.length + 1;
                return {"progress_percent": 100, "business_course_vo": obj}
            });
            newSelected.length = (newSelected.length + selectedTrain.length) > 10 ? 10 - selectedTrain.length : newSelected.length;
            ko.mapping.fromJS(selectedTrain.concat(newSelected), {}, this.model.selectedTrain);
            $('#addTrainModal').modal('hide');
        },
        formatProgress: function ($data) {
            if ($data.progress_percent() === '' || $data.progress_percent() == '0')$data.progress_percent('1');
        },
        addPretrain: function () {
            var _self = this;
            this.model.selectedTrainNow([]);
            this.model.filter.keyword('');
            this.searchTrain();
        },
        savePreTrain: function () {
            var _self = this, preTrainForUpdate = [], unlockCriteria = {'unlock_type': 0}, selectedTrain = ko.mapping.toJS(this.model.selectedTrain), isError = false;
            var sendFn = function () {
                if (_self.model.flags.isPretrain() != "0") {
                    if (_self.model.unlock_type() != "3") {
                        $.each(selectedTrain, function (index, value) {
                            if (/^(100|[1-9][0-9]?)$/.test(value.progress_percent)) {
                                preTrainForUpdate.push({
                                    "pre_course_id": value.business_course_vo.id,
                                    "progress_percent": parseInt(value.progress_percent)
                                });
                            } else {
                                $.fn.dialog2.helpers.alert("课程完成进度需输入1到100的整数");
                                isError = true;
                                return false;
                            }
                        });
                    }
                    if (isError)return;
                    unlockCriteria = {'unlock_type': parseInt(_self.model.unlock_type())};
                }
                if (preTrainForUpdate.length == 0)_self.model.selectedTrain([]);
                store.updatePreCourse(preTrainForUpdate).done(function () {
                    store.updateTrainUnlockCriteria(unlockCriteria).done(function () {
                        if (_self.model.flags.isPretrain() == "0") _self.model.unlock_type("2");
                        $.fn.dialog2.helpers.alert("保存成功");
                    });
                });
            };
            if (_self.model.flags.isPretrain() != "0" && _self.model.unlock_type() != "3" && selectedTrain.length == 0) {
                $.fn.dialog2.helpers.confirm('当前未设置课程解锁，将默认课程已完成，是否保存？', {
                    confirm: function () {
                        sendFn();
                    }
                });
            } else {
                sendFn();
            }

        },
        searchTrain: function () {
            var _self = this, keyword = ko.mapping.toJS(_self.model.filter.keyword),
                selectedTrain = ko.mapping.toJS(this.model.selectedTrain),
                selectedTrainNow = ko.mapping.toJS(this.model.selectedTrainNow),
                exclude_course_ids = [];
            $.each(selectedTrain, function (i, v) {
                exclude_course_ids.push(v.business_course_vo.id);
            });
            store.getUnselectedCourse({exclude_course_ids: exclude_course_ids}).done(function (data) {
                var newUnselectedCourse = [];
                _self.allUnselectedCourseItems = data;
                newUnselectedCourse = keyword ? $.map(_self.allUnselectedCourseItems, function (obj) {
                    return new RegExp(keyword, 'gi').test(obj.name) ? obj : null;
                }) : data;
                $.each(selectedTrainNow, function (i1, v1) {
                    $.each(newUnselectedCourse, function (i2, v2) {
                        if (v1.id == v2.id)selectedTrainNow[i1] = v2;
                    });
                });
                _self.model.selectedTrainNow(selectedTrainNow);
                _self.model.unselectedCourse(newUnselectedCourse);
                $('#addTrainModal').modal('show');
            });

        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);