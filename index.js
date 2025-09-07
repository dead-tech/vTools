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

function getColorFromPickerSlider(propertyName) {
    const picker = document.querySelector(`${propertyName}Picker`);
    const slider = document.querySelector(`${propertyName}Slider`);
    return { ...hexToRgb(picker.value), a: slider.value };
}

function groundLabelFill(propertyName) {
    document.querySelectorAll(propertyName).forEach((display) => {
        const picker = document.querySelector(`${propertyName}Picker`);
        const slider = document.querySelector(`${propertyName}Slider`);
        assignBackgroundColor(display, picker, slider);
    })
}

function assignBackgroundColor(display, picker, slider) {
    const selectedColor = picker.value;
    display.style.backgroundColor = selectedColor;

    picker.addEventListener('input', () => {
        const selectedColor = picker.value;
        display.style.backgroundColor = selectedColor;
    });

    if (slider !== null) {
        const selectedOpacity = slider.value;
        display.style.opacity = selectedOpacity / 255;

        slider.addEventListener('input', () => {
            const selectedOpacity = slider.value;
            display.style.opacity = selectedOpacity / 255;
        });
    }
}

function dumpGroundLabelFill(propertyName) {
    let text = "";
    const color = getColorFromPickerSlider(propertyName);
    text += `Color_SelectedLabelFill_Gnd=${color.r},${color.g},${color.b}\n`;
    text += `GroundLabel_Transparency_Bg=${color.a}\n`;
    return text;
}

function groundLabelBorder(propertyName) {
    document.querySelectorAll('#groundLabelFill').forEach((display) => {
        const picker = document.querySelector(`${propertyName}Picker`);
        const slider = document.querySelector(`${propertyName}Slider`);
        assignBorderColor(display, picker, slider);
    });
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

function dumpGroundLabelBorder(propertyName) {
    let text = "";
    const color = getColorFromPickerSlider(propertyName);
    text += `Color_SelectedLabelBorder_Gnd=${color.r},${color.g},${color.b}\n`;
    text += `GroundLabel_Transparency_Bd=${color.a}\n`;
    return text;
}

function departureTextColor(propertyName) {
    const display = document.querySelector('#departureLabel');
    const picker = document.querySelector(propertyName);
    assignTextColor(display, picker);
}

function assignTextColor(display, picker) {
    display.style.color = picker.value;
    picker.addEventListener('input', () => display.style.color = picker.value);
}

function arrivalTextColor(propertyName) {
    const display = document.querySelector('#arrivalLabel');
    const picker = document.querySelector(propertyName);
    assignTextColor(display, picker);
}

function dumpDepartureTextColor(propertyName) {
    const picker = document.querySelector(propertyName);
    const color = hexToRgb(picker.value);
    return `Color_Departure=${color.r},${color.g},${color.b}\n`;
}

function dumpArrivalTextColor(propertyName) {
    const picker = document.querySelector(propertyName);
    const color = hexToRgb(picker.value);
    return `Color_Arrival=${color.r},${color.g},${color.b}\n`;
}

function rawVideoColor(propertyName) {
    const display = document.querySelector('#raw-video');
    const picker = document.querySelector(propertyName);
    assignBackgroundColor(display, picker, null)
}

function dumpRawVideoColor(propertyName) {
    const picker = document.querySelector(propertyName);
    const color = hexToRgb(picker.value);
    return `Color_RawVideo=${color.r},${color.g},${color.b}\n`;
}

const PROPERTIES = [
    { name: '#groundLabelFill', loader: groundLabelFill, dumper: dumpGroundLabelFill },
    { name: '#groundLabelBorder', loader: groundLabelBorder, dumper: dumpGroundLabelBorder },
    { name: '#departureTextColor', loader: departureTextColor, dumper: dumpDepartureTextColor },
    { name: '#arrivalTextColor', loader: arrivalTextColor, dumper: dumpArrivalTextColor },
    { name: '#rawVideoColor', loader: rawVideoColor, dumper: dumpRawVideoColor },
];

function exportConfig() {
    let text = "";
    for (const { name, _, dumper } of PROPERTIES) {
        text += dumper(name);
    }

    return text;
}

function main() {
    for (const { name, loader } of PROPERTIES) {
        loader(name);
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