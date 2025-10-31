Qualtrics.SurveyEngine.addOnload(function () {

    /*Place your JavaScript here to run when the page loads*/

    /* Change 1: Hiding the Next button */
    // Retrieve Qualtrics object and save in qthis
    var qthis = this;

    // Hide buttons
    qthis.hideNextButton();

    /* Change 2: Defining and load required resources */
    var task_github = "https://sj1118.github.io/Emotion-Color-Study/"; // https://<your-github-username>.github.io/<your-experiment-name>

    // requiredResources must include all the JS files that the task uses.
    var requiredResources = [

        task_github + "lib/jspsych-6.3.1/jspsych.js",
        task_github + "lib/jspsych-6.3.1/plugins/jspsych-html-keyboard-response.js",
        task_github + "lib/jspsych-6.3.1/plugins/jspsych-html-button-response.js",
        task_github + "lib/jspsych-6.3.1/plugins/jspsych-html-slider-response.js",
        task_github + "lib/jspsych-6.3.1/plugins/jspsych-fullscreen.js",
        task_github + "lib/jspsych-6.3.1/plugins/jspsych-preload.js",
        task_github + "experiment_update.js"
    ];

    function loadScript(idx) {
        console.log("Loading ", requiredResources[idx]);
        jQuery.getScript(requiredResources[idx], function () {
            if ((idx + 1) < requiredResources.length) {
                loadScript(idx + 1);
            } else {
                initExp();
            }
        });
    }

    if (window.Qualtrics && (!window.frameElement || window.frameElement.id !== "mobile-preview-view")) {
        loadScript(0);
    }

    /* Change 3: Appending the display_stage Div using jQuery */
    // jQuery is loaded in Qualtrics by default
    jQuery("<div id = 'display_stage_background'></div>").appendTo('body');
    jQuery("<div id = 'display_stage'></div>").appendTo('body');


    var task_name = "emotion-color-study-update";
    var save_url = "https://experiment.childemotion.waisman.wisc.edu/save_data.php";

    // child and response supplied by Lookit
    var child_id = "${e://Field/child_id}";
    var response_id = "${e://Field/response_id}";

    //var subject_id = "${e://Field/participantID}";
    var data_dir = task_name;
    var file_name = task_name + '_' + child_id + '-' + response_id;

    function save_data_json() {
        jQuery.ajax({
            type: 'post',
            cache: false,
            url: save_url,
            data: {
                data_dir: data_dir,
                file_name: file_name + '.json', // the file type should be added
                exp_data: jsPsych.data.get().json()
            }
        });
    }

    function save_data_csv() {
        jQuery.ajax({
            type: 'post',
            cache: false,
            url: save_url,
            data: {
                data_dir: data_dir,
                file_name: file_name + '.csv', // the file type should be added
                exp_data: jsPsych.data.get().csv()
            }
        });
    }

    /* Change 4: Wrapping jsPsych.init() in a function */
    function initExp() {

        jsPsych.init({
            timeline: g.timeline,
            //preload_images: g.preload_images,
            display_element: 'display_stage',
            on_finish: function (data) {

                jsPsych.data.get().addToAll({child_id: child_id, response_id: response_id});
                save_data_csv();

                // clear the stage
                jQuery('#display_stage').remove();
                jQuery('#display_stage_background').remove();

                // simulate click on Qualtrics "next" button, making use of the Qualtrics JS API
                qthis.clickNextButton();
            }
        });
    }
});

Qualtrics.SurveyEngine.addOnReady(function () {
    /*Place your JavaScript here to run when the page is fully displayed*/

});

Qualtrics.SurveyEngine.addOnUnload(function () {
    /*Place your JavaScript here to run when the page is unloaded*/
    g = undefined;
});