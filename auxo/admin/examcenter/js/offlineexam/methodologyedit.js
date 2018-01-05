(function ($, w) {
    'use strict';

    var TMPL_ID = w.tmplId,
        PROJECT_CODE = w.projectCode;
    var UPLOAD_REQ_URL = '/' + PROJECT_CODE + '/exam_center/exams/templates/uploading' + (TMPL_ID ? ('?tmpl_id=' + TMPL_ID) : ''),
        CREATE_TEMPLATE_REQ_URL = '/' + PROJECT_CODE + '/exam_center/exams/templates/',
        UPDATE_TEMPLATE_REQ_URL = '/' + PROJECT_CODE + '/exam_center/exams/templates/' + TMPL_ID,
        GET_TEMPLATE_DETAIL_REQ_URL = '/' + PROJECT_CODE + '/exam_center/exams/templates/' + TMPL_ID + '/detail';

    var store = {
        get: function () {
            return $.ajax({
                url: GET_TEMPLATE_DETAIL_REQ_URL,
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
            return $.ajax({
                url: CREATE_TEMPLATE_REQ_URL,
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
            return $.ajax({
                url: UPDATE_TEMPLATE_REQ_URL,
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
            return $.ajax({
                url: UPLOAD_REQ_URL,
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
            var url = '/' + projectCode + '/exam_center/exams/' + TMPL_ID + '/visible_ranges';

            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                dataType: 'json'
            });
        }
    };

    function dateTimeObject(beginDate, endDate) {
        ko.validation.rules["beginEndDateRules"] = {
            validator: function (val, begin) {
                var beginDate = begin.replace(/-/g, "/");
                var endDate = val.replace(/-/g, "/");
                if (new Date(beginDate).getTime() >= new Date(endDate).getTime()) {
                    return false;
                } else {
                    return true;
                }
            },
            message: '结束时间不能早于开始时间'
        };
        ko.validation.registerExtenders();
        this.beginDate = ko.observable(beginDate).extend({
            required: {
                params: true,
                message: '开始时间不可以为空'
            }
        });
        this.endDate = ko.observable(endDate).extend({
            required: {
                params: true,
                message: '结束时间不可以为空'
            },
            beginEndDateRules: {
                params: this.beginDate,
                onlyIf: function () {
                    return (this.beginDate() == undefined || this.beginDate() == '') ? false : true;
                }.bind(this)
            }
        });
    }

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
            timeSetDisabled: false,
            validatePeriod: 0,
            exam: {
                title: '',
                examChance: 1,
                cyclicStrategy: '1',//0: Unlimite 不限时间, 1: Noncyclic 自定义时间, 2: DailyCycle 每天循环, 3: WeeklyCycle 每周循环, 4: MonthlyCycle 每月循环!!!!!!
                dateList: [new dateTimeObject()],//自定义时间段{"begin_date": "2015-01-01T00:00:00","end_date": "2015-01-01T00:00:00" }
                beginTime: '',
                endTime: '',
                // timeList: [new timeObject()],//循环时的开放时间{beginTime:00:00:00, endTime:00:00:00}
                weekdays: [],//0,1,2,3,4,5,6 周日至周六
                dates: [],//1-30
                examNumPerUser: null,//勾上传Null, 不勾上传1 每次开放时间允许重考!!!!!
                analysisCondStatus: '0',//0: NotAllow 不允许查看, 1: AfterSubmit 交卷后立即查看, 2: NoneExamChance 考试机会用完后查看, 3: TimeLimit 固定时间段查看, 4: DurationLimit 考试截止后查看
                analysisCondData: '',//考试截止后查看，多少分钟后不能查看。格式：string:{"end_seconds" : 1800}
                markApplyEndTime: 0,//改卷申请截止时间（秒）

                description: '',//考试说明
                attachments: [],

                beginDate: '',//循环时的开始日期
                endDate: '',//循环时的结束日期

                type: 'exam',
                offlineExam: true,
                offlineExamType: 1,
                subType: 0,
                enrollType: 0,
                visibleConfig: "0",//可见配置 0:全部可见 1:组织内部可见
                orgNodeIds: [],
                affiliatedOrgNode: '',
                cover: '',
                cover_url: '',
            },
            uploadInfo: {
                session: '',
                url: '',
                path: '',
                serverUrl: ''
            },
            treePattern :0
        },
        return_url: return_url || '',
        source: source || '',
        init: function () {
            ko.validation.init({
                insertMessages: false,
                errorElementClass: 'input-error',
                errorMessageClass: 'error',
                decorateInputElement: true,
                grouping: {
                    deep: true,
                    live: true,
                    observable: true
                }
            }, true);
            this.model = ko.mapping.fromJS(this.model);
            this.validationsInfo = ko.validatedObservable(this.model, {deep: true});
            var treeOpts = {
                 orgId: orgId,
                 multiple:true,
                 projectCode: projectCode,
                 host1: '/' + projectCode + '/exam_center/exams/',
                 host2: elearningServiceUri
            } 
            if (TMPL_ID) {
                $.when(store.getUploadingInfo(), store.get()).done($.proxy(function (uploadResponse, tmplResponse) {
                    var uploadData = uploadResponse[0],
                        tmplData = tmplResponse[0];

                    //权限设置
                    this.model.exam.visibleConfig(tmplData.visibleConfig + '');
                    if (!tmplData.affiliatedOrgNode) {
                        this.model.belong_config('0');
                    } else {
                        this.model.belong_config('1');
                        this.model.exam.affiliatedOrgNode(tmplData.affiliatedOrgNode);
                    }
                    // upload setting
                    this.model.uploadInfo.session(uploadData.session);
                    this.model.uploadInfo.url(uploadData.url);
                    this.model.uploadInfo.path(uploadData.path);
                    this.model.uploadInfo.serverUrl(uploadData.serverUrl);

                    // template info setting
                    this.model.timeSetDisabled(true);
                    this.model.exam.title(tmplData.title);
                    this.model.exam.examChance(tmplData.examChance);
                    this.model.exam.cover_url(tmplData.coverUrl);
                    this.model.exam.cyclicStrategy("1");
                    if (tmplData.cyclicStrategy == 1) {
                        this.model.exam.dateList([]);
                        $.each(tmplData.dateList, function (index, item) {
                            var beginDate = item.beginDate ? timeZoneTrans(item.beginDate) : null;
                            var endDate = item.endDate ? timeZoneTrans(item.endDate) : null;
                            this.model.exam.dateList.push(new dateTimeObject(beginDate, endDate));
                        }.bind(this));
                    }
                    this.model.exam.analysisCondStatus(tmplData.analysisCondStatus + '');
                    if (tmplData.analysisCondStatus == 4) {
                        this.model.validatePeriod(((JSON.parse(tmplData.analysisCondData)).end_seconds) / 60);
                    }
                    this.model.exam.markApplyEndTime(tmplData.markApplyEndTime / 60);
                    this.model.exam.description(tmplData.description);
                    tmplData.attachments && tmplData.attachments.length > 0 && this.model.exam.attachments(tmplData.attachments);
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
            }
            else {
                store.getUploadingInfo().done($.proxy(function (data) {
                    this.model.uploadInfo.session(data.session);
                    this.model.uploadInfo.url(data.url);
                    this.model.uploadInfo.path(data.path);
                    this.model.uploadInfo.serverUrl(data.serverUrl);
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
        _setBodyScrollTop: function (id) {
            var $orgTreeModalBody = this.$orgTreeModalBody;
            $orgTreeModalBody.scrollTop(0);
            $orgTreeModalBody.scrollTop($('#' + id).position().top - this._getSearchFormH());
        },
        _getSearchFormH: (function () {
            var height = null;
            return function () {
                if (!height) {
                    height = $('#zT-searchForm').outerHeight(true);
                }
                return height;
            }
        })(),
        doSave: function (callback) {
            if (this.model.exam.dateList().length <= 0) {
                $.fn.dialog2.helpers.alert("至少输入一个时间");
                return;
            }
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }

            var exam = ko.mapping.toJS(this.model.exam);

            exam.cyclicStrategy = parseInt(exam.cyclicStrategy);
            exam.visibleConfig = parseInt(exam.visibleConfig);
            if (this.model.belong_config() == '0') {
                exam.affiliatedOrgNode = -1;
                this.model.updateNodesRadio([]);
            } else if (this.model.belong_config() == '1' && !exam.affiliatedOrgNode) {
                $.fn.dialog2.helpers.alert('请选择所属组织');
                return;
            }
            if (exam.visibleConfig == 1 && this.model.exam.orgNodeIds().length < 1) {
                $.fn.dialog2.helpers.alert('请选择可见范围');
                return;
            } else if (exam.visibleConfig == 0) {
                this.model.exam.orgNodeIds([]);
                exam.orgNodeIds = this.model.exam.orgNodeIds();
            } else {
                exam.orgNodeIds = this.model.exam.orgNodeIds();
            }
            if (exam.cyclicStrategy == 1) {
                //自定义时间
                var dateList = exam.dateList;
                $.each(dateList, $.proxy(function (index, item) {
                    item.beginDate = timeZoneTrans(item.beginDate);
                    item.endDate = timeZoneTrans(item.endDate);
                }, this));
            }
            exam.analysisCondStatus = parseInt(exam.analysisCondStatus);
            if (exam.analysisCondStatus == 4) {
                exam.analysisCondData = JSON.stringify({"end_seconds": this.model.validatePeriod() * 60});
            }
            exam.markApplyEndTime = exam.markApplyEndTime * 60;

            // exam.cover = 'bb0458d8-a797-4701-a2de-8ccbf5538fe5';
            if (tmplId) {
                store.update(exam).done(function () {
                    callback && callback();
                });
            }
            else {
                store.create(exam).done(function (data) {
                    TMPL_ID = data.id;
                    callback && callback();
                });
            }
        },
        saveThenNext: function () {
            var self = this;
            this.doSave(function () {
                location.href = '/' + PROJECT_CODE + "/exam_center/offline_exam/paper?tmpl_id=" + TMPL_ID + '&return_url=' + encodeURIComponent(self.return_url) + '&source=' + self.source;
            });
        },
        save: function () {
            this.doSave(function () {
                $.fn.dialog2.helpers.alert("保存成功");
            });
        },
        cancel: function () {
            var return_url = this.return_url || '';
            if (return_url) {
                window.location.href = return_url;
            } else {
                window.location.href = '/' + PROJECT_CODE + '/exam_center/index';
            }
        }
    };
    $(function () {
        viewModel.init();
    });

})(jQuery, window);