'use client';

import { useState, useEffect } from "react";

export default function ImageModal({ showImageModal, setShowImageModal, productImages, setProductImages }) {

    const [uploadedFile, setUploadedFile] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [statusColor, setStatusColor] = useState('');
    const [images, setImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState(productImages);
    const [loadedImages, setLoadedImages] = useState(0);
    const [loadMoreDisabled, setLoadMoreDisabled] = useState(true);
    const [loadMoreState, setLoadMoreState] = useState('Load more');

    async function getImages() {

        setLoadMoreState('Loading...');
        setLoadMoreDisabled(true);

        const limit = 15;

        const response = await fetch(`/api/images?limit=${limit}&skip=${loadedImages}`);

        const result = await response.json();
        console.log(result);

        if (result?.images?.length > 0) {
            const newImages = [...images, ...result.images];
            setImages(newImages);
            let skip = loadedImages + result.images.length;


            let loadedImageCount = 0;

            const handleImageLoad = () => {

                loadedImageCount++;

                if (loadedImageCount === result.images.length) {
                    setLoadedImages(skip);
                    setLoadMoreState('Load more');
                    setLoadMoreDisabled(false);
                }
            }

            result.images.forEach((newImage) => {
                const image = new Image();
                image.src = `https://next-store-1.blr1.cdn.digitaloceanspaces.com/thumbnails/${newImage.webpPath}`;
                image.onload = handleImageLoad;
            })
        }
        else {
            setLoadMoreState('Nothing more');
        }
    }

    useEffect(() => {

        getImages();

    }, []);

    useEffect(() => {

        if (uploadedFile) {
            console.log('calling getimages...');
            getImages();
        }

    }, [uploadedFile])

    useEffect(() => {
        console.log(selectedImages);
    }, [selectedImages])

    async function closeImageModalOnClick(ev) {
        ev.preventDefault();
        setShowImageModal(false);
    }

    async function handleOnSubmit(ev) {
        ev.preventDefault();

        setUploadStatus('pending');
        setUploadMessage('The file is being uploaded...');
        setStatusColor('bg-yellow-700 border-yellow-500');

        const formData = new FormData(ev.target);

        const response = await fetch("/api/images", {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        switch (result.uploadStatus) {
            case 'success':
                setUploadStatus('success');
                setUploadedFile(result.url);
                setUploadMessage('File uploaded successfully.');
                setStatusColor('bg-teal-700 border-teal-500');
                break;
            case 'exists':
                setUploadStatus('exists');
                setUploadMessage('File already exists.');
                setStatusColor('bg-orange-600 border-orange-400');
                break;
            case 'error':
                setUploadStatus('error');
                setUploadMessage(result.message);
                setStatusColor('bg-red-600 border-red-400');
                break;
        }

        setTimeout(() => {
            setUploadStatus(false);
            setUploadedFile(false);
        }, 2500)
    }

    async function toggleSelect(ev) {
        const imageId = ev.currentTarget.getAttribute('data-image-id');
        const imageUrl = ev.currentTarget.getAttribute('data-image-url');

        const hasImageId = selectedImages.some(obj => obj.id === imageId);

        const newSelectedImages = hasImageId ? selectedImages.filter(obj => obj.id !== imageId) : [...selectedImages, {id: imageId, url: imageUrl}];

        setSelectedImages(newSelectedImages);
    }

    async function loadMore(ev) {
        ev.preventDefault();

        getImages();
    }

    async function addSelected(ev) {
        ev.preventDefault();
        setProductImages(selectedImages);
        setShowImageModal(false);
    }

    return (
        <>
            {showImageModal && <div className="fixed inset-0 flex items-center justify-center left-0 w-screen h-screen z-10 bg-slate-900/75 p-10 ">
                <div className="modal-box w-full h-full bg-slate-700 rounded-lg overflow-scroll">
                    <div className="modal-header flex items-center justify-between py-3 px-4 border-b border-b-slate-400">
                        <h2 className="text-2xl">Add Images</h2>
                        <button onClick={closeImageModalOnClick}>[X]</button>
                    </div>
                    <div className="modal-upload-area py-3 px-4">

                        <form onSubmit={handleOnSubmit} action="" encType="multipart/form-data" method="post">
                            <label htmlFor="product-images" className="block py-2 text-lg">Upload new image:</label>
                            <input type="file" name="product-images" id="product-images" />
                            <button type="submit" className="btn-primary">Upload</button>
                        </form>

                        {
                            uploadStatus &&

                            <div className={`${statusColor} border rounded-md py-2 px-3 my-2 text-sm inline-block`}>
                                {uploadMessage} &nbsp;
                                {
                                    uploadStatus === 'success' &&
                                    <span>View: <a href={`${uploadedFile}`} className="underline">{uploadedFile}</a></span>

                                }
                            </div>
                        }

                    </div>
                    <div className="modal-images-area py-3 px-4">
                        <ul className="flex flex-wrap  gap-1">
                            {
                                images.map((image) => {

                                    const hasImageId = selectedImages.some(obj => obj.id === image._id);

                                    return (
                                    <li data-image-url={image.webpPath} data-image-id={image._id} onClick={toggleSelect} key={image._id} className={`h-40 flex-grow object-cover${hasImageId ? " selected" : ''}`}>

                                        {
                                            hasImageId &&
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="#14b8a6" viewBox="0 0 16 16">
                                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
                                                </svg>
                                            </div>
                                        }

                                        <img className="object-cover object-center h-full w-full" src={`https://next-store-1.blr1.cdn.digitaloceanspaces.com/thumbnails/${image.webpPath}`} alt="" />
                                    </li>
                                    )
})
                            }
                        </ul>

                        <div className="flex justify-center py-3">
                            <button onClick={loadMore} className="btn-primary" disabled={loadMoreDisabled}>
                                {loadMoreState}
                            </button>
                        </div>


                    </div>
                    <div className="modal-footer flex justify-end items-center py-3 px-4 border-t border-t-slate-400 bg-slate-600">
                        <button onClick={addSelected} className="btn-primary">Add Selected</button>
                    </div>
                </div>
            </div>}
        </>
    );
}