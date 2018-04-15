/**
    Copyright 2017 Amazon.com, Inc. and its affiliates. All Rights Reserved.
    Licensed under the Amazon Software License (the "License").
    You may not use this file except in compliance with the License.
    A copy of the License is located at
      http://aws.amazon.com/asl/
    or in the "license" file accompanying this file. This file is distributed
    on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, express
    or implied. See the License for the specific language governing
    permissions and limitations under the License.
    This skill demonstrates how to use Dialog Management to delegate slot
    elicitation to Alexa. For more information on Dialog Directives see the
    documentation: https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html
    This skill also uses entity resolution to define synonyms. Combined with
    dialog management, the skill can ask the user for clarification of a synonym
    is mapped to two slot values.
 **/


"use strict";
const Alexa = require("alexa-sdk");

// For detailed tutorial on how to make an Alexa skill,
// please visit us at http://alexa.design/build

let handlers = {
    "LaunchRequest": function () {
        console.log("in LaunchRequest");
        this.response.speak("Welcome to Course Advisor. I will recommend the best course for you. Do you want a lower division or upper division course?");
        this.response.listen("Do you want a lower division or upper division course?");
        this.emit(":responseReady");
    },
    "LowerDivIntent": function () {

        this.response.speak("There are 4 essential lower division courses. You can take C.S. 61 A., C.S. 61 B., C.S. 61 C., or C.S. 70. I hope you have a better idea of what classes you might be interested in. Enjoy!");
        this.emit(":responseReady");
    },
    "UpperDivIntent": function () {
        // delegate to Alexa to collect all the required slots

        let filledSlots = delegateSlotCollection.call(this);

        if (!filledSlots) {
            return;
        }

        console.log("filled slots: " + JSON.stringify(filledSlots));
        // at this point, we know that all required slots are filled.
        let slotValues = getSlotValues(filledSlots);

        console.log(JSON.stringify(slotValues));

        let key = `${slotValues.topicImportance.resolved}-${slotValues.time.resolved}-${slotValues.interaction.resolved}-${slotValues.internship.resolved}`;
        let occupation = options[slotsToOptionsMap[key]];

        console.log("look up key: ", key, "object: ", occupation);

        let speechOutput = "Given that you are interested in " + slotValues.topicImportance.resolved +
                ", you want a course with a " + slotValues.time.resolved +
                " time commitment, you like working " + (slotValues.interaction.resolved === "groups" ? "in groups" : "individually" ) +
                "  and relevance to internships is " + slotValues.internship.resolved +
                " to you, you should consider taking " + occupation.name + 
                ". " + occupation.description + ". Enjoy your courses!";

        console.log("Speech output: ", speechOutput);
        this.response.speak(speechOutput);
        this.emit(":responseReady");
    },
    "SessionEndedRequest": function () {
        console.log("Session ended with reason: " + this.event.request.reason);
    },
    "AMAZON.StopIntent": function () {
        this.response.speak("Bye");
        this.emit(":responseReady");
    },
    "AMAZON.HelpIntent": function () {
        this.response.speak("This is Course Advisor. I can help you find a computer science course to take. " +
           "You can say, recommend a course.").listen("recommend a course");
        this.emit(":responseReady");
    },
    "AMAZON.CancelIntent": function () {
        this.response.speak("Bye");
        this.emit(":responseReady");
    },
    "AMAZON.RecommendIntent": function () {
        this.response.speak("Do you want a lower division or upper division course?");
        this.response.listen("Do you want a lower division or upper division course?");
        this.emit(":responseReady");
    },
    "Unhandled": function () {
        this.response.speak("Sorry, I didn't get that. You can try: 'alexa, tell Course Advisor to" +
            " recommend a course.'");
    }
};

exports.handler = function (event, context) {

    // Each time your lambda function is triggered from your skill,
    // the event's JSON will be logged. Check Cloud Watch to see the event.
    // You can copy the log from Cloud Watch and use it for testing.
    console.log("====================");
    console.log("REQUEST: " + JSON.stringify(event));
    console.log("====================");
    let alexa = Alexa.handler(event, context);

    // Part 3: Task 4
    // alexa.dynamoDBTableName = 'petMatchTable';
    alexa.registerHandlers(handlers);
    alexa.execute();
};


const REQUIRED_SLOTS = [
    "internship",
    "interaction",
    "time",
    "topicImportance"
];

const slotsToOptionsMap = {
    "software-heavy-individually-unimportant": 3,
    "software-heavy-individually-important": 5,
    "software-heavy-groups-unimportant": 2,
    "software-heavy-groups-important": 3,
    "software-light-individually-unimportant": 4,
    "software-light-individually-important": 5,
    "software-light-groups-unimportant": 6,
    "software-light-groups-important": 7,
    "theory-heavy-individually-unimportant": 8,
    "theory-heavy-individually-important": 9,
    "theory-heavy-groups-unimportant": 10,
    "theory-heavy-groups-important": 9,
    "theory-light-individually-unimportant": 12,
    "theory-light-individually-important": 13,
    "theory-light-groups-unimportant": 12,
    "theory-light-groups-important": 13,
    "application-heavy-individually-unimportant": 16,
    "application-heavy-individually-important": 17,
    "application-heavy-groups-unimportant": 18,
    "application-heavy-groups-important": 18,
    "application-light-individually-unimportant": 17,
    "application-light-individually-important": 17,
    "application-light-groups-unimportant": 19,
    "application-light-groups-important": 19
};

const options = [
    {"name": "Blank", "description": ""},
    {"name": "Animal Control Worker", "description": ""},
    {"name": "C.S. 160", "description": "C.S. 160 teaches an introduction to human-computer interaction and user interface design. The course covers how to prototype, evaluate, and design user interfaces."},
    {"name": "C.S. 162", "description": "C.S. 162 teaches operating systems. This course covers operating systems, systems programming, networked and distributed systems, and storage systems."},
    {"name": "C.S. 164", "description": "C.S. 164 teaches programming languages and compilers. This course covers the design of programming languages and the implementation of translators for them."},
    {"name": "C.S. 161", "description": "C.S. 161 teaches computer security. This course covers security in a variety of domains, including the web, networking, operating systems, and cryptography."},
    {"name": "C.S. 169", "description": "C.S. 169 teaches software engineering. This course covers processes for software development, design patterns, and testing methodologies."},
    {"name": "C.S. 168", "description": "C.S. 168 teaches an introduction to the internet. This course covers topics such as layering, addressing, intradomain routing, interdomain routing, reliable delivery, congestion control, and the core protocols."},
    {"name": "C.S. 174", "description": "C.S. 174 teaches combinatorics and discrete probability. This course covers topics such as markov chains, probability distributions, and graph algorithms."},
    {"name": "C.S. 170", "description": "C.S. 170 teaches efficient algorithms and intractable problems. This course covers topics such as algorithm design, algorithmic proofs, and running time analysis."},
    {"name": "C.S. 172", "description": "C.S. 172 teaches computability and complexity. This course covers three main areas: automata theory, computability theory, and complexity theory."},
    {"name": "Blank", "description": ""},
    {"name": "C.S. 191", "description": "C.S. 191 teaches quantum information science and technology. This course provides a broad introduction to quantum computation theory, quantum algorithms, and physical implementations."},
    {"name": "C.S. 176", "description": "C.S. 176 teaches algorithms for computational biology. This course covers topics such as genome searching, DNA alignment, evolutionary tree of life, and detecting coding regions."},
    {"name": "Blank", "description": ""},
    {"name": "Blank", "description": ""},
    {"name": "C.S. 189", "description": "C.S. 189 teaches an introduciton to machine learning. This course covers topics such as supervised methods for regression and classification, generative and discriminative probabilistic models, and Bayesian parametric learning"},
    {"name": "C.S. 186", "description": "C.S. 186 teaches an introduction to database systems. This course covers topics such as database design and application."},
    {"name": "C.S. 184", "description": "C.S. 184 teaches foundations of computer graphics. This course covers topics such as object hiearchies, interactive input techniques, and animation."},
    {"name": "C.S. 188", "description": "C.S. 188 teaches an introduciton to artificial intelligence. This course covers basic ideas and techniques underlying the design of intelligent computer systems with a specific emphasis on the statistical and decision-theoretic modeling paradigm."},
    {"name": "Blank", "description": ""}
];

// ***********************************
// ** Helper functions from
// ** These should not need to be edited
// ** www.github.com/alexa/alexa-cookbook
// ***********************************

// ***********************************
// ** Dialog Management
// ***********************************

function getSlotValues(filledSlots) {
    //given event.request.intent.slots, a slots values object so you have
    //what synonym the person said - .synonym
    //what that resolved to - .resolved
    //and if it's a word that is in your slot values - .isValidated
    let slotValues = {};

    console.log("The filled slots: " + JSON.stringify(filledSlots));
    Object.keys(filledSlots).forEach(function (item) {

        // console.log("item in filledSlots: "+JSON.stringify(filledSlots[item]));

        let name = filledSlots[item].name;
        //console.log("name: "+name);

        if (filledSlots[item] &&
             filledSlots[item].resolutions &&
             filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
             filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
             filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {

            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
            case "ER_SUCCESS_MATCH":
                slotValues[name] = {
                    "synonym": filledSlots[item].value,
                    "resolved": filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                    "isValidated": true
                };
                break;
            case "ER_SUCCESS_NO_MATCH":
                slotValues[name] = {
                    "synonym": filledSlots[item].value,
                    "resolved": filledSlots[item].value,
                    "isValidated":false
                };
                break;
            }
        } else {
            slotValues[name] = {
                "synonym": filledSlots[item].value,
                "resolved": filledSlots[item].value,
                "isValidated": false
            };
        }
    },this);

    //console.log("slot values: "+JSON.stringify(slotValues));
    return slotValues;
}

