import ko from 'knockout'
import tpl from './template.html'

const _ = ko.utils;
const EVENT_TYPE = 'GET_CHANGE_STATE';

var groupNames = (function () {
    return $.map(window.allGroupNames, function (v) {
        return v.name;
    })
})();

function ViewModel({section}) {
    var model = {
        modal: {
            tag: false,
            tag_name: 'icon_tag' + section.id,
            tab_name: 'icon_tab' + section.id,
            tab: false
        },
        items: [],
        info: {
            id: 0,
            data_type: 2,
            title: '',
            resource_name: '',
            tag_name: '',
            channel_name: '',
            web_picture: '',
            web_picture_url: '',
            mobile_picture: '',
            mobile_picture_url: '',
            resource_id: '',
            tag_id: '',
            order_type: 3,
            group_names: groupNames,
            channel_id: '',
            web_url: '',
            mobile_url: '',
        },
        setting: {
            "display": {
                "display_type": 1, //展示方式 1纯图片 2图片+文字 3纯文字
                "row_num": '1',
                "column_num": '4'
            }
        },
        selected_tag: {},
        selected_course: [],
        row_num: [{
            value: 1,
            text: '1行'
        }, {
            value: 2,
            text: '2行'
        }, {
            value: 3,
            text: '3行'
        }, {
            value: 4,
            text: '4行'
        }],
        column_num: [{
            value: 4,
            text: '4'
        }, {
            value: 5,
            text: '5'
        }],
        upload: null
    };
    this.model = ko.mapping.fromJS(model);
    this.params = section;
    this.data_type = ['链接到标签', '链接到资源', 'URL地址'];
    this.storeUrl = '';
    this.icon_modal = '#icon-modal-' + section.id;
    this.drag_name = '#icon-drag-' + section.id;
    this.init();
    this.validationsInfo = ko.validatedObservable(this.model, {deep: true});
    this._validator();
    var that = this;
    $("#drag").dragsort("destroy");
    setTimeout(function () {
        that.drag();
    }, 0)
}

ViewModel.prototype.store = {
    update_section: function (data, section_id) {
        return $.ajax({
            url: channelUrl + '/v1/sections/' + section_id + '/',
            type: 'put',
            dataType: 'json',
            contentType: 'application/json;charset=utf-8',
            data: JSON.stringify(data)
        })
    },
    del: function (id) {
        return $.ajax({
            url: channelUrl + '/v1/section_data/' + id + '/',
            type: 'delete'
        });
    },
    update: function (id, data) {
        return $.ajax({
            url: channelUrl + '/v1/section_data/' + id + '/',
            type: 'put',
            contentType: 'application/json;charset=uft-8',
            data: JSON.stringify(data)
        });
    },
    create: function (data, section_id) {
        return $.ajax({
            url: channelUrl + '/v1/sections/' + section_id + '/section_data',
            type: 'POST',
            contentType: 'application/json;charset=uft-8',
            data: JSON.stringify(data)
        });
    },
    move: function (section_data_id, next_section_data_id) {
        return $.ajax({
            url: channelUrl + '/v1/section_data/' + section_data_id + '/actions/move?next_section_data_id=' + next_section_data_id,
            type: 'put'
        })
    },
    getUploadUrl: function () {
        return $.ajax({
            url: channelUrl + '/v1/users/photo_session',
            cache: false
        });
    }
};
ViewModel.prototype.init = function () {
    this.model.items(this.params.section_data_list || []);
    ko.mapping.fromJS(this.params.setting, {}, this.model.setting);
    this.model.selected_course.subscribe(function (nv) {
        nv = $.isArray(nv) ? nv[0] : nv;
        if (nv) {
            this.model.info.title(nv.resource_name);
            this.model.info.resource_name(nv.resource_name);
            this.model.info.resource_id(nv.resource_id);
            this.model.info.channel_id(nv.channel_id);
        }
    }, this);
    this.model.info.data_type.subscribe(function (nv) {
        this.model.info.title('');
        this.model.info.resource_name('');
        this.model.info.resource_id('');
        this.model.info.channel_id('');
        this.model.info.tag_id('');
    }, this);
    var display = this.model.setting.display;
    this.autoSave(display.display_type);
    this.autoSave(display.row_num);
    this.autoSave(display.column_num);
};
ViewModel.prototype.autoSave = function (value, isGet) {
    value.extend({deferred: true});
    value.subscribe(function (nv) {
        var data = ko.mapping.toJS(this.model.setting), that = this;
        this.store.update_section({setting: JSON.stringify(data)}, this.params.id).done(function () {
            ko.observable().publishOn(EVENT_TYPE)(0);
        });
    }, this);
};
ViewModel.prototype.create = function () {
    var info = this.model.info, that = this;
    for (var key in info) {
        switch (key) {
            case 'channel_id':
                break;
            case 'data_type':
                info[key](2);
                break;
            case 'status':
                info[key](1);
                break;
            case 'order_type':
                info[key](3);
                break;
            case 'group_names':
                info[key](groupNames);
                break;
            default:
                info[key]('');
        }
    }
    this.model.selected_course([]);
    this.validationsInfo.errors.showAllMessages(false);
    $(this.icon_modal).modal('show');
    this.initUpload();
};
ViewModel.prototype.getTitle = function ($data) {
    switch ($data.data_type) {
        case 1:
            return $data.tag_name || $data.channel_name || $data.title;
        case 2:
            return $data.resource_name || $data.title;
        case 3:
            return $data.title;
        default:
            return $data.title;
    }
};
ViewModel.prototype.drag = function (col) {
    var _self = this;
    $(this.drag_name).dragsort({
        dragSelector: "tr",
        dragBetween: true,
        scrollContainer: _self.drag_name,
        dragSelectorExclude: "a",
        dragEnd: function () {
            var icon_id = this.attr("id");
            var sort_number = this.attr("sort_number");
            $(_self.drag_name).find("tr").each(function (index, element) {
                if (element.id == icon_id) {
                    var target_element = $(element).next();
                    if (target_element.length !== 0) {
                        sort_number = target_element.attr("sort_number");
                    } else {
                        sort_number = '';
                    }
                }
            });
            var param = {
                section_data_id: icon_id,
                next_section_data_id: sort_number
            };
            $(_self.drag_name).dragsort("destroy");
            _self.store.move(param.section_data_id, param.next_section_data_id).done(function (data) {
                _self.drag();
                ko.observable().publishOn(EVENT_TYPE)(0);
            });
        }

    });
};

