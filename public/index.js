var time = new Date().getTime();

function refresh() {
    if (new Date().getTime() - time >= 5000)
        window.location.reload(true);
    else
        setTimeout(refresh, 1000);
}

setTimeout(refresh, 1000);