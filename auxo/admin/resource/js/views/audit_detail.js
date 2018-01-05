(function ($, window) {
    var store = {
        getPermission: function (data) {
            return $.ajax({
                url: learningUnitUrl + '/v1/audits/permission',
                data: data,
                dataType: "json",
                cache: false
            })
        },
        getUnit: function () {
            return $.ajax({
                url: learningUnitUrl + '/v1/learning_units/' + unitId,
                dataType: "json",
                cache: false
            })
        },
        createAudit: function (data) {
            return $.ajax({
                url: learningUnitUrl + '/v1/audits',
                type: 'post',
                dataType: "json",
                data: JSON.stringify(data)
            })
        },
        updateAudit: function (auditId, data) {
            return $.ajax({
                url: learningUnitUrl + '/v1/audits/' + auditId,
                type: 'put',
                dataType: "json",
                data: JSON.stringify(data)
            })
        },
        getAudits: function (data) {
            return $.ajax({
                url: learningUnitUrl + '/v1/audits/search',
                data: data,
                dataType: "json",
                cache: false
            })
        }
    };
    var viewModel = {
        model: {
            audit: {
                unit_id: unitId,
                description: '',
                status: 2,
            },
            can_edit: false,
            audit_status: 1,
            filter: {
                unit_id: unitId,
                page: 0,
                size: 200
            },
            audits: {
                items: [],
                total: 0
            },
            state: {
                init: false
            },
        },
        init: function () {
            var self = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('content'));
            this.getPermission();
            this.getUnit();
            this.getAudits();
            this._validate();
        },
        getPermission: function () {
            var self = this;
            store.getPermission({'unit_id': unitId}).done(function (data) {
                self.model.can_edit(data.can_edit);
            })
        },
        getUnit: function () {
            var self = this;
            store.getUnit().done(function (data) {
                self.model.audit_status(data.audit_status);
                self.model.state.init(true);
            })
        },
        getAudits: function () {
            var self = this, filter = ko.mapping.toJS(this.model.filter);
            store.getAudits(filter).done(function (data) {
                var validates = [];
                self.model.audits.items($.map(data.items, function (v) {
                    v.isEdit = ko.observable(false);
                    v.originDescription = v.description;
                    v.description = ko.observable(v.description).extend({
                        required: {
                            params: true,
                            message: '请填写审核说明.',
                            onlyIf: function () {
                                return v.isEdit();
                            }
                        },
                        maxLength: {
                            params: 200,
                            message: '字数不能超过200.',
                            onlyIf: function () {
                                return v.isEdit();
                            }
                        }
                    });
                    validates.push(v.description);
                    return v;
                }));
                self.auditsValidates = ko.validatedObservable(validates);
                self.model.audits.total(data.total);
            })
        },
        createAudit: function () {
            var errors = ko.validation.group(this.model.audit)
            if (errors().length) {
                errors.showAllMessages();
                return false;
            }
            var self = this, audit = ko.mapping.toJS(this.model.audit);
            store.createAudit(audit).done(function (data) {
                self.getUnit();
                self.getAudits();
            });
        },
        toggleAudit: function (flag, $data) {
            if (flag) {
                $.each(this.model.audits.items(), function (i, v) {
                    v.isEdit(false);
                })
            }
            $data.isEdit(flag);
            $data.description($data.originDescription);
        },
        updateAudit: function ($data) {
            if (!this.auditsValidates.isValid()) {
                this.auditsValidates.errors.showAllMessages();
                return false;
            }
            var description = ko.toJS($data.description);
            store.updateAudit($data.id, {description: description}).done(function (data) {
                $data.originDescription = data.description;
                $data.description(data.description);
                $data.isEdit(false);
            });
        },
        formatTime: function (time) {
            return $.format.date(time, 'yyyy-MM-dd HH:mm:ss')
        },
        _validate: function () {
            var self = this;
            var rules = {
                required: {
                    params: true,
                    message: '请填写审核说明.'
                },
                maxLength: {
                    params: 200,
                    message: '字数不能超过200.'
                }
            };
            this.model.audit.description.extend(rules);
        }
    };
    $(function () {
        viewModel.init();
    });
})(jQuery, window);