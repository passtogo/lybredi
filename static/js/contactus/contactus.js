const url = `${location.host}/:${location.port}`;

document.getElementById('form').onsubmit = (event) => {
  event.preventDefault();

  const form = new FormData(event.target);

  fetch(`${url}contactus`, {
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
    });
};
