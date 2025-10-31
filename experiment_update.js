


var g = {};  // put everything in a namespace variable to simplify cleanup, avoid name collisions

g.repo = "https://sj1118.github.io/Emotion-Color-Study/";


/* 6 blocks of 15 trials
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
        'M': [9, 31, 11, 21, 14, 24, 35, 41, 43, 132, 88, 100],
        'F': [2, 22, 3, 4, 30, 16, 5, 6, 7, 34, 86, 85]
    },
    'B': {
        'M': [72, 107, 152, 40, 151, 37, 180],
        'F': [17, 44, 27, 67, 39, 12, 69, 75, 76, 80, 81]
    },
    'A': {
        'M': [13, 23, 15, 32, 33, 38, 160, 79, 133, 161, 173, 99],
        'F': [56, 58, 71, 63, 65, 62, 89, 91, 95, 82, 96, 137]
    },
    'O': {
        'M': [18, 25, 36, 26, 42, 29, 28, 90, 94, 97, 178, 134, 135],
        'F': [19, 20, 46, 42, 54, 50, 10, 98, 115, 128, 131, 149]
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

// To balance the overall left-right congruency across all blocks, use an extra array to balance the 15th trial
g.balance_15th = jsPsych.randomization.repeat([true, false], 3);

function generate_block(emotion_idx, congruent_on_left, subject_id, incongruent_color) {
    let prefix = 'fcp_updated/subject_' + subject_id + '/' + g.emotions[emotion_idx].emotion + '/sub' + subject_id + '_' + g.emotions[emotion_idx].code + '_';

    g.images.push(g.repo + prefix + incongruent_color + '.png');
    g.images.push(g.repo + prefix + g.emotions[emotion_idx].code + '.png');

    return {
        congruent: prefix + g.emotions[emotion_idx].code + '.png',
        incongruent: prefix + incongruent_color + '.png',
        congruent_on_left: congruent_on_left
    };

}

for (let i=0; i < g.emotions.length; i++) {

    let block = [];
    // 15 trials in the block
    let cong_on_left = jsPsych.randomization.repeat([true, false], 7).concat(g.balance_15th.pop());
    let incongruent_color = jsPsych.randomization.repeat(g.coloration.filter(x => x !== g.emotions[i].code), 3);

    // pick two subjects from each race/sex category except for Black, which is more complicated:
    Object.keys(g.subjects).forEach(racekey => {

        let subject_id;

        subject_id = g.subjects[racekey]['F'].pop();
        block.push(generate_block(i, cong_on_left.pop(), subject_id, incongruent_color.pop()));
        subject_id = g.subjects[racekey]['F'].pop();
        // there are only 11 Black females, so need to sub in a Black male for the 6th block
        if (!subject_id) {
            subject_id = g.subjects[racekey]['M'].pop();
        }
        block.push(generate_block(i, cong_on_left.pop(), subject_id, incongruent_color.pop()));

        subject_id = g.subjects[racekey]['M'].pop();
        block.push(generate_block(i, cong_on_left.pop(), subject_id, incongruent_color.pop()));

        if (racekey !== 'B') {
            subject_id = g.subjects[racekey]['M'].pop();
            block.push(generate_block(i, cong_on_left.pop(), subject_id, incongruent_color.pop()));
        }
    });

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
        stimulus: '<img alt="Great job!" class="block-end-img" src="' + g.repo + 'fcp_updated/block_end_updated/' + (idx + 1).toString() +  '.png">',
        choices: ['Continue']
    });
});



// Sliding scale task
/* Group trials into blocks
Each trial consists of:
500 ms blank screen
display image (until a response is received)
 */

// subject info:
g.sssubjects = {
    'W': {
        'M': [9, 31, 11, 21],
        'F': [2, 22, 3, 4]
    },
    'B': {
        'M': [72, 107, 152, 40, 180],
        'F': [17, 44, 27, 67]
    },
    'A': {
        'M': [13, 23, 15, 32],
        'F': [56, 58, 71, 63]
    },
    'O': {
        'M': [18, 25, 36, 26, 135, 90],
        'F': [19, 20, 46, 54, 149]
    }
}

// shuffle all subjects
g.sssubjectlist = [];
Object.keys(g.sssubjects).forEach(key => {
    g.sssubjectlist = g.sssubjectlist.concat(g.sssubjects[key]['M']).concat(g.sssubjects[key]['F']);
});
g.sssubjectlist = jsPsych.randomization.shuffle(g.sssubjectlist);

