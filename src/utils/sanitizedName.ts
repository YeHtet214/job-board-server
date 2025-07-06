export const sanitizeName = (originalName: string) => {
    const sanitizedName = originalName
    .replace(/\s+/g, '_')  // Replace spaces with underscores
    .replace(/[^a-zA-Z0-9._-]/g, ''); 

    return sanitizedName;
}