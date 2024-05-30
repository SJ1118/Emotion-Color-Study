


var g = {};  // put everything in a namespace variable to simplify cleanup, avoid name collisions

g.repo = "https://sj1118.github.io/Emotion-Color-Study/";


/* 6 blocks of 60 trials
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

// subject info:
g.subjects = {
    'W': {
        'M': [9, 31, 11, 21, 14, 24],
        'F': [2, 22, 3, 4, 30, 16]
    },
    'B': {
        'M': [72, 107, 152, 40, 151, 37],
        'F': [1, 17, 44, 27, 67, 39]
    },
    'A': {
        'M': [13, 23, 15, 32, 33, 38],
        'F': [56, 58, 71, 63, 65, 62]
    },
    'O': {
        'M': [18, 25, 36, 26, 29, 28],
        'F': [19, 20, 46, 42, 54, 50]
    }
}

// shuffle subjects within categories
Object.keys(g.subjects).forEach(key => {
    g.subjects[key]['M'] = jsPsych.randomization.shuffle(g.subjects[key]['M']);
    g.subjects[key]['F'] = jsPsych.randomization.shuffle(g.subjects[key]['F']);
});


// Emotions which get a block
g.emotions = [
    { code: 2, emotion: 'Happy', emotion_label: 'Happy' },
    { code: 3, emotion: 'Sad', emotion_label: 'Sad' },
    { code: 4, emotion: 'Angry', emotion_label: 'Angry' },
    //{ code: 5, emotion: 'Surprised', emotion_label: 'Surprised' },
    { code: 6, emotion: 'Disgusted', emotion_label: 'Disgusted' },
    { code: 9, emotion: 'Happy_disgusted', emotion_label: 'Happily Disgusted'},
    { code: 15, emotion: 'Surprisely_fearful', emotion_label: 'Fearfully surprised' }  // "fearfully surprised"
]

// emotion codes
g.coloration = [2, 3, 4, 6, 9, 15];

//g.subjects = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11];

// stimulus has form: subject_{subject number}/{Emotion}/sub{subject number}_{expression}_{coloration}.png

// Generate timeline

// shuffle emotions (randomize block order)
g.emotions = jsPsych.randomization.shuffle(g.emotions);

g.blocks = [];
g.images = [];
for (let i=0; i < g.emotions.length; i++) {

    let block = [];
    // 60 trials in the block, six from each subject
    let cong_on_left = jsPsych.randomization.repeat([true, false], 30);
    let left_idx = 0;

    // pick one subject from each race/sex category: 8 subjects x 6 emotions for 48 trials
    Object.keys(g.subjects).forEach(racekey => {
        Object.keys(g.subjects[racekey]).forEach(sexkey => {
            let subject_id = g.subjects[racekey][sexkey][i];
            let prefix = 'Balanced_Subjects/subject_' + subject_id + '/' + g.emotions[i].emotion + '/sub' + subject_id + '_' + g.emotions[i].code + '_';
            // loop over facial colors
            for (let k=0; k < g.coloration.length; k++) {
                block.push({
                    congruent: prefix + g.emotions[i].code + '.png',
                    incongruent: prefix + g.coloration[k] + '.png',
                    congruent_on_left: cong_on_left[left_idx]
                });
                left_idx += 1;
                g.images.push(g.repo + prefix + g.coloration[k] + '.png');
            }
        });
    });

    // for remaining 12 trials, select 12 additional subjects, three from each race
    let colorations12 = jsPsych.randomization.repeat(g.coloration, 2);
    let subjects12 = [];
    let plus1 = (i + 1) % 6;
    let plus2 = (i + 2) % 6;
    Object.keys(g.subjects).forEach(racekey => {
        let extrasex = jsPsych.randomization.sampleWithoutReplacement(['M', 'F'], 1)[0];
        subjects12.push(g.subjects[racekey]['M'][plus1]);
        subjects12.push(g.subjects[racekey]['F'][plus1]);
        subjects12.push(g.subjects[racekey][extrasex][plus2]);
    });
    for (let j=0; j < colorations12.length; j++) {
        let subject_id = subjects12[j];
        let prefix = 'Balanced_Subjects/subject_' + subject_id + '/' + g.emotions[i].emotion + '/sub' + subject_id + '_' + g.emotions[i].code + '_';

        block.push({
            congruent: prefix + g.emotions[i].code + '.png',
            incongruent: prefix + colorations12[j] + '.png',
            congruent_on_left: cong_on_left[left_idx]
        });
        left_idx += 1;
        g.images.push(g.repo + prefix + colorations12[j] + '.png');
    }

    // // -----------old code ------------------
    // // loop over subjects
    // for (let j=0; j < g.subjects.length; j++) {
    //     let prefix = 'subject_' + g.subjects[j] + '/' + g.emotions[i].emotion + '/sub' + g.subjects[j] + '_' + g.emotions[i].code + '_'
    //
    //     // loop over facial colors
    //     for (let k=0; k < g.coloration.length; k++) {
    //         block.push({
    //             congruent: prefix + g.emotions[i].code + '.png',
    //             incongruent: prefix + g.coloration[k] + '.png',
    //             congruent_on_left: cong_on_left[j]
    //         });
    //         g.images.push(g.repo + prefix + g.coloration[k] + '.png');
    //     }
    // }
    // // ------------end old code --------------------



    // shuffle block
    block = jsPsych.randomization.shuffle(block);
    g.blocks.push({
        emotion: g.emotions[i].emotion,
        emotion_label: g.emotions[i].emotion_label,
        block: block
    });
}

g.timeline = [];

g.preload = {
    type: 'preload',
    images: g.images
}

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

g.oldtrial = {
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
        //let emotion = jsPsych.timelineVariable('emotion_label');
        //string_parts.push('<br/>Which face expresses <b>' + emotion + '</b> most clearly?<br>Press the left or right arrow key.')
        return string_parts.join('')
    },
    choices: ['ArrowLeft', 'ArrowRight'],
    prompt: function(){
        let emotion = jsPsych.timelineVariable('emotion_label');
        return 'Which face conveys <b>' + emotion + '</b> most clearly?<br>Press the left or right arrow key.'
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

g.trial = {
    type: 'html-button-response',
    stimulus: '',
    choices: ['left', 'right'],
    button_html: function(){
            let leftimg;
            let rightimg;
            if (jsPsych.timelineVariable('congruent_on_left', true)) {
                leftimg = jsPsych.timelineVariable('congruent', true);
                rightimg = jsPsych.timelineVariable('incongruent', true);
            } else {
                leftimg = jsPsych.timelineVariable('incongruent', true);
                rightimg = jsPsych.timelineVariable('congruent', true);
            }

            return [
                '<button class="faceimg"><img alt="human_face" src="' + g.repo + leftimg + '"></button>',
                '<button class="faceimg"><img alt="human_face" src="' + g.repo + rightimg + '"></button>'
            ]
    },
    margin_horizontal: '70px',
    margin_vertical: '10px',
    prompt: function(){
        let emotion = jsPsych.timelineVariable('emotion_label');
        return 'Which face conveys <b>' + emotion + '</b> most clearly?<br>Press the image.'
    },
    data: {
        congruent_on_left: jsPsych.timelineVariable('congruent_on_left'),
        congruent: jsPsych.timelineVariable('congruent'),
        incongruent: jsPsych.timelineVariable('incongruent')
    },
    on_finish: function(data) {
        if ((data.congruent_on_left && data.response === 0) ||
            (!data.congruent_on_left && data.response === 1)) {
            data.selected_img = 'congruent';
        } else {
            data.selected_img = 'incongruent';
        }
    }
}

g.timeline.push(g.welcome);
g.timeline.push(g.preload);

// build timeline
g.blocks.forEach(function(block, idx){
    // g.timeline.push({
    //     type: 'html-keyboard-response',
    //     stimulus: 'This block will concern the emotion "' + block.emotion_label + '"',
    //     prompt: 'Press any key to continue',
    //     choices: jsPsych.ALL_KEYS
    // });
    g.timeline.push({
        type: 'html-button-response',
        stimulus: 'This block will concern the emotion "' + block.emotion_label + '"',
        choices: ['Continue']
    });

    g.timeline.push({
        timeline: [{
            timeline: [g.blank, g.fixation, g.trial],
            timeline_variables: block.block
        }],
        timeline_variables: [{ emotion_label: block.emotion_label }]
    });

    g.timeline.push({
        type: 'html-button-response',
        stimulus: '<img alt="Great job!" class="block-end-img" src="' + g.repo + 'block_end/' + (idx + 1).toString() +  '.png">',
        choices: ['Continue']
    });

})





