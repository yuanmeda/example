(function () {
    var store = {
        list: function (search, success) {
            $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/auxo/interaction_answer/answers',
                dataType: 'json',
                data: search,
                cache: false,
                success: success
            });
        },

        saveReply: function (data, success, error) {
            $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/auxo/interaction_answer/answers',
                data: JSON.stringify(data),
                type: "post",
                cache: false,
                success: success,
                error: error
            });
        },

        editReply: function (data, success, error) {
            $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/auxo/interaction_answer/answers/' + data.id,
                data: JSON.stringify(data),
                type: "PUT",
                cache: false,
                success: success,
                error: error
            });
        },

        saveQuiz: function (data, success) {
            $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/questions/' + quizId,
                data: JSON.stringify(data),
                type: "put",
                cache: false,
                success: success
            });
        },

        deleteReply: function (data, success) {
            $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/auxo/interaction_answer/answers/' + data.id,
                type: "DELETE",
                data: data.id,
                cache: false,
                success: success
            });
        }
    };

    var viewModel = {
        model: {
            canReply: isCurrentUserAnswer,
            EditMode: false,
            totalCount: 0,
            content: "",
            currentUserId: currentUserId,
            search: {
                question_id: quizId,
                page_no: 0,
                page_size: 10
            },
            reply: {
                question_id: quizId,
                id: 0,
                content: ""
            },

            editreply: {
                question_id: quizId,
                id: 0,
                content: ""
            },
            list: []
        },

        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, $("#answer_detail")[0]);
            this.list();
            this.model.content = $("#quizEditor").val();
            $("#ReplyBtn").click($.proxy(this.saveReply, this));
        },

        list: function () {
            var self = this;
            var search = ko.mapping.toJS(this.model.search);
            store.list(search, function (data) {
                self.model.totalCount(data.total ? data.total : 0);
                self.model.list(data.items);
                self.paging(data.total, self.model.search.page_no());
            });
        },

        paging: function (totalCount, currentPage) {
            var self = this;
            $("#pagination").pagination(totalCount, {
                items_per_page: self.model.search.page_size(),
                num_display_entries: 5,
                current_page: self.model.search.page_no(),
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function (pageNum) {
                    if (pageNum != self.model.search.page_no()) {
                        self.model.search.page_no(pageNum);
                        self.list();
                    }
                }
            });
        },

        showEdit: function () {
            this.model.EditMode(true);
            $("#quizEditor").val(this.model.content);
        },

        hideEdit: function () {
            this.model.EditMode(false);
        },

        saveQuiz: function () {
            var self = this;
            var content = $.trim($("#quizEditor").val());
            if (content == "") {
                Utils.alertTip(i18nHelper.getKeyValue("myQAs.frontPage.staticText1"));
                return;
            }
            if (content.length > 100) {
                Utils.alertTip(i18nHelper.getKeyValue("myQAs.frontPage.staticText2"));
                return;
            }

            store.saveQuiz({question_id: quizId, content: content}, function (data) {
                if (data) {
                    $("#quizUpdateTime").html(data.updateTime);
                    $("#quizShower").text(content);
                    self.model.content = content;
                }
                self.model.EditMode(false);
            });
        },

        cancelEditReply: function () {
            viewModel.model.editreply.id(0);
            viewModel.model.editreply.content("");
            $(".ud-list>div.ud-item-edit").removeClass("ud-item-edit");
        },

        editReply: function (rid) {
            var length = $(".ud-list>div[class*='ud-item-edit']").length;
            if (length != 0) {
                return;
            }
            var self = this;
            $.each(this.model.list(), function (index, value) {
                if (value.id == rid) {
                    self.model.editreply.id(rid);
                    self.model.editreply.content(value.content);
                    $(".ud-list>div[quizId=" + rid + "]").addClass("ud-item-edit").siblings().removeClass("ud-item-edit");
                    return;
                }
            });
        },

        delReply: function (rid) {
            var length = $(".ud-list>div[class*='ud-item-edit']").length;
            if (length != 0) {
                return;
            }
            var self = this;
            Utils.confirmTip(i18nHelper.getKeyValue("myQAs.frontPage.staticText3"))
                .done(function () {
                    store.deleteReply({id: rid}, function (data) {
                        self.list();
                        self.model.canReply(false);
                        isCurrentUserAnswer = false;
                    });
                });
        },

        saveEditReply: function () {
            var data = ko.mapping.toJS(viewModel.model.editreply);
            if (data.content == "") {
                Utils.alertTip(i18nHelper.getKeyValue("myQAs.frontPage.staticText4"));
                return;
            }
            store.editReply(data, function (result) {
                if (result) {
                    viewModel.model.search.page_no(0);
                    viewModel.list();
                }
                $(".ud-list>div.ud-item-edit").removeClass("ud-item-edit");
                viewModel.model.editreply.id(0);
                viewModel.model.editreply.content("");
            });
        },

        saveReply: function () {
            var self = this;
            var data = ko.mapping.toJS(this.model.reply);
            if (data.content == "") {
                Utils.alertTip(i18nHelper.getKeyValue("myQAs.frontPage.staticText4"), {"icon": "error"});
                return;
            }
            $("#ReplyBtn").unbind("click", self.saveReply);
            var saveData = {
                "content": data.content,
                "question_id": data.question_id
            };
            store.saveReply(saveData, function (result) {
                if (result) {
                    self.model.search.page_no(0);
                    self.list();
                }
                self.model.reply.id(0);
                self.model.reply.content("");
                self.model.canReply(true);
                isCurrentUserAnswer = true;
                $("#ReplyBtn").click($.proxy(self.saveReply, self));
            }, function (e) {
                $("#ReplyBtn").click($.proxy(self.saveReply, self));
                Utils.alertTip(JSON.parse(e.responseText).error, {"icon": "error"});
            });

        },
        showHover: function (data, event) {
            var target = $(event.currentTarget);
            target.addClass("ud-item-hover");
        },
        hideHover: function (data, event) {
            var target = $(event.currentTarget);
            target.removeClass("ud-item-hover");
        }
    }

    $(function () {
        viewModel.init();
    });
})(jQuery)