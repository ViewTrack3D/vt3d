import * as Cesium      from 'cesium'
import { EventEmitter } from '../libs/EventEmitter/EventEmitter'
import { FA2SL }        from './FA2SL'

export const CONFIGURATION = '../config.json'

export class AppUtils {
    /**
     * Slugification
     *
     * from https://gist.github.com/hagemann/382adfc57adbd5af078dc93feef01fe1
     * @param string
     */
    static  slugify = (string => {
        const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìıİłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
        const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
        const p = new RegExp(a.split('').join('|'), 'g')

        return string.toString().toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
            .replace(/&/g, '-and-') // Replace & with 'and'
            .replace(/[^\w\-]+/g, '') // Remove all non-word characters
            .replace(/\-\-+/g, '-') // Replace multiple - with single -
            .replace(/^-+/, '') // Trim - from start of text
            .replace(/-+$/, '') // Trim - from end of text
    })

    static Map2Object = map => Object.fromEntries(map.entries())

    static setTheme = (theme = null) => {
        if (!theme) {
            theme = vt3d.configuration.theme
        }
        document.documentElement.classList.add(`sl-theme-${theme}`)
    }

    /**
     * Capitalize  string
     *
     * @param string {string}
     * @return {string}
     */
    static  capitalize = (string) => {
        return string[0].toUpperCase() + string.slice(1)
    }

    /**
     * CamelCase a string ( aaa-bbb => aaaBbb)
     *
     * @param string {string}
     * @return {string}
     */
    static camelCase = (string) => {
        return string
            .split('-')
            .map((s, index) => {
                return ((index === 0 ? s[0].toLowerCase() : s[0].toUpperCase()) + s.slice(1).toLowerCase())
            })
            .join('')
    }

    /**
     * Application initialisation
     *
     * @return {Promise<void>}
     */
    static init = async () => {
        // Set Context
        vt3d.configuration = await import(/* @vite-ignore */ CONFIGURATION)
        vt3d.events = new EventEmitter()

        // Cesium ION auth
        Cesium.Ion.defaultAccessToken = vt3d.configuration.ionToken

        // Register Font Awesome icons in ShoeLace
        FA2SL.useFontAwesomeInShoelace('fa')

        // Shoelace needs to avoid bubbling events. Here's an helper
        window.isOK = (event) => {
            return event.eventPhase === Event.AT_TARGET
        }

    }

}

/** Time ans duration constants in seconds */
const MILLIS = 1000
const SECOND = MILLIS
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const MONTH = 30 * DAY
const YEAR = 365 * DAY
export { MILLIS, SECOND, MINUTE, HOUR, DAY, WEEK, MONTH, YEAR }

/** Distance constants */
const METER = 1
const FOOT = METER * 0.3048        // foot
const KM = 1000 * METER            // meters

const MILE = KM / 0.62137119223    // miles = MILE * kms
export { KM, MILE, FOOT }

/** other */
export const WRONG = -99999999999