function isNull(value) {
    return (
        value == null || value == undefined
    );
}

function isNotNull(value) {
    return !isNull(value)
}

module.exports = {
    isNull,
    isNotNull
}
