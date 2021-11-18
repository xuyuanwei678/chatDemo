// Copyright © 2017 Intel Corporation. All Rights Reserved.
// 'use strict';


var Owt = require('@/static/plugins/owt.js')
//import $ from '@/static/plugins/jquery-3.2.1.min.js'
var $ = require('@/static/plugins/jquery-3.2.1.min.js')
var jquery = require('@/static/plugins/jquery-3.2.1.min.js')




import _create from '@/static/plugins/rest-sample.js'

//console.log($)

var res = {
    conference: new Owt.Conference.ConferenceClient(),
    publicationGlobal: null,
    screenpubGlobal: null,
    runSocketIOSample: null,
    localStream: null,
    is_audio_forbid: 'yes',
    role: 'normal',
    // createScreen: createScreen,
    //  changeDevice: changeDevice,
    media: {
        mac_list: [],
        camera_list: []
    },
    audioConstraintsForMic: null,
    videoConstraintsForCamera: null,
    //extensionId: "eeifdjaklofaecbcoaoehiilkhfdnfhk",
    extensionId: null,
    streamconstraints: null,
    streamSourceInfo: null,
    avInfo: {
        audio: true,
        video: true,
        videoCodecs: ['vp8', 'vp9', 'h264'],
        pubOptions: [{codec: {name: 'vp9'}, maxBitrate: 512}]
    },
    isResolution: true,
    isLocalVideoFiled: false,
    myResolution: {
        width: 1920,
        height: 1080
    },
    basePath: null,
    myRoom: null,
    selfId: null,
    resp: null,
    cab: null,
	localStreamsss: '',
}

// 获取本地设备
var getMedia = (callback) => {
    try {
		console.log("获取本地设备")
        navigator.mediaDevices.enumerateDevices().then((deviceList) => {
            for (var i = 0; i < deviceList.length; i++) {
                var dev = deviceList[i]

                if (dev.kind === 'audioinput') {
                    if (dev.kind.indexOf('扬声器') === -1) {
                        res.media.mac_list.push(dev)
                        console.info(dev)
                    }
                }

                if (dev.kind === 'videoinput') {
                    res.media.camera_list.push(dev)
                    console.info(dev)
                }
            }
            callback()
        });
    } catch (e) {
        alert('入会失败，请检测浏览器设置')
        res.conference.leave()
    }
}

let createConstraints = (videoSource, audioSource) => {

    let frameRate = 30
    let Constraints = {
        videoConstraints: null,
        audioConstraints: null
    }

    if (audioSource) {
        Constraints.audioConstraints = new Owt.Base.AudioTrackConstraints(audioSource)
    }

    if (videoSource) {
        Constraints.videoConstraints = new Owt.Base.VideoTrackConstraints(videoSource)
        if (res.isResolution) {
            Constraints.videoConstraints.resolution = new Owt.Base.Resolution(res.myResolution.width, res.myResolution.height)
            Constraints.videoConstraints.frameRate = frameRate
        }
    }
    console.info(Constraints)
    return Constraints
}

let createStreamSourceInfo = () => {

    let streamSourceInfo
    if (res.audioConstraintsForMic && res.videoConstraintsForCamera) {
        res.streamconstraints = new Owt.Base.StreamConstraints(res.audioConstraintsForMic, res.videoConstraintsForCamera)
        streamSourceInfo = new Owt.Base.StreamSourceInfo(Owt.Base.AudioSourceInfo.MIC, Owt.Base.VideoSourceInfo.CAMERA)
    } else if (res.videoConstraintsForCamera) {
        res.streamconstraints = new Owt.Base.StreamConstraints(false, res.videoConstraintsForCamera)
        streamSourceInfo = new Owt.Base.StreamSourceInfo(void 0, Owt.Base.VideoSourceInfo.CAMERA)
        res.avInfo.audio = false
    } else if (res.audioConstraintsForMic) {
        res.streamconstraints = new Owt.Base.StreamConstraints(res.audioConstraintsForMic, false)
        streamSourceInfo = new Owt.Base.StreamSourceInfo(Owt.Base.AudioSourceInfo.MIC, void 0)
        res.avInfo.video = false
    } else {
        res.avInfo.video = false
        res.avInfo.audio = false
    }
	console.log("streamSourceInfo",streamSourceInfo)
	
    return streamSourceInfo
}

