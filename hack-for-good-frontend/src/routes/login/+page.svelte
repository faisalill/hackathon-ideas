<script>
  import { initializeApp } from "firebase/app";
  import {
    GoogleAuthProvider,
    getAuth,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
  } from "firebase/auth";
  import { onMount } from "svelte";
  import { authData } from "../../stores/store.js";
  import { goto } from "$app/navigation";

  export let data;

  let app, auth;

  onMount(() => {
    app = initializeApp(data.firebaseCredentials);
    auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      if (user) {
        $authData = {
          authenticated: true,
          user: user,
          auth: auth,
          app: app,
        };
      } else {
        $authData = {
          authenticated: false,
          user: null,
          auth: null,
        };
      }
    });
  });

  const provider = new GoogleAuthProvider();
</script>

<div class="hero min-h-screen">
  <div class="hero-overlay bg-opacity-60" />
  <div class="hero-content text-center text-neutral-content">
    <div class="max-w-md relative bottom-20">
      <h1 class="mb-5 text-5xl relative bottom-4 font-bold">Welcome!!!!</h1>
      {#if !$authData.authenticated}
        <p class="mb-5 text-lg">
          Please Login with your Google account to get started.
        </p>
      {/if}
      {#if $authData.authenticated}
        <p class="mb-5 text-lg">
          You are logged in as <span class="text-secondary">{$authData.user.displayName}</span> 
        </p>
      {/if}
      {#if !$authData.authenticated}
        <button
          class="btn m-2 text-xl"
          on:click={() => {
            signInWithPopup(auth, provider)
              .then((result) => {
                // The signed-in user info.
                const user = result.user;
                $authData = {
                  authenticated: true,
                  user: user,
                  auth: auth,
                  app: app,
                };
              })
              .catch((error) => {
                console.log(error);
                const errorMessage = error.message;
              });
          }}
          >Login <img src="/google.svg" height="30" width="30" />
        </button>
      {/if}
      {#if $authData.authenticated}
        <button
          class="btn"
          on:click={() => {
            signOut(auth).then(() => {
              $authData = {
                authenticated: false,
                user: null,
                auth: null,
              };
            });
          }}
        >
          Sign Out
        </button>
      {/if}
      <button
        class="btn m-2 "
        on:click={()=>{
          goto("/")
        }}
        >
          Go Home
        </button>
    </div>
  </div>
</div>
