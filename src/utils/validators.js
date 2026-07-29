const Joi = require('joi');

const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password:   Joi.string().min(6).required(),
  role:       Joi.string().valid('buyer', 'seller', 'admin').required(),
});

const signupBuyerSchema = Joi.object({
  fullName:        Joi.string().min(2).required(),
  phone:           Joi.string().pattern(/^\d{10}$/).required(),
  email:           Joi.string().email().required(),
  password:        Joi.string().min(6).required(),
  businessDetails: Joi.string().optional(),
});

const signupSupplierSchema = Joi.object({
  ownerName:    Joi.string().min(2).required(),
  companyName:  Joi.string().required(),
  phone:        Joi.string().pattern(/^\d{10}$/).required(),
  email:        Joi.string().email().required(),
  password:     Joi.string().min(6).required(),
  gstNumber:    Joi.string().length(15).required(),
  businessType: Joi.string().valid('Manufacturer', 'Wholesaler', 'Exporter', 'Trader').required(),
  address:      Joi.string().required(),
  kycDocUrl:    Joi.string().uri().required(),
});

const createProductSchema = Joi.object({
  name:             Joi.string().required(),
  description:      Joi.string().optional(),
  images:           Joi.array().items(Joi.string().uri()).default([]),
  categoryId:       Joi.string().uuid().required(),
  price:            Joi.number().min(0).required(),
  priceType:        Joi.string().valid('fixed', 'negotiable', 'rfq').required(),
  minOrderQty:      Joi.number().integer().min(1).default(1),
  unit:             Joi.string().default('Piece'),
  specifications:   Joi.object().default({}),
  tags:             Joi.array().items(Joi.string()).default([]),
  location:         Joi.string().optional(),
  bulkPricingTiers: Joi.array().items(
    Joi.object({
      minQty: Joi.number().required(),
      maxQty: Joi.number().optional(),
      price:  Joi.number().required(),
    })
  ).default([]),
});

const inquirySchema = Joi.object({
  productId: Joi.string().uuid().required(),
  quantity:  Joi.number().integer().min(1).required(),
  message:   Joi.string().optional(),
});

const rfqSchema = Joi.object({
  title:          Joi.string().required(),
  category:       Joi.string().optional(),
  quantity:       Joi.string().optional(),
  targetPrice:    Joi.string().optional(),
  specifications: Joi.string().optional(),
});

const rfqQuoteSchema = Joi.object({
  pricePerUnit:  Joi.number().min(0).required(),
  totalPrice:    Joi.number().min(0).required(),
  deliveryDays:  Joi.number().integer().optional(),
  paymentTerms:  Joi.string().optional(),
  warranty:      Joi.string().optional(),
});

const placeOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().uuid().required(),
      quantity:  Joi.number().integer().min(1).required(),
      unitPrice: Joi.number().min(0).required(),
    })
  ).min(1).required(),
  shippingAddress: Joi.string().required(),
  paymentMethod:   Joi.string().valid('bank', 'lc', 'card').required(),
  subtotal:        Joi.number().min(0).required(),
  tax:             Joi.number().min(0).default(0),
  shippingCost:    Joi.number().min(0).default(0),
  grandTotal:      Joi.number().min(0).required(),
});

const kycVerifySchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required(),
  reason: Joi.string().optional(),
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const details = error.details.map(d => d.message);
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details },
      });
    }
    req.body = value;
    next();
  };
}

module.exports = {
  validate,
  loginSchema,
  signupBuyerSchema,
  signupSupplierSchema,
  createProductSchema,
  inquirySchema,
  rfqSchema,
  rfqQuoteSchema,
  placeOrderSchema,
  kycVerifySchema,
};
