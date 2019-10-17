const formatFileSize = (bytes) => {

    if (bytes > 1024 && bytes < 1048576) {
        return Math.round(bytes / 1024) + ' KB'

    } else if (bytes >= 1048576 && bytes < (1048576 * 1024)) {
        return ((bytes / 1024) / 1024).toFixed(2) + ' MB'
    } else {
        return bytes + ' bytes'
    }
}

export default formatFileSize