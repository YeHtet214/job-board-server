export const sanitizeName = (originalName) => {
    const sanitizedName = originalName
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/[^a-zA-Z0-9._-]/g, '');
    return sanitizedName;
};
