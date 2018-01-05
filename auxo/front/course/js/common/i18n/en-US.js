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
            newEvaluateLabel: 'Please rate the course.'
        }
    }
};
i18n.courseComponent = {
    front: {
        //课程详细页面
        courseDetail: {
            pk: 'PK',
            broadcastTime: 'Start Time:',
            notStart: "No Start",
            playback: 'Playback',
            courseDuration: "Duration:",
            liveBroadcast: 'Into Broadcase',
            broadcasting: 'BroadCasing',
            freeTrial: 'Free Trial',
            //第几章
            ChapterFormat: 'Chapter {{index}}',
            //第几节
            SectionFormat: 'Section {{index}}',
            //首页
            homePage: 'Home',
            //课程列表
            courseList: 'Course List',
            //课程详情
            courseComponent: 'Course Detail',
            //评价
            evaluate: 'Reviews',
            note: 'Notes',
            //收藏
            collection: 'Favorite',
            cancelCollection: 'Cancel Favorite',
            collectionFail: 'Failure, try again!',
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
            courseStatus1: 'Enroll not started',
            //报名已结束
            courseStatus2: 'Enroll ended',
            //报名人数已满
            courseStatus3: 'The class is full',
            //待审核
            courseStatus4: 'Wait for Audit',
            //重新报名
            courseStatus5: 'Sign up again',
            //线下报名
            courseStatus6: 'Enroll Offline',
            //即将开课
            courseStatus7: 'Class will begin',
            //课程已结束
            courseStatus8: 'Ended',
            //马上报名
            courseStatus9: 'Enroll now',
            //剩余名额
            courseStatus10: 'Remaining',
            //开始于
            courseStatus11: 'Started',
            //解锁课程
            courseStatus12: 'Unclock Course',
            //未登录
            courseStatus13: 'Login first',
            //课程学友
            courseStudents: 'Classmate',
            //暂无同学
            noClassmate: 'No Classmate',
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
            //请先购买
            tip16: "please buy first",
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
            //题
            question: 'Question',
            //次考试机会
            exam1: 'exam chances',
            //历史成绩
            exam2: 'History Record',
            //总分
            examListTwo: '{{totalScore}}points（{{passingScore}} to pass）',
            // exam3: 'Total Score',
            // //分
            // exam4: 'points',
            // //分过关
            // exam5: 'to pass',
            // //时长
            exam6: 'Duration',
            //分钟
            exam7: 'minutes',
            //分
            exam8: '{{resultScore}}',
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
            //取消
            cancel: 'Cancel',
            //适合人群：
            userSuit: 'Recommended: ',
            //该用户信息已不存在
            userNoExit: 'The user information does not exist',
            chapterUnlock: 'Chapter unlocking conditions:',
            UnlockTip1: 'Study in order or use voucher to unlock the chapter.',
            courseUnlock: 'Course unlocking conditions:',
            UnlockTip2: 'Complete Pre-course or use voucher to unlock the course.',
            UnlockTip3: 'Complete Pre-course use voucher to unlock the course.',
            UnlockTip4: 'Use voucher to unlock the course.',
            completed: 'Finished',
            noPass: 'no pass',
            passed: 'passed',
            enrollTime: "Enroll Time:",
            courseEffectiveTime: "Effective Time of Study:"
        },
        learn: {
            question_title_err: 'Please input title',
            buyTip: 'Please register to learn the complete content, registration in the mobile terminal after the record and synchronization of course records and learning progress, the use of Q & A',
            expTip: 'Please complete the registration learning content',
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
            course: 'Course Hour',
            //点击查看
            clickView: 'Click to view',
            //您已完成本课程的
            completedTip: 'You have completed ',
            //暂不支持此资源
            resourceNotSupportYet: 'The resource is not yet supported.',
            expProcessTip: 'After registration to learn the complete content, access to more functional experience',
            completed: 'Completed',
            noAttachment: 'No Attachment',
            finishTip: {
                "nextCourse": "Next Course:",
                "learnAgain": "Learn Again",
                "next": "Next Course",
                "title1": "Current course has been finished,",
                "title2": "s",
                "title3": "automatically switch to the next section.",
                "title4": "All of courses has been completion",
                "title5": "auto hide prompt.",
                "title6": "Current course has been finished."
            }
        }
    },
    coin: {
        availbleTime: "Duration: <em>{{startTime}}</em> to <em>{{endTime}}</em>",
        notUse: "Available",
        used: "Used",
        invalid: "Expired",
        //Confirm
        confirm: 'Confirm',
        cancel: 'Cancel',
        aware: 'I See',

        confirmUseCoin: "Please confirm using voucher",
        confirmPreTrainOrCoin: "1、Complete the pre-courses<br>2、Use a voucher to unlock",
        confirmPreTrainAndCoin: "<p class='dialog-tl'>Complete the pre-courses</p><p class='lh2'>《<span class='pre-course-hint' title='{{preCourse}}'>{{preCourse}}</span>》</p><p class='dialog-tl'>then use a voucher to unlock!</p>",
        AlreadyPreTrain: "You have already completed the pre-courses<br/>please use a voucher to unlock",
        hint: 'Tip',
        noneOfPreTrainOrCoin: "1、Complete the pre-courses<br/>2、Use a voucher to unlock",
        unlockPreTrainFirst: "Please unlock the courses, first",

        useCoin: "Use Voucher",
        confirmUsing: "Confirm",
        checkMyCoins: "View My Vouchers",
        availbleCoins: "Availble Vouchers",
        useTheseWays: "Availble Ways",
        noCoupon: "No Voucher Available",
        systemInfo: "System Info",
        unlockChapterFirst: "Please complete the previous resource, first.",
        unlockChapterTwoWays: "Complete the previous resource or use a voucher to unlock."
    }
};
// 视屏播放器
i18n.videos = {
    noFlashPluginMessage: '<p>If you fail to play the video，please check if you have installed Flash player</p><p><a href="http://get.adobe.com/cn/flashplayer/" target="_blank"> Click to download</a> install latest Flash Player</p>',
    //视频
    videoText: 'video',
    //音频'
    audioText: 'Audio',
    //抱歉，当前{{videoType}}未转码完成，请稍候再观看。'
    resourceStatusEncodingMessage: 'Sorry! {{videoType}} has not finished transcoding. Please watch later.',
    //{{videoType}}：已就绪'
    resourceStatusReadyMessage: '{{videoType}}:Ready',
    //抱歉，当前{{videoType}}已下线，无法观看。'
    resourceStatusExpiredMessage: 'Sorry! Failed to watch. {{videoType}} is offline.',
    //抱歉，当前{{videoType}}已删除，无法观看。'
    resourceStatusDeleteMessage: 'Failed to watch. {{videoType}} has been deleted.',
    //抱歉，{{videoType}}加载失败，错误码：'
    resourceStatusDefaultMessage: 'Failed to load {{videoType}}. Error code:',
    //抱歉，视频加载失败，错误码：'
    resourceLoadFailMessage: 'Failed to load video. Error code:',
    //播放'
    play: 'Play',
    //暂停'
    pause: 'Pause',
    //重播'
    replay: 'Replay',
    //音量'
    volume: 'Volume',
    //设置'
    preference: 'Settings',
    //全屏'
    fullscreen: 'full Screen',
    //退出全屏幕'
    exitFullscreen: 'Exit Full Screen',
    //满屏'
    coveredTheEntireScreen: 'Full Screen',
    //广告'
    ad: 'Advertisement',
    //秒'
    second: ' seconds',
    //确定'
    sure: 'Confirm',
    //取消'
    cancel: 'Cancel',
    //语言'
    language: 'Language',
    //字幕'
    subtitles: 'Subtitle',
    //画质'
    quality: 'Definition',
    //自动'
    auto: 'Auto',
    //不可选'
    notAvailable: 'Unavailable',
    //不使用'
    noUseed: 'Disable',
    //超清'
    ultimateHD: 'Ultra',
    //高清'
    hd: 'High',
    //标清'
    sd: 'Standard',
    //流畅'
    smooth: 'Fluent',
    //极速'
    rapidly: 'Speedy',
    //恭喜你答对了'
    rightAnswerTitle: 'Your answer is right!',
    //检测题'
    examinationQuestions: 'Test Question',
    //继续播放'
    continuePlay: 'Continue',
    //重新作答'
    reAnswer: 'Start over',
    //题'
    question: 'Question',
    //共'
    total: 'In total',
    //已作答'
    hasAnswered: 'have been answered',
    //很遗憾你答错了，请继续作答'
    failAnswerTitle: 'Your answer is wrong. Please continue',
    //后退15秒'
    fastreverse: 'Retreat 15 seconds',
    //画面比例'
    scale: 'Ratio:',
    //中文'
    chinese: 'Chinese',
    //英文'
    english: 'English',
    //日文
    japanese: 'Japanese'
};
// 文档播放器
i18n.documents = {
    main: {
        reload: 'Tap to reload'
    },
    thumbanail: {
        noThumbanail: 'This file has no thumbnail.'
    },
    message: {
        message: 'An error happened!',
        loadingTitle: 'Loading…',
        failTitle1: 'Failed to load. Please',
        failTitle2: 'refresh',
        failTitle3: 'the page to reload.'
    },
    content: {
        top: 'Up',
        bottom: 'Down',
        left: 'Left',
        right: 'Right',
        loading: 'Loading…'
    },
    bar: {
        //缩略图
        thumbanail: 'Thumbnail',
        //拖拽
        drag: 'Drag',
        //选词
        choiceWord: 'Word Selection',
        //拖拽模式
        dragMode: 'Drag Mode',
        //划词模式
        zonedWrodMode: 'Word Selection Mode',
        //上次看到这里，点击回首页
        returnTopPage: 'You were here. Tap to return to home page.',
        //上一页
        prevPage: 'Previous',
        //下一页
        nextPage: 'Next',
        //上一屏
        prevScreen: 'Previous',
        //下一屏
        nextScreen: 'Next',
        //缩小
        narrow: 'Zoom Out',
        //放大
        enlarge: 'Zoom In',
        //全屏
        fullscreen: 'Full Screen',
        //退出全屏_e
        exitfullscreen: 'Exit Full Screen'
    }
};
i18n.learn = {
    //上一个
    prev: 'Previous',
    //下一个
    next: 'Next',
    //章节列表-章节学习
    pageTitle: 'Chapter List - Chapter Learning',
    //chapter
    chapter: 'chapter',
    //返回课程主页
    backToCoursePage: 'Home page',
    //请输入答疑关键字...
    keywordPlaceHolder: 'Please enter the key word.',
    //我的问题
    myQuestion: 'Mine',
    //常见问题
    commonQuestion: 'FAQ',
    //全部问题
    allQuestion: 'All Questions',
    //我要提问
    asks: 'Asks',
    'new': 'New',
    //问题详情
    questionDetail: 'Question details',
    questionDetailOption: 'Question details(option)：',
    from: 'From：',
    answers: 'Answers',
    editQuestion: 'EditQuestion',
    question: 'Question',
    questionDetailInfo: 'question Detail Information...',
    //在此写下您的问题...
    writeQuestionLabel: 'Please enter your question.',
    //马上提问
    quiz: 'Ask Now',
    //共<em>{{QuizTotalCount}}</em>个问题
    totalQuestions: 'Total:<em>{{QuizTotalCount}}</em> Questions',
    //共<em>{{NoteTotalCount}}</em>笔记
    totalNote: 'Total:&nbsp;<em>{{NoteTotalCount}}</em>&nbsp;Notes',
    findTotal: 'Find <em>{{FindTotalCount}}</em> Questions',
    //在课程学习时遇到任何问题
    notFoundText1: 'If you have any questions,',
    //都可以随时提问哦
    notFoundText2: 'please feel free to ask.',
    //查看更多
    viewMore: 'View More',
    //返回
    goback: 'Back',
    //找到{{QuizTotalCount}}条问题
    findQuestionTmpl: '{{QuizTotalCount}} question were found.',
    //抱歉，没有\“{{OldKeyWord}}\”的相关答疑
    noKeyWordTitle: 'No answers related to \"{{OldKeyWord}}\".',
    //暂无常见问题
    noQuestion: 'No FAQs',
    //在课程学习时遇到任何问题都可以随时提问哦~
    noQuestionTitle: 'If you have any questions<br/>please feel free to ask.',
    //好记性不如烂笔头
    noContentLabel: 'Take a note.',
    //发表笔记
    publishNote: 'Make a Note',
    //笔记
    note: 'Note',
    //显示全部
    showAll: 'Show All',
    //删除
    deleteNote: 'delete',
    //修改
    updateNote: 'Modify',
    //取消
    cancelNote: 'cancel',
    //确认
    saveNote: 'OK',
    //可以在课程学习时多记笔记<br />提高学习效果~
    notFoundText3: 'The process of learning problems<br/>you can ask questions here!',
    //目录
    catalogPanel: 'Catalogue',
    //答疑
    quizpanel: 'Answer Questions',
    //笔记
    notepanel: 'Notes',
    //我的笔记
    myNote: 'My Note',
    //所有笔记
    allNote: 'All Note',
    //在此写下您的笔记
    writeDownNote: 'Write down your note here.',
    //没有相关笔记
    noRelatedNote: 'No related notes',
    //编辑
    noteEdit: 'Edit',
    //添加笔记
    noteAdd: 'Add',
    //[收起]
    collapse: '[Hide]',
    //[显示全部]
    showAll2: '[Show All]',
    charLimit: 'Please enter a valid character [1-400]',
    noMore: 'No more',

    exercise: {
        //答题卡
        answercard: 'Answer Sheet',
        //成绩
        score: 'Score',
        //练习说明
        guid: 'Exercise Intro',
        //上一题
        prevQuestion: 'Previous',
        //下一题
        nextQuestion: 'Next',
        //错题重做
        redAnswerErrorQuestion: 'Redo Wrong Questions',
        //提交练习_e
        commit: 'Submit'
    },
    qa: {
        reply: 'Replies',
        noReply: 'No Reply',
        iWantReply: 'Answer It',
        inputContent: 'Please Input',
        submit: 'Submit',
        confirm: 'Confirm',
        cancel: 'Cancel',
        contentMustNotBeEmpty: 'No content',
        noMoreThanHundred: 'No more than 100',
        loading: 'Loading...',
        loaded: 'Data ready',
        noMoreData: 'No more data',
        sureToDelete: 'Delete this reply?',
        systemInfo: 'System Info',
    }
};
i18n.mobileDownload = {
    frontPage: {
        //移动端下载
        mobileDownload: 'Download App',
        //帐号设置
        setAccount: 'Account Settings',
        //去学习
        goStudy: 'Study Now',
        //我的培训
        myTrain: 'My Training',
        //报名培训
        registeredTrain: 'Sign Up',
        //查看所有消息
        viewAllMessage: 'Check All Messages',
        //最新消息
        newMessage: 'Latest Message',
        //没有消息
        noMessage: 'No message',
        //Android下载
        androidDownload: 'Download Android Version',
        //Android即将推出
        androidWillGo: 'Android version is coming soon.',
        //已有帐号
        hasAccount: 'Have account?',
        //登录
        login: 'Sign In',
        //退出登录
        logout: 'Log Out',
        //aPad即将推出
        aPadWillGo: 'aPad version is coming soon.',
        //aPad下载
        aPadDownload: 'Download aPad Version',
        //iPhone下载
        iPhoneDownload: 'Download iPhone Version',
        //iPhone即将推出
        iPhoneWillGo: 'iPhone version is coming soon.',
        //iPad下载
        iPadDownload: 'Download iPad Version',
        //iPad即将推出
        iPadWillGo: 'iPad version is coming soon.',
        //手机扫描快速下载
        phoneScanDownload: 'Scan to Download',
        //课程下载，离线观看
        courseDownload: 'Download courses to watch offline.',
        //将课程资源下载到本地，无网络时也能看，节省流量又方便
        courseDownloadText: 'Download course resources to watch without network',
        //提问题、记笔记
        askAndNotes: 'Ask Questions. Make notes.',
        //学习中有问题随时提，有笔记随时记， 提高学习效率
        askAndNotesText: 'Ask Questions and ake notes for a better study effect.',
        //轻松同步
        easyAsync: 'Synchronization',
        //学习记录云同步，不同设备间学习数据共享
        easyAsyncText: 'Synchronize study record to share data among different devices.',
        //下载
        download: 'Download'
    }
};
i18n.note = {
    "addNote": "Add note",
    "mine": "My notes",
    "all": "All notes",
    "excerpt": "Excerpt",
    "report": "Report",
    "total": "A total of",
    "notes": "notes",
    "placeholder": "Write your notes here...",
    "isOpen": "Public note",
    "cancel": "Cancel",
    "save": "Save",
    "noNote": "No notes",
    "fromExcerpt": "From excerpt",
    "tips": "Tips",
    "confirm": "Are you sure?",
    "sure": "Sure",
    "reported": "reported"
};
