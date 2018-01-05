window.SWFUPHelper = window.SWFUPHelper || {
    IMAGES: "*.bmp;*.jpg;*.gif;*.png;*.jpeg;*.ico;",
    VIDEOS: "*.wmv;*.asf;*.asx;*.rm;*.rmvb;*.mpg;*.mpeg;*.mpe;*.3gp;*.mov;*.mp4;*.m4v;*.avi;*.dat;*.mkv;*.flv;*.f4v;*.vob;",
    AUDIOS: "*.mp3;*.aac;*.wav;*.wma;*.cda;*.flac;*.m4a;*.mid;*.mka;*.mp2;*.mpa;*.mpc;*.ape;*.ofr;*.ogg;*.ra;*.wv;*.tta;*.ac3;*.dts;",

    debug: function (msg) {
        window.console && console.log(msg);
    },
    //选好的文件符合要求是，每个文件触发一次
    fileQueued: function (evt, file) {
        var swfu = $(this).swfupload("instance");
        try {
            if (file)
                var progress = new FileProgress(file, swfu.customSettings.progressTarget);
            progress.setStatus("正在等待...");
            progress.toggleCancel(true, swfu);

        } catch (ex) {
            swfu.debug(ex);
        }

    },
    //选择的文件不符合要求 每个文件触发一次
    fileQueueError: function (evt, file, errorCode, message) {
        var swfu = $(this).swfupload("instance");
        try {
            if (errorCode === SWFUpload.QUEUE_ERROR.QUEUE_LIMIT_EXCEEDED) {
                alert("您正在上传的文件队列过多.\n" + (message === 0 ? "您已达到上传限制" : "您最多能选择 " + (message > 1 ? "上传 " + message + " 文件." : "一个文件.")));
                return;
            }

            var progress = new FileProgress(file, swfu.customSettings.progressTarget);
            progress.setError();
            progress.toggleCancel(true);

            switch (errorCode) {
                case SWFUpload.QUEUE_ERROR.FILE_EXCEEDS_SIZE_LIMIT:
                    progress.setStatus("文件尺寸过大.");
                    swfu.debug("错误代码: 文件尺寸过大, 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
                case SWFUpload.QUEUE_ERROR.ZERO_BYTE_FILE:
                    progress.setStatus("无法上传零字节文件.");
                    swfu.debug("错误代码: 零字节文件, 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
                case SWFUpload.QUEUE_ERROR.INVALID_FILETYPE:
                    progress.setStatus("不支持的文件类型.");
                    swfu.debug("错误代码: 不支持的文件类型, 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
                default:
                    if (file !== null) {
                        progress.setStatus("未处理的错误");
                    }
                    swfu.debug("错误代码: " + errorCode + ", 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
            }
        } catch (ex) {
            swfu.debug(ex);
        }
    },
    //弹窗关闭
    fileDialogComplete: function (evt, numFilesSelected, numFilesQueued) {
        var swfu = $(this).swfupload("instance");
        try {
            /* 选好就开始上传 */
            swfu.startUpload();
        } catch (ex) {
            swfu.debug(ex);
        }
    },
    //每个文件开始上传前
    uploadStart: function (evt, file) {
        var swfu = $(this).swfupload("instance");
        try {
            /*linux系统uploadProgress只会调用一次 flash上传会卡渲染线程*/
            var progress = new FileProgress(file, swfu.customSettings.progressTarget);
            progress.setStatus("正在上传...");
        }
        catch (ex) {
            swfu.debug(ex);
        }
    },
    //每个文件上传进度
    uploadProgress: function (evt, file, bytesLoaded, bytesTotal) {
        var swfu = $(this).swfupload("instance");
        try {
            var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);

            var progress = new FileProgress(file, swfu.customSettings.progressTarget);
            progress.setProgress(percent);
            progress.setStatus("文件已上传<b>" + percent + "%</b>");
        } catch (ex) {
            swfu.debug(ex);
        }
    },
    //每个文件上传成功
    uploadSuccess: function (evt, file, serverData) {
        var swfu = $(this).swfupload("instance");
        try {
            var serverData = eval("(" + serverData + ")"), imgURL = "";
            if (serverData.Code > 0) {
                swfu.uploadError(file, serverData.Code, serverData.Message);
            } else {
                var progress = new FileProgress(file, swfu.customSettings.progressTarget), imgInfo = null;
                if (serverData.Data) {
                    //传图片时对浏览器支持的格式提供预览
                    if (swfu.settings.post_params && swfu.settings.post_params.bucketName == "$image") {
                        //SWFUPHelper.IMAGES中的图片格式浏览器都可以支持 PCX|DCX|EMF|JIF|JPE|JFIF|EPS|TIF|RLE|DIB|PCD|DXF|ICO|WMF|TIFF|TGA 这些格式浏览器不能预览 
                        var postfix = SWFUPHelper.IMAGES.replace(/\*\./g, "").replace(/;/g, "|");
                        postfix = postfix.substr(0, postfix.length - 1);

                        if ((new RegExp(".(" + postfix + ")", "ig")).test(file.type)) {
                            imgURL = $.isArray(serverData.Data) ? serverData.Data[0].AbsoluteUrl : serverData.Data.AbsoluteUrl;
                        } else {
                            imgURL = "";
                        }

                        imgInfo = {
                            src: imgURL,
                            css: {
                                width: "100%",
                                //height: '200px'
                            }
                        };
                    }
                }
                progress.setComplete(imgInfo);
                progress.setStatus("上传成功");
                progress.toggleCancel(false);
            }
        } catch (ex) {
            swfu.debug(ex);
        }
    },
    //每个文件 上传中或后 错误
    uploadError: function (evt, file, errorCode, message) {
        var swfu = $(this).swfupload("instance");
        try {
            var progress = new FileProgress(file, swfu.customSettings.progressTarget);
            progress.setError();
            progress.toggleCancel(true);

            switch (errorCode) {
                case SWFUpload.UPLOAD_ERROR.HTTP_ERROR:
                    progress.setStatus("上传错误: " + message);
                    swfu.debug("错误代码: HTTP错误, 文件名: " + file.name + ", 信息: " + message);
                    break;
                case SWFUpload.UPLOAD_ERROR.UPLOAD_FAILED:
                    progress.setStatus("上传失败");
                    swfu.debug("错误代码: 上传失败, 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
                case SWFUpload.UPLOAD_ERROR.IO_ERROR:
                    progress.setStatus("服务器 (IO) 错误");
                    swfu.debug("错误代码: IO 错误, 文件名: " + file.name + ", 信息: " + message);
                    break;
                case SWFUpload.UPLOAD_ERROR.SECURITY_ERROR:
                    progress.setStatus("安全错误");
                    swfu.debug("错误代码: 安全错误, 文件名: " + file.name + ", 信息: " + message);
                    break;
                case SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED:
                    progress.setStatus("超出上传限制.");
                    swfu.debug("错误代码: 超出上传限制, 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
                case SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED:
                    progress.setStatus("无法验证.  跳过上传.");
                    swfu.debug("错误代码: 文件验证失败, 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
                case SWFUpload.UPLOAD_ERROR.FILE_CANCELLED:
                    // 如果队列中的文件都被取消
                    progress.setStatus("取消上传");
                    break;
                case SWFUpload.UPLOAD_ERROR.UPLOAD_STOPPED:
                    progress.setStatus("暂停上传");
                    break;
                default:
                    progress.setStatus(errorCode + "错误: " + message);
                    swfu.debug("错误代码: " + errorCode + ", 文件名: " + file.name + ", 文件尺寸: " + file.size + ", 信息: " + message);
                    break;
            }
        } catch (ex) {
            swfu.debug(ex);
        }
    },
    //每个文件 上传完成时 如果队列中还有文件未上传 自动上传队列中的第一个文件
    uploadComplete: function (evt, file) {
        var swfu = $(this).swfupload("instance");
        var stats = swfu.getStats();
        if (stats && stats.files_queued > 0) {
            swfu.startUpload();
        }
    },

    //全部上传完成时触发
    queueComplete: function (evt, numFilesUploaded) {

    }
};

//默认配置
window.SWFUPDefaultSetting = window.SWFUPDefaultSetting || {
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
    button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT,//flash按钮默认透明

    // swfupload_loaded_handler : SWFUPHelper.swfuploadLoaded,
    // file_dialog_start_handler : SWFUPHelper.filedialogStart,            
    debug_handler: SWFUPHelper.debug,
    file_queued_handler: SWFUPHelper.fileQueued,
    file_queue_error_handler: SWFUPHelper.fileQueueError,
    file_dialog_complete_handler: SWFUPHelper.fileDialogComplete,
    upload_start_handler: SWFUPHelper.uploadStart,
    upload_progress_handler: SWFUPHelper.uploadProgress,
    upload_error_handler: SWFUPHelper.uploadError,
    upload_success_handler: SWFUPHelper.uploadSuccess,
    upload_complete_handler: SWFUPHelper.uploadComplete,
    queue_complete_handler: SWFUPHelper.queueComplete
};

function FileProgress(file, targetID) {
    //if (typeof file == "string") {
    //    this.fileProgressID = (new Date()).getTime();
    //} else {
    //    this.fileProgressID = file.id;
    //}
    this.fileProgressID = file.id;
    this.opacity = 100;

    if (!$('#' + this.fileProgressID).length) {
        var tmpl = '';
        tmpl = tmpl + '<div class="progress-wrapper" id=' + this.fileProgressID + '>';
        tmpl = tmpl + '   <div class="progress-container">';
        tmpl = tmpl + '       <a class="progress-close" href="javascript:void(0);" style="visibility: hidden;">删除</a>';
        tmpl = tmpl + '       <div class="progress-name">' + file.name + '</div>';
        tmpl = tmpl + '       <div class="progress progress-striped active">';
        tmpl = tmpl + '           <div class="bar"></div>';
        tmpl = tmpl + '       </div>';
        tmpl = tmpl + '       <div class="progress-bar-status"></div>';
        tmpl = tmpl + '   </div>';
        tmpl = tmpl + '   <div class="img-container" style="display:none;">';
        tmpl = tmpl + '      <a class="progress-close progress-close-img" href="javascript:void(0);">&times;</a>';
        tmpl = tmpl + '       <img class="img-preview"/>';
        tmpl = tmpl + '   </div>';
        tmpl = tmpl + '</div>';

        $('#' + targetID).prepend(tmpl);
    }
    this.$fileprogressWrapper = $('#' + this.fileProgressID);
    this.$progressContainer = $('.progress-container', this.$fileprogressWrapper);
    this.$progressCancel = $('.progress-container .progress-close', this.$fileprogressWrapper);
    this.$progress = $('.progress-container .progress', this.$fileprogressWrapper);
    this.$progressBar = $('.progress-container .progress .bar', this.$fileprogressWrapper);
    this.$progressStatus = $('.progress-container .progress-bar-status', this.$fileprogressWrapper);
    this.$imgContainer = $('.img-container', this.$fileprogressWrapper);
    this.$imgPreview = $('.img-container .img-preview', this.$fileprogressWrapper);

    var t = this;
    $('.progress-close', this.$fileprogressWrapper).click(function () {
        t.$fileprogressWrapper.fadeOut(400, function () {
            t.$fileprogressWrapper.remove();
        });
    });
    //给出图片
    //if (typeof file == "string") {
    //    this.$progressContainer.hide();
    //    this.$imgContainer.show();
    //    this.$imgPreview.attr("src", file);
    //}
}
FileProgress.prototype = {
    constructor: FileProgress,
    setProgress: function (percentage) {
        this.$progressBar.width(percentage + "%");
    },
    setComplete: function (imgInfo) {
        this.$progress.removeClass('active')
        this.$progressBar.width("100%");
        if (imgInfo) {
            this.$progressContainer.hide();
            this.$imgContainer.show();

            imgInfo.src && this.$imgPreview.attr("src", imgInfo.src);
            if (imgInfo.css) {
                imgInfo.css.maxWidth = 'none';
                imgInfo.css.maxHeight = 'none';
                this.$imgPreview.css(imgInfo.css)
            };
        } else {
            this.$progressContainer.show();
            this.$imgContainer.hide();
        }
    },
    setError: function () {
        this.$progressContainer.addClass('progress-container-danger');
        this.$progressBar.addClass('progress-danger');
    },

    setStatus: function (status) {
        this.$progressStatus.html(status);
    },

    toggleCancel: function (show, swfUploadInstance) {
        this.$progressCancel.css({ 'visibility': show ? 'visible' : 'hidden' });
        if (swfUploadInstance) {
            var fileID = this.fileProgressID;
            this.$progressCancel.click(function () {
                swfUploadInstance.cancelUpload(fileID);
                return false;
            });
        }
    }
}