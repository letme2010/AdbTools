var APK_PATH = 'D:\\UCWorkspace\\97c5\\BrowserShell\\platform\\android\\bin\\97c5.apk';
//var APK_PATH = '/Users/chenzhipeng/Downloads/uc.apk';

/*

var exec = require('child_process').exec;

exec('adb devices', function(error, stdout, stderr) {

	var lines = stdout.split('\n');

	for ( var i = 1; i < lines.length; i++) {
		var line = lines[i].trim();
		if (0 == line.length) {
			continue;
		}

		var devicesSn = line.split('device')[0];
//		Log.i(devicesSn);
		installAPK(devicesSn, true);

	}

});
*/

var DATA_KEY = {
	DEVICE_WRAP : "DEVICE_WRAP"
};

function isMocking() {

	try{
		require;
		return false;
	} catch(e) {
		return true;
	}

}

var DEVICE_MOCK_LIST = ["192.168.56.101:5555", "192.168.56.102:5555", "ADKEK33K2K1K1KFF"];

function getSelectedDevicesList(aCallback) {
	if (aCallback) {

	}
}

function getDevicesList(aCallback) {

	if (aCallback) {

		if (isMocking()) {

			aCallback(DEVICE_MOCK_LIST);

		} else {

			var exec = require('child_process').exec;

			exec('adb devices', function(error, stdout, stderr) {

			var lines = stdout.split('\n');

			var ret = [];

			for ( var i = 1; i < lines.length; i++) {

				var line = lines[i].trim();

				if (0 == line.length) {
					continue;
				}

				var devicesSn = line.split('device')[0];

				ret.push(devicesSn);

			};

			aCallback(ret);

			});

		}

	}
}

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
					+ 'shell am start com.UCMobile/.main.UCMobile',
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

var VIEW_ID = {
	DEVICES_LIST_VIEW_ID : "device_list_view",
	TERMINAL_ID : 'terminal',
	CONSOLR_ID : 'console'
};

var CONFIG = {
	DEVICES_CHECK_INTERVAL : 1000

};

function getDevicesListView() {
	return $('#' + VIEW_ID.DEVICES_LIST_VIEW_ID);
}

function createDeviceBlock(aDeviceWrap) {
	var _jqRet = $('<div class="deivce_block"></div>');

	var _jqCheckBox = $('<input type="checkbox">');
	var _jqDeviceSn = $('<span/>');

	_jqDeviceSn.html(aDeviceWrap.mDeviceSn);
	_jqCheckBox[0].checked = aDeviceWrap.mChecked;

	_jqRet.append(_jqCheckBox);
	_jqRet.append(_jqDeviceSn);

	_jqRet.click(function(){

		// Log.i("checkd:" + _jqCheckBox[0].checked);

		var _isChecked = !_jqCheckBox[0].checked;
		_jqCheckBox[0].checked = _isChecked;
		if (_isChecked) {
			gCheckedDeviceSnList.push(aDeviceWrap.mDeviceSn);
		} else {
			gCheckedDeviceSnList.remove(aDeviceWrap.mDeviceSn);
		}

	});

	return _jqRet;
}

Array.prototype.contains = function(aObj) {

	if (!aObj) {
		return false;
	}

	for (var i = 0; i < this.length; i++) {

		if ((undefined != aObj.equals) && (undefined != this[i].equals)) {
			return this[i].equals(aObj);
		} else if (aObj == this[i]) {
			return true;
		}

	}
	return false;
};

Array.prototype.remove = function(aObj) {
	if (!aObj) {
		return false;
	}

	for (var i = 0; i < this.length; i++) {

		if ((undefined != aObj.equals) && (undefined != this[i].equals)) {
			this.splice(i,1);
			return true;
		} else if (aObj == this[i]) {
			this.splice(i,1);
			return true;
		}

	}
	return false;
}

var gDeviceWrapList = [];

