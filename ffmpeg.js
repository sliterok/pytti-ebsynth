const ffmpeg = require('fluent-ffmpeg')

function split(project, fileName = 'input.mp4') {
	return new Promise((resolve, reject) => {
		ffmpeg(`./projects/${project}/${fileName}`)
			.on('start', function (commandLine) {
				console.log('Spawned Ffmpeg with command: ' + commandLine)
			})
			.on('error', function (err) {
				console.log('An error occurred: ' + err.message)
				reject(err)
			})
			.on('end', function () {
				console.log('Processing finished !')
				resolve()
			})
			.save(`${project}/video/%05d.png`)
	})
}

function join(project, framerate) {
	return new Promise((resolve, reject) => {
		ffmpeg()
			.input(`./projects/${project}/out/%05d.png`)
			.inputFPS(framerate)
			.outputFPS(framerate)
			.on('start', function (commandLine) {
				console.log('Spawned Ffmpeg with command: ' + commandLine)
			})
			.on('error', function (err) {
				console.log('An error occurred: ' + err.message)
				reject(err)
			})
			.on('end', function () {
				console.log('Processing finished !')
				resolve()
			})
			.save(`./${project}/output.mp4`)
	})
}

module.exports = { join, split }
