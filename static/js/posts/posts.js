//const url = 'https://192.168.1.2:3000';
const url = 'https://127.0.0.1:3000';
var post = io(url);

post.on('post', (post) => {
  const container = document.getElementById('posts');
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, '0');
  var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = today.getFullYear();
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  today = months[parseInt(mm) - 1] + ' ' + dd + ', ' + yyyy;
  post.date = today;

  container.innerHTML = posttemplate(post) + container.innerHTML;

  categorylist(post.category);
});

function posttemplate(post) {
  return `<article>
    <h3>${post.title}</h3>
    <small>Author: ${post.username}</small><br />
    <small>${post.date}</small>
    <p>${post.body}</p>
    <a href="post/6383d439-6301-4792-bc53-52c64e1fe4ae"><small>What to read more about the topic?</small></a>
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
    document.getElementById('list').innerHTML += `<a href="/post">${uppercase(category)}</a>`;
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