function DeviceWrap(aDeviceSn) {
	this.mDeviceSn = aDeviceSn;
	this.mChecked = true;

	this.equals = function(aDeviceWrap) {
		if (null == aDeviceWrap) {
			return false;
		}
		return (this.mDeviceSn == aDeviceWrap.mDeviceSn);
	};

	this.toString = function() {
		return {
			deviceSn : this.mDeviceSn,
			checked : this.mChecked
		}.toString();
	}
}

function addDevice(aDeviceWrap) {

	if (gDeviceWrapList.contains(aDeviceWrap)) {
		return;
	}

	gDeviceWrapList.push(aDeviceWrap);
}

function removeDevice(aDeviceWrap) {
	if (gDeviceWrapList.contains(aDeviceWrap)) {
		gDeviceWrapList.remove(aDeviceWrap);
	}
}

function clearDevice() {
	gDeviceWrapList = [];
}

function getTerminal() {
	return $('#' + VIEW_ID.TERMINAL_ID);
}

function getConsole() {
	return $('#' + VIEW_ID.CONSOLR_ID);
}

function log(aMsg) {

	var _jqRet = $('<div></div>');
	var _jqTime = $('<pre class="time_span"></pre>');
	var _jqMsg = $('<pre class="log_span"></pre>');

	_jqTime.html(new Date().toString());
	_jqMsg.html(aMsg);

	_jqRet.append(_jqTime);
	_jqRet.append(_jqMsg);

	getConsole().append(_jqRet);

}

function onSendCommandButtonClick() {
	var text = getTerminal()[0].value.trim();

	if (0 >= text.length) {
		return;
	}

	if (0 == text.indexOf('adb')) {
		getSelectedDevicesList(function(aList){
			for (var i = 0; i < aList.length; i++){
				var cmd = text.replace('adb', 'adb -s ' + aList[i]);
				executeCommand(cmd, function(aMsg){
					log(aMsg);
				});
			}
		});
	} else {

		try{
			executeCommand(text, function(aMsg){
				log(aMsg);
			});
		}catch(e) {
			log(e);
		}

	}

	afterSendCommand();
}

function afterSendCommand(){
	getTerminal()[0].value = "";
}

function executeCommand(aCmd, aCallback) {
	var exec = require('child_process').exec;

	exec(aCmd, function(error, stdout, stderr) {

		if (aCallback) {
			if (error) {
				aCallback(stderr);
			} else {
				aCallback(stdout);
			}
		}

	});
}

var gCheckedDeviceSnList = [];

function queryCheckedStatus(aDeviceSn) {
	return gCheckedDeviceSnList.contains(aDeviceSn);	
}

function notifyDeviceListChanged() {

	getDevicesListView().empty();

	for (var i = 0, len = gDeviceWrapList.length; i < len; i++) {
		var deviceWrap = gDeviceWrapList[i];
		deviceWrap.mChecked = queryCheckedStatus(deviceWrap.mDeviceSn);
		var _jqDeviceBlock = createDeviceBlock(deviceWrap);
		getDevicesListView().append(_jqDeviceBlock);
	}
}

function testDeviceRemoved() {
	DEVICE_MOCK_LIST.pop();
}

function testDeviceAdded() {
	DEVICE_MOCK_LIST.push("localhost:9527");
}

function main() {

	$('#' + VIEW_ID.TERMINAL_ID).bind('keydown', 'enter', function(ev){
		if (ev.ctrlKey && (13 == ev.keyCode)) {
			onSendCommandButtonClick();
		}
	});


	setInterval(function(){

		getDevicesList(function(list){

			clearDevice();
			notifyDeviceListChanged();

			for (var i = 0, len = list.length; i < len; i++) {
				var deviceWrap = new DeviceWrap(list[i]);
				addDevice(deviceWrap);
			}
			notifyDeviceListChanged();

		});

	 }, CONFIG.DEVICES_CHECK_INTERVAL);

}
