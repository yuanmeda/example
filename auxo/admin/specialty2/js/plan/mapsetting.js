(function () {
    'use strict';
    var store = {
        getTerms: function (specialty_plan_id) {
            return $.ajax({
                url: '/' + projectCode + '/specialty/plan/terms/' + specialty_plan_id,
                cache: false,
                dataType: 'json'
            });
        },
        getCourses: function (specialty_plan_id, search) {
            return $.ajax({
                url: '/' + projectCode + '/specialty/plans/' + specialty_plan_id + '/learning_units/search',
                cache: false,
                data: search,
                dataType: 'json'
            });
        },
        getUploadInfo: function () {
            return $.ajax({
                url: '/v1/upload_sessions',
                cache: false,
                dataType: 'json'
            });
        },
        getMap: function (specialty_plan_id, term_id) {
            return $.ajax({
                url: '/' + projectCode + '/specialty/plan/' + specialty_plan_id + '/maps/' + term_id,
                cache: false,
                dataType: 'json'
            });
        },
        updateMap: function (specialty_plan_id, term_id, data) {
            return $.ajax({
                url: '/' + projectCode + '/specialty/plan/' + specialty_plan_id + '/maps/' + term_id,
                type: 'put',
                dataType: 'json',
                data: JSON.stringify(data),
                contentType: 'application/json;charset=utf-8'
            });
        },
        /*获取阶段信息*/
        getStageInfo: function (term_id) {
            return $.ajax({
                url: '/' + projectCode + '/specialty/term/' + term_id,
                cache: false,
                dataType: 'json'
            });
        },
        /*保存阶段信息*/
        saveSetInfo: function (term_id, data) {
            return $.ajax({
                url: '/' + projectCode + '/specialty/term/' + term_id + '/rewards',
                type: 'put',
                dataType: 'json',
                data: JSON.stringify(data),
                contentType: 'application/json;charset=utf-8'
            });
        },
        getLine: function (term_id) {
            return $.ajax({
                url: '/' + projectCode + '/specialty/term/' + term_id + '/learning_units_relation',
                cache: false,
                dataType: 'json'
            });
        },
        updateLine: function (term_id, data) {
            return $.ajax({
                url: '/' + projectCode + '/specialty/term/' + term_id + '/learning_units_relation',
                type: 'put',
                dataType: 'json',
                data: JSON.stringify(data),
                contentType: 'application/json;charset=utf-8'
            })
        }
    };
    var left = $('#js_left');
    var ViewModel = {
        model: {
            search: {
                page: 0,
                size: 6,
                term_id: '',
                order: 1
            },
            term: {
                id: '',
                name: '',
                items: [],
                count: 0
            },
            course: {
                init: false,
                isEdit: false,
                isPre: false,
                mapIndex: '',
                info: {
                    unit_id: '',
                    unit_type: '',
                    title: '',
                    cover_url: '',
                    description: '',
                    extra: {
                        video_count: 0,
                        duration: 0,
                        exam_chance: 0,
                        barrier_num: 0,
                        document_count: 0,
                        exercise_count: 0,
                        period: 0
                    },
                    user_count: 0,
                    score: 0,
                    is_required: '',
                    pre_learning_units: []
                },
                items: [],
                count: 0
            },
            map: {
                id: '',
                map_image_url: '',
                map_image: '',
                children: [],
                tempImg: '',
                tempId: '',
                isChange: false,
                line: null,
                connections: []
            },
            draggable: {
                left: 0,
                top: 0
            },
            pre: {
                items: [],
                selected: []
            },
            defaultImage: defaultImage,
            showTitle: false,
            setInfo: {
                status: false,
                termInfo: {
                    "id": "",
                    "year": 0,
                    "season": 0,
                    "term_name": "",
                    "specialty_plan_id": "",
                    "start_time": "",
                    "end_time": "",
                    "summary": "",
                    "pass_required_score": 0,
                    "pass_optional_score": 0,
                    "points": 0,
                    "achieve": "",
                    "map_image": "",
                    "sort_number": 0
                }
            }
        },
        init: function () {
            this.model = ko.mapping.fromJS(this.model);
            this.initUpload();
            this._validator();
            this.validaInfo = ko.validation.group(this.model.setInfo.termInfo);
            this.getTerms();
            ko.applyBindings(this, document.getElementById('js-content'));
        },
        getTerms: function (isRefresTerm) {
            var t = this, term = this.model.term;
            store.getTerms(window.specialtyId).done(function (res) {
                term.items(res || []);
                term.count(res && res.length || 0);
                if (term.items().length) {
                    $('#js_term').width(120 * res.length + 1);
                    if (!isRefresTerm) t.getCourseMap(res[0].id, res[0].term_name);
                } else {
                    t.model.course.init(true);
                }
            })
        },
        getCourseMap: function (termId, termName) {
            var t = this,
                _course = this.model.course,
                search = this.model.search,
                _map = this.model.map,
                term = this.model.term;
            if (this.model.map.isChange()) {
                $.fn.dialog2.helpers.confirm('<p style="font-size: 16px;">您刚才编辑过的<em style="color:#f60;">阶段：【' + term.name() + '】</em>还没有保存，请保存。</p><p style="font-size: 16px; color:#f60;">若您继续点击【确定】按钮，将丢弃您未保存的内容。</p>', {
                    confirm: function () {
                        _map.isChange(false);
                        t.getCourseMap(termId, termName)
                    }
                });
                return;
            }
            term.id(termId);
            term.name(termName);
            search.term_id(termId);
            search.page(0);
            _course.init(false);
            _course.isEdit(false);
            _course.isPre(false);
            _course.mapIndex('');

            $.when(store.getMap(window.specialtyId, termId), store.getCourses(window.specialtyId, ko.mapping.toJS(search)), store.getLine(termId))
                .done(function (map, course, line) {
                    map[0].children = map[0].children || [];
                    ko.mapping.fromJS(map[0], {}, _map);

                    _course.items(course[0].items || []);
                    _course.count(course[0].total || 0);
                    _course.init(true);
                    t._page(_course.count(), search.page(), search.size());

                    if (_map.line())_map.line().reset();
                    _map.connections(line[0] || []);
                    if (_course.count() && map[0].map_image_url) {
                        ko.tasks.schedule(function () {
                            t.drag();
                            t.lazy('#js-content');
                            t.lazy('#js_left');
                        });
                    }
                    ko.tasks.schedule(function () {
                        t.linkLines();
                    });
                });
        },
        getCoursesByTermId: function () {
            var t = this, course = this.model.course;
            course.init(false);
            course.isEdit(false);
            course.isPre(false);
            store.getCourses(window.specialtyId, ko.mapping.toJS(this.model.search)).done(function (res) {
                course.items(res.items || []);
                course.count(res.total || 0);
                t._page(course.count(), t.model.search.page(), t.model.search.size());
                course.init(true);
                if (course.count() && t.model.map.map_image_url()) {
                    ko.tasks.schedule(function () {
                        t.drag();
                    });
                }
                t.lazy('#js-content');
            });
        },

        getCourseInfo: function ($index) {
            var course = this.model.course;
            course.isEdit(true);
            course.isPre(false);
            if (course.mapIndex() === $index) return;
            course.mapIndex($index);
            var courseInfo = {};
            $.each(ko.mapping.toJS(this.model.map.children), function (i, v) {
                if (v.unit_id === $index) {
                    courseInfo = v;
                    return false;
                }
            });
            courseInfo.pre_learning_units = courseInfo.pre_learning_units || [];
            this.model.pre.selected(courseInfo.pre_learning_units);
            courseInfo.pre_learning_units = $.map(courseInfo.pre_learning_units, function (v) {
                v.unit_type = v.pre_unit_type;
                v.unit_id = v.pre_unit_id;
                return v;
            });
            ko.mapping.fromJS(courseInfo, {}, this.model.course.info);
            this.lazy('#js_prelist1');
        },
        saveMap: function () {
            var t = this, map = ko.mapping.toJS(this.model.map);
            if (!map.map_image) {
                this._selfAlert('请上传背景图');
                return;
            }
            $.when(store.updateMap(window.specialtyId, this.model.term.id(), map), store.updateLine(this.model.term.id(), ko.mapping.toJS(this.model.map.connections)))
                .done(function () {
                    t.model.map.isChange(false);
                    Utils.msgTip('保存成功！');
                });
        },
        delCourse: function ($data, event) {
            event.stopPropagation();
            var data = ko.mapping.toJS($data), map = this.model.map, course = this.model.course;
            $.fn.dialog2.helpers.confirm('<p style="font-size: 16px;text-align: center;">您确认删除吗？</p>', {
                confirm: function () {
                    map.children.remove($data);
                    map.isChange(true);
                    course.isEdit(false);
                    course.isPre(false);
                    course.mapIndex('');
                    map.line().remove($(event.target).closest('.circle'));
                    $('#course_' + data.unit_id).draggable("enable");
                }
            });
        },
        reupload: function () {
            store.getUploadInfo()
                .done($.proxy(function (uploadInfo) {
                    this.reUploader.option("server", "http://" + uploadInfo.server_url + "/v0.1/upload?session=" + uploadInfo.session);
                    this.model.map.tempImg('');
                    this.model.map.tempId('');
                    $('#reuploadModal').modal('show');
                }, this));
        },
        replaceImg: function () {
            if (this.model.map.tempId()) {
                this.model.map.map_image(this.model.map.tempId());
                this.model.map.map_image_url(this.model.map.tempImg());
                this.model.map.isChange(true);
            }
            $('#reuploadModal').modal('hide');
        },
        handlePreItems: function () {
            var search = ko.mapping.toJS(this.model.search), t = this;
            search.page = undefined;
            search.size = undefined;
            store.getCourses(window.specialtyId, search).done(function (res) {
                t.model.pre.items(res.items || []);
                t.model.pre.items.remove(function (item) {
                    return item.unit_id === t.model.course.info.unit_id();
                });
                t.lazy('#js_courselist');
            });
        },
        showPreModel: function () {
            this.handlePreItems();
            $('#preModal').modal('show');
        },
        selectPre: function ($data, event) {
            var target = $(event.delegateTarget);
            if (target.hasClass('select')) {
                this.model.pre.selected.remove(function (item) {
                    return item.pre_unit_id === $data.unit_id
                });

            } else {
                this.model.pre.selected.push($.extend($data, {
                    pre_unit_id: $data.unit_id,
                    pre_unit_type: $data.unit_type
                }));
            }
        },
        addPre: function () {
            var t = this;
            this.model.course.info.pre_learning_units(this.model.pre.selected());
            $.each(this.model.map.children(), function (i, v) {
                if (ko.mapping.toJS(v.unit_id) === t.model.course.mapIndex()) {
                    v.pre_learning_units(ko.mapping.toJS(t.model.pre.selected));
                    return false;
                }
            });
            this.model.map.isChange(true);
            $('#preModal').modal('hide');
            this.lazy('#js_prelist1');
        },
        delPre: function ($data) {
            var data = ko.mapping.toJS($data), t = this;
            $.fn.dialog2.helpers.confirm('<p style="font-size: 16px;text-align: center;">您确认删除吗？</p>', {
                confirm: function () {
                    t.model.pre.selected.remove(function (item) {
                        return item.pre_unit_id === data.unit_id
                    });
                    t.addPre();
                }
            });
        },
        toggleSelect: function ($data) {
            var bool = false;
            $.each(this.model.pre.selected(), function (i, v) {
                if (v.pre_unit_id === $data.unit_id) {
                    bool = true;
                    return false;
                }
            });
            return bool;
        },
        toggleDisable: function ($data) {
            var disable = false;
            $.each(ko.mapping.toJS(this.model.map.children), function (i, v) {
                if (v.unit_id === $data.unit_id) {
                    disable = true;
                    return false;
                }
            });
            return disable;
        },
        disableDrag: function () {
            var t = this;
            $.each(ko.mapping.toJS(this.model.map.children), function (i, map) {
                $.each(t.model.course.items(), function (ii, course) {
                    if (map.unit_id === course.unit_id) {
                        $('#course_' + course.unit_id).draggable("disable");
                    }
                });
            });
        },
        drag: function () {
            var t = this,
                mapC = this.model.map.children;
            $(".draggable").draggable({
                cursor: "move",
                stop: function (event, ui) {
                    $(event.target).removeAttr('style')
                }
            });
            this.disableDrag();
            this.dragCircle();
            left.droppable({
                accept: ".draggable,.circle",
                tolerance: "pointer",
                drop: function (event, ui) {
                    if ($(ui.draggable).hasClass('draggable')) {
                        t.model.map.isChange(true);
                        var data = $(ui.draggable).data('course');
                        data.pre_learning_units = ko.observableArray([]);
                        mapC.push($.extend(data, t.createCircle(event.clientX, event.clientY)));
                        mapC.valueHasMutated();
                        t.initNode($('#' + data.unit_id), t.model.map.line());
                        t.dragCircle();
                        t.lazy('#js_left');
                        $(ui.draggable).draggable("disable");
                    }
                },
                over: function (event, ui) {
                    $(ui.draggable).removeClass('out');
                },
                out: function (event, ui) {
                    $(ui.draggable).addClass('out');
                }
            });
        },
        dragCircle: function () {
            var mapC = this.model.map.children,
                w = this.model.draggable.left,
                h = this.model.draggable.top,
                map = this.model.map,
                t = this;
            $(".circle").draggable({
                cancel: ".ep",
                cursor: "move",
                start: function (event, ui) {
                    if ($(event.target).hasClass('out')) $(ui.helper).removeClass('out')
                },
                drag: function (event, ui) {
                    if (left.scrollLeft() >= w()) left.scrollLeft(w());
                    if (left.scrollTop() >= h()) left.scrollTop(h());
                    map.line().repaintEverything();
                    map.line().revalidate($(event.target));
                },
                stop: function (event, ui) {
                    var target = $(event.target);
                    if (target.hasClass('out')) {
                        target.css({
                            left: ui.originalPosition.left,
                            top: ui.originalPosition.top
                        });
                        map.line().repaintEverything();
                        map.line().revalidate($(event.target));
                    } else {
                        var position = {
                                x: target.css('left'),
                                y: target.css('top')
                            },
                            index = target.data('index');
                        $.each(mapC(), function (i, v) {
                            if (ko.mapping.toJS(v.unit_id) === index) {
                                $.extend(v, position);
                                return false;
                            }
                        });
                        t.model.map.isChange(true);
                    }
                },
                scroll: true
            }).click(function (event) {
                t.getCourseInfo($(event.delegateTarget).data('index'));
            });
        },
        createCircle: function (x, y) {
            var l = (left.scrollLeft() + x - left.offset().left - 50) + 'px',
                t = (left.scrollTop() + y - left.offset().top - 50) + 'px';
            return {
                x: l,
                y: t
            }
        },
        linkLines: function () {
            var t = this,
                connections = [];

            function updateConnections(conn, remove) {
                var idx = -1;
                for (var i = 0; i < connections.length; i++) {
                    if (connections[i].id === conn.id) {
                        idx = i;
                        break;
                    }
                }
                if (idx != -1) {
                    if (remove) connections.splice(idx, 1);
                    else {
                        connections.splice(idx, 1, {
                            id: conn.id,
                            source: conn.sourceId,
                            target: conn.targetId
                        });
                    }
                } else {
                    connections.push({
                        id: conn.id,
                        source: conn.sourceId,
                        target: conn.targetId
                    });
                }
                t.model.map.connections(connections);
            }

            jsPlumb.ready(function () {
                var instance = jsPlumb.getInstance({
                    Endpoint: ["Dot", {cssClass: 'circle-endpoint', hoverClass: 'circle-endpoint__hover', radius: 4}],
                    HoverPaintStyle: {stroke: "orange", strokeWidth: 2},
                    Anchor: ['Top', 'Right', 'Bottom', 'Left'],
                    ConnectionOverlays: [
                        ["Arrow", {
                            location: 1,
                            id: "arrow",
                            length: 11,
                            foldback: 0.8,
                            width: 11
                        }]
                    ],
                    Container: "js_left"
                });
                instance.bind("click", function (c) {
                    instance.deleteConnection(c);
                });
                instance.bind("connection", function (info) {
                    if (info.connection.sourceId == info.connection.targetId) {
                        instance.deleteConnection(info.connection);
                    } else {
                        updateConnections(info.connection);
                    }
                });
                instance.bind("connectionDetached", function (info) {
                    updateConnections(info.connection, true);
                    t.model.map.isChange(true);
                });
                instance.bind('beforeDrop', function (params) {
                    var isRepeat = false;
                    $.each(connections, function (i, v) {
                        if (((v.source === params.sourceId) && (v.target === params.targetId)) ||
                            ((v.target === params.sourceId) && (v.source === params.targetId))) {
                            isRepeat = true;
                            return false;
                        }
                    });
                    t.model.map.isChange(true);
                    return !isRepeat;
                });
                instance.batch(function () {
                    $.each(ko.mapping.toJS(t.model.map.children), function (i, v) {
                        t.initNode($('#' + v.unit_id), instance);
                    });
                    $.each(ko.mapping.toJS(t.model.map.connections), function (i, v) {
                        instance.connect({source: v.source, target: v.target})
                    });
                });
                jsPlumb.fire("jsPlumbDemoLoaded", instance);
                t.model.map.line(instance);
            });
        },
        initNode: function (el, instance) {
            instance.makeSource(el, {
                filter: ".ep",
                connector: ["Flowchart", {stub: [1, 16], gap: 10, cornerRadius: 8, alwaysRespectStubs: true}],
                connectorStyle: {
                    stroke: "#fff",
                    strokeWidth: 2,
                    joinstyle: "round",
                    outlineStroke: "transparent",
                    outlineWidth: 4
                },
                extract: {
                    "action": "the-action"
                },
                allowLoopback: false
            });
            instance.makeTarget(el, {
                dropOptions: {hoverClass: "circle-dragHover"},
                reattach: true,
                allowLoopback: false
            });
            instance.fire("jsPlumbDemoNodeAdded", el);
        },
        initUpload: function () {
            store.getUploadInfo()
                .done($.proxy(function (uploadInfo) {
                    this.uploadInfo = uploadInfo;
                    this.initPicturePlugin('js_uploadmap', uploadInfo);
                    this.reUploader = this.initPicturePlugin('js_reupload', uploadInfo);
                }, this));
        },
        initPicturePlugin: function (domId, uploadInfo) {
            var uploader = new WebUploader.Uploader({
                swf: window.staticUrl + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                server: 'http://' + uploadInfo.server_url + '/v0.1/upload?session=' + uploadInfo.session,
                auto: true,
                fileVal: 'Filedata',
                duplicate: true,
                pick: {
                    id: '#' + domId,
                    multiple: false
                },
                formData: {
                    path: uploadInfo.path
                },
                fileSingleSizeLimit: 3 * 1024 * 1024,
                accept: [{
                    title: "Images",
                    extensions: "png,jpg",
                    mimeTypes: 'image/png,image/jpeg'
                }]
            });
            uploader.on('beforeFileQueued', $.proxy(this.beforeFileQueued, this));
            uploader.on('uploadBeforeSend', $.proxy(this.uploadBeforeSend, this));
            uploader.on('uploadError', $.proxy(this.uploadError, this, uploader, "#" + domId));
            uploader.on('uploadSuccess', $.proxy(this.uploadSuccess, this, "#" + domId));
            uploader.on('uploadProgress', $.proxy(this.uploadProgress, this, '#' + domId));
            uploader.on('error', $.proxy(this.selectError, this, 'picture'));
            return uploader;
        },
        selectError: function (type, error) {
            if (error == "Q_TYPE_DENIED") {
                if (type == 'picture') {
                    this._selfAlert('请上传格式为png,jpg的图片！');
                }

            } else if (error == "F_EXCEED_SIZE") {
                this._selfAlert('大小不能超过3M');
            }
        },
        uploadProgress: function (selector, file, percentage) {
            if (~selector.indexOf('js_reupload')) {
                $(selector).next('.tip').show().text('正在上传：' + "(" + Math.floor(percentage * 100) + "%)");
            } else {
                $(selector).parent().next('.tip').show().text('正在上传：' + "(" + Math.floor(percentage * 100) + "%)");
            }
        },
        beforeFileQueued: function (file) {
            if (file && file.size == 0) {
                this._selfAlert('请重新选择图片');
                return false;
            }
        },
        uploadError: function (uploader, domId, file, reason) {
            this.uploaderMap = this.uploaderMap || {};
            this.uploaderMap[domId] = this.uploaderMap[domId] || 0;
            if (++this.uploaderMap[domId] <= 1) {
                store.getUploadInfo()
                    .done($.proxy(function (uploadInfo) {
                        uploader.option("server", "http://" + uploadInfo.server_url + "/v0.1/upload?session=" + uploadInfo.session);
                        uploader.retry();
                    }, this));
            } else {
                this._selfAlert('上传失败：' + reason);
            }
        },
        uploadBeforeSend: function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            headers.Accept = "*/*";
        },
        uploadSuccess: function (domId, file, response) {
            if (!response.code) {
                this.model.map.isChange(true);
                var img_url = 'http://' + this.uploadInfo.server_url + '/v0.1/download?dentryId=' + response.dentry_id;
                if (~domId.indexOf('js_uploadmap')) {
                    this.model.map.map_image(response.dentry_id);
                    this.model.map.map_image_url(img_url);
                    this.drag();
                } else {
                    this.model.map.tempId(response.dentry_id);
                    this.model.map.tempImg(img_url);
                }
            } else {
                response ? this._selfAlert(response.message) : this._selfAlert('上传失败');
            }
            setTimeout($.proxy(function () {
                if (~domId.indexOf('js_reupload')) {
                    $(domId).next('.tip').hide();
                } else {
                    $(domId).parent().next('.tip').hide();
                }
            }, this), 1000);
        },
        goToCourseList: function () {
            this.model.course.isEdit(false);
            this.model.course.isPre(false);
        },
        // 弹窗
        _selfAlert: function (text) {
            $.fn.dialog2.helpers.alert(text);
        },
        switchTab: function (isPre) {
            this.model.course.isPre(isPre);
        },
        load: function () {
            var draggable = this.model.draggable;
            draggable.left(left.children('#js_background').width() - left.width());
            draggable.top(left.children('#js_background').height() - left.height());
        },
        lazy: function (container) {
            $('.lazy-image:not(.loaded)').lazyload({
                container: $(container),
                placeholder: defaultImage,
                load: function () {
                    $(this).addClass('loaded');
                }
            }).trigger('scroll');
        },
        startScroll: function (to) {
            var container = $('#js_termwarp'), left = container.scrollLeft(), speed = to == "left" ? -10 : 10;
            this.scroller = setInterval($.proxy(function () {
                container.scrollLeft(container.scrollLeft() + speed)
            }, this), 10);
        },
        endScroll: function () {
            clearInterval(this.scroller);
        },
        formatResourceType: function ($data) {
            var map = {
                "business_course": "课程",
                "standard_exam": "考试",
                "custom_exam": "自定义考试",
                "competition": "智力竞赛",
                "design_methodlogy_exam": "方法论考试",
                "design_methodlogy_exercise": "方法论练习",
                "barrier": "闯关",
                "plan_exam": "测评"
            };
            return map[$data];
        },
        showSetModal: function () {
            $('#infoSetModal').modal('show');
            this.getStageInfo();
        },
        closeSetModal: function () {
            $('#infoSetModal').modal('hide');
        },
        /*获取阶段信息*/
        getStageInfo: function () {
            var that = this;
            this.model.showTitle(false);
            store.getStageInfo(this.model.term.id()).done(function (data) {
                ko.mapping.fromJS(data, {}, that.model.setInfo.termInfo);
                if (!data.achieve) {
                    that.model.setInfo.status(false);
                } else {
                    that.model.setInfo.status(true);
                }
            })
        },
        /*保存阶段信息*/
        saveSetInfo: function () {
            if (this.validaInfo().length) {
                this.validaInfo.showAllMessages();
                return;
            }
            var that = this;
            if (this.model.setInfo.status() === false) {
                that.model.setInfo.termInfo.achieve(null);
            } else {
                this.model.setInfo.termInfo.achieve(this.model.setInfo.termInfo.achieve().replace(/\s/g, ""));
            }
            store.saveSetInfo(this.model.term.id(), ko.mapping.toJS(this.model.setInfo.termInfo)).done(function () {
                that.getTerms(true);
                $('#infoSetModal').modal('hide');
            })

        },
        _validator: function () {
            this.model.setInfo.termInfo.achieve.extend({
                maxLength: {
                    params: 20,
                    message: '不能超过20个字符'
                }
            });
            this.model.setInfo.termInfo.term_name.extend({
                required: {
                    params: true,
                    message: '请填写阶段名称'
                },
                maxLength: {
                    params: 11,
                    message: '不能超过11个字符'
                }
            });
            this.model.setInfo.termInfo.summary.extend({
                maxLength: {
                    params: 200,
                    message: '不能超过200个字符'
                }
            });
            this.model.setInfo.termInfo.pass_optional_score.extend({
                required: {
                    params: true,
                    message: '请填写选修学分'
                },
                number: {
                    params: true,
                    message: '选修学分格式错误'
                },
                min: {
                    params: 0,
                    message: '选修学分不能低于{0}'
                },
                max: {
                    params: 9999,
                    message: '选修学分不能高于{0}'
                }
            });
            this.model.setInfo.termInfo.points.extend({
                required: {
                    params: true,
                    message: '请填写积分奖励'
                },
                number: {
                    params: true,
                    message: '积分奖励格式错误'
                },
                digit: {
                    params: true,
                    message: '积分只能为整数'
                },
                min: {
                    params: 0,
                    message: '积分奖励不能低于{0}'
                },
                max: {
                    params: 999999,
                    message: '积分奖励不能高于{0}'
                }
            });
        },
        _page: function (count, offset, limit) {
            var self = this;
            $("#js_pagination_map").pagination(count, {
                is_show_first_last: false,
                is_show_input: false,
                is_show_total: false,
                items_per_page: limit,
                num_display_entries: 5,
                current_page: offset,
                prev_text: "上一页",
                next_text: "下一页",
                callback: function (index) {
                    if (index != offset) {
                        self.model.search.page(index);
                        self.model.course.items([]);
                        self.model.course.init(false);
                        self.getCoursesByTermId();
                    }
                }
            });
        }
    };
    $(function () {
        ko.validation.init({
            decorateInputElement: true,
            errorElementClass: 'ele-error',
            errorClass: 'mes-error',
            registerExtenders: true
        }, true);
        $('.mes-error').css({'color': 'red', 'font-size': '12px'});
        ViewModel.init();
    });
})();
