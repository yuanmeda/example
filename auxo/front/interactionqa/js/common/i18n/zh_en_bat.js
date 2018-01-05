var i18n = {
    common: {
        // 各种JS插件的语言设置
        addins: {
            star: {
                low: '差_en',
                normal: '一般_en',
                better: '较好_en',
                good: '很好_en',
                perfect: '非常好_en',
                noSpecialElement: '请指定目标元素_en'
            },
            pagination: {
                first: '首页_en',
                last: '尾页_en',
                prev: '上一页_en',
                next: '下一页_en',
                jumpTo: '到_en',
                page: '页_en',
                jump: '跳转_en',
                overview: '当前第 {{currentPage}} 页/共 {{totalPage}} 页，共有 {{totalCount}} 条记录_en'
            },
            jquery: {
                ajaxError: {
                    close: '关闭_en',
                    title: '系统提示_en',
                    originalErrorMessageTitle: '向服务器执行{{httpmethod}}请求时出错{{errorMessage}}_en',
                    stackTrace: '错误堆栈：_en',
                    errorType: '错误类型：_en',
                    errorMessage: '错误信息：_en',
                    errorTitle: '出错了，请将以下错误反馈给客服_en'
                }
            },
            paper: {
                header: {
                    //剩余用时
                    remainTime: '剩余用时_en',
                    //保存答案
                    saveAnswer: '保存答案_en',
                    //保存
                    save: '保存_en'
                },
                parts: {
                    //点击可切换
                    clickSwitch: '点击可切换_en'
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
                back: '返回_en',
                //题
                ti: '题_en',
                //总分
                totalScore: '总分_en',
                //及格
                pass: '及格_en',
                //分钟
                minute: '分钟_en',
                //小时
                hour: '小时_en',
                //分
                minute_: '分_en',
                //秒
                second:'秒_en',
                //距离考试结束：
                remainTime: '距离考试结束：_en',
                //注意:
                notice: '注意:_en',
                //1、开始考试后不可暂停，时间到后自动交卷，请注意时间安排。
                rollRule1: '1、开始考试后不可暂停，时间到后自动交卷，请注意时间安排。_en',
                //2、答题结束，点击“交卷”完成当前考试。
                rollRule2: '2、答题结束，点击“交卷”完成当前考试。_en',
                //考试已结束
                examTimeOvered: '考试已结束_en',
                //距离开考还有：
                timeFromExam: '距离开考还有：_en',
                //考试已开始：
                examBeginedTime: '考试已开始：_en',
                //距离考试结束还有：
                examRemainTime: '距离考试结束还有：_en',
                //本次考试时间已到, 不能继续答题
                timeOverTip: '本次考试时间已到, 不能继续答题_en',
                //交卷
                handPaper: '交卷_en'
            },
            loading: {
                //正在加载...
                loading: '正在加载..._en'
            },
            navigatorstat: {
                //本次成绩
                examResult: '本次成绩_en',
                //正确率
                correctRate: '正确率_en',
                //答对
                correct: '答对_en',
                //题
                ti: '题_en',
                //答错
                error: '答错_en',
                //未做
                noDo: '未做_en'
            },
            explain:{
                //考试说明
                examDescription: '考试说明_en'
            },
            questionOption: {
                //此选项为参考答案
                referenceAnswer: '此选项为参考答案_en',
            },
            subjective: {
                //我会做
                willDo: '我会做_en',
                //我不会做
                willNotDo: '我不会做_en'
            },
            judge: {
                //对
                right: '对_en',
                //错
                error: '错_en'
            },
            question: {
                //暂不确定
                unCertain: '暂不确定_en',
                //填空题
                blankFill: '填空题_en',
                //主观题
                subjectiveQuestion: '主观题_en',
                //正确答案
                correctAnswer: '正确答案_en',
                //您答对了
                answerRight: '您答对了_en',
                //主观题用户答案
                subjectiveAnswer: '主观题用户答案_en',
                //题目详解
                subjectDetail: '题目详解_en',
                //套题详解
                setDetail: '套题详解_en',
                //您错答为[" + t + "]
                answerError: '您错答为[{{t}}]_en',
                //您未作答
                hasNoAnswer: '您未作答_en',
                //<暂无>
                noNow: '<暂无>_en',
                //不计分
                noScore: ' 不计分_en',
                //分
                score:'分_en'
            },
            navigator: {
                //1
                one: '一_en',
                //2
                two: '二_en',
                //3
                three: '三_en',
                //4
                four: '四_en',
                //5
                five: '五_en',
                //6
                six: '六_en',
                //7
                seven: '七_en',
                //8
                eight: '八_en',
                //9
                nine: '九_en',
                //10
                ten: '十_en',
                //百
                hundred: '百_en',
                //千
                thousand: '千_en',
                //万
                surname: '万_en',
                //十万
                tenSurname: '十万_en',
                //百万
                hundredSurname: '百万_en',
                //千万
                thousandSurname: '千万_en',
                //亿
                billion: '亿_en',
                //只能处理到亿
                onlyBillion: '只能处理到亿_en'
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
                noNeedSave: '无需保存_en',
                //保存成功
                saveSuccess: '保存成功_en',
                //保存失败
                saveError: '保存失败_en'
            },
            store: {

            },
            answer: {
                //请实现_onSubmit方法！
                achieveSubmit: '请实现_onSubmit方法！_en',
                //请实现_fullscreen方法！
                achieveFullscreen: '请实现_fullscreen方法！_en',
                //请实现_restart方法！
                achieveRestart: '请实现_restart方法！_en',
                //请实现_finish方法！
                achieveFinish: '请实现_finish方法！_en'
            },
            examAnswer: {
                //试卷说明
                examDescription: '试卷说明_en',
                //error In '_nosure_en',可能是data.viewModel.question.Id() 不存在
                idError: 'error In "_nosure",可能是data.viewModel.question.Id() 不存在_en',
                //已完成全部题目，确定交卷吗？
                submitPaper: '已完成全部题目，确定交卷吗？_en',
                //交卷
                submit: '交卷_en',
                //继续答题
                continueAnswer: '继续答题_en',
                //本次考试时间已到, 不能继续答题
                timeOvered: '本次考试时间已到, 不能继续答题_en',
                //已完成 " + e + " 题，还有 " + (t - e) + " 题未做，确定交卷吗？
                paperTip: '已完成 {{yes}} 题，还有 {{no}} 题未做，确定交卷吗？_en'

            }
        },
        //前台页面
        frontPage: {
            numOfPeople: '人_en',
            studyEvaluate: '学员评价_en',
            loadMore: '加载更多..._en',
            noEvaluate: '暂无评价_en',
            evaluate: '评价_en',
            evaluateTip: '在这里输入您的评价或问题_en',
            myEvaluate: '我的评价_en',
            newEvaluate: '发表评价_en',


            ucLabel1: "文件名称_en",
            ucLabel2: "上传进度_en",
            ucLabel3: "文件大小_en",
            ucLabel4: "删除_en",

            // 培训状态
            enrollStatus: {
                finished: "已结束_en",
                notStarted: "未开始_en",
                unConfirm: "待审核_en",
                refused: "已拒绝_en",
                goPay: "去付款_en",
                pass: "已通过_en",
                use: "去学习_en",
                choiceCourse: "去选课_en",
                undefined: "未定义的状态_en"
            },

            //登录/注册
            logInSinUp:'登录/注册_en',
            //用户名称
            username:'用户名称_en',
            //移动端
            mobilTerminal:'移动端_en',
             //下载移动端
            downmobilTerminal: '下载移动端_en',
            //退出
            logOut:'退出_en',
            //免费
            free:'免费_en',
            //首页
            homePage: '首页_en',
            //公开课
            openClass: '公开课_en',
            //培训认证
            trainSign: '培训认证_en',
            //职位
            jobPlan: '职业规划_en',
            //职位规则
            jobPlanEx:'职业规划_en',
            //登录
            loginIn: '登录_en',
            //我的学习
            myStudy: '我的学习_en',
            //我的考试
            myExam: '我的考试_en',
            //注销
            loginOut: '注销_en',
            //页脚
            footerPage: '福建华渔未来教育科技有限公司_en',
            //标注
            tagFlag: '技术支持_en',
            /*
             title相关
             */
            //培训介绍
            trainInfo: '培训介绍_en',
            //课程列表
            courseList: '课程列表_en',
            //职位介绍
            jobInfo: '职位介绍_en',
            //学习中心
            studyCenter: '学习中心_en',
            // - 登录
            projectLoginIn: '{{projectTitle}} - 登录_en',

            /*
             标签相关
             */
            //对
            right: '对_en',
            //错
            error: '错_en',
            //是
            yes: '是_en',
            //否
            no: '否_en',
            //返回
            back: '返回_en',
            //推荐
            recommond: '推荐_en',
            //收起
            collapse: '收起_en',
            //更多
            more: '更多_en',
            //课程
            course: '课程_en',
            //培训
            //最新
            newest:'最新 _en',
            //热门
            hot: '热门_en',
            //考试
            exam: '考试_en',
            //必修课
            requireCourse: '必修课_en',
            //选修课
            selectiveCourse: '选修课_en',
            //资源
            resourceLabel: '资源_en',
            //通过方式
            passLabel: '通过方式_en',
            /*
             按钮相关
             */
            //报名
            registration: '报名_en',
            //马上报名
            registrationOnce:'马上报名_en',
            //线下报名
            offLineBtn: '线下报名_en',
            //已结束
            finished: '已结束_en',
            //未开考
            noOpen: '未开考_en',
            //已过期
            expired: '已过期_en',
            //学时不足
            hourLess: '学时不足_en',
            //进入考试
            enterExam: '进入考试_en',
            //阅卷
            paperMark: '阅卷_en',
            //补考
            examAgain: '补考_en',
            //重新考试
            reExam:'重新考试_en',
            //修改信息
            modifyInfo: '修改信息_en',
            //开始学习
            beginStudy: '开始学习_en',
            //继续学习
            continueStudy: '继续学习_en',
            //取消
            cancel: '取 消_en',
            //确定
            confirm: '确 定_en',
            //浏览
            browse: '浏览_en',
            //提交
            submit: '提交_en',
            //删除
            delete: '删除_en',
            //确认付款
            confirmPay: '确认付款_en',
            /*
             提示相关
             */
            //报名信息有误
            rollError: '报名信息有误_en',
            //汇款信息有误
            payError: '汇款信息有误_en',
            //缴费信息有误
            payToError: '缴费信息有误_en',
            //暂无课程
            hasNoCourse: '暂无课程_en',
            //线下报名提示
            offLineTip: '线下报名具体事宜请联系平台客服或管理员_en',
            //统计失败
            calError: '统计失败，请稍等片刻后刷新页面_en',
            //验证码错误验证
            validateError: '验证码错误_en',
            //报名提示
            rollTip: '请先报名后进行学习！_en',
            //输入框提示
            inputTip: '请输入关键字..._en',
            //请输入备注信息
            markInfo: '请输入备注信息_en',
            //付款成功
            paySuccess: '付款成功_en',

            /*
             课程相关
             */
            //列表选项
            listItem: '共{{CourseNum}}门课程/{{ExamNum}}个考试/{{MinHours}}学时_en',
            //学习人数
            studyCount: '{{StudyNum}}人学习_en',
            //学时
            MinHours: '{{MinHours}}学时_en',
            //最新
            top: '最新_en',
            //通过方式
            passWay: '修满{{MinHours}}学时_en',
            //资源信息
            resourse: '视频{{VideoNum}}个/文档{{DocumentNum}}个/练习{{ExerciseNum}}个_en',

            /*
             课程考试相关
             */
            //课程标签
            courseLabel: '课         程：_en',
            //时间起始
            timeBegin: '考试时间：{{BeginTime}}_en',
            //时间结束
            timeEnd: ' 至 {{EndTime}}_en',
            //开考条件1
            testCondition1: '开考条件：不限_en',
            //开考条件2
            testCondition2: '开考条件：学满{{RequireTotal}}学时_en',
            //考试时长
            examTime: '考试时长：{{LimitSeconds}}',
            //及格线
            passLine: ' 及 格 线：{{PassScroe}}分_en',
            //最佳成绩1
            bestResult1: '最佳成绩：未参加考试_en',
            //最佳成绩2
            bestResult2: '最佳成绩：改卷中_en',
            //最佳成绩3
            bestResult3: '最佳成绩：{{Score}}分_en',

            /*
             常见短词
             */
            //至
            to: '至_en',
            //学时
            studyHour: '学时_en',
            //课程大纲
            courseOutline: '课程大纲_en',
            //必填项
            required: '必填项_en',
            //选填项
            optional: '选填项_en',
            //手机号码
            telNumber: '手机号码_en',
            //注意事项
            notice: '注意事项_en',
            //视频
            video: '视频_en',
            //文档
            text: '文档_en',
            //练习
            practice: '练习_en',
            //免费

            /*
             上传控件
             */
            //提示1
            ucTip1: '上传底单扫描图片_en',
            //提示2
            ucTip2: '(支持jpg/png/bmp 图片格式，图片大小不超过4MB，最多上传10张图片)_en',
            //文本1
            uclabel1: '文件名称_en',
            //文本2
            ucLabel2: '上传进度_en',
            //文本3
            ucLabel3: '文件大小_en',
            //文本4
            ucLabel4: '删除_en',
            //文本5
            ucLabel5: '添加附件_en',

            //上传文件超过最大限制
            numberOverLimit: '上传文件超过最大限制_en',
            //上传的文件大小超过限制
            sizeOverLimit: '上传的文件大小超过限制_en',
            //所选择的文件大小不能为0
            noFileSize: '所选择的文件大小不能为0_en',
            //所选择文件扩展名与允许不符
            noMapFileExtension: '所选择文件扩展名与允许不符_en',
            //队列错误
            fileQueueError: '队列错误_en',
            //请上传附件。
            uploadFile: '请上传附件。_en',
            //请等待上传完成后再提交。
            waitUploadComplete: '请等待上传完成后再提交。_en',
            //文件上传异常，请稍后再试。
            fileUploadError: '文件上传异常，请稍后再试。_en',

            /*
             支付选择
             */
            //提示1
            payTip1: '即时到账，支持绝大数银行卡借记卡及部分银行信用卡_en',
            //提示2
            payTip2: '快钱支付客服服务热线（9:00-18:00）：400-611-0013_en',
            //提示3
            payTip4: '支付宝客服服务热线：95188_en',
            //提示5
            payTip5: '方式一：在线支付_en',
            //提示6
            payTip6: '方式二：线下支付_en',
            //提示7
            payTip7: '说明：线下汇款需要提供对应的缴费凭证，请保留缴费凭证，点击“确认付款”在下个页面上传缴费缴费凭证_en',
            //提示8
            payTip8: '快钱支付_en',
            //提示9
            payTip9: '支付宝支付_en',
            //文本1
            payLabel1: '确认支付信息_en',
            //文本2
            payLabel2: '选择支付方式_en',
            //文本3
            payLabel3: '使用优惠券_en',
            //文本4
            payLabel4: '直接输入您的优惠券序号_en',
            //文本5
            payLabel5: '使用_en',
            //输入文本1
            inputLabel1: '优惠券序号：_en',
            //输入文本2
            inputLabel2: '培训价格：_en',
            //输入文本3
            inputLabel3: '优惠：_en',
            //输入文本4
            inputLabel4: '应付金额：_en',

            /*
             表单验证
             */
            //请选择所在地
            chooseLocation: '请选择所在地_en',
            //手机号码格式有误，请重新输入
            phoneError: '手机号码格式有误，请重新输入_en',
            //时间格式有误，请重新输入
            dateFormatError: '时间格式有误，请重新输入_en',
            //QQ号码格式有误，请重新输入
            qqNumberError: 'QQ号码格式有误，请重新输入_en',
            //请输入数字，最多小数位为{0}
            onlyNumber: '请输入数字，最多小数位为{0}_en',
            //请输入中文字符
            onlyChinese: '请输入中文字符_en',
            //请输入英文字符
            onlyEnglish: '请输入英文字符_en',
            //格式错误
            formatError: '格式错误_en',
            //固定电话格式有误，格式:区号+电话，请重新输入
            fixedPhoneError: '固定电话格式有误，格式:区号+电话，请重新输入_en',
            //邮编格式不正确，请重新输入
            emailError: '邮编格式不正确，请重新输入_en',
            //不可输入纯数字，请重新输入
            unpermitPureNumber: '不可输入纯数字，请重新输入_en',
            //请输入4位验证码，数字或英文字母组成
            validateFormatError: '请输入4位验证码，数字或英文字母组成_en',
            //验证码错误
            validateCodeError: '验证码错误_en',

            /*
             时间插件
             */

            //当前日期
            pickerCurrentDate: '当前日期_en',
            //选择
            pickerSelect: '选择_en',
            //分
            pickerMinute: '分钟_en',
            //小时
            pickerHour: '小时_en',
            //秒
            pickerSecond: '秒_en',
            //时
            pickerHour_: '时_en',
            //年月日格式
            pickerDateFormat: 'yy-mm-dd',
            //时分秒格式
            pickerTimeFormat:'HH:mm:ss'
        },
        //后台系统
        systemManage: {

        }
    },
    /*
    我的答疑页面
     */
    myQAs:{
        frontPage:{
            //我的答疑
            pageTitle1:'我的答疑_en',
            //答疑详细页面
            pageTitle2:'答疑详细页面_en',
            //答疑类型
            qaTypes:'答疑类型：_en',
            //全部问题
            allQuestion:'全部问题_en',
            //我的问题
            myQuestions:'我的问题_en',
            //我的回答
            myAnswers:'我的回答_en',
            //常见问题
            commonQuestions:'常见问题_en',
            //最新问题
            latestQuestion:'最新问题_en',
            //最多回答
            withMostAnswers:'最多回答_en',
            //全部课程
            allCourses:'全部课程_en',
            //问题排序
            sortQuestions:'问题排序：_en',
            //培训课程
            trainCourses:'培训课程：_en',
            //搜索关键字
            htmlText1:'搜索关键字“_en',
            //，共找到
            htmlText2:'”，共找到_en',
            //条结果
            htmlText3:'条结果。_en',
            //赶快和大家分享你的知识经验吧~
            htmlText4:'赶快和大家分享你的知识经验吧~_en',
            //在课程学习时遇到任何问题，都可以随时提问哦~
            htmlText5:'在课程学习时遇到任何问题，都可以随时提问哦~_en',
            //正在加载中，请稍候...
            htmlText6:'正在加载中，请稍候..._en',
            //抱歉，没有“
            htmlText7:'抱歉，没有“_en',
            //的相关答疑
            htmlText8:'”的相关答疑_en',
            //建议您：
            htmlText9:'建议您：_en',
            //1.更改关键字再搜索
            htmlText10:'1.更改关键字再搜索_en',
            //2.更改筛选条件
            htmlText11:'2.更改筛选条件_en',
            //查看
            check:'查看_en',
            //删除
            delete:'删除_en',
            //取消
            cancel:'取消_en',
            //确认
            confirm:'确认_en',
            //该问题有
            htmlText12:'该问题有_en',
            //个回答：
            htmlText13:'个回答：_en',
            //修改
            change:'修改_en',
            //[老师]
            teacher:'[老师]_en',
            //[我]
            me:'[我]_en',
            //我来回答
            htmlText14:'我来回答_en',
            /*
            js文件部分
             */
            //问题内容不能为空
            staticText1:'问题内容不能为空_en',
            //问题内容不能超过100个字
            staticText2:'问题内容不能超过100个字_en',
            //确认删除该回答吗(本操作不可恢复)?
            staticText3:'确认删除该回答吗(本操作不可恢复)?_en',
            //回复内容不能为空
            staticText4:'回复内容不能为空_en'

        }
    },

    /*
    我的笔记页面
     */
    myNote:{
        frontPage:{
            //我的笔记
            pageTitle:'我的笔记_en',
            //章节排序
            sortChapters:'章节排序_en',
            //点击后按章节升序排序
            htmlText1:'点击后按章节升序排序_en',
            //点击后按章节降序排序
            htmlText5:'点击后按章节降序排序_en',
            //时间排序
            sortByDate:'时间排序_en',
            //点击后按时间升序排序
            htmlText2:'点击后按时间升序排序_en',
            //点击后按时间降序排序
            htmlText6:'点击后按时间降序排序_en',
            //可以在课程学习时多记笔记，提高学习效果~
            htmlText3:'可以在课程学习时多记笔记，提高学习效果~_en',
            //正在加载中，请稍候...
            htmlText4:'正在加载中，请稍候..._en',
            //"确认删除该笔记吗(本操作不可恢复)?
            staticText1:'"确认删除该笔记吗(本操作不可恢复)?_en'
        }
    },
    // 学习页面
    learn: {
        prev: '上一个_en',
        next: '下一个_en',
        pageTitle: '章节列表-章节学习_en',
        chapter: '章节_en',
        backToCoursePage: '返回课程主页_en',
        keywordPlaceHolder: '请输入答疑关键字..._en',
        myQuestion: '我的问题_en',
        commonQuestion: '常见问题_en',
        allQuestion: '全部问题_en',
        writeQuestionLabel: '在此写下您的问题..._en',
        quiz: '马上提问_en',
        totalQuestions: '共<em>{{QuizTotalCount}}</em>个问题_en',
        totalNote: '共<em>{{NoteTotalCount}}</em>笔记_en',
        notFoundText1: '在课程学习时遇到任何问题_en',
        notFoundText2: '都可以随时提问哦_en',
        viewMore: '查看更多_en',
        goback: '返回_en',
        findQuestionTmpl: '找到{{QuizTotalCount}}条问题_en',
        noKeyWordTitle: '抱歉，没有\“{{OldKeyWord}}\”的相关答疑_en',
        noQuestion: '暂无常见问题_en',
        noQuestionTitle: '在课程学习时遇到任何问题<br />都可以随时提问哦~_en',
        noContentLabel: '好记性不如烂笔头_en',
        publishNote: '发表笔记_en',
        note: '笔记_en',
        showAll: '显示全部_en',
        deleteNote: '删除_en',
        updateNote: '修改_en',
        cancelNote: '取消_en',
        saveNote: '确认_en',
        notFoundText3: '可以在课程学习时多记笔记<br />提高学习效果~_en',
        catalogPanel: '目录_en',
        quizpanel: '答疑_en',
        notepanel: '笔记_en',
        collapse: '[收起]_en',
        showAll2: '[显示全部]_en',

        exercise: {
            answercard: "答题卡_en",
            score: "成绩_en",
            guid: "练习说明_en",
            prevQuestion: "上一题_en",
            nextQuestion: "下一题_en",
            redAnswerErrorQuestion: '错题重做_en',
            commit: "提交练习_en"
        }
    },
    // 培训认证频道
    trains: {
        // 后台系统
        systemManage: {

        },
        // 前台页面
        frontPage: {
            // 评价
            evaluate: {
                newEvaluateLabel: '请对培训的满意度进行评价_en'
            },

            //无培训提示
            noTip: '暂无此类培训_en',
            //页面标题
            pageTitle: '培训列表_en',
            //培训已结束
            trainHasOver: '培训已结束_en',
            //等待报名
            waitRoll: '该培训未报名，请先设置为目标！_en',
            //门课程
            _courses: '门培训_en',
            //学时
            _hours: '学时_en',
            //个考试
            _exams: '个考试_en',
            //共有
            _total: '共有_en',
            //'目前共有 ' + StudyNum + '人学习 _en'
            _currentCount: '目前共有{{count}}人学习 _en',
            //通过方式：
            _passWay: '通过方式：_en',
            //'修满' + MinHours + '个学时_en'
            _fullHours: '修满{{hours}}个学时_en',
            //资源：
            _source: '资源：_en',
            //共
            _all: '共_en',
            //门课
            _mk: '门课_en',
            //个考试
            _gks: '个考试_en',
            //个
            _g: '个_en',
            //内含：视频
            _videos: '内含：视频_en',
            //文档
            _txt: '文档_en',
            //练习
            _train: '练习_en',
            //学时；
            _h: '学时；_en',
            //考试
            _exam: '考试_en',
            //培训课程
            _trainCourse: '培训课程_en'
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
            htmlText5:'提示_en',
            //培训课程
            htmlText3:'课程_en',
            //课&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;程：
            htmlText4:'课&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;程：_en',
            //共
            total:'共_en',
            //门课
            coursesNr2:'门课_en',
            //目前共有 ' + StudyNum + _en'人学习
            htmlText1:'目前共有{{StudyNum}}人学习_en',
            //内含：视频
            htmlText2:'内含：视频_en',
            //个考试
            examNr: '个考试_en',
            //门课程
            coursesNr: '门课程_en',
            //分类：
            catalogs: '分类：_en',
            //学时
            studyHour:'学时_en',
            //个
            number:'个_en',
            //全部
            all: '全部_en',
            //无培训提示
            noTip: '暂无此类职位_en',
            //页面标题
            pageTitle: '职位列表_en',
            //详细介绍
            itemDetail: '详细介绍_en',
            //提示框文本
            modelTip: '你原先的职业目标是{{target}},确认修改？_en',
            //设定为职业目标
            setTarget: '设定为职业目标_en',
            //培训已结束
            trainHasOver: '培训已结束_en',
            //等待报名
            waitRoll: '该职位未报名，请先设置为职业目标！_en'
            //等待审核
        }
    },
    //课程报名
    enrolls: {
        // 前台页面
        frontPage: {
            //您的缴费凭证正在审核中
            offlinePayText1:'您的缴费凭证正在审核中_en',

            /*
            js文件相关
             */
            //发票已合并开具至指定单位。
            staticText1:'发票已合并开具至指定单位。_en',
            //等待发票开具。
            staticText2:'等待发票开具。_en',
            //等待发票寄送。
            staticText3:'等待发票寄送。_en',
            //发票已开，请尽快领取
            staticText4:'发票已开，请尽快领取_en',
            //发票已寄送
            staticText5:'发票已寄送_en',
            //如果取消报名，您的培训报名信息将被删除。<br/>是否要取消报名？
            staticText6:'如果取消报名，您的培训报名信息将被删除。<br/>是否要取消报名？_en',
            //上传成功！
            staticText7:'上传成功！_en',
            //<span class='uploadButton_en'>重新上传文件</span>
            staticText8:'<span class="uploadButton">重新上传文件</span>_en',
            //请等待审核。如有疑问请联系客服。
            staticText9:'请等待审核。如有疑问请联系客服。_en',




            //页面标题1
            pageTitle1: '自选课程_en',
            //页面标题2
            pageTitle2: '选择培训班_en',
            //页面标题3
            pageTitle3: '我的培训_en',
            //页面标题4
            pageTitle4: '线下缴费_en',
            //页面标题5
            pageTitle5: '付款_en',
            //页面标题6
            pageTitle6: '报名结果_en',
            //页面标题7
            pageTitle7: '报名资料_en',


            //提示文本1
            courseLineTip: '新课程即将上线，敬请关注!_en',
            //提示文本2
            cancelSelectedCourseTip: '注意：如果取消在学选修课，则该课程已完成学时将不计入您的学习进度中。_en',
            //提示文本3
            rollTip3: '新培训即将上线，敬请关注！_en',
            //提示文本4
            rollTip4: '没找到您搜索的培训，请更换关键字或直接_en',
            //提示文本5
            rollTip5: '还没有正在学习的培训，去看看适合自己的培训_en',
            //提示文本6
            rollTip6: '请输入备注信息_en',
            //提示文本7
            rollTip7: '请填写汇款人姓名_en',
            //提示文本8
            rollTip8: '确认发票信息_en',
            //提示文本9
            rollTip9: '请填写所在单位名称或学员姓名_en',
            //提示文本10
            rollTip10: '(以实际缴费金额为准)_en',
            //提示文本11
            rollTip11: '请填写详细信息_en',
            //提示文本12
            rollTip12: '说明：发票寄送将统一使用快递到付的方式，如有其他需要请联系客服。_en',
            //提示文本13
            rollTip13: '修改发票信息_en',
            //提示文本14
            rollTip14: '保存发票信息_en',
            //提示文本15
            rollTip15: '确认发票信息_en',


            //培训有效期
            trainPeriod: '培训有效期：_en',
            //选课说明
            courseDescription: '选课说明：_en',
            //已选
            selected: '已选_en',
            //门课程，共
            courseAll: '门课程，共_en',
            //，还差
            short: '，还差_en',
            //共有
            all: '共有_en',
            //门必修课,
            requireCourse: '门必修课,_en',
            //门选修课可以选择
            courseSelectable: '门选修课可以选择_en',
            //保存所选课程
            saveSelectedCourse: '保存所选课程_en',
            //共选择
            allSelected: '共选择_en',

            //正在培训
            training: '正在培训：_en',
            //即将开通
            onOpenning: '即将开通：_en',
            //报名有效期
            rollPeriod: '报名有效期：_en',

            //报名培训
            rollTrain: '报名培训_en',
            //取消报名
            cancelRoll: '取消报名_en',
            //缴费信息
            payInfo: '缴费信息_en',
            //培训费用
            trainFee: '培训费用：_en',
            //收件人
            recipients: '收件人：_en',
            //电话
            telPhone: '电话：_en',
            //地址
            address: '地址：_en',
            //快递
            express: '快递：_en',
            //寄送日期
            sendDate: '寄送日期_en',

            //汇款信息
            remitInfo: '汇款信息_en',
            //汇款人
            remitPenson: '汇款人：_en',
            //汇款账号
            remitAccount: '汇款账号：_en',
            //汇款日期
            remitDate: '汇款日期：_en',
            //汇款金额：
            remitMoney: '汇款金额：_en',

            //发票抬头
            billTitle: '发票抬头：_en',
            //发票金额
            billMoney: '发票金额：_en',
            //寄送地址：
            sendAddress: '寄送地址：_en',
            //手机号码
            telNumber: '手机号码：_en',
            //请在支付宝支付成功后点击“支付成功”按钮，如付款遇到问题时请联系客服
            paySuccessTip: '请在支付成功后点击“支付成功”按钮，如付款遇到问题时请联系客服。_en',
            //支付成功
            paySuccess: '支付成功_en',
            //请输入优惠券序号！
            couponNumber: '请输入优惠券序号！_en',
            //确认移除该优惠券吗
            removeCoupon: '确认移除该优惠券吗_en',
            //请先填写并保存发票信息。
            fillBillInfo: '请先填写并保存发票信息。_en',
            //优惠券验证失败，请重新填写优惠券序号。
            couponValiteError: '优惠券验证失败，请重新填写优惠券序号。_en',
            //请在快钱支付成功后点击“支付成功”按钮，如付款遇到问题时请联系客服
            //福建省
            fjProvince: '福建省_en',
            //市辖区
            cityArea: '市辖区_en',
            //请输入发票抬头
            remitNoneError: '请输入发票抬头_en',
            //发票抬头必须是{0}到{1}个字
            remitFormatError: '发票抬头必须是{0}到{1}个字_en',
            //请输入邮政编码
            emailNoneError: '请输入邮政编码_en',
            //请输入街道地址
            addressNoneError: '请输入街道地址_en',
            //街道地址不能多于{0}个字
            addressFormat: '街道地址不能多于{0}个字_en',
            //请输入收件人
            recipientsNoneError: '请输入收件人_en',
            //请输入中文字符
            onlyChinese: '请输入中文字符_en',
            //请输入英文字符
            onlyEnglish: '请输入英文字符_en',
            //格式错误
            formatError: '格式错误_en',
            //请输入手机号码或者区号-固话
            phoneFormat: '请输入手机号码或者区号-固话_en',
            //邮编格式不正确，请重新输入
            emailError: '邮政编码必须是6位数字_en',
            //手机号码格式有误，请重新输入
            phoneError: '手机号码格式有误_en',
            //备注不能多于{0}个字
            remarkFormat: '备注不能多于{0}个字_en',
            //请先填写并保存发票信息！
            saveInfoTip: '请先填写并保存发票信息！_en',
            //去学习
            goToStudy: '去学习_en',
            //您已经付过款无需重复支付，点击下方按钮去学习。
            notPayAgain: '您已经付过款无需重复支付，点击下方按钮去学习。_en',
            //重新填写优惠券
            fillCouponAgain: '重新填写优惠券_en',
            //优惠券验证失败，请重新填写优惠券序号。
            couponValidateError: '优惠券验证失败，请重新填写优惠券序号。_en',
            //姓名不能多于{0}个字
            nameFormatError: '姓名不能多于{0}个字_en',


            //您可以选择
            selectAble: '您可以选择：_en',
            //修改报名资料
            editRollInfo: '修改报名资料_en',
            //修改付款信息
            editPayInfo: '修改付款信息_en',
            //去选课
            goSelectCourse: '去选课_en',
            //开始学习
            beginStudy: '开始学习_en',
            //继续报名其他职位
            aheadJob: '继续报名其他职位_en',
            //继续报名其他课程
            aheadCourse: '继续报名其他课程_en',
            //继续报名其他培训
            aheadTrain: '继续报名其他培训_en',
            //您的报名资料已提交，请等待审核。
            waitAuditing: '您的报名资料已提交，请等待审核。_en',
            //您报名的培训尚未开始，请耐心等待。
            waitTrain: '您报名的培训尚未开始，请耐心等待。_en',
            //很遗憾，您的报名审核未通过。
            auditingFail: '很遗憾，您的报名审核未通过。_en',
            //您的付款凭证已提交，请等待确认。
            waitConfirm: '您的付款凭证已提交，请等待确认。_en',
            //您的付款已通过, 请进入学习或报名其他培训。
            enterStudy: '您的付款已通过, 请进入学习或报名其他培训。_en',
            //您提交的付款信息有误，请重新提交。
            submitInfoError: '您提交的付款信息有误，请重新提交。_en',
            //您尚未选课, 请进行选课或报名其他培训。
            hasNoSelected: '您尚未选课, 请进行选课或报名其他培训。_en',
            //恭喜您，报名成功！
            rollSuccess: '恭喜您，报名成功！_en',
            //其他报名信息。
            otherRollInfo: '其他报名信息。_en',

            //填写基本资料
            baseInfo: '填写基本资料_en',
            //填写附加资料
            alterInfo: '填写附加资料_en',
            //附件信息要求
            //若不存在你所在单位请联系客服
            contactCustomerService: '若不存在你所在单位请联系客服_en',
            //若不存在你所在的单位，请自行添加
            addBySelf: '若不存在你所在的单位，请自行添加_en',
            //若不存在您所在单位请联系单位管理人员进行单位注册
            contactEnterp: '若不存在您所在单位请联系单位管理人员进行单位注册_en',
            //请选择
            toSelect: '请选择_en',

            //付款单位(个人)不能为空
            paymentNoneError: '付款单位(个人)不能为空_en',
            //付款单位(个人)的长度应该在 {0} 到 {1}字符
            paymentFormat: '付款单位(个人)的长度应该在 {0} 到 {1}字符_en',
            //收款账号为数字
            accountNumber: '收款账号为数字_en',
            //收款账号不能为空
            accountNoneError: '收款账号不能为空_en',
            //收款账号长度应该在 {0} 到 {1}字符
            accountFormat: '收款账号长度应该在 {0} 到 {1}字符_en',
            //汇款日期不能为空
            remitDateNoneError: '汇款日期不能为空_en',
            //汇款金额不能为空
            remitMoneyNoneError: '汇款金额不能为空_en',
            //汇款金额为数字
            remitMoneyNumber: '汇款金额为数字_en',
            //汇款金额应该在 {0} 到 {1}
            remitMoneyFormat: '汇款金额应该在 {0} 到 {1}_en',
            //备注不能为空
            remarkNoneError: '备注不能为空_en',
            //备注长度应该在 {0} 到 {1}字符
            remarkFormat: '备注长度应该在 {0} 到 {1}字符_en',
            //必须上传底单扫描图片！
            uploadPicFormat: '必须上传底单扫描图片！_en',
            //保存成功！
            picSaveSuccess: '保存成功！_en',
            //添加图片
            picAdd: '添加图片_en',


            //报名中...
            onRolling: '报名中..._en',
            //选择上传文件
            selectFile: '选择上传文件_en'
        }
    },
    // 课程资源
    courses: {
        frontPage: {
            evaluate: {
                newEvaluateLabel: '请对课程的满意度进行评价_en',
            },
            noNote: '暂无笔记_en',
            noQuestion: '暂无提问_en',
            latestNotes: '最新笔记_en',
            latestQuestion: '最新提问_en',
            chapter: '章节_en',
            noChapter: '暂未添加课程章节_en',
            lastCatalogName: '上次学到：_en',
            noCourseDetail: '课程描述，无数据_en'
        }
    },
    // 系统信息
    system: {},
    // 视屏播放器
    videos: {
        play: '播放_en',
        pause: '暂停_en',
        replay: "重播_en",
        volume: '音量_en',
        preference: '设置_en',
        fullscreen: '全屏_en',
        exitFullscreen: '退出全屏幕_en',
        coveredTheEntireScreen: '满屏_en',
        ad: '广告_en',
        second: '秒_en',
        sure: '确定_en',
        cancel: '取消_en',
        language: '语言_en',
        subtitles: '字幕_en',
        quality: '画质_en',
        auto: '自动_en',
        notAvailable: '不可选_en',
        noUseed: '不使用_en',
        ultimateHD: '超清_en',
        hd: '高清_en',
        sd: '标清_en',
        smooth: '流畅_en',
        rapidly: '急速_en',
        rightAnswerTitle: '恭喜你答对了_en',
        examinationQuestions: '检测题_en',
        continuePlay: '继续播放_en',
        reAnswer: '重新作答_en',
        question: '题_en',
        total: '共_en',
        hasAnswered: '已作答_en',
        failAnswerTitle: '很遗憾你答错了，请继续作答_en',
        fastreverse: "后退15秒_en",
        scale: "画面比例_en",
        chinese: "中文_en",
        english: "英文_en",
        japanese: "日文_en"
    },
    // 文档播放器
    documents: {
        thumbanail: {
            noThumbanail: "该文档暂无缩略图_en"
        },
        message: {
            message: "抱歉，出了点小问题！_en",
            loadingTitle: "    加载中...    _en",
            failTitle1: '文档加载失败，请_en',
            failTitle2: '刷新_en',
            failTitle3: '页面重新加载_en'
        },
        content: {
            top: '上_en',
            bottom: '下_en',
            left: '左_en',
            right: '右_en',
            loading: "加载中..._en"
        },
        bar: {
            thumbanail: '缩略图_en',
            drag: '拖拽_en',
            choiceWord: '选词_en',
            dragMode: '拖拽模式_en',
            zonedWrodMode: '划词模式_en',
            returnTopPage: '上次看到这里，点击回首页_en',
            prevPage: '上一页_en',
            nextPage: '下一页_en',
            prevScreen: '上一屏_en',
            nextScreen: '下一屏_en',
            narrow: '缩小_en',
            enlarge: '放大_en',
            fullscreen: '全屏_en',
            exitfullscreen: '退出全屏_en'
        }
        //fullscreen: '全屏_en',
        //exitFullscreen: '退出全屏幕_en',
        //prev: '上一页_en',
        //next: '下一页_en',
        //loading: '加载中_en',
        //drag: '拖拽_en',
        //thumbnail: '缩略图_en',
        //enlarge: '放大_en',
        //narrow: '缩小_en'
    },
    // 作答组件
    hunters: {
        // 前台页面
        frontPage: {
            //页面标题1
            pageTitle1: '题目作答_en',
            //页面标题2
            pageTitle2: '考试成绩_en',
            //页面标题3
            pageTitle3: '验证考试密码_en',
            //答题卡
            answerCart: '答题卡_en',
            //试卷查阅
            papreView: '试卷查阅_en',
            //试卷说明
            paperInstruction: '试卷说明_en',
            //考试结果查阅
            examResultView: '考试结果查阅_en',
            //试卷总分：
            totalScore: '试卷总分：_en',
            //学员得分：
            personScore: '学员得分：_en',
            //题目信息
            questionInfo: '题目信息_en',
            //本次成绩
            thisScore: '本次成绩_en',
            //本次客观题成绩
            thisObjectiveScore: '本次客观题成绩_en',
            //还有几次机会
            changeToExam: '还有{{countTime}}次机会_en',
            //总题数
            totalQuestions: '共{{totalQuestions}}题_en',
            //总分
            allScore: '总分：_en',
            //得分
            getScore: '得分：_en',
            //作答
            answer: '作答：_en',
            //答案
            result: '答案：_en',
            //注意
            notice:'注意_en',
            //作答结果
            answerResult: '作答：{{UserAnswer}}　正确答案:{{Answer}}_en',
            //分
            fen: '分_en',
            //共
            gong: '共_en',
            //题
            ti: '题_en',
            //分钟
            minute: '分钟_en',
            //及格
            pass: '及格_en',
            //总分标签
            score: '总分_en',
            //验证
            validate: '验证_en',
            //密码placeholder
            passwordPlace: '4位考试密码_en',
            //考试验证码1
            testValidate1: '请输入考试验证码后开始考试：_en',
            //考试验证码2
            testValidate2: '请联系监考老师获取验证码_en',
            //保存成功
            saveSuccess: '保存成功_en',
            //修改后试卷总分为 " + eval(paperPartScores.join('+_en')) + " 分，确认保存？
            editPaperScore: '修改后试卷总分为{{totalScore}}分，确认保存？_en',
            //正确答案：" + Answer + " 未作答
            noAnswer: '正确答案：{{answer}}未作答_en',
            //正确答案：" + Answer + " 作答
            hasAnswer: '正确答案：{{Answer}} 作答：{userAnswer}_en',
            //未作答
            noAnswerLabel: '未作答_en'

        }
    },
    homePage: {
        frontPage: {
            courseInfo: '{{Title}} ({{MinHours}}个学时，{{StudyNum}}人学习)_en'
        }
    },
    // 公开课频道
    single_courses: {
        frontPage: {
            noCourses: '暂无此类课程_en'
        }
    },
    //登录页面
    login: {
        frontPage: {
            login: '登录_en',
            student: '学员_en',
            teacher: '教师_en',
            groupManager: '单位管理员_en',
            rememberMe: ' 记住我_en',
            password: '密码_en',
            techSupport: '技术支持_en',
            signUp: '注册_en',
            logining: '登录中_en',
            validCode: '验证码_en',
            tips: '看不清换一张_en',
            forgetPassword: '忘记密码_en',
            crmTel: '客服电话_en',
            previous: '前一个_en',
            after: '后一个_en',
            /*
             js文件部分
             */
            //用户名/身份证号码
            staticText1: '用户名/身份证号码_en',
            //请输入用户名/身份证号码
            staticText2: '请输入用户名/身份证号码_en',
            //91通行证
            staticText3: '91通行证_en',
            //请输入密码
            staticText4: '请输入密码_en',
            //请输入验证码
            staticText5: '请输入验证码_en',
            //用户名
            staticText6: '用户名_en',
            //身份证号码
            staticText7: '身份证号码_en',
            //用户中心获取验证码异常，请稍后刷新浏览器重试。
            staticText8: '用户中心获取验证码异常，请稍后刷新浏览器重试。_en',
            //用户中心服务器异常，请稍后刷新浏览器重试。
            staticText9: '用户中心服务器异常，请稍后刷新浏览器重试。_en',
            //请输入用户名
            staticText10: '请输入用户名_en'
        }
    },
    /*
     我的学习页面
     */
    myStudy: {
        frontPage: {
            //参加该课程
            enroll:'参加该课程_en',
            //选课管理
            courseMan:'选课管理_en',
            //培训
            train:'培训_en',
            //职位
            job:'职位_en',
            //公开课
            course:'公开课_en',
            //搜索课程
            searchCourse: '搜索课程..._en',
            //培训要求
            trainRequirement: "培训要求_en",
            //点击显示培训要求
            trainRequirementTips: '点击显示培训要求_en',
            //今日
            date: '今日_en',
            //培训已经结束
            trainFinished: '培训已经结束_en',
            //培训还剩
            trainLeft: "培训还剩_en",
            //天
            day: '天_en',
            //培训今天结束
            trainEdToday: '培训今天结束_en',
            //培训明天结束
            trainEdTomorrow: '培训明天结束_en',
            //继续选择
            chooseContinue: '继续选择_en',
            //培训已获得
            obtained: '培训已获得_en',
            //学时
            studyHour: '学时_en',
            //培训已选课程
            selectedCourse: '培训已选课程_en',
            //学习进度
            studyProgress: '学习进度_en',
            //已学
            learned: '已学_en',
            //共
            total: '共_en',
            //无学时要求
            noHoursRequired: '无学时要求_en',
            //培训合格
            qualifiedTrain: '培训合格_en',
            //培训未合格
            unqualifiedTrain: '培训未合格_en',
            //证书编号
            certificateNr: '证书编号：_en',
            //查看证书
            showCertificate: '查看证书_en',
            //恭喜你
            congratulation: '恭喜你，_en',
            //培训合格！
            qualifiedTrainM: '培训合格!_en',
            //培训尚未完成
            trainUnfinished: '培训尚未完成，_en',
            //继续努力
            learnContinue: '继续努力！_en',
            //很遗憾，
            apology: '很遗憾，_en',
            //培训未合格。
            unqualifiedTrainM: '培训不合格。_en',
            //门课程
            courseNr: '门课程_en',
            //本培训已结束，您可以：
            trainTipsText1: '本培训已结束，您可以：_en',
            //1、通过笔记和答疑进行复习回顾
            trainTipsText2: '1、通过笔记和答疑进行复习回顾_en',
            //2、切换学习其他培训 或者
            trainTipsText3: '2、切换学习其他培训 或者 _en',
            //报名新的培训
            trainTipsText4: '报名新的培训_en',
            //2、切换学习其他课程 或者
            trainTipsText5: '2、切换学习其他课程 或者 _en',
            //报名新的课程
            trainTipsText6: '报名新的课程_en',
            //2、切换学习其他职位 或者
            trainTipsText7: '2、切换学习其他职位 或者 _en',
            //报名新的职位
            trainTipsText8: '报名新的职位_en',
            //默认排序
            defaultSort: '默认排序_en',
            //最近学习
            latestLearned: '最近学习_en',
            //正在努力加载中，请稍侯。
            loading: '正在努力加载中，请稍侯。_en',
            //抱歉，没有
            courseText1: '抱歉，没有“_en',
            //的相关课程
            courseText2: '”的相关课程_en',
            //建议您：
            courseText3: '建议您：_en',
            //更改关键字再进行搜索
            courseText4: '更改关键字再进行搜索_en',
            /*
             培训提醒部分文本
             */
            //学习
            learn: '学习_en',
            //亲爱的学员，本培训需要您修满
            textPart1: '亲爱的学员，本培训需要您修满_en',
            //学时，其中：
            textPart2: '学时，其中：_en',
            //门必修课，获得
            textPart3: '门必修课，获得_en',
            //门选修课，获得
            textPart4: '门选修课，获得_en',
            //参加并通过相应的考试
            textPart5: '参加并通过相应的考试_en',
            //，获得
            textPart6: '，获得_en',
            //考试待定，请等待通知
            textPart7: '考试待定，请等待通知_en',
            //请于
            textPart8: '请于_en',
            //前完成上述内容的学习
            textPart9: '前完成上述内容的学习_en',
            //及考试
            textPart10: '及考试_en',
            //，获取培训证书
            textPart11: '，获取培训证书_en',
            /*
             星期
             */
            monday: '星期一_en',
            tuesday: '星期二_en',
            wednesday: '星期三_en',
            thursday: '星期四_en',
            friday: '星期五_en',
            saturday: '星期六_en',
            sunday: '星期日_en',
            unknown: '未知_en',
            /*
             button相关
             */
            //开始学习
            studyBegin: '开始学习_en',
            //复习回顾，
            studyPreview: '复习回顾_en',
            //继续上次学习
            continueLatestStudy: '继续上次学习_en',
            //继续学习
            continueStudy: '继续学习_en',
            //培训切换
            changeTrain: '培训切换_en',
            //我的课程
            myCourses: '我的课程_en',
            //未知姓名
            unknownName: '未知姓名_en',
            /*
             EmtpyIndex
             */
            //未报名任何培训
            emptyIndexText1: '未报名任何培训_en',
            //未报名培训
            emptyIndexText2: '未报名培训_en',
            //未报名任何培训，无学时要求
            emptyIndexText3: '未报名任何培训，无学时要求_en',
            //未报名任何培训， 快快去报名吧
            emptyIndexText4: '未报名任何培训， 快快去报名吧_en',
            /*
             js 静态文件中的文本国际化
             */
            //请勿输入非法字符。
            staticText1: '请勿输入非法字符。_en',
            //学员您好！您的基本资料不完整，可能影响培训结果或导致证书生成失败，请在完善基本资料后继续学习。
            staticText2: '学员您好！您的基本资料不完整，可能影响培训结果或导致证书生成失败，请在完善基本资料后继续学习。_en',
            //去补全资料
            staticText3: '去补全资料_en',
            //学员您好！您的报名信息不完整，可能影响培训结果或导致证书生成失败，请在完善报名信息后继续学习。
            staticText4: '学员您好！您的报名信息不完整，可能影响培训结果或导致证书生成失败，请在完善报名信息后继续学习。_en',
            //公告
            notices: '公告_en'
        }
    },
    //课程章节
    courseChapters: {
        frontPage: {
            //参加该课程
            enrollAdvance:'参加该课程_en',
            //必修
            requiredCourse:'必修_en',
            //选修
            selectiveCourse:'选修_en',
            //课
            course:'课_en',
            //【收起】
            hide:'[收起]_en',
            //【显示全部】
            showAll:'[显示全部]_en',
            //返回课程列表
            backCourseList: '返回_en',
            //课程封面
            logoImage: '课程封面_en',
            /*
             用户学习提醒类文本
             */
            //我知道了
            learnText1: '我知道了_en',
            //学习小贴士
            learnText2: '学习小贴士_en',
            //看视频
            learnText3: '[看视频]_en',
            //请正常播放观看视频，拖动的进度将不计入学时。如视频中穿插课堂练习题，请答对题目后继续观看视频。
            learnText4: '请正常播放观看视频，拖动的进度将不计入学时。如视频中穿插课堂练习题，请答对题目后继续观看视频。_en',
            //看文档
            learnText5: '[看文档]_en',
            //本课程文档有学习时间要求，请注意文档左下方的倒计时，倒计时结束后方可获得对应学时。
            learnText6: '本课程文档有学习时间要求，请注意文档左下方的倒计时，倒计时结束后方可获得对应学时。_en',
            //做练习
            learnText7: '[做练习]_en',
            //本课程共有<!--ko text:PracticeTotal--><!--/ko-->道练习题，做对<!--ko text:Math.ceil(PracticeToClassHour()*PracticeLimit())--><!--/ko-->题可获得练习对应学时。
            learnText8: '本课程共有{{totalEx}}道练习题，做对{{remindsEx}}题可获得练习对应学时。_en',
            //上次学习到：<span>@lastCatalogName
            learnText9: '上次学习到：{{lastCatalogName}}_en',
            //未学
            notLearned: '未学_en',
            courseOutline: '课程目录_en',
            //课程作业
            courseEx: '课程作业_en',
            //查看更多
            getMore: '查看更多_en',
            //最新提问
            latestQuestion: '最新提问_en',
            //最新笔记
            latestNote: '最新笔记_en',
            //显示全部
            showAll: '显示全部_en',
            //资料下载
            resourceDownload: '资料下载_en',
            //下载
            download: '下载_en',
            //任务
            task: '任务_en',
            //页
            page: '页_en',
            //题
            question: '题_en',
            //再次学习
            learnAgain: '再次学习_en',
            //开始练习
            startEx: '开始练习_en',
            //继续练习
            continueEx: '继续练习_en',
            //再次练习
            previewEx: '再次练习_en',
            /*
            js文件
             */
            // "请于" + taskEndTime + "前完成“" + taskTitle + "”—《"
            staticText1:'请于{{taskEndTime}}前完成“{{taskTitle}}”-《_en',
            //》的学习。
            staticText2:'》的学习。_en'
        }
    },


    /*
     选课页面
     */
    courseChoice: {
        frontPage: {
            //保存所选课程
            text1: '保存所选课程_en',
            //还差<em> remain </em>学时，请调整课程组合
            text2: '还差<em>{{remain}}</em>学时，请调整课程组合_en',
            //本课程无大纲, 请见谅!
            text3: '本课程无大纲, 请见谅!_en',
            //如果取消在学选修课，该课程已完成学时将不计入您的学习进度中。
            text4: '如果取消在学选修课，该课程已完成学时将不计入您的学习进度中。_en',
            //我知道了
            text5: '我知道了_en',
            //重新选课
            text6:'重新选课_en',
            //确认并开始学习
            text7: '确认并开始学习_en',
            //系统提示
            text8: '系统提示_en'

        }
    },
    /*
        教师评课页面
    */
    teachCheck: {
        frontPage: {
            //我的概览(home-index)
            myOverview: '我的概览_en',
            //您当前负责：
            yourResponsibility: '您当前负责：_en',
            //门课程
            courses: '门课程_en',
            //共有：
            allCount: '共有：_en',
            _allCount: '共有_en',
            //条未完成的答疑，已完成答疑
            questionView: '条未完成的答疑，已完成答疑_en',
            //条
            item: '条_en',
            //场考试，
            examCount: '场考试，_en',
            //张卷子待批改
            paperCountToView: '张卷子待批改_en',
            //当前老师答疑统计
            questionCountTeach: '当前老师答疑统计_en',
            //查询
            search: '查询_en',
            //日期
            date: '日期_en',
            //答疑数
            questionCount: '答疑数_en',
            //共:
            totalCount: '共:{{count}}_en',
            //抱歉，查询日期内没有答疑信息
            searchQuestionNone: '抱歉，查询日期内没有答疑信息_en',
            //当前老师阅卷统计
            paperCountTeach: '当前老师阅卷统计_en',
            //阅卷数
            overviewCount: '阅卷数_en',
            //题量
            amounts: '题量_en',
            //份
            fen: ' 份_en',
            //题
            ti: ' 题_en',
            //抱歉，查询日期内没有阅卷信息
            searchOverviewNone: '抱歉，查询日期内没有阅卷信息_en',
            //时间不能为空
            dateNoneError: '时间不能为空_en',

            overview: "asd",
            //开始阅卷(mark-exam)
            beginOverview: '开始阅卷_en',
            //返回
            back: '返回_en',
            //题目
            examination: '题目_en',
            //作答人次
            answerPerson: '作答人次_en',
            //已阅人次
            hasReadPerson: '已阅人次_en',
            //待阅人次
            willReadPerson: '待阅人次_en',
            //阅卷
            overview: '阅卷_en',

            //我的阅卷(mark-index)
            myViewPaper: '我的阅卷_en',
            //考试名
            examName: '考试名_en',
            //所属培训
            trainBelongs: '所属培训_en',
            //所属项目
            projectBelongs: '所属项目_en',
            //开始时间
            beginTime: '开始时间_en',
            //已阅(份)
            hasReadCount: '已阅(份)_en',
            //待阅(份)
            willReadCount: '待阅(份)_en',
            //成绩详情
            scoreDetail: '成绩详情_en',
            //成绩
            result: '成绩_en',
            //考试说明
            examDescription: '考试说明_en',
            //说明
            instruction: '说明_en',
            //选择试卷
            paperSelect: '选择试卷_en',
            //总评：
            _general: '总评：_en',
            //不错
            pretty:'不错_en',

            //考试成绩详细说明(mark-offlinecorrect)
            examResultDescription: '考试成绩详细说明_en',
            //点评
            comment: '点评_en',
            //子科目
            subSubject: '子科目_en',
            //科目
            subject: '科目_en',
            //请选择成绩
            resultSelect: '请选择成绩_en',
            //通过
            pass: '通过_en',
            //有条件通过
            conditionalPass: '有条件通过_en',
            //不通过
            notPass: '不通过_en',
            //保存并下一个
            saveAndNext: '保存并下一个_en',
            //保存
            save: '保存_en',
            //考生答卷
            examineeAnswer: '考生答卷_en',
            //下载
            download: '下载_en',
            //总评
            general: '总评_en',
            //请输入总成绩
            inputTotalScore: '请输入总成绩_en',
            //分值保留一位小数，且不能超过10000
            decimalError: '分值保留一位小数，且不能超过10000_en',
            //姓名：
            name: '姓名：_en',
            //帐号：
            account: '帐号：_en',
            //选择单位
            unitSelect: '选择单位_en',
            //是否批改：
            whetherCorrect: '是否批改：_en',
            //全部
            all: '全部_en',
            //是
            yes: '是_en',
            //否
            no: '否_en',
            //是否合格：
            whetherQualified: '是否合格：_en',
            //答卷导出
            paperOutput: '答卷导出_en',
            //成绩导出
            resultOutput: '成绩导出_en',
            //下载成绩导入模版
            downloadAndInput: '下载成绩导入模版_en',
            //成绩导入
            resultInput: '成绩导入_en',
            //位同学完成考试
            studengFinishExam: '位同学完成考试_en',
            //是否合格
            passOrNot: '是否合格_en',
            //操作
            operation: '操作_en',
            //查看
            view: '查看_en',
            //暂无数据
            noDataNow: '暂无数据_en',
            //修改成绩
            modifyResult: '修改成绩_en',
            //批改
            correct: '批改_en',
            //文件：
            file: '文件：_en',
            //开始导入
            beginInput: '开始导入_en',
            //导入说明：
            inputInstruction: '导入说明：_en',
            //1、仅支持10MB大小以下Excel格式文件。
            inputTip1: '1、仅支持10MB大小以下Excel格式文件。_en',
            //2、建议每次导入考试成绩数量不超过200条，否则将造成系统长时间无响应或<br/>导入失败！
            inputTip2: '2、建议每次导入考试成绩数量不超过200条，否则将造成系统长时间无响应或导入失败！_en',
            //用户导入信息错误:
            userInputError: '用户导入信息错误:_en',
            //姓名
            _name: '姓名_en',
            //帐号
            _account: '帐号_en',
            //用户导入
            userInput: '用户导入_en',
            //答卷导出
            resultOutput: '答卷导出_en',
            //请选择要导入的excel
            selectInputExcel: '请选择要导入的excel_en',
            //确认
            confirm: '确认_en',
            //取消
            cancel: '取消_en',
            //导入成功
            inputSuccess: '导入成功_en',
            //下载错误文档
            downloadError: '下载错误文档_en',
            //有" + result + "位学员已有成绩，是否覆盖学员成绩？
            convertResultOrNot: '有{{count}}位学员已有成绩，是否覆盖学员成绩？_en',

            //试卷详情(mark-offlineexaminfo)
            paperDetail: '试卷详情_en',
            //考试信息
            examInfo: '考试信息_en',
            //考试子科目说明
            examSubjectInstruction: '考试子科目说明_en',
            //及格线
            passLine: '及格线_en',
            //资料下载
            dataDownload: '资料下载_en',
            //干系人分析
            personAnalysis: '干系人分析_en',

            //开始批改(mark-question)
            beginCorrect: '开始批改_en',
            //返回开始阅卷
            backToView: '返回开始阅卷_en',
            //学员信息:
            studendInfo: '学员信息:_en',
            //当前分数:
            currentScore: '当前分数:_en',
            //学员答案:
            studentAnswer: '学员答案:_en',
            //关闭
            close: '关闭_en',
            //参考答案:
            referenceAnswer: '参考答案:_en',
            //本题题目:
            thisTopic: '本题题目:_en',
            //本题得分:
            thisScore: '本题得分:_en',
            //分数不可改，判卷请谨慎
            correctTip: '分数不可改，判卷请谨慎_en',
            //拖动进度条来修改分数,也可以在文本框中直接输入分值
            modifyTip: '拖动进度条来修改分数,也可以在文本框中直接输入分值_en',
            //显示学员信息
            showStudentInfo: '显示学员信息_en',
            //显示参考答案
            showReferenceAnswer: '显示参考答案_en',
            //显示题干
            showQuestion: '显示题干_en',
            //提交>>
            submit: '提交>>_en',
            //结束
            finish: '结束_en',
            //本次阅卷完成了
            viewPerson: '本次阅卷完成了_en',
            //人
            person: '人_en',
            //还有'+(model.userIds().length-1-model.num())+'人_en'
            personLess: '还有{{count}}人_en',
            //Score+' 分_en'
            score: '{{score}} 分_en',
            //(总分 @questionScore.Scores.Sum() 分)
            _totalScore: '(总分 {{totalScore}} 分)_en',
            //请输入数值
            inputNumber: '请输入数值_en',
            //已经是最后一个学生了，是否结束
            finishOrNot: '已经是最后一个学生了，是否结束_en',
            //试卷名称
            paperName: '试卷名称_en',

            //项目切换(partial-hasenrolledtrain)
            projectSwitch: '项目切换_en',
            //培训切换
            trainSwitch: '培训切换_en',


            //我的答疑(partial-userinfo)
            myQuestion: '我的答疑_en',
            //我的概览
            myOverview: '我的概览_en',
            //我的阅卷
            myMarking: '我的阅卷_en',
            //我的作业
            myWork: '我的作业_en',

            //待回复(quiz-index)
            waitReply: '待回复_en',
            //已回复
            replied: '已回复_en',
            //状态：
            status: '状态：_en',
            _status:'状态_en',
            //课程：
            _course: '课程：_en',
            //类型：
            type: '类型：_en',
            _type:'类型_en',
            //常见
            common: '常见_en',
            //私有
            private: '私有_en',
            //条待回复
            replyCount: '条待回复_en',
            //课程-章节
            courseCharpter: '课程-章节_en',
            //内容
            content: '内容_en',
            //提问时间
            questionTime: '提问时间_en',
            //回复
            reply: '回复_en',
            //删除
            delete: '删除_en',
            //还可以输入
            inputEnter: '还可以输入_en',
            //字
            word: '字_en',
            //'来自:_en'+CatalogTitle
            from: '来自: {{name}}_en',
            //取消设置常见问题
            cancelCommonQuestion: '取消设置常见问题_en',
            //设为常见问题
            setCommonQuestion: '设为常见问题_en',
            //确认删除答疑吗? (回复同时也会被删除)
            questionDelConfirm: '确认删除答疑吗? (回复同时也会被删除)_en',
            //答疑回复
            questionReply: '答疑回复_en',

            //作业名称：(userjob-index)
            workName: '作业名称：_en',
            //是否评分：
            scoreOrNot: '是否评分：_en',
            //提交时间：
            submitDate: '提交时间：_en',
            //作业导出
            workOutput: '作业导出_en',
            //一共提交
            commitAll: '一共提交_en',
            //份作业
            workItem: '份作业_en',
            //作业名称
            _workName: '作业名称_en',
            //提交时间
            _submitDate: '提交时间_en',
            //未评分
            noScore: '未评分_en',
            //分数
            _score: '分数_en',
            //返回列表
            backList: '返回列表_en',
            //请输入0-100间数字
            formatTip: '请输入0-100间数字_en',
            //提交评分
            commitScore: '提交评分_en',
            //下一份
            nextItem: '下一份_en',
            //附件下载：
            attachLoad: '附件下载：_en',
            //成绩：
            _result: '成绩：_en',
            //培训：
            train: '培训：_en',
            //清除
            clear: '清除_en',
            //请先选择要导出的作业。
            selectOutputWork: '请先选择要导出的作业。_en',
            //您选择了" + countAll + "条记录，超过导出上限" + viewModel.model.checkLimit() + " ，如选择确定，将导出前" + viewModel.model.checkLimit() + "份文档。
            confirmTipWork: '您选择了{{count}}条记录，超过导出上限{{limit}} ，如选择确定，将导出前{{prevItem}}份文档。_en',
            //成绩采用百分制，请输入0-100的数字。
            scoreFormat: '成绩采用百分制，请输入0-100的数字。_en',
            //评分提交后，将不能再被修改，确认提交？
            submitConfirm: '评分提交后，将不能再被修改，确认提交？_en',
            //导出中..
            outputing: '导出中.._en',
            //退出登录
            logout: '退出登录_en',



            studentInfo: '学员信息：'
        }
    },

    /*
        单位管理界面
    */
    unitManage: {
        frontPage: {
            //报名管理(home-index)
            rollManage: '报名管理_en',
            //项目：
            proj: '项目：_en',
            _proj: '项目_en',
            //分类：
            type: '分类：_en',
            //培训：
            train: '培训：_en',
            _train:'培训_en',
            //学习状态：
            studyStatus: '学习状态：_en',
            //付款状态：
            payStatus: '付款状态：_en',
            //学员：
            stuPerson: '学员：_en',
            //文件：
            file: '文件：_en',
            //导入说明：
            inputDescrip: '导入说明：_en',
            //全部
            all: '全部_en',
            //已付款
            hasPay: '已付款_en',
            //未付款
            unPay: '未付款_en',
            //免费
            free: '免费_en',
            //查询
            search: '查询_en',
            //导出
            output: '导出_en',
            //批量导入学员
            inputStuBatch: '批量导入学员_en',
            //学员
            _stuPerson: '学员_en',
            //单位
            _unit: '单位_en',
            //培训名称
            _trainName: '培训名称_en',
            //付款状态
            _payStatus: '付款状态_en',
            //学习状态
            _studyStatus: '学习状态_en',
            //加入时间
            _joinTime: '加入时间_en',
            //操作
            _operation: '操作_en',
            //待审核
            pendingAudit: '待审核_en',
            //审核拒绝
            rejectAudit: '审核拒绝_en',
            //审核通过
            passAudit: '审核通过_en',
            //待选课
            waitElecCourse: '待选课_en',
            //学习中
            studying: '学习中_en',
            //正在加载中...
            onLoading: '正在加载中..._en',
            //姓名或
            holderTxt: '姓名或{{name}}_en',
            //导入中，请稍候...
            onImporting: '导入中，请稍候..._en',
            //下载导入模板
            loadImportTpl: '下载导入模板_en',
            //(说明：模板中红色部分为必填项)
            formTip: '(说明：模板中红色部分为必填项)_en',
            //1、单次的导入学员数控制在500人内
            importTip1: '1、单次的导入学员数控制在500人内_en',
            //2、当前导入只支持免费类，收费类的培训请联系平台客服人员
            importTip2: '2、当前导入只支持免费类，收费类的培训请联系平台客服人员_en',
            //用户导入信息错误
            importUserError: '用户导入信息错误_en',
            //开始导入
            importBegin: '开始导入_en',
            //查看报名资料
            viewRollInfo: '查看报名资料_en',
            //用户导入
            userImport: '用户导入_en',
            //无学员信息
            noStuInfo: '无学员信息_en',
            //请选择上传文件
            selectFile: '请选择上传文件_en',
            //导入成功
            importSuccess: '导入成功_en',
            //下载错误文档
            loadErrorTxt: '下载错误文档_en',

            //证书查询(home-cart)
            cartQuery: '证书查询_en',
            //证书：
            cart: '证书：_en',
            //证书状态：
            cartStatus: '证书状态：_en',
            //证书编号：
            cartCode: '证书编号：_en',
            //证书名称
            _cartName: '证书名称_en',
            //证书状态
            _cartStatus: '证书状态_en',
            //证书编号
            _cartCode: '证书编号_en',
            //证书生成时间
            _cartGeneralDate: '证书生成时间_en',
            //已生成
            hasGeneral: '已生成_en',
            //待生成
            waitGeneral: '待生成_en',
            //证书说明
            cartDescrip: '证书说明_en',
            //获取证书地址失败
            getCartError: '获取证书地址失败_en',


            //单位资料(home-info)
            unitInfo: '单位资料_en',
            //基本信息
            baseInfo: '基本信息_en',
            //单位全称：
            unitFullName: '单位全称：_en',
            //单位简称：
            unitName: '单位简称：_en',
            //单位地址：
            unitAddress: '单位地址：_en',
            //联系人：
            contactPerson: '联系人：_en',
            //联系电话：
            contactTel: '联系电话：_en',
            //联系邮箱：
            contactEmail: '联系邮箱：_en',
            //注册地：
            registerAddress: '注册地：_en',
            //组织机构代码：
            organizationCode: '组织机构代码：_en',
            //所属分类：
            belongsType: '所属分类：_en',
            //保存修改
            update: '保存修改_en',
            //其他信息
            otherInfo: '其他信息_en',
            //备注：若需修改资料，请联系平台客服
            updateTip: '备注：若需修改资料，请联系平台客服_en',
            //必选字段
            requiredField: '必选字段_en',
            //请填写正确格式的电子邮件
            emailTip: '请填写正确格式的电子邮件_en',
            //请填写正确格式的联系电话
            telTip: '请填写正确格式的联系电话_en',
            //请填写单位地址
            addressTip: '请填写单位地址_en',
            //请填写联系人
            contactTip: '请填写联系人_en',
            //请填写联系电话
            contactTelTip: '请填写联系电话_en',
            //请填写联系邮箱
            contactEmailTip: '请填写联系邮箱_en',
            //保存成功
            saveSuccess: '保存成功_en',

            //帐号信息(home-myinfo)
            accountInfo: '帐号信息_en',
            //姓名：
            name: '姓名：_en',
            //身份证：
            idCart: '身份证：_en',
            //电子邮箱：
            email: '电子邮箱：_en',
            //原密码：
            originalPassW: '原密码：_en',
            //新密码：
            newPassW: '新密码：_en',
            //重复新密码：
            repeatPassW: '重复新密码：_en',
            //原邮箱
            originalEmail: '原邮箱_en',
            //新邮箱：
            newEmail: '新邮箱：_en',
            //修改密码
            updatePassW: '修改密码_en',
            //确认修改
            confirmEdit: '确认修改_en',
            //新密码和重复新密码不同
            passWTip: '新密码和重复新密码不同_en',
            //修改电子邮箱
            emailEdit: '修改电子邮箱_en',
            //密码格式不正确
            passwordFormatError: '密码格式不正确_en',
            //请输入原密码
            inputOriginalPassword: '请输入原密码_en',
            //请输入密码 区分大小写(不含特殊字符)
            passwordFormat: '请输入密码 区分大小写(不含特殊字符)_en',
            //{0}~{1}位字符组成
            passwordSizeFormat: '{0}~{1}位字符组成_en',
            //新旧密码不能相同
            passwordRepeat: '新旧密码不能相同_en',
            //请再输一次密码
            passwordAgain: '请再输一次密码_en',
            //两次密码输入不一致
            passwordNoMap: '两次密码输入不一致_en',
            //请输入新电子邮箱
            inputNewEmail: '请输入新电子邮箱_en',
            //输入的电子邮箱格式有误
            emailFormatError: '输入的电子邮箱格式有误_en',
            //"原密码错误"
            originalPasswordError: '原密码错误_en',

            //合格查询(home-pass)
            qualifyQuery: '合格查询_en',
            //合格状态：
            qualifyStatus: '合格状态：_en',
            //合格
            pass: '通过_en',
            //未合格
            unPass: '未通过_en',
            //合格
            qualify: '合格_en',
            //未合格
            unQualify:'未合格_en',
            //学时情况
            hoursSituation: '学时情况_en',
            //考试
            examination:'考试：_en',
            //考试
            _examination: '考试_en',
            //培训情况
            trainSituation: '培训情况_en',
            //达成日期
            reachDate: '达成日期_en',
            //已修/要求学时：
            requiredHours: '已修/要求学时：_en',
            //课程获得：
            fromCourse: '课程获得：_en',
            //考试获得：
            fromExamination: '考试获得：_en',
            //合格数据更新成功
            dataUpdateSuccess: '合格数据更新成功_en',

            //成绩查询(home-score)
            scoreQuery: '成绩查询_en',
            //考试状态：
            examStatus: '考试状态：_en',
            //已考
            hasExam: '已考_en',
            //待考
            waitExam: '待考_en',
            //考试次数
            examCount: '考试次数_en',
            //考试方式
            examWay: '考试方式_en',
            //成绩
            score: '成绩_en',

            //报名资料(home-traineeinfo)
            registerData: '报名资料_en',
            //姓名/帐号：
            accountOrName: '姓名/帐号：_en',
            //必填项
            required: '必填项_en',
            //选填项
            optional: '选填项_en',
            //的附加信息
            attachInfo: '的附加信息_en',
            //（支持上传文档、图片、压缩包格式的文件，文件大小不超过
            fileTip1: '（支持上传文档、图片、压缩包格式的文件，文件大小不超过_en',
            //，至多添加
            fileTip2: '，至多添加_en',
            //个附件
            fileTip3: '个附件_en',
            //保存
            save: '保存_en',
            //福建省
            fjProvince: '福建省_en',
            //请选择所在区域
            selectArea: '请选择所在区域_en',
            //更新成功
            updateSuccess: '更新成功_en',

            //注册单位(register-index)
            registerUnit: '注册单位_en',
            //单位资料请仔细填写，提交后不允许修改。
            unitDateTip1: '单位资料请仔细填写，提交后不允许修改。_en',
            //请正确填写注册地，此项内容
            unitDataTip2: '请正确填写注册地，此项内容_en',
            //与证书编号有关
            unitDataTip3: '与证书编号有关_en',
            //请正确选择
            unitDataTip4: '请正确选择_en',
            //单位管理员
            unitSuper: '单位管理员_en',
            //提示：
            prompt: '提示：_en',
            //1、以下填写的身份证将作为单位管理员查看本单位学生报名学习情况的登录帐号，请正确填写。
            unitDataTip5: '1、以下填写的身份证将作为单位管理员查看本单位学生报名学习情况的登录帐号，请正确填写。_en',
            //2、以下收集的信息只用于核对身份真实性，本站保护用户隐私。
            unitDataTip6: '2、以下收集的信息只用于核对身份真实性，本站保护用户隐私。_en',
            //身份证（正面）：
            idCartFront:'身份证（正面）：_en',
            //企业所在地信息
            unitAdInfo: '企业所在地信息_en',
            //验证码：
            verifyCode: '验证码：_en',
            _verifyCode: '验证码_en',
            //看不清换一张
            changeCode: '看不清换一张_en',
            //注册
            register: '注册_en',
            //访问受限
            accessLimit: '访问受限_en',
            //抱歉！
            sorry: '抱歉！_en',
            //您无权访问该页面...
            noRightAccess: '您无权访问该页面..._en',
            //联系客服：0591-63183000  QQ:1369080504
            customerService: '联系客服：0591-63183000  QQ:1369080504_en',
            //返回
            back: '返回_en',
            //（仅支持小于2M 的JPG、PNG图片文件）
            uploadFormat: '（仅支持小于2M 的JPG、PNG图片文件）_en',
            //企业所在地：
            enterpAddress: '企业所在地：_en',
            //企业注册地：
            enterpRegister: '企业注册地：_en',
            //忘记组织机构代码，
            forgetOrganizationCode: '忘记组织机构代码，_en',
            //点击查询
            clickQuery: '点击查询_en',
            //图片
            picture: '图片_en',
            //请选择小于2M的图片
            picUploadLimit: '请选择小于2M的图片_en',
            //请不要一直重复上传
            repeatUpload: '请不要一直重复上传_en',
            //身份证格式不正确
            idFormatError: '身份证格式不正确_en',
            //联系电话格式有误，请重新输入
            contactPhoneError: '联系电话格式有误，请重新输入_en',
            //请输入单位全称
            putUnitFullName: '请输入单位全称_en',
            //此单位全称已被注册，请更换
            fullNameRepeat: '此单位全称已被注册，请更换_en',
            //请输入单位简称
            putUnitName: '请输入单位简称_en',
            //此单位简称已被注册，请更换
            nameRepeat: '此单位简称已被注册，请更换_en',
            //请输入单位地址
            putUnitAd: '请输入单位地址_en',
            //请输入联系人
            putContact: '请输入联系人_en',
            //请输入联系电话
            putContactPhone: '请输入联系电话_en',
            //请选择企业所在地
            selectUnitAd: '请选择企业所在地_en',
            //请输入姓名
            putName: '请输入姓名_en',
            //请上传身份证正面照
            idCartFrontPic: '请上传身份证正面照_en',
            //请输入验证码
            putVerifyCode: '请输入验证码_en',
            //验证码错误
            verifyCodeError: '验证码错误_en',
            //请输入身份证号码
            putIdCart: '请输入身份证号码_en',
            //该身份证号未注册，请先
            idCartNoRegister: '该身份证号未注册，请先_en',
            //请您填写组织结构代码
            putOrganizationCode: '请您填写组织结构代码_en',
            //该组织结构代码已存在
            organizationCodeRepeat: '该组织结构代码已存在_en',
            //创建成功
            createSuccess: '创建成功_en',

            //输入查找关键字(shared)
            keywordSearch: '输入查找关键字_en',
            //抱歉，没有找到关键字为“
            sorryNoFind: '抱歉，没有找到关键字为“_en',
            //建议更换关键字进行搜索。
            changeKeyword: '建议更换关键字进行搜索。_en',
            //单位切换
            switchUnit: '单位切换_en',
            //的单位
            unitKey: '”的单位_en',

        }
    },
    /*
    用户设置
    */
    userSetting: {
        frontPage: {
            //基本信息(user-setting-personalinfo)
            baseInfo: '基本信息_en',
            //注册信息
            registerInfo: '注册信息_en',
            //姓名：
            name: '姓名：_en',
            //个人资料
            personalInfo: '个人资料_en',
            //必填项
            required: '必填项_en',
            //选填项
            optional: '选填项_en',
            //保存
            save: '保存_en',

            //头像设置(user-setting-personalinfo)
            avatarSetting: '头像设置_en',
            //设置头像
            settingAvatar: '设置头像_en',

            //修改密码(user-setting-password)
            updatePassword: '修改密码_en',
            //当前密码：
            currentPassword: '当前密码：_en',
            //新密码：
            newPassword: '新密码：_en',
            //确认新密码：
            confirmNewPassword: '确认新密码：_en',
            //您使用的是@(ViewBag.AucAccountTpyeName)登录本平台，无法在此修改密码，请前往原平台修改密码。
            updateLimitTip: '您使用的是{{way}}登录本平台，无法在此修改密码，请前往原平台修改密码。_en',
            //前往用户中心
            goUserCenter: '前往用户中心_en',
            //修改密码成功
            updatePasswordSuccess: '修改密码成功_en',
            //请前往用户中心完善安全信息后再修改密码。
            improveInfo: '，请前往用户中心完善安全信息后再修改密码。_en',
            //请输入6~12个字符密码 (区分大小写)
            passwordFormat: '请输入6~12个字符密码 (区分大小写)_en',
            //"密码长度不正确，请输入6~12个字符，区分大小写"
            passwordSizeError: '"密码长度不正确，请输入6~12个字符，区分大小写"_en',


            //帐号设置(user-shared-elearninguserlayout)
            accountSetting: '帐号设置_en',
        }
    },

    /*
        上传组件
    */
    uploadWidget: {
        frontPage: {
            //文件大小超过2MB，请重新选择
            fileSizeLimit: '文件大小超过2MB，请重新选择_en',
            //图片格式不正确，请重新选择
            picFormatLimit: '图片格式不正确，请重新选择_en',
            //保存成功
            saveSuccess: '保存成功_en',
            //请选择上传图片
            selectPic: '请选择上传图片_en',
            //文件为空，无法上传
            fileNoSize: '文件为空，无法上传_en',
            //您所选择的文件的格式不符合要求,请重新选择！
            fileNoMatch: '您所选择的文件的格式不符合要求,请重新选择！_en',
            //上传出错
            uploadError: '上传出错_en',
            //返回状态为
            backStatus: '返回状态为_en'
        }
    },

    /*
        udialog弹框组件
    */
    dialogWidget: {
        frontPage: {
            //关闭
            close: '关闭_en',
            //系统提示
            systemTip: '系统提示_en',
            //确认
            confirm: '确认_en'
        }
    },

    /*
        datepicker组件
    */
    datepickerWidget: {
        frontPage: {
            closeText: '关闭_en',
            prevText: '&#x3C;上月_en',
            nextText: '下月_en&#x3E;',
            currentText: '今天_en',
            monthNames: ['一月_en', '二月_en', '三月_en', '四月_en', '五月_en', '六月_en',
            '七月_en', '八月_en', '九月_en', '十月_en', '十一月_en', '十二月_en'],
            monthNamesShort: ['一月_en', '二月_en', '三月_en', '四月', '五月_en', '六月_en',
            '七月_en', '八月_en', '九月_en', '十月_en', '十一月_en', '十二月_en'],
            dayNames: ['星期日_en', '星期一_en', '星期二_en', '星期三_en', '星期四_en', '星期五_en', '星期六_en'],
            dayNamesShort: ['周日_en', '周一_en', '周二_en', '周三_en', '周四_en', '周五_en', '周六_en'],
            dayNamesMin: ['日_en', '一_en', '二_en', '三_en', '四_en', '五_en', '六_en'],
            weekHeader: '周_en',
            dateFormat: 'yy-mm-dd',
            yearSuffix: '年_en'

        }
    },
    mobileDownload: {
        frontPage: {
            //移动端下载
            mobileDownload: '移动端下载_en',
            //帐号设置
            setAccount: '帐号设置_en',
            //去学习
            goStudy: '去学习_en',
            //我的培训
            myTrain: '我的培训_en',
            //报名培训
            registeredTrain: '报名培训_en',
            //查看所有消息
            viewAllMessage: '查看所有消息_en',
            //最新消息
            newMessage: '最新消息_en',
            //没有消息
            noMessage: '没有消息_en',
            //Android下载
            androidDownload: 'Android下载_en',
            //Android即将推出
            androidWillGo: 'Android即将推出_en',
            //已有帐号
            hasAccount: '已有帐号？_en',
            //登录
            login: '登录_en',
            //退出登录
            logout: '退出登录_en',
            //aPad即将推出
            aPadWillGo: 'aPad即将推出_en',
            //aPad下载
            aPadDownload: 'aPad下载_en',
            //iPhone下载
            iPhoneDownload: 'iPhone下载_en',
            //iPhone即将推出
            iPhoneWillGo: 'iPhone即将推出_en',
            //iPad下载
            iPadDownload: 'iPad下载_en',
            //iPad即将推出
            iPadWillGo: 'iPad即将推出_en',
            //手机扫描快速下载
            phoneScanDownload: '手机扫描快速下载_en',
            //课程下载，离线观看
            courseDownload: '课程下载，离线观看_en',
            //将课程资源下载到本地，无网络时也能看，节省流量又方便
            courseDownloadText: '将课程资源下载到本地，无网络时也能看，节省流量又方便_en',
            //提问题、记笔记
            askAndNotes: '提问题、记笔记_en',
            //学习中有问题随时提，有笔记随时记， 提高学习效率
            askAndNotesText: '学习中有问题随时提，有笔记随时记， 提高学习效率_en',
            //轻松同步
            easyAsync: '轻松同步_en',
            //学习记录云同步，不同设备间学习数据共享
            easyAsyncText: '学习记录云同步，不同设备间学习数据共享_en'
        }
    },
    learnPlay:{
        frontPage:{
            /*
             js文件相关
             */
            //本课程结束
            staticText1:'本课程结束_en',
            //您已完成本课程的
            staticText2:'您已完成本课程的_en',
            //章节列表-章节学习
            staticText3:'章节列表-章节学习_en',
            //确认删除该笔记吗(本操作不可恢复)?
            staticText4:'确认删除该笔记吗(本操作不可恢复)?_en',
            //"太棒了，您已学完全部内容！"
            staticText5:"太棒了，您已学完全部内容！_en"
        }
    },
    testAdd:{
        frontPage:{
            //网龙网络公司
            nd:'网龙网络公司_en',
            //为您推送最前沿、最有料的学习资讯
            htmlText1:'为您推送最前沿、最有料的学习资讯_en',
            htmlText2:'闽ICP备123456789号'
        }
    },
    /**
      *培训简介相关
      */
    trainIntroduce: {
        frontPage: {
            //简介
            intro: "简介_en",
            //课程
            classes: "课程_en",
            //报名有效期：
            validPeriod: "报名有效期：_en",
            //报名注意事项：
            warning: "报名注意事项：_en",
            //报名注意事项：
            noIntroduce: "暂无介绍_en",
            //培训简介：
            introduce: "培训简介:_en",
            //课程学友
            classmates: "课程学友_en",
            //同学
            classmate: "同学_en",
            //排行
            ranking: "排行_en",
            //人
            people: "人_en",
            //你的排名
            other1: '你的排名_en',
            //位，本周学习
            other2: '位，本周学习_en',
            //学时
            hours: '分钟_en',
            //开始学习吧，榜首先到先得！
            messageToLearn: '开始学习吧，榜首先到先得_en',
            //赶紧报名第一个开始学习吧！
            messageToReg: '赶紧报名第一个开始学习吧！_en',
            //排行榜更新于
            updateTime: '排行榜更新于_en',
            //7天学习排行榜
            board: '7天学习排行榜_en'
        }
    }
}
