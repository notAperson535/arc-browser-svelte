function openTabAndIframe(id) {
    var iframes = document.querySelectorAll("iframe");
    iframes.forEach((elmnt) => (elmnt.style.display = "none"));
    var iframe = document.getElementById(id);
    iframe.classList.add("active");
    var url = __uv$config.decodeUrl(iframe.src);
    document.querySelector("#urlbar input").value = url.substring(
        url.indexOf("https://") + 0
    );
    var tabs = document.querySelectorAll(".tab");
    tabs.forEach((elmnt) => (elmnt.className = "tab"));
    if (iframe.src !== "") {
        iframe.style.display = "block";
    }
    var tab = document.getElementById("tab" + id);
    tab.className += " active";
}

openTabAndIframe(1)