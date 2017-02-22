/**
 * Created by akari on 16/02/2017.
 */
export default {
    CREATOR: {
        UP: ['up', 'w', 'j'],
        DOWN: ['down', 's', 'k'],
        SPACE: 'space',
        DELETE: {
            osx: 'command+backspace',
            windows: 'delete',
            linux: 'delete',
        },
        SAVE: {
            osx: 'command+s',
            windows: 'ctrl+s',
            linux: 'ctrl+s',
        }
    },
    MEDIA: {
        PLAYORPAUSE: {
            osx: 'command+return',
            windows: 'ctrl+enter',
            linux: 'ctrl+enter',
        },
        SEEKBACK: ['left', 'a'],
        SEEKNEXT: ['right', 'd'],
        SPEEDUP: {
            osx: 'command+up',
            windows: 'ctrl+up',
            linux: 'ctrl+up',
        },
        SPEEDDOWN: {
            osx: 'command+down',
            windows: 'ctrl+down',
            linux: 'ctrl+down',
        },
        SPEEDRESET: 'r'
    },
    ASIDE: {
        SHOWABOUT: 'shift+/'
    }
}