let getDevice = () => {

    let device = {
        camera_deviceId: null,
        mac_deviceId: null
    }
    if (res.media.camera_list.length > 0) {
        device.camera_deviceId = res.media.camera_list[0].deviceId
    }
    if (res.media.mac_list.length > 0) {
        device.mac_deviceId = res.media.mac_list[0].deviceId
    }

    return device
}

let setStreamInfo = (device) => {
	
	console.log("设置流信息",device)
	
    if (device.camera_deviceId === 'forbidden') {
        let Constraints = createConstraints(null, null)
        res.videoConstraintsForCamera = Constraints.videoConstraints
        res.avInfo.video = false
    } else if (device.camera_deviceId) {
        let Constraints = createConstraints(Owt.Base.VideoSourceInfo.CAMERA, null)
        res.videoConstraintsForCamera = Constraints.videoConstraints
        res.videoConstraintsForCamera.deviceId = device.camera_deviceId
        res.avInfo.video = true
    }

    if (device.mac_deviceId) {
        let Constraints = createConstraints(null, Owt.Base.AudioSourceInfo.MIC)
        res.audioConstraintsForMic = Constraints.audioConstraints
        res.audioConstraintsForMic.deviceId = device.mac_deviceId
    }

    res.streamSourceInfo = createStreamSourceInfo()
}

let publish = (publication) => {
    // 这里判断外界传过来的is_audio_forbid 也就是默认静音状态
    // 如果是yes 则如果当前用户不是 主席， 都执行静音方法
    if (res.is_audio_forbid === 'yes' && res.role !== 'presenter') {
        let params = {
            track: 'audio'
        }
        mediaPaused(res.myRoom, res.selfId, params, () => {
        }, res.basePath)
    }

    res.publicationGlobal = publication
    _create.mixStream(res.myRoom, publication.id, function () {
        // 在加入房间的回调里面执行 整个方法回调
        res.cab(res.resp)
    }, res.basePath)

    publication.addEventListener('error', (err) => {
        console.error('Publication error: ' + err.error.message)
    })
}

let changeResolution = () => {
    try {
        // 在不支持修改分辨率的 异常的时候 重新加载 不设分辨率
        if (!res.isLocalVideoFiled) {
            // 如果是4：3摄像头使用该分辨率
            res.myResolution.width = 640
            res.myResolution.height = 360
            console.info("1080分辨率设置失败，使用最小分辨率:" + JSON.stringify(res.myResolution))
            createLoaclStream()
            res.isLocalVideoFiled = true
        }
    } catch (e) {
        console.error(e)
        res.isResolution = false
        createLoaclStream()
    }
}

let returnStream = (stream) => {
	console.log("returnstream",stream)
	res.localStreamsss = stream;
}

let createStream = () => {
	console.log("res.streamconstraints",res.streamconstraints)
    Owt.Base.MediaStreamFactory.createMediaStream(res.streamconstraints).then(stream => {
		
		console.log("stream",stream)
		returnStream(stream);
        res.localStream = new Owt.Base.LocalStream(stream, res.streamSourceInfo)
		console.log(res.localStream);
        console.log("$('#local-video')",$('#local-video').find("video").get(0));
		
		//console.log("res",this)
		
        $('#local-video').find("video").get(0).srcObject = stream
		console.log("$('#local-video')",$('#local-video').find("video").get(0));
		
        if (res.avInfo.video) {
            res.conference.publish(res.localStream, res.avInfo.pubOptions).then(publication => {
                publish(publication)
            })
        } else {
            res.conference.publish(res.localStream).then(publication => {
                publish(publication)
            })
        }
    }, err => {
        console.error(err)
        if (err.name === 'OverconstrainedError' || err.name === 'OverconstrainedErrornullnull') {
            changeResolution()
        } else if (res.isLocalVideoFiled) {
            console.warn("修改分辨率失败")
            res.isResolution = false
            createLoaclStream()
        } else {
            alert('暂无可用设备！')
            res.cab(res.resp)
        }
    })
}

