import React, { useEffect, useState } from 'react';
import '../css/MainHeader.css';
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import Modal from './ModalPopupBox';
import { createDataInMongo } from '../../../back-end/mongoRoutingFile';
import { openAI, saveTasksToDatabase } from '../api/loginApi';
import Dropdown from "react-bootstrap/Dropdown";
import { logOutUser } from "../api/loginApi";
import { useNavigate } from "react-router-dom";

const MainHeader = ({ onCreateEvent, setActiveItem, myEvents, setMyEvents, setEventId, showHeaderControls }) => {
    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState(null);
    const [eventName, setEventName] = useState('');
    const [eventType, setEventType] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [location, setLocation] = useState('');
    const [collaborators, setCollaborators] = useState('');
    const [guestCount, setGuestCount] = useState('');
    const [maxBudget, setMaxBudget] = useState('');

    const [isMobileView, setIsMobileView] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const savedEventId = localStorage.getItem('eventId');

    const handleEventChange = (event) => {
        const selectedEventId = event.target.value;
        setEventId(selectedEventId);
        console.log('Event id changed: ', selectedEventId);
        localStorage.setItem("eventId", selectedEventId);
    };

    // For Mobile screen
    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth <= 640);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const data = localStorage.getItem('user-info');
        const userData = JSON.parse(data);
        setUserInfo(userData);
    }, []);

    const addNewEventToMyEvents = (newEvent) => {
        setMyEvents((myEvents) => [...myEvents, newEvent]);
    };

    const createEvent = async (e) => {
        // e.preventDefault();
        // Get createdBy after userInfo is set
        const createdBy = userInfo?.email || "not specified";

        const eventData = {
            eventName,
            eventType,
            createdBy,
            eventDate,
            location,
            tasks: [],
            collaborators: [createdBy],
            guestCount,
            maxBudget,
            budgetItems: [],
        };

        try {
            createDataInMongo('events', eventData).then(response => {
                localStorage.setItem("eventId", response._id);
                setEventId(response._id);
                console.log('Response I got after crating new event: ', response);
                const updatedEventData = { ...eventData, _id: response._id };
                generateAndSaveTaskList(eventType, createdBy, response._id);
                alert('Event successfully created!');
                setActiveItem('overview');
                addNewEventToMyEvents(updatedEventData);
            });

            // Reset form
            setEventName('');
            setEventType('');
            setEventDate('');
            setLocation('');
            setGuestCount('');
            setMaxBudget('');

        } catch (error) {
            console.error('Error creating event:', error);
        } finally {
            // onClose();
        }
    };

    const generateAndSaveTaskList = async (eventType, createdBy, eventId) => {
        console.log("data to pass", eventType, createdBy, eventId)

        if (eventType) {

            const request = `Make a task list for ${eventType} for the event planner, without the heading`;
            const response = await openAI(request);
            // console.log("response in component", response);
            const taskList = response.data.tasks;
            // console.log("des", response.data);
            const tasksArray = taskList.split("\n");
            console.log('taskarray', tasksArray)
            // setTasks(tasksArray);

            const result = await saveTasksToDatabase({ tasksArray, createdBy, eventId });
            eventId = result.data.eventId;
            // console.log("response", eventId);
            localStorage.setItem("eventId", eventId);

        }
    }

    const handleSelect = async (value) => {
        const results = await geocodeByAddress(value);
        const ll = await getLatLng(results[0]);
        console.log(ll, 'll');
        setLocation(value);
        setCoordinates(ll);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleMobileNav = (location) => {
        setActiveItem(location);
        toggleMenu();
    }

  
    const handleLogout = async () => {
        try {
          const userEmail = JSON.parse(localStorage.getItem("user-info")).email;
          const result = await logOutUser({ userEmail });
          if (result.status === 200) {
            localStorage.clear();
            navigate("/landingPage");
          } else {
            console.log(result);
          }
        } catch (error) {
          console.log(error);
        }
      };

    return (

        <header className="main-header-root">
            {isMobileView ? (
                <div
                    className="hamburger cursor-pointer"
                    onClick={toggleMenu}>
                    <h3 className='ham-icon'><i class="fa-solid fa-bars"></i></h3>
                </div>
            )
                : ''}

            {isMenuOpen && (
                <div className="full-screen-menu">
                    <h3 className='close-menu'><i class="fa-solid fa-close" onClick={toggleMenu}></i></h3>
                    <ul>
                        <li><a href="#link1" onClick={() => handleMobileNav('myevents')}>All Events</a></li>
                        <li><a href="#link2" onClick={() => handleMobileNav('overview')}>Overview</a></li>
                        <li><a href="#link3" onClick={() => handleMobileNav('vendors')}>Vendors</a></li>
                        <li><a href="#link4" onClick={() => handleMobileNav('budget')}>Budget Calculator</a></li>
                        <li><a href="#link5" onClick={() => handleMobileNav('guests')}>Guests</a></li>
                        <li><a href="#link6" onClick={() => handleMobileNav('collaborators')}>Collaborators</a></li>
                    </ul>
                </div>
            )}

            {showHeaderControls ? (
                <div className="left-section">
                    <div>
                        <Modal
                            buttonClassName="button-green-fill"
                            buttonId="createNewSheet "
                            buttonLabel="Create New Event"
                            modalHeaderTitle="New Event Detail"
                            modalBodyHeader="Add detail over here"
                            // modalBodyHeader="Insert your body header here"
                            modalBodyContent={
                                <form>
                                    <input
                                        type="text"
                                        placeholder="Event Name"
                                        value={eventName}
                                        onChange={(e) => setEventName(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Event Type"
                                        value={eventType}
                                        onChange={(e) => setEventType(e.target.value)}
                                        required
                                    />
                                    {/* <input
                                    type="text"
                                    placeholder="Location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    required
                                /> */}
                                    <PlacesAutocomplete value={location} onChange={setLocation} select={handleSelect} >
                                        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                                            <div>
                                                <input {...getInputProps({ placeholder: 'Search Places...' })} />
                                                <div>
                                                    {loading && <div>Loading...</div>}
                                                    {suggestions.map((suggestion) => {
                                                        const style = {
                                                            color: suggestion.active ? 'black' : 'var(--primary-purple)',
                                                            backgroundColor: suggestion.active ? 'var(--secondary-purple)' : 'var(--secondary-purple)',

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
                                    <input
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Guest Count"
                                        value={guestCount}
                                        onChange={(e) => setGuestCount(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max Budget"
                                        value={maxBudget}
                                        onChange={(e) => setMaxBudget(e.target.value)}
                                        required
                                    />
                                    {/* <button className='btn-create-event' type="submit">Create Event</button> */}
                                </form>
                            }
                            saveDataAndOpenName="Save"
                            saveDataAndOpenId="save"
                            saveDataAndOpenFunction={() => createEvent()}
                            closeButtonID="closeSheet"
                            closeButtonName='Close'
                            buttonAlign='row'
                            onModalClose={() => console.log('Modal 1 closed')}
                            closeModalAfterDataSend="true"


                        />

                    </div>

                    {(myEvents && myEvents.length > 0) ? ( // Check if myEvents has items
                        <select className="dropdown" onChange={handleEventChange} value={savedEventId}>
                            <option value="">Select Event</option> {/* Default option */}
                            {myEvents.map((event) => (
                                <option key={event._id} value={event._id}>
                                    {event.eventName} {/* Adjust according to your event object structure */}
                                </option>
                            ))}
                        </select>
                    ) : null} {/* Hide dropdown if there are no events */}
                </div>
            ) : null
            }


            <div className="right-section">

              
                <Dropdown>
                    <Dropdown.Toggle
                        as="span"
                        variant="success"
                        id="dropdown-basic"

                    >
                        <div className="user-image">

                            {userInfo && userInfo.image != '' ?
                                <img src={userInfo.image} alt="profileImage" />
                                :
                                <></>}
                        </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                    <Dropdown.Item onClick={() => { setActiveItem('user_profile') }}> User Profile</Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout}>   Log out </Dropdown.Item>

                       
                    </Dropdown.Menu>
                </Dropdown>

            </div>
        </header >
    );
};

export default MainHeader;
