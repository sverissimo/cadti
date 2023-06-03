//@ts-check
const header = require("./header")
const footer = require("./footer")
const { retrievePassTemplate } = require("./retrievePassTemplate");
const { confirmEmailTemplate } = require("./confirmEmailTemplate");
const newUserTemplate = require("./newUserTemplate");

module.exports = {
    header,
    footer,
    confirmEmailTemplate,
    retrievePassTemplate,
    newUserTemplate
}
