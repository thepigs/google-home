exports.devices = [
    {
        id: "456",
        type: "action.devices.types.LIGHT",
        traits: [
            "action.devices.traits.OnOff",
            "action.devices.traits.Brightness",
            "action.devices.traits.ColorSetting",
            "action.devices.traits.LightEffects",
        ],
        name: {
            //     defaultNames: ["lights out inc. bulb A19 color hyperglow"],
            name: "Kitchen Light Bar",
            //    nicknames: ["reading lamp"]
        },
        willReportState: true,
        roomHint: "Kitchen",
        attributes: {
            colorModel: 'rgb',
            supportedEffects: ['colorLoop'],
        },

        deviceInfo: {
            manufacturer: "gina",
            model: "0",
            hwVersion: "0",
            swVersion: "0"
        },
    },
    {
        id: "457",
        type: "action.devices.types.LIGHT",
        traits: [
            "action.devices.traits.OnOff",
        ],
        name: {
            //     defaultNames: ["lights out inc. bulb A19 color hyperglow"],
            name: "Balcony Festoon",
            //    nicknames: ["reading lamp"]
        },
        willReportState: true,
        roomHint: "Balcony",
        deviceInfo: {
            manufacturer: "gina",
            model: "0",
            hwVersion: "0",
            swVersion: "0"
        },
    },
]


exports.mqttDevices = {
    456: {name: 'kitchen_light_bar'},
    457: {
        name: 'balcony_festoon',
        id: '0x000d6f000f173597'
    },


}

