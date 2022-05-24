// Copyright (c) 2014-19 hansen chow. All rights reserved.
chrome.contextMenus.create({
	"title": "解析验证码",
	"contexts": ["image"],
	"onclick": function (info, tab) {
		// console.log(info, tab)
		// http://www.bhshare.cn/test.png
		// 6e0c1fde3
		getImg(info.srcUrl).then(base64 => {
			return fetch("http://www.bhshare.cn/imgcode/", {
				"headers": {
					"accept": "application/json, text/javascript, */*; q=0.01",
					"accept-language": "zh-CN,zh;q=0.9",
					"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
					"x-requested-with": "XMLHttpRequest"
				},
				"body": "token=free&type=online&uri=" + encodeURIComponent(base64),
				"method": "POST"
			})
		})
		.then(response => response.json())
		.then(res => {
			console.log(res)
			if (res.code === 200) {
				copy(res.data, 'text/plain')
				notification(`验证码: ${res.data} ,如未复制到粘贴板请手动填写`, '成功')
			} else {
				notification(res.msg, '失败')
			}
		})
		.catch(error => {
			notification(error, '失败')
		})
	}
});
function copy(str, mimeType) {
	document.oncopy = function (event) {
		event.clipboardData.setData(mimeType, str);
		event.preventDefault();
	};
	document.execCommand("copy", false, null);
}

function getImg(src) {
	return new Promise((resolve, reject) => {
		fetch(src, {
			method: 'get',
			responseType: 'arraybuffer'
		}).then(res => {
			return res.arrayBuffer();
		}).then(arraybuffer => {
			console.log(arraybuffer);
			resolve(arrayBufferToBase64Img(arraybuffer))
		}).catch(e => {
			reject(e)
		})
	})
}
function arrayBufferToBase64Img(buffer) {
  const str = String.fromCharCode(...new Uint8Array(buffer));
  return `data:image/jpeg;base64,${window.btoa(str)}`;
}

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function (tab) {
	notification('请在需要解析的验证码图片点击右键选择”解析验证码“')
});
function notification(message, title = '') {
	chrome.notifications.create(null, {
		type: 'basic',
		title,
		message,
		// contextMessage: '',
		eventTime: 3000,
		iconUrl: 'icon48.png',
	})
}
