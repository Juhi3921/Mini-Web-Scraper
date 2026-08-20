let scrapedData = null;

const urlInput =
    document.getElementById("urlInput");

const message =
    document.getElementById("message");


// -----------------------------
// Status message
// -----------------------------

function setMessage(text) {
    message.textContent = text;
}


// -----------------------------
// Scrape website
// -----------------------------

function scrapeWebsite() {

    const url = urlInput.value.trim();

    if (!url) {

        setMessage(
            "Enter a URL first."
        );

        return;
    }


    setMessage(
        "Requesting page..."
    );


    fetch("/scrape", {

        method: "POST",

        headers: {
            "Content-Type":
                "application/json"
        },

        body: JSON.stringify({
            url: url
        })

    })

        .then(response => {

            return response.json();

        })

        .then(data => {

            if (data.error) {

                setMessage(
                    "Error: " + data.error
                );

                return;
            }


            setMessage(
                "Finished."
            );


            showResults(data);

        })

        .catch(error => {

            console.log(error);

            setMessage(
                "Could not connect to server."
            );

        });
}


// -----------------------------
// Show results
// -----------------------------

function showResults(data) {

    // Save scraped data
    // for downloading later

    scrapedData = data;


    document
        .getElementById("results")
        .classList
        .remove("hidden");


    // Page title

    document.getElementById(
        "pageTitle"
    ).textContent =
        data.title;


    // URL

    document.getElementById(
        "pageUrl"
    ).textContent =
        data.url;


    // HTTP status

    document.getElementById(
        "httpStatus"
    ).textContent =
        data.status;


    // Response time

    document.getElementById(
        "responseTime"
    ).textContent =
        data.response_time + " seconds";


    // Scraped time

    document.getElementById(
        "scrapeTime"
    ).textContent =
        data.time;


    // Statistics

    document.getElementById(
        "headingCount"
    ).textContent =
        data.stats.headings;


    document.getElementById(
        "linkCount"
    ).textContent =
        data.stats.links;


    document.getElementById(
        "imageCount"
    ).textContent =
        data.stats.images;


    document.getElementById(
        "paragraphCount"
    ).textContent =
        data.stats.paragraphs;


    // Display extracted information

    showHeadings(
        data.headings
    );

    showLinks(
        data.links
    );

    showParagraphs(
        data.paragraphs
    );

    showImages(
        data.images
    );
}


// -----------------------------
// Show headings
// -----------------------------

function showHeadings(headings) {

    const box =
        document.getElementById(
            "headingsList"
        );

    box.innerHTML = "";


    if (headings.length === 0) {

        box.innerHTML =
            '<div class="data-item">No headings found.</div>';

        return;
    }


    headings.forEach(
        (heading, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "data-item";


            item.innerHTML = `

                <span class="data-number">
                    ${index + 1}
                </span>

                ${escapeHTML(heading)}

            `;


            box.appendChild(
                item
            );

        }
    );
}


// -----------------------------
// Show links
// -----------------------------

function showLinks(links) {

    const box =
        document.getElementById(
            "linksList"
        );

    box.innerHTML = "";


    if (links.length === 0) {

        box.innerHTML =
            '<div class="data-item">No links found.</div>';

        return;
    }


    links
        .slice(0, 100)
        .forEach(
            (link, index) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "data-item";


                item.innerHTML = `

                    <span class="data-number">
                        ${index + 1}
                    </span>

                    ${escapeHTML(
                        link.text
                    )}

                    <span class="link-url">
                        ${escapeHTML(
                            link.url
                        )}
                    </span>

                `;


                box.appendChild(
                    item
                );

            }
        );
}


// -----------------------------
// Show paragraphs
// -----------------------------

function showParagraphs(
    paragraphs
) {

    const box =
        document.getElementById(
            "paragraphList"
        );

    box.innerHTML = "";


    if (paragraphs.length === 0) {

        box.innerHTML =
            "<p>No page text found.</p>";

        return;
    }


    paragraphs
        .slice(0, 30)
        .forEach(text => {

            const paragraph =
                document.createElement(
                    "p"
                );


            paragraph.textContent =
                text;


            box.appendChild(
                paragraph
            );

        });
}


