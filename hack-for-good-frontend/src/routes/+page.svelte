<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { authData } from "../stores/store.js";
  import { Map, Popup, Marker } from "mapbox-gl";
  import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
  } from "firebase/firestore";

  export let data;

  let db;
  let map;
  let mapContainer;
  let polls = [];
  let issues = [];
  let loading = true;
  let issueStats = {
    water: 0,
    electricity: 0,
    sewage: 0,
    garbage: 0,
    educationPoll: 0,
    healthCarePoll: 0,
    environMentPoll: 0,
    individualPoll: 0,
    governancePoll: 0,
  };

  onMount(async () => {
    if (!$authData.authenticated) {
      goto("/login");
    } else {
      const bangaloreCordinates = {
        longitude: 77.5946,
        latitude: 12.9716,
      };

      map = new Map({
        container: mapContainer,
        style: `mapbox://styles/mapbox/streets-v12`,
        accessToken: data.mapboxAccessToken,
        center: [bangaloreCordinates.longitude, bangaloreCordinates.latitude],
        zoom: 2,
      });

      db = getFirestore($authData.app);

      await getDocs(collection(db, "polls")).then((result) => {
        result.forEach((doc) => {
          polls = [...polls, doc.data()];
        });
      });

      await getDocs(collection(db, "issues")).then((result) => {
        result.forEach((doc) => {
          issues = [...issues, doc.data()];
        });

        issues.forEach((issue, index) => {
          const popup = createPopupMarker(
            issue.issueDetails,
            issue.citizenName,
            issue.citizenEmail,
            issue.citizenContactNumber,
            issue.issueLatitude,
            issue.issueLongitude
          );

          let markerElement;

          if (issue.issueType == "Water") {
            markerElement = createMarker(imageLinks.waterLogoLink);
          } else if (issue.issueType == "Electricity") {
            markerElement = createMarker(imageLinks.electricityLogoLink);
          } else if (issue.issueType == "Sewage") {
            markerElement = createMarker(imageLinks.sewageLogoLink);
          } else if (issue.issueType == "Garbage") {
            markerElement = createMarker(imageLinks.garbageLogoLink);
          }

          new Marker(markerElement)
            .setLngLat([issue.issueLongitude, issue.issueLatitude])
            .setPopup(popup)
            .addTo(map);
        });

        // Find the number of issues for each type
        issues.forEach((issue, index) => {
          if (issue.issueType == "Water") {
            issueStats.water++;
          } else if (issue.issueType == "Electricity") {
            issueStats.electricity++;
          } else if (issue.issueType == "Sewage") {
            issueStats.sewage++;
          } else if (issue.issueType == "Garbage") {
            issueStats.garbage++;
          }
        });

        // Find the number of issues for each poll
        polls.forEach((poll, index) => {
          if (poll.pollType == "Education") {
            issueStats.educationPoll++;
          } else if (poll.pollType == "Healthcare") {
            issueStats.healthCarePoll++;
          } else if (poll.pollType == "Environment") {``
            issueStats.environMentPoll++;
          } else if (poll.pollType == "Individual") {
            issueStats.individualPoll++;
          } else if (poll.pollType == "Governance") {
            issueStats.governancePoll++;
          }
        });

        loading = false;
      });
    }
  });

  function createPopupMarker(
    issueDetails,
    citizenName,
    citizenEmail,
    citizenNumber,
    latitude,
    longitude
  ) {
    const popup = new Popup().setHTML(`
      <div class="absolute top-1/2 left-1/2 card w-fit bg-primary text-primary-content ">
         <div class="card-body">
            <div>
              <span class="font-bold ">Details:</span><p
              class="text-sm "
              >
              ${issueDetails}
                </p>
            </div>
            <div>
              <span class="font-bold">Citizen Name:</span>&nbsp; ${citizenName}
            </div>
            <div>
              <span class="font-bold">Citizen Email:</span>&nbsp; ${citizenEmail}
            </div>
            <div>
              <span class="font-bold">Citizen Number:</span>&nbsp; ${citizenNumber}
            </div>
            <div class="card-actions justify-center">
               <button class="btn btn-sm ">
                <a href="https://www.google.com/maps/?q=${latitude},${longitude}" target="_blank">
                  Open In Maps
                </a>
                </button>
             </div>
         </div>
      </div>
      `);

    return popup;
  }

  const imageLinks = {
    waterLogoLink: "mdi:water-alert",
    electricityLogoLink: "material-symbols:electric-bolt",
    garbageLogoLink: "ri:delete-bin-2-fill",
    sewageLogoLink: "mdi:pipe-leak",
  };

  function createMarker(logoLink) {
    const markerElement = document.createElement("div");

    markerElement.innerHTML = `
    <iconify-icon class="text-4xl text-black" icon="${logoLink}" />
    `;

    return markerElement;
  }
</script>

<div>
  {#if loading}
    <div class="hero min-h-screen bg-base-200">
      <div class="hero-content text-center">
        <div class="max-w-md scale-[5] relative bottom-10">
          <span class="loading loading-ring loading-lg" />
        </div>
      </div>
    </div>
  {/if}
  {#if !loading}
    <div class="card w-96 absolute scale-0 lg:scale-100 top-20 left-20 z-20 text-primary-content">
      <div class="card-body">
        <div class="stat">
          <div class="stat-title text-gray-300">Water Issues</div>
          <div class="stat-value">{issueStats.water}</div>
          <div class="stat-desc">................</div>
        </div>
        <div class="stat">
          <div class="stat-title text-gray-300">Electricity Issues</div>
          <div class="stat-value">{issueStats.electricity}</div>
          <div class="stat-desc">................</div>
        </div>
        <div class="stat">
          <div class="stat-title text-gray-300">Sewage Issues</div>
          <div class="stat-value">{issueStats.sewage}</div>
          <div class="stat-desc">................</div>
        </div>
        <div class="stat">
          <div class="stat-title text-gray-300">Garbage Issues</div>
          <div class="stat-value">{issueStats.garbage}</div>
          <div class="stat-desc">................</div>
        </div>
      </div>
    </div>
    <div class="card w-96 absolute scale-0 lg:scale-100 top-20 right-20 z-20 text-primary-content">
      <div class="card-body">
        <div class="stat">
          <div class="stat-title text-gray-300">Education Polls</div>
          <div class="stat-value">{issueStats.educationPoll}</div>
          <div class="stat-desc">................</div>
        </div>
        <div class="stat">
          <div class="stat-title text-gray-300">Health Care Polls</div>
          <div class="stat-value">{issueStats.healthCarePoll}</div>
          <div class="stat-desc">................</div>
        </div>
        <div class="stat">
          <div class="stat-title text-gray-300">Governance Polls</div>
          <div class="stat-value">{issueStats.governancePoll}</div>
          <div class="stat-desc">................</div>
        </div>
        <div class="stat">
          <div class="stat-title text-gray-300">Environment Polls</div>
          <div class="stat-value">{issueStats.environMentPoll}</div>
          <div class="stat-desc">................</div>
        </div>
        <div class="stat">
          <div class="stat-title text-gray-300">Individual Polls</div>
          <div class="stat-value">{issueStats.individualPoll}</div>
          <div class="stat-desc">................</div>
        </div>
      </div>
    </div>
  {/if}
  <div class="map-wrap">
    <div class="map" bind:this={mapContainer} />
  </div>
</div>

<style>
  .map {
    position: absolute;
    width: 100%;
    height: 93%;
  }
</style>
