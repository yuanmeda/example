define(["require", "exports"], function (require, exports, player) {
    var store = {
        getResourceProcessDivCssClass: function (trainCourseId, resourceId, resourceType, success) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/home/getresourceprocessdivcssclass",
                data: {trainCourseId: trainCourseId, resourceType: resourceType, resourceId: resourceId},
                dataType: 'json',
                cache: false,
                success: success
            });
        },
        getchapter: function (success) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/home/getchapter",
                dataType: 'json',
                cache: false,
                success: success
            });
        },

        getusertrainnotelist: function (data, success) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/home/GetUserTrainNoteList",
                type: "Post",
                data: data,
                cache: false,
                success: success
            });
        },

        saveusernote: function (data, success) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/home/saveUserNote",
                type: "Post",
                data: data,
                cache: false,
                success: success
            });
        },

        deleteusernote: function (data, success) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/home/DeleteUserNote",
                type: "Post",
                data: data,
                cache: false,
                success: success
            });
        },

        getuserquizs: function (data, success) {
            $.ajax({
                url: '/' + projectName + "/" + targetId + '/' + courseId + '/learn/home/GetUserTrainQuizList',
                type: "Post",
                data: data,
                cache: false,
                success: success
            });
        },

        savequiz: function (data, success) {
            $.ajax({
                url: '/' + projectName + "/" + targetId + '/' + courseId + '/learn/home/CreateQuiz',
                data: data,
                type: "post",
                cache: false,
                success: success
            });
        },

        getpercent: function (data, success) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/home/GetUserCoursePercent",
                type: "Get",
                data: data,
                cache: false,
                success: success
            });
        },

        recordusercourse: function (data) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/home/RecordUserCourse",
                data: data,
                type: "post",
                cache: false
            });
        },
        getvideo: function (data, success) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/home/GetVideo",
                type: "Get",
                data: data,
                cache: false,
                success: success
            });
        }
    };

    var viewModel = {
        model: {
            ChapterList: [],
            QuizList: [],
            QuizTotalCount: 0,
            CommonQuizList: [],
            NoteList: [],
            NoteTotalCount: 0,
            Resource: {
                // CatalogId: catalogId,
                // DocumentId: documentId,
                // DocumentType: documentType,
                // DocumentUrl: documentUrl,
                // VideoId: videoId,
                // UnitResouceId: unitResouceId,
                // ExerciseType: exerciseType,
                // Title: "",
                // PrevTitle: "",
                // NextTitle: i18nHelper.getKeyValue("learnPlay.frontPage.staticText1"),
                // ChapterNo: "",
                // ResourceNo: "",
                // Mode: ""
            },
            isQuizSearch: false,
            oldKeyWord: "",
            Percent: "0%",//课程完成比
            PercentInfo: i18nHelper.getKeyValue("learnPlay.frontPage.staticText2") + "0%",
            CurrentNote: {
                Id: 0,
                Content: ""
            },
            t1: null,
            t2: null,
            isLoading: true,
            noteLoaded: false,
            quizLoaded: false,
            quizType: 2,
            canPlay: true,//快速切换时禁止上次动画的资源播放(即动画非正常走完)：不然IE8下有问题
            clickDirection: 0 // 0: wu, 1: prev, 2: next
        },

        init: function (video, document, chapter) {
            this.video = video;
            this.chapter = chapter;
            this.document = document;
            return;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);

            $("#SaveNoteBtn").click($.proxy(this.savenotecontent, this));
            $("#SaveQuizBtn").click($.proxy(this.savequizcontent, this));
            //不是人工刷新页面时的播放器初始化
            var hash = window.location.hash;
            if (hash.indexOf("#/video") < 0 && hash.indexOf("#/document") < 0 && hash.indexOf("#/chapter") < 0) {
                //初次进入界面时的模式
                if (unitResouceId != 0) {
                    viewModel.model.Resource.Mode("Question");
                    $("#chapter").show().siblings("div").hide();
                    viewModel.chapter.viewModel.reload(viewModel.model.Resource.UnitResouceId(), viewModel.model.Resource.ExerciseType());
                } else if (documentId != 0) {
                    viewModel.model.Resource.Mode("Document");
                    if (viewModel.model.Resource.DocumentType() == 2)
                        $("#documentViewerThree").show().siblings("div").hide();
                    else
                        $("#documentViewer").show().siblings("div").hide();
                    viewModel.document.viewModel.doc(viewModel.model.Resource.DocumentId(), viewModel.model.Resource.DocumentType(), viewModel.model.Resource.DocumentUrl());
                } else if (videoId != 0) {
                    viewModel.model.Resource.Mode("Video");
                    store.getvideo({videoId: videoId}, function (data) {
                        //viewModel.model.Resource.IsLinkDocument(data.IsLinkDocument);
                        $("#player").show().siblings("div").hide();
                        viewModel.video.viewModel.model.LastPlayPosition = data.LastPlayPosition;
                        viewModel.video.viewModel.model.MaxPlayPosition = data.MaxPlayPosition;
                        viewModel.video.viewModel.model.VideoDuration = data.VideoDuration;
                        viewModel.video.viewModel.model.IsEnd = data.IsEnd;
                        viewModel.video.viewModel.play(viewModel.model.Resource.VideoId());
                    });
                }
                this.getchapterlist();
            }

            $("div.quiz-box .tabs>ul").children('li').click(function () {
                $(this).addClass('active');
                $(this).siblings().removeClass('active');
                viewModel._getuserquizs($(this).attr('QuizType'));
            });
            $(".side-text textarea").focus(function () {
                $(this).next().hide();
            }).blur(function () {
                if (!$.trim($(this).val()).length) {
                    $(this).next().show();
                }
            });
            window.setInterval(this.settitle, 100);

            if ($(window).width() >= 1440)
                this.catalogpanel();
            $("#keyword").keydown(function (event) {
                if (event.which == 13) {
                    viewModel.changeKeyword();
                }
            });
        },
        settitle: function () {
            var cur = $(".catalog-list.catalog-mlist>div[class^='resource'].cur");
            if (cur != undefined && cur.length > 0) {
                document.title = cur.children("span.td").children("span:first").first().text();
            }
            else {
                document.title = i18nHelper.getKeyValue("learnPlay.frontPage.staticText3");
            }
        },

        //答疑相关--开始
        _getuserquizs: function (quiztype) {
            var self = this;
            this.model.isLoading(true);
            this.model.quizType(quiztype);
            if (quiztype == 2) {
                store.getuserquizs({
                    targetId: targetId,
                    quizType: quiztype,
                    pageIndex: 0,
                    pageSize: 8
                }, function (data) {
                    self.model.QuizTotalCount(data.TotalCount);
                    ko.mapping.fromJS(data.Items, {}, self.model.QuizList);
                    $(".ls-con>div.quiz-box>div.qb-my").show().siblings("[class != 'tabs']").hide();
                    self.model.isLoading(false);
                    self.model.quizLoaded(true);
                });
            }
            else if (quiztype == 4 || quiztype == 1) {
                store.getuserquizs({
                    targetId: targetId,
                    quizType: quiztype,
                    pageIndex: 0,
                    pageSize: 10
                }, function (data) {
                    self.model.QuizTotalCount(data.TotalCount);
                    ko.mapping.fromJS(data.Items, {}, self.model.CommonQuizList);
                    $(".ls-con>div.quiz-box>div.qb-base").show().siblings("[class != 'tabs']").hide();
                    self.model.isLoading(false);
                    self.model.quizLoaded(true);
                });
            }
        },

        savequizcontent: function () {
            var self = this;
            var content = $.trim($("#QuizContent").val());
            if (content.length == 0 || content.length > 100) {
                return;
            }

            $("#SaveQuizBtn").unbind("click", self.savequizcontent);
            var param = {"targetId": targetId, "CatalogId": self.model.Resource.CatalogId(), "Content": content};
            store.savequiz(param, function (data) {
                $("#QuizContent").val("");
                $("#quizwordcount").html(0);
                $("div.quiz-box .tabs>ul li.active").trigger("click");
                $("#SaveQuizBtn").click($.proxy(self.savequizcontent, self));
            });
        },

        quizcontent: function () {
            var lh = $("#QuizContent").val().length;
            $("#quizwordcount").html(lh);
            if (lh > 100) {
                $("#quizwordcount").addClass("overnum");
            }
            else {
                $("#quizwordcount").removeClass("overnum");
            }
        },

        changeKeyword: function () {
            var self = this;
            self.model.isLoading(true);
            var keyword = $("#keyword").val();
            keyword = $.trim(keyword);
            self.model.isQuizSearch(true);
            self.model.oldKeyWord(keyword);
            store.getuserquizs({
                targetId: targetId,
                quizType: 1,
                pageIndex: 0,
                pageSize: 10,
                keyword: keyword
            }, function (data) {
                self.model.QuizTotalCount(data.TotalCount);
                ko.mapping.fromJS(data.Items, {}, self.model.CommonQuizList);
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
        },

        //答疑相关--结束


        //笔记相关--开始
        _getusernotes: function () {
            var that = this;
            this.model.isLoading(true);
            store.getusertrainnotelist({
                targetId: targetId,
                userUnitId: userUnitId,
                pageIndex: 0,
                pageSize: 5
            }, function (data) {
                that.model.noteLoaded(true);
                that.model.NoteTotalCount(data.TotalCount);
                $.each(data.Items, function (i, v) {
                    v.Content = v.Content.replace(/[\r\n]/g, '<br/>');
                    var ell = that.ell(v.Content, 90);
                    v.Show = ko.observable(ell[0]);
                    v.Label = ko.observable(!ell[0]);
                    v.Thumb = ell[1];
                });
                that.model.NoteList(data.Items);
                that.model.isLoading(false);
            });
        },

        triggerNote: function ($data) {
            $data.Show(!$data.Show());
        },

        savenote: function ($data, evt) {
            var that = ko.contextFor(evt.target).$root, content = that.model.CurrentNote.Content.peek();
            if ($.trim(content) == "" || content.length > 2000) {
                return;
            }
            content = content.replace(/[<]/g, "&lt;").replace(/[>]/g, "&gt;");
            store.saveusernote({
                catalogId: that.model.Resource.CatalogId(),
                noteId: that.model.CurrentNote.Id(),
                content: content
            }, function () {
                $("#NoteContent").val("");
                $("#notewordcount").html(0);
                $data.Content = content.replace(/[\r\n]/g, "<br/>");
                var ell = that.ell($data.Content, 90);
                $data.Show(ell[0]);
                $data.Label(!ell[0]);
                $data.Thumb = ell[1];
                $(evt.target).parents(".edit").removeClass('edit');
                $data.Show.valueHasMutated();
            });
        },

        deletenote: function ($data, evt) {
            var that = ko.contextFor(evt.target).$root, id = $data.Id;
            //if (that.model.CurrentNote.Id() === id)
            //    return;
            $.fn.udialog.confirm(i18nHelper.getKeyValue("learnPlay.frontPage.staticText4"),
                [{
                    text: i18nHelper.getKeyValue("common.frontPage.cancel"), click: function () {
                        $(this).udialog("destroy");
                        $(this).remove();
                    }
                },
                    {
                        text: i18nHelper.getKeyValue("common.frontPage.confirm"), click: function () {
                        $(this).udialog("hide");
                        store.deleteusernote({noteId: id}, function () {
                            that._getusernotes();
                            that.model.NoteTotalCount(that.model.NoteTotalCount.peek() - 1);
                        });
                    },
                        'class': 'default-btn'
                    }]);
        },
        ell: function (con, num) {
            var c = 0, str = con, b = 0, br;
            br = str.split('<br/>');
            str = br[0];
            for (var j = 0, len = str.length; j < len; j++) {
                str.charCodeAt(j) > 255 ? c += 1 : c += .5;
                if (c > num) {
                    b = j;
                    break;
                }
            }
            var r = !(b || br.length > 1);
            var rs = (b ? str.substring(0, b) : str) + '...';
            return [r, rs];
        },

        updatenote: function ($data, evt) {
            var id = $data.Id, length = $(".um-nlist>ul li[class='edit']").length, that = ko.contextFor(evt.target).$root;
            if (length != 0)
                return;
            that.model.CurrentNote.Id(id);
            that.model.CurrentNote.Content($data.Content.replace(/<br\/?>/g, "\r\n").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
            $(evt.currentTarget).parents('li').addClass("edit");
        },

        cancelnote: function () {
            viewModel.model.CurrentNote.Id(0);
            viewModel.model.CurrentNote.Content("");
            $(".um-nlist>ul li.edit>div.ume-area>div.side-text-num>span").removeClass("overnum");
            $(".um-nlist>ul li.edit").removeClass("edit");
        },

        savenotecontent: function () {
            var content = $("#NoteContent").val().replace(/[<]/g, "&lt;").replace(/[>]/g, "&gt;"), that = this;
            if ($.trim(content) == "" || content.length > 2000) {
                return;
            }

            $("#SaveNoteBtn").unbind("click", that.savenotecontent);
            store.saveusernote({
                targetId: targetId,
                catalogId: this.model.Resource.CatalogId(),
                noteId: 0,
                content: content
            }, function (data) {
                $("#NoteContent").val("");
                data.Content = data.Content.replace(/[\r\n]/g, "<br/>");
                ;
                var br = data.Content.split('<br/>'), str = br[0], tot = 0, b;
                for (var j = 0, len = str.length; j < len; j++) {
                    str.charCodeAt(j) > 255 ? tot += 1 : tot += .5;
                    if (tot > 90) {
                        b = j;
                        break;
                    }
                }
                var ell = that.ell(data.Content, 90);
                data.Show = ko.observable(ell[0]);
                data.Label = ko.observable(!ell[0]);
                data.Thumb = ell[1];
                that.model.NoteList.unshift(data);
                that.model.NoteTotalCount(that.model.NoteTotalCount.peek() + 1);
                if (that.model.NoteList().length > 5) {
                    that.model.NoteList.pop();
                }
                $("#notewordcount").html(0);
                $("#SaveNoteBtn").click($.proxy(that.savenotecontent, that));
            });
        },

        notecontent: function () {
            var lh = $("#NoteContent").val().length;
            $("#notewordcount").html(lh);
            if (lh > 2000) {
                $("#notewordcount").addClass("overnum");
            }
            else {
                $("#notewordcount").removeClass("overnum");
            }
        },

        updatenotecontent: function () {
            var edit = $(".um-nlist>ul li.edit").first();
            if (edit == undefined && edit.length == 0)
                return;
            var lh = edit.children("div.ume-area").children("div.ume-txt").children("textarea:first").val().length;
            edit.children("div.ume-area").children("div.side-text-num").children("span:first").html(lh);
            if (lh > 2000) {
                edit.children("div.ume-area").children("div.side-text-num").children("span:first").addClass("overnum");
            }
            else {
                edit.children("div.ume-area").children("div.side-text-num").children("span:first").removeClass("overnum");
            }
        },

        //笔记相关--结束


        //右侧面板切换--开始
        catalogpanel: function () {
            if ($("#catalog").hasClass("active")) {
                $("#catalog").removeClass("active");
            }
            else {
                $("#catalog").addClass("active").siblings().removeClass("active");
                $(".ls-con>div.catalog-box").show().siblings().hide();
            }
            viewModel.panelanimate();
        },

        quizpanel: function () {
            if ($("#quiz").hasClass("active")) {
                $("#quiz").removeClass("active");
            }
            else {
                $("#quiz").addClass("active").siblings().removeClass("active");
                $(".ls-con>div.quiz-box").show().siblings().hide();
                if (viewModel.model.quizLoaded() == false) {
                    $(".quiz-box .tabs>ul").children('li.active').trigger("click");
                }
            }
            viewModel.panelanimate();
        },

        notepanel: function () {
            if ($("#note").hasClass("active")) {
                $("#note").removeClass("active");
            }
            else {
                $("#note").addClass("active").siblings().removeClass("active");
                $(".ls-con>div.note-box").show().siblings().hide();
                if (viewModel.model.noteLoaded() == false) {
                    viewModel._getusernotes();
                }
            }
            viewModel.panelanimate();
        },

        panelanimate: function () {
            var a = $(".tabs-con>div.tab-item.active").length;
            var b = $("div.learning-side").css("width");
            if ($(".tabs-con>div.tab-item.active").length == 0 && $("div.learning-side").css("width") > "350px") {
                $(".learning-side").animate({width: '0'}, 500).css("overflow", "visible");
                $(".learning-con").animate({right: '1'}, 500, function () {
                    window.setTimeout(function () {
                        $(".learning-con").css("right", "0px");
                    }, 200);
                    if (viewModel.model.Resource.Mode() == "Document") {
                        viewModel.document.viewModel.resize();
                    }
                    else if (viewModel.model.Resource.Mode() == "Video") {
                        viewModel.video.viewModel.resize();
                    }
                });
            } else if ($(".tabs-con>div.tab-item.active").length >= 0 && $("div.learning-side").css("width") == "0px") {
                $(".learning-side").animate({width: '365'}, 500).css("overflow", "visible");
                ;
                $(".learning-con").animate({right: '359'}, 500, function () {
                    window.setTimeout(function () {
                        $(".learning-con").css("right", "360px");
                    }, 200);
                    if (viewModel.model.Resource.Mode() == "Document") {
                        viewModel.document.viewModel.resize();
                    }
                    else if (viewModel.model.Resource.Mode() == "Video") {
                        viewModel.video.viewModel.resize();
                    }
                });
            }
        },
        //右侧面板切换--结束
        stopBubble: function () {
            return false;
        },
        //章节处理--开始
        getchapterlist: function () {
            var self = this;
            store.getchapter(function (data) {
                ko.mapping.fromJS(data, {}, self.model.ChapterList);

                $(".catalog-list.catalog-mlist>div[class^='resource']").mouseover(
                    function () {
                        $(this).addClass("hover");
                    }
                ).mouseout(
                    function () {
                        $(this).removeClass("hover");
                    }
                );

                $(".catalog-list.catalog-mlist>div[class^='resource']").click(function () {
                    if ($(this).hasClass("cur"))
                        return;
                    var location = $("div.learning-box").height();
                    var length = $(this).nextAll("div.cur").length;
                    if (length == 0) {
                        location = -location;
                    }

                    //先复原动画
                    viewModel.model.canPlay(false);
                    $(".learning-box").stop(true, true);
                    if (viewModel.model.t1() != null) {
                        clearTimeout(viewModel.model.t1());
                        viewModel.model.t1(null);
                        viewModel.model.canPlay(false);//learning-box第一个动画时stop会使canPlay=true。
                        //SetTimeout未执行前就清空时，则必须执行完相关代码保证逻辑正确
                        var mode = viewModel.model.Resource.Mode();
                        if (mode == "Document") {
                            app.setLocation("#/document/" + viewModel.model.Resource.CatalogId() + "/" + viewModel.model.Resource.DocumentId() + "/" + viewModel.model.Resource.DocumentType() + "/" + encodeURIComponent(viewModel.model.Resource.DocumentUrl() == "" ? "null" : viewModel.model.Resource.DocumentUrl()));
                        }
                        else if (mode == "Video") {
                            app.setLocation("#/video/" + viewModel.model.Resource.CatalogId() + "/" + viewModel.model.Resource.VideoId());
                        }
                        else if (mode == "Question") {
                            app.setLocation("#/chapter/" + viewModel.model.Resource.CatalogId() + "/" + viewModel.model.Resource.UnitResouceId() + "/" + viewModel.model.Resource.ExerciseType());
                        }
                    }
                    $(".learning-box").css({top: 0, bottom: 0});

                    $(".learning-pro").stop(true, true);
                    if (viewModel.model.t2() != null) {
                        clearTimeout(viewModel.model.t2());
                        viewModel.model.t2(null);
                    }
                    $(".learning-pro").css({top: -location, bottom: location});

                    var catalogId = $(this).attr("CatalogId");
                    var mode = $(this).attr("Mode");
                    var resourceId = $(this).attr("ResourceId");
                    var documentType = $(this).attr("DocumentType");
                    if (documentType == undefined)
                        documentType = 0;
                    var documentUrl = $(this).attr("DocumentUrl");
                    if (documentUrl == undefined)
                        documentUrl = "";
                    var exerciseType = $(this).attr("ExerciseType");
                    if (exerciseType == undefined)
                        exerciseType = 0;
                    self.getresource(catalogId, resourceId, documentType, documentUrl, exerciseType, mode, location);

                    self.updateResouceProcessCssClass.call(this);
                    $(this).addClass("cur").siblings().removeClass("cur");
                });
                self._getresource(self.model.ChapterList(), "");
                //初次加载章节列表时设置选中章节
                if (self.model.Resource.Mode() == "Question") {
                    var offsettop = $(".catalog-list.catalog-mlist>div[CatalogId='" + self.model.Resource.CatalogId() + "'][ResourceId='" + self.model.Resource.UnitResouceId() + "']").addClass("cur").offset().top;
                    $(".catalog-box").scrollTop(offsettop);
                } else if (self.model.Resource.Mode() == "Document") {
                    var offsettop = $(".catalog-list.catalog-mlist>div[CatalogId='" + self.model.Resource.CatalogId() + "'][ResourceId='" + self.model.Resource.DocumentId() + "']").addClass("cur").offset().top;
                    $(".catalog-box").scrollTop(offsettop)
                } else if (self.model.Resource.Mode() == "Video") {
                    var offsettop = $(".catalog-list.catalog-mlist>div[CatalogId='" + self.model.Resource.CatalogId() + "'][ResourceId='" + self.model.Resource.VideoId() + "']").addClass("cur").offset().top;
                    $(".catalog-box").scrollTop(offsettop)
                }
                self._setprevandnexttitle();
            });
        },

        getresource: function (catalogid, resourceid, documenttype, documentUrl, exercisetype, mode, location) {
            if (viewModel.model.Resource.CatalogId() == catalogid && viewModel.model.Resource.Mode() == mode) {
                if ((mode == "Document" && viewModel.model.Resource.DocumentId() == resourceid)
                    || (mode == "Video" && viewModel.model.Resource.VideoId() == resourceid)
                    || (mode == "Question" && viewModel.model.Resource.UnitResouceId() == resourceid)) {
                    return;
                }
            }
            var left = location;
            var right = -location;
            //用于最后一个资源的判断，防止被_setprevandnexttitle方法影响
            var nexttitle = viewModel.model.Resource.NextTitle();

            var directionResourceTitle = "";
            switch (viewModel.model.clickDirection) {
                case 1:
                    directionResourceTitle = viewModel.model.Resource.PrevTitle();
                    break;
                case 2:
                    directionResourceTitle = viewModel.model.Resource.NextTitle();
                    break;
                default:
                    directionResourceTitle = "";
                    break;
            }

            viewModel.getpercent(nexttitle, location < 0);
            $(".learning-box").animate({top: String(left), bottom: String(right)}, 1000, function () {
                $(this).css({top: right, bottom: left});
                //---数据调整

                viewModel.model.Resource.CatalogId(catalogid);
                viewModel.model.Resource.Mode(mode);
                if (mode == "Document") {
                    if (viewModel.model.Resource.DocumentType() == 2)
                        $("#documentViewerThree").show().siblings("div").hide();
                    else
                        $("#documentViewer").show().siblings("div").hide();
                    viewModel._stop();
                    viewModel.model.Resource.DocumentId(resourceid);
                    viewModel.model.Resource.VideoId(0);
                    viewModel.model.Resource.UnitResouceId(0);
                    viewModel.model.Resource.DocumentType(documenttype);
                    viewModel.model.Resource.DocumentUrl(documentUrl);
                    store.recordusercourse({
                        catalogId: viewModel.model.Resource.CatalogId(),
                        documentId: viewModel.model.Resource.DocumentId(),
                        documentType: viewModel.model.Resource.DocumentType(),
                        documentUrl: viewModel.model.Resource.DocumentUrl()
                    });
                }
                else if (mode == "Video") {
                    $("#player").show().siblings("div").hide();
                    viewModel._stop();
                    viewModel.model.Resource.DocumentId(0);
                    viewModel.model.Resource.VideoId(resourceid);
                    viewModel.model.Resource.UnitResouceId(0);
                    store.recordusercourse({
                        catalogId: viewModel.model.Resource.CatalogId(),
                        videoId: viewModel.model.Resource.VideoId()
                    });
                }
                else if (mode == "Question") {
                    $("#chapter").show().siblings("div").hide();
                    viewModel._stop();
                    viewModel.model.Resource.DocumentId(0);
                    viewModel.model.Resource.VideoId(0);
                    viewModel.model.Resource.UnitResouceId(resourceid);
                    viewModel.model.Resource.ExerciseType(exercisetype);
                    store.recordusercourse({
                        catalogId: viewModel.model.Resource.CatalogId(),
                        unitResourceId: viewModel.model.Resource.UnitResouceId(),
                        exerciseType: viewModel.model.Resource.ExerciseType()
                    });
                }
                viewModel._getresource(viewModel.model.ChapterList(), "");
                viewModel._setprevandnexttitle();
                //$(".quiz-box .tabs>ul").children('li.active').trigger("click");注释章节切换的答疑获取
                if (nexttitle != "本课程结束" || location > 0) {
                    viewModel.model.canPlay(true);
                    viewModel.model.t1(setTimeout(viewModel.boxanimate, 1000));
                }
            });

            if (directionResourceTitle == "本课程结束") {
                viewModel.model.t2(setTimeout("window.location.href = '/' + projectName + '/' + targetId + '/user/course?id=' + courseId", 3000));
            }
            else {
                $(".learning-pro").css({top: right, bottom: left});
                $(".learning-pro").show();
                $(".learning-pro").animate({top: "0", bottom: "0"}, 1000, function () {
                    $(this).css({top: "0", bottom: "0"});
                    if (nexttitle != "本课程结束" || location > 0) {
                        viewModel.model.t2(setTimeout("$('.learning-pro').animate({ top: " + String(left) + ", bottom: " + String(right) + " }, 1000, function () { $('.learning-pro').hide(); });", 1000));
                    }
                    else {
                        viewModel.model.t2(setTimeout("window.location.href = '/' + projectName + '/' + targetId + '/user/course?id=' + courseId", 3000));
                    }
                });
            }
        },

        updateResouceProcessCssClass: function () {
            var vm = viewModel;
            var mode = vm.model.Resource.Mode();
            var resourceId = 0;
            switch(mode)
            {
                case "Document":
                    resourceId = vm.model.Resource.DocumentId();
                    break;
                case "Video":
                    resourceId = vm.model.Resource.VideoId();
                    break;
                case "Question":
                    resourceId = vm.model.Resource.UnitResouceId();
                    break;
            }
            store.getResourceProcessDivCssClass(courseId, resourceId, mode, function (data) {
                $('.catalog-list.catalog-mlist > div[resourceid=' + resourceId + ']').removeClass("full half").addClass(data);
            });
        },
        boxanimate: function () {
            $('.learning-box').animate({top: '0', bottom: '0'}, 1000, function () {
                var mode = viewModel.model.Resource.Mode();
                if (mode == "Document") {
                    app.setLocation("#/document/" + viewModel.model.Resource.CatalogId() + "/" + viewModel.model.Resource.DocumentId() + "/" + viewModel.model.Resource.DocumentType() + "/" + encodeURIComponent(viewModel.model.Resource.DocumentUrl() == "" ? "null" : viewModel.model.Resource.DocumentUrl()));
                }
                else if (mode == "Video") {
                    app.setLocation("#/video/" + viewModel.model.Resource.CatalogId() + "/" + viewModel.model.Resource.VideoId());
                }
                else if (mode == "Question") {
                    app.setLocation("#/chapter/" + viewModel.model.Resource.CatalogId() + "/" + viewModel.model.Resource.UnitResouceId() + "/" + viewModel.model.Resource.ExerciseType());
                }
                viewModel.model.t1(null);
            });
        },

        _stop: function () {
            viewModel.document.viewModel.docfinish();
            viewModel.video.viewModel.finish();
            //习题的样式
            $("#chapter").empty();
        },

        _setprevandnexttitle: function () {
            //设置下一个标题
            var next = $(".catalog-list.catalog-mlist>div[class^='resource'].cur").nextAll("[class^='resource']").not("[style*='display: none']").first();
            if (next != undefined && next.length > 0) {
                viewModel.model.Resource.NextTitle(next.children("span.td").children("span:first").first().text());
            }
            else {
                viewModel.model.Resource.NextTitle("本课程结束");
            }

            //设置上一个标题
            var prev = $(".catalog-list.catalog-mlist>div[class^='resource'].cur").prevAll("[class^='resource']").not("[style*='display: none']").first();
            if (prev != undefined && prev.length > 0) {
                viewModel.model.Resource.PrevTitle(prev.children("span.td").children("span:first").first().text());
            }
            else {
                viewModel.model.Resource.PrevTitle("");
            }
        },

        //调用时：list为遍历集合，chapterno为空字符串
        _getresource: function (list, chapterno) {
            var t = this;
            $.each(list, function (index, value) {
                if (value.CatalogId() == t.model.Resource.CatalogId()) {
                    t.model.Resource.ChapterNo(chapterno + (index + 1));
                    $.each(value.NaeResourceList(), function (index1, value1) {
                        if (value1.ResourceType() == 1 &&
                            value1.ResourceInfo.VideoId() == t.model.Resource.VideoId()) {
                            t.model.Resource.Title(value1.ResourceInfo.VideoTitle);
                            t.model.Resource.ResourceNo(index1 + 1);
                            return false;
                        }
                        else if (value1.ResourceType() == 2 &&
                            value1.ResourceInfo.DocumentId() == t.model.Resource.DocumentId()) {
                            t.model.Resource.Title(value1.ResourceInfo.DocumentTitle);
                            t.model.Resource.ResourceNo(index1 + 1);
                            return false;
                        }
                        else if (value1.ResourceType() == 3 &&
                            value1.ResourceInfo.UnitResouceId() == t.model.Resource.UnitResouceId()) {
                            t.model.Resource.Title(value1.ResourceInfo.Title);
                            t.model.Resource.ResourceNo(index1 + 1);
                            return false;
                        }
                    });
                }
                else if (chapterno == "") {
                    //检查节的集合
                    t._getresource(value.Children(), (index + 1) + ".");
                }
            });
        },

        prev: function () {
            this.model.clickDirection = 1;
            var prev = $(".catalog-list.catalog-mlist>div.cur").prevAll("[class^='resource']").not("[style*='display: none']").first();
            if (prev != undefined && prev.length > 0) {
                prev.trigger("click");
                var prevtop = prev.offset().top, scrolltop = $(".catalog-box").scrollTop();
                if (prevtop < 0) {
                    $(".catalog-box").scrollTop(prevtop + scrolltop);
                }
            }
        },

        next: function () {
            this.model.clickDirection = 2;
            var next = $(".catalog-list.catalog-mlist>div.cur").nextAll("[class^='resource']").not("[style*='display: none']").first();
            if (next != undefined && next.length > 0) {
                next.trigger("click");
                var nexttop = next.offset().top, scrolltop = $(".catalog-box").scrollTop(), nextheight = next.height(), height = $(window).height();
                if (nexttop + nextheight > height) {
                    $(".catalog-box").scrollTop(scrolltop + nexttop + nextheight - height);
                }
            }
            else {
                var location = $("div.learning-box").height();
                viewModel.getresource(0, 0, 0, "", -location);
            }
        },

        documentclass: function (IsFinished, FinishSeconds) {
            var documentclass = "resource doc";
            if (IsFinished) {
                documentclass += " full";
            }
            else if (FinishSeconds > 0) {
                documentclass += " half";
            }
            return documentclass;
        },

        videoclass: function (UserVideoDuration, VideoDuration) {
            var videoclass = "resource video";
            if (UserVideoDuration > 0) {
                if (UserVideoDuration >= VideoDuration || (VideoDuration - UserVideoDuration <= videoError)) {
                    videoclass += " full";
                }
                else if (UserVideoDuration > 0 && UserVideoDuration <= VideoDuration) {
                    videoclass += " half";
                }
            }
            return videoclass;
        },

        questionclass: function (Status) {
            var questionclass = "resource test";
            if (Status == 1) {
                questionclass += " half";
            }
            else if (Status == 2) {
                questionclass += " full";
            }
            return questionclass;
        },

        getpercent: function (nexttitle, bl) {
            var self = this;
            store.getpercent({courseId: courseId}, function (data) {
                self.model.Percent(data + "%");
                if (self.model.Percent() == "100%" && nexttitle == "本课程结束" && bl) {
                    self.model.PercentInfo(i18nHelper.getKeyValue("learnPlay.frontPage.staticText5"));
                }
                else {
                    self.model.PercentInfo(i18nHelper.getKeyValue("learnPlay.frontPage.staticText2") + self.model.Percent());
                }
            });
        },

        showtooltip: function (title) {
            var length = typeof title == 'string' && title.replace(/[^x00-xFF]/g, '**').length;
            return length > 26;
        },

        getTitleText: function (title) {
            var titleLength = 0;
            for (var i = 0; i < title.length; i++) {
                var item = title.charAt(i);
                encodeURI(item).length > 2 ? titleLength += 2 : titleLength += 1;
                if (titleLength > 26) {
                    return title.substr(0, i) + "...";
                }
            }
            return title.substr(0, title.length);
        },

        returnquiz: function () {
            if (viewModel.model.isQuizSearch()) {
                window.open("/" + projectName + "/" + targetId + "/user/quiz?quizKey=1&courseId=" + courseId + "&isSearch=true&KeyWord=" + viewModel.model.oldKeyWord());
            }
            else {
                var key = $("div.quiz-box .tabs>ul li.active").attr("QuizType");
                window.open("/" + projectName + "/" + targetId + "/user/quiz?quizKey=" + key + "&courseId=" + courseId);
            }
        }

        //章节处理--结束
    };


    var app;
    exports.init = function (video, document, chapter) {
        viewModel.init(video, document, chapter);
        app = $.sammy(function () {
            this.get("#/", function () {
            });

            this.get('#/video/:catalogid/:vedioid', function () {
                if (viewModel.model.canPlay() == false)//快速切换时禁止上次动画的资源播放(即动画非正常走完)
                    return;
                viewModel.model.Resource.Mode("Video");
                viewModel.model.Resource.CatalogId(this.params['catalogid']);
                viewModel.model.Resource.VideoId(this.params['vedioid']);
                viewModel.model.Resource.DocumentId(0);
                viewModel.model.Resource.UnitResouceId(0);
                store.getvideo({videoId: viewModel.model.Resource.VideoId()}, function (data) {
                    //viewModel.model.Resource.IsLinkDocument(data.IsLinkDocument);
                    $("#player").show().siblings("div").hide();
                    viewModel.video.viewModel.model.LastPlayPosition = data.LastPlayPosition;
                    viewModel.video.viewModel.model.MaxPlayPosition = data.MaxPlayPosition;
                    viewModel.video.viewModel.model.VideoDuration = data.VideoDuration;
                    viewModel.video.viewModel.model.IsEnd = data.IsEnd;
                    viewModel.video.viewModel.play(viewModel.model.Resource.VideoId());
                });
                if (viewModel.model.ChapterList().length == 0)
                    viewModel.getchapterlist();
            });
            this.get('#/document/:catalogid/:documentid/:documenttype/:documenturl', function () {
                if (viewModel.model.canPlay() == false)
                    return;
                viewModel.model.Resource.Mode("Document");
                viewModel.model.Resource.CatalogId(this.params['catalogid']);
                viewModel.model.Resource.VideoId(0);
                viewModel.model.Resource.DocumentId(this.params['documentid']);
                viewModel.model.Resource.DocumentType(this.params['documenttype']);

                var dtrul = decodeURIComponent(this.params['documenturl']);
                if (dtrul == "null") {
                    viewModel.model.Resource.DocumentUrl("");
                }
                else {
                    viewModel.model.Resource.DocumentUrl(dtrul);
                }
                viewModel.model.Resource.UnitResouceId(0);
                if (viewModel.model.Resource.DocumentType() == 2)
                    $("#documentViewerThree").show().siblings("div").hide();
                else
                    $("#documentViewer").show().siblings("div").hide();
                viewModel.document.viewModel.doc(viewModel.model.Resource.DocumentId(), viewModel.model.Resource.DocumentType(), viewModel.model.Resource.DocumentUrl());
                if (viewModel.model.ChapterList().length == 0)
                    viewModel.getchapterlist();
            });
            this.get('#/chapter/:catalogid/:chapterid/:exercisetype', function () {
                if (viewModel.model.canPlay() == false)
                    return;
                viewModel.model.Resource.Mode("Question");
                viewModel.model.Resource.CatalogId(this.params['catalogid']);
                viewModel.model.Resource.VideoId(0);
                viewModel.model.Resource.DocumentId(0);
                viewModel.model.Resource.UnitResouceId(this.params['chapterid']);
                viewModel.model.Resource.ExerciseType(this.params['exercisetype']);
                $("#chapter").show().siblings("div").hide();
                viewModel.chapter.viewModel.reload(viewModel.model.Resource.UnitResouceId(), viewModel.model.Resource.ExerciseType());
                if (viewModel.model.ChapterList().length == 0)
                    viewModel.getchapterlist();
            });

            this.after(function () {
                //this.redirect('#/');
            });
        });
        app.run("#/");
    };
});
