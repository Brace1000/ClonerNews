
---

# ClonerNews

**ClonerNews** is a lightweight web-based application that clones the functionality of a news aggregator similar to Hacker News. It fetches, displays, and updates content from the Hacker News API, providing a smooth and interactive user experience. This project is built using **JavaScript**, **HTML**, and **CSS**.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Features](#features)
3. [Usage](#usage)
4. [Fetching Data](#fetching-data)
5. [Running Tests](#running-tests)
6. [Collaborators](#collaborators)

---

## Project Structure

```
clonernews/
│
├── LICENSE
├── README.md
├── static/
│   └── styles.css         # Contains the CSS styles for the project
├── templates/
│   └── index.html         # Main HTML file for rendering the application
├── src/
│   └── clonernews.js      # Contains the JavaScript logic for fetching and displaying data
├── tests/
│   └── main.test.js       # Test file for unit testing the application
```

## Features

- Fetches the latest top stories from Hacker News API.
- Displays individual news items with titles, authors, and scores.
- Loads and renders comments for each news item.
- Supports polling for updates to display real-time notifications.
- Provides smooth navigation for different categories like top stories, job listings, etc.

## Usage

### Getting Started

To run ClonerNews on your local machine, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Brace1000/ClonerNews.git
   cd clonernews
   ```

2. **Open `index.html`**:
   You can open `index.html` directly in your browser by simply navigating to:
   ```
   clonernews/templates/index.html
   ```

3. **Access the application**:
   Once opened, the application will fetch and display news stories from the Hacker News API automatically.

### Dependencies

Since this project relies on external data fetching and rendering, it uses the following technologies:

- **JavaScript** (for data fetching and rendering)
- **HTML** (for the basic structure of the application)
- **CSS** (for styling the application)

## Fetching Data

ClonerNews uses the [Hacker News API](https://github.com/HackerNews/API) to fetch and display stories. Below is an overview of how data is fetched and used in the application.

### Fetching Top Stories

The `fetchPosts` function fetches the top stories using the Hacker News API. It makes an HTTP request to fetch the list of story IDs, and for each ID, it retrieves detailed information about the post.

```js
async function fetchPosts(category, start, limit) {
  const url = `https://hacker-news.firebaseio.com/v0/${category}.json`;
  const response = await fetch(url);
  const postIds = await response.json();

  const posts = await Promise.all(
    postIds.slice(start, start + limit).map(async (id) => {
      const postResponse = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      return postResponse.json();
    })
  );
  return posts;
}
```

### Rendering Posts

Posts are rendered dynamically into the HTML structure using the `renderPost` function. The post includes the title, author, score, and a link to the original story.

```js
function renderPost(post) {
  const postElement = document.createElement('div');
  postElement.innerHTML = `
    <h2>${post.title}</h2>
    <div class="post-meta">By ${post.by} | ${post.score} points</div>
  `;
  return postElement;
}
```

### Loading Comments

The application also supports loading comments for each post. The `loadComments` function fetches and renders nested comments for a given post ID.

```js
async function loadComments(postId, container) {
  const response = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${postId}.json`
  );
  const post = await response.json();

  if (post.kids) {
    const comments = await Promise.all(
      post.kids.map(async (commentId) => {
        const commentResponse = await fetch(
          `https://hacker-news.firebaseio.com/v0/item/${commentId}.json`
        );
        return commentResponse.json();
      })
    );

    comments.forEach((comment) => {
      const commentElement = document.createElement('div');
      commentElement.innerHTML = `<p>${comment.by}: ${comment.text}</p>`;
      container.appendChild(commentElement);
    });
  }
}
```

## Running Tests

Tests for ClonerNews are written in **Jest** and simulate DOM interactions, API fetches, and user actions.

### Test Setup

In the `tests/main.test.js` file, we set up a testing environment using `JSDOM` to simulate a browser environment. Jest is used to mock API fetches and simulate functions like `throttle`, `fetchPosts`, and `renderPost`.

Example of a test for the `fetchItem` function:

```js
describe('fetchItem', () => {
  it('should fetch an item by id', async () => {
    const mockItem = { id: 1, title: 'Test Post' };
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockItem),
    });

    const result = await fetchItem(1);
    expect(fetch).toHaveBeenCalledWith(
      'https://hacker-news.firebaseio.com/v0/item/1.json'
    );
    expect(result).toEqual(mockItem);
  });
});
```

### Run Tests

To run tests, make sure you have **Node.js** and **Jest** installed. Then, run:

```bash
npm install
npm test
```

This will execute the tests and display the results in the console.

## Collaborators

- **OIKO BRIAN** - Software Engineer/Apprentice Zone 01 Kisumu


---
