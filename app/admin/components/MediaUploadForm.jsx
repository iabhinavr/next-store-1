'use client';

import { useState } from "react";
import { resizeImage } from "@/app/lib/image";

export default function MediaUploadForm({ images, setImages, loadedImages = 0, setLoadedImages = false}) {

    const [uploadedFile, setUploadedFile] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [statusColor, setStatusColor] = useState('');

    async function handleOnSubmit(ev) {
        ev.preventDefault();

        setUploadStatus('pending');
        setUploadMessage('The file is being uploaded...');
        setStatusColor('bg-yellow-700 border-yellow-500');

        const formData = new FormData(ev.target);
        const image = formData.get("product-images");
        
        const fileData = {
            name: image.name,
            type: image.type,
        }

        try {
            const signedUrlReq = await fetch("/api/signed-url", {
                method: 'POST',
                body: JSON.stringify(fileData),
            });
    
            const { signedUrl } = await signedUrlReq.json();

            const resizedImage = await resizeImage(image);

            const xhr = new XMLHttpRequest();
            xhr.open("PUT", signedUrl, true);
            xhr.setRequestHeader("Content-Type", fileData.type);

            xhr.onreadystatechange = async () => {
                if(xhr.status === 200) {
                    const res = await fetch("/api/make-object-public", {
                        method: 'POST',
                        body: JSON.stringify({key: fileData.name}),
                    });
    
                    console.log(res);
                }
            }

            xhr.upload.onprogress = (event) => {
                if(event.lengthComputable) {
                    console.log("length computable");
                }
                else {
                    console.log("length not computable");
                }
                console.log(`${event.loaded} / ${event.total}`);
            }

            xhr.send(resizedImage);

            // const upload = await fetch(signedUrl, {
            //     method: 'PUT',
            //     headers: {
            //         "Content-Type": fileData.type,
            //     },
            //     body: resizedImage
            // });

            // if(upload.ok) {

            //     const res = await fetch("/api/make-object-public", {
            //         method: 'POST',
            //         body: JSON.stringify({key: fileData.name}),
            //     });

            //     console.log(res);

            // }
            
            
        }
        catch(error) {
            console.log(error.message);
        }

        return;

        const response = await fetch("/api/images", {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        switch (result.uploadStatus) {
            case 'success':
                setUploadStatus('success');
                setUploadedFile(result.url);
                // setLoadedImages(loadedImages + 1);

                setImages([result.image, ...images]);

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

    return (
        <>
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
        </>
    )
}