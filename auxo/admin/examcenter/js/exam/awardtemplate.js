void function () {
    var store = {
        search: function (filter) {
            var url = '/' + projectCode + '/exam_center/exam_reward_templates';
            return $.ajax({
                url: url,
                data: filter,
                cache: false
            });
        },
        deleteTemplate: function (id) {
            var url = '/' + projectCode + '/exam_center/exam_reward_templates/' + id;
            return $.ajax({
                url: url,
                cache: false,
                type: 'delete'
            });
        },
        saveTemplate: function (data) {
            var url = '/' + projectCode + '/exam_center/exam_reward_templates';
            return $.ajax({
                url: url,
                data: JSON.stringify(data),
                type: 'post',
                cache: false
            });
        }
    };

    var viewModel = {
        model: {
            modalTitle: "新建模板名称",
            editingTemplateInfo: {
                name: '',
                id: ''
            },
            filter: {
                name: '',//奖励模板名称
                // status:0,//奖励模板状态 0 下线；1上线,
                // reward_field_type:'',//奖励依据字段
                page: 0,
                size: 20
            },
            examRewardTemplatesList: [],
            requestStatus: false
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
            //回车搜索
            $('#js-keyword').on('keyup', $.proxy(function (e) {
                if (e.keyCode === 13) {
                    this.doSearch();
                }
            }, this));
            this._list();

        },
        _list: function () {
            var filter = ko.mapping.toJS(this.model.filter);
            store.search(filter)
                .done(function (data) {
                    if (this._fixPage(data.count)) {
                        this._list();
                        return;
                    }
                    this.model.examRewardTemplatesList(Array.isArray(data.items) ? data.items : []);
                    Utils.pagination(data.count, filter.size, filter.page, $.proxy(function (page) {
                        this.model.filter.page(page);
                        this._list();
                    }, this));
                }.bind(this));
        },
        _fixPage: function (total) {
            var page = this.model.filter.page(), max = Math.ceil(total / this.model.filter.size() - 1);
            max < 0 && (max = 0);
            if (page > 0 && page > max) {
                this.model.filter.page(max);
                return true;
            }
            return false;
        },
        doSearch: function () {
            this.model.filter.page(0);
            this._list();

        },
        doDeleteTemplate: function (data, ele) {
            store.deleteTemplate(data.id)
                .done(function (res) {
                    this._list();
                }.bind(this))
        },
        openEditPage: function (data, ele) {
            location.href = '/' + projectCode + '/exam_center/awardruleedit?id=' + data.id;
        },
        doOnOffline: function (newStatus, data, ele) {
            var data = {
                id: data.id,
                status: newStatus
            };
            store.saveTemplate(data)
                .done(function (res) {
                    Utils.msgTip((newStatus == 1 ? '上线' : '下线') + '成功!').done(function () {
                        this._list();
                    }.bind(this));
                }.bind(this))
        },
        openTemplateWin: function (data) {
            this.model.editingTemplateInfo.name(data.name);
            this.model.editingTemplateInfo.id(data.id);
            this.model.modalTitle('编辑模板名称');
            $("#templateWin").modal('show');
        },
        createTemplateWin: function () {
            this.model.editingTemplateInfo.name('');
            this.model.editingTemplateInfo.id('');
            this.model.modalTitle('新增模板名称');
            $("#templateWin").modal('show');
        },
        saveEditingTemplate: function () {
            var templateInfo = ko.mapping.toJS(this.model.editingTemplateInfo);
            templateInfo.name = $.trim(templateInfo.name);
            if (!templateInfo.name) {
                this.model.editingTemplateInfo.name('');
                Utils.msgTip('模板名称不能为空');
                return;
            } else if ($.trim(templateInfo.name).length > 30) {
                Utils.msgTip('长度不能大于30');
                return;
            }

            var data = {
                name: templateInfo.name
            };
            if (templateInfo.id) {
                data.id = templateInfo.id
            }
            if (this.model.requestStatus()) {
                return;
            }
            this.model.requestStatus(true);
            store.saveTemplate(data)
                .done(function (res) {
                    $("#templateWin").modal('hide');
                    this.model.requestStatus(false);
                    Utils.msgTip((templateInfo.id ? '编辑' : '新增') + '成功!').done(function () {
                        if (!templateInfo.id) {
                            this.model.filter.page(0);
                        }
                        this.model.editingTemplateInfo.name('');
                        this._list();
                    }.bind(this));

                }.bind(this));
        }

    };
    $(function () {
        viewModel.init();
    });

}(jQuery);