void function() {
    var store = {
        //查询当前配置情况
        search: function () {
            return $.ajax({
                url: examServiceUrl + '/v1/exams/' + examId,
                cache: false,
                dataType: 'json'
            });
        },
        //获取保存的记录
        getRecord: function (data) {
            return $.ajax({
                url: examServiceUrl + '/v1/exams/ip_segments/search',
                data: data,
                cache: false
            })
        },
        //删除记录
        deleteRecord: function (id) {
            return $.ajax({
                url: examServiceUrl + '/v1/exams/ip_segments/' + id,
                type: 'delete',
                cache: false
            })
        },
        //重命名记录
        renameRecord: function (record) {
            return $.ajax({
                url: examServiceUrl + '/v1/exams/ip_segments/' + record.id,
                dataType: 'json',
                type: 'put',
                data: JSON.stringify({
                    'name': record.name,
                    'ip_segments': record['ip_segments']
                }),
                contentType: 'application/json;charset=utf8',
                cache: false
            })
        },
        //保存配置到记录
        saveRecord: function (data) {
            return $.ajax({
                url: examServiceUrl + '/v1/exams/ip_segments',
                dataType: 'json',
                type: 'post',
                data: JSON.stringify(data),
                contentType: 'application/json;charset=utf8',
                cache: false
            })
        },
        //保存配置
        save: function (data) {
            return $.ajax({
                url: examServiceUrl + '/v1/exams/' + examId + '/actions/update_exam_with_tool',
                dataType: 'json',
                type: 'put',
                data: JSON.stringify(data),
                contentType: 'application/json;charset=utf8',
                cache: false
            })
        },
    };

    var viewModel = {
        model: {
            useClient: '0',
            configList: [],
            recordList: [],
            configName: '',
            filter: {
                size: 5, //分页大小
                page: 0, //分页索引
            },
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.validationsInfo = ko.validatedObservable(this.model, {deep: true});
            ko.applyBindings(this);
            var self = this;
            store.search()
                .done(function (examVo) {
                    var type = examVo['exam_tool_type'];
                    if (type !== undefined) {
                        type = type + '';
                    }
                    self.model.useClient(type);
                    self.model.configList(examVo['ip_segments'] || []);
                });
            $('#radio_false').click(function () {
                self.save();
            });
        },
        getRecordList: function () {
            var self = this;
            var _search = ko.mapping.toJS(self.model.filter);
            store.getRecord(_search).done(function (list) {
                if (list.count === 0) {
                    $('#recordlist').modal('hide');
                    $.fn.dialog2.helpers.alert('还没有保存过IP配置记录!');
                    return;
                }
                if (list && list.items) {
                    self.model.recordList(list.items)
                }
                $('#pagination').pagination(list.count, {
                    items_per_page: self.model.filter.size(),
                    num_display_entries: 5,
                    current_page: self.model.filter.page(),
                    is_show_total: false,
                    is_show_input: false,
                    pageClass: 'pagination-box',
                    prev_text: '<&nbsp;上一页',
                    next_text: '下一页&nbsp;>',
                    callback: function (pageNum) {
                        if (pageNum != self.model.filter.page()) {
                            self.model.filter.page(pageNum);
                            self.getRecordList();
                        }
                    }
                });
                // Utils.pagination(list.count,
                //     self.model.filter.size(),
                //     self.model.filter.page(),
                //     function (no) {
                //
                //     }
                // );
                $('#recordlist').modal('show');
            })
        },
        addSegment: function () {
            this.model.configList.push({
                'start_ip': '',
                'end_ip': ''
            })
        },
        deleteSegment: function (index) {
            this.model.configList.splice(index, 1);
        },
        addSegments: function (index) {
            var list = this.model.configList().concat(this.model.recordList()[index]['ip_segments']);
            this.model.configList(list);
        },
        renameRecord: function (index) {
            if(this.model.recordList()[index].name.length > 30) {
                $.fn.dialog2.helpers.alert('记录名称长度不得超过30字符！！');
                return;
            }
            store.renameRecord(this.model.recordList()[index]);
        },
        deleteRecord: function (index) {
            var self = this;
            var deleteItem = self.model.recordList()[index];
            self.model.recordList.splice(index, 1);
            store.deleteRecord(deleteItem.id).done( function () {
                self.getRecordList();
            });
        },
        openSaveDialog: function (){
            if (this._checkEmpty() && this._checkIllegal()) {
                var date = new Date();
                var name = ' IP配置记录_' + date.getFullYear() + date.getMonth() + date.getDate() + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds();
                this.model.configName(name);
                $('#recordconfig').modal('show');
            }
        },
        _checkEmpty: function () {
            if (this.model.configList().length === 0) {
                $.fn.dialog2.helpers.alert('IP段不能为空！');
                return false;
            }
            return true;
        },
        _checkIllegal: function () {
            var legal = true;
            var reg = /^(?:(?:1[0-9][0-9]\.)|(?:2[0-4][0-9]\.)|(?:25[0-5]\.)|(?:[1-9][0-9]\.)|(?:[0-9]\.)){3}(?:(?:1[0-9][0-9])|(?:2[0-4][0-9])|(?:25[0-5])|(?:[1-9][0-9])|(?:[0-9]))$/;
            this.model.configList().map( function (item) {
                if (!item || !reg.test(item['start_ip']) || !reg.test(item['end_ip'])) {
                  legal = false;
                } else {
                    var startIp = item['start_ip'].split('.');
                    var endIp = item['end_ip'].split('.');
                    for (var i = 0; i < startIp.length; i++) {
                        if (startIp[i] < endIp[i]) {
                            break;
                        } else if (startIp[i] === endIp[i]) {
                            continue;
                        } else {
                            legal = false;
                            break;
                        }
                    }
                }
            })
            if (!legal) {
                $.fn.dialog2.helpers.alert('IP设置存在不合法或者起始IP大于结束IP！');
            }
            return legal;
        },
        saveCurrentConfig: function () {
            if(this.model.configName().length > 30) {
                $.fn.dialog2.helpers.alert('记录名称长度不得超过30字符！！');
                return;
            }
            store.saveRecord({
                'name': this.model.configName(),
                'ip_segments': this.model.configList()
            }).done(function () {
                $('#recordconfig').modal('hide');
            })
        },
        save: function () {
            var data = {};
            if (this.model.useClient() === '0') {
                data['exam_tool_type'] = 0;
            } else if (this._checkEmpty() && this._checkIllegal()){
                data['exam_tool_type'] = 1;
                data['ip_segments'] = this.model.configList()
            } else {
                return;
            }
            store.save(data);
        }
    }
    $(function () {
        viewModel.init();
    });
}(jQuery)