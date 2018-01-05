(function ($) {
    function loadScript(url, func) {
        // var head = document.head || document.getElementByTagName('head')[0];
        var script = document.createElement('script');
        script.src = url;

        script.onload = script.onreadystatechange = function () {
            if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
                func();
                script.onload = script.onreadystatechange = null;
            }
        };

        // head.insertBefore(script, 0);

        document.body.appendChild(script);
    }
    loadScript('http://www.baidu.com/', function () {
        console.log('loaded')
    });

    // proxy('http://webfront.test.huayu.nd/onetest/train', function () {
    //     function getUserQuestionAnswers(examId, sessionId, qids, success, error) {
    //         return $.ajax({
    //             url: "http://webfront.test.huayu.nd/onetest/v1/m/exams/" + examId + "/sessions/" + sessionId + "/answers",
    //             type: "POST",
    //             dataType: "json",
    //             enableToggleCase: true,
    //             data: JSON.stringify(qids),
    //             contentType: "application/json;",
    //             cache: false,
    //             traditional: true,
    //             success: success,
    //             error: error,
    //             beforeSend: function (xhr) {
    //                 xhr.setRequestHeader('Accept-Language', "zh-CN");
    //             }
    //         });
    //     }

    //     var qids = ["417e1a16-cc39-4daa-a4ea-ee0246b09cba", "14ae8b50-fa18-491e-aa26-80b0bca63697", "56f0f501-8056-49e8-b1e7-eca871940f68", "9b2ab9ee-0f4f-4757-93d2-6f9134591391", "1c83eb54-5582-440c-8a65-dda0c03345fa", "71dfc873-9371-4169-aa6c-1634e3e6834c", "26f5d55a-5f76-43ac-a4d3-bc8eb45e7376", "8eacbfb9-8a19-4393-9061-1f6b10627225", "fdb97af3-76de-452f-9522-c6af05b15115", "786884b4-83c9-4255-9d79-3908223fe3d5", "2b6cac06-466d-4062-b450-5f9a4648f708", "f06b010b-ca71-477d-8122-d18df19f9138", "23f9c22a-8cd0-4bf9-92d8-a8717fe13b7e", "934c9f13-5e73-496c-b541-e5539bcb5543", "4e262c13-a425-4428-a7dd-1057238d9998", "a7c1d0e4-1603-4cfe-ada4-ed7fc8da9ea8", "c89aabea-df67-416c-b586-bc1908370cdf"];

    //     getUserQuestionAnswers("d7933173-54f4-42c0-8e52-8f52b636b39e", "a19accd7-144a-4344-8cfb-a1fb62b8d59f", qids, function (data) {
    //         console.log(JSON.stringify(data));
    //     }, function (data) {
    //         console.log(data);
    //     })

    //     console.log("asdfasdfasdf");
    // });
} (jQuery));