/**
 * Created by Administrator on 2017.5.24.
 */
(function (window, $) {
    var store = {
        getInfo: function () {
            return $.ajax({
                url: window.envconfig.service + '/v1/teaching_plans/' + window.teaching_plan_id,
                type: 'GET'
            });
        },
        setJxjh: function (type) {
            return $.ajax({
                url: window.envconfig.service + '/v1/teaching_plans/' + window.teaching_plan_id + '/' + type,
                type: 'PUT'
            })
        },
        createJxjh: function () {
            return $.ajax({
                url: window.envconfig.service + '/v1/teaching_plans/' + window.teaching_plan_id,
                type: 'POST'
            })
        },
        getTable: function () {
            return $.ajax({
                url: window.envconfig.service + '/v1/teaching_plans/' + window.teaching_plan_id + '/tables',
                type: 'GET'
            })
        },
        getImportTable: function () {
            return $.ajax({
                url: window.envconfig.service + '/v1/teaching_plans/' + window.teaching_plan_id + '/import_tables',
                type: 'GET'
            })
        },
        getUploadInfo: function () {
            return $.ajax({
                url: '/v1/teaching_plan_upload',
                cache: false
            });
        },
        postUploadInfo: function (data) {
            return $.ajax({
                url: window.envconfig.service + '/v1/teaching_plans/' + window.teaching_plan_id + '/actions/import',
                type: 'POST',
                data: JSON.stringify(data),
            })
        }
    };
    var viewModel = {
        model: {
            type: ko.observable(''),
            teachingPlanTable: ko.observable({name: '', course_containers: [], counter: {}}),
            importTable: ko.observable('')
        },
        init: function () {
            var that = this;
            ko.applyBindings(this);
            this.getInfo();
            this.getTable();
            this.getImportTable();
            store.getUploadInfo().then(function(uploadInfo){
                that.bindUpload(uploadInfo);
            })
        },
        // 获取教学计划表的使用状态
        getInfo: function () {
            var that = this;
            store.getInfo(window.specialtyId).then(function (data) {
                console.log('getInfo', data)
                that.model.type(data+'');
            })
        },
        setJxjh: function (type) {
            var that = this;
            store.setJxjh(type).then(function(){
                that.model.type(type+'')
            })
        },
        // 下载模板
        download: function () {
            var url = window.envconfig.service + '/v1/teaching_plans/models'
            var mac = Nova.getMacToB64(url);
            url += '?__mac=' + mac;
            window.open(url)
        },
        createJxjh: function () {
            var that = this;
            store.createJxjh().then(function () {
                // 此时教学计划表是系统生成
                that.getInfo();
                that.getTable()
            })
        },
        getTable: function () {
            var that = this;
            store.getTable(window.specialtyId).then(function (data) {
                data.course_containers.forEach(function(element, k) {
                    var count = 0
                    element.course_modules.forEach(function(em, km) {
                        em.row_count = em.courses.length
                        count += em.courses.length
                    })
                    element.row_count = count + 1 // 加小计一行
                }, this);
                that.model.teachingPlanTable(data)
            })
        },
        getImportTable: function() {
            var that = this;
            store.getImportTable(window.specialtyId).then(function (data) {
                 $('#jxjh-table-import-table').html(data.data)
            })
        },
        onExport: function() {
            var url = window.envconfig.service + '/v1/teaching_plans/'+ window.teaching_plan_id + '/actions/export?project_id=' + window.projectId
            var mac = Nova.getMacToB64(url);
            url += '&__mac=' + mac;
            window.open(url)
        },
        bindUpload: function (uploadInfo) {
            var url = 'http://' + uploadInfo.server_url + '/v0.1/upload?session=' + uploadInfo.session;
            this.uploader = new WebUploader.Uploader({
                swf: staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: url,
                auto: true,
                fileVal: 'Filedata',
                duplicate: true,
                pick: {
                    id: '#importBtn',
                    multiple: false
                },
                formData: {
                    path: uploadInfo.path
                },
                fileSingleSizeLimit: 10 * 1024 * 1024,
                accept: [{
                    title: "excel",
                    extensions: "xls",
                    mimeTypes: 'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12'
                }]
            });
            this.uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
            this.uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
            this.uploader.on('uploadError', $.proxy(this.uploadError, this));
            this.uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this, uploadInfo));
        },
        beforeFileQueued: function (file) {
            if (file && file.size == 0) {
                $.alert("文件大小为0，不能上传！");
                return false;
            }
            if (file && file.ext !== 'xls') {
                $.alert("文件类型只支持xls！");
                return false;
            }
        },
        uploadError: function (file, reason) {
            $.alert("上传出错,如果页面长时间无操作，请刷新后重新上传");
        },
        uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        },
        uploadSuccess: function (uploadInfo, file, response) {
            var that = this;
            if (!response.code) {
                var para = {
                    dentry_id: response.dentry_id,
                    name: response.name,
                    path: response.path,
                    host: 'http://' + uploadInfo.server_url,
                    inode_id: response.inode_id,
                    parent_id: response.parent_id,
                    service_id: response.service_id,
                    create_at: response.create_at
                }
                store.postUploadInfo(para).then(function(ret) {
                    if (ret.code) {
                        $.alert(ret.message)
                    } else {
                        $.alert("导入成功！");
                        that.getInfo();
                        that.getImportTable();
                    }
                })
            } else {
                response ? $.alert(response.message) : $.alert("上传出错");
            }
        }
    };

    $(function () {
        viewModel.init();
    });
})(window, jQuery);