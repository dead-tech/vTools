function hexToRgb(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return { r: (c>>16)&255, g: (c>>8)&255, b: c&255 };
    }
    throw new Error('Bad Hex');
}

function spreadColorToString(hexColor) {
    const color = hexToRgb(hexColor);
    return `${color.r},${color.g},${color.b}`;
}

function capitalizeStr(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const StyleProperty = Object.freeze({
    BackgroundColor: "background-color",
    TextColor: "color",
    SvgFill: "fill",
    Border: "border",
});

function assignStyleProperty(display, picker, styleProperty, slider) {
    const updater = () => {
        const color = picker.value;
        switch (styleProperty) {
            case StyleProperty.BackgroundColor: {
                display.style.backgroundColor = slider
                    ? `rgba(${spreadColorToString(color)}, ${slider.value / 255})`
                    : color;
                break;
            }
            case StyleProperty.TextColor: {
                display.style.color = color;
                break;
            }
            case StyleProperty.SvgFill: {
                display.style.fill = color;
                break;
            }
            case StyleProperty.Border: {
                const borderColorRgb = hexToRgb(color);
                display.style.border = `4px solid rgba(${borderColorRgb.r}, ${borderColorRgb.g}, ${borderColorRgb.b}, ${slider.value / 255}`;
                break;
            }
            default: {
                console.warn(`Unhandled stlye property: ${styleProperty}`);
                break;
            }
        }
    };

    updater();
    picker.addEventListener('input', updater);
    if (slider) {
        slider.addEventListener('input', updater);
    }
}

const PropertyType = Object.freeze({
    GroundLabelBackgroundColor: { color: "Color_SelectedLabelFill_Gnd", opacity: "GroundLabel_Transparency_Bg" },
    GroundLabelBorderColor: { color: "Color_SelectedLabelBorder_Gnd", opacity: "GroundLabel_Transparency_Bd"},
    DepartureColor:  "Color_Departure",
    ArrivalColor:  "Color_Arrival",
    RawVideoColor:  "Color_RawVideo",
    CautionColorBg: "Color_Caution",
    CautionColorFg: "Color_CautionText",
    WarningColorBg: "Color_Warning",
    WarningColorFg: "Color_WarningText",
});

function serializeColor(key, picker, slider) {
    if (slider) {
        return `${key.color}=${spreadColorToString(picker.value)}\n`
            + `${key.opacity}=${slider.value}\n`;
    }
    return `${key}=${spreadColorToString(picker.value)}\n`;
}

const PROPERTIES = [
    {
        type: PropertyType.GroundLabelBackgroundColor,
        display: document.querySelectorAll('#groundLabelFill'),
        picker: document.querySelector('#groundLabelFillPicker'),
        slider: document.querySelector('#groundLabelFillSlider'),
        onCreate: (displays, picker, slider) => displays.forEach((display) => assignStyleProperty(display, picker, StyleProperty.BackgroundColor, slider)),
        onSerialize: (type, picker, slider) => serializeColor(type, picker, slider),
    },
    {
        type: PropertyType.GroundLabelBorderColor,
        display: document.querySelectorAll('#groundLabelFill'),
        picker: document.querySelector('#groundLabelBorderPicker'),
        slider: document.querySelector('#groundLabelBorderSlider'),
        onCreate: (displays, picker, slider) => displays.forEach((display) => assignStyleProperty(display, picker, StyleProperty.Border, slider)),
        onSerialize: (type, picker, slider) => serializeColor(type, picker, slider),
    },
    {
        type: PropertyType.DepartureColor,
        display: document.querySelector('#departureLabel'),
        picker: document.querySelector('#departureTextColor'),
        onCreate: (display, picker) => assignStyleProperty(display, picker, StyleProperty.TextColor),
        onSerialize: (type, picker) => serializeColor(type, picker),
    },
    {
        type: PropertyType.ArrivalColor,
        display: document.querySelector('#arrivalLabel'),
        picker: document.querySelector('#arrivalTextColor'),
        onCreate: (display, picker) => assignStyleProperty(display, picker, StyleProperty.TextColor),
        onSerialize: (type, picker) => serializeColor(type, picker),
    },
    {
        type: PropertyType.RawVideoColor,
        display: document.querySelector('#rawVideo'),
        picker: document.querySelector('#rawVideoColor'),
        onCreate: (display, picker) => assignStyleProperty(display, picker, StyleProperty.SvgFill),
        onSerialize: (type, picker) => serializeColor(type, picker),
    },
    {
        type: PropertyType.CautionColorBg,
        display: document.querySelector('#noTaxiClearance'),
        picker: document.querySelector('#cautionColorBg'),
        onCreate: (display, picker) => assignStyleProperty(display, picker, StyleProperty.BackgroundColor),
        onSerialize: (type, picker) => serializeColor(type, picker),
    },
    {
        type: PropertyType.CautionColorFg,
        display: document.querySelector('#noTaxiClearance'),
        picker: document.querySelector('#cautionColorFg'),
        onCreate: (display, picker) => assignStyleProperty(display, picker, StyleProperty.TextColor),
        onSerialize: (type, picker) => serializeColor(type, picker),
    },
    {
        type: PropertyType.WarningColorBg,
        display: document.querySelector('#noTakeOffClearance'),
        picker: document.querySelector('#warningColorBg'),
        onCreate: (display, picker) => assignStyleProperty(display, picker, StyleProperty.BackgroundColor),
        onSerialize: (type, picker) => serializeColor(type, picker),
    },
    {
        type: PropertyType.WarningColorFg,
        display: document.querySelector('#noTakeOffClearance'),
        picker: document.querySelector('#warningColorFg'),
        onCreate: (display, picker) => assignStyleProperty(display, picker, StyleProperty.TextColor),
        onSerialize: (type, picker) => serializeColor(type, picker),
    },
];

const SettingsType = Object.freeze({
    rawVideo: "RawVideo",
    proMode: "Equip_ProMode",
    trackHeadingLine: "Track_Heading_Line",
});

let settings = {
    rawVideo: false,
    proMode: false,
    trackHeadingLine: false,
};


function exportConfig() {
    const propertiesConfig = PROPERTIES
        .map(({type: type, picker: picker, slider: slider, onSerialize: serialize }) => serialize(type, picker, slider))
        .join('');

    const settingsConfig = Object.keys(SettingsType)
        .map(key => `${SettingsType[key]}=${settings[key] ? 1 : 0}`).join('\n');

    return propertiesConfig + settingsConfig;
}

function updateSettings() {
    Object.keys(settings).forEach((settingName) => {
        const checkboxId = `#enable${capitalizeStr(settingName)}`;
        const checkbox = document.querySelector(checkboxId);
        settings[settingName] = checkbox.checked;
    });
}

function downloadConfigFile() {
    const content = exportConfig();
    const blob = new Blob([content], { type: 'text/plain'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'GRPluginSettingsLocal.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function main() {
    for (const property of PROPERTIES) {
        if (property.onCreate) {
            property.onCreate(property.display, property.picker, property.slider);
        }
    }

    const saveButton = document.querySelector('#saveButton');
    saveButton.addEventListener('click', () => {
        updateSettings();
        downloadConfigFile();
    });
}

window.onload = main;