// -----------------------------
// Show images
// -----------------------------

function showImages(images) {

    const box =
        document.getElementById(
            "imagesList"
        );

    box.innerHTML = "";


    if (images.length === 0) {

        box.innerHTML = `

            <div class="image-placeholder">
                No images found.
            </div>

        `;

        return;
    }


    // Show maximum 12 images

    images
        .slice(0, 12)
        .forEach(imageUrl => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "image-item";


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                imageUrl;


            image.alt =
                "Scraped image";


            image.loading =
                "lazy";


            // If image cannot load

            image.onerror = function() {

                item.innerHTML = `

                    <div class="image-placeholder">
                        Image unavailable
                    </div>

                `;

            };


            item.appendChild(
                image
            );


            box.appendChild(
                item
            );

        });
}


// -----------------------------
// Download TXT
// -----------------------------

function downloadTXT() {

    if (!scrapedData) {

        alert(
            "Scrape a website first."
        );

        return;
    }


    let text = "";


    text +=
        "MINI WEB SCRAPER\n";

    text +=
        "================\n\n";


    // Page information

    text +=
        "PAGE INFORMATION\n";

    text +=
        "-----------------\n";


    text +=
        "Title: " +
        scrapedData.title +
        "\n";


    text +=
        "URL: " +
        scrapedData.url +
        "\n";


    text +=
        "HTTP Status: " +
        scrapedData.status +
        "\n";


    text +=
        "Response Time: " +
        scrapedData.response_time +
        " seconds\n";


    text +=
        "Scraped At: " +
        scrapedData.time +
        "\n\n";


    // Headings

    text +=
        "HEADINGS\n";

    text +=
        "--------\n";


    scrapedData.headings
        .forEach(
            (heading, index) => {

                text +=
                    `${index + 1}. ${heading}\n`;

            }
        );


    text += "\n";


    // Links

    text +=
        "LINKS\n";

    text +=
        "-----\n";


    scrapedData.links
        .forEach(link => {

            text +=
                link.text +
                "\n";

            text +=
                link.url +
                "\n\n";

        });


    // Images

    text +=
        "IMAGES\n";

    text +=
        "------\n";


    scrapedData.images
        .forEach(image => {

            text +=
                image +
                "\n";

        });


    text += "\n";


    // Paragraphs

    text +=
        "PAGE TEXT\n";

    text +=
        "---------\n\n";


    scrapedData.paragraphs
        .forEach(paragraph => {

            text +=
                paragraph +
                "\n\n";

        });


    // Create file

    const blob =
        new Blob(
            [text],
            {
                type:
                    "text/plain"
            }
        );


    const downloadLink =
        document.createElement(
            "a"
        );


    downloadLink.href =
        URL.createObjectURL(
            blob
        );


    downloadLink.download =
        "scraped-results.txt";


    document.body.appendChild(
        downloadLink
    );


    downloadLink.click();


    document.body.removeChild(
        downloadLink
    );


    URL.revokeObjectURL(
        downloadLink.href
    );
}


// -----------------------------
// Download JSON
// -----------------------------

function downloadJSON() {

    if (!scrapedData) {

        alert(
            "Scrape a website first."
        );

        return;
    }


    const json =
        JSON.stringify(
            scrapedData,
            null,
            4
        );


    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    const downloadLink =
        document.createElement(
            "a"
        );


    downloadLink.href =
        URL.createObjectURL(
            blob
        );


    downloadLink.download =
        "scraped-results.json";


    document.body.appendChild(
        downloadLink
    );


    downloadLink.click();


    document.body.removeChild(
        downloadLink
    );


    URL.revokeObjectURL(
        downloadLink.href
    );
}


// -----------------------------
// Prevent HTML injection
// -----------------------------

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;
}