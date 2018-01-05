/*!
 * 课程组件语言包
 * common 公共类
 * courseComponent 课程详情页
 * videos 视频播放器组件
 * documents 文档播放器组件
 * @type {Object}
 */
var i18n = i18n || {};
i18n.courses = {
    frontPage: {
        evaluate: {
            newEvaluateLabel: '请对课程的满意度进行评价'
        }
    }
};
i18n.courseComponent = {
    front: {
        //课程详细页面
        courseDetail: {
            pk: 'PK',
            broadcastTime: '开播时间：',
            notStart: "未开始",
            playback: '回放',
            courseDuration: "课程时长：",
            liveBroadcast: '进入直播',
            broadcasting: '正在直播',
            freeTrial: '免费体验',
            //第几章
            ChapterFormat: '第{{index}}章',
            //第几节
            SectionFormat: '第{{index}}节',
            homePage: '首页',
            courseList: '课程列表',
            courseComponent: '课程详情',
            evaluate: '评价',
            note: '笔记',
            collection: '收藏',
            cancelCollection: '取消收藏',
            collectionFail: '失败，请重试!',
            share: '分享',
            courseIntroduce: '简介',
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
            courseStatus12: '解锁课程',
            courseStatus13: '未登录',
            courseStudents: '课程学友',
            noClassmate: "还没有同学，赶紧先开始学习吧",
            noStudents: '暂无同学',
            preCourse: '先修课程',
            startStudy: '开始学习',
            agStudy: '复习回顾',
            resumeStudy: '继续学习',
            d: '第',
            z: '章',
            j: '节',
            tip1: '暂无简介',
            tip2: '课程资源即将上线',
            tip3: '该课程暂无考试',
            tip4: '该课程下无学习资源！',
            tip5: '请先报名',
            tip6: '即将开始报名',
            tip7: '该课程报名已结束',
            tip8: '报名人数已满',
            tip9: '还未通过审核',
            tip10: '请重新报名',
            tip11: '请线下报名',
            tip12: '即将开课',
            tip13: '该课程已结束',
            tip15: '请先解锁课程',
            tip14: '未登录',
            tip16: '请先购买',
            finish: '已完成',
            title: '课程详情',
            prev: '上一页',
            next: '下一页',
            page: '页',
            question: '题',
            exam1: '次考试机会',
            exam2: '历史成绩',
            examListTwo: '总分{{totalScore}}分（{{passingScore}}分过关）',
            // exam3: '总分',
            // exam4: '分',
            // exam5: '分过关',
            exam6: '时长',
            exam7: '分钟',
            exam8: '{{resultScore}}分',
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
            cancel: '取消',
            userSuit: '适合人群：',
            userNoExit: '该用户信息已不存在',
            chapterUnlock: '章节解锁条件：',
            UnlockTip1: '顺序完成学习或使用兑换券进行章节解锁',
            courseUnlock: '课程解锁条件：',
            UnlockTip2: '完成先修课程或使用兑换券后方可解锁本课程',
            UnlockTip3: '完成先修课程且使用兑换券后方可解锁本课程',
            UnlockTip4: '使用兑换券后方可解锁本课程',
            completed: '已完成',
            noPass: '未通过',
            passed: '已通过',
            enrollTime: "报名时间：",
            courseEffectiveTime: "学习有效时间："
        },
        learn: {
            question_title_err: '请填写标题',
            buyTip: '请报名后学习完整内容，报名后能在移动端记录和同步课程记录和学习进度，使用答疑功能',
            expTip: '请报名后学习完整内容',
            back: '返回课程主页',
            title: '课程学习资源',
            prev: '上一个',
            next: '下一个',
            catalog: '章',
            course: '课时',
            clickView: '点击查看',
            //您已完成本课程的
            completedTip: '您已完成本课程的',
            //暂不支持此资源
            resourceNotSupportYet: '暂不支持此资源',
            expProcessTip: '报名后学习完整内容，获得更多功能体验',
            completed: '已完成',
            noAttachment: '暂 无 附 件',
            finishTip: {
                "nextCourse": "下节课程：",
                "learnAgain": "再学一遍",
                "next": "下一课程",
                "title1": "恭喜学完该课程，",
                "title2": "秒",
                "title3": "后自动切换到下一节课程",
                "title4": "恭喜学完全部课程",
                "title5": "后自动关闭提示",
                "title6": "恭喜学完该任务"
            }
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
        confirmPreTrainOrCoin: "1、完成先修课程学习<br>2、使用兑换券直接解锁",
        confirmPreTrainAndCoin: "<p class='dialog-tl'>请完成先修课程</p><p class='lh2'>《<span class='pre-course-hint' title='{{preCourse}}'>{{preCourse}}</span>》</p><p class='dialog-tl'>{{moreThanOne}}的学习，才能使用兑换券进行解锁！</p>",
        AlreadyPreTrain: "您已完成先修课程<br/>需使用兑换券才能解锁",
        hint: '提示',
        noneOfPreTrainOrCoin: "1、请完成先修课程学习，<br/>2、才能使用兑换券进行解锁",
        unlockPreTrainFirst: "请先解锁课程",

        useCoin: "使用兑换券",
        confirmUsing: "确认兑换",
        checkMyCoins: "查看我的兑换券",
        availbleCoins: "可使用兑换券",
        useTheseWays: "可通过以下方式解锁",
        noCoupon: "暂无可用兑换券",
        systemInfo: "系统提示",

        unlockChapterFirst: "请先完成上一课件学习",
        unlockChapterTwoWays: "须学习完上一课件才能解锁<br>或者您可使用兑换券解锁"
    }
};
// 视屏播放器
i18n.videos = {
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
    replay: '重播',
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
    fastreverse: '后退15秒',
    scale: '画面比例',
    chinese: '中文',
    english: '英文',
    japanese: '日文'
};
// 文档播放器
i18n.documents = {
    main: {
        reload: '点击重载'
    },
    thumbanail: {
        noThumbanail: '该文档暂无缩略图'
    },
    message: {
        message: '抱歉，出了点小问题！',
        loadingTitle: '    加载中...    ',
        failTitle1: '文档加载失败，请',
        failTitle2: '刷新',
        failTitle3: '页面重新加载'
    },
    content: {
        top: '上',
        bottom: '下',
        left: '左',
        right: '右',
        loading: '加载中...'
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
};
i18n.learn = {
    prev: '上一个',
    next: '下一个',
    pageTitle: '章节列表-章节学习',
    chapter: 'chapter',
    backToCoursePage: '返回课程主页',
    keywordPlaceHolder: '请输入答疑关键字...',
    myQuestion: '我的问题',
    commonQuestion: '常见问题',
    allQuestion: '全部问题',
    //我要提问
    asks: '我要提问',
    'new': '最新',
    //问题详情
    questionDetail: '问题详情',
    questionDetailOption: '问题详细(可选)：',
    from: '来自：',
    answers: '回答',
    editQuestion: '编辑问题',
    question: '问题',
    questionDetailInfo: '问题详细信息...',
    writeQuestionLabel: '在此写下您的问题...',
    quiz: '马上提问',
    totalQuestions: '共<em>{{QuizTotalCount}}</em>个问题',
    totalNote: '共 <em>{{NoteTotalCount}}</em> 个笔记',
    findTotal: '找到 <em>{{FindTotalCount}} 条问题',
    notFoundText1: '在课程学习时遇到任何问题',
    notFoundText2: '都可以随时提问哦',
    viewMore: '查看更多',
    goback: '返回',
    findQuestionTmpl: '找到{{QuizTotalCount}}条问题',
    noKeyWordTitle: '抱歉，没有\“{{OldKeyWord}}\”的相关答疑',
    noQuestion: '暂无常见问题',
    noQuestionTitle: '在课程学习时遇到任何问题<br/>都可以随时提问哦~',
    noContentLabel: '好记性不如烂笔头',
    publishNote: '发表笔记',
    note: '笔记',
    showAll: '显示全部',
    deleteNote: '删除',
    updateNote: '修改',
    cancelNote: '取消',
    saveNote: '确认',
    notFoundText3: '学习过程中遇到的问题<br/>可以在这里提问！',
    catalogPanel: '目录',
    quizpanel: '答疑',
    notepanel: '笔记',
    //我的笔记
    myNote: '我的笔记',
    //全部笔记
    allNote: '全部笔记',
    //在此写下您的笔记
    writeDownNote: '在此写下您的笔记...',
    //没有相关笔记
    noRelatedNote: '没有相关笔记',
    //编辑
    noteEdit: '编辑',
    //添加笔记
    noteAdd: '添加',
    collapse: '[收起]',
    showAll2: '[显示全部]',
    charLimit: '请输入有效的字符 [1-400]',
    noMore: '没有更多了',

    exercise: {
        answercard: '答题卡',
        score: '成绩',
        guid: '练习说明',
        prevQuestion: '上一题',
        nextQuestion: '下一题',
        redAnswerErrorQuestion: '错题重做',
        commit: '提交练习'
    },
    qa: {
        reply: '回复',
        noReply: '暂无回复',
        iWantReply: '我要回答该问题',
        inputContent: '请输入回答内容',
        submit: '提交',
        confirm: '确认',
        cancel: '取消',
        contentMustNotBeEmpty: '内容不能为空',
        noMoreThanHundred: '不能超过100字',
        loading: '加载中...',
        loaded: '数据加载完毕',
        noMoreData: '没有更多数据',
        sureToDelete: '是否要删除回复？',
        systemInfo: '系统提示',
    }
};
i18n.mobileDownload = {
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
        download: '下载-{{projectTitle}}'
    }
};
i18n.note = {
    "addNote": "添加笔记",
    "mine": "我的笔记",
    "all": "全部笔记",
    "excerpt": "摘录",
    "report": "举报",
    "total": "共",
    "notes": "篇笔记",
    "placeholder": "在此写下您的笔记...",
    "isOpen": "公开笔记",
    "cancel": "取消",
    "save": "保存",
    "noNote": "暂时没有笔记",
    "fromExcerpt": "来自摘录",
    "tips": "提示",
    "confirm": "确定删除此篇笔记吗？",
    "sure": "确定",
    "reported": "被举报"
};
