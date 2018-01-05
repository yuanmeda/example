(function () {
    var store = {
        list: function (search, success) {
            return $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/questions',
                dataType: 'json',
                data: search,
                type: 'GET',
                cache: false,
                success: success
            });

        },
        deletequiz: function (data, success) {
            $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/questions/' + data.id,
                type: "DELETE",
                data: data.id,
                cache: false,
                success: success
            });
        },
        save: function (data, success) {
            this.sendRequest((window.selfUrl || '') + '/' + projectCode + '/questions', data, success, error)
        },
        sendRequest: function (url, data, success, error, dataType) {
            $.ajax({
                url: url,
                cache: false,
                data: data,
                dataType: (dataType == null || typeof dataType == "undefined" || !dataType) ? "json" : dataType,
                type: 'POST',
                async: false,
                success: success,
                error: error
            });
        }
    };

    var viewModel = {
        model: {
            totalCount: 0,
            currentUserId: currentUserId,
            list: [],
            userInfo: {
                userLogo: '',
                userName: ''
            },
            search: {
                doSearch: false,
                target_id: targetId,
                keyWord: '',
                type: '',
                status: 1,
                content: '',
                page_no: 0,
                page_size: 10
            },
            isInit: true
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this, $("#my_answer")[0]);

            $("#keyword").keydown(function (event) {
                if (event.which == 13) {
                    viewModel.changeKeyword();
                }
            });
            this.list();
        },
        list: function () {
            var self = this;
            var search = ko.mapping.toJS(this.model.search);
            store.list(search, function (data) {
                if (self.model.isInit()) {
                    self.model.isInit(false);
                }
                self.model.totalCount(data.total);
                self.model.list(data.items);
                self.paging(data.total, self.model.search.page_no());
            });
        },
        search: function () {
            this.model.search.page_no(0);
            this.list();
        },
        queryQuestion: function (type) {

        },
        //最新问题
        latestQuestion: function () {

        },
        //最多回答
        withMostAnswers: function () {

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
        changeType: function (data, event) {
            var target = $(event.target), type = target.attr("key");
            if (target.is("a")) {
                var li = target.parent();
                if (!li.hasClass("active")) {
                    this.model.search.type(type);
                    li.addClass("active").siblings().removeClass("active");
                    this.search();
                }
            }
        },
        changeStatus: function (data, event) {
            var target = $(event.target), status = target.attr("key");
            if (target.is("a")) {
                var li = target.parent();
                if (!li.hasClass("active")) {
                    this.model.search.status(status);
                    li.addClass("active").siblings().removeClass("active");
                    this.search();
                }
            }
        },
        changeCourse: function (data, event) {
            var target = $(event.target), course_id = target.attr("key");
            if (target.is("a")) {
                var li = target.parent();
                if (!li.hasClass("active")) {
                    if (course_id && course_id != "0") {
                        this.model.search.target_id(course_id);
                    }
                    li.addClass("active").siblings().removeClass("active");
                    this.search();
                }
            }
        },
        changeKeyword: function () {
            var keyWord = $("#keyWord").val();
            keyWord = $.trim(keyWord);
            if (keyWord == "") {
                this.model.search.doSearch(false);
            } else {
                this.model.search.doSearch(true);
            }
            this.model.search.keyWord(keyWord);

            this.search();
        },
        showMore: function () {
            var list = $(".all-course");
            if (list.length == 0)
                return;
            $(list[0]).addClass("ns-item-unfold");
        },
        enableOver: function (data, event) {
            var target = $(event.currentTarget);
            target.addClass("ud-item-hover");
        },
        disableOver: function (data, event) {
            var target = $(event.currentTarget);
            target.removeClass("ud-item-hover");
        },
        //文本框鼠标聚焦事件
        inputOnfocusEvent: function (obj1, obj2) {
            if (!$('#search').hasClass('search-form-focus')) {
                $('#search').addClass('search-form-focus');
            }
        },
        //文本框失去焦点事件
        inputOnblurEvent: function (obj1, obj2) {
            if ($('#search').hasClass('search-form-focus')) {
                $('#search').removeClass('search-form-focus');
            }
        },
        openDetail: function (quizId) {
            alert(quizId);
        },
        format: function () {
            if (arguments.length == 0) {
                return null
            }
            var str = arguments[0];
            for (var i = 1; i < arguments.length; i++) {
                var re = new RegExp("\\{" + (i - 1) + "\\}", "gm");
                str = str.replace(re, arguments[i])
            }
            return str
        },
        deletequiz: function ($data, evt) {
            var id = $data.id, that = ko.contextFor(evt.target).$root;
            Utils.confirmTip(i18nHelper.getKeyValue("myQAs.frontPage.staticText3"))
                .done(function () {
                    store.deletequiz({id: id}, function (data) {
                        var page_no = that.model.search.page_no();
                        if (that.model.list().length == 1 && page_no > 0) {
                            that.model.search.page_no(page_no - 1);
                        }
                        that.list();
                    });
                });
        }
    }

    $(function () {
        viewModel.init();
    });
})(jQuery)