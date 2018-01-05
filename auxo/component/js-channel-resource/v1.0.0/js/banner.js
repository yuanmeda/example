(function () {
    "use strict";

    var groupNames = (function () {
        return $.map(window.allGroupNames, function (v) {
            return v.name;
        })
    })();

    function ViewModel(params) {
        var model = {
            items: [],
            info: {
                id: 0,
                data_type: 2,
                title: '',
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
                mobile_url: ''
            },
            selected_course: [],
            setting: {
                "display": {
                    "show_tags": false, //是否显示标签
                    "banner_width": "center" //center居中，full全屏
                }
            },
            selected_tag: {
                tag_id: '',
                title: '',
                channel_id: '',
                group_names: [],
                order_type: ''
            },
            modal: {
                tag_name: 'banner_tag-' + params.banner.id,
                tag: false,
                tab: false,
                tab_name: 'banner_tab-' + params.banner.id
            },
            upload: {
                web: null,
                mobile: null,
                info: null
            }

        };
        this.model = ko.mapping.fromJS(model);
        this.params = params.banner;
        this.parent = params.parent;
        this.drag_name = '#banner-drag-' + this.params.id;
        this.bannel_modal = '#banner-modal-' + this.params.id;
        this.data_type = ['链接到标签', '链接到资源', 'URL地址'];
        this.init();
        this.validationsInfo = ko.validatedObservable(this.model, {deep: true});
        this._validator();
        var that = this;
        setTimeout(function () {
            $(that.drag_name).dragsort("destroy");
            that.drag();
        }, 0);

    }

    ViewModel.prototype.init = function () {
        this.model.items(this.params.section_data_list || []);
        if (this.params.setting.display && this.params.setting.display.banner_width) ko.mapping.fromJS(this.params.setting, {}, this.model.setting);
        this.model.selected_course.subscribe(function (nv) {
            nv = $.isArray(nv) ? nv[0] : nv;
            if (nv) {
                this.model.info.title(nv.resource_name);
                this.model.info.resource_id(nv.resource_id);
                this.model.info.channel_id(nv.channel_id);
            }

        }, this);
        this.model.info.data_type.subscribe(function (nv) {
            this.model.info.title('');
            this.model.info.resource_id('');
            this.model.info.channel_id('');
            this.model.info.tag_id('');
        }, this);
        var display = this.model.setting.display;
        this.autoSave(display.show_tags);
        this.autoSave(display.banner_width);
    };
    ViewModel.prototype.autoSave = function (value, isGet) {
        value.extend({deferred: true});
        value.subscribe(function (nv) {
            var data = ko.mapping.toJS(this.model.setting), that = this;
            this.store.update_section({setting: JSON.stringify(data)}, this.params.id).done(function () {
                that.parent.model.isChange('true');
                //that.parent.getChannelSection.call(that.parent);
            });
        }, this);
    };
    ViewModel.prototype.store = {
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
        },
        update_section: function (data, section_id) {
            return $.ajax({
                url: channelUrl + '/v1/sections/' + section_id + '/',
                type: 'put',
                dataType: 'json',
                contentType: 'application/json;charset=utf-8',
                data: JSON.stringify(data)
            })
        }
    };
    ViewModel.prototype.create = function () {
        if (this.model.items().length >= 8) {
            $.alert('Banner推荐最多8个，已到达上限。');
            return;
        }
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
        $(this.bannel_modal).modal('show');
        this.initUpload();

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
                            that.parent.model.isChange('true');
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
        $(this.bannel_modal).modal('show');
        this.initUpload(true);
    };
    ViewModel.prototype.initUpload = function (isEdit) {
        var that = this;

        function params(uploadInfo) {
            return {
                web: {
                    image_width: 480,
                    image_height: 100,
                    default_image: isEdit ? that.model.info.web_picture_url() || 'http://p11.e.99.com/s/p/1/1de5f758106b4dfeaa8175e885d79b75.jpg' : '',
                    id: that.model.info.web_picture,
                    url: that.model.info.web_picture_url,
                    api_url: channelUrl,
                    upload_info: uploadInfo
                },
                mobile: {
                    image_width: 250,
                    image_height: 200,
                    default_image: isEdit ? that.model.info.mobile_picture_url() || 'http://p11.e.99.com/s/p/1/8defa230276846ffb06706cebc0768ee.jpg' : '',
                    id: that.model.info.mobile_picture,
                    url: that.model.info.mobile_picture_url,
                    api_url: channelUrl,
                    upload_info: uploadInfo
                }
            }
        }

        if (this.model.upload.info()) {
            this.model.upload.web(params(this.model.upload.info()).web);
            this.model.upload.mobile(params(this.model.upload.info()).mobile);
        } else {
            this.store.getUploadUrl().done(function (data) {
                    that.model.upload.web(params(data).web);
                    that.model.upload.mobile(params(data).mobile);
                    that.model.upload.info(data);
                }
            );
        }
    };
    ViewModel.prototype.saveBanner = function () {
        if (!this.validationsInfo.isValid()) {
            this.validationsInfo.errors.showAllMessages();
            return false;
        }
        var data = ko.mapping.toJS(this.model.info), that = this;
        if (data.data_type === 3) {
            if (data.web_url && !data.web_url.match(/^(https?|cmp:\/\/)/)) {
                data.web_url = 'http://' + data.web_url;
            }
            if (data.mobile_url && !data.mobile_url.match(/^(https?|cmp:\/\/)/)) {
                data.mobile_url = 'http://' + data.mobile_url;
            }
        }
        if (data.web_picture) data.web_picture = !~data.web_picture.indexOf('CS') ? 'CS:' + data.web_picture : data.web_picture;
        if (data.mobile_picture) data.mobile_picture = !~data.mobile_picture.indexOf('CS') ? 'CS:' + data.mobile_picture : data.mobile_picture;
        if (data.id) {
            this.store.update(data.id, data).done(function () {
                $(that.bannel_modal).modal('hide');
                $(".modal-backdrop").remove();
                $('body').removeClass('modal-open');
                that.parent.getChangeState.call(that.parent);
                that.parent.getChannelSection.call(that.parent);
            });
        } else {
            data.id = undefined;
            this.store.create(data, this.params.id).done(function (res) {
                $(that.bannel_modal).modal('hide');
                $(".modal-backdrop").remove();
                $('body').removeClass('modal-open');
                that.parent.model.isChange('true');
                that.parent.getChannelSection.call(that.parent);
            });
        }
        return true;
    };
    ViewModel.prototype._openDialog = function () {
        var data_type = this.model.info.data_type();
        if (this.model.info.id() && data_type === 2) return;
        this.model.modal.tag(false);
        this.model.modal.tab(false);
        if (data_type == 1) {
            this.model.modal.tag(true);
            $('#' + this.model.modal.tag_name()).modal('show');
        }
        else if (data_type == 2) {
            this.model.modal.tab(true);
            $('#' + this.model.modal.tab_name()).modal('show');
        }
    };
//表单验证
    ViewModel.prototype._validator = function () {
        this.model.info.title.extend({
            required: {
                params: true,
                message: '必填'
            }
        });
    };
//拖拉组件初始化
    ViewModel.prototype.drag = function () {
        var _self = this;
        $(this.drag_name).dragsort({
            dragSelector: "tr",
            dragBetween: true,
            dragSelectorExclude: "a",
            scrollContainer: _self.drag_name,
            dragEnd: function () {
                var banner_id = this.attr("id");
                var sort_number = this.attr("sort_number");
                $(_self.drag_name).find("tr").each(function (index, element) {
                    if (element.id == banner_id) {
                        var target_element = $(element).next();
                        if (target_element.length !== 0) {
                            sort_number = target_element.attr("sort_number");
                        } else {
                            sort_number = '';
                        }
                    }
                });
                var param = {
                    section_data_id: banner_id,
                    next_section_data_id: sort_number
                };
                $(_self.drag_name).dragsort("destroy");
                _self.store.move(param.section_data_id, param.next_section_data_id).done(function (data) {
                    _self.parent.model.isChange('true');
                    _self.drag();
                });
            }

        });
    };
    ko.components.register('x-channel-banner', {
        synchronous: true,
        viewModel: ViewModel,
        template: '<div data-bind="template:{nodes:$componentTemplateNodes}"></div>'
    });
})
();