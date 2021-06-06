var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://raspberrypi')
var {Deferred} = require('./utils')
let {mqttDevices} = require('./devices')
const colors = require('./colors')

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

let cs_requests = {}
let colorLoop = null;
let colorLoopIndex = 0;
const STEPS = 30


function colorLoopHandler(mqttDevice) {
    if (colorLoopIndex >= (rainbow.length - 1) * STEPS)
        colorLoopIndex = 0
    let index = Math.floor(colorLoopIndex / STEPS)
    let stepIndex = colorLoopIndex % STEPS
    let c = rainbow[index++]
    if (index >= rainbow.length)
        index = 0
    let c2 = rainbow[index]

    function lerp(idx) {
        return c[idx] + (c2[idx] - c[idx]) / STEPS * stepIndex
    }

    let col = (lerp(0) << 16) | (lerp(1) << 8) | lerp(2)
    let payload = {color: rgb2xy(col)}
    client.publish(mqttDevice.topic + '/set', JSON.stringify(payload))
    colorLoopIndex++
}

function get_current_state(mqttDevice) {
    let d = new Promise(resolve => {
        let a = cs_requests[mqttDevice.topic]
        if (a == null)
            a = cs_requests[mqttDevice.topic] = []
        a.push(resolve)
	console.log('qqq '+mqttDevice.topic + '/get')
        client.publish(mqttDevice.topic + '/get', '')
    })
    return d
}

function execute_commands(commands) {
    let responsePayload = []
    for (let command of commands) {
        let commandResponse = {
            ids: [],
            status: 'SUCCESS',
            states: {
                online: true,
            }
        }
        responsePayload.push(commandResponse)
        for (let device of command.devices) {
            commandResponse.ids.push(device.id)
            outer: for (let execution of command.execution) {
                let cmd = execution.command
                let mqttDevice = mqttDevices[device.id]
                if (mqttDevice == null)
                    break outer
                let payload = {}
                console.log(cmd)
                if (cmd == 'action.devices.commands.ColorAbsolute') {
                    if (execution.params.color.name == 'antique white') {
                        cmd = "action.devices.commands.ColorLoop"
                    } else {
                        if (colorLoop != null) {
                            clearTimeout(colorLoop)
                            colorLoop = null
                        }
                    }
                }
                switch (cmd) {
                    case 'action.devices.commands.BrightnessAbsolute':
                        payload['brightness'] = execution.params.brightness
                        commandResponse.states.brightness = execution.params.brightness
                        break
                    case 'action.devices.commands.ColorAbsolute':
                        payload['color'] = rgb2xy(execution.params.color.spectrumRGB)
                        commandResponse.states.color = execution.params.color
                        break
                    case 'action.devices.commands.OnOff':
                        payload['state'] = execution.params.on ? 'ON' : 'OFF'
                        commandResponse.states.on = execution.params.on
                        break
                    case "action.devices.commands.ColorLoop":
                        if (colorLoop == null) {
                            colorLoop = setInterval(()=>colorLoopHandler(mqttDevice), 5000)
                        }
                        break
                    case "action.devices.commands.StopEffect":
                        if (colorLoop != null) {
                            clearTimeout(colorLoop)
                            colorLoop = null
                        }
                        break
                }
                if (Object.keys(payload).length > 0)
                    client.publish(mqttDevice.topic + '/set', JSON.stringify(payload))
            }
        }
    }
    return responsePayload

}

client.on('connect', function () {
    client.subscribe('zigbee2mqtt/bridge/config/devices')
    client.publish('zigbee2mqtt/bridge/config/devices/get', '')

    Object.values(mqttDevices).forEach(md => {
        md.topic = 'zigbee2mqtt/' + md.name
        client.subscribe(md.topic)
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
    let xy = colors.rgb_to_cie(red,green,blue)
 return {x: xy[0], y: xy[1]}
}

function xy2rgb(x,y){
 let rgb = colors.cie_to_rgb(x,y)
 return rgb[0] << 16 | rgb[1] << 8 | rgb[2]
}


function to_google(msg, id) {
    let data = {
        online: true,
        on: msg.state === 'ON'
    }
    if (msg.brightness)
        data.brightness = msg.brightness
    if (msg.color) {
	let rgb = xy2rgb(msg.color.x,msg.color.y)
        data.color = {
            spectrumRGB: rgb
        }
    }
    return {
        devices: {
            [id]: data
        }
    }
}

function check_devices(msg) {
    let j = JSON.parse(msg)
    for (let d of j) {
        console.log(`device ${d.ieeeAddr}, ${d.description}, ${d.friendly_name}`)
        let mqttDevice = Object.values(mqttDevices).find(e => e.id === d.ieeeAddr)
        if (mqttDevice) {
            if (mqttDevice.name !== d.friendly_name) {
                let o = {"old": d.friendly_name, "new": mqttDevice.name}
                console.log('renaming',o)
                client.publish('zigbee2mqtt/bridge/config/rename', JSON.stringify(o))
            }
        }

    }
}

client.on('message', function (topic, message) {
    // message is Buffer
    let msg = message.toString()

    console.log('ere', topic, msg)
    if (topic == 'zigbee2mqtt/bridge/config/devices') {
        check_devices(msg)
        return
    }
    let a = cs_requests[topic]
    if (a) {
        let mqttDevice = Object.entries(mqttDevices).find(e => e[1].topic == topic)
        let cs = to_google(JSON.parse(msg), mqttDevice[0])
        let send = a
        cs_requests[topic] = []

        for (let d of send) {
            console.log('send',JSON.stringify(cs))
            d(cs)
        }
    }
})

exports.get_current_state = get_current_state
exports.execute_commands = execute_commands

