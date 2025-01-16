function fetchAnyUrl(url, options = {}) {
    return fetch(url, options)
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
            return response.json();
        });
}
export {fetchAnyUrl}

