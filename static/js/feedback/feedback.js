const url = `${location.host}/:${location.port}`;

document.querySelectorAll('input[name="yesorno"]').forEach((button) => {
  button.onclick = () => {
    if (button.value == 'yes') {
      document.querySelector('.rating-container').style.display = 'block';
      document.querySelector('.textarea-container').style.display = 'none';
    } else if (button.value == 'no') {
      document.querySelector('.rating-container').style.display = 'none';
      document.querySelector('.textarea-container').style.display = 'block';
    }
  };
});

document.getElementById('form').onsubmit = (event) => {
  event.preventDefault();
  const form = new FormData(event.target);

  fetch(`${url}feedback`, {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(form.entries())),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((response) => response.json())
    .then((message) => {
      alert(message);
      event.target.reset();
      document.querySelector('.rating-container').style.display = 'none';
      document.querySelector('.textarea-container').style.display = 'none';
    });
};
