var socket = io.connect('http://localhost:8080');
			
socket.on('update', function (data) {
	console.log(data);
	switch(data.type) {
		case 'refresh':
			reload();
		break;
		case 'css':
			reloadStylesheets();
		break;
	}
});

function reload() {
	location.reload(true);
}

function reloadStylesheets() {
	var queryString = '?reload=' + new Date().getTime();
	$('link[rel="stylesheet"]').each(function () {
		this.href = this.href.replace(/\?.*|$/, queryString);
	});
}