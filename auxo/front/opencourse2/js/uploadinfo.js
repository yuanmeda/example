(function ($, window) {
    'use strict';
    var store = {
        queryCourse: function () {
            var url = window.elearning_business_course_url + '/v1/business_courses/' + window.course_id;

            return $.ajax({
                url: url
            });
        },
        //获取上传cs用的session
        getUploadSession: function () {
            var url = window.courseWebpage + '/upload_sessions';
            return $.ajax({
                url: url,
                dataType: 'json',
                cache: false
            });
        },
        //获取账户支持的币种
        getCurrencies: function () {
            var url = window.auxoPayUrl + '/v1/account/currencies';
            return $.ajax({
                url: url
            });
        },
        //获取课程分类
        getCourseTypes: function () {
            var url = '/v1/open_courses/course_types';
            return $.ajax({
                url: url
            });
        },
        //获取扩展信息
        getExtendInfo: function () {
            var url = '/v1/open_courses/' + window.course_id + '/extend_info';
            return $.ajax({
                url: url
            });
        },
        // 提交审核
        submitAudit: function (data) {
            var url = '/v1/open_courses/' + window.course_id + '/submit_audit';
            return $.ajax({
                url: url,
                type: 'PUT',
                data: JSON.stringify(data) || null,
                cache: false
            });
        }
    };

    var viewModel = {
        model: {
            isChildNode: ko.observable(false),
            tagNameStr: ko.observable(''),
            isCurrencies: ko.observable(false),
            currenciesData: ko.observable([]),
            isShowTreeItem: ko.observable(false),
            isShowPriceOptions: ko.observable(false),
            isPriceFree: ko.observable(true),
            popWarn: ko.observable(false),
            warnText: ko.observable(''),
            course: {
                name: ko.observable(''),
                introduction: ko.observable(''),
                front_cover_url: ko.observable('')
            },
            courseTypes: ko.observable([]),
            treeMap: ko.observable([]),
            extendInfo: ko.observable({}),
            courseTypesData: ko.observable([]),
            courseTypesNames: ko.observable('请选择课程分类'),
            priceName: ko.observable(''),
            coursePriceData: ko.observable({}),
            price: ko.observable(0.0),
            priceType: ko.observable('')
        },
        /**
         * 初始化入口
         * @return {null} null
         */
        _init: function () {
            //ko绑定作用域
            ko.applyBindings(this, document.getElementById('container'));
            this._baseInfo();
            this._extendInfo();
        },
        _baseInfo: function () {
            var _self = this;
            if (window.course_id) {
                $.when(store.queryCourse(), store.getUploadSession())
                    .done(function (returnData, resData) {
                        var data = returnData[0];
                        if (!data.front_cover_url) {
                            data.front_cover_url = defaultImage;
                        }
                        data.introduction = data.introduction ? data.introduction.replace(/\n/g, '<br/>').replace(/\$\{cs_host}/gim, resData[0].server_url) : '';
                        _self.model.course.name(data.name || '');
                        _self.model.course.introduction(data.introduction || '');
                        _self.model.course.front_cover_url(data.front_cover_url || '');
                    });
            }
        },
        _extendInfo: function () {
            if (window.course_id) {
                $.when(store.getCurrencies(), store.getExtendInfo(), store.getCourseTypes())
                    .done(function (currenciesData ,extendData, typesData) {
                        var currencies = currenciesData[0];
                        // currencies =[{
                        //     "code": "CHANNEL_CASH",
                        //     "name": "人民币",
                        //     "unit": "元",
                        //     "prefix": "￥"
                        // },{
                        //     "code": "CHANNEL_EMONEY",
                        //     "name": "网龙币",
                        //     "unit": "币",
                        //     "prefix": "ND"
                        // },{
                        //     "code": "CHANNEL_GOLD",
                        //     "name": "积分",
                        //     "unit": "分",
                        //     "prefix": ""
                        // }];
                        var extendInfo = extendData[0];
                        // extendInfo = {
                        //     "course_price": {
                        //         "price": 1.0,
                        //         "price_type": "CHANNEL_CASH"
                        //     },
                        //     // "course_price": null,
                        //     "course_types": [
                        //         {
                        //             "channel_id": "1e1dca68-3ff6-41c9-85a5-3cd3b86c144f",
                        //             "tag_ids": [
                        //                 "fcd190ea-e186-48cd-99a7-3308a874f956"
                        //             ]
                        //         }
                        //         // ,{
                        //         //     "channel_id": "2a6b2942-acc3-4b6b-adb8-b29896e5cf1a",
                        //         //     "tag_ids": [
                        //         //         "39e24a6e-733d-4819-960b-81c977715e7e",
                        //         //         "55ba209e-fe24-4d5f-8df2-98691374f9db"
                        //         //     ]
                        //         // }
                        //     ]
                        // };
                        if(currencies && currencies.length>0){
                            this.model.isCurrencies(true);
                        }
                        this.model.extendInfo(extendInfo);
                        if(this.model.isCurrencies()){
                            if(extendInfo.course_price){
                                this.model.isPriceFree(false);
                                this.model.price(extendInfo.course_price.price);
                                this.model.priceType(extendInfo.course_price.price_type);
                                if(currencies && currencies.length>0){
                                    for(var i=0;i<currencies.length;i++){
                                        if(currencies[i].code === extendInfo.course_price.price_type){
                                            this.model.priceName(currencies[i].name);
                                        }
                                    }
                                }
                            }else {
                                if(currencies && currencies.length>0){
                                    for(var i=0;i<currencies.length;i++){
                                        if(currencies[i].code === 'CHANNEL_CASH'){
                                            this.model.priceType(currencies[i].code);
                                            this.model.priceName(currencies[i].name);
                                        }
                                    }
                                    if(this.model.priceName().length === 0){
                                        this.model.priceType(currencies[0].code);
                                        this.model.priceName(currencies[0].name);
                                    }
                                }
                            }
                        }
                        if(currencies && currencies.length>0){
                            for(var i=0;i<currencies.length;i++){
                                if(currencies[i].code === this.model.priceType()){
                                    currencies[i].isChecked = ko.observable(true);
                                }else {
                                    currencies[i].isChecked = ko.observable(false);
                                }
                            }
                            this.model.currenciesData(currencies);
                        }
                        var courseTypes = typesData[0];
                        if(courseTypes && courseTypes.items.length>0){
                            if (this.model.extendInfo().course_types && this.model.extendInfo().course_types.length > 0) {
                                this.model.courseTypesData(this.model.extendInfo().course_types);
                            }
                            for (var i = 0; i < courseTypes.items.length; i++) {
                                courseTypes.items[i] = this._exec(courseTypes.items[i], i);
                            }
                            this.model.courseTypes(courseTypes.items);
                            this._setTreeMap();
                            if (this.model.extendInfo().course_types && this.model.extendInfo().course_types.length > 0) {
                                this._setCourseTypeNames();
                                this._resetChecked();
                            }
                        }
                    }.bind(this));
            }
        },
        _setTreeMap: function () {
            var courseTypes = this.model.courseTypes();
            var treeMap = this.model.treeMap();
            for(var i=0;i<courseTypes.length;i++){
                if (courseTypes[i].tag_tree && courseTypes[i].tag_tree.children && courseTypes[i].tag_tree.children.length>0) {
                    for (var j = 0; j < courseTypes[i].tag_tree.children.length; j++) {
                        this._setChildTreeMap(courseTypes[i].tag_tree.children[j], treeMap)
                    }
                }
            }
            this.model.treeMap(treeMap);
        },
        _setChildTreeMap: function ($data, treeMap) {
            treeMap.push({
                id: $data.id,
                data: $data
            });
            if ($data && $data.children && $data.children.length>0) {
                for (var i = 0; i < $data.children.length; i++) {
                    this._setChildTreeMap($data.children[i], treeMap);
                }
            }
        },
        _exec: function(item, index) {
            item.isOpen = ko.observable(false);
            item.isChecked = ko.observable(false);
            if (item.tag_tree && item.tag_tree.children && item.tag_tree.children.length>0) {
                for (var i = 0; i < item.tag_tree.children.length; i++) {
                    item.tag_tree.children[i].isFirstChild = true;
                    item.tag_tree.children[i] = this._childExec(item.tag_tree.children[i], item.isOpen(), item.channel_id);
                }
            }
            return item;
        },
        _childExec: function(item, isOpen, channel_id) {
            item.isOpen = ko.observable(isOpen);
            item.isChecked = ko.observable(false);
            item.channel_id = channel_id;
            if (item && item.children && item.children.length>0) {
                for (var i = 0; i < item.children.length; i++) {
                    item.children[i] = this._childExec(item.children[i], isOpen, channel_id);
                }
            }
            return item;
        },
        toggleTree: function($data) {
            $data.isOpen(!$data.isOpen());
        },
        _clearParentTagIds: function (tagIds, $data) {
            var treeMap = this.model.treeMap();
            for(var i=0;i<treeMap.length;i++){
                if(treeMap[i].id === $data.parent_id){
                    for(var j=0;j<tagIds.length;j++){
                        if(treeMap[i].id === tagIds[j]){
                            tagIds.splice(j, 1);
                        }
                    }
                    this._clearParentTagIds(tagIds, treeMap[i].data);
                }
            }
            return tagIds;
        },
        priceChecked: function ($data) {
            var currenciesData = this.model.currenciesData();
            for(var i = 0;i<currenciesData.length;i++){
                currenciesData[i].isChecked(false);
            }
            this.model.currenciesData(currenciesData);
            $data.isChecked(true);
            this.model.priceName($data.name);
            this.model.priceType($data.code);
            this.hidePriceOptions();
        },
        toggleChecked: function($data) {
            $data.isChecked(!$data.isChecked());
            var courseTypesData = this.model.courseTypesData();
            if($data.isChecked() === true){
                //提交审核接口参数
                if($data.id){
                    var isExistChannel = false;
                    for(var i=0;i<courseTypesData.length;i++){
                        if(courseTypesData[i].channel_id === $data.channel_id){
                            isExistChannel = true;
                            if(courseTypesData[i].tag_ids && courseTypesData[i].tag_ids.length>0){
                                courseTypesData[i].tag_ids = this._clearParentTagIds(courseTypesData[i].tag_ids, $data);
                                courseTypesData[i].tag_ids.push($data.id);
                            }else{
                                courseTypesData[i] = {
                                    "channel_id": $data.channel_id,
                                    "tag_ids": [
                                        $data.id
                                    ]
                                };
                            }
                        }
                    }
                    if(!isExistChannel){
                        courseTypesData.push({
                            "channel_id": $data.channel_id,
                            "tag_ids": [
                                $data.id
                            ]
                        });
                    }
                }else{
                    courseTypesData.push({
                        "channel_id": $data.channel_id,
                        "tag_ids": []
                    });
                }
            }else{
                if(courseTypesData.length > 0){
                    if($data.parent_id){
                        for(var i=0;i<courseTypesData.length;i++){
                            if(courseTypesData[i].channel_id === $data.channel_id){
                                if(courseTypesData[i].tag_ids && courseTypesData[i].tag_ids.length>0){
                                    var isPushParentId = true;
                                    var tagIdsLength = courseTypesData[i].tag_ids.length;
                                    for(var j=0;j<tagIdsLength;j++){
                                        this._deleteChildNode(courseTypesData[i].tag_ids,$data);
                                        if(this._getParentId(courseTypesData[i].tag_ids[j]) === $data.parent_id){
                                            isPushParentId = false;
                                        }
                                    }
                                    //如果tag_ids数组中含有该parent_id的子节点，也不存入parent_id
                                    for(var k=0;k<courseTypesData[i].tag_ids.length;k++){
                                        this.model.isChildNode(false);
                                        if($data.parent_id && this._getTreeObjById($data.parent_id)){
                                            this._isChildNode(courseTypesData[i].tag_ids[k], this._getTreeObjById($data.parent_id));
                                        }
                                        if(this.model.isChildNode()){
                                            isPushParentId = false;
                                        }
                                    }
                                    if(isPushParentId && !$data.isFirstChild){
                                        courseTypesData[i].tag_ids.push($data.parent_id);
                                    }
                                }
                            }
                        }
                    }else{
                        for(var i=0;i<courseTypesData.length;i++){
                            if(courseTypesData[i].channel_id === $data.channel_id){
                                courseTypesData.splice(i, 1);
                            }
                        }
                    }
                }
            }
            this.model.courseTypesData(courseTypesData);
            this._setCourseTypeNames();
            this.clearChecked();
            this._resetChecked();
        },
        _setCourseTypeNames: function () {
            var courseTypesNameArr = [];
            var courseTypesData = this.model.courseTypesData();
            var courseTypes = this.model.courseTypes();
            for(var i=0;i<courseTypesData.length;i++){
                for(var j=0;j<courseTypes.length;j++){
                    if(courseTypesData[i].channel_id === courseTypes[j].channel_id){
                        if(courseTypesData[i].tag_ids && courseTypesData[i].tag_ids.length>0){
                            for(var k=0;k<courseTypesData[i].tag_ids.length;k++){
                                var tagObj = this._getTreeObjById(courseTypesData[i].tag_ids[k]);
                                this.model.tagNameStr(' | ' + tagObj.title);
                                this._getParentNames(tagObj);
                                var nameStr = courseTypes[j].channel_title + this.model.tagNameStr();
                                courseTypesNameArr.push(nameStr);
                            }
                        }else{
                            var nameStr = courseTypes[j].channel_title;
                            courseTypesNameArr.push(nameStr);
                        }
                    }
                }
            }
            var courseTypesNames = courseTypesNameArr.join('、');
            if(courseTypesNames.length === 0){
                courseTypesNames = '请选择课程分类';
            }
            this.model.courseTypesNames(courseTypesNames);
        },
        _getParentNames: function ($data) {
            var treeMap = this.model.treeMap();
            for(var i=0;i<treeMap.length;i++){
                if(treeMap[i].id === $data.parent_id){
                    this.model.tagNameStr(' | ' + treeMap[i].data.title + this.model.tagNameStr());
                    this._getParentNames(treeMap[i].data);
                }
            }
        },
        _getTreeObjById: function (id) {
            var treeMap = this.model.treeMap();
            for(var i=0;i<treeMap.length;i++){
                if(treeMap[i].id === id){
                    return treeMap[i].data;
                }
            }
        },
        _isChildNode: function (tagId, $data) {
            if($data.id === tagId){
                this.model.isChildNode(true);
            }
            if ($data && $data.children && $data.children.length>0) {
                for (var i = 0; i < $data.children.length; i++) {
                    this._isChildNode(tagId, $data.children[i]);
                }
            }
        },
        _getParentId: function (tagId) {
            var treeMap = this.model.treeMap();
            for(var i=0;i<treeMap.length;i++){
                if(treeMap[i].id === tagId){
                    return treeMap[i].data.parent_id;
                }
            }
        },
        _deleteChildNode: function (tagIdsArr, $data) {
            for(var j=0;j<tagIdsArr.length;j++){
                if(tagIdsArr[j] === $data.id) {
                    tagIdsArr.splice(j, 1);
                }
            }
            if ($data && $data.children && $data.children.length>0) {
                for (var i = 0; i < $data.children.length; i++) {
                    this._deleteChildNode(tagIdsArr, $data.children[i]);
                }
            }
        },
        clearCourseTypes: function () {
            this.model.courseTypesData([]);
            this.model.courseTypesNames('请选择课程分类');
            this.clearChecked();
            this.hideTreeItem();
        },
        clearChecked: function () {
            var courseTypes = this.model.courseTypes();
            for(var i=0;i<courseTypes.length;i++){
                courseTypes[i].isChecked(false);
                if (courseTypes[i].tag_tree && courseTypes[i].tag_tree.children && courseTypes[i].tag_tree.children.length>0) {
                    for (var j = 0; j < courseTypes[i].tag_tree.children.length; j++) {
                        this._clearChildChecked(courseTypes[i].tag_tree.children[j]);
                    }
                }
            }
            this.model.courseTypes(courseTypes);
        },
        _clearChildChecked: function ($data) {
            $data.isChecked(false);
            if ($data && $data.children && $data.children.length>0) {
                for (var i = 0; i < $data.children.length; i++) {
                    this._clearChildChecked($data.children[i]);
                }
            }
        },
        _resetChecked: function () {
            var courseTypesData = this.model.courseTypesData();
            var courseTypesObj = this.model.courseTypes();
            var courseTypes = courseTypesObj || [];
            for(var i=0;i<courseTypesData.length;i++){
                for(var j=0;j<courseTypes.length;j++){
                    if(courseTypesData[i].channel_id === courseTypes[j].channel_id){
                        courseTypes[j].isOpen(true);
                        courseTypes[j].isChecked(true);
                    }
                    if (courseTypes[j].tag_tree && courseTypes[j].tag_tree.children && courseTypes[j].tag_tree.children.length>0) {
                        for (var k = 0; k < courseTypes[j].tag_tree.children.length; k++) {
                            if(courseTypesData[i].tag_ids && courseTypesData[i].tag_ids.length>0){
                                for(var l=0;l<courseTypesData[i].tag_ids.length;l++){
                                    this._resetChildChecked(courseTypes[j].tag_tree.children[k], courseTypesData[i].tag_ids[l])
                                }
                            }
                        }
                    }
                }
            }
            this.model.courseTypes(courseTypes);
        },

        _resetChildChecked: function ($data, tagId) {
            if($data.id === tagId){
                $data.isOpen(true);
                $data.isChecked(true);
                this._setParentChecked($data);
            }
            if ($data && $data.children && $data.children.length>0) {
                for (var i = 0; i < $data.children.length; i++) {
                    this._resetChildChecked($data.children[i], tagId);
                }
            }
        },
        _setParentChecked: function ($data) {
            var treeMap = this.model.treeMap();
            for(var i=0;i<treeMap.length;i++){
                if(treeMap[i].id === $data.parent_id){
                    treeMap[i].data.isOpen(true);
                    treeMap[i].data.isChecked(true);
                    this._setParentChecked(treeMap[i].data);
                }
            }
        },
        toggleTreeItem: function () {
            this.model.isShowTreeItem(!this.model.isShowTreeItem());
        },
        hideTreeItem: function () {
            this.model.isShowTreeItem(false);
        },
        togglePriceOptions: function () {
            this.model.isShowPriceOptions(!this.model.isShowPriceOptions());
        },
        hidePriceOptions: function () {
            this.model.isShowPriceOptions(false);
        },
        setPriceFree: function () {
            this.model.isPriceFree(true);
        },
        setPrice: function () {
            this.model.isPriceFree(false);
        },
        cancelUpload: function () {
            if(window.__return_url){
                window.location.href = window.__return_url;
            }
        },
        hidePopWarn: function () {
            this.model.popWarn(false);
        },
        showPopWarn: function () {
            this.model.popWarn(true);
        },
        startUpload: function () {
            if(this.model.courseTypesData().length === 0){
                this.model.warnText(i18n.crs_upl.upload_info.warn.category);
                this.showPopWarn();
                return;
            }
            if(!this.model.isPriceFree() && this.model.priceType() === 'CHANNEL_CASH' && (!/^\d+.?\d{0,2}$/.test(this.model.price()) || this.model.price() == 0)){
                this.model.warnText(i18n.crs_upl.upload_info.warn.price);
                this.showPopWarn();
                return;
            }
            if(!this.model.isPriceFree() && this.model.priceType() !== 'CHANNEL_CASH' && !/^[1-9]\d*$/.test(this.model.price())){
                this.model.warnText(i18n.crs_upl.upload_info.warn.coin);
                this.showPopWarn();
                return;
            }
            var coursePriceData = {};
            if(this.model.isPriceFree()){
                coursePriceData = null;
            }else {
                coursePriceData = {
                    "price": window.parseFloat(this.model.price()).toFixed(2) || 0,
                    "price_type": this.model.priceType()
                };
            }
            this.model.coursePriceData(coursePriceData);
            var postData = ko.mapping.toJS(this.model.courseTypesData);
            var courseExtendInfoVo = {
                "course_price": this.model.coursePriceData(),
                "course_types": postData
            };
            var data = courseExtendInfoVo;
            store.submitAudit(data).done($.proxy(function () {
                location.href =  window.opencourse2GwUrl + '/' + window.projectCode + '/open_course/upload_success?course_id=' + window.course_id + '&__return_url=' + window.__return_url;
            }, this)).fail($.proxy(function () {
                location.href =  window.opencourse2GwUrl + '/' + window.projectCode + '/open_course/upload_fail?course_id=' + window.course_id + '&__return_url=' + window.__return_url;
            }, this));
        }
    };
    $(function () {
        viewModel._init();
    });

})(jQuery, window);
