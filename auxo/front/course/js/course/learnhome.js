(function () {
    $.ajaxSetup({
        contentType: 'application/json;charset=utf8',
        cache: true
    });

    //文档数据格式format
    function docDataFilter(data) {
        var obj = $.extend(true, {
            Detail: null,
            Message: null,
            Code: 0
        }, {
            Data: data
        });
        obj.Data.ResourceStatus = 1;
        return obj;
    }

    //视频数据格式format
    function videoDataFilter(data) {
        var obj = $.extend(true, {
            Detail: null,
            Message: null,
            Code: 0
        }, {
            Data: data
        });
        obj.Data.ResourceStatus = 1;
        return obj;
    }

    var staticVersion;
    // staticVersion = window.staticVersion || Math.floor(new Date().getTime() / 1000 / 3600);
    staticVersion =  Math.floor(new Date().getTime() / 1000 / 3600);

    require.config({
        urlArgs: 'v=' + staticVersion,
        baseUrl: staticUrl,
        paths: {
            index: 'auxo/front/course/js/player/index',
            document: 'auxo/front/course/js/player/document',
            video: 'auxo/front/course/js/player/video',
            question: 'auxo/front/course/js/player/question',
            timer: 'auxo/front/course/js/player/jstimer',
            chapter: 'auxo/front/course/js/player/chapter',
            url: 'auxo/front/course/js/player/url',
            note: 'auxo/front/course/js/player/note'
        },
        waitSeconds: 30
    });

    require(['player', 'document.extend.main', 'index', 'document', 'video', 'question', 'chapter', 'url', 'note'], function (p, d, learn, doc, video, question, chapter, url, note) {
        var playerSeeting = {
            apiHost: (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/videos', //请求video资源地址
            docHost: (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/documents',
            staticHost: staticUrl + 'auxo', //静态资源地址
            swfHost: staticUrl + 'auxo/addins/flowplayer/v1.0.0/',
            video: {
                accessToken: '',
                autoPlay: true
            },
            configs: {
                clip: {
                    loading: logoLoading === 'true' ? true : false
                },
                log: {
                    //level:'debug',
                    //filter:['org.flowplayer.pseudostreaming.*']
                },
                i18n: i18n.videos,
                plugins: {
                    controls: {
                        dragDirection: "both",
                        dragTime: 0
                    }
                },
                docVideoHost: (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/videos/' + resourceUuid + '/two_screens',
                quatityHost: (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/videos/' + resourceUuid + '/urls',
                dataFilter: videoDataFilter
            },
            events: {},
            plugins: {
                "document": {}, // "question": needVideoQuestion.toLowerCase() == "true" ? question : null,
                "question": {},
                "lastPositionContent": {
                    html: "",
                    time: 0
                }
            }
        };
        var player = new p.Video.Player("player", playerSeeting);
        var documentViewer = new d.Document.ExtendMain("#documentViewer", {
            i18n: i18n.documents,
            dataFilter: docDataFilter,
            Document: {
                AccessToken: ''
            },
            Host: (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/documents'
        });

        //初始化各个播放器到业务脚本对象中
        video.viewModel.init(player);
        doc.viewModel.init(documentViewer);
        question.viewModel.init();
        note.viewModel.init();
        learn.init(video, doc, question, chapter, url, note);
        //document.title = i18nHelper.getKeyValue('courseComponent.front.learn.title');
    });
})();
$(function () {
    var originalTitle = i18nHelper.getKeyValue('courseComponent.front.learn.title');
    document.title = originalTitle;
    var titleEl = document.getElementsByTagName('title')[0];
    var docEl = document.documentElement;
    if (docEl && docEl.addEventListener) {
        docEl.addEventListener('DOMSubtreeModified', function (evt) {
            var t = evt.target;
            if (t === titleEl || (t.parentNode && t.parentNode === titleEl)) {
                if (document.title !== originalTitle) {
                    document.title = originalTitle;
                }
            }
        }, false);
    } else {
        document.onpropertychange = function () {
            if (window.event.propertyName === 'title') {
                if (document.title !== originalTitle) {
                    document.title = originalTitle;
                }
            }
        };
    }
});
