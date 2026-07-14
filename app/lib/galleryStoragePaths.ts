export type GalleryStoragePaths = {
  original: string;
  display: string;
  thumbnail: string;
};

function replaceExtension(storagePath: string, extension: string) {
  return storagePath.replace(/\.[^./]+$/, `.${extension}`);
}

export function getGalleryVariantPaths(
  storagePath: string,
): GalleryStoragePaths {
  const normalizedPath = storagePath.trim();

  /*
    Existing images were uploaded before variants existed.

    For those images, all three variants point to the original so nothing
    breaks and no migration is required.
  */
  if (!normalizedPath.includes("/original/")) {
    return {
      original: normalizedPath,
      display: normalizedPath,
      thumbnail: normalizedPath,
    };
  }

  return {
    original: normalizedPath,
    display: replaceExtension(
      normalizedPath.replace("/original/", "/display/"),
      "webp",
    ),
    thumbnail: replaceExtension(
      normalizedPath.replace("/original/", "/thumbnail/"),
      "webp",
    ),
  };
}

export function getAllGalleryStoragePaths(storagePath: string) {
  return [
    ...new Set(Object.values(getGalleryVariantPaths(storagePath))),
  ];
}