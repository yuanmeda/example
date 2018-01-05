;(function ($, window) {
    'use strict';
    var store = {
        getTrain: function () {
            return $.ajax({
                url: '/' + projectCode + '/trains/' + trainId,
                type: 'GET',
                dataType: 'JSON',
                cache: false
            });
        },
        updateTrainUnlockCriteria: function (unlockCriteria) {
            return $.ajax({
                url: '/' + projectCode + '/trains/' + trainId + '/unlock_criteria/' + unlockCriteria,
                type: 'PUT',
                dataType: 'JSON'
            });
        },
        getSelectedTrain: function () {
            return $.ajax({
                url: '/' + projectCode + '/trains/' + trainId + '/pre_trains',
                type: 'GET',
                dataType: 'JSON',
                cache: false
            });
        },
        getUnselectedTrain: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/trains/' + trainId + '/pre_trains/optional_trains',
                type: 'POST',
                dataType: 'JSON',
                data: JSON.stringify(data),
                contentType: 'application/json;charset=utf8'
            });
        },
        updatePreTrain: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/trains/' + trainId + '/pre_trains',
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
                keyword: '',
                page: 0,
                size: 10
            },
            unselectedTrain: [],
            selectedTrain: [],
            selectedTrainNow: [],
            train: {
                unlock_criteria: "0"
            },
            flags: {
                isPretrain: "0",
                isAllChecked: false
            }
        },
        init: function () {
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('js-content'));
            this.model.flags.isPretrain.subscribe(function (data) {
                if (data == "1" && this.model.train.unlock_criteria() == "0") this.model.train.unlock_criteria("2");
            }, this);
            this.model.selectedTrain.subscribe(function (data) {
                this.drag();
            }, this);
            this.model.flags.isAllChecked = ko.computed({
                write: function (val) {
                    var unselectedTrain = ko.mapping.toJS(this.model.unselectedTrain),
                        selectedTrainNow = ko.mapping.toJS(this.model.selectedTrainNow);
                    if (val) {
                        $.each(unselectedTrain, function (i1, v1) {
                            var found = true;
                            $.each(selectedTrainNow, function (i2, v2) {
                                if (v1.id == v2.id) {
                                    if (found) selectedTrainNow[i2] = v1;
                                    found = false;
                                    return false;
                                }
                            });
                            if (found) selectedTrainNow.push(v1);
                        });
                        this.model.unselectedTrain(unselectedTrain);
                        this.model.selectedTrainNow(selectedTrainNow);
                    } else {
                        this.model.selectedTrainNow.removeAll(this.model.unselectedTrain());
                    }
                },
                read: function () {
                    var unselectedTrain = ko.mapping.toJS(this.model.unselectedTrain),
                        selectedTrainNow = ko.mapping.toJS(this.model.selectedTrainNow), equalCount = 0;
                    $.each(selectedTrainNow, function (i1, v1) {
                        $.each(unselectedTrain, function (i2, v2) {
                            if (v1.id == v2.id) ++equalCount;
                        });
                    });
                    return selectedTrainNow.length > 0 && equalCount === unselectedTrain.length;
                },
                owner: this
            });
            this.getTrain();
        },
        getPreTrainList: function () {
            var _self = this;
            store.getSelectedTrain().done(function (data) {
                _self.model.selectedTrain(data.sort(function (obj1, obj2) {
                    return obj1.pre_sort_number - obj2.pre_sort_number;
                }));
            });
        },
        deleteTrain: function ($data) {
            this.model.selectedTrain.remove($data);
            var dragResult = [];
            $.each(this.model.selectedTrain(), function (index, value) {
                value.pre_sort_number = index + 1;
                dragResult.push(value);
            });
            this.model.selectedTrain([]);
            this.model.selectedTrain(dragResult);
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
                        var sort_number = $(element).attr("sort_number"),
                            train = _self.model.selectedTrain()[parseInt(sort_number) - 1];
                        train.pre_sort_number = index + 1;
                        dragResult.push(train);
                    });
                    _self.model.selectedTrain([]);
                    _self.model.selectedTrain(dragResult);
                }
            });
        },
        getTrain: function () {
            var _self = this;
            store.getTrain().done(function (data) {
                if (data.unlock_criteria == 2 || data.unlock_criteria == 3) _self.getPreTrainList();
                data.unlock_criteria = data.unlock_criteria.toString();
                ko.mapping.fromJS(data, {}, _self.model.train);
                if (_self.model.train.unlock_criteria() !== "0") {
                    _self.model.flags.isPretrain("1");
                } else {
                    _self.model.flags.isPretrain("0");
                }
            });
        },
        saveSelectedTrain: function () {
            var selectedTrainNow = ko.mapping.toJS(this.model.selectedTrainNow),
                selectedTrain = ko.mapping.toJS(this.model.selectedTrain), newSelected = [];
            $.each(selectedTrainNow, function (i1, v1) {
                var found = false;
                $.each(selectedTrain, function (i2, v2) {
                    if (v1.id == v2.id) {
                        found = true;
                        return false;
                    }
                });
                if (!found) newSelected.push(v1);
            });
            $.each(newSelected, function (i, v) {
                v.pre_sort_number = i + selectedTrain.length + 1;
            });
            newSelected.length = (newSelected.length + selectedTrain.length) > 10 ? 10 - selectedTrain.length : newSelected.length;
            this.model.selectedTrain(selectedTrain.concat(newSelected));
            $('#addTrainModal').modal('hide');
        },
        addPretrain: function () {
            var _self = this;
            this.model.selectedTrainNow([]);
            this.model.filter.page(0);
            this.model.filter.keyword('');
            this.searchTrain();
        },

        savePreTrain: function () {
            var _self = this, preTrainForUpdate = [], unlockCriteria = 0;
            var sendFn = function () {
                if (_self.model.flags.isPretrain() != "0") {
                    if (_self.model.train.unlock_criteria() != "1") {
                        $.each(_self.model.selectedTrain(), function (index, value) {
                            preTrainForUpdate.push({pre_train_id: value.id, sort_number: value.pre_sort_number});
                        });
                    }
                    unlockCriteria = parseInt(_self.model.train.unlock_criteria());
                }
                if (preTrainForUpdate.length == 0) _self.model.selectedTrain([]);
                store.updatePreTrain(preTrainForUpdate).done(function () {
                    store.updateTrainUnlockCriteria(unlockCriteria).done(function () {
                        if (_self.model.flags.isPretrain() == "0") _self.model.train.unlock_criteria("2");
                        $.fn.dialog2.helpers.alert("保存成功");
                    });
                });
            };
            if (_self.model.flags.isPretrain() != "0" && _self.model.train.unlock_criteria() != "1" && _self.model.selectedTrain().length == 0) {
                $.fn.dialog2.helpers.confirm('当前未设置先修培训，将默认先修培训已完成，是否保存？', {
                    confirm: function () {
                        sendFn();
                    }
                });
            } else {
                sendFn();
            }
        },
        searchTrain: function () {
            var _self = this, filter = ko.mapping.toJS(this.model.filter),
                selectedTrain = ko.mapping.toJS(this.model.selectedTrain),
                selectedTrainNow = ko.mapping.toJS(this.model.selectedTrainNow),
                not_train_ids = [];
            $.each(selectedTrain, function (i, v) {
                not_train_ids.push(v.id);
            });
            filter.title = filter.keyword;
            filter.keyword = undefined;
            if (not_train_ids.length > 0) filter.not_train_ids = not_train_ids;
            store.getUnselectedTrain(filter).done(function (data) {
                _self.model.unselectedTrain(data.items);
                _self._pagination(data.total);
                $.each(selectedTrainNow, function (i1, v1) {
                    $.each(data.items, function (i2, v2) {
                        if (v1.id == v2.id) selectedTrainNow[i1] = v2;
                    });
                });
                _self.model.selectedTrainNow(selectedTrainNow);
                $('#addTrainModal').modal('show');
            });
        },
        _pagination: function (totalCount) {
            var _target = $('#pagination'),
                _filter = this.model.filter,
                _self = this;
            _target.pagination(totalCount, {
                items_per_page: _filter.size(),
                num_display_entries: 5,
                current_page: _filter.page(),
                is_show_total: true,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '上一页',
                next_text: '下一页',
                callback: function (page_no) {
                    if (page_no != _filter.page()) {
                        _filter.page(page_no);
                        _self.searchTrain();
                    }
                }
            });
        },
        newSearchTrain: function () {
            this.model.filter.page(0);
            this.searchTrain();
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);