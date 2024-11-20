import React, { useState, useEffect } from "react";
import Overview from "./Overview";
import BudgetCalculator from "./BudgetCalculator";
import GuestManagementMain from "./GuestManagementMain";
import Collaborators from "./Collaborators";
import AllEvents from "./AllEvents";
import VendorsList from "./VendorsList";
import VendorMain from "./VendorMain";
import MainHeader from "./MainHeader";
import UserProfile from "./UserProfile";
import {
  readDataFromMongoWithParam,
  readCollaboratorsEventsFromMongo,
} from "../../../back-end/mongoRoutingFile";

const MainContent = ({
  activeItem,
  setActiveItem,
  onCreateEvent,
  eventId,
  setEventId,
  myEvents,
  setMyEvents,
  isMobileView
}) => {
  const [showHeaderControls, setShowHeaderControls] = useState(false);

  useEffect(() => {
    // Update showHeaderControls based on activeItem
    if (
      ["overview", "vendors", "budget", "guests", "collaborators"].includes(
        activeItem
      )
    ) {
      setShowHeaderControls(true);
    } else if (activeItem === "myevents") {
      setShowHeaderControls(false);
    }
  }, [activeItem]); // Dependency array to run effect on activeItem change

  useEffect(() => {
    console.log(
      "Fetching user info =----=-----------------------------------------"
    );
    const fetchUserInfoAndEvents = async () => {
      const data = localStorage.getItem("user-info");
      const userData = JSON.parse(data);
      // setUserInfo(userData);

      if (userData && userData.email) {
        try {
        //   const createdByPromise = readDataFromMongoWithParam(
        //     "events",
        //     `createdBy=${userData.email}`
        //   );

          const collaboratorsPromise = readCollaboratorsEventsFromMongo(
            "events",
            `${userData.email}`
          )
            .then((response) => {
              console.log("Promise resolved with response:", response);
              setMyEvents(response);
            })
            .catch((error) => {
              console.error("Promise rejected with error:", error);
            });
            // setMyEvents(collaboratorsPromise);

        //   Promise.all([createdByPromise, collaboratorsPromise]).then(
        //     ([createdByEvents, collaboratorEvents]) => {
        //       const allEvents = [
        //         ...createdByEvents,
        //         ...collaboratorEvents.filter(
        //           (event) =>
        //             !createdByEvents.some(
        //               (createdEvent) => createdEvent._id === event._id
        //             )
        //         ),
        //       ];

        //       console.log("Your combined events list is here: ", allEvents);

        //       // Set events in state
              
        //     }
        //   );
        } catch (err) {
          console.error("Failed to fetch events:", err);
          // setError('Failed to fetch events');
        } finally {
          // setLoading(false);
        }
      } else {
        // setLoading(false); // Set loading to false if userData is not valid
      }
    };

    fetchUserInfoAndEvents(); // Call the async function
  }, []); // Empty dependency array to run once on mount

  const renderContent = () => {
    switch (activeItem) {
      case "myevents":
        return (
          <>
            <AllEvents
              setEventId={setEventId}
              myEvents={myEvents}
              setMyEvents={setMyEvents}
              onCreateEvent={onCreateEvent}
              setActiveItem={setActiveItem}
            ></AllEvents>
          </>
        );
      case "overview":
        return (
          <Overview
            setEventId={setEventId}
            setActiveItem={setActiveItem}
            eventId={eventId}
            myEvents={myEvents}
            setMyEvents={setMyEvents}
          />
        );
      case "vendors":
        return (
          <div>
            <VendorMain />
          </div>
        );
      case "budget":
        return (
          <>
            <BudgetCalculator eventId={eventId} />
          </>
        );
      case "guests":
        return <GuestManagementMain />;
      case "collaborators":
        return (
          <div>
            <Collaborators />
          </div>
        );
      case "user_profile":
        return (
          <div>
            <UserProfile />
          </div>
        );
      case "logout":
        return <div>See you again!</div>;
      default:
        return <div>Select an item</div>;
    }
  };

  return (
    <div className="main-content-root">
      <MainHeader
        onCreateEvent={onCreateEvent}
        setMyEvents={setMyEvents}
        setActiveItem={setActiveItem}
        myEvents={myEvents}
        setEventId={setEventId}
        showHeaderControls={showHeaderControls}
      />
      <div className="main-content">{renderContent()}</div>
    </div>
  );
};

export default MainContent;
