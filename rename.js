const fs = require('fs/promises')

async function rename(project, mult, move = -1, shift = 0) {
	const files = await fs.readdir(`./projects/${project}/generated/`)
	console.info(`renaming ${files.length} generated frames`)

	const newNames = []
	for (const file of files) {
		try {
			const index = file.match(/(\d+)\.png/)[1]
			if (!index) return console.error(`could not find index in ${file}`)

			// preserve first frame unmapped
			const id = index === '1' ? 1 : Math.floor((parseInt(index) + move) * mult) + shift

			const newName = `${id.toString().padStart(6, '0')}.png`
			await fs.copyFile(`./projects/${project}/generated/${file}`, `./projects/${project}/frames/${newName}`)
			newNames.push(newName)
		} catch (err) {
			console.error(`could not rename ${file}, error: `, err)
			return
		}
	}
	console.info(newNames.sort())
}

module.exports = { rename }
