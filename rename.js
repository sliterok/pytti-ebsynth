const fs = require('fs/promises')

async function rename(project, mult, move = -1, shift = 0) {
	const files = await fs.readdir(`./${project}/frames`)
	console.log(files)
	const newNames = []
	for (let file of files) {
		const matches = file.match(/_(\d+)\.png/)
		if (!matches[1]) return console.error('failed')
		const id = matches[1] === '1' ? 1 : Math.floor((parseInt(matches[1]) + move) * mult) + shift
		let newName = `frame_${id.toString().padStart(5, '0')}.png`
		console.log(newName)
		if (file.split('_')[0] === newName.split('_')[0]) {
			const ed = newName.split('_')
			if (ed[0].includes('-mk I')) ed[0] += 'I'
			else ed[0] += '-mk I'

			newName = ed.join('_')
		}
		await fs.rename(`./projects/${project}/frames/${file}`, `./${project}/frames/${newName}`)
		newNames.push(newName)
	}
	console.log(newNames.sort())
}

module.exports = { rename }
