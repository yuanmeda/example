(function ($) {
    var store = {
        put: {
            createTask: function (data) {
                return $.ajax({
                    url: "/v1/task_learning_units",
                    dataType: "json",
                    type: "PUT",
                    data: JSON.stringify(data) || null,
                    contentType: "application/json;charset=utf8"
                });
            }
        },
        query: {
            task: function (unitId) {
                return $.ajax({
                    url: "/v1/task_learning_units/" + unitId,
                    contentType: "application/json;charset=utf8"
                });
            }
        }
    };

    var viewModel = {
        model: {
            resourceType: window.resourceType,
            iframeUrl: ""
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);

            this.initIframeUrl();
            this.initLinsener();

            ko.applyBindings(this);
        },
        initIframeUrl: function () {
            var url = "";

            switch (this.model.resourceType()) {
                case "class":
                    url = window.auxoPortalWebpage + "/" + window.projectCode + "/resource/manage?mode=select&unit_type=open-course";
                    break;
                case "train":
                    url = window.auxoPortalWebpage + "/" + window.projectCode + "/resource/manage?mode=select&unit_type=auxo-train";
                    break;
                case "online-exam":
                    url = window.auxoPortalWebpage + "/" + window.projectCode + "/resource/manage?mode=select&unit_type=online_exam";
                    break;
                default:
                    url = window.auxoPortalWebpage + "/" + window.projectCode + "/resource/manage?mode=select&unit_type=open-course";
                    break;
            }

            // window.location.href = url + "&__mac=" + Nova.getMacToB64(url);
            this.model.iframeUrl(url + "&__mac=" + Nova.getMacToB64(url));
        },
        initLinsener: function () {
            window.addEventListener('message', $.proxy(function (event) {
                try {
                    var resData = JSON.parse(event.data);
                    // 监听外部页面发过来的消息
                    if (resData.event_type) {
                        switch (resData.event_type) {
                            case "init_item":
                                this.processInitItem(resData.data);
                                break;
                            case "get_item":
                                this.processGetItem();
                                break;
                        }
                    } else if (resData.action) {
                        // 监听课程或者培训选择页面发过来的消息
                        if (resData.action == "RESOURCE_GET")
                            this.processLoaded();
                        if (resData.action == "RESOURCE_SAVE")
                            this.processSetItem(resData.data);
                    }
                } catch (err) {

                }
            }, this), false);
        },
        postMessage: function (data, isParent) {
            if (isParent) {
                window.parent.postMessage(data, "*");
            } else {
                window.frames[0].postMessage(JSON.stringify(data), "*");
            }
        },
        /**
         * 向外部窗口发送消息指式当前页面加载完成
         */
        processLoaded: function () {
            var data = this.translateForExternal({}, "loaded")
            this.postMessage(data, true);
        },
        /**
         * 向课程或者培训选择页面发送消息设置当前选中的项目
         */
        processInitItem: function (data) {
            store.query.task(data.code).done($.proxy(function (tinfo) {
                var tempData = this.translateForInternal(data, "setItems", tinfo.web_link);
                this.postMessage(tempData, false);
            }, this));
        },
        /**
         * 向课程或者培训选择页面发送消息获取当前选中的项目
         */
        processGetItem: function () {
            var tempData = this.translateForInternal({}, "getItems");
            this.postMessage(tempData, false);
        },
        /**
         * 向外部窗口发送消息，告知当前选中的项目
         */
        processSetItem: function (data) {
            var apiData = this.translateForApi(data);
            store.put.createTask(apiData);

            var externalData = this.translateForExternal(data, "set_item");
            this.postMessage(externalData, true);
        },
        /**
         * 将外部传递进来的数据转换为API需要的格式
         */
        translateForApi: function (data) {
            var msg = {
                "unit_type": this.getResourceType(),
                "unit_id": data.items && data.items.length > 0 ? data.items[0].resource_id : "",
                "web_link": data.items && data.items.length > 0 ? data.items[0].extra.web_link : "",
                "cmp_link": data.items && data.items.length > 0 ? data.items[0].extra.cmp_link : ""
            };

            return msg;
        },
        /**
         * 将外部传递进来的数据转换为外部页需要的格式
         */
        translateForExternal: function (data, type) {
            var msg = {
                "event_type": type,
                "data": {
                    "name": data.items && data.items.length > 0 ? data.items[0].title : "",
                    "code": data.items && data.items.length > 0 ? data.items[0].resource_id : "",
                    "cmp_link": data.items && data.items.length > 0 ? data.items[0].extra.cmp_link : "",
                    "web_link": data.items && data.items.length > 0 ? data.items[0].extra.web_link : ""
                }
            };

            return msg;
        },
        /**
         * 将外部传递进来的数据转换为内部资源选择页需要的格式
         */
        translateForInternal: function (data, type, web_link) {
            var msg = {
                "action": type === "setItems" ? "RESOURCE_SET" : "RESOURCE_GET",
                "data": {
                    "items": data ? [{
                        "id": data.code,
                        "extra": {
                            "web_link": web_link ? web_link : "",
                            "cmp_link": data.cmp_link ? data.cmp_link : ""
                        }
                    }] : []
                }
            };

            return msg;
        },
        save: function () {
            var data = this.translateForInternal({}, "getItems");
            this.postMessage(data, false);
        },
        getResourceType: function () {
            var type = "open-course";
            switch (window.resourceType) {
                case "class":
                    type = "open-course";
                    break;
                case "train":
                    type = "auxo-train";
                    break;
                case "online-exam":
                    type = "online_exam";
                    break;
            }

            return type;
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery)
