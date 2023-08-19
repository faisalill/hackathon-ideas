<script>
  import "../../node_modules/mapbox-gl/dist/mapbox-gl.css";
  import "../app.css";
  import {goto} from '$app/navigation'
  import "iconify-icon";
</script>

<!-- <div class="navbar bg-neutral rounded">
  <div class="navbar-start" />
  <div class="navbar-center">
    <a href="/" class="btn btn-ghost normal-case text-xl">Hack For Good</a>
  </div>
  <div class="navbar-end" />
</div> -->

<div class="navbar bg-base-100">
  <div class="navbar-start">
    <div class="dropdown">
      <label tabindex="0" class="btn btn-ghost btn-circle">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h7"
          /></svg
        >
      </label>
      <ul
        tabindex="0"
        class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-primary rounded-box w-52"
      >
        <li><button
          class="btn-primary m-1"
          on:click={()=>{
            goto('/')
          }}
          >Home</button></li>
        <li><button
          class="btn-primary m-1"
          on:click={()=>{
            goto('/map')
          }}
          >Map</button></li>

        <li><button
          class="btn-primary m-1"
          on:click={()=>{
            goto('/login')
          }}
          >Login</button></li>

          <li><button
            class="btn-primary m-1"
            on:click={()=>{
              goto('/poll')
            }}
            >Poll</button></li>
      </ul>
    </div>
  </div>
  <div class="navbar-center">
    <button class="btn btn-ghost normal-case text-xl"
    on:click={()=>{
      goto('/')
    }}
    >Hack For Good</button>
  </div>
  <div class="navbar-end">
    <button class="btn btn-ghost btn-circle"
    on:click={()=>{
      goto('/login')
    }}
    >
      <iconify-icon
            class="text-2xl"
            icon="material-symbols:account-circle-full"
          />
    </button>
  </div>
</div>

<slot />
