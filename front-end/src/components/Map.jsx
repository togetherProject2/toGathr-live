import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

export const Map = ({ vendors }) => {
    const containerStyle = {
        width: '100%',
        height: '420px'
    };

    const center = {
        lat: 49.1913466,
        lng: -122.8490125
    };

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.GOOGLE_PLACES_KEY
    });

    const [map, setMap] = useState(null);
    const [initialLoad, setInitialLoad] = useState(true);

    const onLoad = useCallback((map) => {
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);

        // Limit zoom level only on the initial load
        map.addListener('bounds_changed', () => {
            if (initialLoad && map.getZoom() > 12) {
                map.setZoom(12);
            }
        });

        setMap(map);
        setInitialLoad(false);  // Disable initial load restrictions after setup
    }, [initialLoad]);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    useEffect(() => {
        if (map) {
            map.setCenter(center);
            map.setZoom(12);  // Set your preferred default zoom level
        }
    }, [center, map]);

    return (
        <div style={{ position: 'relative' }}>
            {isLoaded ? (
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={12}  // Set initial zoom level
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                >
                    {vendors.map((vendor) => (
                        <Marker
                            key={vendor.place_id}
                            position={{
                                lat: vendor.geometry.location.lat,
                                lng: vendor.geometry.location.lng
                            }}
                        />
                    ))}
                </GoogleMap>
            ) : <></>}
        </div>
    );
};





// import React, { Fragment } from "react";
// import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';


// export const Map = ({ vendors }) => {
//     const containerStyle = {
//         width: '100%',
//         height: '420px'
//     };

//     const center = {
//         lat: 49.1913466,
//         lng: -122.8490125
//     };

//     const { isLoaded } = useJsApiLoader({
//         id: 'google-map-script',
//         googleMapsApiKey: ""  //need to define your google api key 
//     })

//     const [map, setMap] = React.useState(null)

//     const onLoad = React.useCallback(function callback(map) {
//         const bounds = new window.google.maps.LatLngBounds(center);
//         map.fitBounds(bounds);
//         setMap(map)
//     }, [])

//     const onUnmount = React.useCallback(function callback(map) {
//         setMap(null)
//     }, [])


//     return (
//         <div style={{ position: 'relative' }}>

//             {isLoaded ? <GoogleMap
//                 mapContainerStyle={containerStyle}
//                 center={center}
//                 zoom={8}
//                 onLoad={onLoad}
//                 onUnmount={onUnmount}
//             >
//                 {vendors.map((vendor) => (
//                     <Marker key={vendor.place_id} position={{ lat: vendor.geometry.location.lat, lng: vendor.geometry.location.lng }} />
//                 ))}
//             </GoogleMap>
//                 : <></>
//             }

//         </div>
//     )
// }
