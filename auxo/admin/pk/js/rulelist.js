(function ($) {
    var store = {
        errorCallback: function (jqXHR) {
            if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
            } else {
                var txt = JSON.parse(jqXHR.responseText);
                if (txt.cause) {
                    $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
                } else {
                    $.fn.dialog2.helpers.alert(txt.message);
                }
                $('body').loading('hide');
            }
        },
        search: function (filter) {
            var url = service_domain + "/v1/pk_rules/search";
            return $.ajax({
                url: url,
                cache: false,
                data:JSON.stringify(filter),
                type: 'post',
                error: this.errorCallback
            });
        },
        deleteRule: function(id){
            var url = service_domain + "/v1/pk_rules/" + id;
            return $.ajax({
                url: url,
                type: 'delete',
                error: this.errorCallback
            });
        }
    };

    var viewModel = {
        model: {
            filter: {
                name: '',
                order: '',
                limit: 10,
                offset: 0, //跳过的个数
                result: 'pager'
            },
            list: [],
            selectedRuleId: selected_rule_id || ""
        },
        init: function () {
            var _self = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, document.getElementById('pk_rulelist'));
            this.getList();
        },
        getList: function () {
            var filter = ko.mapping.toJS(this.model.filter);
            filter.filter = "name like '%" + filter.name + "%'";
            filter.offset = filter.offset * filter.limit;
            delete filter.name;
            store.search(filter)
                .done($.proxy(function (data) {
                    if (data.items && data.items.length) {
                        this.model.list(data.items);
                    } else {
                        this.model.list([]);
                    }
                    this._page(data.total, filter.offset/filter.limit, filter.limit);
                }, this));
        },
        _page: function (totalCount, currentPage, pageSize) {
            var self = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: pageSize,
                current_page: currentPage,
                num_display_entries: 5,
                is_show_total: true,
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function (page_id) {
                    if (page_id != currentPage) {
                        self.model.filter.offset(page_id);
                        self.getList();
                    }
                }
            });
        },
        saveSelectedRuleId: function (flag) {
            //postMessage抛出examVo.id
            var z = window.parent;
            var n = new Nova.Notification(z, "*");
            var message_key = "elearning.pk.gateway.rulelist";
            var message_data = {
                event_type: "elearning_pk_gateway_rulelist",
                data: {
                    rule_id: this.model.selectedRuleId(),
                    flag: flag
                }
            };
            n.dispatchEvent("message:" + message_key, message_data);
        },
        editRuleHandle: function (ruleId) {
            var returnUrl = "/" + projectCode + "/admin/pk/ruleedit?return_url=" + encodeURIComponent('/' + projectCode + "/admin/pk/rulelist?rule_id=" + this.model.selectedRuleId());
            if (ruleId) {
                returnUrl = returnUrl + "&rule_id=" + ruleId;
            }
            location.href = returnUrl;
        },
        doSearch: function () {
            var self = this;
            self.model.filter.offset(0);
            self.getList();
        },
        doDeleteRule: function (ruleId) {
            var self = this;
            if(ruleId){
                store.deleteRule(ruleId).done(function(data){
                    self.model.filter.offset(0);
                    self.getList();
                })
            }
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery));