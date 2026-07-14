type LoadedImage = {
  cleanup: () => void;
  height: number;
  source: CanvasImageSource;
  width: number;
};

type GalleryImageVariants = {
  display: Blob;
  thumbnail: Blob;
};

async function loadImage(file: File): Promise<LoadedImage> {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });

    return {
      cleanup: () => bitmap.close(),
      height: bitmap.height,
      source: bitmap,
      width: bitmap.width,
    };
  } catch {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.decoding = "async";
    image.src = objectUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Das Bild konnte nicht gelesen werden."));
    });

    return {
      cleanup: () => URL.revokeObjectURL(objectUrl),
      height: image.naturalHeight,
      source: image,
      width: image.naturalWidth,
    };
  }
}

function canvasToWebp(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.type !== "image/webp") {
          reject(
            new Error(
              "Der Browser konnte keine optimierte WebP-Version erstellen.",
            ),
          );
          return;
        }

        resolve(blob);
      },
      "image/webp",
      quality,
    );
  });
}

async function createVariant(
  image: LoadedImage,
  maximumLongEdge: number,
  quality: number,
) {
  const longEdge = Math.max(image.width, image.height);
  const scale = Math.min(1, maximumLongEdge / longEdge);

  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", {
    alpha: true,
  });

  if (!context) {
    throw new Error("Das Bild konnte nicht verarbeitet werden.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image.source, 0, 0, width, height);

  return canvasToWebp(canvas, quality);
}

export async function createGalleryImageVariants(
  file: File,
): Promise<GalleryImageVariants> {
  const image = await loadImage(file);

  try {
    const [display, thumbnail] = await Promise.all([
      createVariant(image, 2000, 0.86),
      createVariant(image, 700, 0.78),
    ]);

    return {
      display,
      thumbnail,
    };
  } finally {
    image.cleanup();
  }
}