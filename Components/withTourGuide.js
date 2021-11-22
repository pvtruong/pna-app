import React from 'react';
import {useTourGuideController} from 'rn-tourguide';
const withTourGuide =WrappedComponent=>props=>{
  const { start, stop, eventEmitter } = useTourGuideController();
  return <WrappedComponent {...props} start={start} stop ={stop} eventEmitter={eventEmitter}/>
}
export default withTourGuide;