// total = 36 faces

/*
split the 36 trials evenly across coloration:
12 congruent
12 incongruent
12 none/baseline

Within each of the six emotions, do 2 congruent, 2 incongruent, 2 none — randomized within the block.
 */

// shuffle emotions again (randomize block order)
g.emotions = jsPsych.randomization.shuffle(g.emotions);

g.ssblocks = [];

function generate_sstrial(emotion_idx, color_emotion_idx, subject_id, is_baseline){
    let prefix = 'fcp_updated/slidingscale/subject_' + subject_id + '/' + g.emotions[emotion_idx].emotion + '/sub' + subject_id;
    let imagepath;
    if (is_baseline) {
        imagepath = prefix + '.png';
    } else {
        imagepath = prefix + '_' + g.emotions[emotion_idx].code + '_' + g.emotions[emotion_idx].code + '.png';
    }

    g.images.push(g.repo + imagepath);

    let trialtype;
    let emotion;
    let color_emotion;
    if (is_baseline) {
        trialtype = 'baseline';
        emotion = 'none';
        color_emotion = 'none'
    } else if (emotion_idx === color_emotion_idx) {
        trialtype = 'congruent';
        emotion = g.emotions[emotion_idx].emotion_label;
        color_emotion = g.emotions[emotion_idx].emotion_label;
    } else {
        trialtype = 'incongruent';
        emotion = g.emotions[emotion_idx].emotion_label;
        color_emotion = g.emotions[color_emotion_idx].emotion_label;
    }

    return {
        imagepath: imagepath,
        trialtype: trialtype,
        emotion: emotion,
        color_emotion: color_emotion,
        subject_id: subject_id
    }
}

for (let i=0; i < g.emotions.length; i++) {
    let block = [];
    // 2 congruent
    block.push(generate_sstrial(i, i, g.sssubjectlist.pop(), false));
    block.push(generate_sstrial(i, i, g.sssubjectlist.pop(), false));

    // 2 incongruent, randomly selected from the 5 remaining emotions
    let incongruent_choices = [0, 1, 2, 3, 4, 5].filter(x => x !== i);
    let incongruent_selections = jsPsych.randomization.sampleWithoutReplacement(incongruent_choices, 2);
    block.push(generate_sstrial(i, incongruent_selections[0], g.sssubjectlist.pop(), false));
    block.push(generate_sstrial(i, incongruent_selections[1], g.sssubjectlist.pop(), false));

    // 2 none
    block.push(generate_sstrial(i, 6, g.sssubjectlist.pop(), true));
    block.push(generate_sstrial(i, 6, g.sssubjectlist.pop(), true));

    // shuffle block
    block = jsPsych.randomization.shuffle(block);
    g.ssblocks.push({
        emotion: g.emotions[i].emotion,
        emotion_label: g.emotions[i].emotion_label,
        block: block
    });

}

g.sstrial = {
    type: 'html-slider-response',
    labels: ['Not at all', 'Extremely strongly'],
    prompt: '',
    stimulus: function() {
        return '<p>How strongly does this face express emotion?</p>' +
            '<img alt="human_face" src="' + g.repo + jsPsych.timelineVariable('imagepath', true) + '">';
    },
    data: {
        emotion: jsPsych.timelineVariable('emotion'),
        color_emotion: jsPsych.timelineVariable('color_emotion'),
        subject_id: jsPsych.timelineVariable('subject_id'),
        trialtype: jsPsych.timelineVariable('trialtype')
    }
}


//g.timeline = [];  // TESTING ONLY

g.timeline.push({
    type: 'html-button-response',
    stimulus: 'In the following task, you will be presented with 36 faces. For each face, you will be asked to indicate how strongly emotion is expressed.',
    choices: ['Continue']
});

g.ssblocks.forEach(function(block, idx){
    g.timeline.push({
        type: 'html-button-response',
        stimulus: 'This block will concern the emotion "' + block.emotion_label + '"',
        choices: ['Continue']
    });
    g.timeline.push({
        timeline: [{
            timeline: [g.blank, g.fixation, g.sstrial],
            timeline_variables: block.block
        }],
        timeline_variables: [{ emotion_label: block.emotion_label }]
    });
    g.timeline.push({
        type: 'html-button-response',
        stimulus: '<img alt="Great job!" class="block-end-img" src="' + g.repo + 'fcp_updated/block_end_updated/' + (idx + 1).toString() +  '.png">',
        choices: ['Continue']
    });
});
