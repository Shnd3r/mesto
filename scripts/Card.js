const initialCards = [
  {
    name: 'Архыз',
    link: 'https://pictures.s3.yandex.net/frontend-developer/cards-compressed/arkhyz.jpg',
  },
  {
    name: 'Челябинская область',
    link: 'https://pictures.s3.yandex.net/frontend-developer/cards-compressed/chelyabinsk-oblast.jpg'
  },
  {
    name: 'Иваново',
    link: 'https://pictures.s3.yandex.net/frontend-developer/cards-compressed/ivanovo.jpg'
  },
  {
    name: 'Камчатка',
    link: 'https://pictures.s3.yandex.net/frontend-developer/cards-compressed/kamchatka.jpg'
  },
  {
    name: 'Холмогорский район',
    link: 'https://pictures.s3.yandex.net/frontend-developer/cards-compressed/kholmogorsky-rayon.jpg'
  },
  {
    name: 'Байкал',
    link: 'https://pictures.s3.yandex.net/frontend-developer/cards-compressed/baikal.jpg'
  }
];

// Создание класса Card
class Card {
  constructor(data, cardTemplate, handleCardImageClick) {
    this._name = data.name;
    this._link = data.link;
    this._cardTemplate = cardTemplate;
    this._handleCardImageClick = handleCardImageClick;
  }

  // Метод получения шаблона карты
  _getTemplate() {
    const cardElement = document
    .querySelector(this._cardTemplate)
    .content
    .querySelector('.card')
    .cloneNode(true);
    return cardElement;
  }

  // Метод генерации карты
  generateCard() {
    this._card = this._getTemplate();
    this._cardImage = this._card.querySelector('.card__image');
    this._cardTitle = this._card.querySelector('.card__title');
    this._setEventListeners();
    this._cardImage.src = this._link;
    this._cardImage.alt = this._name;
    this._cardTitle.textContent = this._name;
    return this._card;
  }

  // Метод лайка карточки
  _toggleLike(evt) {
    evt.target.classList.toggle('card__button_is-active');
  }

  // Метод удаления карточки
  _deleteCard() {
    this._card.remove();
  }

  // Метод добавления слушателей событий
  _setEventListeners() {
    this._cardImage.addEventListener('click', () => {
      this._handleCardImageClick(this._name, this._link);
    });

    this._card.querySelector('.card__delete-button').addEventListener('click', () => {
      this._deleteCard();
    });

    this._card.querySelector('.card__button').addEventListener('click', (evt) => {
      this._toggleLike(evt);
    });
  }
}

export { initialCards, Card };
