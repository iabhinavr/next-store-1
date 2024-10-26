export function DateReadable(dateString) {

    const createdDate = new Date(dateString);

    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    const formattedDate = createdDate.toLocaleDateString('en-US', options);

    return formattedDate;
}