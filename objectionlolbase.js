var base_frame_json = {
    id: -1,
    iid: 0, // edit
    text: "", // edit
    poseId: 0, // edit
    pairPoseId: null,
    bubbleType: 0,
    username: "", // edit
    mergeNext: false,
    doNotTalk: false,
    keepDialogue: false,
    goNext: false,
    poseAnimation: true,
    flipped: null,
    blip: null,
    frameActions: [],
    frameFades: [],
    characterId: null,
    popupId: null,
    pairId: null,
    transition: null,
    filter: null
}

var base_case_json = {
    type: "scene",
    options: {
        chatbox: 0,
        textSpeed: 28,
        textBlipFrequency: 56,
        autoplaySpeed: 500,
        continueSoundUrl: ""
    },
    groups: [
        {
            iid: 1,
            name: "Main",
            type: "n",
            frames: []
        }
    ],
    courtRecord: {
        evidence: [],
        profiles: []
    },
    aliases: [],
    pairs: [],
    version: 4
}

var message_template
var generated_messages
var download_file
var characters_container
var options_template

var characters = {}

window.onload = () => {
    message_template = document.getElementById("message_template").content.firstElementChild
    character_template = document.getElementById("character_template").content.firstElementChild
    generated_messages = document.getElementById("generated_messages")
    download_file = document.getElementById("download_file")
    characters_container = document.getElementById("characters")
}

function generate_messages(messages) {
    if (generated_messages.children.length != 1)
        if (!confirm("There are some messages present, this will override them\nAre you sure you want to continue?"))
            return
    let childCount = generated_messages.childElementCount
    for (let i = 1; i < childCount; i++) {
        generated_messages.children[1].remove()
    }
    messages.forEach(message => {
        let author = message[1]
        let text = message[2].split("\n").filter(m => m)
        if (text.length == 0) {
            text = [""]
        }
        text.forEach(p => {
            insert_message(author, p, null)
        })
    });
}

function insert_message(author, text, beforeNode) {
    if (author !== null)
        new_character(author, false)

    let generated_message = message_template.cloneNode(true)
    let message = generated_message.getElementsByClassName("message")[0]
    message.children["author"].innerHTML = '<option value="' + author + '">' + author + '</option>'
    message.children["text"].value = text
    generated_messages.insertBefore(generated_message, beforeNode)
    update_messages_author_options()
}

function new_message(button) {
    insert_message(null, "", button.parentElement.nextSibling)
}

function new_character(name, renameIfPresent) {
    let i = 0
    let og_name = name
    while (name in characters) {
        if (!renameIfPresent)
            return
        i++
        name = og_name + " (" + i + ")"
    }
    let character = character_template.cloneNode(true)
    characters[name] = character
    character.children["name"].value = name
    characters_container.appendChild(character)
    update_messages_author_options()
}

function delete_character(button) {
    button.parentElement.remove();
    delete characters[button.parentElement.children["name"].value]
    update_messages_author_options()
}

function on_character_name_changed(new_name, character) {
    Object.keys(characters).forEach(c => {
        if (characters[c] === character) {
            delete characters[c]
            characters[new_name] = character
            update_messages_author_options(c)
        }
    })
}

function update_messages_author_options(old_name = null) {
    let messages = generated_messages.getElementsByClassName("message")
    for (let i = 0; i < messages.length; i++) {
        let m = messages[i];
        let selected_author = m.children["author"].value
        m.children["author"].innerHTML = ""
        Object.keys(characters).forEach(c => {
            let option = '<option value="' + c + '"'
            if (selected_author == c || selected_author == old_name) {
                option += " selected "
            }
            option += '>' + c + '</option>'

            m.children["author"].innerHTML += option
        })
    }
}

function move_up(button) {
    let message = button.closest(".message_container").parentElement
    if (message.previousElementSibling.previousElementSibling !== null)
        move(message, message.previousElementSibling)
}

function move_down(button) {
    let message = button.closest(".message_container").parentElement
    if (message.nextElementSibling !== null)
        move(message, message.nextElementSibling.nextElementSibling)
}

function move(message, beforeNode) {
    message.parentElement.insertBefore(message, beforeNode)
}

function download_output() {
    let output = structuredClone(base_case_json)
    let messages = generated_messages.getElementsByClassName("message")
    for (let i = 0; i < messages.length; i++) {
        let m = messages[i];
        let author = m.children["author"].value
        let text = m.children["text"].value
        let frame = structuredClone(base_frame_json)
        frame.text = text
        frame.username = author
        frame.iid = i + 1
        frame.poseId = parseInt(characters[author].children["character"].value)
        output.groups[0].frames.push(frame)
    }
    let encoded_output = btoa(unescape(encodeURIComponent(JSON.stringify(output))))
    download_file.setAttribute("href", URL.createObjectURL(new Blob([encoded_output])))
    download_file.click()
}

function import_telegram() {
    let text = messages_textarea.value
    let messages = [...text.matchAll(/(.*?), \[.*?\]\n((?:.|\n)*?)(?=(?=\n\n.*?\[.*?\]\n)|$)/g)]
    if (messages.length == 0) {
        messages = [...text.matchAll(/(.*?):\n((?:.|\n)*?)(?=(?=\n\n.*?:\n)|$)/g)]
    }
    generate_messages(messages)
}

function import_discord() {
    let text = messages_textarea.value
    let messages = [...text.matchAll(/(.*?) — .*?\n((?:.|\n)*?)(?=(?=\n.*? — .*?\n)|$)/g)]
    generate_messages(messages)
}

function import_whatsapp() {
    let text = messages_textarea.value
    let messages = [...text.matchAll(/\[.*?\] (.*?): ((?:.|\n)*?)(?=(?=\n\[.*?\] (.*?):)|$)/g)]
    generate_messages(messages)
}

function import_generic() {
    let text = messages_textarea.value
    let messages = [...text.matchAll(/^()(.*?)$/gm)]
    generate_messages(messages)
}