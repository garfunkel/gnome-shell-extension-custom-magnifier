import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import Gio from 'gi://Gio';
import Shell from "gi://Shell";
import Meta from "gi://Meta";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

export default class CustomMagnifier extends Extension {
	getZoomSettings() {
		return new Gio.Settings({
			schema: "org.gnome.desktop.a11y.magnifier"
		});
	}

	enable() {
		this._zoomSettings = this.getZoomSettings();
		this._settings = this.getSettings();
		this._zoomMin = this._settings.get_double("zoom-min");
		this._zoomMax = this._settings.get_double("zoom-max");
		this._zoomMultiplier = this._settings.get_double("zoom-multiplier");

		Main.wm.addKeybinding("zoom-out", this._settings, Meta.KeyBindingFlags.NONE, Shell.ActionMode.ALL, this._zoomOut.bind(this));
		Main.wm.addKeybinding("zoom-in", this._settings, Meta.KeyBindingFlags.NONE, Shell.ActionMode.ALL, this._zoomIn.bind(this));
	}

	_zoomOut() {
		let zoomFactor = this._zoomSettings.get_double("mag-factor");

		if (zoomFactor > this._zoomMin) {
			this._zoomSettings.set_double("mag-factor", Math.max(this._zoomMin, zoomFactor / this._zoomMultiplier));
		}
	}

	_zoomIn() {
		let zoomFactor = this._zoomSettings.get_double("mag-factor");

		if (zoomFactor < this._zoomMax) {
			this._zoomSettings.set_double("mag-factor", Math.min(this._zoomMax, zoomFactor * this._zoomMultiplier));
		}
	}

	disable() {
		Main.wm.removeKeybinding("zoom-out");
		Main.wm.removeKeybinding("zoom-in");

		this._zoomSettings = null;
		this._settings = null;
		this._zoomMin = null;
		this._zoomMax = null;
		this._zoomMultiplier = null;
	}
}
