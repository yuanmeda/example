void function () {
    var store = {
        get: function () {
            var url = '/' + projectCode + '/exam_center/exams/templates/' + tmplId + '/detail';
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8'
            });
        },
        create: function (data) {
            var url = '/' + projectCode + '/exam_center/exams/templates';
            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(data),
                type: 'post',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8'
            });
        },
        update: function (data) {
            var url = '/' + projectCode + '/exam_center/exams/templates/' + tmplId;
            return $.ajax({
                url: url,
                cache: false,
                data: JSON.stringify(data),
                type: 'put',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8'
            });
        },
        getUploadingInfo: function () {
            var url = '/' + projectCode + '/exam_center/exams/templates/uploading' + (tmplId ? ('?tmpl_id=' + tmplId) : '');
            return $.ajax({
                url: url,
                cache: false,
                type: 'get',
                dataType: "json",
                requestCase: "snake",
                responseCase: "camel",
                enableToggleCase: true,
                contentType: 'application/json;charset=utf8'
            });
        },
        getOrgTree: function () {
            var url = '/' + projectCode + '/exam_center/exams/manage_orgs';

            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                dataType: 'json'
            });
        },
        getOrgVisibleRanges: function () {
            var url = '/' + projectCode + '/exam_center/exams/' + tmplId + '/visible_ranges';

            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                dataType: 'json'
            });
        }
    };
    var viewModel = {
        flag: '',
        $searchOrg: null,
        $orgTreeModalBody: null,
        orgTreeObj: null,
        $orgTree: null,
        model: {
            orgTextRadio: '点击查看或选择所属组织',
            orgTextCheckbox: '点击查看或选择组织',
            updateNodesRadio: [],
            updateNodesCheckbox: [],
            searchText: '',
            belong_config: "0",//所属配置 null:全部可见 不为Null:组织内部可见
            exam: {
                title: '',
                examChance: null,
                beginTime: '',
                endTime: '',
                description: '',
                attachments: [],
                type: 'exercise',
                offlineExam: true,
                offlineExamType: 1,
                cyclicStrategy: 0,
                subType: 0,
                enrollType: 0,
                analysisCondStatus: 1,
                visibleConfig: "0",//可见配置 0:全部可见 1:组织内部可见
                orgNodeIds: [],
                affiliatedOrgNode: '',
                cover: '',
                cover_url: '',
            },
            attachmentSetting: {
                session: '',
                url: '',
                path: '',
                serverUrl: ''
            },
            treePattern:0
        },
        return_url: return_url || '',
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.validationsInfo = ko.validatedObservable(this.model.exam, {deep: true});
            var treeOpts = {
                 orgId: orgId,
                 multiple:true,
                 projectCode: projectCode,
                 host1: '/' + projectCode + '/exam_center/exams/',
                 host2: elearningServiceUri
            } 
            if (tmplId) {
                $.when(store.get(), store.getUploadingInfo()).done($.proxy(function (examInfos, uploadInfos) {
                    var examInfo = examInfos[0], uploadInfo = uploadInfos[0];
                    this.model.exam.title(examInfo.title);
                    this.model.exam.examChance(examInfo.examChance);
                    this.model.exam.description(examInfo.description);
                    this.model.exam.attachments(examInfo.attachments);
                    this.model.exam.cyclicStrategy(examInfo.cyclicStrategy);
                    this.model.exam.cover_url(examInfo.coverUrl);
                    //权限设置
                    this.model.exam.visibleConfig(examInfo.visibleConfig + '');
                    if (!examInfo.affiliatedOrgNode) {
                        this.model.belong_config('0');
                    } else {
                        this.model.belong_config('1');
                        this.model.exam.affiliatedOrgNode(examInfo.affiliatedOrgNode);
                    }
                    if (examInfo.cyclicStrategy == 1) {

                    }
                    if (examInfo.beginTime) {
                        this.model.exam.beginTime(timeZoneTrans(examInfo.beginTime));
                    }
                    if (examInfo.endTime) {
                        this.model.exam.endTime(timeZoneTrans(examInfo.endTime));
                    }
                    this.model.attachmentSetting.session(uploadInfo.session);
                    this.model.attachmentSetting.url(uploadInfo.url);
                    this.model.attachmentSetting.path(uploadInfo.path);
                    this.model.attachmentSetting.serverUrl(uploadInfo.serverUrl);
                  
                }, this));
                $.when(store.getOrgTree(), store.getOrgVisibleRanges()).done($.proxy(function (data1, data2) {
                    data1 = data1[0];
                    this.model.exam.orgNodeIds($.map(data2[0],function(node){ return node.org_node_id }));
                    this.genOpts(treeOpts,{
                        manager: data1.manager,
                        org_tree: data1.org_tree
                    })
                    ko.applyBindings(this);
                }, this));
            } else {
                store.getUploadingInfo()
                    .done($.proxy(function (data) {
                        this.model.attachmentSetting.session(data.session);
                        this.model.attachmentSetting.url(data.url);
                        this.model.attachmentSetting.path(data.path);
                        this.model.attachmentSetting.serverUrl(data.serverUrl);
                    }, this));
                store.getOrgTree().done($.proxy(function (returnData) {
                     this.genOpts(treeOpts,{
                        manager: returnData.manager,
                        org_tree: returnData.org_tree
                     })
                     ko.applyBindings(this);
                }, this));
            }

        },
        genOpts: function(defaultOpts,opts){
            var mTreeOpts = $.extend({},defaultOpts);
            mTreeOpts.nodeIds = this.model.exam.orgNodeIds;
            mTreeOpts.managerNodes = opts.manager.manager_nodes;
            mTreeOpts.hasManager = opts. manager.has_manage_project;
            mTreeOpts.initData = opts.org_tree;
            this.mTreeOpts = mTreeOpts;
            this.sTreeOpts = $.extend({}, mTreeOpts,{
                nodeIds: this.model.exam.affiliatedOrgNode,
                multiple:false
            })
        },
        showOrgTree: function (type) {
            this.model.treePattern(type);
            $('#zT-orgTreeModal').modal('show');
        },
        _matchValue: function (match, value) {
            return String(match).toLowerCase().indexOf(value) > -1;
        },
        doSave: function (callback) {
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }
            var data = ko.mapping.toJS(this.model.exam);

            data.visibleConfig = parseInt(data.visibleConfig);
            if (this.model.belong_config() == '0') {
                data.affiliatedOrgNode = -1;
                this.model.updateNodesRadio([]);
            } else if (this.model.belong_config() == '1' && !data.affiliatedOrgNode) {
                $.fn.dialog2.helpers.alert('请选择所属组织');
                return;
            }
            if (data.visibleConfig == 1 && this.model.exam.orgNodeIds().length < 1) {
                $.fn.dialog2.helpers.alert('请选择可见范围');
                return;
            } else if (data.visibleConfig == 0) {
                this.model.exam.orgNodeIds([]);
                data.orgNodeIds = this.model.exam.orgNodeIds();
            } else {
                data.orgNodeIds = this.model.exam.orgNodeIds();
            }
            if (data.examChance) {
                data.examChance = parseInt(data.examChance) || "";
            }
            if (data.beginTime) {
                data.beginTime = timeZoneTrans(data.beginTime);
            }
            if (data.endTime) {
                data.endTime = timeZoneTrans(data.endTime);
            }
            if (data.beginTime || data.endTime) {
                data.cyclicStrategy = 1;
                data.dateList = [{
                    beginDate: data.beginTime,
                    endDate: data.endTime
                }];
            } else {
                data.cyclicStrategy = 0;
            }
            // data.cover = 'bb0458d8-a797-4701-a2de-8ccbf5538fe5';
            if (tmplId) {
                store.update(data)
                    .done(function (data) {
                        callback && callback();
                    })
            } else {
                store.create(data)
                    .done(function (data) {
                        tmplId = data.id;
                        callback && callback();
                    })
            }
        },
        save: function () {
            this.doSave(function () {
                $.fn.dialog2.helpers.alert("保存成功");
            });
        },
        saveThenNext: function () {
            var self = this;
            this.doSave(function () {
                var url = '/' + projectCode + "/exam_center/offline_exam/exercisepaper?tmpl_id=" + tmplId;
                if (self.return_url) {
                    url = url + '&return_url=' + encodeURIComponent(self.return_url);
                }
                location.href = url;
            });
        },
        cancel: function () {
            var return_url = this.return_url || '';
            if (return_url) {
                window.location.href = return_url;
            } else {
                window.location.href = '/' + projectCode + '/exam_center';
            }
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery);