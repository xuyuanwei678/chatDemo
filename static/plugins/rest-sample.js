// Copyright © 2018 Intel Corporation. All Rights Reserved.
// REST samples. It sends HTTP requests to sample server, and sample server sends requests to conference server.
// Both this file and sample server are samples.
export default {
	send(method, path, body, onRes, host) {
	    var req = new XMLHttpRequest()
	    req.onreadystatechange = function () {
	        if (req.readyState === 4) {
	            onRes(req.responseText);
	        }
	    };
	    let url = this.generateUrl(host, path);
	    req.open(method, url, true);
	    req.setRequestHeader('Content-Type', 'application/json');
	    if (body !== undefined) {
	        req.send(JSON.stringify(body));
	    } else {
	        req.send();
	    }
	},
	
	generateUrl(host, path) {
	    let url;
	    if (host !== undefined) {
	        url = host + path; // Use the host user set.
	    } else {
	        let index = document.URL.lastIndexOf('\/');
	        url = document.URL.substring(0, index) + path; // Get the string before last '/'.
	    }
	    return url;
	},
	
	onResponse(result) {
	    if (result) {
	        try {
	            console.info('Result:', JSON.parse(result));
	        } catch (e) {
	            console.info('Result:', result);
	        }
	    } else {
	        console.info('Null');
	    }
	},
	
	mixStream(room, stream, callbak, host) {
	    var cab = callbak || onResponse
	    this.send('PUT', '/meeting-control/meetings/' + room + '/streams/' + stream + '/mixed', {}, cab, host);
	},
	
	// 关闭音/视频
	mediaPaused(room, user, body, callback, host) {
	
	    this.send('PUT', '/meeting-control/meetings/' + room + '/users/' + user + '/paused', body, callback, host);
	},
	
	createToken(room, user, role,origin, callback, host) {
	    var body = {
	        user: user,
	        role: role,
	        origin:origin
	    };
	    this.send('POST', '/meeting-control/meetings/' + room + '/token', body, callback, host);
	}
	
}
