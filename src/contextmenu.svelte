<script>
  // pos is cursor position when right click occur
  let pos = { x: 0, y: 0 };
  // menu is dimension (height and width) of context menu
  let menu = { h: 0, y: 0 };
  // browser/window dimension (height and width)
  let browser = { h: 0, y: 0 };
  // showMenu is state of context-menu visibility
  let showMenu = false;
  // to display some text
  let content;

  function rightClickContextMenu(e) {
    showMenu = true;
    browser = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    pos = {
      x: e.clientX,
      y: e.clientY,
    };
    // If bottom part of context menu will be displayed
    // after right-click, then change the position of the
    // context menu. This position is controlled by `top` and `left`
    // at inline style.
    // Instead of context menu is displayed from top left of cursor position
    // when right-click occur, it will be displayed from bottom left.
    if (browser.h - pos.y < menu.h) pos.y = pos.y - menu.h;
    if (browser.w - pos.x < menu.w) pos.x = pos.x - menu.w;
  }
  function onPageClick(e) {
    // To make context menu disappear when
    // mouse is clicked outside context menu
    showMenu = false;
  }
  function getContextMenuDimension(node) {
    // This function will get context menu dimension
    // when navigation is shown => showMenu = true
    let height = node.offsetHeight;
    let width = node.offsetWidth;
    menu = {
      h: height,
      w: width,
    };
  }
  function addItem() {
    content.textContent = "Add and item...";
  }
  function openThemeSelctor() {
    document.querySelector("#themeselector").style.display = "flex";
  }

  let menuItems = [
    {
      name: "theme",
      onClick: openThemeSelctor,
      displayText: "Theme...",
    },
  ];
</script>

{#if showMenu}
  <nav
    use:getContextMenuDimension
    style="position: absolute; top:{pos.y}px; left:{pos.x}px"
  >
    <div class="contextmenu" id="contextmenu">
      <ul>
        {#each menuItems as item}
          {#if item.name == "hr"}
            <hr />
          {:else}
            <li>
              <button on:click={item.onClick}>{item.displayText}</button>
            </li>
          {/if}
        {/each}
      </ul>
    </div>
  </nav>
{/if}

<svelte:window
  on:contextmenu|preventDefault={rightClickContextMenu}
  on:click={onPageClick}
/>

<style>
  * {
    padding: 0;
    margin: 0;
  }
  .contextmenu {
    position: relative;
    z-index: 1000000;
    display: inline-flex;
    border: 1px #999 solid;
    width: 125px;
    padding: 2.5px;
    background: var(--lighter-blur);
    border-radius: 5px;
    overflow: hidden;
    flex-direction: column;
    backdrop-filter: blur(20px);
  }
  ul li {
    display: block;
    list-style-type: none;
  }
  ul li button {
    font-size: 0.75rem;
    color: #222;
    width: 100%;
    height: 100%;
    text-align: left;
    border: 0px;
    background: none;
    display: flex;
    align-items: center;
    padding: 2.5px 5px;
  }
  ul li button:hover {
    color: #000;
    text-align: left;
    border-radius: 5px;
    background-color: rgba(83, 152, 255, 1);
    color: white !important;
  }
  hr {
    border: none;
    border-bottom: 1px solid #ccc;
    margin: 5px 0px;
  }
</style>
