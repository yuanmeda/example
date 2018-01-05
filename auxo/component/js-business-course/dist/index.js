!function(e){"use strict";var n=function(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")},t=(e="default"in e?e["default"]:e).utils,o=function(){function o(t){var s=this;n(this,o),this.model={initialData:e.observable(null),catalog:e.observable(null),lesson_id:e.observable(""),breadcrumb:e.observableArray(),contextId:e.observable(""),resourceFilter:e.observable(null),ready:e.observable(null),courseSelected:e.observable(!1)},this.config=t.config,this.callbacks=t.callbacks,this.store={get:function(){return $.ajax({url:s.config.businessCoursesGatewayUrl+"/v1/business_courses/"+s.config.courseId+"/catalogs",dataType:"json",cache:!1})},progresses:function(){return $.ajax({url:s.config.businessCoursesGatewayUrl+"/v1/business_courses/"+s.config.courseId+"/lesson/progresses",dataType:"json",cache:!1})}},this.init()}return o.prototype.init=function(){var e=this;$.when(this.store.get(),this.store.progresses()).done(function(n,t){n=n[0],t=t[0],e.model.catalog(e.formatCatalog(n,t)),e.model.catalog().children[0]&&e.model.catalog().children[0].isOpen(!0),e.model.ready({key:"catalog",value:!0})})},o.prototype.initWithData=function(e){if(e&&"0"==e.cata_type){var n=e.cata_id,t=this.routes;if(n)for(var o=0;o<t.length;o++)for(var s=t[o],i=s[s.length-1].lessons,a=0;a<i.length;a++){var c=i[a];if(c&&c.id==n){this.getResources(c);for(var r=0;r<s.length;r++)s[r].isOpen(!0);return}}var l=t[0],d=l[l.length-1].lessons[0];this.getResources(d);for(var u=0;u<l.length;u++)l[u].isOpen(!0)}},o.prototype.formatCatalog=function(n,t){function o(n){if(n.isOpen=e.observable(!1),s.push(n),n.children)for(var t=0;t<n.children.length;t++)n.children[t]=o(n.children[t]);return n.lessons.length&&(i.push(s.concat()),$.each(n.lessons,function(e,t){t.parent_chapter_id=n.id,a[t.id]?(t.status=a[t.id],t.standard_status=c[t.id]):(t.status=0,t.standard_status=-1)})),s.length=s.length-1,n}for(var s=[],i=[],a=[],c=[],r=0;r<t.length;r++){var l=t[r];a[l.id]=l.status,c[l.id]=l.standard_status}return n=o(n),this.routes=function(e){for(var n={},t=[],o=0;o<e.length;o++){var s=e[o],i=s[s.length-1];n[i.id]||(n[i.id]=s,t.push(s))}return t}(i),n},o.prototype.lessonStatus=function(e){return e.lessons&&e.lessons.length>0?e.lessons[0].status:-1},o.prototype.toggleTree=function(e){e.isOpen(!e.isOpen())},o.prototype.getResourcesByCatalog=function(e){e.lessons&&1==e.lessons.length?this.getResources(e.lessons[0]):this.toggleTree(e)},o.prototype.getChapters=function(e){this.model.lesson_id(e.id),this.callbacks&&$.isFunction(this.callbacks.chapter)&&this.callbacks.chapter(e)},o.prototype.getSections=function(e){this.model.lesson_id(e.id),1!=e.lessons.length&&this.callbacks&&$.isFunction(this.callbacks.section)&&this.callbacks.section(e)},o.prototype.getResources=function(e){this.model.lesson_id(e.id),this.model.contextId(this.config.contextId+".lesson:"+e.id),this.model.resourceFilter({lesson_id:e.id}),this.formatBreadcrumb(e),this.model.courseSelected(!1),this.callbacks&&$.isFunction(this.callbacks.lesson)&&this.callbacks.lesson(e)},o.prototype.formatBreadcrumb=function(e){for(var n=[],o=this.routes,s=e.id,i=0;i<o.length;i++){for(var a=o[i],c=a[a.length-1].lessons,r=null,l=0;l<c.length;l++){var d=c[l];if(d.id==s){n.push(d.name),r=a;break}}if(r){(n=t.arrayMap(a,function(e){return e.name}).concat(n)).shift();break}}this.model.breadcrumb(n)},o.prototype.resourceFilterModify=function(e){e.knowledge_id&&this.model.lesson_id("")},o.prototype.courseClick=function(){this.model.courseSelected(!this.model.courseSelected()),this.model.courseSelected()&&this.callbacks.course(this.config.courseId)},o}();e.components.register("x-course-learn-catalog",{viewModel:o,template:'<script id="catalog-lesson-item" type="text/html">\r\n    <li class="sub-item" data-bind="click:$component.getResources.bind($component),clickBubble: false">\r\n        <div class="item-content">\r\n            <span class="item-txt" data-bind="css: { \'state-on\' : $data.id == $component.model.lesson_id() }">\r\n                <em data-bind="html: name, attr: { \'title\' : name }"></em>\r\n                <i class="iconfont-e-course" data-bind="css: { \'xcd-icon-e-course--done\': status == 2, \'xcd-icon-e-course--half\': status == 1, \'xcd-icon-e-course--empty\': status == 0 }"></i>\r\n            </span>\r\n        </div>\r\n    </li>\r\n<\/script>\r\n\r\n<script id="catalog-tree-item" type="text/html">\r\n    <li class="sub-item open" data-bind="css:{\'open\':isOpen},click:$component.getSections.bind($component),clickBubble: false">\r\n        <div class="item-content">\r\n            <i class="iconfont-e-course" data-bind="click: $component.toggleTree.bind($component), visible: children.length || lessons.length > 1, css: { \'xcd-icon-e-course--down\' : isOpen, \'xcd-icon-e-course--right\': !isOpen() }"></i>\r\n            <span class="item-txt" data-bind="click: $component.getResourcesByCatalog.bind($component), css: { \'state-on\' : $data.id == $component.model.lesson_id() }">\r\n                <em data-bind="html: name, attr: { \'title\' : name }"></em>\r\n                <i class="iconfont-e-course" data-bind="css: { \'xcd-icon-e-course--done\': $component.lessonStatus.bind($component) == 2, \'xcd-icon-e-course--half\': $component.lessonStatus.bind($component) == 1, \'xcd-icon-e-course--empty\': $component.lessonStatus.bind($component) == 0 }"></i>\r\n            </span>\r\n        </div>\r\n        <ul class="list">\r\n            \x3c!--ko foreach:children--\x3e\r\n                \x3c!--ko template: { \'name\': \'catalog-tree-item\', \'data\': $data }--\x3e\x3c!--/ko--\x3e\r\n            \x3c!--/ko--\x3e\r\n            \x3c!--ko if:lessons.length>1--\x3e\r\n                \x3c!--ko foreach:lessons--\x3e\r\n                    \x3c!--ko template: { \'name\': \'catalog-lesson-item\', \'data\': $data }--\x3e\x3c!--/ko--\x3e\r\n                \x3c!--/ko--\x3e\r\n            \x3c!--/ko--\x3e\r\n        </ul>\r\n    </li>\r\n<\/script>\r\n\r\n<div class="n-ui-menu-cata course-menu-default" data-bind="css: { \'hide\': !model.catalog() || model.catalog().children.length <= 0 }">\r\n    <ul class="dlist" data-bind="with:model.catalog">\r\n        <li class="n-ui-menu-cata-title" data-bind="click: $component.courseClick.bind($component), visible: $component.config.showCourse, text: $component.config.courseTitle, css: { \'state-on\': $component.model.courseSelected }, attr: { \'data-id\' : $component.config.courseId }"></li>\r\n        \x3c!--ko foreach:children--\x3e\r\n            <li class="sub-item open" data-bind="css:{\'open\':isOpen},click:$component.getChapters.bind($component)">\r\n                <div class="item-content">\r\n                    <i class="iconfont-e-course" data-bind="click: $component.toggleTree.bind($component), visible: children.length || lessons.length > 1, css: { \'xcd-icon-e-course--minus\' : isOpen, \'xcd-icon-e-course--add\' : !isOpen() }"></i>\r\n                    <span class="item-txt" data-bind="click: $component.getResourcesByCatalog.bind($component), css: { \'state-on\' : $data.id == $component.model.lesson_id() }">\r\n                        <em data-bind="html: name, attr: { \'title\' : name }"></em>\r\n                        <i class="iconfont-e-course" data-bind="css: { \'xcd-icon-e-course--done\': $component.lessonStatus.bind($component) == 2, \'xcd-icon-e-course--half\': $component.lessonStatus.bind($component) == 1, \'xcd-icon-e-course--empty\': $component.lessonStatus.bind($component) == 0 }"></i>\r\n                    </span>\r\n                </div>\r\n                <ul class="list">\r\n                    \x3c!--ko foreach:children--\x3e\r\n                        \x3c!--ko template: { \'name\': \'catalog-tree-item\', \'data\': $data }--\x3e\x3c!--/ko--\x3e\r\n                    \x3c!--/ko--\x3e\r\n                    \x3c!--ko if:lessons.length>1--\x3e\r\n                        \x3c!--ko foreach:lessons--\x3e\r\n                            \x3c!--ko template: { \'name\': \'catalog-lesson-item\', \'data\': $data }--\x3e\x3c!--/ko--\x3e\r\n                        \x3c!--/ko--\x3e\r\n                    \x3c!--/ko--\x3e\r\n                </ul>\r\n            </li>\r\n        \x3c!--/ko--\x3e\r\n    </ul>\r\n</div>\r\n\r\n<div class="course__no-menu" data-bind="css: { \'hide\': model.catalog() && model.catalog().children.length > 0 }">\r\n    <p class="no-menu-word" data-bind="translate: { key: \'courseLearn.catalog.nodata\' }"></p>\r\n</div>'});var s=function(){function t(o){var s=this;n(this,t),this.model={initialData:e.observable(null),knowledge:e.observable(null),knowledge_id:e.observable(""),breadcrumb:e.observableArray(),contextId:e.observable(""),resourceFilter:e.observable(null),ready:e.observable(null),keyword:e.observable(""),searchno:e.observable(!1)},this.config=o.config,this.callbacks=o.callbacks,this.store={get:function(){return $.ajax({url:s.config.businessCoursesGatewayUrl+"/v1/business_courses/"+s.config.courseId+"/knowledges",dataType:"json",cache:!1})}},this.init()}return t.prototype.init=function(){var e=this;this.store.get().done(function(n){e.model.knowledge(e.formatKnowledge(n)),e.model.ready({key:"knowledge",value:!0})})},t.prototype.initWithData=function(e){if(e&&"1"==e.cata_type){var n=e.cata_id,t=this.knowledgeMap,o=t.idMap,s=t.knowledgeIdMap;if(n){var i=o[n];i&&(!function a(e){e.isOpen(!0);var n=s[e.parent_knowledge_id];if(n)for(var t=0;t<n.length;t++)if(n[t].lesson_id==i.lesson_id){a(n[t]);break}}(i),this.getResources(i))}this.model.initialData(null)}},t.prototype.formatKnowledge=function(n){function t(e,n,t,o){for(var s=0;s<n.length;s++)if(e[o]==n[s][t])return n[s];return null}for(var o={},s={},i={},a=[],c=0;c<n.length;c++)o[n[c].id]=n[c],s[n[c].knowledge_id]=s[n[c].knowledge_id]||[],s[n[c].knowledge_id].push(n[c]),i[n[c].lesson_id]=i[n[c].lesson_id]||[],i[n[c].lesson_id].push(n[c]);i=function(e){var n=[];for(var t in e)e.hasOwnProperty(t)&&n.push({lesson_id:t,knowledge:e[t]});return n}(i);for(var r=0;r<i.length;r++)a=a.concat(function(n,o,s){for(var i=[],a={},c=void 0,r=void 0,l=0,d=n.length;l<d;l++)a[(c=n[l])[o]]=c,a[c[o]].children=[],a[c[o]].isOpen=e.observable(!1);for(var u in a)a.hasOwnProperty(u)&&(t(r=a[u],n,o,s)?a[r[s]].children.push(r):i.push(r));return i}(i[r].knowledge,"knowledge_id","parent_knowledge_id"));return this.knowledgeMap={idMap:o,knowledgeIdMap:s,lessonIdMap:i},a},t.prototype.toggleTree=function(e){e.isOpen(!e.isOpen())},t.prototype.select=function(e){e.isOpen(!e.isOpen()),this.model.knowledge_id(e.id)},t.prototype.search=function(){if(13==arguments[1].keyCode){this.model.knowledge_id(""),this.model.searchno(!0);for(var e in this.knowledgeMap.idMap){var n=this.knowledgeMap.idMap[e];if($.trim(n.title)==$.trim(this.model.keyword())){this.model.knowledge_id(n.id),n.isOpen(!0),this.model.searchno(!1);break}}}},t.prototype.getResources=function(e){this.model.knowledge_id(e.id),this.model.contextId(this.config.contextId+".lesson:"+e.lesson_id),this.model.resourceFilter({lesson_id:e.lesson_id,knowledge_id:e.knowledge_id}),this.formatBreadcrumb(e),this.callbacks&&$.isFunction(this.callbacks.knowledge)&&this.callbacks.knowledge(e)},t.prototype.formatBreadcrumb=function(e){function n(e){t.unshift(e.title);var o=a[e.parent_knowledge_id];if(o)for(var s=0;s<o.length;s++)if(o[s].lesson_id==c.lesson_id){n(o[s]);break}}var t=[],o=e.id,s=this.knowledgeMap,i=s.idMap,a=s.knowledgeIdMap,c=i[o];c&&n(c),this.model.breadcrumb(t)},t.prototype.resourceFilterModify=function(e){e.knowledge_id||this.model.knowledge_id("")},t.prototype.clean=function(){this.model.keyword(""),this.model.searchno(!1)},t}();e.components.register("x-course-learn-knowledge",{viewModel:s,template:'<script id="knowledge-tree-item" type="text/html">\r\n    <li class="sub-item open" data-bind="css:{ \'open\': isOpen }">\r\n        <div class="item-content">\r\n            <i class="iconfont-e-course" data-bind="click: $component.toggleTree.bind($component), visible: children.length, css: { \'xcd-icon-e-course--down\' : isOpen, \'xcd-icon-e-course--right\': !isOpen() }"></i>\r\n            <span class="item-txt" data-bind="click: $component.select.bind($component), css: { \'state-on\' : id == $component.model.knowledge_id() }">\r\n                <em data-bind="html: title, attr: { \'title\' : name }"></em>\r\n            </span>\r\n         </div>\r\n        <ul class="list">\r\n            \x3c!--ko foreach:children--\x3e\r\n                \x3c!--ko template: { \'name\': \'knowledge-tree-item\', \'data\': $data }--\x3e\x3c!--/ko--\x3e\r\n            \x3c!--/ko--\x3e\r\n        </ul>\r\n    </li>\r\n<\/script>\r\n\r\n<div class="course__search--wrap">\r\n    <div class="course__search">\r\n        <input class="search-input" data-bind="attr: { \'placeholder\': i18n.courseLearn.knowledge.searchPlaceHolder }, value: model.keyword, valueUpdate: \'afterkeydown\', event: { keyup: $component.search.bind($component) }" type="text">\r\n        <i class="search-btn iconfont-e-course xcd-icon-e-course--del" data-bind="click: $component.clean.bind($component)"></i>\r\n    </div>\r\n</div>\r\n<div class="n-ui-menu-cata course-menu-default" data-bind="css: { \'hide\': ((!model.knowledge() || model.knowledge().length <= 0) || model.searchno()) }">\r\n    <ul class="dlist">\r\n        \x3c!--ko foreach:model.knowledge--\x3e\r\n            <li class="sub-item open" data-bind="css:{\'open\':isOpen},click:$component.getResources.bind($component)">\r\n                <div class="item-content">\r\n                    <i class="iconfont-e-course" data-bind="click: $component.toggleTree.bind($component), visible: children.length, css: { \'xcd-icon-e-course--minus\' : isOpen, \'xcd-icon-e-course--add\' : !isOpen() }"></i>\r\n                    <span class="item-txt" data-bind="click: $component.select.bind($component), css: { \'state-on\' : id == $component.model.knowledge_id() }">\r\n                        <em data-bind="html: title, attr: { \'title\' : name }"></em>\r\n                    </span>\r\n                </div>\r\n                <ul class="list">\r\n                    \x3c!--ko foreach:children--\x3e\r\n                        \x3c!--ko template: { \'name\': \'knowledge-tree-item\', \'data\': $data }--\x3e\x3c!--/ko--\x3e\r\n                    \x3c!--/ko--\x3e\r\n                </ul>\r\n            </li>\r\n        \x3c!--/ko--\x3e\r\n    </ul>\r\n</div>\r\n<div class="course__no-menu" data-bind="css: { \'hide\': (model.knowledge() && model.knowledge().length > 0) || model.searchno() }">\r\n    <p class="no-menu-word" data-bind="translate: { key: \'courseLearn.knowledge.nodata\' }"></p>\r\n</div>\r\n<div class="course__no-menu" data-bind="css: { \'hide\': !model.searchno() }">\r\n    <p class="no-menu-word" data-bind="translate: { key: \'courseLearn.knowledge.searchno\' }"></p>\r\n    <p class="no-menu-word" data-bind="translate: { key: \'courseLearn.knowledge.tryother\' }"></p>\r\n</div>'})}(ko);
