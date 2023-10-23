'use client';

import { useState, useEffect } from "react";

export default function ImageModal({ showImageModal, setShowImageModal }) {

    const [uploadedFile, setUploadedFile] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [statusColor, setStatusColor] = useState('');
    const [images, setImages] = useState([]);

    useEffect(() => {

        async function getImages() {
            const response = await fetch("/api/images?limit=5");

            const result = await response.json();

            if(result?.images?.length > 0) {
                setImages(result.images);
            }
        }

        getImages();

    }, []);

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

        switch(result.uploadStatus) {
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
    }

    return (
        <>
            {showImageModal && <div className="fixed inset-0 flex items-center justify-center left-0 w-screen h-screen z-10 bg-slate-900/75 p-10 ">
                <div className="modal-box w-full h-full bg-slate-700 rounded-lg">
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
                    <div className="modal-images-area">
                        <ul className="grid grid-cols-4">
                            {
                                images.map((image) => (
                                    <li key={image._id}>
                                        <img src={`https://next-store-1.blr1.cdn.digitaloceanspaces.com/${image.fileName}`} alt="" />
                                    </li>
                                ))
                            }
                        </ul>
                    </div>
                    <div className="modal-footer"></div>
                </div>
            </div>}
        </>
    );
}