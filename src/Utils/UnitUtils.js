import { Duration }                  from 'luxon'
import { DAY, HOUR, MILLIS, MINUTE } from './AppUtils'

//check configuration.unitSystems for the values
export const INTERNATIONAL = 1
export const IMPERIAL = 2

export class UnitUtils {
    /**
     * Converter from internation system unit (ie m,s) to other.
     *
     * How to use :   convert(myValue).to(KM) to convert myValue from meter to kilometers
     *
     * @param input  always in metric based unit
     *
     * @return {{source, to: data.to}}
     */
    static convert = (input) => {
        return {
            source: input,
            to: (unit) => {
                switch (unit) {
                    case km:
                        return input * KM
                    case mile:
                        return input * MILE
                    case kmh:
                        return input * KMH
                    case mkm:
                        return input / KM / MINUTE * MILLIS
                    case mph:
                        return input * MPH
                    case mpmile:
                        return input / MPH * MILE * HOUR
                    case foot:
                        return input * FOOT
                    case yard:
                        return input * YARD
                    case inche:
                        return input * INCHES
                    case hour:
                        return Duration.fromMillis(input * MILLIS).toFormat('hh:mm:ss')
                    case min:
                        return Duration.fromMillis(input * MILLIS).toFormat('mm:ss')
                    default:
                        // metre, seconde
                        return input
                }
            },
            /**
             * Convert input to day hour minute
             * @return {*|number}
             */
            toTime: () => {
                if (input === 0) {
                    return 0
                }
                const days = input >= DAY / 1000 ? `dd \'d\'` : ''
                const hours = input >= HOUR / 1000 ? 'hh\'h\'' : ''
                const minutes = 'mm\'m\''
                return (input ? Duration.fromObject({seconds: input}) : undefined)?.toFormat(`${days} ${hours}${minutes}`)
            },
        }
    }
}

/** Units */

export const km = 'km'
export const mile = 'mi'
export const kmh = 'km/h'
export const hkm = 'h/km'
export const mkm = 'min/km'
export const mpmile = 'min/mile'
export const ms = 'm/s'
export const mph = 'mph'
export const foot = 'ft'
export const yard = 'yd'
export const inche = 'in'
export const hour = 'hr'
export const min = 'mn'
export const sec = 's'
export const meter = 'm'
export const units = [km, mile, kmh, hkm, mkm, mpmile, ms, mph, meter, foot, yard, inche, hour, min, sec]

/** Distance constants to convert from meter */
export const METER = 1
export const FOOT = 3.280839895             // foot
export const KM = 0.001                     // meters
export const KMH = 3.6            // m/s to Km/h
export const MPH = 2.236936                 // m/s to MPH
export const MILE = 0.00062137119223        // miles = MILE * kms
export const YARD = 1.09361                 // meters to yards
export const INCHES = 39.3701              // meters t inches