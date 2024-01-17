


var g = {};  // put everything in a namespace variable to simplify cleanup, avoid name collisions

g.repo = "https://sj1118.github.io/Emotion-Color-Study/";


/* 6 blocks of 10 trials
Each block corresponds to a single emotion.

Each trial consists of:
500 ms fixation cross
500 ms blank screen
display image pair (until a response is received)

image pair consists of:
one image where expression and coloration are congruent
one image where expression and coloration are incongruent


Randomization:
order of blocks (emotions)
congruent image side


 */

// Emotions which get a block
g.emotions = [
    { code: 2, emotion: 'Happy', emotion_label: 'Happy' },
    { code: 3, emotion: 'Sad', emotion_label: 'Sad' },
    { code: 4, emotion: 'Angry', emotion_label: 'Angry' },
    { code: 5, emotion: 'Surprised', emotion_label: 'Surprised' },
    { code: 6, emotion: 'Disgusted', emotion_label: 'Disgusted' },
    { code: 15, emotion: 'Surprisely_fearful', emotion_label: 'Fearfully surprised' }  // "fearfully surprised"
]

// emotion codes (currently includes additional emotions)
g.coloration = [2, 3, 4, 5, 6, 8, 9, 15];

g.subjects = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11];

// stimulus has form: subject_{subject number}/{Emotion}/sub{subject number}_{expression}_{coloration}.png

// Generate timeline

// shuffle emotions (randomize block order)
g.emotions = jsPsych.randomization.shuffle(g.emotions);

g.blocks = [];
for (let i=0; i < g.emotions.length; i++) {

    let block = [];
    // 10 trials in the block, one from each subject
    let cong_on_left = jsPsych.randomization.repeat([true, false], 5);

    for (let j=0; j < 10; j++) {

        let prefix = 'subject_' + g.subjects[j] + '/' + g.emotions[i].emotion + '/sub' + g.subjects[j] + '_' + g.emotions[i].code + '_'
        let coloration = g.emotions[i].code;
        while (coloration === g.emotions[i].code) {
            coloration = jsPsych.randomization.sampleWithoutReplacement(g.coloration, 1)[0];
        }

        block.push({
            congruent: prefix + g.emotions[i].code + '.png',
            incongruent: prefix + coloration + '.png',
            congruent_on_left: cong_on_left[j]
        });
    }
    g.blocks.push({
        emotion: g.emotions[i].emotion,
        emotion_label: g.emotions[i].emotion_label,
        block: block
    });
}

g.timeline = [];

g.welcome = {
    type: "fullscreen",
    message: "Now you are entering full screen mode.<br>",
    button_label: "Click here to proceed.",
    delay_after: 500
}

g.fixation = {
    type: 'html-keyboard-response',
    stimulus: '<div class="container"><div class="fixation">+</div></div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 500
};

g.blank = {
    type: 'html-keyboard-response',
    stimulus: '<div class="container"></div>',
    choices: jsPsych.NO_KEYS,
    trial_duration: 500
}

g.trial = {
    type: 'html-keyboard-response',
    stimulus: function() {
        let leftimg;
        let rightimg;
        if (jsPsych.timelineVariable('congruent_on_left', true)) {
            leftimg = jsPsych.timelineVariable('congruent', true);
            rightimg = jsPsych.timelineVariable('incongruent', true);
        } else {
            leftimg = jsPsych.timelineVariable('incongruent', true);
            rightimg = jsPsych.timelineVariable('congruent', true);
        }
        let string_parts = [];
        string_parts.push('<div class="container"><div class="faceimg"><img alt="human_face" src="' + g.repo + leftimg + '"></div>');
        string_parts.push('<div class="faceimg"><img alt="human_face" src="' + g.repo + rightimg + '"></div></div>');
        return string_parts.join('')
    },
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: function(){
        let emotion = jsPsych.timelineVariable('emotion_label');
        return 'Which face looks more <b>' + emotion + '</b>?<br>Press the left or right arrow key.'
    },
    data: {
        congruent_on_left: jsPsych.timelineVariable('congruent_on_left'),
        congruent: jsPsych.timelineVariable('congruent'),
        incongruent: jsPsych.timelineVariable('incongruent')
    },
    on_finish: function(data) {
        if (data.response === 'arrowleft') {
            data.selected_side = 'left';
        } else if(data.response === 'arrowright') {
            data.selected_side = 'right';
        } else {
            console.log(data.response);
        }

        if ((data.congruent_on_left && data.response === 'arrowleft') ||
            (!data.congruent_on_left && data.response === 'arrowright')) {
                data.selected_img = 'congruent';
            } else {
                data.selected_img = 'incongruent';
            }
    }
}

g.timeline.push(g.welcome);

// build timeline
g.blocks.forEach(function(block){
    g.timeline.push({
        type: 'html-keyboard-response',
        stimulus: 'This block will concern the emotion "' + block.emotion_label + '"',
        prompt: 'Press any key to continue',
        choices: jsPsych.ALL_KEYS
    });
    g.timeline.push({
        timeline: [{
            timeline: [g.fixation, g.blank, g.trial],
            timeline_variables: block.block
        }],
        timeline_variables: [{ emotion_label: block.emotion_label }]
    });
})





