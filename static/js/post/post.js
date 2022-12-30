const submit = document.getElementById('submit');
const commentform = document.getElementById('enablecommentform');

if (submit != null) {
  submit.onclick = () => {
    const container = document.getElementById('container');
    let even = false;
    if (container.firstElementChild != null) {
      console.log(container.firstElementChild.className);
      even = container.firstElementChild.className == 'odd' ? true : false;
    }
    container.innerHTML = comment_template(even) + container.innerHTML;
  };
}

if (commentform != null) {
  commentform.onclick = () => {
    document.getElementById('loginform').style.display = 'grid';
    document.getElementById('enablecommentform').style.display = 'none';
  };
}

function comment_template(even) {
  return `<article class="${even ? 'even' : 'odd'}">
            <header>
              <p><b>isai1990</b></p>
            </header>
            <section>
              <p>
                Aenean ligula enim, iaculis at tortor quis, finibus convallis metus. Nulla a nibh
                nec sapien ornare maximus.
              </p>
            </section>
          </article>`;
}
