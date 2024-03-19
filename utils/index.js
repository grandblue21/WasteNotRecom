export const checkImageUrl = (url) => {
    if (!url) {
        return false;
    }
 
    return url.match(/\.(jpg|jpeg|gif|png)$/) != null;
}