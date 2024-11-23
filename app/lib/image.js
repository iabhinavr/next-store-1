import Pica from "pica";

const pica = new Pica();

export const resizeImage = async(file, targetWidth = null, mimeType = "image/jpeg", quality = "0.8") => {

    const reader = new FileReader();
    reader.readAsDataURL(file);

    return new Promise((resolve, reject) => {
        reader.onload = async(event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = async () => {

                /**
                 * this is for resizing fullsize images
                 * while capping the max width to 1920px
                 */

                if(targetWidth === null) {
                    if(img.width > 1920) {
                        targetWidth = 1920;
                    }
                    else {
                        targetWidth = img.width;
                    }
                }

                /**
                 * for thumbnails, targetWidth will be passed in as a param,
                 * if that is larger than 1920px, cap it as well
                 */

                if(targetWidth > 1920) {
                    targetWidth = 1920;
                }                

                const targetHeight = targetWidth * (img.height / img.width);

                const canvas = document.createElement("canvas");

                canvas.width = targetWidth;
                canvas.height = targetHeight;

                try {
                    const resizedCanvas = await pica.resize(img, canvas);
                    const blob = await pica.toBlob(resizedCanvas, mimeType, quality);
                    resolve(blob);

                }
                catch(error) {
                    reject(error);
                }
            }
        }
    })
}