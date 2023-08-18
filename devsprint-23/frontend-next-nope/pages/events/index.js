"use client"
import React from 'react'
import { UserContext } from '../context'
import { useContext, useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { BiSolidLocationPlus } from 'react-icons/bi'
import Map, { Marker, GeolocateControl } from 'react-map-gl';
import * as MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { Modal } from 'antd'
import mapboxgl from 'mapbox-gl'


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
            },
            mapBoxApiKey: process.env.mapBoxApiKey,
        }
    }
}

const Home = (data) => {
    const [input, setInput] = useState({
        name: "",

    })

    const router = useRouter()

    const { user, setUser } = useContext(UserContext)

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
        else {
            router.push('/')
        }
    })

    mapboxgl.accessToken = data.mapBoxApiKey


    const bangaloreCordinates = {
        longitude: 77.5946,
        latitude: 12.9716,
    };
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [zoom, setZoom] = useState(9);

    useEffect(() => {
        if (map.current) return; // initialize map only once
        map.current = new mapboxgl.Map({
            accessToken: mapboxgl.accessToken,
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/outdoors-v11',
            center: [bangaloreCordinates.longitude, bangaloreCordinates.latitude],
            zoom: zoom
        });

        map.current.addControl(
            new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                mapboxgl: mapboxgl,
            })
        );
    });

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {/* <h1 className="m-5 text-5xl font-bold text-center">Post Event</h1> */}
            <div className="h-screen w-screen">
                <div ref={mapContainer} className="h-[78%]" />
            </div>
            <div className="absolute top-1/2 right-10">
                <button className="btn"
                    onClick={() => {
                        setIsModalOpen(true)
                    }}
                >
                    Create An Event
                </button>
                {isModalOpen && (
                    <div class="card w-96 bg-base-100 shadow-xl fixed top-[20%] left-[40%]">
                        <div class="card-body">

                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default Home