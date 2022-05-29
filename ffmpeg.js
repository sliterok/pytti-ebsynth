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
			.save(`./projects/${project}/video/%06d.png`)
	})
}

function join(project, framerate) {
	return new Promise((resolve, reject) => {
		ffmpeg()
			.input(`./projects/${project}/out/%06d.png`)
			.inputFPS(framerate)
			.outputFPS(framerate)
			.videoCodec('copy')
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
			.save(`./projects/${project}/output.mp4`)
	})
}

module.exports = { join, split }
