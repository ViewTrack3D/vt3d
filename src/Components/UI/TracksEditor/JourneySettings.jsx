import { faLocationPin, faLocationPinSlash, faTrashCan } from '@fortawesome/pro-regular-svg-icons'

import { SlIcon, SlInput, SlProgressBar, SlTooltip } from '@shoelace-style/shoelace/dist/react'
import { sprintf }                                   from 'sprintf-js'
import { useSnapshot }                               from 'valtio'
import { NO_DEM_SERVER }                             from '../../../classes/Journey'

import { POI }                from '../../../classes/POI'
import { TrackUtils }         from '../../../Utils/cesium/TrackUtils'
//import { JourneyUtils }        from '../../../Utils/cesium/JourneyUtils'
import { FA2SL }              from '../../../Utils/FA2SL'
import { TracksEditorUtils }  from '../../../Utils/TracksEditorUtils'
//import { TracksEditorUtils } from '../../../Utils/TracksEditorUtils'
import { UINotifier }         from '../../../Utils/UINotifier'
import { useConfirm }         from '../Modals/ConfirmUI'
import { Visibility }         from '../Visibility'
import { DEMServerSelection } from '../VT3D_UI/DEMServerSelection'

export const JourneySettings = function JourneySettings() {

    const UPDATE_JOURNEY_THEN_DRAW = 1
    const UPDATE_JOURNEY_SILENTLY = 2
    const REMOVE_JOURNEY = 3

    const editorStore = vt3d.theJourneyEditorProxy
    const editorSnapshot = useSnapshot(editorStore)

    /**
     * Remove journey confirmation
     */
    const [ConfirmRemoveJourneyDialog, confirmRemoveJourney] = useConfirm(`Remove "${editorSnapshot.journey.title}" ?`, 'Are you sure you want to remove this journey ?')

    /**
     * Change journey Color
     *
     * @type {setColor}
     */
    const setColor = (async event => {
        editorStore.journey.color = event.target.value
        TracksEditorUtils.renderJourneysList()
        await rebuildJourney(UPDATE_JOURNEY_THEN_DRAW)
    })

    /**
     * Change Journey Title
     *
     * The selection box is then synchronised
     *
     * @type {setTitle}
     */
    const setTitle = (async event => {
        const title = event.target.value
        // Title is empty, we force the former value
        if (title === '') {
            const field = document.getElementById('journey-title')
            field.value = editorStore.journey.title
            return
        }
        // Let's check if the next title has not been already used for
        // another journey.
        editorStore.journey.title = editorStore.journey.singleTitle(title)
        await rebuildJourney(UPDATE_JOURNEY_SILENTLY)

        TracksEditorUtils.renderJourneysList()
    })

    /**
     * Change journey thickness
     *
     * @type {setThickness}
     */
    const setThickness = (async event => {
        editorStore.journey.thickness = event.target.value
        TracksEditorUtils.renderjourney.settings()
        await rebuildJourney(UPDATE_JOURNEY_THEN_DRAW)
    })

    /**
     * Change journey visibility
     *
     * @type {setThickness}
     */
    const setJourneyVisibility = (async visibility => {
        //save state
        editorStore.journey.visible = visibility

        TrackUtils.updateTracksVisibility(vt3d.theJourney, visibility)

        await rebuildJourney(UPDATE_JOURNEY_SILENTLY)

        TracksEditorUtils.renderjourney.settings()
        TracksEditorUtils.renderJourneysList()

    })
    /**
     * Change journey visibility
     *
     * @type {setThickness}
     */
    const setAllPOIsVisibility = (async visibility => {
        //save state
        editorStore.allPOIs = visibility

        TrackUtils.updatePOIsVisibility(vt3d.theJourney, visibility)
        await rebuildJourney(UPDATE_JOURNEY_SILENTLY)

        TracksEditorUtils.renderjourney.settings()
        TracksEditorUtils.renderJourneysList()

    })

    /**
     * Select the right poi whatever pois ie Array or Map
     *
     */
    const poi = {
        snap: (type) => {
            if (!(editorSnapshot.journey.pois instanceof Map)) {
                for (const poi of editorSnapshot.journey.pois) {
                    if (poi.slug === type) {
                        return POI.clone(poi)
                    }
                }
            }
            return editorSnapshot.journey.pois.get(type)
        }, store: (type) => {
            if (editorStore.journey.pois instanceof Map) {
                return editorStore.journey.pois.get(type)
            }
            const poi = editorStore.journey.pois.filter(m => m.slug === type)
            if (poi.length > 0) {
                return poi[0]
            }
            return null
        },
    }

    /**
     * Change DEM server
     *
     * @type {setDEMServer}
     */
    const setDEMServer = (async event => {
        editorStore.journey.DEMServer = event.target.value
        editorStore.longTask = editorStore.journey.DEMServer !== NO_DEM_SERVER
        TracksEditorUtils.renderjourney.settings()
        // await vt3d.theJourney.computeAll()
        // // Then we redraw the theJourney
        // await vt3d.theJourney.showAfterHeightSimulation()

        await rebuildJourney(UPDATE_JOURNEY_THEN_DRAW)
    })

    /**
     * Remove journey
     */
    const removeJourney = async () => {

        const confirmation = await confirmRemoveJourney()

        if (confirmation) {
            const mainStore = vt3d.mainProxy.components.journeyEditor
            const journey = editorStore.journey.slug
            const removed = vt3d.getJourneyBySlug(journey)
            // get Journey index
            const index = mainStore.list.findIndex((list) => list === journey)

            /**
             * Do some cleaning
             */
            if (index >= 0) {
                // In store
                mainStore.list.splice(index, 1)
                // In context
                vt3d.journeys.delete(editorStore.journey.slug)

                const dataSources = JourneyUtils.getDataSourcesByName(editorStore.journey.slug)
                dataSources.forEach(dataSource => {
                    vt3d.viewer.dataSources.remove(dataSource)
                })
            }

            // Remove journey in DB
            await editorStore.journey.removeFromDB()

            /**
             * If we have some other journeys, we'll take the first and render the editor.
             * Otherwise we close the editing.
             */
            let text = ''
            if (mainStore.list.length >= 1) {
                // New current is the first.
                vt3d.theJourney = vt3d.getJourneyBySlug(mainStore.list[0])
                JourneyUtils.focus(Array.from(vt3d.theJourney.journeys.values())[0])
                TracksEditorUtils.renderJourneysList()
                TracksEditorUtils.renderjourney.settings()
            } else {
                vt3d.theJourney = null
                vt3d.cleanEditor()
                text = 'There are no others available.'
                mainStore.usable = false
                mainStore.show = false

            }

            // Let's inform the user

            UINotifier.notifySuccess({
                caption: `<strong>${removed.title}</strong> removed !`, text: text,
            })

        }
    }

    const textVisibilityJourney = sprintf('%s Tracks', editorSnapshot.journey.visible ? 'Hide' : 'Show')
    const textVisibilityPOIs = sprintf('%s POIs', editorSnapshot.allPOIs ? 'Hide' : 'Show')


    /**
     * Re build the journey object,
     * Re compute metrix //TODO voir one peut paseprendre le anciens(tant que DEM n'a pa change)
     *
     * @return {Journey}
     */
    const rebuildJourney = async (action) => {

        // unproxify
        const unproxyfied = JSON.parse(JSON.stringify(editorStore.journey))

        // We clone but keep the same slug and pois
        const journey = Journey.clone(unproxyfied, {
            slug: editorStore.journey.slug,
            pois: editorStore.journey.pois,
        })
        await journey.computeAll()
        vt3d.saveJourney(journey)
        // saveToDB toDB
        await journey.saveToDB()

        //  vt3d.viewer.dataSources.removeAll()
        if (action !== UPDATE_JOURNEY_SILENTLY) {
            await journey.loadAfterNewSettings(action)
        } else {
            JourneyUtils.focus(journey)
        }
        return journey
    }


    return (<>
        {editorSnapshot.journey &&
            <div id="journey-settings" key={vt3d.mainProxy.components.journeyEditor.keys.journey.journey}>
                <div id={'journey-visibility-global'}>
                    {/* Change visible name (title) */}
                    <SlInput id="journey-title" value={editorSnapshot.journey.title}
                             onSlChange={setTitle}
                    />
                    <div id="journey-visibility">
                        <SlTooltip content={textVisibilityPOIs}>
                            <Visibility change={setAllPOIsVisibility} initial={editorStore.allPOIs} icons={{
                                shown: faLocationPin,
                                hidden: faLocationPinSlash,
                            }}/>
                        </SlTooltip>
                        <SlTooltip content={textVisibilityJourney}>
                            <Visibility change={setJourneyVisibility} initial={editorStore.journey.visible}/>
                        </SlTooltip>
                        <SlTooltip content={'Remove'}>
                            <a onClick={removeJourney}>
                                <SlIcon library="fa" name={FA2SL.set(faTrashCan)}/>
                            </a>
                        </SlTooltip>
                    </div>
                </div>

                {/* Add DEM server selection if we do not have height initially (ie in the journey file) */}
                <div>
                    <DEMServerSelection
                        default={editorSnapshot.journey?.DEMServer ?? NO_DEM_SERVER}
                        label={'Elevation:'}
                        onChange={setDEMServer}
                    />
                    {editorSnapshot.longTask && <SlProgressBar indeterminate/>}
                </div>
                {/* Journey line settings */}


                <ConfirmRemoveJourneyDialog/>
            </div>
        }
    </>)
}