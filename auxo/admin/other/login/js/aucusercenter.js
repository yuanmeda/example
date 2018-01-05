//加密算法
function aucEncryptPassword(pwd) {
    var rsa = new RSAKey();
    var exponent = "010001";
    var model = "bb8bfc5d796b195a307b86e9490105b8ed4b4722b53e75335e5f9319e6052e02fd8196f354e72e776128ef33c4c3be2825904e9cec1d8b99d718b3a683f2c0a5";
    rsa.setPublic(model, exponent);
    var ms = new Date().valueOf();
    if (window.svrAndClientTimespan)
        ms += window.svrAndClientTimespan;

    var str = pwd + ":" + ms;
    var encryPssword = rsa.encrypt(str);
    var b64 = hex2b64(encryPssword);
    return b64;
}

