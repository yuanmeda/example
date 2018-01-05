(function ($) {
    var store = {
        opencourse: {
            audit: function () {
                return $.ajax({
                    url: "/" + projectCode + "/v1/open_courses/" + window.courseId + "/audit"
                });
            }
        },
        audit: {
            checkList: function (data) {
                return $.ajax({
                    url: window.auditServiceUrl + "/v1/checklists/search",
                    data: JSON.stringify(data),
                    type: "POST"
                });
            },
            resons: function (data) {
                return $.ajax({
                    url: window.auditServiceUrl + "/v1/reject_reasons/search",
                    data: JSON.stringify(data),
                    type: "POST"
                });
            },
            reject: function (auditId, data) {
                return $.ajax({
                    url: window.auditServiceUrl + "/v1/audits/" + auditId + "/reject",
                    type: "POST",
                    data: JSON.stringify(data)
                });
            },
            pass: function (auditId) {
                return $.ajax({
                    url: window.auditServiceUrl + "/v1/audits/" + auditId + "/pass",
                    type: "POST"
                });
            },
            status: function (data) {
                return $.ajax({
                    url: window.auditServiceUrl + "/v1/m/audits/status/audit",
                    type: "GET",
                    data: data
                })
            },
            info: function (auditId) {
                return $.ajax({
                    url: window.auditServiceUrl + "/v1/audits/" + auditId,
                    type: "GET"
                })
            }
        }
    };

    var viewModel = {
        model: {
            opencourse: {
                "course_id": "",
                "unit_id": "",
                "title": "",
                "channel_ids": [],
                "tag_titles": [],
                "audit_id": "",
                "audit_status": 0,
                "audit_program_id": "",
                "audit_submit_time": "",
                "price": 0.0,
                "price_type": ""
            },
            statusList: {
                "total": 0,
                "items": []
            },
            checkFilter: {
                "page": 0,
                "size": 20
            },
            checkList: {
                "total": 0,
                "items": []
            },
            resaonFilter: {
                "page": 0,
                "size": 20
            },
            reasons: {
                "total": 0,
                "items": []
            },
            statusText: {
                "0": "未提交",
                "1": "待审核",
                "2": "审核通过",
                "3": "驳回"
            },
            reject_reason: ""
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('content'));
            this.initData();
        },
        initData: function () {
            store.opencourse.audit().done($.proxy(function (data) {
                ko.mapping.fromJS(data, {}, this.model.opencourse);
                this.getReasons();
                this.getCheckList();
            }, this))
        },
        getCheckList: function () {
            var filter = {
                "program_id": this.model.opencourse.audit_program_id(),
                "checklist_type_ref_id": this.model.opencourse.channel_ids(),
                "page": this.model.checkFilter.page(),
                "no": this.model.checkFilter.size()
            };

            store.audit.checkList(filter).done($.proxy(function (data) {
                if (data.items && data.items.length > 0) {
                    this.model.checkList.items(data.items);
                    this.model.checkList.total(data.total);
                }
            }, this));
        },
        getReasons: function () {
            var filter = {
                "program_id": this.model.opencourse.audit_program_id(),
                "page": this.model.resaonFilter.page(),
                "no": this.model.resaonFilter.size()
            };

            store.audit.resons(filter).done($.proxy(function (data) {
                if (data.items && data.items.length > 0) {
                    this.model.reasons.items(data.items);
                    this.model.reasons.total(data.total);
                }
            }, this));
        },
        verify: function (isPass) {
            var _this = this;

            if (this.model.opencourse.audit_status() != 1) {
                return;
            }

            var auditId = this.model.opencourse.audit_id();

            store.audit.info(auditId).done($.proxy(function (data) {
                if (data.audit_status == this.model.opencourse.audit_status()) {
                    isPass ? _this.pass() : this.reject();
                }
                else {
                    var statusData = {
                        "program_id": this.model.opencourse.audit_program_id(),
                        "max_submit_time": new Date($.format.toBrowserTimeZone(Date.ajustTimeString(this.model.opencourse.audit_submit_time()), 'yyyy/MM/dd HH:mm:ss')).getTime(),
                        "page": 0,
                        "size": 5
                    }
                    store.audit.status(statusData).done($.proxy(function (res) {
                        ko.mapping.fromJS(res, {}, this.model.statusList);

                        $.confirm({
                            title: "提示",
                            content: '课程于' + $.format.toBrowserTimeZone(Date.ajustTimeString(data.audit_time), 'yyyy/MM/dd HH:mm:ss') + this.model.statusText[data.audit_status]() + "\r\n是否重新审核",
                            buttons: {
                                ok: {
                                    text: "是",
                                    btnClass: 'btn-primary',
                                },
                                cancel: { text: "否，进入下一个课程" }
                            },
                            onAction: function (action) {
                                if (action == "ok") {
                                    isPass ? _this.pass() : _this.reject();
                                }
                                if (action == "cancel") {
                                    for (var i = 0; i < res.items.length; i++) {
                                        var item = res.items[i];

                                        if (item.audit_id != _this.model.opencourse.audit_id()) {
                                            window.location.href = "/" + projectCode + "/admin/open_course/" + item.ref_id + "/audit";
                                            break;
                                        }
                                    }
                                }
                            }
                        });
                    }, this));
                }
            }, this));
        },
        pass: function () {
            $.confirm({
                title: "提示",
                content: "点击通过后，该课程不能再重新审核，<br/> 是否确认审核通过？",
                buttons: {
                    ok: {
                        text: "是",
                        btnClass: "btn-primary",
                        action: $.proxy(function () {
                            store.audit.pass(this.model.opencourse.audit_id()).done($.proxy(function () {
                                $.confirm({
                                    title: '提示!',
                                    content: '审核成功',
                                    buttons: {
                                        ok: {
                                            text: "是",
                                            btnClass: 'btn-primary',
                                            action: $.proxy(function () {
                                                this.model.opencourse.audit_status(2);
                                                this.getCheckList();
                                                this.nextCourse();
                                            }, this)
                                        }
                                    }
                                });
                            }, this)).fail(function (data) {
                                $.alert({
                                    title: '提示!',
                                    content: '审核失败：' + data.responseJSON.message
                                });
                            });
                        }, this)
                    },
                    cancel: {
                        text: "否"
                    }
                }
            });
        },
        showRejectModal: function () {
            if (this.model.opencourse.audit_status() != 1) {
                return;
            }

            $("#reasonList").modal("show");
        },
        reject: function () {
            var reason = {
                "reject_reason": this.model.reject_reason()
            };

            store.audit.reject(this.model.opencourse.audit_id(), reason).done($.proxy(function () {
                $.confirm({
                    title: '提示!',
                    content: '驳回成功',
                    buttons: {
                        ok: {
                            text: "是",
                            btnClass: 'btn-primary',
                            action: $.proxy(function () {
                                this.model.opencourse.audit_status(3);
                                this.getCheckList();
                                this.nextCourse();
                            }, this)
                        }
                    }
                });
            }, this)).always($.proxy(function () {
                $("#reasonList").modal("hide");
                $("input[type=checkbox]").prop("checked", false);
            }, this));
        },
        getCheckedReason: function () {
            if (this.model.reject_reason().length <= 0) {
                $.alert({
                    title: '提示!',
                    content: '请选择驳回原因'
                });
                return;
            }

            this.verify(false);
        },
        getTagChain: function (tags) {
            var chain = "";
            for (var i = 0; i < tags.length; i++) {
                if (i > 0)
                    chain += " > " + tags[i];
                else
                    chain += tags[i];
            }

            return chain;
        },
        onAccordion: function () {
            $("#checklist").toggleClass("hide");
            $("#accordionBtn").toggleClass("hide");
        },
        reasonChange: function (data) {
            this.model.reject_reason(data.content);
            return true;
        },
        noAudit: function () {
            var _this = this;

            $.confirm({
                title: "提示",
                content: "确认暂不审核该课程",
                buttons: {
                    ok: {
                        text: "是",
                        btnClass: 'btn-primary',
                        action: function () {
                            _this.nextCourse();
                        }
                    },
                    cancel: { text: "否" }
                }
            });
        },
        nextCourse: function () {
            var _this = this;

            var statusData = {
                "program_id": this.model.opencourse.audit_program_id(),
                "max_submit_time": new Date($.format.toBrowserTimeZone(Date.ajustTimeString(this.model.opencourse.audit_submit_time()), 'yyyy/MM/dd HH:mm:ss')).getTime(),
                "page": 0,
                "size": 5
            }

            store.audit.status(statusData).done($.proxy(function (res) {
                if (res.items && res.items.length <= 0) {
                    $.alert({
                        title: '提示',
                        content: '没有需要审核的课程了！'
                    });
                }
                else {
                    for (var i = 0; i < res.items.length; i++) {
                        var item = res.items[i];

                        if (item.audit_id != _this.model.opencourse.audit_id()) {
                            window.location.href = "/" + projectCode + "/admin/open_course/" + item.ref_id + "/audit";
                            break;
                        }
                    }
                }
            }, this));
        },
        getPreviewUrl: function() {
            var url = courseMakerApi + "/#!/public/" + this.model.opencourse.unit_id() + "/course-opt?auth=";
            var token = base64_encode(Nova.getMacToken("GET", "/#!/public/course-opt", courseMakerApi.replace("http://", "")));
            return url + token;
        }
    }

    $(function () {
        viewModel.init();
    })
})(jQuery)