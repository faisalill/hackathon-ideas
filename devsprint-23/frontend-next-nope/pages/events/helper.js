export function createMarker(logoLink) {
    const markerElement = document.createElement("div");

    markerElement.innerHTML = `
    <iconify-icon class="text-4xl" icon="${logoLink}" />
    `;

    return markerElement;
  }