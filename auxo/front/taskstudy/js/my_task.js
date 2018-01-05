/**
 * Created by Administrator on 2017.5.4.
 */
(function ($, window) {
    'use strict';
    //数据仓库
    var store = {
        //任务列表(GET)
        taskList: function () {
            var url = _self_url + '/v1/user_tasks';
            return $.ajax({
                url: url
            });
        }
    };
    //任务列表数据模型
    var viewModel = {
        model: {
            taskList: []
        },
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            //ko监听数据
            this.model = ko.mapping.fromJS(this.model);
            //ko绑定作用域
            ko.applyBindings(this, document.getElementById('container'));
            //加载列表
            this._list();
        },
        /**
         * 课程列表初始化
         * @return {null} null
         */
        _list: function () {
            var _self = this;
            store.taskList().done(function (data) {
                if (data) {
                    _self.model.taskList(data);
                    _self.drawCanvas(data);
                }
            });
        },
        drawCanvas: function (datas) {
            for (var i = 0; i < datas.length; i++) {
                var data = datas[i];
                var canvas = document.getElementById('canvas_' + data.user_task.task_code),
                    ctx = canvas.getContext("2d");

                ctx.beginPath();
                ctx.lineWidth = 3;
                ctx.strokeStyle = "#dfdfdf";
                ctx.arc(33, 33, 30, 0, 2 * Math.PI);
                ctx.stroke();

                if (data.status === -1 || data.user_task.task_status === 4) {  /*不合格，超期*/
                    if (data.progress >= 100) {
                        ctx.beginPath();
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = "#ff9999";
                        ctx.arc(33, 33, 30, 0, 2 * Math.PI);
                        ctx.stroke();
                    } else {
                        ctx.beginPath();
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = '#ff9999';
                        ctx.arc(33, 33, 30, -90 * Math.PI / 180, (100 * 3.6 - 90) * Math.PI / 180);
                        ctx.stroke();
                    }
                } else {
                    if (data.progress >= 100) {
                        ctx.beginPath();
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = "#38adff";// 换肤时，此处由开发自行修改颜色，红色色值：#ce3f3f，绿色色值：#3bb800
                        ctx.arc(33, 33, 30, 0, 2 * Math.PI);
                        ctx.stroke();
                    } else {
                        ctx.beginPath();
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = '#38adff';// 换肤时，此处由开发自行修改颜色，红色色值：#ce3f3f，绿色色值：#3bb800
                        ctx.arc(33, 33, 30, -90 * Math.PI / 180, (data.progress * 3.6 - 90) * Math.PI / 180);
                        ctx.stroke();
                    }
                }
            }

        },
        getExtext: function (data) {
            return "+" + data.num + "" + data.name;
        },
        /**
         *
         * @param 转换时间
         */
        forMatter: function (time) {
            var str = time.substring(0, 16);
            return str.replace('T', ' ');
        },
        testFun: function (str) {
            if (str.length > 250) {
                str = str.substring(0, 250) + '...';
            }
            return str;
        },
        showMore: function (element, data) {
            var parentNode = element.parentElement;
            $(parentNode).removeClass('task-limit');
            var str = data.user_task.desc;
            if (str.length > 1000) {
                str = str.substring(0, 1000);
                $(element.previousSibling.children[1]).text(str + '...');
            } else {
                $(element.previousSibling.children[1]).text(str);
            }

        }
    };
    /**
     * 执行程序
     */
    $(function () {
        viewModel._init();
    })


})(jQuery, window);