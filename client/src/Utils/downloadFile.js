import axios from 'axios'
//import { logout } from '../auth/logout';

const downloadFile = (id, originalName) => {
    
    axios({
        url: `/api/mongoDownload/${id}`,
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