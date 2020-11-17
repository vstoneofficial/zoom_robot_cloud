var jwt = require("jsonwebtoken");
var crypto = require("crypto");
var fs = require('fs');
const functions = require('firebase-functions');

var _apiKeyData = null;

module.exports = {
    getAPIKeyData: getAPIKeyData,
    getJWT: getJWT,
    generateSignature: generateSignature,
}

/**
 * APIキー情報を取得する
 */
function getAPIKeyData() {
    if(_apiKeyData) return _apiKeyData;

    _apiKeyData = {
        apikey:`${functions.config().zoom.apikey}`,
        apisecret:`${functions.config().zoom.secret}`
    };
    return _apiKeyData;
}

/**
 * JWTを取得する
 */
function getJWT() {
    var apiKeyData = getAPIKeyData();
    var apiKey = "";
    var apiSecret = "";
    if(apiKeyData) {
        apiKey = apiKeyData.apikey;
        apiSecret = apiKeyData.apisecret;
    }

    const payload = {
        iss: apiKey,
        exp: ((new Date()).getTime() + 10000) // 10秒間有効
    };
    return jwt.sign(payload, apiSecret);
}

/**
 * Signature生成
 * @param {*} meetingNumber 
 * @param {*} role 0 for attendee or webinar. 1 for host
 */
function generateSignature(meetingNumber, role) {
    var apiKeyData = getAPIKeyData();
    var apiKey = "";
    var apiSecret = "";
    if(apiKeyData) {
        apiKey = apiKeyData.apikey;
        apiSecret = apiKeyData.apisecret;
    }

    // Prevent time sync issue between client signature generation and zoom 
    const timestamp = new Date().getTime() - 30000
    const msg = Buffer.from(apiKey + meetingNumber + timestamp + role).toString('base64')
    const hash = crypto.createHmac('sha256', apiSecret).update(msg).digest('base64')
    const signature = Buffer.from(`${apiKey}.${meetingNumber}.${timestamp}.${role}.${hash}`).toString('base64')
  
    return signature
}
