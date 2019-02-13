appName = "/gnss-admin";
mediaIp = "127.0.0.1";
mediaPort = 8091;

$(document).ready(function(){
    login();
    window.index = 0;
    $("#winNum").val(4);
    window.player = new SBHPlayer({
        domid:'main',//加载窗口的元素id
        winNums:$("#winNum").val(),//窗口个数
        select:function(index){
            console.log("view "+index+" selected");
        },
        winContextMenu:[{
            text:'',
            handler:function(win){
                console.log(win.index);
                console.log(event);
            }
        },{
            text:'其他',
            handler:function(winIndex){

            }
        }],
        play:{
            text:"播放/暂停",
            handler:function(index,status){
                // var params = {type:'ReqPlaybackAVCtrl',channel:'',}
                console.log("play button click:"+status);
            }
        },
        stop:{
            text:"停止",
            handler:function(index){
                console.log("stop button click");
            }
        },
        volume:{
            text:"音量",
            value:70,//0～100
            handler:function(index,value){
                console.log("window["+index+"] volume:"+value);
            }
        },
        //视频自动关闭时间，毫秒，0不关闭
        videoLimit:0,
        /**
         * 视频自动关闭时的回调
         * @param winIndex 窗口序号
         */
        videoLimitHandler:function(winIndex){

        },
        //音频（对讲/监听）自动关闭时间，毫秒，0不关闭
        audioLimit:0,
        /**
         * 音频关闭时回调
         * @param type 0 监听 1 对讲
         */
        audioLimitHandler:function(type){

        },
        /**
         * 音频开始播放
         */
        onAudioPlay:function(){

        },
        download:{
            enable:true,
            text:"下载",
            handler:function(index){

            }
        },
        captrue:{
            enable:true,
            text:"抓拍",
            handler:function(index,url){
                console.log(url);
            }
        },
        fullscreenText:"全屏",
        /**
         * 链接异常断开时回调
         * @param type
         * @param index
         */
        onDisconnect:function(type,index){//ws连接断开时触发
            switch (type){
                case SBHPlayer.REQUEST_TYPE.VIDEOAUDIO:console.log("video&audio disconnect,window num="+index);break;
                case SBHPlayer.REQUEST_TYPE.VIDEO:console.log("video disconnect,window num="+index);break;
                case SBHPlayer.REQUEST_TYPE.TALK:console.log("talkback disconnect");break;
                case SBHPlayer.REQUEST_TYPE.BROADCAST:console.log("broadcast disconnect");break;
                case SBHPlayer.REQUEST_TYPE.LISTEN:console.log("listen disconnect");break;
                case SBHPlayer.REQUEST_TYPE.PLAYBACK:console.log("playback disconnect");break;
                default:break;
            }
        },

        playback:{//回放配置
            enable:true,//开启回放
            multiple:[1,2,4,8,16],//快进快退倍数选择，数组
            forward:{
                enable:true,
                text:'快进',
                handler:function(index,multi){

                }
            },
            backward:{
                enable:true,
                text:'关键帧快退',
                handler:function(index,multi){

                }
            },
            kFrame:{
                enable:true,
                text:'关键帧播放',
                handle:function(index){

                }
            },
            //拖动
            seek:function(position){
                console.log(position);
            },
        }
    });

    // player.playFile(0,"http://192.168.0.250:8080/web/file/getFile/realtimeRecorder/18800000001/2018-11-08/10/18800000001-CH11-20181108171839-20181108171926.mp4","flash");
    $("#winNum").change(function(){
        player.setWindowNum(this.value);
    });
    // var url = 'http://120.24.89.199:9915/realstream?fmt=flv&vchn=0&vstreamtype=1&achn=-1&atype=0&datatype=0&phone=013800000033&sessionid=549F1287FEC2D85586A64820688755A4';


    // player.play(1,'013800000033',0,1);
    // for(var i=0;i<6;i++){
    //     player.play(i,'013800000033',0,1);
    // }
    $("#video").click(function(){
        requestVideo();
    });
    $("#playback").click(function(){
        requestPlayback();
    });
    $("#stopAll").click(function(){
       player.stopAll();
       index = 0;
    });
    $("#listen").click(function(){
        // player.listen();
        // return;
        var params = {"channel":0,"dataType":3,"simcard":$("#simcard").val(),"streamType":1,"type":"ReqAVStream"};
        sendCommand(params,function(ret){
            if(ret.result == 0){
               // var msg = JSON.parse(ret.message);
                var chn = params.channel;
                if(ret.terminal == 1){//1076终端，通道号从1开始
                    chn = chn+1;
                }
                var requestObj ={
                    simcard:params.simcard,
                    channel:params.channel,
                    streamType:params.streamType,
                    dataType:params.dataType,
                    ip:ret.ip,
                    port:ret.port,
                    terminalType:ret.terminal,
                    guid:"1234"
                }
                player.listen('ws://' + location.host + '/web/websocket/media?' + 'params=' + encodeURI(JSON.stringify(requestObj)));
            }
        })
    });
    $("#stopListen").click(function(){//停止监听
       player.stopListen();
    });
    $("#talk").click(function(){//对讲
        // var params = {"channel":0,"dataType":2,"simcard":$("#simcard").val(),"streamType":1,"type":"ReqAVStream"};
        var url = "/api/v1/monitor/commands/jt808/sendCommand9101";
        var params = {
            "terminalId": $("#simcard").val(),
            "responseTimeout": 3000,
            "paramsEntity": {
                "channelId": 1,
                "avItemType": 2,
                "streamType": 0
            }
        };
        sendCommand(url, params,function(ret){
            if(ret.code == 0){
                var requestObj ={
                    simcard:params.simcard,
                    channel:10,
                    streamType:0,
                    dataType:params.dataType,
                    ip:ret.ip,
                    port:ret.port,
                    localIp:ret.localIp,
                    localPort:ret.localPort,
                    terminalType:ret.terminal,
                }
                player.talk('ws://' + location.host + '/ws/media?' + 'params=' + encodeURI(JSON.stringify(requestObj)));
            }
        })
    });
    $("#stopTalk").click(function(){//停止对讲
        player.stopTalk();
    });
});

