/**
 * 日期时间脚本库方法列表：
 * （1）Date.isValiDate：日期合法性验证
 * （2）Date.isValiTime：时间合法性验证
 * （3）Date.isValiDateTime：日期和时间合法性验证
 * （4）Date.prototype.isLeapYear：判断是否闰年
 * （5）Date.prototype.format：日期格式化
 * （6）Date.stringToDate：字符串转成日期类型
 * （7）Date.daysBetween：计算两个日期的天数差
 * （8）Date.prototype.dateAdd：日期计算，支持正负数
 * （9）Date.prototype.dateDiff：比较日期差：比较两个时期相同的字段，返回相差值
 * （10）Date.prototype.toArray：把日期分割成数组：按数组序号分别为：年月日时分秒
 * （11）Date.prototype.datePart：取得日期数据信息
 */


/**
 * 日期合法性验证：判断dataStr是否符合formatStr指定的日期格式
 * 示例：
 * （1）alert(Date.isValiDate('2008-02-29','yyyy-MM-dd'));//true
 * （2）alert(Date.isValiDate('aaaa-58-29','yyyy-MM-dd'));//false
 * dateStr：必选，日期字符串
 * formatStr：可选，格式字符串，可选格式有：(1)yyyy-MM-dd(默认格式)或YYYY-MM-DD (2)yyyy/MM/dd或YYYY/MM/DD (3)MM-dd-yyyy或MM-DD-YYYY (4)MM/dd/yyyy或MM/DD/YYYY
 */
Date.isValiDate = function (dateStr, formatStr) {
    if (!dateStr) {
        return false;
    }
    if (!formatStr) {
        formatStr = "yyyy-MM-dd";//默认格式：yyyy-MM-dd
    }
    if (dateStr.length != formatStr.length) {
        return false;
    } else {
        if (formatStr == "yyyy-MM-dd" || formatStr == "YYYY-MM-DD") {
            var r1 = /^(((((([02468][048])|([13579][26]))(00))|(d{2}(([02468][48])|([13579][26]))))-((((0[13578])|(1[02]))-(([0-2][0-9])|(3[01])))|(((0[469])|(11))-(([0-2][0-9])|(30)))|(02-([0-2][0-9]))))|(d{2}(([02468][1235679])|([13579][01345789]))-((((0[13578])|(1[02]))-(([0-2][0-9])|(3[01])))|(((0[469])|(11))-(([0-2][0-9])|(30)))|(02-(([0-1][0-9])|(2[0-8]))))))$/;
            return r1.test(dateStr);
        } else if (formatStr == "yyyy/MM/dd" || formatStr == "YYYY/MM/DD") {
            var r2 = /^(((((([02468][048])|([13579][26]))(00))|(d{2}(([02468][48])|([13579][26]))))\/((((0[13578])|(1[02]))\/(([0-2][0-9])|(3[01])))|(((0[469])|(11))\/(([0-2][0-9])|(30)))|(02\/([0-2][0-9]))))|(d{2}(([02468][1235679])|([13579][01345789]))\/((((0[13578])|(1[02]))\/(([0-2][0-9])|(3[01])))|(((0[469])|(11))\/(([0-2][0-9])|(30)))|(02\/(([0-1][0-9])|(2[0-8]))))))$/;
            return r2.test(dateStr);
        } else if (formatStr == "MM-dd-yyyy" || formatStr == "MM-DD-YYYY") {
            var r3 = /^((((((0[13578])|(1[02]))-(([0-2][0-9])|(3[01])))|(((0[469])|(11))-(([0-2][0-9])|(30)))|(02-([0-2][0-9])))-(((([02468][048])|([13579][26]))(00))|(d{2}(([02468][48])|([13579][26])))))|(((((0[13578])|(1[02]))-(([0-2][0-9])|(3[01])))|(((0[469])|(11))-(([0-2][0-9])|(30)))|(02-(([0-1][0-9])|(2[0-8])))))-d{2}(([02468][1235679])|([13579][01345789])))$/;
            return r3.test(dateStr);
        } else if (formatStr == "MM/dd/yyyy" || formatStr == "MM/DD/YYYY") {
            var r4 = /^((((((0[13578])|(1[02]))\/(([0-2][0-9])|(3[01])))|(((0[469])|(11))\/(([0-2][0-9])|(30)))|(02\/([0-2][0-9])))\/(((([02468][048])|([13579][26]))(00))|(d{2}(([02468][48])|([13579][26])))))|(((((0[13578])|(1[02]))\/(([0-2][0-9])|(3[01])))|(((0[469])|(11))\/(([0-2][0-9])|(30)))|(02\/(([0-1][0-9])|(2[0-8])))))\/d{2}(([02468][1235679])|([13579][01345789])))$/;
            return r4.test(dateStr);
        } else {
            alert("日期格式不正确！");
            return false;
        }
    }
};


