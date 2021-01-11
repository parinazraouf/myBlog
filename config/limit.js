const app = exports.app = {
  paginationLimit: 10,
  pageSize: 10,
  shortTextMaxLength: 80,
  longTextMaxLength: 4096,
  passwordLengthRange: [8, 255]
};

exports.user = {
  displayNameLengthRange: [2, app.shortTextMaxLength],
  usernameLengthRange: [4, app.shortTextMaxLength]
};

exports.post = {
  contentLengthRange: [1, 280],
  categoryLengthRange: [1, 20]
};

exports.comment = {
  contentLengthRange: [1, 280]
};
