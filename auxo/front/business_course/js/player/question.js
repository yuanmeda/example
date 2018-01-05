define(function (require, exports, module) {
    var _getKeyValue = i18nHelper.getKeyValue;
    var store = {
        /*获取问题列表*/
        getQuestion: function (data) {
            return $.ajax({
                url: gatewayUrl + '/v1/questions/search',
                type: "GET",
                cache: false,
                data: data,
            });
        },
        /*获取某个问题下的回答*/
        getAnswers: function (data) {
            return $.ajax({
                url: gatewayUrl + '/v1/answers/search',
                type: "GET",
                data: data,
                cache: false
            });
        },
        /*新增问题*/
        createQuestion: function (data) {
            return $.ajax({
                url: assistUrl + '/v1/questions',
                type: "POST",
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: "json"
            });
        },
        /*新增回答*/
        createAnswer: function (data) {
            return $.ajax({
                url: gatewayUrl + '/v1/answers',
                type: "POST",
                data: JSON.stringify(data),
                contentType: 'application/json',
                dataType: "json"
            });
        },
        /*查询单个问题*/
        getSigleQuestion: function(id) {
            return $.ajax({
                url: gatewayUrl + '/v1/questions/' + id,
                dataType: "json",
                cache: false
            })
        },
    };
    var viewModel = {
        maxlength: 50,
        desMaxLength: 2000,
        model: {
            quizType: 1,//tab切换类型
            isShow: true,//切换问题类型
            isResult: false,//是否是搜索结果页
            showEditQuestion: false,//是否显示编辑问题页
            courseResourceInfo: '',//课程下的资源信息
            questionTitle: '',//问题标题
            questionContent: '',//问题描述
            myQuestionList: [],
            myTotal: 0,
            allQuestionList: [],
            allTotal: 0,
            myFilter: {
                page: 0,
                size: 10
            },
            allFilter: {
                page: 0,
                size: 10
            },
            searchFilter: {
                page: 0,
                size: 10
            },
            questionFilter: {
                page: 0,
                size: 10
            },
            searchContent: '',//搜索内容
            searchList: [],
            searchTotal: 0,
            questionTitle: '',//问题标
            targetName: '',//问题来源
            questionDes: '',//问题描述
            detailUserInfo: '',//张珊&emsp;2013-11-05 10:23
            detailTotal: 0,//问题详情下的回答数
            detailList: [],//问题详情下的回答列表
            isDetail: false,
            questionId: '',
            answerContent: ''
        },

        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.model.options = {
                actions: {
                    'detail': $.proxy(this.showDetail, this),//问题详情显示
                    'delete': $.proxy(this.deleteQuestion, this),//删除对应的问题，并且之后要刷新列表
                    'accept': $.proxy(this.getSomeQuestion, this)
                },
                urls: {
                    'api': assistUrl,
                    'gateway': gatewayUrl
                }
            };
            /*数量控制*/
            this.model.wordCount = ko.computed(function () {
                if (this.model.questionTitle()) {
                    return this.model.questionTitle().length;
                } else {
                    return 0;
                }
            }, this);
            this.model.questionTitle.subscribe(function (val) {
                var _maxLen = this.maxlength;
                this.model.questionTitle(val && val.length > _maxLen ? val.substr(0, _maxLen) : val);
            }, this);
            /*问题描述数量控制*/
            this.model.wordCountDes = ko.computed(function () {
                if (this.model.questionContent()) {
                    return this.model.questionContent().length;
                } else {
                    return 0;
                }
            }, this);
            this.model.questionContent.subscribe(function (val) {
                var _maxLen = this.desMaxLength;
                this.model.questionContent(val && val.length > _maxLen ? val.substr(0, _maxLen) : val);
            }, this);
            /*回答数量控制*/
            this.model.wordCountAnswer = ko.computed(function () {
                if (this.model.answerContent()) {
                    return this.model.answerContent().length;
                } else {
                    return 0;
                }
            }, this);
            this.model.answerContent.subscribe(function (val) {
                var _maxLen = this.desMaxLength;
                this.model.answerContent(val && val.length > _maxLen ? val.substr(0, _maxLen) : val);
            }, this);
            this.slideLoading();
            
         
            this.model.valid = ko.computed(function(){
                return this.model.questionTitle().length > 0;
            }, this);
            
            this.model.answer_valid = ko.computed(function(){
                var length = this.model.answerContent().length;
                return length > 0 && length <= 2000;
            }, this);
            //this._editor();
        },
        /*滑动加载*/
        slideLoading: function () {
            $('.qa-list-scroll').on('scroll', function () {
                if ((this.scrollTop + this.clientHeight == this.scrollHeight) && viewModel.model.quizType() == '1' && viewModel.model.myTotal() > 10 && !viewModel.model.isResult()) {
                    viewModel.model.myFilter.page(viewModel.model.myFilter.page() + 1);
                    viewModel.getMyQuestion(false, true);//第一个为是否搜索，第二个为是否滑动加载
                } else if ((this.scrollTop + this.clientHeight == this.scrollHeight) && viewModel.model.quizType() == '2' && viewModel.model.allTotal() > 10 && !viewModel.model.isResult()) {
                    viewModel.model.allFilter.page(viewModel.model.allFilter.page() + 1);
                    viewModel.getAllQuestion(false, true);//第一个为是否搜索，第二个为是否滑动加载
                } else if ((this.scrollTop + this.clientHeight == this.scrollHeight) && viewModel.model.searchTotal() > 10 && viewModel.model.isResult()) {
                    viewModel.model.searchFilter.page(viewModel.model.searchFilter.page() + 1);
                    if (viewModel.model.quizType() == '1') {
                        viewModel.getMyQuestion(true, true);
                    } else {
                        viewModel.getAllQuestion(true, true);
                    }
                }
            });
        },
        slideDetail: function () {
            /*详情页滑动加载*/
            $('.detail-body').on('scroll', function () {
                if ((this.scrollTop + this.clientHeight == this.scrollHeight) && viewModel.model.isDetail()) {
                    viewModel.model.questionFilter.page(viewModel.model.questionFilter.page() + 1);
                    viewModel.getAnswers(true);
                }
            });
        },
        /*tab切换*/
        switchTab: function (element) {
            var type = $(element).attr('quizType');
            if (type == '1') {
                viewModel.model.myFilter.page(0);
                viewModel.getMyQuestion();
                viewModel.model.isShow(true);
            } else {
                viewModel.model.allFilter.page(0);
                viewModel.getAllQuestion();
                viewModel.model.isShow(false);
            }
            viewModel.model.quizType(type);
        },
        /*点击显示编辑问题页*/
        showEdit: function () {
            viewModel.model.showEditQuestion(true);
            viewModel.model.courseResourceInfo((window.currentChapterTitle ? window.currentChapterTitle : '') + ' ' + resourceTitle);
        },
        /*返回我的或者全部问题页*/
        cancelEdit: function () {
            viewModel.model.showEditQuestion(false);
        },
        //富文本编辑器
        /*_editor: function () {
         window.desEditor = KindEditor.create('#editQuestion', {
         loadStyleMode: false,
         pasteType: 2,
         allowFileManager: false,
         allowPreviewEmoticons: false,
         allowImageUpload: false,
         resizeType: 0,
         //imageUploadServer: this.model.uploadInfo.server_url(),
         //imageUploadSession: this.model.uploadInfo.session(),
         //imageUploadPath: this.model.uploadInfo.path(),
         staticUrl: staticUrl,
         items: [
         'forecolor', 'bold', 'underline'
         ],
         afterChange: function () {
         if (!window.desEditor) {
         return;
         }
         if (window.desEditor.count("text") == 0) {
         this.model.questionContent = ko.observable('');
         } else {
         this.model.questionContent = ko.observable(window.desEditor.html());
         }
         }.bind(this)
         });
         },*/
        /*新增问题*/
        addQuestion: function () {
            var params = {
                target_id: resourceUuid,
                target_name: resourceTitle,
                custom_id: courseId,
                context_id: contextId + '.business_course:' + courseId,
                title: viewModel.model.questionTitle(),
                content: viewModel.model.questionContent()
            };
            store.createQuestion(params).done(function (resData) {
                viewModel.model.questionContent('');
                viewModel.model.questionTitle('');
                viewModel.model.showEditQuestion(false);
                /*重新刷新对应的页面*/
                viewModel.model.quizType('1');
                viewModel.model.isShow(true);
                viewModel.model.myFilter.page(0);
                viewModel.getMyQuestion();
            });
        },
        /*获取我的问题*/
        getMyQuestion: function (searchFlag, slideFlag) {
            var myParams = {
                target_id: resourceUuid,
                type: 2,//查询自己提问的问题
                page_no: searchFlag ? viewModel.model.searchFilter.page() : viewModel.model.myFilter.page(),
                page_size: viewModel.model.myFilter.size(),
                content: searchFlag ? viewModel.model.searchContent() : ''
            };
            store.getQuestion(myParams).done(function (resData) {
                if (resData) {
                    if (!searchFlag) {
                        if (!slideFlag) {
                            viewModel.model.myQuestionList(resData.items ? resData.items : []);
                            viewModel.model.myTotal(resData.total);
                        } else {
                            if (viewModel.model.myQuestionList().length == resData.total) return;
                            $.each(resData.items ? resData.items : [], function (index, item) {
                                viewModel.model.myQuestionList.push(item);//是否需要滑动到某个位置
                            })
                        }
                    } else {
                        if (!slideFlag) {
                            viewModel.model.searchList(resData.items ? resData.items : []);
                            viewModel.model.searchTotal(resData.total);
                            viewModel.model.isResult(true);
                        } else {
                            if (viewModel.model.searchList().length == resData.total) return;
                            $.each(resData.items ? resData.items : [], function (index, item) {
                                viewModel.model.searchList.push(item);//是否需要滑动到某个位置
                            })
                        }
                    }

                }
            });
        },
        /*获取全部问题*/
        getAllQuestion: function (searchFlag, slideFlag) {
            var allParams = {
                target_id: resourceUuid,
                type: 3,//最新提问(要咨询一下为什么不是1--查询该目标下全部问题)
                page_no: searchFlag ? viewModel.model.searchFilter.page() : viewModel.model.allFilter.page(),
                page_size: viewModel.model.allFilter.size(),
                content: searchFlag ? viewModel.model.searchContent() : ''
            };
            store.getQuestion(allParams).done(function (resData) {
                if (resData && resData.items) {
                    if (!searchFlag) {
                        if (!slideFlag) {
                            viewModel.model.allQuestionList(resData.items);
                            viewModel.model.allTotal(resData.total);
                        } else {
                            if (viewModel.model.allQuestionList().length == resData.total) return;
                            $.each(resData.items, function (index, item) {
                                viewModel.model.allQuestionList.push(item);//是否需要滑动到某个位置
                            })
                        }
                    } else {
                        if (!slideFlag) {
                            viewModel.model.searchList(resData.items);
                            viewModel.model.searchTotal(resData.total);
                            viewModel.model.isResult(true);
                        } else {
                            if (viewModel.model.searchList().length == resData.total) return;
                            $.each(resData.items, function (index, item) {
                                viewModel.model.searchList.push(item);//是否需要滑动到某个位置
                            })
                        }
                    }
                }
            });
        },
        /*搜索问题，是从那里面搜索，type??*/
        searchQuestion: function () {
            var type = viewModel.model.quizType();
            if (!viewModel.model.searchContent()) {
                return;
            }
            viewModel.model.searchFilter.page(0);
            if (type == '1') {
                viewModel.getMyQuestion(true);
            } else {
                viewModel.getAllQuestion(true);
            }
        },
        keySearch: function (event) {
            if (event.keyCode == 13) {
                viewModel.searchQuestion();
            }
        },
        /*从搜索页面返回*/
        backFromSearch: function () {
            viewModel.model.isResult(false);
            viewModel.model.searchContent('');
            if (viewModel.model.quizType() == '1') {
                $('.tabs-container').children().first().addClass('active').siblings().removeClass('active');
            } else {
                $('.tabs-container').children().first().removeClass('active').siblings().addClass('active');
            }
        },
        deleteQuestion: function () {
            if (viewModel.model.quizType() == '1') {
                viewModel.getMyQuestion();
            } else {
                viewModel.getAllQuestion();
            }
        },
        showDetail: function (data) {
            viewModel.model.questionTitle(data.title);
            viewModel.model.questionDes(data.content);
            viewModel.model.targetName(data.target_name);
            viewModel.model.detailTotal(data.answer_count);
            viewModel.model.detailUserInfo(data.display_user.display_name + ' ' + data.create_time.split('.')[0].replace(/T/, ' '));
            viewModel.model.questionId(data.id);
            viewModel.model.options.showAcceptBtn = userId == data.display_user.user_id && !data.accepted_answer_id;
            viewModel.getAnswers();
            viewModel.slideDetail();
        },
        getAnswers: function (slideFlag) {
            var questionParams = {
                question_id: viewModel.model.questionId(),
                page_no: viewModel.model.questionFilter.page(),
                page_size: viewModel.model.questionFilter.size()
            };
            store.getAnswers(questionParams).done(function (resData) {
                if (resData && resData.items) {
                    if (!slideFlag) {
                        viewModel.model.detailList(resData.items);
                        viewModel.model.detailTotal(resData.total);
                    } else {
                        if (viewModel.model.detailList().length == viewModel.model.detailTotal()) return;
                        $.each(resData.items, function (index, item) {
                            viewModel.model.detailList.push(item);//是否需要滑动到某个位置
                        })
                    }
                }
            }).always(function () {
                viewModel.model.isDetail(true);
            });
        },
        backFromDetail: function () {
            viewModel.model.isDetail(false);
            viewModel.model.questionFilter.page(0);
            var type = viewModel.model.quizType();
            if (type == '2') {
                viewModel.model.allFilter.page(0);
                viewModel.getAllQuestion();
            } else {
                viewModel.model.myFilter.page(0);
                viewModel.getMyQuestion();
            }
        },
        /*问题详情页回答问题*/
        answerQuestion: function () {
            var answerParams = {
                content: viewModel.model.answerContent(),
                question_id: viewModel.model.questionId(),
                title: ''
            };
            store.createAnswer(answerParams).done(function (resData) {
                viewModel.model.answerContent('');
                viewModel.getAnswers();
            })
        },
        /*获取某个问题的回答*/
        getSomeQuestion: function () {
            viewModel.model.questionFilter.page(0);
            viewModel.model.options.showAcceptBtn = false;
            viewModel.getAnswers();
        }
    };
    exports.viewModel = viewModel;
});
