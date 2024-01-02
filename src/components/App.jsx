import css from './App.module.css';
import Notiflix from 'notiflix';
import React, { useState, useEffect } from 'react';

import { requestPhotos } from 'services/api';
import { STATUSES } from 'services/constants';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Searchbar } from './Searchbar/Searchbar';
import { Button } from './Button/Button';
import { Loader } from './Loader/Loader';
import { Modal } from './Modal/Modal';

export const App = () => {
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState(STATUSES.idle);
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [onLoad, setOnLoad] = useState(false);

  const featchPhotosByQuery = async (searchValue, page) => {
    try {
      setStatus(STATUSES.pending);
      setOnLoad(false);
      const { hits, totalHits } = await requestPhotos(searchValue, page);
      setPhotos(prevState => [...(prevState || []), ...hits]);
      setStatus(STATUSES.success);
      setOnLoad(page < Math.ceil(totalHits / 12));
    } catch (e) {
      setStatus(STATUSES.error);
      Notiflix.Notify.failure(
        'Oops! Something went wrong. Please try again later'
      );
    }
  };

  useEffect(() => {
    if (searchValue === '' && page === 1) return;

    featchPhotosByQuery(searchValue, page);
  }, [searchValue, page]);

  const handleSubmit = e => {
    e.preventDefault();

    const searchValue = e.currentTarget.elements.search.value;

    setSearchValue(searchValue);
    setPage(1);
    setPhotos([]);
    e.target.reset();
  };

  const handleLodeMore = () => {
    setPage(prevState => prevState + 1);
  };

  const handleOpenModal = photoId => {
    const selectedPhoto = photos.find(photo => photo.id === photoId);
    setIsOpenModal(true);
    setModalData(selectedPhoto);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };

  return (
    <div className={css.app}>
      <Searchbar handleSubmit={handleSubmit} />
      <ImageGallery photos={photos} handleOpenModal={handleOpenModal} />
      {status === STATUSES.pending && <Loader />}
      {onLoad && <Button handleLodeMore={handleLodeMore} />}
      {isOpenModal && (
        <Modal modalData={modalData} handleCloseModal={handleCloseModal} />
      )}
    </div>
  );
};
