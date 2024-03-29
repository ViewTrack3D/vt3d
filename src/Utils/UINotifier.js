import {
    faCircleCheck,
    faCircleInfo,
    faHexagonExclamation,
    faTriangleExclamation,
}               from '@fortawesome/pro-regular-svg-icons'
import {SECOND} from './AppUtils'
import {FA2SL}  from './FA2SL'

export const VT3D_INFORMATION_TOAST = 'information'
export const VT3D_SUCCESS_TOAST = 'success'
export const VT3D_WARNING_TOAST = 'warning'
export const VT3D_ERROR_TOAST = 'danger'

export class UINotifier {

    static DURATION = 3 * SECOND

    static VT3D_TOAST_ICONS = {
        [VT3D_INFORMATION_TOAST]: faCircleInfo,
        [VT3D_SUCCESS_TOAST]: faCircleCheck,
        [VT3D_WARNING_TOAST]: faTriangleExclamation,
        [VT3D_ERROR_TOAST]: faHexagonExclamation,
    }

    static #notify = (message, type = VT3D_INFORMATION_TOAST, duration = UINotifier.DURATION) => {
        if (typeof message === 'string') {
            message = {caption: message}
        }
        const alert = Object.assign(document.createElement('sl-alert'), {
            variant: type,
            closable: true,
            duration: duration,
            innerHTML: `
              <sl-icon slot='icon' library="fa" name="${FA2SL.set(UINotifier.VT3D_TOAST_ICONS[type])}"></sl-icon>

        ${(UINotifier.#setNotificationContent(message))}
      
      `,
        })

        document.body.append(alert)
        return alert.toast()
    }

    static notify = (message, duration = UINotifier.DURATION) => {
        UINotifier.#notify(message, VT3D_INFORMATION_TOAST, duration)
    }
    static notifySuccess = (message, duration = UINotifier.DURATION) => {
        UINotifier.#notify(message, VT3D_SUCCESS_TOAST, duration)
    }
    static notifyWarning = (message, duration = UINotifier.DURATION) => {
        UINotifier.#notify(message, VT3D_WARNING_TOAST, duration)
    }
    static notifyError = (message, duration = UINotifier.DURATION) => {
        UINotifier.#notify(message, VT3D_ERROR_TOAST, duration)
    }

    static #setNotificationContent = (message = {}) => {
        let content = message.caption ? `<div class="toast-caption">${message.caption}</div>` : ''
        content += message.text ? `<div class="toast-text">${message.text}</div>` : ''
        return content
    }
}