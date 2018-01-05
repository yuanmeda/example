i18n.trainComponent = {
    common: {
        // 各种JS插件的语言设置
        addins: {
            alertTitle: '信息',
            sure: "确认",
            cancel: '取消',
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
            jstimer: {},
            swftimer: {},
            timer: {},
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
            enums: {},
            util: {},
            loader: {},
            message: {},
            updater: {
                //无需保存
                noNeedSave: '无需保存',
                //保存成功
                saveSuccess: '保存成功',
                //保存失败
                saveError: '保存失败'
            },
            store: {},
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
        button: {
            //确定
            confirm: '确定',
            //返回
            back: '返回',
            //我知道了
            isee: '我知道了'
        },

        //前台页面
        frontPage: {
            openingDate: "开始于：",
            freeTrial: '免费体验',
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
            Overview: '综合',
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

            all: '全部',
            available: '进行中',
            waiting: '即将开始',
            end: '已结束',

            // 培训状态
            enrollStatus: {
                offline: '下线',
                enrollNotStart: '报名未开始',
                notEnroll: '去报名',
                enrollEnded: '报名已结束',
                offlineEnroll: '线下报名',
                enrollUnConfirm: '报名待审核',
                enrollAgain: '重新报名',
                goPay: '去支付',
                payUnConfirm: '支付待审核',
                payAgain: '重新支付',
                finished: "已结束",
                notStarted: "未开始",
                choiceCourse: "去选课",
                toSelectCourse: '等待开课',
                learning: '继续学习',
                finish: '复习回顾',
                ended: '已结束',
                unlock: '解锁培训',

                unConfirm: "待审核",
                refused: "已拒绝",
                pass: "已通过",
                use: "开始学习",
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
            train: '培训',
            //综合
            synthesize: '综合',
            //最新
            newest: '最新 ',
            //热门
            hot: '最热',
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
            //必修标签
            requiredLabel: '必修',
            //选修标签
            optionLabel: '选修',
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
            //资源
            resource:'个资源',
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
        systemManage: {}
    },
    "exam": {
        "soon": "即将开始",
        "noChance": "无考试机会",
        "retry": "重新考试",
        "continue": "继续考试",
        "correcting": "等待批改",
        "begin": "开始",
        "end": "已结束",
    },
    // 培训认证频道
    trains: {
        // 后台系统
        systemManage: {},
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
            trainHasOver: '培训已结束',

            //无培训提示
            noTip: '暂无此类培训',
            //页面标题
            pageTitle: '培训列表',
            //培训详情
            detailTitle: '培训详情',
            //等待报名
            waitRoll: '该培训未报名，请先设置为目标！',
            //门课程
            _courses: '门课程',
            //个培训
            _trainings: '个培训',
            //学时
            _hours: '学时',
            //要求学时不足
            lessHour: '要求学时不足',
            //个考试
            _exams: '个考试',
            //共有
            _total: '共有 {{count}} 个培训',
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
            contain: '内含:',
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
            _trainCourse: '培训课程',
            //解锁条件
            unlock_condition: '解锁条件：',
            //使用兑换券后方可解锁本培训
            user_coincertificate: '使用兑换券后方可解锁本培训',
            preTrainOrCoincertificate: '完成先修培训或使用兑换券后方可解锁本培训',
            preTrainAndCoincertificate: '完成先修培训且使用兑换券后方可解锁本培训',
            preTrain: '先修培训'
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
    homePage: {
        frontPage: {
            courseInfo: '{{Title}} ({{MinHours}}个学时，{{StudyNum}}人学习)'
        }
    },
    /**
     *
     *选课页面
     */
    selectCourse: {
        title: '培训选课',
        studyHour: '({{studyHour}})学时',
        studyHourText: '学时',
        required: '必修',
        option: '选修',
        requiredCourse: '必修课',
        optionCourse: '选修课',
        //共 8 课程
        totalCourse: '共<i>{{totalCourse}}</i>门课程',
        //【必修课】10 /50 学时 
        requiredTotal: '【必修课】<i>{{reqProHour}}</i> /{{totalReqHour}} 学时',
        //【选修课】2 /50 学时
        optionTotal: '【选修课】<i>{{opProHour}}</i> /{{totalOpHour}} 学时',

        totalProgress:'总进度：<i>{{progress}}</i>/100',
        requiredProgress: '【必修课】<i>{{requireProgress}}</i> /100',
        optionProgress: '【选修课】<i>{{optionProgress}}</i> /100',

        totalResource: '共<i>{{totalResource}}</i>个资源',
        requiredResourceTotal: '【必修课】<i>{{reqResource}}</i> /{{totalReResource}} 资源',
        optionResourceTotal: '【选修课】<i>{{opResource}}</i> /{{totalOpResource}} 资源',

        //去选课
        goSelectCourse: '去选课',
        //培训有效期
        trainPeriod: '培训有效期：',
        //培训总学时：
        trainTime: '培训总学时：',
        //必修 <i class="blue" data-bind="text:model.train.demand_require_hour"></i>学时
        requiredHour: '必修 <i class="blue">{{requireHour}}</i>学时',
        //选修 <i class="blue" data-bind="text:model.train.demand_option_hour"></i> 学时
        selectTime: '选修<i class="blue">{{optionHour}}</i>学时',
        //2016-10-25 10:20至2017-10-25 10:20
        availbleArea: '{{startTime}}至{{endTime}}',
        //报名后<i class="fc5">{{days}}</i>天
        sinUpDays: '报名后<i class="fc5">{{days}}</i>天',
        //时间自主
        freeTime: '时间自主',
        //共有10门必修课，12门选修课
        courseStatistics: '共有<i>{{requireLength}}</i> 门必修课， <i>{{optionLength}}</i>门选修课',
        //选课保存成功
        saveSuccess: '选课保存成功',
        //所选学时不足，请调整课程组合
        hourNotEnough: '所选学时不足，请调整课程组合',
        //如果取消在学选修课，该课程已完成学时将不计入您的学习进度中
        initTip: '如果取消在学选修课，该课程已完成学时将不计入您的学习进度中。',
        //已选X门课程，
        selectedNum: '已选<i>{{selectedNum}}</i>门课程，',
        //共x学时
        selectedHour: '共<i>{{selectedHour}}</i>学时',
        //，超过学时
        exceedHour: '，超过<i>{{exceedHour}}</i>学时',
        //，还差x学时
        lackHour: '，还差<i>{{lackHour}}</i>学时',
        //保存所选课程
        saveAllCourse: '保存所选课程',
        confirmSelect: '确认选课',
        reSelectCourse: '重新选课',
        selectIntro: '选课说明：'

    },
    /**
     *培训简介相关
     */
    trainIntroduce: {
        frontPage: {
            //分数
            scoreMark: '<em>{{count}}</em>分',
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
            //暂无同学
            noClassmate: "还没有同学，赶紧先开始学习吧",
            //培训简介：
            introduce: "培训简介:",
            //课程学友
            classmates: "课程学友",
            //同学
            classmate: "同学",
            classmatePeople: "人",
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
            board: '7天学习排行榜',
            //评价
            evaluate: '评价',
            collection: '收藏',
            cancelCollection: '取消收藏',
            collectionFail: '失败，请重试!',
        }
    },
    //培训，查看成绩
    examResultInfo: {
        frontPage: {
            //返回
            back: '< 返回',
            //考试成绩详细说明
            examResultDetail: '考试成绩详细说明',
            //子科目
            subSubject: '子科目',
            //成绩
            result: '成绩',
            //点评
            evaluation: '点评',
            //总评
            totalEvaluation: '总评:',
            //我的答卷
            myAnswer: '我的答卷',
            //下载
            download: '下载',
            //干系人分析
            relation: '干系人分析',
            //不错
            goodJob: '不错',
            endOfTest: '距离考试结束：',
            myAnsweredPaper: "我的答卷",
            remove: '删除',
            dataDownload: "资料下载",
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
            youtiaojiantongguo: '有条件通过',
            tongguo: '通过',
            offlineExam: '线下考试'
        }
    },
    //培训，考试说明
    examInformation: {
        frontPage: {
            //返回
            back: '< 返回',
            //距离考试结束：
            endTime: '距离考试结束：',
            //我的答卷
            myAnswer: '我的答卷',
            //删除
            //下载
            download: '下载',
            //考试信息
            examInfo: '考试信息',
            //考试时间
            examDate: '考试时间',
            //BeginTime() + ' 至 ' + EndTime()
            examDuration: '{{BeginTime}} 至 {{EndTime}}',
            //考试子科目说明
            examSubSubjectInfo: '考试子科目说明',
            //子科目
            subSubject: '子科目',
            //及格线
            passLine: '及格线',
            //考试说明
            examNotice: '考试说明',
            //资料下载
            resourceDW: '资料下载',
            //考试机会
            changeOfExam: ' chances',
            //总分
            allScore: 'Total Score: ',
            //开考条件
            examCondition: 'Exam Requirements'
        }
    },
    /*
     培训认证组件
     */
    //todo 修改成培训相关的key
    courseComponent: {
        front: {
            //课程详细页面
            courseDetail: {
                homePage: '首页',
                courseList: '课程列表',
                courseComponent: '课程详情',
                evaluate: '评价',
                collection: '收藏',
                share: '分享',
                courseIntroduce: '课程介绍',
                courseIntroduceTh: '课程介绍:',
                catalog: '目录',
                exam: '考试',
                people: '人',
                courseStatus1: '即将开始报名',
                courseStatus2: '报名已结束',
                courseStatus3: '报名人数已满',
                courseStatus4: '待审核',
                courseStatus5: '重新报名',
                courseStatus6: '线下报名',
                courseStatus7: '即将开课',
                courseStatus8: '课程已结束',
                courseStatus9: '马上报名',
                courseStatus10: '剩余名额',
                courseStatus11: '开始于',
                courseStudents: '课程学友',
                startStudy: '开始学习',
                agStudy: '复习回顾',
                resumeStudy: '继续学习',
                d: '第',
                z: '章',
                j: '节',
                tip1: '暂无简介',
                tip2: '暂无课程',
                tip3: '暂无考试',
                tip4: '该课程下无学习资源！',
                tip5: "请先报名",
                tip6: "即将开始报名",
                tip7: "该课程报名已结束",
                tip8: "报名人数已满",
                tip9: "还未通过审核",
                tip10: "请重新报名",
                tip11: "请线下报名",
                tip12: "即将开课",
                tip13: "该课程已结束",
                tip14: "未登录",
                finish: '已完成',
                title: '课程详情',
                prev: '上一页',
                next: '下一页',
                page: '页',
                exam1: '次考试机会',
                exam2: '历史成绩',
                exam3: '总分',
                exam4: '分',
                exam5: '分过关',
                exam6: '时长',
                exam7: '分钟',
                exam8: '分',
                exam9: '开始',
                exam10: '即将开始',
                exam11: '结束',
                exam12: '开始考试',
                exam13: '重新考试',
                exam14: '继续考试',
                exam15: '要求完成课程',
                exam16: '学时不足',
                exam17: '已结束',
                exam18: '待批改',
                exam19: '无考试机会',
                alertTitle: '信息',
                sure: '确定',
                userSuit: '适合人群：'
            },
            learn: {
                back: '返回课程主页',
                title: '课程学习资源',
                prev: '上一个',
                next: '下一个',
                catalog: '章节',
                course: '课时'
            }
        }
    },
    learn: {
        back: '返回课程主页',
        title: '课程学习资源',
        prev: '上一个',
        next: '下一个',
        catalog: '章节',
        course: '课时'
    },
    details: {
        overview: '综合',
        not_exist: '培训不存在',
        exam_not_exist: '考试不存在',
        not_qualified: '考试不满足开考条件',
        exam_offline: '考试已下线',
        need_authorization: '需要用户授权信息',
        not_start: '培训未开始',
        end: '培训已结束',
        train_offline: '培训已下线',
        enroll_denied: '报名已拒绝',
        course_offline: '课程已下线',
        course_not_exist: '课程不存在',
        no_exam_for_training: '该培训暂无考试',
        no_course_for_training: '该培训暂无课程',
        exam_chances: '{{chances}}次考试机会',
        pass_score: '{{score}}分过关',
        history_score: '历史成绩',
        train_over_time: '{{days}}天{{hours}}小时后结束',
        many_chances: '不限考试机会',
        no_chance: '无考试机会',
        remaining_places: '剩余名额',
        start_requirement: '开考条件',
        all_score: '总分: ',
        duration: '时长:',
        minute: '分钟',
        pass: '已通过',
        notPass: '未通过',
        beginExam: '开始',
        endExam: '结束',
        //等待批改
        waitCorrect: '等待批改',
        retry: '重新考试',
        goon: '继续考试',
        //学时不足
        hourLess: '学时不足',
        will_begin: '即将开始',
        no_vacancy: '名额已满',
        completed: '已完成',

        tips: {
            enroll_first: '请先报名',
            enrollUnConfirm: '报名待审核'
        }
    },
    coin: {
        availbleTime: "有效期 <em>{{startTime}}</em> 至 <em>{{endTime}}</em>",
        notUse: "可使用",
        used: "已使用",
        invalid: "已失效",
        confirm: '确定',
        cancel: '取消',
        aware: '我知道了',

        confirmUseCoin: "确认使用兑换券",
        confirmPreTrainOrCoin: "1、完成先修培训学习<br>2、使用兑换券直接解锁",
        confirmPreTrainAndCoin: "<p class='dialog-tl'>请完成先修培训</p><p class='lh2'>《<span class='pre-train-hint' title='{{preTrain}}'>{{preTrain}}</span>》</p><p class='dialog-tl'>{{moreThanOne}}的学习，才能使用兑换券进行解锁！</p>",
        AlreadyPreTrain: "您已完成先修培训<br/>需使用兑换券才能解锁",
        hint: '提示',
        noneOfPreTrainOrCoin: "1、请完成先修培训学习，<br/>2、才能使用兑换券进行解锁",
        unlockPreTrainFirst: "请先解锁培训",

        useCoin: "使用兑换券",
        confirmUsing: "确认兑换",
        checkMyCoins: "查看我的兑换券",
        availbleCoins: "可使用兑换券",
        useTheseWays: "可通过以下方式解锁",
        noCoupon: "暂无可用兑换券",

        systemInfo: "系统提示"
    }
};