void function () {
    var store = {
        get: function () {
            return $.ajax({
                url: '/' + projectCode + '/exam_center/exams/' + examId,
                cache: false,
                dataType: 'json'
            });
        },
        create: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/exam_center/exams',
                dataType: 'json',
                type: 'post',
                data: JSON.stringify(data),
                contentType: 'application/json;charset=utf8'
            });
        },
        update: function (data) {
            return $.ajax({
                url: '/' + projectCode + '/exam_center/exams/' + examId,
                dataType: 'json',
                type: 'put',
                data: JSON.stringify(data),
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
            var url = '/' + projectCode + '/exam_center/exams/' + examId + '/visible_ranges';

            return $.ajax({
                url: url,
                type: 'GET',
                cache: false,
                dataType: 'json'
            });
        }
    };

    function prefixPaddedZeros(value, width) {
        var leadingZeroes = function () {
            var zeros = '';
            for (var i = 0; i < width; i++) {
                zeros += '0';
            }
            return zeros;
        }();
        return (leadingZeroes + (value || 0)).slice(-width);
    }

    function timezoneNum2Str(tzNum) {
        var symbol;
        var hours, minutes;
        symbol = tzNum < 0 ? '+' : '-';
        minutes = tzNum.toFixed(2).substr(-2, tzNum.length) / 100 * 60;
        hours = Math.abs(parseInt(tzNum, 10)).toString();
        return symbol + prefixPaddedZeros(hours, 2) + prefixPaddedZeros(minutes, 2);
    }

    function ratingSettingList(rating_title, correct_rate) {
        ko.validation.rules["maxRate"] = {
            validator: function (val) {
                if (+val > 100) {
                    return false;
                } else {
                    return true;
                }
            },
            message: '最大值为100'
        };

        ko.validation.registerExtenders();
        this.rating_title = ko.observable(rating_title);
        this.correct_rate = ko.observable(correct_rate).extend({
            required: {
                params: true,
                message: '不可以为空'
            },
            maxRate: {},
            pattern: {
                params: "^([1-9][0-9]*)$",
                message: '请输入大于0的整数'
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
            exam: {
                id: examId || null,
                title: "",
                sub_type: subType || 0,
                begin_time: "",
                end_time: "",
                duration: 3,
                passing_score: 60,
                description: "",
                exam_chance: 1,
                analysis_cond_status: "0",
                ac_begin_time: "",
                ac_end_time: "",
                /*enroll_type: "0",*/
                number_limit_type: "0",
                limit_number: 1,
                upload_allowed: "true",
                rating_setting_list: [],
                end_answer_time: "0",
                reminding_seconds: 0,
                ranking_able: false,
                reward_ranking_able: false,
                visible_config: "0",//可见配置 0:全部可见 1:组织内部可见
                org_node_ids: [],
                affiliated_org_node: '',
                cover_url: '',
                cover: '',
                uploadInfo: {
                    path: '',
                    server_url: '',
                    service_id: '',
                    session: ''
                }
            },
            treePattern:0
        },
        return_url: return_url || '',
        source: source || '',
        returnStatus: true,
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
            this.validationsInfo = ko.validatedObservable(this.model, {
                deep: true
            });
            var treeOpts = {
                 orgId: orgId,
                 multiple:true,
                 projectCode: projectCode,
                 host1: '/' + projectCode + '/exam_center/exams/',
                 host2: elearningServiceUri
            } 
            /*解决跨域通知，替换__return_url方案*/
            if (subType == 2 && !examId) {
                var z = document.getElementById('frame');
                var n = new Nova.Notification(z.contentWindow, "*");
                var message_key = "exam_center.barrier.barrier_project.create_barrier_project";
                n.addEventListener(message_key, function (receiveData) {
                    if (receiveData.event_type == 'create_barrier_project') {
                        if (source == 'barrier') {
                            window.location.href = '/' + projectCode + '/exam_center/exam/barrierlist?sub_type=' + subType + '&id=' + receiveData.data.barrier_project_id + '&source=barrier';
                        } else {
                            window.location.href = '/' + projectCode + '/exam_center/exam/barrierlist?sub_type=' + subType + '&id=' + receiveData.data.barrier_project_id;
                        }
                    }
                });
            }

            function mappingObject(data){
                    data.analysis_cond_status = data.analysis_cond_status + '';
                    data.ac_begin_time = '';
                    data.ac_end_time = '';
                    subType = data.sub_type = data.sub_type ? data.sub_type : 0;
                    data.upload_allowed = data.upload_allowed + "";
                    data.ranking_able = data.ranking_able;
                    data.reward_ranking_able = data.reward_ranking_able;
                    data.number_limit_type = data.number_limit_type + "";
                    data.limit_number = data.limit_number || 0;
                    data.rating_setting_list = data.rating_setting_list || [];
                    data.end_answer_time = data.end_answer_time == null ? "0" : data.end_answer_time / 3600;
                    data.reminding_seconds = data.reminding_seconds == null ? 0 : data.reminding_seconds / 60;
                    data.visible_config = data.visible_config + "";
                    if (!data.affiliated_org_node) {
                        this.model.belong_config('0');
                    } else {
                        this.model.belong_config('1');
                    }

                    var dataRatingSettingList = data.rating_setting_list;
                    delete data.rating_setting_list;

                    var des = data.description;
                    data.description = '';
                    ko.mapping.fromJS(data, {}, this.model.exam);
                    if (des) {
                        if (!this.model.exam.uploadInfo.service_id()) {
                            this.model.exam.uploadInfo.service_id.subscribe(function (val) {
                                if (val) {
                                    var str = des.replace(/\$\{cs_host}/gim, self.model.exam.uploadInfo.server_url());
                                    self.model.exam.description(str);
                                    window.desEditor.html(self.model.exam.description());
                                }
                            }, this);
                        } else {
                            self.model.exam.description(des.replace(/\$\{cs_host}/gim, this.model.exam.uploadInfo.server_url()));
                            window.desEditor.html(self.model.exam.description());
                        }
                    }
                    if (data.duration != null) {
                        this.model.exam.duration(parseInt(data.duration / 60));
                    }
                    if (data.begin_time) {
                        this.model.exam.begin_time(timeZoneTrans(data.begin_time));
                    }
                    if (data.end_time) {
                        this.model.exam.end_time(timeZoneTrans(data.end_time));
                    }
                    if (data.analysis_cond_status == '3') {
                        var jsonData = JSON.parse(data.analysis_cond_data);
                        if (jsonData.begin_time && jsonData.begin_time.length < 20) {
                            var currentTimeZone = new Date().getTimezoneOffset() / 60;
                            jsonData.begin_time = jsonData.begin_time + ".000" + timezoneNum2Str(currentTimeZone);
                        }
                        if (jsonData.end_time && jsonData.end_time.length < 20) {
                            var currentTimeZone = new Date().getTimezoneOffset() / 60;
                            jsonData.end_time = jsonData.end_time + ".000" + timezoneNum2Str(currentTimeZone);
                        }
                        this.model.exam.ac_begin_time(timeZoneTrans(jsonData.begin_time));
                        this.model.exam.ac_end_time(timeZoneTrans(jsonData.end_time));
                    }
                    if (this.model.exam.sub_type() == 2) {
                        if (dataRatingSettingList) {
                            $.each(dataRatingSettingList, function (index, rating) {
                                viewModel.model.exam.rating_setting_list.push(new ratingSettingList(rating.rating_title, rating.correct_rate + ''));
                            });
                        } else {
                            viewModel.model.exam.rating_setting_list.push(new ratingSettingList('一级', 70 + ''));
                            viewModel.model.exam.rating_setting_list.push(new ratingSettingList('二级', 80 + ''));
                            viewModel.model.exam.rating_setting_list.push(new ratingSettingList('三级', 90 + ''));
                        }

                    }
            }

            if (examId && subType != 2) {
                var self = this;
                $.when(store.get(),store.getOrgTree(), store.getOrgVisibleRanges()).done($.proxy(function (data, data1, data2) {
                    mappingObject.call(this,data[0]);
                    data1 = data1[0];
                    this.model.exam.org_node_ids($.map(data2[0],function(node){ return node.org_node_id  }));
                     this.genOpts(treeOpts,{
                        manager: data1.manager,
                        org_tree: data1.org_tree
                    })
                    ko.applyBindings(this, document.getElementById('js_examedit'));
                }, this));
            } else {
                if (this.model.exam.sub_type() == 2) {
                    viewModel.model.exam.rating_setting_list.push(new ratingSettingList('一级', 70 + ''));
                    viewModel.model.exam.rating_setting_list.push(new ratingSettingList('二级', 80 + ''));
                    viewModel.model.exam.rating_setting_list.push(new ratingSettingList('三级', 90 + ''));
                }
                store.getOrgTree().done($.proxy(function (returnData) {
                    this.genOpts(treeOpts,{
                        manager: returnData.manager,
                        org_tree: returnData.org_tree
                    })
                    ko.applyBindings(this, document.getElementById('js_examedit'));
                }, this));
            }
        },
         genOpts: function(defaultOpts,opts){
            var mTreeOpts = $.extend({},defaultOpts);
            mTreeOpts.nodeIds = this.model.exam.org_node_ids;
            mTreeOpts.managerNodes = opts. manager.manager_nodes;
            mTreeOpts.hasManager = opts. manager.has_manage_project;
            mTreeOpts.initData = opts.org_tree;
            this.mTreeOpts = mTreeOpts;
            this.sTreeOpts = $.extend({}, mTreeOpts,{
                nodeIds: this.model.exam.affiliated_org_node,
                multiple:false
            })
        },
        /*组织树显示*/
        showOrgTree: function (type) {
            this.model.treePattern(type);
            $('#zT-orgTreeModal').modal('show');
        },
        _matchValue: function (match, value) {
            return String(match).toLowerCase().indexOf(value) > -1;
        },
        prepareData: function (callBack) {
            var _self = this;
            if (!_self.returnStatus) {
                return;
            }
            if (!this.validationsInfo.isValid()) {
                this.validationsInfo.errors.showAllMessages();
                var errors = this.validationsInfo.errors();
                $.fn.dialog2.helpers.alert(errors[0]);
                return;
            }
            var data = ko.mapping.toJS(this.model.exam);
            data.sub_type = parseInt(data.sub_type);
            data.upload_allowed = data.upload_allowed == "true" ? true : false;
            data.ranking_able = data.ranking_able;// == "true" ? true : false;
            data.reward_ranking_able = data.reward_ranking_able;
            data.end_answer_time = parseInt(data.end_answer_time) * 3600;
            data.reminding_seconds = data.reminding_seconds * 60;
            data.number_limit_type = parseInt(data.number_limit_type);
            data.cover = data.cover;
            // data.cover = 'bb0458d8-a797-4701-a2de-8ccbf5538fe5';
            data.cover_url = data.cover_url;
            data.visible_config = parseInt(data.visible_config);
            data.description = data.description.replace(new RegExp("" + this.model.exam.uploadInfo.server_url(), "gim"), '${cs_host}');
            if (this.model.belong_config() == '0') {
                data.affiliated_org_node = -1;
                this.model.updateNodesRadio([]);
            } else if (this.model.belong_config() == '1' && !data.affiliated_org_node) {
                $.fn.dialog2.helpers.alert('请选择所属组织');
                return;
            }
            if (data.visible_config == 1 && this.model.exam.org_node_ids().length < 1) {
                $.fn.dialog2.helpers.alert('请选择可见范围');
                return;
            } else if (data.visible_config == 0) {
                this.model.exam.org_node_ids([]);
                data.org_node_ids = this.model.exam.org_node_ids();
            } else {
                data.org_node_ids = this.model.exam.org_node_ids();
            }
            /*data.enroll_type = parseInt(data.enroll_type);*/
            if (data.duration != null && data.duration != "") {
                data.duration = data.duration * 60;
            }
            if (data.begin_time) {
                data.begin_time = timeZoneTrans(data.begin_time);
            }
            if (data.end_time) {
                data.end_time = timeZoneTrans(data.end_time);
            }
            if (data.analysis_cond_status == '3') {
                data.ac_begin_time = timeZoneTrans(data.ac_begin_time);
                data.ac_end_time = timeZoneTrans(data.ac_end_time);
                data.analysis_cond_data = "{\"begin_time\":\"" + data.ac_begin_time + "\",\"end_time\":\"" + data.ac_end_time + "\"}";
            } else {
                data.analysis_cond_data = "";
            }
            if (data.sub_type == 2) {
                var tempRating = ko.mapping.toJS(this.model.exam.rating_setting_list);
                if (tempRating.length > 0) {
                    $.each(tempRating, function (index, rating) {
                        rating.correct_rate = +rating.correct_rate;
                    });
                    data.rating_setting_list = tempRating;
                }
                var tempData = {
                    title: data.title,
                    sub_type: data.sub_type,
                    rating_setting_list: data.rating_setting_list,
                    analysis_cond_status: 1,
                    duration: data.duration,
                    description: data.description.replace(new RegExp("" + this.model.exam.uploadInfo.server_url(), "gim"), '${cs_host}'),
                    end_answer_time: data.end_answer_time
                };
                data = tempData;
            }
            _self.returnStatus = false;
            if (examId) {
                store.update(data)
                    .done($.proxy(function (returnData) {
                        callBack && callBack();
                    }, this))
                    .always(function () {
                        _self.returnStatus = true;
                    })

            } else {
                delete data.id;
                store.create(data)
                    .done($.proxy(function (returnData) {
                        examId = returnData.id;
                        callBack && callBack();
                        _self.returnStatus = true;
                    }, this))
                    .always(function () {
                        _self.returnStatus = true;
                    })
            }
        },
        cancel: function () {
            var return_url = this.return_url || '';
            var source = this.source || '';
            if (source == 'channel') {
                window.location.href = return_url;
            } else if (return_url) {
                window.location.href = return_url;
            } else {
                window.location.href = '/' + projectCode + "/exam_center/index";
            }
        },
        toNext: function () {
            var url = '/' + projectCode + "/exam_center/exam/paper?exam_id=" + examId + "&sub_type=" + subType;
            if (this.source == 'channel') {
                url = url + '&return_url=' + encodeURIComponent(this.return_url) + '&source=' + this.source;
            }
            window.location = url;
        },
        save: function () {
            this.prepareData.call(this, this.cancel);
        },
        saveThenNext: function () {
            this.prepareData.call(this, this.toNext);
        },
        saveThenReturn: function () {
            var returnUrl = decodeURIComponent(this.getQueryStringByName('return_url'));
            var hasParam = returnUrl.indexOf('?');
            if (returnUrl) {
                location.href = returnUrl + '&__mac=' + Nova.getMacToB64(returnUrl);
            }
            else
                location.href = '/' + projectCode + "/exam";
        },
        getQueryStringByName: function (name) {
            var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
            if (result == null || result.length < 1) {
                return "";
            }
            return decodeURIComponent(result[1]);
        }
    };
    $(function () {
        viewModel.init();
    });

}(jQuery);