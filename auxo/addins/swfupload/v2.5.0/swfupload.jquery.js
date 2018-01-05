/*
 * SWFUpload jQuery Plugin v1.0.0
 *
 * Copyright (c) 2014 Tang Yanxin
 * Licensed under the MIT license.
 *
 */
;(function ($) {
    var defaultHandlers = [
        'swfupload_preload_handler',//swfuploadPreload
        'swfupload_load_failed_handler',//swfuploadLoadFailed
        'swfupload_loaded_handler',//swfuploadLoaded
        'file_dialog_start_handler',//fileDialogStart :刚打开选择框时
        'file_queued_handler',//fileQueued: 选好的 符合要求的文件，每个文件触发一次
        'file_queue_error_handler',//fileQueueError :选择的不符合要求文件 每个文件触发一次
        'file_dialog_complete_handler',//fileDialogComplete:关闭选择框时
        'upload_resize_start_handler',//uploadResizeStart
        'upload_start_handler',//uploadStart :每个文件开始上传前
        'upload_progress_handler',//uploadProgress :每个文件上传进度 linux下只会触发一次
        'upload_error_handler',//uploadError :每个文件 上传中出错
        'upload_success_handler',//uploadSuccess :每个文件上传成功 这是会收到服务端给出的反馈数据 uploadSuccess: function (file, serverData) 基础平台在上传完成后服务端如果给出的serverData.Code!=0 也是错误的
        'upload_complete_handler',//uploadComplete :每个文件 上传完成时
        'mouse_click_handler',//mouseClick
        'mouse_out_handler',//mouseOut
        'mouse_over_handler',//mouseOver
        'queue_complete_handler'//queueComplete :全部上传完成时触发
    ];
    //用来加入额外的事件 如给swfup写插件 添加事件
    var additionalHandlers = [];

    var methods = {
        init: function (options) {
            var args = $.makeArray(arguments);

            // 在每个元素上执行方法
            return this.each(function () {
                var $this = $(this),
                    swfu = $(this).data('__swfu');
                if (!swfu) {
                    var settings = $.extend(true, {}, $.fn.swfupload.defaults, args[0]),
                        $uploadControlWrap = $(this),
                        handlers = [];
                    
                    //把当前jquery选中的元素$(this)作为swf的容器 用来缓存实例、支持多事件
                    if (!settings['button_placeholder_id'] || $uploadControlWrap.attr("id") == settings['button_placeholder_id']) {
                        var id = "btn_" + (new Date()).getTime() + Math.floor(Math.random() * 1000);
                        $this.append($('<span>', { id: id }));
                        $.extend(settings, {
                            'button_placeholder_id': id,
                            'button_width': settings['button_width'] || '100%',
                            'button_height': settings['button_height'] || '100%'
                        })
                        settings['button_placeholder_id'] = id;
                    }

                    $.merge(handlers, defaultHandlers);
                    $.merge(handlers, additionalHandlers);
                    $.each(handlers, function (i, v) {
                        var eventName = v.replace(/_handler$/, '').replace(/_([a-z])/g, function () {
                            //替换  _首字母小写 ==>_首字母大写
                            return arguments[1].toUpperCase();
                        });
                        //如果配置中有设置事件 保留事件
                        if ($.isFunction(settings[v])) {
                            $uploadControlWrap.bind(eventName, settings[v]);
                        }
                        //用jquery事件覆盖原事件回调
                        settings[v] = function () {
                            //triggerHandler不执行浏览器默认操作 triger会执行浏览器默认操作
                            $uploadControlWrap.triggerHandler(eventName, $.makeArray(arguments));
                        };
                    });
                    // 保存我们新创建的实例
                    $(this).data('__swfu', new SWFUpload(settings));

                }
            });
        },
        destroy: function () {
            return $(this).each(function () {
                // 删除元素对应的数据
                $(this).removeData("__swfu");
            });
        },
        instance: function () {
            // 获取选择器中的第一个元素的实例作为返回值 所以最好是用id做选择器
            var swfu = this.eq(0).data("__swfu");

            return swfu;
        }
    };

    $.fn.swfupload = function () {
        var method = arguments[0],
            args=[];

        if (methods[method]) {
            method = methods[method];
            args = Array.prototype.slice.call(arguments, 1);
        } else if (typeof method === "object" || !method) {
            method = methods.init;
            args = arguments;
        } else {
            $.error("Method" + method + "does not exist on jQuery.swfupload");
            return this;
        }

        return method.apply(this, args);
    };

    $.swfupload = {
        additionalHandlers: function () {
            if (arguments.length === 0) {
                return additionalHandlers.slice();
            } else {
                $(arguments).each(function (i, v) {
                    $.merge(additionalHandlers, $.makeArray(v));
                });
            }
        },
        defaultHandlers: function () {
            return defaultHandlers.slice();
        },
        getInstance: function (el) {
            return $(el).data('__swfu');
        }
    };


    $.fn.swfupload.defaults = {
        upload_url: "http://debug.cloud.91open.huayu.nd//v3/store/object/upload",//修改为对应环境的host 测试test.cloud.91open.huayu.nd 正式;cloud.91open.com
        flash_url: "http://test.static.huayu.nd/addins/swfupload/flash/swfupload.swf",//修改为对应环境的host 测试test.static.huayu.nd 正式源机;s1.tianyuimg.com 正式cdn:s21~s25.tianyuimg.com
        // file_post_name : "Filedata",
        custom_settings: {
            //progressTarget: "fsUploadProgress" //自定义参数 可以冲过swf实例.customSettings取到 如果this.customSettings.progressTarget
        },
        post_params: {
            //"bucketName": "$video",//必须 图片：$image； 视频$video
            //"name": "filename",//文件名（可选）
            //"AccessToken": "118b155d802d4e12966571aa7b815ad2"//必须 基础平台的token 后台程序应该有给出
        },
        use_query_string: true,//基础平台要求 用get方式发参数
        //requeue_on_error: false,
        //http_success: [201, 202],
        //assume_success_timeout: 0,
        //file_types: "*.jpg;*.gif;*.png;",//限制上传的类型 格式要求："*.jpg;*.gif;*.png;"
        //file_types_description: "Web图片",
        file_size_limit: "500MB",//默认单位是KB 可以指定单位 如设置为 2MB
        file_upload_limit: 0,//默认不限制上传文件总个数
        file_queue_limit: 0,//默认不限制单次选择的文件个数

        debug: false,

        prevent_swf_caching: false,//不阻止flash被缓存
        //preserve_relative_urls: false,

        //button_placeholder_id: "element_id",//替换为falsh的元素id  ps：使用swfupload.jquery的时候 如果没有指定id 会内容生成一个
        // button_image_url: "http://9dian.me/images/TestImageNoText_65x29.png",
        button_width: "100%",
        button_height: "100%",
        button_text: "<span class='redText'>请选择</span>",
        button_text_style: ".redText { color: #ffffff; text-align: center; }",//文字默认水平居中
        button_text_left_padding: 0,
        button_text_top_padding: 5,
        button_action: SWFUpload.BUTTON_ACTION.SELECT_FILES,
        //button_disabled: false,//禁用flash按钮
        button_cursor: SWFUpload.CURSOR.HAND,//鼠标手型
        button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT//flash按钮默认透明

        // swfupload_loaded_handler : SWFUPHelper.swfuploadLoaded,
        // file_dialog_start_handler : SWFUPHelper.filedialogStart,            
        //debug_handler: SWFUPHelper.debug,
        //file_queued_handler: SWFUPHelper.fileQueued,
        //file_queue_error_handler: SWFUPHelper.fileQueueError,
        //file_dialog_complete_handler: SWFUPHelper.fileDialogComplete,
        //upload_start_handler: SWFUPHelper.uploadStart,
        //upload_progress_handler: SWFUPHelper.uploadProgress,
        //upload_error_handler: SWFUPHelper.uploadError,
        //upload_success_handler: SWFUPHelper.uploadSuccess,
        //upload_complete_handler: SWFUPHelper.uploadComplete,
        //queue_complete_handler: SWFUPHelper.queueComplete
    };
})(jQuery);