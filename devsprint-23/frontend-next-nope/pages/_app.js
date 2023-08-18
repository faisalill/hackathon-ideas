import '@/styles/globals.css'
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { useState } from 'react'
import { UserContext } from './context'


export default function App({ Component, pageProps }) {
  const [user, setUser] = useState({
    authenticated: false,
    userName: null,
    userEmail: null,
    firebaseApp: null,
    firebaseAuth: null,
  })
  return (
    <>
      <UserContext.Provider value={{ user, setUser }}>
        <Component {...pageProps} />
      </UserContext.Provider>
    </>
  )
}
