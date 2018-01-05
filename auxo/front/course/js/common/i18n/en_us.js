/*!
 * 课程组件语言包
 * common 公共类
 * courseComponent 课程详情页
 * videos 视频播放器组件
 * documents 文档播放器组件
 * @type {Object}
 */
var i18n = i18n||{};
i18n.courses= {
        frontPage: {
            evaluate: {
                newEvaluateLabel: '请对课程的满意度进行评价_en'
            }
        }
    };
i18n.courseComponent= {
    front: {
        //课程详细页面
        courseDetail: {
            homePage: '首页_en',
            courseList: '课程列表_en',
            courseComponent: '课程详情_en',
            evaluate: '评价_en',
            collection: '收藏_en',
            cancelCollection: '取消收藏_en',
            share: '分享_en',
            courseIntroduce: '课程介绍_en',
            courseIntroduceTh: '课程介绍:_en',
            catalog: '目录_en',
            exam: '考试_en',
            people: '人_en',
            courseStatus1: '即将开始报名_en',
            courseStatus2: '报名已结束_en',
            courseStatus3: '报名人数已满_en',
            courseStatus4: '待审核_en',
            courseStatus5: '重新报名_en',
            courseStatus6: '线下报名_en',
            courseStatus7: '即将开课_en',
            courseStatus8: '课程已结束_en',
            courseStatus9: '马上报名_en',
            courseStatus10: '剩余名额_en',
            courseStatus11: '开始于_en',
            courseStudents: '课程学友_en',
            startStudy: '开始学习_en',
            agStudy: '复习回顾_en',
            resumeStudy: '继续学习_en',
            d: '第_en',
            z: '章_en',
            j: '节_en',
            tip1: '暂无简介_en',
            tip2: '课程资源即将上线_en',
            tip3: '该课程暂无考试_en',
            tip4: '该课程下无学习资源！_en',
            tip5: '请先报名_en',
            tip6: '即将开始报名_en',
            tip7: '该课程报名已结束_en',
            tip8: '报名人数已满_en',
            tip9: '还未通过审核_en',
            tip10: '请重新报名_en',
            tip11: '请线下报名_en',
            tip12: '即将开课_en',
            tip13: '该课程已结束_en',
            tip14: '未登录_en',
            finish: '已完成_en',
            title: '课程详情_en',
            prev: '上一页_en',
            next: '下一页_en',
            page: '页_en',
            exam1: '次考试机会_en',
            exam2: '历史成绩_en',
            exam3: '总分_en',
            exam4: '分_en',
            exam5: '分过关_en',
            exam6: '时长_en',
            exam7: '分钟_en',
            exam8: '分_en',
            exam9: '开始_en',
            exam10: '即将开始_en',
            exam11: '结束_en',
            exam12: '开始考试_en',
            exam13: '重新考试_en',
            exam14: '继续考试_en',
            exam15: '要求完成课程_en',
            exam16: '学时不足_en',
            exam17: '已结束_en',
            exam18: '待批改_en',
            exam19: '无考试机会_en',
            alertTitle: '信息_en',
            sure: '确定_en',
            userSuit: '适合人群：_en'
        },
        learn: {
            back: '返回课程主页_en',
            title: '课程学习资源_en',
            prev: '上一个_en',
            next: '下一个_en',
            catalog: 'chapter_en',
            course: '课时_en',
            finishTip: {
                "nextCourse": "Next：",
                "learnAgain": "Learn Again",
                "next": "Next Course",
                "title1": "Congratulations on the completion of the course,",
                "title2": "s",
                "title3": "automatically switch to the next section.",
                "title4": "Congratulations on completion all of courses,",
                "title5": "auto hide prompt."
            }
        }
    }
};
// 视屏播放器
i18n.videos= {
        noFlashPluginMessage: '<p>如果您无法播放视频，请确认您是否安装Flash</p><p><a href="http://get.adobe.com/cn/flashplayer/" target="_blank">点击下载</a>安装最新Flash Player播放器</p>_en',
        videoText: '视频_en',
        audioText: '音频_en',
        resourceStatusEncodingMessage: '抱歉，当前{{videoType}}未转码完成，请稍候再观看。_en',
        resourceStatusReadyMessage: '{{videoType}}：已就绪_en',
        resourceStatusExpiredMessage: '抱歉，当前{{videoType}}已下线，无法观看。_en',
        resourceStatusDeleteMessage: '抱歉，当前{{videoType}}已删除，无法观看。_en',
        resourceStatusDefaultMessage: '抱歉，{{videoType}}加载失败，错误码：_en',
        resourceLoadFailMessage: '抱歉，视频加载失败，错误码：_en',
        play: '播放_en',
        pause: '暂停_en',
        replay: '重播_en',
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
        rapidly: '极速_en',
        rightAnswerTitle: '恭喜你答对了_en',
        examinationQuestions: '检测题_en',
        continuePlay: '继续播放_en',
        reAnswer: '重新作答_en',
        question: '题_en',
        total: '共_en',
        hasAnswered: '已作答_en',
        failAnswerTitle: '很遗憾你答错了，请继续作答_en',
        fastreverse: '后退15秒_en',
        scale: '画面比例_en',
        chinese: '中文_en',
        english: '英文_en',
        japanese: '日文_en'
    };
