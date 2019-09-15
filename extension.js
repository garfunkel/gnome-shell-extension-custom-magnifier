/**
 * MIT License
 *
 * Copyright (c) 2019 Simon Allen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const Meta = imports.gi.Meta
const Shell = imports.gi.Shell
const Main = imports.ui.main
const Gio = imports.gi.Gio;

const SETTINGS_SCHEMA = "org.gnome.desktop.a11y.magnifier";
const ACCEL_ZOOM_OUT = "<alt>KP_Subtract";
const ACCEL_ZOOM_IN = "<alt>KP_Add";
const MAG_FACTOR_MIN = 1.0;
const MAG_FACTOR_MAX = 16.0
const MAG_FACTOR_MULTIPLIER = 1.2

class Extension {
    constructor() {
        this.settings = new Gio.Settings({
            schema: SETTINGS_SCHEMA
        });

        this.actions = new Map();
    }

    zoomOut() {
        let magFactor = this.settings.get_double("mag-factor");

        if (magFactor > MAG_FACTOR_MIN) {
            this.settings.set_double("mag-factor", Math.max(MAG_FACTOR_MIN, magFactor / MAG_FACTOR_MULTIPLIER));
        }
    }

    zoomIn() {
        let magFactor = this.settings.get_double("mag-factor");

        if (magFactor < MAG_FACTOR_MAX) {
            this.settings.set_double("mag-factor", Math.min(MAG_FACTOR_MAX, magFactor * MAG_FACTOR_MULTIPLIER));
        }
    }

    enable() {
        this.accelHandler = global.display.connect(
            'accelerator-activated',
            (display, action, deviceId, timestamp) => {
                let actionValue = this.actions.get(action);

                if (actionValue) {
                    actionValue.callback();
                }
            }
        );

        let zoomOutAction = global.display.grab_accelerator(ACCEL_ZOOM_OUT, 0);
        let zoomInAction = global.display.grab_accelerator(ACCEL_ZOOM_IN, 0);

        if (zoomOutAction != Meta.KeyBindingAction.NONE) {
            let name = Meta.external_binding_name_for_action(zoomOutAction)

            Main.wm.allowKeybinding(name, Shell.ActionMode.ALL)

            this.actions.set(zoomOutAction, {
                name: name,
                accelerator: ACCEL_ZOOM_OUT,
                callback: this.zoomOut.bind(this),
                action: zoomOutAction
            })
        }

        if (zoomInAction != Meta.KeyBindingAction.NONE) {
            let name = Meta.external_binding_name_for_action(zoomInAction)

            Main.wm.allowKeybinding(name, Shell.ActionMode.ALL)

            this.actions.set(zoomInAction, {
                name: name,
                accelerator: ACCEL_ZOOM_IN,
                callback: this.zoomIn.bind(this),
                action: zoomInAction
            })
        }
    }

    disable() {
        global.display.disconnect(this.accelHandler);

        for (let iter of this.actions) {
            global.display.ungrab_accelerator(iter[1].action);
            Main.wm.allowKeybinding(iter[1].name, Shell.ActionMode.NONE)
        }
    }
}

function init() {
    return new Extension();
}
