const Joi = require('joi')

module.exports = Joi.object({
	crossfade: Joi.number()
		.default(1)
		.description(
			'amount of interpolation frames = distance between keyframes - crossfade' +
				'\nexample: crossfade = 2; keyframes: 1, 5, 10;' +
				'\nstop: 1, keyframe: 1, stop: 3' +
				'\nstop: 3, keyframe: 5, stop: 8' +
				'\nstop: 7, keyframe: 10, stop: 10'
		),
	mask: Joi.bool().default(false),
	keyframesWeight: Joi.number().default(1),
	videoWeight: Joi.number().default(4),
	maskWeight: Joi.number().default(1),
	mapping: Joi.number().default(10),
	deflicker: Joi.number().default(1),
	diversity: Joi.number().default(3500),
	detail: Joi.string().allow('low', 'medium', 'high', 'garbage').default('medium'),
	gpu: Joi.bool().default(true),
})
