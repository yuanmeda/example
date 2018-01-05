define(function (require, exports, module) {
    var base64Code = 'YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4';
    var store = {
        //上报文档进度
        reportProgress: function (encode) {
            return $.ajax({
                url: (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/documents/' + resourceUuid + '/progress' + ((window.resourceType == 101 || window.resourceType == 102 || window.resourceType == 103) ? "?v=2" : ""),
                type: "POST",
                data: JSON.stringify({
                    encode: encode
                }),
                success: viewModel.success
            });
        }
    };
    var viewModel = {
        location: null,
        model: {
            currentDocId: 0,
            pageCount: 0,
            currentPos: 0,
            currentStatInterval: 10000, //上报频率 与视频那边保持一致
            playFormat: '',
            pageHeight: 0,
            pageWidth: 0,
            showType: 'horizontal',
            documentType: '0',
            //上报数据
            beginTime: 0,
            endTime: 0,
            beginPos: 0,
            endPos: 0,
            timerId: 0,
            timeerId2: 0,
            statusCode: statusCode,
            exp_config: {
                exp_length: null,
                exp_type: null
            },
            realTime: 0,
            pageRequireTime: 0
        },
        initTimer: function () {
            var countdownArea = $('#countdownArea'),
                allTime = this.model.pageCount * this.model.pageRequireTime,
                passTime = this.model.realTime;
            countdownArea.show();

            function formatTime(time) {
                var hour = ~~(time / 60 / 60 / 1000);
                var minite = ~~((time - hour * 60 * 60 * 1000) / 60 / 1000);
                var second = ~~((time - hour * 60 * 60 * 1000 - minite * 60 * 1000) / 1000);
                return (hour < 10 ? '0' + hour : hour) + ':' + (minite < 10 ? '0' + minite : minite) + ':' + (second < 10 ? '0' + second : second);
            }

            this.countdownTimer = {
                timerId: 0,
                duration: 500,
                allTime: allTime * 1000,
                passTime: passTime * 1000,
                count: function () {
                    this.passTime += this.duration;
                    if (this.passTime < this.allTime) {
                        countdownArea.text(formatTime(this.allTime - this.passTime));
                    } else {
                        countdownArea.text(i18nHelper.getKeyValue('courseComponent.front.learn.completed'));
                        viewModel.judgeReport();
                    }
                },
                start: function () {
                    this.close().count();
                    if (this.passTime < this.allTime) this.timerId = setTimeout($.proxy(this.start, this), this.duration);
                },
                close: function () {
                    clearTimeout(this.timerId);
                    return this;
                }
            };
            return this.countdownTimer;
        },
        init: function (doc) {
            this.player = doc;
            $("#documentViewer").css({
                "position": "absolute"
            });
        },
        doc: function (id, documentType, documentUrl, expConfig, parent) {
            this.parent = parent;

            if (expConfig) {
                this.model.exp_config.exp_type = expConfig.exp_type;
                this.model.exp_config.exp_length = expConfig.exp_length;
            }
            this.playing = true;
            if (documentType && documentType === 2) {
                var a = document.createElement("a");
                $("#documentViewerThree").show().siblings("div").hide();
                a.setAttribute("href", documentUrl);
                a.setAttribute("target", "_blank");
                a.setAttribute("id", "openwin");
                document.body.appendChild(a);
                a.click();
                return;
            }
            this.model.currentDocId = id;
            if (this.player.store)
                this.player.store.data.Step = 0;
            if (window.resourceType == 102) {
                this.player.config.Host = (window.selfUrl || '') + '/' + projectCode + '/v2/courses/' + courseId + '/documents';
            } else {
                this.player.config.Host = (window.selfUrl || '') + '/' + projectCode + '/courses/' + courseId + '/documents';
            }
            this.player.play(id).done($.proxy(function (data) {
                if (!this.playing)
                    return;
                $("#documentViewer").show().siblings("div").hide();
                this.model.pageCount = data.PageCount;
                this.model.beginPos = (data.CurrentPos == data.PageCount ? 0 : data.CurrentPos);
                this.model.playFormat = data.PlayFormat;
                this.model.documentType = data.DocumentType;
                this.model.showType = data.ShowType;
                this.model.pageRequireTime = data.PageRequireTime;
                this.model.realTime = data.RealTime;
                var attachments = $.map(data.Attachments || [], function (item) {
                    return {
                        alias: item.Alias,
                        size: item.Size,
                        store_object_id: item.StoreObjectId,
                        url: item.Url,
                    }
                });
                parent.model.attachmentList(attachments || []);
                if (typeof data.Skippable != 'undefined' && data.Skippable == false)
                    this.player.setBarConfig({
                        "skippablePos": data.SkippablePos //data.SkippablePos
                    });
                this.player.removeEventListener("onFullScreen", this.onFullScreen);
                this.player.addEventListener("onFullScreen", this.onFullScreen);
                this.player.removeEventListener("onExitFullScreen", this.onExitFullScreen);
                this.player.addEventListener("onExitFullScreen", this.onExitFullScreen);

                this.player.addEventListener("onLoad", $.proxy(function () {
                    this.player.removeEventListener("onNumChange", this.onNumChange);
                    this.player.addEventListener("onNumChange", this.onNumChange);
                    this.player.removeEventListener("onNext", this.onNext);
                    this.player.addEventListener("onNext", this.onNext);
                }, this));

                viewModel.goPage();
            }, this));
        },
        onFullScreen: function () {
            $("div.learning-side").hide();
        },
        onExitFullScreen: function () {
            $("div.learning-side").show();
        },
        onNext: function () {
            //viewModel.judgeReport();
        },
        onNumChange: function () {
            var t = viewModel;
            var currentPage = t.player.getCurrentPage();
            var totalPage = t.player.store.data.PageCount;

            if (ko.unwrap(t.model.statusCode) != 20) {
                if (currentPage > t.model.exp_config.exp_length) {
                    $('#exp').show();
                    $('#playerContainer').hide();
                    return;
                }
            }
            viewModel.judgeReport();
        },
        isExp: function () {
            if (ko.unwrap(viewModel.model.exp_config) != null && ko.unwrap(viewModel.model.exp_config.exp_type) == 1 && ko.unwrap(viewModel.model.statusCode) != 20) {
                return true;
            }
            return false;
        },
        goPage: function () {
            if (this.player.checkStatus() === false) {
                this.model.timeerId2 = setTimeout(function () {
                    viewModel.goPage();
                }, 200);
            } else {
                this.model.beginTime = parseInt(new Date().getTime() / 1000);
                this.player.go(this.location ? this.location : this.model.beginPos);
                this.createTimer();
                if (this.model.pageRequireTime) this.initTimer().start();
                if (this.model.beginPos === 0) {
                    this.judgeReport();
                }
            }
        },
        resize: function () {
            viewModel.player.resize();
        },
        docfinish: function () {
            this.clearTimer();
            $("#documentViewer").empty();
            document.getElementById("threeIframe").src = "";
        },
        createTimer: function () {
            var t = this;
            this.model.timerId = window.setInterval(function () {
                t.judgeReport();
            }, this.model.currentStatInterval);
        },
        clearTimer: function () {
            this.playing = false;
            window.clearInterval(this.model.timerId);
            window.clearInterval(this.model.timeerId2);
        },
        judgeReport: function () {
            if (!userLogined)
                return;
            var _currentPage = viewModel.player.getCurrentPage();

            //判断是否上报
            if (isNaN(parseInt(_currentPage))) {
                if (statusCode == "20") {
                    viewModel.reportting = true;
                } else if (_currentPage > viewModel.model.exp_config.exp_length ||
                    _currentPage < viewModel.model.beginPos ||
                    viewModel.reportting) {
                    viewModel.reportting = false;
                    return;
                }
            }
            if (isNaN(parseInt(_currentPage))) return;
            viewModel.reportting = true;
            var endTime = parseInt(new Date().getTime() / 1000);
            //允许当页重复上报观看的时长
            var ps = viewModel.model.beginPos == _currentPage ? viewModel.model.beginPos - 1 : viewModel.model.beginPos,
                pe = _currentPage;
            if (ps > pe) {
                var temp = ps;
                ps = pe;
                pe = temp;
            }
            var _codeStr = [{
                ps: ps,
                pe: pe,
                ts: viewModel.model.beginTime,
                te: endTime
            }];
            var _encode = encrypt_3des(base64_decode(base64Code), JSON.stringify(_codeStr));
            viewModel.model.beginTime = endTime;
            viewModel.model.beginPos = _currentPage;
            store.reportProgress(_encode).then(function () {
                viewModel.reportting = false;
            }, function () {
                viewModel.reportting = false;
            });
        }
    };
    exports.viewModel = viewModel;
});
