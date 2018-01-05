/*
 js公用函数
 */

(function ($, window) {
    window.commonJS = {
        //init初始化
        init: function () {
            this._triggerHandler();
        },
        //通用事件处理
        _triggerHandler: function () {
            $(document).on('remove_class', function (e, dom, clazz) {
                $(dom).removeClass(clazz);
            });
            $("input[name='keyword']").on('keyup', function (e) {
                if (e.keyCode === 13 && document.activeElement.name === 'keyword') {
                    //$('#keyword').next().click();
                    $(this).next().click();
                }
            });

            //模态框显示隐藏事件
            $('body').on('hide','.modal',function(){
                $('html').css({'overflow':'auto'});
            });
            $('body').on('show','.modal',function(){
                $('html').css({'overflow':'hidden'});
            });

            //input验证器
            $('body').on('input','input[valid]:not(:disabled)',function(){
                var _this=$(this),
                    _types=_this.attr('valid').split(','),
                    _max=_this.attr('max'),
                    _regexps=[],
                    _value= $.trim(_this.val()),
                    _tip=$('<div class="message-tip left"></div>'),
                    _flag='',
                    _t;
                var _parent=_this.parent(),
                    _hasTip=_parent.find('.message-tip');
                _types.forEach(function(_type,index){
                    switch(_type){
                        case 'number':
                            _regexps.push(/(^0*)?(\D+)?/g);
                            break;
                        default:
                            break;
                    }
                });
                _regexps.forEach(function(_regexp,index){
                    _value=_value.replace(_regexp,'');
                });
                if(_max&&Number(_value)>Number(_max)){
                    _flag='数值不可大于'+_max;
                }else if(_value==''){
                    _flag='数值必填';
                }
                if(_flag){
                    _this.focus();
                    if(_hasTip.length){
                        _hasTip.html(_flag).show();
                    }else{
                        _tip.html(_flag).appendTo(_this.parent());
                    }
                    _t&&window.clearTimeout(_t);
                    _parent.add(_this).addClass('error').removeClass('success');
                    _t=window.setTimeout(function(){
                        _parent.find('div.message-tip').fadeOut();
                        window.clearTimeout(_t);
                    },2000);
                }else{
                    _t&&window.clearTimeout(_t);
                    _parent.find('div.message-tip').fadeOut();
                    _parent.add(_this).addClass('success').removeClass('error');
                }
                _this.val(_value);
            })
        },
        //分页
        _page: function (totalCount, currentPage) {
            var _this = this;
            $('#pagination').pagination(totalCount, {
                items_per_page: _this.model.filter.pageSize(),
                num_display_entries: 5,
                current_page: currentPage,
                is_show_total: true,
                is_show_input: true,
                pageClass: 'pagination-box',
                prev_text: '<&nbsp;上一页',
                next_text: '下一页&nbsp;>',
                callback: function (page_id) {
                    if (page_id != currentPage) {
                        _this.model.filter.pageIndex(page_id);
                        _this.list();
                    }
                }
            });
        },
        //ajaxHandler(ajax打包)
        _ajaxHandler: function (url, data, type,async) {
            return $.ajax({
                url: url,
                cache: false,
                data: data || null,
                type: type || 'get',
                async:async||true,
                contentType: 'application/json;charset=utf8',
                error: function (jqXHR) {
                	if (jqXHR.readyState == 0 || jqXHR.status == 0) {
                        $.fn.dialog2.helpers.alert('网络出错，请稍后再试');
                	} else {
	                    var txt = JSON.parse(jqXHR.responseText);
	                    if (txt.cause) {
	                        $.fn.dialog2.helpers.alert(txt.cause.detail || txt.cause.message);
	                    } else {
	                        $.fn.dialog2.helpers.alert(txt.message);
	                    }
	                    $('body').loading('hide');
                	}
                }
            });
        },
        /**
         图片上传初始化及相关回调
         */
        //初始化上传
        initUpload: function (uc, ue,url) {
            var that = this,
                _complete = function (data) {
                    if (!data.Code) {
                        $.fn.dialog2.helpers.alert('上传成功');
                    }
                },
                _error = function (code) {
                    var msg;
                    switch (code) {
                        case 110:
                            msg = "上传文件超过规定大小";
                            break;
                        default:
                            msg = "上传失败，请稍后再试";
                            break;
                    }
                    $.fn.dialog2.helpers.alert(msg);
                },
                swf = new SWFImageUpload({
                    flashUrl: staticUrl + "addins/swfimageupload/swfimageupload.swf",//插件flash地址
                    width: 1024,
                    height: 1000,
                    htmlId: "J_UploadImg",//上传插件渲染节点
                    pSize: "600|400|300|200|225|150",
                    uploadUrl: escape(storeUrl),//上传地址
                    imgUrl: url,
                    showCancel: false,
                    limit: 1,
                    upload_complete: uc || _complete,
                    upload_error: ue || _error
                });
            return swf;
        },
        //加载上传插件
        _loadUploadPlugin:function(params){
            require.config({
                baseUrl: staticUrl
            });
            //加载ICO图片上传模块
            require(["require", "exports", "typescript/cloud/upload/uploadjs/upload-2.0"], function (require, exports, upload) {
                params.forEach(function(item,index){
                    item.target.upload({
                        uploadOptions: {
                            uploadUrl: storeUrl ,
                            fileTypes: "*.jpg;*.png;*.gif",
                            onQueued: function (e) {
                                this.startUpload();
                            },
                            fileSizeLimit:1024*2,
                            onQueueError:function(fileEvent){
                                var err='';
                                switch (fileEvent.error){
                                    case -110:
                                        err="文件超出指定大小，请重新选择文件上传。";
                                        break;
                                    case -130:
                                        err="请上传指定格式的文件（JPG、PNG、GIF）。";
                                        break;
                                    default :
                                        err="文件不符合条件。";
                                }
                                $.fn.dialog2.helpers.alert(err);
                            }
                        },
                        clientType: 2,
                        defaultUrl: item.defaultUrl,
                        errorCallBack: function (data) {
                            if (typeof (data.Message) != undefined && data.Message != "") {
                                $.fn.dialog2.helpers.alert("上传图片失败！<br/>错误信息：" + data.
                                        data.Message);
                            }
                            else {
                                $.fn.dialog2.helpers.alert("上传图片失败！" + data);
                            }
                        },
                        successCallBack: function (data) {
                            if (typeof (data) != undefined && data != null) {
                                item.cb&&item.cb(data.data);
                            }
                        }
                    });
                })
            });
        },
        //格式化日期时间的时区，以便兼容IE和Chrome。格式化前2016-03-25T14:33:00.000+0800，格式化后2016-03-25T14:33:00.000+08:00
        _formatTimezone: function (dt) {
        	if (dt) return dt.replace(/(\+\d{2})(\d{2})$/, "$1:$2");
        	return dt;
        },
        //将2016-03-25 14:33转成2016-03-25T14:33:00
        _toJavaTime: function (dt) {
        	if (dt) return dt.replace(" ", "T") + ":00";
        	return dt;
        },
        //将2016-03-25T14:33:00转成2016-03-25 14:33
        _toJSTime: function (dt) {
        	if (dt) return dt.replace(/^(\d{4})\-(\d{2})\-(\d{2})[ |T](\d{2}):(\d{2}):(\d{2})(.*)$/, "$1-$2-$3 $4:$5");
        	return dt;
        }
    };

    $(function () {
        commonJS.init();
    })

})(jQuery, window)
