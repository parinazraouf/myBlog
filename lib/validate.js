const Joi = require('joi');
const PhoneNumber = require('awesome-phonenumber');

const { user: userLimit } = require('~/config/limit');

const USERNAME_PATTERN = /^[a-zA-Z0-9.]{4,30}$/;
const USERNAME_CHAR_PATTERN = /\.{2,}|^\.|\.$/;

exports.Joi = Joi.extend(joi => ({
  type: 'name',
  base: joi.string(),
  messages: {
    'name.username': '{{#label}} is not a valid username!'
  },
  validate (value, helpers) {
    if (
      USERNAME_PATTERN.test(value) &&
        !USERNAME_CHAR_PATTERN.test(value) &&
        (value.length >= userLimit.usernameLengthRange[0] && value.length <= userLimit.usernameLengthRange[1])
    ) {
      return { value };
    }

    return { value, errors: helpers.error('name.username') };
  },
  rules: {
    username: {
      method () {
        return this.$_setFlag('username', true);
      }
    }
  }
})).extend(joi => ({
  type: 'phoneNumber',
  base: joi.string(),
  messages: {
    'phoneNumber.irMobile': '{{#label}} is not a valid mobile number!'
  },
  validate (value, helpers) {
    const pn = new PhoneNumber(value, 'IR');

    if (helpers.schema.$_getFlag('irMobile') && !(pn.isValid() && pn.isMobile())) {
      return { value, errors: helpers.error('phoneNumber.irMobile') };
    }

    return { value: pn.getNumber('e164') };
  },
  rules: {
    irMobile: {
      method () {
        return this.$_setFlag('irMobile', true);
      }
    }
  }
}));