/**
 * 时间合法性验证：判断timeStr是否符合formatStr指定的时间格式
 * 示例：
 * （1）alert(Date.isValiTime('23:59:59','hh:mm:ss'));//true
 * （2）alert(Date.isValiTime('24-68-89','hh:mm:ss'));//false
 * timeStr：必选，日期字符串
 * formatStr：可选，格式字符串，可选格式有：(1)hh:mm:ss(默认格式) (2)hh-mm-ss (3)hh/mm/ss
 */
Date.isValiTime = function (timeStr, formatStr) {
    if (!timeStr) {
        return false;
    }
    if (!formatStr) {
        formatStr = "hh:mm:ss";//默认格式：hh:mm:ss
    }
    if (timeStr.length != formatStr.length) {
        return false;
    } else {
        if (formatStr == "hh:mm:ss") {
            var r1 = /^(([0-1][0-9])|(2[0-3])):([0-5][0-9]):([0-5][0-9])$/;
            return r1.test(timeStr);
        } else if (formatStr == "hh-mm-ss") {
            var r2 = /^(([0-1][0-9])|(2[0-3]))-([0-5][0-9])-([0-5][0-9])$/;
            return r2.test(timeStr);
        } else if (formatStr == "hh/mm/ss") {
            var r3 = /^(([0-1][0-9])|(2[0-3]))\/([0-5][0-9])\/([0-5][0-9])$/;
            return r3.test(timeStr);
        } else {
            alert("时间格式不正确！");
            return false;
        }
    }
};

/**
 * 日期和时间合法性验证
 * 格式：yyyy-MM-dd hh:mm:ss
 */
Date.isValiDateTime = function (dateTimeStr) {
    var dateTimeReg = /^(((((([02468][048])|([13579][26]))(00))|(d{2}(([02468][48])|([13579][26]))))-((((0[13578])|(1[02]))-(([0-2][0-9])|(3[01])))|(((0[469])|(11))-(([0-2][0-9])|(30)))|(02-([0-2][0-9]))))|(d{2}(([02468][1235679])|([13579][01345789]))-((((0[13578])|(1[02]))-(([0-2][0-9])|(3[01])))|(((0[469])|(11))-(([0-2][0-9])|(30)))|(02-(([0-1][0-9])|(2[0-8]))))))(s{1}(([0-1][0-9])|(2[0-3])):([0-5][0-9]):([0-5][0-9]))?$/;
    return dateTimeReg.test(dateTimeStr);
};


/**
 * 判断闰年 ：一般规律为：四年一闰，百年不闰，四百年再闰。
 */
Date.isLeapYear = function (date) {
    return (date.getYear() % 4 == 0 && ((date.getYear() != 0) || (date.getYear() % 400 == 0)));
};


/**
 * 日期格式化：
 * formatStr：可选，格式字符串，默认格式：yyyy-MM-dd hh:mm:ss
 * 约定如下格式：
 * （1）YYYY/yyyy/YY/yy 表示年份
 * （2）MM/M 月份
 * （3）W/w 星期
 * （4）dd/DD/d/D 日期
 * （5）hh/HH/h/H 时间
 * （6）mm/m 分钟
 * （7）ss/SS/s/S 秒
 * （8）iii 毫秒
 */
