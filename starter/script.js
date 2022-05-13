'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2022-11-18T21:31:17.178Z',
    '2022-12-23T07:42:02.383Z',
    '2022-01-28T09:15:04.904Z',
    '2022-04-01T10:17:24.185Z',
    '2022-05-08T14:11:59.604Z',
    '2022-05-08T17:01:17.194Z',
    '2022-05-12T23:36:17.929Z',
    '2022-05-13T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2022-11-01T13:15:33.035Z',
    '2022-11-30T09:48:16.867Z',
    '2022-12-25T06:04:23.907Z',
    '2022-01-25T14:18:46.235Z',
    '2022-02-05T16:33:06.386Z',
    '2022-05-09T14:43:26.374Z',
    '2022-05-11T18:49:59.371Z',
    '2022-05-13T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return 'TODAY';
  if (daysPassed === 1) return 'YESTERDAY';
  if (daysPassed <= 7) return `${daysPassed} DAYS AGO`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formattedCur = function (locale, currency, value) {
  const option = {
    style: 'currency',
    currency: currency,
  };
  return Intl.NumberFormat(locale, option).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = ' ';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    const move = formattedCur(acc.locale, acc.currency, mov);
    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">
            ${i + 1} ${type}
          </div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${move}</div>
  `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};
const calcDisplayBalance = function (acc) {
  const balance = acc.movements.reduce((acc, curr) => acc + curr, 0);
  acc.balance = balance;
  labelBalance.textContent = `${formattedCur(
    acc.locale,
    acc.currency,
    balance
  )}`;
};
const calcDispalaySummary = function (account) {
  const incomes = account.movements
    .filter(inc => inc > 0)
    .reduce((acc, inc) => acc + inc, 0);

  const withdrawal = account.movements
    .filter(inc => inc < 0)
    .reduce((acc, inc) => acc + inc, 0);

  const interest = account.movements
    .filter(int => int > 0)
    .map(int => (int * account.interestRate) / 100)
    .filter(int => int > 1.0)
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = `${formattedCur(
    account.locale,
    account.currency,
    interest
  )}`;
  labelSumOut.textContent = `${formattedCur(
    account.locale,
    account.currency,
    Math.abs(withdrawal)
  )}`;
  labelSumIn.textContent = `${formattedCur(
    account.locale,
    account.currency,
    incomes
  )}`;
};
const createUsername = function (account) {
  account.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

//Event handler
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  // prevent form from submitting
  e.preventDefault();
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  if (currentAccount?.pin === +inputLoginPin.value) {
    // display UI and welcome message

    containerApp.style.opacity = 100;
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }!`;
    // Clear the input  fields
    inputLoginPin.value = inputLoginUsername.value = '';
    inputClosePin.blur();

    if (timer) clearInterval(timer);
    timer = startLogoutTimer();

    // Display curent date
    const option = {
      hour: 'numeric',
      minute: 'numeric',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };
    const now = new Date();
    const displayDate = new Intl.DateTimeFormat(
      currentAccount.locale,
      option
    ).format(now);
    labelDate.textContent = displayDate;

    // Display funds account
    updateUI(currentAccount);
  }
});

createUsername(accounts);

const updateUI = function (acc) {
  displayMovements(acc);

  // Display balance

  calcDisplayBalance(acc);

  // Display summary

  calcDispalaySummary(acc);
};
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    receiverAcc.movements.push(amount);
    currentAccount.movements.push(-amount);

    // add movement dates
    receiverAcc.movementsDates.push(new Date().toISOString());
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUI(currentAccount);

    clearInterval(timer);
    timer = startLogoutTimer();
  }
  inputTransferAmount.value = inputTransferTo.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    // Delete account
    accounts.splice(index, 1);

    // clear UI
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started';
    inputCloseUsername.value = inputClosePin.value = '';
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  const grantLoan = currentAccount.movements.some(mov => mov > 0.1 * amount);

  if (amount > 0 && grantLoan) {
    currentAccount.movements.push(amount);
  }

  // adding movement dates

  currentAccount.movementsDates.push(new Date().toISOString());

  clearInterval(timer);
  timer = startLogoutTimer();
  updateUI(currentAccount);
  inputLoanAmount.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const second = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${second}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';

      containerApp.style.opacity = 0;
    }
    time -= 1;
  };

  let time = 30;
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
// const calcAverageHumanAge = ages =>
//   ages
//     .map(dogAge => (dogAge <= 2 ? 2 * dogAge : 16 + dogAge * 4))
//     .filter(ages => ages >= 18)
//     .reduce((acc, dogs, i, arr) => acc + dogs / arr.length, 0);
// const humanAges = ages.map(dogAge =>
//   dogAge <= 2 ? 2 * dogAge : 16 + dogAge * 4
// );
// const adult = humanAges.filter(ages => ages >= 18);
// const avg = adult.reduce((acc, dogs) => acc + dogs, 0) / adult.length;
// return avg;

