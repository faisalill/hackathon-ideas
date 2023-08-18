import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import React from 'react'
import { UserContext } from './context'
import { useContext, useEffect } from 'react'
import { initializeApp } from 'firebase/app'
import { GoogleAuthProvider, getAuth, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from 'next/router'

export async function getServerSideProps() {
  return {
    props: {
      firebaseConfig: {
        apiKey: process.env.apiKey,
        authDomain: process.env.authDomain,
        projectId: process.env.projectId,
        storageBucket: process.env.storageBucket,
        messagingSenderId: process.env.messagingSenderId,
        appId: process.env.appId,
      }
    }
  }
}

export default function Home(data) {

  const provider = new GoogleAuthProvider();

  const { user, setUser } = useContext(UserContext)

  const router = useRouter()

  let app = initializeApp(data.firebaseConfig)
  let auth = getAuth(app)

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser({
        authenticated: true,
        userName: user.displayName,
        userEmail: user.email,
        firebaseApp: app,
        firebaseAuth: auth,
      })
    } 
  })

  return (
    <div className="hero min-h-screen" style={{ backgroundImage: 'url(https://c4.wallpaperflare.com/wallpaper/410/867/750/vector-forest-sunset-forest-sunset-forest-wallpaper-preview.jpg)' }}>
      <div className="hero-overlay bg-opacity-60"></div>
      <div className="hero-content text-center text-neutral-content">
        <div className="max-w-md relative bottom-10">
          <h1 className="m-5 text-5xl font-bold">Welcomeee !!!</h1>
          {
            user.authenticated ? <h1 className="m-5 text-5xl font-bold">Hello {user.userName}</h1> : <p className="mb-5">Login using your Google Account.</p>
          }
          {
            user.authenticated ?
            <button className="btn btn-primary"
          onClick={()=>{
            signOut(auth)
            .then(()=>{
              setUser({
                authenticated: false,
                userName: null,
                userEmail: null,
                firebaseApp: null,
                firebaseAuth: null,
              })
            })
          }}
          >
          Sign Out 
          </button>
          : 
          
          <button className="btn btn-primary"
          onClick={()=>{
            signInWithPopup(auth, provider)
            .then((result)=>{
              setUser({
                authenticated: true,
                userName: result.user.displayName,
                userEmail: result.user.email,
                firebaseApp: app,
                firebaseAuth: auth,
              })
            })
          }}
        >Login</button>
          }
        </div>
      </div>
    </div>
  )
}