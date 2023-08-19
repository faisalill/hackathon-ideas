<script>
  import { authData } from "../../stores/store.js";
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
  } from "firebase/firestore";

  let db;
  let polls = [];
  let pollIds = [];

  onMount(async () => {
    if (!$authData.authenticated) {
      goto("/login");
    } else {
      db = getFirestore($authData.app);

      await getDocs(collection(db, "polls")).then((result) => {
        result.forEach((doc) => {
          pollIds = [...pollIds, doc.id];
          polls = [...polls, doc.data()];
        });
      });
    }
  });

  const modalHandler = {
    createPollModal: false,
    profileModal: false,
  };

  let pollInput = {
    pollName: "",
    pollType: "Select Theme",
    pollReason: "",
  };

  const pollType = {
    education: "Education",
    healthcare: "Healthcare",
    governance: "Governance",
    individual: "Individual",
    environment: "Environment",
  };

</script>

<div>
  <div class="grid grid-cols-1 md:place-items-center lg:grid-cols-2 xl:grid-cols-4 gap-4 p-8">
    {#if polls.length > 0}
      <!-- Render a card for each poll which has grid 6 cards for xl 5 for lg 4 for md and 3 for sm  -->
      {#each polls as poll, id}
        <div class="card w-96 bg-primary text-primary-content">
          <div class="card-body">
            <h2 class="card-title">{poll.pollName}
              <div class="badge badge-secondary">{poll.pollType}</div>
            </h2>
            <p>{poll.pollReason}</p>
            <div class="card-actions justify-end items-center">
              <button class="btn"
              on:click={()=>{
                updateDoc(doc(db, "polls", pollIds[id]), {
                  pollVotes: poll.pollVotes + 1,
                });
                alert("Your vote has been registered. Please refresh to see the changes.");
              }}
              >Votes: {poll.pollVotes}</button>
            </div>
          </div>
        </div>
      {/each}
    {:else}
          <h1 class="text-5xl font-bold text-center absolute top-32 left-[44%]">No Polls </h1>
    {/if}
  </div>

  <div class="fixed right-6 bottom-[50%]">
    <ul class="menu bg-neutral rounded-box">
      <li>
        <button
          class="px-4 pt-4 tooltip"
          data-tip="Create Poll"
          on:click={() => {
            modalHandler.createPollModal = !modalHandler.createPollModal;
          }}
        >
          <iconify-icon
            class="text-2xl"
            icon="material-symbols:add-box-outline"
          />
        </button>
      </li>
      <li>
        <button
          class="px-4 pt-4 tooltip"
          data-tip="Profile"
          on:click={() => {
            modalHandler.profileModal = !modalHandler.profileModal;
          }}
        >
          <iconify-icon
            class="text-2xl"
            icon="material-symbols:account-circle-full"
          />
        </button>
      </li>
    </ul>
  </div>

  {#if modalHandler.createPollModal}
    <div
      class="card w-96 bg-base-100 card-bordered shadow-xl md:fixed md:top-[20%] md:left-[40%]"
    >
      <div class="card-body">
        <div class="flex justify-between">
          <h2 class="card-title mb-4">Create Poll !!!</h2>
          <button
            class="btn btn-primary relative bottom-2"
            on:click={() => {
              modalHandler.createPollModal = !modalHandler.createPollModal;
            }}
          >
            <iconify-icon
              class="text-2xl"
              icon="material-symbols:cancel-outline"
            />
          </button>
        </div>

        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Poll Name</span>
          </label>
          <input
            type="text"
            placeholder="Poll Name..."
            class="input input-bordered w-full max-w-xs"
            bind:value={pollInput.pollName}
          />
        </div>

        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Poll Reason</span>
          </label>
          <textarea
            class="textarea textarea-bordered h-24"
            placeholder="Explain ur opinion...."
            bind:value={pollInput.pollReason}
          />
        </div>

        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Poll Theme</span>
          </label>
          <select
            class="select w-full max-w-xs"
            bind:value={pollInput.pollType}
          >
            <option disabled selected>Select Theme</option>
            <option>Education</option>
            <option>Healthcare</option>
            <option>Governance</option>
            <option>Environment</option>
            <option>Individual</option>
          </select>
        </div>

        <button
          class="btn btn-primary m-1"
          on:click={async () => {
            if (
              pollInput.pollName == "" ||
              pollInput.pollReason == "" ||
              pollInput.pollType == "Select Theme"
            ) {
              alert("Please fill all the fields");
            } else {
              try {
                await addDoc(collection(db, "polls"), {
                  citizenName: $authData.user.displayName,
                  citizenEmail: $authData.user.email,
                  pollName: pollInput.pollName,
                  pollReason: pollInput.pollReason,
                  pollType: pollInput.pollType,
                  pollVotes: 0,
                });

                alert(
                  "Issue registered successfully. Please refresh to see the changes."
                );
                modalHandler.createPollModal = !modalHandler.createPollModal;
              } catch (e) {
                console.error("Error adding document: ", e);
              }
            }
          }}
        >
          Submit Poll
        </button>
      </div>
    </div>
  {/if}

  {#if modalHandler.profileModal}
    <div
      class="card w-96 bg-base-100 card-bordered shadow-xl md:fixed md:top-[20%] md:left-[40%]"
    >
      <div class="card-body">
        <div class="flex justify-between">
          <h2 class="card-title mb-4">Profile</h2>
          <button
            class="btn btn-primary relative bottom-2"
            on:click={() => {
              modalHandler.profileModal = !modalHandler.profileModal;
            }}
          >
            <iconify-icon
              class="text-2xl"
              icon="material-symbols:cancel-outline"
            />
          </button>
        </div>

        {#each polls as poll, i}
          {#if poll.citizenEmail == $authData.user.email}
            <div class="card w-full card-body border-2">
              <div class="flex justify-between">
                <h2 class="card-title mb-4">{poll.pollName}</h2>
                <button
                  class="btn btn-primary relative bottom-2"
                  on:click={async () => {
                    await deleteDoc(doc(db, "polls", pollIds[i]));
                    alert(
                      "Poll deleted successfully. Please refresh to see the changes."
                    );
                  }}
                >
                  <iconify-icon
                    class="text-2xl"
                    icon="material-symbols:delete-outline"
                  />
                </button>
              </div>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>
