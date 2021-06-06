// Import the appropriate service
const {smarthome} = require('actions-on-google')
const {Deferred} = require('./utils')
const {get_current_state, execute_commands} = require('./mqtt')
const {devices,mqttDevices} = require('./devices')
// Create an app instance
const app = smarthome()

// Register handlers for Smart Home intents

app.onExecute((body, headers) => {
    console.log('execute',JSON.stringify(body))
    let responseCommands = []
    for (let input of body.inputs) {
        responseCommands.push(...execute_commands(input.payload.commands))
    }
    let d = {
        requestId: body.requestId,
        payload: { 
		commands: responseCommands
	}
    }
    console.log('execute_resp',JSON.stringify(d))
    return d;
})

function makePayload(request, payload) {

}

app.onQuery((body, headers) => {
    console.log('query',JSON.stringify(body))
    let devices = []
    body.inputs.forEach(i=>i.payload.devices.forEach(d=>{
        let device = mqttDevices[d.id]
        if (device)
            devices.push(device)
    }))
    console.log('query_dev',devices,JSON.stringify(devices))
    if (devices.length!=1){
        console.error("devices",JSON.stringify(devices))
    }
    let d = get_current_state(devices[0]).then(value => {
        let r = {
            requestId: body.requestId,
            payload: value,
            status: 'SUCCESS'
        }
	console.log('query_resp',JSON.stringify(r))
        return r
    })
    return d
})

app.onSync((body, headers) => {
        return {
            requestId: `${body.requestId}`,
            payload: {
                agentUserId: "1836.15267389",
                devices: devices
            }
        }
    }
)

const express = require('express')
const bodyParser = require('body-parser')

const expressApp = express().use(bodyParser.json())

expressApp.post('/fulfillment', app)

expressApp.listen(5000)
