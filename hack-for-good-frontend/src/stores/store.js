import { writable } from 'svelte/store'

export let authData = writable({
    authenticated: false,
    user: null,
})
