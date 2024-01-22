document.addEventListener('DOMContentLoaded', function () {
    // Parse the query parameter to get the username
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');

    // Add event listener to the search input
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    searchButton.addEventListener('click', function () {
        const searchTerm = searchInput.value.toLowerCase();
        filterRepositories(searchTerm);
    });

    if (username) {
        // Fetch user data and repositories
        fetchUserData(username);
    } else {
        console.error('Username not provided in the query parameter.');
    }
});

const fetchUserData = (username) => {
    // Fetch user data
    document.getElementById("result").innerHTML = "";
            document.getElementById("pagination").innerHTML = "";
            loader.style.display = "block"; // Show the loader
    
            fetch(`https://api.github.com/users/${username}`)
            .then((userResult) => userResult.json())
            .then((userData) => {
                console.log(userData);
    
                document.getElementById("userInfo").innerHTML = `
                <div class = "bioContainer">
                    <div>
                        <img src = "${userData.avatar_url}" />
                    </div>
                    <div>
                        <h2>${userData.name}</h2>
                        <p>${userData.bio}</p>
                        <p>${userData.html_url}</p>
                    </div>
                </div>
                `
            })
            .then(() => {
                // Fetching user data
                fetchUserRepositories(username, 1, 10);
            })
            .finally(() => {
                loader.style.display = "none"; // Hide the loader after fetching data
            });
};

const fetchUserRepositories = (username, page, perPage) => {
    // Fetch user repositories with pagination
    fetch(`https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}`)
        .then((result) => {
              // Clear previous buttons before appending new ones
            document.getElementById("pagination").innerHTML = "";

              // Check if the response has a Link header
            const linkHeader = result.headers.get('Link');
            if (linkHeader) {
                  // Parse the Link header to get next and last page URLs
                const links = linkHeader.split(', ').reduce((acc, link) => {
                    const [url, rel] = link.split('; ');
                    const parsedUrl = url.slice(1, -1); // Remove < and > from the URL
                    const parsedRel = rel.split('=')[1].slice(1, -1); // Remove quotes around 'next' or 'last'
                    acc[parsedRel] = parsedUrl;
                    return acc;
                }, {});

                  // Display "Previous Page" button even on the last page
                const prevPage = document.createElement('button');
                prevPage.textContent = 'Prev Page';
                prevPage.addEventListener('click', () => fetchUserRepositories(username, page - 1, perPage));
                document.getElementById("pagination").appendChild(prevPage);

                  // If there's a next page, display "Next Page" button
                if (links.next) {
                    const nextPage = document.createElement('button');
                    nextPage.textContent = 'Next Page';
                    nextPage.addEventListener('click', () => fetchUserRepositories(username, page + 1, perPage));
                    document.getElementById("pagination").appendChild(nextPage);
                }

                  
            }

            return result.json();
        })
        .then((data) => {
            console.log(data);
              // Display the repositories on the page
            document.getElementById("result").innerHTML = data.map(repo => `<div><h4>${repo.name}</h4><p>${repo.description}</p><h6>${repo.language}</h6></div>`).join('');
        });               
};

const filterRepositories = (searchTerm) => {
    const repositories = document.getElementById('result').children;

    for (const repo of repositories) {
        const repoName = repo.querySelector('h4').textContent.toLowerCase();

        if (repoName.includes(searchTerm)) {
            repo.style.display = 'block';
        } else {
            repo.style.display = 'none';
        }
    }
};



