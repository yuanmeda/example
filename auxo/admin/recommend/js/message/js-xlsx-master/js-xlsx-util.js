(function ($) {
    var viewModel = {
        /**
         * 初始化
         */
        init: function () {
            //点击事件初始化
            $("#selectFile").click(function () {
                var _self = this;
                $.fn.dialog2.helpers.confirm('支持excel文件导入，第一列为用户帐号列，格式如123456@nd（帐号@组织）；<br/>从第二行开始导入，最多导入500个帐号', {
                    "confirm": function () {
                        $("#addInput").html('<input type="file" name="xlfile" id="xlf" />');
                        var xlf = document.getElementById('xlf');
                        if (xlf.addEventListener) xlf.addEventListener('change', handleFile, false);
                        $("#xlf").click();
                    },
                    buttonLabelYes: '开始导入',
                    buttonLabelNo: '取消'
                });
            });
            var X = XLSX;

            var rABS = typeof FileReader !== "undefined" && typeof FileReader.prototype !== "undefined" && typeof FileReader.prototype.readAsBinaryString !== "undefined";

            var use_worker = typeof Worker !== 'undefined';

            function fixdata(data) {
                var o = "", l = 0, w = 10240;
                for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
                o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
                return o;
            }

            //新加的，从跟xlsxworker1.js拷出来的,针对IE浏览器使用的转换
            function ab2str2(data) {
                var o = "", l = 0, w = 10240;
                for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
                o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
                return o;
            }

            //原有的，跟xlsxworker2.js的方法一致
            function ab2str(data) {
                var o = "", l = 0, w = 10240;
                for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w, l * w + w)));
                o += String.fromCharCode.apply(null, new Uint16Array(data.slice(l * w)));
                return o;
            }

            function s2ab(s) {
                var b = new ArrayBuffer(s.length * 2), v = new Uint16Array(b);
                for (var i = 0; i != s.length; ++i) v[i] = s.charCodeAt(i);
                return [v, b];
            }

            function xw_xfer(data, cb) {
                var v;
                if (rABS) {
                    var val = s2ab(data);
                    try {
                        v = XLSX.read(ab2str(val[1]), {type: 'binary'});
                    } catch (e) {
                        alert(e.stack);
                    }
                } else {
                    try {
                        v = XLSX.read(ab2str2(data), {type: 'binary'});
                    } catch (e) {
                        alert(e.stack);
                    }
                }
                var result = [];
                var res = v.Sheets[v.SheetNames[0]];
                for (var i = 2; i<502; i++){
                    if(res['A'+i]){
                        result.push(res['A'+i].w);
                    }
                }
                $("#out").val(result.join("\n"));
                $('body').loading('hide');
                $.fn.dialog2.helpers.alert('导入成功');
//                var res = {t: "xlsx", d: JSON.stringify(v)};
//                var r = s2ab(res.d)[1];
//                switch (r.t) {
//                    case 'ready':
//                        break;
//                    case 'e':
//                        console.error(e.data.d);
//                        break;
//                    default:
//                        xx = ab2str(r).replace(/\n/g, "\\n").replace(/\r/g, "\\r");
//                        cb(JSON.parse(xx));
//                        break;
//                }


            }

            function xw(data, cb) {
                if (use_worker) xw_xfer(data, cb);
                else xw_noxfer(data, cb);
            }

//            function to_json(workbook) {
//                var result = [];
//                var roa = X.utils.sheet_to_row_object_array(workbook.Sheets[workbook.SheetNames[0]]);
//                if (roa.length > 0) {
//                    var resultstr = "";
//                    for (var i = 0; i < roa.length; i++) {
//                        resultstr = resultstr + '<p>' + roa[i].aaa + "</p>";
//                    }
//                    result = resultstr;
//                }
//                return result;
//            }

//            function to_csv(workbook) {
//                var result = [];
//                var csv = X.utils.sheet_to_csv(workbook.Sheets[workbook.SheetNames[0]]);
//                if (csv.length > 0) {
//                    var columnLen = csv.split('\n');
//                    var maxLen = columnLen.length > 501 ? 501 : columnLen.length;
//                    for (var i = 0; i < maxLen; i++) {
//                        if (i > 0) {
//                            var lineArray = columnLen[i].split(',');
//                            if ($.trim(lineArray[0])) {
//                                result.push(lineArray[0]);
//                            }
//                        }
//                    }
//                }
//                return result.join("\n");
//            }

//            function to_formulae(workbook) {
//                var result = [];
//                workbook.SheetNames.forEach(function(sheetName) {
//                    var formulae = X.utils.get_formulae(workbook.Sheets[sheetName]);
//                    if(formulae.length > 0){
//                        result.push("SHEET: " + sheetName);
//                        result.push("");
//                        result.push(formulae.join("\n"));
//                    }
//                });
//                return result.join("\n");
//            }

//            var tarea = document.getElementById('b64data');
//            function b64it() {
//                if(typeof console !== 'undefined') console.log("onload", new Date());
//                var wb = X.read(tarea.value, {type: 'base64',WTF:wtf_mode});
//                process_wb(wb);
//            }

            function process_wb(wb) {
                var output = "";
//                switch(get_radio_value("format")) {
//                    case "json":
//                        output = JSON.stringify(to_json(wb), 2, 2);
//                        break;
//                    case "form":
//                        output = to_formulae(wb);
//                        break;
//                    default:
//                        output = to_csv(wb);
//                }
//                console.log(out);
                $("#out").val(wb);
                $('body').loading('hide');
                $.fn.dialog2.helpers.alert('导入成功');
//                $("#out").append(to_csv(wb));
//                if(out.innerText === undefined) out.textContent = output;
//                else out.innerText = output;
//                if(typeof console !== 'undefined') console.log("output", new Date());
            }


            function handleFile(e) {
                if (typeof FileReader == "undefined") {
                    $.fn.dialog2.helpers.alert('浏览器版本太低，请升级后再进行导入');
                    return;
                }
                var files = e.target.files;
                var f = files[0];
                if (f && !new RegExp('(.xls|.xlsx)$', 'i').test(f.name)) {
                    $.fn.dialog2.helpers.alert('文件类型不正确，请重新选择');
                    return;
                }
                if(f && f.size>2097152){
                    $.fn.dialog2.helpers.alert('文件大小不能超过2M');
                    return;
                }
                $('body').loading('show');
                {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        var data = e.target.result;
                        if (use_worker) {
                            xw(data, process_wb);
                        } else {
                            var wb;
                            if (rABS) {
                                wb = X.read(data, {type: 'binary'});
                            } else {
                                var arr = fixdata(data);
                                wb = X.read(btoa(arr), {type: 'base64'});
                            }
                            process_wb(wb);
                        }
                    };
                    if (rABS) reader.readAsBinaryString(f);
                    else reader.readAsArrayBuffer(f);
                }
            }
        }

    };
    $(function () {
        viewModel.init();
    })
})
(jQuery);