let createLoaclStream = () => {
	console.log("创建本地流")
    setStreamInfo(getDevice())

    if (!res.avInfo.video && !res.avInfo.audio) {
        res.cab(res.resp)
    } else {
        createStream()
    }
}

res.createScreen = (cab, fail, fail2) => {

    let screenConstraints = createConstraints(Owt.Base.AudioSourceInfo.SCREENCAST, Owt.Base.VideoSourceInfo.SCREENCAST)

    console.info("window.screen.height:" + window.screen.height)
    console.info("window.screen.width:" + window.screen.width)
    //暂时使用最大分辨率，如果出现问题使用电脑分辨率
    if (window.screen.height && window.screen.width) {
        screenConstraints.videoConstraints.resolution = new Owt.Base.Resolution(window.screen.width, window.screen.height)
        //screenConstraints.videoConstraints.frameRate = 5
    }

    let screenStreamconstraints = new Owt.Base.StreamConstraints(screenConstraints.audioConstraints, screenConstraints.videoConstraints)
    screenStreamconstraints.extensionId = res.extensionId
    let screenstreamSourceInfo = new Owt.Base.StreamSourceInfo(Owt.Base.AudioSourceInfo.SCREENCAST, Owt.Base.AudioSourceInfo.SCREENCAST)
    //screenstreamSourceInfo.video.deviceId = 'screen-cast'
    Owt.Base.MediaStreamFactory.createMediaStream(screenStreamconstraints).then(screenStream => {
        console.info("屏幕共享:" + screenStream)
        res.screenStream = new Owt.Base.LocalStream(screenStream, screenstreamSourceInfo)
        $('video.screen').get(0).srcObject = screenStream
        res.conference.publish(res.screenStream, {codec: {name: 'vp9'}, maxBitrate: 1024}).then(screenPublish => {
            res.screenpubGlobal = screenPublish
            cab && cab(screenPublish)
            console.info(screenPublish)
        }).catch(fail2)
    }).catch(fail)
}

res.changeDevice = (camera_deviceId, mac_deviceId) => {

    res.publicationGlobal && res.publicationGlobal.stop()
    res.publicationGlobal = null

    let df = getDevice()
    let device = {
        camera_deviceId: camera_deviceId || df.camera_deviceId,
        mac_deviceId: mac_deviceId || df.mac_deviceId
    }

    setStreamInfo(device)
    createStream()
}

res.runSocketIOSample = function (opt, basePath, cab, vm) {

    try {
       _create.createToken(opt.room, opt.user, opt.role, opt.origin, function (response) {
            var token = JSON.parse(response).result.token
			
            res.conference.join(token).then(resp => {
				
				console.log("++++++++++++++++++++++",resp)
				
				
                res.resp = resp
                res.cab = cab
                res.basePath = basePath
                res.myRoom = opt.room
                res.is_audio_forbid = opt.is_audio_forbid
                res.role = opt.role
                res.selfId = resp.self.id
                // 加入房间后执行回调
                uni.setStorageSync('userInfo', JSON.stringify({
                    id: resp.self.id,
                    user_name: opt.name,
                    user_id: opt.user,
                    token: opt.token,
                    role: opt.role
                }))

                getMedia(() => {
                    createLoaclStream()
                })

            }, function (err) {
                console.error('server connection failed:', err)
                res.conference.leave()
            })
        }, basePath)
    } catch (e) {
        console.error('server createToken failed:', e)
        res.conference.leave()
    }
}
export default res

