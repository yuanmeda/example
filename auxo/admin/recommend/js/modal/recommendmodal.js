$(function () {
        $.recommend = function (options) {
            $("#recommendModal").modal("show");
            var msg = {
                "type": "getItems",
                "data": {
                    "event_type": "get_items",
                    "context_id": "",
                    "data": {}
                },
                "origin": location.host,
                "timestamp": +new Date()
            };
            if (options.type == "auxo-exam-center") {
                $("#recommendModalHeader").text("选择测评");
                var src = elearningWebpageUrl + "/" + projectCode + "/exam_center/exam?options=" + (options.options || 'false') + '&cors=true';
                $("#recommendModal").find("iframe").attr("src", src);
            }
            else if (options.type == "auxo-open-course") {
                $("#recommendModalHeader").text("选择公开课");
                var src = opencourseWebpage + "/" + projectCode + "/open_course?options=" + (options.options || 'false') + '&cors=true';
                if(options.regist === 1) src = src + "&regist_type=" + options.regist;
                $("#recommendModal").find("iframe").attr("src", src)
            }
            else {
                if (options.type == "auxo-train") {
                    $("#recommendModalHeader").text("选择培训认证");
                    var src = trainWebpage + "/" + projectCode + "/train/modal?options=" + (options.options || 'false') + '&cors=true';
                    if(options.regist === 0) src = src + "&regist_type=" + options.regist;
                    $("#recommendModal").find("iframe").attr("src", src)
                }
            }
            $(".modal-footer #saveModalCourse").on("click", function () {
                $("#recommendModal").modal("hide");
                window.frames[0].postMessage(JSON.stringify(msg), '*');
                window.addEventListener('message', function (e) {
                    var resData = JSON.parse(e.data);
                    if (resData.data.event_type == 'set_items') {
                        window.selectedCourse = options.options ? resData.data.data.items : resData.data.data.items[0];
                        options.success(window.selectedCourse);
                    }
                }, false);
            })
        }
    }
);
