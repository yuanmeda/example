// 文件上传
jQuery(function () {
    var uuid, taxoncode, macToken, $list = $('#thelist'), uploader = "", uploaderDoc = "", video_type, audio_type, video_mime, audio_mime, params,coverages,upload_param;
    var lastResourceDone = true;
    var mime_type_obj = {
        //ndr已支持文件类型
        flv: 'video/flv',
        mp4: 'video/mp4',
        mov: 'video/mov',
        rmvb: 'video/rmvb',
        rm: 'video/rm',
        avi: 'video/avi',
        wmv: 'video/wmv',
        f4v: 'video/f4v',
        asf: 'video/asf',
        mpg: 'video/mpg',
        mkv: 'video/mkv',
        '3gp': 'video/3gp',
        m4v: 'video/m4v',
        vob: 'video/vob',
        ts: 'video/ts',
        wma: 'audio/wma',
        wav: 'audio/wav',
        mp3: 'audio/mp3',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ndpx: 'ndf/cw-x',
        //待扩展
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        png: 'image/png',
        bmp: 'image/bmp',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel	application/x-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
        pptm: 'application/vnd.ms-powerpoint.presentation.macroEnabled.12',
        pdf: 'application/pdf',
        txt: 'text/plain',
        //视频
        asx: 'video/asx',
        mpeg: 'video/mpeg',
        dat: 'video/dat',
        //音频
        aac: 'audio/aac',
        cda: 'audio/cda',
        flac: 'audio/flac',
        m4a: 'audio/m4a',
        mid: 'audio/mid',
        mka: 'audio/mka',
        mp2: 'audio/mp2',
        mpa: 'audio/mpa',
        mpc: 'audio/mpc',
        ape: 'audio/ape',
        ofr: 'audio/ofr',
        ogg: 'audio/ogg',
        ra: 'audio/ra',
        wv: 'audio/wv',
        tta: 'audio/tta',
        ac3: 'audio/ac3',
        dts: 'audio/dts'
    }
    //仓储store
    var store = {
        getQuery: function () {
            return auth.getQueryParams();
        },
        getUploadUrl: function () {
            return $.ajax({
                url: auth.querystring('ndr-server-url') + '/v0.6/assets/none/uploadurl?uid=' + auth.querystring("uid") + '&renew=false&coverage=Org/nd',
                type: 'GET',
                'cache': false,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer "' + params.ndr_token + '"');
                }
            });
        },
        createResource: function (data) {
            return $.ajax({
                url: auth.querystring('ndr-server-url') + '/v0.6/assets/' + uuid,
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify(data),
                type: 'POST',
                beforeSend: function (xhr) {
//                    xhr.setRequestHeader('Authorization', decodeURIComponent('Bearer "E379FA2E010AD6624749B0A32D171447E4B3D6B45F55F89CEB5AFCFD6F038CF2572700094DDA2E2A"'));
//                    xhr.setRequestHeader('Authorization', auth.getMacToken('POST','/v0.6/assets/'+uuid));
                    xhr.setRequestHeader('Authorization', 'Bearer "' + params.ndr_token + '"');
                }
            });
        },
        getServerTime: function (url) {
            return $.ajax({
                url: url,
                type: 'GET',
                'cache': false,
                async: false
            });
        }
    }
    init();
    function init() {
        params = store.getQuery();
        coverages = params.coverage;
        //判断是否显示上传试卷按钮
        upload_param = decodeURIComponent(params.upload_param);
        if(upload_param && upload_param != "undefined" && upload_param !="null"){
            upload_param = JSON.parse(upload_param);
            $("#download_url").attr("href",upload_param.import_download_url);
            if(upload_param.token && upload_param.mac_key){
                $("#pickExam").show();
                $("#pickExamInfo").show();
                $("p").show();
            }
        }
        if(params.coursetypeids == "0000100"){
             $("#pickExam").hide();
             $("#picker").hide();
        }
        //先校验参数是否都正确
        if (params.code) {
            $("#errorMsg").html(params.message).show();
            return;
        }
        video_type = params.video;
        audio_type = params.audio;
        if (audio_type && audio_type != 'null' && audio_type != undefined) {
            var temp = [];
            var audio_type_temp = audio_type.split(',');
            for (var i = 0; i < audio_type_temp.length; i++) {
                temp.push("." + audio_type_temp[i]);
            }
            audio_mime = temp.join(",");
        } else {
            audio_type = '';
        }
        if (video_type && video_type != 'null' && video_type != undefined) {
            var temp = [];
            var video_type_temp = video_type.split(',');
            for (var i = 0; i < video_type_temp.length; i++) {
                temp.push("." + video_type_temp[i]);
            }
            video_mime = temp.join(",");
        } else {
            video_type = '';
        }
        startUpload();
        $("#pickExam").click(function () {
            openExam(upload_param);
        });
    }

    function startUpload() {
        $("#baiduuploader").show();
        store.getUploadUrl().done(function (data) {
            uuid = data.uuid;
            uploadVideo(data);
            uploadAudio(data);

        }).fail(function (e) {
//            console.log(e);
        });
    }

    function uploadVideo(data) {
        if (!uploader) {
            uploader = WebUploader.create({

                // 不压缩image
                resize: false,
                fileSingleSizeLimit: 1024 * 1024 * 100,
                // swf文件路径
                swf: '/auxo/addins/webuploader/webuploader-ndr/webuploader/v0.1.5/swf/uploader.swf',

                // 文件接收服务端。
                server: data.access_url + "?session=" + data.session_id,
                // 选择文件的按钮。可选。
                // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                pick: {
                    id: '#picker',
                    multiple: false
                },
                timeout: 0,
                auto: true,
                chunked: true,
//                formData: {
//                    path: data.dist_path,
//                    scope: '1'
//                },
                accept: {
                    title: 'videos',
                    extensions: video_type || 'flv,mp4,mov,rmvb,rm,avi,wmv,f4v,asf,mpg,mkv,3gp,m4v,vob,ts,wma,wav,mp3',
                    mimeTypes: video_mime || '.flv,.mp4,.mov,.rmvb,.rm,.avi,.wmv,.f4v,.asf,.mpg,.mkv,.3gp,.m4v,.vob,.ts,.wma,.wav,.mp3'
                }//,
//            runtimeOrder: 'flash'
            });
            //判断是否有文件在上传
            uploader.on('beforeFileQueued', function (file) {
                if (lastResourceDone) {
                    $("#errorMsg").hide();
                    return true;
                } else {
                    $("#errorMsg").html('文件上传中，请稍后重试！').show();
                    return false;
                }
            });

            uploader.on('error', function (handler) {
                if (handler == 'Q_TYPE_DENIED') {
                    $("#errorMsg").html('文件格式不正确，请重新选择！').show();
                } else if (handler == 'F_DUPLICATE') {
                    $("#errorMsg").html('请勿重复上传文件！').show();
                } else if (handler == 'Q_EXCEED_SIZE_LIMIT') {
                    $("#errorMsg").html('上传文件不能大于100M！').show();
                } else if (handler == 'F_EXCEED_SIZE') {
                    $("#errorMsg").html('上传文件不能大于100M！').show();
                } else {
                    $("#errorMsg").html(handler).show();
                }
            });
            uploader.on('fileQueued', function (file) {
                lastResourceDone = false;
                $list.append('<div id="' + file.id + '" class="item">' +
                    '<h4 class="info">' + file.name + '</h4>' +
                    '<p class="state">正在上传...</p>' +
                    '</div>');
            });
            // 文件上传过程中创建进度条实时显示。
            uploader.on('uploadProgress', function (file, percentage) {
                var $li = $('#' + file.id),
                    $percent = $li.find('.progress .progress-bar');

                // 避免重复创建
                if (!$percent.length) {
                    $percent = $('<div class="progress active">' +
                        '<div class="progress-bar" role="progressbar" style="width: 0%;background-color: #46a9e2;height: 20px;">' +
                        '</div>' +
                        '</div>').appendTo($li).find('.progress-bar');
                }

                $li.find('p.state').text('已上传' + (percentage * 100).toFixed(2) + '%');

                $percent.css('width', percentage * 100 + '%');
            });

            uploader.on('uploadSuccess', function (file, response) {
                $('#' + file.id).find('p.state').text('已上传100%');
                $('#' + file.id).find('.progress').fadeOut();
//            uploader.destroy();
//            uploaderDoc.destroy();
                createResource(response, file, "$RA0103");
                $("#errorMsg").hide();
            });

            uploader.on('uploadError', function (file, reason) {
                $('#' + file.id).find('p.state').text('上传出错');
            });

            uploader.on('uploadComplete', function (file) {
                $('#' + file.id).find('.progress').fadeOut();
            });
        }
        // 初始化设置
        uploader.on('uploadBeforeSend', function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            file.path = data.dist_path;
            headers.Accept = "*/*";
        });

    }

    function uploadAudio(data) {
        if (!uploaderDoc) {
            uploaderDoc = WebUploader.create({

                // 不压缩image
                resize: false,
                fileSingleSizeLimit: 1024 * 1024 * 100,
                // swf文件路径
                swf: '/auxo/addins/webuploader/webuploader-ndr/webuploader/v0.1.5/swf/uploader.swf',

                // 文件接收服务端。
                server: data.access_url + "?session=" + data.session_id,
                // 选择文件的按钮。可选。
                // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                pick: {
                    id: '#pickerDoc',
                    multiple: false
                },
                auto: true,
                timeout: 0,
                chunked: true,
//                formData: {
//                    path: data.dist_path,
//                    scope: '1'
//                },
                accept: {
                    title: 'Applications',
                    extensions: audio_type || 'doc,docx,xls,xlsx,xlsm,ppt,pptx,pptm,pdf,txt,jpg,ndpx',
                    mimeTypes: audio_mime || '.doc,.docx,.xls,.xlsx,.xlsm,.ppt,.pptx,.pptm,.pdf,.txt,.jpg,.ndpx'
                }//,
//            runtimeOrder: 'flash'
            });
            uploaderDoc.on('error', function (handler) {
                if (handler == 'Q_TYPE_DENIED') {
                    $("#errorMsg").html('文件格式不正确，请重新选择！').show();
                } else if (handler == 'F_DUPLICATE') {
                    $("#errorMsg").html('请勿重复上传文件！').show();
                } else if (handler == 'Q_EXCEED_SIZE_LIMIT') {
                    $("#errorMsg").html('上传文件不能大于100M！').show();
                } else if (handler == 'F_EXCEED_SIZE') {
                    $("#errorMsg").html('上传文件不能大于100M！').show();
                } else {
                    $("#errorMsg").html(handler).show();
                }
            });

            //判断是否有文件在上传
            uploaderDoc.on('beforeFileQueued', function (file) {
                if (lastResourceDone) {
                    $("#errorMsg").hide();
                    return true;
                } else {
                    $("#errorMsg").html('文件上传中，请稍后重试！').show();
                    return false;
                }
            });

            uploaderDoc.on('fileQueued', function (file) {
                lastResourceDone = false;
                $list.append('<div id="' + file.id + '" class="item">' +
                    '<h4 class="info">' + file.name + '</h4>' +
                    '<p class="state">正在上传...</p>' +
                    '</div>');
            });
            // 文件上传过程中创建进度条实时显示。
            uploaderDoc.on('uploadProgress', function (file, percentage) {
                var $li = $('#' + file.id),
                    $percent = $li.find('.progress .progress-bar');
                $("#errorMsg").hide();
                // 避免重复创建
                if (!$percent.length) {
                    $percent = $('<div class="progress active">' +
                        '<div class="progress-bar" role="progressbar" style="width: 0%;background-color: #46a9e2;height: 20px;">' +
                        '</div>' +
                        '</div>').appendTo($li).find('.progress-bar');
                }
                $li.find('p.state').text('已上传' + (percentage * 100).toFixed(2) + '%');

                $percent.css('width', percentage * 100 + '%');
            });

            uploaderDoc.on('uploadSuccess', function (file, response) {
                $('#' + file.id).find('p.state').text('已上传100%');
                $('#' + file.id).find('.progress').fadeOut();
//            uploader.destroy();
//            uploaderDoc.destroy();
                createResource(response, file, "$RA0108");
                $("#errorMsg").hide();

            });

            uploaderDoc.on('uploadError', function (file, reason) {
                $('#' + file.id).find('p.state').text('上传出错');
            });

            uploaderDoc.on('uploadComplete', function (file) {
                $('#' + file.id).find('.progress').fadeOut();
            });

            uploaderDoc.on('uploadComplete', function (file) {
                $('#' + file.id).find('.progress').fadeOut();
            });
        }
        // 初始化设置
        uploaderDoc.on('uploadBeforeSend', function (obj, file, headers) {
            file.type = undefined;
            file.scope = 1;
            file.path = data.dist_path;
            headers.Accept = "*/*";
        });
    }

    function createResource(dentry, file, assets_type) {
        var data = {
            identifier: uuid,
            title: file.name.substr(0,file.name.lastIndexOf('.')),
            description: '',
            language: 'zh_cn',
            preview: {},
            life_cycle: {
                version: 'v1.0',
                status: 'TRANSCODE_WAITING',
                creator: dentry.uid,
                enable: true
            },
            tech_info: {
                source: {
                    format: mime_type_obj[file.ext],
                    size: file.size,
                    location: '${ref-path}' + dentry.path,
                    md5: null,
                    secure_key: null,
                    entry: null,
                    printable: false
                }
            },
            coverages: [
                {
                    target_type: 'App',
                    //只要AppId，不要/APP/
                    target: coverages.length ? coverages.substring(4, coverages.length - 1) : coverages,
                    target_title: coverages.length ? coverages.substring(4, coverages.length - 1) : coverages,
                    strategy: 'OWNER'

                }
            ],
            categories: {
                assets_type: [
                    {
                        taxonpath: '',
                        taxoncode: assets_type
                    }
                ]
            }
        }
        store.createResource(data).done(function (data) {
            //用新页面打开的postMessage方法
//            window.opener.postMessage(JSON.stringify('addResourceDone'),'http://192.168.230.55:8019');
            window.parent.postMessage(('addResourceDone'), '*');
            lastResourceDone = true;
            startUpload();
        }).fail(function (jqxhr) {
            var res = $.parseJSON(jqxhr.responseText),
                m = res.message || res.Message;
            $("#errorMsg").html(m).show();
            lastResourceDone = true;
            startUpload();
        });
    }

    function openExam(upload_param) {
        if (upload_param.server_time_url) {
            store.getServerTime(upload_param.server_time_url).done(function (data) {
                if (data.time) {
                    macToken = auth.getMacToken(upload_param, "POST", "/", data.time);
                }
            }).fail(function () {
                macToken = auth.getMacToken(upload_param, "POST", "/");
            });
        } else {
            macToken = auth.getMacToken(upload_param, "POST", "/");
        }
//        macToken = '930F04593E040BDAAAD0E49F45373FE25A4253B900837D2582FADE25DC723839,1476952441284:VVWGE5dD,xP6ORbKENrIaG7cIo3MjTgGmpMQdZWhXR6IgqzMFj1s=,/,101.com';
        var base64token = StringToBase64(macToken);
        var url = upload_param.import_url + "&Coverage=" + params.coverage + "OWNER&Authorization=" + base64token + "&Exam_ParseTemp=试卷模板";
//        var url = 'questionimport://param?AppKey=1dda42f312c444b8b74f0771b5a91bd8&Coverage=Org/nd/OWNER&Enviroment=debug&Exam_ParseTemp=%E8%AF%95%E5%8D%B7%E6%A8%A1%E6%9D%BF&Exam_Provider=%E5%80%8D%E6%95%B0&Exam_Provider_DicsKey=Exam_Provider&Exam_ProviderSource=RF01004,RF01005&Exam_Material=29767415-3798-4a37-817d-ac1d9f008b8f&Exam_Chapter=335447fc-ea07-4463-826f-fd068cd2a97f&Exam_Brand=PR01000045&Authorization=OTMwRjA0NTkzRTA0MEJEQUFBRDBFNDlGNDUzNzNGRTI1QTQyNTNCOTAwODM3RDI1ODJGQURFMjVEQzcyMzgzOSwxNDc2OTUyNDQxMjg0OlZWV0dFNWRELHhQNk9SYktFTnJJYUc3Y0lvM01qVGdHbXBNUWRaV2hYUjZJZ3F6TUZqMXM9LC8sMTAxLmNvbQ==';
        window.location.href=url;

    }

    function StringToBase64(str) {
        var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
        //StringToBin
        var bitString = "";
        for (var i = 0; i < str.length; i++) {
            var charCode = str.charCodeAt(i).toString(2);
            bitString += (new Array(9 - charCode.length).join("0") + charCode);
        }
        //BinToBase64
        var result = "";
        var tail = bitString.length % 6;
        var bitStringTemp1 = bitString.substr(0, bitString.length - tail);
        var bitStringTemp2 = bitString.substr(bitString.length - tail, tail);
        for (var i = 0; i < bitStringTemp1.length; i += 6) {
            var index = parseInt(bitStringTemp1.substr(i, 6), 2);
            result += code[index];
        }
        bitStringTemp2 += new Array(7 - tail).join("0");
        if (tail) {
            result += code[parseInt(bitStringTemp2, 2)];
            result += new Array((6 - tail) / 2 + 1).join("=");
        }
        return result;
    }
});