'use client';

import { useRef, useState } from "react";
import { resizeImage } from "@/app/lib/image";

export default function MediaUploadForm({ images, setImages, loadedImages = 0, setLoadedImages = false}) {

    const [uploadedFile, setUploadedFile] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [statusColor, setStatusColor] = useState('');
    const [progressBar, setProgressBar] = useState([]);

    const versions = useRef([]);
    const progressBarRef = useRef([]);

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

    async function uploadImageObject(index) {

        /**
         * to set the common progress bar for all the four thumbnails
         */

        const fileName = versions.current[index].fileName;
        progressBarRef.current[fileName].uploaded = 0;

        // now upload

        const xhr = new XMLHttpRequest();
        xhr.open("PUT", versions.current[index].signedUrl, true);
        xhr.setRequestHeader("Content-Type", versions.current[index].mimeType);

        xhr.onreadystatechange = async () => {
            if(xhr.status === 200) {
                const res = await fetch("/api/make-object-public", {
                    method: 'POST',
                    body: JSON.stringify({ key: versions.current[index].key }),
                });

                console.log(res);
            }
        }

        xhr.upload.onprogress = (event) => {
            let currentTotalUploaded = 0;
            if(event.lengthComputable) {
                //console.log("length computable");
            }
            else {
                //console.log("length not computable");
            }
            //console.log(`${event.loaded} / ${event.total}`);
            versions.current[index].sizeUploaded = event.loaded;

            versions.current.map((v) => {
                currentTotalUploaded += v.sizeUploaded;
            });

            progressBarRef.current[fileName].uploaded = currentTotalUploaded;
            let currentProgressInPercentage = parseInt((progressBarRef.current[fileName].uploaded/progressBarRef.current[fileName].total)*100);
            progressBarRef.current[fileName].percentUploaded = currentProgressInPercentage;

            setProgressBar(progressBarRef.current);

            console.log(currentProgressInPercentage + "% uploaded");
        }

        xhr.send(versions.current[index].imageBlob);
    }

    async function addImage(image) {

        const fileInfo = getFileInfo(image);
        progressBarRef.current[fileInfo.fileName] = {uploaded: 0, total: 0};

        const size = {};
        size.total = 0;

        versions.current = [
            {
                title: "fullsize", 
                fileName: fileInfo.fileName,
                width: null, 
                mimeType: fileInfo.mimeType, 
                key: `${fileInfo.folderPath}/${fileInfo.fileName}`, 
                sizeTotal: 0, 
                sizeUploaded: 0
            },
            {
                title: "fullsize-webp",
                fileName: fileInfo.fileName,
                width: null, 
                mimeType: "image/webp", 
                key: `${fileInfo.folderPath}/${fileInfo.fileNameNoExt}.webp`, 
                sizeTotal: 0, 
                sizeUploaded: 0
            },
            {
                title: "thumbnail",
                fileName: fileInfo.fileName, 
                width: 600, 
                mimeType: fileInfo.mimeType, 
                key: `thumbnails/${fileInfo.folderPath}/${fileInfo.fileName}`, 
                sizeTotal: 0, 
                sizeUploaded: 0
            },
            {
                title: "thumbnail-webp",
                fileName: fileInfo.fileName, 
                width: 600, 
                mimeType: "image/webp", 
                key: `thumbnails/${fileInfo.folderPath}/${fileInfo.fileNameNoExt}.webp`, sizeTotal: 0, 
                sizeUploaded: 0
            }
        ];

       const resizePromises = versions.current.map(async (v, i) => {
            const imageBlob = await resizeImage(image, v.width, v.mimeType);
            versions.current[i].imageBlob = imageBlob;
            versions.current[i].sizeTotal = imageBlob.size;
            
        });

        await Promise.all(resizePromises);

        /**
         * - now set the total size in the progress bar
         * - key will be same for all the four versions as there is only
         *   one progress bar for all four
         * - could be done above, but just to be more clear, doing it separately
         */

        versions.current.map(async(v) => {
            progressBarRef.current[fileInfo.fileName].total += v.sizeTotal;
        });

        console.log(versions);

        const uploadPromises = versions.current.map(async (v, i) => {
            console.log(`uploading ${v.title}`);
            const signedUrl = await getSignedUrl(v.key, v.mimeType);
            versions.current[i].signedUrl = signedUrl;
            uploadImageObject(i);
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

        console.log(await res.json())

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