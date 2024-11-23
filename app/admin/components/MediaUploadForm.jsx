'use client';

import { useEffect, useRef, useState } from "react";
import { getImagePreview, resizeImage } from "@/app/lib/image";

export default function MediaUploadForm({ progressBar, setProgressBar, images, setImages, loadedImages = 0, setLoadedImages = false }) {

    const [uploadedFile, setUploadedFile] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(false);
    const [uploadMessage, setUploadMessage] = useState('');
    const [statusColor, setStatusColor] = useState('');

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
                body: JSON.stringify({ key, mimeType }),
            });

            const { signedUrl } = await signedUrlReq.json();

            return signedUrl;
        }
        catch (error) {
            return false;
        }

    }

    async function uploadImageObject(origPath, index) {

        return new Promise((resolve, reject) => {

            const xhr = new XMLHttpRequest();
            xhr.open("PUT", versions.current[origPath][index].signedUrl, true);
            xhr.setRequestHeader("Content-Type", versions.current[origPath][index].mimeType);

            xhr.onreadystatechange = async () => {
                if (xhr.status === 200) {
                    resolve();
                }
                else {
                    reject(new Error(`Upload failed. ${xhr.statusText}`));
                }
            }

            xhr.upload.onprogress = (event) => {

                if (event.lengthComputable) {
                    console.log(`${index} - ${event.loaded} / ${event.total}`);
                    versions.current[origPath][index].sizeUploaded = event.loaded;
    
                    let currentTotalUploaded = 0;
    
                    versions.current[origPath].map((v) => {
                        currentTotalUploaded += v.sizeUploaded;
                    });
    
                    setProgressBar((prevProgress) => {
    
                        return prevProgress.map((item) => {
                            if (item.key === origPath) {
                                return { ...item, uploaded: currentTotalUploaded };
                            }
                            else {
                                return item;
                            }
                        })
                    })
                }
            }

            xhr.send(versions.current[origPath][index].imageBlob);
        });
    }

    async function addImage(image) {

        const fileInfo = getFileInfo(image);

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
        if(!allowedTypes.includes(fileInfo.mimeType)) {
            throw new Error(`${fileInfo.mimeType} is not a supported image format`);
        }
        const imagePreview = await getImagePreview(image);

        progressBarRef.current[fileInfo.origPath] = { uploaded: 0, total: 0 };

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

        setProgressBar((prevProgress) => ([
            ...prevProgress, { key: fileInfo.origPath, uploaded: 0, total: 0, imagePreview, message: 'generating thumbnails...' }
        ]));

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

        versions.current[fileInfo.origPath].map(async (v) => {

            totalSize += v.sizeTotal;
            progressBarRef.current[fileInfo.origPath].total += v.sizeTotal;
        });

        setProgressBar((prevProgress) => {
            return prevProgress.map((item) => {
                if(item.key === fileInfo.origPath) {
                    return {...item, total: totalSize, message: "uploading to storage..."}
                }
                else {
                    return item;
                }
            })
        });

        const uploadPromises = versions.current[fileInfo.origPath].map(async (v, i) => {
            const signedUrl = await getSignedUrl(v.key, v.mimeType);
            versions.current[fileInfo.origPath][i].signedUrl = signedUrl;
            await uploadImageObject(fileInfo.origPath, i);
        });

        try {
            await Promise.all(uploadPromises);

            setProgressBar((prevProgress) => {
                return prevProgress.map((item) => {
                    if(item.key === fileInfo.origPath) {
                        return {...item, message: "adding metadata..."}
                    }
                    else {
                        return item;
                    }
                })
            })

            const makePublicPromises = versions.current[fileInfo.origPath].map(async(v,i) => {
                await fetch("/api/make-object-public", {
                    method: 'POST',
                    body: JSON.stringify({ key: v.key }),
                });
            });

            await Promise.all(makePublicPromises);

            setProgressBar((prevProgress) => {
                return prevProgress.map((item) => {
                    if(item.key === fileInfo.origPath) {
                        return {...item, message: "saving details..."}
                    }
                    else {
                        return item;
                    }
                })
            })

            const res = await fetch("/api/images", {
                method: 'POST',
                body: JSON.stringify({ origPath: fileInfo.origPath, webpPath: fileInfo.webpPath }),
            });

            const { image } = await res.json();

            setProgressBar((prevProgress) => {
                return prevProgress.filter((p) => (p.key !== image.origPath));
            })

            return { success: true, image };
        }
        catch (error) {
            return { success: false, error: error.message };
        }

    }

    async function handleOnSubmit(ev) {
        ev.preventDefault();

        setUploadStatus('pending');
        setUploadMessage('The file is being uploaded...');
        setStatusColor('bg-yellow-700 border-yellow-500');

        const formData = new FormData(ev.target);
        const inputImages = formData.getAll("product-images");

        const addImagesPromises = inputImages.map(async(inputImage) => {

            const addImageResult = await addImage(inputImage);
            if (addImageResult.success) {

                setImages((prevImages) => ([addImageResult.image, ...prevImages]));
                
            }
        });

        try {
            await Promise.all(addImagesPromises);
            ev.target.reset();
            setUploadStatus('success');
            setUploadMessage('all files uploaded successfully');
            setStatusColor('bg-teal-700 border-teal-500');
        }
        catch(error) {
            setUploadStatus('error');
            setUploadMessage(`error uploading files - ${error.message}`);
            setStatusColor('bg-red-700 border-red-500');
        }
    }

    return (
        <>
            <form onSubmit={handleOnSubmit} action="" encType="multipart/form-data" method="post">
                <label htmlFor="product-images" className="block py-2 text-lg">Upload new image:</label>
                <input type="file" name="product-images" id="product-images" multiple />
                <button type="submit" className="btn-primary">Upload</button>
            </form>

            {
                uploadStatus &&

                <div className={`${statusColor} border rounded-md py-2 px-3 my-2 text-sm inline-block`}>
                    {uploadMessage}
                </div>
            }
        </>
    )
}