/**
 * 登陆
 */
function login(){
    var loginInfo = {account:'test', password:'000000'};
    $.ajax({
        url: appName + '/api/v1/baseinfo/users/login',
        type:'post',
        contentType: "application/json;charset=UTF-8",
        dataType: 'json',
        data: JSON.stringify(loginInfo),
        success:function (ret) {
            if (ret.code == 0) {
                localStorage.token = ret.data;
            }
        }
    });
}

/**
 * 请求视频
 */
function requestVideo(){
    //var params = {"channel":index,"dataType":0,"simcard":$("#simcard").val(),"streamType":$("#streamType").val(),"type":"ReqAVStream"};
    var url = "/api/v1/monitor/commands/jt808/sendCommand9101";
    var dataType = 0;
    var params = {
        "terminalId": $("#simcard").val(),
        "responseTimeout": 3000,
        "paramsEntity": {
            "channelId": index + 1,
            "avItemType": $("#streamType").val(),
            "streamType": 0
        }
    };
    sendCommand(url, params,function(ret){
        if(ret.code == 0){
            // var chn = params.channel;
            // if(ret.terminal == 1){//1076终端，通道号从1开始
            //     chn = chn+1;
            // }
            var requestObj ={
                terminalId: params.terminalId,
                videoChannelNum: params.paramsEntity.channelId,
                videoStreamType: params.paramsEntity.streamType,
                dataType: dataType,
                // localIp: "127.0.0.1",
                // localPort: 6666,
                // localIp:ret.localIp,
                // localPort:ret.localPort,
                // ip:ret.ip,
                // port:ret.port,
                // terminalType:ret.terminal,
                guid:"1234",
                download:false
            };
            if(ret.terminalType == 0){
                requestObj.dataType = 1;
            }
            for(var i=0;i<$("#winNum").val()*1;i++){
                //第二个参数表示有没有音频数据
                var wsUrl = "ws://" + mediaIp + ":" + mediaPort + "/ws/media?token=" + localStorage.token+'&params='+encodeURI(JSON.stringify(requestObj));
                var idx = player.play(-1, wsUrl,params.dataType==0 ? true : false);
                player.windows[idx].requestParam = requestObj;
            }
        }
    });
    // index++;
    if(index == player.windows.length){
        index = 0;
    }

}

/**
 * 请求录像回放
 */
function requestPlayback(){
    var params = {"channel":0,"avFlag":0,"playbackMode":0,"playbackRate":1,"streamType":0,"startTime":"180823032545","endTime":"180823042554","simcard":$("#simcard").val(),"type":"ReqPlaybackAV"};
    sendCommand(params,function(ret){
        if(ret.result == 0){
            var requestObj ={
                simcard:params.simcard,
                channel:params.channel,
                avflag:params.avflag,
                streamType:params.streamType,
                dataType:11,
                ip:ret.ip,
                port:ret.port,
                startTime:params.startTime,
                endTime:params.endTime
            }
            var index = player.play(-1,'ws://'+location.host+'/web/websocket/media?'+'params='+encodeURI(JSON.stringify(requestObj)),true,jt808DateToMills(params.startTime),jt808DateToMills(params.endTime));
            player.windows[index].requestParam = requestObj;
        }
    })
}

function sendCommand(params,callback){
    var url = '/web/doAction/sendCommand';
    sendCommand(url, params, callback);
}

/**
 * 发指令
 * @param params
 * @param callback
 */
function sendCommand(url, params,callback){
    $.ajax({
        url: appName + url,
        type:'post',
        dataType:'json',
        contentType: "application/json;charset=UTF-8",
        data: JSON.stringify(params),
        beforeSend: function(request) {
            if(localStorage.token != null && localStorage.token.length>0){
                request.setRequestHeader("Authorization", localStorage.token);
            }
        },
        success:function (ret) {
            if(typeof callback == "function"){
                callback(ret);
            }
        }
    });
}

Date.prototype.format=function(fmt) {
    var o = {
        "M+" : this.getMonth()+1, //月份
        "d+" : this.getDate(), //日
        "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时
        "H+" : this.getHours(), //小时
        "m+" : this.getMinutes(), //分
        "s+" : this.getSeconds(), //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S" : this.getMilliseconds() //毫秒
    };
    var week = {
        "0" : "/u65e5",
        "1" : "/u4e00",
        "2" : "/u4e8c",
        "3" : "/u4e09",
        "4" : "/u56db",
        "5" : "/u4e94",
        "6" : "/u516d"
    };
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    if(/(E+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}

function jt808DateToMills(date){
    var year = "20"+date.slice(0,2);
    var month = date.slice(2,4);
    var day = date.slice(4,6);
    var hour = date.slice(6,8);
    var minute = date.slice(8,10);
    var second = date.slice(10,12);
    return new Date(year+"-"+month+"-"+day+" "+hour+":"+minute+":"+second)*1;
}