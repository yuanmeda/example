(function () {
    var store = {
        getQuestions: function (data, success) {
            $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/questions',
                type: "GET",
                data: data,
                cache: false,
                success: success
            });
        },
        saveQuestion: function (data, success) {
            $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/questions',
                type: "POST",
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: "json",
                cache: false,
                success: success
            });
        }
    };
    var viewModel = {
        model: {
            quizList: [],
            quizTotalCount: 0,
            commonQuizList: [],
            isQuizSearch: false,
            oldKeyWord: "",
            quizLoaded: false,
            isLoading: false,
            quizType: 2,
            quizContent: ''
        },

        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, $("#course_question")[0]);

            $("#saveQuizBtn").click($.proxy(this.savequizcontent, this));

            $("div.quiz-box .tabs>ul").children('li').click(function () {
                $(this).addClass('active');
                $(this).siblings().removeClass('active');
                viewModel.model.quizType($(this).attr('quizType'));
                viewModel._getuserquizs($(this).attr('quizType'));
            });
            $(".side-text textarea").focus(function () {
                $(this).next().hide();
            }).blur(function () {
                if (!$.trim($(this).val()).length) {
                    $(this).next().show();
                }
            });
            window.setInterval(this.settitle, 100);

            $("#keyword").keydown(function (event) {
                if (event.which == 13) {
                    viewModel.changeKeyword();
                }
            });
            //查询我的问题
            viewModel._getuserquizs(2);
        },

        //答疑相关--开始
        _getuserquizs: function (quiztype) {
            var self = this;
            this.model.isLoading(true);
            this.model.quizType(quiztype);
            if (quiztype == 2) {
                store.getQuestions({
                    target_id: courseId,
                    type: quiztype,
                    page_no: 0,
                    page_size: 8
                }, function (data) {
                    self.model.quizTotalCount(data.total);
                    ko.mapping.fromJS(data.items, {}, self.model.quizList);
                    $(".ls-con>div.quiz-box>div.qb-my").show().siblings("[class != 'tabs']").hide();
                    self.model.isLoading(false);
                    self.model.quizLoaded(true);
                });
            } else if (quiztype == 4 || quiztype == 1) {
                store.getQuestions({
                    target_id: courseId,
                    type: quiztype,
                    page_no: 0,
                    page_size: 10
                }, function (data) {
                    self.model.quizTotalCount(data.total);
                    ko.mapping.fromJS(data.items, {}, self.model.commonQuizList);
                    $(".ls-con>div.quiz-box>div.qb-base").show().siblings("[class != 'tabs']").hide();
                    self.model.isLoading(false);
                    self.model.quizLoaded(true);
                });
            }
        },
        savequizcontent: function () {
            var self = this;
            var content = $.trim($("#quizContent").val());
            if (content.length == 0 || content.length > 100) {
                return;
            }

            $("#SaveQuizBtn").unbind("click", self.savequizcontent);
            var param = {
                "target_id": targetId,
                "custom_id": customId,
                "custom_type": customType,
                "content": content
            };
            store.saveQuestion(param, function (data) {
                $("#quizContent").val("");
                $("#quizwordcount").html(0);
                $("div.quiz-box .tabs>ul li.active").trigger("click");
                $("#SaveQuizBtn").click($.proxy(self.savequizcontent, self));
            });
        },

//        quizContent: function () {
//            var lh = $("#quizContent").val().length;
//            $("#quizwordcount").html(lh);
//            if (lh > 100) {
//                $("#quizwordcount").addClass("overnum");
//            } else {
//                $("#quizwordcount").removeClass("overnum");
//            }
//        },

        changeKeyword: function () {
            var self = this;
            self.model.isLoading(true);
            var keyword = $("#keyword").val();
            keyword = $.trim(keyword);
            self.model.isQuizSearch(true);
            self.model.oldKeyWord(keyword);
            store.getQuestions({
                target_id: courseId,
                type: 1,
                page_no: 0,
                page_size: 8,
                content: keyword
            }, function (data) {
                self.model.quizTotalCount(data.total);
                ko.mapping.fromJS(data.items, {}, self.model.commonQuizList);
                $(".ls-con>div.quiz-box").addClass("quiz-search-mode");
                $(".ls-con>div.quiz-box>div.qb-base").show().siblings("[class != 'tabs']").hide();
                self.model.isLoading(false);
                self.model.quizLoaded(true);
            });
        },
        goback: function () {
            $("#keyword").val("");
            viewModel.model.isQuizSearch(false);
            $(".ls-con>div.quiz-box").removeClass("quiz-search-mode");
            viewModel._getuserquizs(viewModel.model.quizType());
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery)
