const searchValues = {
  gfa: {
      origin_text: "Ciudad de México, Norte",
      origin: "Ciudad de México, México Norte",
      destination_text: "Guadalajara, Central Nueva",
      destination: "Guadalajara",
      exchange: {
          origin: "Norte, Ciudad de México",
          destination: "Central Nueva, Guadalajara",
      },
  },
  etn: {
      origin_text: "Ciudad De México, Mexico Sur",
      origin: "Mexico Sur",
      destination_text: "Santiago De Querétaro, Queretaro",
      destination: "Queretaro",
  },
  costaline: {
      origin_text: "Mexico Sur",
      origin: "Mexico Sur",
      destination_text: "Chilpancingo",
      destination: "Chilpancingo",
  },
  gho: {
      origin_text: "Morelia",
      origin: "Morelia",
      destination_text: "Poniente",
      destination: "Poniente",
  },
  default: {
      origin_text: "Ciudad de México",
      origin: "Ciudad",
      destination_text: "Guadalajara",
      destination: "Guadala",
  },
};

const creditCardValues = {
  number: "4111111111111111",
  name: "John Doe",
  expiration: "03/30",
  cvv: "737",
};

const paypalCredentials = {
  user: "webmaster-buyer@reserbus.com",
  pass: "pormexicoenbus",
};

const passengers = [
  {
      name: "John",
      lastName: "Doe",
      phone: "4777100060",
      email: "test@email.com",
      seatType: "regular",
  },
  {
      name: "Michael",
      lastName: "Scott",
      phone: "4777100060",
      email: "test@email.com",
      seatType: "regular",
  },
  {
      name: "James",
      lastName: "Smith",
      phone: "1234567890",
      email: "james.smith@email.com",
      seatType: "regular",
  },
  {
      name: "Anna",
      lastName: "Taylor",
      phone: "0987654321",
      email: "anna.taylor@email.com",
      seatType: "regular",
  },
  {
      name: "Sophia",
      lastName: "Johnson",
      phone: "1122334455",
      email: "sophia.johnson@email.com",
      seatType: "regular",
  },
];

const purchaserValues = {
  name: "John",
  lastName: "Doe",
  countryCode: "MX",
  phone: "4777100060",
  email: "test@email.com",
};

module.exports = {
  searchValues,
  creditCardValues,
  paypalCredentials,
  passengers,
  purchaserValues,
};
