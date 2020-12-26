exports.devices = [{
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
   {
        id: "1003",
        type: "action.devices.types.LIGHT",
        traits: [
            "action.devices.traits.OnOff",
        ],
        name: {
            //     defaultNames: ["lights out inc. bulb A19 color hyperglow"],
            name: "Spa Festoon",
            //    nicknames: ["reading lamp"]
        },
        willReportState: true,
        roomHint: "Spa",
        deviceInfo: {
            manufacturer: "gina",
            model: "0",
            hwVersion: "0",
            swVersion: "0"
        },
    },

]


exports.mqttDevices = {
    456: {
        name: 'kitchen light bar',
        id: '0x00124b001cd6a4b5'
    },
    457: {
        name: 'balcony festoon',
        id: '0x000d6f000f173597'
    },
    1000: {
        name: 'sliding door r',
        id: '0x00158d00045314cd'
    },
    1001: {
        name: 'sliding door l',
        id: '0x00158d000452d7e4',
    },
    1002: {
        name: 'kitchen motion',
        id: '0x00158d0005468cc3'
    },
   1003: {
        name: 'spa festoon',
        id: '0x000d6f000f1731e3'
    }
}
