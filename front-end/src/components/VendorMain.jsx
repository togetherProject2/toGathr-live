import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import UnsplashImages from './UnsplashImages';
import VendorsList from './VendorsList';
import { useState, useEffect } from 'react';
import '../css/VendorDetailDescription.css';
import BookedVendors from './BookedVendors';
import FavVendors from './FavVendors';

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function VendorMain() {
    const [value, setValue] = React.useState(0);
    const [vendType, setVendorType] = useState([]);
    const [location, setLocation] = useState({ lat: null, long: null });
    const [error, setError] = useState(null);

    const [favoriteVendors, setFavoriteVendors] = useState([]);

    const [showAllCategoryCards, setshowAllCategoryCards] = useState(true);
    const [showAllVendorCards, setshowAllVendorCards] = useState(false);
    const category_cards = [
        { id: 1, categoryName: "Venues", categoryType: "event_venue", categoryQuery: "business conferences, corporate events, industry seminars" },
        // { id: 2, categoryName: "Caterers", categoryType: "catering", categoryQuery: "wedding planning, bridal shows, wedding venues" },
        // { id: 3, categoryName: "Photographers", categoryType: "photographer", categoryQuery: "skills workshops, hands-on training, personal development" },
        { id: 4, categoryName: "Liquor store", categoryType: "liquor_store", categoryQuery: "live music, music festivals, concert tickets" },
        // { id: 5, categoryName: "Musicians", categoryType: "night_club", categoryQuery: "team building, company retreats, corporate getaways" },
        // { id: 6, categoryName: "Dj", categoryType: "establishment", categoryQuery: "charity events, fundraising galas, benefit concerts" },
        { id: 7, categoryName: "Florist", categoryType: "florist", categoryQuery: "trade shows, art exhibitions, product showcases" },
        { id: 8, categoryName: "Rental Equipments", categoryType: "hardware_store", categoryQuery: "networking mixers, business meetups, professional gatherings" },
        { id: 9, categoryName: "Makeup Artist", categoryType: "beauty_salon", categoryQuery: "family reunions, picnics, community gatherings" },
        { id: 10, categoryName: "Car rental", categoryType: "car_rental", categoryQuery: "networking mixers, business meetups, professional gatherings" },
        { id: 11, categoryName: "Event Transport", categoryType: "car_rental", categoryQuery: "family reunions, picnics, community gatherings" },
        { id: 12, categoryName: "Convenience Store", categoryType: "convenience_store", categoryQuery: "family reunions, picnics, community gatherings" },

    ];

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const handleVendorType = (vendorType) => {
        setVendorType(vendorType);
        setshowAllCategoryCards(!showAllCategoryCards);
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    if (position.coords) {
                        setLocation({ lat: latitude, long: longitude });
                    }
                },
                (error) => {
                    setError(error.message);
                }
            );
        } else {
            setError("Geolocation is not supported by this browser.");
        }
    };

    useEffect(() => {
        getLocation();
        console.log('location', location);
    }, []);

    const handleComponentChangeStatus = () => {

        setshowAllCategoryCards(!showAllCategoryCards);
    }




    return (

        <>

            {!showAllCategoryCards ? <div className="container-back" onClick={handleComponentChangeStatus}>
                <i className="fa-solid fa-chevron-left"></i>
            </div> : <></>}

            <Box sx={{ width: '100%' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <Tab label="All Vendors" {...a11yProps(0)} />
                        <Tab label="Booked Vendors" {...a11yProps(1)} />
                        <Tab label="Favorites" {...a11yProps(2)} />
                    </Tabs>
                </Box>
                
                <CustomTabPanel value={value} index={0}>

                    {showAllCategoryCards ? <div className="vendor-category-cards">
                        {category_cards.map(card => (
                            <div
                                className='vendor-category-card'
                                key={card.id}
                                onClick={() => handleVendorType({ vendorType: card.categoryType, vendorName: card.categoryName })} // Changed here
                            >
                                <div className="card-image">
                                    <UnsplashImages query={card.categoryName} numberOfImages={'1'} />
                                </div>
                                <div className="card-content">
                                    <h2>{card.categoryName}</h2>

                                </div>
                                <div>

                                </div>



                            </div>
                        ))}
                    </div> :

                        <div className='vendor-details'>
                            <VendorsList getVendorType={vendType} currentLocation={location} />
                        </div>

                    }
                    {

                    }




                </CustomTabPanel>
                <CustomTabPanel value={value} index={1}>
                    <BookedVendors />
                </CustomTabPanel>
                <CustomTabPanel value={value} index={2}>
                    <FavVendors />
                </CustomTabPanel>
            </Box>
        </>
    );
}
