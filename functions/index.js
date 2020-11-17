const functions = require('firebase-functions');
const express = require('express')
const basicAuth = require('basic-auth-connect')
const ejs = require('ejs');
const fs = require('fs');
const auth = require('./controllers/auth.js');

const app = express()

app.all('/*', basicAuth(function(user, password) {
  const id = `${functions.config().basic.id}`
  const pwd = `${functions.config().basic.pwd}`

  return user === id && password === pwd;
}));

app.get('/css/*', function (request, response) {
  redirectUrl(request, response);
})
app.get('/js/*', function (request, response) {
  redirectUrl(request, response);
})
app.get('/images/*', function (request, response) {
  redirectUrl(request, response);
})

function redirectUrl(request, response){
    try{
      response.status(200).send(fs.readFileSync(`./static`+request.url).toString());
    }
    catch(e){
      response.status(400).send(e.toString());
    }
  
}
  
// cloud functionでfirestoreを使うのに必要な設定は以下の２行
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

// データベースの参照を作成
var fireStore = admin.firestore()

var filter = functions.https.onRequest((request, response) => {
  
  basemenu(request,response)
});

//app.use(express.static(__dirname + '/static/'))
app.use(filter)
exports.app = functions.https.onRequest(app)

async function basemenu(request,response){
    var respCode=400;
    var respBody="OK."

    var params = request.url.split(/[?&]/)
    var httpget={}
    var url = params[0]
  
  
    if(params.length>1){
      for(var i=1;i<params.length;i++){
        var s=params[i].split('=')
        if(s.length==2) httpget[s[0]]= decodeURIComponent(s[1])
      }
    }
  
    switch(url){
      case '/':
      case '/index.html':
        respCode=200;
        respBody = fs.readFileSync(`./static/select.ejs`).toString();
        break;

      case '/leave':
        respCode=200;
        respBody="通話が完了しました。<br /><a href='./index.html' target='_top'>[戻る]</a>"
        break;

      case '/controll':
        respCode=200;
        var json = JSON.parse(request.body.json);
        console.log("recv cmd:");
        console.log(json);
        respBody=""

        param={
          cmd:json.cmd,
          isdid:false,
          recvtime:admin.firestore.Timestamp.fromDate(new Date( Date.now())),
          user:json.user
        };

        set_command(json.id,param);

        break;


      case '/connect':
        respCode=200;
        if('json' in request.body){
          var json = JSON.parse(request.body.json);
          var apiKeyData = auth.getAPIKeyData();
          var apiKey = "";
          if(apiKeyData) {
              apiKey = apiKeyData.apikey;
          }
          const display_name = json.name;
          const id = json.meetingid;
          const password = json.password;
          const ZOOMVIEW_HTML = "./static/zoomview.ejs";
          const GUEST=0;
  
          var template = fs.readFileSync(ZOOMVIEW_HTML, 'utf8');
          var renderView = ejs.render(template, {
              hostname: admin.instanceId().app.options.projectId+".web.app",
              apikey: apiKey,
              meetingNum: id ,
              password: password,
              display_name: display_name,
              role: GUEST,
              signature: auth.generateSignature(id, GUEST),
          });
  
          respBody=renderView;
        }
        else{
          respBody="ご利用の環境ではうまく動作しない可能性があります。再度通話をお試しください。<br /><a href='./index.html' target='_top'>[戻る]</a>"
        }
        break;
    }
  
    response.status(respCode).send(respBody);
}  


const COLLECTION_COMMAND="command";

async function set_command(id,param){

  // Initialize document
  let cmdRef = fireStore.collection(COLLECTION_COMMAND).doc(id);
  let setCmd = cmdRef.set(param);

/*
  let transaction = fireStore.runTransaction(t => {
    return t.get(cmdRef)
      .then(doc => {
        t.set(cmdRef,param);
      });
  }).then(result => {
    console.log('Transaction success!');
  }).catch(err => {
    console.log('Transaction failure:', err);
  });*/
}