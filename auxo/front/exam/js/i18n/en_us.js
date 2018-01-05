var i18n = i18n ? i18n : {};

i18n['en_us'] = {
    learning: {
        common: {
            store: {
                mergeAnswerTitle: "Local answers have not been saved yet. Do you want to merge them with the server answers?",
                mergeBtn: "Merge",
                ignoreBtn: "Ignore"
            },
            judge: {
                right:"correct",
                error:"worng"
            },
            blankFilling:{
                maxWordsLength:'max. 250 words!'
            },
            subjective: {
                attachement: "Attachement:",
                uploadTitle: "(Allows upload picture files, the maximum does not exceed 10MB)",
                uploadingText: "uploading:",
                downloadAttachement: "click to download",
                selectFileText: "select file...",
                fileLimitSize: "file limit size",
                sureBtn: "sure"
            },
            loading: {
                text: 'loading'
            },
            updater:{
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
                noAnswer:'N/A:'
            },
            option: {
                answerTitle: 'This option is the reference answer'
            },
            questionOption: {
                answerTitle: 'This option is the reference answer'
            },
            question: {
                temporarilyUncertain: 'Temporarily Uncertain',
                cancelTemporarilyUncertain: "Cancel Mark",
                rightAnswerLabel: 'Correct Answer',
                answerRightTitle: 'Your\'s answer is right.',
                subjectiveUserAnswer: 'Subjective question user answer',
                questionExplanation: 'Subject explanation',
                questionsExplanation: 'A set of questions',
                notScore: '\t(no score)',
                score: 'score',
                analysisTitle: '<N/A>',
                notAnswer: 'You did not answer',
                subQuestionUserTitle: 'You are wrong to',
                singleChoice: 'Single-Choice',
                multipleChoice: 'Multi-Choice',
                indefiniteChoice: 'Indefinite-Choice',
                completion: 'Blank-Filling',
                subjectivity: 'Open-Question',
                judgment: 'True/False',
                matching: 'Matching',
                complex: 'Complex'
            },
            navigation: "Navigator",
            pullUp: "PULL UP",
            expand: "EXPAND",
            prev: "<i></i>Prev",
            next: "<i></i>Next",
            submit: "Submit"
        },
        exam: {
            answer: {
                sure: 'Commit',
                retry: 'retry',
                explanation: 'Explanation',
                msg1: "You have answered all questions. Confirm to submit?",
                msg2: "You have answered {{doneCount}} questions. {{noAnswerCount}} question(s) is(are) left. Confirm to submit?",
                msg3: "You hae answered {{doneCount}} questions. {{noAnswerCount}} question(s) is(are) left. Do not allowed to submit!",
                commitExam: 'Commit',
                commitFail: 'Commit Fail',
                continueAnswer: 'Cancel',
                examFinishTitle: "Time out, can not continue to answer",
                confirmCaption: "System Tip"
            },
            header: {
                residualTime: 'residual time',
                saveTitle: 'save answer',
                save: 'Save'
            },
            parts:{
                buttonTitle: 'click to switch'
            },
            prepare: {
                back: '< back',
                question: 'Questions',
                totalScore: 'Full marks',
                pass: 'Pass',
                minute: 'Minutes',
                caution: 'Caution',
                timeHint: 'The end of the distance test:',
                examStartTime: "Time left: ",
                cautionItem1: '1. Exam can not be interrupted after starting. Please notice the countdown at the top-right.',
                cautionItem2: '2.When you finish paper, please click "Submit" button to hand your answers.',
                examFinishTitle: 'Exam has been Finished',
                examEndTitle: 'Time left : ',
                examStartTitle: 'From the start of the examination and:',
                examStartedTitle: 'The exam left: ',
                examFinished: 'Time out, can not continue to answer',
                commit: 'commit',
                sureBtn: "Ok",
                confirmCaption: "System Tip",

                hours: ' h ',
                minutes: ' m ',
                seconds: ' s',
                score: ' score',
                noEndTime: ' infinite ',
                examTimeTitle: "Exam Time:",
                examSummary: "Summary:",
                bestScore: "Best Score :  ",
                noBestScore:"No data",
                historyScore: "History Score",
                viewAnalysis: "Analysis",
                toText: " To ",
                examStatus: {
                    ended: "Exam Ended",
                    disabled: "Exam Disabled",
                    goon: "Continue",
                    'continue': "Continue",
                    noRetryTimes: "No Try Times",
                    wait: "Wait",
                    start: "Start",
                    retry1: "Retry (Left: ",
                    retry2: " Times)",
                    waitingPerusal:"Waiting perusal",
                    enrollNow: 'Enroll now' ,
                    //待审核
                    pendingAudit: 'Unconfirmed',
                    //审核拒绝
                    rejectAudit: 'Rejected',
                    notEnroll:'Not Enroll'
                },
                ranking: "Leaderboard",
                reason:"Tips: "
            },
            end: {
                back: '< back',
                objectiveQuestionsTile: " Objective ",
                score: " score ",
                subjectQuestionTitle: "，Subjective wait for correcting",
                analysisTitle: "Analysis",
                testResult:"Your test result:：",
                consuming: "exam consuming",
                passingScore: "passing score",
                totalScore: "total score",
                retryTitle2: " Times)",
                retryTitle1: "Retry (Left: ",
                hours: ' hours',
                minutes: ' minutes ',
                seconds: ' seconds ',
                examEndPage:'Exam Result',
                ranking: "Leaderboard"
            },
            exception: {
                message: "<br/><span>If you have any questions please contact customer service, to bring you the same please forgive me.</span>",
                back: "< back",
                title: 'Exam exception'
            },
            history: {
                historyScorePage: 'History Score',
                involvementTimeTitle: 'Involvement Time',
                totalScoreTitle: 'Total Score:',
                passScoreTitle: 'Pass Score:',
                tryTimesTitle: 'Exam Chance:',
                bestScoreTitle: 'Best Score:',
                questionNumTitle: 'Question Num:',
                timeConsumingTitle: 'Time Consuming',
                durationTitle: 'Duration:',
                viewAnalysisTitle: 'View Analysis',
                viewResult:'Check Result',
                isPassTitle: 'Passed',
                questionTitle: '',
                passedTitle: 'Passed',
                noPassTitle: 'No Pass',
                tableScoreHeaderTitle: 'Score',
                scoreTitle: "Score",
                hoursTitle: ' hour ',
                minutesTitle: ' minue ',
                secondsTitle: ' second ',
                noData: "No Data"
            },
            ranking: {
                myRanking: "My Ranking",
                rankingList: "Ranking List",
                ranking: 'Ranking',
                user: "User Name",
                costTime: 'Cost Time',
                bestScore: 'Best Score',
                loadMore: 'Load More...',
                loading: 'Loading...',
                nodata: 'No Data',
                hours: ' hour ',
                minutes: ' minute ',
                seconds: ' second ',
                position: "",
                notAttend: "not attend"
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
                answerAllCommitTitle: "You have answered all questions. Confirm to submit?",
                sure: 'sure',
                cancel: 'cancel',
                partialFinishCommitTitle: "You have answered {{doneCount}} questions. {{noAnswer}} question(s) is(are) left. Confirm to submit?",
            },
            prepare: {
                totalQuestion: 'total {{totalCount}} question',
                startAnswer: 'Start',
                bestScoreCaption: 'best score:',
                right: 'right',
                question: 'question',
                error: 'error',
                noAnswer:'don\'t answer',
                accuracy: 'accuracy'
            }
        }
    }
};


