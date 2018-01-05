(function ($, window) {
    /*题型*/
    var questionType = {
        10: '基础平台单选题',
        15: '基础平台多选题',
        18: '基础平台不定项选择题',
        20: '基础平台填空题',
        25: '基础平台主观题',
        30: '基础平台判断题',
        40: '基础平台连线题',
        50: '基础平台套题',
        201: '单选题',
        202: '多选题',
        203: '判断题',
        204: '排序题',
        205: '连线题',
        206: '问答题',
        207: '拼图题',
        208: '复合题',
        209: '填空题',
        210: '手写题',
        211: '作文题',
        212: '所见即所得填空题',
        213: '阅读题',
        214: '实验与探究题',
        215: '分类表格题',
        216: '多空填空题',
        217: '文本选择题',
        218: '综合学习题',
        219: '应用题',
        220: '计算题',
        221: '解答题',
        222: '阅读理解',
        223: '证明题',
        224: '推断题',
        225: '投票题',
        226: '基础应用题',
        227: '基础证明题',
        228: '基础计算题',
        229: '基础解答题',
        230: '基础阅读题',
        231: '基础阅读与理解题',
        232: '主观基础题',
        233: '主观指令题型',
        234: 'NewCompositeQuestion',
        401: '连连看',
        402: '排序题',
        403: '表格题',
        404: 'H5游戏',
        405: 'Native游戏',
        406: '字谜游戏题',
        407: '记忆卡片题',
        408: '竖式计算题',
        409: '比大小题',
        410: '猜词题',
        411: '魔方盒题型',
        412: '有理数乘法法则',
        413: '书写化学反应方程式',
        414: '文本选择',
        415: '分类题型',
        416: '分式加减',
        417: '标签题型',
        418: '点连线',
        419: '逻辑题型',
        420: 'bingo游戏',
        421: '选词填空',
        422: '数独',
        423: '连环填空题',
        424: '图片标签题',
        425: '划词标记',
        426: '概率卡牌',
        427: '摸球工具',
        428: '单词语音评测',
        429: '天平工具',
        430: '植树',
        431: '模拟时钟',
        432: '方块塔',
        433: '英文句子发音评测',
        434: '英语句子发音评测',
        435: '切割图形',
        436: '基础应用题',
        437: '基础证明题',
        438: '基础计算题',
        439: '基础解答题',
        440: '基础阅读题',
        441: '基础阅读与理解题',
        442: '拼图工具',
        443: '英语篇章发音评测',
        444: '算盘',
        445: '手写题',
        446: '漫画对白题',
        447: '数轴题',
        448: '计数器',
        449: '组词题',
        450: '标点题',
        451: '连字拼诗题',
        452: '区间题',
        453: '思维导图',
        454: '立体展开还原',
        455: '汉字听写题'
    };

    var defaultImage = staticUrl + '/auxo/front/wrongquestion/img/default.jpg';

    var nodeType = {
        TMATERIAL: 'teaching_material',
        CHAPTER: 'chapter',
        CLOUD_COURSE: 'cloud_course',
        CLOUD_CHAPTER: 'cloud_chapter',
        COURSE: 'course',
        KNOWLDGE: 'knowledge_points',
        NDR_COURSE: 'ndr_course',
        CATALOGUE: 'catalogue',
        LESSON: 'lesson'
    }
    var store = {
        //获取错题数据
        getWrongQuestions: function (filter) {
            var sort_params = [];
            for (var i = 0; i < filter.sort_params.length; i++) {
                if (filter.sort_params[i].active) {
                    sort_params.push(filter.sort_params[i])
                }
            }

            filter.sort_params = sort_params;

            $.cookie('wrong_question_filter', JSON.stringify(filter));
            return $.ajax({
                url: selfUrl + '/v1/wrong_questions/search',
                type: 'POST',
                dataType: 'JSON',
                data: JSON.stringify(filter)
            })
        },
        //获取错题统计
        getErrorStatistics: function (data) {
            return $.ajax({
                url: wrongQuestionGatewayUrl + '/v1/wrong_questions/stat/user_tags?user_tag_type=wrong_reason',//开发环境（暂时）
                dataType: "json",
                data: JSON.stringify(data),
                type: 'POST'
            })
        },
        buildSimilarAnswer: function (questionTags, questionType) {
            var data = {
                user_id: userId,
                title: '类似题练习',
                count: 10,
                question_tags: questionTags
            };

            if (questionType)
                data.question_type = questionType;

            return $.ajax({
                url: selfUrl + '/v1/user_exam_sessions/actions/similar',
                type: 'POST',
                data: JSON.stringify(data)
            });
        },
        buildWrongAnswer: function (questionTags) {
            var data = {
                user_id: userId,
                title: '错题重做',
                count: 10,
                question_tags: questionTags
            };

            return $.ajax({
                url: selfUrl + '/v1/user_exam_sessions/actions/wrong_redo',
                type: 'POST',
                data: JSON.stringify(data)
            });
        }
    };
    var timerId = 0;

    var viewModel = {
        model: {
            filter: {                   //filter：用于搜索错题列表数据
                user_id: userId,        //用户id
                question_tags: [],      //题目标签：作业（homework）、学科（subject）、教材（teaching_material）、章节（chapter）、课程（course）、基础平台章节（cloud_chapter）、练习（exercise）、题型（question_type）、错因（wrong_reason）、是否已掌握（is_mastered）、是否标记重点（is_mark_key）
                sort_params: [          //排序参数
                    {
                        "sort_property": 'update_time',
                        "sort_direction": 'desc',
                        "active": true
                    },
                    {
                        "sort_property": 'wrong_times',
                        "sort_direction": 'desc',
                        "active": false
                    }
                ],
                page_no: 0,
                page_size: 15
            },
            type: component == 'homework' ? 'tmaterial' : 'course',  // course 或者 tmaterial
            multiSelectId: '',           //可能是教材Id 可能是课程Id
            needMultiSelectId: courseId || showTags=='true'&&showCourseTags=='true'&&showChapters=='true',
            chosenSubject: subject,          //学科名称
            items: [],
            total: 0,
            questionType: questionType,
            errorList: [],//错题统计列表
            errorQuestionTotal: 0,
            maxItem: null,
            errorShow: false,
            pop: {
                title: '',
                show: false,
                html: ''
            },
            loading: ko.observable(false),
            firstTimeLoad: ko.observable(true),
            courseId: courseId,
            showTags: ko.observable(showTags=='true'),
            showChapters: ko.observable(showChapters=='true'),
            showCourseTags: ko.observable(showCourseTags=='true'),
            showQuestionTypes: ko.observable(showQuestionTypes=='true')
        },
        init: function () {
            // this._initFilter(); // 当指定课程id或者学科名称时，以filter中数据为准
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(this);
        },
        _initFilter: function () {
            var _self = this;
            this.model.chosenSubject = null;
            this.model.courseId = null;
            var filter_cookie = $.cookie('wrong_question_filter');
            if(filter_cookie) {
                var filter = JSON.parse(decodeURIComponent(filter_cookie));
                this.model.filter = filter;
                var questionTags = filter.question_tags;
                $.each(questionTags, function (index, item) {
                    if (item.type == nodeType.TMATERIAL || item.type == nodeType.COURSE) {
                        _self.model.multiSelectId = item.value;
                        return false;
                    }
                })
            }
        },
        isExistRequirParams: function (filter) {
            var keys = $.map(filter.question_tags, function (v) {
                return v.type;
            });
            return ($.inArray('teaching_material', keys) != -1 ) || ($.inArray('course', keys) != -1 );
        },
        buildRequireParams: function (filter) {
            if (component == 'course')
                filter.question_tags.push({"type": "course", "value": null});
            else
                filter.question_tags.push({"type": "teaching_material", "value": null});
        },
        removeTag: function(filter, tag) {
            var _index = -1;
            $.each(filter.question_tags, function (index, item) {
                if (item.type == tag) {
                    _index = index;
                }
            })
            filter.question_tags.splice(_index, 1);
        },
        list: function () {
            if (this.model.firstTimeLoad()) {
                this.model.firstTimeLoad(false);
            } else {
                this.model.filter.page_no(0);
            }
            this.search();
        },
        search: function () {
            var t = this;
            t.model.loading(true);
            this._dealFilters();
            var filter = ko.mapping.toJS(t.model.filter);
            // if (!t.isExistRequirParams(filter)) {
            //     t.buildRequireParams(filter);
            // }
            t.model.errorShow(false);
            store.getWrongQuestions(filter).done(function (d) {
                t.model.loading(false);
                $.each(d.items, function (i, v) {
                    v.question_preview_url = v.question_preview_url ? v.question_preview_url + '&size=320' : '';
                    v.returnUrl = encodeURIComponent(window.location.href);
                    v._index = filter.page_no * filter.page_size + i;
                });
                t.model.items(d.items);
                t.model.total(d.total);
                t._page(d.total, t.model.filter.page_no());
                t._initQuestion();
            });
        },
        _dealFilters: function () {
            var filter = ko.mapping.toJS(this.model.filter);
            if (!this.model.showTags()) {
                filter.question_tags = [];
                this.model.filter = ko.mapping.fromJS(filter);
            } else {
                if (!this.model.showCourseTags() && !courseId) {
                    this.removeTag(filter, 'course');
                }
            }
            this.model.filter = ko.mapping.fromJS(filter);
        },
        _page: function (totalCount, currentPage) {
            var _this = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: _this.model.filter.page_size(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: false,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: "common.addins.pagination.prev",
                next_text: "common.addins.pagination.next",
                callback: function (page_id) {
                    if (page_id != currentPage) {
                        _this.model.filter.page_no(page_id);
                        _this.search();
                    }
                }
            });
        },
        treeCallBack: function (data) {
            var t = this;
            var filter = ko.mapping.toJS(t.model.filter);
            var arr = [];
            for (var i = 0; i < filter.question_tags.length; i++) {
                var type = filter.question_tags[i].type
                var condition = this.model.type() == 'tmaterial' ?
                    ((type != nodeType.TMATERIAL || data.type != nodeType.TMATERIAL) && type != nodeType.CHAPTER) :
                    (type != nodeType.CLOUD_COURSE && type != nodeType.CLOUD_CHAPTER && type != nodeType.KNOWLDGE && type != nodeType.NDR_COURSE && type != nodeType.CATALOGUE && type != nodeType.LESSON)
                if (condition) {
                    arr.push(filter.question_tags[i])
                }
            }
            arr.push({
                type: data.type,
                value: data.id
            })
            filter.question_tags = arr
            t.model.filter = ko.mapping.fromJS(filter)

            t.list();
        },
        sortCallBack: function (mode, sort_params) {
            var t = this;
            switch (mode) {
                case 1:
                    //排序
                    t.model.filter.sort_params = ko.mapping.fromJS(sort_params);
                    this.list();
                    break;
                case 4:
                    //类试题练习
                    this.answerSimilar();
                    break;
                case 8:
                    //错题重练
                    this.answerWrong();
                    break;
                case 16:
                    //错题统计
                    this.showErrorStatistics();
                    break;
            }
        },
        answerSimilarByQuestionType: function (d) {
            var filter = ko.mapping.toJS(this.model.filter);
            // var noCourseTag = !this.model.showTags() || !this.model.showCourseTags() //判断是否在请求filter中添加course_id
            // if (!this.isExistRequirParams(filter) && !noCourseTag) {
            //     this.showTip('不存在学科或者课程');
            //     return;
            // }

            var qt = this.getAnswerQuestionTags(),
                qtype = d.question_type,
                t = this;
            t.model.pop.title('类试题练习');
            t.model.pop.show(true);
            t.showLoading();
            store.buildSimilarAnswer(qt, qtype).then(function (data) {
                t.openAnswerPop(data, 4);
            }, function (data) {
                t.forceClosePop();
                t.showTip(JSON.parse(data.responseText).message);
            });
        },
        answerSimilar: function () {
            var filter = ko.mapping.toJS(this.model.filter);
            // var noCourseTag = !this.model.showTags() || !this.model.showCourseTags() //判断是否在请求filter中添加course_id
            // if (!this.isExistRequirParams(filter) && !noCourseTag) {
            //     this.showTip('不存在学科或者课程');
            //     return;
            // }

            var qt = this.getAnswerQuestionTags(),
                t = this;
            t.model.pop.title('类试题练习');
            t.model.pop.show(true);
            t.showLoading();
            store.buildSimilarAnswer(qt).then(function (data) {
                t.openAnswerPop(data, 4);
            }, function (data) {
                t.forceClosePop();
                t.showTip(JSON.parse(data.responseText).message);
            });
        },
        answerWrong: function () {
            var filter = ko.mapping.toJS(this.model.filter);
            // var noCourseTag = !this.model.showTags() || !this.model.showCourseTags() //判断是否在请求filter中添加course_id
            // if (!this.isExistRequirParams(filter) && !noCourseTag) {
            //     this.showTip('不存在学科或者课程');
            //     return;
            // }

            var qt = this.getAnswerQuestionTags(),
                t = this;
            t.model.pop.title('错题重做');
            t.model.pop.show(true);
            t.showLoading();
            store.buildWrongAnswer(qt).then(function (data) {
                t.openAnswerPop(data, 8);
            }, function (data) {
                t.forceClosePop();
                t.showTip(JSON.parse(data.responseText).message);
            });
        },
        getAnswerQuestionTags: function () {
            var questionTags = ko.mapping.toJS(this.model.filter.question_tags()),
                type = component == 'course' ? 'course' : 'teaching_material';

            for (var i = 0; i < questionTags.length; i++) {
                var q = questionTags[i];
                if (q.type == type)
                    return q;
            }
        },
        showTip: function (message) {
            $('#js_tip').html(message);
            $('#js_tip').show();
            window.clearTimeout(timerId);
            timerId = window.setTimeout(function () {
                $('#js_tip').hide();
                $('#js_tip').html('');
            }, 1000);
        },
        openAnswerPop: function (data, type) {
            var url =  selfUrl + '/' + projectCode + '/wrong_question/answer?sessionId=' + data.id + '&type=' + type;
            this.model.pop.html('<iframe name="iframe_' + Math.random() + '" width="100%;" height="100%;" src="' + url + '" frameborder="0"></iframe>');
        },
        showLoading: function () {
            this.model.pop.html('<div class="loading">正在加载数据...</div>');
        },
        closePop: function () {
            if (window.bussiness) {
                window.bussiness.end();
            } else {
                this.model.pop.show(false);
                this.model.pop.title('');
                this.model.pop.html('');
            }
        },
        forceClosePop: function () {
            this.model.pop.show(false);
            this.model.pop.title('');
            this.model.pop.html('');
        },
        //标签选择回调
        tagCallBack: function (data) {
            var self = this, tagArr = [];
            var val = ko.mapping.toJS(data);
            var filter = ko.mapping.toJS(self.model.filter);
            for (var key in val) {
                if (val[key].type) {
                    tagArr.push(val[key]);
                }
            }
            var chapter = '';
            var teaching_material, course;
            $.each(filter.question_tags, function (index, item) {
                if (item.type == nodeType.CHAPTER || item.type == nodeType.CLOUD_CHAPTER || item.type == nodeType.CLOUD_COURSE || item.type == nodeType.NDR_COURSE || item.type == nodeType.CATALOGUE || item.type == nodeType.LESSON || item.type == nodeType.KNOWLDGE) {
                    chapter = item;
                }
                if (item.type == nodeType.TMATERIAL) {
                    teaching_material = item.value;
                } else if (item.type == nodeType.COURSE) {
                    course = item.value;
                }
            })
            if (chapter) {
                var needChapter = false;
                $.each(tagArr, function (index, item) {
                    if ((item.type == nodeType.TMATERIAL && item.value == teaching_material) ||
                        (item.type == nodeType.COURSE && item.value == course)) {
                        needChapter = true;
                        return false;
                    }
                })
                if (needChapter) {
                    tagArr.push(chapter);
                }
            }
            filter.question_tags = tagArr;
            self.model.filter = ko.mapping.fromJS(filter);
            self.list();
        },
        //显示错题统计饼图
        showErrorStatistics: function () {
            var filter = ko.mapping.toJS(this.model.filter);
            // var noCourseTag = !this.model.showTags() || !this.model.showCourseTags() //判断是否在请求filter中添加course_id
            // if (!this.isExistRequirParams(filter) && !noCourseTag) {
            //     this.showTip('不存在学科或者课程');
            //     return;
            // }

            var self = this;
            var params = {
                "user_id": userId,
                "is_mastered": false,
                "is_mark_key": null,
                "question_types": [],
                "user_tags": [],//选择全部默认不传吗？
                "question_tags": []
            };
            var questionTag = ko.mapping.toJS(this.model.filter.question_tags);
            $.each(questionTag, function (index, item) {
                switch (item.type) {
                    case 'wrong_reason':
                        params.user_tags.push(item);
                        break;
                    case 'question_type':
                        params.question_types.push(+item.value);
                        break;
                    case 'is_mastered':
                        params.is_mastered = item.value;
                        break;
                    case 'is_mark_key':
                        params.is_mark_key = item.value;
                        break;
                    default:
                        params.question_tags.push(item);
                }
            });
            store.getErrorStatistics(params).done(function (resData) {
                var questionTotal = self.model.total(), filterQuestion = [];
                if (resData && resData.length) {
                    /*去除number为0的item*/
                    $.each(resData, function (index, item) {
                        if (item.number > 0) {
                            filterQuestion.push(item);
                        }
                    });
                    // $.each(filterQuestion, function (index, item) {
                    //     questionTotal += item.number;
                    // });
                    if (questionTotal) {
                        self.model.errorQuestionTotal(questionTotal);
                        var maxIndex = self.calculateMax(filterQuestion)
                        $.each(filterQuestion, function (index, item) {
                            item.number = self.formatProportion(item.number, questionTotal);
                        });
                        self.model.maxItem(filterQuestion[maxIndex]);
                        self.model.errorList(filterQuestion);
                    }
                } else {
                    self.model.errorQuestionTotal(0);
                    self.model.maxItem(null);
                    self.model.errorList([]);
                }
                self.model.errorShow(true);
            });
        },
        /*转换百分数*/
        formatProportion: function (number, total) {
            if (isNaN(number) || isNaN(total)) {
                return "-";
            }
            return total <= 0 ? "0%" : (Math.round(number / total * 10000) / 100.00 + "%");
        },
        /*计算最大值*/
        calculateMax: function (params) {
            var maxNumber = 0, maxIndex = 0;//用于存储最大值所在的对象
            $.each(params, function (index, item) {
                if (item.number > maxNumber) {
                    maxNumber = item.number;
                    maxIndex = index;
                }
            });
            return maxIndex;
        },
        /*切换错题统计*/
        toggleError: function () {
            this.model.errorShow(false);
        },
        _initQuestion: function () {
            var self = this;
            $.each(self.model.items(), function (index, item) {
                if(!item.question_preview_url) {
                    self._loadPlayer(item);
                }
            })
        },
        _loadPlayer: function (data) {
            var self = this;
            data.qtiplayer = QtiPlayer.createPlayer({
                'swfHost': staticUrl + 'auxo/addins/flowplayer/v1.0.0/',
                'unifyTextEntry': true,
                'refPath': ref_path
            });
            data.qtiplayer.on('error', function (ex) {
                self.showQtiError(data, ex)
            });
            data.qtiplayer.load(data.question_content, function () {
                var renderOption = {
                    'skin': 'elearning',
                    'showQuestionName': true,
                    'showLock': true,
                    'showHint': false,
                    'showSubSequence': true
                };

                data.qtiplayer.render('qti-' + data.question_id, renderOption, function () {
                    // self.showExtras(data);
                });
            });
        },
        showQtiError: function (item, error) {
            $('#qti-' + item.identifier).html('<div class="error-question"><strong style="color: #ff0000;font-size: 20px;margin-right: 20px;">' + i18nHelper.getKeyValue('questionbank.detail.qtiText1') + '</strong><a href="javascript:;" class="btn btn-danger" onclick="$(\'#qti-error-' + item.identifier + '\').toggleClass(\'hide\')">' + i18nHelper.getKeyValue('questionbank.detail.qitText2') + '</a><div class="error-question-body"><textarea class="hide" id="qti-error-' + item.identifier + '" style="width: 400px;height: 200px;">' + JSON.stringify(item.questionItem) + '</textarea></div></div>');
        },
    };

    $(function () {
        (function () {
            window.iframeResizePostMessage = function (name) {
                if (window.parent) {
                    var height = document.body.scrollHeight || document.documentElement.scrollHeight;
                    var width = document.body.scrollWidth || document.documentElement.scrollWidth;
                    window.parent.postMessage(JSON.stringify({ 'type': 'iframe-resize', name: name || '', height: height, width: width }), '*'); // name各业务组件自己定义
                }
            }
        })();
        setInterval(function () {
            window.iframeResizePostMessage && iframeResizePostMessage('wrongquestion');
        }, 200);

        var first = true;

        function adjustPopPosition(ret) {
            var data = JSON.parse(ret.data);
            if (data.type === 'setScrollTop' && first) {
                first = false;
                $('html').css('overflow-y', 'hidden');
            }
        }

        if (window.addEventListener) {                    //所有主流浏览器，除了 IE 8 及更早 IE版本
            window.addEventListener("message", adjustPopPosition, false);
        } else if (window.attachEvent) {                  // IE 8 及更早 IE 版本
            window.attachEvent('onmessage', adjustPopPosition);
        }

        viewModel.init();

        var conWidth = $('.error-con').width();
        // var itemWidth = $('.error-exercises').outerWidth(true);
        var itemWidth = 285;
        var paddingWidth = (conWidth % itemWidth) / 2;
        $('.error-con-bd').css({
            'padding-left': paddingWidth + 'px',
            'padding-right': paddingWidth + 'px'
        })

    });

})(jQuery, window);