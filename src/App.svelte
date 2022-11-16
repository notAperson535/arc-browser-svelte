<script>
  $: tabsandiframes = [];
  $: pinnedtabsandiframes = [];

  let nextid = 4;
  let newnextid = "";
  var tabOrder = new Array();

  $: console.log(newnextid);

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
          iframe.src.indexOf("/service/") + 9
        );
        iframeurl = __uv$config.decodeUrl(iframeurl);
        getIframeFavicon(iframeurl);
        if (iframeurl.includes("?q=")) {
          iframeurl = iframeurl.substring(iframeurl.indexOf("?q=") + 3);
        }
        topsearchbarurl = iframeurl;
        newtabsearchbarurl = iframeurl;
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
    var url = __uv$config.decodeUrl(iframe.src);
    document.querySelector("#urlbar input").value = url.substring(
      url.indexOf("https://") + 0
    );
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
</script>

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
      (document.querySelector("#commandpalette").style.display = "initial")}
    on:click={() => (newtabsearchbarurl = "")}
    on:keypress={void 0}
  >
    <img alt="new tab" src="./img/newtab.png" />
    <p>New Tab</p>
  </div>

  {#each tabsandiframes as tabandiframe}
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

<div id="commandpalette">
  <div
    on:keypress={void 0}
    on:click={() =>
      (document.querySelector("#commandpalette").style.display = "none")}
    id="newtaburlbarbg"
  />
  <form
    on:submit|preventDefault={() => newTabAndIframe()}
    on:submit={() =>
      (document.querySelector("#commandpalette").style.display = "none")}
    on:submit={() => openTabAndIframe(newnextid)}
    on:submit={() => go(newtabsearchbarurl)}
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

{#each tabsandiframes as tabandiframe}
  <iframe id={tabandiframe} title="iframe" />
{/each}

<svelte:window on:load={() => generatePinnedTabsAndIfranes()} />
