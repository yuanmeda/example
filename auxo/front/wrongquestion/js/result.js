(function ($, window) {
    var store = {
        getResult: function () {
            var data = {
                "user_latest_answer_time": $.cookie('user_latest_answer_time') && $.cookie('user_latest_answer_time') != 'null' ? decodeURIComponent($.cookie('user_latest_answer_time')) : ''
            };

            return $.ajax({
                url: examUr + '/v1/user_exam_sessions/' + sessionId + (data.user_latest_answer_time? '?user_latest_answer_time=' + data['user_latest_answer_time'] : '')
            });
        },
        buildAnswer: function (examId, paperId) {
            var data = {
                "exam_paper_strategy_type": 0,
                "paper_ids": [paperId]
            };
            return $.ajax({
                url: examUr + '/v1/user_exam_sessions?exam_id=' + examId,
                type: 'POST',
                data: JSON.stringify(data)
            })
        }
    };

    var viewModel = {
        model: {
            exam: {
                "id": "12345678-1234-1234-1234-1234567890ab",
                "user_id": 0,
                "exam_id": "12345678-1234-1234-1234-1234567890ab",
                "user_paper_answer_id": "12345678-1234-1234-1234-1234567890ab",
                "user_paper_mark_id": "12345678-1234-1234-1234-1234567890ab",
                "paper_id": "12345678-1234-1234-1234-1234567890ab",
                "status": 0,
                "score": 0.0,
                "passed": true,
                "create_time": "2015-01-01T00:00:00",
                "update_time": "2015-01-01T00:00:00",
                "total_question_number": 0,
                "answer_question_number": 0,
                "correct_question_number": 0,
                "cost_time": 0,
                "fix_cost_time": 0,
                "submit_time": "2015-01-01T00:00:00",
                "mark_time": "2015-01-01T00:00:00"
            },
            title:''
        },
        init: function () {
            var t = this;
            store.getResult().done(function (d) {
                d.percent = Math.round((d.correct_question_number / d.total_question_number) * 100);
                t.model.exam = d;
                t.drawCanvas(d.percent);

                t.model = ko.mapping.fromJS(t.model);
                ko.applyBindings(t);
                if (type == 4){
                    t.model.title('类似题练习报告');
                } else {
                    t.model.title('错题重做报告');
                }
            });
        },
        answerAgain: function () {
            store.buildAnswer(this.model.exam.exam_id(), this.model.exam.paper_id()).done(function (d) {
                location.replace(selfUrl + '/' + projectCode + '/wrong_question/answer?sessionId=' + d.id + '&type=' + type);
            });
        },
        drawCanvas: function (percent) {
            var x = percent; //进度

            var c = document.getElementById('canvas');
            var ctx = c.getContext("2d");
            ctx.canvas.width = 200;
            ctx.canvas.height = 200;

            //起始一条路径
            ctx.beginPath();
            //设置当前线条的宽度
            ctx.lineWidth = 10; //10px
            //设置笔触的颜色
            ctx.strokeStyle = '#ccc';
            //arc() 方法创建弧/曲线（用于创建圆或部分圆）
            ctx.arc(100, 100, 95, 0, 2 * Math.PI);
            //绘制已定义的路径
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 10;
            ctx.strokeStyle = '#5095eb';
            //设置开始处为0点钟方向(-90 * Math.PI / 180)
            //x为百分比值(0-100)
            ctx.arc(100, 100, 95, -95 * Math.PI / 180, (x * 3.6 - 95) * Math.PI / 180);
            ctx.stroke();
        }
    };

    $(function () {
        viewModel.init();
    });

})(jQuery, window);