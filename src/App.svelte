<script>
  $: tabsandiframes = [{ id: 1 }];
  let nextid = 2;

  function newTabAndIframe(id, src) {
    tabsandiframes.push({ id: id, src: src });
    tabsandiframes = tabsandiframes;
  }
  function openTabAndIframe(id, src, isactive) {
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
</script>

<div id="sidebar">
  <form id="urlbar">
    <input />
  </form>

  <div id="pinnedtabs" />

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
      id={"tab" + tabandiframe.id}
      on:click={() => openTabAndIframe(tabandiframe.id)}
      on:keypress={void 0}
    >
      <img alt="Tab Icon" src="" class="tabfavicon" />
      <p>Tab</p>
      <img
        alt="Close tab"
        src="img/closetab.png"
        class="invert tabclose"
        listener="true"
      />
    </div>
  {/each}
</div>

{#each tabsandiframes as tabandiframe}
  <iframe id={tabandiframe.id} title="iframe" />
{/each}

<div id="scripts">
  <script src="index.js"></script>
</div>

<svelte:window on:load={() => openTabAndIframe(1)} />
