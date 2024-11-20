import axios from 'axios';
const UNSPLASH_ROOT = 'https://api.unsplash.com';

export const getPhotosByQuery = async (query, numberOfImages) => {
  const response = await axios.get(`${UNSPLASH_ROOT}/search/photos`, {
    params: {
      query: query,
      client_id: "WwNTPrwSjczbkCrpZQEeGATsplZxS9_h9_QakXPA4a0",
      per_page: numberOfImages,
      orientation:'landscape'
    },
  });
  return response.data;
};