Date.format = function (date, formatStr) {
    var str = formatStr;
    if (!formatStr) {
        str = "yyyy-MM-dd hh:mm:ss";//默认格式
    }
    var Week = ['日', '一', '二', '三', '四', '五', '六'];

    str = str.replace(/yyyy|YYYY/, date.getFullYear());
    str = str.replace(/yy|YY/, (date.getYear() % 100) > 9 ? (date.getYear() % 100).toString() : '0' + (date.getYear() % 100));

    str = str.replace(/MM/, date.getMonth() >= 9 ? (parseInt(date.getMonth()) + 1).toString() : '0' + (parseInt(date.getMonth()) + 1));
    str = str.replace(/M/g, (parseInt(date.getMonth()) + 1));

    str = str.replace(/w|W/g, Week[date.getDay()]);

    str = str.replace(/dd|DD/, date.getDate() > 9 ? date.getDate().toString() : '0' + date.getDate());
    str = str.replace(/d|D/g, date.getDate());

    str = str.replace(/hh|HH/, date.getHours() > 9 ? date.getHours().toString() : '0' + date.getHours());
    str = str.replace(/h|H/g, date.getHours());
    str = str.replace(/mm/, date.getMinutes() > 9 ? date.getMinutes().toString() : '0' + date.getMinutes());
    str = str.replace(/m/g, date.getMinutes());

    str = str.replace(/ss|SS/, date.getSeconds() > 9 ? date.getSeconds().toString() : '0' + date.getSeconds());
    str = str.replace(/s|S/g, date.getSeconds());

    str = str.replace(/iii/g, date.getMilliseconds() < 10 ? '00' + date.getMilliseconds() : (date.getMilliseconds() < 100 ? '0' + date.getMilliseconds() : date.getMilliseconds()));

    return str;
};

/**
 * 字符串转成日期类型：
 * dateStr：必选，日期字符串，如果无法解析成日期类型，返回null
 * 格式：
 * （1）yyyy/MM/dd：IE和FF通用
 * （2）MM/dd/yyyy：IE和FF通用
 * （3）MM-dd-yyyy：仅IE
 * （4）yyyy-MM-dd：非IE，且时钟被解析在8点整
 */
Date.stringToDate = function (dateStr) {
    if (!dateStr) {
        alert("字符串无法解析为日期");
        return null;
    } else {
        if (Date.isValiDate(dateStr, "yyyy/MM/dd") || Date.isValiDate(dateStr, "MM/dd/yyyy")) {
            return new Date(Date.parse(dateStr));
        } else {
            if ((!-[1,])) {
                // IE
                if (Date.isValiDate(dateStr, "MM-dd-yyyy")) {
                    return new Date(Date.parse(dateStr));
                } else {
                    alert("字符串无法解析为日期");
                    return null;
                }
            } else {// 非IE
                if (Date.isValiDate(dateStr, "yyyy-MM-dd")) {
                    return new Date(Date.parse(dateStr));
                } else {
                    alert("字符串无法解析为日期");
                    return null;
                }
            }
        }
    }
};

// "2016-05-15T08:12:00.000+0800"
Date.ajustTimeString = function (date) {
    if (!date)
        return null;
    date = date.replace('T', ' ');
    date = date.replace(/-/g, '/');
    date = date.substring(0, date.indexOf('.')) + ' ' + date.substring(date.indexOf('.') + 4);
    return date;
};

Date.stringToDate2 = function (date) {
    date = Date.ajustTimeString(date);
    return Date.parse(date);
};
//格式化日期时间的时区，以便兼容IE和Chrome。格式化前2016-03-25T14:33:00.000+0800，格式化后2016-03-25T14:33:00.000+08:00
Date.formatTimezone = function (dt) {
    if (dt) return dt.replace(/(\+\d{2})(\d{2})$/, "$1:$2");
    return dt;
};
//将2016-03-25 14:33转成2016-03-25T14:33:00
Date.toJavaTime = function (dt) {
    if (dt) return dt.replace(" ", "T") + ":00";
    return dt;
};
//将2016-03-25T14:33:00转成2016-03-25 14:33
Date.toJSTime = function (dt) {
    if (dt) return dt.replace(/^(\d{4})\-(\d{2})\-(\d{2})[ |T](\d{2}):(\d{2}):(\d{2})(.*)$/, "$1-$2-$3 $4:$5");
    return dt;
};
/**
 * 计算两个日期的天数差：
 * dateOne：必选，必须是Data类型的实例
 * dateTwo：必选，必须是Data类型的实例
 */
Date.daysBetween = function (dateOne, dateTwo) {
    if ((dateOne instanceof Date) == false || (dateTwo instanceof Date) == false) {
        return 0;
    } else {
        return Math.abs(Math.floor((dateOne.getTime() - dateTwo.getTime()) / 1000 / 60 / 60 / 24));
    }
};


