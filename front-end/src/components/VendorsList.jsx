import React, { useState, useEffect } from 'react';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { Map } from './Map';
import '../css/Vendor.css'
import VendorDetailDesc from './VendorDetailDesc';

// import UnsplashImages from './UnsplashImages'
// const VendorsList = ({getVendorType, currentlatitude, currentlongitude}) => {
const VendorsList = ({ getVendorType, currentLocation }) => {
    console.log(getVendorType, currentLocation);
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: currentLocation.lat, lng: currentLocation.long });
    const [radius, setRadius] = useState(5000); // Default radius in meters (5 km)
    const [vendorType, setVendorType] = useState(getVendorType.vendorType); // Default vendor type
    const [detailDescriptionCard, setDetailDescriptionCard] = useState(false);

    const [vendors, setVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const handleSelect = async (value) => {
        const results = await geocodeByAddress(value);
        const ll = await getLatLng(results[0]);
        console.log(ll, 'll');
        setAddress(value);
        setCoordinates(ll);
    };


    const selectedVendorSelection = (vendorSelection) => {
        setDetailDescriptionCard(true)
        setSelectedVendor(vendorSelection);
        console.log(vendorSelection, 'saassasassa');

    }

    // Fetch vendors based on coordinates, radius, and vendor type
    useEffect(() => {
        console.log(coordinates, radius, vendorType, "ss");
        fetchNearbyVendors()
    }, [coordinates, radius, vendorType]);


    const fetchNearbyVendors = async () => {
        const location = `${coordinates.lat},${coordinates.lng}`;
        console.log(location, vendorType, radius);

        const url = `http://localhost:3031/api/places/${location}/${vendorType}?radius=${radius}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log('data', data.results);
            if (data.results) {
                data.results.forEach(async (place) => {
                    if (place.photos) {
                        const photoReference = place.photos[0].photo_reference;
                        const apiKey = 'Vendor_api_key';
                        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
                        console.log(`Image URL for ${place.name}: ${photoUrl}`);
                    }
                });
            }
            setVendors(data.results);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    const handleComponentChangeStatus = () => {
        setDetailDescriptionCard(!detailDescriptionCard);
    }


    return (
        <div className='vendor-page'>
            {detailDescriptionCard ? <div className="container-back" onClick={handleComponentChangeStatus}>
                <i className="fa-solid fa-chevron-left"></i>
            </div> : <></>}

            {!detailDescriptionCard ?
                <>
                    <div className="vendor-header">

                        <div className="vendor-header-title">
                            <h2>{getVendorType.vendorName}</h2>
                        </div>

                        <div className="vendor-header-search">
                            <h5>Location</h5>
                            <PlacesAutocomplete value={address} onChange={setAddress} onSelect={handleSelect}>
                                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                    <div>
                                        <input {...getInputProps({ placeholder: 'Search Places...' })} />
                                        <div>
                                            {loading && <div>Loading...</div>}
                                            {suggestions.map((suggestion) => {
                                                const style = {
                                                    backgroundColor: suggestion.active ? '#a8dadc' : '#fff',
                                                };
                                                return (
                                                    <div {...getSuggestionItemProps(suggestion, { style })} key={suggestion.placeId}>
                                                        {suggestion.description}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </PlacesAutocomplete>
                        </div>
                    </div>

                    <div className="vendor-body">
                        <div className="vendor-map">
                            <Map vendors={vendors} />
                        </div>


                        <div className='vendor-radius'>
                            <label htmlFor="radius">Radius: {radius} meters</label>
                            <input
                                type="range"
                                id="radius"
                                min="1000"
                                max="20000"
                                step="500"
                                value={radius}
                                onChange={(e) => setRadius(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className='vendor-footer'>

                        {vendors.length > 0 ? (
                            <div className='vendor-all-cards'>
                                {vendors.map((vendor) => (
                                    <div className='vendor-custom-card' key={vendor.place_id} onClick={() => selectedVendorSelection(vendor)}>

                                        <div className='vendor-card-image'>

                                            {/* <UnsplashImages query={getVendorType.vendorName} numberOfImages={'1'} /> */}

                                            {vendor.photos && vendor.photos.length > 0 && (



                                                <img src={`https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${vendor.photos[0].photo_reference}&key=${apiKey}`} alt={vendor.name} />
                                            )}
                                        </div>
                                        <div>
                                        {/* <button >
                    <i className="fa-solid fa-heart"></i>
                  </button> */}
                                        </div>
                                        <div className='vendor-card-info'>
                                            <h5>{vendor.name}</h5>
                                            <p>Rating: {vendor.rating}</p>
                                            <p>{vendor.vicinity}</p>
                                        </div>



                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No vendors found within the selected radius.</p>
                        )}

                    </div>
                </>
                : <></>}
            {/* Vendor Details */}
            {selectedVendor && (

                <div>
                    <VendorDetailDesc vendorData={selectedVendor} getVendorType={getVendorType} />

                </div>
            )

            }



        </div >

    )
}

export default VendorsList