// 文档播放器
i18n.documents= {
    main: {
        reload: '点击重载_en'
    },
    thumbanail: {
        noThumbanail: '该文档暂无缩略图_en'
    },
    message: {
        message: '抱歉，出了点小问题！_en',
        loadingTitle: '加载中...    _en',
        failTitle1: '文档加载失败，请_en',
        failTitle2: '刷新_en',
        failTitle3: '页面重新加载_en'
    },
    content: {
        top: '上_en',
        bottom: '下_en',
        left: '左_en',
        right: '右_en',
        loading: '加载中.._en.'
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
};

i18n.learn={
    prev: '上一个_en',
    next: '下一个_en',
    pageTitle: '章节列表-章节学习_en',
    chapter: 'chapter_en',
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
    noQuestionTitle: '在课程学习时遇到任何问题都可以随时提问哦~_en',
    noContentLabel: '好记性不如烂笔头_en',
    publishNote: '发表笔记_en',
    note: '笔记_en',
    //我的笔记
    myNote: 'Current Note',
    //所有笔记
    allNote: 'All Note',
    //在此写下您的笔记
    writeDownNote:'Write down your note here.',
    //没有相关笔记
    noRelatedNote:'No related notes',
    //编辑
    noteEdit:'Edit',
    //保存
    noteSave:'Save',
    //马上添加
    addNote:'Add',
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
        answercard: '答题卡_en',
        score: '成绩_en',
        guid: '练习说明_en',
        prevQuestion: '上一题_en',
        nextQuestion: '下一题_en',
        redAnswerErrorQuestion: '错题重做_en',
        commit: '提交练习_en'
    }
};
i18n.mobileDownload= {
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
        easyAsyncText: '学习记录云同步，不同设备间学习数据共享_en',
        //下载
        download: '下载-{{projectTitle}}_en'
    }
};
i18n.searchList={
    frontPage: {
        //搜索结果
        pageTitle: '搜索结果_en',
        //请输入关键词
        keyWord: '请输入关键词_en',
        //全部
        all: '全部_en',
        //职位规划
        job: '职位规划_en',
        //培训认证
        train: '培训认证_en',
        //公开课
        singleCourse: '公开课_en',
        //更多职位规划
        moreJobs: '更多职位规划_en',
        //更多培训认证
        moreTrains: '更多培训认证_en',
        //更多公开课
        moreSingleCourse: '更多公开课_en',
        //搜索
        search: '搜索_en',
        //门课程
        _courses: '门课程_en',
        //学时
        _hours: '学时_en',
        //个考试
        _exams: '个考试_en',
        //暂无“<span data-bind='text:model.filter.title()'></span>”相关内容
        _nodata: '暂无“{{filter}}”相关内容_en'
    }
};
i18n.testAdd={
    frontPage: {
        //网龙网络公司
        nd: '网龙网络公司_en',
        //为您推送最前沿、最有料的学习资讯
        htmlText1: '为您推送最前沿、<br/>最有料的学习资讯_en',
        htmlText2: '闽ICP B2-20050038_en',
        //公开课列表
        openCoursesList: '公开课列表_en'
    }
};