ViewModel.prototype.del = function (id, $data) {
    var that = this;
    $.confirm({
        content: "确定删除吗？",
        title: '系统提示',
        buttons: {
            confirm: {
                text: '确定',
                btnClass: 'btn-primary',
                action: function () {
                    that.store.del(id).done(function () {
                        that.model.items.remove($data);
                        ko.observable().publishOn(EVENT_TYPE)(0);
                    });
                }
            },
            cancel: {
                text: '取消',
                action: function () {
                }
            }
        }
    });
};

ViewModel.prototype.edit = function ($data) {
    var info = this.model.info, that = this;
    for (var i in this.model.info) {
        info[i]($data[i]);
    }
    if (this.model.info.data_type() === 1) {
        this.model.info.resource_name(this.model.info.tag_name() ? this.model.info.tag_name() : this.model.info.channel_name());
    }
    $(this.icon_modal).modal('show');
    this.initUpload(true);
};
ViewModel.prototype.initUpload = function (isEdit) {
    var that = this;

    function params(uploadInfo) {
        return {
            image_width: 116,
            image_height: 116,
            default_image: isEdit ? that.model.info.mobile_picture_url() : '',
            id: that.model.info.mobile_picture,
            url: that.model.info.mobile_picture_url,
            api_url: channelUrl,
            upload_info: uploadInfo
        }
    }

    if (this.uploadInfo) {
        this.model.upload(params(this.uploadInfo));
    } else {
        this.store.getUploadUrl().done(function (data) {
                that.uploadInfo = data;
                that.model.upload(params(data));
            }
        );
    }
};
ViewModel.prototype.save = function () {
    if (!this.validationsInfo.isValid()) {
        this.validationsInfo.errors.showAllMessages();
        return false;
    }
    if (!this.model.info.mobile_picture()) {
        $.alert({
            title: "系统提示",
            content: "请上传标签图片",
            closeIcon: true,
            confirmButton: "确定"
        });
        return;
    }
    var data = ko.mapping.toJS(this.model.info), that = this;
    if (data.mobile_picture) data.mobile_picture = !~data.mobile_picture.indexOf('CS') ? 'CS:' + data.mobile_picture : data.mobile_picture;
    if (data.data_type === 3) {
        if (data.mobile_url && !data.mobile_url.match(/^(https?|cmp:\/\/)/)) {
            data.mobile_url = 'http://' + data.mobile_url;
        }
    }
    if (data.data_type == 1) {
        data.tag_name = data.resource_name;
    }
    if (data.id) {
        this.store.update(data.id, data).done((res) => {
            $(that.icon_modal).modal('hide');
            let old = _.arrayFirst(this.model.items(), (v) => {
                return v.id === res.id;
            });
            this.model.items.replace(old, $.extend(true, {}, old, res));
            ko.observable().publishOn(EVENT_TYPE)(0);
        });
    } else {
        data.id = undefined;
        this.store.create(data, this.params.id).done((res) => {
            $(that.icon_modal).modal('hide');
            this.model.items.push($.extend(true, {}, data, res));
            this.drag();
            ko.observable().publishOn(EVENT_TYPE)(0);
        });
    }
};

ViewModel.prototype._openDialog = function () {
    var data_type = this.model.info.data_type();
    if (this.model.info.id() && data_type === 2) return;
    this.model.modal.tag(false);
    this.model.modal.tab(false);
    if (data_type == 1) {
        this.model.modal.tag(true);
        ko.tasks.schedule(() => {
            $('#' + this.model.modal.tag_name()).modal('show');
        });
    } else if (data_type == 2) {
        this.model.modal.tab(true);
        ko.tasks.schedule(() => {
            $('#' + this.model.modal.tab_name()).modal('show');
        });
    }
};

ViewModel.prototype._validator = function () {
    ko.validation.init({
        errorMessageClass: 'text-danger'
    });
    var self = this;
    this.model.info.title.extend({
        required: {
            params: true,
            message: '必填项'
        }
    });
    this.model.info.resource_name.extend({
        required: {
            onlyIf: function () {
                return self.model.info.data_type() !== 3;
            },
            message: '请选择推荐内容'
        }
    });
    this.model.info.mobile_url.extend({
        required: {
            onlyIf: function () {
                return self.model.info.data_type() === 3;
            },
            message: '必填项'
        }
    });
};

ko.components.register('x-channel-admin-layout-content-icon', {
    synchronous: true,
    viewModel: ViewModel,
    template: tpl
});

