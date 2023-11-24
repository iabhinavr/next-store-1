'use client';
import { useEffect, useState } from "react";
import AddCart from "./AddCart";

export default function ProductContent({ productData, cartCount, setCartCount }) {

    useEffect(() => {
        let thumbnailImage = document.getElementById('thumbnail-image');
        console.log(thumbnailImage);
        let zoomWindow = document.getElementById('zoom-window');
        let zoomImage = document.getElementById('zoom-image');
        let zoomImageWidth = zoomImage.clientWidth;
        let zoomImageHeight = zoomImage.clientHeight;

        thumbnailImage.addEventListener('mousemove', (event) => {
            let rect = thumbnailImage.getBoundingClientRect();
            let scrollY = window.scrollY;
            let scrollX = window.scrollX;

            let thumbX = rect.x + scrollX;
            let thumbY = rect.y + scrollY;

            let thumbWidth = rect.width;
            let thumbHeight = rect.height;

            let mouseX = event.clientX + scrollX;
            let mouseY = event.clientY + scrollY;
            let mouseInThumbX = (mouseX - thumbX) / thumbWidth;
            let mouseInThumbY = (mouseY - thumbY) / thumbHeight;

            zoomWindow.style.top = thumbY + 'px';
            zoomWindow.style.left = (thumbX + thumbWidth + 10) + 'px';

            let zoomOffsetX = Math.floor(250 - (mouseInThumbX * zoomImageWidth)) + 'px';
            console.log(zoomOffsetX);

            let zoomOffsetY = Math.floor(150 - (mouseInThumbY * zoomImageHeight)) + 'px';

            zoomImage.style.marginTop = zoomOffsetY;
            zoomImage.style.marginLeft = zoomOffsetX;

        })

        thumbnailImage.addEventListener('mouseenter', (event) => {
            zoomWindow.style.visibility = 'visible';
        })

        thumbnailImage.addEventListener('mouseleave', (event) => {
            zoomWindow.style.visibility = 'hidden';
        })
    }, [])

    return (
        <main className="container mx-auto py-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="col-span-2">
                    <img id="thumbnail-image" src={`https://next-store-1.blr1.cdn.digitaloceanspaces.com/thumbnails/${productData?.images?.[0]?.url}`} width="600" height="400" alt="" />
                    <div id="zoom-window" className="fixed w-[500px] h-[300px] bg-slate-50 overflow-hidden" style={{visibility: 'hidden'}}>
                        <img id="zoom-image" className="max-w-max w-max" src={`https://next-store-1.blr1.cdn.digitaloceanspaces.com/${productData?.images?.[0]?.url}`}  alt="" />
                    </div>

                </div>
                <div className="col-span-3">
                    <h2 className="text-xl font-semibold">{productData.title}</h2>
                    <p className="text-gray-600 text-xl">INR {productData.price}</p>
                    <p className="mt-2">{productData.description}</p>
                    <AddCart cartCount={cartCount} setCartCount={setCartCount} />
                </div>
            </div>
        </main>
    );
}