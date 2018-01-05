var TokenUtils = {
    model: {
        config: null
    },
    init: function () {
        this.model.config = JSON.parse(base64_decode(decodeURIComponent(window.G_CONFIG)));
    },

    /**
     * 取得指定的COOKIE
     * 
     * @param {any} name 
     * @returns 
     */
    getCookie: function (name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    },
    /**
     * 获取报名地址
     * 
     * @param {any} unit_id 
     * @param {any} return_url 
     */
    getEnrollUrl: function (unit_id, return_url) {
        var url = elearning_enroll_gateway_url + '/' + projectCode + '/enroll/enroll?unit_id=' + unit_id + '&__return_url=' + encodeURIComponent(return_url);
        url += '&__mac=' + Nova.getMacToB64(url);

        return url;
    },

    /**
     * 获取MAC TOKEN
     * 
     * @param {any} method 
     * @param {any} url 
     * @param {any} host 
     */
    getMacToken: function (method, url, host) {
        return Nova.getMacToken(method, url, host);
    },

    /**
     * 获取MAC KEY
     */
    getMacKey: function () {
        var cookieKey = this.model.config.cookie_mac_key;
        var temp = JSON.parse(base64_decode(decodeURIComponent(this.getCookie(cookieKey))))
        return temp.mac_key;
    },

    /**
     * 获取Gaea Id
     */
    getGaeaId: function () {
        return 'GAEA id="' + this.model.config.encode_gaea_id + '"'
    },

    /**
     * 获取UserId
     */
    getUserId: function() {
        var cookieKey = this.model.config.cookie_mac_key;
        var temp = JSON.parse(base64_decode(decodeURIComponent(this.getCookie(cookieKey))))
        return temp.user_id;
    }
}

$(function () {
    TokenUtils.init();
})
