;
(function () {
    var __course_map = {};
    var GLOBAL = (0, eval)('this');
    var $ = GLOBAL['jQuery'];
    var ko = GLOBAL['ko'];
    var koMapping = ko.mapping;
    // 如果是新增则ID为空
    var ID = GLOBAL['sales_id'];
    // projectCode
    var PROJECT_CODE = GLOBAL['project_code'];
    // 静态站地址
    var STATIC_URL = GLOBAL['staticUrl'];
    var _ = ko.utils;
    var store = {
        /**
         * 新建促销
         * @param id
         * @returns {*}
         */
        saveSales: function (data) {
            return $.ajax({
                url:  e_sales_srv_host + '/v1/sales',
                type: 'POST',
                dataType: 'json',
                data: JSON.stringify(data)
            });
        },
        /**
         * 编辑促销
         * @param id
         * @returns {*}
         */
        putSales: function (data,id) {
            return $.ajax({
                url:  e_sales_srv_host + '/v1/sales/' + id,
                type: 'PUT',
                dataType: 'json',
                data: JSON.stringify(data)
            });
        },
        /**
         * 获取促销
         * @param id
         * @returns {*}
         */
        getSales: function (id) {
            return $.ajax({
                url:  e_sales_srv_host + '/v1/sales/' + id,
                type: 'GET'
            });
        },
        /**
         * 根据sku_id获取res_id
         * @param id
         * @returns {*}
         */
        getResId: function (data) {
            return $.ajax({
                url:  e_goods_srv_host + '/v1/skus/actions/find_by_id_in',
                type: 'POST',
                data: JSON.stringify(data)
            });
        },
        upload: function () {
            return $.ajax({
                url: e_sales_gw_host + '/upload_sessions',
                type:'GET'
            })
        }
    };

    var ViewModel = function () {
        this.model = {
            isNew: true,  //新增：true, 编辑：false
            offline:  true, //下线：true, 上线：false
            isClickNext: false,  //标识是否点击下一步
            current_group: 0,
            coverBannerImg: '',
            entity: {
                sales_id: ID,
                name: '',
                start_time: '',
                end_time: '',
                remark: '',
                banner_pic_id: '',
                status: 1,   //0:下线， 1：上线
                sales_promotion_group_params: []   //促销集合
            },
            sales_group: [],    //促销集合
            sales_object: {     //促销单个对象
                typeRadio: 1, //1:特价， 0：折扣， 2：满减
                courseNumber: 0,  //已选课程数量
                sales_promotion_group_id: '',
                haveSaved: false,   //用来标记是否保存过
                sales_type: 1,
                sales_sub_type: 1,
                n:1,
                promotion_params: [{
                    sales_config: {},
                    sales_sub_type: 1
                }]
            },
            combine_sales_group: [], //满优惠集合
            combine_sales_object: {     //满优惠单个对象
                sales_sub_type: 1, //1:满减，2:满折
                quota: 0,  //满的价格
                reduce_amount: 0,  //满减
                discount: 0        //满折
            },
            selectedArray: [],   //选择的课程
            salesOne: {     //减价优惠
                price: 0,
                number: 1
            },
            salesTwo: {     //折扣优惠
                discount: 0,
                number: 1
            },
            type: 0,   //单品or组合
            type1: 0,   //优惠类型
            resourceIdArray: []   //存放已选资源课程的id
        };
        return this;
    };
    ViewModel.prototype = {
        constructor: ViewModel,
        initViewModel: function (element) {
            var that = this;
            this.model = koMapping.fromJS(this.model);
            // ID存在则为编辑
            if (ID) {
                this.getSalesFn(ID);
                this.model.isNew(false);
            } else {
                this.model.sales_group.push(this.model.sales_object);
            }

            var tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate()+1);
            this.model.entity.start_time(tomorrow.getFullYear() + '-' + (tomorrow.getMonth() + 1) + '-' + tomorrow.getDate() + ' ' + '00:00:00');
            tomorrow.setDate(tomorrow.getDate()+1);
            this.model.entity.end_time(tomorrow.getFullYear() + '-' + (tomorrow.getMonth() + 1) + '-' + tomorrow.getDate()+ ' ' + '00:00:00');
            this.initTimePicker();
            this.initValidation();
            this.initUploader();
            this.initPostMessage();
            //监控价格和数量
            this.model.salesOne.price.subscribe(function () {
                that.model.selectedArray().forEach(function (item , i) {
                    item.sales_config.amount(that.model.salesOne.price())
                })
            });
            this.model.salesOne.number.subscribe(function (new_count) {
                that.model.selectedArray().forEach(function (item , i) {
                    var old_count = item._total_count;
                    if(!that.model.offline()){
                        // 未下线时，新数量不能小于旧数量
                        item.total_count(new_count > old_count ? new_count : old_count)
                    }else{
                        item.total_count(new_count);
                    }
                })
            });
            //监控折扣和数量
            this.model.salesTwo.discount.subscribe(function () {
                that.model.selectedArray().forEach(function (item , i) {
                    item.sales_config.discount(that.model.salesTwo.discount())
                })
            });
            this.model.salesTwo.number.subscribe(function (new_count) {
                that.model.selectedArray().forEach(function (item , i) {
                    var old_count = item._total_count;
                    if(!that.model.offline()){
                        // 未下线时，新数量不能小于旧数量
                        item.total_count(new_count > old_count ? new_count : old_count)
                    }else{
                        item.total_count(new_count);
                    }
                })
            });
            this.model.entity.remark.subscribe(function(v){
                if(v.length > 300){
                    that.model.entity.remark(v.slice(0, 300));
                }
            });
            this.model.remark_remain = ko.pureComputed(function(){
                return 300 - this.model.entity.remark().length;
            }, this);
            ko.applyBindings(this, element);
            return this;
        },
        initValidation: function () {
            var entity = this.model.entity;
            ko.validation.init({
                insertMessages: false
            });
            entity.name.extend({
                required: {
                    params: true,
                    message: '请输入促销名称'
                },
                maxLength: {
                    params: 30,
                    message: '促销名称字数不能超过30个字'
                }
            });
            entity.remark.extend({
                maxLength: {
                    params: 300,
                    message: '简介最多允许输入300个字'
                }
            });
        },
        /**
         * webuploader图片上传
         */
        initUploader: function () {
            var that = this;
            store.upload().then(function (res) {
                var bannerUploader = new WebUploader.Uploader({
                    swf: STATIC_URL + '/auxo/addins/webuploader/v0.1.5/swf/uploader.swf',
                    server: '//' + res.server_url + '/v0.1/upload?session=' + res.session + '&scope=1&path='+ res.path,
                    auto: true,
                    compress: null,
                    fileVal: 'Filedata',
                    threads: 9,
                    duplicate: true,
                    pick: {
                        id: '#bannerPicPicker' ,
                        multiple: true
                    },
                    fileSingleSizeLimit: 5 * 1024 * 1024,
                    accept: [{
                        title: "Images",
                        extensions: "gif,jpg,png,jpeg",
                        mimeTypes: 'image/png,image/jpg,image/jpeg,image/gif'
                    }]
                });
                bannerUploader.on('uploadError', function (err) {
                    $.alert('上传失败：' + err);
                });
                bannerUploader.on('uploadSuccess', function(){
                    $.alert("上传成功！");
                    var pic_id = arguments[1].dentry_id;
                    that.model.coverBannerImg(cs_cdn_host + '/v0.1/download?dentryId='+pic_id);
                    that.model.entity.banner_pic_id(pic_id);
                });
                bannerUploader.on('error',  function (error) {
                    if (error === "Q_TYPE_DENIED") {
                        $.alert('请上传格式为gif,png,jpg的图片！');
                    } else if (error === "F_EXCEED_SIZE") {
                        $.alert('大小不能超过5M');
                    }
                });
                bannerUploader.on('uploadBeforeSend', function (obj, file, headers) {
                    file.type = undefined;
                    file.scope = 1;
                    headers.Accept = "*/*";
                });
            });
        },
        /**
         * 标签
         */
        typeText: function (type) {
            var text = null;
            switch (type){
                case 'open-course':
                    text = '公开课';
                    break;
                case 'auxo-train':
                    text = '培训';
                    break;
                case 'standard_exam':
                    text = '标准考试';
                    break;
                case 'custom_exam':
                    text = '自定义考试';
                    break;
                case 'design_methodlogy_exam':
                    text = '方法论考试';
                    break;
                case 'plan':
                    text = '培养计划';
                    break;
                case 'opencourse_2':
                    text = '新课程';
                    break;
                case 'online_exam':
                    text = '在线考试';
                    break;
                case 'offline_exam':
                    text = '线下考试';
                    break;
            };
            return text;
        },
        /**
         * 时间选择器初始化
         */
        initTimePicker: function () {
            var nowTime = new Date();
            var j_begin_time = $('#beginTime');
            var j_end_time = $('#endTime');
            $('.datetime').datetimepicker({
                autoclose: true,
                clearBtn: true,
                format: 'yyyy-mm-dd hh:ii:00',
                startDate: nowTime,
                endDate:'',
                minView: 1,
                todayHighlight: 1,
                language: 'zh-CN'
            });
            // 领用时间规则
            j_begin_time.on('changeDate', function (e) {
                j_end_time.datetimepicker('setStartDate', e.date);
            });
            j_end_time.on('changeDate', function (e) {
                j_begin_time.datetimepicker('setEndDate', e.date);
            });
        },
        /**
         * 添加促销种类
         */
        addsSales: function() {
            if(this.model.offline() == false) {
                $.alert('已上线的促销活动不能再添加分组！');
                return
            }
            var obj = {
                typeRadio: ko.observable(1),
                sales_promotion_group_id: ko.observable(''),
                sales_type: ko.observable(1),
                sales_sub_type: ko.observable(1),
                haveSaved: ko.observable(false),
                promotion_params: ko.observableArray([]),
                n: Math.floor(Math.random()*100) ,  //随机数记得修改
                courseNumber: ko.observable(0)
            };
            this.model.sales_group.push(obj);
        },
        /**
         * 删除促销种类
         */
        closeSalse: function (index,item) {
            var that = this, num=this.model.current_group();
            if( this.model.offline() == false) {
                $.alert('不能删除已上线的促销！');
                return
            }
            if( this.model.sales_group().length == 1) {
                $.alert('至少保留一组促销！');
            } else {
                //that.model.entity.sales_promotion_group_params().splice(index, 1);
                that.model.sales_group.splice(index, 1);
                that.model.resourceIdArray.splice(index,1)
            }
        },
        /**
         * 添加满优惠种类
         */
        addCombineSales: function() {
            this.model.combine_sales_group.push({
                sales_sub_type: this.model.combine_sales_object.sales_sub_type, //1:满减，2:满折
                quota: ko.observable(0),  //满的价格
                reduce_amount: ko.observable(0),  //满减
                discount: ko.observable(0)        //满折
            });
        },
        /**
         * 删除满优惠种类
         */
        closeCombineSales: function (index,item) {
            var that = this;
            if( this.model.combine_sales_group().length == 1) {
                $.alert('至少保留一级优惠！');
            } else {
                that.model.combine_sales_group.splice(index, 1);
            }
        },
        /**
         * 新增/更新全部促销
         */
        saveSales: function (index) {
            var validationGroup = ko.validation.group(this.model.entity),
                that = this;
            if (validationGroup().length > 0) {
                validationGroup.showAllMessages();
                return;
            }

            var banner_pic = this.model.entity.banner_pic_id();
            if(!banner_pic){
                $.alert('请选择专区大图');
                return;
            }

            if (this.model.entity.end_time() == '' || this.model.entity.start_time() == '') {
                $.alert('请输入促销时间！');
                return
            }

            var resultNum = this.isHaveCourese(this.model.sales_group());
            if(resultNum > -1){
                $.alert('第' + ( resultNum+ 1) + '个促销模式还未选择课程！');
                return;
            }

            if (ID) {
                if(index == 1) {  //上线
                    that.model.entity.status(1);
                }
            } else {
                if(index == 1) {  //上线
                    that.model.entity.status(1);
                } else {
                    that.model.entity.status(0);
                }
            }

            var data = koMapping.toJS(this.model.entity);
            data.start_time = data.start_time.replace(' ','T');
            data.end_time = data.end_time.replace(' ', 'T');
            this.tramsformDiscount(data.sales_promotion_group_params);
            if(!ID) {
                store.saveSales(data).then(function () {
                    $.alert('新增成功');
                    setTimeout(function () {
                        window.location.assign(e_sales_gw_host + '/' + PROJECT_CODE + '/admin/promotion/index');
                    }, 1500);
                });
            } else {
                store.putSales(data,ID).then(function () {
                    $.alert('编辑成功');
                    setTimeout(function () {
                        window.location.assign(e_sales_gw_host + '/' + PROJECT_CODE + '/admin/promotion/index');
                    }, 1500);
                });
            }
        },
        /**
         * 验证保存的时候是否有选课程
         */
        isHaveCourese: function(arr) {
            var courseNumberArr = [];
            arr.forEach(function (item,i) {
                courseNumberArr.push(item.courseNumber());
            });
            return courseNumberArr.indexOf(0)
        },
        /**
         * 转换折扣为0到1的小数
         */
        tramsformDiscount: function(arr) {
            arr.forEach(function (item,i) {
                if(item.sales_type == 1 && item.sales_sub_type == 2) {  //折扣
                    item.promotion_params.forEach(function(item_son,j){
                        item_son.sales_config.discount = item_son.sales_config.discount/10
                    })
                }
                if(item.sales_type == 2 && item.sales_sub_type == 2) {  //满折
                    item.promotion_params[0].sales_config.grads.forEach(function(item_son,j){
                        item_son.discount = item_son.discount/10
                    })
                }
            })
        },
        /**
         * 获取促销对象
         */
        getSalesFn: function (id) {
            var that = this;
            store.getSales(id).then(function (data) {
                data.start_time = data.start_time.replace('T',' ').substring(0,19);
                data.end_time = data.end_time.replace('T', ' ').substring(0,19);
                that.model.entity.name(data.name);
                that.model.entity.start_time(data.start_time);
                that.model.entity.end_time(data.end_time);
                that.model.entity.status(data.status);
                that.model.entity.remark(data.remark);
                that.model.entity.banner_pic_id(data.banner_pic_id);
                that.model.coverBannerImg(cs_cdn_host + '/v0.1/download?dentryId='+data.banner_pic_id);
                if(data.status == 1) {
                    that.model.offline(false);   //上线状态只允许增加课程数量
                }
                //促销种类匹配
                var __sku_ids = [];
                data.sales_promotion_groups.forEach(function(group){
                    group.promotions.forEach(function(promotion){
                        __sku_ids = __sku_ids.concat(promotion.sku_id || promotion.sku_ids);
                    });
                });
                var editorSalesArr = data.sales_promotion_groups;
                store.getResId(__sku_ids).then(function(res){
                    res.forEach(function(item){
                        __course_map[item.sku_id] = item.res_id;
                    });
                    editorSalesArr.forEach(function (item,i) {    //item代表特价，折扣，满减，满折的一种
                        var promotion_params = [],  //子级对象集合
                            promotion_father = {}, //父级对象
                            promotion_son = {},  //子级对象
                            resID = [],  //资源id集合
                            sku_ids = [];  //skuid集合
                        if(item.sales_type == 1 && item.sales_sub_type == 1) {   //特价
                            item.promotions.forEach(function(obj, j){
                                promotion_son = {
                                    goods_promotion_id: obj.goods_promotion_id,
                                    sales_sub_type: obj.sales_sub_type,
                                    sku_id: obj.sku_id,
                                    total_count: ko.observable(obj.total_count),
                                    sales_config: {
                                        amount_type: obj.sales_config.amount_type,
                                        amount: ko.observable(obj.sales_config.amount)
                                    }
                                };
                                resID.push({
                                    id: __course_map[obj.sku_id]
                                });
                                promotion_params.push(promotion_son);
                            });
                            promotion_father = {
                                typeRadio: ko.observable(1),
                                sales_promotion_group_id: item.sales_promotion_group_id,//goods_promotion_count是服务端返回的商品数量
                                sales_type: ko.observable(item.sales_type),
                                sales_sub_type: ko.observable(item.sales_sub_type),
                                haveSaved: ko.observable(true),
                                promotion_params: ko.observableArray(promotion_params),
                                n: Math.floor(Math.random()*100) ,
                                courseNumber: ko.observable(item.goods_promotion_count),
                                resourceIdArray: resID
                            };
                            that.model.entity.sales_promotion_group_params.push(promotion_father);
                            that.model.sales_group.push(promotion_father);
                            that.model.resourceIdArray.push(promotion_father.resourceIdArray);
                        } else if(item.sales_type == 1 && item.sales_sub_type == 2) {  //打折
                            item.promotions.forEach(function(obj, j){
                            promotion_son = {
                                resource_id: __course_map[obj.sku_id],
                                goods_promotion_id: obj.goods_promotion_id,
                                sales_sub_type: obj.sales_sub_type,
                                sku_id: obj.sku_id,
                                total_count: ko.observable(obj.total_count),
                                sales_config: {
                                   // amount_type: obj.sales_config.amount_type,
                                    discount: ko.observable(obj.sales_config.discount  * 10)
                                }
                            };
                            resID.push({
                                id: __course_map[obj.sku_id]
                            });
                            promotion_params.push(promotion_son);
                        });
                        promotion_father = {
                            typeRadio: ko.observable(0),
                            sales_promotion_group_id: item.sales_promotion_group_id,//goods_promotion_count是服务端返回的商品数量
                            sales_type: ko.observable(item.sales_type),
                            sales_sub_type: ko.observable(item.sales_sub_type),
                            haveSaved: ko.observable(true),
                            promotion_params: ko.observableArray(promotion_params),
                            n: Math.floor(Math.random()*100) ,
                            courseNumber: ko.observable(item.goods_promotion_count),
                            resourceIdArray: resID
                        };
                        that.model.entity.sales_promotion_group_params.push(promotion_father);
                        that.model.sales_group.push(promotion_father);
                        that.model.resourceIdArray.push(promotion_father.resourceIdArray);
                        }
                        else {//组合
                            var grads = [],grads_obj={};
                            item.promotions.forEach(function(obj1, j){
                                if (obj1.sales_sub_type == 1) { //满减
                                    obj1.sales_config.grads && obj1.sales_config.grads.forEach(function (obj2,k){
                                        grads_obj = {
                                            reduce_amount: ko.observable(obj2.reduce_amount),
                                            quota: ko.observable(obj2.quota)
                                        };
                                        grads.push(grads_obj);
                                    })
                                } else {//满折
                                    obj1.sales_config.grads && obj1.sales_config.grads.forEach(function (obj2,l){
                                        grads_obj = {
                                            discount: ko.observable(obj2.discount * 10),
                                            quota: ko.observable(obj2.quota)
                                        };
                                        grads.push(grads_obj);
                                    })
                                }
                                promotion_son = {
                                    goods_promotion_id: obj1.combine_promotion_id,
                                    sales_sub_type: ko.observable(obj1.sales_sub_type),
                                    sku_ids: obj1.sku_ids,
                                    total_count: ko.observable(obj1.total_count),
                                    sales_config: {
                                        amount_type: ko.observable(obj1.sales_config.amount_type),
                                        grads: ko.observableArray(grads)
                                    }
                                };
                                promotion_params.push(promotion_son);
                                obj1.sku_ids && obj1.sku_ids.forEach(function (idobj) {
                                    resID.push({
                                        id: __course_map[idobj]
                                    });
                                })
                            });
                            promotion_father = {
                                typeRadio: ko.observable(2),
                                sales_promotion_group_id: item.sales_promotion_group_id,//goods_promotion_count是服务端返回的商品数量
                                sales_type: ko.observable(item.sales_type),
                                sales_sub_type: ko.observable(item.sales_sub_type),
                                haveSaved: ko.observable(true),
                                promotion_params: ko.observableArray(promotion_params),
                                n: Math.floor(Math.random()*100) ,
                                courseNumber: ko.observable(item.goods_promotion_count),
                                resourceIdArray: resID
                            };
                            that.model.entity.sales_promotion_group_params.push(promotion_father);
                            that.model.sales_group.push(promotion_father);
                            that.model.resourceIdArray.push(promotion_father.resourceIdArray);
                        }
                    })
                });
            });
        },
        /**
         * 默认勾选已选的课程
         */
        selectCourseIframe: function () {
            var item = {
                'action': 'RESOURCE_SET',
                'data': {
                    'items': this.model.resourceIdArray()[this.model.current_group()]
                }
            };
            document.getElementById('select-resource-iframe').contentWindow.postMessage(JSON.stringify(item), '*');
        },
        /**
         * 课程资源选择弹出框
         */
        showSourseModal: function (current_group,data) {
            var that = this;
            this.model.current_group(current_group);
            if (this.model.offline() == false && data.typeRadio() == 2) {
                $.alert('已上线的满优惠不能修改！');
                return
            }
            this.model.selectedArray([]);
            this.model.combine_sales_group([]);
            $('#resourceModal').modal('show');
            var iframe = document.getElementById("select-resource-iframe");
            setTimeout(function(){
                iframe.src = channelHost + '/' + PROJECT_CODE + '/resource/manage?mode=select&is_free=false&hide_cancel=true&hide_save=true';
            });
            if (data.typeRadio() == 1) {  //优惠
                this.model.type(1);
                this.model.type1(1)
            } else if(data.typeRadio() == 0) {   //折扣
                this.model.type(1);
                this.model.type1(2)
            } else {     //组合
                this.model.type(2)
            }
        },
        initPostMessage: function () {
            var that = this;
            window.onmessage = function(e){
                var data = JSON.parse(e.data);
                var num = that.model.current_group();   //判定当前组
                if( data.data.items.length == 0 && that.model.resourceIdArray()[that.model.current_group()] != undefined ) {
                    that.selectCourseIframe();
                }
                if( data.data.items.length > 0) {
                    $('#resourceModal').modal('hide').on('hidden.bs.modal', function(){
                        if(that.model.type() == 1 && that.model.type1() ==1) {
                            //限时抢
                            $('#amountModal').modal('show');
                        }
                        if(that.model.type() == 1 && that.model.type1() ==2) {
                            //限时折扣
                            $('#discountModal').modal('show');
                        }

                        if(that.model.type() == 2 ) {
                            //满优惠
                            $('#combineModal').modal('show');
                        }
                        $('#resourceModal').off('hidden.bs.modal');
                    });
                    var combineData = that.combineDataFn(data.data.items);                //从资源池取的数据来进行拼接,命名的时候跟组合优惠有点混了
                    that.model.combine_sales_group([]);
                    if(that.model.type() === 2) {   //组合优惠的时候 数据格式不一样 单独做赋值
                        if(that.model.sales_group()[num].haveSaved() == false) {     //判断当前促销组是否保存过的,没保存过就塞进去一组清空的满优惠级对象
                            that.model.combine_sales_object.discount(0);
                            that.model.combine_sales_object.reduce_amount(0);
                            that.model.combine_sales_object.quota(0);
                            that.model.combine_sales_object.sales_sub_type(1);
                            that.model.combine_sales_group.push(that.model.combine_sales_object);
                        } else if(that.model.entity.sales_promotion_group_params()[num].haveSaved() == true) {  //判断是否保存过的
                            that.model.combine_sales_group.push(that.model.combine_sales_object);
                            var oldDataCombine = that.model.entity.sales_promotion_group_params()[num].promotion_params();   //以前保存的课程优惠数据
                            var grads = oldDataCombine[0].sales_config.grads();    //组合优惠详情数组
                            for (var m=0; m<grads.length-1; m++) {
                                that.model.combine_sales_group.push({
                                    sales_sub_type: that.model.combine_sales_object.sales_sub_type, //1:满减，2:满折
                                    quota: ko.observable(0),  //满的价格
                                    reduce_amount: ko.observable(0),  //满减
                                    discount: ko.observable(0)        //满折
                                });
                            }
                            if (that.model.entity.sales_promotion_group_params()[num].sales_sub_type() == 1) {   //如果是满减优惠
                                grads.forEach(function (item,i) {
                                    that.model.combine_sales_group()[i].quota(item.quota()) ;
                                    that.model.combine_sales_group()[i].discount(0) ;
                                    that.model.combine_sales_group()[i].reduce_amount(item.reduce_amount());
                                    that.model.combine_sales_group()[i].sales_sub_type(1);
                                });
                            } else {
                                grads.forEach(function (item,i) {
                                    that.model.combine_sales_group()[i].quota(item.quota()) ;
                                    that.model.combine_sales_group()[i].discount(item.discount());
                                    that.model.combine_sales_group()[i].reduce_amount(0);
                                    that.model.combine_sales_group()[i].sales_sub_type(2);
                                })
                            }
                        } else {
                            that.model.combine_sales_group.push(that.model.combine_sales_object);
                        }
                    } else {   //单品的特价和打折
                        if(that.model.entity.sales_promotion_group_params().length == 0) {     //判断是否保存过的
                            that.model.selectedArray(combineData);
                        } else if (that.model.sales_group()[num].haveSaved() == false) {   //判断当前促销组是否保存过的
                            that.model.selectedArray(combineData);
                        } else  if(that.model.entity.sales_promotion_group_params()[num].haveSaved() == true) {  //判断是否保存过的
                            var oldData = that.model.entity.sales_promotion_group_params()[num].promotion_params();   //以前保存的课程优惠数据
                            if (!ID) {
                                for (var i=0; i<combineData.length;i++) {                                      //将保存过的数据循环加入新拼接的数据
                                    for (var j=0;j<oldData.length;j++) {
                                        if(combineData[i].resource_id == oldData[j].resource_id) {
                                            combineData[i].sales_config = oldData[j].sales_config;
                                            combineData[i].total_count = oldData[j].total_count;
                                            combineData[i]._total_count = oldData[j].total_count();
                                        }
                                    }
                                }
                            }else {
                                for (var i=0; i<combineData.length;i++) {
                                    for (var j=0;j<oldData.length;j++) {
                                        var resource_id = __course_map[oldData[j].sku_id];//将保存过的数据循环加入新拼接的数据
                                        if (resource_id == undefined) {
                                            resource_id = oldData[j].resource_id
                                        }
                                        if(combineData[i].resource_id == resource_id) {
                                            combineData[i].sales_config = oldData[j].sales_config;
                                            combineData[i].total_count = oldData[j].total_count;
                                            combineData[i]._total_count = oldData[j].total_count();
                                            combineData[i].goods_promotion_id = oldData[j].goods_promotion_id;
                                        }
                                    }
                                }
                            }
                            that.model.selectedArray(combineData);
                        }
                    }
                } else {
                    if (that.model.isClickNext()) {
                        $.alert('请选择课程！')
                    }
                }
                that.model.isClickNext(false);
            };
        },
        /**
         * 课程资源选择弹出框下一步
         */
        nextSelect: function () {
            var that = this;
            this.model.isClickNext(true);
            var data = {
                'action': 'RESOURCE_GET',
                'data': {
                }
            };
            document.getElementById('select-resource-iframe').contentWindow.postMessage(JSON.stringify(data), '*');
　        },
        /**
         * 拼接数据
         */
        combineDataFn: function (data) {
            var that = this;
            if(this.model.type() == 1 && this.model.type1() ==1) {//限时特价
                data.forEach(function (item, i) {
                    item.sales_config = {
                        "amount_type":"CHANNEL_CASH",
                        "amount": ko.observable()
                    };
                    item.total_count = ko.observable(1);
                    item.goods_promotion_id = ko.observable('');
                });
                return data;
            } else if (this.model.type() == 1 && this.model.type1() ==2) { //限时折扣
                data.forEach(function (item, i) {
                    item.sales_config = {
                        "discount": ko.observable(0)
                    };
                    item.goods_promotion_id = ko.observable('');
                    item.total_count = ko.observable(1);
                });
                return data;
            } else {    //满优惠
                that.model.selectedArray(data);   //表示有选择课程
            }
        },
        formatPrice: function (commodity) {
            return commodity ? commodity.price ? (function () {
                var price = '';
                _.objectForEach(commodity.price, function (k, v) {
                    if (!price) price = v;
                });
                return price || '免费';
            })() : '免费' : ''
        },
        /**
         * 优惠价保存
         */
        amountSave: function () {
            var that = this,
                saveAmountDate = [],  //课程优惠集合
                idArray = [];
            if (this.model.selectedArray().length == 0) {
                $.alert('您未选择课程！');
                $('#amountModal').modal('hide');
                return
            }
            var isHigherPrice = [];
            var maxNumber = [];
            var amount_valid = true;
            var total_count_valid = true;
            this.model.selectedArray().forEach(function (item, i) {
                var orgPrice = that.formatPrice(item.commodity);
                var total_count = item.total_count();
                var amount = window.parseFloat(item.sales_config.amount() || 0);
               if ( amount >  window.parseFloat(orgPrice.substring(1))) {
                   isHigherPrice.push(1);
               }
                if (window.parseInt(item.total_count()) > 100000000) {
                    maxNumber.push(1)
                }
                if(amount < 0.01){
                   amount_valid = false;
                }
                if(!that.model.offline() && total_count < item._total_count){
                    total_count_valid = false;
                }
            });
            if(!total_count_valid){
                $.alert('上线的单品促销活动，编辑商品数量不允许减少');
                return
            }
            if(!amount_valid){
                $.alert('优惠价格至少为0.01！');
                return
            }
            if (isHigherPrice.length > 0){
                $.alert('优惠价格不能高于原价！');
                return
            }
            if (maxNumber.length > 0) {
                $.alert('数量不能大于1亿！');
                return
            }
            this.model.selectedArray().forEach(function (item, i) {
                var amount = item.sales_config.amount;
                amount(window.parseFloat(amount()));
                var total_count = item.total_count;
                total_count(window.parseFloat(total_count()));
                saveAmountDate.push({
                    resource_id: item.resource_id,
                    sales_config: item.sales_config,
                    total_count: item.total_count,
                    sku_id:  item.commodity.sku_id,
                    goods_promotion_id: item.goods_promotion_id ? item.goods_promotion_id : '',
                    sales_sub_type: 1
                });
                idArray.push({
                    id: item.resource_id
                })
            });
            this.model.entity.sales_promotion_group_params(this.model.sales_group());
            var num = this.model.current_group();
            for (var i=0;i<this.model.sales_group().length;i++) {
                if(num == i) {
                    that.model.entity.sales_promotion_group_params()[i].promotion_params(saveAmountDate);
                    that.model.entity.sales_promotion_group_params()[i].sales_sub_type(1);
                    that.model.entity.sales_promotion_group_params()[i].sales_type(1);
                    that.model.entity.sales_promotion_group_params()[i].haveSaved(true);   //标识是否保存过
                    that.model.entity.sales_promotion_group_params()[i].courseNumber(that.model.selectedArray().length);  //已选课程
                    that.model.resourceIdArray()[i] = idArray
                }
            }
            //this.model.salesOne.price(0);
            //this.model.salesOne.number(0);
            $('#amountModal').modal('hide');
        },
        /**
         * 折扣保存
         */
        discountSave: function () {
            var that = this,
                saveAmountDate = [],  //课程优惠集合
                idArray = [];
            if (this.model.selectedArray().length == 0) {
                $.alert('您未选择课程！');
                $('#discountModal').modal('hide');
                return
            }
            var maxNumber = [];
            var total_count_valid = true;
            this.model.selectedArray().forEach(function (item, i) {
                if (item.total_count() > 100000000) {
                    maxNumber.push(1)
                }
                var total_count = window.parseInt(item.total_count(), 10);
                if(!that.model.offline() && total_count < item._total_count){
                    total_count_valid = false;
                }else{
                    item.total_count(total_count);
                }
            });
            if (!total_count_valid) {
                $.alert('上线的单品促销活动，编辑商品数量不允许减少');
                return
            }
            if (maxNumber.length > 0) {
                $.alert('数量不能大于1亿！');
                return
            }
            this.model.selectedArray().forEach(function (item, i) {
                var discount = item.sales_config.discount;
                discount(window.parseFloat(discount()));

                saveAmountDate.push({
                    resource_id: item.resource_id,
                    sales_config: item.sales_config,
                    total_count: item.total_count,
                    sku_id:  item.commodity.sku_id,
                    goods_promotion_id: item.goods_promotion_id ? item.goods_promotion_id : '',
                    sales_sub_type: 2
                });
                idArray.push({
                    id: item.resource_id
                })
            });
            this.model.entity.sales_promotion_group_params(this.model.sales_group());
            var num = this.model.current_group();
            for (var i=0;i<this.model.sales_group().length;i++) {
                if(num == i) {
                    that.model.entity.sales_promotion_group_params()[i].promotion_params(saveAmountDate);
                    that.model.entity.sales_promotion_group_params()[i].sales_sub_type(2);
                    that.model.entity.sales_promotion_group_params()[i].sales_type(1);
                    that.model.entity.sales_promotion_group_params()[i].haveSaved(true);   //标识是否保存过
                    that.model.entity.sales_promotion_group_params()[i].courseNumber(that.model.selectedArray().length);  //已选课程
                    that.model.resourceIdArray()[i] = idArray
                }
            }
            $('#discountModal').modal('hide');
           // this.model.salesTwo.discount(0);
            //this.model.salesTwo.number(0);
        },
        /**
         * 组合优惠保存
         */
        combineSave: function () {
            var that = this,
                current_group_num = this.model.current_group(),
                savediscountDate = [],  //满折集合
                saveReduceDate = [],  //满减集合
                grades = [],       //多级优惠的数组
                idArray = [],       //已选择的课程资源id
                skuIdArray = [];    //传给服务端的sku_id集合
            if (this.model.selectedArray().length == 0) {
                $.alert('您未选择课程！');
                $('#combineModal').modal('hide');
                return
            }
            this.model.selectedArray().forEach(function (item, i) {
                skuIdArray.push(item.commodity.sku_id);
                idArray.push({
                    id: item.resource_id
                })
            });
            this.model.combine_sales_group().forEach(function (item, i) {
                if (that.model.combine_sales_object.sales_sub_type() == 1) {  //满减
                    var quota = window.parseFloat(item.quota());
                    var reduce = window.parseFloat(item.reduce_amount());
                    if(reduce > quota){
                        reduce = quota;
                    }
                    grades.push({
                        quota: ko.observable(quota),
                        reduce_amount: ko.observable(reduce)
                    })
                } else {
                    grades.push({
                        quota: ko.observable(window.parseFloat(item.quota())),
                        discount: ko.observable(window.parseFloat(item.discount()))
                    })
                }
            });

            if(that.model.combine_sales_object.sales_sub_type() == 1) {
                //var goods_promotion_id_1 = that.model.entity.sales_promotion_group_params()[current_group_num].promotion_params()[0].goods_promotion_id || '';
                saveReduceDate = [{
                    sales_config: {
                        amount_type: "CHANNEL_CASH",
                        grads: ko.observableArray(grades)
                    },
                    sales_sub_type: 1,
                    goods_promotion_id: that.goods_promotion_id_fn(that.model.entity.sales_promotion_group_params()[current_group_num]),
                    sku_ids: skuIdArray
                }];
            }else {
                //var goods_promotion_id_2 = that.model.entity.sales_promotion_group_params()[current_group_num].promotion_params()[0].goods_promotion_id || '';
                savediscountDate = [{
                    sales_config: {
                        amount_type: "CHANNEL_CASH",
                        grads: ko.observableArray(grades)
                    },
                    sales_sub_type: 2,
                    goods_promotion_id: that.goods_promotion_id_fn(that.model.entity.sales_promotion_group_params()[current_group_num]),
                    sku_ids: skuIdArray
                }];
            }
            this.model.entity.sales_promotion_group_params(this.model.sales_group());
            var num = this.model.current_group();
            for (var i=0;i<this.model.sales_group().length;i++) {
                if(num == i) {
                    if(that.model.combine_sales_object.sales_sub_type() == 1) {
                        that.model.entity.sales_promotion_group_params()[i].promotion_params(saveReduceDate);
                        that.model.entity.sales_promotion_group_params()[i].sales_sub_type(1);
                    }else {
                        that.model.entity.sales_promotion_group_params()[i].promotion_params(savediscountDate);
                        that.model.entity.sales_promotion_group_params()[i].sales_sub_type(2);
                    }
                    that.model.entity.sales_promotion_group_params()[i].sales_type(2);
                    that.model.entity.sales_promotion_group_params()[i].haveSaved(true);   //标识是否保存过
                    that.model.entity.sales_promotion_group_params()[i].courseNumber(that.model.selectedArray().length);  //已选课程
                    that.model.resourceIdArray()[i] = idArray
                }
            }
            $('#combineModal').modal('hide');
        },
        /**
         * goods_promotion_id
         */
        goods_promotion_id_fn: function (data) {
            var goods_promotion_id = '';
            if (data == undefined || data.promotion_params()[0] == undefined) {
                goods_promotion_id = '';
            } else {
                goods_promotion_id = data.promotion_params()[0].goods_promotion_id;
            }
            return goods_promotion_id;
        },
        /**
         * 单品折扣价换算
         */
        discountPrice: function (commodity,sales_config) {
            if(this.model.type() == 1 && this.model.type1() ==2) {
                var price = this.formatPrice(commodity).replace('￥','') * sales_config.discount() * 0.1;
                return price.toFixed(2);
            }
        },
        verifyDiscount: function(){
            var sales_config = this;
            var discount = sales_config.discount();
            var str_discount = discount;
            if(typeof str_discount !== 'string'){
                str_discount = str_discount.toString();
            }
            var valid = true;
            if(window.isNaN(discount)){
                valid = false;
            }else{
                var arr_discount = str_discount.split('.');
                if(arr_discount.length === 2 && arr_discount[1].length > 1){
                    valid = false;
                }
                if(discount>10 || discount < 0){
                    valid = false;
                }
            }
            if(!valid){
                $.alert('折扣只支持0-10最多1位小数');
                sales_config.discount(0);
            }
        },
        verifySalesNumber: function(koNumber){
            var num = koNumber();
            var valid = true;
            if(window.isNaN(num)){
                valid = false;
            }else{
                if(num.toString().indexOf('.')>-1){
                    valid = false;
                }
                num = window.parseInt(num);
                if(num < 1 || num > 100000000){
                    valid = false;
                }
            }
            if(!valid){
                $.alert('数量必须设置为1至1亿的正整数');
                koNumber(1);
            }
        },
        verifySalesCombineQuota: function(koQuota){
            var quota = koQuota();
            var valid = true;
            if(window.isNaN(quota)){
                valid = false;
            }else{
                var ar = quota.toString().split('.');
                if(ar.length > 1 && ar[1].length > 2){
                    valid = false;
                }
                if(quota < 0 || quota > 100000000){
                    valid = false;
                }
            }
            if(!valid){
                $.alert('金额支持0至1亿的数值，小数点后可保留两位');
                koQuota(0);
            }
        },
        verifyCombineReduce: function(koAmount){
            var amount = koAmount();
            var valid = true;
            if(window.isNaN(amount)){
                valid = false;
            }else{
                var ar = amount.toString().split('.');
                if(ar.length > 1 && ar[1].length > 2){
                    valid = false;
                }
            }
            if(!valid){
                $.alert('请输入正确的金额');
                koAmount(0);
            }
        },
        prevStep: function(){
            var that = this;
            if(that.model.type() == 1 && that.model.type1() ==1){
                // 限时抢
                $('#amountModal').modal('hide').on('hidden.bs.modal', function(){
                    $('#resourceModal').modal('show');
                    $('#amountModal').off('hidden.bs.modal');
                });
            }
            if(that.model.type() == 1 && that.model.type1() ==2){
                $('#discountModal').modal('hide').on('hidden.bs.modal', function(){
                    $('#resourceModal').modal('show');
                    $('#discountModal').off('hidden.bs.modal');
                });
            }
            if(that.model.type() == 2){
                $('#combineModal').modal('hide').on('hidden.bs.modal', function(){
                    $('#resourceModal').modal('show');
                    $('#combineModal').off('hidden.bs.modal');
                });
            }
        }
    };
    $(function () {
        var viewModel = GLOBAL['viewModel'] = new ViewModel();
        viewModel.initViewModel(document.body);
    });
}());
