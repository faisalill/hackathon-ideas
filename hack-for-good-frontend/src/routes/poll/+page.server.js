import {MAPBOX_ACCESS_TOKEN} from '$env/static/private'

export async function load() {
    return {
        mapboxAccessToken : MAPBOX_ACCESS_TOKEN,
    }
  }