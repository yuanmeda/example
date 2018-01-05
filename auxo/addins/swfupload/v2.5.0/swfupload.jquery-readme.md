##要引用的js文件
	<script src="/addins/swfupload/swfupload.js"></script>
    <script src="/addins/swfupload/swfupload.jquery.js"></script>
    <script src="/addins/swfupload/helper.js"></script>

swfupload.queue.js插件提供了 取消所有上传的方法和所有文件上传完成时的事件 如果不需要可以不加这个插件

swfupload.jquery.js插件支持用jquery的方式使用swfupload，支持绑定多个事件回调。这个插件要放在swfupload后面。

##swfupload帮助文档

[SWFUpload 2.5.0版 官方说明文档 中文翻译版](http://www.cnblogs.com/youring2/archive/2012/07/13/2590010.html)

##swfupload.jquery.js 插件使用说明

###如何初始化

	$("#element_id").swfupload(settings); 

setting默认参数说明请看swfupload.jquery.js源码

###如何获取swfupload实例

	$("#element_id").swfupload("instance"); 

如果$(selector)选中了多个元素 返回的实例是第一个元素的实例 非jquery对象 不能再使用jquery方法 swfupload实例方法请看 http://www.cnblogs.com/youring2/archive/2012/07/13/2590010.html

###怎么绑定事件
通过jquery提供的on、bind、off、unbind来处理事件。回调函数的入参比原生swfupload的回调入参多一个jquery封装的event参数。
如原来file_queued_handle的入参仅一个 file，使用jquery方式绑定时的入参有两个 evt,file 。多出来的参数event被插入到原参数列表的最前面，原参数依次往后移动一位。

	$("#element_id").swfupload(settings).bind("fileQueued",function(evt,file){ 
		//多出的evt 是jquery封装的事件 
		//file选中的文件信息 
		//获取当前swfupload实例 然后调用swfup的方法开始上传 
		var swfu = $(this).swfupload("instance");
		swfu.startUpload();
	}).bind("fileQueued",function(evt, file,serverData,receivedResponse){ 
		//file选中的文件信息 
	});


**提供jquery方式绑定的事件：**

- **swfuploadPreload** 对应原swfupload事件 swfupload_preload_handler

- **swfuploadLoadFailed** 对应原swfupload事件 swfupload_load_failed_handler

- **swfuploadLoaded** 对应原swfupload事件 swfupload_loaded_handler

- **fileDialogStart** 对应原swfupload事件 file_dialog_start_handler :刚打开选择框时

- **fileQueued** 对应原swfupload事件 file_queued_handler : 选好的 符合要求的文件，每个文件触发一次

- **fileQueueError** 对应原swfupload事件 file_queue_error_handler :选择的不符合要求文件 每个文件触发一次

- **fileDialogComplete** 对应原swfupload事件 file_dialog_complete_handler :关闭选择框时

- **uploadResizeStart** 对应原swfupload事件 upload_resize_start_handler

- **uploadStart每个文件开始上传前** 对应原swfupload事件 upload_start_handler

- **uploadProgress** 对应原swfupload事件 upload_progress_handler :每个文件上传进度 linux下只会触发一次

- **uploadError** 对应原swfupload事件 upload_error_handler :每个文件 上传中出错

- **uploadSuccess** 对应原swfupload事件 upload_success_handler :每个文件上传成功 这是会收到服务端给出的反馈数据 uploadSuccess: function (file, serverData) 基础平台在上传完成后服务端如果给出的serverData.Code!=0 也是错误的

- **uploadComplete** 对应原swfupload事件 upload_complete_handler :每个文件 上传完成时

- **mouseClick** 对应原swfupload事件 mouse_click_handler

- **mouseOut** 对应原swfupload事件 mouse_out_handler

- **mouseOver** 对应原swfupload事件 mouse_over_handler

- **queueComplete** 对应原swfupload事件 queue_complete_handler' :全部上传完成时触发 需要添加swfupload.queue插件