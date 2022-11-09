<script>
  $: tabsandiframes = [{ id: 1, src: "https://bing.com" }];

  function newTabAndIframe(id, src) {
    tabsandiframes.push({ id: id, src: src });
    tabsandiframes = tabsandiframes;
  }
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
</script>

<div id="sidebar">
  <form id="urlbar">
    <input />
  </form>

  {#each tabsandiframes as tabandiframe}
    <div
      class="tab"
      id={"tab" + tabandiframe.id}
      on:click={openTabAndIframe(tabandiframe.id)}
      on:keypress={void 0}
    >
      <img
        alt="Tab Icon"
        src={"https://s2.googleusercontent.com/s2/favicons?domain_url=" +
          tabandiframe.src}
        class="tabfavicon"
      />
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
  <iframe id={tabandiframe.id} title="iframe" src={tabandiframe.src} />
{/each}

<div id="scripts">
  <script src="./index.js"></script>
  <script src="./uv/uv.bundle.js"></script>
  <script src="./uv/uv.config.js"></script>
  <script src="tabs.js"></script>
</div>
