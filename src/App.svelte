<script>
  import { clickOutside } from "./clickOutside.js";
  import Contextmenu from "./contextmenu.svelte";

  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  $: tabsandiframes = [];
  $: pinnedtabsandiframes = [];

  let nextid = 4;
  let newnextid = "";
  var tabOrder = new Array();

  let topsearchbarurl = "";
  let newtabsearchbarurl = "";

  function go(value) {
    let iframe = document.querySelector("iframe.active");
    window.navigator.serviceWorker
      .register("./sw.js", {
        scope: __uv$config.prefix,
      })
      .then(() => {
        let url = value.trim();
        if (!isUrl(url)) url = "https://www.google.com/search?q=" + url;
        else if (!(url.startsWith("https://") || url.startsWith("http://")))
          url = "https://" + url;
        iframe.style.display = "block";
        iframe.src = __uv$config.prefix + __uv$config.encodeUrl(url);
        var iframeurl = iframe.src.substring(
          iframe.src.indexOf(__uv$config.prefix) + __uv$config.prefix.length
        );
        iframeurl = __uv$config.decodeUrl(iframeurl);
        getIframeFavicon(iframeurl);
        if (iframeurl.includes("?q=")) {
          iframeurl = iframeurl.substring(iframeurl.indexOf("?q=") + 3);
        }
        topsearchbarurl = iframeurl;
      });

    function isUrl(val = "") {
      if (
        /^http(s?):\/\//.test(val) ||
        (val.includes(".") && val.substr(0, 1) !== " ")
      )
        return true;
      return false;
    }
  }

  async function getIframeFavicon(value) {
    if (
      typeof document.querySelector(".tab.active") !== "undefined" &&
      document.querySelector(".tab.active") !== null
    ) {
      document.querySelector(".tab.active .tabfavicon").src =
        "https://s2.googleusercontent.com/s2/favicons?domain_url=" + value;
    } else {
      document.querySelector(".pinnedtab.active .tabfavicon").src =
        "https://s2.googleusercontent.com/s2/favicons?domain_url=" + value;
    }
  }

  function newTabAndIframe(url) {
    newnextid = nextid;
    let newtabsandiframes = [...tabsandiframes, newnextid];

    tabsandiframes = newtabsandiframes;
    nextid = nextid + 1;
  }

  function openTabAndIframe(id) {
    if (tabOrder.indexOf(id) > -1) {
      tabOrder.splice(tabOrder.indexOf(id), 1);
    }
    tabOrder[tabOrder.length] = id;

    if (
      typeof document.querySelector("iframe.active") !== "undefined" &&
      document.querySelector("iframe.active") !== null
    ) {
      document.querySelector("iframe.active").style.display = "none";
      document.querySelector("iframe.active").classList.remove("active");
    }

    var iframes = document.querySelectorAll("iframe");
    iframes.forEach((elmnt) => {
      elmnt.style.display = "none";
    });
    var iframe = document.getElementById(id);
    iframe.classList.add("active");
    var url = iframe.src.substring(
      iframe.src.indexOf(__uv$config.prefix) + __uv$config.prefix.length
    );
    url = __uv$config.decodeUrl(url);
    if (url.includes("?q=")) {
      url = url.substring(url.indexOf("?q=") + 3);
    }
    topsearchbarurl = url;
    var tabs = document.querySelectorAll(".tab");
    tabs.forEach((elmnt) => (elmnt.className = "tab"));
    var pinnedtabs = document.querySelectorAll(".pinnedtab");
    pinnedtabs.forEach((elmnt) => (elmnt.className = "pinnedtab"));
    if (iframe.src !== "") {
      iframe.style.display = "block";
    }
    var tab = document.getElementById("tab" + id);
    tab.className += " active";
  }

  function closeTabAndIframe(id) {
    // var tab = document.getElementById("tab" + id);
    // var iframe = document.getElementById(id);
    // tab.outerHTML = "";
    // iframe.outerHTML = "";

    console.log(tabsandiframes.indexOf(id));
    tabsandiframes.splice(tabsandiframes.indexOf(id), 1);

    tabsandiframes = tabsandiframes;

    tabOrder.splice(tabOrder.indexOf(id), 1);
    openTabAndIframe(tabOrder.slice(-1)[0]);
  }

  function generatePinnedTabsAndIfranes() {
    pinnedtabsandiframes = [1, 2, 3];
  }

  let dark = false;

  let colorTheme = getCookie("colorTheme");
  if (colorTheme == "light") {
    lightMode();
  } else if (colorTheme == "dark") {
    darkMode();
  } else {
    darkMode();
  }

  function lightMode() {
    setCookie("colorTheme", "light", "365");
    dark = false;
  }

  function darkMode() {
    setCookie("colorTheme", "dark", "365");
    dark = true;
  }
