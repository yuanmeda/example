(function (w, $) {
    'use strict';
    function Model(params) {
        this.model = {
            questionBanks: [],
            tags: [],
            level0: [],
            level1: [],
            level2: [],
            selectedQuestionBank: '',
            selectedTags: {
                0: "",
                1: "",
                2: "",
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
            return this.model.selectedQuestionBank() +  ' and ' + this.model.selectedTags[2]();
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
                var url = '/' + projectCode + '/exam/v2/categories/relations/all?patternPath=AUTO_LEARNING';
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
            getQuestionBanks: function () {
                var url = '/' + projectCode + '/exam/v2/categories/ability_explore';
                return $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: "json",
                    cache: false,
                    contentType: 'application/json;charset=utf8',
                    error: this.errorCallback
                });
            }
        };
        this.model.tags.subscribe(function (val) {
            this.processTags();
        }.bind(this));
        this._init();
    }

    Model.prototype = {
        _init: function () {
            this.store.getQuestionBanks().done($.proxy(function (data) {
                if (data && data.items) {
                    this.model.questionBanks(data.items);
                    if (!this.model.selectedQuestionBank()) {
                        this.model.selectedQuestionBank(data.items[0].nd_code);
                    }
                    this.enableFresh(true);
                }
            }, this));
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
            }
        },
        _emptyChapterTree: function () {
            this.model.chapterId('');
            this.model.chapters = [];
            if (this.zTreeObject) {
                this.zTreeObject.destroy();
            }
            $("#chapterTree").text("该条件下无章节");
        },
        questionBankClickHandle: function (ndCode) {
            this.model.selectedQuestionBank(ndCode);
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
                    } else {
                        //subjects here level2
                        flag = throughItems[0].target.nd_code;
                        if (flag.indexOf('SB') != -1) {
                            this._level2Handle(throughItems);
                        } else {
                            this.model.selectedTags[2]("");
                            this.model.level2([]);
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
            } else {
                var flag = nextThroughItems[0].target.nd_code;
                if (flag.indexOf('E')) {
                } else {
                }
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
        refresh: function () {
            this.enableFresh(false);
            this.enableFresh(true);
        }
    };

    ko.components.register('x-tagpool', {
        viewModel: {
            createViewModel: function (params, tplInfo) {
                $(tplInfo.element).html(tplInfo.templateNodes);
                return new Model(params);
            }
        },
        template: '<div></div>'
    });
})(window, jQuery);