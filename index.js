const fs = require('fs/promises')

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const { rename } = require('./rename')
const { ebgen } = require('./ebgen')
const { interpolate } = require('./interpolate')
const { split, join } = require('./ffmpeg')

yargs(hideBin(process.argv))
	.command(
		'init [project]',
		'Initialize a new project',
		yargs =>
			yargs.positional('project', {
				describe: 'project folder name',
				demandOption: 'project folder name is required',
				type: 'string',
			}),
		async args => {
			const { project } = args
			console.info({ project })
			const folders = ['frames', 'out', 'video']
			for (const folder of folders) {
				await fs.mkdir(`./projects/${project}/${folder}`, { recursive: true })
			}
			await fs.copyFile('./base.ebs', `./projects/${project}/base.ebs`)
		}
	)
	.command(
		'split [project] [filename]',
		'Split video into individual frames',
		yargs =>
			yargs
				.positional('project', {
					describe: 'project folder name',
					demandOption: 'project folder name is required',
					type: 'string',
				})
				.positional('filename', {
					describe: 'video file name',
					default: 'input.mp4',
					type: 'string',
				}),
		args => {
			const { project, filename } = args
			console.info({ project, filename })
			split(project, filename)
		}
	)
	.command(
		'rename [project] [scale] options',
		'renames generated frames to match source indexes',
		yargs =>
			yargs
				.positional('project', {
					describe: 'project folder name',
					demandOption: 'project folder name is required',
					type: 'string',
				})
				.positional('scale', {
					describe: 'scale\n' + 'to calculate scale, use the following formula: (source frames count) / (target frames count)',
					default: 2,
					type: 'number',
				})
				.option('move', {
					describe: 'move frame by n (before scaling)\n' + 'if your frames start from 1 then [move] probably should be -1',
					default: -1,
					type: 'number',
				})
				.option('shift', {
					describe: 'shift frame by n (after scaling)',
					default: 0,
					type: 'number',
				}),
		args => {
			const { project, scale, move, shift } = args
			console.info({ project, scale, move, shift })
			rename(project, scale, move, shift)
		}
	)
	.command(
		'ebgen [project] [crossfade]',
		'generates ebsynth files',
		yargs =>
			yargs
				.positional('project', {
					describe: 'project folder name',
					demandOption: 'project folder name is required',
					type: 'string',
				})
				.positional('crossfade', {
					describe: '0 = all frames between two keys, n = (count of frames between keys - n)',
				}),
		args => {
			const { project, crossfade } = args
			console.info({ project, crossfade })
			ebgen(project, crossfade)
		}
	)
	.command(
		'interpolate [project] [formula]',
		'interpolates between frames with opacity calculated by distance passed to formula',
		yargs =>
			yargs
				.positional('project', {
					describe: 'project folder name',
					demandOption: 'project folder name is required',
					type: 'string',
				})
				.positional('formula', {
					describe: 'formula to calculate opacity from distance',
					default: '0.5 / distance',
				}),
		args => {
			const { project, formula } = args
			console.info({ project, formula })
			interpolate(project, formula)
		}
	)
	.command(
		'join [project] [framerate]',
		'joins frames into video',
		yargs =>
			yargs
				.positional('project', {
					describe: 'project folder name',
					demandOption: 'project folder name is required',
					type: 'string',
				})
				.positional('framerate', {
					describe: 'framerate of output video',
					default: 60,
					type: 'number',
				}),
		args => {
			const { project, framerate } = args
			console.info({ project, framerate })
			join(project, framerate)
		}
	)
	.demandCommand()
	.parse()
