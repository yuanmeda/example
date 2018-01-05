var i18n = {
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
            star: {
                low: 'low',
                normal: 'normal',
                better: 'better',
                good: 'very good',
                perfect: 'perfect',
                noSpecialElement: 'Please select a special element'
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
                download: 'Download',
                unConfirm: "UnConfirm",
                refused: "Rejected",
                pass: "Passed",
                use: "Study Now",
                undefined: "Undefined"
            },
            nav: {
                recommend: "Featured",
                //公开课
                singleCourse: "Open Courses",
                //培训认证
                train: 'Training',
                //职位
                job: 'Career',
                cloudCourse: 'Cloud Courses',
            },
            //登录/注册
            login: 'Sign in',
            signUp: "Sign up",
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
            //校园云课
            cloudCourse: 'Cloud Courses',
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
            myUpload: "My Upload",
            myDownload: "My Download",
            upload: "Upload",
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
    register: {
        "frontEnd": {
            "china": "China",
            "login": "Login",
            "sign_up": "Sign Up",
            "get_code": "Get Code",
            "phone": "Phone",
            "verification_code": "Verification Code",
            "nickname": "Nickname( at least 3 characters )",
            "password": "Password( 6-20 chars, include 2 kinds of numbers, letters and symbols )",
            "confirm_password": "Confirm Password",
            "hava_account": "Already Have An Account？"
        },
        "validate": {
            "none_mobile": "Mobile is required",
            "invalid_mobile": "Mobile is invalid",
            "invalid_password": "6-20 chars, include 2 kinds of numbers, letters and symbols",
            "blank_character": "Password couldn't include blank character",
            "invalid_verification_code": "Please enter verification code",
            "invalid_verification_code_fail": "Please enter verification code again",
            "invalid_nickname": "Please enter nickname",
            "invalid_nickname_min": "Nickname is at least 3 characters",
            "invalid_nickname_max": "Nickname is at most 20 characters",
            "invalid_confirm_password": "Password do not match",
            "invalid_system_fail": "System Error"
        }
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
            remove: 'Delete',
            //取消
            cancel: 'Cancel',
            //确认
            confirm: 'Confirm',
            //该问题有
            htmlText12: 'This question has ',
            //个回答：
            htmlText13: ' answers: ',
            //修改
            change: 'Edit',
            //[老师]
            teacher: '[Teacher]',
            //[我]
            me: '[Me]',
            //我来回答
            htmlText14: 'I answer.',
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
            sortChapters: 'Chapter',
            //点击后按章节升序排序
            htmlText1: 'Ascending',
            //点击后按章节降序排序
            htmlText5: 'Descending',
            //时间排序
            sortByDate: 'Time',
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
            //等待报名
            waitRoll: 'You have not signed up for this training. Please set it as your objective first.',
            //门课程
            _courses: ' courses',
            //个培训
            _trainings: ' trainings',
            //学时
            _hours: ' periods',
            //个考试
            _exams: ' exams',
            //共有
            _total: 'Total: {{count}}',
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
            htmlText3: 'Courses',
            //课&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;程：
            htmlText4: 'Course:',
            //共
            total: 'Total: ',
            //门课
            coursesNr2: ' courses',
            //目前共有 ' + StudyNum + '人学习
            htmlText1: '{{StudyNum}} leaners are studying.',
            //内含：视频
            htmlText2: 'Contain: video ',
            //个考试
            examNr: ' exams ',
            //门课程
            coursesNr: ' courses ',
            //分类：
            catalogs: 'Catalogue: ',
            //全部
            all: 'All',
            //学时
            studyHour: ' periods',
            //个
            number: ' ',
            //无培训提示
            noTip: 'No related jobs.',
            //页面标题
            pageTitle: 'Career list',
            //详细介绍
            itemDetail: 'Details',
            //提示框文本
            modelTip: 'Your previous career objective is {{target}}. Would you like to modify?',
            //设定为职业目标
            setTarget: 'Set as Career Objective',
            //培训已结束
            trainHasOver: 'The training is ended.',
            //等待报名
            waitRoll: 'You have not signed up for this position. Please set it as your career objective first.',
            //等待审核
            waitAuditing: 'Your sign-up info has been submitted. Please wait for verification.',
            //尚未开课
            waitingCourses: 'Not started.',
            //请先去选课
            choiceCourse: 'Please choice course before start.'

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
            staticText2: 'Waiting for making out receipt.',
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
            cancelSelectedCourseTip: 'Note: If you cancel the ongoing optional course, its completed course periods will not recorded in your study progress.',
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
            selected: ' ',
            //门课程，共
            courseAll: ' courses. Total: ',
            //，还差
            short: '. Lack: ',
            //共有
            all: ' ',
            //门必修课,
            requireCourse: ' required',
            //门选修课可以选择
            courseSelectable: ' elective',
            //保存所选课程
            saveSelectedCourse: 'Save all selected courses',
            //共选择
            allSelected: 'Total Selected: ',

            //正在培训
            training: 'Ongoing Training: ',
            //即将开通
            onOpenning: 'Coming Soon: ',
            //报名有效期
            rollPeriod: 'Validity: ',

            //报名培训
            rollTrain: 'Enroll',
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
            kqPaySuccess: 'Please click the Done button after you pay successfully. Please contact the customer service if you have any questions.',
            //福建省
            fjProvince: 'Fujian',
            //市辖区
            cityArea: 'District',
            //请输入发票抬头
            remitNoneError: 'Please enter the receipt title.',
            //发票抬头必须是{0}到{1}个字
            remitFormatError: 'The receipt title must be {0} to {1} characters.',
            //请输入邮政编码
            emailNoneError: 'Please enter the zip code.',
            //请输入街道地址
            addressNoneError: 'Please enter the address.',
            //街道地址不能多于{0}个字
            addressFormat: 'The address cannot be more than {0} characters.',
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
            //姓名不能多于{0}个字
            nameFormatError: 'The name cannot be more than {0} characters.',


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
            aheadJob: 'Register others',
            //继续报名其他课程
            aheadCourse: 'Register others',
            //继续报名其他培训
            aheadTrain: 'Register others',
            //您的报名资料已提交，请等待审核。
            waitAuditing: 'Your enrollment info has been submitted. Please wait for verification.',
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
            //(支持上传{{attachFormat}}的文件，文件大小不超过<b>4MB</b>，至多添加<b>{{attachNum}}</b>个附件）',
            attachInfo: 'Attachment Requirement',
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
    courses: {
        frontPage: {
            evaluate: {
                newEvaluateLabel: 'Please enter your satisfaction rating',
            },
            noNote: 'No Notes',
            noQuestion: 'No Questions',
            latestNotes: 'Latest Notes',
            latestQuestion: 'Latest Questions',
            chapter: 'Chapter',
            noChapter: 'No Contents',
            lastCatalogName: 'Last learn：',
            noCourseDetail: 'Course description, no data'
        }
    },
    // 系统信息
    system: {},
    // 视屏播放器
    videos: {
        noFlashPluginMessage: '<p>If you are unable to play the video, please make sure that you are installing Flash Player. </p><p><a href="http://get.adobe.com/cn/flashplayer/" target="_blank"> download </a>install the latest Flash Player</p>',
        videoText: 'video',
        audioText: 'audio',
        resourceStatusEncodingMessage: 'Sorry，this {{videoType}} no transcoding completed, please try again later.',
        resourceStatusReadyMessage: '{{videoType}}：Already in use',
        resourceStatusExpiredMessage: 'Sorry, the current {{videoType}} has been offline, can not be viewed.',
        resourceStatusDeleteMessage: 'Sorry, the current {{videoType}} has been deleted, can not be viewed.',
        resourceStatusDefaultMessage: 'Sorry, the {{videoType}} failed to load, the error code is:',
        resourceLoadFailMessage: 'Sorry, the video failed to load, the error code is：',
        play: 'Play',
        pause: 'Pause',
        replay: "Replay",
        volume: 'Volumn',
        preference: 'Settings',
        fullscreen: 'Full Screen',
        exitFullscreen: 'Exit',
        coveredTheEntireScreen: 'Full Screen',
        ad: 'AD',
        second: 'Second',
        sure: 'OK',
        cancel: 'Cancel',
        language: 'Lang',
        subtitles: 'Caption',
        quality: 'Quality',
        auto: 'Auto',
        notAvailable: 'N/A',
        noUseed: 'do not use',
        ultimateHD: 'UHD',
        hd: 'HD',
        sd: 'SD',
        smooth: 'Fluent',
        rapidly: 'Speed',
        rightAnswerTitle: 'Your answer is right!',
        examinationQuestions: 'detection question',
        continuePlay: 'continue',
        reAnswer: 'answer again',
        question: 'questions',
        total: 'total: ',
        hasAnswered: 'answered',
        failAnswerTitle: 'your answer is wrong. please continue.',
        fastreverse: "reverse 15 seconds",
        scale: "size",
        chinese: "chinese",
        english: "english",
        japanese: "japanese"
    },
    // 文档播放器
    documents: {
        main: {
            reload: 'Reload'
        },
        thumbanail: {
            noThumbanail: "No thumbnail."
        },
        message: {
            message: "Sorry, an error happened!",
            loadingTitle: "    Loading...    ",
            failTitle1: 'Failed to load. Please ',
            failTitle2: 'refresh',
            failTitle3: 'reload the page'
        },
        content: {
            top: 'Top',
            bottom: 'Bottom',
            left: 'Left',
            right: 'Right',
            loading: "Loading..."
        },
        bar: {
            thumbanail: 'Thumbnail',
            drag: 'Drag',
            choiceWord: 'Select Word',
            dragMode: 'Drag Mode',
            zonedWrodMode: 'Mark Mode',
            returnTopPage: 'You were here. Click to return to the first page.',
            prevPage: 'Previous',
            nextPage: 'Next',
            prevScreen: 'Previous Screen',
            nextScreen: 'Next Screen',
            narrow: 'Zoom Out',
            enlarge: 'Zoom In',
            fullscreen: 'Full Screen',
            exitfullscreen: 'Exit'
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
            fen: ' ',
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
            passwordPlace: '4-bit Valid Code',
            //考试验证码1
            testValidate1: 'Please enter the verification code to start the exam.',
            //考试验证码2
            testValidate2: 'Contact teacher to get valid code.',
            //保存成功
            saveSuccess: 'Saved successfully.',
            //修改后试卷总分为 " + eval(paperPartScores.join('+')) + " 分，确认保存？
            editPaperScore: 'The total score will be {{totalScore}} after modification. Do you want to save?',
            //正确答案：" + Answer + " 未作答
            noAnswer: 'Right Answer: {{answer}}. Not answered.',
            //正确答案：" + Answer + " 作答
            hasAnswer: 'Right Answer: {{Answer}}. Your Answer: {userAnswer}',
            //未作答
            noAnswerLabel: 'Not Answered',

            // errorTitle
            passwordErrorTitle1: 'Please enter a 4 digit code, number or letter in English.',
            passwordErrorTitle2: 'Verification code error'
        }
    },
    // 作答组件
    learning: {
        common: {
            judge: {
                //对
                right: 'right',
                //错
                wrong: 'wrong'
            },
            loading: {
                text: 'loading'
            },
            updater: {
                noNeedToSave: "No need to save",
                saveSuccess: "Save success",
                saveFaile: "Save faile"
            },
            explain: {
                title: 'Explanation'
            },
            navigatorStat: {
                title: "The score of this time",
                accuracy: 'Accuracy',
                right: 'Right:',
                question: '',
                error: 'Error:',
                noAnswer: 'N/A:'
            },
            option: {
                answerTitle: 'This option is the reference answer'
            },
            question: {
                temporarilyUncertain: 'Temporarily Uncertain',
                rightAnswerLabel: 'Correct Answer',
                answerRightTitle: 'Your\'s answer is right.',
                subjectiveUserAnswer: 'Subjective question user answer',
                questionExplanation: 'Subject explanation',
                questionsExplanation: 'A set of questions',
                notScore: '\tNot calculate',
                score: 'score',
                analysisTitle: '<N/A>',
                notAnswer: 'You did not answer',
                subQuestionUserTitle: 'You are wrong to',
                singleChoice: 'single choice',
                multipleChoice: 'multiple choice',
                indefiniteChoice: 'indefinite choice',
                completion: 'completion',
                subjectivity: 'subjectivity',
                judgment: 'judgment',
                matching: 'matching',
                complex: 'complex'
            }
        },
        exam: {
            answer: {
                sure: 'Submit',
                retry: 'retry',
                explanation: 'Explanation',
                msg1: 'Has completed all the questions and to determine the assignment?',
                msg2: "Has completed the {{doneCount}} questions, there are {{noAnswerCount}} questions before making sure you?",
                commitExam: 'Commit',
                commitFail: 'Commit Fail',
                continueAnswer: 'Continue answer',
                examFinishTitle: "Time out, can not continue to answer"
            },
            header: {
                residualTime: 'residual time',
                saveTitle: 'save answer',
                save: 'save'
            },
            parts: {
                buttonTitle: 'click to switch'
            },
            prepare: {
                back: '< back',
                question: 'Questions',
                totalScore: 'Full marks',
                pass: 'Pass',
                minute: 'Minutes',
                caution: 'caution',
                timeHint: 'The end of the distance test',
                cautionItem1: '1. Started after the test time after automatic assignment, please note the time schedule.',
                cautionItem2: '2. The answer came to an end, click on the "hand" to complete the exam',
                examFinishTitle: 'Exam has been Finished',
                examEndTitle: 'Time left : ',
                examStartTitle: 'From the start of the examination and:',
                examStartedTitle: 'The exam left: ',
                examFinished: 'Time out, can not continue to answer',
                commit: 'commit',

                hours: ' h ',
                minutes: ' m ',
                seconds: ' s',
                score: ' score'
            }
        },
        exercise: {
            answer: {
                commit: 'commit',
                reAnswer: 'repeat',
                explanation: 'explanation',
                exerciseScore: 'The score of this time',
                noAnswer: "Sorry! You have dit not answer, you can not submit the answer.",
                continueAnswer: 'contine answer',
                answerAllCommitTitle: "Have completed all the questions to determine the submission of the answer?",
                sure: 'sure',
                cancel: 'cancel',
                partialFinishCommitTitle: "Has completed the {{doneCount}} title, as well as {{noAnswer}} did not do, to determine the answer?",
            },
            prepare: {
                totalQuestion: 'total {{totalCount}} question',
                startAnswer: 'Start',
                bestScoreCaption: 'best score:',
                right: 'right',
                question: 'question',
                error: 'error',
                noAnswer: 'don\'t answer',
                accuracy: 'accuracy'
            }
        }
    },
    homePage: {
        frontPage: {
            courseInfo: '{{Title}} ({{MinHours}} Course periods, {{StudyNum}} Persons)'
        }
    },
    // 公开课频道
    single_courses: {
        frontPage: {
            //门公开课
            _single_courses: ' open courses',
            noCourses: 'No related courses.'
        }
    },
    //登录页面
    login: {
        frontPage: {
            login: 'Sign in',
            student: 'Learner',
            teacher: 'Facilitator',
            groupManager: 'Group Manager',
            rememberMe: ' Remember',
            password: 'Password',
            techSupport: 'Technical Support',
            signUp: 'Sign Up',
            logining: 'Please wait...',
            validCode: 'Verification Code',
            tips: 'Refresh',
            forgetPassword: 'Forgot password',
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
            staticText8: 'Failed to get verification code.<br> Please refresh the page later.',
            //用户中心服务器异常，请稍后刷新浏览器重试。
            staticText9: 'User center server error.<br> Please refresh the page later.',
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
            enroll: 'Enroll',
            //选课管理
            courseMan: 'Course Management',
            //培训
            train: 'Training',
            //职位
            job: 'Career',
            //公开课
            course: 'Open courses',
            //搜索课程
            searchCourse: 'Searching...',
            //培训要求
            trainRequirement: "Training Requirement",
            //点击显示培训要求
            trainRequirementTips: 'Tap to show training requirement.',
            //今日
            date: 'Today',
            //培训已经结束
            trainFinished: 'The training is ended.',
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
            studyHour: ' periods',
            //培训已选课程
            selectedCourse: 'Selected Courses',
            //学习进度
            studyProgress: 'Process',
            //已学
            learned: 'learned',
            //共
            total: 'Total: ',
            //无学时要求
            noHoursRequired: 'No requirement.',
            //培训合格
            qualifiedTrain: 'Training Passed',
            //培训未合格
            unqualifiedTrain: 'Not Pass',
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
            defaultSort: 'Default',
            //最近学习
            latestLearned: 'Latest',
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
            learn: ' ',
            //亲爱的学员，本培训需要您修满
            textPart1: 'This training requires you to complete ',
            //学时，其中：
            textPart2: ' periods, including ',
            //门必修课，获得
            textPart3: ' required courses: ',
            //门选修课，获得
            textPart4: ' optional courses: ',
            //参加并通过相应的考试
            textPart5: 'At the same time, pass the related exams ',
            //，获得
            textPart6: 'and receive ',
            //考试待定，请等待通知
            textPart7: 'Please wait for the exam notice.',
            //请于
            textPart8: 'Before ',
            //前完成上述内容的学习
            textPart9: ' you should satisfy the above requirement',
            //及考试
            textPart10: ', pass the exam',
            //，获取培训证书
            textPart11: ', receive the training certificate.',
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
            changeTrain: 'switch',
            //我的课程
            myCourses: 'My courses',
            //未知姓名
            unknownName: 'Unknown name.',
            /*
             EmtpyIndex
             */
            //未报名任何培训
            emptyIndexText1: 'You have not enrolled for any trainings.',
            //未报名培训
            emptyIndexText2: 'No Trainings',
            //未报名任何培训，无学时要求
            emptyIndexText3: 'You have not enrolled for any trainings.',
            //未报名任何培训， 快快去报名吧
            emptyIndexText4: 'You have not enrolled any trainings.',
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
            backCourseList: 'Back',
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
            learnText4: 'Please watch the video at normal speed. You will not get the course periods if you drag the progress. Please answer the questions correctly to continue watching the video.',
            //看文档
            learnText5: '[Read Document]',
            //本课程文档有学习时间要求，请注意文档左下方的倒计时，倒计时结束后方可获得对应学时。
            learnText6: 'Pay attention to the countdown. You can get the corresponding course periods when the countdown ends.',
            //做练习
            learnText7: '[Do Exercise]',
            //本课程共有<!--ko text:PracticeTotal--><!--/ko-->道练习题，做对<!--ko text:Math.ceil(PracticeToClassHour()*PracticeLimit())--><!--/ko-->题可获得练习对应学时。
            learnText8: 'There are {{totalEx}} questions in total. Answer {{remindsEx}} question correctly to get the corresponding course periods.',
            //上次学习到：<span>@lastCatalogName
            learnText9: 'Last Studied: {{lastCatalogName}}',
            //未学
            notLearned: 'Not Studied',
            courseOutline: 'Chapters',
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
            task: ' tasks',
            //页
            page: ' pages',
            //题
            question: ' questions',
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
            text2: '<em>{{remain}}</em> more course periods are needed.',
            //本课程无大纲, 请见谅!
            text3: 'No outline.',
            //如果取消在学选修课，该课程已完成学时将不计入您的学习进度中。
            text4: 'If you cancel the ongoing optional course, the completed course periods will not be recorded in your study progress.',
            //我知道了
            text5: 'OK',
            //重新选课
            text6: 'Select Again',
            //确认并开始学习
            text7: 'Confirm and Start',
            //系统提示
            text8: 'Prompt'

        }
    },
    /*
     教师评课页面
     */
    teachCheck: {
        frontPage: {
            //我的概览(home-index)
            myOverview: 'Overview',
            //您当前负责：
            yourResponsibility: 'Your Responsibility:',
            //门课程
            courses: ' courses',
            //共有：
            allCount: 'Total: ',
            _allCount: 'Total: ',
            //条未完成的答疑，已完成答疑
            questionView: ' uncompleted questions. Completed: ',
            //条
            item: ' ',
            //场考试，
            examCount: ' exams, ',
            //张卷子待批改
            paperCountToView: ' exam papers to be corrected.',
            //当前老师答疑统计
            questionCountTeach: 'Q&A Statistics',
            //查询
            search: 'Search',
            //日期
            date: 'Date',
            //答疑数
            questionCount: 'Answered Questions',
            //共:
            totalCount: 'Total: {{count}}',
            //抱歉，查询日期内没有答疑信息
            searchQuestionNone: 'Sorry, no data.',
            //当前老师阅卷统计
            paperCountTeach: 'Paper Correction Statistics',
            //阅卷数
            overviewCount: 'Paper Correction Amount',
            //题量
            amounts: 'Question Amount',
            //份
            fen: ' ',
            //题
            ti: ' ',
            //抱歉，查询日期内没有阅卷信息
            searchOverviewNone: 'Sorry, no data.',
            //时间不能为空
            dateNoneError: 'Please enter the time.',

            ovewview: "sdfasdf",
            //开始阅卷(mark-exam)
            beginOverview: 'Correct Paper',
            //返回
            back: 'Back',
            //题目
            examination: 'Question',
            //作答人次
            answerPerson: 'Answered Person',
            //已阅人次
            hasReadPerson: 'Read Person',
            //待阅人次
            willReadPerson: 'Not Read Person',
            //阅卷
            overview: 'Read Paper',

            //我的阅卷(mark-index)
            myViewPaper: 'Papers',
            //考试名
            examName: 'Exam Name',
            //所属培训
            trainBelongs: 'Training',
            //所属项目
            projectBelongs: 'Project',
            //开始时间
            beginTime: 'Starting Time',
            //已阅(份)
            hasReadCount: 'Seen',
            //待阅(份)
            willReadCount: 'Waiting',
            //成绩详情
            scoreDetail: 'Score Details',
            //成绩
            result: 'Result',
            //考试说明
            examDescription: 'Instruction',
            //说明
            instruction: 'Instruction',
            //选择试卷
            paperSelect: 'Select Paper',
            //总评：
            _general: 'Overall: ',
            //不错
            pretty: 'Not Bad',

            //考试成绩详细说明(mark-offlinecorrect)
            examResultDescription: 'Result Instruction',
            //点评
            comment: 'Comment',
            //子科目
            subSubject: 'Sub-subject',
            //科目
            subject: 'Subject',
            //请选择成绩
            resultSelect: 'Select Result',
            //通过
            pass: 'Pass',
            //有条件通过
            conditionalPass: 'Conditional Pass',
            //不通过
            notPass: 'Fail',
            //保存并下一个
            saveAndNext: 'Save and Show Next',
            //保存
            save: 'Save',
            //考生答卷
            examineeAnswer: 'Answer Sheet',
            //下载
            download: 'Download',
            //总评
            general: 'Overall',
            //请输入总成绩
            inputTotalScore: 'Please enter the total score.',
            //分值保留一位小数，且不能超过10000
            decimalError: 'The score can keep one decimal, no more than 10000.',
            //姓名：
            name: 'Name: ',
            //帐号：
            account: 'Account: ',
            //选择单位
            unitSelect: 'Select Company',
            //是否批改：
            whetherCorrect: 'Correct or not: ',
            //全部
            all: 'All',
            //是
            yes: 'Yes',
            //否
            no: 'No',
            //是否合格：
            whetherQualified: 'Pass or not: ',
            //答卷导出
            paperOutput: 'Export Paper',
            //成绩导出
            resultOutput: 'Export Result',
            //下载成绩导入模版
            downloadAndInput: 'Download and Import Result',
            //成绩导入
            resultInput: 'Import Result',
            //位同学完成考试
            studentFinishExam: ' students have finished the exam.',
            //是否合格
            passOrNot: 'Pass or not',
            //操作
            operation: 'Operation',
            //查看
            view: 'Check',
            //暂无数据
            noDataNow: 'No data.',
            //修改成绩
            modifyResult: 'Modify Result',
            //批改
            correct: 'Correct',
            //文件：
            file: 'File: ',
            //开始导入
            beginInput: 'Start Importing',
            //导入说明：
            inputInstruction: 'Instruction: ',
            //1、仅支持10MB大小以下Excel格式文件。
            inputTip1: '1. Only Excel file, no bigger than 10MB.',
            //2、建议每次导入考试成绩数量不超过200条，否则将造成系统长时间无响应或<br/>导入失败！
            inputTip2: '2. Do not import more than 200 results each time.',
            //用户导入信息错误:
            userInputError: 'Importing Error: ',
            //姓名
            _name: 'Name',
            //帐号
            _account: 'Account',
            //用户导入
            userInput: 'Import User',
            //答卷导出
            resultOutput: 'Export Paper',
            //请选择要导入的excel
            selectInputExcel: 'Please select an Excel file to import.',
            //确认
            confirm: 'Confirm',
            //取消
            cancel: 'Cancel',
            //导入成功
            inputSuccess: 'Imported successfully.',
            //下载错误文档
            downloadError: 'Download Error',
            //有" + result + "位学员已有成绩，是否覆盖学员成绩？
            convertResultOrNot: '{{count}} students have got results. Do you want to overwrite?',

            //试卷详情(mark-offlineexaminfo)
            paperDetail: 'Paper Details',
            //考试信息
            examInfo: 'Exam Info',
            //考试子科目说明
            examSubjectInstruction: 'Subject Instruction',
            //及格线
            passLine: 'Pass Line',
            //资料下载
            dataDownload: 'Download Data',
            //干系人分析
            personAnalysis: 'Person Analysis',

            //开始批改(mark-question)
            beginCorrect: 'Start Correcting',
            //返回开始阅卷
            backToView: 'Return and Correct',
            //学员信息:
            studendInfo: 'Student Info: ',
            //当前分数:
            currentScore: 'Current Score: ',
            //学员答案:
            studentAnswer: 'Student Answer: ',
            //关闭
            close: 'Close',
            //参考答案:
            referenceAnswer: 'Reference Answer: ',
            //本题题目:
            thisTopic: 'Question: ',
            //本题得分:
            thisScore: 'Score: ',
            //分数不可改，判卷请谨慎
            correctTip: 'The score cannot be modified.',
            //拖动进度条来修改分数,也可以在文本框中直接输入分值
            modifyTip: 'Drag the bar to modify score. You can also enter the score in the box directly.',
            //显示学员信息
            showStudentInfo: 'Show Student Info',
            //显示参考答案
            showReferenceAnswer: 'Show Reference Answer',
            //显示题干
            showQuestion: 'Show Question Stem ',
            //提交>>
            submit: 'Submit>>',
            //结束
            finish: 'Finish',
            //本次阅卷完成了
            viewPerson: 'Correction finished.',
            //人
            person: 'students',
            //还有'+(model.userIds().length-1-model.num())+'人'
            personLess: 'Remaining: {{count}} students',
            //Score+' 分'
            scoreNum: '{{score}}',
            //(总分 @questionScore.Scores.Sum() 分)
            _totalScore: '(Total Score: {{totalScore}})',
            //请输入数值
            inputNumber: 'Please enter a number.',
            //已经是最后一个学生了，是否结束
            finishOrNot: 'This is the last student. Do you want to finish?',
            //试卷名称
            paperName: 'Paper Name',

            //项目切换(partial-hasenrolledtrain)
            projectSwitch: 'Switch Project',
            //培训切换
            trainSwitch: 'Switch Training',


            //我的答疑(partial-userinfo)
            myQuestion: 'Q&A',
            //我的阅卷
            myMarking: 'Papers',
            //我的作业
            myWork: 'Homework',

            //待回复(quiz-index)
            waitReply: 'To be Replied',
            //已回复
            replied: 'Replied',
            //状态：
            status: 'Status: ',
            _status: 'Status',
            //课程：
            _course: 'Course: ',
            //类型：
            type: 'Type: ',
            _type: 'Type',
            //常见
            common: 'Common',
            //私有
            private: 'Pivate',
            //条待回复
            replyCount: ' not answered',
            //课程-章节
            courseCharpter: 'Course - Chapter',
            //内容
            content: 'Content',
            //提问时间
            questionTime: 'Time',
            //回复
            reply: 'Reply',
            //删除
            remove: 'Delete',
            //还可以输入
            inputEnter: 'You still can enter ',
            //字
            word: ' characters.',
            //'来自:'+CatalogTitle
            from: 'From: {{name}}',
            //取消设置常见问题
            cancelCommonQuestion: 'Cancel Setting as FAQ',
            //设为常见问题
            setCommonQuestion: 'Set as FAQ',
            //确认删除答疑吗? (回复同时也会被删除)
            questionDelConfirm: 'Do you want to delete (Reply will also be deleted)?',
            //答疑回复
            questionReply: 'Question Reply',

            //作业名称：(userjob-index)
            workName: 'Homework: ',
            //是否评分：
            scoreOrNot: 'Score or not: ',
            //提交时间：
            submitDate: 'Submitting Time: ',
            //作业导出
            workOutput: 'Export Homework',
            //一共提交
            commitAll: 'Submitted ',
            //份作业
            workItem: ' homework in total.',
            //作业名称
            _workName: 'Homework',
            //提交时间
            _submitDate: 'Submitting Time',
            //未评分
            noScore: 'Not Scored',
            //分数
            _score: 'Score',
            //返回列表
            backList: 'Back',
            //请输入0-100间数字
            formatTip: 'Please enter number between 0 and 100.',
            //提交评分
            commitScore: 'Submit',
            //下一份
            nextItem: 'Next',
            //附件下载：
            attachLoad: 'Download Attachment: ',
            //成绩：
            _result: 'Result: ',
            //培训：
            train: 'Training: ',
            //清除
            clear: 'Clear',
            //请先选择要导出的作业。
            selectOutputWork: 'Please select the homework you want to export.',
            //您选择了" + countAll + "条记录，超过导出上限" + viewModel.model.checkLimit() + " ，如选择确定，将导出前" + viewModel.model.checkLimit() + "份文档。
            confirmTipWork: 'You have selected {{count}} records, which exceeds the limit of {{limit}}. If you continue, the first {{prevItem}} records will be exported.',
            //成绩采用百分制，请输入0-100的数字。
            scoreFormat: 'Please enter a number between 0 and 100.',
            //评分提交后，将不能再被修改，确认提交？
            submitConfirm: 'The score cannot be modified after submitted. Continue?',
            //导出中..
            outputing: 'Exporting..',
            //退出登录
            logout: 'Sign out',
            //评分
            score: 'score',
            //学员信息
            studentInfo: 'Student Info :'

        }
    },

    /*
     单位管理界面
     */
    unitManage: {
        frontPage: {
            //报名管理(home-index)
            rollManage: 'Register Management',
            //项目：
            proj: 'Project: ',
            _proj: 'Project',
            //分类：
            type: 'Category: ',
            //培训：
            train: 'Training: ',
            _train: 'Training',
            //学习状态：
            studyStatus: 'Study Status: ',
            //付款状态：
            payStatus: 'Payment Status: ',
            //学员：
            stuPerson: 'Student: ',
            //文件：
            file: 'File: ',
            //导入说明：
            inputDescrip: 'Instruction: ',
            //全部
            all: 'All',
            //已付款
            hasPay: 'Paid',
            //未付款
            unPay: 'Unpaid',
            //免费
            free: 'Free',
            //查询
            search: 'Search',
            //导出
            output: 'Export',
            //批量导入学员
            inputStuBatch: 'Batch Import Students',
            //学员
            _stuPerson: 'Student',
            //单位
            _unit: 'Company',
            //培训名称
            _trainName: 'Training Name',
            //付款状态
            _payStatus: 'Payment Status',
            //学习状态
            _studyStatus: 'Study Status',
            //加入时间
            _joinTime: 'Join Time',
            //操作
            _operation: 'Operation',
            //待审核
            pendingAudit: 'Unconfirmed',
            //审核拒绝
            rejectAudit: 'Rejected',
            //审核通过
            passAudit: 'Verified',
            //待选课
            waitElecCourse: 'Course Not Selected',
            //学习中
            studying: 'Studying',
            //正在加载中...
            onLoading: 'Loading...',
            //姓名或
            holderTxt: 'Name or {{name}}',
            //导入中，请稍候...
            onImporting: 'Importing...',
            //下载导入模板
            loadImportTpl: 'Download Import Template',
            //(说明：模板中红色部分为必填项)
            formTip: '(Note: The red part is required.)',
            //1、单次的导入学员数控制在500人内
            importTip1: '1. Do not import more than 500 students each time.',
            //2、当前导入只支持免费类，收费类的培训请联系平台客服人员
            importTip2: '2. Only the students of free trainings can be imported.',
            //用户导入信息错误
            importUserError: 'Importing info error.',
            //开始导入
            importBegin: 'Start Importing',
            //查看报名资料
            viewRollInfo: 'Check Sign-up Info',
            //用户导入
            userImport: 'Import Student',
            //无学员信息
            noStuInfo: 'No student info.',
            //请选择上传文件
            selectFile: 'Please select file to upload.',
            //导入成功
            importSuccess: 'Imported successfully.',
            //下载错误文档
            loadErrorTxt: 'Download Error',

            //证书查询(home-cart)
            cartQuery: 'Check Certificate',
            //证书：
            cart: 'Certificate: ',
            //证书状态：
            cartStatus: 'Certificate Status: ',
            //证书编号：
            cartCode: 'Certificate Number: ',
            //证书名称
            _cartName: 'Certificate Name',
            //证书状态
            _cartStatus: 'Certificate Status',
            //证书编号
            _cartCode: 'Certificate Number',
            //证书生成时间
            _cartGeneralDate: 'Certificate Generated Time',
            //已生成
            hasGeneral: 'Generated',
            //待生成
            waitGeneral: 'Waiting',
            //证书说明
            cartDescrip: 'Instruction',
            //获取证书地址失败
            getCartError: 'Failed to get certificate address.',


            //单位资料(home-info)
            unitInfo: 'Company Info',
            //基本信息
            baseInfo: 'Basic Info',
            //单位全称：
            unitFullName: 'Full Name: ',
            //单位简称：
            unitName: 'Abbreviation: ',
            //单位地址：
            unitAddress: 'Address: ',
            //联系人：
            contactPerson: 'Contact: ',
            //联系电话：
            contactTel: 'Phone Number: ',
            //联系邮箱：
            contactEmail: 'Email: ',
            //注册地：
            registerAddress: 'Registered Address: ',
            //组织机构代码：
            organizationCode: 'Organization Code: ',
            //所属分类：
            belongsType: 'Category: ',
            //保存修改
            update: 'Save',
            //其他信息
            otherInfo: 'Other Info',
            //备注：若需修改资料，请联系平台客服
            updateTip: 'Note: Please contact the customer service if you want to modify information.',
            //必选字段
            requiredField: 'Required Field',
            //请填写正确格式的电子邮件
            emailTip: 'Please enter the email.',
            //请填写正确格式的联系电话
            telTip: 'Please enter the phone number.',
            //请填写单位地址
            addressTip: 'Please enter the address.',
            //请填写联系人
            contactTip: 'Please enter the contact.',
            //请填写联系电话
            contactTelTip: 'Please enter the phone number.',
            //请填写联系邮箱
            contactEmailTip: 'Please enter the email.',
            //保存成功
            saveSuccess: 'Saved successfully.',

            //帐号信息(home-myinfo)
            accountInfo: 'Account Info',
            //姓名：
            name: 'Name: ',
            //身份证：
            idCart: 'ID Card: ',
            //电子邮箱：
            email: 'Email: ',
            //原密码：
            originalPassW: 'Original Password: ',
            //新密码：
            newPassW: 'New Password: ',
            //重复新密码：
            repeatPassW: 'Confirm Password: ',
            //原邮箱
            originalEmail: 'Original Email: ',
            //新邮箱：
            newEmail: 'New Email: ',
            //修改密码
            updatePassW: 'Modify Password',
            //确认修改
            confirmEdit: 'Confirm',
            //新密码和重复新密码不同
            passWTip: 'Two passwords did not match.',
            //修改电子邮箱
            emailEdit: 'Modify Email',
            //密码格式不正确
            passwordFormatError: 'The format of the password is wrong.',
            //请输入原密码
            inputOriginalPassword: 'Please enter the original password.',
            //请输入密码 区分大小写(不含特殊字符)
            passwordFormat: 'Please enter the password (case sensitive).',
            //{0}~{1}位字符组成
            passwordSizeFormat: 'The password must be {0} to {1} characters.',
            //新旧密码不能相同
            passwordRepeat: 'The new password cannot be the same as the old one.',
            //请再输一次密码
            passwordAgain: 'Please enter the password again.',
            //两次密码输入不一致
            passwordNoMap: 'Two passwords did not match.',
            //请输入新电子邮箱
            inputNewEmail: 'Please enter the new email.',
            //输入的电子邮箱格式有误
            emailFormatError: 'The format of the email is wrong.',
            //"原密码错误"
            originalPasswordError: 'The original password is wrong.',

            //合格查询(home-pass)
            qualifyQuery: 'Check Qualification',
            //合格状态：
            qualifyStatus: 'Qualification Status: ',
            //合格
            pass: 'Pass',
            //未合格
            unPass: 'Fail',
            //合格
            qualify: 'Qualified',
            //未合格
            unQualify: 'Not Qualified',
            //学时情况
            hoursSituation: 'Course periods Condition',
            //考试
            examination: 'Exam: ',
            //考试
            _examination: 'Exam',
            //培训情况
            trainSituation: 'Training Condition',
            //达成日期
            reachDate: 'Reaching Date',
            //已修/要求学时：
            requiredHours: 'Completed/Required Course Periods: ',
            //课程获得：
            fromCourse: 'From Course: ',
            //考试获得：
            fromExamination: 'From Exam: ',
            //合格数据更新成功
            dataUpdateSuccess: 'Updated data successfully.',
            //成绩查询(home-score)
            scoreQuery: 'Check Score',
            //考试状态：
            examStatus: 'Exam Status: ',
            //已考
            hasExam: 'Taken',
            //待考
            waitExam: 'Waiting',
            //考试次数
            examCount: 'Exam Times',
            //考试方式
            examWay: 'Exam Method',
            //成绩
            score: 'Score',
            //报名资料(home-traineeinfo)
            registerData: 'Sign-up Info',
            //姓名/帐号：
            accountOrName: 'Name/Accout: ',
            //必填项
            required: 'Required',
            //选填项
            optional: 'Optional',
            //的附加信息
            attachInfo: ' additional Info',
            //（支持上传文档、图片、压缩包格式的文件，文件大小不超过
            fileTip1: 'You can upload files, photos and package, not bigger than ',
            //，至多添加
            fileTip2: ', up to ',
            //个附件
            fileTip3: ' attachments.',
            //保存
            save: 'Save',
            //福建省
            fjProvince: 'Fujian',
            //请选择所在区域
            selectArea: 'Please select a region.',
            //更新成功
            updateSuccess: 'Updated successfully.',
            //注册单位(register-index)
            registerUnit: 'Register Company',
            //单位资料请仔细填写，提交后不允许修改。
            unitDateTip1: 'The company info cannot be modified after submitted.',
            //请正确填写注册地，此项内容
            unitDataTip2: 'Please enter the registered address.',
            //与证书编号有关
            unitDataTip3: 'It is related to the certificate number.',
            //请正确选择
            unitDataTip4: 'Please select.',
            //单位管理员
            unitSuper: 'Company Administrator',
            //提示：
            prompt: 'Prompt: ',
            //1、以下填写的身份证将作为单位管理员查看本单位学生报名学习情况的登录帐号，请正确填写。
            unitDataTip5: '1. The ID card info is for the company administrator to check the study condition of the student. Please enter the correct info.',
            //2、以下收集的信息只用于核对身份真实性，本站保护用户隐私。
            unitDataTip6: '2. The following info is for verifying the authenticity of identity. Your privacy will be strictly protected.',
            //身份证（正面）：
            idCartFront: 'ID Card (Front): ',
            //企业所在地信息
            unitAdInfo: 'Company Address',
            //验证码：
            verifyCode: 'Verification Code: ',
            _verifyCode: 'Verification Code',
            //看不清换一张
            changeCode: 'Refresh',
            //注册
            register: 'Register',
            //访问受限
            accessLimit: 'Access denied.',
            //抱歉！
            sorry: 'Sorry.',
            //您无权访问该页面...
            noRightAccess: 'You do not have the permission to access this page.',
            //联系客服：0591-63183000  QQ:1369080504
            customerService: 'Customer Service: 0591-63183000  QQ:1369080504',
            //返回
            back: 'Back',
            //（仅支持小于2M 的JPG、PNG图片文件）
            uploadFormat: '(JPG or PNG, no bigger than 2M)',
            //企业所在地：
            enterpAddress: 'Address: ',
            //企业注册地：
            enterpRegister: 'Registered Address: ',
            //忘记组织机构代码，
            forgetOrganizationCode: 'Forget organization code.',
            //点击查询
            clickQuery: 'Click to search.',
            //图片
            picture: 'Photo',
            //请选择小于2M的图片
            picUploadLimit: 'Please select photo (no bigger than 2M).',
            //请不要一直重复上传
            repeatUpload: 'Please do not upload repeatedly.',
            //身份证格式不正确
            idFormatError: 'The format of the ID card number is wrong.',
            //联系电话格式有误，请重新输入
            contactPhoneError: 'The format of the phone number is wrong.',
            //请输入单位全称
            putUnitFullName: 'Please enter the full name of the company.',
            //此单位全称已被注册，请更换
            fullNameRepeat: 'The full name has been registered. Please change one.',
            //请输入单位简称
            putUnitName: 'Please enter the abbreviation of the company.',
            //此单位简称已被注册，请更换
            nameRepeat: 'This abbreviation has been registered. Please change one.',
            //请输入单位地址
            putUnitAd: 'Please enter the company address.',
            //请输入联系人
            putContact: 'Please enter the contact.',
            //请输入联系电话
            putContactPhone: 'Please enter the phone number.',
            //请选择企业所在地
            selectUnitAd: 'Please enter the address.',
            //请输入姓名
            putName: 'Please enter the name.',
            //请上传身份证正面照
            idCartFrontPic: 'Please upload the front of the ID card.',
            //请输入验证码
            putVerifyCode: 'Please enter the verification code.',
            //验证码错误
            verifyCodeError: 'Verification code error.',
            //请输入身份证号码
            putIdCart: 'Please enter the ID card number.',
            //该身份证号未注册，请先
            idCartNoRegister: 'This ID card number has not been registered.',
            //请您填写组织结构代码
            putOrganizationCode: 'Please enter the organization code.',
            //该组织结构代码已存在
            organizationCodeRepeat: 'This organization code already exists.',
            //创建成功
            createSuccess: 'Created successfully.',
            //输入查找关键字(shared)
            keywordSearch: 'Please enter a key word.',
            //抱歉，没有找到关键字为“
            sorryNoFind: 'Sorry, no “',
            //建议更换关键字进行搜索。
            changeKeyword: 'Please change a key word.',
            //单位切换
            switchUnit: 'Switch Company',
            //的单位
            unitKey: '” related company was found.'

        }
    },
    /*
     用户设置
     */
    userSetting: {
        frontPage: {
            //基本信息(user-setting-personalinfo)
            baseInfo: 'Basic Info',
            //注册信息
            registerInfo: 'Registration Info',
            //姓名：
            name: 'Name: ',
            //个人资料
            personalInfo: 'Personal Info',
            //必填项
            required: 'Required',
            //选填项
            optional: 'Optional',
            //保存
            save: 'Save',
            //头像设置(user-setting-personalinfo)
            avatarSetting: 'Avatar Setting',
            //设置头像
            settingAvatar: 'Set Avatar',
            //修改密码(user-setting-password)
            updatePassword: 'Modify Password',
            //当前密码：
            currentPassword: 'Current Password: ',
            //新密码：
            newPassword: 'New Password: ',
            //确认新密码：
            confirmNewPassword: 'Confirm Password: ',
            //您使用的是@(ViewBag.AucAccountTpyeName)登录本平台，无法在此修改密码，请前往原平台修改密码。
            updateLimitTip: 'You have logged into this platform via {{way}} and cannot modify password here. Please log into the original platform to modify password.',
            //前往用户中心
            goUserCenter: 'Go to User Center',
            //修改密码成功
            updatePasswordSuccess: 'Modified password successfully.',
            //请前往用户中心完善安全信息后再修改密码。
            improveInfo: 'Please go to the User Center to complete your security info before modifying password.',
            //请输入6~12个字符密码 (区分大小写)
            passwordFormat: 'Please enter 6 - 12 characters (case sensitive).',
            //"密码长度不正确，请输入6~12个字符，区分大小写"
            passwordSizeError: '"Please enter 6 - 12 characters (case sensitive)."',
            //帐号设置(user-shared-elearninguserlayout)
            accountSetting: 'Account Settings'
        }
    },

    /*
     我的考试
     */
    myExam: {
        frontPage: {
            //我的考试
            myExam: 'My Exams',
            //暂无考试安排，请等待通知。
            noExamTip: 'No exam.',
            //正在加载中，请稍候...
            onLoading: 'Loading...',
            //[必修课]
            requiredCourse: '[Required Course]',
            //[选修课]
            optionalCourse: '[Optional Course]',
            //学时
            studyHour: 'periods',
            //开考条件
            examCondition: 'Exam Requirements',
            //全部选修课
            allOptionalCourse: 'All Optional Courses',
            //本考试无学时要求
            noExamHourLimit: 'This exam does not require course periods.',
            //要求学时不足
            lessHour: 'Lack of periods',
            //此考试在线下进行
            examOffLine: 'This exam should be taken offline.',
            //最好成绩：
            bestResult: 'Best Score: ',
            //合格线：
            passLine: 'Passing Line: ',
            //很遗憾，考试已结束
            soPity: 'The exam has ended.',
            //查看成绩
            viewResult: 'Check Result',
            //考试说明
            examInfomation: 'Instruction',
            //考试时间未到
            timeFull: 'The exam has not started.',
            //共有
            all: 'Total: ',
            //次考试机会
            changeOfExam: ' chances',
            //考试中
            onExaming: 'In process',
            //开始考试
            beginExam: 'Start',
            //主观题等待批改
            subjectCorrect: 'Subjective questions are waiting to be corrected. ',
            //您还有
            changeRemain: 'You still have ',
            //上次成绩：
            resultOfPrev: 'Last Score: ',
            //分(主观题等待批改)
            subjectScore: ' (Subjective questions to be corrected)',
            //未通过
            noPass: 'Fail',
            //查卷时间：不允许查卷
            limitView: 'Review Time: Not allowed',
            //查看作答情况
            viewAnswerResult: 'Check Answers',
            //已通过
            pass: 'Pass',
            //查卷时间：
            viewTime: 'Review Time: {{time}}',
            //您共有
            allChange: 'You have ',
            //(未含主观题成绩)
            unContainerSubject: '(Subjective questions not included)',
            //已上传答卷，考试结束前可以修改
            submitPaper: 'Paper has been uploaded. You can modify before the exam ends.',
            //考试进行中，请注意时间安排
            noticeExamTime: 'The exam is in process. Please pay attention to the time remaining.',
            //等待批改
            waitCorrect: 'To be corrected',
            //进入考试
            enterExam: 'Enter',
            //要求
            demand: 'Requirement',
            //已学
            alreadyStudy: 'Studied',
            //分
            fen: 'score',
            //即时查卷
            instantView: 'Review Time: Instant',
            //考试机会用完后查看
            numView: 'Review Time：After having no more chance'
        }
    },

    /*
     上传组件
     */
    uploadWidget: {
        frontPage: {
            //文件大小超过2MB，请重新选择
            fileSizeLimit: 'The file size cannot be bigger than 2MB. Please select again.',
            //图片格式不正确，请重新选择
            picFormatLimit: 'The format of the photo is wrong. Please select again.',
            //保存成功
            saveSuccess: 'Saved successfully.',
            //请选择上传图片
            selectPic: 'Please select photo',
            //文件为空，无法上传
            fileNoSize: 'Failed to upload. The file is empty.',
            //您所选择的文件的格式不符合要求,请重新选择！
            fileNoMatch: 'The format of the file is wrong. Please select again.',
            //上传出错
            uploadError: 'Upload error.',
            //返回状态为
            backStatus: 'Return status: '
        }
    },

    /*
     udialog弹框组件
     */
    dialogWidget: {
        frontPage: {
            //关闭
            close: 'Close',
            //系统提示
            systemTip: 'Prompt',
            //确认
            confirm: 'Confirm'
        }
    },

    /*
     datepicker组件
     */
    datepickerWidget: {
        frontPage: {
            closeText: 'Close',
            prevText: '&#x3C;Last Month',
            nextText: 'Next Month&#x3E;',
            currentText: 'Today',
            monthNames: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'Mar.', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
            monthNamesShort: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'Mar.', 'Jun.', 'Jul.', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
            dayNames: ['Sun.', 'Mon.', 'Tues.', 'Wed.', 'Thur.', 'Fri.', 'Sat.'],
            dayNamesShort: ['Sun.', 'Mon.', 'Tues.', 'Wed.', 'Thur.', 'Fri.', 'Sat.'],
            dayNamesMin: ['Sun.', 'Mon.', 'Tues.', 'Wed.', 'Thur.', 'Fri.', 'Sat.'],
            weekHeader: ' ',
            dateFormat: 'yy-mm-dd',
            yearSuffix: 'Year'

        }
    },
    mobileDownload: {
        frontPage: {
            //移动端下载
            mobileDownload: 'Download App',
            //帐号设置
            setAccount: 'Account Settings',
            //去学习
            goStudy: 'Start',
            //我的培训
            myTrain: 'Trainings',
            //报名培训
            registeredTrain: 'Sign Up',
            //查看所有消息
            viewAllMessage: 'Check All Messages',
            //最新消息
            newMessage: 'Latest Messages',
            //没有消息
            noMessage: 'No message.',
            //Android下载
            androidDownload: 'Android',
            //Android即将推出
            androidWillGo: 'The Android version is coming soon.',
            //已有帐号
            hasAccount: 'Have account?',
            //登录
            login: 'Sign in',
            //退出登录
            logout: 'Sign out',
            //aPad即将推出
            aPadWillGo: 'aPad',
            //aPad下载
            aPadDownload: 'aPad',
            //iPhone下载
            iPhoneDownload: 'iPhone',
            //iPhone即将推出
            iPhoneWillGo: 'iPhone',
            //iPad下载
            iPadDownload: 'iPad',
            //iPad即将推出
            iPadWillGo: 'iPad',
            //手机扫描快速下载
            phoneScanDownload: 'Scan to Download',
            //课程下载，离线观看
            courseDownload: 'Download Courses',
            //将课程资源下载到本地，无网络时也能看，节省流量又方便
            courseDownloadText: 'You can download the courses to watch anytime, anywhere.',
            //提问题、记笔记
            askAndNotes: 'Questions & Notes',
            //学习中有问题随时提，有笔记随时记， 提高学习效率
            askAndNotesText: 'Ask questions and make notes while studying to improve study efficiency.',
            //轻松同步
            easyAsync: 'Easy Sync',
            //学习记录云同步，不同设备间学习数据共享
            easyAsyncText: 'Synchronize study records to share study data among different devices.',
            //下载
            download: 'Download-{{projectTitle}}'
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
            staticText1: 'This course ends.',
            //您已完成本课程的
            staticText2: 'You have completed ',
            //章节列表-章节学习
            staticText3: 'Chapter List - Chapter Study',
            //确认删除该笔记吗(本操作不可恢复)?
            staticText4: 'Delete this note (irreversible)?',
            //"太棒了，您已学完全部内容！"
            staticText5: "Well done! You have completed all contents!"
        }
    },
    testAdd: {
        frontPage: {
            //网龙网络公司
            nd: 'NetDragon Websoft Inc.',
            //为您推送最前沿、最有料的学习资讯
            htmlText1: 'Bring you the newest and most<br/>valuable learning information.',
            htmlText2: ' All Rights Reserved',
            //公开课列表
            openCoursesList: 'Course list'
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
            warning: "Enrollment Attention",
            //暂无介绍
            noIntroduce: "No related data.",
            //培训简介：
            introduce: "Introduction",
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
            board: 'Ranking'
        }
    },
    /**
     *学习主页
     */
    studyLearning: {
        frontPage: {
            hourPercent: 'learned：{{userHour}}/{{totalHour}} periods',
            courseHours: ' courses',
            studyHour: '  periods',
            examCount: ' exams',
            finishTime: 'End time:',
            train: 'Training',
            job: 'Career',
            singleCourse: 'Open Courses',
            studying: 'Studying',
            waitAudit: 'Unconfirmed',
            waitPay: 'Unpaid',
            hasFinished: 'Finished',
            reAudit: 're-Verified',
            hasPass: 'Passed',
            finished: 'Ended',
            noPass: 'Unpass',
            goPay: 'Go Pay',
            reEnroll: 're-enroll',
            cancelEnroll: 'Cancel Enroll',
            nodata: 'No related courses.',
            nodataFinish: 'No finished courses,click to learning!',
            goLearning: 'Go Learning.',
            studyNewCourse: 'Go Learning New Courses',
            loadMore: 'Click to load more...',
            noMoreData: 'No More Data',
            cancelConfirm: 'Are you sure you want to quit the course?',
            //侧边栏
            day: ' day',
            minute: ' mins',
            totalDay: 'Total',
            totalHours: 'Duration',
            myStudy: 'Study Center',
            myExam: 'My Exams',
            myNote: 'My Notes',
            myQuestion: 'My Q&A',
            myArt: 'My Certifications',
            myRank: 'Ranking List'
        }
    },
    //搜索结果
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
//搜索结果
//请输入关键词
//全部
//职位规划
//培训认证
//公开课
//更多职位规划
//更多培训认证
//更多公开课
//搜索
//门课程
//学时
//个考试
//暂无“{{filter}}”相关内
    /**我的排行榜
     **/
    myRankingList: {
        frontPage: {
            //我的排行（页面title）
            pageTitle: 'Ranking List',
            //学霸排行榜
            learderboard: 'Learderboard',
            //7天排行
            '7ds': '7 Days',
            //月
            '30ds': 'Month',
            //总
            all: 'Overall',
            //根据学员的学习时长统计排序，同一课程重复学习的时长不计入
            tips1: 'Ranking statistics is based on learning minutes. The repetition is not included.',
            //排名
            rankingList: 'Ranking',
            //用户
            learner: 'Learner',
            //学习时长
            totalMins: 'Minutes',
            //我的{{rankType}}排名6位 ， 学习时长210分钟 ， 超过90%的同学
            tips2: 'My position in the {{rankType}} Ranking List is No. <i class="blue">{{place}}</i>, totally <i class="blue">{{mins}}</i> mins and exceed <i class="blue">{{percent}}</i> learners.',
            //{{mins}}分钟
            mins: '{{mins}} mins',
            //点击加载更多排名...
            loadMore: 'click to load more ranking list...',
            //加载中
            loading: 'loading',
            //排行榜将于每天4：00更新前一天的学习数据
            updateData: 'Ranking List updates at 04:00am everyday.',
            //已加载全部
            loadAll: 'No more.',
            //暂无数据
            noData: 'No data.',
            //数据加载中
            dataLoading: 'Data loading...'
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
            //下载
            download: 'Download',
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
//            'delete': 'Delete',
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
            resourceDW: 'Download'
        }
    }
};
