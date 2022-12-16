// Copyright (c) 2014-19 hansen chow. All rights reserved.
const { createWorker } = Tesseract;
chrome.contextMenus.create({
	"title": "提取文本",
	"contexts": ["image"],
	"onclick": async function (info, tab) {
		console.log(info, tab)
		const worker = createWorker({
			workerPath: './worker.min.js',
			workerBlobURL: false,
			langPath: './lang-data',
			corePath: './tesseract-core.asm.js',
			logger: m => console.log(m),
		});
		try {
			await worker.load();
			await worker.loadLanguage('eng');
			await worker.initialize('eng');
			const {data} = await worker.recognize(info.srcUrl);
			console.log(data)
			copy(data.text, 'text/plain')
			notification(`验证码: ${data.text} ,如未复制到粘贴板请手动填写`, '成功')
			await worker.terminate();
		} catch (e) {
			console.error(e)
			notification(e.message || String(e), '失败')
		}
		// Tesseract.recognize(info.srcUrl, 'eng', {
		// 	workerPath: './worker.min.js',
		// 	workerBlobURL: false,
		// 	langPath: './lang-data',
		// 	corePath: './tesseract-core.asm.js',
		// 	logger: console.log,
		// }).then(({data}) => {
		// 	copy(data.text, 'text/plain')
		// 	notification(`验证码: ${data.text} ,如未复制到粘贴板请手动填写`, '成功')
		// }).catch(e => {
		// 	console.error(e)
		// 	notification(e.message || String(e), '失败')
		// })
	}
});
// 拷贝到剪贴板
function copy(str, mimeType) {
	document.oncopy = function (event) {
		event.clipboardData.setData(mimeType, str);
		event.preventDefault();
	};
	document.execCommand("copy", false, null);
}
// 插件图标点击
chrome.browserAction.onClicked.addListener(function (tab) {
	notification('请在需要解析的验证码图片点击右键选择”解析验证码“')
});
// 通知点击
chrome.notifications.onClicked.addListener(function (id) {
	chrome.notifications.clear(id)
});
// 创建通知
function notification(message, contextMessage = '') {
	chrome.notifications.getPermissionLevel(level => {
		if (level !== 'granted') {
			const msg = document.createElement('h1')
			msg.innerText = message
			document.body.append(msg)
		}
	})
	chrome.notifications.create('', {
		type: 'basic',
		title: '阿星提醒你',
		message,
		contextMessage,
		eventTime: 5000,
		iconUrl: 'icon48.png',
	})
}