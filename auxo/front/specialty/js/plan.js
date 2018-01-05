/**
 * @file: Javascript文件描述
 * @author: Administrator
 * @history: 2016/10/12
 */

(function () {
    
        var GLOBAL = (0, eval)('this');
    
        var PROJECT_CODE = GLOBAL['projectCode'];
    
        var PROJECT_ID = GLOBAL['projectId'];
    
        var NODE_ID = GLOBAL['nodeId'];
    
        var SPECIAL_PLAN_ID = GLOBAL['specialtyPlanId'];
    
        var IS_LOGIN = GLOBAL['isLogin'];
    
        var SELECTED_YEAR = GLOBAL['selectedYear'];
    
        var service = {
            /**
             * 获取单个培养计划
             * @param data
             * @returns {*}
             */
            getSpecialtyPlan: function (data) {
                return $.ajax({
                    url: selfUrl + '/' + PROJECT_CODE + '/specialty/plan',
                    cache: false,
                    type: 'GET',
                    dataType: 'json',
                    data: data
                });
            },
            /**
             * 报名培养计划
             * @param specialtyPlanId
             * @returns {*}
             */
            enrollSpecialtyPlan: function (specialtyPlanId) {
                return $.ajax({
                    url:selfUrl +  '/' + PROJECT_CODE + '/specialty/plan/' + specialtyPlanId + '/enroll',
                    type: 'POST'
                });
            },
            /**
             * 取培养计划学友
             * @param specialtyPlanId
             * @param data
             * @returns {jQuery.Deferred}
             */
            getTrainees: function (specialtyPlanId, data) {
                return $.ajax({
                    url: selfUrl + '/' + PROJECT_CODE + '/specialty/plan/' + specialtyPlanId + '/trainees',
                    cache: false,
                    type: 'GET',
                    dataType: 'json',
                    data: data
                });
            },
            /**
             * 查询培养计划下的课程
             * @param specialtyPlanId
             * @param data
             */
            getCourses: function (specialtyPlanId, data) {
                return $.ajax({
                    url: selfUrl + '/' + PROJECT_CODE + '/specialty/plans/' + specialtyPlanId + '/learning_units/search',
                    cache: false,
                    type: 'GET',
                    dataType: 'json',
                    data: data
                });
            },
            /**
             * 查询最后一次学习的课程ID
             * @param specialtyPlanId
             * @returns {*}
             */
            lastStudyCourse: function (specialtyPlanId) {
                return $.ajax({
                    url: selfUrl + '/' + PROJECT_CODE + '/specialty/plans/' + specialtyPlanId + '/last_study_course',
                    cache: false,
                    type: 'GET'
                });
            },
            /**
             * 自动报名
             * @param specialtyPlanId
             * @returns {*}
             */
            autoEnroll: function (specialtyPlanId) {
                return $.ajax({
                    url: selfUrl + '/' + PROJECT_CODE + '/specialty/plan/' + specialtyPlanId + '/auto_enroll',
                    type: 'POST'
                });
            }
        };
    
        var store = {
            entity: {
                /**
                 * 用户培养计划
                 * @constructor
                 */
                UserSpecialtyPlan: function () {
                    this.enroll = ko.observable({});
                    this.specialty_plan_id = ''; // 培养计划ID
                    this.start_year = 0; // 开始年份
                    this.start_season = ''; // 开始季节
                    this.node_id = ''; // 院系/专业的节点ID
                    this.pass_score = 0; // 通过需要学分
                    this.student_count = 0; // 参与学生数
                    this.user_id = ''; // 用户ID
                    this.have_enrolled = false; // 是否已报名
                    this.course_count = 0; // 课程数
                    this.passed_course_count = 0; // 通过课程数量
                    this.user_score = 0; // 用户已获得的学分
                    this.appraise_stat_info = {
                        avg_star: 0 // 星级平均评分
                    };
                    this.terms = []; // 学期信息
    
                    this.cover = '';
                    this.cover_url = ''; // 封面地址
                    this.exam_count = 0; // 测评数
                    this.passed_exam_count = 0; // 通过的测评数
                    this.title = ''; // 标题
                    this.type = 1; // 类型
                    this.cover = ''; // 封面
                    this.description = ''; // 简介（富文本）
                    this.user_required_score = 0; //用户已获得的必修学分
                    this.user_optional_score = 0; //用户已获得的选修修学分
                    this.pass_required_score = 0; //必修达标学分
                    this.pass_optional_score = 0; //选修达标学分
                    this.is_map_enabled = false; //是否启用学习地图
                }
            },
            ko: {
                /**
                 * 是否ko对象
                 * @param o
                 * @returns {*}
                 */
                isKo: function (o) {
                    return ko.isObservable(o);
                },
                /**
                 * 是否ko数组
                 * @param o
                 * @returns {*|boolean}
                 */
                isKoArray: function (o) {
                    return this.isKo(o) && $.isArray(o.peek());
                },
                /**
                 * 将data中的值赋给model，{data中没有对应值的则清空}
                 * @param model ko对象
                 * @param data js对象
                 * @param isClear 是否清空data中没有对应值的属性
                 * @returns {*}
                 */
                fromJS: function (model, data) {
                    if (!model || !data) {
                        return model;
                    }
                    var isClear = $.type(arguments[2]) === "boolean" ? arguments[2] : true,
                        that = this;
                    $.each(model, function (name, observableObj) {
                        var v = data[name];
                        if (that.isKo(observableObj)) {
                            if (that.isKoArray(observableObj)) {
                                if (!$.isArray(v)) {
                                    v = v ? (v + "").split(",") : (isClear ? [] : observableObj.peek());
                                }
                            } else if (v == null) {
                                v = isClear ? "" : observableObj.peek();
                            }
                            observableObj(v);
                        } else if (typeof observableObj === "object" && typeof v === "object") {
                            store.ko.fromJS(observableObj, v, isClear);
                        }
                    });
                }
            },
            defer: function (fn, time) {
                setTimeout(function () {
                    fn();
                }, time || 0);
                return this;
            },
            lazyImg: function (selector) {
                $(selector || 'img[data-src]').lazyload({
                    data_attribute: 'src',
                    skip_invisible: false
                }).trigger("appear");
            },
            component: {
                /**
                 * 初始化星级评分组件
                 * @param $star
                 * @param value
                 */
                star: function ($star, value) {
                    $star.each(function () {
                        var $this = $(this),
                            $view = $this.find('.e-star-view'),
                            $value = $this.find('.e-star-value'),
                            wholeValue = 0,
                            binaryValue = 0,
                            starW = 20,
                            starH = 28,
                            clipWidth = 0;
                        if (value == null) {
                            value = +$value.text() || 0;
                        }
                        wholeValue = Math.floor(value);
                        binaryValue = Math.floor(value % 1 * 10);
                        clipWidth = binaryValue * starW / 10;
                        $value.text(value);
                        $view.find('li').empty();
                        $view.find('li:lt(' + (wholeValue + 1) + ')').append('<i class="icon-star light"></i>');
                        $view.find('li').eq(wholeValue).find('.light').css('clip', 'rect(' + ['0px', clipWidth + 'px', starH + 'px', '0px'].join(' ') + ')');
                    });
                },
                /**
                 * 初始化弹出框组件
                 * @param $dialog
                 */
                dialog: function ($dialog) {
                    $dialog.each(function () {
                        var $this = $(this);
                        $this.find('.e-panel-close').on('click', function () {
                            $('body').css({'overflow': 'auto'});
                            $this.fadeOut(300);
                        })
                    });
                },
                /**
                 * 学习进度
                 * @param $circle
                 * @param percent
                 */
                circle: function ($circle, percent) {
                    var diameter = $circle.width(),
                        arc = Math.floor(diameter / 2);
                    $circle.find('canvas').attr('width', diameter).attr('height', diameter);
                    $circle.find('.canvas-text').remove();
                    percent = Math.max(0, Math.min(percent, 100));
    
                    function drawCanvas() {
                        var o = percent.toFixed(0) + '%';
                        var canvas = $circle.find('canvas')[0];
                        if (!canvas)
                            return;
                        var ctx = canvas.getContext('2d');
                        var startAngle = 1.5 * Math.PI;
                        var avg = 1,
                            endAngle;
                        var canvasText = '<div class="canvas-text"><span>' + o + '</span><p>' + i18nHelper.getKeyValue('specialty.plan.completed') + '</p></div>';
                        var skinMap = {
                            'blue': '#38adff',
                            'green': '#3bb800',
                            'red': '#ce3f3f',
                            'white': '#38adff'
                        };
    
                        function drawBackground() {
                            ctx.save();
                            ctx.lineJoin = "round";
                            ctx.lineWidth = 6;
                            ctx.strokeStyle = '#ccc';
                            ctx.beginPath();
                            ctx.arc(arc, arc, arc - 10, 0, 2 * Math.PI);
                            ctx.stroke();
                            ctx.restore();
                        }
    
                        function drawArc() {
                            ctx.save();
                            ctx.lineWidth = 6;
                            ctx.strokeStyle = skinMap[skinStyle];
                            ctx.beginPath();
                            if (typeof endAngle != 'undefined')
                                ctx.arc(arc, arc, arc - 10, startAngle, endAngle);
                            ctx.stroke();
                            ctx.restore();
                        }
    
                        function animate() {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            drawBackground();
                            drawArc();
                            avg += 1;
                            endAngle = startAngle + avg * 360 / 100 * (Math.PI / 180);
                            if (avg <= percent) requestAnimationFrame(animate);
                        }
    
                        // 允许显示0%
                        $circle.append(canvasText);
                        setTimeout(function(){
                          $circle.find('div').css({
                            width:'100%',
                            height: '100%'
                          });
                        }, 200);
                        drawBackground();
                        requestAnimationFrame(animate);
                    }
    
                    $('#circle').css({
                      width:98,
                      height:98
                    });
                    drawCanvas();
                }
            }
        };
    
        var ViewModel = function () {
    
            this.model = {
    
                // 用户培养计划
                specialtyPlan: new store.entity.UserSpecialtyPlan(),
                // 学员评价，互动组件参数
                specialtyPlanId: SPECIAL_PLAN_ID,
                appraiseInfo: {
                    target_id: '',
                    custom_id: '',
                    custom_type: 'auxo-specialty',
                    study_process: IS_LOGIN ? '1' : '0'
                },
                // 排行榜组件参数
                rankSearch: {
                    tag: 'week_all_in',
                    start: 1,
                    rank_id: 'learnHoursTabs',
                    class_id: [PROJECT_ID, 'auxo-specialty', ''].join('-')
                },
                init: {
                    // 课程TAB是否已初始化
                    course: false,
                    // 评价组件是否已初始化
                    appraise: false,
                    // 排行榜组件是否已初始化
                    rank: false
                },
                // 用户是否已登录
                isLogin: IS_LOGIN,
                // 排行榜索引
                rankIndex: 1,
                // TAB索引
                tabIndex: 1,
                // 当前选择的年份
                year: '',
                // 当前选择的学期
                termId: '',
                // 当前选择的学分
                credit: '',
                // ko依赖对象，计算是否需要重新查询课程
                valueToGetCourse: '',
                // 学期，某个培养计划下的全部学期
                termList: [],
                // 学分，固定写死
                creditList: [{
                    value: -1,
                    text: i18nHelper.getKeyValue('specialty.course.allCredit')
                },
                    {
                        value: 1,
                        text: i18nHelper.getKeyValue('specialty.course.lessOneCredit')
                    },
                    {
                        value: 2,
                        text: i18nHelper.getKeyValue('specialty.course.twoCredits')
                    },
                    {
                        value: 3,
                        text: i18nHelper.getKeyValue('specialty.course.threeCredits')
                    }
                ],
                // 必修课程
                compulsoryCourseList: [],
                // 选修课程
                optionalCourseList: [],
                // 课程学友
                traineeList: [],
                hasInitialized: false,
    
                selectedTerm: {
                    id: '',
                    summary: '',
                    term_name: '',
                    points: 0,
                    achieve: '',
                    is_pass: false,
                    pass_required_score: 0,
                    pass_optional_score: 0,
                    user_required_score: 0,
                    user_optional_score: 0
                },
                termListShow: false,
                userRecievePercentage: '0%',
                courseMapDialogShow: false,
                percent: '50%',
                resource_count: 0
            };
        };
    
        ViewModel.prototype = {
            constructor: ViewModel,
    
            initViewModel: function (element) {
                var that = this;
                this.model = ko.mapping.fromJS(this.model);
    
                // 年级/课程TAB/学期/学分
                this.model.valueToGetCourse = ko.computed(function () {
                    return this.model.specialtyPlan.specialty_plan_id() +
                        '-' + this.model.init.course() +
                        '-' + this.model.termId() +
                        '-' + this.model.credit();
                }, this);
    
                this.model.userRecievePercentage = ko.computed(function () {
                    if (this.model.specialtyPlan.pass_score() > 0) {
                        return this.percentage(this.model.specialtyPlan.user_score() / this.model.specialtyPlan.pass_score())
                    } else {
                        return '0%';
                    }
                }, this);
    
                this.model.resource_count = ko.computed(function () {
                    return this.model.specialtyPlan.course_count() + this.model.specialtyPlan.exam_count()
                }, this);
    
                ko.applyBindings(this, element);
    
                this.initData();
            },
            formatUnitType: function (type) {
                if (type == 'plan_exam')
                    return i18nHelper.getKeyValue('specialty.course.exam');
                else  return i18nHelper.getKeyValue('specialty.course.course');
            },
            /**
             * 初始化数据
             */
            initData: function () {
                var that = this;
    
                // 初始化学分下拉框
                $('#creditSelect').eSelect({
                    delay: 0
                });
    
                // 初始化学期下拉框
                $('#termSelect').eSelect({
                    delay: 0
                });
    
                // 初始化年级选择，年级填充前后各10年
                // 年级变更重新查询培养计划
                (function () {
                    var $gradeSelect = $('#gradeSelect');
    
                    that.model.year.subscribe(function () {
                        that.getSpecialtyPlan();
                    });
    
                    !SPECIAL_PLAN_ID && $gradeSelect.eSelect({
                        initValue: SELECTED_YEAR
                    });
    
                }());
    
                // 绑定课程查询
                (function () {
                    store.defer(function () {
                        that.model.valueToGetCourse.extend({
                            rateLimit: 100
                        });
                        that.model.valueToGetCourse.subscribe(function () {
                            // 只有当前TAB是课程时才激活查询课程
                            if (that.model.init.course()) {
                                that.getCourses();
                            }
                        });
                    });
                }());
            },
            /**
             * 查询培养计划
             */
            getSpecialtyPlan: function () {
                var data = {
                        node_id: NODE_ID,
                        start_year: ko.unwrap(this.model.year),
                        specialty_plan_id: SPECIAL_PLAN_ID
                    },
                    that = this;
    
                service.getSpecialtyPlan(data).then(function (data) {
                    data.cover_url=data.cover_url?data.cover_url:staticUrl+'auxo/front/specialty/images/course.png';
                    store.ko.fromJS(that.model.specialtyPlan, data, true);
                    that.model.appraiseInfo.target_id(data.specialty_plan_id);
                    that.model.appraiseInfo.custom_id(data.specialty_plan_id);
                    that.model.rankSearch.class_id([PROJECT_ID, 'auxo-specialty', data.specialty_plan_id].join('-'));
    
                    // TAB切换回课程介绍
                    that.model.tabIndex(1);
                    // 排行切回同学
                    that.model.rankIndex(1);
                    // 重置初始化状态
                    that.model.init.course(false);
                    that.model.init.appraise(false);
                    that.model.init.rank(false);
    
                    // 设置星级
                    store.component.star($('#specialtyPlanStar'), data.appraise_stat_info.avg_star || 0);
    
                    // 设置学习进度
                    if (IS_LOGIN && (data.enroll && data.enroll.enroll_type == 0 || data.have_enrolled)) {
                        store.defer(function () {
                            setTimeout(function () {
                                store.component.circle($('#circle'), ((data.user_score / data.pass_score) || 0) * 100);
                            }, 1);
                        });
                    }
    
    
                    // 抽出学期
                    var termList = [];
                    $.each(data.terms || [], function (i, v) {
                        termList.push({
                            value: v.id,
                            text: v.term_name
                        })
                    });
                    // 更新学期下拉框的值
                    that.model.termList(termList);
    
                    store.defer(function () {
                        $('#termSelect').trigger('update').eSelect('setValue', '');
                        $('#creditSelect').eSelect('setValue', '');
                    });
    
                    // 取课程学友
                    that.getTraineeList();
    
                    store.defer(function () {
                        that.model.hasInitialized(true);
                    });
    
                });
            },
            /**
             * 查询培养计划下的课程
             */
            getCourses: function () {
                var that = this,
                    specialtyPlanId = ko.unwrap(this.model.specialtyPlan.specialty_plan_id),
                    data = {
                        specialty_plan_id: specialtyPlanId,
                        term_id: ko.unwrap(this.model.termId),
                        is_required: 1,
                        score_range: ko.unwrap(this.model.credit),
                        page: 0,
                        size: 999999
                    };
    
                if (!data.term_id) {
                    delete data.term_id;
                }
                if (!data.score_range) {
                    delete data.score_range;
                }
    
                // 取必修课
                (function () {
                    data.is_required = 1;
                    service.getCourses(specialtyPlanId, data).then(function (data) {
                        that.model.compulsoryCourseList(data.items || []);
    
                        store.defer(function () {
                            store.lazyImg();
                        });
                    });
                }());
    
                // 取选修课
                (function () {
                    data.is_required = 0;
                    service.getCourses(specialtyPlanId, data).then(function (data) {
                        that.model.optionalCourseList(data.items || []);
    
                        store.defer(function () {
                            store.lazyImg();
                        });
                    });
                }());
            },
    
            selectTerm: function (data) {
                var t = this;
                t.model.selectedTerm = ko.mapping.fromJS(data, {}, t.model.selectedTerm);
                t.model.termListShow(false)
                t.getTermMap(data.specialty_plan_id, data.id)
            },
    
            toggleTermList: function () {
                var t = this;
                t.model.termListShow(!t.model.termListShow())
            },
    
            showCourseMapDialog: function () {
                this.model.courseMapDialogShow(true);
                var terms = ko.unwrap(this.model.specialtyPlan.terms);
                if (terms.length > 0) {
                    this.selectTerm(terms[0])
                }
            },
    
            hideCourseMapDialog: function () {
                this.model.courseMapDialogShow(false);
            },
    
    
            getTermMap: (function () {
                var hasLoaded = false;
                return function () {
                    // $('body').css({ 'overflow': 'hidden'});
                    var $atlasIFrame = $('#termMap'),
                        __src = selfUrl + '/' + PROJECT_CODE + '/specialty/plan/' + ko.unwrap(this.model.specialtyPlan.specialty_plan_id) + '/term/' + ko.unwrap(this.model.selectedTerm.id) + '/map';
                    if (!hasLoaded || $atlasIFrame.attr('src') !== __src) {
                        $atlasIFrame.attr('src', __src);
                        hasLoaded = true;
                    }
                    $atlasIFrame.width(0);
                    store.defer(function () {
                        $atlasIFrame.css('width', '100%');
                    });
                }
            }()),
    
            /**
             * 切换TAB
             * @param tabIndex
             */
            switchTab: function (tabIndex) {
                if (tabIndex === 2) {
                    this.model.init.course(true);
                } else if (tabIndex === 3) {
                    this.model.init.appraise(true);
                }
                this.model.tabIndex(tabIndex);
    
                this.hideCourseMapDialog();
            },
            /**
             * 切换排行榜TAB
             * @param rankIndex
             */
            switchRankIndex: function (rankIndex) {
                if (rankIndex === 2) {
                    this.model.init.rank(true);
                }
                this.model.rankIndex(rankIndex);
            },
            percentage: function (data) {
                return (data * 100).toFixed(0) + '%';
            },
            /**
             * 显示图谱
             */
            showAtlasDialog: (function () {
    
                var hasLoaded = false;
                return function () {
                    $('body').css({'overflow': 'hidden'});
                    var $atlasIFrame = $('#atlasIFrame'),
                        $atlasDialog = $('#atlasDialog'),
                        __src = selfUrl + '/' + PROJECT_CODE + '/specialty/atlas/' + ko.unwrap(this.model.specialtyPlan.specialty_plan_id);
                    if (!hasLoaded || $atlasIFrame.attr('src') !== __src) {
                        $atlasIFrame.attr('src', __src);
                        hasLoaded = true;
                    }
                    $atlasIFrame.width(0);
                    store.defer(function () {
                        $atlasIFrame.css('width', '100%');
                    });
                    $atlasDialog.fadeIn(300);
                }
            }()),
            /**
             * 报名
             */
            enroll: function () {
                var that = this;
                if (IS_LOGIN) {
                    service.enrollSpecialtyPlan(ko.unwrap(this.model.specialtyPlan.specialty_plan_id)).then(function () {
                        that.model.specialtyPlan.have_enrolled(true);
                        store.defer(function () {
                            store.component.circle($('#circle'), 0);
                            that.getTraineeList();
                        });
                    });
                } else {
                    location.assign(selfUrl + '/' + PROJECT_CODE + '/account/login?returnurl=' + window.encodeURIComponent(location.href));
                }
            },
            /**
             * 查询课程学友
             */
            getTraineeList: function () {
                var that = this,
                    specialtyPlanId = ko.unwrap(this.model.specialtyPlan.specialty_plan_id),
                    data = {
                        page: 0,
                        size: 15
                    };
                service.getTrainees(specialtyPlanId, data).then(function (data) {
                    that.model.traineeList(data.items);
                    store.defer(function () {
                        store.lazyImg();
                    });
                });
            },
            /**
             * 跳转课程
             * TODO
             *  是否需要添加报名判断
             * @param item
             */
            goToCourse: function (item) {
                if (IS_LOGIN) {
                    //todo 无需报名
                    if (!this.model.specialtyPlan.have_enrolled() && this.model.specialtyPlan.enroll().enroll_type == 0) {
                        service.autoEnroll(ko.unwrap(this.model.specialtyPlan.specialty_plan_id))
                            .done(function (d) {
                                if (item.unit_type == "plan_exam")
                                    location.assign(webFrontUrl + '/' + PROJECT_CODE + '/exam/prepare/' + item.unit_id);
                                else
                                    location.assign((typeof auxoCourseWebfrontUrl == 'undefined' ? '' : auxoCourseWebfrontUrl) + '/' + PROJECT_CODE + '/course/' + item.unit_id);
                            });
                    } else if (this.model.specialtyPlan.have_enrolled() || this.model.specialtyPlan.enroll().enroll_type == 0) {
                        if (item.unit_type == "plan_exam")
                            location.assign(webFrontUrl + '/' + PROJECT_CODE + '/exam/prepare/' + item.unit_id);
                        else
                            location.assign((typeof auxoCourseWebfrontUrl == 'undefined' ? '' : auxoCourseWebfrontUrl) + '/' + PROJECT_CODE + '/course/' + item.unit_id);
                    } else {
                        this.showTip(i18nHelper.getKeyValue('specialty.plan.signUpPlan'));
                    }
                } else {
                    location.assign(selfUrl + '/' + PROJECT_CODE + '/account/login?returnurl=' + window.encodeURIComponent(location.href));
                }
            },
            /**
             * 显示提示
             * @param message
             */
            showTip: function (message) {
                $('#tipDialog').fadeIn(300).find('.data').text(message);
            },
            gotoLearn: function () {
                var that = this;
                service.lastStudyCourse(ko.unwrap(this.model.specialtyPlan.specialty_plan_id)).then(function (value) {
                    if (value) {
                        location.assign((typeof auxoCourseWebfrontUrl == 'undefined' ? '' : auxoCourseWebfrontUrl) + '/' + PROJECT_CODE + '/course/' + value + '?language=zh-CN');
                    }
                });
            },
            /**
             * 互动组件使用，由于互动组件那边修改的版本不一致，暂时先放着测试使用，正式时可移除
             * @param content
             * @returns {*}
             */
            emoji: function (content) {
                if (content) {
                    var html = $.trim(content).replace(/\n/g, '<br/>');
                    html = jEmoji.softbankToUnified(html);
                    html = jEmoji.googleToUnified(html);
                    html = jEmoji.docomoToUnified(html);
                    html = jEmoji.kddiToUnified(html);
                    return jEmoji.unifiedToHTML(html);
                }
            }
        };
    
    
        $(function () {
            $(window).load(function () {
                (function () {
                    var loading = null;
                    // ajax开始回调
                    $(document).ajaxStart(function () {
                        loading = layer.load(0, {
                            time: 1000 * 100
                        });
                    });
                    // ajax结束回调
                    $(document).ajaxComplete(function () {
                        layer.close(loading);
                    });
                }());
    
                // 延迟加载图片
                store.lazyImg();
    
                store.component.dialog($('.e-dialog'));
                var VM = new ViewModel();
                VM.initViewModel(document.getElementById('bootstrap'));
                $(window).on('message', function (event) {
                    var postMsg = JSON.parse(event.originalEvent.data || '{}');
                    if (postMsg.key === 'specialty_course_map_click') {
                        VM.goToCourse.call(VM, postMsg.data);
                    }
                })
            });
        });
    
        ko.options.deferUpdates = true;
    
    
    }());
    
    (function () {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
    
        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () {
                        callback(currTime + timeToCall);
                    },
                    timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
    
        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
    
    }());
    