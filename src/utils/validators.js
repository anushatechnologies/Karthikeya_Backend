const Joi = require('joi');

const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password:   Joi.string().min(6).required(),
  role:       Joi.string().valid('buyer', 'seller', 'admin', 'super_admin', 'platform_admin', 'support_admin', 'finance_admin', 'moderator', 'operations_admin', 'marketing_admin', 'readonly_admin').required(),
});

const signupBuyerSchema = Joi.object({
  fullName:        Joi.string().min(2).required(),
  phone:           Joi.string().pattern(/^\d{10}$/).required(),
  email:           Joi.string().email().optional().allow('', null),
  password:        Joi.string().min(4).optional().allow('', null),
  businessDetails: Joi.string().optional().allow('', null),
}).unknown(true);

const signupSupplierSchema = Joi.object({
  ownerName:    Joi.string().min(2).required(),
  companyName:  Joi.string().required(),
  phone:        Joi.string().pattern(/^\d{10}$/).required(),
  email:        Joi.string().email().optional().allow('', null),
  password:     Joi.string().min(4).optional().allow('', null),
  gstNumber:    Joi.string().length(15).required(),
  panNumber:    Joi.string().length(10).optional().allow('', null),
  panDocUrl:    Joi.string().optional().allow('', null),
  businessType: Joi.string().required(),
  address:      Joi.string().required(),
  kycDocUrl:    Joi.string().optional().allow('', null),
}).unknown(true);

const createProductSchema = Joi.object({
  name:             Joi.string().required(),
  description:      Joi.string().optional().allow('', null),
  images:           Joi.array().items(Joi.string()).default([]),
  categoryId:       Joi.string().required(),
  price:            Joi.number().min(0).required(),
  priceType:        Joi.string().valid('fixed', 'negotiable', 'rfq').default('fixed'),
  minOrderQty:      Joi.number().integer().min(1).default(1),
  unit:             Joi.string().default('Piece'),
  specifications:   Joi.object().default({}),
  tags:             Joi.array().items(Joi.string()).default([]),
  location:         Joi.string().optional().allow('', null),
  bulkPricingTiers: Joi.array().items(
    Joi.object({
      minQty: Joi.number().required(),
      maxQty: Joi.number().optional(),
      price:  Joi.number().required(),
    })
  ).default([]),
});

const inquirySchema = Joi.object({
  productId: Joi.string().required(),
  quantity:  Joi.number().integer().min(1).required(),
  message:   Joi.string().optional().allow('', null),
});

const rfqSchema = Joi.object({
  title:          Joi.string().required(),
  category:       Joi.string().optional().allow('', null),
  quantity:       Joi.string().optional().allow('', null),
  targetPrice:    Joi.string().optional().allow('', null),
  specifications: Joi.string().optional().allow('', null),
});

const rfqQuoteSchema = Joi.object({
  pricePerUnit:  Joi.number().min(0).optional(),
  unitPrice:     Joi.number().min(0).optional(),
  totalPrice:    Joi.number().min(0).optional(),
  freight:       Joi.number().min(0).optional(),
  deliveryDays:  Joi.number().integer().optional(),
  timeline:      Joi.string().optional(),
  paymentTerms:  Joi.string().optional(),
  warranty:      Joi.string().optional(),
});

const placeOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity:  Joi.number().integer().min(1).required(),
      unitPrice: Joi.number().min(0).optional(),
    })
  ).min(1).required(),
  shippingAddress: Joi.string().required(),
  paymentMethod:   Joi.string().valid('bank', 'lc', 'card', 'COD', 'Online', 'Credit').required(),
  subtotal:        Joi.number().min(0).required(),
  tax:             Joi.number().min(0).default(0),
  shippingCost:    Joi.number().min(0).default(0),
  grandTotal:      Joi.number().min(0).required(),
});

const kycVerifySchema = Joi.object({
  action: Joi.string().valid('approve', 'reject').required(),
  reason: Joi.string().optional(),
});

const sendOtpSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[0-9]{10,13}$/).required(),
  role:  Joi.string().valid('buyer', 'seller', 'admin').optional().default('buyer'),
});

const verifyOtpSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[0-9]{10,13}$/).required(),
  otp:   Joi.string().length(6).required(),
  role:  Joi.string().valid('buyer', 'seller', 'admin').optional().default('buyer'),
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
  sendOtpSchema,
  verifyOtpSchema,
  signupBuyerSchema,
  signupSupplierSchema,
  createProductSchema,
  inquirySchema,
  rfqSchema,
  rfqQuoteSchema,
  placeOrderSchema,
  kycVerifySchema,
};

