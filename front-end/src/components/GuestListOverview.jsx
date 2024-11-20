import React, { useState, useEffect } from 'react'
import { DeleteDataInMongo, readDataFromMongo } from "../../../back-end/mongoRoutingFile"
import { useSnackbar } from './SnackbarContext';

const GuestListOverview = ({active}) => {


    const showSnackbar = useSnackbar();

    const [eventID, setEventID] = useState(localStorage.getItem('eventId'));
    const [guestlist, setGuestList] = React.useState([]);
    const [currentemailID, setCurrentEmailID] = useState(JSON.parse(localStorage.getItem('user-info')).email);

    useEffect(() => {
        chooseExisting();
    }, []);

    const handleLinkClick = (id) => {
        localStorage.setItem('guestId', id);
        active('guests');
       
    };

    const getCurrentEmailID = () => {
        const currentEmailID = JSON.parse(localStorage.getItem('user-info')).email;
        setCurrentEmailID(currentEmailID);
    }

    useEffect(() => {
        getCurrentEmailID();
    },[] );

    const getEventID = () => {
        const currentEventID = localStorage.getItem('eventId');
        setEventID(currentEventID);
    };

    useEffect(() => {
        // Get initial event ID from localStorage
        getEventID();

        // Define a function to handle storage events
        const handleStorageChange = (event) => {
            if (event.key === 'eventId') {
                getEventID(); // Update state with new event ID
            }
        };

        // Listen for storage events (for changes from other tabs)
        window.addEventListener('storage', handleStorageChange);

        // Set up an interval to check for changes in the same tab
        const intervalId = setInterval(() => {
            const currentEventID = localStorage.getItem('eventId');
            if (currentEventID !== eventID) {
                getEventID(); // Update state if localStorage has changed
            }
        }, 1000); // Check every second

        // Cleanup function
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(intervalId);
        };
    }, [eventID]);

    const handleDelete = async (id) => {
        console.log(id);

        DeleteDataInMongo('guest_management', id).then(response => {
            console.log('Response from updateData:', response);
            // toast('Deleted Successfully')
            showSnackbar('Deleted Successfully', 'Data has been deleted successfully.');
            chooseExisting();
        })
            .catch(error => {
                console.error('Failed to update data:', error);
            });
    }

    const chooseExisting = async () => {
        // console.log(eventID);
        // setnewFlow(false);
        const user_email = currentemailID;

        // try {
        //     const response = await axios.get(`http://localhost:3031/read-data/guest_management/${user_email}`);
        //     console.log(response.data);
        //     console.log('f');
        //     setGuestList(response.data);
        // } catch (err) {
        //     console.log(err);
        // }

        readDataFromMongo('guest_management', user_email, eventID).then(response => {
            setGuestList(response);

        })
            .catch(error => {
                console.error('Failed to update data:', error);
            });
    }
    const handleNavigate = () =>{
        active('guests');
    }

    return (
            <div className='guest-add-overview'>
                <h3>Guest</h3>
                <div className='guest-add-content'>
                    <h5>Saved Guest Lists</h5>
                    {guestlist.length > 0 ?
                        <ul className='existing-guests-overview'>
                            {guestlist.map((item, index) => (

                                <li className='existing-guest-card-overview' key={index}>
                                    <a href="#" onClick={() => handleLinkClick(item._id)}>
                                        {item.guestListName}
                                    </a>
                                    <button onClick={() => handleDelete(item._id)}><i className="fa-solid fa-trash"></i></button>
                                </li>
                            ))}
                        </ul>
                        :
                        <>
                            <h5>You have not added any guest yet</h5>
                            
                        </>
                    }
                    <button className='button-purple' onClick={handleNavigate}>Add Guest</button>


                </div>
            </div>
    )
}

export default GuestListOverview
