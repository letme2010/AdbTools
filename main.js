var APK_PATH = '/Users/chenzhipeng/Documents/workspace_eclipse/ThinkInDraw/bin/ThinkInDraw.apk';
//var APK_PATH = '/Users/chenzhipeng/Downloads/uc.apk';

var exec = require('child_process').exec;

exec('adb devices', function(error, stdout, stderr) {

	var lines = stdout.split('\n');

	for ( var i = 1; i < lines.length; i++) {
		var line = lines[i];
		if (0 == line.length) {
			continue;
		}

		var devicesSn = line.split('device')[0];
//		Log.i(devicesSn);
		installAPK(devicesSn, true);

	}

});

function installAPK(aDeviceSn, aStartAfterInstall) {

	var exec = require('child_process').exec;
	Log.i("install start " + aDeviceSn);
	exec('adb -s ' + aDeviceSn + ' install -r ' + APK_PATH, function(error,
			stdout, stderr) {

		if (error) {
			Log.i(aDeviceSn + " install apk stderr:" + stderr);
			return;
		}

		Log.i(stdout);

		if (aStartAfterInstall) {
			exec('adb -s ' + aDeviceSn
					+ 'shell am start com.example.thinkindraw/.MainActivity',
					function() {
					});
		}
		
		Log.i("install finsh " + aDeviceSn);

	});

}

var Log = {

	i : function(aMsg) {
		console.log(aMsg);
	}

};
