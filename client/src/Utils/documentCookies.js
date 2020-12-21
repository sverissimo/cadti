export function setCookie(cname, cvalue) {
    let d = new Date(), time = 20 * 60 * 1000
    d.setTime(d.getTime() + time)
    d = d.toUTCString()

    document.cookie = `${cname}=${cvalue}; expires=${d}; path=/`;
}

export function deleteCookie(name) {
    let d = new Date()
    d.setTime(10)
    document.cookie = `${name}=; expires=${d.toUTCString()}; path=/`
}

export function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
