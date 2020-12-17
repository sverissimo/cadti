import axios from 'axios'

const downloadFile = (id, originalName, collection, fieldName) => {
    if (fieldName && fieldName === 'apoliceDoc') collection = 'empresaDocs'
        axios({
            url: `/api/mongoDownload/?collection=${collection}&id=${id}`,
            method: 'GET',
            responseType: 'blob', // important
        }).then((response) => {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', originalName);
            document.body.appendChild(link);
            link.click();
        })
            .catch(err => {
                console.log(err)
                //          logout(err)
            })
}

export default downloadFile