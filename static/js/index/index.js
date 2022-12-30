//const url = 'https://192.168.1.2:3000/';
const url = `https://0.0.0.0:${location.port}`;
var index = io(url);

///////////////////////////////////////////////////////////////////////////////////////////////
// socket .on funcions
///////////////////////////////////////////////////////////////////////////////////////////////

index.on('post', (post) => {
  console.log(post);
  if (
    document.querySelector('.active').innerHTML.toLowerCase() == post.category ||
    document.querySelector('.active').innerHTML.toLowerCase() == 'all'
  ) {
    const container = document.getElementById('postcontainer');
    post.date = timeFormat(new Date());
    container.innerHTML = posttemplate(post) + container.innerHTML;

    categorylist(post.category);
  }

  sidebarNavigationEvents();
});

///////////////////////////////////////////////////////////////////////////////////////////////
// Element-on-click funcions
///////////////////////////////////////////////////////////////////////////////////////////////

sidebarNavigationEvents();

// delete this when you no longer need it
// document.getElementById('time').onclick = () => {
//   console.log(new Date());
//   console.log(Date.now());
//   console.log(timeFormat(new Date('2022-04-04 21:27:39.479368')));
// };

///////////////////////////////////////////////////////////////////////////////////////////////
// Helper funcions
///////////////////////////////////////////////////////////////////////////////////////////////

function posttemplate(post) {
  return `<article>
  <a href="/posts/${post.post_id}">
    <h3>${post.title}</h3>
    <small>Author: ${post.username}</small><br />
    <small>${post.date}</small>
    <p>${post.body.substring(0, 100)}...</p>
  </a>
</article>
 `;
}

function categorylist(category) {
  let itemfound = false;
  const list = document.getElementById('list');
  const links = list.getElementsByTagName('a');
  for (let i = 0; i < links.length; i++) {
    if (links[i].innerHTML.toLowerCase() == category) {
      itemfound = true;
      break;
    }
  }

  if (!itemfound) {
    document.getElementById('list').innerHTML += `<span class="category">${uppercase(
      category
    )}</span>`;
  }

  sortList();
}

function uppercase(string) {
  return string[0].toUpperCase() + string.slice(1);
}

function sortList() {
  var list, item, switching, links, shouldSwitch;
  list = document.getElementById('list');
  switching = true;
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    links = list.getElementsByTagName('a');
    // Loop through all list items:
    for (item = 0; item < links.length - 1; item++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Check if the next item should
      switch place with the current item: */
      if (links[item].innerHTML.toLowerCase() > links[item + 1].innerHTML.toLowerCase()) {
        /* If next item is alphabetically lower than current item,
        mark as a switch and break the loop: */
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark the switch as done: */
      links[item].parentNode.insertBefore(links[item + 1], links[item]);
      switching = true;
    }
  }
}

function postContainerHandler(posts) {
  const destination = document.getElementById('postcontainer');
  destination.innerHTML = '';
  for (let post of posts) {
    destination.innerHTML += `<article>
  <a href="/posts/${post.uuid}">
    <h3>${post.title}</h3>
    <small>Author: ${post.username}</small><br />
    <small>${post.date}</small>
    <p>${post.body.substring(0, 100)}...</p>
  </a>
</article>
 `;
  }
}

function sidebarNavigationEvents() {
  document.querySelectorAll('.category').forEach((category) => {
    category.onclick = () => {
      document.querySelector('.active').className = 'category';
      category.className = 'category active';

      fetch(url, {
        method: 'POST',
        body: JSON.stringify({ category: category.innerHTML.toLowerCase() }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
        .then((response) => response.json())
        .then((json) => {
          postContainerHandler(json);
        });
    };
  });
}

function timeFormat(date) {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + ' years ago';
  }

  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months ago';
  }

  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days ago';
  }

  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours ago';
  }

  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes ago';
  }

  return 'just now';
}
