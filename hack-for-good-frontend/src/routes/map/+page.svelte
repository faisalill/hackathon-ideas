<script>
  import * as mapboxgl from "mapbox-gl";
  import * as MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
  import "../../../node_modules/@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
  import { onMount } from "svelte";
  import { authData } from "../../stores/store.js";
  import { goto } from "$app/navigation";
  import axios from "axios";
  import "iconify-icon";
  import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    deleteDoc,
  } from "firebase/firestore";
  export let data;

  let map;
  let mapContainer;
  let zoom;
  let marker;
  let db;
  let collectionRef;
  let issues = [];
  let issueIds = [];
  let roadIssues = [];
  let roadIssueIds = [];
  let filteredIssues = [];

  zoom = 11;

  onMount(async () => {
    const bangaloreCordinates = {
      longitude: 77.5946,
      latitude: 12.9716,
    };

    if ($authData.authenticated) {
      db = getFirestore(authData.app);

      collectionRef = collection(db, "issues");

      await getDocs(collection(db, "issues")).then((result) => {
        result.forEach((doc) => {
          issueIds.push(doc.id);
          issues.push(doc.data());
        });
      });

      await getDocs(collection(db, "roadIssues")).then((result) => {
        result.forEach((doc) => {
          roadIssueIds.push(doc.id);
          roadIssues.push(doc.data());
        });
      });

      mapboxgl.accessToken = data.mapboxAccessToken;

      map = new mapboxgl.Map({
        container: mapContainer,
        style: `mapbox://styles/mapbox/outdoors-v11`,
        center: [bangaloreCordinates.longitude, bangaloreCordinates.latitude],
        zoom: zoom,
      });

      marker = new mapboxgl.Marker(
        createMarker("material-symbols:add-location-alt")
      )
        .setLngLat([
          bangaloreCordinates.longitude,
          bangaloreCordinates.latitude,
        ])
        .addTo(map);

      map.addControl(
        new MapboxGeocoder({
          accessToken: mapboxgl.accessToken,
          mapboxgl: mapboxgl,
        })
      );

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

        new mapboxgl.Marker(markerElement)
          .setLngLat([issue.issueLongitude, issue.issueLatitude])
          .setPopup(popup)
          .addTo(map);
      });

      map.on("click", (e) => {
        addressInput.longitude = e.lngLat.lng;
        addressInput.latitude = e.lngLat.lat;
        marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
        getAddress(e.lngLat.lng, e.lngLat.lat).then((res) => {
          addressInput.address = res.data.features[0].place_name;
        });
      });

      roadIssues.forEach((issue, index) => {
        let lineColor;

        if (issue.roadIssueType == roadIssueTypes.roadBlock) {
          lineColor = "#ff0000";
        } else if (issue.roadIssueType == roadIssueTypes.roadConstruction) {
          lineColor = "#ffff00";
        } else if (issue.roadIssueType == roadIssueTypes.aboutToBeBlocked) {
          lineColor = "#ff8000";
        }

        map.on('load', ()=>{
          const nestedCordinates = [];

          issue.roadIssueCordinates.forEach((cordinate)=>{
            nestedCordinates.push([cordinate.longitude, cordinate.latitude])
          })

          map.addSource(`route${index}`, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: nestedCordinates,
            },
          },
        });
        map.addLayer({
          id: `route${index}`,
          type: "line",
          source: `route${index}`,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": lineColor,
            "line-width": 8,
          },
        });
      });
        })
    } else {
      goto("/");
    }
  });

  let modalHandler = {
    issuesModal: false,
    profileModal: false,
    roadIssueModal: false,
  };

  let issueInput = {
    governmentBodyType: "Pick service",
    details: "",
    phoneNumber: "",
  };

  let addressInput = {
    address: "",
    latitude: "",
    longitude: "",
  };

  let roadIssueInput = {
    cordinates: [],
    cordinatesCount: 2,
    details: "Details",
  };

  const roadIssueTypes = {
    roadBlock: "Blocked",
    roadConstruction: "Construction",
    aboutToBeBlocked: "About To Be Blocked",
  };

  function getAddress(longitude, latitude) {
    return axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}`
    );
  }

  function createMarker(logoLink) {
    const markerElement = document.createElement("div");

    markerElement.innerHTML = `
    <iconify-icon class="text-4xl" icon="${logoLink}" />
    `;

    return markerElement;
  }

  function createPopupMarker(
    issueDetails,
    citizenName,
    citizenEmail,
    citizenNumber,
    latitude,
    longitude
  ) {
    const popup = new mapboxgl.Popup().setHTML(`
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
</script>

