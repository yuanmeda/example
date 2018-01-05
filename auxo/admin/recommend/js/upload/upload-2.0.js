define(["require", "exports", "admin/recommend/js/widgets/swfuploader"], function (require, exports, swf) {
    (function (ButtonAction) {
        ButtonAction[ButtonAction["SELECT_FILE"] = -100] = "SELECT_FILE";
        ButtonAction[ButtonAction["SELECT_FILES"] = -110] = "SELECT_FILES";
        ButtonAction[ButtonAction["START_UPLOAD"] = -120] = "START_UPLOAD";
    })(exports.ButtonAction || (exports.ButtonAction = {}));
    var ButtonAction = exports.ButtonAction;
    var Upload = (function () {
        function Upload(element, options) {
            this.postParams = {};
            this.uploader = null;
            this.element = null;
            this.viewMode = {
                //默认图片地址
                defultImgUrl: ko.observable(""),
                //是否显示选择按钮（即上传按钮）
                showButton: ko.observable(true),
                //上传按钮是否处于hover状态
                buttonHover: ko.observable(false),
                //是否显示进度条
                showProgress: ko.observable(false),
                //上传进度百分比
                progressNum: ko.observable(0),
                //是否上传错误
                isUploadError: ko.observable(true),
                //是否上传成功
                isUploadSuccess: ko.observable(false),
                //选择的文件信息
                queuedFile: ko.observable({}),
                //文件已上传大小(单位KB)
                sendedSize: ko.observable(0.0),
                //文件大小(单位KB) ps:文档开始上传后大小会变成原文件大小+文件头的大小
                totalSize: ko.observable(0.0),
                //上传的图片存储地址
                sendedImgUrl: ko.observable(""),
                reload: function () {
                },
                cancel: function () {
                },
                //判断字符串是否是为空
                isNullOrEmpty: function (str) {
                    var flag = true;
                    if (typeof str == "string" && str != null && str.length > 0) {
                        flag = false;
                    }
                    return flag;
                }
            };
            this.element = element;
            this.options = options;
            this.options.uploadOptions['buttonPlaceholderId2'] = this.options.uploadOptions.buttonPlaceholderId;
            var html = "", t = this;
            html = "<style>.dispose { position: absolute; height:0; overflow:hidden; }</style>";
            this.options.uploadOptions.buttonPlaceholderId = "buttonPlaceholderId" + (new Date).getTime() + (Math.random() * 10).toFixed(0);
            if (this.options.hasInterface) {
                if (!this.options.customTmplId) {
                    html += '<div class="up clearfix">';
                    html += '   <div class="se" data-bind="css:{\'active\':buttonHover,\'dispose\':!showButton()},event: {mouseover:function(){buttonHover(true);},mouseout:function(){buttonHover(false);}}">';
                    html += '      <img id="ed_con" data-bind="attr:{src:defultImgUrl},visible: !isNullOrEmpty(defultImgUrl())" />';
                    html += '      <div class="se_arr" style="display:block" data-bind="visible: isNullOrEmpty(defultImgUrl())"></div>';
                    html += '      <div class="se_fil">';
                    html += '          <div id="buttonPlaceholderId"></div>';
                    html += '      </div>';
                    html += '   </div>';
                    html += '   <div class="de clearfix" style="display:block" data-bind="visible:showProgress">';
                    html += '       <div class="de_fo">';
                    html += '           <div class="de_na" data-bind="text:queuedFile().name"></div>';
                    html += '           <div class="de_pec clearfix">';
                    html += '               <div class="de_pg">';
                    html += '                   <div class="to_con"><div class="pg_con" data-bind="style:{width:progressNum()+\'%\'}"></div></div>';
                    html += '               </div>';
                    html += '               <div class="de_perc"><span data-bind="text: progressNum"></span>%</div>';
                    html += '          </div>';
                    html += '          <div class="de_num">';
                    html += '              已上传：<span data-bind="text:sendedSize"></span>KB/<span data-bind="text:totalSize||\'0\'"></span>KB';
                    html += '              <a href="javascript:void(0);" class="su_re" data-bind="click:reload, visible:isUploadError() || isUploadSuccess(), text:isUploadSuccess()?\'已上传成功，点击上传其他文件\':isUploadError()?\'上传失败，点击返回选择界面\':\'\'"></a>';
                    html += '          </div>';
                    html += '       </div>';
                    html += '       <div class="de_pre"><img id="pre_con" data-bind="attr:{src:sendedImgUrl},visible:sendedImgUrl().length>0"/></div>';
                    html += '   </div>';
                    html += '</div>';
                }
                else {
                    var tmpl = $("#" + t.options.customTmplId);
                    html += tmpl.html();
                }
                this.element.empty().append(html);
            }
            else {
                this.element.append(html);
            }
            this.element.find("#" + this.options.uploadOptions['buttonPlaceholderId2']).attr("id", t.options.uploadOptions.buttonPlaceholderId);
            this._load();
            this.viewMode.defultImgUrl(t.options.defaultUrl);
            this.viewMode.reload = function () {
                t._reload.apply(t);
            };
            this.viewMode.cancel = function () {
                t.cancel.apply(t);
            };
            ko.applyBindings(this.viewMode, this.element[0]);
        }
        Upload.prototype._load = function () {
            var t = this;
            t._processUploadOptions();
            //给swf上传控件绑定事件
            var uploader = new swf.SwfUploader(t.options.uploadOptions);
            //选择好文件就开始上传
            uploader.addEventListener("queued", function (e) {
                t._reload();
                //单位转换为KB
                e.file.size = parseFloat((e.file.size / 1024).toFixed(2));
                t.viewMode.queuedFile(e.file);
                t.viewMode.totalSize(e.file.size);
                t.viewMode.showButton(false);
                t.viewMode.showProgress(true);
                if (!t.options.uploadOptions.onQueued || !$.isFunction(t.options.uploadOptions.onQueued)) {
                    uploader.startUpload();
                }
                //console.log("queued");
            });
            //上传错误时显示一些提示
            uploader.addEventListener("uploadError", function (e) {
                t.viewMode.isUploadError(true);
                t.viewMode.isUploadSuccess(false);
                if (t.options.errorCallBack && $.isFunction(t.options.errorCallBack)) {
                    //撤销是不执行错误
                    if (typeof e.message != "string" || e.message.toLowerCase().indexOf("cancelled") < 0) {
                        //统一返回的数据
                        e.data = e.data || { Code: 50000, Data: "", Message: e.message };
                        t.options.errorCallBack(e);
                    }
                }
                //t.viewMode.progressNum(0);
                //console.log("uploadError:" + e);
            });
            //p是进度
            t.viewMode.progressNum(0);
            uploader.addEventListener("uploadProgress", function (e) {
                //计算当前进度
                var cp = Math.floor(e.sended * 100 / e.total);
                //进度变化时的处理
                if (cp > t.viewMode.progressNum()) {
                    t.viewMode.progressNum(cp);
                    var sendSize = parseFloat((e.sended / 1024).toFixed(2)), totalSize = parseFloat((e.total / 1024).toFixed(2));
                    t.viewMode.sendedSize(sendSize);
                    t.viewMode.totalSize(totalSize);
                }
            });
            //上传成功的时候还原组件状态
            uploader.addEventListener("uploadSuccess", function (e) {
                e.data = $.parseJSON(e.data);
                if (e.data.length) {
                    //|PCX|DCX|EMF|JIF|JPE|JFIF|EPS|TIF|RLE|DIB|PCD|DXF|ICO|WMF|TIFF|TGA 这些格式浏览器不能预览
                    if (/\.(BMP|JPG|GIF|PNG|JPEG|ICO)$/.test(e.file.type.toUpperCase())) {
                        t.viewMode.sendedImgUrl($.isArray(e.data) ? e.data[0].absolute_url : e.data.absolute_url);
                    }
                    else {
                        t.viewMode.sendedImgUrl("");
                    }
                    if (t.options.successCallBack && $.isFunction(t.options.successCallBack)) {
                        t.options.successCallBack(e);
                    }
                    t.viewMode.isUploadError(false);
                    t.viewMode.isUploadSuccess(true);
                    //t.viewMode.showButton(true);
                    //t.viewMode.showProgress(false);
                    t.viewMode.progressNum(100);
                }
                else {
                    if (t.options.errorCallBack && $.isFunction(t.options.errorCallBack)) {
                        t.options.errorCallBack(e);
                    }
                    t.viewMode.isUploadError(true);
                    t.viewMode.isUploadSuccess(false);
                }
            });
            t.uploader = uploader;
        };
        Upload.prototype.setPostParams = function (params) {
            var t = this;
            if (params) {
                params = $.extend({}, t.postParams, params);
                if (t.uploader) {
                    t.uploader.setPostParams(params);
                }
            }
        };
        Upload.prototype.setUploadUrl = function (url) {
            var t = this;
            if (url && t.uploader) {
                t.uploader.setUploadUrl(url);
            }
        };
        Upload.prototype._reload = function () {
            var t = this;
            t.viewMode.isUploadError(false);
            t.viewMode.isUploadSuccess(false);
            t.viewMode.showButton(true);
            t.viewMode.showProgress(false);
            t.viewMode.progressNum(0);
            t.viewMode.sendedSize(0);
            t.viewMode.queuedFile({});
            t.viewMode.sendedImgUrl("");
            t.viewMode.defultImgUrl("");
        };
        Upload.prototype._processUploadOptions = function () {
            var t = this;
            if (t.options.uploadOptions.uploadUrl.toLowerCase().indexOf("http:") < 0) {
                var baseUrl = "http://cloud.91open.com";
                if (window.location.href.indexOf("test.") >= 0) {
                    baseUrl = "http://test.cloud.91open.huayu.nd";
                }
                else if (window.location.href.indexOf("dev.") >= 0 || window.location.href.indexOf("debug.") >= 0) {
                    baseUrl = "http://dev.cloud.91open.huayu.nd";
                }
                t.options.uploadOptions.uploadUrl = baseUrl + t.options.uploadOptions.uploadUrl;
            }
        };
        //对外接口
        Upload.prototype.reload = function () {
            this._reload();
        };
        Upload.prototype.resetDefaultImgUrl = function (url) {
            this.viewMode.defultImgUrl(url);
        };
        Upload.prototype.cancel = function () {
            this.uploader.cancelUpload();
            this._reload();
            if (this.options.cancelCallBack && $.isFunction(this.options.cancelCallBack)) {
                this.options.cancelCallBack();
            }
        };
        return Upload;
    })();
    exports.Upload = Upload;
    $.fn.upload = function (option, para, cb) {
        return this.addClass("upload").each(function (index, item) {
            var $this = $(item), data = $this.data('upload'), optionIsString = (typeof option == 'string');
            //执行
            if (!data) {
                var options = $.extend(true, {}, $.fn.upload.defaults, typeof option == 'object' && option);
                $this.data('upload', (data = new Upload($this, options)));
            }
            else if (!optionIsString) {
                data.options = $.extend(true, data.options, typeof option == 'object' && option);
                data.reload();
            }
            if (optionIsString) {
                if ($.isFunction(para)) {
                    para(data[option]({}));
                }
                else if ($.isFunction(cb)) {
                    cb(data[option](para));
                }
                else {
                    data[option](para);
                }
            }
        });
    };
    $.fn.upload.defaults = {
        //uploadOptions参数的说明文档 http://www.cnblogs.com/2050/archive/2012/08/29/2662932.html | http://www.cnblogs.com/youring2/archive/2012/07/13/2590010.html
        uploadOptions: {
            //接口文档http://dev.doc.huayu.nd/doc/path?project=-800341387&version=34&path=%2fv2 
            uploadUrl: "http://test.cloud.91open.huayu.nd/v2/store/object/upload",
            //postParams的属性要与uploadUrl接口的参数对应
            postParams: {
                AccessToken: '',
                bucketId: '',
                bucketName: '',
                clientType: '',
                //v2中clientMode 改名为uploadMode; 0:WebSwf;1:WebHtml5;2:WebActivex;3:CloudClient;4:Other
                uploadMode: 0 //,
            },
            useQueryString: true,
            // 如 *.jpg; *.png
            fileTypes: '',
            fileTypesDescription: "fileTypesDescription",
            //fileSizeLimit:1000,
            //fileUploadLimit:0,
            //fileQueueLimit:0,
            debug: true,
            preventSwfCaching: true,
            buttonPlaceholderId: 'buttonPlaceholderId',
            buttonAction: -100 /* SELECT_FILE */,
            buttonText: '',
            buttonHeight: '100%',
            buttonWidth: '100%',
            buttonWindowMode: 'transparent',
            //各种回调 function (e) { }
            onLoaded: null,
            onDialogStart: null,
            onQueued: null,
            onQueueError: null,
            onDialogComplete: null,
            onUploadStart: null,
            onUploadProgress: null,
            onUploadError: null,
            onUploadSuccess: null,
            onUploadComplete: null,
            onQueueComplete: null,
            onDebug: null
        },
        cancelCallBack: null,
        errorCallBack: null,
        successCallBack: null,
        defaultUrl: '',
        customTmplId: "",
        hasInterface: true //如果不要内置的ui，多有东西都要自己写，如dom操作、数据单位转换等。
    };
});
//# sourceMappingURL=upload-2.0.js.map