// const someMovements = [
//   account1.movements,
//   account2.movements,
//   account3.movements,
//   account4.movements,
// ];
// const all = someMovements.flat();
// const sumMov = all.reduce((acc, move) => acc + move, 0);
// console.log(sumMov);
/*
Julia and Kate are still studying dogs, and this time they are studying if dogs are
eating too much or too little.
Eating too much means the dog's current food portion is larger than the
recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10%
above and 10% below the recommended portion (see hint).
Your tasks:
1. Loop over the 'dogs' array containing dog objects, and for each dog, calculate
the recommended food portion and add it to the object as a new property. Do
not create a new array, simply loop over the array. Forumla:
recommendedFood = weight ** 0.75 * 28. (The result is in grams of
food, and the weight needs to be in kg)
2. Find Sarah's dog and log to the console whether it's eating too much or too
little. Hint: Some dogs have multiple owners, so you first need to find Sarah in
the owners array, and so this one is a bit tricky (on purpose) 🤓
3. Create an array containing all owners of dogs who eat too much
('ownersEatTooMuch') and an array with all owners of dogs who eat too little
('ownersEatTooLittle').
4. Log a string to the console for each array created in 3., like this: "Matilda and
Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat
too little!"
5. Log to the console whether there is any dog eating exactly the amount of food
that is recommended (just true or false)
6. Log to the console whether there is any dog eating an okay amount of food
(just true or false)
7. Create an array containing the dogs that are eating an okay amount of food (try
to reuse the condition used in 6.)
8. Create a shallow copy of the 'dogs' array and sort it by recommended food
portion in an ascending order (keep in mind that the portions are inside the
array's objects 😉)
// */
// const dogs = [
//   { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
//   { weight: 8, curFood: 200, owners: ['Matilda'] },
//   { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
//   { weight: 32, curFood: 340, owners: ['Michael'] },
// ];

// // 1.   Weight and reccommended food calculation
// dogs.forEach(
//   dog => (dog.recommendedFood = Math.trunc(dog.weight ** 0.75 * 28))
// );

// // 2. Sarah dogs
// const sarahDog = dogs.find(dog => dog.owners.includes('Sarah'));
// const det =
//   sarahDog.curFood > sarahDog.recommendedFood
//     ? 'sarah dog is eating too much'
//     : 'sarah dog is eating too much';
// console.log(sarahDog);
// console.log(det);
// // 3. Dog owners eat too much or Dog owners eat too little
// const ownersEatTooMuch = dogs.filter(dog => dog.curFood > dog.recommendedFood);
// const ownersEatTooLittle = dogs.filter(
//   dog => dog.curFood < dog.recommendedFood
// );

// console.log(ownersEatTooLittle);
// console.log(ownersEatTooMuch);

// // 4. result owners
// const strLittle = ownersEatTooLittle.reduce(
//   (acc, cur) => acc + ` and ${cur.owners}`,
//   0
// );
// const strMuch = ownersEatTooMuch.reduce(
//   (acc, cur) => acc + ` and ${cur.owners}`,
//   0
// );
// console.log(`${strLittle.replace(',', ' and ').slice(6)} dogs eats too Little`);
// console.log(`${strMuch.replace(',', ' and ').slice(6)} dogs eats too Much`);

// // 5. exact amount of food
// const exactFood = dogs.some(dog => dog.curFood === dog.recommendedFood);
// console.log(exactFood);
// // 6. An okay amount
// const okAmountFood = dogs.some(
//   dog =>
//     dog.curFood >= dog.recommendedFood * 0.9 &&
//     dog.curFood <= dog.recommendedFood * 1.1
// );

// console.log(okAmountFood);

// // 7. array ok amount food
// const okFoodArray = dogs.filter(function (dog) {
//   if (
//     dog.curFood >= dog.recommendedFood * 0.9 &&
//     dog.curFood <= dog.recommendedFood * 1.1
//   ) {
//     return dog;
//   }
// });
// console.log(okFoodArray);

// // 8. sorting array by recommended food portion
// console.log(dogs.slice().sort((a, b) => a.recommendedFood - b.recommendedFood));
