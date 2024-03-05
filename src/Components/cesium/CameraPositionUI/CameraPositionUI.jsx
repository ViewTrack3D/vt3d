import './style.css'

import { faAngle, faCompass, faMountains, faVideo } from '@fortawesome/pro-regular-svg-icons'
import { FontAwesomeIcon }                          from '@fortawesome/react-fontawesome'
import { SlAnimation, SlButton, SlTooltip }         from '@shoelace-style/shoelace/dist/react'
import { forwardRef, useEffect }                    from 'react'
import { useCesium }                                from 'resium'
import { useSnapshot }                              from 'valtio'
import { CameraUtils }                              from '../../../Utils/cesium/CameraUtils.js'
import { FA2SL }                                    from '../../../Utils/FA2SL'
import { TextValueUI }                              from '../../UI/TextValueUI/TextValueUI.jsx'


export const CameraPositionUI = forwardRef(function CameraPositionUI(props, ref) {
    vt3d.viewer = useCesium().viewer

    const mainStore = vt3d.mainProxy.components
    const mainSnap = useSnapshot(mainStore)

    const toggle = () => {
        mainStore.cameraPosition.show = !mainStore.cameraPosition.show
        // Update camera info
        if (mainStore.cameraPosition.show) {
            CameraUtils.updatePosition(vt3d?.camera)
        }
    }


    useEffect(() => {
        CameraUtils.updatePosition(vt3d?.camera)
    }, [])

    return (
        <div id="camera-position" className={'ui-element transparent'} ref={ref}>
            <SlTooltip content="Show real time camera information">
                <SlButton size="small" onClick={toggle}><FontAwesomeIcon icon={faVideo} slot={'prefix'}/></SlButton>
            </SlTooltip>
            {mainSnap.cameraPosition.show &&
                <SlAnimation easing="bounceInLeft" duration={1000} iterations={1} play={mainSnap.cameraPosition.show}
                             onSlFinish={() => toggle()}>
                    <div className={'ui-element'} ref={ref} open={mainSnap.cameraPosition.show}>
                        {/*<FontAwesomeIcon icon={faCompass}/>*/}
                        <sl-icon library="fa" name={FA2SL.set(faCompass)}></sl-icon>
                        <TextValueUI ref={ref} id={'camera-longitude'} text={'Lon:'}/>
                        <TextValueUI ref={ref} id={'camera-latitude'} text={'Lat:'}/>
                        <sl-icon library="fa" name={FA2SL.set(faAngle)}></sl-icon>
                        <TextValueUI ref={ref} id={'camera-heading'} text={'Heading:'} unit={'°'}/>
                        <TextValueUI ref={ref} id={'camera-pitch'} text={'Pitch:'} unit={'°'}/>
                        <sl-icon library="fa" name={FA2SL.set(faMountains)}></sl-icon>
                        <TextValueUI ref={ref} id={'camera-altitude'} unit={'m'}/>
                    </div>
                </SlAnimation>
            }
        </div>
    )

})

