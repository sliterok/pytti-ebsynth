const fs = require('fs/promises')
const ebgenSchema = require('./ebgen.schema')

async function readConfig(path) {
	try {
		const config = await fs.readFile(path, 'utf8')
		return JSON.parse(config)
	} catch (error) {
		console.error(`Error getting config from: ${path}`)
	}
}

async function getConfig(project) {
	const globalConfig = await readConfig('./ebgen.config.json')
	const projectConfig = await readConfig(`./${project}/ebgen.config.json`)

	return await ebgenSchema.validateAsync(Object.assign({}, globalConfig, projectConfig))
}

const convert = (from, to) => str => Buffer.from(str, from).toString(to)
const utf8ToHex = convert('utf8', 'hex')

function chunkArray(arr, size) {
	const newArr = []
	for (let i = 0; i < arr.length; i += size) {
		newArr.push(arr.slice(i, i + size))
	}
	return newArr
}

function intToHex(int) {
	const buf = Buffer.alloc(4)
	buf.writeInt32LE(int)
	return buf.toString('hex')
}

function lengthAndText(text) {
	return intToHex(text.length) + utf8ToHex(text)
}

// number to hex single precision IEEE-754
function decimalToHex(number) {
	// Buffer is like a raw view into memory
	const buffer = new ArrayBuffer(4)
	// Float32Array: interpret bytes in the memory as f32 (IEEE-754) bits
	const float32Arr = new Float32Array(buffer)
	// UInt32Array: interpret bytes in the memory as unsigned integer bits.
	// Important that we use unsigned here, otherwise the MSB would be interpreted as sign
	const uint32Array = new Uint32Array(buffer)
	// will convert double to float during assignment
	float32Arr[0] = number
	// now read the same memory as unsigned integer value
	const integerValue = uint32Array[0]
	// to hex string
	const integerBitsHex = integerValue.toString(16)
	// + hex prefix
	// reverse bytes to get LE
	return chunkArray(integerBitsHex.split(''), 2).reverse().flat().join('')
}

const detailEnum = {
	high: '01',
	medium: '02',
	low: '03',
	garbage: '04',
}

async function ebgen(project) {
	const config = await getConfig(project)
	console.log({ config })

	let header = '454253303500' // some sort of version info? idk, results to: "EBS05"
	header += lengthAndText('video\\[######].png')
	header += lengthAndText('mask\\[######].png')
	header += lengthAndText('frames\\[######].png')
	header += config.mask ? '01' : '00'
	;[config.keyframesWeight, config.videoWeight, config.maskWeight, config.mapping, config.deflicker, config.diversity].forEach(
		weight => (header += decimalToHex(weight))
	)

	let footer = `56303200` // also some sort of version info, results to: "V02"
	footer += detailEnum[config.detail]
	footer += '0'.repeat(6)
	footer += config.gpu ? '01' : '00'
	footer += '0'.repeat(4)
	footer += 'F041C0020000' // no idea what this is, results to some garbage

	const files = await fs.readdir(`./projects/${project}/frames`)
	const keys = files.map(file => parseInt(file.match(/(\d+)\.png/)[1]))
	const items = keys.map((key, i) => ({ start: keys[i - 1] + config.crossfade || 1, key, end: keys[i + 1] - config.crossfade || key }))
	const chunks = chunkArray(items, 20)

	for (const i in chunks) {
		const chunk = chunks[i]
		let out = header + intToHex(chunk.length)

		for (let { key, start, end } of chunk) {
			const outPath = `eb\\frame_${key}\\[######].png`
			out += intToHex(key)
			out += '0101'
			out += intToHex(start)
			out += intToHex(end)
			out += intToHex(outPath.length)
			out += utf8ToHex(outPath)
		}

		out += footer

		await fs.writeFile(`./projects/${project}/out_${i}.ebs`, out, 'hex')
	}
}

module.exports = { ebgen }
