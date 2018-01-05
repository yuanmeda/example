/*
 考试管理
 */
(function ($) {
    //数据仓库
    var store = {
        getPaperList: function (search) {
            var url = '/v1/questionbanks/papers';
            return $.ajax({
                url: url,
                data: search,
                type: 'GET',
                dataType: 'json',
                cache: false
            });
        },
        deletePaper: function (id) {
            var url = '/v1/questionbanks/papers/' + id;
            return $.ajax({
                url: url,
                type: 'DELETE',
                dataType: 'json'
            });
        }
    };
    var viewPath = {
        create: function () {
            window.parentModel.toGroupByType('create', 2);
        },
        detail: function (singleCourseId, courseId) {
            setCookie({
                'course_type_id': courseId
            });
            window.parentModel.toNextGroup('4.2.1', '/admin/singlecourse/singlecoursedetail?project_id=' + projectId + '&singlecourse_id=' + singleCourseId + '&course_id=' + courseId, 7);
        },
        doMessage: function (param) {
            window.parentModel.toNextGroup('7.1.3', '/admin/message/messageedit?project_id=' + projectId + '&param=' + param, 14, {
                pathType: 'create'
            });
        },
        doBanner: function (param) {
            window.parentModel.toNextGroup('7.1.1', '/admin/banner/bannercreate?project_id=' + projectId + '&param=' + param, 14, {
                pathType: 'create'
            });
        }
    };
    //数据模型
    var viewModel = {
        model: {
            items: [],
            filter: {
                title: '',
                custom_id: 'auxo-exam',
                question_bank_id: '',
                page: 0,
                size: 20
            }
        },
        init: function () {
            var _self = this;
            _self.model.filter.question_bank_id = questionbankId;
            _self.model = ko.mapping.fromJS(_self.model);
            ko.applyBindings(_self, document.getElementById('block'));
            this.getPaperList();
        },
        uploadPaper: function () {
            var _self = this;
            _self.showMaskDivIncludeParent(function () {
                _self.reloadPaperList();
            }, cloudClientDownloadUrl, "", "", 0);
            window.location = protocalName + "://resource?resourcetype=2&accesstoken=" + accessToken + "&appId=" + appId;
        },
        reloadPaperList:function(){
            this.model.filter.title('');
            this.search();
        },
        getPaperList: function () {
            var _self = this, _search = ko.mapping.toJS(this.model.filter);
            if (_search.custom_id === '')_search.custom_id = undefined;
            store.getPaperList(_search).done(function (data) {
                _self.model.items(data.items);
                _self.page(data.count, _self.model.filter.page());
            });
        },
        delPaper: function ($data) {
            var _self = this;
            Utils.confirmTip("您确认要删除试卷吗？", function () {
                store.deletePaper($data.id)
                    .done(function () {
                        _self.search();
                        $.fn.dialog2.helpers.alert("删除试卷成功");
                    });
            });
        },
        search: function () {
            this.model.filter.page(0);
            this.getPaperList();
        },
        formatQuestions: function (questions) {
            var _questionDict = {
                10: {desc: '单选题', count: 0, totalScore: 0},
                15: {desc: '多选题', count: 0, totalScore: 0},
                18: {desc: '不定项选择题', count: 0, totalScore: 0},
                20: {desc: '填空题', count: 0, totalScore: 0},
                25: {desc: '主观题', count: 0, totalScore: 0},
                30: {desc: '判断题', count: 0, totalScore: 0},
                40: {desc: '连线题', count: 0, totalScore: 0},
                50: {desc: '套题', count: 0, totalScore: 0}
            };
            $.each(questions, function (i, v) {
                ++_questionDict[v.question_type].count;
                _questionDict[v.question_type].totalScore += v.total_score;
            });
            var _formattedStr = '';
            $.each(_questionDict, function (i, v) {
                if (v.count > 0) _formattedStr += v.desc + v.count + '题（' + v.totalScore + '分）';
            });
            return _formattedStr;
        },
        page: function (count, currentPage) {
            var _self = this;
            $('#pagination').pagination(count, {
                items_per_page: _self.model.filter.size(),
                current_page: currentPage,
                callback: function (pageIndex) {
                    if (pageIndex != currentPage) {
                        _self.model.filter.page(pageIndex);
                        _self.getPaperList();
                    }
                }
            });
        },
        // 创建遮罩层并附加到BODY元素下,然后显示遮罩层
        createMaskDiv: function (title, btnTitle, action) {
            this.alertMessage(title, btnTitle, "", action);
        },
        alertMessage: function (title, btnTitle, message, action) {
            var interTitle = "上传提示", interBtnTitle = "已完成上传";
            if (title != null && title != "")
                interTitle = title;
            if (btnTitle != null && btnTitle != "")
                interBtnTitle = btnTitle;

            var actionTitle = "",
                resourceTitle = "";
            switch (action) {
                case 0:
                    resourceTitle = "试卷";
                    actionTitle = "上传";
                    break;
                case 1:
                    resourceTitle = "试卷";
                    actionTitle = "编辑";
                    break;
                default:
                    resourceTitle = "文档";
                    actionTitle = "上传";
                    break;
            }


            var $body = $(document.body);
            //插入样式
            if ($body.find("#css-modalDialog").length <= 0) {
                var linkCss = "";
                linkCss += "<style id='css-modalDialog'>";
                linkCss += ".mask-dalog .close { float: right; font-size: 20px; font-weight: bold; line-height: 20px; color: #000000; text-shadow: 0 1px 0 #ffffff; opacity: 0.2; filter: alpha(opacity=20); text-decoration: none; }";
                linkCss += ".mask-dalog .close:hover, .mask-dalog .close:focus { color: #000000; text-decoration: none; cursor: pointer; opacity: 0.4; filter: alpha(opacity=40); }";
                linkCss += ".mask-dalog .modal-backdrop { position: fixed; top: 0; right: 0; bottom: 0; left: 0; z-index: 1040; background-color: #000000; }";
                linkCss += ".mask-dalog .modal-backdrop.fade { opacity: 0; }";
                linkCss += ".mask-dalog .modal-backdrop, .modal-backdrop.fade.in { opacity: 0.8; filter: alpha(opacity=80); }";
                linkCss += ".mask-dalog.modal { position: fixed; _position: absolute; top: 20%; left: 50%; z-index: 1050; width: 560px; margin:0 0 0 -280px; background-color: #ffffff; border: 1px solid #999; border: 1px solid rgba(0,0,0,0.3); *border: 1px solid #999; -webkit-border-radius: 6px; -moz-border-radius: 6px; border-radius: 6px; outline: none; -webkit-box-shadow: 0 3px 7px rgba(0,0,0,0.3); -moz-box-shadow: 0 3px 7px rgba(0,0,0,0.3); box-shadow: 0 3px 7px rgba(0,0,0,0.3); -webkit-background-clip: padding-box; -moz-background-clip: padding-box; background-clip: padding-box; font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; font-size: 13px; line-height: 20px; color: #333333; background-color: #ffffff; }";
                linkCss += ".mask-dalog.modal.fade { top: -25%; -webkit-transition: opacity 0.3s linear,top 0.3s ease-out; -moz-transition: opacity 0.3s linear,top 0.3s ease-out; -o-transition: opacity 0.3s linear,top 0.3s ease-out; transition: opacity 0.3s linear,top 0.3s ease-out; }";
                linkCss += ".mask-dalog.modal.fade.in { top: 10%; }";
                linkCss += ".mask-dalog .modal-header { padding: 9px 15px; border-bottom: 1px solid #eee; }";
                linkCss += ".mask-dalog .modal-header .close { margin-top: 2px; }";
                linkCss += ".mask-dalog .modal-header h3 { margin: 0; line-height: 30px; }";
                linkCss += ".mask-dalog .modal-body { position: relative; max-height: 400px; padding: 15px; overflow-y: auto; }";
                linkCss += ".mask-dalog .modal-form { margin-bottom: 0; }";
                linkCss += ".mask-dalog .modal-footer { padding: 14px 15px 15px; margin-bottom: 0; text-align: right; background-color: #f5f5f5; border-top: 1px solid #ddd; -webkit-border-radius: 0 0 6px 6px; -moz-border-radius: 0 0 6px 6px; border-radius: 0 0 6px 6px; *zoom: 1; -webkit-box-shadow: inset 0 1px 0 #ffffff; -moz-box-shadow: inset 0 1px 0 #ffffff; box-shadow: inset 0 1px 0 #ffffff; }";
                linkCss += ".mask-dalog .modal-footer:before, .modal-footer:after { display: table; line-height: 0; content: ''; }";
                linkCss += ".mask-dalog .modal-footer:after { clear: both; }";
                linkCss += ".mask-dalog .modal-footer .btn + .btn { margin-bottom: 0; margin-left: 5px; }";
                linkCss += ".mask-dalog .modal-footer .btn-group .btn + .btn { margin-left: -1px; }";
                linkCss += ".mask-dalog .modal-footer .btn-block + .btn-block { margin-left: 0; }";
                linkCss += ".mask-dalog .btn { display: inline-block; *display: inline; padding: 4px 12px; margin-bottom: 0; *margin-left: .3em; font-size: 14px; line-height: 20px; color: #333333; text-align: center; text-shadow: 0 1px 1px rgba(255,255,255,0.75); vertical-align: middle; cursor: pointer; background-color: #f5f5f5; *background-color: #e6e6e6; background-image: -moz-linear-gradient(top,#ffffff,#e6e6e6); background-image: -webkit-gradient(linear,0 0,0 100%,from(#ffffff),to(#e6e6e6)); background-image: -webkit-linear-gradient(top,#ffffff,#e6e6e6); background-image: -o-linear-gradient(top,#ffffff,#e6e6e6); background-image: linear-gradient(to bottom,#ffffff,#e6e6e6); background-repeat: repeat-x; border: 1px solid #cccccc; *border: 0; border-color: #e6e6e6 #e6e6e6 #bfbfbf; border-color: rgba(0,0,0,0.1) rgba(0,0,0,0.1) rgba(0,0,0,0.25); border-bottom-color: #b3b3b3; -webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px; filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffffff',endColorstr='#ffe6e6e6',GradientType=0); filter: progid:DXImageTransform.Microsoft.gradient(enabled=false); *zoom: 1; -webkit-box-shadow: inset 0 1px 0 rgba(255,255,255,0.2),0 1px 2px rgba(0,0,0,0.05); -moz-box-shadow: inset 0 1px 0 rgba(255,255,255,0.2),0 1px 2px rgba(0,0,0,0.05); box-shadow: inset 0 1px 0 rgba(255,255,255,0.2),0 1px 2px rgba(0,0,0,0.05); }";
                linkCss += ".mask-dalog .btn:hover, .btn:focus, .btn:active, .btn.active, .btn.disabled, .btn[disabled] { color: #333333; background-color: #e6e6e6; *background-color: #d9d9d9; }";
                linkCss += ".mask-dalog .btn:first-child { *margin-left: 0; }";
                linkCss += ".mask-dalog .btn:hover, .btn:focus { color: #333333; text-decoration: none; background-position: 0 -15px; -webkit-transition: background-position 0.1s linear; -moz-transition: background-position 0.1s linear; -o-transition: background-position 0.1s linear; transition: background-position 0.1s linear; }";
                linkCss += ".mask-dalog .btn:focus { outline: thin dotted #333; outline: 5px auto -webkit-focus-ring-color; outline-offset: -2px; }";
                linkCss += ".mask-dalog .btn.active, .btn:active {  background-color: #cccccc \9; background-image: none; outline: 0; -webkit-box-shadow: inset 0 2px 4px rgba(0,0,0,0.15),0 1px 2px rgba(0,0,0,0.05); -moz-box-shadow: inset 0 2px 4px rgba(0,0,0,0.15),0 1px 2px rgba(0,0,0,0.05); box-shadow: inset 0 2px 4px rgba(0,0,0,0.15),0 1px 2px rgba(0,0,0,0.05); }";
                linkCss += ".mask-dalog .btn.disabled, .btn[disabled] { cursor: default; background-image: none; opacity: 0.65; filter: alpha(opacity=65); -webkit-box-shadow: none; -moz-box-shadow: none; box-shadow: none; }";
                linkCss += ".mask-dalog .btn-large { padding: 11px 19px; font-size: 17.5px; -webkit-border-radius: 6px; -moz-border-radius: 6px; border-radius: 6px; }";
                linkCss += ".mask-dalog .btn-large [class^='icon-'], .btn-large [class*=' icon-'] { margin-top: 4px; }";
                linkCss += ".mask-dalog .btn-small { padding: 2px 10px; font-size: 11.9px; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; }";
                linkCss += ".mask-dalog .btn-small [class^='icon-'], .btn-small [class*=' icon-'] { margin-top: 0; }";
                linkCss += ".mask-dalog .btn-mini [class^='icon-'], .btn-mini [class*=' icon-'] { margin-top: -1px; }";
                linkCss += ".mask-dalog .btn-mini { padding: 0 6px; font-size: 10.5px; -webkit-border-radius: 3px; -moz-border-radius: 3px; border-radius: 3px; }";
                linkCss += ".mask-dalog .btn-block { display: block; width: 100%; padding-right: 0; padding-left: 0; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; }";
                linkCss += ".mask-dalog .btn-block + .btn-block { margin-top: 5px; }";
                linkCss += ".mask-dalog input[type='submit'].btn-block, input[type='reset'].btn-block, input[type='button'].btn-block { width: 100%; }";
                linkCss += ".mask-dalog .btn-primary.active, .btn-warning.active, .btn-danger.active, .btn-success.active, .btn-info.active, .btn-inverse.active { color: rgba(255,255,255,0.75); }";
                linkCss += ".mask-dalog .btn-primary { color: #ffffff; text-shadow: 0 -1px 0 rgba(0,0,0,0.25); background-color: #006dcc; *background-color: #0044cc; background-image: -moz-linear-gradient(top,#0088cc,#0044cc); background-image: -webkit-gradient(linear,0 0,0 100%,from(#0088cc),to(#0044cc)); background-image: -webkit-linear-gradient(top,#0088cc,#0044cc); background-image: -o-linear-gradient(top,#0088cc,#0044cc); background-image: linear-gradient(to bottom,#0088cc,#0044cc); background-repeat: repeat-x; border-color: #0044cc #0044cc #002a80; border-color: rgba(0,0,0,0.1) rgba(0,0,0,0.1) rgba(0,0,0,0.25); filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ff0088cc',endColorstr='#ff0044cc',GradientType=0); filter: progid:DXImageTransform.Microsoft.gradient(enabled=false); }";
                linkCss += ".mask-dalog .btn-primary:hover, .btn-primary:focus, .btn-primary:active, .btn-primary.active, .btn-primary.disabled, .btn-primary[disabled] { color: #ffffff; background-color: #0044cc; *background-color: #003bb3; }";
                linkCss += ".mask-dalog .btn-primary:active, .btn-primary.active { background-color: #003399; }";
                linkCss += ".mask-dalog #a-clienturl { color: #08C; }";
                linkCss += "</style>";
                $body.append(linkCss);
            }
            //插入遮罩
            if ($body.find("#maskDiv").length <= 0) {
                var modalStr = "";
                modalStr += "<div id='maskDiv' style='position: absolute; height: 100%; width:100%; top:0px; left:0px; z-Index: 10000; filter: alpha(opacity=20); opacity: 0.2; background-color: #000000;  display: none;'>";
                modalStr += "</div>"
                $body.append(modalStr);
            }
            this.$maskDiv = $body.find("#maskDiv").show();
            //有滚动条的页面需要设置明确的高度 不然盖不全
            this.$maskDiv.height($(document).height());
            var _this = this;
            $(window).on("resize", function () {
                _this.$maskDiv.height($(window.document).height());
            });

            //弹窗的内容变更较多 直接删除新曾比较好处理
            $body.find(".mask-dalog").remove();
            var dialogStr = "";
            if (message == undefined || message == null || message == "") {
                dialogStr += "   <div id='modal-form' class='modal mask-dalog' data-backdrop='static' style='z-Index: 10001;'>";
            }
            else {
                dialogStr += "   <div id='alert-form' class='modal mask-dalog' data-backdrop='static' style='z-Index: 10001;'>";
            }
            dialogStr += "       <div class='modal-header'>";
            dialogStr += "           <a href='#' class='close' data-dismiss='modal'>&times;</a>";
            dialogStr += "           <h3 style='font-size: 14px;'>";
            dialogStr += "              " + interTitle;
            dialogStr += "           </h3>";
            dialogStr += "       </div>";
            dialogStr += "       <div class='modal-body'>";
            dialogStr += "           <form class='form-inline'>";
            dialogStr += "               <div class='control-group'>";
            dialogStr += "                   <label class='control-label' style='cursor: default;'>";

            if (message == undefined || message == null || message == "") {
                dialogStr += "                       <span style='cursor: default; font-size: 13px; margin-left: 25px;'>";
                dialogStr += "请在打开的客户端中" + actionTitle + resourceTitle + "。如不能打开客户端请检查是否安装<a id='a-clienturl' href='javascript:void(0);'>客户端</a>。</span>";
                dialogStr += "                       <br/>";
                dialogStr += "                       <br/>";
                dialogStr += "                       <span style='cursor: default; font-size: 13px; margin-left: 25px;'>";
                dialogStr += actionTitle + "完" + resourceTitle + "后可关闭此窗口查看最新" + actionTitle + "的" + resourceTitle + "。</span>";
            }
            else {
                dialogStr += "                       <span style='cursor: default; font-size: 13px; margin-left: 25px;'>";
                dialogStr += "                          " + message;
                dialogStr += "                       </span>";
            }

            dialogStr += "                   </label>";
            dialogStr += "               </div>";
            dialogStr += "           </form>";
            dialogStr += "       </div>";

            if (message == undefined || message == null || message == "") {
                dialogStr += "       <div class='modal-footer'  style='text-align:center;'>";
                dialogStr += "           <a id='btn-sure-syncmessage' style='font-size: 13px;' class='btn-primary btn'>";
                dialogStr += "              " + interBtnTitle;
                dialogStr += "           </a>";
                dialogStr += "       </div>";
            }
            else {
                dialogStr += "       <div class='modal-footer'>";
                dialogStr += "           <a id='btn-close-dialog' style='font-size: 13px;' class='btn'>";
                dialogStr += "              " + interBtnTitle;
                dialogStr += "           </a>";
                dialogStr += "       </div>";
            }

            dialogStr += "   </div>";
            $body.append(dialogStr);
            this.$maskDialog = $body.find(".mask-dalog");
        },
        // 显示遮罩层
        showMaskDivIncludeParent: function (sureCallback, clientDownloadUrl, title, btnTitle, action) {
            var _this = this;
            this.createMaskDiv(title, btnTitle, action);

            this.$maskDialog.find("#a-clienturl").attr("href", clientDownloadUrl);
            this.$maskDialog.find(".close").off("click").on("click", function () {
                _this.$maskDiv.hide();
                _this.$maskDialog.hide();
                return false;
            });


            this.$maskDialog.find("#btn-sure-syncmessage").off("click").on("click", function () {
                _this.$maskDiv.hide();
                _this.$maskDialog.hide();
                if (typeof (sureCallback) == "function") {
                    sureCallback();
                }
                return false;
            });
        }
    };

    $(function () {
        viewModel.init();
    });
})(jQuery);