; (function ($) {
    "use strict";
    var store = {
        // 获取上传session
        // 这里需要和对应后端再次对接
        getUploadSession: function () {
            var url = business_course_gateway_url + '/upload_sessions';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
        /*编辑和详情用获取课程*/
        getOfflineCourse: function () {
            var url = window.business_course_service_url + "/v1/business_course_learn_records/actions/search?$filter=custom_type eq 'offlinecourse' and custom_id eq '" + courseId + "'";
            return $.ajax({
                url: url,
                cache: false,
                dataType: 'json',
                type: 'POST'
            });
        },
        // 新建
        createOfflineCourse: function (data) {
            var url = window.business_course_service_url + '/v1/business_courses/' + courseId + '/learn_records';
            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(data),
                dataType: 'json',
                type: 'POST'
            });
        },
        /*编辑*/
        updateOfflineCourse: function (record) {
            var url = window.business_course_service_url + '/v1/business_courses/' + courseId + '/learn_records/' + record.id;
            return $.ajax({
                url: url,
                contentType: 'application/json',
                data: JSON.stringify(record),
                type: 'PUT'
            });
        },
        // 删除
        deleteOfflineCourse: function (record) {
            var url = window.business_course_service_url + '/v1/business_courses/' + courseId + '/learn_records/' + record.id;
            return $.ajax({
                url: url,
                type: 'DELETE',
                dataType: 'json',
                cache: false
            });
        }
    };

    var emptyRecord = {
        custom_id: '',
        custom_type: '',
        title: '',
        start_time: '',
        end_time: '',
        description: '',
        attachments: [],
        id: ""
    };

    var viewModel = {
        model: {
            recordArr: [],
            currentIndex: '',
            currentRecord: JSON.parse(JSON.stringify(emptyRecord))
        },
        uploadSetting: {
            session: '',
            path: '',
            serverUrl: '',
            serviceId: ''
        },
        _bindUpload: function () {
            // 绑定上传组件
            this.uploader = new WebUploader.Uploader({
                swf: staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + this.uploadSetting.serverUrl + '/v0.1/upload?session=' + this.uploadSetting.session,
                auto: true,
                duplicate: true,
                pick: {
                    id: '#file_uploader',
                    multiple: false,
                },
                formData: {
                    path: this.uploadSetting.path
                },
                fileSingleSizeLimit: 50 * 1024 * 1024,
                accept: [{
                    title: 'Image & Word',
                    extension: 'txt, doc, docx, xls, xlsx, png, jpg',
                    mimeTypes: 'image/*,application/vnd.ms-excel,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12'
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
            console.log(response);
            // return;
            this.model.currentRecord.attachments.push({
                id: response.dentry_id,
                name: file.name,
                size: file.size,
                description: file.name,
                url: 'http://' + this.uploadSetting.serverUrl + '/v0.1/download?dentryId=' + response.dentry_id + '&attachment=true&name=' + file.name,
                preview_id: response.dentry_id,
                preview_url: 'http://' + this.uploadSetting.serverUrl + '/v0.1/download?dentryId=' + response.dentry_id,
            })
            window.isOpenUploading = false;
        },
        removeAttachments: function (index) {
            var i = index();
            var self = this;
            $.fn.dialog2.helpers.confirm("您确认要删除吗？", {
                confirm: $.proxy(function () {
                    self.model.currentRecord.attachments.splice(i, 1);
                }, this)
            });
        },

        init: function () {
            var self = this;
            this.model = ko.mapping.fromJS(this.model);
            ko.applyBindings(self, document.getElementById("offline_record"));

            this.list();
            store.getUploadSession().then(function (data) {
                self.uploadSetting.session = data.session;
                self.uploadSetting.serverUrl = data.server_url;
                self.uploadSetting.path = data.path;
                self.uploadSetting.serviceId = data.service_id
                self._bindUpload();
                $('#offline_record').show();
            })
           
        },
        openUploader: function() {
            // hack for webuploader
            if(window.isOpenUploading) return;
            window.isOpenUploading = true;
            $('.webuploader-element-invisible').click();
        },
        list: function () {
            store.getOfflineCourse().then($.proxy(function (recordArr) {
                var items = recordArr.items;
                var len = items.length; var i = 0;
                for(; i<len; i++){
                    items[i].start_time = new Date(items[i].start_time).format('yyyy-MM-dd HH:mm');
                    items[i].end_time = new Date(items[i].end_time).format('yyyy-MM-dd HH:mm');
                    items[i].update_time = new Date(items[i].update_time).format('yyyy-MM-dd HH:mm');
                }
                this.model.recordArr(items);
            }, this))
        },
        editOrCreateRecord: function (index) {
            var i = typeof index === 'function' ? index() : i;
            var recordArr = this.model.recordArr()
            this.model.currentIndex(i);
            if (i >= 0 && i < recordArr.length) {
                this.model.currentRecord.id(recordArr[i].id);
                this.model.currentRecord.attachments(recordArr[i].attachments ? recordArr[i].attachments : []);
                this.model.currentRecord.custom_id(recordArr[i].custom_id);
                this.model.currentRecord.custom_type(recordArr[i].custom_type);
                this.model.currentRecord.description(recordArr[i].description);
                this.model.currentRecord.end_time(recordArr[i].end_time);
                this.model.currentRecord.start_time(recordArr[i].start_time);
                this.model.currentRecord.title(recordArr[i].title);
            } else {
                ko.mapping.fromJS(JSON.parse(JSON.stringify(emptyRecord)), {}, this.model.currentRecord)
            }
            $('#offline_course_record_modal').modal('show');
        },

        saveRecord: function () {
            var self = this;
            var currentIndex = this.model.currentIndex();
            var record = ko.mapping.toJS(self.model.currentRecord);
            
            if(!record.title) {
                $.fn.dialog2.helpers.alert('标题不能为空')
                return;
            }
            if(!record.start_time ||!record.end_time) {
                $.fn.dialog2.helpers.alert('开始时间或者结束时间不能为空')
                return;
            }
            if(new Date(record.start_time) > new Date(record.end_time)) {
                $.fn.dialog2.helpers.alert('开始时间不能大于结束时间');
                return;
            }

            record.start_time = new Date(record.start_time).format('yyyy-MM-ddTHH:mm:ss') + '.000+0800'; //强制成东八区时间
            record.end_time = new Date(record.end_time).format('yyyy-MM-ddTHH:mm:ss') + '.000+0800'; 

            if (currentIndex >= 0 && this.model.recordArr().length) {
                // edit mode
                store.updateOfflineCourse(record).then(function (data) {
                    // 格式化时间
                    data.start_time = new Date(data.start_time).format('yyyy-MM-dd HH:mm');
                    data.end_time = new Date(data.end_time).format('yyyy-MM-dd HH:mm');
                    data.update_time = new Date(data.update_time).format('yyyy-MM-dd HH:mm');
                    self.model.recordArr.splice(currentIndex, 1, data)
                })
            } else {
                // create mode
                record.custom_type = "offlinecourse"
                store.createOfflineCourse(record).then(function (data) {
                    // 格式化时间
                    data.start_time = new Date(data.start_time).format('yyyy-MM-dd HH:mm');
                    data.end_time = new Date(data.end_time).format('yyyy-MM-dd HH:mm');
                    data.update_time = new Date(data.update_time).format('yyyy-MM-dd HH:mm');
                    self.model.recordArr.push(data)
                })
            }
            $('#offline_course_record_modal').modal('hide')
        },

        deleteRecord: function (data) {
            var _this = viewModel;
            $.fn.dialog2.helpers.confirm('确定要删除吗？!', {
                "confirm": function () {
                    store.deleteOfflineCourse(data).then(function (data) {
                        _this.list();
                    });
                },
                buttonLabelYes: '确认',
                buttonLabelNo: '取消'
            })

        }
    };
    $(function () {
        viewModel.init();
    });
    $(".form_datetimepicker").datetimepicker({
        format: 'yyyy-mm-ddThh:ii:ss',
        language: 'zh-CN',
        autoclose: true
    });
})(jQuery);
