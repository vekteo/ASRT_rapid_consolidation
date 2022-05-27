/* 
Created by Teodora Vekony (vekteo@gmail.com)
Lyon Neuroscience Research Center
Universite Claude Bernard Lyon 1

Github:https://github.com/vekteo/ASRT_PDP_jsPsych
*/

/*************** VARIABLES ***************/

const responseKeys = [['s','f','j','l']];
const images = [];
let timeline = [];
let trialNumber = -1;
let block = 1;

/*************** TIMELINE ELEMENTS ***************/

/* instructions */

const instruction = {
    type: "instructions",
    pages: [
        `<p>${language.pdp.notRandom}</p>` +
        `<p>${language.pdp.control}</p>` +
        `<p>${language.pdp.reproduce}</p>` +
        `<p>${language.pdp.clear}</p>`
    ],
    show_clickable_nav: true,
    button_label_next: language.button.next,
    button_label_previous: language.button.previous
}

const startInstruction = {
    type: "html-keyboard-response",
    stimulus: `<p>${language.task.ready}</p>`,
};

const blockEndInstruction = {
    type: "html-keyboard-response",
    stimulus: `<h3>${language.pdp.endBlock}</h3><p>${language.pdp.taskSame}</p><p>${language.pdp.continue}</p>`,
    on_start: function() {
        sequenceSoFar = "";
    }
};

const continueTask = {
    type: "html-keyboard-response",
    stimulus: `<p>${language.task.continue}</p>`
};

const changeInstruction = {
    type: "instructions",
    pages: [`<h2 style='color:red'><strong>${language.pdp.attention}</strong></h2><p>${language.pdp.change}</p>` +
    "<p></p>" +
    `<p>${language.pdp.allResponseKeys}</p>` +
    `<p>${language.pdp.clear}</p>`
    ],
    show_clickable_nav: true,
    on_start: function(){
        sequenceSoFar = "";
    },
    button_label_previous: `${language.button.previous}`,
    button_label_next: `${language.button.next}`
};

const end = {
    type: "html-keyboard-response",
    stimulus: `<h2>${language.end.end}</h2>` +
        `<p>${language.end.thankYou}</p>`,
    trial_duration: 3000,
};

const buttonPress = [{ stimulus: [0,0], data: { } } ]

/* trial properties */

const initialTrial = {
    type: "serial-reaction-time",
    grid: [[1, 1, 1, 1]],
    choices: responseKeys,
    target: jsPsych.timelineVariable('stimulus'),
    data: jsPsych.timelineVariable('data'),
    response_ends_trial: true,
    pre_target_duration: 0,
    target_color: "white",
    prompt: `<h2>${language.pdp.startTyping}</h2>`,
    on_start: function (trial){
        trial.data.test_part = "valid_button_press"
        trial.data.block = block++
        trialNumber = -1;
    }    
}

let sequenceSoFar = "";

const trial = {
    type: "serial-reaction-time",
    grid: [[1, 1, 1, 1]],
    choices: responseKeys,
    target: jsPsych.timelineVariable('stimulus'),
    data: jsPsych.timelineVariable('data'),
    response_ends_trial: true,
    pre_target_duration: 120,
    target_color: "url(../static/images/dalmata.jpg)",
    on_start: function (trial){
        let keyPress = jsPsych.data.get().last(1).values()[0].key_press;
        if(jsPsych.data.get().last(1).values()[0].trial_number === 23){
            trial.data.test_part = "last_quitting_trial"
        } else {
            trial.data.test_part = "valid_button_press"
        }        
        if (keyPress === 83) {
            trial.target = [0,0]
            sequenceSoFar = sequenceSoFar.concat(" 1")
        } else if (keyPress === 70) {
            trial.target = [0,1]
            sequenceSoFar = sequenceSoFar.concat(" 2")
        } else if (keyPress === 74) {
            trial.target = [0,2]
            sequenceSoFar = sequenceSoFar.concat(" 3")
        } else if (keyPress === 76) {
            trial.target = [0,3]
            sequenceSoFar = sequenceSoFar.concat(" 4")
        } 
        trial.prompt = "<h2>" + sequenceSoFar + "</h2>"
    }

}

const initialTrialTimeline = {
    timeline: [initialTrial],
    timeline_variables: buttonPress,
}

const newTrial = {
    timeline: [trial],
    timeline_variables: buttonPress,
}

/////////////////////////////////////////

/*************** TIMELINE ***************/

timeline.push({type: "fullscreen", fullscreen_mode: true})
timeline.push(instruction)
timeline.push(startInstruction)
for (let i = 1; i < 5; i++) {
    timeline.push(initialTrialTimeline)
    for (let j = 0; j < 24; j++) {
    timeline.push(newTrial)
    }
    if (i !== 4){
        timeline.push(blockEndInstruction, continueTask)
    }    
}

timeline.push(changeInstruction, startInstruction)

for (let i = 1; i < 5; i++) {
    timeline.push(initialTrialTimeline)
    for (let i = 0; i < 24; i++) {
    timeline.push(newTrial)
    }
    if (i !== 4){
        timeline.push(blockEndInstruction, continueTask)
    }    
}

timeline.push(end)
timeline.push({type: "fullscreen", fullscreen_mode: false})

/*************** EXPERIMENT START AND DATA UPDATE ***************/

jsPsych.init({
    timeline: timeline,
    preload_images: images,
    on_close: function() {
        jsPsych.data.get().ignore("correct").localSave("csv", "PDP_quitted_output.csv");
    },
    on_data_update: function () {
        let lastTrial = jsPsych.data.get().filter({trial_type: "serial-reaction-time"}).last(1).values()[0];
        if (lastTrial) {
            if (lastTrial.trial_number !== 24){
                trialNumber++
            }
            lastTrial.trial_number = trialNumber;
            lastTrial.response_key = String.fromCharCode(jsPsych.data.get().last(1).values()[0].key_press).toLowerCase();
            lastTrial.response_button = parseInt(lastTrial.target[3])
            if (lastTrial.block > 4) {
                lastTrial.task_type = "exclusion";
            } else {
                lastTrial.task_type = "inclusion";
            }
        }

        /*add browser events*/

        let interactionData = jsPsych.data.getInteractionData()
        if (lastTrial) {
            const interactionDataOfLastTrial = interactionData.filter({'trial': lastTrial.trial_index}).values();
            if (interactionDataOfLastTrial) {
                lastTrial.browser_events = JSON.stringify(interactionDataOfLastTrial)
            }
        }
      },
      on_finish: function () {
        jsPsych.data.get().ignore("correct").localSave("csv", "PDP_output.csv");
    }
})