(function (window) {
window.envconfig = {
  cs_uri: 'https://betacs.101.com',
};

if (window.location.hostname.indexOf('localhost') >= 0) {
  envconfig.env = 'localhost';
  envconfig.service = 'http://auxo-specialty-course-service.dev.web.nd';
} else if (window.location.hostname.indexOf('.dev.web.nd') >= 0) {
  envconfig.env = 'dev';
  envconfig.service = 'http://auxo-specialty-course-service.dev.web.nd';
} else if (window.location.hostname.indexOf('.debug.web.nd') >= 0) {
  envconfig.env = 'debug';
  envconfig.service = 'http://auxo-specialty-course-service.debug.web.nd';
} else if (window.location.hostname.indexOf('.qa.101.com') >= 0) {
  envconfig.env = 'qa';
  envconfig.service = 'http://auxo-specialty-course-service.debug.web.nd';
} else if (window.location.hostname.indexOf('.beta.101.com') >= 0) {
  envconfig.env = 'beta';
  envconfig.service = 'http://auxo-specialty-course-service.beta.web.sdp.101.com';
} else if (window.location.hostname.indexOf('.sdp.101.com') >= 0) {
  envconfig.env = 'pro';
  envconfig.service = 'http://auxo-specialty-course-service.edu.web.sdp.101.com';
} else if (window.location.hostname.indexOf('.aws.101.com') >= 0) {
  envconfig.env = 'aws';
  envconfig.service = 'http://auxo-specialty-course-service.aws.101.com';
} else if (window.location.hostname.indexOf('.awsca.101.com') >= 0) {
  envconfig.env = 'awsca';
  envconfig.service = 'http://auxo-specialty-course-service.awsca.101.com';
}
})(window);
