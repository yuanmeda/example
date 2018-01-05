var elearningHeaderParams = {
    getDomain: function () {
        return projectConfig.domain;
    },
    getChannels: function () {
        return projectConfig.channel;
    },
    getMobileApps: function () {
        return projectConfig.mobile_apps;
    },
    getUserInfo: function () {
        return {
            id: userInfo.user_id,
            name: userInfo.display_name,
            logo_url: userInfo.icon
        }
    },
    getLoginUrl: function () {
        return otherUrl.login_url;
    },
    getLogoutUrl: function () {
        return otherUrl.logout_url;
    },
    getMystudyUrl: function () {
        return otherUrl.my_study_url;
    },
    getSearchUrl: function () {
        return otherUrl.search_resources_url;
    },
    getCurrentChannel:function(){
        return customType;
    }
};
window.elearningHeaderManager = elearningHeaderParams;
