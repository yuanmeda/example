define(function (require, exports, player) {
    var base64Code = 'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4';
    var store = {
        //上报视频进度
        reportProgress: function (encode) {
            var _params = viewModel.params,
                _postData = {
                    encode: encode
                };
            return $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/videos/' + resourceUuid + '/progress' + ((window.resourceType == 101 || window.resourceType == 102 || window.resourceType == 103) ? "?v=2" : ""),
                type: "POST",
                data: JSON.stringify(_postData),
                cache: false,
                success: viewModel.success,
            });
        },
        getReportProgressConfig: function () {
            return $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + (window.resourceType == 101 ? '/v2' : '') + '/courses/' + courseId + '/videos/' + resourceUuid,
                type: "GET",
                cache: false
            });
        }
    };
    var viewModel = {
        location: null,
        timeoutEvent: 0,
        timeCount: 1,
        currentStatInterval: 10, //上报频率
        videoReportStatus: 1, //是否上报，为0时是都不上报，即使开始和结束
        timerId: 0,
        model: {
            videoId: null,
            currentQuality: -1,
            duration: 0, //视频时长
            IsEnd: false,
            beginTime: 0,
            endTime: 0,
            currentPos: 0,
            endPos: 0,
            statusCode: statusCode,
            exp_config: {
                exp_length: null,
                exp_type: null
            }
        },
        init: function (player) {
            this.player = player;
            this.proxy = {
                onStart: $.proxy(viewModel.onstart, viewModel),
                onSeek: $.proxy(viewModel.onseek, viewModel),
                onPause: $.proxy(viewModel.onpause, viewModel),
                onResume: $.proxy(viewModel.onresume, viewModel),
                onFinish: $.proxy(viewModel.onfinish, viewModel),
                onBeforeSeek: $.proxy(viewModel.onbeforeseek, viewModel)
            };
            if (window.addEventListener) {
                /*
                 Works well in Firefox and Opera with the
                 Work Offline option in the File menu.
                 Pulling the ethernet cable doesn't seem to trigger it.
                 Later Google Chrome and Safari seem to trigger it well
                 */
                window.addEventListener("online", $.proxy(viewModel.onlineEventHandle, viewModel), false);
                //window.addEventListener("offline",  function(){alert(1);}, false);
            } else {
                /*
                 Works in IE with the Work Offline option in the
                 File menu and pulling the ethernet cable
                 */
                document.body.ononline = $.proxy(viewModel.onlineEventHandle, viewModel);
                //document.body.onoffline = function(){alert(1);};
            }
        },
        video: function (videoId, exp_config, parent) {
            this.parent = parent;
            if (exp_config) {
                this.model.exp_config.exp_type = exp_config.exp_type;
                this.model.exp_config.exp_length = exp_config.exp_length;
            }
            store.getReportProgressConfig().done($.proxy(function (data) {
                this.currentStatInterval = data && data.video_report_interval;
                this.videoReportStatus = data && data.video_report_status;
                this.model.videoId = videoId;
                parent.model.attachmentList(data.attachments || []);
                this.regirstPlayerEvents();
                this.player.setting.apiHost = (window.selfUrl || '') + '/' + projectCode + (window.resourceType == 101 ? '/v2' : '') + '/courses/' + courseId + '/videos';
                this.player.setting.playerConfigs.docVideoHost = (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/videos/' + resourceUuid + '/two_screens';
                this.player.setting.playerConfigs.quatityHost = (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/videos/' + resourceUuid + '/urls';
                var result = this.player.play(videoId);
                if (result) {
                    result.done($.proxy(function (videoInfo) {
                        $("#player").show().siblings("div").hide();
                        this.model.currentPos = videoInfo.Data.CurrentPos;
                        this.model.duration = videoInfo.Data.Duration;
                    }, this));
                }
            }, this));
        },
        regirstPlayerEvents: function () {
            var self = this;
            this.player.onStart(self.proxy.onStart)
                .onSeek(self.proxy.onSeek)
                .onPause(self.proxy.onPause)
                .onResume(self.proxy.onResume)
                .onBeforeSeek(self.proxy.onBeforeSeek)
                .onFinish(self.proxy.onFinish);
        },
        onstart: function () {
            if (ko.unwrap(this.model.statusCode) != 20)
                this.createexpwintimeout();
            this.player.seek(this.location ? this.location : this.model.currentPos);
            if (this.currentStatInterval > 0)
            setTimeout(this.createnewintimeout.bind(this), 500);
        },
        onbeforeseek: function () {
            var t = this;
            if (this.isSeeking) {
                return;
            }
            this.isSeeking = true;
            window.clearTimeout(this.timerId);
            this.timerId = setTimeout(function () {
                t.model.endPos = t.player.getTime();
                t.reportProgress();
            }, 1500);
        },
        onseek: function () {
            this.isSeeking = false;
        },
        onpause: function () {
            this.model.endPos = this.player.getTime();
            this.reportProgress();
        },
        onresume: function () {
        },
        onfinish: function () {
            var t = this;
            t.model.endPos = this.player.getTime();
            t.reportProgress(true);
            t.player.removeEventListener("onStart", t.proxy.onStart);
            t.player.removeEventListener("onSeek", t.proxy.onSeek);
            t.player.removeEventListener("onPause", t.proxy.onPause);
            t.player.removeEventListener("onResume", t.proxy.onResume);
            t.player.removeEventListener("onFinish", t.proxy.onFinish);
            t.player.removeEventListener("onFullscreen", t.proxy.onFullscreen);
            t.player.removeEventListener("onFullscreenExit", t.proxy.onFullscreenExit);
            try {
                // t.player.close();
            } catch (e) {
            }

            if (!viewModel.isExp()) {
                // 显示播放结束后的提示框
                if (this.player.isFullscreen()) {
                    this.player.toggleFullscreen();
                }
                this.parent.showFinishTip();
            }
        },
        isExp: function () {
            if (ko.unwrap(viewModel.model.exp_config) != null && ko.unwrap(viewModel.model.exp_config.exp_type) == 1 && ko.unwrap(viewModel.model.statusCode) != 20) {
                return true;
            }

            return false;
        },
        onfullscreen: function () {
            $("div.learning-side").hide();
        },
        onfullscreenexit: function () {
            $("div.learning-side").show();
        },
        resize: function () {
            viewModel.player.resize();
        },
        finish: function () {
            var t = this;
            try {
                window.clearInterval(t.timeoutEvent);
                window.clearInterval(t.timerId);
            } catch (e) {
            }
            t.player.removeEventListener("onStart", t.proxy.onStart);
            t.player.removeEventListener("onSeek", t.proxy.onSeek);
            t.player.removeEventListener("onPause", t.proxy.onPause);
            t.player.removeEventListener("onResume", t.proxy.onResume);
            t.player.removeEventListener("onFinish", t.proxy.onFinish);
            t.player.removeEventListener("onFullscreen", t.proxy.onFullscreen);
            t.player.removeEventListener("onFullscreenExit", t.proxy.onFullscreenExit);
            try {
                t.player.close();
                $("#player").empty();
            } catch (e) {
            }
        },
        checkExp: function () {
        },
        //上报视频进度
        reportProgress: function (isFinish) {
            if (!userLogined)
                return;
            if (!this.videoReportStatus)
                return;
            if (isNaN(viewModel.model.endPos)) return;
            var t = this;
            var _currentTime = parseInt(new Date().getTime() / 1000),
                _codeStr = [{
                    ps: viewModel.model.currentPos,
                    pe: viewModel.model.endPos,
                    ts: viewModel.model.beginTime || 0,
                    te: _currentTime
                }],
                _encode = '';
            t.reportting = true;
            _encode = encrypt_3des(base64_decode(base64Code), JSON.stringify(_codeStr));
            viewModel.model.endTime = _currentTime;
            //判断是否上报
            if (viewModel.model.endPos - viewModel.model.currentPos < 1) {
                t.reportting = false;
                return;
            }
            if (_currentTime - viewModel.model.beginTime < 1) {
                t.reportting = false;
                return;
            }
	        // if (viewModel.model.currentPos === 0) {
		    //     t.reportting = false;
		    //     return;
	        // }
            //判断到体验限制时间后停止上报
            if (viewModel.model.exp_config.exp_length) {
                if (statusCode == 20) {
                    t.reportting = true;
                } else if ((_currentTime - viewModel.model.beginTime) >= viewModel.model.exp_config.exp_length ||
                    Math.floor(this.player.getTime()) > viewModel.model.exp_config.exp_length ||
                    isNaN(this.player.getTime())) {
                    t.reportting = false;
                    return;
                }
            }
            store.reportProgress(_encode, isFinish).done(function () {
                setTimeout(function () {
                    t.reportting = false;
                }, 1000);
            }).fail(function () {
	            t.player.pause()
	            t.Toast('不支持插件加速播放',3000)
	            $('#layui-layer5').hide();
                setTimeout(function () {
                    t.reportting = false;
                }, 1000);
            });
        },
        createexpwintimeout: function () {
            window.setInterval($.proxy(function () {
                if (ko.unwrap(this.model.statusCode) != 20) {
                    if (this.player.getTime() > this.model.exp_config.exp_length) {
                        $('#exp').show();
                        $('#playerContainer').hide();
                        this.player.pause();
                    }
                }
            }, this), 1000);
        },
        createnewintimeout: function () {
            if (!userLogined)
                return;
            var t = this;
            t.model.beginTime = t.model.endTime || parseInt(new Date().getTime() / 1000);
            t.model.currentPos = t.player.getTime();
            window.clearTimeout(t.timeoutEvent);
            t.timeoutEvent = window.setTimeout(function () {
                //在不上报的时间段进行迭代
                if (!t.reportting) {
                    t.model.endPos = t.player.getTime();
                    if (statusCode != 20 && expType == "1" && (Math.floor(t.model.endPos) > t.model.exp_config.exp_length)) {
                        return;
                    } else {
                        t.reportProgress();
                        if (t.model.endPos < t.model.duration) {
                            t.createnewintimeout();
                        }
                    }
                }
            }, 1000 * t.currentStatInterval);
        },
        reportProgressError: function (encode) {
            var str = $.cookie('videoReport' + resourceUuid);
            var encodeArray = str ? JSON.parse(str) : [];
            if (typeof encode === 'string' && encodeArray.indexOf(encode) < 0) {
                encodeArray.push(encode);
                $.cookie('videoReport' + resourceUuid, JSON.stringify(encodeArray), {
                    expires: 7
                });
            }
        },
        onlineEventHandle: function () {
            setTimeout(function () {
                var str = $.cookie('videoReport' + resourceUuid);
                if (!str)
                    return;
                var encodeArray = str ? JSON.parse(str) : [];
                var _count = 0,
                    _newArr = [];
                $.each(encodeArray, function (index, encode) {
                    (function (e) {
                        store.reportProgress(e).fail(function () {
                            _newArr.push(e);
                        }).always(function () {
                            _count++;
                            if (_count === encodeArray.length) {
                                if (_newArr.length > 0) {
                                    $.cookie('videoReport' + resourceUuid, JSON.stringify(_newArr), {
                                        expires: 7
                                    });
                                } else {
                                    $.removeCookie('videoReport' + resourceUuid);
                                }
                            }
                        })
                    })(encode);
                })
            }, 3000);
        },
	    //自定义弹框
	    Toast: function(msg,duration) {
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
    };
    exports.viewModel = viewModel;
});
