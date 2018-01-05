define(function (require, exports, player) {

    var store = {

        recordvideo: function (id, success, error) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/api/RecordVideo",
                type: "Get",
                data: { videoid: id, trainid: trainId },
                cache: false,
                success: success,
                error: error
            });
        },

        videostatistics: function (data, success, error) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/api/VideoStatistics",
                type: "Post",
                data: data,
                cache: false,
                success: success,
                error: error
            });
        },

        getvideo: function (data, success) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/home/GetVideo",
                type: "Get",
                data: data,
                cache: false,
                success: success
            });
        },

        reporttask: function (taskid) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/home/ReportTask",
                type: "Get",
                data: { taskId: taskid },
                cache: false
            });
        }
    };

    var viewModel = {
        ifVideoStatisticsCallBack:true,
        intervalStatEvent: 0,
        // allowVideoDrag: allowVideoDrag.toLowerCase() == "true",
        window: window,
        model: {
            VideoId: 0,
            CurrentQuality: -1,
            VideoDuration: 0,//视频时长
            CurrentPlayPostion: 0,//视频位置
            InitPlayPosition: 0,//视频位置
            LastPlayPosition: 0,//视频位置
            MaxPlayPosition: 0,//最大视频播放位置
            IsFirstStart: false,//切换画质触发onstart，影响逻辑（如seek两次），true时为正常初始化播放
            Record: "",
            IsEnd: false
        },
        ov: $(),
        init: function (player) {
            this.player = player;
            this.proxy = {
                onStart: $.proxy(viewModel.onstart, viewModel),
                onSeek: $.proxy(viewModel.onseek, viewModel),
                onPause: $.proxy(viewModel.onpause, viewModel),
                onResume: $.proxy(viewModel.onresume, viewModel),
                onFinish: $.proxy(viewModel.onfinish, viewModel)
            };
        },
        regirstPlayerEvents: function () {
            var self = this;
            this.player.onStart(self.proxy.onStart)
                .onSeek(self.proxy.onSeek)
                .onPause(self.proxy.onPause)
                .onResume(self.proxy.onResume)
                .onFinish(self.proxy.onFinish)
        },
        onstart: function () {
            var self = this;
            if (!self.model.IsFirstStart) {
                window.setTimeout(function () {
                    //非第一次播放时，清晰度变了即是人工切换要保存
                    var quality = self.player.getCurrentQuality();
                    if (quality != self.model.CurrentQuality)
                    {
                        self.model.CurrentQuality = quality;
                        $.cookie(currentUserId + "_vq", quality, { expires: 365 });
                    }
                }, 500);
                return;
            }

            this.ov.hide();
            this.model.IsEnd &= false;
            self.recordvideo(self.model.VideoId);
            if (!self.model.IsEnd && self.model.LastPlayPosition > 5) {
                if (self.model.LastPlayPosition < self.model.VideoDuration - 1) {
                    //上次播放位置的提示
                    var contentConfig = self.player.getCustomPlugin("lastPositionContent");
                    contentConfig.html = "<p>" + i18n.common.frontPage.lastPositionContent + self.formatTime(self.model.LastPlayPosition) + "</p>";
                    contentConfig.time = 3000;
                    var content = self.player.getPlugin("lastPositionContent");
                    content.css({ bottom: 50, height: 50});
                    content.show();
                }

                window.setTimeout(function () {
                    self.player.seek(self.model.LastPlayPosition);
                    //第一次播放的清晰度
                    self.model.CurrentQuality = self.player.getCurrentQuality();
                }, 1000);
            }

            //不允许拖动的练习弹窗控制
            self.questionPlugin = self.player.getCustomPlugin("question");
            self.questionPlugin.maxPlayPosition = self.model.MaxPlayPosition;

            //二分屏的文档全屏事件
            var documentplayer = self.player.getCustomPlugin("document")._documentPlayer;
            if (documentplayer != null) {
                documentplayer.removeEventListener("onFullScreen", self.onfullscreen);
                documentplayer.removeEventListener("onExitFullScreen", self.onfullscreenexit);
                documentplayer.addEventListener("onFullScreen", self.onfullscreen);
                documentplayer.addEventListener("onExitFullScreen", self.onfullscreenexit);
            }
            self.model.IsFirstStart = false;
        },
        onseek: function () {
            var self = this;
            window.setTimeout(function () {//seek时setTimeout才能使getTime取值正常(setTimeout为零，才能使seek时弹出习题的onpause[stat]取值正确)
                self.model.InitPlayPosition = Math.round(self.player.getTime());
            }, 0);
            self.createnewinterval();
        },
        onpause: function () {
            var self = this;
            window.clearInterval(self.intervalStatEvent);
            self.stat(Math.round(self.player.getTime()), false);
            this.ov.hide();
        },
        onresume: function () {
            var self = this;
            this.ov.hide();
            self.model.InitPlayPosition = Math.round(self.player.getTime());
            self.createnewinterval();
        },
        onfinish: function () {
            var self = this;
            self.model.IsEnd = true;
            self.model.LastPlayPosition = 0;
            window.clearInterval(self.intervalStatEvent);
            //不是直接拖拽结束的才保存数据(getTime取值误差，此多减5)
            if (self.model.MaxPlayPosition > self.model.VideoDuration - parseInt(currentStatInterval) - 5) {
                self.stat(Math.round(self.player.getTime()), false);
                if (task.TaskId > 0)
                {
                    if (task.ResourceId == 0 ||
                        (task.ResourceId == viewModel.model.VideoId && task.ResourceType == 0)) {
                        store.reporttask(task.TaskId);
                    }
                }
            }
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
                window.clearInterval(t.intervalStatEvent);
                t.stat(Math.round(t.player.getTime()), false);
            } catch (e) { }
            t.player.removeEventListener("onStart", t.proxy.onStart);
            t.player.removeEventListener("onSeek", t.proxy.onSeek);
            t.player.removeEventListener("onPause", t.proxy.onPause);
            t.player.removeEventListener("onResume", t.proxy.onResume);
            t.player.removeEventListener("onFinish", t.proxy.onFinish);
            t.player.removeEventListener("onFullscreen", t.proxy.onFullscreen);
            t.player.removeEventListener("onFullscreenExit", t.proxy.onFullscreenExit);
            this.ov.hide();
            this.ov = $();
            try {
                t.player.close();
                $("#player").empty();
            } catch (e) {

            }
        },
        recordvideo: function (id) {
            var t = this;
            window.clearInterval(t.intervalStatEvent);//先清空一次，避免快速recordvideo时多次注册定时器。
            store.recordvideo(id, function (data) {
                t.model.Record = data;
                t.createnewinterval();
            },
            function () {
                t.createnewinterval();
            });
        },

        createnewinterval: function () {
            var t = this;
            window.clearInterval(t.intervalStatEvent);
            t.intervalStatEvent = window.setInterval(function () {
                t.stat(Math.round(t.player.getTime()), true);
            }, 1000 * currentStatInterval);
        },

        play: function (id) {
            window.console&&console.log("play");
            var self = this;
            try {
                self.player.close();
            } catch (e) {}
            var vsCookie = unescape(self.getCookie(currentUserId + "vs"));
            if (vsCookie != null && vsCookie != "" && vsCookie != "null") {
                var vsArray = vsCookie.split("|");
                for (var i = 0; i < vsArray.length; i++) {
                    var vsItem = vsArray[i];
                    if(viewModel.ifVideoStatisticsCallBack){
                        viewModel.ifVideoStatisticsCallBack=false;
                        store.videostatistics({ vs: vsItem, cookie: true }, function (data) {
                                viewModel.ifVideoStatisticsCallBack=true;
                            self.model.InitPlayPosition = self.model.CurrentPlayPostion;
                            if (!data.IsLogined)
                                location.href = '/' + currentProject.DomainName + '/enrolls/user/login';

                            self.delCookie(currentUserId + "vs");

                            store.getvideo({ videoId: id }, function (data) {
                                self.model.LastPlayPosition = 0;
                                self.model.LastPlayPosition = data.LastPlayPosition;
                                self.model.IsEnd = data.IsEnd;
                            });
                        },
                        function () {
                            viewModel.ifVideoStatisticsCallBack=true;
                        });
                    }
                }
            }
            self.model.VideoId = id;
            self.model.InitPlayPosition = 0;
            self.model.IsFirstStart = true;
            self.regirstPlayerEvents();

            if (self.model.MaxPlayPosition >= self.model.VideoDuration) {//已看完的
                self.player.setting.playerConfigs.plugins.controls.dragDirection = "both";
                self.player.setting.playerConfigs.plugins.controls.dragTime = self.model.MaxPlayPosition;
            }
            else if (!self.allowVideoDrag) {//不允许拖动
                self.player.setting.playerConfigs.plugins.controls.dragDirection = "backward";
                self.player.setting.playerConfigs.plugins.controls.dragTime = self.model.MaxPlayPosition;
            }
            var oldcontentConfig = self.player.getCustomPlugin("lastPositionContent");
            if (oldcontentConfig)
                oldcontentConfig.html = "";

            var videoQuality = $.cookie(currentUserId + "_vq");
            if (videoQuality == undefined || videoQuality == null) {
                self.player.play({ id: parseInt(id) });
            }
            else {
                self.player.play({ id: parseInt(id) }, videoQuality);
            }
        },
        setCookie: function (name, value) {
            document.cookie = name + "=" + escape(value) + ";path=/";
        },
        getCookie: function (name) {
            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg))
                return (arr[2]);
            else
                return null;
        },
        delCookie: function (name) {
            var self = this;
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval = unescape(self.getCookie(name));
            if (cval != null)
                document.cookie = name + "=" + cval + ";path=/;expires=" + exp.toGMTString();
        },
        stat: function (current, bl) {
            if (isNaN(current) || viewModel.model.VideoId == 0 || isNaN(this.model.InitPlayPosition))
                return;

            var self = this;
            if (self.model.MaxPlayPosition < current) {
                self.model.MaxPlayPosition = current;
                self.questionPlugin.maxPlayPosition = self.model.MaxPlayPosition;
            }
            this.model.CurrentPlayPostion = current;
            var videoId = this.model.VideoId;
            var initPlayPosition = this.model.InitPlayPosition;
            var currentPlayPosition = this.model.CurrentPlayPostion;
            var vs = "", sum = 0;
            vs += ("v" + videoId);
            vs += ("u" + userUnitId);
            vs += ("i" + initPlayPosition);
            vs += ("c" + currentPlayPosition);

            sum = (parseInt(this.model.VideoId) + parseInt(userUnitId)
                + parseInt(this.model.CurrentPlayPostion) + parseInt(this.model.InitPlayPosition));
            var code = sum.toString();
            if (code.length > 1) {
                code = code.toString().substr(code.length - 1, code.length);
                vs += code;
            }
            else {
                vs += code;
            }
            var vsCookie = unescape(self.getCookie(currentUserId + "vs"));
            if (bl) {
                if(viewModel.ifVideoStatisticsCallBack){
                    viewModel.ifVideoStatisticsCallBack=false;
                    store.videostatistics({ vs: vs, record: self.model.Record, isPrevent: true, cookie: false }, function (data) {
                            viewModel.ifVideoStatisticsCallBack=true;
                            if (vsCookie != null && vsCookie != "" && vsCookie != "null") {
                                var vsArray = vsCookie.split("|");
                                vsArray.push(vs);
                                for (var i = 0; i < vsArray.length; i++) {
                                    var vsItem = vsArray[i];
                                    store.videostatistics({ vs: vsItem, cookie: true }, function (subdata) { }, function () { });
                                }
                            }
                            self.model.InitPlayPosition = self.model.CurrentPlayPostion;
                            if (!data.IsLogined)
                                location.href = '/' + currentProject.DomainName + '/enrolls/user/login';
                            if (!data.NotPause) {
                                self.pausevideo();
                            }
                            self.delCookie(currentUserId + "vs");
                        },
                        function () {
                            viewModel.ifVideoStatisticsCallBack=true;
                            var vsNew = "";
                            var hasRead = false;
                            if (vsCookie == null || vsCookie == "" || vsCookie == "null") {
                                vsCookie = vs;
                            } else {
                                var vsArray = vsCookie.split("|");
                                var isMerged = false;
                                var oldVsItemIndex = 0;
                                var newInitPlayPostion, newCurrentPlayPostion;
                                for (var i = 0; i < vsArray.length; i++) {
                                    var vsItem = vsArray[i];
                                    var iIndex = vsItem.lastIndexOf("i");
                                    var cIndex = vsItem.lastIndexOf("c");
                                    var itemInitPlayPostion = vsItem.substr(iIndex + 1, cIndex - iIndex - 1);
                                    var itemCurrentPlayPostion = vsItem.substr(cIndex + 1, vsItem.length - cIndex - 2);
                                    if (initPlayPosition < itemInitPlayPostion) {
                                        if (currentPlayPosition >= itemInitPlayPostion && currentPlayPosition < itemCurrentPlayPostion) {
                                            newInitPlayPostion = initPlayPosition;
                                            newCurrentPlayPostion = itemCurrentPlayPostion;
                                            isMerged = true;
                                            oldVsItemIndex = i;
                                            break;
                                        }
                                        if (currentPlayPosition >= itemCurrentPlayPostion) {
                                            newInitPlayPostion = initPlayPosition;
                                            newCurrentPlayPostion = currentPlayPosition;
                                            isMerged = true;
                                            oldVsItemIndex = i;
                                            break;
                                        }
                                    }
                                    if (initPlayPosition >= itemInitPlayPostion && initPlayPosition <= itemCurrentPlayPostion) {
                                        if (currentPlayPosition > itemCurrentPlayPostion) {
                                            newInitPlayPostion = itemInitPlayPostion;
                                            newCurrentPlayPostion = currentPlayPosition;
                                            isMerged = true;
                                            oldVsItemIndex = i;
                                            break;
                                        } else {
                                            hasRead = true;
                                            return;
                                        }
                                    }
                                }
                                if (isMerged) {
                                    vsNew = "v" + videoId + "u" + userUnitId + "i" + newInitPlayPostion + "c" + newCurrentPlayPostion;

                                    sum = (parseInt(videoId) + parseInt(userUnitId)
                                    + parseInt(newInitPlayPostion) + parseInt(newCurrentPlayPostion));
                                    code = sum.toString();
                                    if (code.length > 1) {
                                        code = code.toString().substr(code.length - 1, code.length);
                                        vsNew += code;
                                    } else {
                                        vsNew += code;
                                    }

                                    vsArray.splice(oldVsItemIndex, 1);
                                    vsArray.push(vsNew);
                                } else {
                                    vsArray.push(vs);
                                }

                                self.delCookie(currentUserId + "vs");
                                vsCookie = "";
                                for (var j = 0; j < vsArray.length; j++) {
                                    vsCookie = j == 0 ? vsArray[j] : vsCookie + "|" + vsArray[j];
                                }
                            }
                            if (!hasRead) {
                                self.setCookie(currentUserId + "vs", vsCookie);
                            }
                        });
                }

            }
            else {
                store.videostatistics({ vs: vs, cookie: false }, function (data) {
                    if (vsCookie != null && vsCookie != "" && vsCookie != "null") {
                        var vsArray = vsCookie.split("|");
                        vsArray.push(vs);
                        for (var i = 0; i < vsArray.length; i++) {
                            var vsItem = vsArray[i];
                            store.videostatistics({ vs: vsItem, cookie: true}, function (subdata) { }, function () { });
                        }
                    }
                    self.model.InitPlayPosition = self.model.CurrentPlayPostion;
                    if (!data.IsLogined)
                        location.href = '/' + currentProject.DomainName + '/enrolls/user/login';
                    self.delCookie(currentUserId + "vs");
                },
                function () {
                    var vsNew = "";
                    var hasRead = false;
                    if (vsCookie == null || vsCookie == "" || vsCookie == "null") {
                        vsCookie = vs;
                    } else {
                        vsCookie = unescape(vsCookie);
                        var vsArray = vsCookie.split("|");
                        var isMerged = false;
                        var oldVsItemIndex = 0;
                        var newInitPlayPostion, newCurrentPlayPostion;
                        if (vsArray.length < 0) return;
                        var lastVsItem = vsArray[vsArray.length - 1];
                        var lastVsItemInitindex = lastVsItem.lastIndexOf("i");
                        var lastVsItemLastindex = lastVsItem.lastIndexOf("c");
                        var lastItemCurrentPlayPostion = lastVsItem.substr(lastVsItemLastindex + 1, lastVsItem.length - lastVsItemLastindex - 2);

                        if (lastItemCurrentPlayPostion == initPlayPosition) {
                            var lastItemInitPlayPostion = lastVsItem.substr(lastVsItemInitindex + 1, lastVsItemLastindex - lastVsItemInitindex - 1);
                            newInitPlayPostion = lastItemInitPlayPostion;
                            newCurrentPlayPostion = currentPlayPosition;
                            isMerged = true;
                            oldVsItemIndex = vsArray.length - 1;
                        } else {
                            for (var i = 0; i < vsArray.length; i++) {
                                var vsItem = vsArray[i];
                                var iIndex = vsItem.lastIndexOf("i");
                                var cIndex = vsItem.lastIndexOf("c");
                                var itemInitPlayPostion = vsItem.substr(iIndex + 1, cIndex - iIndex - 1);
                                var itemCurrentPlayPostion = vsItem.substr(cIndex + 1, vsItem.length - cIndex - 2);
                                if (initPlayPosition < itemInitPlayPostion) {
                                    if (currentPlayPosition >= itemInitPlayPostion && currentPlayPosition < itemCurrentPlayPostion) {
                                        newInitPlayPostion = initPlayPosition;
                                        newCurrentPlayPostion = itemCurrentPlayPostion;
                                        isMerged = true;
                                        oldVsItemIndex = i;
                                        break;
                                    }
                                    if (currentPlayPosition >= itemCurrentPlayPostion) {
                                        newInitPlayPostion = initPlayPosition;
                                        newCurrentPlayPostion = currentPlayPosition;
                                        isMerged = true;
                                        oldVsItemIndex = i;
                                        break;
                                    }
                                }
                                if (initPlayPosition >= itemInitPlayPostion && initPlayPosition <= itemCurrentPlayPostion) {
                                    if (currentPlayPosition > itemCurrentPlayPostion) {
                                        newInitPlayPostion = itemInitPlayPostion;
                                        newCurrentPlayPostion = currentPlayPosition;
                                        isMerged = true;
                                        oldVsItemIndex = i;
                                        break;
                                    } else {
                                        hasRead = true;
                                        return;
                                    }
                                }
                            }
                        }
                        if (isMerged) {
                            vsNew = "v" + videoId + "u" + userUnitId + "i" + newInitPlayPostion + "c" + newCurrentPlayPostion;

                            sum = (parseInt(videoId) + parseInt(userUnitId) + parseInt(newInitPlayPostion) + parseInt(newCurrentPlayPostion));
                            code = sum.toString();
                            if (code.length > 1) {
                                code = code.toString().substr(code.length - 1, code.length);
                                vsNew += code;
                            } else {
                                vsNew += code;
                            }
                            vsArray.splice(oldVsItemIndex, 1);
                            vsArray.push(vsNew);
                        } else {
                            vsArray.push(vs);
                        }
                        self.delCookie(currentUserId + "vs");
                        vsCookie = "";
                        for (var j = 0; j < vsArray.length; j++) {
                            vsCookie = j == 0 ? vsArray[j] : unescape(vsCookie) + unescape("%7C") + vsArray[j];
                        }
                    }
                    if (!hasRead) {
                        self.setCookie(currentUserId + "vs", vsCookie);
                    }
                });
            }
        },

        pausevideo: function () {
            this.player.pause();
            if (!this.ov.length) {
                var element = $("#player .s2 .s2-left").length == 0 ? $("#player") : $("#player .s2 .s2-left")
                this.ov = $("<div>", { 'class': 'player-ov' }).html("您的帐号正在播放其他视频，本视频暂停。<br/> 如需正常观看，请切换或<a onclick='window.location.reload();'>刷新</a>视频页面。")
                    .appendTo(element).show();
            } else if (!this.model.IsEnd) {
                this.ov.show();
            }
        },

        formatTime: function (second) {
            return [parseInt(second / 60 / 60), parseInt(second / 60 % 60), parseInt(second % 60)].join(":")
                .replace(/\b(\d)\b/g, "0$1");
        }
    };

    exports.viewModel = viewModel;
});
