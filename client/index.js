const URL = '/api/products';
// const URL200 = '/api/products?status=200';
// const URL500 = '/api/products?status=500';
// const URLinv = '/api/products?json_invalid=true';
let offline = false;
let repeat = 0;

const appContainer = document.getElementById('app');
const loadBtn = document.querySelector('.load-btn');
const spinner = document.querySelector('.spinner-border');

function renderPage(data) {
  const cardsContainer = document.createElement('div');
  cardsContainer.classList.add(
    'cards-container',
    'd-flex',
    'flex-wrap',
    'justify-content-between',
    'py-4',
  );
  repeat = 0;

  for (const product of data) {
    const productCard = document.createElement('div');
    const image = document.createElement('img');
    const cardBody = document.createElement('div');
    const title = document.createElement('h5');
    const price = document.createElement('p');
    const detailsButton = document.createElement('a');

    productCard.style.width = '18%';
    productCard.classList.add('card', 'my-2');
    image.classList.add('card-img-top');
    cardBody.classList.add('card-body');
    title.classList.add('card-title');
    price.classList.add('card-text');
    detailsButton.classList.add('btn', 'btn-primary');

    productCard.append(image);
    productCard.append(cardBody);
    cardBody.append(title);
    cardBody.append(price);
    cardBody.append(detailsButton);

    image.src = product.image;
    image.alt = product.name;
    title.textContent = product.name;
    price.textContent = product.price;
    detailsButton.textContent = 'Подробнее';
    detailsButton.href = '#';

    cardsContainer.append(productCard);
  }

  return cardsContainer;
}

function removeElement(elem) {
  elem.remove();
}

function showError(text) {
  const alert = document.createElement('div');
  alert.classList.add(
    'alert',
    'alert-danger',
    'position-absolute',
    'bottom-0',
    'right-0',
  );
  alert.role = 'alert';
  alert.textContent = text;

  setTimeout(removeElement, 3000, alert);
  return alert;
}

async function getProducts() {
  const error = {};
  const response = await fetch(URL)
    .then((res) => {
      if (res.status === 404) {
        error.type = 404;
        error.text = 'Список пуст';
      }
      if (res.status === 500) {
        error.type = 500;
        error.text = 'Произошла ошибка, попробуйте обновить страницу позже';
      }
      return res.json();
    })
    .then((data) => data)
    .catch(() => {
      error.type = 'invalid';
      error.text = 'Произошла ошибка, попробуйте обновить страницу позже';
    });

  if (error.type) {
    let err;
    switch (error.type) {
      case 'invalid':
        repeat = 0;
        err = new Error('invalid json');
        break;
      case 404:
        repeat = 0;
        err = new Error('empty list');
        break;
      case 500:
        repeat--;
        err = new Error('server error');
        break;
      default:
        repeat = 0;
        err = new Error();
    }
    err.errorMessage = error.text;
    throw err;
  }

  if (repeat > 0) getProducts();

  return response;
}

async function makeResponse() {
  try {
    spinner.style.display = '';
    const oldCardsContainer = document.querySelector('.cards-container');
    if (oldCardsContainer) oldCardsContainer.remove();

    const data = await getProducts();
    const cards = renderPage(data.products);
    appContainer.append(cards);
  } catch (err) {
    if (repeat > 0) {
      makeResponse();
    } else {
      const error = showError();
      appContainer.append(error);
      if (err.errorMessage) {
        error.textContent = err.errorMessage;
      }
      if (offline) {
        error.textContent = 'Произошла ошибка, проверьте подключение к интернету';
      }
      throw err;
    }
  } finally {
    if (repeat === 0) {
      spinner.style.display = 'none';
    }
  }
}

loadBtn.addEventListener('click', (e) => {
  e.preventDefault();
  repeat = 3;
  makeResponse();
});

window.addEventListener('offline', () => {
  offline = true;
});

window.addEventListener('online', () => {
  offline = false;
});
