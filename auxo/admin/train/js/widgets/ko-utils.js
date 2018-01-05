(function () {
    var resultModel = {
        result: true,
        value: ''
    };

    var baseInputCheck = {
        isNumber: function (value) {
            if (isNaN(value)) {
                resultModel.result = false;
                resultModel.value = '';
                return resultModel;
            }
            resultModel.result = true;
            resultModel.value = value;
            return resultModel;
        },
        maxValue: function (value, maxValue) {
            if (value > maxValue) {
                resultModel.result = false;
                resultModel.value = maxValue;
                return resultModel;
            } else {
                resultModel.result = true;
                resultModel.value = value;
                return resultModel;
            }
        },
        minValue: function (value, minValue) {
            if(value){
                if(minValue !== 0){
                    if (value > minValue) {
                        resultModel.result = true;
                        resultModel.value = value;
                        return resultModel;
                    } else {
                        resultModel.result = false;
                        resultModel.value = minValue;
                        return resultModel;
                    }
                }else{
                    resultModel.result = true;
                    resultModel.value = value;
                    return resultModel;
                }
            }else{
                resultModel.result = true;
                resultModel.value = null;
                return resultModel;
            }

        },
        decimalPoint: function (value, point) {
            if(value){
                if(point == 0){
                    resultModel.result = false;
                    resultModel.value = Number(value).toFixed(point);
                    return resultModel;
                }else{
                    if (value.toString().indexOf(".") > 0) {
                        var length = value.toString().split(".")[1].length;
                        if (length > point) {
                            resultModel.result = false;
                            resultModel.value = Number(value).toFixed(point);
                            return resultModel;
                        }
                    }
                    resultModel.result = true;
                    resultModel.value = Number(value);
                    return resultModel;
                }
            }else{
                resultModel.result = true;
                resultModel.value = null;
                return resultModel;
            }
        }

    };
    var koUtils = {
        selectBoxes: function () {
            return {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    $(element).chosen({
                        'search_contains': true
                    });
                    /*解决chosen bug*/
                    $('.chosen-results').live('mousedown', function (event) {
                        var e =  event || window.event;
                        if (e.button == 1) {
                            return false;
                        }
                    });

                },
                update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
                    $(element).trigger('chosen:updated');
                }
            }
        },
        checkInput: function () {
            var oldValue= '';
            return {
                init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                    var elementValue = $(element).val();
                    //$(element).keyup(function () {
                    //    var value = valueAccessor();
                    //    pirvateCheck(value,element, allBindingsAccessor,viewModel);
                    //});
                    $(element).blur(function () {
                        var value = valueAccessor();
                    });
                },
                update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
                    var value = valueAccessor(), allBindings = allBindingsAccessor();
                    var newValue = $(element).val();
                    if (value && oldValue != value) {
                        pirvateCheck(value,element, allBindingsAccessor,viewModel);
                    }
                    oldValue = newValue;
                }
            }
            function pirvateCheck(value, element, allBindingsAccessor, viewModel) {
                if (value) {
                    var elementValue = allBindingsAccessor().value();
                    var resultModel;
                    for (var handler in value) {
                        if (value.hasOwnProperty(handler)) {
                            if (baseInputCheck[handler]) {
                                resultModel = baseInputCheck[handler](elementValue, value[handler]);
                                if (!resultModel.result) {
                                    elementValue = resultModel.value;
                                    $(element).val(elementValue);
                                    allBindingsAccessor().value(elementValue);
                                }
                            }
                        }
                    }
                }
            };
        }
    }
    window.koUtils = koUtils;
})();
