import Pica from "pica";

const pica = new Pica();

export const resizeImage = async(file, targetWidth = 600, mimeType = "image/jpeg", quality = "0.8") => {

    const reader = new FileReader();
    reader.readAsDataURL(file);

    return new Promise((resolve, reject) => {
        reader.onload = async(event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = async () => {

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