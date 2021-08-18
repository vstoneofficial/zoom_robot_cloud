(function(){

	console.log('checkSystemRequirements');
	console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

    // it's option if you want to change the WebSDK dependency link resources. setZoomJSLib must be run at first
    // if (!china) ZoomMtg.setZoomJSLib('https://source.zoom.us/1.7.8/lib', '/av'); // CDN version default
    // else ZoomMtg.setZoomJSLib('https://jssdk.zoomus.cn/1.7.8/lib', '/av'); // china cdn option 
    // ZoomMtg.setZoomJSLib('http://localhost:9999/node_modules/@zoomus/websdk/dist/lib', '/av'); // Local version default, Angular Project change to use cdn version
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareJssdk();
    
    ZoomMtg.i18n.load("jp-JP");
    ZoomMtg.i18n.reload("jp-JP");
    ZoomMtg.reRender({lang: "jp-JP"});

    var meetConfig = {
        apiKey: apikey,
        meetingNumber: meetingNum,
        userName: display_name,
        passWord: password,
        leaveUrl: `https://${hostname}/leave`,
        role: role,
    };

    ZoomMtg.init({
        leaveUrl: meetConfig.leaveUrl,
        success: function () {
            ZoomMtg.i18n.load("jp-JP");
            ZoomMtg.i18n.reload("jp-JP");
            ZoomMtg.reRender({lang: "jp-JP"});

            console.log("ZoomMtg.init is success. reload start");
            const match = window.parent.document.getElementById("zoomframe").style.height.match(/[0-9]+/g);
            window.parent.document.getElementById("zoomframe").style.height = `1%`;
            setTimeout(function(){
                window.parent.document.getElementById("zoomframe").style.height = `${match[0]}%`;
            },1000);

            ZoomMtg.join(
                {
                    meetingNumber: meetConfig.meetingNumber,
                    userName: meetConfig.userName,
                    signature: signature,
                    apiKey: meetConfig.apiKey,
                    passWord: meetConfig.passWord,
                    success: function(res){
                        $('#nav-tool').hide();
                        console.log('join meeting success');
                        window.parent.document.getElementById('controller').style.visibility = 'visible';
                    },
                    error: function(res) {
                        console.log(res);
                    }
                }
            );
        },
        error: function(res) {
            console.log(res);
        }
    });
})();

