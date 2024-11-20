import axios from 'axios';

const baseUrl = 'http://localhost:3031'

export async function updateDataInMongo(collectionName, id, data) {
  console.log(collectionName + ' ' + id + " " + data);
  try {
    const url = `${baseUrl}/update-data/${collectionName}/${id}`;
    const response = await axios.put(url, data);
    console.log('Data updated successfully');
    return response.data; // Return the response data
  } catch (error) {
    console.error('Error updating data: ------', error);
    throw error; // Rethrow the error for handling in the calling function
  }
}


export async function createDataInMongo(collectionName, data) {
  console.log(collectionName + ' ' + " " + data);
  try {
    const url = `${baseUrl}/create-data/${collectionName}`;
    const response = await axios.post(url, data);
    console.log('Data created successfully');
    return response.data; // Return the response data id
  } catch (error) {
    console.error('Error updating data:', error);
    throw error; // Rethrow the error for handling in the calling function
  }
}

export async function addBudgetItemInDb(collectionName, data) {
  console.log(collectionName + ' ' + " " + data);
  try {
    const url = `${baseUrl}/budget-item/${collectionName}`;
    const response = await axios.put(url, data);
    console.log('Data created successfully');
    return response.data; // Return the response data id
  } catch (error) {
    console.error('Error updating data:', error);
    throw error; // Rethrow the error for handling in the calling function
  }
}


export async function readDataFromMongo(collectionName, email, eventID, data) {
  try {
    const url = `${baseUrl}/readData/${collectionName}/${email}/${eventID}`;
    const response = await axios.get(url, data);
    console.log('Data read successfully');
    return response.data; // Return the response data
  } catch (error) {
    console.error('Error updating data:', error);
    throw error; // Rethrow the error for handling in the calling function
  }
}

export async function readDataFromMongoBasedOnPlaceId(collectionName, placeId, data) {
  try {
    console.log('colle', collectionName, placeId)
    const url = `${baseUrl}/readReviews/${collectionName}/${placeId}`;
    const response = await axios.get(url, data);
    console.log('Data read successfully');
    return response.data; // Return the response data
  } catch (error) {
    console.error('Error updating data:', error);
    throw error; // Rethrow the error for handling in the calling function
  }
}

export async function readSingleDataFromMongo(collectionName, docID) {
  // console.log(collectionName + ' ' + id + " " + data);
  try {
    const url = `${baseUrl}/readSingleData/${collectionName}/${docID}`;
    const response = await axios.get(url);
    console.log('Data read successfully');
    return response.data; // Return the response data
  } catch (error) {
    console.error('Error updating data:', error);
    throw error; // Rethrow the error for handling in the calling function
  }
}


export async function getOverviewData(id, data) {
  try {
    const url = `${baseUrl}/overview/${id}`;
    console.log('ID data fetch URL: ', url);
    const response = await axios.get(url, data);
    console.log('Data read successfully');
    return response.data;
  } catch (error) {
    console.error('Error updating data:', error);
    throw error;
  }
}


export async function readDataFromMongoWithParam(collectionName, queryParams) {
  try {
    // Construct the URL
    const url = `${baseUrl}/read-data/${collectionName}/${queryParams}`;

    const response = await axios.get(url);
    console.log('Data read successfully', response);

    return response.data;
  } catch (error) {
    console.error('Error reading data:', error);
    throw new Error('Could not fetch data. Please try again later.');
  }
}


export async function readCollaboratorsEventsFromMongo(collectionName, params) {
  try {
    // Construct the URL
    console.log('Data read successfully', params);
    const url = `${baseUrl}/read-collaborator-events/${collectionName}/${params}`;

    const response = await axios.get(url);
    console.log('Data read successfully', response);

    return response.data;
  } catch (error) {
    console.error('Error reading data:', error);
    throw new Error('Could not fetch data. Please try again later.');
  }
}
// export async function readDataFromMongoWithParamID(collectionName, id) {
//   try {
//     // Construct the URL
//     const url = `${baseUrl}/read-data/${collectionName}/${id}`;

//     const response = await axios.get(url);
//     console.log('Data read successfully', response);

//     return response.data;
//   } catch (error) {
//     console.error('Error reading data:', error);
//     throw new Error('Could not fetch data. Please try again later.');
//   }
// }

export async function DeleteDataInMongo(collectionName, id) {
  // console.log(collectionName + ' ' + id + " " + data);
  try {
    const url = `${baseUrl}/delete-data/${collectionName}/${id}`;
    const response = await axios.delete(url);
    console.log('Data deleted successfully');
    return response.data; // Return the response data
  } catch (error) {
    console.error('Error updating data:', error);
    throw error; // Rethrow the error for handling in the calling function
  }
}
export async function readVendorDataFromMongo(collectionName, email, data) {
  try {
    const url = `${baseUrl}/readVendorData/${collectionName}/${email}`;
    const response = await axios.get(url, data);
    console.log('Data read successfully');
    return response.data; // Return the response data
  } catch (error) {
    console.error('Error updating data:', error);
    throw error; // Rethrow the error for handling in the calling function
  }
}
