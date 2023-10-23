import Joi, { ObjectSchema } from "joi";

const signupSchema: ObjectSchema = Joi.object().keys({
  username: Joi.string().required().min(3).max(20).messages({
    "string.base": "Username must be of type string",
    "string.min": "Min size of username is 3 character",
    "string.max": "Max size of username is 20 character",
    "string.empty": "Username is a required field",
  }),
  password: Joi.string().required().min(6).max(20).messages({
    "string.base": "Password must be of type string",
    "string.min": "Min size of password from 6 character",
    "string.max": "Max size of password is 20 character",
    "string.empty": "Password is a required field",
  }),
  email: Joi.string().required().email().messages({
    "string.base": "Email must be of type string",
    "string.email": "Email must be valid",
    "string.empty": "Email is a required field",
  }),
  avatarColor: Joi.string().required().messages({
    "any.required": "Avatar color is required",
  }),
  avatarImage: Joi.string().required().messages({
    "any.required": "Avatar image is required",
  }),
});

export { signupSchema };
