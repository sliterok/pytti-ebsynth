const sharp = require('sharp')
const fs = require('fs/promises')

async function interpolate(project, formula = '0.5 / distance') {
	const distanceFn = eval(`distance => ${formula}`)
	await fs.mkdir(`./projects/${project}/out`, { recursive: true })

	const frameDirs = await fs.readdir(`./projects/${project}/eb`)
	let lastFrame = 0
	for (let frameDir of frameDirs) {
		const frames = await fs.readdir(`./projects/${project}/eb/${frameDir}`)
		for (const frame of frames) {
			lastFrame = Math.max(lastFrame, parseInt(frame.split('.')[0]))
		}
	}
	const frames = frameDirs.map(frameDir => parseInt(frameDir.split('_')[1]))
	console.log(frames, lastFrame)
	const range = [1, lastFrame]
	for (let i = range[0]; i < range[1]; i++) {
		const index = i.toString().padStart(6, '0')
		const out = `./projects/${project}/out/${index}.png`

		const nearestFrames = [-1, +1]
			.map(sign => {
				let distance = null
				let nearest = null
				for (const frame of frames) {
					if (sign > 0 ? frame < i : frame > i) continue
					const newDistance = Math.abs(frame - i)
					if (distance === null || newDistance < distance) {
						distance = newDistance
						nearest = frame
					}
				}
				return { nearest, distance }
			})
			.sort((a, b) => {
				const distDiff = a.distance - b.distance
				if (distDiff === 0) return b.nearest - a.nearest
				return distDiff
			})
			.map(({ nearest }) => nearest)

		if (nearestFrames.some(el => !el) || nearestFrames[0] === nearestFrames[1]) {
			await fs.copyFile(`./projects/${project}/eb/frame_${nearestFrames.find(el => el)}/${index}.png`, out)
			continue
		}

		const distance = Math.abs(nearestFrames[0] - i)

		const image1 = `./projects/${project}/eb/frame_${nearestFrames[0]}/${index}.png`
		const image2 = `./projects/${project}/eb/frame_${nearestFrames[1]}/${index}.png`

		const alpha = Math.min(1, distanceFn(distance))
		console.log(i, nearestFrames, distance, alpha)

		const { width, height } = await sharp(image1).metadata()

		const image2WithTransparency = await sharp(image2).removeAlpha().ensureAlpha(alpha).raw().toBuffer()

		await sharp(image1)
			.composite([{ input: image2WithTransparency, raw: { width, height, channels: 4 } }])
			.toFile(out)
	}
}

module.exports = { interpolate }
