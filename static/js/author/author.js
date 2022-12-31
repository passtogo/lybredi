//const url = 'https://192.168.1.2:3000';
const url = `${location.host}/:${location.port}`;

// document.getElementById('post').onclick = () => {
//   document.getElementById('postform').onsubmit = (event) => {
//     event.preventDefault();
//   };
//   const selection = document.getElementById('list');
//   const data = {
//     username: document.getElementById('username').value,
//     user_id: document.getElementById('user_id').value,
//     category: selection.options[selection.selectedIndex].value,
//     title: document.getElementById('title').value,
//     body: document.getElementById('body').value,
//   };
//   author.emit('post', data);
// };

///////////////////////////////////////////////////////////////////////////////////////////////
// Element-on-click funcions
///////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById('postform').onsubmit = (event) => {
  event.preventDefault();

  const list = document.getElementById('selection');
  const listItem = document.getElementById('list');
  const form = new FormData(event.target);

  fetch(`${url}/publisher/author`, {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(form.entries())),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((post) => {
      if (
        listItem.options[listItem.selectedIndex].value == list.options[list.selectedIndex].value ||
        list.options[list.selectedIndex].value == 'all'
      ) {
        const container = document.getElementById('postcontainer');

        post.date = timeFormat(new Date());

        container.innerHTML = posttemplate(post) + container.innerHTML;
        categorylist(post.category);
      }
    });
};

///////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById('list').onchange = (list) => {
  if (list.currentTarget.options[list.currentTarget.selectedIndex].value == 'new') {
    document.getElementById('list').style.display = 'none';
    document.getElementById('newcat').style.display = 'block';
    document.getElementById('excat').style.display = 'block';

    document.getElementById('excat').onclick = () => {
      document.getElementById('list').style.display = 'block';
      document.getElementById('newcat').style.display = 'none';
      document.getElementById('excat').style.display = 'none';
      document.getElementById('list').value = '';
    };
  }
};

///////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById('selection').onchange = (option) => {
  console.log(option.currentTarget.options[option.currentTarget.selectedIndex].value);

  fetch(`${url}/publisher/author/posts`, {
    method: 'POST',
    body: JSON.stringify({
      category: option.currentTarget.options[option.currentTarget.selectedIndex].value,
      id: document.getElementById('user_id').value,
    }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((posts) => {
      console.log(posts);
      const container = document.getElementById('postcontainer');
      container.innerHTML = '';
      for (let post of posts) {
        container.innerHTML += posttemplate(post);
      }
    });
};

///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
document.querySelectorAll('.edit').forEach((edit) => {
  edit.onclick = () => {
    /////// Disable content editable to all.
    // document.querySelectorAll('.edit').forEach((open) => {
    //   open.parentElement.children[0].style.backgroundColor = 'aliceblue';
    //   open.parentElement.children[edit.parentElement.children.length - 1].style.backgroundColor =
    //     'aliceblue';
    //   open.parentElement.children[0].setAttribute('contenteditable', false);
    //   open.parentElement.children[open.parentElement.children.length - 1].setAttribute(
    //     'contenteditable',
    //     false
    //   );
    // });
    /////// Enable content editable to current selected post
    // edit.parentElement.children[0].style.backgroundColor = 'green';
    // edit.parentElement.children[edit.parentElement.children.length - 1].style.backgroundColor =
    //   'green';
    // edit.parentElement.children[0].setAttribute('contenteditable', true);
    // edit.parentElement.children[edit.parentElement.children.length - 1].setAttribute(
    //   'contenteditable',
    //   true
    // );
    //edit.parentElement.innerHTML = formtemplate(title, paragraph);

    const title = edit.parentElement.children[0];
    const paragraph = edit.parentElement.children[edit.parentElement.children.length - 1];

    const titleText = edit.parentElement.children[0].innerHTML;
    const paragraphText =
      edit.parentElement.children[edit.parentElement.children.length - 1].innerHTML;

    title.setAttribute('contenteditable', true);
    title.className = 'editable';
    paragraph.setAttribute('contenteditable', true);
    paragraph.className = 'editable';

    let cancel = document.createElement('button');
    let save = document.createElement('button');
    cancel.innerHTML = 'Cancel edit';
    save.innerHTML = 'Save';
    edit.parentElement.appendChild(cancel);
    edit.parentElement.appendChild(save);

    cancel.onclick = () => {
      edit.parentElement.removeChild(save);
      edit.parentElement.removeChild(cancel);
      title.setAttribute('contenteditable', false);
      title.className = '';
      paragraph.setAttribute('contenteditable', false);
      paragraph.className = '';
      title.innerHTML = titleText;
      paragraph.innerHTML = paragraphText;
    };

    save.onclick = () => {
      edit.parentElement.removeChild(save);
      edit.parentElement.removeChild(cancel);
      title.setAttribute('contenteditable', false);
      title.className = '';
      paragraph.setAttribute('contenteditable', false);
      paragraph.className = '';

      fetch(`${url}/publisher/author/changes`, {
        method: 'POST',
        body: JSON.stringify({
          postid: edit.parentElement.children[1].value,
          title: title.innerHTML,
          paragraph: paragraph.innerHTML,
        }),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
        .then((response) => response.json())
        .then((posts) => {
          console.log(posts);
          const container = document.getElementById('postcontainer');
          container.innerHTML = '';
          for (let post of posts) {
            container.innerHTML += posttemplate(post);
          }
        });
    };
  };
});
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////
// Helper funcions
///////////////////////////////////////////////////////////////////////////////////////////////
function posttemplate(data) {
  return `<article><h3>${data.title}</h3><a href="#">Edit post</a><small>Author: ${data.username}</small><br /><small>${data.date}</small><p>${data.body}</p></article>`;
}

///////////////////////////////////////////////////////////////////////////////////////////////
function formtemplate(title, paragraph) {
  return ``;
}

///////////////////////////////////////////////////////////////////////////////////////////////
function categorylist(category) {
  let itemfound = false;
  const list = document.getElementById('selection');
  for (let i = 0; i < list.length; i++) {
    if (list[i].innerHTML.toLowerCase() == category) {
      itemfound = true;
      break;
    }
  }

  if (!itemfound) {
    // add hyphen to value if it is two words with a space
    console.log(category);
    //<option value="academic-disciplines">Academic disciplines</option>;
    list.innerHTML += `<option value=""${category}>${uppercase(category)}</option>`;
  }

  sortList();
}

///////////////////////////////////////////////////////////////////////////////////////////////
function uppercase(string) {
  return string[0].toUpperCase() + string.slice(1);
}

///////////////////////////////////////////////////////////////////////////////////////////////
function sortList() {
  var list, item, switching, options, shouldSwitch;
  list = document.getElementById('selection');
  options = list.getElementsByTagName('option');
  switching = true;
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    options = list.getElementsByTagName('option');
    // Loop through all list items:
    for (item = 0; item < options.length - 1; item++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Check if the next item should
      switch place with the current item: */
      if (options[item].innerHTML.toLowerCase() > options[item + 1].innerHTML.toLowerCase()) {
        /* If next item is alphabetically lower than current item,
        mark as a switch and break the loop: */
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark the switch as done: */
      options[item].parentNode.insertBefore(options[item + 1], options[item]);
      switching = true;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////
function preventSubmition(event) {
  event.preventDefault();
  return false;
}

///////////////////////////////////////////////////////////////////////////////////////////////
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
