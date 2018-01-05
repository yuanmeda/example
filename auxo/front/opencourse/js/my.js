(function ($) {
    'use strict';
    var store = {
        // 所有GET请求都在放在这里面
        query: {
            // 获取列表
            list: function (data) {
                var url = (window.selfUrl || '') + "/" + projectCode + "/open_courses/m/search";
                return $.ajax({
                    url: url,
                    cache: false,
                    data: data,
                    dataType: "json"
                });
            }
        },
        // 所有POST请求都在放在这里面
        post: {},
        // 所有PUT请求都在放在这里面
        put: {},
        // 所有DEL请求都在放在这里面
        del: {}
    };
    var viewModel = {
        model: {
            filter: {
                page_no: 0,
                page_size: 1,
                audit_status: 0
            },
            list: {
                count: 0,
                items: []
            },
            current_course: {
                name: "",
                conver_url: "",
                tags: [],
                summary: ""
            },
            show_detail: false
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById("js_content"));
            this.list();
        },
        list: function () {
            var data = ko.mapping.toJS(this.model.filter);
            store.query.list(data).done($.proxy(function (data) {
                data = {
                    "items": [{
                        "id": "12345678-1234-1234-1234-1234567890ab",
                        "unit_id": "string",
                        "project_id": 0,
                        "name": "测试一",
                        "summary": "测试一",
                        "status": 0,
                        "description": "测试一",
                        "sort_number": 0,
                        "top_number": 0,
                        "enrolment_count": 0,
                        "cover_id": "string",
                        "cover_url": "string",
                        "period": 0.0,
                        "period_unit": "string",
                        "experience_type": 0,
                        "period_display_type": 0,
                        "resource_total_count": 0,
                        "price": 0.0,
                        "price_type": "string",
                        "tags": [{
                            "id": "12345678-1234-1234-1234-1234567890ab",
                            "title": "测试一"
                        }, {
                            "id": "12345678-1234-1234-1234-1234567890ab",
                            "title": "测试二"
                        }, {
                            "id": "12345678-1234-1234-1234-1234567890ab",
                            "title": "测试三"
                        }],
                        "create_time": "2015-01-01T00:00:00",
                        "create_user": 0,
                        "update_time": "2015-01-01T00:00:00",
                        "update_user": 0,
                        "check_type": 0,
                        "audit_status": 2,
                        "commit_time": "2015-01-01T00:00:00",
                        "video_count": 0,
                        "document_count": 0,
                        "exercise_count": 0,
                        "create_user_name": "string"
                    }, {
                        "id": "12345678-1234-1234-1234-1234567890ab",
                        "unit_id": "string",
                        "project_id": 0,
                        "name": "string",
                        "summary": "string",
                        "status": 0,
                        "description": "string",
                        "sort_number": 0,
                        "top_number": 0,
                        "enrolment_count": 0,
                        "cover_id": "string",
                        "cover_url": "string",
                        "period": 0.0,
                        "period_unit": "string",
                        "experience_type": 0,
                        "period_display_type": 0,
                        "resource_total_count": 0,
                        "price": 0.0,
                        "price_type": "string",
                        "tags": [{
                            "id": "12345678-1234-1234-1234-1234567890ab",
                            "title": "string"
                        }, {
                            "id": "12345678-1234-1234-1234-1234567890ab",
                            "title": "string"
                        }, {
                            "id": "12345678-1234-1234-1234-1234567890ab",
                            "title": "string"
                        }],
                        "create_time": "2015-01-01T00:00:00",
                        "create_user": 0,
                        "update_time": "2015-01-01T00:00:00",
                        "update_user": 0,
                        "check_type": 0,
                        "audit_status": 1,
                        "commit_time": "2015-01-01T00:00:00",
                        "video_count": 0,
                        "document_count": 0,
                        "exercise_count": 0,
                        "create_user_name": "string"
                    }],
                    "count": 2
                }

                if (data && data.count > 0) {
                    ko.mapping.fromJS(data, {}, this.model.list);
                }

                this.page();
            }, this));
        },
        changeList: function (audit_status) {
            this.model.filter.audit_status(audit_status);
            this.model.filter.page_no(0);
            this.model.filter.page_size(1);
            this.list();
        },
        page: function () {
            $("#pagination").pagination(this.model.list.count(), {
                is_show_first_last: false,
                is_show_input: true,
                is_show_total: false,
                items_per_page: this.model.filter.page_size(),
                num_display_entries: 5,
                current_page: this.model.filter.page_no(),
                prev_text: "common.addins.pagination.prev",
                next_text: "common.addins.pagination.next",
                callback: $.proxy(function (index) {
                    if (index != this.model.filter.page_no()) {
                        this.model.filter.page_no(index);
                        this.list();
                    }
                }, this)
            })
        },
        getTagLabel: function (course) {
            course = ko.mapping.toJS(course);
            var lab_content = "";
            for (var i = 0; i < course.tags.length; i++) {
                var tag = course.tags[i];
                if (i >= 1) {
                    lab_content += "," + tag.title;
                } else {
                    lab_content = tag.title;
                }
            }

            return lab_content;
        },
        showDetail: function (course) {
            ko.mapping.fromJS(course, {}, this.model.current_course);
            this.model.show_detail(true);
        },
        onclose: function () {
            this.model.show_detail(false);
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery);
