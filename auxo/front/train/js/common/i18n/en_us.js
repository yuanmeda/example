/**
 * Created by Administrator on 2015/12/9.
 */
/**
 * Created by Administrator on 2015/12/4.
 */
i18n.trainComponent = {
    common: {
        // 各种JS插件的语言设置
        addins: {
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

        //前台页面
        frontPage: {
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

            // 培训状态
            enrollStatus: {
                offline: 'Offline',
                enrollNotStart: 'Enroll not started' ,
                notEnroll: 'Enroll now' ,
                enrollEnded: 'Enroll ended' ,
                offlineEnroll: 'Enroll offline' ,
                enrollUnConfirm: 'Enroll Uncomfirm' ,
                enrollAgain: 'Enroll again' ,
                goPay: 'Pay now',
                payUnConfirm: 'Pay Unconfirm' ,
                payAgain: 'Pay again' ,
                finished: "Ended" ,
                notStarted: "Not Started",
                choiceCourse: "Select Course",
                toSelectCourse: 'Waiting to start courses' ,
                learning: 'Continue',
                finish: 'Review' ,
                ended: 'Ended',
                unlock:'解锁培训',
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
            payLabel3: 'Use Coupon',
            //文本4
            payLabel4: 'Enter your coupon serial number.',
            //文本5
            payLabel5: 'Use',
            //输入文本1
            inputLabel1: 'Coupon Serial Number:',
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
            minutes:' mins',
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
            _total:'Total: {{count}}',
            //'目前共有 ' + StudyNum + '人学习 '
            _currentCount: '{{count}} learners are studying.',
            //通过方式：
            _passWay: 'Passing Method: ',
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
            unlock_condition:'解锁条件：',
            //使用兑换券后方可解锁本培训
            user_coincertificate:'使用兑换券后方可解锁本培训',
            preTrainOrCoincertificate:'完成先修培训或使用兑换券后方可解锁本培训',
            preTrainAndCoincertificate:'完成先修培训且使用兑换券后方可解锁本培训'
        }
    },
    homePage: {
        frontPage: {
            courseInfo: '{{Title}} ({{MinHours}} Course periods, {{StudyNum}} Persons)'
        }
    },
    /**
        *培训简介相关
        */
    trainIntroduce: {
        frontPage: {
            nodata: 'No related data',
            //简介
            intro: "Information",
            //课程
            classes: "Courses",
            // 考试
            exams: 'Exams',
            //报名有效期：
            validPeriod: "Registration Time: ",
            //报名注意事项：
            warning: "Enrollment Attention: ",
            //暂无介绍
            noIntroduce: "No related data.",
            //培训简介：
            introduce: "Introduction: ",
            //课程学友
            classmates: "Learners",
            //同学
            classmate: "Learners",
            //排行
            ranking: "Ranking",
            //人
            people: " ",
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
            //收藏
            collection: 'Favorite',
            cancelCollection: 'Cancel Favorite'
        }
    },
    /**
     *查看试卷页面
     */
    examCheck:{
        frontPage:{
            //答案解析
            analysis:'【Analysis】',
            //无
            noAnalysis:'No analysis.'
        }
    },
    //培训，查看成绩
    examResultInfo:{
        frontPage:{
            //返回
            back:'< back',
            //考试成绩详细说明
            examResultDetail:'Result Instruction',
            //子科目
            subSubject:'Sub-subject',
            //成绩
            result:'Score',
            //点评
            evaluation:'Comment',
            //总评
            totalEvaluation:'Overall: ',
            //我的答卷
            myAnswer:'My answer-sheet',
            //下载
            download:'Download',
            //干系人分析
            relation:'Person Analysis',
            //不错
            goodJob:'Good job.',
            endOfTest: 'end of test',
            myAnsweredPaper: "my answered paper",
            remove: 'remove',
            download: 'download',
            dataDownload:"data download",
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
            youtiaojiantongguo:'Conditional Pass',
            tongguo: 'Success',
            offlineExam: 'Offline Exam'
        }
    },
    //培训，考试说明
    examInformation:{
        frontPage:{
            //返回
            back:'< back',
            //距离考试结束：
            endTime:'Remaining Time: ',
            //我的答卷
            myAnswer:'My answer-sheet',
            //删除
//            delete:'Delete',
            //下载
            download:'Download',
            //考试信息
            examInfo:'Exam Info',
            //考试时间
            examDate:'Exam Duration',
            //BeginTime() + ' 至 ' + EndTime()
            examDuration:'{{BeginTime}} to {{EndTime}}',
            //考试子科目说明
            examSubSubjectInfo:'Subject Instruction',
            //子科目
            subSubject:'Sub-subject',
            //及格线
            passLine:'Passing line',
            //考试说明
            examNotice:'Instruction',
            //资料下载
            resourceDW:'Download',
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
                courseIntroduceTh:'课程介绍:',
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
                tip2: 'No course.',
                tip3: 'No exam.',
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
                exam13: 'Re-exam',
                exam14: '继续考试',
                exam15: '要求完成课程',
                exam16: '学时不足',
                exam17: '已结束',
                exam18: '待批改',
                exam19: '无考试机会',
                alertTitle: '信息',
                sure: '确定',
                userSuit:'适合人群：'
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
    //搜索结果
    searchList:{
        frontPage:{
            //搜索结果
            pageTitle:'search results',
            //请输入关键词
            keyWord:'search keyword',
            //全部
            all:'All',
            //职位规划
            job:'Career',
            //培训认证
            train:'Training',
            //公开课
            singleCourse:'Courses',
            //更多职位规划
            moreJobs:'More Career',
            //更多培训认证
            moreTrains:'More Training',
            //更多公开课
            moreSingleCourse:'More Courses',
            //搜索
            search:'search',
            //门课程
            _courses:'courses',
            //学时
            _hours:'periods',
            //个考试
            _exams:'exams',
            //暂无“<span data-bind="text:model.filter.title()"></span>”相关内容
            _nodata:'No “{{filter}}” Related content'
        }
    },
    details: {
        overview:'Comprehensive',
        not_exist:'The training doesn\'t exist.',
        exam_not_exist:'The quiz doesn\'t exist.',
        not_qualified:'The quiz failed to meet the start requirement.',
        exam_offline:'The quiz was removed.',
        need_authorization:'User\'s authorization info is needed.',
        not_start:'The training hasn\'t started.',
        end:'The training has ended.',
        train_offline:'The training was removed.',
        enroll_denied:'Your signup was rejected.',
        course_offline:'The course was removed.',
        course_not_exist:'The course doesn\'t exist.',
        no_exam_for_training:'No quiz for the training',
        no_course_for_training:'No course for the training',
        exam_chances:'Quiz chances: {{chances}}',
        pass_score:'Score {{score}} to pass',
        history_score:'History Score',
        train_over_time: 'End in {{days}} day(s) {{hours}} hour(s)',
        no_chance:'No chance for quiz',
        remaining_places:'Remaining places',
        start_requirement:'Requirement',
        all_score: 'Total Score: ',
        duration:'Duration:',
        minute: 'minute',
        pass: 'Passed',
        notPass: 'Fail',
        beginExam: 'Start',
        endExam:'Ended',
        //todo 翻译文档
        retry:'Take the quiz again.',
        //todo 翻译文档
        goon:'Continue',
        //todo 翻译文档
        will_begin:'Begin in a minute',
        //todo 翻译文档
        no_vacancy:'No vacancy',
        //学时不足
        hourLess: 'Lack of periods',
        //等待批改
        waitCorrect: 'To be corrected',
        tips:{
            enroll_first:'You have not signed up for this training.',
            enrollUnConfirm:'Enroll Uncomfirm'
        }
    }
};
