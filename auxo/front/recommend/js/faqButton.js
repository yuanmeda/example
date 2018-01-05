(function ($) {
    'use strict';
    //兼容IE8，需要加载js虚拟canvas功能
//    <!--[if IE]>
//        <@res.include>
//            <@res.js path="/auxo/addins/excanvas/v1.0.0/excanvas.js"/>
//        </@res.include>
//        <![endif]-->
    var options = {
        projectCode: "",
        custom_type: "auxo-recommend",   //业务类型
        question_type: "0",              //问答类型
        name: "选课说明",                 //按钮名称
        languageCode: "zh-CN",           //语言
        skinStyle: "blue",               // 皮肤
        staticUrl: ''             //静态站地址
    }
    $(function () {
        $.fn.extend({
            faqButton: function (params) {
                options = $.extend(true, options, params);
                options.dom = $(this);
                //加载样式
                var link = document.createElement('link');
                link.rel = 'stylesheet';
                link.type = 'text/css';
                link.href = options.staticUrl + "/auxo/front/recommend/css/" + options.skinStyle + "/faqButton.css";
                document.getElementsByTagName('head')[0].appendChild(link);
                //绘制图形
                if (document.readyState === "complete") {
                    return setTimeout(drawCanvas, 1);
                }
                if (document.addEventListener) {
                    window.addEventListener("load", drawCanvas, false);
                } else if (document.attachEvent) {
                    window.attachEvent("onload", drawCanvas);
                }
                $(window).resize(function () {
                    _bottomHide();
                });
                $(window).scroll(function () {
                    _bottomHide();
                });
            }
        });
        //初始化
    });

    function drawCanvas() {
        var skinMap = {
            'blue': '#38adff',
            'green': '#3bb800',
            'red': '#ce3f3f',
            'white': '#38adff'
        };
        var skinAgbMap = {
            'blue': '#d7eeff',
            'green': '#b4e79c',
            'red': '#f8a4a4',
            'white': '#d7eeff'
        };
        if (options.languageCode == "en-US") {
            var canvasText = '\
                <div id="faqButton" class="faqCircle"><i class="circleFaq"></i><div class="canvas-text language-en"><a href="' + window.selfUrl + "/" + options.projectCode + "/faq?custom_type=" + options.custom_type + "&question_type=" + options.question_type + '" target="_blank"><span>' + options.name + '</span></a></div></div>\
                <div id="topButton" class="topCircle" style="display: none;"><i class="circleTop"></i><div class="canvas-text"><a class="sfhdb"><i class="slide-bar-uparrow"></i></a></div>\
                ';
        } else {
            var canvasText = '\
                <div id="faqButton" class="faqCircle"><i class="circleFaq"></i><div class="canvas-text"><a href="' + window.selfUrl + "/" + options.projectCode + "/faq?custom_type=" + options.custom_type + "&question_type=" + options.question_type + '" target="_blank"><span class="first_span">' + options.name.substr(0, 2) + '</span><span class="second_span">' + options.name.substr(2) + '</span></a></div></div>\
                <div id="topButton" class="topCircle" style="display:none;"><i class="circleTop"></i><div class="canvas-text"><a class="sfhdb"><i class="slide-bar-uparrow"></i></a></div>\
                ';
        }
//        function drawCircle(color) {
//            ctx.save();
//            ctx.lineJoin = "round";
//            ctx.lineWidth = 6;
//            ctx.strokeStyle = color;
//            ctx.beginPath();
//            ctx.arc(35, 35, 29, 0, 2 * Math.PI);
//            ctx.stroke();
//            ctx.restore();
//            fhdbctx.save();
//            fhdbctx.lineJoin = "round";
//            fhdbctx.lineWidth = 6;
//            fhdbctx.strokeStyle = color;
//            fhdbctx.beginPath();
//            fhdbctx.arc(35, 35, 29, 0, 2 * Math.PI);
//            fhdbctx.stroke();
//            fhdbctx.restore();
//        }
//
//        function drawBackground(canvas_id, color) {
//            if (canvas_id) {
//                if (canvas_id == 'ctx') {
//                    ctx.save();
//                    ctx.lineJoin = "round";
//                    ctx.lineWidth = 1;
//                    ctx.fillStyle = color;
//                    ctx.beginPath();
//                    ctx.arc(35, 35, 29, 0, 2 * Math.PI);
//                    ctx.fill();
//                    ctx.restore();
//                }
//                if (canvas_id == 'fhdbctx') {
//                    fhdbctx.save();
//                    fhdbctx.lineJoin = "round";
//                    fhdbctx.lineWidth = 1;
//                    fhdbctx.fillStyle = color;
//                    fhdbctx.beginPath();
//                    fhdbctx.arc(35, 35, 29, 0, 2 * Math.PI);
//                    fhdbctx.fill();
//                    fhdbctx.restore();
//                }
//            } else {
//                ctx.save();
//                ctx.lineJoin = "round";
//                ctx.lineWidth = 1;
//                ctx.fillStyle = '#fff';
//                ctx.beginPath();
//                ctx.arc(35, 35, 29, 0, 2 * Math.PI);
//                ctx.fill();
//                ctx.restore();
//                fhdbctx.save();
//                fhdbctx.lineJoin = "round";
//                fhdbctx.lineWidth = 1;
//                fhdbctx.fillStyle = '#fff';
//                fhdbctx.beginPath();
//                fhdbctx.arc(35, 35, 29, 0, 2 * Math.PI);
//                fhdbctx.fill();
//                fhdbctx.restore();
//            }
//        }
//
        options.dom.append(canvasText);
//        var canvas = document.getElementById('cv');
//        var fhdbCanvas = document.getElementById('fhdbcv');
//        if (typeof window.G_vmlCanvasManager != "undefined") {
//            canvas = window.G_vmlCanvasManager.initElement(canvas);
//            fhdbCanvas = window.G_vmlCanvasManager.initElement(fhdbCanvas);
//            var ctx = canvas.getContext("2d");
//            var fhdbctx = fhdbCanvas.getContext("2d");
//        } else {
//            var ctx = canvas.getContext("2d");
//            var fhdbctx = fhdbCanvas.getContext("2d");
//        }
//        var color = skinAgbMap[options.skinStyle] || skinMap[options.skinStyle];
//        drawCircle(color);
//        drawBackground();
        _bottomHide();
        // 鼠标hover事件
//        options.dom.find(".circle").hover(
//            function () {
//                var canvas_id = $(this).attr("canvas_id");
//                drawBackground(canvas_id, skinMap[options.skinStyle]);
//            },
//            function () {
//                var canvas_id = $(this).attr("canvas_id");
//                drawBackground(canvas_id, "#fff");
//            }
//        );

        options.dom.find('.sfhdb').click(function () {
            $('html,body').stop().animate({scrollTop: '0px'}, 200);
        });
    }

    function _bottomHide() {
        var whei = $(window).height();
        var dhei = $(document).height();
        var scot = $(window).scrollTop();
        if ((dhei <= whei) || scot == 0) {
            options.dom.find("#topButton").hide();
        } else {
            options.dom.find("#topButton").show();
        }
    }
})
(jQuery);