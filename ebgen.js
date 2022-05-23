const fs = require('fs/promises')

const convert = (from, to) => str => Buffer.from(str, from).toString(to)
const utf8ToHex = convert('utf8', 'hex')

function chunkArray(arr, size) {
	var newArr = []
	for (var i = 0; i < arr.length; i += size) {
		newArr.push(arr.slice(i, i + size))
	}
	return newArr
}

function intToHex(int) {
	const buf = Buffer.alloc(4)
	buf.writeInt32LE(int)
	return buf.toString('hex')
}

async function ebgen(project, crossfade = 1) {
	const cnf = await fs.readFile(`./projects/${project}/base.ebs`, 'hex')
	const base = cnf.split('00c05a45')[0] + '00c05a45'

	const files = await fs.readdir(`./${project}/frames`)
	const keys = files.map(file => {
		const matches = file.match(/_(\d+)\.png/)
		const key = parseInt(matches[1])
		return key
	})
	const items = keys.map((key, i) => ({ start: keys[i - 1] + crossfade || 1, key, end: keys[i + 1] - crossfade || key }))
	const chunks = chunkArray(items, 20)

	for (const i in chunks) {
		const chunk = chunks[i]
		let out = base + intToHex(chunk.length)

		for (let { key, start, end } of chunk) {
			const outPath = `eb\\frame_${key}\\[#####].png`
			out += intToHex(key)
			out += '0101'
			out += intToHex(start)
			out += intToHex(end)
			out += intToHex(outPath.length)
			out += utf8ToHex(outPath)
		}

		await fs.writeFile(`./projects/${project}/out_${i}.ebs`, out, 'hex')
	}
}

module.exports = { ebgen }
