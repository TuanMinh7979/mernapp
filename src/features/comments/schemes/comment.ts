import Joi, { ObjectSchema } from "joi";

const addCommentSchema: ObjectSchema = Joi.object().keys({
  userTo: Joi.string().required().messages({
    "any.required": "user To is required property",
  }),
  postId: Joi.string().required().messages({
    "any.required": "postId is required property",
  }),
  comment: Joi.string().required().messages({
    "any.required": "comment is required property",
  }),
  profilePicture: Joi.string().optional().allow(null, ""),

//   commentCnt is map on Post.commentsCount
  commentsCount: Joi.number().optional().allow(null, ""),
});
