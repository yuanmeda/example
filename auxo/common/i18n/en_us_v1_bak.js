/**
 * Created by Administrator on 2015/12/4.
 */
var i18n = {
    common: {
        // 各种JS插件的语言设置
        addins: {
            pagination: {
                first: 'First',
                last: 'Last',
                prev: 'Previous',
                next: 'Next',
                jumpTo: 'To Page ',
                page: '',
                jump: 'Skip',
                overview: 'Current: Page {{currentPage}}/Total: {{totalPage}} pages, {{totalCount}} records.'
            },
            jquery: {
                ajaxError: {
                    close: 'Close',
                    title: 'System Prompt',
                    originalErrorMessageTitle: 'Error happened when executing {{httpmethod}} request: {{errorMessage}}.',
                    stackTrace: 'Error Stack: ',
                    errorType: 'Error Type: ',
                    errorMessage: 'Error Message: ',
                    errorTitle: 'Error. Please report the following errors to customer service.'
                }
            },
            paper: {
                header: {
                    //剩余用时
                    remainTime: 'Remaing Time',
                    //保存答案
                    saveAnswer: 'Save Answer',
                    //保存
                    save: 'Save'
                },
                parts: {
                    //点击可切换
                    clickSwitch: 'Click to Switch'
                }
            },
            jstimer: {},
            swftimer: {},
            timer: {},
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
        /*
        todo enroll status should add later.
        */
        //前台页面
        frontPage: {
            tips: 'tips',
            // 取消订阅
            cancelSubscribe: 'cancel subscribe',
            mySubscribe: 'my subscribes',
            loginBeforeSubscribe: 'please login before subscribe',
            subscribeSuccess: 'subscribe success',
            moreSubscribeTips: 'tips: your subscribes more than 20, manage subscribed contents in "my subscribes"',
            subscribedTips:  'subscribe success content {{tagsName}} in channel {{channelName}}, we will prompts you for content updates',
            unSubscribedTips: 'unSubscribing content {{tagsName}} in channel {{channelName}}, you will not receive update prompts after cancellation',

            //登录/注册
            logInSinUp: 'Log in/Register',
            //用户名称
            username: 'User Name',
            //移动端
            mobilTerminal: 'Mobile Version',
            //退出
            logOut: 'Log out',
            //免费
            free: 'Free',
            //首页
            homePage: "Homepage",
            //公开课
            openClass: 'Public Course',
            //培训认证
            trainSign: 'Training Authentication',
            //职位
            jobPlan: 'Position',
            //职位规则
            jobPlanEx: 'Position Rule',
            //登录
            loginIn: 'Log in',
            //我的学习
            myStudy: 'My Study',
            //我的考试
            myExam:'My exam',
            //注销
            loginOut: 'Log out',
            //页脚
            footerPage: 'Fujian Huayu Future Education Technology Co., Ltd',
            //标注
            tagFlag: 'Technical Support',
            /*
             title相关
             */
            //培训介绍
            trainInfo: 'Training Introduction',
            //课程列表
            courseList: 'Course List',
            //职位介绍
            jobInfo: 'Position Introduction',
            //学习中心
            studyCenter: 'Study Center',
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
            hide:'hide',
            //更多
            more: 'More',
            //课程
            course: 'Course',
            //培训
            train:'train',
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
            passLabel: 'Passing Method',
            /*
             按钮相关
             */
            //报名
            registration: 'Sign-up',
            //马上报名
            registrationOnce: 'Sign Up',
            //线下报名
            offLineBtn: 'Offline Sign-up',
            //已结束
            finished: 'Finished',
            //未开考
            noOpen: 'Not Started',
            //已过期
            expired: 'Expired',
            //学时不足
            hourLess: 'Insufficient course hours.',
            //进入考试
            enterExam: 'Enter',
            //阅卷
            paperMark: 'Go Over',
            //补考
            examAgain: 'Make Up',
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
            delete: 'Delete',
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
            listItem: 'Total: {{CourseNum}} Courses/{{ExamNum}} Exams/{{MinHours}} Course Hours',
            //学习人数
            studyCount: '{{StudyNum}} Persons',
            //学时
            MinHours: '{{MinHours}} Course Hours',
            //最新
            top: 'Latest',
            //通过方式
            passWay: 'Complete {{MinHours}} Course Hours',
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
            testCondition2: 'Requirement: Complete {{RequireTotal}} Course Hours',
            //考试时长
            examTime: 'Duration: {{LimitSeconds}}',
            //及格线
            passLine: 'Passing Score: {{PassScroe}}',
            //最佳成绩1
            bestResult1: 'Highest Score: None',
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
            studyHour: 'Course Hour',
            //课程大纲
            courseOutline: 'Course Outline',
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
            text: 'Document',
            //练习
            practice: 'Exercise',
            //免费
            free:'free',
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
            payLabell: 'Confirm Payment Info',
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
    /*
     我的答疑页面
     */
    myQAs: {
        frontPage: {
            //我的答疑
            pageTitle1: 'My Q&A',
            //答疑详细页面
            pageTitle2: 'Answer Details',
            //答疑类型
            qaTypes: 'Answer Type',
            //全部问题
            allQuestion: 'All Questions',
            //我的问题
            myQuestions: 'My Questions',
            //我的回答
            myAnswers: 'My Answers',
            //常见问题
            commonQuestions: 'FAQ',
            //最新问题
            latestQuestion: 'Latest Questions',
            //最多回答
            withMostAnswers: 'Most Answers',
            //全部课程
            allCourses: 'All Courses',
            //问题排序
            sortQuestions: 'Sort Questions: ',
            //培训课程
            trainCourses: 'Training Courses: ',
            //搜索关键字
            htmlText1: 'Searched key word “',
            //，共找到
            htmlText2: '”, and ',
            //条结果
            htmlText3: ' results were found.',
            //赶快和大家分享你的知识经验吧~
            htmlText4: 'Share your knowledge and experience!',
            //在课程学习时遇到任何问题，都可以随时提问哦~
            htmlText5: 'You can ask any questions while studying the course.',
            //正在加载中，请稍候...
            htmlText6: 'Loading...',
            //抱歉，没有“
            htmlText7: 'Sorry, no “',
            //的相关答疑
            htmlText8: '” related Q&A.',
            //建议您：
            htmlText9: 'Suggestions: ',
            //1.更改关键字再搜索
            htmlText10: '1. Change key words.',
            //2.更改筛选条件
            htmlText11: '2. Change conditions.',
            //查看
            check: 'Check',
            //删除
            delete: 'Delete',
            //取消
            cancel: 'Cancel',
            //确认
            confirm: 'Confirm',
            //该问题有
            htmlText12: 'This question has ',
            //个回答：
            htmlText13: ' answers: ',
            //修改
            change: 'Modify',
            //[老师]
            teacher: '[Teacher]',
            //[我]
            me: '[Me]',
            //我来回答
            htmlText14: 'Let me answer.',
            /*
             js文件部分
             */
            //问题内容不能为空
            staticText1: 'Please enter the question.',
            //问题内容不能超过100个字
            staticText2: 'The question should not be more than 200 characters.',
            //确认删除该回答吗(本操作不可恢复)?
            staticText3: 'Are you sure you want to delete the answer (Irreversible)?',
            //回复内容不能为空
            staticText4: 'Please enter your answer.'

        }
    },

    /*
     我的笔记页面
     */
    myNote: {
        frontPage: {
            //我的笔记
            pageTitle: 'My Notes',
            //章节排序
            sortChapters: 'Sort by Chapter',
            //点击后按章节升序排序
            htmlText1: 'Ascending',
            //点击后按章节降序排序
            htmlText5: 'Descending',
            //时间排序
            sortByDate: 'Sort by Time',
            //点击后按时间升序排序
            htmlText2: 'Ascending',
            //点击后按时间降序排序
            htmlText6: 'Descending',
            //可以在课程学习时多记笔记，提高学习效果~
            htmlText3: 'You can make notes while studying the course.',
            //正在加载中，请稍候...
            htmlText4: 'Loading...',
            //"确认删除该笔记吗(本操作不可恢复)?
            staticText1: '"Are you sure you want to delete the note (Irreversible)?'
        }
    },
// 学习页面
    learn: {
        prev: 'Previous',
        next: 'Next',
        pageTitle: 'Chapter List - Chapter Study',
        chapter: 'Chapter',
        backToCoursePage: 'Back to Course Page',
        keywordPlaceHolder: 'Please enter a key word.',
        myQuestion: 'My Questions',
        commonQuestion: 'FAQ',
        allQuestion: 'All Questions',
        writeQuestionLabel: 'Please enter you quetion.',
        quiz: 'Ask Question',
        totalQuestions: 'Total: <em>{{QuizTotalCount}}</em> Questions',
        totalNote: 'Total: <em>{{NoteTotalCount}}</em> Notes',
        notFoundText1: 'You can ask any questions ',
        notFoundText2: 'while study the course.',
        viewMore: 'Check More',
        goback: 'Back',
        findQuestionTmpl: '<b>{{QuizTotalCount}}</b> questions were found.',
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
        showAll2: '[Show All]'
    },
// 培训认证频道
    trains: {
        // 后台系统
        systemManage: {},
        // 前台页面
        frontPage: {
            //无培训提示
            noTip: 'This training does not exist.',
            //页面标题
            pageTitle: 'Training List',
            //培训已结束
            trainHasOver: 'The training has ended.',
            //等待报名
            waitRoll: 'You have not signed up for this training. Please set it as your objective first.',
            //门课程
            _courses: ' Courses',
            //学时
            _hours: ' Course Hours',
            //个考试
            _exams: ' Exams',
            //共有
            _total: 'Total: ',
            //'目前共有 ' + StudyNum + '人学习 '
            _currentCount: 'Current, {{count}} persons are studying.',
            //通过方式：
            _passWay: 'Passing Method: ',
            //'修满' + MinHours + '个学时'
            _fullHours: 'Complete  + {{MinHours}} +  Course Hours',
            //资源：
            _source: 'Resource: ',
            //共
            _all: 'Total: ',
            //门课
            _mk: ' Courses',
            //个考试
            _gks: ' Exams',
            //个
            _g: '',
            //内含：视频
            _videos: 'Contain: videos',
            //文档
            _txt: 'documents',
            //练习
            _train: 'exercises',
            //学时；
            _h: 'Course Hours',
            //考试
            _exam: 'Exam',
            //培训课程
            _trainCourse: 'Training Course'
            //等待审核
        }
    },
// 职业规划频道
    jobs: {
        // 后台系统
        systemManage: {},
        // 前台页面
        frontPage: {
            //提示
            htmlText5: 'Prompt',
            //培训课程
            htmlText3: 'Training Course',
            //课&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;程：
            htmlText4: 'Course&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:',
            //共
            total: 'Total: ',
            //门课
            coursesNr2: ' Courses',
            //目前共有 ' + StudyNum + '人学习
            htmlText1: 'Current, {{StudyNum}} persons are studying.',
            //内含：视频
            htmlText2: 'Contain: video',
            //个考试
            examNr: ' exams',
            //门课程
            coursesNr: ' courses',
            //分类：
            catalogs: 'Catalogue: ',
            //全部
            all: 'All',
            //学时
            studyHour: 'Course Hour',
            //个
            number:' ',
            //无培训提示
            noTip: 'This position does not exist.',
            //页面标题
            pageTitle: 'Position List',
            //详细介绍
            itemDetail: 'Details',
            //提示框文本
            modelTip: 'Your previous career objective is {{target}}. Would you like to modify?',
            //设定为职业目标
            setTarget: 'Set as Career Objective',
            //培训已结束
            trainHasOver: 'The training has ended.',
            //等待报名
            waitRoll: 'You have not signed up for this position. Please set it as your career objective first.',
            //等待审核
            waitAuditing: '您的报名资料已提交，请等待审核'

        }
    },
//课程报名
    enrolls: {
        // 前台页面
        frontPage: {
            //您的缴费凭证正在审核中
            offlinePayText1: 'Your payment voucher is being verified.',

            /*
             js文件相关
             */
            //发票已合并开具至指定单位。
            staticText1: 'The receipt has been made.',
            //等待发票开具。
            staticText2: '等待发票开具。',
            //等待发票寄送。
            staticText3: 'Waiting for receipt to be delivered.',
            //发票已开，请尽快领取
            staticText4: 'The receipt has been made. Please claim ASAP.',
            //发票已寄送
            staticText5: 'The receipt has been delivered.',
            //如果取消报名，您的培训报名信息将被删除。<br/>是否要取消报名？
            staticText6: 'If you cancel sign-up, your sign-up info will be deleted.<br/>Continue?',
            //上传成功！
            staticText7: 'Uploaded successfully.',
            //<span class='uploadButton'>重新上传文件</span>
            staticText8: '<span class="uploadButton">Re-upload File</span>',
            //请等待审核。如有疑问请联系客服。
            staticText9: 'Waiting for verification. Please contact the customer service if you have any questions.',


            //页面标题1
            pageTitle1: 'Optional Course',
            //页面标题2
            pageTitle2: 'Select Training Course',
            //页面标题3
            pageTitle3: 'My Training',
            //页面标题4
            pageTitle4: 'Offline Payment',
            //页面标题5
            pageTitle5: 'Payment',
            //页面标题6
            pageTitle6: 'Sign-up Result',
            //页面标题7
            pageTitle7: 'Sign-up Info',


            //提示文本1
            courseLineTip: 'The new course is coming soon!',
            //提示文本2
            cancelSelectedCourseTip: 'Note: If you cancel the ongoing optional course, its completed course hours will not recorded in your study progress.',
            //提示文本3
            rollTip3: 'The new course is coming soon!',
            //提示文本4
            rollTip4: 'No training was found. Please change a key word.',
            //提示文本5
            rollTip5: 'No ongoing training.',
            //提示文本6
            rollTip6: 'Please enter a remark.',
            //提示文本7
            rollTip7: 'Please enter the remitter.',
            //提示文本8
            rollTip8: 'Check Receipt Info',
            //提示文本9
            rollTip9: 'Please enter the company name or student name.',
            //提示文本10
            rollTip10: '(Check the actual payment fee)',
            //提示文本11
            rollTip11: 'Please enter the detailed info.',
            //提示文本12
            rollTip12: 'Note: The receipt will be delivered with the method of pay on delivery. Please contact the customer service if you want to change the method.',
            //提示文本13
            rollTip13: 'Modify Receipt Info',
            //提示文本14
            rollTip14: 'Save Receipt Info',
            //提示文本15
            rollTip15: 'Confirm Receipt Info',


            //培训有效期
            trainPeriod: 'Training Validity: ',
            //选课说明
            courseDescription: 'Instruction: ',
            //已选
            selected: 'Selected: ',
            //门课程，共
            courseAll: ' courses. Total: ',
            //，还差
            short: '. Short: ',
            //共有
            all: 'Total: ',
            //门必修课,
            requireCourse: ' required courses.',
            //门选修课可以选择
            courseSelectable: ' optional courses can be selected.',
            //保存所选课程
            saveSelectedCourse: 'Save all selected courses.',
            //共选择
            allSelected: 'Total Selected: ',

            //正在培训
            training: 'Ongoing Training: ',
            //即将开通
            onOpenning: 'Coming Soon: ',
            //报名有效期
            rollPeriod: 'Validity: ',

            //报名培训
            rollTrain: 'Sign Up',
            //取消报名
            cancelRoll: 'Cancel',
            //缴费信息
            payInfo: 'Payment Info',
            //培训费用
            trainFee: 'Training Fee: ',
            //收件人
            recipients: 'Receiver: ',
            //电话
            telPhone: 'Telephone: ',
            //地址
            address: 'Address: ',
            //快递
            express: 'Express Delivery: ',
            //寄送日期
            sendDate: 'Delivery Date',

            //汇款信息
            remitInfo: 'Remittance Info',
            //汇款人
            remitPenson: 'Remitter: ',
            //汇款账号
            remitAccount: 'Account: ',
            //汇款日期
            remitDate: 'Date: ',
            //汇款金额：
            remitMoney: 'Amount: ',

            //发票抬头
            billTitle: 'Receipt Title: ',
            //发票金额
            billMoney: 'Receipt Amount: ',
            //寄送地址：
            sendAdress: 'Address: ',
            //手机号码
            telNumber: 'Mobile Number: ',
            //请在支付宝支付成功后点击“支付成功”按钮，如付款遇到问题时请联系客服
            paySuccessTip: 'Please tap the Done button after you pay successfully. Please contact the customer service if you have any problems.',
            //支付成功
            paySuccess: 'Done',
            //请输入优惠券序号！
            couponNumber: 'Please enter the serial number of the coupon.',
            //确认移除该优惠券吗
            removeCoupon: 'Would you want to delete this coupon?',
            //请先填写并保存发票信息。
            fillBillInfo: 'Please enter and save the receipt info.',
            //优惠券验证失败，请重新填写优惠券序号。
            couponValiteError: 'Failed to verify the coupon. Please enter again.',
            //请在快钱支付成功后点击“支付成功”按钮，如付款遇到问题时请联系客服
            //todo
            //福建省
            fjProvince: 'Fujian',
            //市辖区
            cityArea: 'District',
            //请输入发票抬头
            remitNoneError: 'Please enter the receipt title.',
            //发票抬头必须是{0}到{1}个字//todo
            remitFormatError: '发票抬头必须是{0}到{1}个字',
            //请输入邮政编码
            emailNoneError: 'Please enter the zip code.',
            //请输入街道地址
            addressNoneError: 'Please enter the address.',
            //街道地址不能多于{0}个字//todo
            addressFormat: '街道地址不能多于{0}个字',
            //请输入收件人
            recipientsNoneError: 'Please enter the receiver.',
            //请输入中文字符
            onlyChinese: 'Please enter the Chinese characters.',
            //请输入英文字符
            onlyEnglish: 'Please enter the English characters.',
            //格式错误
            formatError: 'Format error.',
            //请输入手机号码或者区号-固话
            phoneFormat: 'Please enter the mobile number or telephone number.',
            //邮编格式不正确，请重新输入
            emailError: 'The zip code should be 6 numbers.',
            //手机号码格式有误，请重新输入
            phoneError: 'The format of the mobile number is wrong.',
            //备注不能多于{0}个字
            remarkFormat: 'The remark should not be more than {0} characters.',
            //请先填写并保存发票信息！
            saveInfoTip: 'Please enter and save the receipt info.',
            //去学习
            goToStudy: 'Study Now',
            //您已经付过款无需重复支付，点击下方按钮去学习。
            notPayAgain: 'You have already paid. Please click the button below to study.',
            //重新填写优惠券
            fillCouponAgain: 'Re-enter Coupon',
            //优惠券验证失败，请重新填写优惠券序号。
            couponValidateError: 'Failed to verify. Please enter the coupon serial number again.',
            //姓名不能多于{0}个字//todo
            nameFormatError: '姓名不能多于{0}个字',


            //您可以选择
            selectAble: 'Please select: ',
            //修改报名资料
            editRollInfo: 'Modify Sign-up Info',
            //修改付款信息
            editPayInfo: 'Modify Payment Info',
            //去选课
            goSelectCourse: 'Select Course',
            //开始学习
            beginStudy: 'Start',
            //继续报名其他职位
            aheadJob: 'Sign up for Other Positions',
            //继续报名其他课程
            aheadCourse: 'Sign up for Other Courses',
            //继续报名其他培训
            aheadTrain: 'Sign up for Other Trainings',
            //您的报名资料已提交，请等待审核。
            waitAuditing: 'Your sign-up info has been submitted. Please wait for verification.',
            //您报名的培训尚未开始，请耐心等待。
            waitTrain: 'Your training has not started. Please wait.',
            //很遗憾，您的报名审核未通过。
            auditingFail: 'You failed to pass the verification.',
            //您的付款凭证已提交，请等待确认。
            waitConfirm: 'Your payment voucher has been submitted. Please wait.',
            //您的付款已通过, 请进入学习或报名其他培训。
            enterStudy: 'Your payment has been verified. Please enter to study or sign up for other trainings.',
            //您提交的付款信息有误，请重新提交。
            submitInfoError: 'The payment info you submitted is wrong. Please submit again.',
            //您尚未选课, 请进行选课或报名其他培训。
            hasNoSelected: 'Please select a course or sign up for other trainings.',
            //恭喜您，报名成功！
            rollSuccess: 'Signed up successfully.',
            //其他报名信息。
            otherRollInfo: 'Other sign-up info.',

            //填写基本资料
            baseInfo: 'Enter Basic Info',
            //填写附加资料
            alterInfo: 'Enter Additional Info',
            //附件信息要求//todo

            //若不存在你所在单位请联系客服
            contactCustomerService: 'Please contact the customer service if your company is not listed.',
            //若不存在你所在的单位，请自行添加
            addBySelf: 'Please add by yourself if your company is not listed.',
            //若不存在您所在单位请联系单位管理人员进行单位注册
            contactEnterp: 'Please contact your company to register if your company is not listed.',
            //请选择
            toSelect: 'Please Select',

            //付款单位(个人)不能为空
            paymentNoneError: 'Please enter the paying company/person).',
            //付款单位(个人)的长度应该在 {0} 到 {1}字符
            paymentFormat: 'The paying company/person should be {0} to {1} characters.',
            //收款账号为数字
            accountNumber: 'The account must be numbers.',
            //收款账号不能为空
            accountNoneError: 'Please enter the acccount number.',
            //收款账号长度应该在 {0} 到 {1}字符
            accountFormat: 'The account number should be {0} to {1} characters.',
            //汇款日期不能为空
            remitDateNoneError: 'Please enter the remittance date.',
            //汇款金额不能为空
            remitMoneyNoneError: 'Please enter the amount.',
            //汇款金额为数字
            remitMoneyNumber: 'The amount should be numbers.',
            //汇款金额应该在 {0} 到 {1}
            remitMoneyFormat: 'The amount should be {0} to {1}.',
            //备注不能为空
            remarkNoneError: 'Please enter the remark.',
            //备注长度应该在 {0} 到 {1}字符
            remarkFormat: 'The remark should be {0} to {1} characters.',
            //必须上传底单扫描图片！
            uploadPicFormat: 'Please upload the scanning photo.',
            //保存成功！
            picSaveSuccess: 'Saved successfully.',
            //添加图片
            picAdd: 'Add Photo',


            //报名中...
            onRolling: 'Signing up...',
            //选择上传文件
            selectFile: 'Upload File'
        }
    },
// 课程资源
    courses: {},
// 系统信息
    system: {},
// 视屏播放器
    videos: {
        play: 'Play',
        pause: 'Pause',
        replay: "Replay",
        volume: 'Volumn',
        preference: 'Settings',
        fullscreen: 'Full Screen',
        exitFullscreen: 'Exit',
        coveredTheEntireScreen: 'Full Screen',
        ad: 'Ad',
        second: 'second',
        sure: 'OK',
        cancel: 'Cancel',
        language: 'Language',
        subtitles: 'Subtitile',
        quality: 'Definition',
        auto: 'Auto',
        notAvailable: 'Not Available',
        noUseed: 'Do not use',
        ultimateHD: 'UHD',
        hd: 'HD',
        sd: 'Standard',
        smooth: 'Fluent',
        rapidly: 'Speedy',
        rightAnswerTitle: 'Your answer is right!',
        examinationQuestions: 'Detection Question',
        continuePlay: 'Continue',
        reAnswer: 'Answer Again',
        question: 'Questions',
        total: 'Total: ',
        hasAnswered: 'Answered',
        failAnswerTitle: 'Your answer is wrong. Please continue.',
        fastreverse: "Reverse 15 seconds",
        scale: "Size",
        chinese: "Chinese",
        english: "English",
        japanese: "Japanese"
    },
    // 文档播放器
    documents: {
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
    //    fullscreen: 'Full Screen',
    //exitFullscreen: 'Exit',
    //prev: 'Previous',
    //next: 'Next',
    //loading: 'Loading',
    //drag: 'Drag',
    //thumbnail: 'Thumbnails',
    //enlarge: 'Zoom In',
    //narrow: 'Zoom Out'
    },
// 作答组件
    hunters: {
        // 前台页面
        frontPage: {
            //页面标题1
            pageTitle1: 'Answer',
            //页面标题2
            pageTitle2: 'Exam Result',
            //页面标题3
            pageTitle3: 'Verify Exam Password',
            //答题卡
            answerCart: 'Answer Sheet',
            //试卷查阅
            papreView: 'View Exam Paper',
            //试卷说明
            paperInstruction: 'Instruction',
            //考试结果查阅
            examResultView: 'Check Exam Result',
            //试卷总分：
            totalScore: 'Total Score: ',
            //学员得分：
            personScore: 'Score: ',
            //题目信息
            questionInfo: 'Question Info',
            //本次成绩
            thisScore: 'Score',
            //本次客观题成绩
            thisObjectiveScore: 'Objective Question Score',
            //还有几次机会
            changeToExam: 'You still have {{countTime}} exam chances.',
            //总题数
            totalQuestions: 'Total: {{totalQuestions}} Questions',
            //总分
            allScore: 'Total Score: ',
            //得分
            getScore: 'Score: ',
            //作答
            answer: 'Answer: ',
            //答案
            result: 'Answer: ',
            //注意
            careTip: 'Note: ',
            //作答结果
            answerResult: 'Your Answer: {{UserAnswer}}　Correct Answer: {{Answer}}',
            //分
            fen: '',
            //共
            gong: 'Total: ',
            //题
            ti: 'Questions',
            //分钟
            minute: 'Minutes',
            //及格
            pass: 'Passed',
            //总分标签
            score: 'Total Score',
            //验证
            validate: 'Verification',
            //密码placeholder
            passwordPlace: '4-digit Verification Code',
            //考试验证码1
            testValidate1: 'Please enter the verification code to start the exam.',
            //考试验证码2
            testValidate2: 'Please contact the teacher to get your verification code.',
            //保存成功
            saveSuccess: 'Saved successfully.',
            //修改后试卷总分为 " + eval(paperPartScores.join('+')) + " 分，确认保存？
            editPaperScore: 'The total score will be {{totalScore}} after modification. Do you want to save?',
            //正确答案：" + Answer + " 未作答
            noAnswer: 'Right Answer: {{answer}}. Not answered.',
            //正确答案：" + Answer + " 作答
            hasAnswer: 'Right Answer: {{Answer}}. Your Answer: {userAnswer}',
            //未作答
            noAnswerLabel: 'Not Answered'

        }
    },
    homePage: {
        frontPage: {
            courseInfo: '{{Title}} ({{MinHours}} Course Hours, {{StudyNum}} Persons)'
        }
    },
// 公开课频道
    single_courses: {
        frontPage: {
            noCourses: 'This course does not exist.'
        }
    },
//登录页面
    login: {
        frontPage: {
            login: 'Log In',
            student: 'Student',
            teacher: 'Teacher',
            groupManager: 'Administrator',
            rememberMe: ' Remember Me',
            password: 'Password',
            techSupport: 'Technical Support',
            signUp: 'Sign Up',
            logining: 'Logging in...',
            validCode: 'Verification Code',
            tips: 'Refresh',
            forgetPassword: 'Forget Password',
            crmTel: 'Customer Service',
            previous: 'Previous',
            after: 'Next',
            /*
             js文件部分
             */
            //用户名/身份证号码
            staticText1: 'User Name/ID Card Number',
            //请输入用户名/身份证号码
            staticText2: 'Please enter your user name/ID card number.',
            //91通行证
            staticText3: '91 Accounts',
            //请输入密码
            staticText4: 'Please enter the password.',
            //请输入验证码
            staticText5: 'Please enter the verification code.',
            //用户名
            staticText6: 'User Name',
            //身份证号码
            staticText7: 'ID Card Number',
            //用户中心获取验证码异常，请稍后刷新浏览器重试。
            staticText8: 'Failed to get verification code. Please refresh the page later.',
            //用户中心服务器异常，请稍后刷新浏览器重试。
            staticText9: 'User center server error. Please refresh the page later.',
            //请输入用户名
            staticText10: 'Please enter your user name.'
        }
    },
    /*
     我的学习页面
     */
    myStudy: {
        frontPage: {
            //报名
            enroll: 'Sign Up',
            //选课管理
            courseMan: 'Course Management',
            //培训
            train: 'Training',
            //职位
            job: 'Position',
            //公开课
            course: 'Public Course',
            //搜索课程
            searchCourse: 'Searching course...',
            //培训要求
            trainRequirement: "Training Requirement",
            //点击显示培训要求
            trainRequirementTips: 'Tap to show training requirement.',
            //今日
            date: 'Today',
            //培训已经结束
            trainFinished: 'The training has ended.',
            //培训还剩
            trainLeft: "Remaining: ",
            //天
            day: 'days',
            //培训今天结束
            trainEdToday: 'The training ends today.',
            //培训明天结束
            trainEdTomorrow: 'The training ends tomorrow.',
            //继续选择
            chooseContinue: 'Continue',
            //培训已获得
            obtained: 'Completed: ',
            //学时
            studyHour: 'Course Hours',
            //培训已选课程
            selectedCourse: 'Selected Courses',
            //学习进度
            studyProgress: 'Progress',
            //已学
            learned: 'Studied',
            //共
            total: 'Total: ',
            //无学时要求
            noHoursRequired: 'No requirement.',
            //培训合格
            qualifiedTrain: 'Training Passed',
            //培训未合格
            unqualifiedTrain: 'Training Failed',
            //证书编号
            certificateNr: 'Certificate Number: ',
            //查看证书
            showCertificate: 'Check Certificate',
            //恭喜你
            congratulation: 'Congratulatons! ',
            //培训合格！
            qualifiedTrainM: 'You passed the training!',
            //培训尚未完成
            trainUnfinished: 'You have not completed the training. ',
            //继续努力
            learnContinue: 'Keep it up!',
            //很遗憾，
            apology: 'Sorry, ',
            //培训未合格。
            unqualifiedTrainM: 'You failed to pass the training.',
            //门课程
            courseNr: ' Courses',
            //本培训已结束，您可以：
            trainTipsText1: 'You have completed the training. Now you can: ',
            //1、通过笔记和答疑进行复习回顾
            trainTipsText2: '1. Review the training with notes and Q&A.',
            //2、切换学习其他培训 或者
            trainTipsText3: '2. Switch to study other trainings or ',
            //报名新的培训
            trainTipsText4: 'sign up for new trainings.',
            //2、切换学习其他课程 或者
            trainTipsText5: '2. Switch to study other courses or ',
            //报名新的课程
            trainTipsText6: 'sign up for new courses.',
            //2、切换学习其他职位 或者
            trainTipsText7: '2. Switch to study other positions or ',
            //报名新的职位
            trainTipsText8: 'sign up for new positions.',
            //默认排序
            defaultSort: 'Default Sort',
            //最近学习
            latestLearned: 'Latest Study',
            //正在努力加载中，请稍侯。
            loading: 'Loading. Please wait.',
            //抱歉，没有
            courseText1: 'Sorry, no “',
            //的相关课程
            courseText2: '” related course.',
            //建议您：
            courseText3: 'It is suggested to ',
            //更改关键字再进行搜索
            courseText4: 'change key words and search again.',
            /*
             培训提醒部分文本
             */
            //学习
            learn: 'Study',
            //亲爱的学员，本培训需要您修满
            textPart1: 'This training requires you to complete ',
            //学时，其中：
            textPart2: ' course hours, including ',
            //门必修课，获得
            textPart3: ' required courses: ',
            //门选修课，获得
            textPart4: ', optional courses: ',
            //参加并通过相应的考试
            textPart5: ', pass the related exam ',
            //，获得
            textPart6: 'and receive ',
            //考试待定，请等待通知
            textPart7: 'Please wait for the exam notice.',
            //请于
            textPart8: 'Before ',
            //前完成上述内容的学习
            textPart9: ', please complete the contents above, ',
            //及考试
            textPart10: 'pass the exam and ',
            //，获取培训证书
            textPart11: 'receive the training certificate.',
            /*
             星期
             */
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            saturday: 'Saturday',
            sunday: 'Sunday',
            unknown: 'Unknown',
            /*
             button相关
             */
            //开始学习
            studyBegin: 'Start',
            //复习回顾，
            studyPreview: 'Review',
            //继续上次学习
            continueLatestStudy: 'Continue Previous Study',
            //继续学习
            continueStudy: 'Continue',
            //培训切换
            changeTrain: 'Switch Training',
            //我的课程
            myCourses: 'My Courses',
            //未知姓名
            unknownName: 'Unknown name.',
            /*
             EmtpyIndex
             */
            //未报名任何培训
            emptyIndexText1: 'You have not signed up for any trainings.',
            //未报名培训
            emptyIndexText2: 'You have not signed up for any trainings.',
            //未报名任何培训，无学时要求
            emptyIndexText3: 'You have not signed up for any trainings.',
            //未报名任何培训， 快快去报名吧
            emptyIndexText4: 'You have not signed up for any trainings.',
            /*
             js 静态文件中的文本国际化
             */
            //请勿输入非法字符。
            staticText1: 'Please do not enter illegal characters.',
            //学员您好！您的基本资料不完整，可能影响培训结果或导致证书生成失败，请在完善基本资料后继续学习。
            staticText2: 'Your basic info is not complete, which may affect your training result and certificate. Please complete your basic info first.',
            //去补全资料
            staticText3: 'Complete Info',
            //学员您好！您的报名信息不完整，可能影响培训结果或导致证书生成失败，请在完善报名信息后继续学习。
            staticText4: 'Your sign-up info is not complete, which may affect your training result and certificate. Please complete your sign-up info first.',
            //公告
            notices: 'Notice'
        }
    },
//课程章节
    courseChapters: {
        frontPage: {
            //请先报名
            enrollAdvance: 'Please sign up first.',
            //必修
            requiredCourse: 'Required Course',
            //选修
            selectiveCourse: 'Optional Course',
            //课
            course: 'Course',
            //【收起】
            hide: '[Hide]',
            //【显示全部】
            showAll: '[Show All]',
            //返回课程列表
            backCourseList: 'Back to Course List',
            //课程封面
            logoImage: 'Course Cover',
            /*
             用户学习提醒类文本
             */
            //我知道了
            learnText1: 'OK',
            //学习小贴士
            learnText2: 'Study Tips',
            //看视频
            learnText3: '[Watch Video]',
            //请正常播放观看视频，拖动的进度将不计入学时。如视频中穿插课堂练习题，请答对题目后继续观看视频。
            learnText4: 'Please watch the video at normal speed. You will not get the course hour if you drag the progress. Please answer the questions correctly to continue watching the video.',
            //看文档
            learnText5: '[Read Document]',
            //本课程文档有学习时间要求，请注意文档左下方的倒计时，倒计时结束后方可获得对应学时。
            learnText6: 'Pay attention to the countdown. You can get the corresponding course hours when the countdown ends.',
            //做练习
            learnText7: '[Do Exercise]',
            //本课程共有<!--ko text:PracticeTotal--><!--/ko-->道练习题，做对<!--ko text:Math.ceil(PracticeToClassHour()*PracticeLimit())--><!--/ko-->题可获得练习对应学时。
            learnText8: 'There are {{totalEx}} questions in total. Answer {{remindsEx}} question correctly to get the corresponding course hours.',
            //上次学习到：<span>@lastCatalogName
            learnText9: 'Last Studied: {{lastCatalogName}}',
            //未学
            notLearned: 'Not Studied',
            courseOutline: 'Course Catalogue',
            //课程作业
            courseEx: 'Homework',
            //查看更多
            getMore: 'Check More',
            //最新提问
            latestQuestion: 'Latest Questions',
            //最新笔记
            latestNote: 'Latest Notes',
            //显示全部
            showAll: 'Show All',
            //资料下载
            resourceDownload: 'Download Resource',
            //下载
            download: 'Download',
            //任务
            task: 'Task',
            //页
            page: 'Page',
            //题
            question: 'Question',
            //再次学习
            learnAgain: 'Restudy',
            //开始练习
            startEx: 'Start',
            //继续练习
            continueEx: 'Continue',
            //再次练习
            previewEx: 'Redo',
            /*
             js文件
             */
            // "请于" + taskEndTime + "前完成“" + taskTitle + "”—《"
            staticText1: 'Please finish the study of the following course before {{taskEndTime}}: “{{taskTitle}}”-《',
            //》的学习。
            staticText2: '》.'
        }
    },


    /*
     选课页面
     */
    courseChoice: {
        frontPage: {
            //保存所选课程
            text1: 'Save Selected Courses',
            //还差<em> remain </em>学时，请调整课程组合
            text2: '<em>{{remain}}</em> more course hours are needed.',
            //本课程无大纲, 请见谅!
            text3: 'No outline.',
            //如果取消在学选修课，该课程已完成学时将不计入您的学习进度中。
            text4: 'If you cancel the ongoing optional course, the completed course hours will not be recorded in your study progress.',
            //我知道了
            text5: 'OK',
            //重新选课
            text6: 'Select Again',
            //确认并开始学习
            text7: 'Confirm and Start',
            //系统提示//todo
            text8: '系统提示'

        }
    },
    //end here
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
            studengFinishExam: '位同学完成考试',
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
            score: '{{score}} 分',
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
            delete: '删除',
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
            outputing: '导出中..'

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
    }
};
