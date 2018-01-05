/**
 * Created by Administrator on 2015/12/9.
 */
i18n.trainComponent = {
    common: {
        // 各种JS插件的语言设置
        addins: {
            alertTitle: 'Info',
            sure: "Confirm",
            cancel: 'Cancel',
            elearningExtend: {
                tagbar: {
                    allText: 'All',
                    moreText: 'more',
                    hideText: 'hide'
                }
            },
            upopup: {
                sysTitle: 'System Information'
            },
            pagination: {
                first: 'First',
                last: 'Last',
                prev: 'Previous',
                next: 'Next',
                jumpTo: 'To Page ',
                page: ' ',
                jump: 'Skip',
                overview: 'Current: Page {{currentPage}}/Total: {{totalPage}} pages, {{totalCount}} records.'
            },
            prepare: {
                //返回
                back: 'Back',
                //题
                ti: 'Question',
                //总分
                totalScore: 'Total Score',
                //及格
                pass: 'Pass',
                //分钟
                minute: 'minute',
                //小时
                hour: 'hour',
                //分
                minute_: 'minute',
                //秒
                second: 'second',
                //距离考试结束：
                remainTime: 'Remaining Time: ',
                //注意:
                notice: 'Notice:',
                //1、开始考试后不可暂停，时间到后自动交卷，请注意时间安排。
                rollRule1: '1. The exam cannot be paused after started. It will submit automatically when the time is up.',
                //2、答题结束，点击“交卷”完成当前考试。
                rollRule2: '2. After you finish, please click Submit.',
                //考试已结束
                examTimeOvered: 'The exam has ended.',
                //距离开考还有：
                timeFromExam: 'The exam starts in: ',
                //考试已开始：
                examBeginedTime: 'The exam has started.',
                //距离考试结束还有：
                examRemainTime: 'Remaining Time: ',
                //本次考试时间已到, 不能继续答题
                timeOverTip: 'The time is up. You cannot answer the questions now.',
                //交卷
                handPaper: 'Submit'
            },
            loading: {
                //正在加载...
                loading: 'Loading...'
            },
            navigatorstat: {
                //本次成绩
                examResult: 'Result',
                //正确率
                correctRate: 'Correct Rate',
                //答对
                correct: 'Right',
                //题
                ti: 'Question',
                //答错
                error: 'Wrong',
                //未做
                noDo: 'Not Answered'
            },
            explain: {
                //考试说明
                examDescription: 'Instruction'
            },
            questionOption: {
                //此选项为参考答案
                referenceAnswer: 'This is a reference answer.'
            },
            subjective: {
                //我会做
                willDo: 'I can.',
                //我不会做
                willNotDo: "I can't."
            },
            judge: {
                //对
                right: 'Right',
                //错
                error: 'Wrong'
            },
            question: {
                //暂不确定
                unCertain: 'Uncertain',
                //填空题
                blankFill: 'Blank Filling',
                //主观题
                subjectiveQuestion: 'Subjective Question',
                //正确答案
                correctAnswer: 'Correct Answer',
                //您答对了
                answerRight: 'Your answer is right.',
                //主观题用户答案
                subjectiveAnswer: 'User Answer',
                //题目详解
                subjectDetail: 'Question Analysis',
                //套题详解
                setDetail: 'Suite Analysis',
                //您错答为[" + t + "]
                answerError: 'Your wrong answer: [{{t}}].',
                //您未作答
                hasNoAnswer: 'You did not answer.',
                //<暂无>
                noNow: '<None>',
                //不计分
                noScore: 'No Score',
                //分
                score: 'Score'
            },
            navigator: {
                //1
                one: '1',
                //2
                two: '2',
                //3
                three: '3',
                //4
                four: '4',
                //5
                five: '5',
                //6
                six: '6',
                //7
                seven: '7',
                //8
                eight: '8',
                //9
                nine: '9',
                //10
                ten: '10',
                //百
                hundred: '00',
                //千
                thousand: '000',
                //万
                surname: '0000',
                //十万
                tenSurname: '00000',
                //百万
                hundredSurname: '000000',
                //千万
                thousandSurname: '0000000',
                //亿
                billion: '00000000',
                //只能处理到亿
                onlyBillion: 'It exceeds the limit.'
            },
            enums: {},
            util: {},
            loader: {},
            message: {},
            updater: {
                //无需保存
                noNeedSave: 'Do not save.',
                //保存成功
                saveSuccess: 'Saved successfully.',
                //保存失败
                saveError: 'Failed to save.'
            },
            store: {},
            answer: {
                //请实现_onSubmit方法！
                achieveSubmit: 'Please realize the _onSubmit method.',
                //请实现_fullscreen方法！
                achieveFullscreen: 'Please realize the _fullscreen method.',
                //请实现_restart方法！
                achieveRestart: 'Please realize the _restart method.',
                //请实现_finish方法！
                achieveFinish: 'Please realize the _finish method.'
            },
            examAnswer: {
                //试卷说明
                examDescription: 'Instruction',
                //error In '_nosure',可能是data.viewModel.question.Id() 不存在
                idError: 'error In "_nosure". data.viewModel.question.Id() does not exist.',
                //已完成全部题目，确定交卷吗？
                submitPaper: 'You have answered all the questions. Would you like to submit?',
                //交卷
                submit: 'Submit',
                //继续答题
                continueAnswer: 'Not Now',
                //本次考试时间已到, 不能继续答题
                timeOvered: 'The time is up. You cannot answer the questions now.',
                //已完成 " + e + " 题，还有 " + (t - e) + " 题未做，确定交卷吗？
                paperTip: 'You have answered {{yes}} questions. There are still {{no}} questions to answer. Are you sure you want to submit now?'

            }
        },
        button: {
            //确定
            confirm: 'Confirm',
            //返回
            back: 'Back',
            //我知道了
            isee: 'I See'
        },
        //前台页面
        frontPage: {
            openingDate: "Started:",
            freeTrial: 'Free Trial',
            gotoTrainDetail: 'Go to see train detail',
            remain: 'Try again (Remain {{left}} times)',
            examConst: 'Exam time',
            examLimitScore: 'Pass score',
            totalScore: 'Total score',
            answerAnalysis: 'Answer analysis >',
            scoreTitle: ' Score',
            questionText: 'Question',
            answerQuestionCount: 'Done count',
            hourText: ' hour',
            minuteText: " minute",
            secondText: " second",

            lastPositionContent: 'last position ',

            numOfPeople: ' participants',
            studyEvaluate: 'Reviews',
            loadMore: 'Load more...',
            noEvaluate: 'No Review',
            evaluate: 'Review',
            evaluateTip: 'Please give your review or question.',
            myEvaluate: 'Mine',
            newEvaluate: 'Write review',
            evaluateLimit: "Please control your comment less than {0} words",

            ucLabel1: "file name",
            ucLabel2: "upload process",
            ucLabel3: "file size",
            ucLabel4: "delete",

            all: 'All',
            available: 'Available',
            waiting: 'Waiting',
            end: 'End',

            // 培训状态
            enrollStatus: {
                offline: 'Offline',
                enrollNotStart: 'Enroll not started',
                notEnroll: 'Enroll now',
                enrollEnded: 'Enroll ended',
                offlineEnroll: 'Enroll offline',
                enrollUnConfirm: 'Enroll Uncomfirm',
                enrollAgain: 'Enroll again',
                goPay: 'Pay now',
                payUnConfirm: 'Pay Unconfirm',
                payAgain: 'Pay again',
                finished: "Ended",
                notStarted: "Not Started",
                choiceCourse: "Select Course",
                toSelectCourse: 'Waiting to start courses',
                learning: 'Continue',
                finish: 'Review',
                ended: 'Ended',
                unlock: 'Unlock Training',
                unConfirm: "UnConfirm",
                refused: "Rejected",
                pass: "Passed",
                use: "Study Now",
                undefined: "Undefined"
            },

            //登录/注册
            logInSinUp: 'Sign in/Sign up',
            //用户名称
            username: 'User Name',
            //移动端
            mobilTerminal: 'Mobile',
            //下载移动端
            downmobilTerminal: 'Download',
            //退出
            logOut: 'Sign out',
            //免费
            free: 'Free',
            //首页(精品推荐)
            homePage: "Featured",
            //公开课
            openClass: 'Open Courses',
            //培训认证
            trainSign: 'Training',
            //职位
            jobPlan: 'Career',
            //职位规则
            jobPlanEx: 'Career',
            //登录
            loginIn: 'Log in',
            //我的学习
            myStudy: 'My Courses',
            //我的考试
            myExam: 'Exams',
            //注销
            loginOut: 'Sign out',
            //页脚
            footerPage: 'Fujian Huayu Future Education Technology Co., Ltd',
            //标注
            tagFlag: 'Technical Support',
            /*
             title相关
             */
            //培训介绍
            trainInfo: 'Training info',
            //课程列表
            courseList: 'Open courses',
            //职位介绍
            jobInfo: 'Career info',
            //学习中心
            studyCenter: 'My Courses',
            // - 登录
            projectLoginIn: '{{projectTitle}} - Login',

            /*
             标签相关
             */
            //对
            right: 'Right',
            //错
            error: 'Wrong',
            //是
            yes: 'Yes',
            //否
            no: 'No',
            //返回
            back: 'Back',
            //推荐
            recommond: 'Recommended',
            //收起
            collapse: 'Hide',
            //更多
            more: 'More',
            //课程
            course: 'Course',
            //培训
            train: 'train',
            //综合
            synthesize: '综合',
            //最新
            newest: 'Latest',
            //热门
            hot: 'Hot',
            //考试
            exam: 'Exam',
            //必修课
            requireCourse: 'Required Course',
            //选修课
            selectiveCourse: 'Optional Course',
            //资源
            resourceLabel: 'Resource',
            //通过方式
            passLabel: 'Passing Method:',
            //必修标签
            requiredLabel: 'Required',
            //选修标签
            optionLabel: 'Elective',
            /*
             按钮相关
             */
            //报名
            registration: 'Enroll',
            //马上报名
            registrationOnce: 'Enroll',
            //线下报名
            offLineBtn: 'Offline Sign-up',
            //已结束
            finished: 'Finished',
            //未开考
            noOpen: 'Not Started',
            //已过期
            expired: 'Expired',
            //学时不足
            hourLess: 'Lack of periods',
            //进入考试
            enterExam: 'Enter',
            //阅卷
            paperMark: 'Go Over',
            //补考
            examAgain: 'Again',
            //重新考试
            reExam: 'Re-exam',
            //修改信息
            modifyInfo: 'Modify Info',
            //开始学习
            beginStudy: 'Start',
            //继续学习
            continueStudy: 'Continue',
            //取消
            cancel: 'Cancel',
            //确定
            confirm: 'Confirm',
            //浏览
            browse: 'Browse',
            //提交
            submit: 'Submit',
            //删除
            remove: 'Delete',
            //确认付款
            confirmPay: 'Confirm Payment',
            /*
             提示相关
             */
            //报名信息有误
            rollError: 'The sign-up info is wrong.',
            //汇款信息有误
            payError: 'The remittance info is wrong.',
            //缴费信息有误
            payToError: 'The payment info is wrong.',
            //暂无课程
            hasNoCourse: 'No course.',
            //线下报名提示
            offLineTip: 'Please contact the customer service for the details of offline sign-up.',
            //统计失败
            calError: 'Failed to calculate. Please refresh the page later.',
            //验证码错误验证
            validateError: 'Verification code error.',
            //报名提示
            rollTip: 'Please sign up first.',
            //输入框提示
            inputTip: 'Please enter a key word.',
            //请输入备注信息
            /*
             课程相关
             */
            //列表选项
            listItem: 'Total: {{CourseNum}} Courses/{{ExamNum}} Exams/{{MinHours}} periods',
            //学习人数
            studyCount: '{{StudyNum}} learners',
            //学时
            MinHours: '{{MinHours}} periods',
            //最新
            top: 'Latest',
            //通过方式
            passWay: 'Complete {{MinHours}} periods',
            //资源信息
            resourse: '{{VideoNum}} Videos/{{DocumentNum}} Documents/{{ExerciseNum}} Exercises',

            /*
             课程考试相关
             */
            //课程标签
            courseLabel: 'Course: ',
            //时间起始
            timeBegin: 'Exam from: {{BeginTime}}',
            //时间结束
            timeEnd: ' to {{EndTime}}',
            //开考条件1
            testCondition1: 'Requirement: None',
            //开考条件2
            testCondition2: 'Requirement: Complete {{RequireTotal}} periods',
            //考试时长
            examTime: 'Duration: {{LimitSeconds}}',
            //及格线
            passLine: 'Passing Score: {{PassScroe}}',
            //最佳成绩1
            bestResult1: 'Highest Score: 0',
            //最佳成绩2
            bestResult2: 'Highest Score: To be marked',
            //最佳成绩3
            bestResult3: 'Highest Score: {{Score}}',

            /*
             常见短词
             */
            //至
            to: 'to',
            //学时
            studyHour: ' periods',
            //资源
            resource:' resource',
            //课程大纲
            courseOutline: 'Chapters',
            //必填项
            required: 'Required',
            //选填项
            optional: 'Optional',
            //手机号码
            telNumber: 'Mobile Number',
            //注意事项
            notice: 'Tips',
            //视频
            video: 'Video',
            //文档
            text: 'document ',
            //练习
            practice: 'exercise ',
            /*
             上传控件
             */
            //提示1
            ucTip1: 'Upload scanning photo.',
            //提示2
            ucTip2: '(Support jpg/png/bmp, no bigger than 4MB each, up to 10 photos.)',
            //文本1
            //文本2
            ucLabe2: 'Upload Progress',
            //文本3
            ucLabe3: 'File Size',
            //文本4
            ucLabe4: 'Delete',
            //文本5
            ucLabel5: 'Attachment',

            //上传文件超过最大限制
            numberOverLimit: 'The file is too big.',
            //上传的文件大小超过限制
            sizeOverLimit: 'The file is too big.',
            //所选择的文件大小不能为0
            noFileSize: 'The size of the file cannot be 0.',
            //所选择文件扩展名与允许不符
            noMapFileExtension: 'Invalid file extension.',
            //队列错误
            fileQueueError: 'Queue error.',
            //请上传附件。
            uploadFile: 'Please upload an attachment.',
            //请等待上传完成后再提交。
            waitUploadComplete: 'Uploading. Please wait.',
            //文件上传异常，请稍后再试。
            fileUploadError: 'Upload error. Please try again later.',

            /*
             支付选择
             */
            //提示1
            payTip1: 'Credit to your account instantly. Support most of the debit cards and some of the credit cards.',
            //提示2
            payTip2: 'Customer Service: (9:00-18:00) 400-611-0013',
            //提示3
            payTip4: 'Alipay Customer Service Hotline: 95188',
            //提示5
            payTip5: 'Method A: Online Payment',
            //提示6
            payTip6: 'Method B: Offline Payment',
            //提示7
            payTip7: 'Note: Offline remittance requires payment voucher. Tap Confirm Payment and upload the payment voucher on the next page.',
            //提示8
            payTip8: 'Pay with Quick Money',
            //提示9
            payTip9: 'Pay with Alipay',
            //文本1
            payLabel1: 'Confirm Payment Info',
            //文本2
            payLabel2: 'Select Payment Method',
            //文本3
            payLabel3: 'Use Voucher',
            //文本4
            payLabel4: 'Enter your voucher serial number.',
            //文本5
            payLabel5: 'Use',
            //输入文本1
            inputLabel1: 'Voucher Serial Number:',
            //输入文本2
            inputLabel2: 'Training Price:',
            //输入文本3
            inputLabel3: 'Discount:',
            //输入文本4
            inputLabel4: 'Amount Payable:',

            /*
             表单验证
             */
            //请选择所在地
            chooseLocation: 'Please select location.',
            //手机号码格式有误，请重新输入
            phoneError: 'The format of the mobile number is wrong.',
            //时间格式有误，请重新输入
            dateFormatError: 'The time format is wrong.',
            //QQ号码格式有误，请重新输入
            qqNumberError: 'The format of the QQ number is wrong.',
            //请输入数字，最多小数位为{0}
            onlyNumber: 'Please enter the number, up to {0} decimals.',
            //请输入中文字符
            onlyChinese: 'Please enter Chinese characters.',
            //请输入英文字符
            onlyEnglish: 'Please enter English characters.',
            //格式错误
            formatError: 'Format error.',
            //固定电话格式有误，格式:区号+电话，请重新输入
            fixedPhoneError: 'The format of the telephone number is wrong.',
            //邮编格式不正确，请重新输入
            emailError: 'The format of the zip code is wrong.',
            //不可输入纯数字，请重新输入
            unpermitPureNumber: 'You cannot only enter numbers.',
            //请输入4位验证码，数字或英文字母组成
            validateFormatError: 'Please enter the verification code.',
            //验证码错误
            validateCodeError: 'Verification code error.',

            /*
             时间插件
             */

            //当前日期
            pickerCurrentDate: 'Current Date',
            //选择
            pickerSelect: 'Select',
            //分
            pickerMinute: 'Minute',
            //小时
            pickerHour: 'Hour',
            //秒
            pickerSecond: 'Second',
            //时
            pickerHour_: 'Hour',
            //年月日格式
            pickerDateFormat: 'yy-mm-dd',
            //时分秒格式
            pickerTimeFormat: 'HH:mm:ss'
        },
        //后台系统
        systemManage: {}
    },
    "exam": {
        "soon": "Soon",
        "noChance": "No Chance",
        "retry": "Retry",
        "continue": "Continue",
        "correcting": "Correcting",
        "begin": "Begin",
        "end": "End",
    },
    // 学习页面
    learn: {
        prev: 'Previous',
        next: 'Next',
        pageTitle: 'Chapter List - Chapter Study',
        chapter: 'Chapter',
        backToCoursePage: 'Back to course',
        keywordPlaceHolder: 'Please enter a key word.',
        myQuestion: 'My Questions',
        commonQuestion: 'FAQ',
        allQuestion: 'All Questions',
        writeQuestionLabel: 'Please enter your quetions.',
        quiz: 'Ask Question',
        totalQuestions: 'Total: <em>{{QuizTotalCount}}</em> Questions',
        totalNote: 'Total: <em>{{NoteTotalCount}}</em> Notes',
        notFoundText1: 'You can ask any questions ',
        notFoundText2: 'while study the course.',
        viewMore: 'Check More',
        goback: 'Back',
        findQuestionTmpl: '{{QuizTotalCount}} questions were found.',
        noKeyWordTitle: 'Sorry, no \“{{OldKeyWord}}\” related Q&A.',
        noQuestion: 'No questions.',
        noQuestionTitle: 'You can ask any questions<br />while study the course.',
        noContentLabel: 'Make notes.',
        publishNote: 'Make Note',
        note: 'Note',
        showAll: 'Show All',
        deleteNote: 'Delete',
        updateNote: 'Modify',
        cancelNote: 'Cancel',
        saveNote: 'Confirm',
        notFoundText3: 'You can make notes<br />while studying the course.',
        catalogPanel: 'Catalogue',
        quizpanel: 'Q&A',
        notepanel: 'Note',
        collapse: '[Hide]',
        showAll2: '[Show All]',

        exercise: {
            answercard: "Question card",
            score: "Score",
            guid: "Exercise guid",
            prevQuestion: "previous",
            nextQuestion: "next",
            redAnswerErrorQuestion: 'preview',
            commit: "submit"
        }
    },
    // 培训认证频道
    trains: {
        // 后台系统
        systemManage: {},
        // 前台页面
        frontPage: {
            //分钟
            minutes: ' mins',
            // 评价
            evaluate: {
                newEvaluateLabel: 'Please enter your satisfaction rating'
            },
            //请先报名
            courseClickTips: 'Please enroll in advance.',
            //请先支付
            waitingPay: 'Please pay for this training.',
            //请先去选课
            waitingCouseSelection: 'Please go to select courses',
            //尚未开课
            waitingCourses: 'Not started.',
            //培训已结束
            trainHasOver: 'The training has been ended.',

            //无培训提示
            noTip: 'No related trainings.',
            //页面标题
            pageTitle: 'Training',
            //培训详情
            detailTitle: 'Training details',
            //等待报名
            waitRoll: 'You have not signed up for this training. Please set it as your objective first.',
            //门课程
            _courses: ' courses',
            //个培训
            _trainings: ' trainings',
            //学时
            _hours: ' periods',
            //学时不足
            lessHour: 'Lack of periods',
            //个考试
            _exams: ' exams',
            //共有
            _total: 'Total: {{count}}',
            //'目前共有 ' + StudyNum + '人学习 '
            _currentCount: '{{count}} learners are studying.',
            //通过方式：
            _passWay: 'How to Pass: ',
            //'修满' + MinHours + '个学时'
            _fullHours: 'Complete {{hours}} periods',
            //资源：
            _source: 'Resource: ',
            //共
            _all: ' ',
            //门课
            _mk: ' courses',
            //个考试
            _gks: ' exams',
            //个
            _g: ' ',
            //内含：
            contain: '; Contains: ',
            //视频
            _videos: 'videos ',
            //文档
            _txt: 'documents ',
            //练习
            _train: 'exercises ',
            //学时；
            _h: ' periods',
            //考试
            _exam: 'Exam',
            //培训课程
            _trainCourse: 'Training Course',
            //解锁条件
            unlock_condition: 'Unlock Condition',
            //使用兑换券后方可解锁本培训
            user_coincertificate: 'Use voucher to unlock the trainning',
            preTrainOrCoincertificate: 'Complete pre-trainings or use voucher to unlock the trainning.',
            preTrainAndCoincertificate: 'Complete pre-trainings use voucher to unlock the trainning.',
            preTrain: 'Pre-train'
        }
    },
    homePage: {
        frontPage: {
            courseInfo: '{{Title}} ({{MinHours}} Course periods, {{StudyNum}} Persons)'
        }
    },
    /**
     *
     *选课页面
     */
    selectCourse: {
        title: '培训选课_en',
        studyHour: '({{studyHour}})学时_en',
        studyHourText: '学时_en',
        required: '必修_en',
        option: '选修_en',
        requiredCourse: '必修课_en',
        optionCourse: '选修课_en',
        //共 8 课程
        totalCourse: '共<i>{{totalCourse}}</i>门课程_en',
        //【必修课】10 /50 学时 
        requiredTotal: '【必修课】<i>{{reqProHour}}</i> /{{totalReqHour}} 学时_en',
        //【选修课】2 /50 学时
        optionTotal: '【选修课】<i>{{opProHour}}</i> /{{totalOpHour}} 学时_en',

        totalProgress:'总进度：<i>{{progress}}</i>/100_en',
        requiredProgress: '【必修课】<i>{{requireProgress}}</i> /100_en',
        optionProgress: '【选修课】<i>{{optionProgress}}</i> /100_en',

        totalResource: '共<i>{{totalResource}}</i>个资源_en',
        requiredResourceTotal: '【必修课】<i>{{reqResource}}</i> /{{totalReResource}} 资源_en',
        optionResourceTotal: '【选修课】<i>{{opResource}}</i> /{{totalOpResource}} 资源_en',

        //去选课
        goSelectCourse: '去选课_en',
        //培训有效期
        trainPeriod: '培训有效期：_en',
        //培训总学时：
        trainTime: '培训总学时：_en',
        //必修 <i class="blue" data-bind="text:model.train.demand_require_hour"></i>学时
        requiredHour: '必修 <i class="blue">{{requireHour}}</i>学时_en',
        //选修 <i class="blue" data-bind="text:model.train.demand_option_hour"></i> 学时
        selectTime: '选修<i class="blue">{{optionHour}}</i>学时_en',
        //2016-10-25 10:20至2017-10-25 10:20
        availbleArea: '{{startTime}}至{{endTime}}_en',
        //报名后<i class="fc5">{{days}}</i>天
        sinUpDays: '报名后<i class="blue">{{days}}</i>天_en',
        //时间自主
        freeTime: '时间自主_en',
        //共有10门必修课，12门选修课
        courseStatistics: '共有<i>{{requireLength}}</i> 门必修课， <i>{{optionLength}}</i>门选修课_en',
        //选课保存成功
        saveSuccess: '选课保存成功_en',
        //所选学时不足，请调整课程组合
        hourNotEnough: '所选学时不足，请调整课程组合_en',
        //如果取消在学选修课，该课程已完成学时将不计入您的学习进度中
        initTip: '如果取消在学选修课，该课程已完成学时将不计入您的学习进度中。_en',
        //已选X门课程，
        selectedNum: '已选<i>{{selectedNum}}</i>门课程，_en',
        //共x学时
        selectedHour: '共<i>{{selectedHour}}</i>学时_en',
        //，超过学时
        exceedHour: '，超过<i>{{exceedHour}}</i>学时_en',
        //，还差x学时
        lackHour: '，还差<i>{{lackHour}}</i>学时_en',
        //保存所选课程
        saveAllCourse: '保存所选课程_en',
        //确认选课
        confirmSelect: '确认选课_en',
        //重新选课
        reSelectCourse: '重新选课_en',
        //选课说明        
        selectIntro: '选课说明：_en'
    },
    /**
     *培训简介相关
     */
    trainIntroduce: {
        frontPage: {
            //分数
            scoreMark: '<em>{{count}}</em>',
            nodata: 'No related data',
            //简介
            intro: "Intro",
            //课程
            classes: "Courses",
            // 考试
            exams: 'Quiz',
            //报名有效期：
            validPeriod: "Registration Time: ",
            //报名注意事项：
            warning: "Enrollment Attention: ",
            //暂无介绍
            noIntroduce: "No related data.",
            //暂无同学
            noClassmate: "No related data.",
            //培训简介：
            introduce: "Introduction: ",
            //课程学友
            classmates: "Learners",
            //同学
            classmate: "Learners",
            classmatePeople: " ",
            //排行
            ranking: "Rank",
            //人
            people: " Participant(s)",

            //你的排名
            other1: 'Your rank',
            //位，本周学习
            other2: '，in this week you have learned ',
            //学时
            hours: ' periods',
            //开始学习吧，榜首先到先得！
            messageToLearn: 'The first place is waiting for you.',
            //赶紧报名第一个开始学习吧！
            messageToReg: 'Go to Study First in Hurry!',
            //排行榜更新于
            updateTime: 'Latest refresh is on ',
            //7天学习排行榜
            board: 'Ranking',
            //评价
            evaluate: 'Reviews',
            //收藏
            collection: 'Favorite',
            cancelCollection: 'Cancel Favorite',
            collectionFail: 'Failure, try again!',
        }
    },
    /**
     *查看试卷页面
     */
    examCheck: {
        frontPage: {
            //答案解析
            analysis: '【Analysis】',
            //无
            noAnalysis: 'No analysis.'
        }
    },
    //培训，查看成绩
    examResultInfo: {
        frontPage: {
            //返回
            back: '< back',
            //考试成绩详细说明
            examResultDetail: 'Result Instruction',
            //子科目
            subSubject: 'Sub-subject',
            //成绩
            result: 'Score',
            //点评
            evaluation: 'Comment',
            //总评
            totalEvaluation: 'Overall: ',
            //我的答卷
            myAnswer: 'My answer-sheet',
            //干系人分析
            relation: 'Person Analysis',
            //不错
            goodJob: 'Good job.',
            endOfTest: 'end of test',
            myAnsweredPaper: "my answered paper",
            remove: 'remove',
            download: 'download',
            dataDownload: "data download",
            examDetail: "exam detail",
            passLine: "pass line",
            subject: "subject",
            examChildrenSubjectDetail: "Exam Children Subject GUID",
            examTime: "Exam Begin Time",
            deleteAnsweredExam: 'Are you sure you want to delete answer',
            sure: "Ok",
            cancel: 'Cancel',
            document: 'document',
            uploadSuccess: 'Upload Success',
            msg1: 'Upload file size exceeds the limit, the maximum can only upload 10M files',
            msg2: 'The selected file size cannot be 0',
            msg3: 'Extended name not supported',
            msg4: 'Quene Error',
            second: 'second',
            butongguo: 'Fail',
            youtiaojiantongguo: 'Conditional Pass',
            tongguo: 'Success',
            offlineExam: 'Offline Exam'
        }
    },
    //培训，考试说明
    examInformation: {
        frontPage: {
            //返回
            back: '< back',
            //距离考试结束：
            endTime: 'Remaining Time: ',
            //我的答卷
            myAnswer: 'My answer-sheet',
            //删除
            //            delete:'Delete',
            //下载
            download: 'Download',
            //考试信息
            examInfo: 'Exam Info',
            //考试时间
            examDate: 'Exam Duration',
            //BeginTime() + ' 至 ' + EndTime()
            examDuration: '{{BeginTime}} to {{EndTime}}',
            //考试子科目说明
            examSubSubjectInfo: 'Subject Instruction',
            //子科目
            subSubject: 'Sub-subject',
            //及格线
            passLine: 'Passing line',
            //考试说明
            examNotice: 'Instruction',
            //资料下载
            resourceDW: 'Download',
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
                //首页
                homePage: 'Home',
                //课程列表
                courseList: 'Course List',
                //课程详情
                courseComponent: 'Course Detail',
                //评价
                evaluate: 'Reviews',
                //收藏
                collection: 'Favorite',
                //分享
                share: 'Share',
                //课程介绍
                courseIntroduce: 'Intro',
                //课程介绍
                courseIntroduceTh: 'Course Intro',
                //目录
                catalog: 'Catalogue',
                //考试
                exam: 'Quiz',
                //人
                people: ' Participant(s)',
                //即将开始报名
                courseStatus1: 'Registration is about to open.',
                //报名已结束
                courseStatus2: 'Registration has ended',
                //报名人数已满
                courseStatus3: 'The class is full',
                //待审核
                courseStatus4: 'Wait for review',
                //重新报名
                courseStatus5: 'Sign up again',
                //线下报名
                courseStatus6: 'Offline Sign-up',
                //即将开课
                courseStatus7: 'Class will begin',
                //课程已结束
                courseStatus8: 'The course has ended',
                //马上报名
                courseStatus9: 'Sign up now',
                //剩余名额
                courseStatus10: 'Remaining',
                //开始于
                courseStatus11: 'Started',
                //解锁课程
                courseStatus12: 'Unclock Course',
                //课程学友
                courseStudents: 'Classmate',
                //先修课程
                preCourse: 'Prerequisite Course',
                //开始学习
                startStudy: 'Start',
                //复习回顾
                agStudy: 'Review',
                //继续学习
                resumeStudy: 'Continue',
                //第
                d: 'No.',
                //章
                z: 'Chapter',
                //节
                j: 'Section',
                //暂无简介
                tip1: 'No introduction',
                //课程资源即将上线
                tip2: 'The course will be available soon',
                //该课程暂无考试
                tip3: 'No exam for this course',
                //该课程下无学习资源！
                tip4: 'No resource for this course',
                //请先报名
                tip5: 'Please sign up first',
                //即将开始报名
                tip6: 'Registration is about to open',
                //该课程报名已结束
                tip7: 'The sign-up time has ended.',
                //报名人数已满
                tip8: 'The class is full',
                //还未通过审核
                tip9: "You haven't passed the verification",
                //请重新报名
                tip10: 'Please sign up again',
                //请线下报名
                tip11: 'Please sign up offline',
                //即将开课
                tip12: 'Class will begin',
                //该课程已结束
                tip13: 'This course has ended',
                //请先解锁课程
                tip15: 'Please unlock the course, first',
                //未登录
                tip14: "You haven't logged in",
                //已完成
                finish: 'Completed',
                //课程详情
                title: 'Course Detail',
                //上一页
                prev: 'Previous',
                //下一页
                next: 'Next',
                //页
                page: 'Page',
                //次考试机会
                exam1: 'exam chances',
                //历史成绩
                exam2: 'History Record',
                //总分
                exam3: 'Total Score',
                //分
                exam4: 'points',
                //分过关
                exam5: 'to pass',
                //时长
                exam6: 'Duration',
                //分钟
                exam7: 'minutes',
                //分
                exam8: 'points',
                //开始
                exam9: 'Start',
                //即将开始
                exam10: 'Begin Soon',
                //结束
                exam11: 'End',
                //开始考试
                exam12: 'Start',
                //重新考试
                exam13: 'Once Again',
                //继续考试
                exam14: 'Resume',
                //要求完成课程
                exam15: 'Please finish the course first',
                //学时不足
                exam16: 'Insufficient learning hours',
                //已结束
                exam17: 'Ended',
                //待批改
                exam18: 'To be corrected',
                //无考试机会
                exam19: 'No chance',
                //信息
                alertTitle: 'Info',
                //确定
                sure: 'Confirm',
                //适合人群：
                userSuit: 'Recommended: ',
                //该用户信息已不存在
                userNoExit: 'The user information does not exist',
                chapterUnlock: 'Chapter unlocking conditions:',
                UnlockTip1: 'Study in order or use voucher to unlock the chapter.',
                courseUnlock: 'Course unlocking conditions:',
                UnlockTip2: 'Completed Pre-training or use voucher to unlock the train.',
                UnlockTip3: 'Completed Pre-training use voucher to unlock the train.',
                UnlockTip4: 'Use voucher to unlock the course.'
            },
            learn: {
                //返回课程主页
                back: 'Home page',
                //课程学习资源
                title: 'Course Resource',
                //上一个
                prev: 'Previous',
                //下一个
                next: 'Next',
                //chapter
                catalog: 'chapter',
                //课时_e
                course: 'Course Hour'
            }
        }
    },
    //搜索结果
    searchList: {
        frontPage: {
            //搜索结果
            pageTitle: 'search results',
            //请输入关键词
            keyWord: 'search keyword',
            //全部
            all: 'All',
            //职位规划
            job: 'Career',
            //培训认证
            train: 'Training',
            //公开课
            singleCourse: 'Courses',
            //更多职位规划
            moreJobs: 'More Career',
            //更多培训认证
            moreTrains: 'More Training',
            //更多公开课
            moreSingleCourse: 'More Courses',
            //搜索
            search: 'search',
            //门课程
            _courses: 'courses',
            //学时
            _hours: 'periods',
            //个考试
            _exams: 'exams',
            //暂无“<span data-bind="text:model.filter.title()"></span>”相关内容
            _nodata: 'No “{{filter}}” Related content'
        }
    },
    details: {
        overview: 'Comprehensive',
        not_exist: 'The training doesn\'t exist.',
        exam_not_exist: 'The quiz doesn\'t exist.',
        not_qualified: 'The quiz failed to meet the start requirement.',
        exam_offline: 'The quiz was removed.',
        need_authorization: 'User\'s authorization info is needed.',
        not_start: 'The training hasn\'t started.',
        end: 'The training has ended.',
        train_offline: 'The training was removed.',
        enroll_denied: 'Your signup was rejected.',
        course_offline: 'The course was removed.',
        course_not_exist: 'The course doesn\'t exist.',
        no_exam_for_training: 'No quiz for the training',
        no_course_for_training: 'No course for the training',
        exam_chances: 'Quiz chances: {{chances}}',
        pass_score: 'Score {{score}} to pass',
        history_score: 'History Score',
        train_over_time: 'End in {{days}} day(s) {{hours}} hour(s)',
        many_chances: 'Unlimited',
        no_chance: 'No chance for quiz',
        remaining_places: 'Remaining places',
        start_requirement: 'Requirement',
        all_score: 'Total Score: ',
        duration: 'Duration:',
        minute: 'minute',
        pass: 'Passed',
        notPass: 'Fail',
        beginExam: 'Start',
        endExam: 'Ended',
        //todo 翻译文档
        retry: 'Take the quiz again.',
        //todo 翻译文档
        goon: 'Continue',
        //todo 翻译文档
        will_begin: 'Begin in a minute',
        //todo 翻译文档
        no_vacancy: 'No vacancy',
        //学时不足
        hourLess: 'Lack of periods',
        //等待批改
        waitCorrect: 'To be corrected',
        completed: 'Finished',
        tips: {
            enroll_first: 'You have not signed up for this training.',
            enrollUnConfirm: 'Enroll Uncomfirm'
        }
    },
    coin: {
        availbleTime: "Duration: <em>{{startTime}}</em> to <em>{{endTime}}</em>",
        notUse: "Available",
        used: "Used",
        invalid: "Expired",
        confirm: 'Confirm',
        cancel: 'Cancel',
        aware: 'I See',

        confirmUseCoin: "Please confirm using voucher",
        confirmPreTrainOrCoin: "1、Complete the pre-trainings<br>2、Use a voucher to unlock",
        confirmPreTrainAndCoin: "<p class='dialog-tl'>Complete the pre-trainings</p><p class='lh2'>《<span class='pre-train-hint' title='{{preTrain}}'>{{preTrain}}</span>》</p><p class='dialog-tl'>then use a voucher to unlock!</p>",
        AlreadyPreTrain: "You have already completed the pre-trainings<br/>please use a voucher to unlock",
        hint: 'Tip',
        noneOfPreTrainOrCoin: "1、Complete the pre-trainings<br/>2、Use a voucher to unlock",
        unlockPreTrainFirst: "Please unlock the training, first",

        useCoin: "Use Voucher",
        confirmUsing: "Confirm",
        checkMyCoins: "View My Vouchers",
        availbleCoins: "Availble Vouchers",
        useTheseWays: "Availble Ways",
        noCoupon: "No Voucher Available",

        systemInfo: "System Info"
    }
};