// This function delegates multi-turn dialogs to Alexa.
// For more information about dialog directives see the link below.
// https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html
function delegateSlotCollection() {
    console.log("in delegateSlotCollection");
    console.log("current dialogState: " + this.event.request.dialogState);

    if (this.event.request.dialogState === "STARTED") {
        console.log("in STARTED");
        console.log(JSON.stringify(this.event));
        let updatedIntent = this.event.request.intent;
        // optionally pre-fill slots: update the intent object with slot values
        // for which you have defaults, then return Dialog.Delegate with this
        // updated intent in the updatedIntent property

        disambiguateSlot.call(this);
        console.log("disambiguated: " + JSON.stringify(this.event));
        this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
        console.log("in not completed");
        let updatedIntent = this.event.request.intent;
        //console.log(JSON.stringify(this.event));

        disambiguateSlot.call(this);
        this.emit(":delegate", updatedIntent);
    } else {
        console.log("in completed");
        //console.log("returning: "+ JSON.stringify(this.event.request.intent));
        // Dialog is now complete and all required slots should be filled,
        // so call your normal intent handler.
        return this.event.request.intent.slots;
    }
    return null;
}

// If the user said a synonym that maps to more than one value, we need to ask
// the user for clarification. Disambiguate slot will loop through all slots and
// elicit confirmation for the first slot it sees that resolves to more than
// one value.
function disambiguateSlot() {
    let currentIntent = this.event.request.intent;
    let prompt = "";
    Object.keys(this.event.request.intent.slots).forEach(function (slotName) {
        let currentSlot = currentIntent.slots[slotName];
        // let slotValue = slotHasValue(this.event.request, currentSlot.name);
        if (currentSlot.confirmationStatus !== "CONFIRMED" &&
            currentSlot.resolutions &&
            currentSlot.resolutions.resolutionsPerAuthority[0]) {

            if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_MATCH") {
                // if there's more than one value that means we have a synonym that
                // mapped to more than one value. So we need to ask the user for
                // clarification. For example if the user said "mini dog", and
                // "mini" is a synonym for both "small" and "tiny" then ask "Did you
                // want a small or tiny dog?" to get the user to tell you
                // specifically what type mini dog (small mini or tiny mini).
                if (currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 1) {
                    prompt = "Which would you like";
                    let size = currentSlot.resolutions.resolutionsPerAuthority[0].values.length;
                    currentSlot.resolutions.resolutionsPerAuthority[0].values.forEach(function (element, index, arr) {
                        prompt += ` ${(index === size - 1) ? " or" : " "} ${element.value.name}`;
                    });

                    prompt += "?";
                    let reprompt = prompt;
                    // In this case we need to disambiguate the value that they
                    // provided to us because it resolved to more than one thing so
                    // we build up our prompts and then emit elicitSlot.
                    this.emit(":elicitSlot", currentSlot.name, prompt, reprompt);
                }
            } else if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code === "ER_SUCCESS_NO_MATCH") {
                // Here is where you'll want to add instrumentation to your code
                // so you can capture synonyms that you haven't defined.
                console.log("NO MATCH FOR: ", currentSlot.name, " value: ", currentSlot.value);

                if (REQUIRED_SLOTS.indexOf(currentSlot.name) > -1) {
                    prompt = "What " + currentSlot.name + " are you looking for";
                    this.emit(":elicitSlot", currentSlot.name, prompt, prompt);
                }
            }
        }
    }, this);
}

// Given the request an slot name, slotHasValue returns the slot value if one
// was given for `slotName`. Otherwise returns false.
function slotHasValue(request, slotName) {

    let slot = request.intent.slots[slotName];

    // uncomment if you want to see the request
    // console.log("request = "+JSON.stringify(request));
    let slotValue;

    // if we have a slot, get the text and store it into speechOutput
    if (slot && slot.value) {
        // we have a value in the slot
        slotValue = slot.value.toLowerCase();
        return slotValue;
    } else {
        // we didn't get a value in the slot.
        return false;
    }
}