var i18n = i18n ? i18n : {};

i18n['zh_cn'] = {
    learning: {
        common: {
            store: {
                mergeAnswerTitle: "本地有未保存的答案是否要与服务端的答案合并？",
                mergeBtn: "合并",
                ignoreBtn: "忽略"
            },
            judge: {
                right:"正确",
                error:"错误"
            },
            // 填空题翻译
            blankFilling:{
                maxWordsLength:'最多250字'
            },
            subjective: {
                attachement: "附件：",
                uploadTitle: "(附件允许上传图片文件，最大不超过10M)",
                uploadingText: "上传中：",
                downloadAttachement: "点击下载",
                selectFileText: "请选择文件...",
                fileLimitSize: "选择的文件过大",
                sureBtn: "确定"
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
                temporarilyUncertain: '标记题目',
                cancelTemporarilyUncertain: "取消标记题目",
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
            },
            navigation: "答题卡",
            pullUp: "收起",
            expand: "展开答题卡",
            prev: "<i></i>上一题",
            next: "<i></i>下一题",
            submit: "提交练习"
        },
        exam: {
            answer: {
                sure: '确定',
                retry: '重试',
                explanation: '试卷说明',
                msg1: '已完成全部题目，确定交卷吗？',
                msg2: "已完成 {{doneCount}} 题，还有 {{noAnswerCount}} 题未做，确定交卷吗？",
                msg3: "已完成 {{doneCount}} 题，还有 {{noAnswerCount}} 题未做，不能交卷！",
                commitExam: '交卷',
                commitFail: '交卷失败',
                continueAnswer: '继续答题',
                examFinishTitle: "本次考试时间已到, 不能继续答题",
                confirmCaption: "系统提示"
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
                timeHint: '距离考试结束：',
                examStartTime: "考试开始时间：",
                cautionItem1: '1、开始考试后不可暂停，时间到后自动交卷，请注意时间安排。',
                cautionItem2: '2、答题结束，点击“交卷”完成当前考试。',
                examFinishTitle: '考试已结束',
                examEndTitle: '距离考试结束还有：',
                examStartTitle: '距离开考还有：',
                examStartedTitle: '考试已开始：',
                examFinished: '本次考试时间已到, 不能继续答题',
                commit: '交卷',
                sureBtn: "确定",
                confirmCaption: "系统提示",

                hours: '小时',
                minutes: '分',
                seconds: '秒',
                score: '分',
                noEndTime:'不限',
                examTimeTitle: "考试时间",
                examSummary: "考试介绍",
                bestScore: "最高分：",
                noBestScore:"未统计",
                historyScore: "历史成绩",
                viewAnalysis: "查看解析",
                toText: "至",
                examStatus: {
                    ended: "考试已结束",
                    disabled: "考试不可用",
                    goon: "继续考试",
                    'continue': "继续考试",
                    noRetryTimes: "无考试机会",
                    wait: "即将开始",
                    start: "开始考试",
                    retry1: "重新考试（剩",
                    retry2: "次机会）",
                    waitingPerusal:"待批改",
                    enrollNow: '立即报名' ,
                    //待审核
                    pendingAudit: '待审核',
                    //审核拒绝
                    rejectAudit: '审核拒绝',
                    //未报名
                    notEnroll: '未报名'
                },
                ranking: "排行榜",
                reason:"原因: "
            },
            end: {
                back: '< 返回',
                objectiveQuestionsTile: "客观题",
                score: "分",
                subjectQuestionTitle: "，主观题待批改",
                analysisTitle: "答案解析",
                testResult:"你的测试结果：",
                consuming: "考试用时",
                passingScore: "及格分数",
                totalScore: "总分",
                retryTitle2: "次）",
                retryTitle1: "再考一次（剩",
                hours: '小时',
                minutes: '分钟',
                seconds: '秒',
                examEndPage:'考试结果',
            },
            exception: {
                message: "<br/><span>如有问题请联系客服，给您带来不便请见谅。</span>",
                back: "< 返回",
                title: '考试异常页'
            },
            history: {
                historyScorePage: '历史成绩',
                involvementTimeTitle: '考试时间',
                totalScoreTitle: '总&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;分：',
                passScoreTitle: '及&nbsp;&nbsp;格&nbsp;分：',
                tryTimesTitle: '考试次数：',
                bestScoreTitle: '最&nbsp;&nbsp;高&nbsp;&nbsp;分：',
                questionNumTitle: '题&nbsp;&nbsp;&nbsp;量：',
                timeConsumingTitle: '考试用时',
                durationTitle: '考试时长：',
                viewAnalysisTitle: '查看解析',
                viewResult:'查看结果',
                isPassTitle: '是否通过',
                questionTitle: '题',
                passedTitle: '已通过',
                noPassTitle: '未通过',
                tableScoreHeaderTitle: '分数',
                scoreTitle: "分",
                hoursTitle: '小时',
                minutesTitle: '分钟',
                secondsTitle: '秒',
                noData: "暂无数据"
            },
            ranking: {
                rankingList: "排行榜",
                myRanking: "我的排名",
                ranking: '排名',
                user: "用户",
                costTime: '用时',
                bestScore: '最高分',
                loadMore: '点击加载更多排名...',
                loading: '加载中...',
                nodata: '快参加考试，冲上榜单吧！',
                hours: '小时',
                minutes: '分',
                seconds: '秒',
                position: "位",
                notAttend: "您尚未参加考试"
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
    }
};


i18n.offlineExam = {
    common: {
        back: '返回',
        download: '下载',
        examRecord: '考试记录',
        submitTime: '提交时间',
        yes: ' 是',
        no: '否',
        isnot:'无',
        view: '查看',
        systemError: '系统异常',
        confirmBtn: '确定',
        cancel: '取消',
        confirmCaption: '系统提示',
        wait:'即将开始',
        goOn:'继续',
        finished:'已结束',
        networkError:'网络出错，请稍后再试',
        prev:'上一页',
        next: '下一页',
        startTime: '练习时间_en'
    },
    detail: {
        title:'方法论详情',
        question: '题目',
        viewRequirement: '查看需求',
        subject: '科目',
        answerDurations: '作答时长：{{minutes}}分钟',
        timeLeft: '距离截止时间还有',
        originaldemand: '原始需求：',
        minutes: '分钟',
        reSubmit: '重新提交',
        startAnswer: '开始作答',
        reviewAnswer: '答案回顾',
        viewStanderAnswer: '标准答案查看',
        methodStanderAnwser: '方法论考试标准答案',
        openAnswerTime: '答案开放时间：{{startTime}}至{{endTime}}',
        timeTo: '',
        attachement: '附件：',
        submitPapers: '提交改卷',
        confirmPapers: '提交改卷确认',
        submitEndTime: '提交截止时间：{{subStartTime}}至{{subEndTime}}',
        notSubmitCorrecting: '不提交批改',
        submitCorrecting: '提交批改',
        submitAnswer: '答案提交',
        uploadIntro: '<li>请选择要导入的文件</li><li>支持 20MB 以内的 xls、xlsx、csv、doc、ppt、jpeg、jpg、png文件</li><li>对于xls、xlsx、csv格式整个文件不超过1万行、200列</li>',
        uploaded: '已上传：{{process}}',
        submitTime: '提交时间：',
        chooseFile: '选择文件',
        reUpload: '重新上传',
        uploading: '文件上传中......',
        answerPage: '- 作答页面',
        confimSubmitExam: '确定提交本次考试批改么？',
        giveUpExam: '确定放弃提交本次考试批改么？',
        alertTips1: '本次考试提交时间已截止，您不能再进行答案提交！',
        alertTips2: '本次考试时间已结束，您不能再进行答案提交！',
        alertTips3: '确定提交答案么？',
        alertTips4: '文件上传失败，请重新上传'
    },
    list: {
        title:'方法论列表',
        start: '开始：',
        end: '结束：',
        answerTime: '作答次数：<b>{{examChance}}</b>次',
        joinExam: '参加考试',
        noLimitTime:'不限时间',
        dayCycle:'每天循环',
        weekCycle:'每周循环',
        monthCycle:'每月循环',
        customTime:'自定义时间点',
        designExam:'设计方法论考试',
        other:'其他',
        customExam:'自定义考试',
        standerExam:'标准考试',
        designExercise:'设计方法论练习'

    },
    prepare: {
        title:'方法论准备',
        openTime: '开放时间',
        noLimitTime: '无限制时间',
        time: '{{startTime}}至{{endTime}}',
        intro: '说明',
        downloadAll: '下载全部',
        noLimitNum: '无限制次数',
        youHaveTime: '您还有&nbsp;<i>{{time}}</i>&nbsp;次<span>{{type}}</span>机会',
        noTime: '次数已用完',
        leftStart: '距离{{type}}开始： <span class="end-time">{{timer}}</span>',
        reExercise: '重新练习',
        down:'{{downName}}下载',
        exam:'考试',
        exercise:'练习',
        notTime:'未到',
        textTime:'时间',
        start:'开始'
    },
    score: {
        resultsIntro: '考试成绩说明',
        subAccount: '子科目',
        achievement: '成绩',
        comment: '点评',
        pass: '通过',
        noPass: '未通过',
        number: '序号',
        isSubmit: '是否提交批改',
        operation: '操作',
        reviewExam: '考试回顾',
        resultsDetail: '成绩详情'
    }
}