/**
 * 日期计算：支持负数，即可加可减，返回计算后的日期
 * num：必选，必须是数字，且正数是时期加，负数是日期减
 * field：可选，标识是在哪个字段上进行相加或相减，字段见如下的约定。无此参数时，默认为d
 * 约定如下格式：
 * （1）Y/y 年

 * （2）M 月
 * （3）W/w 周
 * （4）D/d 日
 * （5）H/h 时
 * （6）m 分
 * （7）S/s 秒
 * （8）Q/q 季
 */
Date.dateAdd = function (date, num, field) {
    if ((!num) || isNaN(num) || parseInt(num) == 0) {
        return date;
    }
    if (!field) {
        field = "d";
    }
    switch (field) {
        case 'Y':
        case 'y':
            return new Date((date.getFullYear() + num), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
        case 'Q':
        case 'q':
            return new Date(date.getFullYear(), (date.getMonth() + num * 3), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
        case 'M':
            return new Date(date.getFullYear(), date.getMonth() + num, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
        case 'W':
        case 'w':
            return new Date(Date.parse(date) + ((86400000 * 7) * num));
        case 'D':
        case 'd':
            return new Date(Date.parse(date) + (86400000 * num));
        case 'H':
        case 'h':
            return new Date(Date.parse(date) + (3600000 * num));
        case 'm':
            return new Date(Date.parse(date) + (60000 * num));
        case 'S':
        case 's':
            return new Date(Date.parse(date) + (1000 * num));
        default:
            return date;
    }
};


/**
 * 比较日期差：比较两个时期相同的字段，返回相差值
 * dtEnd：必选，必须是Data类型的实例
 * field：可选，标识是在哪个字段上进行比较，字段见如下的约定。无此参数时，默认为d
 * 约定如下格式：
 * （1）Y/y 年
 * （2）M 月
 * （3）W/w 周
 * （4）D/d 日
 * （5）H/h 时
 * （6）m 分
 * （7）S/s 秒
 */
Date.dateDiff = function (date, dtEnd, field) {
    var dtStart = date;
    if ((dtEnd instanceof Date) == false) {
        return 0;
    } else {
        if (!field) {
            field = "d";
        }
        switch (field) {
            case 'Y':
            case 'y':
                return dtEnd.getFullYear() - dtStart.getFullYear();
            case 'M':
                return (dtEnd.getMonth() + 1) + ((dtEnd.getFullYear() - dtStart.getFullYear()) * 12) - (dtStart.getMonth() + 1);
            case 'W':
            case 'w':
                return parseInt((dtEnd - dtStart) / (86400000 * 7));
            case 'D':
            case 'd':
                return parseInt((dtEnd - dtStart) / 86400000);
            case 'H':
            case 'h':
                return parseInt((dtEnd - dtStart) / 3600000);
            case 'm':
                return parseInt((dtEnd - dtStart) / 60000);
            case 'S':
            case 's':
                return parseInt((dtEnd - dtStart) / 1000);
            default:
                return 0;
        }
    }
};


/**
 * 把日期分割成数组：按数组序号分别为：年月日时分秒
 */
Date.toArray = function (date) {
    var myArray = new Array();
    myArray[0] = date.getFullYear();
    myArray[1] = date.getMonth();
    myArray[2] = date.getDate();
    myArray[3] = date.getHours();
    myArray[4] = date.getMinutes();
    myArray[5] = date.getSeconds();
    return myArray;
};


/**
 * 取得日期数据信息：
 * field：可选，标识是在哪个字段上进行比较，字段见如下的约定。无此参数时，默认为d
 * （1）Y/y 年
 * （2）M 月
 * （3）W/w 周
 * （4）D/d 日
 * （5）H/h 时
 * （6）m 分
 * （7）S/s 秒
 */
Date.datePart = function (date, field) {
    if (!field) {
        field = "d";
    }
    var Week = ['日', '一', '二', '三', '四', '五', '六'];
    switch (field) {
        case 'Y' :
        case 'y' :
            return date.getFullYear();
        case 'M' :
            return (date.getMonth() + 1);
        case 'W' :
        case 'w' :
            return Week[date.getDay()];
        case 'D' :
        case 'd' :
            return date.getDate();
        case 'H' :
        case 'h' :
            return date.getHours();
        case 'm' :
            return date.getMinutes();
        case 's' :
            return date.getSeconds();
        default:
            return date.getDate();
    }
};