// Импорт главного файла стилей
import './index.css';

// Импорт классов
import { Card } from '../components/Card.js';
import { FormValidator } from '../components/FormValidator.js';
import { PopupWithConfirmation } from '../components/PopupWithConfirmation.js';
import { PopupWithImage } from '../components/PopupWithImage.js';
import { PopupWithForm } from '../components/PopupWithForm.js';
import { Section } from '../components/Section.js';
import { UserInfo } from '../components/UserInfo.js';
import { Api } from '../components/Api.js';

// Импорт переменных
import {
  validationConfig,
  profileButtonEdit,
  profileButtonAdd,
  popupProfileNameInput,
  popupProfileAboutInput,
  popupProfileAvatarButton
} from '../utils/constants.js';

const api = new Api({
  baseUrl: 'https://mesto.nomoreparties.co/v1/cohort-68',
  headers: {
    authorization: '354e8aec-b975-496d-b856-6d5457e3b39e',
    'Content-Type': 'application/json'
  }
});

// Переменная для будущего id пользователя
let userId = null;

// Объект, где будут храниться все формы со страницы
const formValidators = {}

// Функция включения валидации на каждой форме
function enableValidation(config) {
  const formList = Array.from(document.querySelectorAll(config.formSelector))
  formList.forEach((form) => {
    const validator = new FormValidator(config, form)
// получаем данные из атрибута `name` у формы
    const formName = form.getAttribute('name')
// в объект записываем - имя текущей формы: объект с методами валидации
    formValidators[formName] = validator;
    validator.enableValidation();
  });
};

enableValidation(validationConfig);

// Функция создания карточки
function createCard(item, userId) {
  const cardItem = new Card
  // Параметры класса Card
  (item, '#card-template',
   // Функкция обработчик клика по картинке карты
   function handleCardImageClick(name, link) {
    popupPicture.open(name, link);
  },

  // Функция обработчик клика по иконке удаления
  function handleTrashClick() {
    popupConfirmation.open();
    popupConfirmation.setDeleteConfirm(() => {
      api.deleteCard(item._id)
      .then(() => {
        cardItem.deleteCard();
        popupConfirmation.close();
      })
      .catch((err) => {
        console.error(`Ошибка: ${err}`);
      })
    })
  },

  // Функция обработчик установки лайка
  function handleLikeSet() {
    api.setLike(item._id)
    .then((item) => {
      cardItem.addLike();
      cardItem.changeLikeCounter(item);
    })
    .catch((err) => {
      console.error(`Ошибка: ${err}`);
    })
  },

  // Функция обработчик удаления лайка
  function handleLikeDelete() {
    api.removeLike(item._id)
    .then((item) => {
      cardItem.deleteLike();
      cardItem.changeLikeCounter(item);
    })
    .catch((err) => {
      console.error(`Ошибка: ${err}`);
    })
  },
  // Последний параметр id Пользователя
  userId)

  const cardElement = cardItem.generateCard();
  return cardElement
}

// Экземпляр класса Section
const cardSection = new Section({
  renderer: (item, userId) => {
    const cardElement = createCard(item, userId);
    cardSection.addItem(cardElement);
  }
}, '.gallery__list');

// Функция запуска рендер-функции класса Section (для добавления начальных карточек на страницу)
api.getAppInfo()
.then(([ initialCards, userInfo ]) => {
  userId = userInfo._id;
  cardSection.renderItems(initialCards.reverse(), userId);
  profileInfo.setUserInfo(userInfo);
  profileInfo.setUserAvatar(userInfo.avatar);
})
.catch((err) => {
  console.error(`Ошибка: ${err}`);
});

// Экземпляр класса PopupWithImage (для попапа с картинкой)
const popupPicture = new PopupWithImage('.popup-picture');

// // Экземпляры класса PopupWithForm (для попапов с формой)
const popupProfile = new PopupWithForm('.popup-profile', handleProfileFormSubmit);
const popupAddCard = new PopupWithForm('.popup-add', handleAddFormSubmit);
const popupAvatar = new PopupWithForm('.popup-avatar', handleAvatarFormSubmit)

// Экземпляр класса PopupWithConfirmation (для попапа с подтверждением удаления)
const popupConfirmation = new PopupWithConfirmation('.popup-alert');

// Экземлпяр класса UserInfo (для хранения информации о пользователе)
const profileInfo = new UserInfo({
  name: '.profile__title',
  about: '.profile__subtitle',
  avatar: '.profile__avatar-image',
});

// Универсальная функция обработки сабмитов в связке с сервером
function handleSubmit(request, popupInstance, loadingText = "Сохранение...") {
  popupInstance.renderLoading(true, loadingText);
  request()
  .then(() => {
    popupInstance.close()
  })
  .catch((err) => {
    console.error(`Ошибка: ${err}`);
  })
  .finally(() => {
    popupInstance.renderLoading(false);
  });
}

// Функция обработчик самбита popupProfile
function handleProfileFormSubmit({name, about}) {
  function makeRequest() {
    return api.editProfile(name, about)
    .then(() => {
      profileInfo.setUserInfo({name, about});
    })
  }
  handleSubmit(makeRequest, popupProfile);
};

// Функция обработчик самбита popupAddCard
function handleAddFormSubmit({place, link}) {
  function makeRequest() {
    return api.addCard(place, link)
    .then(result => {
      cardSection.renderItems([result], userId)
    })
  }
  handleSubmit(makeRequest, popupAddCard);
};

// Функция обработчик самбита popupAvatar
function handleAvatarFormSubmit({avatar}) {
  const img = document.createElement('img');
  img.src = avatar;
  img.onload = function() {
    function makeRequest() {
      return api.updateAvatar(avatar)
      .then(() => {
        profileInfo.setUserAvatar(avatar);
      })
    }
    handleSubmit(makeRequest, popupAvatar);
  }
  img.onerror = function() {
    alert('Введена некорректная ссылка');
  }
};

// Добавление слушателей событий на все попапы
popupPicture.setEventListeners();
popupProfile.setEventListeners();
popupAddCard.setEventListeners();
popupAvatar.setEventListeners();
popupConfirmation.setEventListeners();

// Слушатель события активации PopupProfile
profileButtonEdit.addEventListener('click', openProfilePopup);

// Слушатель события активации PopupAddCard
profileButtonAdd.addEventListener('click', openAddPopup);

// Слушатель события активации PopupAvatar
popupProfileAvatarButton.addEventListener('click', openAvatarPopup);

// Функция активациии PopupProfile
function openProfilePopup() {
  const {name, about} = profileInfo.getUserInfo();
  popupProfileNameInput.value = name;
  popupProfileAboutInput.value = about;
  popupProfile.open();
  formValidators['edit-profile'].resetValidation();
};

// Функция активациии PopupAddCard
function openAddPopup() {
  popupAddCard.open();
  formValidators['add-card'].resetValidation();
}

// Функция активациии PopupAvatar
function openAvatarPopup() {
  popupAvatar.open()
  formValidators['avatar-update'].resetValidation();
}
