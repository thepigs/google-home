var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://192.168.0.128')
var {Deferred} = require('./utils')
const TOPIC = 'zigbee2mqtt/kitchen_light_bar'
//
// return {
//     requestId: body.requestId,
//     payload: {
//         devices: {
//             123: {
//                 online: true,
//                 color: {
//                     spectrumRgb: 16711935
//                 },
//                 status: 'SUCCESS'
//             }
//         }
//     }
// };

const rainbow = [[255, 0, 0], [255, 127, 0], [255, 255, 0], [0, 255, 0], [0, 0, 255], [46, 43, 95], [139, 0, 255]]

let cs_requests = []
let colorLoop = null;
let colorLoopIndex = 0;

function colorLoopHandler(){
    if (colorLoopIndex>=rainbow.length)
        colorLoopIndex = 0
    let c = rainbow[colorLoopIndex++]
    let col = (c[0]<<16)|(c[1]<<8)|c[2]
    let payload = { color: rgb2xy(col) }
    client.publish(TOPIC + '/set', JSON.stringify(payload))
}
function get_current_state(resolve) {
    let d = new Promise(resolve => {
        cs_requests.push(resolve)
        client.publish(TOPIC + '/get', '')
    })
    return d
}

function execute_commands(commands) {
    let payload = {}
    for (let command of commands) {
        for (let execution of command.execution) {
            let cmd = execution.command
            console.log(cmd)

            switch (cmd) {
                case 'action.devices.commands.BrightnessAbsolute':
                    payload['brightness'] = execution.params.brightness
                    break
                case 'action.devices.commands.ColorAbsolute':
                    payload['color'] = rgb2xy(execution.params.color.spectrumRGB)
                    break
                case 'action.devices.commands.OnOff':
                    payload['state'] = execution.params.on ? 'ON' : 'OFF'
                    break
                case "action.devices.commands.ColorLoop":
                    if (colorLoop == null) {
                        colorLoop = setInterval(colorLoopHandler, 5000)
                    }
                    break
                case "action.devices.commands.StopEffect":
                    if (colorLoop != null) {
                        clearTimeout(colorLoop)
                        colorLoop = null
                    }
                    break
            }
        }
    }
    if (Object.keys(payload).length>0)
        client.publish(TOPIC + '/set', JSON.stringify(payload))

}

client.on('connect', function () {
    client.subscribe(TOPIC, function (err) {
        if (!err) {
            client.publish('googlehome', 'Hello mqtt')
        }
    })
})

//{"state":"OFF","linkquality":0,"brightness":0,"color_temp":203,"color":{"x":0.3565,"y":0.3391,"h":90,"s":71.42857142857142}}
// devices: {
//     123: {
//         online: true,
//             color: {
//             spectrumRgb: 16711935
//         },
//         status: 'SUCCESS'
//     }
// }

function rgb2xy(rgb) {
    let blue = rgb & 255
    let green = (rgb >> 8) & 255
    let red = (rgb >> 16) & 255
    let X = red * 0.649926 + green * 0.103455 + blue * 0.197109;
    let Y = red * 0.234327 + green * 0.743075 + blue * 0.022598;
    let Z = red * 0.0000000 + green * 0.053077 + blue * 1.035763;

    let x = X / (X + Y + Z);

    let y = Y / (X + Y + Z);
    return {x: x, y: y}
}

function to_google(msg) {

    return {
        devices: {
            online: true,
            on: msg.state === 'ON',
            brightness: msg.brightness,
            //     color: {
            //         spectrumRGB: {
            //             hue: msg.color.h,
            //             saturation: msg.color.s,
            //             value: msg.color.v
            //         }
            //     }
        },
    }
}

client.on('message', function (topic, message) {
    // message is Buffer
    let msg = message.toString()
    if (topic === TOPIC) {
        let cs = to_google(JSON.parse(msg))
        let send = cs_requests
        cs_requests = []
        for (let d of send)
            d(cs)
    }

})

exports.get_current_state = get_current_state
exports.execute_commands = execute_commands

