import {MAPBOX_ACCESS_TOKEN, BING_MAPS_API_KEY, OPEN_CAGE_KEY} from '$env/static/private'

export async function load() {
    return {
        mapboxAccessToken : MAPBOX_ACCESS_TOKEN,
        bingMapsApiKey : BING_MAPS_API_KEY,
        openCageKey : OPEN_CAGE_KEY
    }
  }