import ko from 'knockout'

var _i18nValue = i18nHelper.getKeyValue, _ = ko.utils;
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
            i18n: i18n.documents,
            dataFilter: docDataFilter,
            Document: {
                AccessToken: ''
            },
            Host: `${this.config.selfUrl}/v1/business_courses/${this.config.courseId}/documents`
        };
        this.store = {
            getActivity: () => {
                return $.ajax({
                    url: `${this.config.selfUrl}/v1/business_courses/${this.config.courseId}/resources/${this.resource.id}/activities`,
                    dataType: 'json',
                    data: {
                        "resource_type": this.model.RESOURCE_TYPE.DOC
                    },
                    cache: false
                });
            },
            createSession: (data) => {
                return $.ajax({
                    url: `${this.config.urls.learningProgressServiceUrl}/v1/session/documents?context_id=${this.contextId}&document_id=${this.resource.id}`,
                    type: 'post',
                    dataType: 'json',
                    contentType: "application/json;charset=utf-8",
                    data: JSON.stringify(data)
                });
            },
            updateSession: (session_id, mac_body, data) => {
                return $.ajax({
                    url: `${this.config.urls.learningProgressServiceUrl}/v1/sessions/${session_id}/documents?mac_body=${mac_body}`,
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
            pageCount: 0
        };
        this.playerData = ko.observable(null).subscribeTo('GET_PLAYER_DATA', this.dispatchPlayerData, this).publishOn('PLAYER_DATA');
        this.resize = ko.observable(null).subscribeTo('PLAYER_RESIZE', this.resize, this);
        this.reportQueue = [];
        this.init();
    }

    dispatchPlayerData() {
        this.playerData({
            resource: this.resource,
            currentPos: this.player.getCurrentPage()
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
                this.progress();
            })
        }else{
            this.initPlayer();
        }

    }

    initPlayer() {
        let _d = $.Deferred();
        let playerObj = this.config.player['1'],
            player = playerObj.instance || (new playerObj.plugin.Document.ExtendMain("#playerDocument", this.setting));
        playerObj.instance = player;
        this.player = player;
        this.player.play(this.resource.id).done((res) => {
            this.resourceData.beginPos = (this.initialData && this.initialData.pos && (+this.initialData.pos) <= res.PageCount ? +this.initialData.pos : res.CurrentPos) || 0;
            if (typeof res.Skippable != 'undefined' && res.Skippable == false)
                this.player.setBarConfig({
                    "skippablePos": res.SkippablePos //data.SkippablePos
                });
            this.player.removeEventListener("onLoad");
            this.player.addEventListener("onLoad", () => {
                this.onLoad();
                _d.resolve(res);
                this.registerEvent();
            });

        });
        return _d.promise();
    }

    registerEvent() {
        this.player.removeEventListener("onNumChange");
        this.player.removeEventListener("onNext");
        this.player.addEventListener("onNumChange", () => {
            this.onNumChange()
        });
        this.player.addEventListener("onNext", () => {
            this.onNext();
        });
    }

    onLoad() {
        window.console && console.log('onLoad');
        window.console && console.log(this.resourceData.beginPos);
        this.resourceData.beginTime = ~~(new Date().getTime() / 1000);
        if (this.resourceData.beginPos) this.player.go(this.resourceData.beginPos);
    }

    onNext() {
        window.console && console.log('onNext');
    }

    onNumChange() {
        window.console && console.log('onNumChange');

        if (this.isExp() && courseStatusCode != 10) {
            var currentPage = this.player.getCurrentPage();

            if (currentPage > this.resource.extra_data.exp_config.exp_length) {
                $('.exp-container').show();
                $('.player-container').hide();
                return;
            }
        }

        this.report();
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

    stopProgress() {
        if (this.progressTimer) window.clearTimeout(this.progressTimer);
    }

    progress() {
        this.stopProgress();
        this.report().done((res) => {
            this.progressTimer = setTimeout(() => {
                this.progress();
            }, 10000)
        });
    }

    addProgress() {
        let current = this.player.getCurrentPage();
        if (isNaN(parseInt(current))) return;
        let endTime = ~~(new Date().getTime() / 1000);
        let ps = this.resourceData.beginPos == current ? this.resourceData.beginPos - 1 : this.resourceData.beginPos,
            pe = current;
        if (ps > pe) {
            let temp = ps;
            ps = pe;
            pe = temp;
        }
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

    report() {
        if (!this.config.userId)return $.when(false);
        this.addProgress();
        if (this.reporting) return;
        if (!this.reporting && this.reportQueue.length) {
            let postData = this.reportQueue.concat(),
                encode = encodeURIComponent(this.runEncrypt(JSON.stringify(postData)));
            this.reporting = true;
            return this.store.updateSession(this.sessionId, encode, postData).done(() => {
                this.reportQueue = this.reportQueue.slice(postData.length);
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
}
ko.components.register('x-course-learn-player-doc', {
    viewModel: ViewModel,
    template: `<div id="playerDocument" class="player-container"></div>`
});