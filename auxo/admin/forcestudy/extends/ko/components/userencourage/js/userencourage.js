/**
 * @file: Javascript文件描述
 * @author: Administrator
 * @history: 2016/5/11
 */
;(function () {
    (function (koComponent) {
        /**
         * UMD support.
         */
        if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
            koComponent(require("knockout"), require("koMapping"), require("jquery"));
        } else if (typeof define === 'function' && define.amd) {
            define(["knockout", "koMapping", "jquery", "text!koComponentTemplateUrl/userencourage/userencourage"], koComponent);
        } else {
            var ko = window.ko;
            ko.components.register("x-userencourage", koComponent(ko, ko.mapping, window.jQuery, ""));
        }
    }(function (ko, koMapping, $, templateHtml) {
        var service = {
            /**
             * search
             * @param data
             * @returns {*}
             */
            list: function (data) {
                return $.ajax({
                    url: fs.API.FORCE_STUDY + "user_encourages/search",
                    type: "GET",
                    dataType: "json",
                    data: data
                });
            },
            /**
             * save
             * @param data
             * @returns {*}
             */
            save: function (data) {
                return $.ajax({
                    url: fs.API.FORCE_STUDY + "user_encourages",
                    type: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(data)
                });
            },
            /**
             * update
             * @param data
             * @returns {*}
             */
            update: function (data) {
                return $.ajax({
                    url: fs.API.FORCE_STUDY + "user_encourages",
                    type: "PUT",
                    contentType: "application/json",
                    data: JSON.stringify(data)
                });
            },
            /**
             * delete
             * @param id
             * @returns {*}
             */
            del: function (id) {
                return $.ajax({
                    url: fs.API.forceStudy("user_encourages/{id}", {id: id}),
                    type: "DELETE"
                });
            },
            /**
             * send
             * @param data
             * @returns {*}
             */
            send: function (data) {
                return $.ajax({
                    url: fs.API.FORCE_STUDY + "user_encourages/send",
                    type: "POST",
                    data: JSON.stringify(data)
                });
            },
            /**
             * can not be duplicated
             * @param data
             * @return {*}
             */
            allowUserEncourageSave: function (data) {
                return $.ajax({
                    url: fs.API.FORCE_STUDY + "user_encourages/exists",
                    type: "GET",
                    data: data
                });
            }
        };

        var util = {
            /**
             * alert
             * @param message content
             */
            alert: function (message) {
                if ($.alert) {
                    $.alert({
                        title: "系统提示",
                        content: message,
                        closeIcon: true,
                        confirmButton: "确定",
                        backgroundDismiss: true
                    });
                } else {
                    alert(message);
                }
            },
            /**
             * confirm
             * @param message content
             * @param confirmFn fn when confirm
             */
            confirm: function (message, confirmFn) {
                if ($.confirm) {
                    $.confirm({
                        title: "系统提示",
                        content: message,
                        closeIcon: true,
                        confirmButton: "确定",
                        cancelButton: "取消",
                        confirm: confirmFn
                    });
                } else {
                    if (confirm(message)) {
                        confirmFn();
                    }
                }
            },
            /**
             * cover koModel from item
             * @param koModel
             * @param item
             */
            fromJS: function (koModel, item) {
                $.each(koModel, function (k, o) {
                    var v = item[k];
                    if (v == null) {
                        v = "";
                    }
                    o(v);
                });
            },
            /**
             * show error
             * @param message
             */
            error: function (message) {
                throw new Error(message);
            }
        };

        var viewModel = function (params) {
            var model = {
                user_id: "",            // receive user_id
                search: {
                    type: ""            // 1-鼓励，2-鞭策
                },
                form: {
                    id: "",
                    type: "",
                    message: "",
                    is_default: ""
                },
                label: "",              // 鼓励/鞭策
                selectedList: [],       // selected data list
                dataList: [],           // data list
                isForm: false           // on saving or updating
            }, that = this;


            // params.user_id must exits
            // and params.search.type must be a ko.observable object
            // the list will get re-requested while params.type changed
            if (!params) {
                return util.error("params must be a object.");
            } else if (!params.user_id) {
                return util.error("params.user_id must exits.");
            } else if (!ko.isObservable(params.type)) {
                return util.error("params.type must be a ko.observable object.");
            }

            // transform useful params
            model.user_id = params.user_id;
            model.search.type = params.type;
            model.limit_count = +params.limit_count || 100;


            this.params = params;
            this.model = koMapping.fromJS(model);
            model = this.model;

            // re-init when needed
            function initReReady () {
                that.list();
            }

            // re-request according to model.search
            model.search.type.subscribe(function (type) {
                if (type) {
                    that.model.label(['', '鼓励', '鞭策'][type]);
                }
                initReReady();
            });
        };
        viewModel.prototype = {
            /**
             * list
             * and add default record to selectedList
             */
            list: function () {
                var search = koMapping.toJS(this.model.search),
                    that = this;
                this.cancelForm();
                service.list(search).then(function (data) {
                    that.model.dataList(data);
                    that.model.selectedList([]);
                    $.each(data, function (i, v) {
                        if (v.is_default) {
                            that.chooseItem(v);
                        }
                    });
                });
            },
            /**
             * save or update
             * after validating duplicate record
             */
            saveOrUpdate: function () {
                var data = koMapping.toJS(this.model.form),
                    method = data.id ? "update" : "save",
                    label = this.model.label.peek(),
                    limitCount = this.model.limit_count(),
                    that = this;
                data.message = $.trim(data.message);
                if (!data.message) {
                    return util.alert("请输入" + label + "语!");
                } else if (data.message.length > limitCount) {
                    return util.alert("最多允许" + limitCount + "字!");
                }
                service.allowUserEncourageSave(data).then(function (result) {
                    if (result == true) {
                        service[method](data).then(function () {
                            util.fromJS(that.model.form, {});
                            that.list();
                        });
                    } else {
                        util.alert("该" + label + "语已存在!");
                    }
                });
            },
            /**
             * set default record
             * @param id
             * @returns {boolean}
             */
            setDefault: function (id) {
                var that = this;
                service.update({
                    id: id,
                    is_default: 1
                }).then(function () {
                    that.list();
                });
            },
            /**
             * send spur
             * call callback after success
             */
            send: function () {
                var data = koMapping.toJS(this.model.search),
                    selectedList = this.model.selectedList.peek(),
                    that = this;
                if (!selectedList.length) {
                    util.alert("请选择" + this.model.label.peek() + "语");
                    return ;
                }
                data.message = selectedList[0].message;
                data.receive_user_id = this.model.user_id.peek();
                service.send(data).then(function () {
                    util.alert("发送成功");
                    that.hide();
                });
            },
            /**
             * confirm to delete record
             * @param id
             * @returns {boolean}
             */
            del: function (id) {
                var that = this;
                util.confirm("确定删除?", function () {
                    service.del(id).then(function () {
                        that.list();
                    });
                });
            },
            /**
             * show save or update form
             * @param item
             * @returns {boolean}
             */
            showForm: function (item) {
                util.fromJS(this.model.form, item || {
                        type: this.model.search.type.peek(),
                        is_default: 0
                    });
                this.model.isForm(true);
                return false;
            },
            /**
             * cancel form
             */
            cancelForm: function () {
                util.fromJS(this.model.form, {});
                this.model.isForm(false);
            },
            /**
             * choose record
             * @param item
             */
            chooseItem: function (item) {
                this.model.selectedList.removeAll();
                this.model.selectedList.push(item);
            },
            /**
             * call callback of parent context to hide modal if exits
             */
            hide: function () {
                if ($.isFunction(this.params.hideModal)) {
                    this.params.hideModal();
                }
            }
        };

        return {
            viewModel: viewModel,
            template: templateHtml ? templateHtml :
                "<!-- ko template: { nodes: $componentTemplateNodes } --><!-- /ko -->"
        };
    }));
}());