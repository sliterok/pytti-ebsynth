idx = 0
max = 1

Check(color)
{
    return color = 0x9DCB02 || color = 0x7B9D00
}

CheckButton() {
    PixelGetColor, color, 144, 62
    return color = 0xB4B4B4
}

NextFile:
    WinActivate, EbSynth Beta ahk_class Lazy Window Class
    Sleep, 16
    Click, 147, 59, 0
    Sleep, 187
    Click, 147, 59 Left, Down
    Sleep, 110
    Click, 147, 59 Left, Up
    Sleep, 62
    Click, 139, 28, 0
    Sleep, 109
    Click, 317, 28, 0
    Sleep, 532
    WinActivate, Open ahk_class #32770
    Sleep, 47
    Send, out_
    Send, %idx%
    Send, .ebs
    Sleep, 390
    Send, {NumpadEnter}
    Sleep, 110
    WinActivate, EbSynth Beta ahk_class Lazy Window Class
    Click, 640, 891 Left, Down
    Sleep, 125
    Click, 640, 891 Left, Up
    Sleep, 5000
    WinActivate, EbSynth Beta ahk_class Lazy Window Class
    done := CheckButton()
    While, not done
    {
        Sleep, 2500
        WinActivate, EbSynth Beta ahk_class Lazy Window Class
        done := CheckButton()
    }

    idx++

    if(%idx% < %max%) {
        Gosub, NextFile
    } else {
        ExitApp
    }
return

Gosub, NextFile

Esc::ExitApp
