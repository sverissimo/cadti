//@ts-check
function isDateExpired(dateString) {
    let date = new Date(dateString)
    let currentDate = new Date()
    date.setHours(0, 0, 0, 0)
    currentDate.setHours(0, 0, 0, 0)
    if (date.getTime() < currentDate.getTime()) {
        return true
    } else {
        return false
    }
}

module.exports = { isDateExpired }
