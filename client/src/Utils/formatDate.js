const formatDate = (date) => {

    /* const minutes = () => {
        if (new Date(date).getMinutes() < 10) {
            return '0'+new Date(date).getMinutes()
        } else {
            return new Date(date).getMinutes()
        }
    } */

    if (/\d/.test(date)) {
        return new Date(date).getDate() + '/' + (new Date(date).getMonth() + 1) + '/' + new Date(date).getFullYear()// + ', ' + new Date(date).getHours() + ':' + minutes() + 'h'
    } else {
        return date
    }
}

export default formatDate;