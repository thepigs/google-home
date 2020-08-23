// Import the appropriate service
const {smarthome} = require('actions-on-google')
const {Deferred} = require('./utils')
const  {get_current_state,execute_commands} = require('./mqtt')

// Create an app instance
const app = smarthome()

// Register handlers for Smart Home intents

app.onExecute((body, headers) => {
    console.log(body)
    for (let input of body.inputs){
        execute_commands(input.payload.commands)
    }
    return null
})

function makePayload(request,payload){

}
app.onQuery((body, headers) => {
    let d = get_current_state().then(value=>{
        let r = { requestId: body.requestId,
            payload: value,
            status: 'SUCCESS'
        }
        return r
    })
    return d
})

app.onSync((body, headers) => {
    return {
        requestId: body.requestId,
        payload: {
            agentUserId: "1836.15267389",
            devices: [
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
            ]
        }
    };
})

const express = require('express')
const bodyParser = require('body-parser')

const expressApp = express().use(bodyParser.json())

expressApp.post('/fulfillment', app)

expressApp.listen(5000)