i18n.offlineExam = {
    common: {
        back: '返回_en',
        download: '下载_en',
        examRecord: '考试记录_en',
        submitTime: '提交时间_en',
        yes: ' 是_en',
        no: '否_en',
        isnot: '无_en',
        view: '查看_en',
        systemError: '系统异常_en',
        confirmBtn: '确定_en',
        cancel: '取消_en',
        confirmCaption: '系统提示_en',
        wait: '即将开始_en',
        goOn: '继续_en',
        finished: '已结束_en',
        networkError: '网络出错，请稍后再试_en',
        prev: '上一页_en',
        next: '下一页_en',
        startTime: '练习时间_en'
    },
    detail: {
        title: '方法论详情_en',
        question: '题目_en',
        viewRequirement: '查看需求_en',
        subject: '科目_en',
        answerDurations: '作答时长：{{minutes}}分钟_en',
        timeLeft: '距离截止时间还有_en',
        originaldemand: '原始需求：_en',
        minutes: '分钟_en',
        reSubmit: '重新提交_en',
        startAnswer: '开始作答_en',
        reviewAnswer: '答案回顾_en',
        viewStanderAnswer: '标准答案查看_en',
        methodStanderAnwser: '方法论考试标准答案_en',
        openAnswerTime: '答案开放时间：{{startTime}}至{{endTime}}_en',
        timeTo: '_en',
        attachement: '附件：_en',
        submitPapers: '提交改卷_en',
        confirmPapers: '提交改卷确认_en',
        submitEndTime: '提交截止时间：{{subStartTime}}至{{subEndTime}}_en',
        notSubmitCorrecting: '不提交批改_en',
        submitCorrecting: '提交批改_en',
        submitAnswer: '答案提交_en',
        uploadIntro: '<li>请选择要导入的文件</li><li>支持 20MB 以内的 xls、xlsx、csv、doc、ppt、jpeg、jpg、png文件</li><li>对于xls、xlsx、csv格式整个文件不超过1万行、200列</li>_en',
        uploaded: '已上传：{{process}}_en',
        submitTime: '提交时间：_en',
        chooseFile: '选择文件_en',
        reUpload: '重新上传_en',
        uploading: '文件上传中......_en',
        answerPage: '- 作答页面_en',
        confimSubmitExam: '确定提交本次考试批改么？_en',
        giveUpExam: '确定放弃提交本次考试批改么？_en',
        alertTips1: '本次考试提交时间已截止，您不能再进行答案提交！_en',
        alertTips2: '本次考试时间已结束，您不能再进行答案提交！_en',
        alertTips3: '确定提交答案么？_en',
        alertTips4: '文件上传失败，请重新上传_en'
    },
    list: {
        title: '方法论列表_en',
        start: '开始：_en',
        end: '结束：_en',
        answerTime: '作答次数：<b>{{examChance}}</b>次_en',
        joinExam: '参加考试_en',
        noLimitTime: '不限时间_en',
        dayCycle: '每天循环_en',
        weekCycle: '每周循环_en',
        monthCycle: '每月循环_en',
        customTime: '自定义时间点_en',
        designExam: '设计方法论考试_en',
        other: '其他_en',
        customExam: '自定义考试_en',
        standerExam: '标准考试_en',
        designExercise: '设计方法论练习_en'

    },
    prepare: {
        title: '方法论准备_en',
        openTime: '开放时间_en',
        noLimitTime: '无限制时间_en',
        time: '{{startTime}}至{{endTime}}_en',
        intro: '说明_en',
        downloadAll: '下载全部_en',
        noLimitNum: '无限制次数_en',
        youHaveTime: '您还有&nbsp;<i>{{time}}</i>&nbsp;次<span>{{type}}</span>机会_en',
        noTime: '次数已用完_en',
        leftStart: '距离{{type}}开始： <span class="end-time">{{timer}}</span>_en',
        reExercise: '重新练习_en',
        down: '{{downName}}下载_en',
        exam: '考试_en',
        exercise: '练习_en',
        notTime: '未到_en',
        textTime: '时间_en',
        start:'开始_en'
    },
    score: {
        resultsIntro: '考试成绩说明_en',
        subAccount: '子科目_en',
        achievement: '成绩_en',
        comment: '点评_en',
        pass: '通过_en',
        noPass: '未通过_en',
        number: '序号_en',
        isSubmit: '是否提交批改_en',
        operation: '操作_en',
        reviewExam: '考试回顾_en',
        resultsDetail: '成绩详情_en'
    }
}