</script>

<Contextmenu />

<div id="sidebar">
  <form on:submit|preventDefault={() => go(topsearchbarurl)} id="urlbar">
    <input bind:value={topsearchbarurl} placeholder="Search or type a URL" />
  </form>

  <div id="pinnedtabs">
    {#each pinnedtabsandiframes as pinnedtabandiframe}
      <div
        id={"tab" + pinnedtabandiframe}
        on:click={() => openTabAndIframe(pinnedtabandiframe)}
        on:keypress={void 0}
        class="pinnedtab"
      >
        <img alt="Tab Icon" src="img/tabfavicon.png" class="tabfavicon" />
      </div>
    {/each}
  </div>

  <div id="sidebarspacer" />

  <div
    id="newtabbutton"
    on:click={() =>
      (document.querySelector("#newtaburlbarbg").style.display = "initial")}
    on:click={() => (newtabsearchbarurl = "")}
    on:click={() => document.querySelector("#newtaburlbarbg input").select()}
    on:keypress={void 0}
  >
    <img alt="new tab" src="./img/newtab.png" />
    <p>New Tab</p>
  </div>

  {#each tabsandiframes as tabandiframe, i (tabandiframe)}
    <div
      class="tab"
      id={"tab" + tabandiframe}
      on:click={() => openTabAndIframe(tabandiframe)}
      on:keypress={void 0}
    >
      <img alt="Tab Icon" src="img/tabfavicon.png" class="tabfavicon" />
      <p>Tab</p>
      <img
        on:click={() => closeTabAndIframe(tabandiframe)}
        on:keydown={void 0}
        alt="Close tab"
        src="img/closetab.png"
        class="invert tabclose"
        listener="true"
      />
    </div>
  {/each}
</div>

<div id="newtaburlbarbg">
  <form
    on:submit|preventDefault={() => newTabAndIframe()}
    on:submit={() =>
      (document.querySelector("#newtaburlbarbg").style.display = "none")}
    on:submit={() => openTabAndIframe(newnextid)}
    on:submit={() => go(newtabsearchbarurl)}
    use:clickOutside
    on:click_outside={() =>
      (document.querySelector("#newtaburlbarbg").style.display = "none")}
    id="newtaburlbar"
  >
    <div id="newtaburlbardiv">
      <img src="img/search.png" alt="Search" />
      <input
        placeholder="Search or Enter URL..."
        bind:value={newtabsearchbarurl}
      />
    </div>
  </form>
</div>

<div id="thingbelowtheiframe" />

{#each pinnedtabsandiframes as pinnedtabandiframe}
  <iframe id={pinnedtabandiframe} title="iframe" />
{/each}

{#each tabsandiframes as tabandiframe, i (tabandiframe)}
  <iframe id={tabandiframe} title="iframe" />
{/each}

<div
  id="themeselector"
  use:clickOutside
  on:click_outside={() =>
    (document.querySelector("#themeselector").style.display = "none")}
>
  <img
    on:click={() => lightMode()}
    on:keypress={() => void 0}
    alt="light"
    src="https://img.icons8.com/fluency-systems-regular/96/null/sun--v1.png"
  />

  <img
    on:click={() => darkMode()}
    on:keypress={() => void 0}
    alt="dark"
    src="https://img.icons8.com/fluency-systems-regular/96/null/bright-moon.png"
  />
</div>

<svelte:window
  on:load={() => generatePinnedTabsAndIfranes()}
  on:load={() => openTabAndIframe(1)}
/>

<svelte:head>
  {#if dark}
    <link rel="stylesheet" href="darkvars.css" />
  {/if}
</svelte:head>
