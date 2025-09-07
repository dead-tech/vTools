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

function assignBackgroundColor(display, picker, slider) {
    const updater = () => {
        display.style.backgroundColor = picker.value;
        if (slider) {
            display.style.backgroundColor = `rgba(${spreadColorToString(picker.value)}, ${slider.value / 255})`
        }
    };

    updater();

    picker.addEventListener('input', updater);
    if (slider) {
        slider.addEventListener('input', updater);
    }
}

function assignTextColor(display, picker) {
    const updater = () => display.style.color = picker.value;
    updater();
    picker.addEventListener('input', updater);
}

function assignBorderColor(display, picker, slider) {
    const updateBorder = () => {
        const borderColorRgb = hexToRgb(picker.value);
        display.style.border =
            `4px solid rgba(${borderColorRgb.r}, ${borderColorRgb.g}, ${borderColorRgb.b}, ${slider.value})`;
    };

    updateBorder();

    picker.addEventListener('input', updateBorder);
    slider.addEventListener('input', updateBorder);
}

const PropertyType = Object.freeze({
    GroundLabelBackgroundColor: { colorKey: "Color_SelectedLabelFill_Gnd", opacityKey: "GroundLabel_Transparency_Bg" },
    GroundLabelBorderColor: { colorKey: "Color_SelectedLabelBorder_Gnd", opacityKey: "GroundLabel_Transparency_Bd"},
    DepartureColor:  "Color_Departure",
    ArrivalColor:  "Color_Arrival",
    RawVideoColor:  "Color_RawVideo",
});

function spreadColorToString(hexColor) {
    const color = hexToRgb(hexColor);
    return `${color.r}, ${color.g}, ${color.b}`;
}

function serializeColor(key, picker) {
    return `${key}=${spreadColorToString(picker.value)}\n`;
}

function serializeColorWithOpacity(key, picker, slider) {
    const { colorKey, opacityKey } = key;
    return serializeColor(colorKey, picker) + `${opacityKey}=${slider.value}\n`;
}

const PROPERTIES = [
    {
        type: PropertyType.GroundLabelBackgroundColor,
        display: document.querySelectorAll('#groundLabelFill'),
        picker: document.querySelector('#groundLabelFillPicker'),
        slider: document.querySelector('#groundLabelFillSlider'),
        onCreate: (displays, picker, slider) => displays.forEach((display) => assignBackgroundColor(display, picker, slider)),
        onSerialize: (type, picker, slider) => serializeColorWithOpacity(type, picker, slider),
    },
    {
        type: PropertyType.GroundLabelBorderColor,
        display: document.querySelectorAll('#groundLabelFill'),
        picker: document.querySelector('#groundLabelBorderPicker'),
        slider: document.querySelector('#groundLabelBorderSlider'),
        onCreate: (displays, picker, slider) => displays.forEach((display) => assignBorderColor(display, picker, slider)),
        onSerialize: (type, picker, slider) => serializeColorWithOpacity(type, picker, slider),
    },
    {
        type: PropertyType.DepartureColor,
        display: document.querySelector('#departureLabel'),
        picker: document.querySelector('#departureTextColor'),
        onCreate: (display, picker) => assignTextColor(display, picker),
        onSerialize: (type, picker) => serializeColor(type, picker),
    },
    {
        type: PropertyType.ArrivalColor,
        display: document.querySelector('#arrivalLabel'),
        picker: document.querySelector('#arrivalTextColor'),
        onCreate: (display, picker) => assignTextColor(display, picker),
        onSerialize: (type, picker) => serializeColor(type, picker),
    },
    {
        type: PropertyType.RawVideoColor,
        picker: document.querySelector('#rawVideoColor'),
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

function getEnumKeyFromValue(enumObject, value) {
    return Object.keys(enumObject).find(key => enumObject[key] === value);
}

function exportConfig() {
    let text = "";

    for (const property of PROPERTIES) {
        text += property.onSerialize(property.type, property.picker, property.slider);
    }

    Object.keys(SettingsType).forEach((key) => {
        text += `${SettingsType[key]}=${settings[key] ? 1 : 0}\n`;
    })

    return text;
}

function capitalizeStr(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function main() {
    for (const property of PROPERTIES) {
        if (property.onCreate) {
            property.onCreate(property.display, property.picker, property.slider);
        }
    }

    const saveButton = document.querySelector('#saveButton');
    saveButton.addEventListener('click', () => {
        Object.keys(settings).forEach((settingName) => {
            const checkboxId = `#enable${capitalizeStr(settingName)}`;
            const checkbox = document.querySelector(checkboxId);
            settings[settingName] = checkbox.checked;
        });

        const content = exportConfig();
        const blob = new Blob([content], { type: 'text/plain'});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'GRPluginSettingsLocal.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}


window.onload = main;