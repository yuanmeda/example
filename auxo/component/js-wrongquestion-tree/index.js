import tpl from './template.html';
import ko from 'knockout';

;(function ($, window) {

    var that;

    var TMATERIAL = 'tmaterial'
    
    var selfUrl = window.selfUrl || ''

    var store = {
    	
	    // 获取课程章节目录
	    getCoursesChapters: function (courseId) {
	        var url = selfUrl + '/v1/courses/'+ courseId +'/chapters';
            var data = {
                component: component
            }
	        return $.ajax({
                url: url,
                data: data
            })
	    },
	    // 获取教材章节目录
	    getTmaterialsChapters: function (tmaterialsId) {
	        var url = selfUrl + '/v1/teaching_materials/'+ tmaterialsId +'/chapters';
            var data = {
                component: component
            }
	        return $.ajax({
                url: url,
                data: data
            })
	    },
	    // 获取课程知识点
        getCourseKnowledges: function (courseId) {
            var url = selfUrl + '/v1/courses/'+ courseId +'/knowledges';
            var data = {
                component: component
            }
            return $.ajax({
                url: url,
                data: data
            })
        }
    };

    function Model(params) {
        this.model = {
            multiSelectId: params.multiSelectId || '',
            tags: params.tags,
            type: params.type() || TMATERIAL,
            selectedTab: 0,
            loading: true,
            nochapterdata: false,
            noknowledgedata: false,
            selectedNode: null
        };
        this.onSelect = params.onSelect;
        this.init(params);
        this.chapterTree = null;
        this.knowledgeTree = null;
        params.multiSelectId.subscribe(function(){
            params.multiSelectId() ?
                that.getData():
                that.getNoData()
        })
    }

    Model.prototype = {

        init: function (params) {
            that = this;
            this.model = ko.mapping.fromJS(this.model);
            this.model.multiSelectId() ?
                this.getData():
                this.getNoData()
        },

        getData: function () {
            var that = this;
            var multiSelectId = this.model.multiSelectId();
            var type = this.model.type();

            this.initChapterzTree('');
            this.initKnowledgezTree('');
            type == TMATERIAL ?
                this.getTmaterialsChapters(multiSelectId) : 
                function(){that.getCoursesChapters(multiSelectId);that.getCoursesKnowleges(multiSelectId)}()
        },

        getNoData: function () {
            this.getNoChapterData();
            this.getNoKnowledgeData();
        },
        getNoChapterData: function () {
            this.initChapterzTree('');
            this.model.loading(false).nochapterdata(true);
        },
        getNoKnowledgeData: function () {
            this.initKnowledgezTree('');
            this.model.loading(false).noknowledgedata(true);
        },
        
        getChapters: function (data) {
            this.model.loading(false);
            if(data) {
                this._hideData(data);
                this.initChapterzTree(data);
                this.model.nochapterdata(false);
            }else {
                this.model.nochapterdata(true);
            }
        },
        getKnowledges: function (data) {
            this.model.loading(false);
            if(data && data.wrong_count) {
                this._addTypeAndId(data);
                this._hideData(data);
                this.initKnowledgezTree(data.items);
                this.model.noknowledgedata(false);
            }else {
                this.model.noknowledgedata(true);
            }
        },

        _hideData: function (data) {
            var that = this;
            if (data.items) {
                $.each(data.items, function (index, item) {
                    if (item.wrong_count == 0) {
                        item.isHidden = true;
                    } else {
                        that._hideData(item);
                    }
                })
            }
        },

        _addTypeAndId: function (data) {
            var that = this;
            if (data.items) {
                $.each(data.items, function (index, item) {
                    item.type = 'knowledge_points';
                    item.id = item.lesson_id + '_' + item.knowledge_id;
                })
                data.items.unshift({
                    id: data.id,
                    type: data.type,
                    title: data.title,
                    knowledge_id:null,
                    parent_knowledge_id:null,
                    wrong_count: data.wrong_count || 0
                })
            }
        },

        getCoursesChapters: function (courseId) {
            var that = this;
            this.model.loading(true).nochapterdata(false);
            store.getCoursesChapters(courseId).done(function (data){
                that.getChapters(data);
            }).fail(function (data) {
                that.getNoChapterData();
            })
        },

        getCoursesKnowleges: function (courseId) {
            var that = this;
            store.getCourseKnowledges(courseId).done(function (data){
                that.getKnowledges(data);
            }).fail(function (data) {
                that.getNoKnowledgeData();
            })
        },

        getTmaterialsChapters: function (tmaterialsId) {
            var that = this;
            this.model.loading(true).nochapterdata(false);
            store.getTmaterialsChapters(tmaterialsId).done(function (data){
                that.getChapters(data);
            }).fail(function (data) {
                that.getNoChapterData();
            })
        },

        getTmaterialsKnowleges: function (tmaterialsId) {
            var that = this;
            store.getTmaterialsChapters(tmaterialsId).done(function (data){
                that.getChapters(data);
            }).fail(function (data) {
                that.getNoKnowledgeData();
            })
        },

        mathJaxInit: function () {
            MathJax.Hub.Typeset()
        },

        initChapterzTree: function (data) {
            var that = this;
            var setting = {
                view: {
                    showLine: false,
                    showIcon: false,
                    nameIsHTML: true,
                    selectedMulti: false
                },
                data: {
                    key: {
                        name: 'title',
                        title: 'title',
                        count: 'wrong_count',
                        children: 'items'
                    },
                    simpleData: {
                        enable: false,
                        idKey: 'id',
                        pIdKey: 'parent_id'
                    }
                },
                callback: {
                    onClick: that.nodeClick,
                    onExpand: that.mathJaxInit
                }

            };
            $.fn.zTree._z.view.makeDOMNodeNameAfter = function(e, t, n) {
                e.push("<span class='tree-count'>" + n.wrong_count + "题</span></a>")
            }
            that.chapterTree = $.fn.zTree.init($("#chapterTree"), setting, data);
            var nodes = that.chapterTree.getNodes();
            if (nodes.length>0) {

                // 首节点为全部
                nodes[0].title = "全部章节";
                that.chapterTree.updateNode(nodes[0]);

                // 第一节全部展开
                for(var i=0;i<nodes.length;i++){
                    that.chapterTree.expandNode(nodes[i], true, false, false, function() {
                        that.mathJaxInit
                    });
                }

                var tags = ko.mapping.toJS(that.model.tags);
                var selectNode = nodes[0];
                if (tags && tags.length > 0) {
                    $.each(tags, function (index, item) {
                        if ((item.type == 'chapter' || item.type == 'cloud_chapter' || item.type == 'cloud_course') && item.value) {
                            var node = that.chapterTree.getNodeByParam('id',item.value);
                            if (node) {
                                selectNode = node;
                            }
                            return false;
                        }
                    })
                }
                that.chapterTree.selectNode(selectNode);
                that._decorateNode(selectNode);
                // 选中第一个节点
                // treeObj.selectNode(nodes[0]);
                // this.nodeClick(event, nodes[0].id, nodes[0]);
            }
        },
        initKnowledgezTree: function (data) {
            var that = this;
            var setting = {
                view: {
                    showLine: false,
                    showIcon: false,
                    nameIsHTML: true,
                    selectedMulti: false
                },
                data: {
                    key: {
                        name: 'title',
                        title: 'title',
                        count: 'wrong_count'
                    },
                    simpleData: {
                        enable: true,
                        idKey: 'knowledge_id',
                        pIdKey: 'parent_knowledge_id',
                        rootKey: null
                    }
                },
                callback: {
                    onClick: that.nodeClick,
                    onExpand: that.mathJaxInit
                }

            };
            $.fn.zTree._z.view.makeDOMNodeNameAfter = function(e, t, n) {
                e.push("<span class='tree-count'>" + n.wrong_count + "题</span></a>")
            }
            that.knowledgeTree = $.fn.zTree.init($("#knowledgeTree"), setting, data);
            var nodes = that.knowledgeTree.getNodes();
            if (nodes.length>0) {

                // 首节点为全部
                nodes[0].title = "全部知识点";
                that.knowledgeTree.updateNode(nodes[0]);

                // 第一节全部展开
                for(var i=0;i<nodes.length;i++){
                    that.knowledgeTree.expandNode(nodes[i], true, false, false, function() {
                        that.mathJaxInit
                    });
                }

                var tags = ko.mapping.toJS(that.model.tags);
                var selectNode = null;
                if (tags && tags.length > 0) {
                    $.each(tags, function (index, item) {
                        if ((item.type == 'knowledge_points' || item.type == 'ndr_course') && item.value) {
                            var node = that.knowledgeTree.getNodeByParam('knowledge_id',item.value);
                            if (node) {
                                selectNode = node;
                            }
                            return false;
                        }
                    })
                }
                if(selectNode) {
                    that.chapterTree.cancelSelectedNode();
                    that.knowledgeTree.selectNode(selectNode);
                    that._decorateNode(selectNode);
                    that.model.selectedTab(1);
                }
                // 选中第一个节点
                // treeObj.selectNode(nodes[0]);
                // this.nodeClick(event, nodes[0].id, nodes[0]);
            }
        },
        _decorateNode: function (treeNode) {
            var $currentTreeNode = $("#" + treeNode.tId)
            var selectWidth = $(".tree-con").width() || 310;
            var currentBgDom = '<div class="current-bg-dom"></div>';
            $(".current-bg-dom").remove();
            $currentTreeNode.prepend(currentBgDom);
            var selectNodeLevel = $currentTreeNode.attr("class");
            var selectPaddingLeft = Number(selectNodeLevel.replace("level", ""));
            $(".current-bg-dom").css({
                "width": selectWidth,
                "marginLeft" : -selectPaddingLeft * 21-10 +"px",
                "marginBottom": "-47px"
            });
        },

        nodeClick: function (event, multiSelectId, treeNode) {

            if (that.model.selectedTab() == 1){
                if (that.chapterTree) {
                    that.chapterTree.cancelSelectedNode();
                }
            } else if (that.knowledgeTree){
                that.knowledgeTree.cancelSelectedNode();
            }

            that._decorateNode(treeNode);

            that.onSelect(treeNode)
    },

        onTabChange: function(n) {
            this.model.selectedTab(n);
            // var multiSelectId = this.model.multiSelectId();
            // var type = this.model.type();
            //
            // if(this.model.selectedTab() != n) {
            //
            //     this.model.selectedTab(n)
            //     			.loading(true)
            //     if(n == 0) {
            //         type == TMATERIAL ?
            //         		this.getTmaterialsChapters(multiSelectId) :
            //         		this.getCoursesChapters(multiSelectId)
            //     }else {
            //         type == TMATERIAL ?
            //     		this.getTmaterialsKnowleges(multiSelectId) :
            //     		this.getCoursesKnowleges(multiSelectId)
            //     }
            // }

        }
    }
    ko.components.register('x-wrongquestion-tree', {
        viewModel: Model,
        template: tpl
    });

})(jQuery, window);
