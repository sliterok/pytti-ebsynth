# Description

This is a set of tools to make smooth videos with pytti without wasting your time to render frames that you don't really need

# Requirements

-   [ebsynth](https://ebsynth.com/) (only windows/mac)
-   [pytti-tools](https://pytti-tools.github.io/pytti-book/)
-   [ffmpeg](https://ffmpeg.org/)

# Flow

-   init project (`init`)
-   generate frames with pytti and save to `projects/{project}/frames/*.png`
-   split original video to frames (`split`)
-   rename generated frames to match original sequence (`rename`)
-   open `base.ebs` file with ebsynth, edit settings to match your project (ignore keyframes), "save as" to `projects/{project}/base.ebs`
-   generate ebsynth project files (`ebgen`)
-   run each ebsynth project file to generate interpolation frames (`eb.ahk`)
-   make transitions between interpolated frames with sharp (`interpolate`)
-   join interpolated and transitioned frames into video (`join`)
-   reencode resulting video with codec you like

# Details

## Init

-   `npm i` will install requirements
-   `node .` will show you help

## Commands

-   `init [project]` Initialize a new project
-   `split [project] [filename]` Split video into individual frames
-   `rename [project] [scale] --move n --shift n` Renames generated frames to match source indexing
-   `ebgen [project] [crossfade]` Generates ebsynth files
-   `interpolate [project] [formula]` Interpolates between frames with opacity calculated by distance passed to formula
-   `join [project] [framerate]` Joins interpolated frames to video

## AHK scripts

-   ### eb.ahk
    Will automate ebsynth clicking for you. Just edit `idx` and `max` values in the `.ahk` file to match your `.ebs` files indexes (don't include last file as window height probably won't match)
