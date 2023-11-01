'use client';

import { DateReadable } from "../lib/utils";
import { useState, useEffect } from "react";

export default function MediaList() { 

    const [images, setImages] = useState([]);

    async function deleteMedia(ev) {
        ev.preventDefault();
    
        const mediaId = ev.target.getAttribute('data-media-id');
    
        const data = {
            mediaId
        }
    
        const response = await fetch(`/api/images`, {
            method: 'DELETE',
            body: JSON.stringify(data)
        });
    
        const result = await response.json();
        
        if(result.status === 'success') {
            let newImages = images.filter((image) => image._id !== mediaId);
            setImages(newImages);
        }
    
    }

    useEffect(() => {
        async function fetchImages() {
            const limit = 25;

            const response = await fetch(`/api/images?limit=${limit}`);
            const result = await response.json();

            const images = result?.images;

            if(!images) {
                return false;
            }
        
            const imagesSimple = images.map((m) => (
                {
                    _id: m._id.toString(),
                    origPath: m.origPath,
                    webpPath: m.webpPath,
                    createdAt: DateReadable(m.createdAt.toString())
                }
            ));

            setImages(imagesSimple);
        }

        fetchImages();
    }, [])

    return (
        <main className="p-4 flex-1 bg-slate-700 rounded-xl">

            <div className="flex justify-start items-center border-b border-b-slate-500 py-2 mb-3">
                <h1 className="text-2xl mr-3">Media</h1>

            </div>

            <table className="my-3">

                <thead>
                    <tr>
                        <th>Thumbnail</th>
                        <th>Id</th>
                        <th>Date Uploaded</th>
                        <th>
                            Actions
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {
                        images.map((m) => (
                            <tr key={m._id}>
                                <td>
                                    <img src={`https://next-store-1.blr1.cdn.digitaloceanspaces.com/thumbnails/${m.webpPath}`} alt="" className="w-20 h-20 rounded-md object-cover" />
                                </td>
                                <td>
                                    {m._id}
                                </td>

                                <td>
                                    {m.createdAt}
                                </td>
                                <td>
                                    <button data-media-id={m._id} onClick={deleteMedia} className="btn-danger">Delete</button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>

            </table>
        </main>
    )
}