function getEnrollUrl(unit_id, return_url) {
  var url = elearning_enroll_gateway_url + '/' + projectCode + '/enroll/enroll?unit_id=' + unit_id + '&__return_url=' + encodeURIComponent(return_url);
  url += '&__mac=' + Nova.getMacToB64(url);

  return url;
}

function getMacToken(method, url, host) {
  return Nova.getMacToken(method, url, host);
}