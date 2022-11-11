<script>
  $: tabsandiframes = [1];
  let nextid = 2;
  var tabOrder = new Array();

  function newTabAndIframe(id, src) {
    tabsandiframes.push(id);
    tabsandiframes = tabsandiframes;
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

    const index = tabsandiframes.indexOf(id);
    if (index > -1) {
      tabsandiframes.splice(index, 1);
    }

    tabOrder.splice(tabOrder.indexOf(id), 1);
    openTabAndIframe(tabOrder.slice(-1)[0]);

    tabsandiframes = tabsandiframes;
  }
</script>

<div id="sidebar">
  <form id="urlbar">
    <input />
  </form>

  <div id="pinnedtabs"><div class="pinnedtab" /></div>

  <div
    id="newtabbutton"
    on:click={() => newTabAndIframe(nextid)}
    on:click={() => (nextid = nextid + 1)}
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
      <img alt="Tab Icon" src="" class="tabfavicon" />
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

<div id="thingbelowtheiframe" />

{#each tabsandiframes as tabandiframe}
  <iframe id={tabandiframe} title="iframe" />
{/each}

<div id="scripts">
  <script src="index.js"></script>
</div>

<svelte:window on:load={() => openTabAndIframe(1)} />
