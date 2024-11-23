'use client';

import { useEffect, useRef, useState } from "react";
import { resizeImage } from "@/app/lib/image";

export default function MediaUploadForm({ images, setImages, loadedImages = 0, setLoadedImages = false}) {

    const [uploadedFile, setUploadedFile] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [statusColor, setStatusColor] = useState('');
    const [progressBar, setProgressBar] = useState([]);

    const versions = useRef([]);
    const progressBarRef = useRef([]);

    useEffect(() => {
        console.log('progressBar changed');
        console.log(progressBar);
    }, [progressBar])

    function getFileInfo(file) {
    
        const fileName = file.name;
        const mimeType = file.type;
        const fileNameNoExt = file.name.slice(0, file.name.lastIndexOf("."));
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
    
        const currentMonth = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const folderPath = currentYear + "/" + currentMonth;

        const origPath = `${folderPath}/${fileName}`;
        const webpPath = `${folderPath}/${fileNameNoExt}.webp`;
    
        const fileInfo = {
           fileName,
           origPath,
           webpPath,
           fileNameNoExt,
           folderPath,
           mimeType,
        }
    
        return fileInfo;
    }

    async function getSignedUrl(key, mimeType) {

        try {
            const signedUrlReq = await fetch("/api/signed-url", {
                method: 'POST',
                body: JSON.stringify({key, mimeType}),
            });
    
            const { signedUrl } = await signedUrlReq.json();
    
            return signedUrl;
        }
        catch(error) {
            return false;
        }
        
    }

    async function uploadImageObject(origPath, index) {

        /**
         * to set the common progress bar for all the four thumbnails
         */

        progressBarRef.current[origPath].uploaded = 0;

        // now upload

        const xhr = new XMLHttpRequest();
        xhr.open("PUT", versions.current[origPath][index].signedUrl, true);
        xhr.setRequestHeader("Content-Type", versions.current[origPath][index].mimeType);

        xhr.onreadystatechange = async () => {
            if(xhr.status === 200) {
                const res = await fetch("/api/make-object-public", {
                    method: 'POST',
                    body: JSON.stringify({ key: versions.current[origPath][index].key }),
                });

            }
        }

        xhr.upload.onprogress = (event) => {
            
            if(event.lengthComputable) {
                
            }
            else {
                
            }
            console.log(`${index} - ${event.loaded} / ${event.total}`);
            versions.current[origPath][index].sizeUploaded = event.loaded; 

            let currentTotalUploaded = 0;
            
            versions.current[origPath].map((v) => {
                currentTotalUploaded += v.sizeUploaded;
            });

            setProgressBar((prevProgress) => {

                return prevProgress.map((item) => {
                    if(item.key === origPath) {
                        return {...item, uploaded: currentTotalUploaded};
                    }
                    else {
                        return item;
                    }
                })
            })

        }

        xhr.send(versions.current[origPath][index].imageBlob);
    }

    async function addImage(image) {

        const fileInfo = getFileInfo(image);
        progressBarRef.current[fileInfo.origPath] = {uploaded: 0, total: 0};

        versions.current[fileInfo.origPath] = [
            {
                title: "fullsize",
                fileName: fileInfo.fileName,
                width: null, 
                mimeType: fileInfo.mimeType, 
                key: `${fileInfo.origPath}`, 
                sizeTotal: 0, 
                sizeUploaded: 0
            },
            {
                title: "fullsize-webp",
                fileName: fileInfo.fileName,
                width: null, 
                mimeType: "image/webp", 
                key: `${fileInfo.webpPath}`,
                sizeTotal: 0, 
                sizeUploaded: 0
            },
            {
                title: "thumbnail",
                fileName: fileInfo.fileName, 
                width: 600, 
                mimeType: fileInfo.mimeType, 
                key: `thumbnails/${fileInfo.origPath}`, 
                sizeTotal: 0, 
                sizeUploaded: 0
            },
            {
                title: "thumbnail-webp",
                fileName: fileInfo.fileName, 
                width: 600, 
                mimeType: "image/webp", 
                key: `thumbnails/${fileInfo.webpPath}`, 
                sizeTotal: 0,
                sizeUploaded: 0
            }
        ];

       const resizePromises = versions.current[fileInfo.origPath].map(async (v, i) => {
            const imageBlob = await resizeImage(image, v.width, v.mimeType);
            versions.current[fileInfo.origPath][i].imageBlob = imageBlob;
            versions.current[fileInfo.origPath][i].sizeTotal = imageBlob.size;
        });

        await Promise.all(resizePromises);

        /**
         * - now set the total size in the progress bar
         * - key will be same for all the four versions as there is only
         *   one progress bar for all four
         * - could be done above, but just to be more clear, doing it separately
         */

        let totalSize = 0;

        versions.current[fileInfo.origPath].map(async(v) => {

            totalSize += v.sizeTotal;
            progressBarRef.current[fileInfo.origPath].total += v.sizeTotal;
        });

        setProgressBar((prevProgress) => ([
            ...prevProgress, {key: fileInfo.origPath, uploaded: 0, total: totalSize}
        ]));

        const uploadPromises = versions.current[fileInfo.origPath].map(async (v, i) => {
            const signedUrl = await getSignedUrl(v.key, v.mimeType);
            versions.current[fileInfo.origPath][i].signedUrl = signedUrl;
            uploadImageObject(fileInfo.origPath, i);
        });

        await Promise.all(uploadPromises);

        return {fileInfo};

    }

    async function handleOnSubmit(ev) {
        ev.preventDefault();

        setUploadStatus('pending');
        setUploadMessage('The file is being uploaded...');
        setStatusColor('bg-yellow-700 border-yellow-500');

        const formData = new FormData(ev.target);
        const image = formData.get("product-images");
        
        const {fileInfo} = await addImage(image);

        const res = await fetch("/api/images", {
            method: 'POST',
            body: JSON.stringify({origPath: `${fileInfo.folderPath}/${fileInfo.fileName}`, webpPath: `${fileInfo.folderPath}/${fileInfo.fileNameNoExt}.webp`}),
        });

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
            { 
                <div className="progressBar">
                    {progressBar.map((p,i) => (
                        <div key={p.key}>
                            uploading {p.key} - { parseInt((p.uploaded/p.total)*100)}% complete
                        </div>
                    ))}
                </div>
                
            }
        </>
    )
}