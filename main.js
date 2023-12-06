to_eval = ""
is_result = false


function get_calcolatrice_output() {
    output = document.getElementById("calcolatrice_output");
}

function add_value(num) {
    if (is_result) {
        output.value = ""
        is_result = false
    }
    if ((output.value+num).length >= 13)
        return;
    output.value += num
}

function add_decimal_point() {
    if (!output.value.includes("."))
        output.value += "."
}

function remove_leading_zero(num) {
    return num*1;
}

function add_operator(op) {
    if (output.value === "") {
        if (to_eval === "")
            return;
        to_eval = to_eval.substring(0, to_eval.length-1)
    }
    
    to_eval += remove_leading_zero(output.value) + op
    output.value = ""
}

function calculate() {
    if (to_eval === "")
        return
    if (output.value === "")
        to_eval = to_eval.substring(0, to_eval.length-1)
    result = eval(to_eval + output.value)
    if (result.toString().length >= 13) {
        result = result.toExponential(7);
    }
    output.value = result
    to_eval = ""
    is_result = true
}

function del() {
    output.value = output.value.substring(0, output.value.length - 1)
}

function reset() {
    to_eval = ""
    output.value = ""
}
