(function (w, $) {
    'use strict';
    function Model(params) {
        this.model = {
            tags: [],
            level0: [],
            level1: [],
            level2: [],
            level3: [],
            level4: [],
            selectedTags: {
                0: "",
                1: "",
                2: "",
                3: "",
                4: ""
            },
            rootId: "",
            chapters: {},
            selectedItems: [],
            //items:{}
            modalModule: params.modalModule,
            chapterId: ''
        };
        this.model = ko.mapping.fromJS(this.model);
        this.category = ko.computed(function () {
            return this.model.selectedTags[0]() + '/' + this.model.selectedTags[1]() + '/' + this.model.selectedTags[2]() + '/' + this.model.selectedTags[3]() + '/' + this.model.selectedTags[4]();
        }, this);
        this.category.subscribe(function () {
            this.refresh();
        }, this);
        this.model.actions = {
            'answer': {func: $.proxy(this.addQuestion, this), show: true},
            'add': {func: $.proxy(this.addQuestion, this), show: true},
            'update': {func: $.proxy(this.addQuestion, this), show: false},
            'delete': {func: $.proxy(this.addQuestion, this), show: false}
        };
        this.zTreeObject = null;
        this.enableFresh = ko.observable(false);
        this.enableFresh.extend({notify: 'always'});
        this.bankId = params.bankId;
        this.store = {
            errorCallback: function (jqXHR) {
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
            },
            getItemTags: function () {
                var url = '/' + projectCode + '/exam/v2/categories/relations/all';
                return $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: "json",
                    cache: false,
                    contentType: 'application/json;charset=utf8',
                    error: this.errorCallback
                });
            },
            getMaterials: function (category) {
                var url = '/' + projectCode + '/exam/v2/teachingmaterials?words=&coverage=Org/nd/OWNER&category=' + category;
                return $.ajax({
                    url: url,
                    type: 'get',
                    contentType: 'application/json;charset=utf8',
                    error: this.errorCallback
                });
            },
            getChapterTree: function (mid) {
                var url = '/' + projectCode + '/exam/v2/teachingmaterials/' + mid + '/chapters/0/subitems';
                return $.ajax({
                    url: url,
                    type: 'get',
                    contentType: 'application/json;charset=utf8',
                    error: this.errorCallback
                });
            }
        };
        this.model.tags.subscribe(function (val) {
            this.processTags();
            this._initTreeData();
        }.bind(this));
        this._init();
    }

    Model.prototype = {
        _init: function () {
            this.store.getItemTags().done($.proxy(function (data) {
                if (data && data.items) {
                    this.model.tags(data && data.items);
                    this.enableFresh(true);
                }
            }, this));
        },
        addQuestion: function (data) {
            console.log(data);
        },
        tagClickHandle: function (element, level) {
            if ($(element).hasClass('active')) {
                return;
            } else {
                $('a', $(element).closest('.option')).removeClass('active');
                $(element).addClass('active');
                var nd_code = $(element).data('id');
                this.model.selectedTags[level](nd_code);
                this.processTags();
                var selectedTags = ko.mapping.toJS(this.model.selectedTags);
                //var category = selectedTags[0] + '/' + selectedTags[1] + '/' + selectedTags[2] + '/' + selectedTags[3] + '/' + selectedTags[4];
                this._initTreeData();
            }
        },
        _initTreeData:function(){
            this.store.getMaterials(this.category())
                .done($.proxy(function (material) {
                    if (material && material.items && material.items.length > 0) {
                        var id = material.items[0].identifier;
                        if (id) {
                            this.model.rootId(id);
                            this.store.getChapterTree(id)
                                .done($.proxy(function (chapterTree) {
                                    if (chapterTree && chapterTree.items && chapterTree.items[0]) {
                                        this.model.chapters = chapterTree.items;
                                        this.zTreeObject && this.zTreeObject.destroy();
                                        this._chapterTreeInit();
                                    } else {
                                        this._emptyChapterTree();
                                    }
                                }, this))
                        } else {
                            this._emptyChapterTree();
                        }
                    } else {
                        this._emptyChapterTree();
                    }
                }, this))
        },
        _emptyChapterTree: function () {
            this.model.chapterId('');
            this.model.chapters = [];
            if (this.zTreeObject) {
                this.zTreeObject.destroy();
            }
            $("#chapterTree").text("该条件下无章节");
        },
        processTags: function () {
            var tags = ko.mapping.toJS(this.model.tags);
            if (tags.length > 0) {
                if (!this.model.selectedTags[0]()) {
                    this.model.selectedTags[0](tags[0].target.nd_code);
                }
                var selectedTagForLevel0 = this.model.selectedTags[0]();
                var returnData = this._returnItemArray(selectedTagForLevel0, tags);
                var throughItems = returnData.throughItems;
                this.model.level0(returnData.preparedData);

                var flag = throughItems[0].target.nd_code;

                if (flag.indexOf('ON') != -1) {
                    //throughItems is the array for grades.
                    if (!this.model.selectedTags[1]()) {
                        this.model.selectedTags[1](throughItems[0].target.nd_code);
                    }
                    var selectedTagForLevel1 = this.model.selectedTags[1]();
                    var returnData = this._returnItemArray(selectedTagForLevel1, throughItems);
                    throughItems = returnData.throughItems;
                    this.model.selectedTags[1](returnData.newNDTag);
                    this.model.level1(returnData.preparedData);

                    if (throughItems.length == 0) {
                        this.model.selectedTags[2]("");
                        this.model.level2([]);
                        this.model.selectedTags[3]("");
                        this.model.level3([]);
                        this.model.selectedTags[4]("");
                        this.model.level4([]);
                    } else {
                        //subjects here level2
                        flag = throughItems[0].target.nd_code;
                        if (flag.indexOf('SB') != -1) {
                            this._level2Handle(throughItems);
                        } else {
                            this.model.selectedTags[2]("");
                            this.model.level2([]);
                            this.model.selectedTags[3]("");
                            this.model.level3([]);
                            this.model.selectedTags[4]("");
                            this.model.level4([]);
                        }
                    }

                } else {
                    this.model.selectedTags[1]("");
                    this.model.level1([]);
                    if (flag.indexOf('SB') != -1) {
                        this._level2Handle(throughItems);
                    } else {
                        this.model.selectedTags[2]("");
                        this.model.level2([]);
                        this.model.selectedTags[3]("");
                        this.model.level3([]);
                        this.model.selectedTags[4]("");
                        this.model.level4([]);
                    }
                }
            }
        },
        _level2Handle: function (throughItems) {
            var selectedTagForLevel2 = this.model.selectedTags[2]();
            var returnData = this._returnItemArray(selectedTagForLevel2, throughItems);
            this.model.selectedTags[2](returnData.newNDTag);
            this.model.level2(returnData.preparedData);
            var nextThroughItems = returnData.throughItems;
            if (nextThroughItems.length == 0) {
                this.model.selectedTags[3]("");
                this.model.selectedTags[4]("");
                this.model.level3([]);
                this.model.level4([]);
            } else {
                var flag = nextThroughItems[0].target.nd_code;
                if (flag.indexOf('E')) {
                    this._level3Handle(nextThroughItems);
                } else {
                    this.model.selectedTags[3]("");
                    this.model.selectedTags[4]("");
                    this.model.level3([]);
                    this.model.level4([]);
                }
            }
        },
        _level3Handle: function (throughItems) {
            var selectedTagForLevel3 = this.model.selectedTags[3]();
            var returnData = this._returnItemArray(selectedTagForLevel3, throughItems);
            this.model.selectedTags[3](returnData.newNDTag);
            this.model.level3(returnData.preparedData);
            var nextThroughItems = returnData.throughItems;
            if (nextThroughItems.length == 0) {
                this.model.selectedTags[4]("");
                this.model.level4([]);
            } else {
                var selectedTagForLevel4 = this.model.selectedTags[4]();
                var data = this._returnItemArray(selectedTagForLevel4, nextThroughItems);
                this.model.selectedTags[4](data.newNDTag);
                this.model.level4(data.preparedData);
            }
        },
        _returnItemArray: function (ndCode, array) {
            var returnData = {
                preparedData: [],
                throughItems: [],
                newNDTag: '',
            };
            var flag = true;
            $.each(array, function (index, tag) {
                if (tag.target.nd_code == ndCode) {
                    returnData.newNDTag = ndCode;
                    flag = false;
                    returnData.throughItems = tag.items;
                }
                returnData.preparedData.push({
                    nd_code: tag.target.nd_code,
                    title: tag.target.title
                });
            });
            if (flag) {
                returnData.throughItems = array[0].items || [];
                returnData.newNDTag = array[0].target.nd_code;
            }
            return returnData;
        },
        _chapterTreeInit: function () {
            var setting = {
                data: {
                    key: {
                        name: "title",
                        title: "title"
                    },
                    simpleData: {
                        enable: true,
                        idKey: "identifier",
                        pIdKey: "parent",
                        rootPId: this.model.rootId
                    }
                },
                view: {
                    showIcon: false,
                    nameIsHTML: true,
                    selectedMulti: false
                },
                callback: {
                    onClick: $.proxy(function (event, treeId, treeNode) {
                        this.model.chapterId(treeNode.identifier);
                        this.refresh();
                        //console.log(treeId);
                    }, this)
                }
            };
            var chapters = ko.mapping.toJS(this.model.chapters);
            if (chapters && chapters.length > 0) {
                var zTreeObject = this.zTreeObject = $.fn.zTree.init($("#chapterTree"), setting, chapters);
                zTreeObject.expandAll(true);
            } else {
                $("#chapterTree").text("该条件下无章节");
            }
        },
        refresh: function () {
            this.enableFresh(false);
            this.enableFresh(true);
        }
    };

    ko.components.register('x-itempool', {
        viewModel: {
            createViewModel: function (params, tplInfo) {
                $(tplInfo.element).html(tplInfo.templateNodes);
                return new Model(params);
            }
        },
        template: '<div></div>'
    });
})(window, jQuery);