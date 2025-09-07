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
            display.style.opacity = slider.value / 255;
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

function spreadColorToString(color) {
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
        display: document.querySelector('#rawVideo'),
        picker: document.querySelector('#rawVideoColor'),
        onCreate: (display, picker) => assignBackgroundColor(display, picker),
        onSerialize: (type, picker) => serializeColor(type, picker),
    },
];

function getEnumKeyFromValue(enumObject, value) {
    return Object.keys(enumObject).find(key => enumObject[key] === value);
}

function exportConfig() {
    let text = "";
    for (const property of PROPERTIES) {
        text += property.onSerialize(property.type, property.picker, property.slider);
    }

    return text;
}

function main() {
    for (const property of PROPERTIES) {
        property.onCreate(property.display, property.picker, property.slider);
    }

    const textArea = document.querySelector('#outputConfig');

    const saveButton = document.querySelector('#saveButton');
    saveButton.addEventListener('click', () => {
        textArea.value = exportConfig();
    });

    const copyButton = document.querySelector('#copyButton');
    copyButton.addEventListener('click', () => {
        navigator.clipboard.writeText(textArea.value);
    });

}


window.onload = main;