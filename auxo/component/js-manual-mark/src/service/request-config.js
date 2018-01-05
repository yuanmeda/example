const emptyFn = function(){};
if(window.manualMock) {
    window.orgId = '481036362583',
    window.projectCode = 'ndu',
    window.uc_host = 'https://ucbetapi.101.com',
    window.env = 'test'
}

export default {
	token: {
    user_id: window.userId || 10005074
  },
	userInfo: null,
	host: window.elearningManualMarkUrl || 'http://elearning-manualmark-api.debug.web.nd',
  // gateway : window.location.origin + '/' || 'http://elearning-manualmark-gateway.dev.web.nd',
  gateway : window.manualMock?'http://elearning-manualmark-gateway.debug.web.nd':'http://' + location.host,
  ref_path : window.ref_path || 'http://betacs.101.com/v0.1/static',
  avatar_host: 'http://cs.101.com/v0.1/static/cscommon',
	version: '',
	showPreloader:emptyFn,
	hidePreloader:emptyFn,
	toast:emptyFn,
	loadingDelay:0,
	serverDiffTime:0,

  gaea_id: 'GAEA id="RwU/Ea32iQw="',
}
