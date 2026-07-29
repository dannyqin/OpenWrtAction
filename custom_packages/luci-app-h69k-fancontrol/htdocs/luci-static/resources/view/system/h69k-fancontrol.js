'use strict';
'require view';
'require form';
'require fs';
'require poll';
'require ui';
'require uci';

function readStatus() {
	return L.resolveDefault(
		fs.exec_direct('/usr/sbin/h69k-fancontrol', [ 'status' ], 'json'),
		{}
	);
}

function statusValue(value, suffix, unavailable) {
	if (value === null || value === undefined)
		return unavailable;
	return String(value) + (suffix || '');
}

return view.extend({
	load: function() {
		return Promise.all([ uci.load('h69k-fancontrol'), readStatus() ]);
	},

	handleSaveApply: function(ev) {
		return this.handleSave(ev)
			.then(function() { return ui.changes.apply(); })
			.then(function() {
				return fs.exec_direct('/etc/init.d/h69k-fancontrol', [ 'restart' ]);
			})
			.then(function() {
				ui.hideModal();
				window.location.reload();
			})
			.catch(function(err) {
				ui.hideModal();
				ui.addNotification(null, E('p', _('Failed to save settings or restart the fan controller: %s').format(err.message)));
			});
	},

	render: function(data) {
		var status = data[1] || {};
		var m = new form.Map(
			'h69k-fancontrol',
			_('H69K Fan Control'),
			_('Configure automatic temperature steps, manual PWM, full speed and forced fan shutdown. Real RPM is shown only when the board and fan expose a tachometer signal.')
		);

		var statusSection = m.section(form.TypedSection, '_status', _('Current status'));
		statusSection.anonymous = true;
		statusSection.render = function() {
			var table = E('table', { 'class': 'table' }, [
				E('tr', {}, [ E('td', {}, _('Controller')), E('td', { 'id': 'fan-running' }, status.running ? _('Running') : _('Stopped')) ]),
				E('tr', {}, [ E('td', {}, _('CPU temperature')), E('td', { 'id': 'fan-temperature' }, statusValue(status.temperature, ' °C', _('Unavailable'))) ]),
				E('tr', {}, [ E('td', {}, _('PWM output')), E('td', { 'id': 'fan-pwm' }, statusValue(status.pwm_percent, '%', _('Unavailable'))) ]),
				E('tr', {}, [ E('td', {}, _('Fan speed')), E('td', { 'id': 'fan-rpm' }, statusValue(status.rpm, ' RPM', _('No tachometer signal'))) ]),
				E('tr', {}, [ E('td', {}, _('Hardware driver')), E('td', { 'id': 'fan-hwmon' }, status.hwmon || _('Not detected')) ])
			]);

			poll.add(function() {
				return readStatus().then(function(s) {
					var node;
					node = document.getElementById('fan-running');
					if (node) node.textContent = s.running ? _('Running') : _('Stopped');
					node = document.getElementById('fan-temperature');
					if (node) node.textContent = statusValue(s.temperature, ' °C', _('Unavailable'));
					node = document.getElementById('fan-pwm');
					if (node) node.textContent = statusValue(s.pwm_percent, '%', _('Unavailable'));
					node = document.getElementById('fan-rpm');
					if (node) node.textContent = statusValue(s.rpm, ' RPM', _('No tachometer signal'));
					node = document.getElementById('fan-hwmon');
					if (node) node.textContent = s.hwmon || _('Not detected');
				});
			}, 3);

			return E('div', { 'class': 'cbi-section' }, [ table ]);
		};

		var s = m.section(form.NamedSection, 'main', 'fan', _('Operating mode'));
		s.anonymous = true;

		var o = s.option(form.Flag, 'enabled', _('Enable controller'));
		o.default = '1';
		o.rmempty = false;

		o = s.option(form.ListValue, 'mode', _('Mode'));
		o.value('auto', _('Automatic temperature control'));
		o.value('manual', _('Manual PWM'));
		o.value('full', _('Full speed'));
		o.value('off', _('Force fan off'));
		o.default = 'auto';
		o.rmempty = false;
		o.description = _('Force fan off may cause overheating. With safety protection enabled, the fan will still run at full speed after the critical temperature is reached.');

		o = s.option(form.Value, 'manual_pwm', _('Manual PWM'));
		o.datatype = 'range(0,100)';
		o.default = '50';
		o.placeholder = '50';
		o.depends('mode', 'manual');
		o.description = _('PWM duty cycle from 0 to 100 percent.');

		o = s.option(form.Value, 'poll_interval', _('Polling interval'));
		o.datatype = 'range(1,30)';
		o.default = '3';
		o.placeholder = '3';
		o.description = _('Temperature sampling interval in seconds.');

		o = s.option(form.Value, 'hysteresis', _('Hysteresis'));
		o.datatype = 'range(0,20)';
		o.default = '2';
		o.placeholder = '2';
		o.description = _('Temperature must fall by this many degrees before switching to a lower fan step.');

		var curve = m.section(form.NamedSection, 'main', 'fan', _('Automatic temperature curve'));
		curve.anonymous = true;

		function addStep(index, defaultTemp, defaultPwm) {
			var temp = curve.option(form.Value, 'temp' + index, _('Step %d temperature').format(index));
			temp.datatype = 'range(20,100)';
			temp.default = String(defaultTemp);
			temp.rmempty = false;
			temp.description = _('Temperature in degrees Celsius.');

			var pwm = curve.option(form.Value, 'pwm' + index, _('Step %d PWM').format(index));
			pwm.datatype = 'range(0,100)';
			pwm.default = String(defaultPwm);
			pwm.rmempty = false;
			pwm.description = _('PWM duty cycle from 0 to 100 percent.');
		}

		addStep(1, 40, 39);
		addStep(2, 50, 59);
		addStep(3, 60, 78);
		addStep(4, 70, 100);

		var safety = m.section(form.NamedSection, 'main', 'fan', _('Safety protection'));
		safety.anonymous = true;

		o = safety.option(form.Flag, 'safety_enabled', _('Critical-temperature override'));
		o.default = '1';
		o.rmempty = false;
		o.description = _('Run the fan at full speed at the critical temperature, including when Force fan off is selected.');

		o = safety.option(form.Value, 'critical_temp', _('Critical temperature'));
		o.datatype = 'range(60,120)';
		o.default = '85';
		o.placeholder = '85';
		o.depends('safety_enabled', '1');

		o = safety.option(form.Flag, 'fail_safe', _('Temperature-sensor fail-safe'));
		o.default = '1';
		o.rmempty = false;
		o.description = _('Run the fan at full speed if the CPU temperature cannot be read.');

		return m.render();
	}
});
