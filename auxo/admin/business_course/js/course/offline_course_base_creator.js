/**
 * 线下课程创建
 * 全局变量：无
 * 创建课程 分三步走~ 
 	1. 保存基本信息  http://api.e.huayu.nd/business_course_service.html#/v1/business_courses@post
 	2. 保存开始时间和结束时间 http://api.e.huayu.nd/business_course_service.html#/v1/business_courses/{business_course_id}/config@put
 	3. 保存学时规则 http://api.e.huayu.nd/business_course_service.html#/v1/business_courses/{business_course_id}/time_rules@put
 */
(function ($, window) {
	'use strict';
	var store = {
		getUploadSession: function () {
			var url = business_course_gateway_url + '/upload_sessions';
			return $.ajax({
				url: url,
				dataType: 'json',
				cache: false
			});
		},
		// 保存基本信息
		saveBasicInfo: function (data) {
			var url = business_course_service_url + '/v1/business_courses';
			return $.ajax({
				url: url,
				data: JSON.stringify(data),
				dataType: 'json',
				contentType: 'application/json',
				type: 'POST',
				cache: false
			})
		},
		// 保存开始时间和结束时间
		saveStudyTime: function (id, data) {
			if (!id) throw new Error('no course_id')
			var url = business_course_service_url + '/v1/business_courses/' + id + '/config';
			return $.ajax({
				url: url,
				data: JSON.stringify(data),
				dataType: 'json',
				contentType: 'application/json',
				type: 'PUT',
				cache: false
			})
		},
		// 保存学时规则(参数写死)
		saveTimeRule: function (id) {
			if (!id) throw new Error('no course_id')
			var url = business_course_service_url + '/v1/business_courses/' + id + '/time_rules';
			return $.ajax({
				url: url,
				data: JSON.stringify({
					"enable_custom": false,
					"adjusted_time": 3600,
					"video_effect_max": 0,
					"document_effect_max": 0,
					"exercice_effect_max": 0,
					"vr_effect_max": 0,
				}),
				dataType: 'json',
				contentType: 'application/json',
				type: 'PUT',
				cache: false
			})
		}
	}
	var offlineCourseAreaKey = location.href + ':' + 'offline_course_area';
	function getUsedArea() {
		var UsedArea = localStorage.getItem(offlineCourseAreaKey)
		try {
			UsedArea = JSON.parse(UsedArea)
			if (/Array/.test(Object.prototype.toString.call(UsedArea))) {
				return UsedArea
			}
		} catch (e) { }
	}
	function setUsedArea(area) {
		if (!area) return
		var UsedArea = localStorage.getItem(offlineCourseAreaKey)
		try {
			var UsedArea = JSON.parse(UsedArea)
			if (!/Array/.test(Object.prototype.toString.call(UsedArea))) {
				UsedArea = []
			}
			if (UsedArea.indexOf(area) === -1) { UsedArea.unshift(area) }
			UsedArea.length > 5 ? UsedArea.length = 5 : '';
			localStorage.setItem(offlineCourseAreaKey, JSON.stringify(UsedArea))
		} catch (e) { }
	}

	var viewModel = {
		model: {
			"title": '', // 标题
			"summary": '', // 摘要
			"description": '', // 课程介绍
			"user_suit": '', //  合适人群
			"used_area": getUsedArea() || [], // 常用地点
			"course_area": '', // 开课地点
			"pic_url": '', //  封面URL地址
			"pic_id": '', // 图片
			"course_start_time": '', // 课程开始时间
			"course_end_time": '' // 课程结束时间
		},
		uploadSessions: {
			path: '',
			server_url: '',
			service_id: '',
			session: ''
		},
		_init: function () {
			var self = this;
			this.model = ko.mapping.fromJS(this.model);

			store.getUploadSession()
				.then(function (data) {
					$.extend(self.uploadSessions, data);
					ko.applyBindings(self, document.getElementById('offline_course_create'));
					// 初始化日期选择器
					$(".form_datetimepicker").datetimepicker({
						format: 'yyyy-mm-dd hh:ii',
						language: 'zh-CN',
						autoclose: true
					});
					// 初始化上传组件
					self._initUpload($.proxy(self._uploadComplete, self), $.proxy(self._uploadError, self));
				})

		},
		_initUpload: function (uc, ue) {
			var self = this;
			self.uploader = new WebUploader.Uploader({
				swf: staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
				server: 'http://' + self.uploadSessions.server_url + '/v0.1/upload?session=' + self.uploadSessions.session,
				auto: true,
				duplicate: true,
				pick: {
					id: '#picture_uploader',
					multiple: false,
				},
				formData: {
					path: self.uploadSessions.path
				},
				fileSingleSizeLimit: 50 * 1024 * 1024,
				accept: [{
					title: 'Image',
					extension: 'png, jpg',
					mimeTypes: 'image/*'
				}]
			})
			this.uploader.on('beforeFileQueued', $.proxy(this._beforeFileQueued, this));
			this.uploader.on('uploadBeforeSend', $.proxy(this._uploadBeforeSend, this));
			this.uploader.on('uploadError', $.proxy(this._uploadError, this));
			this.uploader.on('uploadSuccess', $.proxy(this._uploadSuccess, this));
		},

		_beforeFileQueued: function (file) {
			if (file && file.size == 0) {
				$.fn.dialog2.helpers.alert("文件大小为0，不能上传！");
				return false;
			}
		},
		_uploadError: function (file, reason) {
			$.fn.dialog2.helpers.alert("上传出错，错误信息：文件大小超过50MB！");
		},
		_uploadBeforeSend: function (obj, file, headers) {
			file.type = undefined;
			file.scope = 1;
			headers.Accept = "*/*";
		},
		_uploadSuccess: function (file, response) {
			// 拼出来的 :)
			this.model.pic_url('http://' + this.uploadSessions.server_url + '/v0.1/download?dentryId=' + response.dentry_id)
			this.model.pic_id(response.dentry_id)
		},
		setDefaultImage: function () {
			this.model.pic_url(window.default_cover_url)
		},
		createOfflineCourse: function () {
			var self = this;
			// 本地存储 课程地点
			var course_id = ''; // 课程ID
			var model = ko.mapping.toJS(this.model);

			setUsedArea(ko.unwrap(model.course_area));
			return store.saveBasicInfo({
				name: model.title,
				summary: model.summary,
				introduction: model.description,
				front_cover_object_id: model.pic_id || '00000000-0000-0000-0000-000000000000',
				front_cover_url: model.pic_url,  // '默认封面使用000'
				course_area: model.course_area,
				user_suit: model.user_suit,
                business_type: 'offline_course'
			})
				.then(function (data) {
					course_id = data.id;
					return
				})
				.then(function (data) {
					// "2017-07-22T21:00:00.000+0800"
					var start_time = new Date(model.course_start_time).format('yyyy-MM-dd HH:mm:ss');
					var end_time = new Date(model.course_end_time).format('yyyy-MM-dd HH:mm:ss');

					return store.saveStudyTime(course_id, {
						drawable: true,
						sequential: "0",
						skippable: true,
						page_require_time: 0,
						resource_downloadable: true,
						study_time_limit_type: 2,
						study_start_time: start_time,
						study_end_time: end_time
					})
				})
				.then(function () {
					return store.saveTimeRule(course_id).done($.proxy(function () {
						if (return_url) {
							var hasParams = return_url.indexOf('?') >= 0;
							window.location.href = return_url + (hasParams ? '&' : '?') + 'id=' + course_id;
						}
					}, this));
				})

		},
		setCourseArea: function (area) {
			viewModel.model.course_area(area);
		},
		goBack: function () {
			if(return_url) {
				window.location.href = return_url;
			} else {
				window.history.back();
			}
		}
	};
	viewModel._init()
})(jQuery, window);