function getSettings() {
	let GioSSS = imports.gi.Gio.SettingsSchemaSource;
	let schemaSource = GioSSS.new_from_directory(imports.misc.extensionUtils.getCurrentExtension().dir.get_child("schemas").get_path(), GioSSS.get_default(), false);
	let schemaObj = schemaSource.lookup("org.gnome.shell.extensions.custommagnifier", true);

	if (!schemaObj) {
		throw new Error("cannot find schema");
	}

	return new imports.gi.Gio.Settings({settings_schema: schemaObj});
}

function getZoomSettings() {
	return new imports.gi.Gio.Settings({
		schema: "org.gnome.desktop.a11y.magnifier"
	});
}

function enable() {
	let mode = imports.gi.Shell.ActionMode.ALL;
	let flag = imports.gi.Meta.KeyBindingFlags.NONE;
	let settings = getSettings();
	let zoomSettings = getZoomSettings();
	let zoomMin = settings.get_double("zoom-min");
	let zoomMax = settings.get_double("zoom-max");
	let zoomMultiplier = settings.get_double("zoom-multiplier");

	imports.ui.main.wm.addKeybinding("zoom-out", settings, flag, mode, () => {
		let zoomFactor = zoomSettings.get_double("mag-factor");

		if (zoomFactor > zoomMin) {
			zoomSettings.set_double("mag-factor", Math.max(zoomMin, zoomFactor / zoomMultiplier));
		}
	});

	imports.ui.main.wm.addKeybinding("zoom-in", settings, flag, mode, () => {
		let zoomFactor = zoomSettings.get_double("mag-factor");

		if (zoomFactor < zoomMax) {
			zoomSettings.set_double("mag-factor", Math.min(zoomMax, zoomFactor * zoomMultiplier));
		}
	});
}

function disable() {
	imports.ui.main.wm.removeKeybinding("zoom-out");
	imports.ui.main.wm.removeKeybinding("zoom-in");
}
