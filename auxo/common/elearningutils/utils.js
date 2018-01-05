/**
 * Created by Lin Tao on 2016/1/15.
 */
(function () {
    window.toolUtils = {
        objectExtend: {
            /**
             * 获取一个树形对象的中所有节点的Id
             */
            getAllTreeIdList: function (rootTree) {
                var ids = [];
                var reasoningTree = null;

                rootTree = window.toolUtils.objectExtend.toggleCase(rootTree, 'camel');

                if(!$.isArray(rootTree)) {
                    ids.push(rootTree.id);
                    reasoningTree = rootTree.children;
                }
                else {
                    reasoningTree = rootTree;
                }

                for (var i = 0; i < reasoningTree.length; i++) {
                    if(reasoningTree[i].children && $.isArray(reasoningTree[i].children) && reasoningTree[i].children.length > 0) {
                        ids = ids.concat(window.toolUtils.objectExtend.getAllTreeIdList(reasoningTree[i].children));
                    }
                    else {
                        ids.push(reasoningTree[i].id);
                    }
                }

                return ids;
            },
            /**
             * 将对象的所有属性转换成format参数指定的书写格式
             * @param obj
             * @param format  目前支持 'camel'、'snake'两种书写格式
             * @returns {*}
             */
            toggleCase: function (obj, format) {
                var replaceCaseHandler = null, result = {};
                switch(format) {
                    case 'camel':
                        replaceCaseHandler = function(value) {
                            value = value.replace(/\-(\w)/g, function(all, letter){
                                return letter.toLocaleLowerCase();
                            });

                            value = value.substring(0, 1).toLowerCase() + value.substr(1)

                            return value;
                        };
                        break;
                    case 'snake':
                        replaceCaseHandler = function(value) {
                            value = value.replace(/([A-Z])/g,"-$1").toLowerCase();
                            if(value.indexOf('-') === 0)
                                value = value.substr(1);

                            return value;
                        };
                        break;
                    default:
                        replaceCaseHandler = function(value) {
                            value = value.replace(/\-(\w)/g, function(all, letter){
                                return letter.toUpperCase();
                            });

                            return value;
                        };
                        break;
                }

                var result = null;
                if($.isArray(obj)) {
                    result = [];
                    for(var i = 0; i < obj.length; i++) {
                        result.push(window.toolUtils.objectExtend.toggleCase(obj[i], format));
                    }
                }
                else {
                    result = {};
                    for (var pro in obj) {
                        if(obj.hasOwnProperty(pro)) {
                            var tempName = replaceCaseHandler(pro);
                            result[tempName] = $.isArray(obj[pro]) ? window.toolUtils.objectExtend.toggleCase(obj[pro], format) : obj[pro];
                        }
                    }
                }

                return result;
            }
        },
        stringExtend: {
            /**
             * 格式化字符串, 如: stringFormat('Hello {{key}}', { key: word })
             * @param str
             * @param args
             * @returns {*}
             */
            stringFormat: function (str, args) {
                var result = str;
                for (var key in args) {
                    if(args[key] !== undefined){
                        var reg = new RegExp("({{" + key + "}})", "g");
                        result = result.replace(reg, args[key]);
                    }
                }
                return result;
            }
        },
        arrayExtend: {
            /**
             * 判断给定的数组中是否存在某个特定值
             * @param array
             * @param value
             * @returns {boolean}
             */
            contains: function (array, value) {
                var i = array.length;
                while (i--) {
                    if (array[i] === value) {
                        return true;
                    }
                }
                return false;
            },
            /**
             * 在数组之地位置插入值
             * @param array
             * @param index
             * @param value
             * @returns {*}
             */
            insertAt: function (array, index, value) {
                var part1 = array.slice(0, index);
                var part2 = array.slice(index);
                part1.push( value );
                return(part1.concat( part2 ));
            },
            /**
             * 移除数组置顶位置的值
             * @param array
             * @param index
             * @returns {*}
             */
            removeAt: function(array, index) {
                var part1 = array.slice(0, index);
                var part2 = array.slice(index);
                part1.pop();
                return(part1.concat(part2));
            },
            /**
             * 删除数组中特定的值
             * @param array
             * @param value
             */
            removeSpec: function(array, value) {
                for(var i = array.length - 1; i >= 0; i--) {
                    if(array[i] === value) {
                        array.splice(i, 1);
                    }
                }
            }
        }
    };
})(jQuery);
