import axios from 'axios';


const api = axios.create({
    baseURL: 'http://localhost:8080/auth'
});

// export const googleAuth = (code) => api.get(`/google?code=${code}`)

export const googleAuth = (code) => {
    return api.get(`/google?code=${code}`)
        .then(response => {
            console.log('Google Auth Success:', response);
            return response;
        })
        .catch(error => {
            if (error.response) {
                // The request was made, and the server responded with a status code outside the 2xx range
                console.error('Google Auth Server Error:', error.response.data);
            } else if (error.request) {
                // The request was made, but no response was received
                console.error('Google Auth No Response:', error.request);
            } else {
                // Something else happened while setting up the request
                console.error('Google Auth Error:', error.message);
            }
            throw error;
        });
};

export const signUser = (req, res) => {
    return api.post(`/signup`, req)
    .then(
        response => {
            console.log('response in api', response);
            return response;
        }
    ).catch(error => {
        console.log('error', error)
    })
}

// export const loginUser = (req, res) => {
//     return api.post(`/login`, req)
//     .then(
//         response => {
//             console.log('response in login api', response);
//             return response;
//         }
//     ).catch(error => {
//         console.log('error', error)
//     })
export const loginUser = (req) => {
    return api.post(`/login`, req)
    .then(response => {
        console.log('response in login api', response);
        return response;
    })
    .catch(error => {
        if (error.response) {
            console.error('Login Server Error:', error.response.data);
            return error.response.data; // Return the error response
        } else {
            console.error('Login Error:', error.message);
            return { message: error.message }; // Return a custom error message
        }
    });
}