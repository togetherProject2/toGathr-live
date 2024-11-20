import React, { useEffect, useState } from 'react';
import { getPhotosByQuery } from '../../../back-end/unsplash-api.js'; // Adjust the import path as necessary

const ImageGallery = ({ query , numberOfImages}) => {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      const data = await getPhotosByQuery(query, numberOfImages);
      setPhotos(data.results);
    };
    fetchPhotos();
  }, [query]);

  return (
    <div>
      {photos.map(photo => (
        <img key={photo.id} src={photo.urls.small} alt={photo.description} />
      ))}
    </div>
  );
};

export default ImageGallery;