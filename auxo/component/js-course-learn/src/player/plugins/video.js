import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;
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
class ViewModel {
    constructor(params) {
        let {contextId, resource, initialData} = params.data;
        this.resource = resource;
        this.initialData = initialData;
        this.contextId = contextId;
        this.config = params.config;
        this.model = {
            RESOURCE_TYPE: { //资源类型
                VIDEO: 0, //视频
                DOC: 1, //文档
                EVALUATE: 10 // 评测
            },
        },
        this.setting = {
            apiHost: `${this.config.selfUrl}/v1/business_courses/${this.config.courseId}/videos`, //请求video资源地址
            docHost: `${this.config.selfUrl}/v1/business_courses/${this.config.courseId}/documents`,
            staticHost: `${this.config.urls.staticUrl}auxo`, //静态资源地址
            swfHost: `${this.config.urls.staticUrl}auxo/addins/flowplayer/v1.0.0/`,
            video: {
                accessToken: '',
                autoPlay: true
            },
            configs: {
                clip: {
                    loading: window.logoLoading === 'true' ? true : false
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
                // docVideoHost: '/' + projectCode + '/courses/' + courseId + '/videos/' + 1 + '/two_screens',
                // quatityHost: `/v1/business_courses/${this.config.courseId}/videos/{resource_id}/urls`,
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
        this.store = {
            getActivity: () => {
                return $.ajax({
                    url: `${this.config.selfUrl}/v1/business_courses/${this.config.courseId}/resources/${this.resource.id}/activities`,
                    dataType: 'json',
                    data: {
                        "resource_type": this.model.RESOURCE_TYPE.VIDEO
                    },
                    cache: false
                });
            },
            createSession: (data) => {
                return $.ajax({
                    url: `${this.config.urls.learningProgressServiceUrl}/v1/session/videos?context_id=${this.contextId}&video_id=${this.resource.id}`,
                    type: 'post',
                    dataType: 'json',
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(data)
                });
            },
            updateSession: (session_id, mac_body, data) => {
                return $.ajax({
                    url: `${this.config.urls.learningProgressServiceUrl}/v1/sessions/${session_id}/videos?mac_body=${mac_body}`,
                    type: 'post',
                    dataType: 'json',
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(data)
                });
            }
        };
        this.resourceData = {
            beginPos: 0,
            beginTime: 0,
        };
        this.playerData = ko.observable(null).subscribeTo('GET_PLAYER_DATA', this.dispatchPlayerData, this).publishOn('PLAYER_DATA');
        this.resize = ko.observable(null).subscribeTo('PLAYER_RESIZE', this.resize, this);
        this.reportQueue = [];
        this.init();
    }

    dispatchPlayerData() {
        this.playerData({
            resource: this.resource,
            currentPos: ~~this.player.getTime()
        });
    }

    resize() {
        this.player && this.player.resize();
    }

    init() {
        $('.exp-container').hide();
        if (!this.isExp() && courseStatusCode != 10) {
            $('.exp-container').show();
            $('.play-container').hide();
            return;
        }
        if(userId){
            $.when(this.initPlayer(), this.initSession()).then((player, session) => {
                this.sessionId = session;
            })
        }else{
            this.initPlayer();
        }
    }

    initPlayer() {
        let _d = $.Deferred();
        let playerObj = this.config.player['0'],
            player = playerObj.instance || (new playerObj.plugin.Video.Player("playerVideo", this.setting));
        playerObj.instance = player;
        this.player = player;
        this.registerEvent();
        this.player.setting.playerConfigs.quatityHost = `${this.config.selfUrl}/v1/business_courses/${this.config.courseId}/videos/${this.resource.id}/urls`;
        this.player.play(this.resource.id).done((res) => {
            this.player.removeEventListener("onLoad");
            this.player.addEventListener("onLoad", () => {
                this.onLoad();
                _d.resolve(res);
            });
            this.reportConfig = {
                videoReportInterval: res.Data.VideoReportInterval,
                VideoReportStatus: res.Data.VideoReportStatus
            };
            this.resourceData.beginPos = (this.initialData && this.initialData.pos ? +this.initialData.pos : res.Data.CurrentPos) || 0;
        });
        return _d.promise();
    }

    registerEvent() {
        this.player.removeEventListener("onStart");
        this.player.removeEventListener("onSeek");
        this.player.removeEventListener("onPause");
        this.player.removeEventListener("onResume");
        this.player.removeEventListener("onBeforeSeek");
        this.player.removeEventListener("onFinish");
        this.player.removeEventListener("onFullscreen");
        this.player.removeEventListener("onFullscreenExit");
        this.player.addEventListener("onStart", () => {
            this.onStart();
        });
        this.player.addEventListener("onSeek", () => {
            this.onSeek();
        });
        this.player.addEventListener("onPause", () => {
            this.onPause();
        });
        this.player.addEventListener("onResume", () => {
            this.onResume();
        });
        this.player.addEventListener("onBeforeSeek", () => {
            this.onBeforeSeek();
        });
        this.player.addEventListener("onFinish", () => {
            this.onFinish();
        });
        this.player.addEventListener("onFullscreen", () => {
            this.onFullscreen();
        });
        this.player.addEventListener("onFullscreenExit", () => {
            this.onFullscreenExit();
        });
    }

    initSession() {
        let _d = $.Deferred();
        this.store.getActivity().done((res) => {
            if (res) {
                _d.resolve(res.current_session_id);
            } else {
                this.store.createSession().done((session) => {
                    _d.resolve(session.id);
                })
            }
        });
        return _d.promise();
    }

    onLoad() {
        window.console && console.log('onLoad');
    }

    onStart() {
        window.console && console.log("onStart");
        window.console && console.log(this.resourceData.beginPos);

        this.stopExpInterval();

        if (this.isExp() && courseStatusCode != 10) {
            this.createExpInterval();
        }

        this.resourceData.beginTime = ~~(new Date().getTime() / 1000);
        if (this.resourceData.beginPos) this.player.seek(this.resourceData.beginPos);
        this.progress();
    }

    onSeek() {
        window.console && console.log('onSeek');
    }

    onPause() {
        window.console && console.log('onPause');
        this.stopProgress();
    }

    onResume() {
        window.console && console.log('onResume');
        this.progress();
    }

    onBeforeSeek() {
        window.console && console.log('onBeforeSeek');
        if (this.isSeeking)return;
        this.isSeeking = true;
        window.setTimeout(() => {
            this.progress();
            this.isSeeking = false;
        }, 1500)
    }

    onFinish() {
        window.console && console.log('onFinish');
        this.stopProgress();
        this.report(true)
    }

    onFullscreen() {

    }

    onFullscreenExit() {

    }

    stopProgress() {
        if (this.progressTimer) window.clearTimeout(this.progressTimer);
    }

    progress() {
        this.stopProgress();
        this.report().done((res) => {
            if (this.reportConfig.VideoReportStatus && this.reportConfig.videoReportInterval) {
                this.progressTimer = setTimeout(() => {
                    this.progress();
                }, this.reportConfig.videoReportInterval * 1000)
            }
        });
    }

    addProgress(isFinish) {
        let current = isFinish ? this.resource.resource_data.duration : ~~this.player.getTime();
        if (isNaN(parseInt(current))) return;
        let endTime = ~~(new Date().getTime() / 1000);
        let ps = this.resourceData.beginPos, pe = current;
        if (ps > pe) {
            let temp = ps;
            ps = pe;
            pe = temp;
        }
        if (ps === pe) pe = ps + 1;
        this.reportQueue.push({
            ps: ps,
            pe: pe,
            ts: this.resourceData.beginTime,
            te: endTime
        });
        this.resourceData.beginTime = endTime;
        this.resourceData.beginPos = current;
    }

    // 是否可体验资源
    isExp() {
        return this.resource.extra_data && this.resource.extra_data.exp_config && this.resource.extra_data.exp_config.exp_type == 1;
    }

    // 启动体验计时器
    createExpInterval() {
        window.expIntervalId = window.setInterval($.proxy(function () {
            if (this.player.getTime() >= this.resource.extra_data.exp_config.exp_length) {
                $('.exp-container').show();
                $('.player-container').hide();
                this.player.pause();
                this.stopExpInterval();
            }
        }, this), 1000);
    }

    // 停止体验计时器
    stopExpInterval() {
        if (window.expIntervalId) {
            clearInterval(window.expIntervalId);
            window.expIntervalId = null;
        }
    }

    report(isFinish) {
        if (!this.config.userId)return $.when(false);
        this.addProgress(isFinish);
        if (this.reporting) return;
        if (!this.reporting && this.reportQueue.length) {
            let postData = this.reportQueue.concat(),
                encode = encodeURIComponent(this.runEncrypt(JSON.stringify(postData)));
            this.reporting = true;
            return this.store.updateSession(this.sessionId, encode, postData).done(() => {
                this.reportQueue = this.reportQueue.slice(postData.length);
            }).fail(() =>{
	            this.player.pause()
                this.Toast('不支持插件加速播放', 3000)
            }).always(() => {
                this.reporting = false;
            });
        } else {
            return $.when(false)
        }
    }

    runEncrypt(str) {
        let shaObj = new jsSHA('SHA-256', 'TEXT');
        shaObj.setHMACKey(this.config.mac.mac_key, "TEXT");
        shaObj.update(str);
        return shaObj.getHMAC('B64');
    }
	//自定义弹框
	Toast(msg,duration) {
	duration=isNaN(duration)?3000:duration;
	var m = document.createElement('div');
	m.innerHTML = msg;
	m.style.cssText="width: 10%;min-width: 100px;opacity: 0.7;height: 50px;color: rgb(255, 255, 255);line-height: 30px;text-align: center;border-radius: 5px;position: fixed;top: 82%;left: 35%;z-index: 999999;background: rgb(0, 0, 0);font-size: 18px;";
	document.body.appendChild(m);
	setTimeout(function() {
		var d = 0.5;
		m.style.webkitTransition = '-webkit-transform ' + d + 's ease-in, opacity ' + d + 's ease-in';
		m.style.opacity = '0';
		setTimeout(function() { document.body.removeChild(m) }, d * 1000);
	}, duration);
}
}
ko.components.register('x-course-learn-player-video', {
    viewModel: ViewModel,
    template: `<div id="playerVideo" class="player-container"></div>`
});