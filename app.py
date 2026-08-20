from flask import Flask, render_template, request, jsonify
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from datetime import datetime
import time
app = Flask(__name__)
def get_page(url):
    headers = {
        "User-Agent": "MiniWebScraper/1.0"
    }
    start_time = time.time()
    try:
        response = requests.get(
            url,
            headers=headers,
            timeout=10
        )
        response.raise_for_status()
        soup = BeautifulSoup(
            response.text,
            "html.parser"
        )
        end_time = time.time()
        response_time = round(
            end_time - start_time,
            2
        )
        return (
            soup,
            response.status_code,
            response_time
        )
    except requests.RequestException as error:
        print("Request error:", error)
        return None, None, None
def extract_page(url, soup):
    title = "No title found"
    if soup.title:
        title = soup.title.get_text(
            strip=True
        )
    # Headings
    headings = []
    for tag in soup.find_all(
        ["h1", "h2", "h3"]
    ):
        text = tag.get_text(
            " ",
            strip=True
        )
        if text:
            headings.append(text)
    # Links
    links = []
    for tag in soup.find_all("a"):
        href = tag.get("href")
        if not href:
            continue
        full_url = urljoin(
            url,
            href
        )
        text = tag.get_text(
            " ",
            strip=True
        )
        links.append({
            "text": text or "No text",
            "url": full_url
        })
    # Images
    images = []
    for tag in soup.find_all("img"):
        source = tag.get("src")
        if source:
            images.append(
                urljoin(
                    url,
                    source
                )
            )
    # Paragraphs
    paragraphs = []
    for tag in soup.find_all("p"):
        text = tag.get_text(
            " ",
            strip=True
        )
        if text:
            paragraphs.append(text)
    return {
        "url": url,
        "title": title,
        "headings": headings,
        "links": links,
        "images": images,
        "paragraphs": paragraphs,
        "stats": {
            "headings": len(headings),
            "links": len(links),
            "images": len(images),
            "paragraphs": len(paragraphs)
        }
    }
@app.route("/")
def index():
    return render_template(
        "index.html"
    )
@app.route(
    "/scrape",
    methods=["POST"]
)
def scrape():
    data = request.get_json()
    url = data.get(
        "url",
        ""
    ).strip()
    if not url:
        return jsonify({
            "error": "URL is required."
        }), 400
    if not url.startswith(
        ("http://", "https://")
    ):
        url = "https://" + url
    soup, status, response_time = get_page(
        url
    )
    if soup is None:
        return jsonify({
            "error":
            "Could not access the website."
        }), 400
    result = extract_page(
        url,
        soup
    )
    result["status"] = status
    result["response_time"] = response_time
    result["time"] = datetime.now().strftime(
        "%H:%M:%S"
    )
    return jsonify(result)
if __name__ == "__main__":
    app.run(
        debug=True
    )