const sniffr = require('sniffr');

module.exports = {
	checkIfSame(object1, object2) {
		let level = 0;

		if (object1.ip && object2.ip) {
			if (object1.ip.value && object2.ip.value) {
				if (object1.ip.value == object2.ip.value) level += 2;
				if (object1.ip.value != object2.ip.value) level -= 3;
			}
		}

		if (object1.cookie && object2.cookie) {
			if (object1.cookie == object2.cookie) level += 100;
			if (object1.cookie != object2.cookie) level -= 1;
		}

		if (object1.os && object2.os) {
			if (object1.os.name && object2.os.name) {
				if (object1.os.name == object2.os.name) level += 3;
				if (object1.os.name != object2.os.name) level -= 3;

				if (object1.os.version && object2.os.version) {
					if (object1.os.version[0] == object2.os.version[0]) level += 2;
					if (object1.os.version[0] != object2.os.version[0]) level -= 2;

					if (object1.os.version == object2.os.version) level += 2;
					if (object1.os.version != object2.os.version) level -= 1;
				}
			}
		}

		if (object1.browser && object2.browser) {
			if (object1.browser.name && object2.browser.name) {
				if (object1.browser.name == object2.browser.name) level += 1;
				if (object1.browser.name != object2.browser.name) level -= 0.5;

				if (object1.browser.version && object2.browser.version) {
					if (object1.browser.version[0] == object2.browser.version[0]) level += 1;
					if (object1.browser.version[0] != object2.browser.version[0]) level -= 0.5;

					if (object1.browser.version == object2.browser.version) level += 1;
					if (object1.browser.version != object2.browser.version) level -= 0;
				}
			}
		}

		if (object1.device && object2.device) {
			if (object1.device.name && object2.device.name) {
				if (object1.deivce.name == object2.device.name) level += 1;
				if (object1.device.name != object2.device.name) level -= 4;
			}
		}

		return level;
	}
};
