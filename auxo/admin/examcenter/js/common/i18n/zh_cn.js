var i18n = {
    common: {
        // 各种JS插件的语言设置
        addins: {
            elearningExtend: {
                tagbar: {
                    allText: '全部',
                    moreText: '更多',
                    hideText: '收起'
                }
            },
            upopup: {
                sysTitle: '系统提示'
            },
            star: {
                low: '差',
                normal: '一般',
                better: '较好',
                good: '很好',
                perfect: '非常好',
                noSpecialElement: '请指定目标元素'
            },
            pagination: {
                first: '首页',
                last: '尾页',
                prev: '上一页',
                next: '下一页',
                jumpTo: '到',
                page: '页',
                jump: '跳转',
                overview: '当前第 {{currentPage}} 页/共 {{totalPage}} 页，共有 {{totalCount}} 条记录'
            },
            jquery: {
                ajaxError: {
                    close: '关闭',
                    title: '系统提示',
                    originalErrorMessageTitle: '向服务器执行{{httpmethod}}请求时出错{{errorMessage}}',
                    stackTrace: '错误堆栈：',
                    errorType: '错误类型：',
                    errorMessage: '错误信息：',
                    errorTitle: '出错了，请将以下错误反馈给客服'
                }
            },
            paper: {
                header: {
                    //剩余用时
                    remainTime: '剩余用时',
                    //保存答案
                    saveAnswer: '保存答案',
                    //保存
                    save: '保存'
                },
                parts: {
                    //点击可切换
                    clickSwitch: '点击可切换'
                }
            },
            jstimer: {

            },
            swftimer: {

            },
            timer: {

            },
            prepare: {
                //返回
                back: '返回',
                //题
                ti: '题',
                //总分
                totalScore: '总分',
                //及格
                pass: '及格',
                //分钟
                minute: '分钟',
                //小时
                hour: '小时',
                //分
                minute_: '分',
                //秒
                second: '秒',
                //距离考试结束：
                remainTime: '距离考试结束：',
                //注意:
                notice: '注意:',
                //1、开始考试后不可暂停，时间到后自动交卷，请注意时间安排。
                rollRule1: '1、开始考试后不可暂停，时间到后自动交卷，请注意时间安排。',
                //2、答题结束，点击“交卷”完成当前考试。
                rollRule2: '2、答题结束，点击“交卷”完成当前考试。',
                //考试已结束
                examTimeOvered: '考试已结束',
                //距离开考还有：
                timeFromExam: '距离开考还有：',
                //考试已开始：
                examBeginedTime: '考试已开始：',
                //距离考试结束还有：
                examRemainTime: '距离考试结束还有：',
                //本次考试时间已到, 不能继续答题
                timeOverTip: '本次考试时间已到, 不能继续答题',
                //交卷
                handPaper: '交卷'
            },
            loading: {
                //正在加载...
                loading: '正在加载...'
            },
            navigatorstat: {
                //本次成绩
                examResult: '本次成绩',
                //正确率
                correctRate: '正确率',
                //答对
                correct: '答对',
                //题
                ti: '题',
                //答错
                error: '答错',
                //未做
                noDo: '未做'
            },
            explain: {
                //考试说明
                examDescription: '考试说明'
            },
            questionOption: {
                //此选项为参考答案
                referenceAnswer: '此选项为参考答案'
            },
            subjective: {
                //我会做
                willDo: '我会做',
                //我不会做
                willNotDo: '我不会做'
            },
            judge: {
                //对
                right: '对',
                //错
                error: '错'
            },
            question: {
                //暂不确定
                unCertain: '暂不确定',
                //填空题
                blankFill: '填空题',
                //主观题
                subjectiveQuestion: '主观题',
                //正确答案
                correctAnswer: '正确答案',
                //您答对了
                answerRight: '您答对了',
                //主观题用户答案
                subjectiveAnswer: '主观题用户答案',
                //题目详解
                subjectDetail: '题目详解',
                //套题详解
                setDetail: '套题详解',
                //您错答为[" + t + "]
                answerError: '您错答为[{{t}}]',
                //您未作答
                hasNoAnswer: '您未作答',
                //<暂无>
                noNow: '<暂无>',
                //不计分
                noScore: ' 不计分',
                //分
                score: '分'
            },
            navigator: {
                //1
                one: '一',
                //2
                two: '二',
                //3
                three: '三',
                //4
                four: '四',
                //5
                five: '五',
                //6
                six: '六',
                //7
                seven: '七',
                //8
                eight: '八',
                //9
                nine: '九',
                //10
                ten: '十',
                //百
                hundred: '百',
                //千
                thousand: '千',
                //万
                surname: '万',
                //十万
                tenSurname: '十万',
                //百万
                hundredSurname: '百万',
                //千万
                thousandSurname: '千万',
                //亿
                billion: '亿',
                //只能处理到亿
                onlyBillion: '只能处理到亿'
            },
            enums: {

            },
            util: {

            },
            loader: {

            },
            message: {

            },
            updater: {
                //无需保存
                noNeedSave: '无需保存',
                //保存成功
                saveSuccess: '保存成功',
                //保存失败
                saveError: '保存失败'
            },
            store: {

            },
            answer: {
                //请实现_onSubmit方法！
                achieveSubmit: '请实现_onSubmit方法！',
                //请实现_fullscreen方法！
                achieveFullscreen: '请实现_fullscreen方法！',
                //请实现_restart方法！
                achieveRestart: '请实现_restart方法！',
                //请实现_finish方法！
                achieveFinish: '请实现_finish方法！'
            },
            examAnswer: {
                //试卷说明
                examDescription: '试卷说明',
                //error In '_nosure',可能是data.viewModel.question.Id() 不存在
                idError: 'error In "_nosure",可能是data.viewModel.question.Id() 不存在',
                //已完成全部题目，确定交卷吗？
                submitPaper: '已完成全部题目，确定交卷吗？',
                //交卷
                submit: '交卷',
                //继续答题
                continueAnswer: '继续答题',
                //本次考试时间已到, 不能继续答题
                timeOvered: '本次考试时间已到, 不能继续答题',
                //已完成 " + e + " 题，还有 " + (t - e) + " 题未做，确定交卷吗？
                paperTip: '已完成 {{yes}} 题，还有 {{no}} 题未做，确定交卷吗？'

            }
        },
        //前台页面
        frontPage: {
            gotoTrainDetail: '通关秘籍，戳这里',
            remain: '再考一次（剩{{left}}次）',
            examConst: '考试用时',
            examLimitScore: '及格分数',
            totalScore: '总分',
            answerAnalysis: '答案解析 >',
            scoreTitle: '分',
            questionText: '题',
            answerQuestionCount: '作答题数',
            hourText: '小时',
            minuteText: "分钟",
            secondText: "秒",

            lastPositionContent: '您上次观看到 ',

            numOfPeople: '人',
            studyEvaluate: '学员评价',
            loadMore: '加载更多...',
            noEvaluate: '暂无评价',
            evaluate: '评价',
            evaluateTip: '在这里输入您的评价或问题',
            myEvaluate: '我的评价',
            newEvaluate: '发表评价',
            evaluateLimit: "评价不能多于{0}个字",


            ucLabel1: "文件名称",
            ucLabel2: "上传进度",
            ucLabel3: "文件大小",
            ucLabel4: "删除",

            // 培训状态
            enrollStatus: {
                offline: '下线',
                enrollNotStart: '报名未开始' ,
                notEnroll: '立即报名' ,
                enrollEnded: '报名已结束' ,
                offlineEnroll: '线下报名' ,
                enrollUnConfirm: '报名待审核' ,
                enrollAgain: '重新报名' ,
                goPay: '去支付',
                payUnConfirm: '支付待审核' ,
                payAgain: '重新支付' ,
                finished: "已结束" ,
                notStarted: "未开始" ,
                choiceCourse: "去选课" ,
                toSelectCourse: '等待开课' ,
                learning: '继续学习',
                finish: '复习回顾' ,
                ended: '已结束',

                unConfirm: "待审核",
                refused: "已拒绝",
                pass: "已通过",
                use: "去学习",
                undefined: "未定义的状态"
            },

            //登录/注册
            logInSinUp: '登录/注册',
            //用户名称
            username: '用户名称',
            //移动端
            mobilTerminal: '移动端',
            //下载移动端
            downmobilTerminal: '下载移动端',
            //退出
            logOut: '退出',
            //免费
            free: '免费',
            //首页
            homePage: "精品推荐",
            //公开课
            openClass: '公开课',
            //培训认证
            trainSign: '培训认证',
            //职位
            jobPlan: '职业规划',
            //职位规则
            jobPlanEx: '职业规划',
            //登录
            loginIn: '登录',
            //我的学习
            myStudy: '我的学习',
            //我的考试
            myExam: '我的考试',
            //注销
            loginOut: '注销',
            //页脚
            footerPage: '福建华渔未来教育科技有限公司',
            //标注
            tagFlag: '技术支持',
            /*
             title相关
             */
            //培训介绍
            trainInfo: '培训介绍',
            //课程列表
            courseList: '课程列表',
            //职位介绍
            jobInfo: '职位介绍',
            //学习中心
            studyCenter: '学习中心',
            // - 登录
            projectLoginIn: '{{projectTitle}} - 登录',

            /*
             标签相关
             */
            //对
            right: '对',
            //错
            error: '错',
            //是
            yes: '是',
            //否
            no: '否',
            //返回
            back: '返回',
            //推荐
            recommond: '推荐',
            //收起
            collapse: '收起',
            //更多
            more: '更多',
            //课程
            course: '课程',
            //培训
            train: 'train',
            //最新
            newest: '最新 ',
            //热门
            hot: '热门',
            //考试
            exam: '考试',
            //必修课
            requireCourse: '必修课',
            //选修课
            selectiveCourse: '选修课',
            //资源
            resourceLabel: '资源',
            //通过方式
            passLabel: '通过方式',
            /*
             按钮相关
             */
            //报名
            registration: '报名',
            //马上报名
            registrationOnce: '马上报名',
            //线下报名
            offLineBtn: '线下报名',
            //已结束
            finished: '已结束',
            //未开考
            noOpen: '未开考',
            //已过期
            expired: '已过期',
            //学时不足
            hourLess: '学时不足',
            //进入考试
            enterExam: '进入考试',
            //阅卷
            paperMark: '阅卷',
            //补考
            examAgain: '补考',
            //重新考试
            reExam: '重新考试',
            //修改信息
            modifyInfo: '修改信息',
            //开始学习
            beginStudy: '开始学习',
            //继续学习
            continueStudy: '继续学习',
            //取消
            cancel: '取 消',
            //确定
            confirm: '确 定',
            //浏览
            browse: '浏览',
            //提交
            submit: '提交',
            //删除
            remove: '删除',
            //确认付款
            confirmPay: '确认付款',
            /*
             提示相关
             */
            //报名信息有误
            rollError: '报名信息有误',
            //汇款信息有误
            payError: '汇款信息有误',
            //缴费信息有误
            payToError: '缴费信息有误',
            //暂无课程
            hasNoCourse: '暂无课程',
            //线下报名提示
            offLineTip: '线下报名具体事宜请联系平台客服或管理员',
            //统计失败
            calError: '统计失败，请稍等片刻后刷新页面',
            //验证码错误验证
            validateError: '验证码错误',
            //报名提示
            rollTip: '请先报名后进行学习！',
            //输入框提示
            inputTip: '请输入关键字...',
            //请输入备注信息
            markInfo: '请输入备注信息',
            //付款成功
            paySuccess: '付款成功',
            /*
             课程相关
             */
            //列表选项
            listItem: '共{{CourseNum}}门课程/{{ExamNum}}个考试/{{MinHours}}学时',
            //学习人数
            studyCount: '{{StudyNum}}人学习',
            //学时
            MinHours: '{{MinHours}}学时',
            //最新
            top: '最新',
            //通过方式
            passWay: '修满{{MinHours}}学时',
            //资源信息
            resourse: '视频{{VideoNum}}个/文档{{DocumentNum}}个/练习{{ExerciseNum}}个',

            /*
             课程考试相关
             */
            //课程标签
            courseLabel: '课         程：',
            //时间起始
            timeBegin: '考试时间：{{BeginTime}}',
            //时间结束
            timeEnd: ' 至 {{EndTime}}',
            //开考条件1
            testCondition1: '开考条件：不限',
            //开考条件2
            testCondition2: '开考条件：学满{{RequireTotal}}学时',
            //考试时长
            examTime: '考试时长：{{LimitSeconds}}',
            //及格线
            passLine: ' 及 格 线：{{PassScroe}}分',
            //最佳成绩1
            bestResult1: '最佳成绩：未参加考试',
            //最佳成绩2
            bestResult2: '最佳成绩：改卷中',
            //最佳成绩3
            bestResult3: '最佳成绩：{{Score}}分',

            /*
             常见短词
             */
            //至
            to: '至',
            //学时
            studyHour: '学时',
            //课程大纲
            courseOutline: '课程大纲',
            //必填项
            required: '必填项',
            //选填项
            optional: '选填项',
            //手机号码
            telNumber: '手机号码',
            //注意事项
            notice: '注意事项',
            //视频
            video: '视频',
            //文档
            text: '文档',
            //练习
            practice: '练习',
            //免费
            free: '免费',
            /*
             上传控件
             */
            //提示1
            ucTip1: '上传底单扫描图片',
            //提示2
            ucTip2: '(支持jpg/png/bmp 图片格式，图片大小不超过4MB，最多上传10张图片)',
            //文本1
            uclabel1: '文件名称',
            //文本2
            ucLabel2: '上传进度',
            //文本3
            ucLabel3: '文件大小',
            //文本4
            ucLabel4: '删除',
            //文本5
            ucLabel5: '添加附件',

            //上传文件超过最大限制
            numberOverLimit: '上传文件超过最大限制',
            //上传的文件大小超过限制
            sizeOverLimit: '上传的文件大小超过限制',
            //所选择的文件大小不能为0
            noFileSize: '所选择的文件大小不能为0',
            //所选择文件扩展名与允许不符
            noMapFileExtension: '所选择文件扩展名与允许不符',
            //队列错误
            fileQueueError: '队列错误',
            //请上传附件。
            uploadFile: '请上传附件。',
            //请等待上传完成后再提交。
            waitUploadComplete: '请等待上传完成后再提交。',
            //文件上传异常，请稍后再试。
            fileUploadError: '文件上传异常，请稍后再试。',

            /*
             支付选择
             */
            //提示1
            payTip1: '即时到账，支持绝大数银行卡借记卡及部分银行信用卡',
            //提示2
            payTip2: '快钱支付客服服务热线（9:00-18:00）：400-611-0013',
            //提示3
            payTip4: '支付宝客服服务热线：95188',
            //提示5
            payTip5: '方式一：在线支付',
            //提示6
            payTip6: '方式二：线下支付',
            //提示7
            payTip7: '说明：线下汇款需要提供对应的缴费凭证，请保留缴费凭证，点击“确认付款”在下个页面上传缴费缴费凭证',
            //提示8
            payTip8: '快钱支付',
            //提示9
            payTip9: '支付宝支付',
            //文本1
            payLabel1: '确认支付信息',
            //文本2
            payLabel2: '选择支付方式',
            //文本3
            payLabel3: '使用优惠券',
            //文本4
            payLabel4: '直接输入您的优惠券序号',
            //文本5
            payLabel5: '使用',
            //输入文本1
            inputLabel1: '优惠券序号：',
            //输入文本2
            inputLabel2: '培训价格：',
            //输入文本3
            inputLabel3: '优惠：',
            //输入文本4
            inputLabel4: '应付金额：',

            /*
             表单验证
             */
            //请选择所在地
            chooseLocation: '请选择所在地',
            //手机号码格式有误，请重新输入
            phoneError: '手机号码格式有误，请重新输入',
            //时间格式有误，请重新输入
            dateFormatError: '时间格式有误，请重新输入',
            //QQ号码格式有误，请重新输入
            qqNumberError: 'QQ号码格式有误，请重新输入',
            //请输入数字，最多小数位为{0}
            onlyNumber: '请输入数字，最多小数位为{0}',
            //请输入中文字符
            onlyChinese: '请输入中文字符',
            //请输入英文字符
            onlyEnglish: '请输入英文字符',
            //格式错误
            formatError: '格式错误',
            //固定电话格式有误，格式:区号+电话，请重新输入
            fixedPhoneError: '固定电话格式有误，格式:区号+电话，请重新输入',
            //邮编格式不正确，请重新输入
            emailError: '邮编格式不正确，请重新输入',
            //不可输入纯数字，请重新输入
            unpermitPureNumber: '不可输入纯数字，请重新输入',
            //请输入4位验证码，数字或英文字母组成
            validateFormatError: '请输入4位验证码，数字或英文字母组成',
            //验证码错误
            validateCodeError: '验证码错误',

            /*
             时间插件
             */

            //当前日期
            pickerCurrentDate: '当前日期',
            //选择
            pickerSelect: '选择',
            //分
            pickerMinute: '分钟',
            //小时
            pickerHour: '小时',
            //秒
            pickerSecond: '秒',
            //时
            pickerHour_: '时',
            //年月日格式
            pickerDateFormat: 'yy-mm-dd',
            //时分秒格式
            pickerTimeFormat: 'HH:mm:ss'
        },
        //后台系统
        systemManage: {

        }
    },
    /*
    我的答疑页面
     */
    myQAs: {
        frontPage: {
            //我的答疑
            pageTitle1: '我的答疑',
            //答疑详细页面
            pageTitle2: '答疑详细页面',
            //答疑类型
            qaTypes: '答疑类型：',
            //全部问题
            allQuestion: '全部问题',
            //我的问题
            myQuestions: '我的问题',
            //我的回答
            myAnswers: '我的回答',
            //常见问题
            commonQuestions: '常见问题',
            //最新问题
            latestQuestion: '最新问题',
            //最多回答
            withMostAnswers: '最多回答',
            //全部课程
            allCourses: '全部课程',
            //问题排序
            sortQuestions: '问题排序：',
            //培训课程
            trainCourses: '培训课程：',
            //搜索关键字
            htmlText1: '搜索关键字“',
            //，共找到
            htmlText2: '”，共找到',
            //条结果
            htmlText3: '条结果。',
            //赶快和大家分享你的知识经验吧~
            htmlText4: '赶快和大家分享你的知识经验吧~',
            //在课程学习时遇到任何问题，都可以随时提问哦~
            htmlText5: '在课程学习时遇到任何问题，都可以随时提问哦~',
            //正在加载中，请稍候...
            htmlText6: '正在加载中，请稍候...',
            //抱歉，没有“
            htmlText7: '抱歉，没有“',
            //的相关答疑
            htmlText8: '”的相关答疑',
            //建议您：
            htmlText9: '建议您：',
            //1.更改关键字再搜索
            htmlText10: '1.更改关键字再搜索',
            //2.更改筛选条件
            htmlText11: '2.更改筛选条件',
            //查看
            check: '查看',
            //删除
            remove: '删除',
            //取消
            cancel: '取消',
            //确认
            confirm: '确认',
            //该问题有
            htmlText12: '该问题有',
            //个回答：
            htmlText13: '个回答：',
            //修改
            change: '修改',
            //[老师]
            teacher: '[老师]',
            //[我]
            me: '[我]',
            //我来回答
            htmlText14: '我来回答',
            /*
            js文件部分
             */
            //问题内容不能为空
            staticText1: '问题内容不能为空',
            //问题内容不能超过100个字
            staticText2: '问题内容不能超过100个字',
            //确认删除该回答吗(本操作不可恢复)?
            staticText3: '确认删除该回答吗(本操作不可恢复)?',
            //回复内容不能为空
            staticText4: '回复内容不能为空'

        }
    },

    /*
    我的笔记页面
     */
    myNote: {
        frontPage: {
            //我的笔记
            pageTitle: '我的笔记',
            //章节排序
            sortChapters: '章节排序',
            //点击后按章节升序排序
            htmlText1: '点击后按章节升序排序',
            //点击后按章节降序排序
            htmlText5: '点击后按章节降序排序',
            //时间排序
            sortByDate: '时间排序',
            //点击后按时间升序排序
            htmlText2: '点击后按时间升序排序',
            //点击后按时间降序排序
            htmlText6: '点击后按时间降序排序',
            //可以在课程学习时多记笔记，提高学习效果~
            htmlText3: '可以在课程学习时多记笔记，提高学习效果~',
            //正在加载中，请稍候...
            htmlText4: '正在加载中，请稍候...',
            //"确认删除该笔记吗(本操作不可恢复)?
            staticText1: '"确认删除该笔记吗(本操作不可恢复)?'
        }
    },
    // 学习页面
    learn: {
        prev: '上一个',
        next: '下一个',
        pageTitle: '章节列表-章节学习',
        chapter: '章节',
        backToCoursePage: '返回课程主页',
        keywordPlaceHolder: '请输入答疑关键字...',
        myQuestion: '我的问题',
        commonQuestion: '常见问题',
        allQuestion: '全部问题',
        writeQuestionLabel: '在此写下您的问题...',
        quiz: '马上提问',
        totalQuestions: '共<em>{{questionTotalCount}}</em>个问题',
        totalNote: '共<em>{{NoteTotalCount}}</em>笔记',
        notFoundText1: '在课程学习时遇到任何问题',
        notFoundText2: '都可以随时提问哦',
        viewMore: '查看更多',
        goback: '返回',
        findQuestionTmpl: '找到{{questionTotalCount}}条问题',
        noKeyWordTitle: '抱歉，没有\“{{OldKeyWord}}\”的相关答疑',
        noQuestion: '暂无常见问题',
        noQuestionTitle: '在课程学习时遇到任何问题都可以随时提问哦~',
        noContentLabel: '好记性不如烂笔头',
        publishNote: '发表笔记',
        note: '笔记',
        showAll: '显示全部',
        deleteNote: '删除',
        updateNote: '修改',
        cancelNote: '取消',
        saveNote: '确认',
        notFoundText3: '可以在课程学习时多记笔记<br />提高学习效果~',
        catalogPanel: '目录',
        quizpanel: '答疑',
        notepanel: '笔记',
        collapse: '[收起]',
        showAll2: '[显示全部]',

        exercise: {
            answercard: "答题卡",
            score: "成绩",
            guid: "练习说明",
            prevQuestion: "上一题",
            nextQuestion: "下一题",
            redAnswerErrorQuestion: '错题重做',
            commit: "提交练习"
        }
    },
    // 培训认证频道
    trains: {
        // 后台系统
        systemManage: {

        },
        // 前台页面
        frontPage: {
            //分钟
            minutes: '分钟',
            // 评价
            evaluate: {
                newEvaluateLabel: '请对培训的满意度进行评价'
            },
            //请先报名
            courseClickTips: '请先报名',
            //请先支付
            waitingPay: '请先支付',
            //请先去选课
            waitingCouseSelection: '请先去选课',
            //尚未开课
            waitingCourses: '尚未开课',
            //培训已结束
            trainHasOver:'培训已结束',

            //无培训提示
            noTip: '暂无此类培训',
            //页面标题
            pageTitle: '培训列表',
            //等待报名
            waitRoll: '该培训未报名，请先设置为目标！',
            //门课程
            _courses: '门课程',
            //个培训
            _trainings: '个培训',
            //学时
            _hours: '学时',
            //个考试
            _exams: '个考试',
            //共有
            _total: '共有',
            //'目前共有 ' + StudyNum + '人学习 '
            _currentCount: '目前共有{{count}}人学习 ',
            //通过方式：
            _passWay: '通过方式：',
            //'修满' + MinHours + '个学时'
            _fullHours: '修满{{hours}}个学时',
            //资源：
            _source: '资源：',
            //共
            _all: '共',
            //门课
            _mk: '门课',
            //个考试
            _gks: '个考试',
            //个
            _g: '个',
            //内含：
            contain:'内含:',
            //内含：视频
            _videos: '视频',
            //文档
            _txt: '文档',
            //练习
            _train: '练习',
            //学时；
            _h: '学时；',
            //考试
            _exam: '考试',
            //培训课程
            _trainCourse: '培训课程'
            //等待审核
        }
    },
    // 职业规划频道
    jobs: {
        // 后台系统
        systemManage: {

        },
        // 前台页面
        frontPage: {
            //提示
            htmlText5: '提示',
            //培训课程
            htmlText3: '课程',
            //课&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;程：
            htmlText4: '课 程：',
            //共
            total: '共',
            //门课
            coursesNr2: '门课',
            //目前共有 ' + StudyNum + '人学习
            htmlText1: '目前共有{{StudyNum}}人学习',
            //内含：视频
            htmlText2: '内含：视频',
            //个考试
            examNr: '个考试',
            //门课程
            coursesNr: '门课程',
            //分类：
            catalogs: '分类：',
            //学时
            studyHour: '学时',
            //个
            number: '个',
            //全部
            all: '全部',
            //无培训提示
            noTip: '暂无此类职位',
            //页面标题
            pageTitle: '职位列表',
            //详细介绍
            itemDetail: '详细介绍',
            //提示框文本
            modelTip: '你原先的职业目标是{{target}},确认修改？',
            //设定为职业目标
            setTarget: '设定为职业目标',
            //培训已结束
            trainHasOver: '培训已结束',
            //等待报名
            waitRoll: '该职位未报名，请先设置为职业目标！',
            //等待审核
            waitAuditing: '您的报名资料已提交，请等待审核',
            //尚未开课
            waitingCourses:'尚未开课',
            //请先去选课
            choiceCourse:'请先去选课'

        }
    },
    //课程报名
    enrolls: {
        // 前台页面
        frontPage: {
            //您的缴费凭证正在审核中
            offlinePayText1: '您的缴费凭证正在审核中',

            /*
            js文件相关
             */
            //发票已合并开具至指定单位。
            staticText1: '发票已合并开具至指定单位。',
            //等待发票开具。
            staticText2: '等待发票开具。',
            //等待发票寄送。
            staticText3: '等待发票寄送。',
            //发票已开，请尽快领取
            staticText4: '发票已开，请尽快领取',
            //发票已寄送
            staticText5: '发票已寄送',
            //如果取消报名，您的培训报名信息将被删除。<br/>是否要取消报名？
            staticText6: '如果取消报名，您的培训报名信息将被删除。<br/>是否要取消报名？',
            //上传成功！
            staticText7: '上传成功！',
            //<span class='uploadButton'>重新上传文件</span>
            staticText8: '<span class="uploadButton">重新上传文件</span>',
            //请等待审核。如有疑问请联系客服。
            staticText9: '请等待审核。如有疑问请联系客服。',




            //页面标题1
            pageTitle1: '自选课程',
            //页面标题2
            pageTitle2: '选择培训班',
            //页面标题3
            pageTitle3: '我的培训',
            //页面标题4
            pageTitle4: '线下缴费',
            //页面标题5
            pageTitle5: '付款',
            //页面标题6
            pageTitle6: '报名结果',
            //页面标题7
            pageTitle7: '报名资料',


            //提示文本1
            courseLineTip: '新课程即将上线，敬请关注!',
            //提示文本2
            cancelSelectedCourseTip: '注意：如果取消在学选修课，则该课程已完成学时将不计入您的学习进度中。',
            //提示文本3
            rollTip3: '新培训即将上线，敬请关注！',
            //提示文本4
            rollTip4: '没找到您搜索的培训，请更换关键字或直接',
            //提示文本5
            rollTip5: '还没有正在学习的培训，去看看适合自己的培训',
            //提示文本6
            rollTip6: '请输入备注信息',
            //提示文本7
            rollTip7: '请填写汇款人姓名',
            //提示文本8
            rollTip8: '确认发票信息',
            //提示文本9
            rollTip9: '请填写所在单位名称或学员姓名',
            //提示文本10
            rollTip10: '(以实际缴费金额为准)',
            //提示文本11
            rollTip11: '请填写详细信息',
            //提示文本12
            rollTip12: '说明：发票寄送将统一使用快递到付的方式，如有其他需要请联系客服。',
            //提示文本13
            rollTip13: '修改发票信息',
            //提示文本14
            rollTip14: '保存发票信息',
            //提示文本15
            rollTip15: '确认发票信息',


            //培训有效期
            trainPeriod: '培训有效期：',
            //选课说明
            courseDescription: '选课说明：',
            //已选
            selected: '已选',
            //门课程，共
            courseAll: '门课程，共',
            //，还差
            short: '，还差',
            //共有
            all: '共有',
            //门必修课,
            requireCourse: '门必修课,',
            //门选修课可以选择
            courseSelectable: '门选修课可以选择',
            //保存所选课程
            saveSelectedCourse: '保存所选课程',
            //共选择
            allSelected: '共选择',

            //正在培训
            training: '正在培训：',
            //即将开通
            onOpenning: '即将开通：',
            //报名有效期
            rollPeriod: '报名有效期：',

            //报名培训
            rollTrain: '报名培训',
            //取消报名
            cancelRoll: '取消报名',
            //缴费信息
            payInfo: '缴费信息',
            //培训费用
            trainFee: '培训费用：',
            //收件人
            recipients: '收件人：',
            //电话
            telPhone: '电话：',
            //地址
            address: '地址：',
            //快递
            express: '快递：',
            //寄送日期
            sendDate: '寄送日期',

            //汇款信息
            remitInfo: '汇款信息',
            //汇款人
            remitPenson: '汇款人：',
            //汇款账号
            remitAccount: '汇款账号：',
            //汇款日期
            remitDate: '汇款日期：',
            //汇款金额：
            remitMoney: '汇款金额：',

            //发票抬头
            billTitle: '发票抬头：',
            //发票金额
            billMoney: '发票金额：',
            //寄送地址：
            sendAddress: '寄送地址：',
            //手机号码
            telNumber: '手机号码：',
            //请在支付宝支付成功后点击“支付成功”按钮，如付款遇到问题时请联系客服
            paySuccessTip: '请在支付成功后点击“支付成功”按钮，如付款遇到问题时请联系客服。',
            //支付成功
            paySuccess: '支付成功',
            //请输入优惠券序号！
            couponNumber: '请输入优惠券序号！',
            //确认移除该优惠券吗
            removeCoupon: '确认移除该优惠券吗',
            //请先填写并保存发票信息。
            fillBillInfo: '请先填写并保存发票信息。',
            //优惠券验证失败，请重新填写优惠券序号。
            couponValiteError: '优惠券验证失败，请重新填写优惠券序号。',
            //请在快钱支付成功后点击“支付成功”按钮，如付款遇到问题时请联系客服
            //福建省
            fjProvince: '福建省',
            //市辖区
            cityArea: '市辖区',
            //请输入发票抬头
            remitNoneError: '请输入发票抬头',
            //发票抬头必须是{0}到{1}个字
            remitFormatError: '发票抬头必须是{0}到{1}个字',
            //请输入邮政编码
            emailNoneError: '请输入邮政编码',
            //请输入街道地址
            addressNoneError: '请输入街道地址',
            //街道地址不能多于{0}个字
            addressFormat: '街道地址不能多于{0}个字',
            //请输入收件人
            recipientsNoneError: '请输入收件人',
            //请输入中文字符
            onlyChinese: '请输入中文字符',
            //请输入英文字符
            onlyEnglish: '请输入英文字符',
            //格式错误
            formatError: '格式错误',
            //请输入手机号码或者区号-固话
            phoneFormat: '请输入手机号码或者区号-固话',
            //邮编格式不正确，请重新输入
            emailError: '邮政编码必须是6位数字',
            //手机号码格式有误，请重新输入
            phoneError: '手机号码格式有误',
            //备注不能多于{0}个字
            remarkFormat: '备注不能多于{0}个字',
            //请先填写并保存发票信息！
            saveInfoTip: '请先填写并保存发票信息！',
            //去学习
            goToStudy: '去学习',
            //您已经付过款无需重复支付，点击下方按钮去学习。
            notPayAgain: '您已经付过款无需重复支付，点击下方按钮去学习。',
            //重新填写优惠券
            fillCouponAgain: '重新填写优惠券',
            //优惠券验证失败，请重新填写优惠券序号。
            couponValidateError: '优惠券验证失败，请重新填写优惠券序号。',
            //姓名不能多于{0}个字
            nameFormatError: '姓名不能多于{0}个字',


            //您可以选择
            selectAble: '您可以选择：',
            //修改报名资料
            editRollInfo: '修改报名资料',
            //修改付款信息
            editPayInfo: '修改付款信息',
            //去选课
            goSelectCourse: '去选课',
            //开始学习
            beginStudy: '开始学习',
            //继续报名其他职位
            aheadJob: '继续报名其他职位',
            //继续报名其他课程
            aheadCourse: '继续报名其他课程',
            //继续报名其他培训
            aheadTrain: '继续报名其他培训',
            //您的报名资料已提交，请等待审核。
            waitAuditing: '您的报名资料已提交，请等待审核。',
            //您报名的培训尚未开始，请耐心等待。
            waitTrain: '您报名的培训尚未开始，请耐心等待。',
            //很遗憾，您的报名审核未通过。
            auditingFail: '很遗憾，您的报名审核未通过。',
            //您的付款凭证已提交，请等待确认。
            waitConfirm: '您的付款凭证已提交，请等待确认。',
            //您的付款已通过, 请进入学习或报名其他培训。
            enterStudy: '您的付款已通过, 请进入学习或报名其他培训。',
            //您提交的付款信息有误，请重新提交。
            submitInfoError: '您提交的付款信息有误，请重新提交。',
            //您尚未选课, 请进行选课或报名其他培训。
            hasNoSelected: '您尚未选课, 请进行选课或报名其他培训。',
            //恭喜您，报名成功！
            rollSuccess: '恭喜您，报名成功！',
            //其他报名信息。
            otherRollInfo: '其他报名信息。',

            //填写基本资料
            baseInfo: '填写基本资料',
            //填写附加资料
            alterInfo: '填写附加资料',
            //附件信息要求
            attachInfo: '附件信息要求',
            //若不存在你所在单位请联系客服
            contactCustomerService: '若不存在你所在单位请联系客服',
            //若不存在你所在的单位，请自行添加
            addBySelf: '若不存在你所在的单位，请自行添加',
            //若不存在您所在单位请联系单位管理人员进行单位注册
            contactEnterp: '若不存在您所在单位请联系单位管理人员进行单位注册',
            //请选择
            toSelect: '请选择',

            //付款单位(个人)不能为空
            paymentNoneError: '付款单位(个人)不能为空',
            //付款单位(个人)的长度应该在 {0} 到 {1}字符
            paymentFormat: '付款单位(个人)的长度应该在 {0} 到 {1}字符',
            //收款账号为数字
            accountNumber: '收款账号为数字',
            //收款账号不能为空
            accountNoneError: '收款账号不能为空',
            //收款账号长度应该在 {0} 到 {1}字符
            accountFormat: '收款账号长度应该在 {0} 到 {1}字符',
            //汇款日期不能为空
            remitDateNoneError: '汇款日期不能为空',
            //汇款金额不能为空
            remitMoneyNoneError: '汇款金额不能为空',
            //汇款金额为数字
            remitMoneyNumber: '汇款金额为数字',
            //汇款金额应该在 {0} 到 {1}
            remitMoneyFormat: '汇款金额应该在 {0} 到 {1}',
            //备注不能为空
            remarkNoneError: '备注不能为空',
            //备注长度应该在 {0} 到 {1}字符
            remarkFormat: '备注长度应该在 {0} 到 {1}字符',
            //必须上传底单扫描图片！
            uploadPicFormat: '必须上传底单扫描图片！',
            //保存成功！
            picSaveSuccess: '保存成功！',
            //添加图片
            picAdd: '添加图片',


            //报名中...
            onRolling: '报名中...',
            //选择上传文件
            selectFile: '选择上传文件'
        }
    },
    // 课程资源
    courses: {
        frontPage: {
            evaluate: {
                newEvaluateLabel: '请对课程的满意度进行评价',
            },
            noNote: '暂无笔记',
            noQuestion: '暂无提问',
            latestNotes: '最新笔记',
            latestQuestion: '最新提问',
            chapter: '章节',
            noChapter: '暂未添加课程章节',
            lastCatalogName: '上次学到：',
            noCourseDetail: '暂无课程描述'
        }
    },
    // 系统信息
    system: {},
    // 视屏播放器
    videos: {
        noFlashPluginMessage: '<p>如果您无法播放视频，请确认您是否安装Flash</p><p><a href="http://get.adobe.com/cn/flashplayer/" target="_blank">点击下载</a>安装最新Flash Player播放器</p>',
        videoText: '视频',
        audioText: '音频',
        resourceStatusEncodingMessage: '抱歉，当前{{videoType}}未转码完成，请稍候再观看。',
        resourceStatusReadyMessage: '{{videoType}}：已就绪',
        resourceStatusExpiredMessage: '抱歉，当前{{videoType}}已下线，无法观看。',
        resourceStatusDeleteMessage: '抱歉，当前{{videoType}}已删除，无法观看。',
        resourceStatusDefaultMessage: '抱歉，{{videoType}}加载失败，错误码：',
        resourceLoadFailMessage: '抱歉，视频加载失败，错误码：',
        play: '播放',
        pause: '暂停',
        replay: "重播",
        volume: '音量',
        preference: '设置',
        fullscreen: '全屏',
        exitFullscreen: '退出全屏幕',
        coveredTheEntireScreen: '满屏',
        ad: '广告',
        second: '秒',
        sure: '确定',
        cancel: '取消',
        language: '语言',
        subtitles: '字幕',
        quality: '画质',
        auto: '自动',
        notAvailable: '不可选',
        noUseed: '不使用',
        ultimateHD: '超清',
        hd: '高清',
        sd: '标清',
        smooth: '流畅',
        rapidly: '极速',
        rightAnswerTitle: '恭喜你答对了',
        examinationQuestions: '检测题',
        continuePlay: '继续播放',
        reAnswer: '重新作答',
        question: '题',
        total: '共',
        hasAnswered: '已作答',
        failAnswerTitle: '很遗憾你答错了，请继续作答',
        fastreverse: "后退15秒",
        scale: "画面比例",
        chinese: "中文",
        english: "英文",
        japanese: "日文"
    },
    // 文档播放器
    documents: {
        main: {
            reload: '点击重载'
        },
        thumbanail: {
            noThumbanail: "该文档暂无缩略图"
        },
        message: {
            message: "抱歉，出了点小问题！",
            loadingTitle: "    加载中...    ",
            failTitle1: '文档加载失败，请',
            failTitle2: '刷新',
            failTitle3: '页面重新加载'
        },
        content: {
            top: '上',
            bottom: '下',
            left: '左',
            right: '右',
            loading: "加载中..."
        },
        bar: {
            thumbanail: '缩略图',
            drag: '拖拽',
            choiceWord: '选词',
            dragMode: '拖拽模式',
            zonedWrodMode: '划词模式',
            returnTopPage: '上次看到这里，点击回首页',
            prevPage: '上一页',
            nextPage: '下一页',
            prevScreen: '上一屏',
            nextScreen: '下一屏',
            narrow: '缩小',
            enlarge: '放大',
            fullscreen: '全屏',
            exitfullscreen: '退出全屏'
        }
        //fullscreen: '全屏',
        //exitFullscreen: '退出全屏幕',
        //prev: '上一页',
        //next: '下一页',
        //loading: '加载中',
        //drag: '拖拽',
        //thumbnail: '缩略图',
        //enlarge: '放大',
        //narrow: '缩小'
    },
    // 作答组件
    hunters: {
        // 前台页面
        frontPage: {
            //页面标题1
            pageTitle1: '题目作答',
            //页面标题2
            pageTitle2: '考试成绩',
            //页面标题3
            pageTitle3: '验证考试密码',
            //答题卡
            answerCart: '答题卡',
            //试卷查阅
            papreView: '试卷查阅',
            //试卷说明
            paperInstruction: '试卷说明',
            //考试结果查阅
            examResultView: '考试结果查阅',
            //试卷总分：
            totalScore: '试卷总分：',
            //学员得分：
            personScore: '学员得分：',
            //题目信息
            questionInfo: '题目信息',
            //本次成绩
            thisScore: '本次成绩',
            //本次客观题成绩
            thisObjectiveScore: '本次客观题成绩',
            //还有几次机会
            changeToExam: '还有{{countTime}}次机会',
            //总题数
            totalQuestions: '共{{totalQuestions}}题',
            //总分
            allScore: '总分：',
            //得分
            getScore: '得分：',
            //作答
            answer: '作答：',
            //答案
            result: '答案：',
            //注意
            notice: '注意',
            //作答结果
            answerResult: '作答：{{UserAnswer}}　正确答案:{{Answer}}',
            //分
            fen: '分',
            //共
            gong: '共',
            //题
            ti: '题',
            //分钟
            minute: '分钟',
            //及格
            pass: '及格',
            //总分标签
            score: '总分',
            //验证
            validate: '验证',
            //密码placeholder
            passwordPlace: '4位考试密码',
            //考试验证码1
            testValidate1: '请输入考试验证码后开始考试：',
            //考试验证码2
            testValidate2: '请联系监考老师获取验证码',
            //保存成功
            saveSuccess: '保存成功',
            //修改后试卷总分为 " + eval(paperPartScores.join('+')) + " 分，确认保存？
            editPaperScore: '修改后试卷总分为{{totalScore}}分，确认保存？',
            //正确答案：" + Answer + " 未作答
            noAnswer: '正确答案：{{answer}}未作答',
            //正确答案：" + Answer + " 作答
            hasAnswer: '正确答案：{{Answer}} 作答：{userAnswer}',
            //未作答
            noAnswerLabel: '未作答',

            // errorTitle
            passwordErrorTitle1: '请输入4位验证码，数字或英文字母组成',
            passwordErrorTitle2: '验证码错误'
        }
    },
    // 作答组件
    learning: {
        common: {
            judge:{
                //对
                right:'对',
                //错
                wrong:'错'
            },
            loading: {
                text: '正在加载'
            },
            updater:{
                noNeedToSave: "无需保存",
                saveSuccess: "保存成功",
                saveFaile: "保存失败"
            },
            explain: {
                title: '考试说明'
            },
            navigatorStat: {
                title: "本次成绩",
                accuracy: '正确率',
                right: '答对',
                question: '',
                error: '答错',
                noAnswer:'未做'
            },
            option: {
                answerTitle: '此选项为参考答案'
            },
            question: {
                temporarilyUncertain: '暂不确定',
                rightAnswerLabel: '正确答案',
                answerRightTitle: '您答对了',
                subjectiveUserAnswer: '主观题用户答案',
                questionExplanation: '题目详解',
                questionsExplanation: '套题详解',
                notScore: '\t不计分',
                score: '分',
                analysisTitle: '<暂无>',
                notAnswer: '您未作答',
                subQuestionUserTitle: '您错答为',
                singleChoice: '单选题',
                multipleChoice: '多选题',
                indefiniteChoice: '不定项选择题',
                completion: '填空题',
                subjectivity: '主观题',
                judgment: '判断题',
                matching: '连线题',
                complex: '套题'
            }
        },
        exam: {
            answer: {
                sure: '确定',
                retry: '重试',
                explanation: '试卷说明',
                msg1: '已完成全部题目，确定交卷吗？',
                msg2: "已完成 {{doneCount}} 题，还有 {{noAnswerCount}} 题未做，确定交卷吗？",
                commitExam: '交卷',
                commitFail: '交卷失败',
                continueAnswer: '继续答题',
                examFinishTitle: "本次考试时间已到, 不能继续答题"
            },
            header: {
                residualTime: '剩余用时',
                saveTitle: '保存答案',
                save: '保存'
            },
            parts:{
                buttonTitle: '点击可切换'
            },
            prepare: {
                back: '< 返回',
                question: '题',
                totalScore: '总分',
                pass: '及格',
                minute: '分钟',
                caution: '注意',
                timeHint: '距离考试结束',
                cautionItem1: '1、开始考试后不可暂停，时间到后自动交卷，请注意时间安排。',
                cautionItem2: '2、答题结束，点击“交卷”完成当前考试。',
                examFinishTitle: '考试已结束',
                examEndTitle: '距离考试结束还有：',
                examStartTitle: '距离开考还有：',
                examStartedTitle: '考试已开始：',
                examFinished: '本次考试时间已到, 不能继续答题',
                commit: '交卷',

                hours: '小时',
                minutes: '分',
                seconds: '秒',
                score: '分'
            }
        },
        exercise: {
            answer: {
                commit: '提交练习',
                reAnswer: '重新练习',
                explanation: '练习说明',
                exerciseScore: '本次成绩',
                noAnswer: "很抱歉！您尚未答题，不能提交答案。",
                continueAnswer: '继续答题',
                answerAllCommitTitle: "已完成全部题目，确定提交答案吗？",
                sure: '确定',
                cancel: '取消',
                partialFinishCommitTitle: "已完成 {{doneCount}} 题，还有 {{noAnswer}} 题未做，确定提交答案吗？",
            },
            prepare: {
                totalQuestion: '本练习共 {{totalCount}} 题',
                startAnswer: '开始练习',
                bestScoreCaption: '最好成绩：',
                right: '答对',
                question: '题',
                error: '答错',
                noAnswer:'未答',
                accuracy: '正确率'
            }
        }
    },
    homePage: {
        frontPage: {
            courseInfo: '{{Title}} ({{MinHours}}个学时，{{StudyNum}}人学习)'
        }
    },
    // 公开课频道
    single_courses: {
        frontPage: {
            //门公开课
            _single_courses: '门公开课',
            noCourses: '暂无此类课程'
        }
    },
    //登录页面
    login: {
        frontPage: {
            login: '登录',
            student: '学员',
            teacher: '教师',
            groupManager: '单位管理员',
            rememberMe: ' 记住我',
            password: '密码',
            techSupport: '技术支持',
            signUp: '注册',
            logining: '登录中',
            validCode: '验证码',
            tips: '看不清换一张',
            forgetPassword: '忘记密码',
            crmTel: '客服电话',
            previous: '前一个',
            after: '后一个',
            /*
             js文件部分
             */
            //用户名/身份证号码
            staticText1: '用户名/身份证号码',
            //请输入用户名/身份证号码
            staticText2: '请输入用户名/身份证号码',
            //91通行证
            staticText3: '91通行证',
            //请输入密码
            staticText4: '请输入密码',
            //请输入验证码
            staticText5: '请输入验证码',
            //用户名
            staticText6: '用户名',
            //身份证号码
            staticText7: '身份证号码',
            //用户中心获取验证码异常，请稍后刷新浏览器重试。
            staticText8: '用户中心获取验证码异常，请稍后刷新浏览器重试。',
            //用户中心服务器异常，请稍后刷新浏览器重试。
            staticText9: '用户中心服务器异常，请稍后刷新浏览器重试。',
            //请输入用户名
            staticText10: '请输入用户名'
        }
    },
    /*
     我的学习页面
     */
    myStudy: {
        frontPage: {
            //参加该课程
            enroll: '参加该课程',
            //选课管理
            courseMan: '选课管理',
            //培训
            train: '培训',
            //职位
            job: '职位',
            //公开课
            course: '公开课',
            //搜索课程
            searchCourse: '搜索课程...',
            //培训要求
            trainRequirement: "培训要求",
            //点击显示培训要求
            trainRequirementTips: '点击显示培训要求',
            //今日
            date: '今日',
            //培训已经结束
            trainFinished: '培训已经结束',
            //培训还剩
            trainLeft: "培训还剩",
            //天
            day: '天',
            //培训今天结束
            trainEdToday: '培训今天结束',
            //培训明天结束
            trainEdTomorrow: '培训明天结束',
            //继续选择
            chooseContinue: '继续选择',
            //培训已获得
            obtained: '培训已获得',
            //学时
            studyHour: '学时',
            //培训已选课程
            selectedCourse: '培训已选课程',
            //学习进度
            studyProgress: '学习进度',
            //已学
            learned: '已学',
            //共
            total: '共',
            //无学时要求
            noHoursRequired: '无学时要求',
            //培训合格
            qualifiedTrain: '培训合格',
            //培训未合格
            unqualifiedTrain: '培训未合格',
            //证书编号
            certificateNr: '证书编号：',
            //查看证书
            showCertificate: '查看证书',
            //恭喜你
            congratulation: '恭喜你，',
            //培训合格！
            qualifiedTrainM: '培训合格!',
            //培训尚未完成
            trainUnfinished: '培训尚未完成，',
            //继续努力
            learnContinue: '继续努力！',
            //很遗憾，
            apology: '很遗憾，',
            //培训未合格。
            unqualifiedTrainM: '培训不合格。',
            //门课程
            courseNr: '门课程',
            //本培训已结束，您可以：
            trainTipsText1: '本培训已结束，您可以：',
            //1、通过笔记和答疑进行复习回顾
            trainTipsText2: '1、通过笔记和答疑进行复习回顾',
            //2、切换学习其他培训 或者
            trainTipsText3: '2、切换学习其他培训 或者 ',
            //报名新的培训
            trainTipsText4: '报名新的培训',
            //2、切换学习其他课程 或者
            trainTipsText5: '2、切换学习其他课程 或者 ',
            //报名新的课程
            trainTipsText6: '报名新的课程',
            //2、切换学习其他职位 或者
            trainTipsText7: '2、切换学习其他职位 或者 ',
            //报名新的职位
            trainTipsText8: '报名新的职位',
            //默认排序
            defaultSort: '默认排序',
            //最近学习
            latestLearned: '最近学习',
            //正在努力加载中，请稍侯。
            loading: '正在努力加载中，请稍侯。',
            //抱歉，没有
            courseText1: '抱歉，没有“',
            //的相关课程
            courseText2: '”的相关课程',
            //建议您：
            courseText3: '建议您：',
            //更改关键字再进行搜索
            courseText4: '更改关键字再进行搜索',
            /*
             培训提醒部分文本
             */
            //学习
            learn: '学习',
            //亲爱的学员，本培训需要您修满
            textPart1: '亲爱的学员，本培训需要您修满',
            //学时，其中：
            textPart2: '学时，其中：',
            //门必修课，获得
            textPart3: '门必修课，获得',
            //门选修课，获得
            textPart4: '门选修课，获得',
            //参加并通过相应的考试
            textPart5: '参加并通过相应的考试',
            //，获得
            textPart6: '，获得',
            //考试待定，请等待通知
            textPart7: '考试待定，请等待通知',
            //请于
            textPart8: '请于',
            //前完成上述内容的学习
            textPart9: '前完成上述内容的学习',
            //及考试
            textPart10: '及考试',
            //，获取培训证书
            textPart11: '，获取培训证书',
            /*
             星期
             */
            monday: '星期一',
            tuesday: '星期二',
            wednesday: '星期三',
            thursday: '星期四',
            friday: '星期五',
            saturday: '星期六',
            sunday: '星期日',
            unknown: '未知',
            /*
             button相关
             */
            //开始学习
            studyBegin: '开始学习',
            //复习回顾，
            studyPreview: '复习回顾',
            //继续上次学习
            continueLatestStudy: '继续上次学习',
            //继续学习
            continueStudy: '继续学习',
            //培训切换
            changeTrain: '培训切换',
            //我的课程
            myCourses: '我的课程',
            //未知姓名
            unknownName: '未知姓名',
            /*
             EmtpyIndex
             */
            //未报名任何培训
            emptyIndexText1: '未报名任何培训',
            //未报名培训
            emptyIndexText2: '未报名培训',
            //未报名任何培训，无学时要求
            emptyIndexText3: '未报名任何培训，无学时要求',
            //未报名任何培训， 快快去报名吧
            emptyIndexText4: '未报名任何培训， 快快去报名吧',
            /*
             js 静态文件中的文本国际化
             */
            //请勿输入非法字符。
            staticText1: '请勿输入非法字符。',
            //学员您好！您的基本资料不完整，可能影响培训结果或导致证书生成失败，请在完善基本资料后继续学习。
            staticText2: '学员您好！您的基本资料不完整，可能影响培训结果或导致证书生成失败，请在完善基本资料后继续学习。',
            //去补全资料
            staticText3: '去补全资料',
            //学员您好！您的报名信息不完整，可能影响培训结果或导致证书生成失败，请在完善报名信息后继续学习。
            staticText4: '学员您好！您的报名信息不完整，可能影响培训结果或导致证书生成失败，请在完善报名信息后继续学习。',
            //公告
            notices: '公告'
        }
    },
    //课程章节
    courseChapters: {
        frontPage: {
            //参加该课程
            //enrollAdvance:'请先报名',
            enrollAdvance: '参加该课程',
            //必修
            requiredCourse: '必修',
            //选修
            selectiveCourse: '选修',
            //课
            course: '课',
            //【收起】
            hide: '[收起]',
            //【显示全部】
            showAll: '[显示全部]',
            //返回课程列表
            backCourseList: '返回',
            //课程封面
            logoImage: '课程封面',
            /*
             用户学习提醒类文本
             */
            //我知道了
            learnText1: '我知道了',
            //学习小贴士
            learnText2: '学习小贴士',
            //看视频
            learnText3: '[看视频]',
            //请正常播放观看视频，拖动的进度将不计入学时。如视频中穿插课堂练习题，请答对题目后继续观看视频。
            learnText4: '请正常播放观看视频，拖动的进度将不计入学时。如视频中穿插课堂练习题，请答对题目后继续观看视频。',
            //看文档
            learnText5: '[看文档]',
            //本课程文档有学习时间要求，请注意文档左下方的倒计时，倒计时结束后方可获得对应学时。
            learnText6: '本课程文档有学习时间要求，请注意文档左下方的倒计时，倒计时结束后方可获得对应学时。',
            //做练习
            learnText7: '[做练习]',
            //本课程共有<!--ko text:PracticeTotal--><!--/ko-->道练习题，做对<!--ko text:Math.ceil(PracticeToClassHour()*PracticeLimit())--><!--/ko-->题可获得练习对应学时。
            learnText8: '本课程共有{{totalEx}}道练习题，做对{{remindsEx}}题可获得练习对应学时。',
            //上次学习到：<span>@lastCatalogName
            learnText9: '上次学习到：{{lastCatalogName}}',
            //未学
            notLearned: '未学',
            courseOutline: '课程目录',
            //课程作业
            courseEx: '课程作业',
            //查看更多
            getMore: '查看更多',
            //最新提问
            latestQuestion: '最新提问',
            //最新笔记
            latestNote: '最新笔记',
            //显示全部
            showAll: '显示全部',
            //资料下载
            resourceDownload: '资料下载',
            //下载
            download: '下载',
            //任务
            task: '任务',
            //页
            page: '页',
            //题
            question: '题',
            //再次学习
            learnAgain: '再次学习',
            //开始练习
            startEx: '开始练习',
            //继续练习
            continueEx: '继续练习',
            //再次练习
            previewEx: '再次练习',
            /*
            js文件
             */
            // "请于" + taskEndTime + "前完成“" + taskTitle + "”—《"
            staticText1: '请于{{taskEndTime}}前完成“{{taskTitle}}”-《',
            //》的学习。
            staticText2: '》的学习。'
        }
    },


    /*
     选课页面
     */
    courseChoice: {
        frontPage: {
            //保存所选课程
            text1: '保存所选课程',
            //还差<em> remain </em>学时，请调整课程组合
            text2: '还差<em>{{remain}}</em>学时，请调整课程组合',
            //本课程无大纲, 请见谅!
            text3: '本课程无大纲, 请见谅!',
            //如果取消在学选修课，该课程已完成学时将不计入您的学习进度中。
            text4: '如果取消在学选修课，该课程已完成学时将不计入您的学习进度中。',
            //我知道了
            text5: '我知道了',
            //重新选课
            text6: '重新选课',
            //确认并开始学习
            text7: '确认并开始学习',
            //系统提示
            text8: '系统提示'

        }
    },
    /*
        教师评课页面
    */
    teachCheck: {
        frontPage: {
            //我的概览(home-index)
            myOverview: '我的概览',
            //您当前负责：
            yourResponsibility: '您当前负责：',
            //门课程
            courses: '门课程',
            //共有：
            allCount: '共有：',
            _allCount: '共有',
            //条未完成的答疑，已完成答疑
            questionView: '条未完成的答疑，已完成答疑',
            //条
            item: '条',
            //场考试，
            examCount: '场考试，',
            //张卷子待批改
            paperCountToView: '张卷子待批改',
            //当前老师答疑统计
            questionCountTeach: '当前老师答疑统计',
            //查询
            search: '查询',
            //日期
            date: '日期',
            //答疑数
            questionCount: '答疑数',
            //共:
            totalCount: '共:{{count}}',
            //抱歉，查询日期内没有答疑信息
            searchQuestionNone: '抱歉，查询日期内没有答疑信息',
            //当前老师阅卷统计
            paperCountTeach: '当前老师阅卷统计',
            //阅卷数
            overviewCount: '阅卷数',
            //题量
            amounts: '题量',
            //份
            fen: ' 份',
            //题
            ti: ' 题',
            //抱歉，查询日期内没有阅卷信息
            searchOverviewNone: '抱歉，查询日期内没有阅卷信息',
            //时间不能为空
            dateNoneError: '时间不能为空',

            ovewview: "sdfasdf",
            //开始阅卷(mark-exam)
            beginOverview: '开始阅卷',
            //返回
            back: '返回',
            //题目
            examination: '题目',
            //作答人次
            answerPerson: '作答人次',
            //已阅人次
            hasReadPerson: '已阅人次',
            //待阅人次
            willReadPerson: '待阅人次',
            //阅卷
            overview: '阅卷',

            //我的阅卷(mark-index)
            myViewPaper: '我的阅卷',
            //考试名
            examName: '考试名',
            //所属培训
            trainBelongs: '所属培训',
            //所属项目
            projectBelongs: '所属项目',
            //开始时间
            beginTime: '开始时间',
            //已阅(份)
            hasReadCount: '已阅(份)',
            //待阅(份)
            willReadCount: '待阅(份)',
            //成绩详情
            scoreDetail: '成绩详情',
            //成绩
            result: '成绩',
            //考试说明
            examDescription: '考试说明',
            //说明
            instruction: '说明',
            //选择试卷
            paperSelect: '选择试卷',
            //总评：
            _general: '总评：',
            //不错
            pretty: '不错',

            //考试成绩详细说明(mark-offlinecorrect)
            examResultDescription: '考试成绩详细说明',
            //点评
            comment: '点评',
            //子科目
            subSubject: '子科目',
            //科目
            subject: '科目',
            //请选择成绩
            resultSelect: '请选择成绩',
            //通过
            pass: '通过',
            //有条件通过
            conditionalPass: '有条件通过',
            //不通过
            notPass: '不通过',
            //保存并下一个
            saveAndNext: '保存并下一个',
            //保存
            save: '保存',
            //考生答卷
            examineeAnswer: '考生答卷',
            //下载
            download: '下载',
            //总评
            general: '总评',
            //请输入总成绩
            inputTotalScore: '请输入总成绩',
            //分值保留一位小数，且不能超过10000
            decimalError: '分值保留一位小数，且不能超过10000',
            //姓名：
            name: '姓名：',
            //帐号：
            account: '帐号：',
            //选择单位
            unitSelect: '选择单位',
            //是否批改：
            whetherCorrect: '是否批改：',
            //全部
            all: '全部',
            //是
            yes: '是',
            //否
            no: '否',
            //是否合格：
            whetherQualified: '是否合格：',
            //答卷导出
            paperOutput: '答卷导出',
            //成绩导出
            resultOutput: '成绩导出',
            //下载成绩导入模版
            downloadAndInput: '下载成绩导入模版',
            //成绩导入
            resultInput: '成绩导入',
            //位同学完成考试
            studentFinishExam: '位同学完成考试',
            //是否合格
            passOrNot: '是否合格',
            //操作
            operation: '操作',
            //查看
            view: '查看',
            //暂无数据
            noDataNow: '暂无数据',
            //修改成绩
            modifyResult: '修改成绩',
            //批改
            correct: '批改',
            //文件：
            file: '文件：',
            //开始导入
            beginInput: '开始导入',
            //导入说明：
            inputInstruction: '导入说明：',
            //1、仅支持10MB大小以下Excel格式文件。
            inputTip1: '1、仅支持10MB大小以下Excel格式文件。',
            //2、建议每次导入考试成绩数量不超过200条，否则将造成系统长时间无响应或<br/>导入失败！
            inputTip2: '2、建议每次导入考试成绩数量不超过200条，否则将造成系统长时间无响应或导入失败！',
            //用户导入信息错误:
            userInputError: '用户导入信息错误:',
            //姓名
            _name: '姓名',
            //帐号
            _account: '帐号',
            //用户导入
            userInput: '用户导入',
            //答卷导出
            resultOutput: '答卷导出',
            //请选择要导入的excel
            selectInputExcel: '请选择要导入的excel',
            //确认
            confirm: '确认',
            //取消
            cancel: '取消',
            //导入成功
            inputSuccess: '导入成功',
            //下载错误文档
            downloadError: '下载错误文档',
            //有" + result + "位学员已有成绩，是否覆盖学员成绩？
            convertResultOrNot: '有{{count}}位学员已有成绩，是否覆盖学员成绩？',

            //试卷详情(mark-offlineexaminfo)
            paperDetail: '试卷详情',
            //考试信息
            examInfo: '考试信息',
            //考试子科目说明
            examSubjectInstruction: '考试子科目说明',
            //及格线
            passLine: '及格线',
            //资料下载
            dataDownload: '资料下载',
            //干系人分析
            personAnalysis: '干系人分析',

            //开始批改(mark-question)
            beginCorrect: '开始批改',
            //返回开始阅卷
            backToView: '返回开始阅卷',
            //学员信息:
            studendInfo: '学员信息:',
            //当前分数:
            currentScore: '当前分数:',
            //学员答案:
            studentAnswer: '学员答案:',
            //关闭
            close: '关闭',
            //参考答案:
            referenceAnswer: '参考答案:',
            //本题题目:
            thisTopic: '本题题目:',
            //本题得分:
            thisScore: '本题得分:',
            //分数不可改，判卷请谨慎
            correctTip: '分数不可改，判卷请谨慎',
            //拖动进度条来修改分数,也可以在文本框中直接输入分值
            modifyTip: '拖动进度条来修改分数,也可以在文本框中直接输入分值',
            //显示学员信息
            showStudentInfo: '显示学员信息',
            //显示参考答案
            showReferenceAnswer: '显示参考答案',
            //显示题干
            showQuestion: '显示题干',
            //提交>>
            submit: '提交>>',
            //结束
            finish: '结束',
            //本次阅卷完成了
            viewPerson: '本次阅卷完成了',
            //人
            person: '人',
            //还有'+(model.userIds().length-1-model.num())+'人'
            personLess: '还有{{count}}人',
            //Score+' 分'
            scoreNum: '{{score}} 分',
            //(总分 @questionScore.Scores.Sum() 分)
            _totalScore: '(总分 {{totalScore}} 分)',
            //请输入数值
            inputNumber: '请输入数值',
            //已经是最后一个学生了，是否结束
            finishOrNot: '已经是最后一个学生了，是否结束',
            //试卷名称
            paperName: '试卷名称',

            //项目切换(partial-hasenrolledtrain)
            projectSwitch: '项目切换',
            //培训切换
            trainSwitch: '培训切换',


            //我的答疑(partial-userinfo)
            myQuestion: '我的答疑',
            //我的阅卷
            myMarking: '我的阅卷',
            //我的作业
            myWork: '我的作业',

            //待回复(quiz-index)
            waitReply: '待回复',
            //已回复
            replied: '已回复',
            //状态：
            status: '状态：',
            _status: '状态',
            //课程：
            _course: '课程：',
            //类型：
            type: '类型：',
            _type: '类型',
            //常见
            common: '常见',
            //私有
            private: '私有',
            //条待回复
            replyCount: '条待回复',
            //课程-章节
            courseCharpter: '课程-章节',
            //内容
            content: '内容',
            //提问时间
            questionTime: '提问时间',
            //回复
            reply: '回复',
            //删除
            remove: '删除',
            //还可以输入
            inputEnter: '还可以输入',
            //字
            word: '字',
            //'来自:'+CatalogTitle
            from: '来自: {{name}}',
            //取消设置常见问题
            cancelCommonQuestion: '取消设置常见问题',
            //设为常见问题
            setCommonQuestion: '设为常见问题',
            //确认删除答疑吗? (回复同时也会被删除)
            questionDelConfirm: '确认删除答疑吗? (回复同时也会被删除)',
            //答疑回复
            questionReply: '答疑回复',

            //作业名称：(userjob-index)
            workName: '作业名称：',
            //是否评分：
            scoreOrNot: '是否评分：',
            //提交时间：
            submitDate: '提交时间：',
            //作业导出
            workOutput: '作业导出',
            //一共提交
            commitAll: '一共提交',
            //份作业
            workItem: '份作业',
            //作业名称
            _workName: '作业名称',
            //提交时间
            _submitDate: '提交时间',
            //未评分
            noScore: '未评分',
            //分数
            _score: '分数',
            //返回列表
            backList: '返回列表',
            //请输入0-100间数字
            formatTip: '请输入0-100间数字',
            //提交评分
            commitScore: '提交评分',
            //下一份
            nextItem: '下一份',
            //附件下载：
            attachLoad: '附件下载：',
            //成绩：
            _result: '成绩：',
            //培训：
            train: '培训：',
            //清除
            clear: '清除',
            //请先选择要导出的作业。
            selectOutputWork: '请先选择要导出的作业。',
            //您选择了" + countAll + "条记录，超过导出上限" + viewModel.model.checkLimit() + " ，如选择确定，将导出前" + viewModel.model.checkLimit() + "份文档。
            confirmTipWork: '您选择了{{count}}条记录，超过导出上限{{limit}} ，如选择确定，将导出前{{prevItem}}份文档。',
            //成绩采用百分制，请输入0-100的数字。
            scoreFormat: '成绩采用百分制，请输入0-100的数字。',
            //评分提交后，将不能再被修改，确认提交？
            submitConfirm: '评分提交后，将不能再被修改，确认提交？',
            //导出中..
            outputing: '导出中..',
            //退出登录
            logout: '退出登录',

            //评分
            score:'评分',


            studentInfo: '学员信息：'
        }
    },

    /*
        单位管理界面
    */
    unitManage: {
        frontPage: {
            //报名管理(home-index)
            rollManage: '报名管理',
            //项目：
            proj: '项目：',
            _proj: '项目',
            //分类：
            type: '分类：',
            //培训：
            train: '培训：',
            _train: '培训',
            //学习状态：
            studyStatus: '学习状态：',
            //付款状态：
            payStatus: '付款状态：',
            //学员：
            stuPerson: '学员：',
            //文件：
            file: '文件：',
            //导入说明：
            inputDescrip: '导入说明：',
            //全部
            all: '全部',
            //已付款
            hasPay: '已付款',
            //未付款
            unPay: '未付款',
            //免费
            free: '免费',
            //查询
            search: '查询',
            //导出
            output: '导出',
            //批量导入学员
            inputStuBatch: '批量导入学员',
            //学员
            _stuPerson: '学员',
            //单位
            _unit: '单位',
            //培训名称
            _trainName: '培训名称',
            //付款状态
            _payStatus: '付款状态',
            //学习状态
            _studyStatus: '学习状态',
            //加入时间
            _joinTime: '加入时间',
            //操作
            _operation: '操作',
            //待审核
            pendingAudit: '待审核',
            //审核拒绝
            rejectAudit: '审核拒绝',
            //审核通过
            passAudit: '审核通过',
            //待选课
            waitElecCourse: '待选课',
            //学习中
            studying: '学习中',
            //正在加载中...
            onLoading: '正在加载中...',
            //姓名或
            holderTxt: '姓名或{{name}}',
            //导入中，请稍候...
            onImporting: '导入中，请稍候...',
            //下载导入模板
            loadImportTpl: '下载导入模板',
            //(说明：模板中红色部分为必填项)
            formTip: '(说明：模板中红色部分为必填项)',
            //1、单次的导入学员数控制在500人内
            importTip1: '1、单次的导入学员数控制在500人内',
            //2、当前导入只支持免费类，收费类的培训请联系平台客服人员
            importTip2: '2、当前导入只支持免费类，收费类的培训请联系平台客服人员',
            //用户导入信息错误
            importUserError: '用户导入信息错误',
            //开始导入
            importBegin: '开始导入',
            //查看报名资料
            viewRollInfo: '查看报名资料',
            //用户导入
            userImport: '用户导入',
            //无学员信息
            noStuInfo: '无学员信息',
            //请选择上传文件
            selectFile: '请选择上传文件',
            //导入成功
            importSuccess: '导入成功',
            //下载错误文档
            loadErrorTxt: '下载错误文档',

            //证书查询(home-cart)
            cartQuery: '证书查询',
            //证书：
            cart: '证书：',
            //证书状态：
            cartStatus: '证书状态：',
            //证书编号：
            cartCode: '证书编号：',
            //证书名称
            _cartName: '证书名称',
            //证书状态
            _cartStatus: '证书状态',
            //证书编号
            _cartCode: '证书编号',
            //证书生成时间
            _cartGeneralDate: '证书生成时间',
            //已生成
            hasGeneral: '已生成',
            //待生成
            waitGeneral: '待生成',
            //证书说明
            cartDescrip: '证书说明',
            //获取证书地址失败
            getCartError: '获取证书地址失败',


            //单位资料(home-info)
            unitInfo: '单位资料',
            //基本信息
            baseInfo: '基本信息',
            //单位全称：
            unitFullName: '单位全称：',
            //单位简称：
            unitName: '单位简称：',
            //单位地址：
            unitAddress: '单位地址：',
            //联系人：
            contactPerson: '联系人：',
            //联系电话：
            contactTel: '联系电话：',
            //联系邮箱：
            contactEmail: '联系邮箱：',
            //注册地：
            registerAddress: '注册地：',
            //组织机构代码：
            organizationCode: '组织机构代码：',
            //所属分类：
            belongsType: '所属分类：',
            //保存修改
            update: '保存修改',
            //其他信息
            otherInfo: '其他信息',
            //备注：若需修改资料，请联系平台客服
            updateTip: '备注：若需修改资料，请联系平台客服',
            //必选字段
            requiredField: '必选字段',
            //请填写正确格式的电子邮件
            emailTip: '请填写正确格式的电子邮件',
            //请填写正确格式的联系电话
            telTip: '请填写正确格式的联系电话',
            //请填写单位地址
            addressTip: '请填写单位地址',
            //请填写联系人
            contactTip: '请填写联系人',
            //请填写联系电话
            contactTelTip: '请填写联系电话',
            //请填写联系邮箱
            contactEmailTip: '请填写联系邮箱',
            //保存成功
            saveSuccess: '保存成功',

            //帐号信息(home-myinfo)
            accountInfo: '帐号信息',
            //姓名：
            name: '姓名：',
            //身份证：
            idCart: '身份证：',
            //电子邮箱：
            email: '电子邮箱：',
            //原密码：
            originalPassW: '原密码：',
            //新密码：
            newPassW: '新密码：',
            //重复新密码：
            repeatPassW: '重复新密码：',
            //原邮箱
            originalEmail: '原邮箱',
            //新邮箱：
            newEmail: '新邮箱：',
            //修改密码
            updatePassW: '修改密码',
            //确认修改
            confirmEdit: '确认修改',
            //新密码和重复新密码不同
            passWTip: '新密码和重复新密码不同',
            //修改电子邮箱
            emailEdit: '修改电子邮箱',
            //密码格式不正确
            passwordFormatError: '密码格式不正确',
            //请输入原密码
            inputOriginalPassword: '请输入原密码',
            //请输入密码 区分大小写(不含特殊字符)
            passwordFormat: '请输入密码 区分大小写(不含特殊字符)',
            //{0}~{1}位字符组成
            passwordSizeFormat: '{0}~{1}位字符组成',
            //新旧密码不能相同
            passwordRepeat: '新旧密码不能相同',
            //请再输一次密码
            passwordAgain: '请再输一次密码',
            //两次密码输入不一致
            passwordNoMap: '两次密码输入不一致',
            //请输入新电子邮箱
            inputNewEmail: '请输入新电子邮箱',
            //输入的电子邮箱格式有误
            emailFormatError: '输入的电子邮箱格式有误',
            //"原密码错误"
            originalPasswordError: '原密码错误',

            //合格查询(home-pass)
            qualifyQuery: '合格查询',
            //合格状态：
            qualifyStatus: '合格状态：',
            //合格
            pass: '通过',
            //未合格
            unPass: '未通过',
            //合格
            qualify: '合格',
            //未合格
            unQualify: '未合格',
            //学时情况
            hoursSituation: '学时情况',
            //考试
            examination: '考试：',
            //考试
            _examination: '考试',
            //培训情况
            trainSituation: '培训情况',
            //达成日期
            reachDate: '达成日期',
            //已修/要求学时：
            requiredHours: '已修/要求学时：',
            //课程获得：
            fromCourse: '课程获得：',
            //考试获得：
            fromExamination: '考试获得：',
            //合格数据更新成功
            dataUpdateSuccess: '合格数据更新成功',

            //成绩查询(home-score)
            scoreQuery: '成绩查询',
            //考试状态：
            examStatus: '考试状态：',
            //已考
            hasExam: '已考',
            //待考
            waitExam: '待考',
            //考试次数
            examCount: '考试次数',
            //考试方式
            examWay: '考试方式',
            //成绩
            score: '成绩',

            //报名资料(home-traineeinfo)
            registerData: '报名资料',
            //姓名/帐号：
            accountOrName: '姓名/帐号：',
            //必填项
            required: '必填项',
            //选填项
            optional: '选填项',
            //的附加信息
            attachInfo: '的附加信息',
            //（支持上传文档、图片、压缩包格式的文件，文件大小不超过
            fileTip1: '（支持上传文档、图片、压缩包格式的文件，文件大小不超过',
            //，至多添加
            fileTip2: '，至多添加',
            //个附件
            fileTip3: '个附件',
            //保存
            save: '保存',
            //福建省
            fjProvince: '福建省',
            //请选择所在区域
            selectArea: '请选择所在区域',
            //更新成功
            updateSuccess: '更新成功',

            //注册单位(register-index)
            registerUnit: '注册单位',
            //单位资料请仔细填写，提交后不允许修改。
            unitDateTip1: '单位资料请仔细填写，提交后不允许修改。',
            //请正确填写注册地，此项内容
            unitDataTip2: '请正确填写注册地，此项内容',
            //与证书编号有关
            unitDataTip3: '与证书编号有关',
            //请正确选择
            unitDataTip4: '请正确选择',
            //单位管理员
            unitSuper: '单位管理员',
            //提示：
            prompt: '提示：',
            //1、以下填写的身份证将作为单位管理员查看本单位学生报名学习情况的登录帐号，请正确填写。
            unitDataTip5: '1、以下填写的身份证将作为单位管理员查看本单位学生报名学习情况的登录帐号，请正确填写。',
            //2、以下收集的信息只用于核对身份真实性，本站保护用户隐私。
            unitDataTip6: '2、以下收集的信息只用于核对身份真实性，本站保护用户隐私。',
            //身份证（正面）：
            idCartFront: '身份证（正面）：',
            //企业所在地信息
            unitAdInfo: '企业所在地信息',
            //验证码：
            verifyCode: '验证码：',
            _verifyCode: '验证码',
            //看不清换一张
            changeCode: '看不清换一张',
            //注册
            register: '注册',
            //访问受限
            accessLimit: '访问受限',
            //抱歉！
            sorry: '抱歉！',
            //您无权访问该页面...
            noRightAccess: '您无权访问该页面...',
            //联系客服：0591-63183000  QQ:1369080504
            customerService: '联系客服：0591-63183000  QQ:1369080504',
            //返回
            back: '返回',
            //（仅支持小于2M 的JPG、PNG图片文件）
            uploadFormat: '（仅支持小于2M 的JPG、PNG图片文件）',
            //企业所在地：
            enterpAddress: '企业所在地：',
            //企业注册地：
            enterpRegister: '企业注册地：',
            //忘记组织机构代码，
            forgetOrganizationCode: '忘记组织机构代码，',
            //点击查询
            clickQuery: '点击查询',
            //图片
            picture: '图片',
            //请选择小于2M的图片
            picUploadLimit: '请选择小于2M的图片',
            //请不要一直重复上传
            repeatUpload: '请不要一直重复上传',
            //身份证格式不正确
            idFormatError: '身份证格式不正确',
            //联系电话格式有误，请重新输入
            contactPhoneError: '联系电话格式有误，请重新输入',
            //请输入单位全称
            putUnitFullName: '请输入单位全称',
            //此单位全称已被注册，请更换
            fullNameRepeat: '此单位全称已被注册，请更换',
            //请输入单位简称
            putUnitName: '请输入单位简称',
            //此单位简称已被注册，请更换
            nameRepeat: '此单位简称已被注册，请更换',
            //请输入单位地址
            putUnitAd: '请输入单位地址',
            //请输入联系人
            putContact: '请输入联系人',
            //请输入联系电话
            putContactPhone: '请输入联系电话',
            //请选择企业所在地
            selectUnitAd: '请选择企业所在地',
            //请输入姓名
            putName: '请输入姓名',
            //请上传身份证正面照
            idCartFrontPic: '请上传身份证正面照',
            //请输入验证码
            putVerifyCode: '请输入验证码',
            //验证码错误
            verifyCodeError: '验证码错误',
            //请输入身份证号码
            putIdCart: '请输入身份证号码',
            //该身份证号未注册，请先
            idCartNoRegister: '该身份证号未注册，请先',
            //请您填写组织结构代码
            putOrganizationCode: '请您填写组织结构代码',
            //该组织结构代码已存在
            organizationCodeRepeat: '该组织结构代码已存在',
            //创建成功
            createSuccess: '创建成功',

            //输入查找关键字(shared)
            keywordSearch: '输入查找关键字',
            //抱歉，没有找到关键字为“
            sorryNoFind: '抱歉，没有找到关键字为“',
            //建议更换关键字进行搜索。
            changeKeyword: '建议更换关键字进行搜索。',
            //单位切换
            switchUnit: '单位切换',
            //的单位
            unitKey: '”的单位'

        }
    },
    /*
    用户设置
    */
    userSetting: {
        frontPage: {
            //基本信息(user-setting-personalinfo)
            baseInfo: '基本信息',
            //注册信息
            registerInfo: '注册信息',
            //姓名：
            name: '姓名：',
            //个人资料
            personalInfo: '个人资料',
            //必填项
            required: '必填项',
            //选填项
            optional: '选填项',
            //保存
            save: '保存',

            //头像设置(user-setting-personalinfo)
            avatarSetting: '头像设置',
            //设置头像
            settingAvatar: '设置头像',

            //修改密码(user-setting-password)
            updatePassword: '修改密码',
            //当前密码：
            currentPassword: '当前密码：',
            //新密码：
            newPassword: '新密码：',
            //确认新密码：
            confirmNewPassword: '确认新密码：',
            //您使用的是@(ViewBag.AucAccountTpyeName)登录本平台，无法在此修改密码，请前往原平台修改密码。
            updateLimitTip: '您使用的是{{way}}登录本平台，无法在此修改密码，请前往原平台修改密码。',
            //前往用户中心
            goUserCenter: '前往用户中心',
            //修改密码成功
            updatePasswordSuccess: '修改密码成功',
            //请前往用户中心完善安全信息后再修改密码。
            improveInfo: '，请前往用户中心完善安全信息后再修改密码。',
            //请输入6~12个字符密码 (区分大小写)
            passwordFormat: '请输入6~12个字符密码 (区分大小写)',
            //"密码长度不正确，请输入6~12个字符，区分大小写"
            passwordSizeError: '"密码长度不正确，请输入6~12个字符，区分大小写"',

            //帐号设置(user-shared-elearninguserlayout)
            accountSetting: '帐号设置'
        }
    },

    /*
        我的考试
    */
    myExam: {
        frontPage: {
            //我的考试
            myExam: '我的考试',
            //暂无考试安排，请等待通知。
            noExamTip: '暂无考试安排，请等待通知。',
            //正在加载中，请稍候...
            onLoading: '正在加载中，请稍候...',
            //[必修课]
            requiredCourse: '[必修课]',
            //[选修课]
            optionalCourse: '[选修课]',
            //学时
            studyHour: '学时',
            //开考条件
            examCondition: '开考条件',
            //全部选修课
            allOptionalCourse: '全部选修课',
            //本考试无学时要求
            noExamHourLimit: '本考试无学时要求',
            //要求学时不足
            lessHour: '要求学时不足',
            //此考试在线下进行
            examOffLine: '此考试在线下进行',
            //最好成绩：
            bestResult: '最好成绩：',
            //合格线：
            passLine: '合格线：',
            //很遗憾，考试已结束
            soPity: '很遗憾，考试已结束',
            //查看成绩
            viewResult: '查看成绩',
            //考试说明
            examInfomation: '考试说明',
            //考试时间未到
            timeFull: '考试时间未到',
            //共有
            all: '共有',
            //次考试机会
            changeOfExam: '次考试机会',
            //考试中
            onExaming: '考试中',
            //开始考试
            beginExam: '开始考试',
            //主观题等待批改
            subjectCorrect: '主观题等待批改',
            //您还有
            changeRemain: '您还有',
            //上次成绩：
            resultOfPrev: '上次成绩：',
            //分(主观题等待批改)
            subjectScore: '分(主观题等待批改)',
            //未通过
            noPass: '未通过',
            //查卷时间：不允许查卷
            limitView: '查卷时间：不允许查卷',
            //查看作答情况
            viewAnswerResult: '查看作答情况',
            //已通过
            pass: '已通过',
            //查卷时间：
            viewTime: '查卷时间：{{time}}',
            //您共有
            allChange: '您共有',
            //(未含主观题成绩)
            unContainerSubject: '(未含主观题成绩)',
            //已上传答卷，考试结束前可以修改
            submitPaper: '已上传答卷，考试结束前可以修改',
            //考试进行中，请注意时间安排
            noticeExamTime: '考试进行中，请注意时间安排',
            //等待批改
            waitCorrect: '等待批改',
            //进入考试
            enterExam: '进入考试',
            //要求
            demand: '要求',
            //已学
            alreadyStudy: '已学',
            //分
            fen: '分',
            //即时查卷
            instantView: '查卷时间：交卷后立即查看',
            //考试机会用完后查看
            numView: '查卷时间：考试机会用完后查看'
        }
    },

    /*
        上传组件
    */
    uploadWidget: {
        frontPage: {
            //文件大小超过2MB，请重新选择
            fileSizeLimit: '文件大小超过2MB，请重新选择',
            //图片格式不正确，请重新选择
            picFormatLimit: '图片格式不正确，请重新选择',
            //保存成功
            saveSuccess: '保存成功',
            //请选择上传图片
            selectPic: '请选择上传图片',
            //文件为空，无法上传
            fileNoSize: '文件为空，无法上传',
            //您所选择的文件的格式不符合要求,请重新选择！
            fileNoMatch: '您所选择的文件的格式不符合要求,请重新选择！',
            //上传出错
            uploadError: '上传出错',
            //返回状态为
            backStatus: '返回状态为'
        }
    },

    /*
        udialog弹框组件
    */
    dialogWidget: {
        frontPage: {
            //关闭
            close: '关闭',
            //系统提示
            systemTip: '系统提示',
            //确认
            confirm: '确认'
        }
    },

    /*
        datepicker组件
    */
    datepickerWidget: {
        frontPage: {
            closeText: '关闭',
            prevText: '&#x3C;上月',
            nextText: '下月&#x3E;',
            currentText: '今天',
            monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
            '七月', '八月', '九月', '十月', '十一月', '十二月'],
            monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月',
            '七月', '八月', '九月', '十月', '十一月', '十二月'],
            dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
            dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
            weekHeader: '周',
            dateFormat: 'yy-mm-dd',
            yearSuffix: '年'

        }
    },
    mobileDownload: {
        frontPage: {
            //移动端下载
            mobileDownload: '移动端下载',
            //帐号设置
            setAccount: '帐号设置',
            //去学习
            goStudy: '去学习',
            //我的培训
            myTrain: '我的培训',
            //报名培训
            registeredTrain: '报名培训',
            //查看所有消息
            viewAllMessage: '查看所有消息',
            //最新消息
            newMessage: '最新消息',
            //没有消息
            noMessage: '没有消息',
            //Android下载
            androidDownload: 'Android下载',
            //Android即将推出
            androidWillGo: 'Android即将推出',
            //已有帐号
            hasAccount: '已有帐号？',
            //登录
            login: '登录',
            //退出登录
            logout: '退出登录',
            //aPad即将推出
            aPadWillGo: 'aPad即将推出',
            //aPad下载
            aPadDownload: 'aPad下载',
            //iPhone下载
            iPhoneDownload: 'iPhone下载',
            //iPhone即将推出
            iPhoneWillGo: 'iPhone即将推出',
            //iPad下载
            iPadDownload: 'iPad下载',
            //iPad即将推出
            iPadWillGo: 'iPad即将推出',
            //手机扫描快速下载
            phoneScanDownload: '手机扫描快速下载',
            //课程下载，离线观看
            courseDownload: '课程下载，离线观看',
            //将课程资源下载到本地，无网络时也能看，节省流量又方便
            courseDownloadText: '将课程资源下载到本地，无网络时也能看，节省流量又方便',
            //提问题、记笔记
            askAndNotes: '提问题、记笔记',
            //学习中有问题随时提，有笔记随时记， 提高学习效率
            askAndNotesText: '学习中有问题随时提，有笔记随时记， 提高学习效率',
            //轻松同步
            easyAsync: '轻松同步',
            //学习记录云同步，不同设备间学习数据共享
            easyAsyncText: '学习记录云同步，不同设备间学习数据共享',
            //下载
            download:'下载-{{projectTitle}}'
        }
    },
    /**
     *课程学习页
     */
    learnPlay: {
        frontPage: {
            /*
            js文件相关
             */
            //本课程结束
            staticText1: '本课程结束',
            //您已完成本课程的
            staticText2: '您已完成本课程的',
            //章节列表-章节学习
            staticText3: '章节列表-章节学习',
            //确认删除该笔记吗(本操作不可恢复)?
            staticText4: '确认删除该笔记吗(本操作不可恢复)?',
            //"太棒了，您已学完全部内容！"
            staticText5: "太棒了，您已学完全部内容！"
        }
    },
    testAdd: {
        frontPage: {
            //网龙网络公司
            nd: '网龙网络公司',
            //为您推送最前沿、最有料的学习资讯
            htmlText1: '为您推送最前沿、<br/>最有料的学习资讯',
            htmlText2: '闽ICP B2-20050038',
            //公开课列表
            openCoursesList: '公开课列表'
        }
    },

    /**
     *培训简介相关
     */
    trainIntroduce: {
        frontPage: {
            nodata: '暂无考试',
            //简介
            intro: "简介",
            //课程
            classes: "课程",
            // 考试
            exams: '考试',
            //报名有效期：
            validPeriod: "报名有效期：",
            //报名注意事项：
            warning: "报名注意事项：",
            //暂无介绍
            noIntroduce: "暂无介绍",
            //培训简介：
            introduce: "培训简介:",
            //课程学友
            classmates: "课程学友",
            //同学
            classmate: "同学",
            //排行
            ranking: "排行",
            //人
            people: "人",
            //你的排名
            other1: '你的排名',
            //位，本周学习
            other2: '位，本周学习',
            //学时
            hours: '分钟',
            //开始学习吧，榜首先到先得！
            messageToLearn: '开始学习吧，榜首先到先得',
            //赶紧报名第一个开始学习吧！
            messageToReg: '赶紧报名第一个开始学习吧！',
            //排行榜更新于
            updateTime: '排行榜更新于',
            //7天学习排行榜
            board: '7天学习排行榜'
        }
    },
    /**
    *学习主页
    */
    studyLearning: {
        frontPage: {
            hourPercent: '已学：{{userHour}}/{{totalHour}}学时',
            courseHours: '课程',
            studyHour: '学时',
            examCount: '个考试',
            finishTime: '结束时间:',
            train: '培训认证',
            job: '职业规划',
            singleCourse:'公开课',
            studying: '学习中',
            waitAudit: '待审核',
            waitPay: '待付款',
            hasFinished: '已完结',
            reAudit: '重新审核',
            hasPass: '已合格',
            finished: '已结束',
            noPass: '不合格',
            goPay: '去支付',
            reEnroll: '重新报名',
            cancelEnroll: '取消报名',
            nodata: '暂无正在学习中的课程',
            nodataFinish: '暂无完结的课程，点击去学习！',
            goLearning:'去学习',
            studyNewCourse: '去学习新课程',
            loadMore: '点击加载更多...',
            noMoreData: '没有更多数据啦',
            cancelConfirm:'确定要退出该课程？',
            //侧边栏
            day: '天',
            minute: '分钟',
            totalDay: '累计天数',
            totalHours: '学习时长',
            myStudy: '我的学习',
            myExam: '我的考试',
            myNote: '我的笔记',
            myQuestion: '我的答疑',
            myArt: '我的证书',
            myRank: '我的排行'
        }
    },
    //搜索结果
    searchList:{
        frontPage:{
            //搜索结果
            pageTitle:'搜索结果',
            //请输入关键词
            keyWord:'请输入关键词',
            //全部
            all:'全部',
            //职位规划
            job:'职位规划',
            //培训认证
            train:'培训认证',
            //公开课
            singleCourse:'公开课',
            //更多职位规划
            moreJobs:'更多职位规划',
            //更多培训认证
            moreTrains:'更多培训认证',
            //更多公开课
            moreSingleCourse:'更多公开课',
            //搜索
            search:'搜索',
            //门课程
            _courses:'门课程',
            //学时
            _hours:'学时',
            //个考试
            _exams:'个考试',
            //暂无“<span data-bind="text:model.filter.title()"></span>”相关内容
            _nodata:'暂无“{{filter}}”相关内容'
        }
    },
    /**我的排行榜
    **/
    myRankingList: {
        frontPage: {
            //我的排行（页面title）
            pageTitle:'我的排行',
            //学霸排行榜
            learderboard: '学霸排行榜',
            //7天排行
            '7ds': '7天',
            //月
            '30ds': '月',
            //总
            all: '总',
            //根据学员的学习时长统计排序，同一课程重复学习的时长不计入
            tips1: '根据学员的学习时长统计排序，同一课程重复学习的时长不计入',
            //排名
            rankingList: '排名',
            //用户
            learner:'用户',
            //学习时长
            totalMins: '学习时长',
            //我的{{rankType}}排名6位 ， 学习时长210分钟 ， 超过90%的同学
            tips2: '我的{{rankType}}排名<i class="blue">{{place}}</i>位 ， 学习时长<i class="blue">{{mins}}</i>分钟 ， 超过<i class="blue">{{percent}}</i>的同学',
            //{{mins}}分钟
            mins: '{{mins}}分钟',
            //点击加载更多排名...
            loadMore: '点击加载更多排名...',
            //加载中
            loading: '加载中...',
            //排行榜将于每天4：00更新前一天的学习数据
            updateData: '排行榜将于每天04:00更新前一天的学习数据',
            //已加载全部
            loadAll: '已加载全部',
            //暂无数据
            noData:'暂无数据',
            //数据加载中
            dataLoading:'数据加载中'
        }
    },
    /**
     *查看试卷页面
     */
    examCheck:{
        frontPage:{
            //答案解析
            analysis:'【答案解析】',
            //无
            noAnalysis:'无'
        }
    },
    //培训，查看成绩
    examResultInfo:{
        frontPage:{
            //返回
            back:'< 返回',
            //考试成绩详细说明
            examResultDetail:'考试成绩详细说明',
            //子科目
            subSubject:'子科目',
            //成绩
            result:'成绩',
            //点评
            evaluation:'点评',
            //总评
            totalEvaluation:'总评:',
            //我的答卷
            myAnswer:'我的答卷',
            //下载
            download:'下载',
            //干系人分析
            relation:'干系人分析',
            //不错
            goodJob:'不错',
            endOfTest: '距离考试结束：',
            myAnsweredPaper: "我的答卷",
            remove: '删除',
            download: '下载',
            dataDownload:"资料下载",
            examDetail: "考试说明",
            passLine: "及格线",
            subject: "子科目",
            examChildrenSubjectDetail: "考试子科目说明",
            examTime: "考试时间",
            examDetail: "考试信息",
            deleteAnsweredExam: '是否确认删除答卷',
            sure: "确认",
            cancel: '取消',
            document: '文档',
            uploadSuccess: '上传成功',
            msg1: '上传的文件大小超过限制，最大只能上传10M文件',
            msg2: '所选择的文件大小不能为0',
            msg3: '所选择文件扩展名与允许不符',
            msg4: '队列错误',
            second: '秒',
            butongguo: '不通过',
            youtiaojiantongguo:'有条件通过',
            tongguo: '通过',
            offlineExam: '线下考试'
        }
    },
    //培训，考试说明
    examInformation:{
        frontPage:{
            //返回
            back:'< 返回',
            //距离考试结束：
            endTime:'距离考试结束：',
            //我的答卷
            myAnswer:'我的答卷',
            //删除
            delete:'删除',
            //下载
            download:'下载',
            //考试信息
            examInfo:'考试信息',
            //考试时间
            examDate:'考试时间',
            //BeginTime() + ' 至 ' + EndTime()
            examDuration:'{{BeginTime}} 至 {{EndTime}}',
            //考试子科目说明
            examSubSubjectInfo:'考试子科目说明',
            //子科目
            subSubject:'子科目',
            //及格线
            passLine:'及格线',
            //考试说明
            examNotice:'考试说明',
            //资料下载
            resourceDW:'资料下载'
        }
    }
};