<div class="map-wrap">
  <div class="map relative z-0" bind:this={mapContainer} />
  <div class="absolute right-6 bottom-[40%]">
    <ul class="menu bg-neutral rounded-box">
      <li>
        <button
          class="px-4 pt-4 tooltip"
          data-tip="Issues"
          on:click={() => {
            modalHandler.issuesModal = !modalHandler.issuesModal;
          }}
        >
          <iconify-icon
            class="text-2xl"
            icon="material-symbols:problem-outline"
          />
        </button>
      </li>
      <li>
        <button
          class="px-4 pt-4 tooltip"
          data-tip="Road Issues"
          on:click={() => {
            modalHandler.roadIssueModal = !modalHandler.roadIssueModal;
          }}
        >
          <iconify-icon class="text-2xl" icon="material-symbols:remove-road" />
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

  {#if modalHandler.issuesModal}
    <div class="card w-96 bg-base-100 shadow-xl fixed top-[20%] left-[40%]">
      <div class="card-body">
        <div class="flex justify-between">
          <h2 class="card-title mb-4">Issue Details !!!</h2>
          <button
            class="btn btn-primary relative bottom-2"
            on:click={() => {
              modalHandler.issuesModal = !modalHandler.issuesModal;
            }}
          >
            <iconify-icon
              class="text-2xl"
              icon="material-symbols:cancel-outline"
            />
          </button>
        </div>

        <label class="label">
          <span class="label-text">Address</span>
        </label>
        <textarea
          class="textarea textarea-bordered h-28"
          disabled={true}
          placeholder="Please mark(click) the location on the map"
          bind:value={addressInput.address}
        />
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Service </span>
          </label>
          <select
            class="select w-full max-w-xs"
            bind:value={issueInput.governmentBodyType}
          >
            <option disabled selected>Pick service</option>
            <option>Water</option>
            <option>Electricity</option>
            <option>Sewage</option>Type here
          </select>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text">Issue Details</span>
          </label>
          <textarea
            class="textarea textarea-bordered h-24"
            placeholder="Issue Details...."
            bind:value={issueInput.details}
          />
        </div>
        <div class="form-control w-full max-w-xs">
          <label class="label">
            <span class="label-text">Phone Number</span>
          </label>
          <input
            type="text"
            placeholder="Phone....."
            class="input input-bordered w-full max-w-xs"
            bind:value={issueInput.phoneNumber}
          />
        </div>
        <div class="self-center mt-4">
          <button
            class="btn btn-primary"
            on:click={async () => {
              if (
                addressInput.address == "" ||
                addressInput.latitude == "" ||
                addressInput.longitude == "" ||
                issueInput.governmentBodyType == "Pick service" ||
                issueInput.details == "" ||
                issueInput.name == ""
              ) {
                alert("Please fill all the fields in the issue details form");
                return;
              } else {
                try {
                  await addDoc(collectionRef, {
                    citizenName: $authData.user.displayName,
                    citizenEmail: $authData.user.email,
                    citizenContactNumber: issueInput.phoneNumber,
                    issueAddress: addressInput.address,
                    issueLatitude: addressInput.latitude,
                    issueLongitude: addressInput.longitude,
                    issueType: issueInput.governmentBodyType,
                    issueDetails: issueInput.details,
                  });

                  alert("Issue registered successfully");
                  window.location.href = "/map";
                  modalHandler.issuesModal = !modalHandler.issuesModal;

                  addressInput = {
                    address: "",
                    latitude: "",
                    longitude: "",
                  };

                  issueInput = {
                    governmentBodyType: "Pick service",
                    details: "",
                  };
                } catch (e) {
                  console.error("Error adding document: ", e);
                }
              }
            }}>Register Issue</button
          >
        </div>
      </div>
    </div>
  {/if}

  {#if modalHandler.profileModal}
    <div class="card w-96 bg-base-100 shadow-xl fixed top-[20%] left-[40%]">
      <div class="card-body">
        <div class="flex justify-between">
          <h2 class="card-title mb-4">Posted Issues</h2>
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
        {#each issues as issue, index}
          {#if issue.citizenEmail == $authData.user.email}
            <div class="card bg-primary p-4 m-2">
              <div>
                <span class="text-bold">Issue Detail:</span>
                {issue.issueDetails}
              </div>
              <button
                class="btn m-3"
                on:click={async () => {
                  await deleteDoc(doc(db, "issues", issueIds[index])).then(
                    () => {
                      alert("Issue deleted successfully");
                      window.location.href = "/map";
                    }
                  );
                }}
              >
                Delete
              </button>
            </div>
          {/if}
        {/each}
        {#each roadIssues as issue, index}
          {#if issue.citizenEmail == $authData.user.email}
            <div class="card bg-primary p-4 m-2">
              <div>
                <span class="text-bold">Road Issue</span>
                {issue.roadIssueType}
              </div>
              <button
                class="btn m-3"
                on:click={async () => {
                  await deleteDoc(doc(db, "roadIssues", roadIssueIds[index])).then(
                    () => {
                      alert("Issue deleted successfully");
                      window.location.href = "/map";
                    }
                  );
                }}
              >
                Delete
              </button>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}

  {#if modalHandler.roadIssueModal}
    <div
      class="card w-96 bg-base-100 shadow-xl fixed top-[20%] left-[40%] scroll-m-1"
    >
      <div class="card-body">
        <div class="flex justify-between">
          <h2 class="card-title mb-4">Road Issue</h2>
          <button
            class="btn btn-primary relative bottom-2"
            on:click={() => {
              modalHandler.roadIssueModal = !modalHandler.roadIssueModal;
            }}
          >
            <iconify-icon
              class="text-2xl"
              icon="material-symbols:cancel-outline"
            />
          </button>
        </div>
        {#each { length: roadIssueInput.cordinatesCount } as _, i}
          <div class="form-control flex flex-row items-center gap-3 m-2">
            {#if roadIssueInput.cordinates[i]}
            <textarea
              class="textarea textarea-bordered"
              placeholder={`Marked`}
            />
            {:else}
            <textarea
              class="textarea textarea-bordered"
              placeholder={`Mark Location`}
            />
            {/if}
            
            <div class="tooltip" data-tip="Mark Current Location">
              <button
                class="btn btn-primary"
                on:click={() => {
                  roadIssueInput.cordinates[i] = [
                    marker.getLngLat().lng,
                    marker.getLngLat().lat,
                  ]
                }}
              >
                <iconify-icon
                  class="text-2xl"
                  icon="material-symbols:add-location-alt"
                />
              </button>
            </div>
          </div>
        {/each}
        <div class="self-center m-3">
          <button
            class="btn btn-primary"
            on:click={() => {
              roadIssueInput.cordinatesCount++;
            }}
          >
            Add More Points
          </button>
        </div>
        <select
          class="select w-full max-w-xs"
          bind:value={roadIssueInput.details}
        >
          <option disabled selected>Details</option>
          <option>Construction</option>
          <option>Blocked</option>
          <option>About To Be Blocked</option>
        </select>
      </div>
      <div class="self-center m-3">
        <button
          class="btn btn-primary"
          on:click={async () => {
            if (
              roadIssueInput.cordinates[0]?.longitude == "" ||
              roadIssueInput.cordinates[0]?.latitude == "" ||
              roadIssueInput.cordinates[1]?.longitude == "" ||
              roadIssueInput.cordinates[1]?.latitude == "" ||
              roadIssueInput.details == "Details"
            ) {
              alert("Please fill all the fields in the road issue form");
              return;
            } else {

              const nonNestedRoadIssueCordinates = [];

              roadIssueInput.cordinates.forEach((cordinate)=>{
                nonNestedRoadIssueCordinates.push({
                  longitude: cordinate[0],
                  latitude: cordinate[1]
                })
              })

              const roadCollectionRef = collection(db, "roadIssues");
              await addDoc(roadCollectionRef, {
                citizenname: $authData.user.displayName,
                citizenEmail: $authData.user.email,
                roadIssueType: roadIssueInput.details,
                roadIssueCordinates: nonNestedRoadIssueCordinates,
              })
                .then(() => {
                  alert("Road Issue registered successfully");
                  window.location.href = "/map";
                  modalHandler.roadIssueModal = !modalHandler.roadIssueModal;
                })
                .catch((e) => {
                  alert("Error registering road issue", e.message);
                });
            }
          }}
        >
          Submit Issue
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .map {
    position: absolute;
    width: 100%;
    height: 93%;
  }
</style>
