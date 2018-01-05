define(function (require, exports, module) {

    var store = {
        getDoc: function (data, success) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/home/GetDocInfo",
                type: "Get",
                data: data,
                cache: false,
                success: success
            });
        },
        statDoc: function (data, success) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/home/StatDocument",
                type: "Post",
                data: data,
                cache: false,
                success: success
            });
        },
        reporttask: function (taskid) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/home/ReportTask",
                type: "Get",
                data: {taskId: taskid},
                cache: false
            });
        },
        savecurrentpage: function (data) {
            $.ajax({
                url: "/" + projectName + "/" + targetId + "/" + courseId + "/learn/home/SaveCurrentPage",
                type: "Post",
                data: data,
                cache: false
            });
        }
    };

    // var timer = require("timer");

    var viewModel = {
        model: {
            currentDocId: 0,
            avg: 0,
            max: 0,
            end: 0,
            count: 0,
            timehtml: '',
            endhtml: '',
            isReaded: false,
            currentSeconds: 0,
            currentPage: 0
        },
        note: {
            Id: 0,
            Content: ""
        },
        init: function (document) {
            this.player = document;
            $("#documentViewer").css({"position": "absolute"});
            this.model.avg = avg;
            this.model.max = max;
            this.model.currentDocId = documentId;
            this.model.currentStatInterval = documentStatInterval;
        },
        registertimer: function () {
            timer.removeHandler('finish');
            timer.removeHandler("tick");
            timer.removeHandler("stat");
            timer.startTimeline();

            var t = this;
            var a = t.model.avg * t.model.count;
            var b = t.model.max * 60;
            t.model.end = a < b ? a : b;
            t.model.endhtml = t._toTimeString(t.model.end * 1000);

            timer.appendHandler("finish", timer.time() + t.model.end * 1000 - t.model.currentSeconds * 1000, $.proxy(t.finish, t));
            timer.appendRepeateHandler("stat", $.proxy(t.statDoc, t, t.model.currentDocId), Number.MAX_VALUE, t.model.currentStatInterval * 1000);
            timer.appendRepeateHandler("tick", $.proxy(t.tick, t), Number.MAX_VALUE, 400);
        },
        tick: function () {
            var t = this;
            if (!t.model.isReaded) {
                t.model.timehtml = t._toTimeString(t.model.currentSeconds * 1000 + timer.getTotalSpan());
                //$(".countdown-box").html("已阅读：" + t.model.timehtml + "&nbsp;/要求：" + t.model.endhtml);
                t.player.showTime(t.model.timehtml + "/" + t.model.endhtml, "");
            }
        },
        finish: function () {
            timer.removeHandler('finish');
            timer.removeHandler("tick");
            timer.removeHandler("stat");
            var t = this;
            t.statDoc(t.model.currentDocId);
        },

        docfinish: function () {
            viewModel.finish();
            $("#documentViewer").empty();
            document.getElementById("threeIframe").src = "";
        },

        doc: function (id, documentType, documentUrl) {
            if (documentType === 2) {
                var a = document.createElement("a");
                a.setAttribute("href", documentUrl);
                a.setAttribute("target", "_blank");
                a.setAttribute("id", "openwin");
                document.body.appendChild(a);
                a.click();
                return;
            }
            var self = this;
            self.model.currentDocId = id;
            if (viewModel.player.store)
                viewModel.player.store.data.Step = 0;
            store.getDoc({documentId: id}, function (data) {
                self.player.play(parseInt(id));

                self.model.count = data.Count;
                self.model.isReaded = data.IsReaded;
                self.model.currentSeconds = data.Seconds;
                self.model.currentPage = data.CurrentPage;
                if (!data.IsReaded) {
                    //$("#documentViewer").prepend("<span class='countdown-box'>" + "已阅读：" + self.model.timehtml + "&nbsp;/要求：" + self.model.endhtml + "</span>");
                    self.registertimer();
                }
                else {
                    self.player.showTime("", "");
                }
                self.player.removeEventListener("onFullScreen", self.onFullScreen);
                self.player.addEventListener("onFullScreen", self.onFullScreen);
                self.player.removeEventListener("onExitFullScreen", self.onExitFullScreen);
                self.player.addEventListener("onExitFullScreen", self.onExitFullScreen);

                self.player.addEventListener("onLoad", function () {
                    self.player.removeEventListener("onNumChange", self.onNumChange);
                    self.player.addEventListener("onNumChange", self.onNumChange);
                });
                viewModel.goPage();
            });
        },
        onFullScreen: function () {
            $("div.learning-side").hide();
        },
        onExitFullScreen: function () {
            $("div.learning-side").show();
        },
        onNumChange: function () {
            store.savecurrentpage({documentId: viewModel.model.currentDocId, currentPage: this.getCurrentPage()});
        },

        goPage: function () {
            if (viewModel.player.checkStatus() === false) {
                setTimeout(function () {
                    viewModel.goPage();
                }, 200);
            }
            else {
                viewModel.player.go(viewModel.model.currentPage);
            }
        },

        resize: function () {
            viewModel.player.resize();
        },

        statDoc: function (id) {
            if (id === 0)
                return;
            var totalSpan = timer.getTotalSpan();
            var seconds = totalSpan === undefined ? this.model.currentSeconds : this.model.currentSeconds + parseInt(totalSpan / 1000);

            store.statDoc({documentId: id, seconds: seconds}, function (data) {
                if (!data.IsLogined)
                    location.href = '/' + currentProject.DomainName + '/enrolls/user/login';
                if (data.IsFinished) {
                    viewModel.player.showTime("", "");
                }
            });
            if (task.TaskId > 0) {
                if (task.ResourceId === 0 ||
                    (task.ResourceId === viewModel.model.currentDocId && task.ResourceType === 1)) {
                    store.reporttask(task.TaskId);
                }
            }
        },
        _toTimeString: function (span) {
            span = parseInt(span / 1000);
            var h = parseInt(span / 3600);
            var m = parseInt(span / 60) % 60;
            var s = span % 60;

            return (m < 10 ? '0' + m : m) + ":" + (s < 10 ? '0' + s : s);
        }
    };

    module.exports={
        viewModel:viewModel,
        store:store
    };
});

