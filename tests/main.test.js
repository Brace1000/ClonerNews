const util = require('util');
global.TextEncoder = util.TextEncoder;
global.TextDecoder = util.TextDecoder;

const { JSDOM } = require('jsdom');

// Set up a DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

// Mock fetch
global.fetch = jest.fn();

// Import functions to test
const {
  throttle,
  fetchItem,
  fetchPosts,
  renderPost,
  renderPollContent,
  loadComments,
  showNotification,
  handleNavClick,
  checkForUpdates,
  fetchSidebarPosts
} = require('../src/clonernews');

describe('throttle', () => {
  jest.useFakeTimers();
  
  const mockFunc = jest.fn();
  const throttledFunc = throttle(mockFunc, 1000);
  
  it('should call the function only once within the limit period', () => {
    throttledFunc();
    throttledFunc();
    expect(mockFunc).toHaveBeenCalledTimes(1);
    
    jest.advanceTimersByTime(1000);
    throttledFunc();
    expect(mockFunc).toHaveBeenCalledTimes(2);
  });
});

describe('fetchItem', () => {
  it('should fetch an item by id', async () => {
    const mockItem = { id: 1, title: 'Test Post' };
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockItem)
    });

    const result = await fetchItem(1);
    expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/item/1.json');
    expect(result).toEqual(mockItem);
  });
});

describe('fetchPosts', () => {
  it('should fetch a list of posts', async () => {
    const mockPostIds = [1, 2];
    const mockPostItems = [
      { id: 1, title: 'Post 1' },
      { id: 2, title: 'Post 2' }
    ];
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPostIds)
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPostItems[0])
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPostItems[1])
    });

    const result = await fetchPosts('topstories', 0, 2);
    expect(fetch).toHaveBeenCalledWith('https://hacker-news.firebaseio.com/v0/topstories.json');
    expect(result).toEqual(mockPostItems);
  });
});

describe('renderPost', () => {
  it('should render post HTML correctly', () => {
    const mockPost = { id: 1, title: 'Test Post', by: 'author', time: 1600000000, score: 10 };
    const postElement = renderPost(mockPost);
    
    expect(postElement.querySelector('h2').textContent).toContain('Test Post');
    expect(postElement.querySelector('.post-meta').textContent).toContain('author');
  });
});

describe('renderPollContent', () => {
  it('should return empty string if no poll parts', () => {
    const result = renderPollContent({ parts: [] });
    expect(result).toBe('');
  });
  
  it('should render poll content if parts are provided', () => {
    const mockPoll = { parts: [1, 2] };
    const result = renderPollContent(mockPoll);
    expect(result).toContain('poll-option-1');
    expect(result).toContain('poll-option-2');
  });
});

describe('loadComments', () => {
  it('should load comments for a post', async () => {
    const mockPost = { id: 1, kids: [2, 3] };
    const mockComments = [
      { id: 2, by: 'user1', text: 'Comment 1', kids: [] },
      { id: 3, by: 'user2', text: 'Comment 2', kids: [4] }
    ];
    const mockNestedComment = { id: 4, by: 'user3', text: 'Nested Comment', kids: [] };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPost)
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockComments[0])
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockComments[1])
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockNestedComment)
    });

    const mockContainer = document.createElement('div');
    await loadComments(1, mockContainer);
    
    expect(mockContainer.innerHTML).toContain('Comment 1');
    expect(mockContainer.innerHTML).toContain('Comment 2');
    expect(mockContainer.innerHTML).toContain('Show Replies (1)');
  });
});

describe('showNotification', () => {
  it('should show and hide notification', () => {
    document.body.innerHTML = '<div id="notification"></div>';
    jest.useFakeTimers();
    
    showNotification('Test Message');
    const notification = document.getElementById('notification');
    expect(notification.style.display).toBe('block');
    expect(notification.textContent).toBe('Test Message');

    jest.advanceTimersByTime(3000);
    expect(notification.style.display).toBe('none');
  });
});

describe('handleNavClick', () => {
  it('should update currentPostType and reset post loading', () => {
    document.body.innerHTML = '<div id="main-content"></div>';
    const event = { preventDefault: jest.fn(), target: { id: 'nav-jobs' } };
    
    handleNavClick(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(currentPostType).toBe('jobstories');
    expect(loadedPosts).toBe(0);
    expect(loadedPostIds.size).toBe(0);
    expect(document.getElementById('main-content').innerHTML).toBe('');
  });
});

describe('checkForUpdates', () => {
  it('should fetch updates and show notification if new items exist', async () => {
    const mockUpdates = { items: [1, 2], profiles: [] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUpdates)
    });

    document.body.innerHTML = '<div id="notification"></div><ul id="live-updates-list"></ul>';
    
    await checkForUpdates();
    
    expect(document.getElementById('notification').style.display).toBe('block');
    expect(document.getElementById('live-updates-list').children.length).toBe(2);
  });
});

describe('fetchSidebarPosts', () => {
  it('should fetch and render sidebar posts', async () => {
    const mockPostIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const mockPosts = mockPostIds.map(id => ({ id, title: `Post ${id}` }));
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPostIds)
    });
    mockPosts.forEach(post => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(post)
      });
    });

    document.body.innerHTML = '<ul id="test-list"></ul>';
    
    await fetchSidebarPosts('topstories', 'test-list');
    
    const listItems = document.querySelectorAll('#test-list li');
    expect(listItems.length).toBe(10);
    expect(listItems[0].textContent).toBe('Post 1');
  });
});